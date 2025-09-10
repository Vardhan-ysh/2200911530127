export function isValidShortcode(code: string): boolean {
  return /^[a-zA-Z0-9]{4,32}$/.test(code);
}

export function generateShortcode(len = 7): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
