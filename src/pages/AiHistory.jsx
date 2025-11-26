import React, { useState } from 'react'

export default function AiHistory() {
  const [query, setQuery] = useState('')

  return (
    <section className="section" style={{ minHeight: '60vh' }}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Lịch sử với AI</h2>
        </div>
        
        <div className="timeline-wrap" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              background: 'linear-gradient(135deg, var(--primary), var(--accent))', 
              borderRadius: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 24px',
              color: 'white'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                <path d="M12 12L2.1 12.1"></path>
                <path d="M12 12l8.5-8.5"></path>
              </svg>
            </div>
            
            <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Trợ lý Lịch sử AI (Sắp ra mắt)</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
              Tính năng này sẽ cho phép bạn hỏi đáp trực tiếp với các nhân vật lịch sử hoặc tra cứu thông tin qua Wikipedia AI.
            </p>

            <div className="search-form" style={{ justifyContent: 'center' }}>
              <input 
                type="text" 
                placeholder="Đặt câu hỏi cho AI..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled
                style={{ maxWidth: '400px', opacity: 0.7 }}
              />
              <button className="btn btn-primary" disabled style={{ opacity: 0.7 }}>
                Gửi
              </button>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '16px' }}>
              * API Wikipedia AI đang được tích hợp.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
