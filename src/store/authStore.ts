import { create } from 'zustand';

import { tokenStorage } from '../services/tokenStorage';
import type { CleanerProfile, User } from '../types/models';

export type SessionStatus = 'loading' | 'guest' | 'authenticated';

interface AuthState {
  status: SessionStatus;
  user: User | null;
  /**
   * Cleaner approval profile. Only fetchable for CLEANER-role users
   * (the backend returns 403 for customers).
   */
  cleanerProfile: CleanerProfile | null;

  setSession: (user: User) => void;
  setCleanerProfile: (profile: CleanerProfile | null) => void;
  setGuest: () => void;
  clearSession: () => Promise<void>;
}

/**
 * Client-side session state only — server data (jobs, listings, bookings)
 * lives in React Query, never here.
 */
export const useAuthStore = create<AuthState>()(set => ({
  status: 'loading',
  user: null,
  cleanerProfile: null,

  setSession: user => set({ status: 'authenticated', user }),
  setCleanerProfile: profile => set({ cleanerProfile: profile }),
  setGuest: () => set({ status: 'guest', user: null, cleanerProfile: null }),

  clearSession: async () => {
    await tokenStorage.clear();
    set({ status: 'guest', user: null, cleanerProfile: null });
  },
}));
