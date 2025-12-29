import User from '../models/User.js';
import Post from '../models/Post.js';

// Get current user profile
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const postCount = await Post.countDocuments({ userId: req.userId });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      postCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search users by username
export const searchUsers = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || username.trim().length === 0) {
      return res.status(400).json({ message: 'Username query is required' });
    }

    const users = await User.find({
      username: { $regex: username, $options: 'i' },
    })
      .select('username createdAt')
      .limit(10);

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get public user profile by username
export const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select('username createdAt');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const postCount = await Post.countDocuments({ username });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        createdAt: user.createdAt,
      },
      postCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

