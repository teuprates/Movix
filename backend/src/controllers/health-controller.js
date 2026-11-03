const { checkDatabase } = require('../services/health-service');
async function health(req, res) { res.json({ status: 'ok', service: 'movix-api', timestamp: new Date().toISOString() }); }
async function database(req, res) { const result = await checkDatabase(); res.json({ status: 'ok', database: 'connected', ...result }); }
module.exports = { health, database };
