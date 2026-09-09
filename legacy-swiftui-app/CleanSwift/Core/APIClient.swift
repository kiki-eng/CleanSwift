import Foundation

// MARK: - Errors

struct APIError: LocalizedError {
    let statusCode: Int
    let message: String

    var errorDescription: String? { message }

    static func network(_ underlying: Error) -> APIError {
        APIError(statusCode: -1, message: underlying.localizedDescription)
    }
}

// MARK: - Envelope

/// Every backend response is wrapped in { success, data, meta, message }.
struct Envelope<T: Decodable>: Decodable {
    let success: Bool?
    let data: T?
    let meta: PageMeta?
    let message: String?
}

struct PageMeta: Decodable {
    let totalItems: Int?
    let itemCount: Int?
    let itemsPerPage: Int?
    let totalPages: Int?
    let currentPage: Int?

    private enum CodingKeys: String, CodingKey {
        case totalItems, itemCount, itemsPerPage, totalPages, currentPage
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        totalItems = Self.flexibleInt(c, .totalItems)
        itemCount = Self.flexibleInt(c, .itemCount)
        itemsPerPage = Self.flexibleInt(c, .itemsPerPage)
        totalPages = Self.flexibleInt(c, .totalPages)
        currentPage = Self.flexibleInt(c, .currentPage)
    }

    /// The backend sometimes returns these as strings ("1") and sometimes as numbers.
    private static func flexibleInt(_ c: KeyedDecodingContainer<CodingKeys>, _ key: CodingKeys) -> Int? {
        if let i = try? c.decode(Int.self, forKey: key) { return i }
        if let s = try? c.decode(String.self, forKey: key) { return Int(s) }
        return nil
    }
}

struct EmptyPayload: Decodable {}

struct Paginated<T> {
    let items: [T]
    let meta: PageMeta?

    var hasMore: Bool {
        guard let current = meta?.currentPage, let total = meta?.totalPages else { return false }
        return current < total
    }
}

// MARK: - Client

final class APIClient: @unchecked Sendable {
    static let shared = APIClient()

    static let baseURL = URL(string: "https://the-cleaners-production.up.railway.app/api/v1")!

    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    /// Called when a token refresh fails, so the session can log the user out.
    var onSessionExpired: (@MainActor () -> Void)?

    private init() {
        decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
    }

    // MARK: Tokens

    private enum TokenKey {
        static let access = "access_token"
        static let refresh = "refresh_token"
    }

    var hasTokens: Bool { KeychainHelper.get(TokenKey.access) != nil }

    func storeTokens(access: String, refresh: String?) {
        KeychainHelper.set(access, for: TokenKey.access)
        if let refresh { KeychainHelper.set(refresh, for: TokenKey.refresh) }
    }

    func clearTokens() {
        KeychainHelper.delete(TokenKey.access)
        KeychainHelper.delete(TokenKey.refresh)
    }

    // MARK: Requests

    func get<T: Decodable>(_ path: String, query: [String: String] = [:]) async throws -> T {
        try await requestData(path: path, method: "GET", query: query)
    }

    func getPaginated<T: Decodable>(_ path: String, page: Int, limit: Int = 20,
                                    query: [String: String] = [:]) async throws -> Paginated<T> {
        var query = query
        query["page"] = String(page)
        query["limit"] = String(limit)
        let envelope: Envelope<[T]> = try await requestEnvelope(path: path, method: "GET", query: query)
        return Paginated(items: envelope.data ?? [], meta: envelope.meta)
    }

    func post<T: Decodable>(_ path: String, body: (some Encodable)? = Optional<Int>.none) async throws -> T {
        try await requestData(path: path, method: "POST", body: body)
    }

    func postVoid(_ path: String, body: (some Encodable)? = Optional<Int>.none) async throws {
        let _: Envelope<EmptyPayload> = try await requestEnvelope(path: path, method: "POST", body: body)
    }

    func patch<T: Decodable>(_ path: String, body: some Encodable) async throws -> T {
        try await requestData(path: path, method: "PATCH", body: body)
    }

    func delete(_ path: String) async throws {
        let _: Envelope<EmptyPayload> = try await requestEnvelope(path: path, method: "DELETE",
                                                                  body: Optional<Int>.none)
    }

    private func requestData<T: Decodable>(path: String, method: String,
                                           query: [String: String] = [:],
                                           body: (some Encodable)? = Optional<Int>.none) async throws -> T {
        let envelope: Envelope<T> = try await requestEnvelope(path: path, method: method,
                                                              query: query, body: body)
        guard let data = envelope.data else {
            throw APIError(statusCode: 200, message: "Empty response from server")
        }
        return data
    }

    private func requestEnvelope<T: Decodable>(path: String, method: String,
                                               query: [String: String] = [:],
                                               body: (some Encodable)? = Optional<Int>.none,
                                               isRetry: Bool = false) async throws -> Envelope<T> {
        var components = URLComponents(url: Self.baseURL.appending(path: path),
                                       resolvingAgainstBaseURL: false)!
        if !query.isEmpty {
            components.queryItems = query.map { URLQueryItem(name: $0.key, value: $0.value) }
        }

        var request = URLRequest(url: components.url!)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token = KeychainHelper.get(TokenKey.access) {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        if let body {
            request.httpBody = try encoder.encode(body)
        }

        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await URLSession.shared.data(for: request)
        } catch {
            throw APIError.network(error)
        }

        let status = (response as? HTTPURLResponse)?.statusCode ?? 0

        if status == 401, !isRetry, !path.hasPrefix("auth/") {
            if await refreshTokens() {
                return try await requestEnvelope(path: path, method: method, query: query,
                                                 body: body, isRetry: true)
            }
            clearTokens()
            await MainActor.run { onSessionExpired?() }
            throw APIError(statusCode: 401, message: "Session expired. Please log in again.")
        }

        guard (200..<300).contains(status) else {
            let message = (try? decoder.decode(ErrorBody.self, from: data))?.message
                ?? "Request failed (\(status))"
            throw APIError(statusCode: status, message: message)
        }

        do {
            return try decoder.decode(Envelope<T>.self, from: data)
        } catch {
            throw APIError(statusCode: status, message: "Could not read server response")
        }
    }

    private struct ErrorBody: Decodable {
        let message: String?
    }

    // MARK: Refresh

    private struct RefreshPayload: Decodable {
        let accessToken: String?
        let refreshToken: String?
    }

    private func refreshTokens() async -> Bool {
        guard let refresh = KeychainHelper.get(TokenKey.refresh) else { return false }
        do {
            let payload: RefreshPayload = try await requestData(
                path: "auth/refresh", method: "POST",
                body: ["refresh_token": refresh]
            )
            guard let access = payload.accessToken else { return false }
            storeTokens(access: access, refresh: payload.refreshToken)
            return true
        } catch {
            return false
        }
    }
}
