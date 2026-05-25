const router = require('express').Router();
const controller = require('./rental.controller');
const upload = require('../../../middlewares/multer');

router.post('/addmobilerentalbooking',upload.single('payment_image'),controller.RentalBooking);
router.get('/showvenue',controller.ShowVenue);
router.get('/showcourt/:id',controller.ShowCourt);
router.get('/remainbookingslot/:court_id/:date',controller.RemainBookingTimeSlot);
router.get('/showmobilebooking',controller.ShowMobileBookingData);

module.exports = router;