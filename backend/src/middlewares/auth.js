// Ponto de integração: validar JWT de um provedor de identidade antes de confiar em req.user.
// Esta fundação nega acesso protegido enquanto a autenticação ainda não estiver configurada.
function requireAuth(req, res, next) { return res.status(501).json({ error: 'Autenticação ainda não configurada.', code: 'AUTH_NOT_CONFIGURED' }); }
function requireRole(...roles) { return (req, res, next) => req.user && roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Acesso não autorizado.', code: 'FORBIDDEN' }); }
module.exports = { requireAuth, requireRole };
