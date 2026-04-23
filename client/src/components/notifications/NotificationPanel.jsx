import { useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const typeIcons = {
  ticket_created: '🎫',
  ticket_assigned: '👤',
  ticket_updated: '🔄',
  ticket_resolved: '✅',
  ticket_closed: '🔒',
  comment_added: '💬',
  sla_breach: '🚨',
  feedback_requested: '⭐',
  status_change: '🔄',
  comment: '💬',
  default: '🔔',
};

export default function NotificationPanel({ notifications, unread, onMarkAllRead, onDelete, onMarkRead }) {
  const navigate = useNavigate();

  const handleClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationsAPI.markRead(notif._id);
        onMarkRead?.(notif._id);
      } catch {}
    }
    const ticketId = notif.ticket?._id || notif.relatedTicket?._id;
    if (ticketId) navigate(`/tickets/${ticketId}`);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationsAPI.delete(id);
      onDelete?.(id);
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  return (
    <div className="notif-panel">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
          {unread > 0 && (
            <span
              style={{
                background: 'var(--accent)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 99,
              }}
            >
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={onMarkAllRead}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-hover)',
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            ✓ Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div style={{ maxHeight: 380, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 13,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
            <div>No notifications yet</div>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleClick(n)}
              style={{
                display: 'flex',
                gap: 10,
                padding: '11px 16px',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                background: n.isRead ? 'transparent' : 'var(--accent-dim)',
                transition: 'background 0.15s',
                position: 'relative',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = n.isRead ? 'transparent' : 'var(--accent-dim)')
              }
            >
              {/* Unread dot */}
              {!n.isRead && (
                <div
                  style={{
                    position: 'absolute',
                    left: 6,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                  }}
                />
              )}

              <div
                style={{
                  fontSize: 20,
                  flexShrink: 0,
                  width: 32,
                  textAlign: 'center',
                  marginTop: 1,
                }}
              >
                {typeIcons[n.type] || typeIcons.default}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: n.isRead ? 400 : 600,
                    color: 'var(--text-primary)',
                    marginBottom: 2,
                    lineHeight: 1.4,
                  }}
                >
                  {n.title || n.message}
                </div>
                {n.title && n.message && (
                  <div
                    className="truncate"
                    style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 3 }}
                  >
                    {n.message}
                  </div>
                )}
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </div>
              </div>

              <button
                onClick={(e) => handleDelete(e, n._id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 16,
                  padding: '0 2px',
                  flexShrink: 0,
                  opacity: 0.6,
                  alignSelf: 'flex-start',
                  marginTop: 2,
                }}
                title="Dismiss"
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.6)}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Showing latest {notifications.length} notifications
          </span>
        </div>
      )}
    </div>
  );
}
