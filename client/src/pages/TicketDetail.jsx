import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import TicketTimeline from '../components/tickets/TicketTimeline';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';

const SLA_HOURS = { low: 72, medium: 24, high: 8, critical: 2 };

function SlaTimer({ ticket }) {
  const [remaining, setRemaining] = useState('');
  const [level, setLevel] = useState('ok');

  useEffect(() => {
    if (!ticket || ticket.status === 'closed' || ticket.status === 'resolved') return;
    const calc = () => {
      const created = new Date(ticket.createdAt).getTime();
      const limit = SLA_HOURS[ticket.priority] * 3600000;
      const deadline = created + limit;
      const diff = deadline - Date.now();
      if (diff <= 0) { setLevel('breach'); setRemaining('SLA Breached!'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setLevel(diff < limit * 0.2 ? 'warn' : 'ok');
      setRemaining(`${h}h ${m}m remaining`);
    };
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [ticket]);

  if (!remaining) return null;
  return <div className={`sla-timer ${level}`}>⏱️ SLA: {remaining}</div>;
}

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [commentBody, setCommentBody] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [typing, setTyping] = useState('');
  const typingTimeout = useRef(null);
  const commentsEndRef = useRef(null);

  const fetchTicket = async () => {
    try {
      const { data } = await ticketsAPI.getOne(id);
      setTicket(data.ticket);
      setComments(data.comments);
    } catch { navigate('/tickets'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchTicket();
    if (user?.role !== 'user') usersAPI.getAgents().then(({ data }) => setAgents(data.agents)).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('join_ticket', id);
    const onComment = (c) => setComments(prev => [...prev, c]);
    const onUpdate = (t) => setTicket(t);
    const onTyping = ({ userName }) => {
      setTyping(`${userName} is typing…`);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setTyping(''), 3000);
    };
    socket.on('comment_added', onComment);
    socket.on('ticket_updated', onUpdate);
    socket.on('user_typing', onTyping);
    return () => {
      socket.emit('leave_ticket', id);
      socket.off('comment_added', onComment);
      socket.off('ticket_updated', onUpdate);
      socket.off('user_typing', onTyping);
    };
  }, [socket, id]);

  useEffect(() => { commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [comments]);

  const handleStatusChange = async (status) => {
    try {
      await ticketsAPI.update(id, { status });
      toast.success(`Status updated to ${status}`);
      fetchTicket();
    } catch { toast.error('Failed to update status'); }
  };

  const handleAssign = async (agentId) => {
    try {
      await ticketsAPI.update(id, { assignedTo: agentId });
      toast.success('Ticket reassigned');
      fetchTicket();
    } catch { toast.error('Failed to reassign'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('body', commentBody);
      formData.append('isInternal', isInternal);
      await ticketsAPI.addComment(id, formData);
      setCommentBody('');
      setIsInternal(false);
    } catch { toast.error('Failed to add comment'); }
    finally { setSubmitting(false); }
  };

  const handleTyping = () => {
    if (socket) socket.emit('typing', { ticketId: id, userName: user.name });
  };

  const handleRate = async () => {
    if (!rating) return toast.error('Please select a rating');
    try {
      await ticketsAPI.rate(id, { rating, feedback });
      toast.success('Thank you for your feedback! 🌟');
      setShowRating(false);
      fetchTicket();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit rating'); }
  };

  if (loading) return <Loader />;
  if (!ticket) return null;

  const canEdit = user?.role === 'admin' || user?.role === 'agent';
  const isOwner = ticket.createdBy?._id === user?._id || ticket.createdBy?._id?.toString() === user?._id?.toString();

  const statusFlow = ['open', 'in-progress', 'resolved', 'closed'];
  const currentIdx = statusFlow.indexOf(ticket.status);

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tickets')} style={{ marginBottom: 8 }}>← Back to Tickets</button>
          <h1 className="page-title" style={{ fontSize: '1.3rem' }}>{ticket.title}</h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{ticket.ticketId}</span>
            <Badge status={ticket.status} type="status" />
            <Badge status={ticket.priority} type="priority" />
            <SlaTimer ticket={ticket} />
          </div>
        </div>
        {isOwner && (ticket.status === 'resolved') && (
          <button className="btn btn-success" id="rate-btn" onClick={() => setShowRating(true)}>⭐ Rate & Close</button>
        )}
      </div>

      <div className="ticket-detail-grid">
        {/* Left: Description + Timeline + Comments */}
        <div>
          {/* Description */}
          <div className="detail-section" style={{ marginBottom: 16 }}>
            <div className="detail-section-title">Description</div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{ticket.description}</p>

            {ticket.attachments?.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>ATTACHMENTS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ticket.attachments.map((a, i) => (
                    <a key={i} href={a.path} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--bg-hover)', borderRadius: 6, fontSize: 12, color: 'var(--accent-hover)' }}>
                      📎 {a.filename}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div className="detail-section" style={{ marginBottom: 16 }}>
            <TicketTimeline ticket={ticket} />
          </div>

          {/* Comments */}
          <div className="detail-section">
            <div className="detail-section-title">Comments ({comments.length})</div>
            <div className="comment-list">
              {comments.filter(c => !c.isInternal || user?.role !== 'user').map(c => (
                <div key={c._id} className={`comment-item ${c.isInternal ? 'internal' : ''}`}>
                  <div className="comment-header">
                    <div className="mini-avatar">
                      {c.author?.avatar
                        ? <img src={c.author.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : c.author?.name?.charAt(0)}
                    </div>
                    <span className="comment-author">{c.author?.name}</span>
                    <Badge status={c.author?.role} type="role" />
                    {c.isInternal && <span className="internal-badge">🔒 Internal Note</span>}
                    <span className="comment-time">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                  </div>
                  <div className="comment-body">{c.body}</div>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>

            {typing && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>{typing}</div>}

            {/* Comment Form */}
            {ticket.status !== 'closed' && (
              <form className="comment-form" onSubmit={handleComment} style={{ marginTop: 16 }}>
                <textarea className="form-control" placeholder="Write a reply…" rows={3}
                  value={commentBody}
                  onChange={e => { setCommentBody(e.target.value); handleTyping(); }}
                  id="comment-input" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  {canEdit && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} />
                      🔒 Internal note
                    </label>
                  )}
                  <div style={{ marginLeft: 'auto' }}>
                    <button id="comment-submit" type="submit" className="btn btn-primary btn-sm" disabled={submitting || !commentBody.trim()}>
                      {submitting ? '⏳' : '💬 Reply'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="ticket-detail-sidebar">
          {/* Status Control */}
          {canEdit && (
            <div className="detail-section">
              <div className="detail-section-title">Update Status</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {statusFlow.map((s, i) => (
                  <button key={s} onClick={() => handleStatusChange(s)}
                    disabled={ticket.status === s}
                    className={`btn btn-sm ${ticket.status === s ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ justifyContent: 'flex-start' }}>
                    {i <= currentIdx ? '✓' : '○'} {s.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assignment */}
          {canEdit && (
            <div className="detail-section">
              <div className="detail-section-title">Assignee</div>
              <select className="form-control" value={ticket.assignedTo?._id || ''}
                onChange={e => handleAssign(e.target.value)} id="assign-select">
                <option value="">Unassigned</option>
                {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </div>
          )}

          {/* Ticket Info */}
          <div className="detail-section">
            <div className="detail-section-title">Ticket Info</div>
            {[
              { label: 'Category', value: ticket.category },
              { label: 'Department', value: ticket.department },
              { label: 'Created By', value: ticket.createdBy?.name },
              { label: 'Created', value: ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yyyy HH:mm') : '-' },
              { label: 'Last Updated', value: ticket.updatedAt ? formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true }) : '-' },
              ...(ticket.resolvedAt ? [{ label: 'Resolved', value: format(new Date(ticket.resolvedAt), 'MMM d, yyyy HH:mm') }] : []),
            ].map(f => (
              <div key={f.label} className="detail-field">
                <div className="detail-field-label">{f.label}</div>
                <div className="detail-field-value">{f.value}</div>
              </div>
            ))}
          </div>

          {/* Assigned Agent Info */}
          {ticket.assignedTo && (
            <div className="detail-section">
              <div className="detail-section-title">Assigned Agent</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="mini-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
                  {ticket.assignedTo.avatar
                    ? <img src={ticket.assignedTo.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : ticket.assignedTo.name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{ticket.assignedTo.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ticket.assignedTo.email}</div>
                </div>
              </div>
            </div>
          )}

          {/* Rating display */}
          {ticket.rating?.score && (
            <div className="detail-section">
              <div className="detail-section-title">User Rating</div>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} className={`star ${s <= ticket.rating.score ? 'filled' : ''}`} style={{ cursor: 'default' }}>★</span>
                ))}
              </div>
              {ticket.rating.feedback && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>"{ticket.rating.feedback}"</p>}
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      <Modal isOpen={showRating} onClose={() => setShowRating(false)} title="Rate this support experience"
        footer={<><button className="btn btn-ghost" onClick={() => setShowRating(false)}>Cancel</button><button className="btn btn-primary" onClick={handleRate}>Submit Rating</button></>}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14 }}>How satisfied are you with the resolution?</p>
          <div className="star-rating" style={{ justifyContent: 'center', marginBottom: 16 }}>
            {[1, 2, 3, 4, 5].map(s => (
              <span key={s} className={`star ${s <= rating ? 'filled' : ''}`} onClick={() => setRating(s)}>★</span>
            ))}
          </div>
          <textarea className="form-control" placeholder="Optional: Tell us more about your experience…"
            rows={3} value={feedback} onChange={e => setFeedback(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
