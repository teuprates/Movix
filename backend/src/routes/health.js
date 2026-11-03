const router = require('express').Router();
const wrap = require('../middlewares/async-handler');
const controller = require('../controllers/health-controller');
router.get('/', controller.health);
router.get('/database', wrap(controller.database));
module.exports = router;
