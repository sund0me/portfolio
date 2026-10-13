export function bodyOf(raw: unknown): Record<string, unknown> {
  return typeof raw === 'object' && raw !== null && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
}

export function stringField(body: Record<string, unknown>, key: string): string | null {
  const value = body[key];
  return typeof value === 'string' ? value : null;
}


export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value);
}
