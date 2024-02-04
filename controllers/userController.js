const User = require('../models/userModel')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")              //this package(npm install jsonwebtoken) will help us generate tokens.A token is what tells the frontend if a user is authenticated or not so we can do something with that info
const Fuse = require('fuse.js');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const createToken = (id) => {                   // we are creating a function so we can reuse it elsewhere(ie login_user controller and signup user contoller). we take in an argument id cus we will grab it from the req body when we call the fuction and and a user is assigned an id(we just called it id here)
    return jwt.sign({ _id: id }, process.env.SECRET, { expiresIn: "3d" })    //.sign is a method of jsonwebtoken used to create and asign a token. we pass in 3 arguments. first is the id to identify a user, second is a secret string that will be only known to the server and we put that in an env file. third argument can be an option and we use the expiresIn option that is to say it will expire in 3days
}                                                                         // and we need to return it so when we call it, it will return a token for us
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'profile-pictures', // Optional: Organize images into folders
        allowed_formats: ['jpg', 'png', 'jpeg'], // Optional: Specify allowed file formats
        // You can add more Cloudinary options as needed
    },
});
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });


//sign-up user
const singnup_user = async (req, res) => {
    const { email,
        password,
        sex,
        bio,
        joined,
        dpUrl,
        firstName,
        userName,
        lastName,
        notifications,
        balance,
        likes,
        followers,
    } = req.body

    try {
        const user = await User.signup(email, password, sex, bio, joined, dpUrl, firstName, userName, lastName, notifications)
        const token = createToken(user._id)
        res.status(200).json({ email, token, user })
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }
}


//login user
const login_user = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.login(email, password)    //the user we returned is stored here so we have assces to it

        const token = createToken(user._id)              //when we get a user we create a token and we store that inside the token const
        res.status(200).json({ email, token, user })
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }



}
//Edit bio
const edit_details = async (req, res) => {
    const userName = req.body.userName;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.userName = userName;
        user.firstName = firstName;
        user.lastName = lastName;

        await user.save();
        res.status(200).send("Details updated");
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};



const edit_bio = async (req, res) => {
    const currentBio = req.body.bio; // Update to req.body.bio to match the client's request body structure

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.bio = currentBio;
        await user.save(); // Use await here to properly handle the asynchronous save operation
        res.status(200).send("Bio updated");
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};





const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
};


const searchUsers = async (req, res) => {
    const { query } = req.params;

    try {
        const users = await User.find({
            $or: [
                { firstName: { $regex: query, $options: 'i' } },
                { lastName: { $regex: query, $options: 'i' } },
                { userName: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
            ],
        });

        res.json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Error searching users' });
    }
};


// const uploadProfilePicture = async (req, res) => {
//     const { userId } = req.params;
//     const { profilePicture } = req.body;

//     try {
//         // Check if the user exists
//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         // Upload the new profile picture to Cloudinary
//         const cloudinaryResponse = await cloudinary.uploader.upload(profilePicture, {
//             overwrite: true, // Overwrite the existing image with the same public ID
//             folder: 'profile-pictures', // Optional: Organize images into folders
//             public_id: `user_${userId}_profile_picture`
//         });

//         // Update the user's profile picture URL in the database
//         user.dpUrl = cloudinaryResponse.secure_url;
//         await user.save();

//         res.status(200).json({ success: 'Profile picture updated successfully', imageUrl: cloudinaryResponse.secure_url });
//     } catch (error) {
//         console.error('Error updating profile picture:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };

const uploadProfilePicture = async (req, res) => {
    const { userId } = req.params;

    try {
        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if a file is included in the request
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Upload the file to Cloudinar
        const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
            folder: 'profile-pictures', // Optional: Organize images into folders
            // You can add more Cloudinary options as needed
        });

        // Update the user's profile picture URL in the database
        user.dpUrl = cloudinaryResponse.secure_url;
        await user.save();

        // Send a response with the updated image URL
        res.status(200).json({ success: 'Profile picture updated successfully', imageUrl: cloudinaryResponse.secure_url });
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



const toggleUserFollow = async (req, res) => {
    const { userId } = req.params;
    const { followerId } = req.body;

    try {
        // Find the user being followed
        const userToFollow = await User.findById(userId);
        if (!userToFollow) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Find the follower user
        const followerUser = await User.findById(followerId);
        if (!followerUser) {
            return res.status(404).json({ error: 'Follower user not found' });
        }

        // Check if the follower is already following the user
        const isFollowing = userToFollow.followers.some((follower) => follower.userId === followerId);

        if (isFollowing) {
            // If following, remove the follower from userToFollow's followers and userToFollow from followerUser's following
            userToFollow.followers = userToFollow.followers.filter((follower) => follower.userId !== followerId);
            followerUser.following = followerUser.following.filter((following) => following.userId !== userId);
        } else {
            // If not following, add the follower to userToFollow's followers and userToFollow to followerUser's following
            const followerInfo = {
                userId: followerUser._id.toString(),
                userName: followerUser.userName,
                userDpUrl: followerUser.dpUrl,
            };

            userToFollow.followers.push(followerInfo);
            followerUser.following.push({
                userId: userToFollow._id.toString(),
                userName: userToFollow.userName,
                userDpUrl: userToFollow.dpUrl,
            });
        }

        // Save the updated users
        await userToFollow.save();
        await followerUser.save();
        // Fetch details of all the users that the followerUser is following
        const followedUser = await User.findById(userId);
        console.log('help', followedUser)

        res.status(200).json({
            user: followedUser,
            userToFollow,
            followerUser,
        });
    } catch (error) {
        console.error('Error toggling user follow:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




const getSingleUser = async (req, res) => {
    try {
        // Extract the userId from the request parameters
        const userId = req.params.userId;

        // Query the database to find the user by ID
        const user = await User.findById(userId);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // If the user exists, send it as a JSON response
        res.status(200).json(user);
    } catch (error) {
        // Handle errors
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Error fetching user' });
    }
};

const getFollowingUsers = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const followingUsers = await User.find({ _id: { $in: user.following.map(f => f.userId) } });

        res.status(200).json({
            user: user,
            followingUsers: followingUsers,
        });
    } catch (error) {
        console.error('Error fetching following users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const makeDepo = async (req, res) => {
    const { userId } = req.params;
    const { amount, type } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let transactions;
        const newTrans = { amount: amount, time: Date.now(), type: type };

        let newBalance;
        if (user.balance) {
            newBalance = Number(amount) + Number(user.balance)
            transactions = [newTrans, ...user.transactions]; // Corrected line
        } else {
            newBalance = amount;
            transactions = [newTrans];
        }

        // Update user's balance without using $set
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { balance: newBalance, transactions },
            { new: true } // This option returns the updated document
        );

        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Error updating user balance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const Makewithdrawal = async (req, res) => {
    const { userId } = req.params;
    const { amount, type } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let transactions;
        const newTrans = { amount: amount, time: Date.now(), type: type };

        let newBalance;
        newBalance = Number(user.balance) - Number(amount)
        transactions = [newTrans, ...user.transactions];


        // Update user's balance without using $set
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { balance: newBalance, transactions },
            { new: true } // This option returns the updated document
        );

        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Error updating user balance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const TransfserFunds = async (req, res) => {
    const { senderId, receiverId } = req.params;
    const { amount } = req.body;

    try {
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);
        if (!sender || !receiver) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Sender logic
        const newTransForSender = { amount: amount, time: Date.now(), type: 'Debit' };
        const newBalanceForSender = Number(sender.balance) - Number(amount)
        const transactions = [newTransForSender, ...sender.transactions];


        // Reciever logic
        const newTransForReceiver = { amount: amount, time: Date.now(), type: 'Transfer' };
        let newBalanceForReceiver
        let transactionsForReceiver
        if (receiver.balance) {
            newBalanceForReceiver = Number(receiver.balance) + Number(amount)
            transactionsForReceiver = [newTransForReceiver, ...receiver.transactions];
        } else {
            newBalanceForReceiver = Number(amount)
            transactionsForReceiver = [newTransForReceiver]
        }



        // Update user's balance without using $set
        const updatedSender = await User.findOneAndUpdate(
            { _id: senderId },
            { balance: newBalanceForSender, transactions },
            { new: true } // This option returns the updated document
        );
        const updatedReceiver = await User.findOneAndUpdate(
            { _id: receiverId },
            {
                balance: newBalanceForReceiver,
                transactions: transactionsForReceiver
            },
            { new: true } // This option returns the updated document
        );

        res.status(200).json({ success: true, user: updatedSender });
    } catch (error) {
        console.error('Error updating user balance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



async function getAllUsersForSearch() {
    try {
        const users = await User.find();
        return users;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

let fuse;

async function initializeFuse() {
    try {
        const allUsers = await getAllUsersForSearch();

        const fuseOptions = {
            keys: ['userName', 'email', 'firstName', 'lastName'],
            threshold: 0.6, // Adjust as needed
        };

        fuse = new Fuse(allUsers, fuseOptions);
    } catch (error) {
        console.error('Error initializing Fuse:', error);
    }
}

// Initialize the Fuse instance
initializeFuse();


const searchedUsers = async (req, res) => {

    const { query } = req.params;

    // Ensure Fuse is initialized before proceeding
    if (!fuse) {
        await initializeFuse();
    }

    // Perform searches without duplicates
    const fuzzyResults = fuse.search(query);

    res.json({ results: fuzzyResults });
};



module.exports = {
    singnup_user, login_user,
    edit_bio, getAllUsers, searchUsers,
    uploadProfilePicture, edit_details, toggleUserFollow,
    getSingleUser, getFollowingUsers, makeDepo,
    Makewithdrawal, searchedUsers, TransfserFunds
}
















//this is the method we go with if we didn't want to use the the custom method
// const singnup_user = async (req, res) => {
//     const { email, password } = req.body            //grabbing email and password from the request body
//     const exist = await User.findOne({ email })
//     if (exist) {
//         return res.status(400).send("already in use")  //we return this so it will not continue with the rest of the code and break
//     }
//     const salt = await bcrypt.genSalt(10)
//     const hash = await bcrypt.hash(password, salt)
//     try {
//         const user = await User.create({ email, password: hash })
//         res.status(200).json({ email, user })
//     } catch (error) {
//         res.status(400).json({ error: error.message })
//     }
// }