const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Channels = require('../models/channelModel');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const router = express.Router();

cloudinary.config({
    cloud_name: 'dfdnuay65',
    api_key: '845648699234787',
    api_secret: '9MzfyKj2021VjQuzqEuunAsk19o',
});


// Configure Multer (for file upload)
const Storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
    storage: Storage
})

// API endpoint for creating a moment
router.post('/create-channel', upload.array('files'), async (req, res) => {
    try {
        // Extract data from the request
        const { text, userId, userName } = req.body;
        const files = req.files;


        console.log('______files________', files)

        let mediaUrls = [];
        let publicId

        if (files && files.length > 0 && files !== null) {
            // Upload each file to Cloudinary concurrently
            const uploadPromises = files.map(async (file) => {
                return await cloudinary.uploader.upload(file.path, {
                    resource_type: 'auto',
                });
            });
            const uploadResults = await Promise.all(uploadPromises);
            mediaUrls = uploadResults.map((result) => result.secure_url);
            publicId = uploadResults.map((result) => result.public_id);
        }


        // Get the public_id from the Cloudinary response

        // Set the expiration time (24 hours from now)
        const expirationTime = Date.now() + 24 * 60 * 60 * 1000;

        // Create a new moment
        const channel = new Channels({
            text,
            userId,
            userName,
            mediaUrl: mediaUrls[0],
            cloudinary_public_id: publicId[0],
            createdAt: Date.now(),
            expirationTime,
            isChannel: true
        });

        // Save the moment to the database
        await channel.save();

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error creating moment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/get-all-channels', async (req, res) => {
    try {
      // Fetch all moments from the database
      const allChannels = await Channels.find();
  
      // Send the moments as a response
      res.status(200).json(allChannels);
    } catch (error) {
      console.error('Error fetching moments:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router;
