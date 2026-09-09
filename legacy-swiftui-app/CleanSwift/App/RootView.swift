import SwiftUI

struct RootView: View {
    @Environment(SessionStore.self) private var session

    var body: some View {
        Group {
            switch session.state {
            case .loading:
                ProgressView("Loading…")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            case .loggedOut:
                WelcomeView()
            case .loggedIn(let user):
                switch user.role {
                case .cleaner:
                    CleanerTabView()
                case .customer, .admin:
                    CustomerTabView()
                }
            }
        }
        .task { await session.bootstrap() }
        .animation(.default, value: session.stateKey)
    }
}
