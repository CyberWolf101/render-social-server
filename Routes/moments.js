const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Moments = require('../models/momentModel');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const router = express.Router();

cloudinary.config({
  cloud_name: 'dxcuw1bei',
  api_key: '536657354345362',
  api_secret: 'IFEUerdjc9NKu666C1MEx1Hy-4o',
});
// cloudinary.config({
//   cloud_name: 'dfdnuay65',
//   api_key: '845648699234787',
//   api_secret: '9MzfyKj2021VjQuzqEuunAsk19o',
// });

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  // folder: 'moments',
});
const upload = multer({ storage });

// API endpoint for creating a moment
router.post('/create-moment', upload.single('media'), async (req, res) => {
  try {
    // Extract data from the request
    const { text, userId, userName } = req.body;
    const media = req.file;

    console.log('______media________', media)
    // console.log('______req________',req)
    // Check if media file is present
    if (!media) {
      return res.status(400).json({ error: 'No media file provided' });
    }

    // Upload the media file to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'auto',
    });

    // Get the public_id from the Cloudinary response
    const publicId = cloudinaryResponse.public_id;

    // Set the expiration time (24 hours from now)
    const expirationTime = Date.now() + 24 * 60 * 60 * 1000;

    // Create a new moment
    const newMoment = new Moments({
      text,
      userId,
      userName,
      mediaUrl: cloudinaryResponse.secure_url,
      cloudinary_public_id: publicId,
      createdAt: Date.now(),
      expirationTime,
      isMoment: true
    });

    // Save the moment to the database
    await newMoment.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error creating moment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/get-all-moments', async (req, res) => {
  try {
    // Fetch all moments from the database
    const allMoments = await Moments.find();

    // Send the moments as a response
    res.status(200).json(allMoments);
  } catch (error) {
    console.error('Error fetching moments:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
