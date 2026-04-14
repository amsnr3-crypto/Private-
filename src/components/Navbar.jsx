import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './Navbar.css'

const Logo = () => (
  <Link to="/" className="navbar-logo">
    <span className="logo-icon">⚡</span>
    <span>Speedy<strong>Texas</strong></span>
  </Link>
)

export default function Navbar({ variant = 'transparent' }) {
  const [scrolled, setScrolled]     = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [userInitial, setUserInitial] = useState('?')
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const isDashboard = ['/dashboard', '/new-shipment', '/tracking', '/calculator'].includes(location.pathname)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const name = data.session?.user?.user_metadata?.first_name || ''
      setUserInitial(name.charAt(0).toUpperCase() || '?')
    })
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [location])

  if (isDashboard) {
    return (
      <nav className="navbar navbar-app">
        <div className="container navbar-inner">
          <Logo />
          <div className="navbar-app-links">
            <Link to="/dashboard"    className={location.pathname === '/dashboard'    ? 'active' : ''}>Dashboard</Link>
            <Link to="/new-shipment" className={location.pathname === '/new-shipment' ? 'active' : ''}>New Shipment</Link>
            <Link to="/tracking"     className={location.pathname === '/tracking'     ? 'active' : ''}>Tracking</Link>
            <Link to="/calculator"   className={location.pathname === '/calculator'   ? 'active' : ''}>Calculator</Link>
          </div>
          <div className="navbar-right">
            <div className="user-avatar">{userInitial}</div>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
          </div>
          <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
        {menuOpen && (
          <div className="mobile-menu mobile-menu-app">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/new-shipment">New Shipment</Link>
            <Link to="/tracking">Tracking</Link>
            <Link to="/calculator">Calculator</Link>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </nav>
    )
  }

  return (
    <nav className={`navbar navbar-landing ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Logo />
        <div className="navbar-links">
          <a href="/#services">Services</a>
          <a href="/#how-it-works">How It Works</a>
          <a href="/#trust">Why Us</a>
          <Link to="/calculator">Calculator</Link>
          <Link to="/tracking">Track</Link>
        </div>
        <div className="navbar-right">
          <Link to="/login"  className="btn btn-outline btn-sm">Login</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
      {menuOpen && (
        <div className="mobile-menu">
          <a href="/#services"     onClick={() => setMenuOpen(false)}>Services</a>
          <a href="/#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="/#trust"        onClick={() => setMenuOpen(false)}>Why Us</a>
          <Link to="/calculator"   onClick={() => setMenuOpen(false)}>Calculator</Link>
          <Link to="/tracking"     onClick={() => setMenuOpen(false)}>Track</Link>
          <Link to="/login"  className="btn btn-outline btn-sm">Login</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      )}
    </nav>
  )
}