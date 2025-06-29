import { Server, Socket } from 'socket.io';

export const initializeSignaling = (io: Server) => {

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    socket.on('join-session', (sessionId: string) => {
      console.log(`[${socket.id}] joining session [${sessionId}]`);
      socket.join(sessionId);

      socket.to(sessionId).emit('user-joined', socket.id);
      socket.on('offer', (payload: { target: string; sdp: any }) => {
        console.log(`[${socket.id}] sending offer to [${payload.target}]`);
        io.to(payload.target).emit('offer', {
          source: socket.id,
          sdp: payload.sdp,
        });
      });

      socket.on('answer', (payload: { target: string; sdp: any }) => {
        console.log(`[${socket.id}] sending answer to [${payload.target}]`);
        io.to(payload.target).emit('answer', {
          source: socket.id,
          sdp: payload.sdp,
        });
      });

      socket.on('ice-candidate', (payload: { target: string; candidate: any }) => {
          // Broadcast to everyone in the room except the sender
          socket.to(payload.target).emit('ice-candidate', {
            source: socket.id,
            candidate: payload.candidate
          });
      });
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
      io.emit('user-left', socket.id);
    });
  });
};