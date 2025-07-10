import { Request, Response } from 'express';
import { sessionService } from '../service/sessions.service';
import { videoQueue } from '../queues/video.queue';

export const sessionController = {
  createSessionHandler: async (req: Request, res: Response) => {
    try {
      const hostId = req.user?.userId;
      const { title } = req.body;
      if (!title || !hostId) {
        return res.status(400).json({ message: 'Title and hostId are required' });
      }
      const newSession = await sessionService.createSession(title, hostId);
      return res.status(201).json(newSession.id);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to create session' });
    }
  },

  getSessionHandler: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const session = await sessionService.findSessionById(id);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      res.status(200).json(session);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to retrieve session' });
    }
  },

  joinSessionHandler: async (req: Request, res: Response) => {
    try {
      const { id: sessionId } = req.params;
      const { displayName, userId } = req.body;

      if (!displayName) {
        return res.status(400).json({ message: 'displayName is required' });
      }

      // Check if session exists
      const session = await sessionService.findSessionById(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      const participant = await sessionService.addParticipantToSession(
        sessionId,
        displayName,
        userId || null
      );
      res.status(201).json(participant);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to join session' });
    }
  },


  updateSessionHandler: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, status } = req.body;
      const updatedSession = await sessionService.updateSession(id, { title, status });
      res.status(200).json(updatedSession);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to update session' });
    }
  },


  endSessionHandler: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const endedSession = await sessionService.endSession(id);
          await videoQueue.add('process-session', { sessionId: id });
    console.log(`[API] Added video processing job for session ${id} to the queue.`);

    res.status(200).json(endedSession);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to end session' });
    }
  },
};
