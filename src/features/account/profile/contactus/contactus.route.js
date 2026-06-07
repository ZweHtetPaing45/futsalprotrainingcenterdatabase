const router = require('express').Router();
const controller = require('./contactus.controller');

router.get('/showgeneral',controller.showgeneralSetting);

module.exports = router;