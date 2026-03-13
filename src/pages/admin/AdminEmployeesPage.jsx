import React, { useState, useEffect } from 'react'
import { Users, Plus, Search, X, Mail, Phone, Building2, Calendar } from 'lucide-react'
import api from '../../services/api'

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', username: '',
    employee_id: '', phone: '', department: '', password: '', role: 'employee',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get('/auth/employees/'),
        api.get('/auth/departments/'),
      ])
      setEmployees(empRes.data?.results || empRes.data || [])
      setDepartments(deptRes.data?.results || deptRes.data || [])
    } catch { } finally { setLoading(false) }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/auth/employees/', {
    ...form,
    confirm_password: form.password
})
      setShowModal(false)
      setForm({ first_name: '', last_name: '', email: '', username: '', employee_id: '', phone: '', department: '', password: '', role: 'employee' })
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create employee')
    } finally { setSaving(false) }
  }

  const filtered = employees.filter(e =>
    `${e.first_name} ${e.last_name} ${e.email} ${e.employee_id}`.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner" />
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">{employees.length} total employees</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Employee
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 360 }}>
        <Search size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="form-input"
          style={{ paddingLeft: 40 }}
          placeholder="Search employees..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Employee Cards - Mobile / Table - Desktop */}
      <div className="desktop-table">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="empty-state"><Users size={32} /><p>No employees found</p></div>
                </td></tr>
              ) : filtered.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.75rem' }}>
                        {(emp.first_name?.[0] || 'U').toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{emp.first_name} {emp.last_name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-info">{emp.employee_id || '—'}</span></td>
                  <td>{emp.department_name || '—'}</td>
                  <td>{emp.phone || '—'}</td>
                  <td><span className={`badge ${emp.role === 'admin' ? 'badge-warning' : 'badge-muted'}`}>{emp.role}</span></td>
                  <td><span className={`badge ${emp.is_active ? 'badge-success' : 'badge-danger'}`}>{emp.is_active ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="mobile-cards">
        {filtered.length === 0 ? (
          <div className="empty-state card"><Users size={32} /><p>No employees found</p></div>
        ) : filtered.map(emp => (
          <div key={emp.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div className="avatar">{(emp.first_name?.[0] || 'U').toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{emp.first_name} {emp.last_name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{emp.email}</div>
              </div>
              <span className={`badge ${emp.is_active ? 'badge-success' : 'badge-danger'}`}>
                {emp.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { icon: Mail, label: 'ID', value: emp.employee_id || '—' },
                { icon: Building2, label: 'Dept', value: emp.department_name || '—' },
                { icon: Phone, label: 'Phone', value: emp.phone || '—' },
                { icon: Calendar, label: 'Role', value: emp.role },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{
                  background: 'var(--bg-card-2)', borderRadius: 8,
                  padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <Icon size={13} color="var(--text-muted)" />
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{label}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Add Employee</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input className="form-input" required value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input className="form-input" required value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Username *</label>
                    <input className="form-input" required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Employee ID *</label>
                    <input className="form-input" required value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select className="form-input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                      <option value="">Select...</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select className="form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input className="form-input" type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Employee'}
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
