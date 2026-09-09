import SwiftUI

struct WelcomeView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Spacer()

                Image(systemName: "sparkles")
                    .font(.system(size: 64))
                    .foregroundStyle(Theme.accent)

                VStack(spacing: 8) {
                    Text("CleanSwift")
                        .font(.largeTitle.bold())
                    Text("Book trusted cleaners, or find cleaning work near you.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)
                }

                Spacer()

                VStack(spacing: 12) {
                    NavigationLink {
                        RegisterCustomerView()
                    } label: {
                        Text("I need a cleaner")
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 6)
                    }
                    .buttonStyle(.borderedProminent)

                    NavigationLink {
                        RegisterCleanerView()
                    } label: {
                        Text("I want cleaning work")
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 6)
                    }
                    .buttonStyle(.bordered)

                    NavigationLink {
                        LoginView()
                    } label: {
                        Text("Already have an account? **Log in**")
                            .font(.subheadline)
                    }
                    .padding(.top, 8)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 32)
            }
        }
    }
}
