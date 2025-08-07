const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer();

// Route upload ảnh lên Cloudinary
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    // Kiểm tra cấu hình Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Missing Cloudinary configuration:', {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY ? 'exists' : 'missing',
        api_secret: process.env.CLOUDINARY_API_SECRET ? 'exists' : 'missing'
      });
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto' },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              console.error('Cloudinary upload error:', error);
              reject(error);
            }
          }
        );
        
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    console.log('Starting file upload to Cloudinary...');
    const result = await streamUpload(req);
    console.log('Upload successful:', result.secure_url);
    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error('Upload error details:', error);
    res.status(500).json({ 
      message: 'Upload failed', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
