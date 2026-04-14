const router = require('express').Router();
const controller = require('./tagshowProduct.controller');


router.get('/home',controller.tagShowProduct);

module.exports = router;