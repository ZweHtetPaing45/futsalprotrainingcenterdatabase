const router = require('express').Router();
const controller = require('./banner.controller');

router.get('/', controller.getBanners);

module.exports = router;
