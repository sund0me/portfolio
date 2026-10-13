import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
) => Promise<Buffer>;

const N = 2 ** 16;
const R = 8;
const P = 2;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;

const MAX_MEM = 96 * 1024 * 1024;


export const MIN_PASSWORD_LENGTH = 8;

export function isAcceptablePassword(value: unknown): value is string {
  return typeof value === 'string' && value.length >= MIN_PASSWORD_LENGTH && value.length <= 1024;
}

async function derive(password: string, salt: Buffer, keyLength: number): Promise<Buffer> {
  return (await scryptAsync(password.normalize('NFKC'), salt, keyLength, {
    N,
    r: R,
    p: P,
    maxmem: MAX_MEM,
  })) as Buffer;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const hash = await derive(password, salt, KEY_LENGTH);
  return ['scrypt', N, R, P, salt.toString('base64'), hash.toString('base64')].join('$');
}


export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

  const [, rawN, rawR, rawP, rawSalt, rawHash] = parts as [
    string,
    string,
    string,
    string,
    string,
    string,
  ];
  const params = { N: Number(rawN), r: Number(rawR), p: Number(rawP) };
  if (!Object.values(params).every((value) => Number.isInteger(value) && value > 0)) return false;

  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(rawSalt, 'base64');
    expected = Buffer.from(rawHash, 'base64');
  } catch {
    return false;
  }
  if (salt.length === 0 || expected.length === 0) return false;

  let actual: Buffer;
  try {
    actual = (await scryptAsync(password.normalize('NFKC'), salt, expected.length, {
      ...params,
      maxmem: MAX_MEM,
    })) as Buffer;
  } catch {
    return false;
  }

  return timingSafeEqual(actual, expected);
}
