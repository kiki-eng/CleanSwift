import SwiftUI

struct ProfileView: View {
    @Environment(SessionStore.self) private var session

    var body: some View {
        NavigationStack {
            List {
                if let user = session.user {
                    Section {
                        HStack(spacing: 16) {
                            AvatarView(name: user.displayName,
                                       photoUrl: user.profilePhotoUrl,
                                       size: 60)
                            VStack(alignment: .leading, spacing: 4) {
                                Text(user.displayName)
                                    .font(.headline)
                                Text(user.email)
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                                StatusBadge(text: user.role.rawValue.capitalized,
                                            color: Theme.accent)
                            }
                        }
                        .padding(.vertical, 4)
                    }

                    Section("Details") {
                        if let phone = user.phoneNumber, !phone.isEmpty {
                            DetailRow(icon: "phone", label: "Phone", value: phone)
                        }
                        if let location = user.location, !location.isEmpty {
                            DetailRow(icon: "mappin.and.ellipse", label: "Location", value: location)
                        }
                        if user.emailVerified != true {
                            Label("Email not verified", systemImage: "exclamationmark.circle")
                                .font(.subheadline)
                                .foregroundStyle(.orange)
                        }
                    }

                    cleanerSection(for: user)
                }

                Section {
                    Button(role: .destructive) {
                        Task { await session.logout() }
                    } label: {
                        Label("Log Out", systemImage: "rectangle.portrait.and.arrow.right")
                            .frame(maxWidth: .infinity)
                    }
                }
            }
            .navigationTitle("Profile")
            .refreshable { await session.refreshUser() }
        }
    }

    @ViewBuilder
    private func cleanerSection(for user: AuthUser) -> some View {
        if user.role == .customer {
            Section("Work with us") {
                if let profile = session.cleanerProfile {
                    HStack {
                        Label("Cleaner application", systemImage: "sparkles")
                        Spacer()
                        StatusBadge(text: profile.status.rawValue.capitalized,
                                    color: profile.status.color)
                    }
                } else {
                    NavigationLink {
                        ApplyCleanerView()
                    } label: {
                        Label("Become a Cleaner", systemImage: "sparkles")
                    }
                }
            }
        } else if user.role == .cleaner, let profile = session.cleanerProfile {
            Section("Cleaner Stats") {
                HStack {
                    StarRatingView(rating: profile.averageRating ?? 0)
                    Text((profile.averageRating ?? 0).formatted(.number.precision(.fractionLength(1))))
                        .font(.subheadline.weight(.semibold))
                    Spacer()
                    Text("\(profile.totalReviews ?? 0) reviews")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                DetailRow(icon: "checkmark.seal", label: "Jobs completed",
                          value: "\(profile.totalJobsCompleted ?? 0)")
                DetailRow(icon: "sparkles", label: "Bookings completed",
                          value: "\(profile.totalListingRequestsCompleted ?? 0)")
                if let rate = profile.hourlyRate {
                    DetailRow(icon: "banknote", label: "Hourly rate",
                              value: rate.formatted(.number.grouping(.automatic)))
                }
                if let areas = profile.serviceAreas, !areas.isEmpty {
                    DetailRow(icon: "map", label: "Service areas",
                              value: areas.joined(separator: ", "))
                }
                if let specialties = profile.specialties, !specialties.isEmpty {
                    DetailRow(icon: "star.circle", label: "Specialties",
                              value: specialties.joined(separator: ", "))
                }
            }
        }
    }
}
