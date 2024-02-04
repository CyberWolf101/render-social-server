// const uploadMiddleware = upload.array('files', 5); 

// const createPost = async (req, res) => {
//     const { text, userId, userName } = req.body;

//     try {
//         let mediaUrls = [];
//        const flies = await req.files
//         console.log('_________request files___________: ',flies)
//         await uploadMiddleware(req, res, async (err) => {
//             if (err) {
//                 console.error('File upload error:', err);
//                 return res.status(500).json({ error: 'Error uploading files' });
//             }

//             if (req.files && req.files.length > 0) {
//                 const uploadPromises = req.files.map(async (file) => {
//                     return await cloudinary.uploader.upload(file.path, {
//                         resource_type: 'auto',
//                     });
//                 });

//                 const uploadResults = await Promise.all(uploadPromises);
//                 mediaUrls = uploadResults.map((result) => result.secure_url);
//             }

//             const newPost = await Posts.create({
//                 text,
//                 userId,
//                 userName,
//                 mediaUrls,
//             });

//             console.log('Post created successfully:', newPost);
//             res.status(201).json(newPost);
//         });
//     } catch (error) {
//         console.error('Error creating post:', error);
//         res.status(500).json({ error: 'Error creating post in the database' });
//     }
// };

// const createPost = async (req, res) => {
//     const { text, userId, userName } = req.body;
//     try {
//         const newPost = await Posts.create({ text, userId, userName });
//         res.status(201).send(newPost);
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };
