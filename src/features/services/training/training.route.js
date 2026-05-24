const router = require('express').Router();
const controller = require('./training.controller');
const upload = require('../../../middlewares/multer');

//Post Method
router.post('/addtraining',upload.single('payment_image'),controller.TrainingStudent);
router.get('/showtraining',controller.ShowTraining);

module.exports = router;