const router = require('express').Router();
const controller = require('./myprofile.controller');
const auth = require('../../../../middlewares/auth.middleware');

router.get('/showprofile',auth.authMiddle,controller.showprofile);

module.exports = router;