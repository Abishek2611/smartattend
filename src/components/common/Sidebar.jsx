import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, Clock, Calendar, FileText, Users, LogOut, Building2, X } from 'lucide-react'

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/attendance', label: 'Attendance', icon: Clock },
  { to: '/admin/employees', label: 'Employees', icon: Users },
  { to: '/admin/leaves', label: 'Leave Requests', icon: FileText },
  { to: '/admin/departments', label: 'Departments', icon: Building2 },
]

const employeeLinks = [
  { to: '/employee', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/employee/checkin', label: 'Check In/Out', icon: Clock },
  { to: '/employee/attendance', label: 'My Attendance', icon: Calendar },
  { to: '/employee/leaves', label: 'My Leaves', icon: FileText },
]

export default function Sidebar({ setOpen }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const links = user?.role === 'admin' ? adminLinks : employeeLinks

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : (user?.first_name?.[0] || 'U').toUpperCase()

  return (
    <aside style={{
      width: 240,
      height: '100vh',
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    }}>
      {/* Logo Row */}
      <div style={{
        padding: '18px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Clock size={17} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem' }}>SmartAttend</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
              {user?.role}
            </div>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="sidebar-close"
          style={{
            display: 'none',
            background: 'var(--bg-card-2)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '5px 7px',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={17} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
        {links.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={() => setOpen(false)}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 13px',
              borderRadius: 10,
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: 3,
              transition: 'all 0.15s',
              background: isActive ? 'rgba(79,156,249,0.1)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
            })}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 10,
          background: 'var(--bg-card-2)', marginBottom: 8,
        }}>
          <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.72rem' }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '0.82rem', fontWeight: 600,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user?.full_name || user?.first_name || 'User'}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {user?.employee_id || user?.role}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 12px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 10,
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'all 0.15s',
            fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(248,113,113,0.08)'
            e.currentTarget.style.color = 'var(--danger)'
            e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-muted)'
            e.currentTarget.style.borderColor = 'var(--border)'
          }}
        >
          <LogOut size={15} /> Sign Out
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-close { display: flex !important; }
        }
      `}</style>
    </aside>
  )
}
