# CleanSwift

Cross-platform mobile app (React Native, bare CLI) for **CleanSwift** — a cleaning-services marketplace in the spirit of TaskRabbit, MVP-focused on cleaning only.

- **Customers** post cleaning requests or book cleaners directly from their listings.
- **Cleaners** build a profile (reviewed/approved), find open jobs nearby, accept or apply, and track earnings.

Backend: existing REST API at `https://the-cleaners-production.up.railway.app/api/v1` ([Swagger](https://the-cleaners-production.up.railway.app/api/docs)) — configured in `src/config/env.ts`.

## Stack

| Concern | Choice |
|---|---|
| Framework | React Native 0.87 (New Architecture / Fabric), bare CLI — no Expo |
| Language | TypeScript (strict, no `any`) |
| Navigation | React Navigation 7 (native-stack + bottom-tabs) |
| Server state | TanStack Query 5 |
| Client state | Zustand (session only — server data never lives here) |
| HTTP | Axios with JWT attach + single-flight 401 refresh-retry interceptors |
| Secure storage | react-native-keychain (iOS Keychain / Android Keystore) |
| Icons | react-native-vector-icons (Ionicons) |

## Getting started

```bash
npm install

# iOS
cd ios && pod install && cd ..
npm run ios

# Android
npm run android
```

## Project structure

```
src/
├── api/          # axios client, endpoint map, envelope types
├── components/   # UI kit: Button, Input, Card, Avatar, Rating, Badge,
│                 #   Empty/Error/Loading states, BottomSheet, Screen,
│                 #   SegmentedControl, ChipGroup, ScheduleSheet, ReviewSheet,
│                 #   RatingInput, NotificationBell
├── config/       # env.ts — per-environment backend URL & tunables
├── features/     # domain logic (React Query hooks + API calls per domain)
│   ├── applications/  auth/  bookings/  cleaners/  dashboard/
│   ├── jobs/  listings/  notifications/  profile/  requests/  reviews/
├── navigation/   # Root / Auth / CustomerTabs / CleanerTabs
├── screens/      # thin screens composed from features + components
│   ├── auth/  customer/  cleaner/  shared/
├── services/     # tokenStorage (keychain)
├── store/        # zustand authStore (session only)
├── theme/        # colors, spacing, radii, shadows, typography
├── types/        # API models, enums, navigation param lists
└── utils/        # formatters (money, dates, names) + pagination helpers
```

## Conventions

- **Screens never call Axios.** They use feature hooks (`useLogin`, `useOpenJobs`, …); hooks call `src/api` helpers.
- **React Query keys** are namespaced per domain (`['jobs','open']`, `['bookings','my-postings']`); mutations invalidate by prefix.
- **The API envelope** `{ success, data, meta, message }` is unwrapped centrally in `src/api/client.ts`; pagination meta values arriving as strings are normalized there too.
- **Backend quirks handled centrally:** `/auth/me` nests the user under `data.user`; `/cleaner-profiles/me` returns 403 for customers; refresh responses may omit the refresh token (the old one is kept).
- **Roles:** registering as a cleaner immediately yields role `CLEANER` with a `PENDING` profile — the cleaner home shows an approval banner and locks job actions until `APPROVED`.

## Features

**Customer:** onboarding, signup/login, password reset, home dashboard, browse/search cleaner
listings, cleaner profile with reviews, direct booking (listing request), post a cleaning job
(first-come or pick-from-applicants), bookings list with status filters, booking details with
cancel/review, applications review + accept, notifications, edit profile, change password,
verify email, notification preferences, account deactivation.

**Cleaner:** signup with application (individual/company), approval-status banner, jobs board
(open / mine / booking requests), accept/apply/start/complete jobs, accept/reject/start/complete
booking requests, listings management (create/edit/pause/delete), earnings from the dashboard
API, notifications, profile/settings.

## Status

All customer and cleaner flows above are wired to the live backend. Not yet implemented:
push-notification delivery (requires an FCM/Firebase setup — the backend's
`/notifications/device-token` endpoints are ready), social sign-in (Google/Apple SDKs), and
file/photo upload for avatars and listing images.

> The earlier native SwiftUI prototype (`legacy-swiftui-app/`) was removed after the React
> Native port reached feature parity; it remains available in git history.
