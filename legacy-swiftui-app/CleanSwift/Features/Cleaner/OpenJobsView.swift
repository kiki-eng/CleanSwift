import SwiftUI

/// Cleaner-side browse of open jobs, with accept (FIRST_COME) or apply (CUSTOMER_SELECTS).
struct OpenJobsView: View {
    @State private var jobs: [Job] = []
    @State private var page = 1
    @State private var hasMore = false
    @State private var isLoading = true
    @State private var errorMessage: String?
    @State private var applyingToJob: Job?

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
                    EmptyStateView(icon: "magnifyingglass",
                                   title: "No open jobs",
                                   message: "New cleaning jobs will show up here. Check back soon.")
                } else {
                    List {
                        ForEach(jobs) { job in
                            OpenJobRow(job: job) {
                                await load(reset: true)
                            } onApply: {
                                applyingToJob = job
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
            .navigationTitle("Open Jobs")
            .refreshable { await load(reset: true) }
            .task { await load(reset: true) }
            .sheet(item: $applyingToJob) { job in
                ApplyToJobSheet(job: job) {
                    Task { await load(reset: true) }
                }
            }
        }
    }

    private func load(reset: Bool) async {
        if reset { page = 1 }
        isLoading = true
        errorMessage = nil
        do {
            let result = try await API.openJobs(page: page)
            jobs = result.items
            hasMore = result.hasMore
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    private func loadMore() async {
        page += 1
        if let result = try? await API.openJobs(page: page) {
            jobs.append(contentsOf: result.items)
            hasMore = result.hasMore
        }
    }
}

struct OpenJobRow: View {
    let job: Job
    var onChange: () async -> Void
    var onApply: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(job.title)
                    .font(.headline)
                    .lineLimit(1)
                Spacer()
                StatusBadge(text: job.mode.label,
                            color: job.mode == .firstCome ? .blue : .purple)
            }

            Text(job.description)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .lineLimit(2)

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
                Text("· \(job.estimatedDuration.formatted()) hrs")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                Spacer()
                if job.mode == .firstCome {
                    AsyncButton {
                        try await API.acceptJob(id: job.id)
                        await onChange()
                    } label: {
                        Text("Accept Now")
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.small)
                } else {
                    Button("Apply", action: onApply)
                        .buttonStyle(.bordered)
                        .controlSize(.small)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

struct ApplyToJobSheet: View {
    let job: Job
    var onApplied: () -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var coverLetter = ""
    @State private var proposedPrice = ""
    @State private var errorMessage: String?
    @State private var isSubmitting = false

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    LabeledContent("Job", value: job.title)
                    LabeledContent("Budget", value: job.budgetFormatted)
                }

                Section("Cover letter (optional)") {
                    TextField("Why are you a good fit?", text: $coverLetter, axis: .vertical)
                        .lineLimit(3...6)
                }

                Section("Your price (optional)") {
                    HStack {
                        Text(job.currency).foregroundStyle(.secondary)
                        TextField("Proposed price", text: $proposedPrice)
                            .keyboardType(.decimalPad)
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
                            Text("Send Application").frame(maxWidth: .infinity)
                                .opacity(isSubmitting ? 0 : 1)
                            if isSubmitting { ProgressView() }
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(isSubmitting)
                    .listRowBackground(Color.clear)
                    .listRowInsets(EdgeInsets())
                }
            }
            .navigationTitle("Apply for Job")
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
                try await API.applyToJob(jobId: job.id, body: .init(
                    coverLetter: coverLetter.isEmpty ? nil : coverLetter,
                    proposedPrice: Double(proposedPrice)
                ))
                onApplied()
                dismiss()
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }
}
