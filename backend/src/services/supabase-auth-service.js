function config() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) throw Object.assign(new Error('Configure SUPABASE_URL e SUPABASE_ANON_KEY.'), { status: 503 });
  return { url: process.env.SUPABASE_URL.replace(/\/$/, ''), key: process.env.SUPABASE_ANON_KEY };
}
async function authRequest(path, method, body, token) {
  const { url, key } = config();
  const response = await fetch(`${url}/auth/v1/${path}`, { method, headers: { apikey: key, 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.msg || data.message || data.error_description || data.error || 'Falha na autenticação.'), { status: response.status >= 400 && response.status < 500 ? response.status : 502, code: data.code || 'AUTH_ERROR' });
  return data;
}
module.exports = { authRequest };
