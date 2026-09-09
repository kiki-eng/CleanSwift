import type { NavigatorScreenParams } from '@react-navigation/native';

// ---- Auth stack -------------------------------------------------------------

export type AuthStackParamList = {
  Onboarding: undefined;
  ChooseRole: undefined;
  Login: undefined;
  SignUp: { role: 'CUSTOMER' | 'CLEANER' };
};

// ---- Customer tabs ----------------------------------------------------------

export type CustomerTabParamList = {
  CustomerHome: undefined;
  CleanerSearch: undefined;
  CustomerBookings: undefined;
  Profile: undefined;
};

// ---- Cleaner tabs -----------------------------------------------------------

export type CleanerTabParamList = {
  CleanerHome: undefined;
  CleanerJobs: undefined;
  Profile: undefined;
};

// ---- Root stack -------------------------------------------------------------

export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  CustomerTabs: NavigatorScreenParams<CustomerTabParamList>;
  CleanerTabs: NavigatorScreenParams<CleanerTabParamList>;
  // Shared detail/flow screens pushed over either tab navigator:
  CreateRequest: undefined;
  CleanerDetails: { listingId: string };
  BookingDetails: { kind: 'job' | 'listing-request'; id: string };
  Settings: undefined;
};

declare global {
  // Enables type-safe useNavigation() without repeating generics everywhere.
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
