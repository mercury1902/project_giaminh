import React, { useEffect, useMemo, useRef, useState } from 'react'
import { events as allEvents, dynasties, periods } from './data/events.js'

function Header() {
  return (
    <header className="site-header" role="banner">
      <div className="container header-inner">
        <div className="brand" aria-label="Lịch sử Việt Nam">
          <div className="logo" aria-hidden="true">VN</div>
          <span className="brand-text">Lịch sử Việt Nam</span>
        </div>
        <nav className="site-nav" aria-label="Điều hướng chính">
          <ul>
            <li><a href="#home">Trang chủ</a></li>
            <li><a href="#timeline">Timeline</a></li>
            <li><a href="#search">Tìm kiếm</a></li>
            <li><a href="#about">Khái quát</a></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

function Hero({ stats }) {
  return (
    <section id="home" className="hero-section" aria-labelledby="hero-title">
      <div className="container hero-inner">
        <div className="hero-copy">
          <h1 id="hero-title">Khám phá lịch sử Việt Nam</h1>
          <p className="lead">Giao diện hiện đại, tông màu sáng, nội dung súc tích. Tương tác với timeline các sự kiện lớn và tìm kiếm nhanh chóng.</p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#timeline">Khám phá Timeline</a>
            <a className="btn btn-ghost" href="#search">Tìm sự kiện</a>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="visual-card">
            <div className="visual-gradient"></div>
            <div className="visual-stats">
              <div>
                <span className="stat-number">{stats.numEvents}</span>
                <span className="stat-label">Sự kiện</span>
              </div>
              <div>
                <span className="stat-number">{stats.numCenturies}</span>
                <span className="stat-label">Thế kỷ</span>
              </div>
              <div>
                <span className="stat-number">{stats.numDynasties}</span>
                <span className="stat-label">Triều đại</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function About() {
  return (
    <section id="about" className="about-section section" aria-labelledby="about-title">
      <div className="container">
        <h2 id="about-title">Khái quát lịch sử Việt Nam</h2>
        <p>
          Lịch sử Việt Nam trải dài từ thời dựng nước với truyền thuyết Hồng Bàng, qua các triều đại độc lập như Lý, Trần, Lê; các cuộc kháng chiến chống xâm lược Nguyên Mông, Minh, Thanh; thời cận đại với thực dân Pháp; Cách mạng tháng Tám 1945; hai cuộc kháng chiến bảo vệ độc lập; và thời kỳ Đổi mới, hội nhập quốc tế.
        </p>
        <p>
          Timeline bên dưới tổng hợp các mốc tiêu biểu, cho phép bạn tương tác để xem chi tiết, lọc theo triều đại/thời kỳ, và tìm kiếm nhanh các sự kiện.
        </p>
      </div>
    </section>
  )
}

function Timeline({ events }) {
  const [period, setPeriod] = useState('all')
  const [dynasty, setDynasty] = useState('all')
  const [zoom, setZoom] = useState(1)
  const [activeIndex, setActiveIndex] = useState(0)
  const railRef = useRef(null)

  const filtered = useMemo(() => {
    return events.filter(e => (period === 'all' || e.period === period) && (dynasty === 'all' || e.dynasty === dynasty))
                 .sort((a, b) => a.year - b.year)
  }, [events, period, dynasty])

  useEffect(() => { setActiveIndex(0) }, [period, dynasty])

  useEffect(() => {
    const el = railRef.current
    if (!el) return
    el.style.transform = `scale(${zoom})`
    el.style.transformOrigin = 'left center'
  }, [zoom])

  useEffect(() => {
    const el = railRef.current
    if (!el || filtered.length === 0) return
    const active = el.querySelector(`[data-index="${activeIndex}"]`)
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [activeIndex, filtered])

  const dynOptions = useMemo(() => ['all', ...Array.from(new Set(events.map(e => e.dynasty))).filter(Boolean)], [events])

  const active = filtered[activeIndex]

  return (
    <section id="timeline" className="timeline-section section" aria-labelledby="timeline-title">
      <div className="container">
        <div className="section-header">
          <h2 id="timeline-title">Timeline các sự kiện lớn</h2>
          <div className="controls">
            <label className="control">
              <span>Thời kỳ</span>
              <select value={period} onChange={e => setPeriod(e.target.value)} aria-label="Lọc theo thời kỳ">
                <option value="all">Tất cả</option>
                {periods.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <label className="control">
              <span>Triều đại</span>
              <select value={dynasty} onChange={e => setDynasty(e.target.value)} aria-label="Lọc theo triều đại">
                {dynOptions.map(d => <option key={d} value={d}>{d === 'all' ? 'Tất cả' : d}</option>)}
              </select>
            </label>
            <label className="control">
              <span>Zoom</span>
              <input type="range" min="0.6" max="1.6" step="0.1" value={zoom} onChange={e => setZoom(Number(e.target.value))} aria-label="Thu phóng timeline" />
            </label>
          </div>
        </div>

        <div className="timeline-wrap" tabIndex={0} aria-label="Kéo ngang để xem thêm mốc thời gian" onKeyDown={e => {
          if (e.key === 'ArrowRight') setActiveIndex(i => Math.min(i + 1, filtered.length - 1))
          if (e.key === 'ArrowLeft') setActiveIndex(i => Math.max(i - 1, 0))
        }}>
          <div id="timelineRail" className="timeline-rail" role="list" ref={railRef}>
            {filtered.map((e, idx) => (
              <div className="tick" role="listitem" key={e.id} data-index={idx}>
                <div
                  className="dot"
                  tabIndex={0}
                  aria-current={idx === activeIndex}
                  aria-label={`${e.year}: ${e.title}`}
                  onClick={() => setActiveIndex(idx)}
                  onKeyDown={ev => { if (ev.key === 'Enter' || ev.key === ' ') setActiveIndex(idx) }}
                />
                <div className="year">{e.year}</div>
                <div className="label">{e.title}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="event-details" aria-live="polite" aria-atomic="true">
          <div className="details-card">
            <h3 id="detailsTitle">{active ? active.title : 'Chọn một sự kiện trên timeline'}</h3>
            <p className="details-meta">{active ? `${active.year} • ${active.dynasty || '—'} • ${active.period}` : ''}</p>
            <p className="details-desc">{active ? active.description : ''}</p>
            <div className="details-actions">
              <button className="btn btn-ghost" onClick={() => setActiveIndex(i => Math.max(i - 1, 0))} aria-label="Sự kiện trước">← Trước</button>
              <button className="btn btn-ghost" onClick={() => setActiveIndex(i => Math.min(i + 1, filtered.length - 1))} aria-label="Sự kiện sau">Sau →</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Search({ events }) {
  const [query, setQuery] = useState('')
  const normalized = (s) => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
  const results = useMemo(() => {
    const q = normalized(query.trim())
    if (!q) return []
    return events.filter(e => [e.title, e.description, e.dynasty, String(e.year), e.period]
      .filter(Boolean)
      .some(field => normalized(String(field)).includes(q)))
      .slice(0, 20)
  }, [events, query])

  return (
    <section id="search" className="search-section section" aria-labelledby="search-title">
      <div className="container">
        <h2 id="search-title">Tìm kiếm sự kiện</h2>
        <form className="search-form" role="search" aria-label="Tìm kiếm sự kiện lịch sử" onSubmit={e => e.preventDefault()}>
          <input
            type="search"
            placeholder="Nhập từ khóa (vd: Nguyên Mông, 1945, Lý Thái Tổ)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Ô tìm kiếm"
          />
          <button className="btn btn-primary" type="submit">Tìm</button>
        </form>
        <div className="search-results" aria-live="polite" aria-atomic="true">
          {results.map(e => (
            <article key={e.id} className="result-card">
              <h3 className="result-title">{e.title}</h3>
              <div className="result-meta">{e.year} • {e.dynasty || '—'} • {e.period}</div>
              <p>{e.description}</p>
              <a className="back-to-top" href="#timeline" aria-label="Đi tới timeline">Xem trên timeline →</a>
            </article>
          ))}
          {query && results.length === 0 && <div>Không tìm thấy kết quả phù hợp.</div>}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container footer-inner">
        <p>© {year} Lịch sử Việt Nam. Thiết kế hiện đại, tối ưu trải nghiệm.</p>
        <a href="#home" className="back-to-top" aria-label="Lên đầu trang">Lên đầu trang ↑</a>
      </div>
    </footer>
  )
}

export default function App() {
  const stats = useMemo(() => {
    const numEvents = allEvents.length
    const centuries = new Set(allEvents.map(e => Math.floor(e.year / 100)))
    const numCenturies = centuries.size
    const numDynasties = new Set(allEvents.map(e => e.dynasty).filter(Boolean)).size
    return { numEvents, numCenturies, numDynasties }
  }, [])

  useEffect(() => {
    const skip = document.createElement('a')
    skip.className = 'skip-link'
    skip.href = '#main'
    skip.textContent = 'Bỏ qua nội dung'
    document.body.prepend(skip)
  }, [])

  return (
    <>
      <Header />
      <main id="main">
        <Hero stats={stats} />
        <About />
        <Timeline events={allEvents} />
        <Search events={allEvents} />
      </main>
      <Footer />
    </>
  )
}



