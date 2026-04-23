import { useNavigate } from 'react-router-dom';
import Badge from '../ui/Badge';
import { formatDistanceToNow } from 'date-fns';

const priorityColors = {
  low: '#6b7280',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

export default function TicketCard({ ticket, compact = false }) {
  const navigate = useNavigate();

  const timeLeft = () => {
    if (!ticket.sla?.deadline) return null;
    const diff = new Date(ticket.sla.deadline) - Date.now();
    if (diff <= 0) return { label: 'SLA Breached', level: 'breach' };
    const h = Math.floor(diff / 3600000);
    if (h < 2) return { label: `${h}h left`, level: 'warn' };
    if (h < 8) return { label: `${h}h left`, level: 'ok' };
    return null;
  };

  const sla = timeLeft();

  return (
    <div
      className="ticket-card"
      id={`ticket-${ticket._id}`}
      onClick={() => navigate(`/tickets/${ticket._id}`)}
      style={{
        borderLeft: `3px solid ${priorityColors[ticket.priority?.toLowerCase()] || '#6366f1'}`,
      }}
    >
      <div className="ticket-card-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="ticket-id">{ticket.ticketId}</span>
            {sla && (
              <span
                style={{
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontWeight: 700,
                  background: sla.level === 'breach' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                  color: sla.level === 'breach' ? '#ef4444' : '#f59e0b',
                }}
              >
                ⏱ {sla.label}
              </span>
            )}
          </div>
          <div className="ticket-title">{ticket.title}</div>
          {!compact && ticket.description && (
            <div
              className="truncate"
              style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, maxWidth: '90%' }}
            >
              {ticket.description}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
          <Badge status={ticket.priority?.toLowerCase()} type="priority" />
          <Badge status={ticket.status?.toLowerCase().replace(' ', '-')} type="status" />
        </div>
      </div>

      <div className="ticket-meta">
        <span className="ticket-meta-item">🏷️ {ticket.category}</span>
        {ticket.department && <span className="ticket-meta-item">🏢 {ticket.department}</span>}
        <span className="ticket-meta-item">
          🕐 {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
        </span>
        {ticket.attachments?.length > 0 && (
          <span className="ticket-meta-item">📎 {ticket.attachments.length}</span>
        )}
      </div>

      <div className="ticket-card-footer">
        <div className="ticket-assignee">
          {ticket.assignedTo ? (
            <>
              <div className="mini-avatar">
                {ticket.assignedTo.avatar ? (
                  <img
                    src={ticket.assignedTo.avatar}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  ticket.assignedTo.name?.charAt(0)
                )}
              </div>
              <span>Assigned to {ticket.assignedTo.name}</span>
            </>
          ) : (
            <span className="text-muted" style={{ fontSize: 12 }}>⚠️ Unassigned</span>
          )}
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          By {ticket.createdBy?.name}
        </span>
      </div>
    </div>
  );
}
