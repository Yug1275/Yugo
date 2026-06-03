# YUGO — API Planning

> Base URL: `https://api.yugo.app/api`
> Auth: JWT Bearer Token (passed via `Authorization: Bearer <token>` header)
> Format: JSON

---

## Auth Routes — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new rider or driver |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/auth/profile` | Private | Get current user's profile |
| PUT | `/api/auth/profile` | Private | Update profile (name, image, phone) |
| POST | `/api/auth/logout` | Private | Invalidate session / clear cookie |

### POST `/api/auth/register`
```json
Request:
{
  "name": "Yug Mehta",
  "email": "yug@example.com",
  "password": "securePassword123",
  "role": "rider"  // or "driver"
}

Response 201:
{
  "success": true,
  "token": "<jwt>",
  "user": { "id", "name", "email", "role" }
}
```

### POST `/api/auth/login`
```json
Request:
{
  "email": "yug@example.com",
  "password": "securePassword123"
}

Response 200:
{
  "success": true,
  "token": "<jwt>",
  "user": { "id", "name", "email", "role" }
}
```

---

## User Routes — `/api/users`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | Get all users (paginated) |
| GET | `/api/users/:id` | Admin / Self | Get user by ID |
| PUT | `/api/users/:id` | Admin | Update user status (activate/deactivate) |
| DELETE | `/api/users/:id` | Admin | Delete user account |
| GET | `/api/users/:id/rides` | Admin / Self | Get ride history for user |

---

## Driver Routes — `/api/drivers`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/drivers/register` | Private (Driver) | Submit driver + vehicle info |
| GET | `/api/drivers` | Admin | Get all drivers (paginated) |
| GET | `/api/drivers/nearby` | Private (Rider) | Get nearby available drivers |
| GET | `/api/drivers/:id` | Private | Get driver profile |
| PUT | `/api/drivers/:id/availability` | Private (Driver) | Toggle online/offline |
| PUT | `/api/drivers/:id/approve` | Admin | Approve driver registration |
| PUT | `/api/drivers/:id/suspend` | Admin | Suspend a driver |
| GET | `/api/drivers/:id/earnings` | Private (Driver) | Get earnings summary |
| GET | `/api/drivers/:id/rides` | Admin / Self | Get ride history for driver |

---

## Ride Routes — `/api/rides`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/rides/estimate` | Private (Rider) | Get fare estimate for a route |
| POST | `/api/rides` | Private (Rider) | Create a ride request |
| GET | `/api/rides` | Admin | Get all rides (paginated, filterable) |
| GET | `/api/rides/:id` | Private | Get ride details |
| PUT | `/api/rides/:id/accept` | Private (Driver) | Accept a ride |
| PUT | `/api/rides/:id/start` | Private (Driver) | Start the ride |
| PUT | `/api/rides/:id/complete` | Private (Driver) | Mark ride as complete |
| PUT | `/api/rides/:id/cancel` | Private | Cancel a ride |
| GET | `/api/rides/search` | Private | Search rides by query / filters |

### POST `/api/rides` (Create Ride)
```json
Request:
{
  "pickup": {
    "address": "PDEU, Gandhinagar",
    "coordinates": { "lat": 23.1559, "lng": 72.6647 }
  },
  "destination": {
    "address": "Ahmedabad Railway Station",
    "coordinates": { "lat": 23.0245, "lng": 72.6044 }
  }
}

Response 201:
{
  "success": true,
  "ride": { "id", "riderId", "pickup", "destination", "fare", "status": "pending" }
}
```

---

## Payment Routes — `/api/payments`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/payments/create-order` | Private (Rider) | Create Razorpay order for a ride |
| POST | `/api/payments/verify` | Private (Rider) | Verify Razorpay payment signature |
| GET | `/api/payments/:rideId` | Private | Get payment details for a ride |
| GET | `/api/payments` | Admin | Get all payments (paginated) |

---

## Review Routes — `/api/reviews`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/reviews` | Private (Rider) | Submit a review for completed ride |
| GET | `/api/reviews/driver/:driverId` | Public | Get all reviews for a driver |

---

## Notification Routes — `/api/notifications`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/notifications` | Private | Get notifications for logged-in user |
| PUT | `/api/notifications/:id/read` | Private | Mark a notification as read |
| PUT | `/api/notifications/read-all` | Private | Mark all notifications as read |

---

## Search Routes — `/api/search`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/search/rides?q=` | Admin / Driver | Search rides by ID, rider name, status |
| GET | `/api/search/drivers?q=` | Admin | Search drivers by name, vehicle, city |
| GET | `/api/search/locations?q=` | Private | Google Places autocomplete proxy |

---

## Standard Response Format

```json
// Success
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}

// Error
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}

// Paginated
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 120,
    "page": 1,
    "limit": 10,
    "pages": 12
  }
}
```

---

## HTTP Status Codes Used

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Not Found |
| 409 | Conflict (e.g. duplicate email) |
| 500 | Internal Server Error |
