# YUGO — User Flows

---

## 1. Rider Flow

```
[Landing Page]
     │
     ▼
[Register as Rider]
  → Enter name, email, password
  → Account created → JWT issued
     │
     ▼
[Login]
  → Email + password
  → JWT stored in httpOnly cookie
     │
     ▼
[Rider Home / Dashboard]
  → View current / upcoming ride (if any)
  → Quick Book button
     │
     ▼
[Book a Ride]
  → Allow location access → current location auto-filled as pickup
  → Enter destination via search (Places API autocomplete)
  → System estimates fare and shows nearby drivers on map
     │
     ▼
[Select Driver]
  → View available drivers (name, rating, vehicle, ETA)
  → Confirm booking
     │
     ▼
[Ride Tracking]
  → Live driver location updates via Socket.IO
  → Status updates: Pending → Accepted → Driver En Route → Started → Completed
  → Cancel option (before driver arrives)
     │
     ▼
[Payment]
  → Razorpay checkout (card / UPI / wallet)
  → Receipt generated and stored
     │
     ▼
[Rate Driver]
  → Star rating (1–5)
  → Optional written review
  → Redirected to Ride History
```

---

## 2. Driver Flow

```
[Landing Page]
     │
     ▼
[Register as Driver]
  → Enter name, email, password
  → Upload license number and vehicle details
  → Admin review / approval (or auto-approve in MVP)
     │
     ▼
[Login]
  → Same JWT auth flow
     │
     ▼
[Driver Dashboard]
  → Toggle availability (Online / Offline)
  → View earnings summary
  → View past completed rides
     │
     ▼
[Receive Ride Request] ← Socket.IO push notification
  → See pickup location, destination, estimated fare
  → Accept or Reject (timeout: 30 seconds → auto-reject)
     │
     ▼
[Navigate to Rider]
  → Google Maps Directions API
  → Status: "Driver En Route"
     │
     ▼
[Start Ride]
  → Confirm pickup → status becomes "Started"
  → Navigate to destination
     │
     ▼
[Complete Ride]
  → Mark ride as completed
  → Fare credited to earnings
  → Wait for rider rating
```

---

## 3. Admin Flow

```
[Admin Login]
  → Separate admin credentials
  → Role-based JWT (role: "admin")
     │
     ▼
[Admin Dashboard]
  → Overview cards: Total Users, Active Drivers, Rides Today, Revenue Today
     │
     ├── [Manage Users]
     │     → View all riders
     │     → Activate / Deactivate accounts
     │     → View individual ride history
     │
     ├── [Manage Drivers]
     │     → View all drivers (pending / approved / suspended)
     │     → Approve new driver registrations
     │     → Suspend drivers
     │     → View earnings and ride stats
     │
     ├── [View Analytics]
     │     → Ride volume over time (chart)
     │     → Cancellation rate
     │     → Peak hours heatmap
     │     → Driver utilization rate
     │
     └── [Generate Reports]
           → Filter by date range
           → Export ride history as CSV
           → Export revenue report as CSV
```

---

## 4. Ride State Machine

```
         [PENDING]
            │
            │ Driver accepts
            ▼
         [ACCEPTED]
            │
            │ Driver reaches pickup
            ▼
        [EN_ROUTE]  ←── Driver location tracked live
            │
            │ Driver confirms pickup
            ▼
         [STARTED]
            │
            │ Driver reaches destination
            ▼
        [COMPLETED]

  At any state before STARTED:
         → [CANCELLED]  (by rider or driver or timeout)
```
