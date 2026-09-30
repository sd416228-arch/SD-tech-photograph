import { useState } from 'react'

function Navbar({ businessName = 'PicturesSquad Studio' }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev)
  }

  const closeMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <header className="site-header">
      <div className="header-container">
        <a className="brand" href="#top" aria-label={`${businessName} home`}>
          <span className="brand-logo-text">{businessName || 'PicturesSquad'}</span>
        </a>

        <nav className={`desktop-nav ${mobileMenuOpen ? 'mobile-open' : ''}`} aria-label="Primary navigation">
          <a className="nav-link active" href="#top" onClick={closeMenu}>Home</a>
          <a className="nav-link" href="#about" onClick={closeMenu}>About</a>
          <a className="nav-link" href="#portfolio" onClick={closeMenu}>Portfolio</a>
          <a className="nav-link" href="#services" onClick={closeMenu}>Services</a>
          <a className="nav-link" href="#contact" onClick={closeMenu}>Contact</a>
        </nav>

        <div className="header-right-actions">
          <a className="pill-button header-cta" href="#contact">
            Book a Shoot
          </a>
          <button 
            type="button" 
            className="menu-toggle-btn" 
            onClick={toggleMobileMenu} 
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="menu-bar"></span>
            <span className="menu-bar"></span>
            <span className="menu-bar"></span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
