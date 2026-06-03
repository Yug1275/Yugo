# YUGO — Project Vision Document

> *Move smarter. Arrive better.*

---

## Problem Statement

Urban commuters in tier-1 and tier-2 cities struggle with unreliable, unsafe, and expensive ride-hailing options. Existing platforms suffer from:

- **Surge pricing** with no transparency
- **Driver accountability gaps** — no structured rating or verification flow
- **No real-time visibility** into driver location before pickup confirmation
- **Poor admin tooling** — fleet managers and platform admins cannot act on live data
- **Fragmented payments** — cash-only drivers, refund delays, no unified transaction history

YUGO solves this by building a full-stack ride-hailing platform that is transparent, real-time, and built for all three stakeholders: **riders**, **drivers**, and **admins**.

---

## Target Users

### 🧑 Riders
- Age: 18–45
- Urban / semi-urban professionals and students
- Need: Reliable, affordable, trackable rides
- Device: Mobile-first (PWA / React Native)

### 🚗 Drivers
- Age: 21–55
- Individual vehicle owners seeking income
- Need: Transparent earnings, clear ride queue, navigation support
- Device: Mobile browser or native app

### 🛡️ Admins
- Platform operators, fleet managers, business analysts
- Need: Real-time analytics, user/driver management, revenue reporting
- Device: Desktop dashboard

---

## Core Features

### Rider Features
| Feature | Description |
|---|---|
| Registration / Login | Email + password with JWT auth |
| Book a Ride | Pickup + destination with fare estimate |
| Real-Time Tracking | Live driver location on map |
| Ride History | Past rides with receipts |
| Payments | Razorpay integration |
| Reviews | Rate driver post-ride |
| Saved Locations | Home, Work, Favourites |

### Driver Features
| Feature | Description |
|---|---|
| Driver Registration | With vehicle upload and license verification |
| Accept / Reject Rides | Real-time ride request notifications |
| Navigation | Directions API integration |
| Earnings Dashboard | Daily / weekly / monthly breakdown |
| Availability Toggle | Online / Offline status |

### Admin Features
| Feature | Description |
|---|---|
| User Management | View, activate, deactivate riders |
| Driver Management | Approve, suspend, track drivers |
| Ride Analytics | Booking trends, cancellation rates |
| Revenue Analytics | Payments, commissions, daily revenue |
| Historical Reports | Exportable ride & financial records |

---

## Future Scope

- **AI-powered fare prediction** using route + time-of-day ML model
- **Multi-city expansion** with city-specific surge pricing rules
- **Driver gamification** — badges, streaks, performance bonuses
- **Scheduled rides** — book rides up to 24 hours in advance
- **SOS button** — emergency alert with live location sharing
- **Corporate accounts** — B2B ride management for companies
- **EV fleet support** — range-aware routing for electric vehicles
- **In-app chat** between rider and driver

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + Redux Toolkit + TailwindCSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Real-Time | Socket.IO |
| Maps | Google Maps API + Places API + Directions API |
| Payments | Razorpay |
| Auth | JWT + bcrypt |
| Deployment | Vercel (frontend) + Render (backend) + MongoDB Atlas |
