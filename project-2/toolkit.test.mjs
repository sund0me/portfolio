import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, isAcceptablePassword } from './password.ts';
import { normalizeEmail } from './email.ts';
import { bodyOf, stringField, isUuid } from './validate.ts';

test('email normalization rejects path delimiters and control characters', () => {
  assert.equal(normalizeEmail('  USER@example.invalid '), 'user@example.invalid');
  for (const input of [null, '', 'not-an-email', 'user/path@example.invalid',
    'user?query@example.invalid', 'user%2f@example.invalid', 'user\n@example.invalid']) {
    assert.equal(normalizeEmail(input), null);
  }
});

test('request validation rejects arrays, non-string fields and malformed UUIDs', () => {
  assert.deepEqual(bodyOf(null), {});
  assert.deepEqual(bodyOf([]), {});
  assert.equal(stringField({ count: 3 }, 'count'), null);
  assert.equal(stringField({ label: 'demo' }, 'label'), 'demo');
  assert.equal(isUuid('00000000-0000-0000-0000-000000000000'), true);
  assert.equal(isUuid('not-a-uuid'), false);
});

test('password hashing uses independent salts and rejects incorrect input', async () => {
  const demoPassword = 'synthetic test phrase';
  const first = await hashPassword(demoPassword);
  const second = await hashPassword(demoPassword);
  assert.notEqual(first, second);
  assert.equal(first.includes(demoPassword), false);
  assert.equal(await verifyPassword(demoPassword, first), true);
  assert.equal(await verifyPassword('incorrect demo phrase', first), false);
  for (const value of ['', 'broken', 'scrypt$0$8$2$bad$bad']) {
    assert.equal(await verifyPassword(demoPassword, value), false);
  }
  assert.equal(isAcceptablePassword('short'), false);
  assert.equal(isAcceptablePassword(null), false);
  assert.equal(isAcceptablePassword('a'.repeat(1025)), false);
});

test('equivalent Unicode forms verify against the same password hash', async () => {
  const composed = 'synthetic-ñ-phrase';
  const hash = await hashPassword(composed);
  assert.equal(await verifyPassword(composed.normalize('NFD'), hash), true);
});
