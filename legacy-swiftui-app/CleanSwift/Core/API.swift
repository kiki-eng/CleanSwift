import Foundation

/// Typed wrappers around every backend endpoint the app uses.
enum API {
    private static var client: APIClient { .shared }

    // MARK: Auth

    struct AuthPayload: Decodable {
        let user: AuthUser
        let accessToken: String
        let refreshToken: String?
    }

    static func login(email: String, password: String) async throws -> AuthPayload {
        try await client.post("auth/login", body: ["email": email, "password": password])
    }

    struct RegisterCustomerBody: Encodable {
        let email, password, firstName, lastName: String
        let phoneNumber: String?
        let location: String?
    }

    static func registerCustomer(_ body: RegisterCustomerBody) async throws -> AuthPayload {
        try await client.post("auth/register/customer", body: body)
    }

    struct RegisterCleanerBody: Encodable {
        let email, password, firstName, lastName: String
        let phoneNumber: String?
        let location: String?
        let isIndividual: Bool
        let companyName: String?
        let cleaningExperience: String?
    }

    static func registerCleaner(_ body: RegisterCleanerBody) async throws -> AuthPayload {
        try await client.post("auth/register/cleaner", body: body)
    }

    static func me() async throws -> AuthUser {
        // The backend nests the user: { data: { user: {...} } }
        struct MePayload: Decodable { let user: AuthUser }
        let payload: MePayload = try await client.get("auth/me")
        return payload.user
    }

    static func logout() async throws {
        try await client.postVoid("auth/logout")
    }

    // MARK: Cleaner profiles

    static func myCleanerProfile() async throws -> CleanerProfile {
        try await client.get("cleaner-profiles/me")
    }

    struct ApplyCleanerBody: Encodable {
        let isIndividual: Bool
        let companyName: String?
        let cleaningExperience: String?
        let hourlyRate: Double?
        let serviceAreas: [String]?
        let specialties: [String]?
    }

    static func applyAsCleaner(_ body: ApplyCleanerBody) async throws -> CleanerProfile {
        try await client.post("cleaner-profiles/apply", body: body)
    }

    static func publicCleanerProfile(userId: String) async throws -> CleanerProfile {
        try await client.get("cleaner-profiles/public/\(userId)")
    }

    // MARK: Jobs

    struct CreateJobBody: Encodable {
        let title, description: String
        let mode: JobMode
        let propertyType: PropertyType
        let address: String
        let scheduledDate: Double
        let estimatedDuration: Double
        let budget: Double
        let currency: String
        let specialRequirements: [String]?
    }

    static func createJob(_ body: CreateJobBody) async throws -> Job {
        try await client.post("jobs", body: body)
    }

    static func myPostings(page: Int) async throws -> Paginated<Job> {
        try await client.getPaginated("jobs/my-postings", page: page)
    }

    static func openJobs(page: Int) async throws -> Paginated<Job> {
        try await client.getPaginated("jobs/open", page: page)
    }

    static func myAssignedJobs(page: Int) async throws -> Paginated<Job> {
        try await client.getPaginated("jobs/my-jobs", page: page)
    }

    static func job(id: String) async throws -> Job {
        try await client.get("jobs/\(id)")
    }

    static func cancelJob(id: String) async throws {
        try await client.postVoid("jobs/\(id)/cancel")
    }

    static func acceptJob(id: String) async throws {
        try await client.postVoid("jobs/\(id)/accept")
    }

    static func startJob(id: String) async throws {
        try await client.postVoid("jobs/\(id)/start")
    }

    static func completeJob(id: String) async throws {
        try await client.postVoid("jobs/\(id)/complete")
    }

    // MARK: Job applications

    struct ApplyJobBody: Encodable {
        let coverLetter: String?
        let proposedPrice: Double?
    }

    static func applyToJob(jobId: String, body: ApplyJobBody) async throws {
        try await client.postVoid("job-applications/job/\(jobId)/apply", body: body)
    }

    static func applications(jobId: String) async throws -> [JobApplication] {
        try await client.get("job-applications/job/\(jobId)")
    }

    static func acceptApplication(id: String) async throws {
        try await client.postVoid("job-applications/\(id)/accept")
    }

    // MARK: Listings

    static func activeListings(page: Int, search: String? = nil) async throws -> Paginated<CleanerListing> {
        var query: [String: String] = [:]
        if let search, !search.isEmpty { query["search"] = search }
        return try await client.getPaginated("cleaner-listings", page: page, query: query)
    }

    static func listing(id: String) async throws -> CleanerListing {
        try await client.get("cleaner-listings/\(id)")
    }

    struct ListingBody: Encodable {
        let title, description: String
        let price: Double
        let status: ListingStatus?
    }

    static func createListing(_ body: ListingBody) async throws -> CleanerListing {
        try await client.post("cleaner-listings", body: body)
    }

    static func updateListing(id: String, _ body: ListingBody) async throws -> CleanerListing {
        try await client.patch("cleaner-listings/\(id)", body: body)
    }

    static func deleteListing(id: String) async throws {
        try await client.delete("cleaner-listings/\(id)")
    }

    // MARK: Listing requests

    struct CreateListingRequestBody: Encodable {
        let listingId: String
        let address: String
        let requestedDate: String
        let additionalNotes: String?
    }

    static func createListingRequest(_ body: CreateListingRequestBody) async throws -> ListingRequest {
        try await client.post("listing-requests", body: body)
    }

    static func myListingRequests(page: Int) async throws -> Paginated<ListingRequest> {
        try await client.getPaginated("listing-requests/my-requests", page: page)
    }

    static func cleanerListingRequests(page: Int) async throws -> Paginated<ListingRequest> {
        try await client.getPaginated("listing-requests/cleaner-requests", page: page)
    }

    static func updateListingRequestStatus(id: String, status: ListingRequestStatus) async throws -> ListingRequest {
        try await client.patch("listing-requests/\(id)/status", body: ["status": status.rawValue])
    }

    // MARK: Reviews

    struct CreateReviewBody: Encodable {
        let rating: Double
        let comment: String?
    }

    static func reviewJob(jobId: String, body: CreateReviewBody) async throws {
        try await client.postVoid("reviews/job/\(jobId)", body: body)
    }

    static func reviewListingRequest(requestId: String, body: CreateReviewBody) async throws {
        try await client.postVoid("reviews/listing-request/\(requestId)", body: body)
    }

    static func cleanerReviews(cleanerUserId: String, page: Int) async throws -> Paginated<Review> {
        try await client.getPaginated("reviews/cleaner/\(cleanerUserId)", page: page)
    }

    // MARK: Notifications

    static func notifications(page: Int) async throws -> Paginated<AppNotification> {
        try await client.getPaginated("notifications", page: page)
    }

    static func unreadCount() async throws -> Int {
        struct Count: Decodable { let count: Int? }
        let result: Count = try await client.get("notifications/unread-count")
        return result.count ?? 0
    }

    static func markAllNotificationsRead() async throws {
        try await client.postVoid("notifications/mark-all-read")
    }

    static func markNotificationRead(id: String) async throws -> AppNotification {
        try await client.patch("notifications/\(id)", body: ["status": NotificationStatus.read.rawValue])
    }

    // MARK: Users

    struct UpdateProfileBody: Encodable {
        let firstName: String?
        let lastName: String?
        let phoneNumber: String?
        let location: String?
    }

    static func updateProfile(_ body: UpdateProfileBody) async throws -> AuthUser {
        try await client.patch("users/me", body: body)
    }
}
