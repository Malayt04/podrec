import {Participant } from '@prisma/client';
import { prisma } from '../utils/prisma';

interface SessionUpdateData {
  title?: string;
  status?: 'active' | 'ended';
}

export const sessionService = {
  createSession: async (title: string, hostId: string) => {
    const newSession = await prisma.session.create({
      data: {
        title,
        hostId,
      },
    });
    await sessionService.addParticipantToSession(newSession.id, 'Host', hostId, true);
    return newSession;
  },

  findSessionById: async (id: string) => {
    return await prisma.session.findUnique({
      where: { id },
      include: {
        participants: true,
      },
    });
  },


  addParticipantToSession: async (
    sessionId: string,
    displayName: string,
    userId: string | null,
    isHost: boolean = false
  ): Promise<Participant> => {
    return await prisma.participant.create({
      data: {
        sessionId,
        displayName,
        userId,
        isHost,
      },
    });
  },


  updateSession: async (id: string, data: SessionUpdateData) => {
    return await prisma.session.update({
      where: { id },
      data,
    });
  },

  endSession: async (id: string) => {
    return await prisma.session.update({
      where: { id },
      data: {
        status: 'ended',
        endedAt: new Date(),
      },
    });
  },
};