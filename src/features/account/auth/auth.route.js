const router = require('express').Router();
const controller = require('./auth.controller');
const {createUserSchema,createValidate,loginUserSchema} = require('../../../middlewares/createUserValidation');

router.post('/createUser',createValidate(createUserSchema), controller.createUser);
router.post('/login',createValidate(loginUserSchema), controller.loginUser);
router.post('/verifyOtp',controller.verifyOtp);

module.exports = router;