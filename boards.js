const express = require('express');
const Board = require('../models/Board');
const router = express.Router();

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Get all boards for authenticated user
router.get('/', requireAuth, async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { createdBy: req.session.userId },
        { collaborators: req.session.userId }
      ]
    }).populate('createdBy', 'name email')
      .populate('collaborators', 'name email')
      .sort({ createdAt: -1 });

    res.json({ boards });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single board by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('collaborators', 'name email');

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Check if user has access to this board
    const hasAccess = board.createdBy._id.toString() === req.session.userId ||
                     board.collaborators.some(collab => collab._id.toString() === req.session.userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ board });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new board
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, collaborators } = req.body;

    const board = new Board({
      title,
      description: description || '',
      createdBy: req.session.userId,
      collaborators: collaborators || []
    });

    await board.save();
    await board.populate('createdBy', 'name email');
    await board.populate('collaborators', 'name email');

    res.status(201).json({
      message: 'Board created successfully',
      board
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update board
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { title, description, collaborators } = req.body;

    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Check if user is the owner
    if (board.createdBy.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'Only board owner can update' });
    }

    board.title = title || board.title;
    board.description = description !== undefined ? description : board.description;
    board.collaborators = collaborators !== undefined ? collaborators : board.collaborators;

    await board.save();
    await board.populate('createdBy', 'name email');
    await board.populate('collaborators', 'name email');

    res.json({
      message: 'Board updated successfully',
      board
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete board
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Check if user is the owner
    if (board.createdBy.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'Only board owner can delete' });
    }

    await Board.findByIdAndDelete(req.params.id);

    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
