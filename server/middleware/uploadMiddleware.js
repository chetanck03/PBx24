import multer from 'multer';

// Configure multer for memory storage (for Cloudinary upload)
const storage = multer.memoryStorage();

// File filter for video files
const videoFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files are allowed.'), false);
  }
};

// File filter for image files
const imageFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files (JPEG, PNG, GIF, WebP) are allowed.'), false);
  }
};

// File filter for both video and image files (for reels)
const mediaFileFilter = (req, file, cb) => {
  const videoMimeTypes = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska'
  ];
  
  const imageMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (videoMimeTypes.includes(file.mimetype) || imageMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video and image files are allowed.'), false);
  }
};

// Multer configuration for video uploads
export const uploadVideo = multer({
  storage: storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size (Cloudinary free plan friendly)
    files: 1
  }
});

// Multer configuration for image uploads (multiple images for carousel)
export const uploadImages = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per image
    files: 10 // Max 10 images per post
  }
});

// Multer configuration for media uploads (video or images)
export const uploadMedia = multer({
  storage: storage,
  fileFilter: mediaFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    files: 10 // Max 10 files (1 video or up to 10 images)
  }
});

// Error handler middleware for multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: { message: 'File size too large. Maximum size is 50MB for videos, 10MB for images.' }
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: { message: 'Too many files. Maximum 1 video or 10 images allowed.' }
      });
    }
    return res.status(400).json({
      success: false,
      error: { message: err.message }
    });
  }
  
  if (err.message && (
    err.message.includes('Invalid file type') ||
    err.message.includes('Only video') ||
    err.message.includes('Only image')
  )) {
    return res.status(400).json({
      success: false,
      error: { message: err.message }
    });
  }
  
  next(err);
};
