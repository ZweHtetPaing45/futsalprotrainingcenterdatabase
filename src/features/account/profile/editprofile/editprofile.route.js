const router = require('express').Router();
const controller = require('./editprofile.controller');
const auth = require('../../../../middlewares/auth.middleware');
const upload = require('../../../../middlewares/multer');
const {createValidate,updateProfileSchema} = require('../../../../middlewares/createUserValidation');

router.put('/update',auth.authMiddle,upload.single('image'), createValidate(updateProfileSchema), controller.editProfile);

module.exports = router;