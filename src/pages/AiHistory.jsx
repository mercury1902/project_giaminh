import React, { useState, useRef, useEffect } from 'react'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function AiHistory() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Chào bạn! Mình là Trợ lý Lịch sử AI. Mình sử dụng sức mạnh của Gemini kết hợp với dữ liệu từ Wikipedia để trả lời các câu hỏi về Lịch sử. Bạn muốn hỏi gì nào?' }
  ])
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query.trim();
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setQuery('');
    setLoading(true);

    try {
      // 1. Tìm thông tin trên Wikipedia Tiếng Việt để làm bối cảnh (Context)
      const wikiSearchRes = await fetch(`https://vi.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(userText)}&utf8=&format=json&origin=*`);
      const wikiSearchData = await wikiSearchRes.json();

      let contextText = "";
      let wikiLink = "";
      let wikiTitle = "";

      if (wikiSearchData.query?.search?.length > 0) {
        // Lấy đoạn trích của kết quả liên quan nhất
        const title = wikiSearchData.query.search[0].title;
        wikiTitle = title;
        wikiLink = `https://vi.wikipedia.org/wiki/${encodeURIComponent(title)}`;
        const wikiPageRes = await fetch(`https://vi.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
        if (wikiPageRes.ok) {
          const wikiPageData = await wikiPageRes.json();
          contextText = wikiPageData.extract || "";
        }
      } else {
        wikiTitle = "Tìm kiếm Wikipedia";
        wikiLink = `https://vi.wikipedia.org/w/index.php?search=${encodeURIComponent(userText)}`;
      }

      // 2. Gửi Prompt đến Gemini AI
      const prompt = `Bạn là Trợ lý thông thái chuyên về Lịch sử, đặc biệt là Lịch sử Việt Nam và thế giới. 
Dưới đây là câu hỏi của người dùng: "${userText}".

Tôi đã tự động tìm kiếm trên Wikipedia và thu được đoạn thông tin tham khảo sau (nếu có):
"${contextText}"

Dựa vào đoạn thông tin Wikipedia ở trên kết hợp với kiến thức sẵn có của bạn, hãy trả lời câu hỏi của người dùng một cách chính xác, ngắn gọn, hấp dẫn và dễ hiểu bằng Tiếng Việt.`;

      // Danh sách model dự phòng: thử lần lượt nếu model chính bị lỗi
      const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash-lite'];
      let geminiRes;

      for (let modelIdx = 0; modelIdx < MODELS.length; modelIdx++) {
        const model = MODELS[modelIdx];
        let succeeded = false;
        const maxRetries = 3;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
          geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
              })
            }
          );

          if (geminiRes.ok) { succeeded = true; break; }

          if (geminiRes.status === 503 && attempt < maxRetries - 1) {
            // Chờ 1s → 2s trước khi retry cùng model
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            continue;
          }

          if (geminiRes.status === 429 && attempt < maxRetries - 1) {
            const retryData = await geminiRes.clone().json().catch(() => ({}));
            const retryDelay = retryData?.error?.details?.find(d => d.retryDelay)?.retryDelay;
            const waitMs = retryDelay ? parseInt(retryDelay) * 1000 : Math.pow(2, attempt) * 2000;
            await new Promise(resolve => setTimeout(resolve, waitMs));
            continue;
          }

          // Lỗi không thể retry → thoát vòng attempt
          break;
        }

        if (succeeded) break; // Model này thành công, dừng vòng model

        // Nếu là model cuối cùng, ném lỗi
        if (modelIdx === MODELS.length - 1) {
          const errorText = await geminiRes.text().catch(() => '');
          if (geminiRes.status === 401 || geminiRes.status === 403) {
            throw new Error("API Key không hợp lệ hoặc không có quyền truy cập.");
          } else if (geminiRes.status === 429) {
            throw new Error("API đã vượt giới hạn sử dụng trong ngày. Vui lòng thử lại sau vài giờ.");
          } else if (geminiRes.status === 503) {
            throw new Error("Tất cả máy chủ Gemini đang quá tải, vui lòng thử lại sau ít phút.");
          } else {
            throw new Error(`Lỗi API (${geminiRes.status}): ${errorText || 'Không xác định'}`);
          }
        }
        // Còn model dự phòng → thử tiếp
      }

      const geminiData = await geminiRes.json();
      let answer = "Xin lỗi, hiện tại tôi không thể xử lý câu hỏi này.";

      if (geminiData.candidates && geminiData.candidates[0]?.content?.parts[0]?.text) {
        answer = geminiData.candidates[0].content.parts[0].text;
      }

      setMessages(prev => [...prev, { role: 'ai', content: answer, wikiLink, wikiTitle }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: `❌ ${error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '900px' }}>
        <div className="section-header" style={{ marginBottom: '24px' }}>
          <h2 className="section-title">Lịch sử với AI</h2>
        </div>

        <div className="timeline-wrap" style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          backgroundColor: '#fff',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
          maxHeight: '600px'
        }}>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            paddingRight: '12px'
          }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.role === 'user' ? 'var(--primary)' : 'var(--surface)',
                color: msg.role === 'user' ? '#fff' : 'var(--text)',
                padding: '12px 18px',
                borderRadius: '16px',
                borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '16px',
                maxWidth: '85%',
                lineHeight: '1.6',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                {msg.role === 'ai' && <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: 'var(--primary)', fontSize: '14px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                    <path d="M12 12L2.1 12.1"></path>
                    <path d="M12 12l8.5-8.5"></path>
                  </svg>
                  Gemini AI
                </strong>}
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                {msg.wikiLink && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.1)', fontSize: '13px' }}>
                    <a href={msg.wikiLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                      {msg.wikiTitle === "Tìm kiếm Wikipedia" ? "Tìm kiếm thêm về từ khóa này trên Wikipedia" : `Nguồn: Wikipedia (${msg.wikiTitle})`}
                    </a>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{
                alignSelf: 'flex-start',
                backgroundColor: 'var(--surface)',
                padding: '12px 18px',
                borderRadius: '16px',
                borderBottomLeftRadius: '4px',
                color: 'var(--text-muted)'
              }}>
                Đang tìm thông tin trên Wikipedia và xử lý...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} className="search-form" style={{ display: 'flex', gap: '8px', margin: 0 }}>
            <input
              type="text"
              placeholder="Nhập câu hỏi của bạn (vd: Ai là người phát minh ra máy hơi nước?)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                fontSize: '15px'
              }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0 24px', fontSize: '15px' }}>
              {loading ? 'Đang gửi...' : 'Gửi'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
