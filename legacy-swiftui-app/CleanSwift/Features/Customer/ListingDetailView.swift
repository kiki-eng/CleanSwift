import SwiftUI

struct ListingDetailView: View {
    let listingId: String

    @State private var listing: CleanerListing?
    @State private var reviews: [Review] = []
    @State private var errorMessage: String?
    @State private var showRequestSheet = false
    @State private var requestSent = false

    var body: some View {
        Group {
            if let listing {
                List {
                    Section {
                        VStack(alignment: .leading, spacing: 8) {
                            Text(listing.title).font(.title3.bold())
                            Text(listing.description)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                            Text(listing.price.formatted(.number.grouping(.automatic)))
                                .font(.headline)
                                .foregroundStyle(Theme.accent)
                        }
                        .padding(.vertical, 4)
                    }

                    if let cleaner = listing.cleaner {
                        Section("About the Cleaner") {
                            CleanerSummaryRow(profile: cleaner)
                            if let experience = cleaner.cleaningExperience {
                                Text(experience)
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                            if let specialties = cleaner.specialties, !specialties.isEmpty {
                                DetailRow(icon: "star.circle", label: "Specialties",
                                          value: specialties.joined(separator: ", "))
                            }
                            if let areas = cleaner.serviceAreas, !areas.isEmpty {
                                DetailRow(icon: "map", label: "Service areas",
                                          value: areas.joined(separator: ", "))
                            }
                            DetailRow(icon: "checkmark.seal",
                                      label: "Jobs completed",
                                      value: "\((cleaner.totalJobsCompleted ?? 0) + (cleaner.totalListingRequestsCompleted ?? 0))")
                        }
                    }

                    if !reviews.isEmpty {
                        Section("Reviews") {
                            ForEach(reviews) { review in
                                VStack(alignment: .leading, spacing: 4) {
                                    HStack {
                                        Text(review.customer?.displayName ?? "Customer")
                                            .font(.subheadline.weight(.semibold))
                                        Spacer()
                                        StarRatingView(rating: review.rating)
                                    }
                                    if let comment = review.comment {
                                        Text(comment)
                                            .font(.subheadline)
                                            .foregroundStyle(.secondary)
                                    }
                                }
                                .padding(.vertical, 2)
                            }
                        }
                    }

                    Section {
                        Button {
                            showRequestSheet = true
                        } label: {
                            Text(requestSent ? "Request Sent ✓" : "Book This Cleaner")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .disabled(requestSent)
                        .listRowBackground(Color.clear)
                        .listRowInsets(EdgeInsets())
                    }
                }
            } else if let errorMessage {
                ErrorBanner(message: errorMessage) { Task { await load() } }
            } else {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .navigationTitle("Listing")
        .navigationBarTitleDisplayMode(.inline)
        .task { await load() }
        .sheet(isPresented: $showRequestSheet) {
            if let listing {
                CreateListingRequestSheet(listing: listing) {
                    requestSent = true
                }
            }
        }
    }

    private func load() async {
        errorMessage = nil
        do {
            let listing = try await API.listing(id: listingId)
            self.listing = listing
            if let cleanerUserId = listing.cleaner?.userId {
                reviews = (try? await API.cleanerReviews(cleanerUserId: cleanerUserId, page: 1).items) ?? []
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

struct CreateListingRequestSheet: View {
    let listing: CleanerListing
    var onSent: () -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var address = ""
    @State private var requestedDate = Date().addingTimeInterval(24 * 3600)
    @State private var notes = ""
    @State private var errorMessage: String?
    @State private var isSubmitting = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Booking details") {
                    TextField("Service address", text: $address)
                    DatePicker("Date & time", selection: $requestedDate, in: Date()...)
                }
                Section("Notes (optional)") {
                    TextField("Anything the cleaner should know?", text: $notes, axis: .vertical)
                        .lineLimit(2...4)
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
                            Text("Send Request").frame(maxWidth: .infinity)
                                .opacity(isSubmitting ? 0 : 1)
                            if isSubmitting { ProgressView() }
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(address.isEmpty || isSubmitting)
                    .listRowBackground(Color.clear)
                    .listRowInsets(EdgeInsets())
                }
            }
            .navigationTitle("Book \(listing.title)")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
        .presentationDetents([.medium, .large])
    }

    private func submit() {
        isSubmitting = true
        errorMessage = nil
        Task {
            defer { isSubmitting = false }
            do {
                _ = try await API.createListingRequest(.init(
                    listingId: listing.id,
                    address: address,
                    requestedDate: ISO8601DateFormatter().string(from: requestedDate),
                    additionalNotes: notes.isEmpty ? nil : notes
                ))
                onSent()
                dismiss()
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }
}
