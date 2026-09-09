import Foundation

// MARK: - Users

struct AuthUser: Codable, Identifiable, Equatable {
    let id: String
    let email: String
    let firstName: String
    let lastName: String
    let fullName: String?
    let profilePhotoUrl: String?
    let role: Role
    let emailVerified: Bool?
    let phoneNumber: String?
    let location: String?

    var displayName: String { fullName ?? "\(firstName) \(lastName)" }
    var initials: String {
        [firstName.first, lastName.first].compactMap { $0.map(String.init) }.joined()
    }
}

// MARK: - Cleaner profile

struct CleanerProfile: Codable, Identifiable {
    let id: String
    let userId: String
    let status: CleanerStatus
    let isIndividual: Bool
    let companyName: String?
    let cleaningExperience: String?
    let hourlyRate: Double?
    let serviceAreas: [String]?
    let specialties: [String]?
    let averageRating: Double?
    let totalJobsCompleted: Int?
    let totalListingRequestsCompleted: Int?
    let totalReviews: Int?
    let backgroundChecked: Bool?
    let user: AuthUser?
    let rejectionReason: LenientString?
    let listings: [CleanerListing]?

    var displayName: String {
        if let companyName, !isIndividual { return companyName }
        return user?.displayName ?? "Cleaner"
    }
}

// MARK: - Listings

struct CleanerListing: Codable, Identifiable {
    let id: String
    let cleanerId: String
    let title: String
    let description: String
    let price: Double
    let imageUrl: String?
    let status: ListingStatus
    let cleaner: CleanerProfile?
}

// MARK: - Listing requests

struct ListingRequest: Codable, Identifiable {
    let id: String
    let listingId: String
    let customerId: String
    let status: ListingRequestStatus
    let requestedDate: String
    let address: String
    let additionalNotes: String?
    let imageUrl: String?
    let createdAt: Double?
    let listing: CleanerListing?
    let customer: AuthUser?

    var requestedDateFormatted: String {
        if let date = ISO8601DateFormatter().date(from: requestedDate) {
            return date.formatted(date: .abbreviated, time: .shortened)
        }
        return requestedDate
    }
}

// MARK: - Jobs

struct Job: Codable, Identifiable {
    let id: String
    let createdAt: Double
    let customerId: String
    let assignedCleanerId: String?
    let status: JobStatus
    let mode: JobMode
    let title: String
    let description: String
    let propertyType: PropertyType
    let address: String
    let latitude: Double?
    let longitude: Double?
    let scheduledDate: Double
    let estimatedDuration: Double
    let budget: Double
    let currency: String
    let specialRequirements: [String]?
    let customer: AuthUser?
    let assignedCleaner: CleanerProfile?

    var scheduledDateFormatted: String {
        Date(timeIntervalSince1970: scheduledDate)
            .formatted(date: .abbreviated, time: .shortened)
    }

    var budgetFormatted: String {
        "\(currency) \(budget.formatted(.number.grouping(.automatic)))"
    }
}

// MARK: - Job applications

struct JobApplication: Codable, Identifiable {
    let id: String
    let createdAt: Double
    let jobId: String
    let cleanerId: String
    let status: ApplicationStatus
    let coverLetter: String?
    let proposedPrice: Double?
    let job: Job?
    let cleaner: CleanerProfile?
}

// MARK: - Reviews

struct Review: Codable, Identifiable {
    let id: String
    let createdAt: Double
    let jobId: String?
    let listingRequestId: String?
    let customerId: String
    let cleanerId: String
    let rating: Double
    let comment: String?
    let customer: AuthUser?
}

// MARK: - Notifications

struct AppNotification: Codable, Identifiable {
    let id: String
    let createdAt: Double
    let type: NotificationType
    let title: String
    let message: String
    let priority: NotificationPriority
    let status: NotificationStatus
    let entityType: String?
    let entityId: String?

    var createdAtFormatted: String {
        Date(timeIntervalSince1970: createdAt)
            .formatted(.relative(presentation: .named))
    }
}

// MARK: - Helpers

/// Decodes a value that the backend may send as a string or as something else entirely.
struct LenientString: Codable {
    let value: String?

    init(from decoder: Decoder) throws {
        value = try? decoder.singleValueContainer().decode(String.self)
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        try container.encode(value)
    }
}
