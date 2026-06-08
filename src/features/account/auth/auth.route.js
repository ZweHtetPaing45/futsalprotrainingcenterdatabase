const router = require('express').Router();
const controller = require('./auth.controller');
const {createUserSchema,createValidate,loginUserSchema} = require('../../../middlewares/createUserValidation');

//POST Method
router.post('/createUser',createValidate(createUserSchema), controller.createUser);
router.post('/login',createValidate(loginUserSchema), controller.loginUser);
router.post('/verifyOtp',controller.verifyOtp);
router.post('/forgetpassword',controller.forgetPassword);
router.post('/verifyforgetpassword',controller.verifyOtpForForgetPassword);
router.post('/verify_update_password',controller.VerifyUpdatePassword);


module.exports = router;