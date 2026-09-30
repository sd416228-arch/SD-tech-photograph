import { useState } from 'react'
import Navbar from './Navbar'
import heroCameraImg from '../assets/hero-camera.jpg'

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
    title: 'Professional',
    description: 'High-end equipment for perfect shots',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: 'Fast Delivery',
    description: 'Quick turnaround for every project',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: 'Creative',
    description: 'Unique concepts that stand out',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: 'Passionate',
    description: 'We love what we do and it shows',
  },
]

function Hero({ settings }) {
  const [showreelOpen, setShowreelOpen] = useState(false)

  const socialLinks = {
    instagram: settings?.instagram_url || '#',
    facebook: settings?.facebook_url || '#',
    twitter: settings?.twitter_url || '#',
    youtube: settings?.youtube_url || '#',
  }

  return (
    <section className="canon-hero-section" id="top">
      {/* Top Navigation */}
      <Navbar businessName={settings?.business_name || 'SD Tech Photograph'} />

      <div className="canon-hero-main page-container">
        {/* Left Vertical Social Sidebar */}
        <aside className="canon-social-sidebar" aria-label="Social links">
          <div className="social-line" aria-hidden="true" />
          <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="social-tag">IG</a>
          <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="social-tag">FB</a>
          <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="social-tag">TW</a>
          <a href={socialLinks.youtube} target="_blank" rel="noreferrer" className="social-tag">YT</a>
        </aside>

        {/* Hero Content Left */}
        <div className="canon-hero-content">
          <div className="canon-hero-badge">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span>Capture Moments</span>
          </div>

          <h1 className="canon-hero-title">
            We Capture<br />
            What <span className="highlight-warm">Matters</span>
          </h1>

          <p className="canon-hero-subtitle">
            Professional photography services for your most valuable moments. Let's create something beautiful together.
          </p>

          <div className="canon-hero-actions">
            <a href="#portfolio" className="pill-action-button">
              <span>View Portfolio</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>

            <button 
              type="button" 
              className="showreel-button"
              onClick={() => setShowreelOpen(true)}
              aria-label="Watch Showreel video"
            >
              <span className="play-icon-circle">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </span>
              <span className="showreel-label">Watch Showreel</span>
            </button>
          </div>
        </div>

        {/* Hero Visual Right */}
        <div className="canon-hero-visual-wrapper">
          <div className="camera-display-container">
            <img 
              src={heroCameraImg} 
              alt="High-end DSLR camera capturing sunset moment on modern pedestal" 
              className="camera-hero-img"
              loading="eager"
            />
            <div className="visual-ambient-glow" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Floating Bottom Feature Strip */}
      <div className="page-container floating-feature-container">
        <div className="floating-feature-bar">
          {features.map((item, idx) => (
            <div className="feature-item" key={idx}>
              <div className="feature-icon-bubble">
                {item.icon}
              </div>
              <div className="feature-text">
                <strong className="feature-title">{item.title}</strong>
                <p className="feature-desc">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Showreel Modal */}
      {showreelOpen && (
        <div className="public-gallery-backdrop" role="presentation" onClick={() => setShowreelOpen(false)}>
          <div className="showreel-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className="public-gallery-close" 
              aria-label="Close Showreel" 
              onClick={() => setShowreelOpen(false)}
            >
              &times;
            </button>
            <div className="showreel-video-container">
              <iframe
                title="Photography Showreel"
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="showreel-caption">
              <strong>SD Tech Photograph Showreel & Highlights</strong>
              <span>Capturing authentic life moments</span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Hero
