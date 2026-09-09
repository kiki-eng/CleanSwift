import SwiftUI

/// The cleaner's own service listings with create/edit/delete.
struct MyListingsView: View {
    @Environment(SessionStore.self) private var session

    @State private var listings: [CleanerListing] = []
    @State private var isLoading = true
    @State private var errorMessage: String?
    @State private var editingListing: CleanerListing?
    @State private var showCreate = false

    var body: some View {
        NavigationStack {
            Group {
                if isLoading && listings.isEmpty {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let errorMessage, listings.isEmpty {
                    ErrorBanner(message: errorMessage) {
                        Task { await load() }
                    }
                } else if listings.isEmpty {
                    EmptyStateView(icon: "sparkles",
                                   title: "No listings yet",
                                   message: "Create a listing so customers can find and book you directly.")
                } else {
                    List {
                        ForEach(listings) { listing in
                            Button {
                                editingListing = listing
                            } label: {
                                MyListingRow(listing: listing)
                            }
                            .buttonStyle(.plain)
                            .swipeActions {
                                Button(role: .destructive) {
                                    Task {
                                        try? await API.deleteListing(id: listing.id)
                                        await load()
                                    }
                                } label: {
                                    Label("Delete", systemImage: "trash")
                                }
                            }
                        }
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("My Listings")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showCreate = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showCreate) {
                ListingFormSheet(listing: nil) { Task { await load() } }
            }
            .sheet(item: $editingListing) { listing in
                ListingFormSheet(listing: listing) { Task { await load() } }
            }
            .refreshable { await load() }
            .task { await load() }
        }
    }

    private func load() async {
        isLoading = true
        errorMessage = nil
        // The cleaner's own listings come embedded in their profile.
        await session.refreshCleanerProfile()
        if let profile = session.cleanerProfile {
            listings = profile.listings ?? []
        } else {
            errorMessage = "Could not load your listings"
        }
        isLoading = false
    }
}

struct MyListingRow: View {
    let listing: CleanerListing

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(listing.title)
                    .font(.headline)
                    .lineLimit(1)
                Spacer()
                StatusBadge(text: listing.status.rawValue.capitalized, color: listing.status.color)
            }
            Text(listing.description)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .lineLimit(2)
            Text(listing.price.formatted(.number.grouping(.automatic)))
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Theme.accent)
        }
        .padding(.vertical, 4)
    }
}

struct ListingFormSheet: View {
    let listing: CleanerListing?
    var onSaved: () -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var title: String
    @State private var description: String
    @State private var price: String
    @State private var status: ListingStatus
    @State private var errorMessage: String?
    @State private var isSubmitting = false

    init(listing: CleanerListing?, onSaved: @escaping () -> Void) {
        self.listing = listing
        self.onSaved = onSaved
        _title = State(initialValue: listing?.title ?? "")
        _description = State(initialValue: listing?.description ?? "")
        _price = State(initialValue: listing.map { String($0.price.formatted(.number.grouping(.never))) } ?? "")
        _status = State(initialValue: listing?.status ?? .active)
    }

    private var isValid: Bool {
        !title.isEmpty && !description.isEmpty && Double(price) != nil
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Service") {
                    TextField("Title (e.g. Deep House Cleaning)", text: $title)
                    TextField("Describe your service", text: $description, axis: .vertical)
                        .lineLimit(3...6)
                    TextField("Price", text: $price)
                        .keyboardType(.decimalPad)
                }

                if listing != nil {
                    Section("Status") {
                        Picker("Status", selection: $status) {
                            ForEach(ListingStatus.allCases, id: \.self) { status in
                                Text(status.rawValue.capitalized).tag(status)
                            }
                        }
                        .pickerStyle(.segmented)
                    }
                }

                if let errorMessage {
                    Section {
                        Text(errorMessage)
                            .font(.subheadline)
                            .foregroundStyle(.red)
                    }
                }

                Section {
                    Button {
                        submit()
                    } label: {
                        ZStack {
                            Text(listing == nil ? "Create Listing" : "Save Changes")
                                .frame(maxWidth: .infinity)
                                .opacity(isSubmitting ? 0 : 1)
                            if isSubmitting { ProgressView() }
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(!isValid || isSubmitting)
                    .listRowBackground(Color.clear)
                    .listRowInsets(EdgeInsets())
                }
            }
            .navigationTitle(listing == nil ? "New Listing" : "Edit Listing")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }

    private func submit() {
        guard let priceValue = Double(price) else { return }
        isSubmitting = true
        errorMessage = nil
        Task {
            defer { isSubmitting = false }
            do {
                let body = API.ListingBody(title: title, description: description,
                                           price: priceValue,
                                           status: listing == nil ? nil : status)
                if let listing {
                    _ = try await API.updateListing(id: listing.id, body)
                } else {
                    _ = try await API.createListing(body)
                }
                onSaved()
                dismiss()
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }
}
