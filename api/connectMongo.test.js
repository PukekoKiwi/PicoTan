import test from 'node:test';
import assert from 'node:assert/strict';

// Import the module under test
import connectMongo from './connectMongo.js';

test('connectMongo throws when MONGODB_URI is not defined', async () => {
  const originalUri = process.env.MONGODB_URI;
  delete process.env.MONGODB_URI;

  await assert.rejects(connectMongo, /MONGODB_URI is not defined/);

  if (originalUri) {
    process.env.MONGODB_URI = originalUri;
  }
});

