const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  body: {
    type: String,
    required: [true, 'Comment body is required'],
    trim: true
  },
  isInternal: {
    type: Boolean,
    default: false  // internal notes only visible to agents/admins
  },
  attachments: [
    {
      filename: String,
      path: String,
      originalName: String,
      mimetype: String,
      size: Number
    }
  ],
  editedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
