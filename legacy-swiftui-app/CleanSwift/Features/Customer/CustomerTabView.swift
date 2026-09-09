import SwiftUI

struct CustomerTabView: View {
    @State private var unreadCount = 0

    var body: some View {
        TabView {
            MyJobsView()
                .tabItem { Label("My Jobs", systemImage: "briefcase") }

            BrowseListingsView()
                .tabItem { Label("Find Cleaners", systemImage: "magnifyingglass") }

            MyRequestsView()
                .tabItem { Label("Requests", systemImage: "paperplane") }

            NotificationsView(unreadCount: $unreadCount)
                .tabItem { Label("Alerts", systemImage: "bell") }
                .badge(unreadCount)

            ProfileView()
                .tabItem { Label("Profile", systemImage: "person.crop.circle") }
        }
        .task {
            unreadCount = (try? await API.unreadCount()) ?? 0
        }
    }
}
