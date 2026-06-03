const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  { _id: false }
);

const rideSchema = new mongoose.Schema(
  {
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Rider reference is required'],
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null, // null until a driver accepts
    },
    pickup: {
      type: locationSchema,
      required: [true, 'Pickup location is required'],
    },
    destination: {
      type: locationSchema,
      required: [true, 'Destination is required'],
    },
    fare: {
      type: Number,
      required: [true, 'Estimated fare is required'],
      min: [0, 'Fare cannot be negative'],
    },
    finalFare: {
      type: Number,
      default: null, // set when ride completes
    },
    distanceKm: {
      type: Number,
      default: null,
    },
    durationMin: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'en_route', 'started', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid ride status',
      },
      default: 'pending',
    },
    cancelledBy: {
      type: String,
      enum: ['rider', 'driver', 'system', null],
      default: null,
    },
    cancelReason: {
      type: String,
      default: null,
    },
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────
rideSchema.index({ riderId: 1, createdAt: -1 });
rideSchema.index({ driverId: 1, createdAt: -1 });
rideSchema.index({ status: 1 });
rideSchema.index({ createdAt: -1 });

const Ride = mongoose.model('Ride', rideSchema);
module.exports = Ride;