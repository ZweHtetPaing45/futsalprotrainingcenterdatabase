const router = require('express').Router();
const controller = require('./categoryShow.controller');
const {showCategoryProduct,createValidate} = require('../../../middlewares/createUserValidation');

// router.get('/allcategory',controller.categoryShow);
// router.get('/category/:name',createValidate(showCategoryProduct),controller.CategoryNameShowProduct);
// router.get('/allbrand',controller.allBandNameProduct);
// router.get('/brand/:name',createValidate(showCategoryProduct),controller.nameBrandShowProduct);
// router.get('/alltag',controller.allTagShowProduct);
// router.get('/tag/:name',createValidate(showCategoryProduct),controller.tagNameProduct);
router.get('/category',controller.allCategory);
router.get('/showproduct',controller.showProduct);
router.get('/allbrand',controller.allBrands);
module.exports = router;