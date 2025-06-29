import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { initializeSignaling } from './signaling';
import { authRouter } from './routes/auth.routes';
import { recordingRouter } from './routes/recording.route';
import { sessionRouter } from './routes/sessions.routes';
import { subscriber } from './utils/redis';

const app: Express = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

subscriber.subscribe('processing-events', (err) => {
  if (err) {
    console.error('Failed to subscribe to Redis channel:', err);
  } else {
    console.log('📡 Subscribed to Redis "processing-events" channel.');
  }
});

subscriber.on('message', (channel, message) => {
  console.log(`Received message from channel '${channel}': ${message}`);
  try {
    const data = JSON.parse(message);

    if (data.event === 'recording:completed') {
      io.to(data.sessionId).emit('recording:completed', {
        message: `Recording for participant ${data.participantId} is ready!`,
        participantId: data.participantId,
        sessionId: data.sessionId,
      });
    }
  } catch (error) {
    console.error('Could not parse message from Redis channel', error);
  }
});

app.use(express.json());

app.get('/api', (req: Request, res: Response) => {
  res.send('Podrec Backend API is running!');
});

app.use('/api', authRouter);
app.use('/api', sessionRouter);
app.use('/api', recordingRouter);


initializeSignaling(io);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});