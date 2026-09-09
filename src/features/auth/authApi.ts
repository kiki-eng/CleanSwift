import { endpoints } from '../../api/endpoints';
import { getData, postData } from '../../api/client';
import type { AuthPayload, User } from '../../types/models';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterCustomerInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  location?: string;
}

export interface RegisterCleanerInput extends RegisterCustomerInput {
  is_individual: boolean;
  company_name?: string;
  cleaning_experience?: string;
}

export const authApi = {
  login: (input: LoginInput) => postData<AuthPayload>(endpoints.auth.login, input),

  registerCustomer: (input: RegisterCustomerInput) =>
    postData<AuthPayload>(endpoints.auth.registerCustomer, input),

  registerCleaner: (input: RegisterCleanerInput) =>
    postData<AuthPayload>(endpoints.auth.registerCleaner, input),

  /** The backend nests the user: { data: { user: {...} } } */
  me: async (): Promise<User> => {
    const payload = await getData<{ user: User }>(endpoints.auth.me);
    return payload.user;
  },

  logout: () => postData<unknown>(endpoints.auth.logout),

  forgotPassword: (email: string) =>
    postData<unknown>(endpoints.auth.forgotPassword, { email }),

  resetPassword: (input: { otp: string; new_password: string }) =>
    postData<unknown>(endpoints.auth.resetPassword, input),

  verifyEmail: (otp: string) => postData<unknown>(endpoints.auth.verifyEmail, { otp }),

  resendVerification: () => postData<unknown>(endpoints.auth.resendVerification),
};
