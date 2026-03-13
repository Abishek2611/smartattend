import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Menu } from 'lucide-react'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 998,
          }}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar-wrapper${sidebarOpen ? ' open' : ''}`}
        style={{
          position: 'fixed',
          left: 0, top: 0,
          height: '100vh',
          width: 240,
          zIndex: 999,
          transition: 'transform 0.3s ease',
        }}
      >
        <Sidebar setOpen={setSidebarOpen} />
      </div>

      {/* Main */}
      <div className="main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Mobile Top Bar */}
        <div className="mobile-topbar">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>
            SmartAttend
          </span>
        </div>

        {/* Page Content */}
        <div className="page-content">
          <Outlet />
        </div>
      </div>

      <style>{`
        /* Desktop */
        .sidebar-wrapper { transform: translateX(0); }
        .main-wrapper { margin-left: 240px; }
        .mobile-topbar { display: none; }
        .page-content { padding: 28px 24px; flex: 1; }

        /* Mobile */
        @media (max-width: 768px) {
          .sidebar-wrapper { transform: translateX(-100%); }
          .sidebar-wrapper.open { transform: translateX(0); }
          .main-wrapper { margin-left: 0; width: 100%; }
          .mobile-topbar {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: var(--bg-card);
            border-bottom: 1px solid var(--border);
            position: sticky;
            top: 0;
            z-index: 100;
          }
          .hamburger-btn {
            background: var(--bg-card-2);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 7px 9px;
            cursor: pointer;
            color: var(--text);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .page-content { padding: 16px 14px; }
        }
      `}</style>
    </div>
  )
}
