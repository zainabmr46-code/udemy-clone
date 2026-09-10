// Basic Socket.io setup for:
//  1) Live chat inside a course "room" (e.g. during a live class)
//  2) Simple signaling passthrough for a WebRTC/Agora/ZegoCloud live class layer
const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join-course-room', ({ courseId, userName }) => {
      socket.join(`course:${courseId}`);
      socket.to(`course:${courseId}`).emit('chat-message', {
        system: true,
        message: `${userName} joined the live class`,
      });
    });

    socket.on('chat-message', ({ courseId, userName, message }) => {
      io.to(`course:${courseId}`).emit('chat-message', { userName, message, at: new Date() });
    });

    // Pass-through signaling for a video SDK (Agora/ZegoCloud) if you wire one in on the frontend
    socket.on('live-class-signal', ({ courseId, payload }) => {
      socket.to(`course:${courseId}`).emit('live-class-signal', payload);
    });

    socket.on('leave-course-room', ({ courseId, userName }) => {
      socket.leave(`course:${courseId}`);
      socket.to(`course:${courseId}`).emit('chat-message', {
        system: true,
        message: `${userName} left the live class`,
      });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};

module.exports = initSocket;
