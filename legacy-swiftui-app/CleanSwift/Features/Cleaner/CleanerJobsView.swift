import SwiftUI

/// Jobs assigned to the current cleaner, with start/complete actions.
struct CleanerJobsView: View {
    @State private var jobs: [Job] = []
    @State private var page = 1
    @State private var hasMore = false
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Group {
                if isLoading && jobs.isEmpty {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let errorMessage, jobs.isEmpty {
                    ErrorBanner(message: errorMessage) {
                        Task { await load(reset: true) }
                    }
                } else if jobs.isEmpty {
                    EmptyStateView(icon: "briefcase",
                                   title: "No assigned jobs",
                                   message: "Jobs you accept or win will appear here.")
                } else {
                    List {
                        ForEach(jobs) { job in
                            AssignedJobRow(job: job) {
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
            .navigationTitle("My Jobs")
            .refreshable { await load(reset: true) }
            .task { await load(reset: true) }
        }
    }

    private func load(reset: Bool) async {
        if reset { page = 1 }
        isLoading = true
        errorMessage = nil
        do {
            let result = try await API.myAssignedJobs(page: page)
            jobs = result.items
            hasMore = result.hasMore
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    private func loadMore() async {
        page += 1
        if let result = try? await API.myAssignedJobs(page: page) {
            jobs.append(contentsOf: result.items)
            hasMore = result.hasMore
        }
    }
}

struct AssignedJobRow: View {
    let job: Job
    var onChange: () async -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(job.title)
                    .font(.headline)
                    .lineLimit(1)
                Spacer()
                StatusBadge(text: job.status.label, color: job.status.color)
            }

            if let customer = job.customer {
                Label(customer.displayName, systemImage: "person")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            Label(job.scheduledDateFormatted, systemImage: "calendar")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Label(job.address, systemImage: "mappin.and.ellipse")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .lineLimit(1)

            HStack {
                Text(job.budgetFormatted)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.accent)
                Spacer()
                switch job.status {
                case .assigned:
                    AsyncButton {
                        try await API.startJob(id: job.id)
                        await onChange()
                    } label: {
                        Text("Start Job")
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.small)
                case .inProgress:
                    AsyncButton {
                        try await API.completeJob(id: job.id)
                        await onChange()
                    } label: {
                        Text("Mark Complete")
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.small)
                default:
                    EmptyView()
                }
            }
        }
        .padding(.vertical, 4)
    }
}
