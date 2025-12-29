import Post from '../models/Post.js';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

// Upload image
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Convert buffer to stream for Cloudinary
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'creative-showcase',
        resource_type: 'image',
      },
      async (error, result) => {
        if (error) {
          return res.status(500).json({ message: 'Image upload failed', error: error.message });
        }

        // Save post to database
        const post = new Post({
          imageUrl: result.secure_url,
          description: req.body.description || '',
          userId: req.userId,
          username: req.username,
        });

        await post.save();

        res.status(201).json({
          message: 'Image uploaded successfully',
          post: {
            id: post._id,
            imageUrl: post.imageUrl,
            description: post.description,
            username: post.username,
            createdAt: post.createdAt,
          },
        });
      }
    );

    // Convert buffer to stream
    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null);
    bufferStream.pipe(stream);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get global feed (all posts)
export const getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .select('imageUrl description username createdAt userId')
      .populate('userId', 'username')
      .limit(50);

    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get posts by username
export const getPostsByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const posts = await Post.find({ username })
      .sort({ createdAt: -1 })
      .select('imageUrl description username createdAt userId');

    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Extract public_id from Cloudinary URL for deletion
    const urlParts = post.imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = `creative-showcase/${filename.split('.')[0]}`;

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    // Delete from database
    await Post.findByIdAndDelete(postId);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

