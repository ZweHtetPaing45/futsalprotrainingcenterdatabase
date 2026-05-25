const router = require('express').Router();
const controller = require('./rental.controller');
const upload = require('../../../middlewares/multer');
const auth = require('../../../middlewares/auth.middleware');

router.post('/addmobilerentalbooking',auth.authMiddle,upload.single('payment_image'),controller.RentalBooking);
router.get('/showvenue',controller.ShowVenue);
router.get('/showcourt/:id',controller.ShowCourt);
router.get('/remainbookingslot/:court_id/:date',controller.RemainBookingTimeSlot);
router.get('/showmobilebooking',auth.authMiddle,controller.ShowMobileBookingData);

module.exports = router;