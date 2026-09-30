function isSafeUrl(value) {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

function SocialIcon({ type }) {
  if (type === 'instagram') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" className="social-icon-fill" /></svg>
  }

  if (type === 'facebook') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 21v-8h3l.5-3H14V8.2c0-.9.3-1.5 1.6-1.5h1.9V4a22 22 0 0 0-2.7-.2c-2.7 0-4.6 1.6-4.6 4.6V10H7v3h3.2v8" /></svg>
  }

  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.7 4.1c.7 1.7 1.7 2.7 3.3 2.8v3a7.8 7.8 0 0 1-3.3-1v6.2a5 5 0 1 1-4.8-5v3a2 2 0 1 0 1.8 2V4.1h3Z" /></svg>
}

function Footer({ settings }) {
  const businessName = settings?.business_name || 'PicturesSquad Studio Nepal'
  const email = settings?.email || 'hello@picturesquad.com'
  const socialLinks = [
    { key: 'instagram', label: 'Instagram', url: settings?.instagram_url },
    { key: 'facebook', label: 'Facebook', url: settings?.facebook_url },
    { key: 'tiktok', label: 'TikTok', url: settings?.tiktok_url },
  ].filter((link) => isSafeUrl(link.url))

  return (
    <footer className="site-footer">
      <div className="footer-top page-width">
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark" aria-hidden="true">PS</span>
          <span><strong>{businessName}</strong><small>PHOTOGRAPHY STUDIO</small></span>
        </a>
        <div className="footer-column"><strong>Explore</strong><a href="#top">Home</a><a href="#portfolio">Portfolio</a><a href="#services">Services</a><a href="#about">About</a></div>
        <div className="footer-column"><strong>Sessions</strong><a href="#services">Newborn & baby</a><a href="#services">Family</a><a href="#services">Maternity</a><a href="#services">Milestones</a></div>
        <div className="footer-column"><strong>Find us</strong><span>{settings?.address || 'Kathmandu and Pokhara, Nepal'}</span>{settings?.phone && <a href={`tel:${settings.phone}`}>{settings.phone}</a>}<a href={`mailto:${email}`}>{email}</a></div>
        {socialLinks.length > 0 && <div className="footer-column footer-social-column"><strong>Follow us</strong><div className="footer-social-links">{socialLinks.map((link) => <a href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.label} title={link.label} key={link.key}><SocialIcon type={link.key} /><span>{link.label}</span></a>)}</div></div>}
      </div>
      <div className="footer-bottom page-width"><span>{businessName}</span><span>Stories worth remembering.</span><span>© 2026</span></div>
    </footer>
  )
}

export default Footer
