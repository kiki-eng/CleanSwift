/**
 * Environment configuration.
 *
 * Swap `API_BASE_URL` per environment (or wire up react-native-config later
 * for real .env support) — everything else in the app reads from here.
 */
export const env = {
  API_BASE_URL: 'https://the-cleaners-production.up.railway.app/api/v1',
  API_TIMEOUT_MS: 15000,
  DEFAULT_CURRENCY: 'NGN',
  DEFAULT_PAGE_SIZE: 20,
} as const;
