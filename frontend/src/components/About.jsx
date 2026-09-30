function About({ settings }) {
  const businessName = settings?.business_name || 'SD Tech Photograph'
  const address = settings?.address || 'Kathmandu, Pokhara and wherever your story takes you'
  return (
    <section className="about-section" id="about">
      <div className="about-visual" aria-hidden="true" />
      <div className="about-copy">
        <p className="eyebrow warm">A little about us</p>
        <h2>Photographs that<br /><em>feel like you.</em></h2>
        <p>We believe the best photographs are not forced. They are found in a tiny hand held tightly, a laugh between generations, and the calm after a celebration.</p>
        <p>{businessName} creates gentle, timeless imagery for families in {address}.</p>
        <a className="solid-button" href="#contact">Meet {businessName} <span>{'->'}</span></a>
      </div>
    </section>
  )
}

export default About
