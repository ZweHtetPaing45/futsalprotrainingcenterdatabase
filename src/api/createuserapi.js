const routes = require('.././features/account/auth/auth.route');
const router = require('express').Router();
const myprofile = require('../features/account/profile/myprofile/myprofile.route');
const editRoutes = require('../features/account/profile/editprofile/editprofile.route');

router.use('/auth',routes);
router.use('/myprofile',myprofile);
router.use('/editProfiled',editRoutes);

module.exports = router;