const Notification = require('../models/Notification');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // User joins their personal room
    socket.on('join_user', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined personal room`);
    });

    // User joins a ticket room for real-time comments
    socket.on('join_ticket', (ticketId) => {
      socket.join(ticketId);
      console.log(`Socket joined ticket room: ${ticketId}`);
    });

    socket.on('leave_ticket', (ticketId) => {
      socket.leave(ticketId);
    });

    // Typing indicator in ticket thread
    socket.on('typing', ({ ticketId, userName }) => {
      socket.to(ticketId).emit('user_typing', { userName });
    });

    socket.on('stop_typing', ({ ticketId }) => {
      socket.to(ticketId).emit('user_stop_typing');
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
