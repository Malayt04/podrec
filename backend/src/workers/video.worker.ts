import { Worker, Job } from 'bullmq';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { cloudinary } from '../utils/cloudinary';
import { prisma } from '../utils/prisma';
import { downloadFile } from '../utils/utils';
import { redis, bullmqConnection } from '../utils/redis';

cloudinary.config();



const processVideo = async (sessionId: string) => {
    console.log(`Starting video processing for session: ${sessionId}`);
    const tempDir = path.join(__dirname, `../../temp`, sessionId);
    await fsp.mkdir(tempDir, { recursive: true });

    const participants = await prisma.participant.findMany({ where: { sessionId } });

    for (const participant of participants) {
        const chunks = await prisma.recordingChunk.findMany({
            where: { participantId: participant.id },
            orderBy: { chunkNumber: 'asc' },
        });

        if (chunks.length === 0) continue;

        // 1. Download all chunks from Cloudinary
        const localChunkPaths: string[] = [];
        for (const chunk of chunks) {
            // Generate Cloudinary URL from public_id
            const url = cloudinary.url(chunk.filePath, { resource_type: 'video' });
            const localPath = path.join(tempDir, path.basename(chunk.filePath) + '.webm');
            await downloadFile(url, localPath);
            localChunkPaths.push(localPath);
        }

        // 2. Run FFmpeg (no changes here)
        const fileListPath = path.join(tempDir, `filelist_${participant.id}.txt`);
        const finalOutputPath = path.join(tempDir, `final_${participant.id}.webm`);
        const fileListContent = localChunkPaths.map((p) => `file '${p}'`).join('\n');
        await fsp.writeFile(fileListPath, fileListContent);
      await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(fileListPath)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .outputOptions(['-c', 'copy'])
        .save(finalOutputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

        // 3. Upload final merged video back to Cloudinary
        const finalPublicId = `podrec/sessions/${sessionId}/final_${participant.id}`;
        const uploadResult = await cloudinary.uploader.upload(finalOutputPath, {
            resource_type: 'video',
            public_id: finalPublicId,
        });

        // 4. Update database
        await prisma.finalRecording.create({
            data: {
                sessionId,
                participantId: participant.id,
                filePath: uploadResult.public_id, // Store final public_id
                fileSize: uploadResult.bytes,
                durationMs: Math.round(uploadResult.duration * 1000),
                processingStatus: 'completed',
            },
        });

        // 5. Publish completion event
        await redis.publish('processing-events', JSON.stringify({ event: 'recording:completed', sessionId, participantId: participant.id }));
    }

    // 6. Cleanup
    await fsp.rm(tempDir, { recursive: true, force: true });
};


// --- BullMQ Worker Definition (No changes here) ---


const videoWorker = new Worker('video-processing', 
  // This is the function that runs for every job
  async (job: Job) => {
    // 1. Get the session ID from the job's data payload
    const { sessionId } = job.data;
    console.log(`[Worker] Processing job ${job.id} for session ${sessionId}`);
    
    try {
      // 2. Call your main processing function
      await processVideo(sessionId);

      console.log(`[Worker] Completed job ${job.id}`);
      return { status: 'completed', sessionId };
    } catch (error) {
      console.error(`[Worker] Failed job ${job.id} with error:`, error);
      // 3. Throw an error to mark the job as failed in BullMQ
      throw error;
    }
  }, 
  { connection: bullmqConnection }
);

// Add listeners for worker events
videoWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error ${err.message}`);
});