const services = [
  ['01', 'Newborn & baby', 'Soft, unhurried portraits for the first days and years of a beautiful new life.'],
  ['02', 'Family stories', 'Warm, natural photographs made around the people and places that feel like home.'],
  ['03', 'Maternity', 'An honest celebration of the season before everything changes.'],
  ['04', 'Milestones & events', 'Thoughtful coverage for birthdays, blessings and the days worth gathering for.'],
]

function Services() {
  return (
    <section className="services-section page-width" id="services">
      <div className="section-heading split-heading">
        <div>
          <p className="eyebrow warm">What we photograph</p>
          <h2>Made for your<br /><em>kind of memories.</em></h2>
        </div>
        <p className="heading-aside services-intro">From a quiet newborn session in Kathmandu to a joyful family gathering in Pokhara, every session is shaped around you.</p>
      </div>
      <div className="service-list">
        {services.map(([number, title, copy]) => (
          <a className="service-item" href="#contact" key={number}>
            <span className="service-number">{number}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
            <span className="service-arrow">{'->'}</span>
          </a>
        ))}
      </div>
    </section>
  )
}

export default Services
