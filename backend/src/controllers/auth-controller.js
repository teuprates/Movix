const pending = (req, res) => res.status(501).json({ error: 'Conecte um provedor de identidade para habilitar esta operação.', code: 'AUTH_NOT_CONFIGURED' });
module.exports = { register: pending, login: pending, logout: pending, recover: pending, session: pending };
