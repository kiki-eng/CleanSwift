import SwiftUI

enum Role: String, Codable {
    case customer = "CUSTOMER"
    case cleaner = "CLEANER"
    case admin = "ADMIN"
}

enum CleanerStatus: String, Codable {
    case pending = "PENDING"
    case approved = "APPROVED"
    case rejected = "REJECTED"
    case suspended = "SUSPENDED"

    var color: Color {
        switch self {
        case .pending: .orange
        case .approved: .green
        case .rejected: .red
        case .suspended: .gray
        }
    }
}

enum ListingStatus: String, Codable, CaseIterable {
    case active = "ACTIVE"
    case inactive = "INACTIVE"
    case paused = "PAUSED"

    var color: Color {
        switch self {
        case .active: .green
        case .inactive: .gray
        case .paused: .orange
        }
    }
}

enum JobStatus: String, Codable {
    case open = "OPEN"
    case assigned = "ASSIGNED"
    case inProgress = "IN_PROGRESS"
    case completed = "COMPLETED"
    case cancelled = "CANCELLED"

    var label: String {
        switch self {
        case .open: "Open"
        case .assigned: "Assigned"
        case .inProgress: "In Progress"
        case .completed: "Completed"
        case .cancelled: "Cancelled"
        }
    }

    var color: Color {
        switch self {
        case .open: .blue
        case .assigned: .purple
        case .inProgress: .orange
        case .completed: .green
        case .cancelled: .red
        }
    }
}

enum JobMode: String, Codable, CaseIterable, Identifiable {
    case firstCome = "FIRST_COME"
    case customerSelects = "CUSTOMER_SELECTS"

    var id: String { rawValue }

    var label: String {
        switch self {
        case .firstCome: "First Come"
        case .customerSelects: "I Choose"
        }
    }

    var explanation: String {
        switch self {
        case .firstCome: "The first cleaner to accept gets the job instantly."
        case .customerSelects: "Cleaners apply and you pick the one you like."
        }
    }
}

enum PropertyType: String, Codable, CaseIterable, Identifiable {
    case apartment = "APARTMENT"
    case house = "HOUSE"
    case office = "OFFICE"
    case other = "OTHER"

    var id: String { rawValue }
    var label: String { rawValue.capitalized }

    var icon: String {
        switch self {
        case .apartment: "building.2"
        case .house: "house"
        case .office: "briefcase"
        case .other: "square.grid.2x2"
        }
    }
}

enum ApplicationStatus: String, Codable {
    case pending = "PENDING"
    case accepted = "ACCEPTED"
    case rejected = "REJECTED"
    case withdrawn = "WITHDRAWN"

    var color: Color {
        switch self {
        case .pending: .orange
        case .accepted: .green
        case .rejected: .red
        case .withdrawn: .gray
        }
    }
}

enum ListingRequestStatus: String, Codable {
    case pending = "PENDING"
    case accepted = "ACCEPTED"
    case rejected = "REJECTED"
    case started = "STARTED"
    case completed = "COMPLETED"
    case cancelled = "CANCELLED"

    var label: String { rawValue.capitalized }

    var color: Color {
        switch self {
        case .pending: .orange
        case .accepted: .blue
        case .rejected: .red
        case .started: .purple
        case .completed: .green
        case .cancelled: .gray
        }
    }
}

enum NotificationStatus: String, Codable {
    case unread, read, archived
}

enum NotificationPriority: String, Codable {
    case low, medium, high, urgent

    var color: Color {
        switch self {
        case .low: .gray
        case .medium: .blue
        case .high: .orange
        case .urgent: .red
        }
    }
}

/// Decodes to `.unknown` for any type the backend adds later.
enum NotificationType: String, Codable {
    case jobRequested = "job_requested"
    case jobAssigned = "job_assigned"
    case jobStarted = "job_started"
    case jobCompleted = "job_completed"
    case jobCancelled = "job_cancelled"
    case listingRequestCreated = "listing_request_created"
    case listingRequestAccepted = "listing_request_accepted"
    case listingRequestRejected = "listing_request_rejected"
    case listingRequestStarted = "listing_request_started"
    case listingRequestCompleted = "listing_request_completed"
    case paymentSuccessful = "payment_successful"
    case paymentFailed = "payment_failed"
    case applicationStatusUpdated = "application_status_updated"
    case systemAlert = "system_alert"
    case custom = "custom"
    case unknown

    init(from decoder: Decoder) throws {
        let raw = try decoder.singleValueContainer().decode(String.self)
        self = NotificationType(rawValue: raw) ?? .unknown
    }

    var icon: String {
        switch self {
        case .jobRequested, .jobAssigned, .jobStarted, .jobCompleted, .jobCancelled:
            "briefcase"
        case .listingRequestCreated, .listingRequestAccepted, .listingRequestRejected,
             .listingRequestStarted, .listingRequestCompleted:
            "sparkles"
        case .paymentSuccessful, .paymentFailed:
            "creditcard"
        case .applicationStatusUpdated:
            "person.crop.circle.badge.checkmark"
        case .systemAlert, .custom, .unknown:
            "bell"
        }
    }
}
