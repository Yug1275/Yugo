# YUGO — Database Design

> Database: MongoDB (via MongoDB Atlas)
> ODM: Mongoose

---

## Entity Relationship Overview

```
User ──────────────────────── Ride (as rider)
Driver ─────────────────────── Ride (as driver)
Driver ──────────────────────── Vehicle (1:1)
Ride ────────────────────────── Payment (1:1)
Ride ────────────────────────── Review (1:1)
User / Driver ───────────────── Notification (1:many)
```

---

## Schema Definitions

### 1. `users` Collection

```js
{
  _id: ObjectId,
  name: String,              // required
  email: String,             // required, unique, lowercase
  password: String,          // required, bcrypt hashed
  role: String,              // enum: ["rider", "driver", "admin"], default: "rider"
  profileImage: String,      // URL or path, optional
  phone: String,             // optional
  savedLocations: [
    {
      label: String,         // e.g. "Home", "Work"
      address: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    }
  ],
  isActive: Boolean,         // default: true
  createdAt: Date,
  updatedAt: Date
}
```

---

### 2. `drivers` Collection

```js
{
  _id: ObjectId,
  userId: ObjectId,          // ref: "User" (required, unique)
  licenseNumber: String,     // required, unique
  rating: Number,            // default: 0, updated after each review
  totalRides: Number,        // default: 0
  totalEarnings: Number,     // default: 0
  availability: Boolean,     // default: false (online/offline toggle)
  isApproved: Boolean,       // admin approval, default: false
  isSuspended: Boolean,      // default: false
  currentLocation: {
    lat: Number,
    lng: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

### 3. `vehicles` Collection

```js
{
  _id: ObjectId,
  driverId: ObjectId,        // ref: "Driver" (required, unique)
  vehicleType: String,       // enum: ["sedan", "suv", "hatchback", "auto"]
  vehicleNumber: String,     // required, unique (e.g. "GJ-01-AB-1234")
  vehicleModel: String,      // e.g. "Maruti Swift"
  vehicleColor: String,
  vehicleYear: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 4. `rides` Collection

```js
{
  _id: ObjectId,
  riderId: ObjectId,         // ref: "User"
  driverId: ObjectId,        // ref: "Driver" (nullable until accepted)
  pickup: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  destination: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  fare: Number,              // estimated fare in INR
  finalFare: Number,         // actual fare after ride
  distanceKm: Number,
  durationMin: Number,
  status: String,            // enum: ["pending","accepted","en_route","started","completed","cancelled"]
  cancelledBy: String,       // enum: ["rider", "driver", "system"], nullable
  cancelReason: String,      // optional
  startTime: Date,           // when ride actually started
  endTime: Date,             // when ride completed
  createdAt: Date,
  updatedAt: Date
}
```

---

### 5. `payments` Collection

```js
{
  _id: ObjectId,
  rideId: ObjectId,          // ref: "Ride", unique
  riderId: ObjectId,         // ref: "User"
  amount: Number,            // in INR
  currency: String,          // default: "INR"
  status: String,            // enum: ["pending", "completed", "failed", "refunded"]
  method: String,            // enum: ["card", "upi", "wallet", "cash"]
  razorpayOrderId: String,   // from Razorpay
  razorpayPaymentId: String, // from Razorpay on success
  razorpaySignature: String, // for verification
  createdAt: Date,
  updatedAt: Date
}
```

---

### 6. `reviews` Collection

```js
{
  _id: ObjectId,
  rideId: ObjectId,          // ref: "Ride", unique
  riderId: ObjectId,         // ref: "User"
  driverId: ObjectId,        // ref: "Driver"
  rating: Number,            // required, min: 1, max: 5
  comment: String,           // optional
  createdAt: Date
}
```

---

### 7. `notifications` Collection

```js
{
  _id: ObjectId,
  userId: ObjectId,          // ref: "User"
  title: String,
  message: String,           // required
  type: String,              // enum: ["ride_update", "payment", "promo", "system"]
  relatedId: ObjectId,       // optional, ref to ride/payment
  read: Boolean,             // default: false
  createdAt: Date
}
```

---

## Indexes

| Collection | Index |
|---|---|
| users | email (unique) |
| drivers | userId (unique), licenseNumber (unique) |
| vehicles | driverId (unique), vehicleNumber (unique) |
| rides | riderId, driverId, status, createdAt |
| payments | rideId (unique), riderId |
| reviews | rideId (unique), driverId |
| notifications | userId, read, createdAt |
