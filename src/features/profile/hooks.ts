import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { endpoints } from '../../api/endpoints';
import { getData, patchData, postData } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import type { User, UserPreferences } from '../../types/models';

export interface UpdateProfileInput {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  location?: string;
  profile_photo_url?: string;
}

export interface ChangePasswordInput {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export const profileKeys = {
  preferences: ['users', 'me', 'preferences'] as const,
};

/** Update my profile and sync the session store. */
export function useUpdateProfile() {
  const setSession = useAuthStore(state => state.setSession);
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => patchData<User>(endpoints.users.me, input),
    onSuccess: user => setSession(user),
  });
}

export function usePreferences() {
  return useQuery({
    queryKey: profileKeys.preferences,
    queryFn: () => getData<UserPreferences>(endpoints.users.preferences),
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UserPreferences) =>
      patchData<UserPreferences>(endpoints.users.preferences, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.preferences }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) =>
      postData<unknown>(endpoints.auth.changePassword, input),
  });
}

/** Deactivate my account (requires current password), then end the session. */
export function useDeactivateAccount() {
  const clearSession = useAuthStore(state => state.clearSession);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { password: string; reason?: string }) =>
      postData<unknown>(endpoints.users.deactivate, input),
    onSuccess: async () => {
      await clearSession();
      queryClient.clear();
    },
  });
}
