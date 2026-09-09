import SwiftUI

struct RegisterCustomerView: View {
    @Environment(SessionStore.self) private var session

    @State private var firstName = ""
    @State private var lastName = ""
    @State private var email = ""
    @State private var password = ""
    @State private var phoneNumber = ""
    @State private var location = ""
    @State private var errorMessage: String?
    @State private var isLoading = false

    private var isValid: Bool {
        !firstName.isEmpty && !lastName.isEmpty && !email.isEmpty && password.count >= 8
    }

    var body: some View {
        Form {
            Section("Your details") {
                TextField("First name", text: $firstName)
                    .textContentType(.givenName)
                TextField("Last name", text: $lastName)
                    .textContentType(.familyName)
                TextField("Email", text: $email)
                    .keyboardType(.emailAddress)
                    .textContentType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                SecureField("Password (min 8 characters)", text: $password)
                    .textContentType(.newPassword)
            }

            Section("Optional") {
                TextField("Phone number", text: $phoneNumber)
                    .keyboardType(.phonePad)
                TextField("Location / city", text: $location)
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
                        Text("Create Account").frame(maxWidth: .infinity)
                            .opacity(isLoading ? 0 : 1)
                        if isLoading { ProgressView() }
                    }
                }
                .buttonStyle(.borderedProminent)
                .disabled(!isValid || isLoading)
                .listRowBackground(Color.clear)
                .listRowInsets(EdgeInsets())
            }
        }
        .navigationTitle("Sign Up as Customer")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func submit() {
        isLoading = true
        errorMessage = nil
        Task {
            defer { isLoading = false }
            do {
                try await session.registerCustomer(.init(
                    email: email.trimmingCharacters(in: .whitespaces),
                    password: password,
                    firstName: firstName,
                    lastName: lastName,
                    phoneNumber: phoneNumber.isEmpty ? nil : phoneNumber,
                    location: location.isEmpty ? nil : location
                ))
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }
}
