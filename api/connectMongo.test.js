/**
 * connectMongo.test.js
 * --------------------
 * Minimal unit test ensuring that the database connector throws a helpful error
 * when the required `MONGODB_URI` environment variable is missing.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

// Module under test
import connectMongo from './connectMongo.js';

test('connectMongo throws when MONGODB_URI is not defined', async () => {
  const originalUri = process.env.MONGODB_URI;
  delete process.env.MONGODB_URI;

  await assert.rejects(connectMongo, /MONGODB_URI is not defined/);

  if (originalUri) {
    process.env.MONGODB_URI = originalUri;
  }
});

