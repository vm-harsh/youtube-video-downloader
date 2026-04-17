import { useState } from 'react';
import { downloadVideo, fetchVideoInfo } from '../services/api.js';
import { saveBlob } from '../utils/saveBlob.js';

export function useDownloader(onComplete) {
  const [video, setVideo] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [progress, setProgress] = useState({ loaded: 0, total: 0, percent: 0 });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function lookupVideo(url) {
    setError('');
    setVideo(null);
    setSelectedFormat('');
    setStatus('idle');
    setProgress({ loaded: 0, total: 0, percent: 0 });
    setLoading(true);

    try {
      const info = await fetchVideoInfo(url);
      setVideo({ ...info, inputUrl: url });
      setSelectedFormat(info.formats?.[0]?.key || '');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not fetch video details. Check the URL and try again.');
    } finally {
      setLoading(false);
    }
  }

  function selectFormat(format) {
    setSelectedFormat(format);
  }

  async function downloadSelected() {
    if (!video || !selectedFormat) {
      return;
    }

    setError('');
    setStatus('downloading');
    setProgress({ loaded: 0, total: 0, percent: 0 });

    try {
      const response = await downloadVideo({
        url: video.webpageUrl || video.inputUrl,
        format: selectedFormat,
        title: video.title,
        onProgress: setProgress
      });
      const extension = selectedFormat === 'audio' ? 'mp3' : 'mp4';
      saveBlob(response.data, `${video.title || 'youtube-download'}.${extension}`);
      setStatus('completed');
      onComplete?.();
    } catch (requestError) {
      setStatus('failed');
      setError(await getRequestErrorMessage(requestError, 'Download failed. Try another format or confirm yt-dlp is installed.'));
    }
  }

  return {
    video,
    selectedFormat,
    progress,
    status,
    error,
    loading,
    lookupVideo,
    selectFormat,
    downloadSelected
  };
}

async function getRequestErrorMessage(error, fallback) {
  const data = error.response?.data;

  if (data?.message) {
    return data.message;
  }

  if (data instanceof Blob && data.type.includes('application/json')) {
    try {
      const payload = JSON.parse(await data.text());
      return payload.message || fallback;
    } catch {
      return fallback;
    }
  }

  return fallback;
}
