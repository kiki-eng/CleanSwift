import SwiftUI

/// Customer's outgoing listing requests.
struct MyRequestsView: View {
    @State private var requests: [ListingRequest] = []
    @State private var page = 1
    @State private var hasMore = false
    @State private var isLoading = true
    @State private var errorMessage: String?
    @State private var reviewingRequest: ListingRequest?

    var body: some View {
        NavigationStack {
            Group {
                if isLoading && requests.isEmpty {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let errorMessage, requests.isEmpty {
                    ErrorBanner(message: errorMessage) {
                        Task { await load(reset: true) }
                    }
                } else if requests.isEmpty {
                    EmptyStateView(icon: "paperplane",
                                   title: "No requests yet",
                                   message: "Book a cleaner from the Find Cleaners tab and your requests will appear here.")
                } else {
                    List {
                        ForEach(requests) { request in
                            RequestRow(request: request, isCleanerView: false) {
                                await load(reset: true)
                            } onReview: {
                                reviewingRequest = request
                            }
                        }
                        if hasMore {
                            ProgressView()
                                .frame(maxWidth: .infinity)
                                .task { await loadMore() }
                        }
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("My Requests")
            .refreshable { await load(reset: true) }
            .task { await load(reset: true) }
            .sheet(item: $reviewingRequest) { request in
                ReviewSheet(title: "Review Cleaner") { rating, comment in
                    try await API.reviewListingRequest(requestId: request.id,
                                                       body: .init(rating: rating, comment: comment))
                }
            }
        }
    }

    private func load(reset: Bool) async {
        if reset { page = 1 }
        isLoading = true
        errorMessage = nil
        do {
            let result = try await API.myListingRequests(page: page)
            requests = result.items
            hasMore = result.hasMore
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    private func loadMore() async {
        page += 1
        if let result = try? await API.myListingRequests(page: page) {
            requests.append(contentsOf: result.items)
            hasMore = result.hasMore
        }
    }
}

/// Shared row for listing requests. Customers can cancel/review; cleaners can
/// accept, reject, start, and complete.
struct RequestRow: View {
    let request: ListingRequest
    let isCleanerView: Bool
    var onChange: () async -> Void
    var onReview: () -> Void = {}

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(request.listing?.title ?? "Cleaning Request")
                        .font(.headline)
                        .lineLimit(1)
                    if isCleanerView, let customer = request.customer {
                        Text("From \(customer.displayName)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                Spacer()
                StatusBadge(text: request.status.label, color: request.status.color)
            }

            Label(request.requestedDateFormatted, systemImage: "calendar")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Label(request.address, systemImage: "mappin.and.ellipse")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .lineLimit(1)

            if let notes = request.additionalNotes, !notes.isEmpty {
                Text(notes)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }

            actionButtons
        }
        .padding(.vertical, 4)
    }

    @ViewBuilder
    private var actionButtons: some View {
        HStack(spacing: 8) {
            if isCleanerView {
                switch request.status {
                case .pending:
                    statusButton("Accept", .accepted, prominent: true)
                    statusButton("Reject", .rejected, role: .destructive)
                case .accepted:
                    statusButton("Start Job", .started, prominent: true)
                case .started:
                    statusButton("Mark Complete", .completed, prominent: true)
                default:
                    EmptyView()
                }
            } else {
                switch request.status {
                case .pending, .accepted:
                    statusButton("Cancel Request", .cancelled, role: .destructive)
                case .completed:
                    Button("Leave a Review", action: onReview)
                        .buttonStyle(.bordered)
                        .controlSize(.small)
                default:
                    EmptyView()
                }
            }
        }
    }

    private func statusButton(_ title: String, _ status: ListingRequestStatus,
                              role: ButtonRole? = nil, prominent: Bool = false) -> some View {
        AsyncButton(role: role) {
            _ = try await API.updateListingRequestStatus(id: request.id, status: status)
            await onChange()
        } label: {
            Text(title)
        }
        .buttonStyle(.bordered)
        .controlSize(.small)
        .tint(prominent ? Theme.accent : nil)
    }
}
