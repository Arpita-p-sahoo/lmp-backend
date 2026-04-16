import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'avatars',
  ): Promise<string> {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            reject(new BadRequestException(error.message));
            return;
          }

          const url = result?.secure_url;
          if (!url) {
            reject(new BadRequestException('Upload failed'));
            return;
          }

          resolve(url);
        },
      );

      const readable = new Readable();
      readable.push(file.buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  async deleteImage(imageUrl: string): Promise<void> {
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1]?.split('.')[0] ?? '';
    const folder = parts[parts.length - 2] ?? '';

    if (!filename || !folder) {
      return;
    }

    await cloudinary.uploader.destroy(`${folder}/${filename}`);
  }
}
