const router = require('express').Router();
const controller = require('./training.controller');
const upload = require('../../../middlewares/multer');
const auth = require('../../../middlewares/auth.middleware');

//Post Method
router.post('/addstudenttraining',auth.authMiddle,upload.single('payment_image'),controller.TrainingStudent);
router.get('/showstudenttraining',auth.authMiddle,controller.ShowStudentTraining);

module.exports = router;