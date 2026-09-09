import SwiftUI

struct BrowseListingsView: View {
    @State private var listings: [CleanerListing] = []
    @State private var page = 1
    @State private var hasMore = false
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Group {
                if isLoading && listings.isEmpty {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let errorMessage, listings.isEmpty {
                    ErrorBanner(message: errorMessage) {
                        Task { await load(reset: true) }
                    }
                } else if listings.isEmpty {
                    EmptyStateView(icon: "sparkles",
                                   title: "No listings yet",
                                   message: "Cleaner services will appear here once available.")
                } else {
                    List {
                        ForEach(listings) { listing in
                            NavigationLink(value: listing.id) {
                                ListingRow(listing: listing)
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
            .navigationTitle("Find Cleaners")
            .navigationDestination(for: String.self) { listingId in
                ListingDetailView(listingId: listingId)
            }
            .refreshable { await load(reset: true) }
            .task { await load(reset: true) }
        }
    }

    private func load(reset: Bool) async {
        if reset { page = 1 }
        isLoading = true
        errorMessage = nil
        do {
            let result = try await API.activeListings(page: page)
            listings = result.items
            hasMore = result.hasMore
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    private func loadMore() async {
        page += 1
        if let result = try? await API.activeListings(page: page) {
            listings.append(contentsOf: result.items)
            hasMore = result.hasMore
        }
    }
}

struct ListingRow: View {
    let listing: CleanerListing

    var body: some View {
        HStack(spacing: 12) {
            if let imageUrl = listing.imageUrl, let url = URL(string: imageUrl) {
                AsyncImage(url: url) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    placeholderIcon
                }
                .frame(width: 56, height: 56)
                .clipShape(.rect(cornerRadius: 10))
            } else {
                placeholderIcon
                    .frame(width: 56, height: 56)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(listing.title)
                    .font(.headline)
                    .lineLimit(1)
                if let cleaner = listing.cleaner {
                    HStack(spacing: 6) {
                        Text(cleaner.displayName)
                        StarRatingView(rating: cleaner.averageRating ?? 0)
                    }
                    .font(.caption)
                    .foregroundStyle(.secondary)
                }
                Text(listing.price.formatted(.number.grouping(.automatic)))
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.accent)
            }
        }
        .padding(.vertical, 4)
    }

    private var placeholderIcon: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 10)
                .fill(Theme.accent.opacity(0.12))
            Image(systemName: "sparkles")
                .foregroundStyle(Theme.accent)
        }
    }
}
