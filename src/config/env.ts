/**
 * Environment configuration.
 *
 * All environment-specific values live here — nothing else in the app should
 * hardcode URLs or tunables. `__DEV__` is set by Metro/React Native at build
 * time, so release builds automatically pick the production config.
 *
 * See `.env.example` at the repo root for the variables each environment needs.
 */

interface EnvConfig {
  /** Backend REST API root (includes the /api/v1 prefix). */
  API_BASE_URL: string;
  API_TIMEOUT_MS: number;
  DEFAULT_CURRENCY: string;
  DEFAULT_PAGE_SIZE: number;
}

const development: EnvConfig = {
  API_BASE_URL: 'https://the-cleaners-production.up.railway.app/api/v1',
  API_TIMEOUT_MS: 15000,
  DEFAULT_CURRENCY: 'NGN',
  DEFAULT_PAGE_SIZE: 20,
};

const production: EnvConfig = {
  API_BASE_URL: 'https://the-cleaners-production.up.railway.app/api/v1',
  API_TIMEOUT_MS: 15000,
  DEFAULT_CURRENCY: 'NGN',
  DEFAULT_PAGE_SIZE: 20,
};

export const env: EnvConfig = __DEV__ ? development : production;
