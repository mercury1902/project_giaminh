/**
 * Vercel Serverless Function: Gemini AI Chat with RAG Context
 * Endpoint: /api/gemini/chat (POST)
 * Body: { message: string }
 */

// Static Vietnamese history events (from rag-service.js)
const EVENTS = [
  { id: 'hb-2879', year: -2879, title: 'TruyÁn thuy¿t HÓng Bàng  Vn Lang', dynasty: 'HÓng Bàng', period: 'CÕ ¡i', description: 'ThÝi kó dñng n°Ûc theo truyÁn thuy¿t, hình thành nhà n°Ûc Vn Lang cça các vua Hùng.' },
  { id: 'ngo-939', year: 939, title: 'Ngô QuyÁn chi¿n th¯ng B¡ch ±ng', dynasty: 'Ngô', period: 'Phong ki¿n', description: 'ánh b¡i quân Nam Hán trên sông B¡ch ±ng, mß ra thÝi kó Ùc l­p tñ chç.' },
  { id: 'dinh-968', year: 968, title: 'inh BÙ L)nh thÑng nh¥t ¥t n°Ûc', dynasty: 'inh', period: 'Phong ki¿n', description: 'L­p n°Ûc ¡i CÓ ViÇt, ch¥m dét lo¡n 12 sé quân.' },
  { id: 'ly-1010', year: 1010, title: 'Lý Thái TÕ dÝi ô ra Thng Long', dynasty: 'Lý', period: 'Phong ki¿n', description: 'Ban Chi¿u dÝi ô, ·t nÁn móng phát triÃn lâu dài cho quÑc gia.' },
  { id: 'tran-1288', year: 1288, title: 'Chi¿n th¯ng B¡ch ±ng (Tr§n H°ng ¡o)', dynasty: 'Tr§n', period: 'Phong ki¿n', description: '¡i th¯ng quân Nguyên Mông l§n thé ba, b£o vÇ Ùc l­p dân tÙc.' },
  { id: 'hau-le-1428', year: 1428, title: 'Khßi ngh)a Lam S¡n th¯ng lãi', dynasty: 'H­u Lê', period: 'Phong ki¿n', description: 'Lê Lãi lên ngôi, l­p triÁu H­u Lê sau chi¿n th¯ng quân Minh.' },
  { id: 'tay-son-1789', year: 1789, title: 'Quang Trung ¡i phá quân Thanh', dynasty: 'Tây S¡n', period: 'Phong ki¿n', description: 'Tr­n NgÍc HÓi  Ñng a vang dÙi, giï vïng Ùc l­p.' },
  { id: 'nguyen-1802', year: 1802, title: 'Gia Long thÑng nh¥t, l­p triÁu NguyÅn', dynasty: 'NguyÅn', period: 'Phong ki¿n', description: 'QuÑc gia thÑng nh¥t sau nÙi chi¿n, b¯t §u thÝi NguyÅn.' },
  { id: 'fr-1858', year: 1858, title: 'Pháp nÕ súng xâm l°ãc à Nµng', dynasty: 'NguyÅn', period: 'C­n ¡i', description: 'Mß §u thÝi kó thñc dân Pháp xâm l°ãc ViÇt Nam.' },
  { id: 'au-1930', year: 1930, title: 'Thành l­p £ng CÙng s£n ViÇt Nam', dynasty: '', period: 'C­n ¡i', description: 'ánh d¥u b°Ûc ngo·t trong phong trào cách m¡ng gi£i phóng dân tÙc.' },
  { id: 'aug-1945', year: 1945, title: 'Cách m¡ng tháng Tám', dynasty: '', period: 'HiÇn ¡i', description: 'Giành chính quyÁn trong c£ n°Ûc, khai sinh n°Ûc ViÇt Nam Dân chç CÙng hòa.' },
  { id: 'bd-1954', year: 1954, title: 'Chi¿n th¯ng iÇn Biên Phç', dynasty: '', period: 'HiÇn ¡i', description: 'K¿t thúc th¯ng lãi cuÙc kháng chi¿n chÑng Pháp, ký HiÇp Ënh Genève.' },
  { id: 'tet-1968', year: 1968, title: 'TÕng ti¿n công và nÕi d­y T¿t M­u Thân', dynasty: '', period: 'HiÇn ¡i', description: 'B°Ûc ngo·t chi¿n l°ãc trong cuÙc kháng chi¿n chÑng Mù.' },
  { id: 'reunify-1975', year: 1975, title: 'Gi£i phóng miÁn Nam, thÑng nh¥t ¥t n°Ûc', dynasty: '', period: 'HiÇn ¡i', description: 'Chi¿n dËch HÓ Chí Minh toàn th¯ng, ¥t n°Ûc thÑng nh¥t.' },
  { id: 'doi-moi-1986', year: 1986, title: 'Khßi x°Ûng Õi mÛi', dynasty: '', period: 'HiÇn ¡i', description: 'ChuyÃn Õi mô hình kinh t¿, mß cía và hÙi nh­p quÑc t¿.' },
  { id: 'modern-1990', year: 1990, title: '1990 - Nay: HÙi nh­p và phát triÃn', dynasty: '', period: 'HiÇn ¡i', description: 'Giai o¡n hÙi nh­p quÑc t¿ sâu rÙng, phát triÃn kinh t¿ thË tr°Ýng Ënh h°Ûng xã hÙi chç ngh)a, và nâng cao vË th¿ ViÇt Nam trên tr°Ýng quÑc t¿.' }
];

// Extract keywords
function extractKeywords(query) {
  const stopWords = new Set(['là', 'cça', '°ãc', 'có', 'vÛi', 'vào', 'Ã', 'trong', 't¡i', 'të', 'và', 'ho·c']);
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
}

// Search Wikipedia (simple version)
async function searchWikipedia(query, language = 'vi') {
  try {
    const endpoint = 'https://vi.wikipedia.org/api/rest_v1';
    const url = `${endpoint}/page/summary/${encodeURIComponent(query)}?redirect=true&origin=*`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'LichSuVietNam/1.0',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      title: data.title,
      description: data.description || '',
      extract: data.extract?.substring(0, 200) || ''
    };
  } catch (error) {
    return null;
  }
}

// Get RAG context
async function getRAGContext(query) {
  const lowerQuery = query.toLowerCase();

  // 1. Filter relevant events
  const vietnameseHistoryIntent = lowerQuery.includes('lËch sí') &&
    (lowerQuery.includes('viÇt nam') || lowerQuery.includes('viÇt'));

  const keywords = extractKeywords(lowerQuery);

  const relevantEvents = EVENTS
    .filter(event => {
      const exactMatch = event.title.toLowerCase().includes(lowerQuery) ||
                        event.description.toLowerCase().includes(lowerQuery) ||
                        event.dynasty.toLowerCase().includes(lowerQuery) ||
                        event.period.toLowerCase().includes(lowerQuery);

      const intentMatch = vietnameseHistoryIntent;

      const keywordMatch = keywords.length > 0 && keywords.some(keyword => {
        const searchText = `${event.title} ${event.description} ${event.dynasty} ${event.period}`.toLowerCase();
        return searchText.includes(keyword);
      });

      return exactMatch || intentMatch || keywordMatch;
    })
    .slice(0, 5)
    .map(event =>
      `" ${event.year}: ${event.title} (${event.dynasty || 'Không'}, ${event.period}): ${event.description}`
    )
    .join('\n');

  // 2. Try Wikipedia search (best effort, no blocking)
  let wikiContext = '';
  try {
    const wikiResult = await searchWikipedia(query);
    if (wikiResult) {
      wikiContext = `\nWikipedia: ${wikiResult.title} - ${wikiResult.extract || wikiResult.description}`;
    }
  } catch (error) {
    // Ignore wiki errors
  }

  // 3. Build context
  const staticContext = relevantEvents && relevantEvents.trim().length > 0
    ? relevantEvents
    : EVENTS.slice(0, 5).map(event =>
        `" ${event.year}: ${event.title} (${event.dynasty || 'Không'}, ${event.period}): ${event.description}`
      ).join('\n');

  return `Thông tin vÁ lËch sí ViÇt Nam:\n${staticContext}${wikiContext}`;
}

// Call Gemini API
async function callGemini(message, context) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  const prompt = `B¡n là chuyên gia lËch sí ViÇt Nam. Dña vào ngï c£nh sau ây, hãy tr£ lÝi câu hÏi cça ng°Ýi dùng:

${context}

Câu hÏi: ${message}

Tr£ lÝi ng¯n gÍn, chính xác, b±ng ti¿ng ViÇt.`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin l×i, tôi không thÃ tr£ lÝi câu hÏi này.';
}

// Main handler
export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only POST requests allowed'
    });
  }

  try {
    const { message } = req.body;

    // Validate message
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        error: 'INVALID_MESSAGE',
        message: 'Tin nh¯n không °ãc Ã trÑng'
      });
    }

    // Get RAG context
    const context = await getRAGContext(message);

    // Call Gemini
    const reply = await callGemini(message, context);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // Return response
    return res.status(200).json({
      reply,
      context: context.substring(0, 200) + '...' // Preview only
    });

  } catch (error) {
    console.error('Gemini chat error:', error);

    // Set CORS headers even on error
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    return res.status(500).json({
      error: 'CHAT_ERROR',
      message: error.message || 'L×i khi xí lý chat'
    });
  }
}
