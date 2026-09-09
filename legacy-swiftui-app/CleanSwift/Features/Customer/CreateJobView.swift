import SwiftUI

struct CreateJobView: View {
    var onCreated: () -> Void

    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var description = ""
    @State private var mode: JobMode = .firstCome
    @State private var propertyType: PropertyType = .apartment
    @State private var address = ""
    @State private var scheduledDate = Date().addingTimeInterval(24 * 3600)
    @State private var estimatedDuration = 2.0
    @State private var budget = ""
    @State private var requirements = ""
    @State private var errorMessage: String?
    @State private var isSubmitting = false

    private var isValid: Bool {
        !title.isEmpty && !description.isEmpty && !address.isEmpty && Double(budget) != nil
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("What do you need?") {
                    TextField("Title (e.g. Deep clean 3-bed apartment)", text: $title)
                    TextField("Describe the work", text: $description, axis: .vertical)
                        .lineLimit(3...6)
                    Picker("Property type", selection: $propertyType) {
                        ForEach(PropertyType.allCases) { type in
                            Label(type.label, systemImage: type.icon).tag(type)
                        }
                    }
                }

                Section {
                    Picker("Hiring mode", selection: $mode) {
                        ForEach(JobMode.allCases) { mode in
                            Text(mode.label).tag(mode)
                        }
                    }
                    .pickerStyle(.segmented)
                } footer: {
                    Text(mode.explanation)
                }

                Section("Where & when") {
                    TextField("Full address", text: $address)
                    DatePicker("Scheduled date", selection: $scheduledDate, in: Date()...)
                    Stepper(value: $estimatedDuration, in: 1...12, step: 0.5) {
                        HStack {
                            Text("Duration")
                            Spacer()
                            Text("\(estimatedDuration.formatted()) hrs")
                                .foregroundStyle(.secondary)
                        }
                    }
                }

                Section("Budget") {
                    HStack {
                        Text("NGN")
                            .foregroundStyle(.secondary)
                        TextField("Amount", text: $budget)
                            .keyboardType(.decimalPad)
                    }
                }

                Section("Special requirements (optional)") {
                    TextField("One per line, e.g. Bring own supplies", text: $requirements, axis: .vertical)
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
                            Text("Post Job").frame(maxWidth: .infinity)
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
            .navigationTitle("Post a Job")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }

    private func submit() {
        guard let budgetValue = Double(budget) else { return }
        isSubmitting = true
        errorMessage = nil
        let requirementLines = requirements
            .split(separator: "\n")
            .map { $0.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty }
        Task {
            defer { isSubmitting = false }
            do {
                _ = try await API.createJob(.init(
                    title: title,
                    description: description,
                    mode: mode,
                    propertyType: propertyType,
                    address: address,
                    scheduledDate: scheduledDate.timeIntervalSince1970,
                    estimatedDuration: estimatedDuration,
                    budget: budgetValue,
                    currency: "NGN",
                    specialRequirements: requirementLines.isEmpty ? nil : requirementLines
                ))
                onCreated()
                dismiss()
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }
}
