import SwiftUI

struct CleanerTabView: View {
    @Environment(SessionStore.self) private var session
    @State private var unreadCount = 0

    var body: some View {
        Group {
            switch session.cleanerProfile?.status {
            case .approved:
                approvedTabs
            case .pending:
                CleanerStatusScreen(
                    icon: "hourglass",
                    title: "Application Under Review",
                    message: "Thanks for applying! Our team is reviewing your profile. You'll be able to accept jobs once you're approved.",
                    color: .orange
                )
            case .suspended:
                CleanerStatusScreen(
                    icon: "pause.circle",
                    title: "Account Suspended",
                    message: "Your cleaner account is currently suspended. Contact support for more information.",
                    color: .red
                )
            case .rejected:
                CleanerStatusScreen(
                    icon: "xmark.circle",
                    title: "Application Rejected",
                    message: session.cleanerProfile?.rejectionReason?.value
                        ?? "Unfortunately your application was not approved. Contact support for details.",
                    color: .red
                )
            case nil:
                CleanerStatusScreen(
                    icon: "questionmark.circle",
                    title: "Profile Not Found",
                    message: "We couldn't load your cleaner profile. Pull to refresh or try again later.",
                    color: .gray
                )
            }
        }
        .task {
            if session.cleanerProfile == nil {
                await session.refreshCleanerProfile()
            }
        }
    }

    private var approvedTabs: some View {
        TabView {
            OpenJobsView()
                .tabItem { Label("Open Jobs", systemImage: "magnifyingglass") }

            CleanerJobsView()
                .tabItem { Label("My Jobs", systemImage: "briefcase") }

            CleanerRequestsView()
                .tabItem { Label("Requests", systemImage: "tray.and.arrow.down") }

            MyListingsView()
                .tabItem { Label("Listings", systemImage: "sparkles") }

            ProfileView()
                .tabItem { Label("Profile", systemImage: "person.crop.circle") }
        }
    }
}

struct CleanerStatusScreen: View {
    @Environment(SessionStore.self) private var session

    let icon: String
    let title: String
    let message: String
    let color: Color

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    Image(systemName: icon)
                        .font(.system(size: 56))
                        .foregroundStyle(color)
                        .padding(.top, 80)

                    Text(title)
                        .font(.title2.bold())

                    Text(message)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)

                    Button("Log Out") {
                        Task { await session.logout() }
                    }
                    .buttonStyle(.bordered)
                    .padding(.top, 12)
                }
                .frame(maxWidth: .infinity)
            }
            .refreshable {
                await session.refreshCleanerProfile()
                await session.refreshUser()
            }
            .navigationTitle("CleanSwift")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}
