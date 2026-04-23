import { useNavigate } from 'react-router-dom';
import Badge from '../ui/Badge';
import { formatDistanceToNow } from 'date-fns';

export default function RecentActivity({ tickets, onNewTicket }) {
  const navigate = useNavigate();

  if (!tickets?.length) {
    return (
      <div className="empty-state" style={{ padding: 28 }}>
        <div className="empty-state-icon">🎫</div>
        <p className="empty-state-title">No tickets yet</p>
        <p className="empty-state-desc">Create your first ticket to get started</p>
        {onNewTicket && (
          <button
            className="btn btn-primary btn-sm"
            style={{ marginTop: 12 }}
            onClick={onNewTicket}
          >
            ➕ New Ticket
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {tickets.map((t) => (
        <div
          key={t._id}
          onClick={() => navigate(`/tickets/${t._id}`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 0',
            borderBottom: '1px solid var(--border)',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              className="truncate"
              style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}
            >
              {t.title}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {t.ticketId} ·{' '}
              {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <Badge
              status={t.priority?.toLowerCase()}
              type="priority"
            />
            <Badge
              status={t.status?.toLowerCase().replace(' ', '-')}
              type="status"
            />
          </div>
        </div>
      ))}
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => navigate('/tickets')}
        style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}
      >
        View all tickets →
      </button>
    </div>
  );
}
