import { describe, it, expect } from 'vitest';
import * as sdk from '../src/index';

describe('barrel exports', () => {
  it('exports StreamTech class', () => {
    expect(sdk.StreamTech).toBeDefined();
    expect(typeof sdk.StreamTech).toBe('function');
  });

  it('exports error classes', () => {
    expect(sdk.StreamTechError).toBeDefined();
    expect(sdk.AuthenticationError).toBeDefined();
    expect(sdk.ForbiddenError).toBeDefined();
    expect(sdk.NotFoundError).toBeDefined();
    expect(sdk.ValidationError).toBeDefined();
  });

  it('can instantiate the client from the barrel export', () => {
    const client = new sdk.StreamTech({
      baseUrl: 'https://example.com',
      apiKey: 'sk_test',
    });
    expect(client).toBeDefined();
    expect(client.assets).toBeDefined();
    expect(client.upload).toBeDefined();
    expect(client.playback).toBeDefined();
    expect(client.bucket).toBeDefined();
    expect(client.backup).toBeDefined();
    expect(client.playlists).toBeDefined();
  });
});
