# CleanSwift

Native iOS app (SwiftUI) for **The Cleaners** — a two-way cleaning marketplace:

- **Customers** post jobs or book cleaners directly from their public listings.
- **Cleaners** browse open jobs, apply or accept instantly, and manage their own service listings.

Backend: `https://the-cleaners-production.up.railway.app/api/v1` ([Swagger docs](https://the-cleaners-production.up.railway.app/api/docs)).

## Requirements

- Xcode 16+ (built and tested with Xcode 26)
- iOS 17.0+ deployment target
- [XcodeGen](https://github.com/yonaskolb/XcodeGen) (`brew install xcodegen`) — only needed to regenerate the project file

No third-party dependencies; everything uses Foundation, SwiftUI, and Security (Keychain).

## Getting started

```bash
xcodegen generate   # regenerates CleanSwift.xcodeproj from project.yml
open CleanSwift.xcodeproj
```

Then build & run on any iOS 17+ simulator.

## Architecture

```
CleanSwift/
├── App/              App entry + root routing (auth state → role-based tabs)
├── Core/
│   ├── APIClient.swift    URLSession client: envelope decoding, pagination, auto token refresh
│   ├── API.swift          Typed wrappers for every backend endpoint used
│   ├── SessionStore.swift @Observable auth/session state (user, cleaner profile, tokens)
│   └── KeychainHelper.swift
├── Models/           Codable models + all backend enums (statuses, modes, types)
└── Features/
    ├── Auth/         Welcome, login, register (customer & cleaner)
    ├── Customer/     My jobs, create job, job detail + applications, browse/book listings, my requests
    ├── Cleaner/      Open jobs (accept/apply), assigned jobs (start/complete),
    │                 booking requests (accept/reject/start/complete), listings CRUD, KYC apply
    ├── Notifications/ In-app notification feed with unread badge
    ├── Profile/      Profile, cleaner stats, "become a cleaner" entry point
    └── Shared/       Reusable components (badges, ratings, review sheet, async buttons)
```

### Key behaviors

- **JWT auth**: tokens stored in Keychain; a 401 triggers one automatic refresh + retry, then logs out if the refresh fails.
- **Response envelope**: all endpoints return `{ success, data, meta, message }`; `meta` pagination values are tolerated as strings or numbers.
- **Role routing**: `RootView` shows customer tabs or cleaner tabs based on `role`. Cleaners with a `PENDING` / `REJECTED` / `SUSPENDED` profile see a gated status screen instead of the work tabs.
- **Job modes**: `FIRST_COME` jobs show an instant "Accept Now" button; `CUSTOMER_SELECTS` jobs use the apply → customer-reviews-applications flow.
- **Customers becoming cleaners**: apply from the Profile tab; note the backend returns 403 on `/cleaner-profiles/me` for customers, so pending status is kept from the apply response.

## Not yet implemented

- Push notifications (FCM device-token registration — the API wrapper exists in `API.swift`, but Firebase isn't wired up)
- Social sign-in (Google/Apple), email verification, password reset
- File/image uploads (listing photos, avatars)
