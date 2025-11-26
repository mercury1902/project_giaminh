/**
 * Wikipedia Title Mapping
 * Maps event titles to actual Wikipedia article titles
 * Used as fallback when direct title lookup fails
 */

export const wikipediaTitleMap = {
  'Truyền thuyết Hồng Bàng – Văn Lang': ['Văn Lang', 'Hồng Bàng'],
  'Ngô Quyền chiến thắng Bạch Đằng': ['Ngô Quyền', 'Chiến thắng Bạch Đằng'],
  'Đinh Bộ Lĩnh thống nhất đất nước': ['Đinh Bộ Lĩnh', 'Nước Đại Cồ Việt'],
  'Lý Thái Tổ dời đô ra Thăng Long': ['Lý Thái Tổ', 'Thăng Long'],
  'Chiến thắng Bạch Đằng (Trần Hưng Đạo)': ['Trần Hưng Đạo', 'Trần Hưng Đạo'],
  'Khởi nghĩa Lam Sơn thắng lợi': ['Lê Lợi', 'Khởi nghĩa Lam Sơn'],
  'Quang Trung đại phá quân Thanh': ['Quang Trung', 'Quang Trung'],
  'Gia Long thống nhất, lập triều Nguyễn': ['Gia Long', 'Gia Long'],
  'Pháp nổ súng xâm lược Đà Nẵng': ['Kỳ ngộ Đà Nẵng', 'Pháp xâm lược Đông Dương', 'Đông Dương Pháp thuộc'],
  'Thành lập Đảng Cộng sản Việt Nam': ['Đảng Cộng sản Việt Nam', 'Đảng Cộng sản Việt Nam'],
  'Cách mạng tháng Tám': ['Cách mạng tháng Tám', 'Cách mạng tháng Tám 1945'],
  'Chiến thắng Điện Biên Phủ': ['Điện Biên Phủ', 'Trận Điện Biên Phủ'],
  'Tổng tiến công và nổi dậy Tết Mậu Thân': ['Tết Mậu Thân', 'Tết Mậu Thân 1968'],
  'Giải phóng miền Nam, thống nhất đất nước': ['Chiến dịch Hồ Chí Minh', 'Thống nhất Việt Nam'],
  'Khởi xướng Đổi mới': ['Đổi mới', 'Đổi mới'],
  '1990 - Nay: Hội nhập và phát triển': ['Hội nhập quốc tế của Việt Nam', 'Phát triển kinh tế Việt Nam']
}

/**
 * Get Wikipedia title mappings for an event title
 * @param {string} eventTitle - Event title from the timeline
 * @returns {Array} Array of possible Wikipedia titles to try
 */
export function getWikipediaTitleOptions(eventTitle) {
  // First option is direct title mapping
  const mapped = wikipediaTitleMap[eventTitle]
  if (mapped) {
    return mapped
  }

  // Fallback: return the original title as single option
  return [eventTitle]
}
