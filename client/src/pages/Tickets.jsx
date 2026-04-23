import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ticketsAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import TicketCard from '../components/tickets/TicketCard';
import { formatDistanceToNow } from 'date-fns';

const STATUSES = ['all', 'open', 'in-progress', 'resolved', 'closed'];
const PRIORITIES = ['all', 'low', 'medium', 'high', 'critical'];
const CATEGORIES = ['all', 'Technical', 'Billing', 'Account', 'Network', 'Hardware', 'Software', 'HR', 'Other'];
const VIEWS = ['list', 'kanban'];

export default function Tickets() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [searchParams] = useSearchParams();

  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [filters, setFilters] = useState({
    status: 'all', priority: 'all', category: 'all',
    search: searchParams.get('search') || '', page: 1
  });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: 12 };
      if (params.status === 'all') delete params.status;
      if (params.priority === 'all') delete params.priority;
      if (params.category === 'all') delete params.category;
      if (!params.search) delete params.search;
      const { data } = await ticketsAPI.getAll(params);
      setTickets(data.tickets);
      setTotal(data.total);
    } catch {}
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  useEffect(() => {
    if (!socket) return;
    socket.on('ticket_created', fetchTickets);
    socket.on('ticket_updated', fetchTickets);
    return () => { socket.off('ticket_created'); socket.off('ticket_updated'); };
  }, [socket, fetchTickets]);

  const setFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val, page: 1 }));

  // Kanban grouping
  const kanbanCols = ['open', 'in-progress', 'resolved', 'closed'];
  const grouped = kanbanCols.reduce((acc, s) => {
    acc[s] = tickets.filter(t => t.status === s);
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Support Tickets</h1>
          <p className="page-subtitle">{total} ticket{total !== 1 ? 's' : ''} found</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            {VIEWS.map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '8px 14px', background: view === v ? 'var(--accent-dim)' : 'transparent',
                color: view === v ? 'var(--accent-hover)' : 'var(--text-muted)',
                border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13
              }}>
                {v === 'list' ? '☰ List' : '📋 Kanban'}
              </button>
            ))}
          </div>
          {(user?.role === 'user' || user?.role === 'admin') && (
            <button className="btn btn-primary" id="tickets-new-btn" onClick={() => navigate('/tickets/new')}>➕ New Ticket</button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="form-control" style={{ width: 220, padding: '7px 12px' }}
            placeholder="🔍 Search tickets…" value={filters.search}
            onChange={e => setFilter('search', e.target.value)} id="ticket-search" />

          <select className="filter-select" id="filter-status" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>)}
          </select>
          <select className="filter-select" id="filter-priority" value={filters.priority} onChange={e => setFilter('priority', e.target.value)}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p === 'all' ? 'All Priority' : p}</option>)}
          </select>
          <select className="filter-select" id="filter-category" value={filters.category} onChange={e => setFilter('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Category' : c}</option>)}
          </select>

          {(filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all' || filters.search) && (
            <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ status: 'all', priority: 'all', category: 'all', search: '', page: 1 })}>
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {loading ? <Loader /> : (
        <>
          {view === 'list' ? (
            tickets.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🎫</div>
                <div className="empty-state-title">No tickets found</div>
                <div className="empty-state-desc">Try adjusting your filters or create a new ticket</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tickets.map(ticket => (
                  <TicketCard key={ticket._id} ticket={ticket} />
                ))}

                {/* Pagination */}
                {total > 12 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                    <button className="btn btn-ghost btn-sm" disabled={filters.page <= 1}
                      onClick={() => setFilter('page', filters.page - 1)}>← Prev</button>
                    <span style={{ padding: '6px 12px', fontSize: 13, color: 'var(--text-secondary)' }}>
                      Page {filters.page}
                    </span>
                    <button className="btn btn-ghost btn-sm" disabled={tickets.length < 12}
                      onClick={() => setFilter('page', filters.page + 1)}>Next →</button>
                  </div>
                )}
              </div>
            )
          ) : (
            /* Kanban View */
            <div className="kanban-board">
              {kanbanCols.map(col => (
                <div key={col} className="kanban-column">
                  <div className="kanban-col-header">
                    <span className="kanban-col-title" style={{ textTransform: 'capitalize' }}>
                      {{open:'🔵',['in-progress']:'🟣',resolved:'🟢',closed:'⚫'}[col]} {col.replace('-',' ')}
                    </span>
                    <span className="kanban-count">{grouped[col].length}</span>
                  </div>
                  {grouped[col].map(t => (
                    <div key={t._id} className="kanban-card" onClick={() => navigate(`/tickets/${t._id}`)}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{t.ticketId}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>{t.title}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Badge status={t.priority} type="priority" />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {grouped[col].length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No tickets</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
