import { Request, Response } from "express";
import multer from "multer";
import { recordingService } from "../service/recording.service";
import { uploadToCloudinary } from "../utils/utils";

const upload = multer({
  storage: multer.memoryStorage(),
});

export const recordingController = {
  uploadChunk: upload.single("video-chunk"),

  uploadChunkHandler: async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }

      const { sessionId } = req.params;
      const { participantId, chunkNumber, durationMs } = req.body;

      if (!participantId || !chunkNumber || !durationMs) {
        return res
          .status(400)
          .json({ message: "Missing required chunk metadata" });
      }

      const public_id = `podrec/sessions/${sessionId}/${participantId}_chunk_${chunkNumber}`;

      const result = await uploadToCloudinary(req.file.buffer, {
        resource_type: "video",
        public_id,
      });

      const metadata = await recordingService.saveChunkMetadata({
        participantId,
        chunkNumber: parseInt(chunkNumber, 10),
        filePath: result.public_id,
        fileSize: result.bytes,
        durationMs: parseInt(durationMs, 10),
      });

      res
        .status(201)
        .json({
          message: "Chunk uploaded successfully to Cloudinary",
          public_id: result.public_id,
        });
    } catch (error) {
      console.error("Failed to process chunk upload:", error);
      res.status(500).json({ message: "Error processing chunk" });
    }
  },
};
