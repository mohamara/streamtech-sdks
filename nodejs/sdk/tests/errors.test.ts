import { describe, it, expect } from 'vitest';
import {
  StreamTechError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../src/errors';

describe('StreamTechError', () => {
  it('stores status, message, and data', () => {
    const err = new StreamTechError({ status: 500, message: 'Server error', data: { detail: 'db down' } });
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('StreamTechError');
    expect(err.status).toBe(500);
    expect(err.message).toBe('Server error');
    expect(err.data).toEqual({ detail: 'db down' });
  });

  it('works without optional data', () => {
    const err = new StreamTechError({ status: 502, message: 'Bad gateway' });
    expect(err.data).toBeUndefined();
  });
});

describe('AuthenticationError', () => {
  it('defaults to 401 with a standard message', () => {
    const err = new AuthenticationError();
    expect(err).toBeInstanceOf(StreamTechError);
    expect(err.name).toBe('AuthenticationError');
    expect(err.status).toBe(401);
    expect(err.message).toBe('Invalid or missing API key');
  });

  it('accepts a custom message', () => {
    const err = new AuthenticationError('Token expired');
    expect(err.message).toBe('Token expired');
    expect(err.status).toBe(401);
  });
});

describe('ForbiddenError', () => {
  it('defaults to 403 with a standard message', () => {
    const err = new ForbiddenError();
    expect(err).toBeInstanceOf(StreamTechError);
    expect(err.name).toBe('ForbiddenError');
    expect(err.status).toBe(403);
  });

  it('accepts a custom message', () => {
    const err = new ForbiddenError('Not your asset');
    expect(err.message).toBe('Not your asset');
  });
});

describe('NotFoundError', () => {
  it('defaults to 404 with a standard message', () => {
    const err = new NotFoundError();
    expect(err).toBeInstanceOf(StreamTechError);
    expect(err.name).toBe('NotFoundError');
    expect(err.status).toBe(404);
    expect(err.message).toBe('Resource not found');
  });
});

describe('ValidationError', () => {
  it('has status 400', () => {
    const err = new ValidationError('title is required');
    expect(err).toBeInstanceOf(StreamTechError);
    expect(err.name).toBe('ValidationError');
    expect(err.status).toBe(400);
    expect(err.message).toBe('title is required');
  });
});

describe('error hierarchy', () => {
  it('all subclasses are instances of StreamTechError and Error', () => {
    const errors = [
      new AuthenticationError(),
      new ForbiddenError(),
      new NotFoundError(),
      new ValidationError('bad'),
    ];
    for (const err of errors) {
      expect(err).toBeInstanceOf(StreamTechError);
      expect(err).toBeInstanceOf(Error);
    }
  });
});
