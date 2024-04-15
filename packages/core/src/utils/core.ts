import { randomBytes } from 'crypto';

export function generateUUID(): string {
  return (([1e7] as any) + -1e3 + -4e3 + -8e3 + -1e11).replace(
    /[018]/g,
    (c: any) => (c ^ (randomBytes(1)[0] & (15 >> (c / 4)))).toString(16),
  );
}

export function checkApiKey(_evt: any) {
  const apiKey = process.env.API_KEY!;
  if (_evt.headers['x-api-key'] !== apiKey) {
    throw new Error('Unauthorized');
  }
}
