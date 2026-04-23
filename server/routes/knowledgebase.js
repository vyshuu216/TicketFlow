const express = require('express');
const router = express.Router();
const KnowledgeBase = require('../models/KnowledgeBase');
const { protect, authorize } = require('../middleware/auth');

// @route GET /api/kb — Get all published articles
router.get('/', protect, async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const filter = { isPublished: true };

    if (category && category !== 'all') filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const total = await KnowledgeBase.countDocuments(filter);
    const articles = await KnowledgeBase.find(filter)
      .populate('author', 'name avatar')
      .sort({ views: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, articles, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/kb/:id — Get single article
router.get('/:id', protect, async (req, res) => {
  try {
    const article = await KnowledgeBase.findById(req.params.id).populate('author', 'name avatar');
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });

    // Increment views
    article.views += 1;
    await article.save({ validateBeforeSave: false });

    res.json({ success: true, article });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/kb — Admin/Agent: create article
router.post('/', protect, authorize('admin', 'agent'), async (req, res) => {
  try {
    const { title, content, category, tags, isPublished } = req.body;
    const article = await KnowledgeBase.create({
      title,
      content,
      category,
      tags: tags || [],
      isPublished: isPublished !== false,
      author: req.user._id,
    });
    await article.populate('author', 'name avatar');
    res.status(201).json({ success: true, article });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/kb/:id — Admin/Agent: update article
router.put('/:id', protect, authorize('admin', 'agent'), async (req, res) => {
  try {
    const { title, content, category, tags, isPublished } = req.body;
    const article = await KnowledgeBase.findByIdAndUpdate(
      req.params.id,
      { title, content, category, tags, isPublished },
      { new: true, runValidators: true }
    ).populate('author', 'name avatar');

    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    res.json({ success: true, article });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/kb/:id/helpful — Mark as helpful
router.post('/:id/helpful', protect, async (req, res) => {
  try {
    const { vote } = req.body; // 'yes' or 'no'
    const update = vote === 'yes' ? { $inc: { helpful: 1 } } : { $inc: { notHelpful: 1 } };
    const article = await KnowledgeBase.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    res.json({ success: true, article });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route DELETE /api/kb/:id — Admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await KnowledgeBase.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Article deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
