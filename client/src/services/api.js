import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 60000,
  paramsSerializer: {
    serialize: (params) => {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value);
        }
      });

      return searchParams.toString();
    }
  }
});

export async function fetchVideoInfo(url) {
  const response = await api.get('/video-info', { params: { url } });
  return response.data;
}

export async function fetchHistory() {
  const response = await api.get('/history');
  return response.data;
}

export async function downloadVideo({ url, format, title, onProgress }) {
  const response = await api.post('/download', { url, format, title }, {
    responseType: 'blob',
    timeout: 0,
    onDownloadProgress: (event) => {
      onProgress?.({
        loaded: event.loaded,
        total: event.total,
        percent: event.total ? Math.round((event.loaded / event.total) * 100) : null
      });
    }
  });

  return response;
}
