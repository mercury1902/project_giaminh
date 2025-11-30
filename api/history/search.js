// Vercel serverless function for history search
// Maps to /api/history/search endpoint
import { wikipediaService } from '../../backend/services/wikipedia-service.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'METHOD_NOT_ALLOWED',
      message: 'Chỉ hỗ trợ GET method'
    });
  }

  try {
    const { q: query, limit = '5', language = 'vi' } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        error: 'INVALID_QUERY',
        message: 'Truy vấn tìm kiếm không được để trống'
      });
    }

    // Call the Wikipedia service
    const results = await wikipediaService.search(query, parseInt(limit), language);

    // Set CORS headers for browser requests
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    return res.status(200).json(results);
  } catch (error) {
    console.error('History search error:', error);
    return res.status(500).json({
      error: 'SEARCH_ERROR',
      message: error.message || 'Lỗi tìm kiếm lịch sử'
    });
  }
}
