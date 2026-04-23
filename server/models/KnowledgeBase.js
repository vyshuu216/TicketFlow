const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title too long'],
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Hardware', 'Software', 'Network', 'Account', 'Email', 'Printer', 'Security', 'General'],
    default: 'General',
  },
  tags: [{ type: String, trim: true }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  helpful: {
    type: Number,
    default: 0,
  },
  notHelpful: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

articleSchema.index({ title: 'text', content: 'text', tags: 'text' });
articleSchema.index({ category: 1 });
articleSchema.index({ isPublished: 1 });

module.exports = mongoose.model('KnowledgeBase', articleSchema);
