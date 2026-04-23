import { format } from 'date-fns';

const actionIcons = {
  'Status': '🔄',
  'Priority': '⚡',
  'Assigned To': '👤',
  'comment': '💬',
  'created': '🎫',
  default: '📝',
};

function TimelineItem({ entry, isLast }) {
  const icon = actionIcons[entry.field || entry.action] || actionIcons.default;

  return (
    <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
      {/* Line connector */}
      {!isLast && (
        <div
          style={{
            position: 'absolute',
            left: 17,
            top: 36,
            bottom: -12,
            width: 2,
            background: 'var(--border)',
          }}
        />
      )}
      {/* Icon dot */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'var(--bg-secondary)',
          border: '2px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          flexShrink: 0,
          zIndex: 1,
        }}
      >
        {icon}
      </div>
      {/* Content */}
      <div style={{ flex: 1, paddingBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {entry.performedByName || 'System'}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {entry.timestamp
              ? format(new Date(entry.timestamp), 'MMM d, yyyy · h:mm a')
              : ''}
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {entry.field ? (
            <>
              Changed <strong>{entry.field}</strong> from{' '}
              <span
                style={{
                  padding: '1px 6px',
                  background: 'rgba(239,68,68,0.1)',
                  borderRadius: 4,
                  color: '#ef4444',
                }}
              >
                {entry.from || '—'}
              </span>{' '}
              to{' '}
              <span
                style={{
                  padding: '1px 6px',
                  background: 'rgba(16,185,129,0.1)',
                  borderRadius: 4,
                  color: '#10b981',
                }}
              >
                {entry.to || '—'}
              </span>
            </>
          ) : entry.action === 'created' ? (
            'Created this ticket'
          ) : (
            entry.action || 'Performed an action'
          )}
        </div>
      </div>
    </div>
  );
}

export default function TicketTimeline({ ticket }) {
  if (!ticket) return null;

  // Build timeline: creation + activity log
  const timeline = [
    {
      action: 'created',
      performedByName: ticket.createdBy?.name || 'User',
      timestamp: ticket.createdAt,
    },
    ...(ticket.activityLog || []),
  ];

  if (timeline.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        No activity recorded yet.
      </div>
    );
  }

  return (
    <div style={{ padding: '4px 0' }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          marginBottom: 16,
        }}
      >
        Activity Timeline
      </div>
      {timeline.map((entry, i) => (
        <TimelineItem key={i} entry={entry} isLast={i === timeline.length - 1} />
      ))}
    </div>
  );
}
