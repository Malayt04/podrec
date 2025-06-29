import { prisma } from "../utils/prisma";
import { v2 as cloudinary } from "cloudinary";

interface ChunkMetadata {
    participantId: string;
    chunkNumber: number;
    filePath: string;
    fileSize: number;
    durationMs: number;
}

export const recordingService = {
    saveChunkMetadata: async (metadata: ChunkMetadata) => {
        return prisma.recordingChunk.create({
            data: {
                participantId: metadata.participantId,
                chunkNumber: metadata.chunkNumber,
                filePath: metadata.filePath,
                fileSize: metadata.fileSize,
                durationMs: metadata.durationMs
            }
        })
    },

    getFinalRecordingsForSession: async (sessionId: string) => {
        const recordings = await prisma.finalRecording.findMany({
          where: { sessionId },
      });
    
        const recordingsWithUrls = recordings.map((recording) => {
          const downloadUrl = cloudinary.uploader.upload(recording.filePath, {
            resource_type: 'video',
            flags: 'attachment',
          });
          return { ...recording, downloadUrl };
        });
    
        return recordingsWithUrls;
      },
}