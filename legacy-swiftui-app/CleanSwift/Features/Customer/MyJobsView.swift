import SwiftUI

struct MyJobsView: View {
    @State private var jobs: [Job] = []
    @State private var page = 1
    @State private var hasMore = false
    @State private var isLoading = true
    @State private var errorMessage: String?
    @State private var showCreateJob = false

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
                                   title: "No jobs yet",
                                   message: "Post your first cleaning job and cleaners will respond.")
                } else {
                    List {
                        ForEach(jobs) { job in
                            NavigationLink(value: job.id) {
                                JobRow(job: job)
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
            .navigationDestination(for: String.self) { jobId in
                JobDetailView(jobId: jobId, onChange: { Task { await load(reset: true) } })
            }
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showCreateJob = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showCreateJob) {
                CreateJobView { Task { await load(reset: true) } }
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
            let result = try await API.myPostings(page: page)
            jobs = result.items
            hasMore = result.hasMore
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    private func loadMore() async {
        page += 1
        if let result = try? await API.myPostings(page: page) {
            jobs.append(contentsOf: result.items)
            hasMore = result.hasMore
        }
    }
}

struct JobRow: View {
    let job: Job

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(job.title)
                    .font(.headline)
                    .lineLimit(1)
                Spacer()
                StatusBadge(text: job.status.label, color: job.status.color)
            }
            Label(job.scheduledDateFormatted, systemImage: "calendar")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            HStack {
                Label(job.propertyType.label, systemImage: job.propertyType.icon)
                Spacer()
                Text(job.budgetFormatted)
                    .fontWeight(.semibold)
                    .foregroundStyle(Theme.accent)
            }
            .font(.subheadline)
            .foregroundStyle(.secondary)
        }
        .padding(.vertical, 4)
    }
}
