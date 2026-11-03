const { getPool } = require('../config/database');
async function checkDatabase() { const { rows } = await getPool().query('select now() as database_time'); return rows[0]; }
module.exports = { checkDatabase };
