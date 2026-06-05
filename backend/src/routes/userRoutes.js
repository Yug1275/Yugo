const express = require('express');
const router = express.Router();
const { getMyRides, addSavedLocation, removeSavedLocation } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/rides', getMyRides);
router.post('/saved-locations', addSavedLocation);
router.delete('/saved-locations/:index', removeSavedLocation);

module.exports = router;