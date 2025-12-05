import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload video to Cloudinary
export const uploadVideo = async (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: 'video',
      folder: 'reels',
      eager: [
        { width: 300, height: 300, crop: 'fill', format: 'jpg' } // Thumbnail
      ],
      eager_async: false,
      ...options
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

// Delete video from Cloudinary
export const deleteVideo = async (publicId) => {
  return cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
};

// Generate thumbnail URL from video URL
export const generateThumbnailUrl = (videoUrl) => {
  // Replace video extension with jpg and add transformation
  return videoUrl
    .replace('/video/upload/', '/video/upload/w_300,h_300,c_fill,so_0/')
    .replace(/\.(mp4|webm|mov|avi)$/i, '.jpg');
};

export default cloudinary;
