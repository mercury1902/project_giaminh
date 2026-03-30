import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { events as allEvents, dynasties, periods } from './data/events.js'
import { useWikipediaData } from './hooks/useFetch.js'
import AiHistory from './pages/AiHistory.jsx'

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
        <Link to="/" className="brand" aria-label="Lịch sử 10 KNTT">
          <div className="logo" aria-hidden="true">10</div>
          <span className="brand-text">Lịch sử 10 KNTT</span>
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
            <li><Link to="/ai-history" className={location.pathname === '/ai-history' ? 'active-link' : ''}>Lịch sử với AI</Link></li>
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
        <div className="hero-copy">
          <h1 id="hero-title">Khám phá lịch sử 10</h1>
          <p className="lead">Giao diện hiện đại, tông màu sáng, nội dung súc tích. Tương tác với timeline các sự kiện lớn và tìm kiếm nhanh chóng.</p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#timeline" onClick={(e) => { e.preventDefault(); document.querySelector('#timeline').scrollIntoView({ behavior: 'smooth' }); }}>Khám phá Timeline</a>
            <Link className="btn btn-ghost" to="/ai-history">Thử tính năng AI</Link>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="visual-card">
            <div className="visual-gradient">
              <img src="/history-10.jpg" alt="Sách giáo khoa Lịch sử 10" className="hero-cover-image" />
            </div>
            <div className="visual-stats">
              <div>
                <span className="stat-number">{stats.numEvents}</span>
                <span className="stat-label">Bài học</span>
              </div>
              <div>
                <span className="stat-number">{stats.numPeriods}</span>
                <span className="stat-label">Chủ đề</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
        }
      });
    }, { threshold: 0.25 });

    const elements = document.querySelectorAll('.reveal-element');
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function About() {
  useScrollReveal();

  const sections = [
    {
      title: "Mạch nguồn bản sắc",
      text1: "Lịch sử luôn giữ một vị trí thiêng liêng trong đời sống tinh thần của mỗi quốc gia. Đối với Việt Nam, lịch sử không đơn thuần là lớp bụi mờ của quá khứ, mà là mạch nguồn định hình bản sắc, ý chí và khát vọng của cả một dân tộc. Từ buổi đầu dựng nước muôn vàn gian khó đến những khúc tráng ca giữ nước, lịch sử Việt Nam là minh chứng sống động cho sức sáng tạo và lòng kiên cường. Việc thấu hiểu quá khứ chính là chìa khóa để thế hệ trẻ định vị bản thân, trui rèn bản lĩnh và gánh vác trách nhiệm với tương lai đất nước.",
      text2: "Trong bối cảnh giáo dục hiện đại, môn Lịch sử lớp 10 – đặc biệt là qua lăng kính của bộ sách Kết nối tri thức với cuộc sống (KNTT) – đóng vai trò bản lề. Giai đoạn này đánh dấu sự chuyển mình trong tư duy của học sinh: lịch sử không còn là những chuỗi sự kiện, con số khô khan cần học thuộc lòng, mà hiện lên như một bức tranh toàn cảnh về sự vận động không ngừng của kinh tế, chính trị, văn hóa và tư tưởng nhân loại.",
      img: "/home_1.png",
      reverse: false
    },
    {
      title: "Di sản và Tự hào",
      text1: "Trước hết, chương trình mở ra một tầm nhìn bao quát về di sản của thế giới. Bằng cách khám phá các nền văn minh cổ đại rực rỡ như Ai Cập, Lưỡng Hà, Ấn Độ, Trung Hoa hay Hy Lạp – La Mã, học sinh hiểu được quá trình con người từng bước tổ chức xã hội, kiến tạo nhà nước và vươn tới những đỉnh cao khoa học, nghệ thuật. Sự đối chiếu này giúp các em nhận thức sâu sắc rằng: lịch sử Việt Nam luôn là một phần vinh dự và gắn kết chặt chẽ với dòng chảy chung của văn minh nhân loại.",
      text2: "Bên cạnh đó, trọng tâm của chương trình đặt vào tiến trình lịch sử dân tộc từ thời kỳ sơ sử đến các triều đại phong kiến. Hành trình từ nhà nước Văn Lang – Âu Lạc đến thời Lý, Trần, Lê, Nguyễn đã khắc họa rõ nét sức sống bền bỉ của người Việt. Những chiến công chống ngoại xâm lừng lẫy cùng các thành tựu rực rỡ về văn hiến, giáo dục, pháp luật không chỉ khơi dậy lòng tự hào dân tộc mà còn đúc kết những bài học vô giá về nghệ thuật trị quốc và tinh thần đại đoàn kết.",
      img: "/home_2.png",
      reverse: true
    },
    {
      title: "Hệ sinh thái Số",
      text1: "Điểm sáng giá nhất của chương trình Lịch sử lớp 10 hiện nay chính là phương pháp tiếp cận gắn liền với thực tiễn. Học sinh được khuyến khích tự tìm tòi, phân tích tư liệu, phản biện và thảo luận. Lịch sử trở thành công cụ sắc bén để rèn luyện tư duy độc lập, tư duy nhân quả và khả năng giải quyết vấn đề. Để hiện thực hóa tinh thần đổi mới này, việc xây dựng một trang web chuyên sâu về Lịch sử lớp 10 là một bước đi mang tính thời đại.",
      text2: "Thay vì tiếp nhận thông tin một chiều, học sinh có thể chủ động tương tác với kiến thức thông qua sơ đồ tư duy, trục thời gian động, tư liệu hình ảnh trực quan. Sự kết hợp giữa giáo dục nhân văn và công nghệ số chắc chắn sẽ biến lịch sử thành một trải nghiệm sinh động. Khi thấu hiểu cội nguồn và cảm nhận được quá khứ đang \"hơi thở\" trong nhịp sống hiện tại, thế hệ trẻ Việt Nam sẽ mang trong mình lòng tự hào sâu sắc và sự tự tin vươn tầm quốc tế.",
      img: "/home_3.png",
      reverse: false
    }
  ]

  return (
    <section id="about" className="about-modern-section" aria-labelledby="about-title">
      <div className="container" style={{ paddingBottom: '80px' }}>
        <h2 id="about-title" className="reveal-element" style={{ textAlign: 'center', fontSize: '42px', color: 'var(--primary)', letterSpacing: '-1px', fontWeight: '800' }}>
          Nền tảng tri thức & Ứng dụng số
        </h2>
      </div>

      <div className="modern-grid">
        {sections.map((s, i) => (
          <div key={i} className={`modern-row reveal-element ${s.reverse ? 'reverse' : ''}`}>
            <div className="modern-image">
              <img src={s.img} alt={s.title} />
            </div>
            <div className="modern-text">
              <h3>{s.title}</h3>
              <p>{s.text1}</p>
              <p>{s.text2}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function EventDetailModal({ event, isOpen, onClose, getPeriodColor }) {
  // Wikipedia data fetching
  const { data: wikiData, loading: wikiLoading, error: wikiError, retry: retryWiki } = useWikipediaData(
    isOpen && event ? event.title.replace(/^Bài \d+:\s*/, '') : null
  )

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
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
                <path d="M8 1v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              Bài {event.year}
            </span>
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

          {!event.details && (
            <div className="event-modal-placeholder">
              <p>Nội dung chi tiết sẽ được thêm vào đây.</p>
              <p className="details-hint">Bạn có thể chỉnh sửa trong file <code>src/data/events.js</code> để thêm nội dung chi tiết cho sự kiện này.</p>
            </div>
          )}

          {/* Wikipedia Section */}
          <div className="event-modal-section wiki-section">
            <div className="wiki-section-header">
              <h3 className="section-title">
                <span className="wiki-icon">🔗</span> Wikipedia
              </h3>
            </div>

            {wikiLoading && (
              <div className="wiki-loading">
                <div className="loading-spinner"></div>
                <p>Đang tải từ Wikipedia...</p>
              </div>
            )}

            {wikiError && !wikiLoading && (
              <div className="wiki-error">
                <p className="error-message">{wikiError.message}</p>
                {wikiError.retryable && (
                  <button className="btn btn-retry" onClick={retryWiki}>
                    Thử lại
                  </button>
                )}
                {wikiError.url && (
                  <a href={wikiError.url} target="_blank" rel="noopener noreferrer" className="btn btn-wiki">
                    Tìm kiếm trên Wikipedia →
                  </a>
                )}
              </div>
            )}

            {wikiData && !wikiLoading && !wikiError && (
              <div className="wiki-content">
                <p className="section-content">{wikiData.extract}</p>
                <a
                  href={wikiData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-wiki"
                  aria-label={`Đọc bài viết đầy đủ về ${event.title} trên Wikipedia`}
                >
                  Đọc trên Wikipedia →
                </a>
              </div>
            )}

            {!wikiData && !wikiLoading && !wikiError && (
              <div className="wiki-placeholder">
                <p className="section-content">Không có dữ liệu Wikipedia</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Timeline({ events }) {
  const [period, setPeriod] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Drag to scroll state
  const scrollRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [dragMoved, setDragMoved] = useState(false)

  const handleMouseDown = (e) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setDragMoved(false)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2 // Scroll-fast

    if (Math.abs(walk) > 10) {
      setDragMoved(true)
    }

    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleItemClick = (e, event) => {
    if (dragMoved) {
      e.preventDefault()
      return
    }
    setSelectedEvent(event)
  }

  const filtered = useMemo(() => {
    return events.filter(e => period === 'all' || e.period === period)
      .sort((a, b) => a.year - b.year)
  }, [events, period])

  const closeDetails = () => setSelectedEvent(null)

  const getPeriodColor = (period) => {
    const colors = {
      'Chủ đề 1': '#8b5cf6',
      'Chủ đề 2': '#3b82f6',
      'Chủ đề 3': '#f59e0b',
      'Chủ đề 4': '#ef4444',
    }
    return colors[period] || '#6b7280'
  }

  const boxColors = ['#00b8d4', '#ff5252', '#00e676', '#e040fb', '#FF9800', '#2196F3', '#E91E63', '#4CAF50']

  return (
    <section id="timeline" className="timeline-section section" aria-labelledby="timeline-title">
      <div className="container" style={{ maxWidth: '100%', padding: 0 }}>
        <div className="section-header" style={{ padding: '0 24px', maxWidth: '1120px', margin: '0 auto 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <h2 id="timeline-title">Nội dung chi tiết</h2>
          <div className="controls">
            <label className="control">
              <span className="sr-only">Chủ đề</span>
              <select value={period} onChange={e => setPeriod(e.target.value)} aria-label="Lọc theo chủ đề">
                <option value="all">Tất cả</option>
                {['Chủ đề 1', 'Chủ đề 2', 'Chủ đề 3', 'Chủ đề 4'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div
          className={`horizontal-timeline-wrapper ${isDragging ? 'dragging' : ''}`}
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div className="horizontal-timeline">
            <div className="ht-line"></div>
            {filtered.map((e, idx) => {
              const isTop = idx % 2 === 0;
              const itemColor = boxColors[idx % boxColors.length];
              const numStr = (e.year).toString().padStart(2, '0');

              return (
                <div key={e.id} className={`ht-item ${isTop ? 'top' : 'bottom'}`} onClick={(ev) => handleItemClick(ev, e)} style={{ '--item-color': itemColor }}>
                  <div className="ht-dot"></div>
                  {isTop ? (
                    <div className="ht-content top-content">
                      <div className="ht-text">
                        <h4 style={{ color: itemColor }}>{e.period}</h4>
                        <p>{e.title}</p>
                      </div>
                      <div className="ht-box-wrapper">
                        <div className="ht-tab">
                          <div className="ht-badge">{numStr}</div>
                          <span>BÀI HỌC</span>
                        </div>
                        <div className="ht-box">
                          <div className="ht-icon">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
                          </div>
                        </div>
                        <div className="ht-stem ht-stem-top"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="ht-content bottom-content">
                      <div className="ht-box-wrapper">
                        <div className="ht-stem ht-stem-bottom"></div>
                        <div className="ht-box">
                          <div className="ht-icon">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          </div>
                        </div>
                        <div className="ht-tab">
                          <div className="ht-badge">{numStr}</div>
                          <span>BÀI HỌC</span>
                        </div>
                      </div>
                      <div className="ht-text">
                        <h4 style={{ color: itemColor }}>{e.period}</h4>
                        <p>{e.title}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <EventDetailModal
          event={selectedEvent}
          isOpen={selectedEvent !== null}
          onClose={closeDetails}
          getPeriodColor={getPeriodColor}
        />
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
              <div className="result-meta">Bài {e.year} • {e.period}</div>
              <p>{e.description}</p>
              <div className="result-links">
                <a className="back-to-top" href="#timeline" aria-label="Đi tới timeline">Xem trên timeline →</a>
                <a
                  href={`https://vi.wikipedia.org/wiki/${encodeURIComponent(e.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wiki-link"
                  aria-label={`Tìm hiểu thêm về ${e.title} trên Wikipedia`}
                >
                  🔗 Wikipedia
                </a>
              </div>
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
        <p>© {year} 10T - Project Gia Minh</p>
        <a href="#home" className="back-to-top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label="Lên đầu trang">Lên đầu trang ↑</a>
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
  const stats = useMemo(() => {
    const numEvents = allEvents.length
    const numPeriods = new Set(allEvents.map(e => e.period).filter(Boolean)).size
    return { numEvents, numPeriods }
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
          <Route path="/ai-history" element={<AiHistory />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}



