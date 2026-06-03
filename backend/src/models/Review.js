const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: [true, 'Ride reference is required'],
      unique: true, // one review per ride
    },
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Rider reference is required'],
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'Driver reference is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── After saving a review, update driver's average rating ────────────────
reviewSchema.post('save', async function () {
  const Driver = require('./Driver');
  const stats = await this.constructor.aggregate([
    { $match: { driverId: this.driverId } },
    {
      $group: {
        _id: '$driverId',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Driver.findByIdAndUpdate(this.driverId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      totalRatings: stats[0].count,
    });
  }
});

// ─── Indexes ──────────────────────────────────────────────────────────────
reviewSchema.index({ rideId: 1 });
reviewSchema.index({ driverId: 1 });
reviewSchema.index({ riderId: 1 });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;