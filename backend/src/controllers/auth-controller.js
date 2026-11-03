const { authRequest } = require('../services/supabase-auth-service');
const { ensureProfile } = require('../services/profile-service');
const { setSessionCookies, clearSessionCookies } = require('../services/session-service');
const validEmail = (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
async function register(req, res) {
  const { name, email, password, role } = req.body || {};
  if (typeof name !== 'string' || name.trim().length < 2 || !validEmail(email) || typeof password !== 'string' || password.length < 8 || (role && !['owner','renter'].includes(role))) return res.status(400).json({ error: 'Informe nome, e-mail válido e senha com ao menos 8 caracteres.', code: 'VALIDATION_ERROR' });
  const data = await authRequest('signup', 'POST', { email, password, data: { full_name: name.trim(), role: role || 'owner' } });
  if (data.user) await ensureProfile(data.user, name.trim());
  if (data.session?.access_token) setSessionCookies(res,data.session);
  res.status(201).json({ user: data.user ? { id: data.user.id, email: data.user.email, name: name.trim() } : undefined, confirmationRequired: !data.session?.access_token, message: data.session?.access_token ? 'Conta criada.' : 'Verifique seu e-mail para confirmar a conta.' });
}
async function login(req, res) {
  const { email, password } = req.body || {};
  if (!validEmail(email) || typeof password !== 'string' || !password) return res.status(400).json({ error: 'Informe e-mail e senha válidos.', code: 'VALIDATION_ERROR' });
  const data = await authRequest('token?grant_type=password', 'POST', { email, password });
  const profile = await ensureProfile(data.user);
  setSessionCookies(res,data);
  res.json({ user: profile });
}
async function logout(req, res) {
  const token = req.cookies?.movix_session;
  if (token) { try { await authRequest('logout', 'POST', {}, token); } catch (err) { if (err.status !== 401) throw err; } }
  clearSessionCookies(res);
  res.json({ message: 'Sessão encerrada.' });
}
async function recover(req, res) {
  if (!validEmail(req.body?.email)) return res.status(400).json({ error: 'Informe um e-mail válido.', code: 'VALIDATION_ERROR' });
  await authRequest('recover', 'POST', { email: req.body.email, redirect_to: `${process.env.ALLOWED_ORIGIN || 'http://localhost:3000'}/?flow=reset-password` });
  res.json({ message: 'Se o endereço estiver cadastrado, você receberá instruções para redefinir a senha.' });
}
async function recoverySession(req,res){
  const {access_token,refresh_token}=req.body||{};
  if(typeof access_token!=='string'||typeof refresh_token!=='string')return res.status(400).json({error:'Link de recuperação inválido ou expirado.',code:'VALIDATION_ERROR'});
  const user=await authRequest('user','GET',null,access_token);
  await ensureProfile(user);
  setSessionCookies(res,{access_token,refresh_token});
  res.json({message:'Link confirmado. Defina sua nova senha.'});
}
async function session(req, res) { res.json({ user: req.user?.profile || null }); }
async function changePassword(req, res) {
  if (typeof req.body?.password !== 'string' || req.body.password.length < 8) return res.status(400).json({ error: 'A nova senha deve ter ao menos 8 caracteres.', code: 'VALIDATION_ERROR' });
  const token = req.cookies?.movix_session;
  const data = await authRequest('user', 'PUT', { password: req.body.password }, token);
  res.json({ message: 'Senha alterada.', user: { id: data.id, email: data.email } });
}
module.exports = { register, login, logout, recover, recoverySession, session, changePassword };
