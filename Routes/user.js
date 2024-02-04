const express = require("express")
const router = express.Router()
const {
    login_user, singnup_user,
    edit_bio, getAllUsers,
    searchUsers, uploadProfilePicture,
    edit_details, toggleUserFollow,
    getSingleUser, getFollowingUsers,
    makeDepo, Makewithdrawal, searchedUsers,
    TransfserFunds
} = require('../controllers/userController')

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const User = require('../models/userModel')


cloudinary.config({
    cloud_name: 'dfdnuay65',
    api_key: '845648699234787',
    api_secret: '9MzfyKj2021VjQuzqEuunAsk19o',
});
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'profile-pictures',
    allowedFormats: ['jpg', 'png', 'jpeg'],
});

const upload = multer({ storage });



router.post('/upload-profile-picture/:userId', upload.single('profilePicture'), async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the user already has a profile picture URL
        const existingUrl = user.dpUrl;


        const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
            public_id: `profile-picture/${userId}`, // Specify the constant public ID
            overwrite: true, // Allow overwriting the existing asset
            resource_type: 'auto',
        });

        const newUrl = cloudinaryResponse.secure_url;
        console.log('newUrl', newUrl)
        user.dpUrl = newUrl;
        await user.save();

        res.status(200).json({ success: 'Profile picture updated successfully', imageUrl: newUrl });
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




// const Storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, 'uploads/'),
//     filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
// });
// const upload = multer({
//     storage: Storage
// })

// router.post('/upload-profile-picture/:userId', upload.single('profilePicture'), async (req, res) => {
//     const pic = req.file;
//     const { userId } = req.params;
//     try {
//         console.log(pic)
//         console.log('id____',userId)
//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }
//         console.log('pic: ___', pic)
//         const cloudinaryResponse = await cloudinary.uploader.upload(pic.path, {
//             resource_type: 'auto',
//         });

//         user.dpUrl = cloudinaryResponse.secure_url;
//         await user.save();
//         res.status(200).json({ success: 'Profile picture updated successfully', imageUrl: cloudinaryResponse.secure_url });

//     } catch (error) {
//         console.error('Error updating profile picture:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

//login route




router.post('/toggleFollowShop/:userDetailsId', async (req, res) => {
    const userDetailsId = req.params.userDetailsId;
    const {shopName} = req.body;
console.log('_______shopName________',shopName)
    try {
        let user = await User.findById(userDetailsId).populate('followedShops');

        let message;
        if (user.followedShops && user.followedShops.includes(shopName)) {
            // Use filter and update user.followedShops
            user.followedShops = user.followedShops.filter(name => name !== shopName);
            message = 'unfollowed';
        } else {
            // Push to user.followedShops
            user.followedShops.push(shopName);
            message = 'followed';
        }

        const followedShops = user.followedShops;
        await user.save();
        res.status(200).json({ message, followedShops, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred, please check your connection' });
    }
});


router.post("/login", login_user)

//sign-up route
router.post("/signup", singnup_user)

router.get("/singleUser/:userId", getSingleUser)

router.put("/deposited/:userId", makeDepo)

router.put("/withdrawn/:userId", Makewithdrawal)


router.put("/tfr/:senderId/:receiverId", TransfserFunds)


router.get("/all-users", getAllUsers)


router.post("/search/:query", searchUsers)

// router.post('/upload-profile-picture/:userId', upload.single('profilePicture'), uploadProfilePicture);
router.put('/toggle-user-follow/:userId', toggleUserFollow);


router.put("/edit-details/:id", edit_details)


router.put("/edit-bio/:id", edit_bio)


router.get('/:userId/following', getFollowingUsers);


router.get('/searched/:query', searchedUsers);


module.exports = router;