const controller = require('./cart.controller');
const router = require('express').Router();
const upload = require('../../middlewares/multer');
const auth = require('../../middlewares/auth.middleware');

router.post('/order',auth.authMiddle,upload.single('image'),controller.order);

module.exports = router;