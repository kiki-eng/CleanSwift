import SwiftUI

@main
struct CleanSwiftApp: App {
    @State private var session = SessionStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(session)
                .tint(Theme.accent)
        }
    }
}

enum Theme {
    static let accent = Color(red: 0.10, green: 0.55, blue: 0.45)
}
