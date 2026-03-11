import type { StreamTechErrorData } from './types';

export class StreamTechError extends Error {
  public readonly status: number;
  public readonly data: unknown;

  constructor({ status, message, data }: StreamTechErrorData) {
    super(message);
    this.name = 'StreamTechError';
    this.status = status;
    this.data = data;
  }
}

export class AuthenticationError extends StreamTechError {
  constructor(message = 'Invalid or missing API key') {
    super({ status: 401, message });
    this.name = 'AuthenticationError';
  }
}

export class ForbiddenError extends StreamTechError {
  constructor(message = 'Access denied — asset belongs to another tenant') {
    super({ status: 403, message });
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends StreamTechError {
  constructor(message = 'Resource not found') {
    super({ status: 404, message });
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends StreamTechError {
  constructor(message: string) {
    super({ status: 400, message });
    this.name = 'ValidationError';
  }
}
