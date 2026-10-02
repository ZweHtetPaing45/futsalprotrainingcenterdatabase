const router = require('express').Router();
const controller = require('./tbanner.controller');

router.get('/', controller.getTournamentBanners);

module.exports = router;