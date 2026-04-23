const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'ticket_created',
      'ticket_assigned',
      'ticket_updated',
      'ticket_resolved',
      'ticket_closed',
      'comment_added',
      'sla_breach',
      'feedback_requested',
      'status_change',
      'comment'
    ],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    default: null
  },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date, default: null }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
