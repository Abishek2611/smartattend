import React, { useState, useEffect } from 'react'
import { Search, Filter, Clock, MapPin } from 'lucide-react'
import api from '../../services/api'

export default function AdminAttendancePage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split('T')[0])

  useEffect(() => { fetchData() }, [dateFilter])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/attendance/admin/all/?date=${dateFilter}`)
      setRecords(res.data?.results || res.data || [])
    } catch { setRecords([]) } finally { setLoading(false) }
  }

  const filtered = records.filter(r =>
    `${r.employee_name} ${r.employee_id}`.toLowerCase().includes(search.toLowerCase())
  )

  const formatTime = (t) => t ? new Date(t).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'

  const getStatus = (r) => {
    if (!r.check_in_time) return <span className="badge badge-danger">Absent</span>
    if (!r.check_out_time) return <span className="badge badge-warning">Checked In</span>
    return <span className="badge badge-success">Present</span>
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Monitor daily attendance records</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flex: '1', minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 38 }}
            placeholder="Search employee..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '0 12px' }}>
          <Filter size={14} color="var(--text-muted)" />
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            style={{ background: 'none', border: 'none', color: 'var(--text)', fontFamily: 'Inter', fontSize: '0.88rem', cursor: 'pointer', padding: '10px 0' }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total', value: records.length, color: 'var(--accent)' },
          { label: 'Present', value: records.filter(r => r.check_in_time).length, color: 'var(--success)' },
          { label: 'Absent', value: records.filter(r => !r.check_in_time).length, color: 'var(--danger)' },
          { label: 'Checked Out', value: records.filter(r => r.check_out_time).length, color: 'var(--text-muted)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ textAlign: 'center', padding: '14px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="spinner" /></div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="desktop-table">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Total Hours</th>
                    <th>GPS Distance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6}>
                      <div className="empty-state"><Clock size={32} /><p>No records for this date</p></div>
                    </td></tr>
                  ) : filtered.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.72rem' }}>
                            {(r.employee_name?.[0] || 'U').toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{r.employee_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.employee_id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.88rem' }}>{formatTime(r.check_in_time)}</td>
                      <td style={{ fontSize: '0.88rem' }}>{formatTime(r.check_out_time)}</td>
                      <td style={{ fontSize: '0.88rem' }}>{r.total_hours ? `${r.total_hours}h` : '—'}</td>
                      <td style={{ fontSize: '0.88rem' }}>{r.distance_from_office ? `${r.distance_from_office}m` : '—'}</td>
                      <td>{getStatus(r)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="mobile-cards">
            {filtered.length === 0 ? (
              <div className="empty-state card"><Clock size={32} /><p>No records for this date</p></div>
            ) : filtered.map(r => (
              <div key={r.id} className="card" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.75rem' }}>
                      {(r.employee_name?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.employee_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.employee_id}</div>
                    </div>
                  </div>
                  {getStatus(r)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { icon: Clock, label: 'Check In', value: formatTime(r.check_in_time) },
                    { icon: Clock, label: 'Check Out', value: formatTime(r.check_out_time) },
                    { icon: Clock, label: 'Total Hours', value: r.total_hours ? `${r.total_hours}h` : '—' },
                    { icon: MapPin, label: 'Distance', value: r.distance_from_office ? `${r.distance_from_office}m` : '—' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} style={{ background: 'var(--bg-card-2)', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{value}</div>
                    </div>
                  ))}
                </div>
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
