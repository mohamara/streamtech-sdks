import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import type { StreamTechConfig } from './types';
import {
  StreamTechError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
} from './errors';

const DEFAULT_TIMEOUT = 60_000;
const DEFAULT_RETRIES = 3;
const RETRY_DELAY_BASE = 1000;
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

export class HttpClient {
  public readonly axios: AxiosInstance;
  private readonly retries: number;
  public readonly apiKey: string;

  constructor(config: StreamTechConfig) {
    const baseURL = config.baseUrl.replace(/\/+$/, '');
    this.apiKey = config.apiKey;
    this.retries = config.retries ?? DEFAULT_RETRIES;

    this.axios = axios.create({
      baseURL,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
      headers: {
        'X-API-Key': config.apiKey,
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
  }

  async request<T>(config: AxiosRequestConfig): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const response = await this.axios.request<T>(config);
        return response.data;
      } catch (err) {
        lastError = err as Error;

        if (!this.isRetryable(err as AxiosError, attempt)) {
          break;
        }

        const delay = RETRY_DELAY_BASE * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }

    throw this.normalizeError(lastError!);
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>({ method: 'GET', url, params });
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: Partial<AxiosRequestConfig>,
  ): Promise<T> {
    return this.request<T>({ method: 'POST', url, data, ...config });
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: Partial<AxiosRequestConfig>,
  ): Promise<T> {
    return this.request<T>({ method: 'PUT', url, data, ...config });
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: Partial<AxiosRequestConfig>,
  ): Promise<T> {
    return this.request<T>({ method: 'PATCH', url, data, ...config });
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>({ method: 'DELETE', url });
  }

  private isRetryable(err: AxiosError, attempt: number): boolean {
    if (attempt >= this.retries) return false;
    if (!err.response) return true; // network error
    return RETRYABLE_STATUS.has(err.response.status);
  }

  private normalizeError(err: Error): StreamTechError {
    if (err instanceof StreamTechError) return err;

    const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
    const status = axiosErr.response?.status ?? 0;
    const body = axiosErr.response?.data;
    const message =
      body?.error ?? body?.message ?? axiosErr.message ?? 'Unknown error';

    switch (status) {
      case 401:
        return new AuthenticationError(message);
      case 403:
        return new ForbiddenError(message);
      case 404:
        return new NotFoundError(message);
      default:
        return new StreamTechError({ status, message, data: body });
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
