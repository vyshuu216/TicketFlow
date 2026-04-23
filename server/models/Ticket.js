const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Ticket title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Technical', 'Billing', 'Account', 'Network', 'Hardware', 'Software', 'HR', 'Other'],
    default: 'Other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  department: {
    type: String,
    trim: true,
    default: 'General'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  attachments: [
    {
      filename: String,
      path: String,
      originalName: String,
      mimetype: String,
      size: Number,
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  tags: [{ type: String, trim: true }],
  sla: {
    deadline: { type: Date },
    breached: { type: Boolean, default: false },
    responseTime: { type: Number, default: null },  // in hours
    resolutionTime: { type: Number, default: null } // in hours
  },
  rating: {
    score: { type: Number, min: 1, max: 5, default: null },
    feedback: { type: String, default: null },
    ratedAt: { type: Date, default: null }
  },
  resolution: {
    type: String,
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  closedAt: {
    type: Date,
    default: null
  },
  activityLog: [
    {
      action: String,
      field: String,
      from: String,
      to: String,
      performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      performedByName: String,
      oldValue: String,
      newValue: String,
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  views: { type: Number, default: 0 },
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

// Auto-generate ticket ID before save
ticketSchema.pre('save', async function (next) {
  if (!this.ticketId) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketId = `TKT-${String(count + 1).padStart(4, '0')}`;
  }
  // Set SLA deadline based on priority
  if (!this.sla.deadline) {
    const hoursMap = { low: 72, medium: 24, high: 8, critical: 2 };
    const hours = hoursMap[this.priority] || 24;
    this.sla.deadline = new Date(Date.now() + hours * 60 * 60 * 1000);
  }
  next();
});

// Index for search
ticketSchema.index({ title: 'text', description: 'text' });
ticketSchema.index({ status: 1, priority: 1 });
ticketSchema.index({ createdBy: 1 });
ticketSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
