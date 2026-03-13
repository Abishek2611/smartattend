import React, { useState, useEffect } from 'react'
import { FileText, Plus, X } from 'lucide-react'
import api from '../../services/api'

export default function EmployeeLeavesPage() {
  const [leaves, setLeaves] = useState([])
  const [leaveTypes, setLeaveTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ leave_type: '', start_date: '', end_date: '', reason: '' })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [lRes, ltRes] = await Promise.all([
        api.get('/leaves/requests/'),
        api.get('/leaves/types/'),
      ])
      setLeaves(lRes.data?.results || lRes.data || [])
      setLeaveTypes(ltRes.data?.results || ltRes.data || [])
    } catch { } finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/leaves/requests/', form)
      setShowModal(false)
      setForm({ leave_type: '', start_date: '', end_date: '', reason: '' })
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit leave request')
    } finally { setSaving(false) }
  }

  const formatDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner" />
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Leaves</h1>
          <p className="page-subtitle">Manage your leave requests</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Apply for Leave
        </button>
      </div>

      {leaves.length === 0 ? (
        <div className="empty-state card">
          <FileText size={40} />
          <p>No leave requests yet</p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            Apply Now
          </button>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="desktop-table">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map(l => (
                    <tr key={l.id}>
                      <td><span className="badge badge-info">{l.leave_type_name || l.leave_type}</span></td>
                      <td style={{ fontSize: '0.88rem' }}>{formatDate(l.start_date)}</td>
                      <td style={{ fontSize: '0.88rem' }}>{formatDate(l.end_date)}</td>
                      <td style={{ fontSize: '0.88rem' }}>{l.total_days || 1}d</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.reason}
                      </td>
                      <td>
                        <span className={`badge ${l.status === 'approved' ? 'badge-success' : l.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="mobile-cards">
            {leaves.map(l => (
              <div key={l.id} className="card" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span className="badge badge-info">{l.leave_type_name || l.leave_type}</span>
                  <span className={`badge ${l.status === 'approved' ? 'badge-success' : l.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                    {l.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>From: </span>
                  {formatDate(l.start_date)} → {formatDate(l.end_date)}
                  <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>({l.total_days || 1} days)</span>
                </div>
                {l.reason && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>"{l.reason}"</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Apply for Leave</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Leave Type *</label>
                  <select 
  className="form-input" 
  required 
  value={form.leave_type} 
  onChange={e => setForm({ ...form, leave_type: e.target.value })}
  size="1"
  style={{ 
    width: '100%',
    maxWidth: '100%',
    fontSize: '0.9rem',
  }}
>
  <option value="">Select leave type...</option>
  {leaveTypes.map(lt => <option key={lt.id} value={lt.id}>{lt.name}</option>)}
</select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Start Date *</label>
                    <input className="form-input" type="date" required value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date *</label>
                    <input className="form-input" type="date" required value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Reason *</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    required
                    placeholder="Reason for leave..."
                    value={form.reason}
                    onChange={e => setForm({ ...form, reason: e.target.value })}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .mobile-cards { display: none; }
        @media (max-width: 768px) {
          .desktop-table { display: none; }
          .mobile-cards { display: block; }
        }
      `}</style>
    </div>
  )
}
