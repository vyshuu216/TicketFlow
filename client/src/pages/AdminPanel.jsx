import { useEffect, useState } from 'react';
import { ticketsAPI, usersAPI } from '../services/api';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const TABS = ['Users', 'Tickets', 'Overview'];

export default function AdminPanel() {
  const [tab, setTab] = useState('Overview');
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [search, setSearch] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ur, tr, sr] = await Promise.all([
        usersAPI.getAll({ limit: 50 }),
        ticketsAPI.getAll({ limit: 50 }),
        ticketsAPI.getStats()
      ]);
      setUsers(ur.data.users);
      setTickets(tr.data.tickets);
      setStats(sr.data.stats);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleUserUpdate = async () => {
    try {
      await usersAPI.update(editUser._id, { role: editUser.role, isActive: editUser.isActive });
      toast.success('User updated');
      setEditUser(null);
      fetchAll();
    } catch { toast.error('Failed to update user'); }
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  const filteredTickets = tickets.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.ticketId?.includes(search));

  if (loading) return <Loader />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Admin Panel</h1>
          <p className="page-subtitle">Manage users, tickets, and system settings</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Users', value: users.length, icon: '👥', color: 'blue' },
          { label: 'Active Agents', value: users.filter(u => u.role === 'agent' && u.isActive).length, icon: '🧑‍💼', color: 'purple' },
          { label: 'Open Tickets', value: stats?.open || 0, icon: '🎫', color: 'blue' },
          { label: 'SLA Breached', value: stats?.slaBreached || 0, icon: '🚨', color: 'red' },
          { label: 'Resolved Today', value: stats?.resolved || 0, icon: '✅', color: 'green' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <input className="form-control" style={{ maxWidth: 300 }}
          placeholder={`🔍 Search ${tab.toLowerCase()}…`}
          value={search} onChange={e => setSearch(e.target.value)} id="admin-search" />
      </div>

      {tab === 'Users' && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="mini-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                        {u.avatar ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : u.name?.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{u.email}</td>
                  <td><Badge status={u.role} type="role" /></td>
                  <td style={{ fontSize: 13 }}>{u.department}</td>
                  <td>
                    <span style={{
                      padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                      background: u.isActive ? 'var(--success-dim)' : 'var(--danger-dim)',
                      color: u.isActive ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {u.lastLogin ? formatDistanceToNow(new Date(u.lastLogin), { addSuffix: true }) : 'Never'}
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" id={`edit-user-${u._id}`}
                      onClick={() => setEditUser({ ...u })}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Tickets' && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Assigned To</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(t => (
                <tr key={t._id} style={{ cursor: 'pointer' }} onClick={() => window.open(`/tickets/${t._id}`, '_self')}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{t.ticketId}</td>
                  <td style={{ fontWeight: 600, fontSize: 13, maxWidth: 240 }} className="truncate">{t.title}</td>
                  <td><Badge status={t.status} type="status" /></td>
                  <td><Badge status={t.priority} type="priority" /></td>
                  <td style={{ fontSize: 13 }}>{t.category}</td>
                  <td style={{ fontSize: 13 }}>{t.assignedTo?.name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Overview' && (
        <div className="grid-2">
          <div className="card">
            <div className="card-title">👥 User Breakdown</div>
            {['user', 'agent', 'admin'].map(role => {
              const count = users.filter(u => u.role === role).length;
              const pct = users.length ? Math.round((count / users.length) * 100) : 0;
              return (
                <div key={role} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                    <span style={{ textTransform: 'capitalize' }}><Badge status={role} type="role" /></span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: role === 'admin' ? 'var(--warning)' : role === 'agent' ? '#8b5cf6' : 'var(--accent)' }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="card">
            <div className="card-title">🎫 Ticket Status Overview</div>
            {[['open', stats?.open, 'var(--status-open)'], ['in-progress', stats?.inProgress, '#8b5cf6'], ['resolved', stats?.resolved, 'var(--success)'], ['closed', stats?.closed, 'var(--text-muted)']].map(([s, v, c]) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, textTransform: 'capitalize' }}>{s.replace('-', ' ')}</span>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{v || 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User"
        footer={<><button className="btn btn-ghost" onClick={() => setEditUser(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleUserUpdate}>Save Changes</button></>}>
        {editUser && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '12px', background: 'var(--bg-hover)', borderRadius: 8 }}>
              <div className="mini-avatar" style={{ width: 40, height: 40, fontSize: 16 }}>
                {editUser.name?.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{editUser.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{editUser.email}</div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-control" value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })}>
                <option value="user">User</option>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select className="form-control" value={editUser.isActive} onChange={e => setEditUser({ ...editUser, isActive: e.target.value === 'true' })}>
                <option value="true">Active</option>
                <option value="false">Inactive (Deactivated)</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
