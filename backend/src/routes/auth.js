const router = require('express').Router();
const controller = require('../controllers/auth-controller');
router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.post('/recover', controller.recover);
router.get('/session', controller.session);
module.exports = router;
