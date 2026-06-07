const express = require('express');
const router = express.Router();
const {
  createReview,
  getDriverReviews,
  getMyReviews,
  getReviewByRide,
  deleteReview,
} = require('../controllers/reviewController');
const {
  protect,
  riderOnly,
  adminOnly,
} = require('../middleware/authMiddleware');

router.post('/', protect, riderOnly, createReview);
router.get('/my', protect, riderOnly, getMyReviews);
router.get('/ride/:rideId', protect, getReviewByRide);
router.get('/driver/:driverId', getDriverReviews);
router.delete('/:id', protect, adminOnly, deleteReview);

module.exports = router;