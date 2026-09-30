import { useEffect, useState } from 'react'

const galleries = [
  { title: 'Newborn', count: '18 stories', image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=700&q=85' },
  { title: 'Families', count: '24 stories', image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=700&q=85' },
  { title: 'Maternity', count: '16 stories', image: 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?auto=format&fit=crop&w=700&q=85' },
  { title: 'Milestones', count: '21 stories', image: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=700&q=85' },
  { title: 'Celebrations', count: '12 stories', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=85' },
]

function Portfolio() {
  const [selectedGallery, setSelectedGallery] = useState(null)

  useEffect(() => {
    if (!selectedGallery) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedGallery(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedGallery])

  return (
    <>
      <section className="portfolio-section page-width" id="portfolio">
      <div className="section-heading split-heading">
        <div>
          <p className="eyebrow warm">Featured stories</p>
          <h2>Every chapter<br /><em>deserves a photograph.</em></h2>
        </div>
        <div className="heading-aside">
          <p>A considered collection of the honest, beautiful moments we have had the privilege to witness.</p>
          <a className="text-link" href="#portfolio">View full portfolio <span>{'->'}</span></a>
        </div>
      </div>
      <div className="gallery-row">
        {galleries.map((gallery) => (
          <button className="gallery-tile" type="button" key={gallery.title} onClick={() => setSelectedGallery(gallery)} aria-label={`Open ${gallery.title} gallery image`}>
            <img src={gallery.image} alt={`${gallery.title} photography`} />
            <span className="tile-shade" />
            <span className="tile-copy"><strong>{gallery.title}</strong><small>{gallery.count}</small></span>
          </button>
        ))}
      </div>
      </section>

      {selectedGallery && <div className="public-gallery-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedGallery(null) }}><section className="public-gallery-modal" role="dialog" aria-modal="true" aria-label={`${selectedGallery.title} gallery image`}><button className="public-gallery-close" type="button" aria-label="Close gallery image" onClick={() => setSelectedGallery(null)}>×</button><img src={selectedGallery.image} alt={`${selectedGallery.title} photography`} /><div><strong>{selectedGallery.title}</strong><span>{selectedGallery.count}</span></div></section></div>}
    </>
  )
}

export default Portfolio
