const router = require('express').Router();
const walkInController = require('./walk_in.controller');
const auth = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/multer');


//Post Method
router.post('/booking',upload.single('payment_image'),auth.authMiddle,walkInController.addbookingWalkIn);

//Get Method
router.get('/court_list',walkInController.allCourtWalkIn);


module.exports = router;