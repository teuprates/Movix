const { getPool } = require('../config/database');
const { authRequest } = require('../services/supabase-auth-service');
const { setSessionCookies } = require('../services/session-service');

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.movix_session;
    if (!token || !process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) return res.status(401).json({ error: 'Faça login para continuar.', code: 'UNAUTHENTICATED' });
    let user;
    try { user = await authRequest('user','GET',null,token); }
    catch(err) {
      if(err.status!==401||!req.cookies?.movix_refresh) return res.status(401).json({error:'Sessão inválida ou expirada.',code:'UNAUTHENTICATED'});
      const refreshed=await authRequest('token?grant_type=refresh_token','POST',{refresh_token:req.cookies.movix_refresh});
      setSessionCookies(res,refreshed);user=refreshed.user;
    }
    const { rows } = await getPool().query('select id, full_name, email, phone, avatar_url, role, created_at from profiles where id=$1', [user.id]);
    if (!rows[0]) return res.status(403).json({ error: 'Perfil não encontrado.', code: 'PROFILE_MISSING' });
    if (rows[0].email !== user.email) {
      const synced=await getPool().query('update profiles set email=$2,updated_at=now() where id=$1 returning id,full_name,email,phone,avatar_url,role,created_at',[user.id,user.email]);
      rows[0]=synced.rows[0];
    }
    req.user = { ...user, profile: rows[0] };
    next();
  } catch (err) { next(err); }
}
function requireRole(...roles) { return (req, res, next) => req.user && roles.includes(req.user.profile.role) ? next() : res.status(403).json({ error: 'Acesso não autorizado.', code: 'FORBIDDEN' }); }
module.exports = { requireAuth, requireRole };
