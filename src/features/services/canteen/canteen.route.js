const router = require('express').Router();
const controller = require('./canteen.controller');

router.get('/showmenu',controller.showMenu);

module.exports = router;