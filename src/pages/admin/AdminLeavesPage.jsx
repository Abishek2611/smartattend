import React, { useState, useEffect } from 'react'
import { FileText, Check, X, Search } from 'lucide-react'
import api from '../../services/api'

export default function AdminLeavesPage() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => { fetchData() }, [statusFilter])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/leaves/requests/?status=${statusFilter}`)
      setLeaves(res.data?.results || res.data || [])
    } catch { setLeaves([]) } finally { setLoading(false) }
  }

  const handleAction = async (id, action) => {
    setActionLoading(id + action)
    try {
      await api.post(`/leaves/requests/${id}/review/`, { action: action })
      fetchData()
    } catch { alert('Action failed') } finally { setActionLoading(null) }
  }

  const filtered = leaves.filter(l =>
    `${l.employee_name} ${l.leave_type_name}`.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave Requests</h1>
          <p className="page-subtitle">Review and manage employee leave requests</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" style={{ paddingLeft: 38 }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['pending', 'approved', 'rejected', 'all'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="btn btn-sm"
              style={{
                background: statusFilter === s ? 'var(--accent)' : 'var(--bg-card)',
                color: statusFilter === s ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${statusFilter === s ? 'var(--accent)' : 'var(--border)'}`,
                textTransform: 'capitalize',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card"><FileText size={40} /><p>No leave requests found</p></div>
      ) : (
        <>
          {/* Desktop */}
          <div className="desktop-table">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(l => (
                    <tr key={l.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.72rem' }}>
                            {(l.employee_name?.[0] || 'U').toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{l.employee_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.reason?.slice(0, 30)}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-info">{l.leave_type_name || l.leave_type}</span></td>
                      <td style={{ fontSize: '0.85rem' }}>{formatDate(l.start_date)}</td>
                      <td style={{ fontSize: '0.85rem' }}>{formatDate(l.end_date)}</td>
                      <td style={{ fontSize: '0.85rem' }}>{l.total_days || 1}d</td>
                      <td>
                        <span className={`badge ${l.status === 'approved' ? 'badge-success' : l.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                          {l.status}
                        </span>
                      </td>
                      <td>
                        {l.status === 'pending' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn btn-success btn-sm"
                              disabled={actionLoading === l.id + 'approved'}
                              onClick={() => handleAction(l.id, 'approved')}
                            >
                              <Check size={13} /> Approve
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              disabled={actionLoading === l.id + 'rejected'}
                              onClick={() => handleAction(l.id, 'rejected')}
                            >
                              <X size={13} /> Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="mobile-cards">
            {filtered.map(l => (
              <div key={l.id} className="card" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.75rem' }}>
                      {(l.employee_name?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{l.employee_name}</div>
                      <span className="badge badge-info" style={{ marginTop: 2 }}>{l.leave_type_name || l.leave_type}</span>
                    </div>
                  </div>
                  <span className={`badge ${l.status === 'approved' ? 'badge-success' : l.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                    {l.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                  {formatDate(l.start_date)} → {formatDate(l.end_date)} ({l.total_days || 1} days)
                </div>
                {l.reason && <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>"{l.reason}"</div>}
                {l.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-success btn-sm" style={{ flex: 1 }} onClick={() => handleAction(l.id, 'approved')}>
                      <Check size={13} /> Approve
                    </button>
                    <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => handleAction(l.id, 'rejected')}>
                      <X size={13} /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
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
