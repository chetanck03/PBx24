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

// Multer configuration for video uploads
export const uploadVideo = multer({
  storage: storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size (Cloudinary free plan friendly)
    files: 1
  }
});

// Error handler middleware for multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: { message: 'File size too large. Maximum size is 50MB.' }
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: { message: 'Too many files. Only one video allowed.' }
      });
    }
    return res.status(400).json({
      success: false,
      error: { message: err.message }
    });
  }
  
  if (err.message === 'Invalid file type. Only video files are allowed.') {
    return res.status(400).json({
      success: false,
      error: { message: err.message }
    });
  }
  
  next(err);
};
