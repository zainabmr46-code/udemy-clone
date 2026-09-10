const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Image storage (avatars, thumbnails)
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'udemy-clone/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1280, crop: 'limit' }],
  },
});

// Video storage (lecture videos, preview videos) — uploaded as 'authenticated'
// so playback requires a signed URL (basic "prevent download" measure).
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'udemy-clone/videos',
    resource_type: 'video',
    type: 'authenticated',
    allowed_formats: ['mp4', 'mov', 'webm'],
  },
});

const uploadImage = multer({ storage: imageStorage, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadVideo = multer({ storage: videoStorage, limits: { fileSize: 500 * 1024 * 1024 } });

// Generate a short-lived signed URL for an authenticated video asset.
// This is what powers "Video Security: prevent download with signed Cloudinary URLs".
const getSignedVideoUrl = (publicId, expiresInSeconds = 60 * 30) => {
  const timestamp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  return cloudinary.utils.private_download_url(publicId, 'mp4', {
    resource_type: 'video',
    type: 'authenticated',
    expires_at: timestamp,
  });
};

module.exports = { cloudinary, uploadImage, uploadVideo, getSignedVideoUrl };
