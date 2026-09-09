import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { endpoints } from '../../api/endpoints';
import { getData } from '../../api/client';
import { tokenStorage } from '../../services/tokenStorage';
import { useAuthStore } from '../../store/authStore';
import type { AuthPayload, CleanerProfile } from '../../types/models';
import {
  authApi,
  LoginInput,
  RegisterCleanerInput,
  RegisterCustomerInput,
} from './authApi';

/**
 * Persist tokens, load the full user + (for cleaners) approval profile,
 * then flip the session store to authenticated.
 */
async function completeAuth(payload: AuthPayload): Promise<void> {
  await tokenStorage.save({
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
  });

  // The register/login payload user can be partial — /auth/me is canonical.
  let user = payload.user;
  try {
    user = await authApi.me();
  } catch {
    // keep payload user
  }

  const { setSession, setCleanerProfile } = useAuthStore.getState();
  if (user.role === 'CLEANER') {
    try {
      setCleanerProfile(await getData<CleanerProfile>(endpoints.cleanerProfiles.me));
    } catch {
      setCleanerProfile(null);
    }
  }
  setSession(user);
}

/** App-boot session restore: called once from the Splash screen. */
export function useBootstrapSession(): () => Promise<void> {
  return useCallback(async () => {
    const { setSession, setCleanerProfile, setGuest } = useAuthStore.getState();
    const tokens = await tokenStorage.load();
    if (!tokens?.access_token) {
      setGuest();
      return;
    }
    try {
      const user = await authApi.me();
      if (user.role === 'CLEANER') {
        try {
          setCleanerProfile(await getData<CleanerProfile>(endpoints.cleanerProfiles.me));
        } catch {
          setCleanerProfile(null);
        }
      }
      setSession(user);
    } catch {
      await tokenStorage.clear();
      setGuest();
    }
  }, []);
}

export function useLogin() {
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: completeAuth,
  });
}

export function useRegisterCustomer() {
  return useMutation({
    mutationFn: (input: RegisterCustomerInput) => authApi.registerCustomer(input),
    onSuccess: completeAuth,
  });
}

export function useRegisterCleaner() {
  return useMutation({
    mutationFn: (input: RegisterCleanerInput) => authApi.registerCleaner(input),
    onSuccess: completeAuth,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: { otp: string; new_password: string }) =>
      authApi.resetPassword(input),
  });
}

/** Verify email with the OTP, then refresh the session user. */
export function useVerifyEmail() {
  return useMutation({
    mutationFn: (otp: string) => authApi.verifyEmail(otp),
    onSuccess: async () => {
      try {
        useAuthStore.getState().setSession(await authApi.me());
      } catch {
        // Session user refresh is best-effort.
      }
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: () => authApi.resendVerification(),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore(state => state.clearSession);

  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } catch {
        // Even if the server call fails, clear locally.
      }
    },
    onSettled: async () => {
      await clearSession();
      queryClient.clear();
    },
  });
}
