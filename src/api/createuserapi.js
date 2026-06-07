const routes = require('.././features/account/auth/auth.route');
const router = require('express').Router();
const myprofile = require('../features/account/profile/myprofile/myprofile.route');
const editRoutes = require('../features/account/profile/editprofile/editprofile.route');
const changePassword = require('../features/account/profile/settings&preferences/changepassword/changepassword.route');
const tagShowProductRouter = require('../features/home/tagsShowProduct/tagshowProduct.route');
const categoryShowRouter = require('../features/home/CategoryShow/categoryShow.route');
const cartOrderRouter = require('../features/cart/cart.route');
const canteenRouter = require('../features/services/canteen/canteen.route');
const rentalRouter = require('../features/services/rentals/rental.route');
const trainingRouter = require('../features/services/training/training.route');
const contactusRouter = require('../features/account/profile/contactus/contactus.route');

router.use('/auth',routes);
router.use('/myprofile',myprofile);
router.use('/editProfiled',editRoutes);
router.use('/changepassword',changePassword);
router.use('/homeshow',tagShowProductRouter);
router.use('/homecategory',categoryShowRouter);
router.use('/cart',cartOrderRouter);
router.use('/canteen',canteenRouter);
router.use('/rental',rentalRouter);
router.use('/training',trainingRouter);
router.use('/contactus',contactusRouter);


module.exports = router;