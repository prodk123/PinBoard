const express = require('express');
const Pin = require('../models/Pin');
const Board = require('../models/Board');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Multer setup for handling uploads
const uploadsPath = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only images and pdfs
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only images and PDF files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// Upload a file (image/pdf) and create a pin
router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const { boardId, title } = req.body;
    let { tags } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check board access
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    const hasAccess = board.createdBy.toString() === req.session.userId ||
                     board.collaborators.some(collab => collab.toString() === req.session.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this board' });
    }

    // Determine type from mimetype
    let type = 'link';
    if (req.file.mimetype.startsWith('image/')) type = 'image';
    else if (req.file.mimetype === 'application/pdf') type = 'pdf';
    else return res.status(400).json({ error: 'Unsupported file type' });

    // Build absolute URL for the uploaded file
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // Normalize tags
    let processedTags = [];
    if (Array.isArray(tags)) {
      processedTags = tags.map(t => String(t).toLowerCase().trim()).filter(Boolean);
    } else if (typeof tags === 'string' && tags.trim().length > 0) {
      processedTags = tags.split(',').map(t => t.toLowerCase().trim()).filter(Boolean);
    }

    const pin = new Pin({
      boardId,
      type,
      contentUrl: fileUrl,
      title,
      tags: processedTags,
      createdBy: req.session.userId
    });

    await pin.save();
    await pin.populate('createdBy', 'name email');

    res.status(201).json({ message: 'Pin created successfully', pin });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all pins for a specific board
router.get('/board/:boardId', requireAuth, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { tag } = req.query;

    // Check if user has access to the board
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const hasAccess = board.createdBy.toString() === req.session.userId ||
                     board.collaborators.some(collab => collab.toString() === req.session.userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Build query for pins
    let query = { boardId };
    if (tag) {
      query.tags = { $in: [tag.toLowerCase()] };
    }

    const pins = await Pin.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ pins });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single pin by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('boardId', 'title');

    if (!pin) {
      return res.status(404).json({ error: 'Pin not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(pin.boardId._id);
    const hasAccess = board.createdBy.toString() === req.session.userId ||
                     board.collaborators.some(collab => collab.toString() === req.session.userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ pin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new pin
router.post('/', requireAuth, async (req, res) => {
  try {
    const { boardId, type, contentUrl, title, tags } = req.body;

    // Check if user has access to the board
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const hasAccess = board.createdBy.toString() === req.session.userId ||
                     board.collaborators.some(collab => collab.toString() === req.session.userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this board' });
    }

    // Process tags to lowercase
    const processedTags = tags ? tags.map(tag => tag.toLowerCase().trim()) : [];

    const pin = new Pin({
      boardId,
      type,
      contentUrl,
      title,
      tags: processedTags,
      createdBy: req.session.userId
    });

    await pin.save();
    await pin.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Pin created successfully',
      pin
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update pin
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { type, contentUrl, title, tags } = req.body;

    const pin = await Pin.findById(req.params.id);
    if (!pin) {
      return res.status(404).json({ error: 'Pin not found' });
    }

    // Check if user is the creator of the pin
    if (pin.createdBy.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'Only pin creator can update' });
    }

    // Process tags to lowercase
    const processedTags = tags ? tags.map(tag => tag.toLowerCase().trim()) : pin.tags;

    pin.type = type || pin.type;
    pin.contentUrl = contentUrl || pin.contentUrl;
    pin.title = title || pin.title;
    pin.tags = processedTags;

    await pin.save();
    await pin.populate('createdBy', 'name email');

    res.json({
      message: 'Pin updated successfully',
      pin
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete pin
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);
    if (!pin) {
      return res.status(404).json({ error: 'Pin not found' });
    }

    // Check if user is the creator of the pin
    if (pin.createdBy.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'Only pin creator can delete' });
    }

    await Pin.findByIdAndDelete(req.params.id);

    res.json({ message: 'Pin deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search pins by tags across all accessible boards
router.get('/', requireAuth, async (req, res) => {
  try {
    const { tag, type } = req.query;

    // Get all boards user has access to
    const boards = await Board.find({
      $or: [
        { createdBy: req.session.userId },
        { collaborators: req.session.userId }
      ]
    });

    const boardIds = boards.map(board => board._id);

    // Build query for pins
    let query = { boardId: { $in: boardIds } };
    
    if (tag) {
      query.tags = { $in: [tag.toLowerCase()] };
    }
    
    if (type) {
      query.type = type;
    }

    const pins = await Pin.find(query)
      .populate('createdBy', 'name email')
      .populate('boardId', 'title')
      .sort({ createdAt: -1 });

    res.json({ pins });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
