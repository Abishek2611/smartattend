import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Calendar, FileText, CheckCircle, ArrowRight, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/attendance/admin/dashboard/').then(r => setData(r.data))
      .catch(() => setData({ is_checked_in: false, today_record: null, monthly_stats: {}, weekly_attendance: [] }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner" />
    </div>
  )

  const today = data?.today_record
  const stats = data?.monthly_stats || {}
  const weekly = data?.weekly_attendance || []
  const isCheckedIn = data?.is_checked_in

  const formatTime = (t) => t ? new Date(t).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.first_name}! 👋
          </h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Check In Status Card */}
      <div className="card" style={{
        marginBottom: 20,
        background: isCheckedIn
          ? 'linear-gradient(135deg, rgba(52,211,153,0.1), rgba(52,211,153,0.05))'
          : 'linear-gradient(135deg, rgba(79,156,249,0.1), rgba(79,156,249,0.05))',
        border: `1px solid ${isCheckedIn ? 'rgba(52,211,153,0.2)' : 'rgba(79,156,249,0.2)'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: isCheckedIn ? 'rgba(52,211,153,0.2)' : 'rgba(79,156,249,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isCheckedIn ? <CheckCircle size={26} color="var(--success)" /> : <Clock size={26} color="var(--accent)" />}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
                {isCheckedIn ? 'You are Checked In' : 'Not Checked In Yet'}
              </div>
              {today?.check_in_time && (
                <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Checked in at {formatTime(today.check_in_time)}
                  {today.check_out_time && ` • Checked out at ${formatTime(today.check_out_time)}`}
                </div>
              )}
            </div>
          </div>
          <Link to="/employee/checkin" className="btn btn-primary">
            {isCheckedIn ? 'Check Out' : 'Check In Now'} <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Present Days', value: stats.present_days || 0, icon: CheckCircle, color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
          { label: 'Absent Days', value: stats.absent_days || 0, icon: Calendar, color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
          { label: 'Leave Days', value: stats.leave_days || 0, icon: FileText, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
          { label: 'Avg Hours/Day', value: `${stats.avg_hours || 0}h`, icon: TrendingUp, color: '#4f9cf9', bg: 'rgba(79,156,249,0.12)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <div className="stat-value" style={{ color }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Weekly Chart */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>
            This Week
          </h3>
          {weekly.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weekly}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#7a8499' }} />
                <YAxis tick={{ fontSize: 11, fill: '#7a8499' }} />
                <Tooltip
                  contentStyle={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8 }}
                />
                <Bar dataKey="hours" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <TrendingUp size={28} />
              <p style={{ fontSize: '0.85rem' }}>No data yet this week</p>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { to: '/employee/checkin', icon: Clock, label: 'Check In / Out', color: 'var(--accent)', bg: 'rgba(79,156,249,0.1)' },
              { to: '/employee/leaves', icon: FileText, label: 'Apply for Leave', color: 'var(--success)', bg: 'rgba(52,211,153,0.1)' },
              { to: '/employee/attendance', icon: Calendar, label: 'View Attendance', color: 'var(--warning)', bg: 'rgba(251,191,36,0.1)' },
            ].map(({ to, icon: Icon, label, color, bg }) => (
              <Link key={to} to={to} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                background: bg,
                borderRadius: 12,
                textDecoration: 'none',
                transition: 'opacity 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={17} color={color} />
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>{label}</span>
                <ArrowRight size={14} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
