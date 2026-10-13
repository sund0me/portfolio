const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const email = raw.trim().toLowerCase();
  if (email.length === 0 || email.length > 254) return null;
  if (CONTROL_CHARS.test(email)) return null;
  if (!/^[^\s@/\\?#%]+@[^\s@/\\?#%]+\.[^\s@/\\?#%]+$/.test(email)) return null;
  return email;
}
