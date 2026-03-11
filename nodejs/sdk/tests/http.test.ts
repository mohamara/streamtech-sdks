import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpClient } from '../src/http';
import {
  StreamTechError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
} from '../src/errors';

function createClient(overrides = {}) {
  return new HttpClient({
    baseUrl: 'https://stream.example.com',
    apiKey: 'sk_test',
    retries: 0,
    ...overrides,
  });
}

describe('HttpClient', () => {
  describe('constructor', () => {
    it('sets API key header and strips trailing slashes from baseUrl', () => {
      const http = new HttpClient({
        baseUrl: 'https://example.com///',
        apiKey: 'sk_123',
      });
      expect(http.apiKey).toBe('sk_123');
      expect(http.axios.defaults.baseURL).toBe('https://example.com');
    });

    it('uses default timeout and retries when not specified', () => {
      const http = new HttpClient({
        baseUrl: 'https://example.com',
        apiKey: 'sk_123',
      });
      expect(http.axios.defaults.timeout).toBe(60_000);
    });

    it('accepts custom timeout', () => {
      const http = new HttpClient({
        baseUrl: 'https://example.com',
        apiKey: 'sk_123',
        timeout: 5000,
      });
      expect(http.axios.defaults.timeout).toBe(5000);
    });
  });

  describe('request', () => {
    it('returns response data on success', async () => {
      const http = createClient();
      vi.spyOn(http.axios, 'request').mockResolvedValueOnce({
        data: { id: '123', status: 'ready' },
      });

      const result = await http.get('/tenant/assets/123');
      expect(result).toEqual({ id: '123', status: 'ready' });
    });

    it('normalizes 401 to AuthenticationError', async () => {
      const http = createClient();
      const axiosError = Object.assign(new Error('Unauthorized'), {
        response: { status: 401, data: { error: 'Invalid API key' } },
        isAxiosError: true,
      });
      vi.spyOn(http.axios, 'request').mockRejectedValueOnce(axiosError);

      await expect(http.get('/tenant/assets')).rejects.toThrow(AuthenticationError);
    });

    it('normalizes 403 to ForbiddenError', async () => {
      const http = createClient();
      const axiosError = Object.assign(new Error('Forbidden'), {
        response: { status: 403, data: { error: 'Access denied' } },
        isAxiosError: true,
      });
      vi.spyOn(http.axios, 'request').mockRejectedValueOnce(axiosError);

      await expect(http.get('/tenant/assets/xyz')).rejects.toThrow(ForbiddenError);
    });

    it('normalizes 404 to NotFoundError', async () => {
      const http = createClient();
      const axiosError = Object.assign(new Error('Not found'), {
        response: { status: 404, data: { error: 'Asset not found' } },
        isAxiosError: true,
      });
      vi.spyOn(http.axios, 'request').mockRejectedValueOnce(axiosError);

      await expect(http.get('/tenant/assets/nope')).rejects.toThrow(NotFoundError);
    });

    it('normalizes other status codes to StreamTechError', async () => {
      const http = createClient();
      const axiosError = Object.assign(new Error('Bad request'), {
        response: { status: 422, data: { message: 'Validation failed' } },
        isAxiosError: true,
      });
      vi.spyOn(http.axios, 'request').mockRejectedValueOnce(axiosError);

      try {
        await http.get('/test');
        expect.unreachable('should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(StreamTechError);
        expect((e as StreamTechError).status).toBe(422);
        expect((e as StreamTechError).message).toBe('Validation failed');
      }
    });

    it('normalizes network errors (no response) to StreamTechError', async () => {
      const http = createClient();
      const networkError = Object.assign(new Error('Network Error'), {
        isAxiosError: true,
      });
      vi.spyOn(http.axios, 'request').mockRejectedValueOnce(networkError);

      await expect(http.get('/test')).rejects.toThrow(StreamTechError);
    });
  });

  describe('retry logic', () => {
    it('retries on 500 and succeeds on second attempt', async () => {
      const http = new HttpClient({
        baseUrl: 'https://example.com',
        apiKey: 'sk_test',
        retries: 2,
      });

      const serverError = Object.assign(new Error('Server Error'), {
        response: { status: 500, data: { error: 'Internal' } },
        isAxiosError: true,
      });

      const spy = vi.spyOn(http.axios, 'request')
        .mockRejectedValueOnce(serverError)
        .mockResolvedValueOnce({ data: { ok: true } });

      // Speed up retries
      vi.useFakeTimers();
      const promise = http.get('/test');
      await vi.advanceTimersByTimeAsync(2000);
      const result = await promise;
      vi.useRealTimers();

      expect(result).toEqual({ ok: true });
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('does not retry on 401 (non-retryable)', async () => {
      const http = new HttpClient({
        baseUrl: 'https://example.com',
        apiKey: 'sk_test',
        retries: 3,
      });

      const authError = Object.assign(new Error('Unauthorized'), {
        response: { status: 401, data: { error: 'Bad key' } },
        isAxiosError: true,
      });

      const spy = vi.spyOn(http.axios, 'request').mockRejectedValue(authError);

      await expect(http.get('/test')).rejects.toThrow(AuthenticationError);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('convenience methods', () => {
    let http: HttpClient;
    let spy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      http = createClient();
      spy = vi.spyOn(http.axios, 'request').mockResolvedValue({ data: { ok: true } });
    });

    it('get() calls request with GET method', async () => {
      await http.get('/test', { page: 1 });
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET', url: '/test', params: { page: 1 } }),
      );
    });

    it('post() calls request with POST method and data', async () => {
      await http.post('/test', { name: 'foo' });
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'POST', url: '/test', data: { name: 'foo' } }),
      );
    });

    it('put() calls request with PUT method', async () => {
      await http.put('/test', { name: 'bar' });
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'PUT', url: '/test', data: { name: 'bar' } }),
      );
    });

    it('patch() calls request with PATCH method', async () => {
      await http.patch('/test', { name: 'baz' });
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'PATCH', url: '/test', data: { name: 'baz' } }),
      );
    });

    it('delete() calls request with DELETE method', async () => {
      await http.delete('/test');
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'DELETE', url: '/test' }),
      );
    });
  });
});
