import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">⚡</span>
              <span>Speedy<strong>Texas</strong></span>
            </div>
            <p>Your shortcut from America to the Gulf. Fast, reliable shipping from the USA to Gulf countries.</p>
            <div className="footer-social">
              <a href="#" aria-label="Twitter">𝕏</a>
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="WhatsApp">💬</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Services</h4>
            <ul>
              <li><a href="/#services">Air Freight</a></li>
              <li><a href="/#services">Door-to-Door</a></li>
              <li><a href="/#services">Consolidation</a></li>
              <li><a href="/#services">Vehicle Shipping</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li><Link to="/signup">Create Account</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/tracking">Track Shipment</Link></li>
              <li><Link to="/calculator">Rate Calculator</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:support@speedy-tx.com">support@speedy-tx.com</a></li>
              <li><a href="tel:+18321234567">+1 (832) 123-4567</a></li>
              <li>Houston, TX — USA</li>
              <li>Mon–Fri: 9am–6pm CST</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Speedy Texas. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
