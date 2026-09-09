import SwiftUI

struct NotificationsView: View {
    @Binding var unreadCount: Int

    @State private var notifications: [AppNotification] = []
    @State private var page = 1
    @State private var hasMore = false
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Group {
                if isLoading && notifications.isEmpty {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let errorMessage, notifications.isEmpty {
                    ErrorBanner(message: errorMessage) {
                        Task { await load(reset: true) }
                    }
                } else if notifications.isEmpty {
                    EmptyStateView(icon: "bell",
                                   title: "No notifications",
                                   message: "Updates about your jobs and requests will show up here.")
                } else {
                    List {
                        ForEach(notifications) { notification in
                            NotificationRow(notification: notification)
                                .contentShape(.rect)
                                .onTapGesture {
                                    guard notification.status == .unread else { return }
                                    Task {
                                        _ = try? await API.markNotificationRead(id: notification.id)
                                        await load(reset: true)
                                        await refreshUnread()
                                    }
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
            .navigationTitle("Notifications")
            .toolbar {
                if unreadCount > 0 {
                    ToolbarItem(placement: .primaryAction) {
                        Button("Read All") {
                            Task {
                                try? await API.markAllNotificationsRead()
                                await load(reset: true)
                                await refreshUnread()
                            }
                        }
                    }
                }
            }
            .refreshable {
                await load(reset: true)
                await refreshUnread()
            }
            .task {
                await load(reset: true)
                await refreshUnread()
            }
        }
    }

    private func load(reset: Bool) async {
        if reset { page = 1 }
        isLoading = true
        errorMessage = nil
        do {
            let result = try await API.notifications(page: page)
            notifications = result.items
            hasMore = result.hasMore
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    private func loadMore() async {
        page += 1
        if let result = try? await API.notifications(page: page) {
            notifications.append(contentsOf: result.items)
            hasMore = result.hasMore
        }
    }

    private func refreshUnread() async {
        unreadCount = (try? await API.unreadCount()) ?? unreadCount
    }
}

struct NotificationRow: View {
    let notification: AppNotification

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            ZStack {
                Circle()
                    .fill(notification.priority.color.opacity(0.15))
                    .frame(width: 40, height: 40)
                Image(systemName: notification.type.icon)
                    .font(.subheadline)
                    .foregroundStyle(notification.priority.color)
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(notification.title)
                        .font(.subheadline.weight(notification.status == .unread ? .bold : .regular))
                    Spacer()
                    if notification.status == .unread {
                        Circle()
                            .fill(Theme.accent)
                            .frame(width: 8, height: 8)
                    }
                }
                Text(notification.message)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineLimit(3)
                Text(notification.createdAtFormatted)
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(.vertical, 4)
    }
}
