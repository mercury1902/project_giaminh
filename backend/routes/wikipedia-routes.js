import express from 'express';
import { wikipediaService } from '../services/wikipedia-service.js';

const router = express.Router();

// Search Wikipedia (specific route first)
router.get('/search/:query', async (req, res, next) => {
  try {
    const { query } = req.params;
    const { limit = 10, language = 'vi' } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        error: 'INVALID_QUERY',
        message: 'Truy vấn tìm kiếm không được để trống'
      });
    }

    const results = await wikipediaService.search(query, parseInt(limit), language);
    res.json(results);
  } catch (error) {
    next(error);
  }
});

// Get Wikipedia Summary (generic route last)
router.get('/:title', async (req, res, next) => {
  try {
    const { title } = req.params;
    const { language = 'vi' } = req.query;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        error: 'INVALID_TITLE',
        message: 'Tiêu đề bài viết không được để trống'
      });
    }

    const summary = await wikipediaService.getSummary(title, language);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

export default router;
