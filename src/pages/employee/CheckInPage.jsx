import React, { useState, useEffect, useRef } from 'react'
import { MapPin, Camera, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react'
import api from '../../services/api'

export default function CheckInPage() {
  const [status, setStatus] = useState('idle') // idle, locating, ready, checking, success, error
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState('')
  const [distance, setDistance] = useState(null)
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [todayRecord, setTodayRecord] = useState(null)
  const [selfie, setSelfie] = useState(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [message, setMessage] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    fetchTodayStatus()
    getLocation()
    return () => stopCamera()
  }, [])

  const fetchTodayStatus = async () => {
    try {
      const res = await api.get('/attendance/today/')
      setIsCheckedIn(res.data?.is_checked_in || false)
      setTodayRecord(res.data?.record || null)
    } catch { }
  }

  const getLocation = () => {
    setStatus('locating')
    setLocationError('')
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported')
      setStatus('error')
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setStatus('ready')
      },
      err => {
        setLocationError('Location access denied. Please allow location.')
        setStatus('error')
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraActive(true)
    } catch {
      alert('Camera access denied. Please allow camera access.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  const captureSelfie = () => {
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
    setSelfie(canvas.toDataURL('image/jpeg', 0.7))
    stopCamera()
  }

  const handleCheckIn = async () => {
    if (!location) return
    setStatus('checking')
    setMessage('')
    try {
      const payload = {
        latitude: location.lat,
        longitude: location.lng,
      }
      if (selfie) payload.selfie = selfie

      const res = await api.post('/attendance/check-in/', payload)
      setDistance(res.data?.distance)
      setIsCheckedIn(true)
      setStatus('success')
      setMessage(res.data?.message || 'Checked in successfully!')
      fetchTodayStatus()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Check-in failed'
      setMessage(msg)
      setDistance(err.response?.data?.distance)
      setStatus('error')
    }
  }

  const handleCheckOut = async () => {
    setStatus('checking')
    setMessage('')
    try {
      const payload = { latitude: location?.lat, longitude: location?.lng }
      const res = await api.post('/attendance/check-out/', payload)
      setIsCheckedIn(false)
      setStatus('success')
      setMessage(res.data?.message || 'Checked out successfully!')
      fetchTodayStatus()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Check-out failed')
      setStatus('error')
    }
  }

  const formatTime = t => t ? new Date(t).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Check In / Out</h1>
          <p className="page-subtitle">GPS-verified attendance with selfie</p>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        {/* Today Status */}
        {todayRecord && (
          <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Check In', value: formatTime(todayRecord.check_in_time), color: 'var(--success)' },
              { label: 'Check Out', value: formatTime(todayRecord.check_out_time), color: 'var(--danger)' },
              { label: 'Total Hours', value: todayRecord.total_hours ? `${todayRecord.total_hours}h` : '—', color: 'var(--accent)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ flex: 1, minWidth: 100, textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Location Status */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: location ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <MapPin size={20} color={location ? 'var(--success)' : 'var(--warning)'} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                {status === 'locating' ? 'Getting your location...' :
                  location ? 'Location detected ✓' : 'Location not available'}
              </div>
              {locationError && <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: 2 }}>{locationError}</div>}
              {location && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </div>}
              {distance && <div style={{ fontSize: '0.8rem', color: 'var(--warning)', marginTop: 2 }}>
                {distance}m from office
              </div>}
            </div>
            {locationError && (
              <button className="btn btn-ghost btn-sm" onClick={getLocation}>Retry</button>
            )}
          </div>
        </div>

        {/* Selfie Section */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Camera size={17} /> Selfie Verification
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
            </div>
            {!selfie && !cameraActive && (
              <button className="btn btn-ghost btn-sm" onClick={startCamera}>Open Camera</button>
            )}
          </div>

          {cameraActive && (
            <div>
              <video ref={videoRef} autoPlay playsInline muted
                style={{ width: '100%', borderRadius: 12, background: '#000', maxHeight: 280, objectFit: 'cover' }}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={captureSelfie}>
                  <Camera size={15} /> Capture
                </button>
                <button className="btn btn-ghost" onClick={stopCamera}>Cancel</button>
              </div>
            </div>
          )}

          {selfie && (
            <div>
              <img src={selfie} alt="selfie" style={{ width: '100%', borderRadius: 12, maxHeight: 240, objectFit: 'cover' }} />
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 8, width: '100%' }} onClick={() => setSelfie(null)}>
                Retake
              </button>
            </div>
          )}

          {!cameraActive && !selfie && (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Camera not opened yet
            </div>
          )}
        </div>

        {/* Message */}
        {message && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 12,
            marginBottom: 16,
            background: status === 'success' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
            border: `1px solid ${status === 'success' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
            color: status === 'success' ? 'var(--success)' : 'var(--danger)',
            fontSize: '0.88rem',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {status === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            {message}
          </div>
        )}

        {/* Action Button */}
        {!isCheckedIn ? (
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            onClick={handleCheckIn}
            disabled={!location || status === 'checking' || status === 'locating'}
          >
            {status === 'checking' ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Checking in...
              </span>
            ) : (
              <><Clock size={18} /> Check In Now</>
            )}
          </button>
        ) : (
          <button
            className="btn btn-danger"
            style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            onClick={handleCheckOut}
            disabled={status === 'checking'}
          >
            {status === 'checking' ? 'Checking out...' : <><XCircle size={18} /> Check Out</>}
          </button>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
