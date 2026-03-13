import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, CheckCircle, XCircle, TrendingUp, FileText, ArrowRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../../services/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/attendance/admin/dashboard/').then(r => {
      setStats(r.data)
    }).catch(() => {
      setStats({
        total_employees: 0, present_today: 0,
        absent_today: 0, attendance_rate: 0,
        weekly_trend: [], department_stats: [],
        pending_leaves: [],
      })
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner" />
    </div>
  )

  const trend = stats?.weekly_trend || []
  const deptStats = stats?.department_summary || []
  const pendingLeaves = stats?.pending_leaves || []

  const pieData = [
    { name: 'Present', value: stats?.present_today || 0, color: '#34d399' },
    { name: 'Absent', value: stats?.absent_today || 0, color: '#f87171' },
    { name: 'On Leave', value: stats?.on_leave_today || 0, color: '#fbbf24' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening today.</p>
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Total Employees', value: stats?.total_employees, icon: Users, color: '#4f9cf9', bg: 'rgba(79,156,249,0.12)' },
          { label: 'Present Today', value: stats?.present_today, icon: CheckCircle, color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
          { label: 'Absent Today', value: stats?.absent_today, icon: XCircle, color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
          { label: 'Attendance Rate', value: `${stats?.attendance_rate || 0}%`, icon: TrendingUp, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div className="stat-value" style={{ color }}>{value ?? '-'}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16, marginBottom: 24,
      }}>
        {/* Trend Chart */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>
            7-Day Attendance Trend
          </h3>
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trend}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#7a8499' }} />
                <YAxis tick={{ fontSize: 11, fill: '#7a8499' }} />
                <Tooltip
                  contentStyle={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8 }}
                  labelStyle={{ color: '#f0f4ff' }}
                />
                <Line type="monotone" dataKey="present" stroke="#4f9cf9" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <TrendingUp size={32} />
              <p style={{ fontSize: '0.85rem' }}>No trend data yet</p>
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>
            Today's Attendance Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.8rem' }} />
              <Tooltip contentStyle={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* By Department */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>
            By Department
          </h3>
          {deptStats.length > 0 ? deptStats.map(d => (
            <div key={d.department} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: '0.88rem' }}>{d.department}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {d.present}/{d.total}
                </span>
                <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                  {d.total > 0 ? Math.round((d.present / d.total) * 100) : 0}%
                </span>
              </div>
            </div>
          )) : (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <p style={{ fontSize: '0.85rem' }}>No department data</p>
            </div>
          )}
        </div>

        {/* Pending Leaves */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>Pending Leaves</h3>
            <Link to="/admin/leaves" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          {pendingLeaves.length > 0 ? pendingLeaves.slice(0, 4).map(l => (
            <div key={l.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid var(--border)',
            }}>
              <div>
                <div style={{ fontSize: '0.87rem', fontWeight: 500 }}>{l.employee_name}</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{l.leave_type}</div>
              </div>
              <span className="badge badge-warning">Pending</span>
            </div>
          )) : (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <FileText size={28} />
              <p style={{ fontSize: '0.85rem' }}>All clear! No pending leave requests</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
