import { describe, it, expect } from 'vitest';
import { StreamTech } from '../src/client';
import { AssetsResource } from '../src/resources/assets';
import { UploadResource } from '../src/resources/upload';
import { PlaybackResource } from '../src/resources/playback';
import { BucketResource } from '../src/resources/bucket';
import { BackupResource } from '../src/resources/backup';
import { PlaylistsResource } from '../src/resources/playlists';

const validConfig = {
  baseUrl: 'https://stream.example.com',
  apiKey: 'sk_test_key',
};

describe('StreamTech client', () => {
  it('creates an instance with valid config', () => {
    const client = new StreamTech(validConfig);
    expect(client).toBeInstanceOf(StreamTech);
  });

  it('exposes all resource sub-clients', () => {
    const client = new StreamTech(validConfig);
    expect(client.assets).toBeInstanceOf(AssetsResource);
    expect(client.upload).toBeInstanceOf(UploadResource);
    expect(client.playback).toBeInstanceOf(PlaybackResource);
    expect(client.bucket).toBeInstanceOf(BucketResource);
    expect(client.backup).toBeInstanceOf(BackupResource);
    expect(client.playlists).toBeInstanceOf(PlaylistsResource);
  });

  it('throws if baseUrl is missing', () => {
    expect(() => new StreamTech({ baseUrl: '', apiKey: 'sk_test' })).toThrow(
      'baseUrl is required',
    );
  });

  it('throws if apiKey is missing', () => {
    expect(
      () => new StreamTech({ baseUrl: 'https://example.com', apiKey: '' }),
    ).toThrow('apiKey is required');
  });

  it('passes chunkSize to UploadResource', () => {
    const client = new StreamTech({ ...validConfig, chunkSize: 1024 * 1024 });
    expect(client.upload).toBeInstanceOf(UploadResource);
  });
});
