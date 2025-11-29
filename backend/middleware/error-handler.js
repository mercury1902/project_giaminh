export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // Wikipedia API errors
  if (err.type === 'WIKIPEDIA_ERROR') {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      error: err.code || 'WIKIPEDIA_ERROR',
      message: err.message || 'Không thể lấy dữ liệu từ Wikipedia'
    });
  }

  // Network errors
  if (err.message.includes('ECONNREFUSED') || err.message.includes('ETIMEDOUT')) {
    return res.status(503).json({
      error: 'NETWORK_ERROR',
      message: 'Lỗi kết nối mạng. Vui lòng thử lại sau.'
    });
  }

  // Rate limit errors
  if (err.statusCode === 429) {
    return res.status(429).json({
      error: 'RATE_LIMITED',
      message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.'
    });
  }

  // Default error
  res.status(500).json({
    error: 'SERVER_ERROR',
    message: 'Lỗi máy chủ nội bộ'
  });
};
