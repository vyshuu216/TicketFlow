import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['Technical', 'Billing', 'Account', 'Network', 'Hardware', 'Software', 'HR', 'Other'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

export default function CreateTicket() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Technical',
    priority: 'medium',
    department: user?.department || 'General',
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return toast.error('Title and description required');
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      files.forEach(f => formData.append('attachments', f));
      const { data } = await ticketsAPI.create(formData);
      toast.success(`Ticket ${data.ticket.ticketId} created! 🎉`);
      navigate(`/tickets/${data.ticket._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const newFiles = Array.from(e.dataTransfer.files).slice(0, 5);
    setFiles(prev => [...prev, ...newFiles].slice(0, 5));
  };

  const priorityColors = { low: 'var(--success)', medium: 'var(--warning)', high: 'var(--priority-high)', critical: 'var(--danger)' };

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Create New Ticket</h1>
          <p className="page-subtitle">Describe your issue and we'll assign it to the right agent</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="ticket-title">Subject / Title *</label>
            <input id="ticket-title" type="text" className="form-control"
              placeholder="Brief description of your issue"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="ticket-desc">Description *</label>
            <textarea id="ticket-desc" className="form-control"
              placeholder="Provide detailed information about your issue, steps to reproduce, expected vs actual behavior…"
              rows={6}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              required style={{ minHeight: 140 }} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="ticket-category">Category</label>
              <select id="ticket-category" className="form-control"
                value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ticket-dept">Department</label>
              <select id="ticket-dept" className="form-control"
                value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                {['General', 'IT', 'HR', 'Finance', 'Operations', 'Sales', 'Support'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Priority Selector */}
          <div className="form-group">
            <label className="form-label">Priority</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {PRIORITIES.map(p => (
                <button key={p} type="button"
                  onClick={() => setForm({ ...form, priority: p })}
                  style={{
                    flex: 1, padding: '9px 8px', borderRadius: 8, border: `2px solid`,
                    borderColor: form.priority === p ? priorityColors[p] : 'var(--border)',
                    background: form.priority === p ? `${priorityColors[p]}18` : 'var(--bg-input)',
                    color: form.priority === p ? priorityColors[p] : 'var(--text-muted)',
                    fontWeight: 600, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize',
                    transition: 'all 0.2s'
                  }}>
                  {p === 'critical' ? '⚡' : p === 'high' ? '↑' : p === 'medium' ? '→' : '↓'} {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="card" style={{ marginBottom: 24 }}>
          <label className="form-label">Attachments (max 5 files, 10MB each)</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 10, padding: '24px', textAlign: 'center',
              background: dragOver ? 'var(--accent-dim)' : 'var(--bg-input)',
              transition: 'all 0.2s', cursor: 'pointer'
            }}
            onClick={() => document.getElementById('file-upload').click()}>
            <input id="file-upload" type="file" multiple style={{ display: 'none' }}
              onChange={e => setFiles(Array.from(e.target.files).slice(0, 5))} />
            <div style={{ fontSize: 28, marginBottom: 8 }}>📎</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Drag & drop files here or <span style={{ color: 'var(--accent-hover)', fontWeight: 600 }}>browse</span></p>
          </div>
          {files.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {files.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-hover)', padding: '4px 10px', borderRadius: 6, fontSize: 12 }}>
                  📄 {f.name}
                  <button type="button" onClick={() => setFiles(files.filter((_, fi) => fi !== i))}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button id="create-ticket-submit" type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 140 }}>
            {loading ? '⏳ Submitting…' : '🎫 Submit Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}
