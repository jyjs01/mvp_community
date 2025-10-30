
const BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

export function absUrl(u) {
  if (!u) return '';
  return u.startsWith('http') ? u : `${BASE}${u.startsWith('/') ? '' : '/'}${u}`;
}
