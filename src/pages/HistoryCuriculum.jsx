import React, { useState } from 'react';

// Dữ liệu nội dung các bài học lịch sử
const curriculumData = [
  {
    id: 'theme-1',
    title: 'Chủ đề 1: Lịch sử và sử học',
    color: '#e0f2fe', // Xanh dương nhạt
    borderColor: '#0284c7', // Xanh dương đậm
    lessons: [
      {
        id: 'lesson-1', title: 'Bài 1: Lịch sử hiện thực và nhận thức lịch sử', icon: '📜',
        summary: 'Sự khác biệt giữa những gì thực sự xảy ra trong quá khứ và cách ghi nhận lại.',
        content: 'Lịch sử hiện thực là toàn bộ những gì đã diễn ra trong quá khứ tồn tại một cách khách quan. Nhận thức lịch sử là toàn bộ những tri thức, hiểu biết, ý niệm của con người về quá khứ.'
      },
      {
        id: 'lesson-2', title: 'Bài 2: Tri thức lịch sử và cuộc sống', icon: '🌱',
        summary: 'Vai trò và ý nghĩa của việc học tập lịch sử đối với cá nhân và xã hội.',
        content: 'Tri thức lịch sử giúp con người nhận thức sâu sắc về cội nguồn, bản sắc văn hóa dân tộc. Cung cấp bài học kinh nghiệm để giải quyết vấn đề hiện tại, dự báo tương lai và phát triển công nghiệp văn hóa.'
      }
    ]
  },
  {
    id: 'theme-2',
    title: 'Chủ đề 2: Vai trò của sử học',
    color: '#dcfce7', // Xanh lá nhạt
    borderColor: '#16a34a', // Xanh lá đậm
    lessons: [
      {
        id: 'lesson-3', title: 'Bài 3: Sử học với các lĩnh vực khoa học', icon: '🔬',
        summary: 'Mối quan hệ tương hỗ giữa Sử học và các ngành khoa học khác.',
        content: 'Sử học là môn khoa học mang tính liên ngành. Nghiên cứu lịch sử cần sử dụng phương pháp của nhiều ngành khác (Địa lí, Khảo cổ...). Ngược lại, tri thức lịch sử là nền tảng cho các ngành đó.'
      },
      {
        id: 'lesson-4', title: 'Bài 4: Sử học với một số ngành nghề hiện đại', icon: '💼',
        summary: 'Ứng dụng của Sử học trong du lịch, bảo tồn di sản.',
        content: 'Sử học đóng vai trò to lớn trong việc bảo tồn di sản văn hóa. Các tri thức lịch sử là chất liệu cốt lõi để phát triển ngành du lịch, xây dựng các sản phẩm văn hóa (điện ảnh, game).'
      }
    ]
  },
  {
    id: 'theme-3',
    title: 'Chủ đề 3: Một số nền văn minh thế giới thời kì cổ - trung đại',
    color: '#ffedd5', // Cam nhạt
    borderColor: '#ea580c', // Cam đậm
    lessons: [
      {
        id: 'lesson-5', title: 'Bài 5: Khái niệm văn minh. Một số nền văn minh phương Đông', icon: '⛩️',
        summary: 'Phân biệt văn hóa - văn minh và tìm hiểu Ai Cập, Ấn Độ, Trung Hoa cổ đại.',
        content: 'Văn minh là trạng thái tiến bộ về vật chất và tinh thần. Phương Đông là cái nôi của văn minh nhân loại với các thành tựu rực rỡ về chữ viết tượng hình, kiến trúc đồ sộ (Kim tự tháp) và tôn giáo lớn.'
      },
      {
        id: 'lesson-6', title: 'Bài 6: Một số nền văn minh phương Tây thời kì cổ - trung đại', icon: '🏛️',
        summary: 'Khám phá nền văn minh Hy Lạp - La Mã cổ đại và thời kỳ Phục hưng.',
        content: 'Văn minh phương Tây (Hy Lạp - La Mã) để lại dấu ấn về thể chế dân chủ, luật pháp. Thời kỳ Phục hưng đánh dấu sự thức tỉnh của con người, đề cao giá trị nhân văn và khoa học thực nghiệm.'
      }
    ]
  },
  {
    id: 'theme-4',
    title: 'Chủ đề 4: Các cuộc cách mạng công nghiệp trong lịch sử thế giới',
    color: '#f3e8ff', // Tím nhạt
    borderColor: '#9333ea', // Tím đậm
    lessons: [
      {
        id: 'lesson-7', title: 'Bài 7: Các cuộc cách mạng công nghiệp thời kì cận đại', icon: '🚂',
        summary: 'Cách mạng công nghiệp lần thứ nhất và lần thứ hai.',
        content: 'Cách mạng lần 1 bắt đầu ở Anh với máy hơi nước, chuyển sang cơ khí. Lần 2 gắn liền với ứng dụng điện năng và động cơ đốt trong, tạo sự phát triển vượt bậc trong giao thông và sản xuất.'
      },
      {
        id: 'lesson-8', title: 'Bài 8: Các cuộc cách mạng công nghiệp thời kì hiện đại', icon: '💻',
        summary: 'Cách mạng công nghiệp lần thứ ba và lần thứ tư (AI, Số hóa).',
        content: 'Cách mạng lần 3 đặc trưng bởi tự động hóa dựa trên máy tính. Cách mạng lần 4 là sự kết hợp của công nghệ vật lý, số hóa và sinh học (AI, IoT), làm thay đổi toàn diện đời sống xã hội.'
      }
    ]
  },
  {
    id: 'theme-5',
    title: 'Chủ đề 5: Văn minh Đông Nam Á',
    color: '#ccfbf1', // Lục lam nhạt
    borderColor: '#0d9488', // Lục lam đậm
    lessons: [
      {
        id: 'lesson-9', title: 'Bài 9: Cơ sở hình thành văn minh Đông Nam Á', icon: '🌴',
        summary: 'Điều kiện tự nhiên, dân cư và sự tiếp thu văn hóa bên ngoài.',
        content: 'Đông Nam Á có vị trí giao thương quan trọng. Văn minh hình thành dựa trên nền tảng văn hóa bản địa kết hợp tiếp thu có chọn lọc các yếu tố văn minh Ấn Độ và Trung Hoa.'
      },
      {
        id: 'lesson-10', title: 'Bài 10: Hành trình phát triển và thành tựu của văn minh ĐNA', icon: '🛕',
        summary: 'Các giai đoạn phát triển và di sản kiến trúc, tôn giáo tiêu biểu.',
        content: 'Từ đầu Công nguyên đến thế kỷ XVI, Đông Nam Á phát triển rực rỡ với hệ thống chữ viết riêng, sự dung hợp tôn giáo và các công trình kiến trúc đồ sộ như Angkor Wat, Borobudur.'
      }
    ]
  }
];

// Component cho từng bài học (Hiệu ứng Accordion Mở/Đóng)
const LessonItem = ({ lesson, themeColor, borderColor }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{
      marginBottom: '12px',
      border: 1px solid ${borderColor},
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#fff',
      transition: 'all 0.3s ease'
    }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '16px',
          backgroundColor: themeColor,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 'bold',
          color: '#333'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>{lesson.icon}</span>
          <span>{lesson.title}</span>
        </div>
        <span>{isOpen ? '▲' : '▼'}</span>
      </div>
      
      {/* Nội dung xổ xuống khi Click */}
      <div style={{ 
        padding: '16px', 
        display: isOpen ? 'block' : 'none',
        backgroundColor: '#fafafa'
      }}>
        <p style={{ margin: '0 0 12px 0', fontStyle: 'italic', color: '#4b5563' }}>
          <strong>Nội dung sơ bộ:</strong> {lesson.summary}
        </p>
        <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '12px 0' }}></div>
        <p style={{ margin: 0, lineHeight: '1.6', color: '#1f2937' }}>
          <strong>Nội dung chi tiết:</strong> {lesson.content}
        </p>
      </div>
    </div>
  );
};

// Component chính của trang
export default function HistoryCurriculum() {
  return (
    <div className="section" style={{ minHeight: '100vh', padding: '40px 20px', backgroundColor: '#f9fafb' }}>
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#111827' }}>
          Chương trình Lịch sử 10
        </h1>
        
        {curriculumData.map((theme) => (
          <div key={theme.id} style={{ marginBottom: '32px' }}>
            <h2 style={{ 
              color: theme.borderColor, 
              borderBottom: 2px solid ${theme.borderColor},
              paddingBottom: '8px',
              marginBottom: '16px',
              fontSize: '1.5rem'
            }}>
              {theme.title}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {theme.lessons.map(lesson => (
                <LessonItem 
                  key={lesson.id} 
                  lesson={lesson} 
                  themeColor={theme.color}
                  borderColor={theme.borderColor}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
