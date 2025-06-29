import { Readable } from 'stream';
import fs from 'fs';
import axios from 'axios';

import { cloudinary } from './cloudinary';

export const uploadToCloudinary = (buffer: Buffer, options: object): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream =  cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });
    Readable.from(buffer).pipe(stream);
  });
};

export const downloadFile = async (url: string, localPath: string): Promise<void> => {
    const writer = fs.createWriteStream(localPath);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
};