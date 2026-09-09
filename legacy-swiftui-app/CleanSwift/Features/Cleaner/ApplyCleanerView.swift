import SwiftUI

/// Lets a CUSTOMER apply to become a cleaner (KYC / approval pipeline).
struct ApplyCleanerView: View {
    @Environment(SessionStore.self) private var session
    @Environment(\.dismiss) private var dismiss

    @State private var isIndividual = true
    @State private var companyName = ""
    @State private var cleaningExperience = ""
    @State private var hourlyRate = ""
    @State private var serviceAreas = ""
    @State private var specialties = ""
    @State private var errorMessage: String?
    @State private var isSubmitting = false

    private var isValid: Bool {
        isIndividual || !companyName.isEmpty
    }

    var body: some View {
        Form {
            Section("Business type") {
                Picker("I am", selection: $isIndividual) {
                    Text("An individual").tag(true)
                    Text("A cleaning company").tag(false)
                }
                .pickerStyle(.segmented)

                if !isIndividual {
                    TextField("Company name", text: $companyName)
                }
            }

            Section("Experience") {
                TextField("Summarize your cleaning experience", text: $cleaningExperience, axis: .vertical)
                    .lineLimit(3...6)
                HStack {
                    Text("Hourly rate").foregroundStyle(.secondary)
                    TextField("e.g. 25", text: $hourlyRate)
                        .keyboardType(.decimalPad)
                        .multilineTextAlignment(.trailing)
                }
            }

            Section {
                TextField("Service areas (comma separated)", text: $serviceAreas)
                TextField("Specialties (comma separated)", text: $specialties)
            } footer: {
                Text("e.g. Downtown, Westside — Deep Cleaning, Move in/out")
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
                        Text("Submit Application").frame(maxWidth: .infinity)
                            .opacity(isSubmitting ? 0 : 1)
                        if isSubmitting { ProgressView() }
                    }
                }
                .buttonStyle(.borderedProminent)
                .disabled(!isValid || isSubmitting)
                .listRowBackground(Color.clear)
                .listRowInsets(EdgeInsets())
            } footer: {
                Text("Your application will be reviewed by our team. You'll keep full customer access while it's pending.")
            }
        }
        .navigationTitle("Become a Cleaner")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func submit() {
        isSubmitting = true
        errorMessage = nil
        Task {
            defer { isSubmitting = false }
            do {
                let profile = try await API.applyAsCleaner(.init(
                    isIndividual: isIndividual,
                    companyName: isIndividual ? nil : companyName,
                    cleaningExperience: cleaningExperience.isEmpty ? nil : cleaningExperience,
                    hourlyRate: Double(hourlyRate),
                    serviceAreas: splitList(serviceAreas),
                    specialties: splitList(specialties)
                ))
                session.adoptCleanerProfile(profile)
                dismiss()
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }

    private func splitList(_ text: String) -> [String]? {
        let items = text.split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty }
        return items.isEmpty ? nil : items
    }
}
