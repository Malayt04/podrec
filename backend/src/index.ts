import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import { initializeSignaling } from './signaling';
import { authRouter } from './routes/auth.routes';
import { recordingRouter } from './routes/recording.route';
import { sessionRouter } from './routes/sessions.routes';
import { subscriber } from './utils/redis';

const app: Express = express();
const httpServer = createServer(app);
const allowedOrigins = ['https://podrec-api.onrender.com']

const corsOptions: cors.CorsOptions = {
  origin: allowedOrigins,
};

const io = new Server(httpServer, {
  cors: corsOptions,
});

const PORT = process.env.PORT || 8080;

// Subscribe to Redis channel using Promise-based approach
subscriber.subscribe('processing-events')
  .then(() => {
    console.log('📡 Subscribed to Redis "processing-events" channel.');
  })
  .catch((err: Error) => {
    console.error('Failed to subscribe to Redis channel:', err);
  });

subscriber.on('message', (channel: string, message: string) => {
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

app.use(cors(corsOptions));
app.use(express.json());


app.get('/api', (req: Request, res: Response) => {
  res.send('Podrec Backend API is running!');
});

app.use('/api', authRouter);
app.use('/api', sessionRouter);
app.use('/api', recordingRouter);


initializeSignaling(io);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running`);
});