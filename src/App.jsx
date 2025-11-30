import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import GeminiChatPanel from './components/gemini-chat-panel.jsx'
import { events as allEvents, dynasties, periods } from './data/events.js'
import AiHistorySearch from './pages/ai-history-search.jsx'
import { WikipediaSummary } from './components/WikipediaSummary'
import Typography from './components/Typography'
import PeriodBadge from './components/PeriodBadge'
import MobileTimeline from './components/MobileTimeline'

function Header() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  const scrollTo = (id) => {
    if (!isHome) return // Let the Link to="/" handle the navigation, then hash will work natively if present
    const element = document.querySelector(id)
    if (element) element.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="site-header" role="banner">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="Lịch sử Việt Nam">
          <div className="logo" aria-hidden="true">VN</div>
          <span className="brand-text">Lịch sử Việt Nam</span>
        </Link>
        <nav className="site-nav" aria-label="Điều hướng chính">
          <ul>
            <li>
              {isHome ? (
                <a href="#home" onClick={(e) => { e.preventDefault(); scrollTo('#home'); }}>Trang chủ</a>
              ) : (
                <Link to="/#home">Trang chủ</Link>
              )}
            </li>
            <li>
              {isHome ? (
                <a href="#timeline" onClick={(e) => { e.preventDefault(); scrollTo('#timeline'); }}>Timeline</a>
              ) : (
                <Link to="/#timeline">Timeline</Link>
              )}
            </li>
            <li>
              {isHome ? (
                <a href="#search" onClick={(e) => { e.preventDefault(); scrollTo('#search'); }}>Tìm kiếm</a>
              ) : (
                <Link to="/#search">Tìm kiếm</Link>
              )}
            </li>
            <li><Link to="/ai-history" className={location.pathname === '/ai-history' ? 'active-link' : ''}>Lịch sử</Link></li>
            <li>
              {isHome ? (
                <a href="#about" onClick={(e) => { e.preventDefault(); scrollTo('#about'); }}>Khái quát</a>
              ) : (
                <Link to="/#about">Khái quát</Link>
              )}
            </li>
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
        <div className="hero-content">
          <div className="hero-primary">
            <Typography
              as="h1"
              variant="viet-heading"
              size="6xl"
              weight="700"
              className="hero-title mb-4"
              id="hero-title"
            >
              Khám phá lịch sử Việt Nam
            </Typography>
            <Typography
              as="h2"
              variant="viet-heading"
              size="2xl"
              weight="600"
              color="primary"
              className="hero-subtitle mb-6"
            >
              Hành trình 4000 năm văn hiến qua lăng kính chuyên gia
            </Typography>
            <Typography
              variant="viet-body"
              size="lg"
              color="muted"
              className="hero-description mb-8"
            >
              Trải nghiệm lịch sử Việt Nam với giao diện chuyên nghiệp, nội dung xác thực, và công nghệ tìm kiếm thông minh. Khám phá timeline tương tác, từ thời Hồng Bàng đến hiện đại.
            </Typography>
          </div>
          <div className="hero-secondary">
          <div className="hero-actions">
            <a
              className="btn btn-primary btn-large"
              href="#timeline"
              onClick={(e) => { e.preventDefault(); document.querySelector('#timeline').scrollIntoView({ behavior: 'smooth' }); }}
            >
              <span className="btn-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                  <path d="M2 17L12 22L22 17"/>
                  <path d="M2 12L12 17L22 12"/>
                </svg>
              </span>
              <Typography variant="viet-label" size="sm">
                Bắt đầu khám phá
              </Typography>
            </a>
            <Link className="btn btn-secondary btn-large" to="/ai-history">
              <span className="btn-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                </svg>
              </span>
              <Typography variant="viet-label" size="sm">
                Tìm hiểu lịch sử
              </Typography>
            </Link>
          </div>
        </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="visual-card">
            <div className="visual-gradient"></div>
            <div className="visual-stats">
              <div className="stat-item">
                <Typography
                  variant="viet-heading"
                  size="3xl"
                  weight="800"
                  className="stat-number"
                >
                  {stats.numEvents}+
                </Typography>
                <Typography
                  variant="viet-label"
                  size="xs"
                  color="muted"
                  className="stat-label"
                >
                  Sự kiện lịch sử
                </Typography>
              </div>

              <div className="stat-divider"></div>

              <div className="stat-item">
                <Typography
                  variant="viet-heading"
                  size="3xl"
                  weight="800"
                  className="stat-number"
                >
                  {stats.numCenturies}
                </Typography>
                <Typography
                  variant="viet-label"
                  size="xs"
                  color="muted"
                  className="stat-label"
                >
                  Thế kỷ văn minh
                </Typography>
              </div>

              <div className="stat-divider"></div>

              <div className="stat-item">
                <Typography
                  variant="viet-heading"
                  size="3xl"
                  weight="800"
                  className="stat-number"
                >
                  {stats.numDynasties}
                </Typography>
                <Typography
                  variant="viet-label"
                  size="xs"
                  color="muted"
                  className="stat-label"
                >
                  Triều đại huy hoàng
                </Typography>
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

function EventDetailModal({ event, isOpen, onClose, getPeriodColor }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen || !event) return null

  const periodColor = getPeriodColor(event.period)

  return (
    <div 
      className="event-modal-overlay" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div 
        className="event-modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ '--modal-color': periodColor }}
      >
        <button 
          className="event-modal-close" 
          onClick={onClose}
          aria-label="Đóng modal"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        
        <div className="event-modal-header">
          <div className="event-modal-badge" style={{ backgroundColor: periodColor }}>
            {event.period}
          </div>
          <h2 id="modal-title" className="event-modal-title">{event.title}</h2>
          <div className="event-modal-meta">
            <span className="meta-item">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M8 1v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              {event.year < 0 ? `${Math.abs(event.year)} TCN` : event.year}
            </span>
            {event.dynasty && (
              <span className="meta-item">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path d="M2 3h12M2 8h12M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {event.dynasty}
              </span>
            )}
          </div>
        </div>

        <div className="event-modal-body">
          <div className="event-modal-section">
            <h3 className="section-title">Mô tả</h3>
            <p className="section-content">{event.description}</p>
          </div>

          {event.details && (
            <div className="event-modal-section">
              <h3 className="section-title">Chi tiết</h3>
              <div className="section-content details-content">
                {event.details.split('\n').map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>
          )}

          <div className="event-modal-section">
            <h3 className="section-title">Thông tin từ Wikipedia</h3>
            <WikipediaSummary title={event.title} language="vi" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Timeline({ events }) {
  const [period, setPeriod] = useState('all')
  const [dynasty, setDynasty] = useState('all')
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const railRef = useRef(null)

  // Mobile detection for Vietnamese users
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const filtered = useMemo(() => {
    return events.filter(e => (period === 'all' || e.period === period) && (dynasty === 'all' || e.dynasty === dynasty))
                 .sort((a, b) => a.year - b.year)
  }, [events, period, dynasty])

  useEffect(() => { setActiveIndex(0) }, [period, dynasty])

  useEffect(() => {
    const el = railRef.current
    if (!el || filtered.length === 0) return
    const active = el.querySelector(`[data-index="${activeIndex}"]`)
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    }
  }, [activeIndex, filtered])

  const dynOptions = useMemo(() => ['all', ...Array.from(new Set(events.map(e => e.dynasty))).filter(Boolean)], [events])

  const getPeriodColor = (period) => {
    const colors = {
      'Cổ đại': '#8b5cf6',
      'Phong kiến': '#3b82f6',
      'Cận đại': '#f59e0b',
      'Hiện đại': '#ef4444',
    }
    return colors[period] || '#6b7280'
  }

  const openDetails = (event) => {
    setSelectedEvent(event)
  }

  const closeDetails = () => {
    setSelectedEvent(null)
  }

  return (
    <section id="timeline" className="timeline-section section" aria-labelledby="timeline-title">
      <div className="container">
        <div className="section-header">
          <Typography
            as="h2"
            variant="viet-heading"
            size="4xl"
            id="timeline-title"
            className="mb-6"
          >
            Timeline các sự kiện lớn
          </Typography>
          <div className="controls">
            <label className="control">
              <Typography variant="viet-label" size="xs" color="muted">
                Thời kỳ
              </Typography>
              <select
                value={period}
                onChange={e => setPeriod(e.target.value)}
                aria-label="Lọc theo thời kỳ"
                className="mt-1"
              >
                <option value="all">Tất cả</option>
                {periods.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <label className="control">
              <Typography variant="viet-label" size="xs" color="muted">
                Triều đại
              </Typography>
              <select
                value={dynasty}
                onChange={e => setDynasty(e.target.value)}
                aria-label="Lọc theo triều đại"
                className="mt-1"
              >
                {dynOptions.map(d => <option key={d} value={d}>{d === 'all' ? 'Tất cả' : d}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="timeline-container">
          <div className="timeline-wrap" tabIndex={0} aria-label="Kéo dọc để xem thêm mốc thời gian" onKeyDown={e => {
            if (e.key === 'ArrowDown') setActiveIndex(i => Math.min(i + 1, filtered.length - 1))
            if (e.key === 'ArrowUp') setActiveIndex(i => Math.max(i - 1, 0))
          }}>
            <div className="timeline-line"></div>
            <div id="timelineRail" className="timeline-rail" role="list" ref={railRef}>
              {filtered.map((e, idx) => (
                <div 
                  className={`timeline-item ${idx === activeIndex ? 'active' : ''}`} 
                  role="listitem" 
                  key={e.id} 
                  data-index={idx}
                  style={{ '--period-color': getPeriodColor(e.period) }}
                >
                  <div className="timeline-item-content">
                    <div
                      className="timeline-dot"
                      tabIndex={0}
                      aria-current={idx === activeIndex}
                      aria-label={`${e.year}: ${e.title}`}
                      onClick={() => setActiveIndex(idx)}
                      onKeyDown={ev => { if (ev.key === 'Enter' || ev.key === ' ') setActiveIndex(idx) }}
                    >
                      <div className="dot-inner"></div>
                    </div>
                    <div className="timeline-card">
                      <div className="timeline-year">{e.year < 0 ? `${Math.abs(e.year)} TCN` : e.year}</div>
                      <div className="timeline-title">{e.title}</div>
                      <div className="timeline-meta">
                        {e.dynasty && <span className="timeline-dynasty">{e.dynasty}</span>}
                        <span className="timeline-period">{e.period}</span>
                      </div>
                      <div className="timeline-description">{e.description}</div>
                      <button 
                        className="timeline-details-btn"
                        onClick={() => openDetails(e)}
                        aria-label={`Xem chi tiết cho ${e.title}`}
                      >
                        <span>Chi tiết</span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <EventDetailModal 
            event={selectedEvent}
            isOpen={selectedEvent !== null}
            onClose={closeDetails}
            getPeriodColor={getPeriodColor}
          />
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
              <a className="back-to-top" href="#timeline" onClick={(e) => { e.preventDefault(); document.querySelector('#timeline').scrollIntoView({ behavior: 'smooth' }); }} aria-label="Đi tới timeline">Xem trên timeline →</a>
            </article>
          ))}
          {query && results.length === 0 && <div>Không tìm thấy kết quả phù hợp.</div>}
        </div>
      </div>
    </section>
  )
}

function FloatingChatButton({ onToggle }) {
  return (
    <button
      className="floating-chat-btn"
      onClick={onToggle}
      aria-label="Mở trợ lý Gemini lịch sử Việt Nam"
      title="Hỏi về lịch sử Việt Nam"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>
  )
}

function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        <div className="footer-content">
          {/* Project Info */}
          <div className="footer-section footer-project">
            <Typography
              as="h3"
              variant="viet-heading"
              size="sm"
              weight="600"
              className="footer-title mb-3"
            >
              Sản phẩm học sinh
            </Typography>
            <div className="footer-info">
              <div className="info-item">
                <span className="info-label">Học sinh:</span>
                <span className="info-value">Phạm Lê Nhật Minh</span>
              </div>
              <div className="info-item">
                <span className="info-label">Cơ sở:</span>
                <span className="info-value">Teky 21 Hoàng Mai</span>
              </div>
              <div className="info-item">
                <span className="info-label">Hướng dẫn:</span>
                <span className="info-value">Thầy Nguyễn Mạnh Quý</span>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="footer-section footer-about">
            <Typography
              as="h3"
              variant="viet-heading"
              size="sm"
              weight="600"
              className="footer-title mb-3"
            >
              Về dự án
            </Typography>
            <Typography
              variant="viet-body"
              size="xs"
              color="muted"
              className="footer-description"
            >
              Timeline lịch sử Việt Nam tương tác, với tìm kiếm thông minh và tích hợp Wikipedia.
            </Typography>
          </div>

          {/* Quick Links */}
          <div className="footer-section footer-links">
            <Typography
              as="h3"
              variant="viet-heading"
              size="sm"
              weight="600"
              className="footer-title mb-3"
            >
              Điều hướng
            </Typography>
            <nav className="footer-nav" aria-label="Điều hướng footer">
              <a href="#home" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Trang chủ</a>
              <a href="#timeline" onClick={(e) => { e.preventDefault(); document.querySelector('#timeline')?.scrollIntoView({ behavior: 'smooth' }); }}>Timeline</a>
              <a href="#search" onClick={(e) => { e.preventDefault(); document.querySelector('#search')?.scrollIntoView({ behavior: 'smooth' }); }}>Tìm kiếm</a>
            </nav>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <Typography variant="viet-label" size="xs" color="muted" className="footer-copyright">
            © {year} Lịch sử Việt Nam. Thiết kế hiện đại, tối ưu trải nghiệm.
          </Typography>
          <a href="#home" className="back-to-top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label="Lên đầu trang">Lên đầu trang ↑</a>
        </div>
      </div>
    </footer>
  )
}

function HomePage({ stats, allEvents }) {
  return (
    <>
      <Hero stats={stats} />
      <About />
      <Timeline events={allEvents} />
      <Search events={allEvents} />
    </>
  )
}

export default function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const stats = useMemo(() => {
    const numEvents = allEvents.length
    const centuries = new Set(allEvents.map(e => Math.floor(e.year / 100)))
    const numCenturies = centuries.size
    const numDynasties = new Set(allEvents.map(e => e.dynasty).filter(Boolean)).size
    return { numEvents, numCenturies, numDynasties }
  }, [])

  const location = useLocation()

  useEffect(() => {
    // Handle hash scrolling when loading the page or navigating with hash
    if (location.hash) {
      const id = location.hash
      setTimeout(() => {
        const element = document.querySelector(id)
        if (element) element.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else if (location.pathname !== '/') {
      // Scroll to top on new page
      window.scrollTo(0, 0)
    }
  }, [location])

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
        <Routes>
          <Route path="/" element={<HomePage stats={stats} allEvents={allEvents} />} />
          <Route path="/ai-history" element={<AiHistorySearch />} />
        </Routes>
      </main>
      <Footer />
      <FloatingChatButton onToggle={() => setChatOpen(true)} />
      <GeminiChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  )
}



