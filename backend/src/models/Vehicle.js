const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'Driver reference is required'],
      unique: true,
    },
    vehicleType: {
      type: String,
      enum: {
        values: ['sedan', 'suv', 'hatchback', 'auto'],
        message: '{VALUE} is not a valid vehicle type',
      },
      required: [true, 'Vehicle type is required'],
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    vehicleModel: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true,
    },
    vehicleColor: {
      type: String,
      trim: true,
      default: null,
    },
    vehicleYear: {
      type: Number,
      min: [2000, 'Vehicle year seems too old'],
      max: [new Date().getFullYear() + 1, 'Vehicle year cannot be in the future'],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;