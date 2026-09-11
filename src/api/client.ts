import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { env } from '../config/env';
import { tokenStorage } from '../services/tokenStorage';
import { useAuthStore } from '../store/authStore';
import type { AuthTokens } from '../types/models';
import { endpoints } from './endpoints';
import {
  ApiEnvelope,
  ApiError,
  ApiErrorBody,
  Paginated,
  flattenErrorMessage,
  normalizeMeta,
} from './types';

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: env.API_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

// ---- Request: attach access token ------------------------------------------

apiClient.interceptors.request.use(async config => {
  const tokens = await tokenStorage.load();
  if (tokens?.access_token) {
    config.headers.Authorization = `Bearer ${tokens.access_token}`;
  }
  return config;
});

// ---- Response: normalize errors, refresh-and-retry on 401 ------------------

/** Single-flight refresh so parallel 401s trigger only one refresh call. */
let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const tokens = await tokenStorage.load();
  if (!tokens?.refresh_token) {
    return false;
  }
  try {
    const response = await axios.post<ApiEnvelope<AuthTokens>>(
      `${env.API_BASE_URL}${endpoints.auth.refresh}`,
      { refresh_token: tokens.refresh_token },
      { timeout: env.API_TIMEOUT_MS },
    );
    const next = response.data.data;
    if (!next?.access_token) {
      return false;
    }
    await tokenStorage.save({
      access_token: next.access_token,
      // Refresh responses may omit the refresh token; keep the current one.
      refresh_token: next.refresh_token ?? tokens.refresh_token,
    });
    return true;
  } catch {
    return false;
  }
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const config = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    const isAuthPath = config?.url?.startsWith('/auth/') ?? false;

    if (status === 401 && config && !config._retried && !isAuthPath) {
      refreshPromise = refreshPromise ?? refreshTokens();
      const refreshed = await refreshPromise;
      refreshPromise = null;

      if (refreshed) {
        config._retried = true;
        return apiClient(config);
      }
      await useAuthStore.getState().clearSession();
    }

    const message =
      flattenErrorMessage(error.response?.data?.message) ??
      flattenErrorMessage(error.response?.data?.error?.message) ??
      (error.code === 'ECONNABORTED'
        ? 'Request timed out — please try again.'
        : 'Network error — check your connection and try again.');

    throw new ApiError(status ?? 0, message);
  },
);

// ---- Typed helpers ----------------------------------------------------------

export async function getData<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<ApiEnvelope<T>>(url, { params });
  return response.data.data;
}

export async function getPaginated<T>(
  url: string,
  page: number,
  params?: Record<string, unknown>,
): Promise<Paginated<T>> {
  const response = await apiClient.get<ApiEnvelope<T[]>>(url, {
    params: { page, limit: env.DEFAULT_PAGE_SIZE, ...params },
  });
  const meta = normalizeMeta(response.data.meta);
  return {
    items: response.data.data ?? [],
    meta,
    hasMore: meta ? meta.currentPage < meta.totalPages : false,
  };
}

export async function postData<T>(url: string, body?: unknown): Promise<T> {
  const response = await apiClient.post<ApiEnvelope<T>>(url, body);
  return response.data.data;
}

export async function patchData<T>(url: string, body?: unknown): Promise<T> {
  const response = await apiClient.patch<ApiEnvelope<T>>(url, body);
  return response.data.data;
}

export async function deleteData(url: string): Promise<void> {
  await apiClient.delete(url);
}

export interface UploadableFile {
  uri: string;
  name: string;
  type: string;
}

/** Multipart upload. The backend returns the public URL to store on the record. */
export async function uploadFile(url: string, file: UploadableFile): Promise<{ url: string }> {
  const formData = new FormData();
  // React Native's FormData accepts this shape for file parts; the DOM lib types don't model it.
  formData.append('file', file as unknown as Blob);
  const response = await apiClient.post<ApiEnvelope<{ url: string }>>(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}
