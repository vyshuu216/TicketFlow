import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Technical', 'Billing', 'Account', 'Network', 'Hardware', 'Software', 'HR', 'Other'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

export default function TicketForm({ onSuccess }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Technical',
    priority: 'medium',
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }
    setFiles(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.description.trim()) return toast.error('Description is required');

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      files.forEach((f) => formData.append('attachments', f));

      const { data } = await ticketsAPI.create(formData);
      toast.success(`Ticket ${data.ticket.ticketId} created successfully! 🎉`);
      if (onSuccess) {
        onSuccess(data.ticket);
      } else {
        navigate(`/tickets/${data.ticket._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="ticket-title">
          Title <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <input
          id="ticket-title"
          name="title"
          className="form-control"
          placeholder="Brief summary of the issue"
          value={form.title}
          onChange={handleChange}
          required
          autoFocus
          maxLength={200}
        />
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>
          {form.title.length}/200
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="ticket-category">Category</label>
          <select
            id="ticket-category"
            name="category"
            className="form-control"
            value={form.category}
            onChange={handleChange}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="ticket-priority">Priority</label>
          <select
            id="ticket-priority"
            name="priority"
            className="form-control"
            value={form.priority}
            onChange={handleChange}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="ticket-desc">
          Description <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <textarea
          id="ticket-desc"
          name="description"
          className="form-control"
          rows={5}
          placeholder="Describe the issue in detail. Include steps to reproduce, error messages, and expected behavior."
          value={form.description}
          onChange={handleChange}
          required
          style={{ resize: 'vertical', minHeight: 120 }}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="ticket-files">
          Attachments <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>(max 5 files, 10MB each)</span>
        </label>
        <input
          id="ticket-files"
          type="file"
          className="form-control"
          multiple
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip"
          onChange={handleFiles}
          style={{ padding: '8px 12px', cursor: 'pointer' }}
        />
        {files.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {files.map((f, i) => (
              <span
                key={i}
                style={{
                  fontSize: 11,
                  padding: '3px 8px',
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--accent)',
                  borderRadius: 4,
                  color: 'var(--accent-hover)',
                }}
              >
                📎 {f.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Priority helper */}
      <div
        style={{
          padding: '10px 14px',
          background: 'var(--bg-secondary)',
          borderRadius: 8,
          fontSize: 12,
          color: 'var(--text-secondary)',
          marginBottom: 16,
          border: '1px solid var(--border)',
        }}
      >
        <strong style={{ color: 'var(--text-primary)' }}>SLA Times:</strong>{' '}
        Critical: 2h · High: 8h · Medium: 24h · Low: 72h
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => navigate('/tickets')}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          id="ticket-submit"
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? '⏳ Submitting…' : '🎫 Submit Ticket'}
        </button>
      </div>
    </form>
  );
}
