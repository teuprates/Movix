const { Pool } = require('pg');

let pool;
function getPool() {
  if (!process.env.DATABASE_URL) throw Object.assign(new Error('DATABASE_URL não configurada.'), { status: 503 });
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : false, max: 10, idleTimeoutMillis: 30000 });
  return pool;
}
module.exports = { getPool };
