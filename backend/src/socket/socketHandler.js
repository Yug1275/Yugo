const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const socketAuthMiddleware = require('./socketMiddleware');
const { sendNotification } = require('../utils/notificationHelper');

// Store connected users: userId → socketId
const connectedUsers = new Map();
// Store connected drivers: driverId → socketId
const connectedDrivers = new Map();

const initSocket = (io) => {
  // Apply auth middleware to all socket connections
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    const userId = socket.userId;
    const role = socket.userRole;

    console.log(`🔌 Socket connected: ${role} | userId: ${userId} | socketId: ${socket.id}`);

    // Store connection
    connectedUsers.set(userId, socket.id);

    // ─── JOIN personal room ───────────────────────────────────────────
    // Every user joins a room named after their userId
    // This lets us emit directly to a specific user
    socket.join(`user:${userId}`);

    // ─── DRIVER: join driver room + store driverId ────────────────────
    socket.on('driver:join', async (data) => {
      try {
        const driver = await Driver.findOne({ userId });
        if (!driver) return;

        const driverId = driver._id.toString();
        connectedDrivers.set(driverId, socket.id);
        socket.driverId = driverId;
        socket.join(`driver:${driverId}`);

        console.log(`🚗 Driver joined: ${driverId}`);

        // Emit confirmation
        socket.emit('driver:joined', { driverId, message: 'Connected to ride network' });
      } catch (err) {
        console.error('driver:join error:', err.message);
      }
    });

    // ─── DRIVER: update live location ─────────────────────────────────
    socket.on('driver:location', async (data) => {
      try {
        const { lat, lng, rideId } = data;
        if (!lat || !lng) return;

        // Update driver location in DB
        await Driver.findOneAndUpdate(
          { userId },
          { currentLocation: { lat: parseFloat(lat), lng: parseFloat(lng) } }
        );

        // If there's an active ride, broadcast location to the rider
        if (rideId) {
          const ride = await Ride.findById(rideId).select('riderId status');
          if (ride && ['accepted', 'en_route', 'started'].includes(ride.status)) {
            // Emit to rider's personal room
            io.to(`user:${ride.riderId.toString()}`).emit('driver:locationUpdate', {
              rideId,
              location: { lat: parseFloat(lat), lng: parseFloat(lng) },
            });
          }
        }
      } catch (err) {
        console.error('driver:location error:', err.message);
      }
    });

    // ─── DRIVER: accept ride ──────────────────────────────────────────
    socket.on('ride:accept', async (data) => {
      try {
        const { rideId } = data;
        const driver = await Driver.findOne({ userId }).populate('userId', 'name phone');
        if (!driver) return;

        const ride = await Ride.findById(rideId);
        if (!ride || ride.status !== 'pending') return;

        ride.driverId = driver._id;
        ride.status = 'accepted';
        await ride.save();

        await Driver.findByIdAndUpdate(driver._id, { availability: false });

        // Notify the rider — socket update + persisted notification
        io.to(`user:${ride.riderId.toString()}`).emit('ride:statusUpdate', {
          rideId,
          status: 'accepted',
          driver: {
            id: driver._id,
            name: driver.userId.name,
            phone: driver.userId.phone,
            rating: driver.rating,
          },
          message: 'Driver accepted your ride!',
        });

        // Save notification to DB
        await sendNotification(
          io,
          ride.riderId.toString(),
          '🚗 Driver is on the way!',
          `${driver.userId.name} accepted your ride and is heading to your pickup.`,
          'ride_update',
          ride._id
        );

        // Confirm to driver
        socket.emit('ride:acceptedConfirm', { rideId, message: 'Ride accepted successfully' });

        // Broadcast to all drivers that this ride is no longer available
        socket.broadcast.emit('ride:takenOff', { rideId });

        console.log(`✅ Ride ${rideId} accepted by driver ${driver._id}`);
      } catch (err) {
        console.error('ride:accept error:', err.message);
      }
    });

    // ─── DRIVER: mark en_route ────────────────────────────────────────
    socket.on('ride:enRoute', async (data) => {
      try {
        const { rideId } = data;
        const ride = await Ride.findById(rideId);
        if (!ride || ride.status !== 'accepted') return;

        ride.status = 'en_route';
        await ride.save();

        io.to(`user:${ride.riderId.toString()}`).emit('ride:statusUpdate', {
          rideId,
          status: 'en_route',
          message: 'Driver is on the way to your pickup!',
        });
      } catch (err) {
        console.error('ride:enRoute error:', err.message);
      }
    });

    // ─── DRIVER: start ride ───────────────────────────────────────────
    socket.on('ride:start', async (data) => {
      try {
        const { rideId } = data;
        const driver = await Driver.findOne({ userId });
        if (!driver) return;

        const ride = await Ride.findById(rideId);
        if (!ride || ride.driverId?.toString() !== driver._id.toString()) return;
        if (!['accepted', 'en_route'].includes(ride.status)) return;

        ride.status = 'started';
        ride.startTime = new Date();
        await ride.save();

        io.to(`user:${ride.riderId.toString()}`).emit('ride:statusUpdate', {
          rideId,
          status: 'started',
          message: "Your ride has started. Enjoy the trip!",
        });

        await sendNotification(
          io,
          ride.riderId.toString(),
          '🛣️ Ride Started!',
          'Your ride has started. Enjoy the trip!',
          'ride_update',
          ride._id
        );

        socket.emit('ride:startConfirm', { rideId });
      } catch (err) {
        console.error('ride:start error:', err.message);
      }
    });

    // ─── DRIVER: complete ride ────────────────────────────────────────
    socket.on('ride:complete', async (data) => {
      try {
        const { rideId } = data;
        const driver = await Driver.findOne({ userId });
        if (!driver) return;

        const ride = await Ride.findById(rideId);
        if (!ride || ride.driverId?.toString() !== driver._id.toString()) return;
        if (ride.status !== 'started') return;

        ride.status = 'completed';
        ride.endTime = new Date();
        ride.finalFare = ride.fare;
        await ride.save();

        // Update driver stats
        await Driver.findByIdAndUpdate(driver._id, {
          $inc: { totalRides: 1, totalEarnings: ride.finalFare },
          availability: true,
        });

        // Notify rider
        io.to(`user:${ride.riderId.toString()}`).emit('ride:statusUpdate', {
          rideId,
          status: 'completed',
          finalFare: ride.finalFare,
          message: 'Ride completed! Please rate your driver.',
        });

        // Persist notification for rider
        await sendNotification(
          io,
          ride.riderId.toString(),
          '✅ Ride Completed!',
          `Your ride is complete. Total fare: ₹${ride.finalFare}. Please rate your driver.`,
          'ride_update',
          ride._id
        );

        // Persist notification for driver
        await sendNotification(
          io,
          userId,
          '💰 Earnings Credited!',
          `Ride completed. ₹${ride.finalFare} has been added to your earnings.`,
          'payment',
          ride._id
        );

        socket.emit('ride:completeConfirm', {
          rideId,
          earnings: ride.finalFare,
          message: 'Ride completed. Earnings credited!',
        });

        console.log(`🏁 Ride ${rideId} completed`);
      } catch (err) {
        console.error('ride:complete error:', err.message);
      }
    });

    // ─── RIDER: cancel ride ───────────────────────────────────────────
    socket.on('ride:cancel', async (data) => {
      try {
        const { rideId, reason } = data;
        const ride = await Ride.findById(rideId);
        if (!ride) return;

        const isRider = ride.riderId.toString() === userId;
        if (!isRider) return;

        const cancellable = ['pending', 'accepted', 'en_route'];
        if (!cancellable.includes(ride.status)) return;

        ride.status = 'cancelled';
        ride.cancelledBy = 'rider';
        ride.cancelReason = reason || 'Cancelled by rider';
        await ride.save();

        // Notify driver if assigned — socket + persisted notification
        if (ride.driverId) {
          const driver = await Driver.findById(ride.driverId);
          if (driver) {
            await Driver.findByIdAndUpdate(driver._id, { availability: true });
            io.to(`user:${driver.userId.toString()}`).emit('ride:cancelled', {
              rideId,
              message: 'Rider cancelled the ride.',
            });
            await sendNotification(
              io,
              driver.userId.toString(),
              '❌ Ride Cancelled',
              'The rider has cancelled this ride.',
              'ride_update',
              ride._id
            );
          }
        }

        socket.emit('ride:cancelConfirm', { rideId });
      } catch (err) {
        console.error('ride:cancel error:', err.message);
      }
    });

    // ─── RIDER: subscribe to ride updates ─────────────────────────────
    socket.on('ride:subscribe', (data) => {
      const { rideId } = data;
      socket.join(`ride:${rideId}`);
      console.log(`👂 User ${userId} subscribed to ride ${rideId}`);
    });

    // ─── NEW RIDE CREATED: notify all online drivers ──────────────────
    socket.on('ride:new', async (data) => {
      try {
        const { rideId } = data;
        const ride = await Ride.findById(rideId)
          .populate('riderId', 'name phone')
          .lean();

        if (!ride) return;

        // Emit to all connected drivers
        socket.broadcast.emit('ride:newRequest', {
          rideId: ride._id,
          pickup: ride.pickup,
          destination: ride.destination,
          fare: ride.fare,
          distanceKm: ride.distanceKm,
          rider: ride.riderId,
        });

        console.log(`📢 New ride ${rideId} broadcasted to drivers`);
      } catch (err) {
        console.error('ride:new error:', err.message);
      }
    });

    // ─── DISCONNECT ───────────────────────────────────────────────────
    socket.on('disconnect', async (reason) => {
      connectedUsers.delete(userId);
      if (socket.driverId) {
        connectedDrivers.delete(socket.driverId);
      }
      console.log(`🔌 Socket disconnected: ${role} | userId: ${userId} | reason: ${reason}`);
    });
  });

  return { connectedUsers, connectedDrivers };
};

module.exports = { initSocket };