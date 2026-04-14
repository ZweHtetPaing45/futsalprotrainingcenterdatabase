const router = require('express').Router();
const controller = require('./changepassword.controller');
const auth = require('../../../../../middlewares/auth.middleware');

router.post('/password',auth.authMiddle,controller.changePassword);

module.exports = router;