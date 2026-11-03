const { getPool } = require('../config/database');
async function ensureProfile(user, fullName) {
  const role = user.user_metadata?.role === 'renter' ? 'renter' : 'owner';
  const { rows } = await getPool().query(`insert into profiles(id,full_name,email,role) values($1,$2,$3,$4)
    on conflict(id) do update set email=excluded.email, full_name=case when profiles.full_name='' then excluded.full_name else profiles.full_name end, updated_at=now()
    returning id,full_name,email,phone,avatar_url,role,created_at,updated_at`, [user.id, fullName || user.user_metadata?.full_name || user.email.split('@')[0], user.email, role]);
  return rows[0];
}
async function getProfile(id) { const { rows } = await getPool().query('select id,full_name,email,phone,avatar_url,role,created_at,updated_at from profiles where id=$1', [id]); return rows[0]; }
async function updateProfile(id, { full_name, phone, avatar_url }) {
  const { rows } = await getPool().query(`update profiles set full_name=coalesce($2,full_name), phone=case when $3 then $4 else phone end, avatar_url=case when $5 then $6 else avatar_url end, updated_at=now() where id=$1 returning id,full_name,email,phone,avatar_url,role,created_at,updated_at`, [id, full_name, phone !== undefined, phone ?? null, avatar_url !== undefined, avatar_url ?? null]);
  return rows[0];
}
module.exports = { ensureProfile, getProfile, updateProfile };
