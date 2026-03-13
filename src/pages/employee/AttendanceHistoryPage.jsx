import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, TrendingUp } from 'lucide-react'
import api from '../../services/api'

export default function AttendanceHistoryPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => { fetchData() }, [month])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/attendance/history/?month=${month}`)
      setRecords(res.data?.results || res.data || [])
    } catch { setRecords([]) } finally { setLoading(false) }
  }

  const formatTime = t => t ? new Date(t).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'
  const formatDate = d => d ? new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : '—'

  const presentDays = records.filter(r => r.check_in_time).length
  const totalHours = records.reduce((sum, r) => sum + (r.total_hours || 0), 0)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Attendance</h1>
          <p className="page-subtitle">Your attendance history</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '9px 14px',
            color: 'var(--text)',
            fontFamily: 'Inter',
            fontSize: '0.88rem',
            cursor: 'pointer',
          }}
        />
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Present Days', value: presentDays, color: 'var(--success)', icon: Calendar },
          { label: 'Total Hours', value: `${totalHours.toFixed(1)}h`, color: 'var(--accent)', icon: Clock },
          { label: 'Avg Hours/Day', value: presentDays > 0 ? `${(totalHours / presentDays).toFixed(1)}h` : '0h', color: 'var(--warning)', icon: TrendingUp },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: `${color}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="spinner" /></div>
      ) : records.length === 0 ? (
        <div className="empty-state card"><Calendar size={40} /><p>No records for this month</p></div>
      ) : (
        <>
          {/* Desktop */}
          <div className="desktop-table">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Total Hours</th>
                    <th>Distance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 500 }}>{formatDate(r.date)}</td>
                      <td>{formatTime(r.check_in_time)}</td>
                      <td>{formatTime(r.check_out_time)}</td>
                      <td>{r.total_hours ? `${r.total_hours}h` : '—'}</td>
                      <td>{r.distance_from_office ? `${r.distance_from_office}m` : '—'}</td>
                      <td>
                        {r.check_in_time
                          ? <span className="badge badge-success">Present</span>
                          : <span className="badge badge-danger">Absent</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="mobile-cards">
            {records.map(r => (
              <div key={r.id} className="card" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: r.check_in_time ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Calendar size={20} color={r.check_in_time ? 'var(--success)' : 'var(--danger)'} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{formatDate(r.date)}</span>
                    {r.check_in_time
                      ? <span className="badge badge-success">Present</span>
                      : <span className="badge badge-danger">Absent</span>}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {r.check_in_time && <span><Clock size={11} style={{ marginRight: 3 }} />{formatTime(r.check_in_time)} – {formatTime(r.check_out_time)}</span>}
                    {r.total_hours && <span>{r.total_hours}h total</span>}
                    {r.distance_from_office && <span><MapPin size={11} style={{ marginRight: 3 }} />{r.distance_from_office}m</span>}
                  </div>
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
