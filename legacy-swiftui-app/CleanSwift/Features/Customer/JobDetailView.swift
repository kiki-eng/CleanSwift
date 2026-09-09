import SwiftUI

/// Customer-side job detail: applications review, cancel, and post-completion review.
struct JobDetailView: View {
    let jobId: String
    var onChange: () -> Void = {}

    @State private var job: Job?
    @State private var applications: [JobApplication] = []
    @State private var errorMessage: String?
    @State private var showReviewSheet = false

    var body: some View {
        Group {
            if let job {
                List {
                    jobInfoSection(job)

                    if job.mode == .customerSelects && job.status == .open {
                        applicationsSection
                    }

                    actionsSection(job)
                }
            } else if let errorMessage {
                ErrorBanner(message: errorMessage) { Task { await load() } }
            } else {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .navigationTitle("Job Details")
        .navigationBarTitleDisplayMode(.inline)
        .task { await load() }
        .sheet(isPresented: $showReviewSheet) {
            ReviewSheet(title: "Review Cleaner") { rating, comment in
                try await API.reviewJob(jobId: jobId, body: .init(rating: rating, comment: comment))
            }
        }
    }

    @ViewBuilder
    private func jobInfoSection(_ job: Job) -> some View {
        Section {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(job.title).font(.headline)
                    Spacer()
                    StatusBadge(text: job.status.label, color: job.status.color)
                }
                Text(job.description)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .padding(.vertical, 4)

            DetailRow(icon: "calendar", label: "When", value: job.scheduledDateFormatted)
            DetailRow(icon: "mappin.and.ellipse", label: "Where", value: job.address)
            DetailRow(icon: job.propertyType.icon, label: "Property", value: job.propertyType.label)
            DetailRow(icon: "clock", label: "Duration", value: "\(job.estimatedDuration.formatted()) hrs")
            DetailRow(icon: "banknote", label: "Budget", value: job.budgetFormatted)
            DetailRow(icon: "person.2", label: "Mode", value: job.mode.label)

            if let requirements = job.specialRequirements, !requirements.isEmpty {
                DetailRow(icon: "checklist", label: "Requirements",
                          value: requirements.joined(separator: ", "))
            }
        }

        if let cleaner = job.assignedCleaner {
            Section("Assigned Cleaner") {
                CleanerSummaryRow(profile: cleaner)
            }
        }
    }

    private var applicationsSection: some View {
        Section("Applications (\(applications.count))") {
            if applications.isEmpty {
                Text("No applications yet. Check back soon.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            ForEach(applications) { application in
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        if let cleaner = application.cleaner {
                            CleanerSummaryRow(profile: cleaner)
                        } else {
                            Text("Cleaner").font(.headline)
                        }
                        Spacer()
                        StatusBadge(text: application.status.rawValue.capitalized,
                                    color: application.status.color)
                    }
                    if let coverLetter = application.coverLetter, !coverLetter.isEmpty {
                        Text(coverLetter)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    HStack {
                        if let price = application.proposedPrice {
                            Text("Proposed: \(price.formatted(.number.grouping(.automatic)))")
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(Theme.accent)
                        }
                        Spacer()
                        if application.status == .pending {
                            AsyncButton {
                                try await API.acceptApplication(id: application.id)
                                await load()
                                onChange()
                            } label: {
                                Text("Accept")
                            }
                            .buttonStyle(.borderedProminent)
                            .controlSize(.small)
                        }
                    }
                }
                .padding(.vertical, 4)
            }
        }
    }

    @ViewBuilder
    private func actionsSection(_ job: Job) -> some View {
        Section {
            if job.status == .open || job.status == .assigned {
                AsyncButton(role: .destructive) {
                    try await API.cancelJob(id: jobId)
                    await load()
                    onChange()
                } label: {
                    Label("Cancel Job", systemImage: "xmark.circle")
                        .frame(maxWidth: .infinity)
                }
            }
            if job.status == .completed {
                Button {
                    showReviewSheet = true
                } label: {
                    Label("Leave a Review", systemImage: "star")
                        .frame(maxWidth: .infinity)
                }
            }
        }
    }

    private func load() async {
        errorMessage = nil
        do {
            job = try await API.job(id: jobId)
            if job?.mode == .customerSelects {
                applications = (try? await API.applications(jobId: jobId)) ?? []
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

struct CleanerSummaryRow: View {
    let profile: CleanerProfile

    var body: some View {
        HStack(spacing: 12) {
            AvatarView(name: profile.displayName, photoUrl: profile.user?.profilePhotoUrl, size: 40)
            VStack(alignment: .leading, spacing: 2) {
                Text(profile.displayName)
                    .font(.subheadline.weight(.semibold))
                HStack(spacing: 6) {
                    StarRatingView(rating: profile.averageRating ?? 0)
                    Text("(\(profile.totalReviews ?? 0))")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
    }
}
