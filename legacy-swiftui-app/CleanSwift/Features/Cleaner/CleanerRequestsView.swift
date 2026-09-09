import SwiftUI

/// Incoming booking requests for the cleaner's listings.
struct CleanerRequestsView: View {
    @State private var requests: [ListingRequest] = []
    @State private var page = 1
    @State private var hasMore = false
    @State private var isLoading = true
    @State private var errorMessage: String?

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
                    EmptyStateView(icon: "tray.and.arrow.down",
                                   title: "No requests yet",
                                   message: "When customers book your listings, requests will appear here.")
                } else {
                    List {
                        ForEach(requests) { request in
                            RequestRow(request: request, isCleanerView: true) {
                                await load(reset: true)
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
            .navigationTitle("Booking Requests")
            .refreshable { await load(reset: true) }
            .task { await load(reset: true) }
        }
    }

    private func load(reset: Bool) async {
        if reset { page = 1 }
        isLoading = true
        errorMessage = nil
        do {
            let result = try await API.cleanerListingRequests(page: page)
            requests = result.items
            hasMore = result.hasMore
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    private func loadMore() async {
        page += 1
        if let result = try? await API.cleanerListingRequests(page: page) {
            requests.append(contentsOf: result.items)
            hasMore = result.hasMore
        }
    }
}
