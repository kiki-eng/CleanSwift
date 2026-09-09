import Foundation
import Observation

@Observable @MainActor
final class SessionStore {
    enum State {
        case loading
        case loggedOut
        case loggedIn(AuthUser)
    }

    private(set) var state: State = .loading
    /// Only populated for users with the CLEANER role (or a pending application).
    private(set) var cleanerProfile: CleanerProfile?

    var user: AuthUser? {
        if case .loggedIn(let user) = state { return user }
        return nil
    }

    /// Coarse key so views can animate transitions between the three states.
    var stateKey: String {
        switch state {
        case .loading: "loading"
        case .loggedOut: "loggedOut"
        case .loggedIn(let user): "loggedIn-\(user.role.rawValue)"
        }
    }

    init() {
        APIClient.shared.onSessionExpired = { [weak self] in
            self?.state = .loggedOut
            self?.cleanerProfile = nil
        }
    }

    func bootstrap() async {
        guard APIClient.shared.hasTokens else {
            state = .loggedOut
            return
        }
        do {
            let user = try await API.me()
            await loadCleanerProfileIfNeeded(for: user)
            state = .loggedIn(user)
        } catch {
            APIClient.shared.clearTokens()
            state = .loggedOut
        }
    }

    func login(email: String, password: String) async throws {
        let payload = try await API.login(email: email, password: password)
        try await completeAuth(payload)
    }

    func registerCustomer(_ body: API.RegisterCustomerBody) async throws {
        let payload = try await API.registerCustomer(body)
        try await completeAuth(payload)
    }

    func registerCleaner(_ body: API.RegisterCleanerBody) async throws {
        let payload = try await API.registerCleaner(body)
        try await completeAuth(payload)
    }

    private func completeAuth(_ payload: API.AuthPayload) async throws {
        APIClient.shared.storeTokens(access: payload.accessToken, refresh: payload.refreshToken)
        // /auth/me returns the complete profile; the login payload user can be partial.
        let user = (try? await API.me()) ?? payload.user
        await loadCleanerProfileIfNeeded(for: user)
        state = .loggedIn(user)
    }

    private func loadCleanerProfileIfNeeded(for user: AuthUser) async {
        // /cleaner-profiles/me is CLEANER/ADMIN only (403 for customers).
        guard user.role == .cleaner else { return }
        cleanerProfile = try? await API.myCleanerProfile()
    }

    /// Used by the apply flow: customers can't fetch their pending application,
    /// so we keep the profile returned by the apply endpoint.
    func adoptCleanerProfile(_ profile: CleanerProfile) {
        cleanerProfile = profile
    }

    func refreshUser() async {
        guard let user = try? await API.me() else { return }
        await loadCleanerProfileIfNeeded(for: user)
        state = .loggedIn(user)
    }

    func refreshCleanerProfile() async {
        cleanerProfile = try? await API.myCleanerProfile()
    }

    func logout() async {
        try? await API.logout()
        APIClient.shared.clearTokens()
        cleanerProfile = nil
        state = .loggedOut
    }
}
