import * as Keychain from 'react-native-keychain';

import type { AuthTokens } from '../types/models';

const SERVICE = 'com.cleanswift.app.tokens';

/** Secure token persistence backed by iOS Keychain / Android Keystore. */
export const tokenStorage = {
  async save(tokens: AuthTokens): Promise<void> {
    await Keychain.setGenericPassword('tokens', JSON.stringify(tokens), {
      service: SERVICE,
    });
  },

  async load(): Promise<AuthTokens | null> {
    const credentials = await Keychain.getGenericPassword({ service: SERVICE });
    if (!credentials) {
      return null;
    }
    try {
      return JSON.parse(credentials.password) as AuthTokens;
    } catch {
      return null;
    }
  },

  async clear(): Promise<void> {
    await Keychain.resetGenericPassword({ service: SERVICE });
  },
};
