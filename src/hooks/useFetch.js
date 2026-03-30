import { useState, useEffect, useCallback } from 'react';

export function useWikipediaData(title) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!title) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchRes = await fetch(`https://vi.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(title)}&utf8=&format=json&origin=*`);
      const searchData = await searchRes.json();
      
      if (!searchData.query.search.length) {
        throw new Error("Không tìm thấy bài viết trên Wikipedia.");
      }

      const topTitle = searchData.query.search[0].title;
      const response = await fetch(`https://vi.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topTitle)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Không tìm thấy tóm tắt bài viết trên Wikipedia.");
        }
        throw new Error("Lỗi khi tải dữ liệu từ Wikipedia.");
      }

      const result = await response.json();
      
      if (result.type === 'disambiguation') {
        throw new Error("Từ khóa chỉ đến trang định hướng, vui lòng cụ thể hơn.");
      }

      setData({
        extract: result.extract,
        url: result.content_urls?.desktop?.page || `https://vi.wikipedia.org/wiki/${encodeURIComponent(title)}`
      });
    } catch (err) {
      setError({
        message: err.message,
        retryable: true,
        url: `https://vi.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(title)}`
      });
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [title]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, retry: fetchData };
}
