const controller = require('./cart.controller');
const router = require('express').Router();
const upload = require('../../middlewares/multer');
const auth = require('../../middlewares/auth.middleware');

router.post('/order',auth.authMiddle,upload.single('image'),controller.order);
router.get('/orderlist',auth.authMiddle,controller.orderList);
router.get('/showPayment',controller.showPayment);

module.exports = router;