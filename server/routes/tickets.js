const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Helper: create notification
const createNotification = async (recipient, message, type, relatedTicket, io) => {
  try {
    const titleMap = {
      ticket_assigned: 'Ticket Assigned',
      ticket_updated: 'Ticket Updated',
      ticket_resolved: 'Ticket Resolved',
      ticket_closed: 'Ticket Closed',
      comment_added: 'New Comment',
      sla_breach: 'SLA Breach Alert',
      status_change: 'Status Changed',
      comment: 'New Reply',
    };
    const notif = await Notification.create({
      recipient,
      title: titleMap[type] || 'Notification',
      message,
      type,
      ticket: relatedTicket,
    });
    if (io) io.to(recipient.toString()).emit('notification', notif);
  } catch (e) {}
};

// Helper: auto-assign agent (round-robin by workload)
const autoAssignAgent = async () => {
  const agents = await User.find({ role: 'agent', isActive: true });
  if (!agents.length) return null;
  const workloads = await Promise.all(
    agents.map(async (a) => ({
      agent: a,
      count: await Ticket.countDocuments({ assignedTo: a._id, status: { $in: ['open', 'in-progress'] } })
    }))
  );
  workloads.sort((a, b) => a.count - b.count);
  return workloads[0].agent._id;
};

// @route GET /api/tickets
router.get('/', protect, async (req, res) => {
  try {
    const { status, priority, category, search, assignedTo, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const filter = {};

    if (req.user.role === 'user') filter.createdBy = req.user._id;
    else if (req.user.role === 'agent') filter.assignedTo = req.user._id;

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { ticketId: { $regex: search, $options: 'i' } }
    ];

    const total = await Ticket.countDocuments(filter);
    const tickets = await Ticket.find(filter)
      .populate('createdBy', 'name email avatar department')
      .populate('assignedTo', 'name email avatar')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, tickets, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/tickets
router.post('/', protect, upload.array('attachments', 5), async (req, res) => {
  try {
    const { title, description, category, priority, department } = req.body;
    const attachments = req.files?.map(f => ({
      filename: f.originalname,
      path: `/uploads/attachments/${f.filename}`,
      size: f.size,
      mimetype: f.mimetype
    })) || [];

    const assignedTo = await autoAssignAgent();
    const ticket = await Ticket.create({
      title, description, category, priority, department,
      createdBy: req.user._id,
      assignedTo,
      attachments
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { ticketsCreated: 1 } });

    const io = req.app.get('io');
    if (assignedTo) {
      await createNotification(assignedTo, `New ticket assigned: ${title}`, 'ticket_assigned', ticket._id, io);
    }

    const populated = await ticket.populate([
      { path: 'createdBy', select: 'name email avatar' },
      { path: 'assignedTo', select: 'name email avatar' }
    ]);

    if (io) io.emit('ticket_created', populated);

    res.status(201).json({ success: true, ticket: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/tickets/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'user' ? { createdBy: req.user._id }
      : req.user.role === 'agent' ? { assignedTo: req.user._id } : {};

    const [open, inProgress, resolved, closed, total] = await Promise.all([
      Ticket.countDocuments({ ...filter, status: 'open' }),
      Ticket.countDocuments({ ...filter, status: 'in-progress' }),
      Ticket.countDocuments({ ...filter, status: 'resolved' }),
      Ticket.countDocuments({ ...filter, status: 'closed' }),
      Ticket.countDocuments(filter)
    ]);

    // Category breakdown
    const categoryBreakdown = await Ticket.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Priority breakdown
    const priorityBreakdown = await Ticket.aggregate([
      { $match: filter },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Last 7 days activity
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyActivity = await Ticket.aggregate([
      { $match: { ...filter, createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // SLA breached count
    const slaBreached = await Ticket.countDocuments({ ...filter, 'sla.breached': true });

    res.json({ success: true, stats: { open, inProgress, resolved, closed, total, slaBreached, categoryBreakdown, priorityBreakdown, dailyActivity } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/tickets/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email avatar department phone')
      .populate('assignedTo', 'name email avatar department');

    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    if (req.user.role === 'user' && ticket.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const comments = await Comment.find({ ticket: ticket._id })
      .populate('author', 'name email avatar role')
      .sort({ createdAt: 1 });

    res.json({ success: true, ticket, comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/tickets/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    const { status, priority, assignedTo, title, description, category } = req.body;
    const changes = [];

    if (status && status !== ticket.status) {
      changes.push({ field: 'Status', from: ticket.status, to: status, changedBy: req.user._id });
      ticket.status = status;
      if (status === 'resolved') ticket.resolvedAt = new Date();
      if (status === 'closed') ticket.closedAt = new Date();
    }
    if (priority && priority !== ticket.priority) {
      changes.push({ field: 'Priority', from: ticket.priority, to: priority, changedBy: req.user._id });
      ticket.priority = priority;
    }
    if (assignedTo && String(assignedTo) !== String(ticket.assignedTo)) {
      changes.push({ field: 'Assigned To', from: ticket.assignedTo, to: assignedTo, changedBy: req.user._id });
      ticket.assignedTo = assignedTo;
    }
    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (category) ticket.category = category;

    ticket.activityLog.push(...changes);
    await ticket.save();

    const populated = await ticket.populate([
      { path: 'createdBy', select: 'name email avatar' },
      { path: 'assignedTo', select: 'name email avatar' }
    ]);

    const io = req.app.get('io');
    if (io) {
      io.to(ticket.createdBy._id.toString()).emit('ticket_updated', populated);
      if (ticket.assignedTo) io.to(ticket.assignedTo._id?.toString()).emit('ticket_updated', populated);
    }

    if (status) {
      const recipientId = ticket.createdBy._id;
      await createNotification(recipientId, `Ticket "${ticket.title}" status changed to ${status}`, 'status_change', ticket._id, io);
    }

    res.json({ success: true, ticket: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/tickets/:id/comments
router.post('/:id/comments', protect, upload.single('attachment'), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    const { body, isInternal } = req.body;
    const attachment = req.file ? {
      filename: req.file.originalname,
      path: `/uploads/attachments/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype
    } : null;

    // Internal notes only visible to agents/admins
    if (isInternal === 'true' && req.user.role === 'user') {
      return res.status(403).json({ success: false, message: 'Cannot create internal notes' });
    }

    const comment = await Comment.create({
      ticket: ticket._id,
      author: req.user._id,
      body,
      isInternal: isInternal === 'true',
      attachments: attachment ? [attachment] : [],
    });

    const populated = await comment.populate('author', 'name email avatar role');

    const io = req.app.get('io');
    if (io) io.to(ticket._id.toString()).emit('comment_added', populated);

    // Notify the other party
    const recipientId = req.user._id.toString() === ticket.createdBy.toString()
      ? ticket.assignedTo : ticket.createdBy;
    if (recipientId) {
      await createNotification(recipientId, `New reply on ticket "${ticket.title}"`, 'comment', ticket._id, io);
    }

    res.status(201).json({ success: true, comment: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/tickets/:id/rating
router.post('/:id/rating', protect, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be 1-5' });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    if (ticket.createdBy.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Access denied' });
    if (ticket.status !== 'resolved' && ticket.status !== 'closed') return res.status(400).json({ success: false, message: 'Can only rate resolved tickets' });

    ticket.rating = { score: rating, feedback, ratedAt: new Date() };
    ticket.status = 'closed';
    await ticket.save();

    if (ticket.assignedTo) {
      const agent = await User.findById(ticket.assignedTo);
      if (agent) {
        const total = agent.totalRatings + 1;
        const avg = ((agent.avgRating * agent.totalRatings) + rating) / total;
        await User.findByIdAndUpdate(ticket.assignedTo, { avgRating: avg.toFixed(2), totalRatings: total, $inc: { ticketsResolved: 1 } });
      }
    }

    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route DELETE /api/tickets/:id  (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ ticket: req.params.id });
    res.json({ success: true, message: 'Ticket deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
