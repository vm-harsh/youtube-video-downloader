import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import Navbar from './components/Navbar.jsx';
import HeroInput from './components/HeroInput.jsx';
import VideoPreview from './components/VideoPreview.jsx';
import FormatSelector from './components/FormatSelector.jsx';
import DownloadProgress from './components/DownloadProgress.jsx';
import HistoryList from './components/HistoryList.jsx';
import BackgroundScene from './three/BackgroundScene.jsx';
import { useDownloader } from './hooks/useDownloader.js';
import { fetchHistory } from './services/api.js';

export default function App() {
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const {
    video,
    selectedFormat,
    progress,
    status,
    error,
    loading,
    lookupVideo,
    selectFormat,
    downloadSelected
  } = useDownloader(refreshHistory);

  useEffect(() => {
    refreshHistory();
    gsap.fromTo('.app-shell', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
  }, []);

  async function refreshHistory() {
    try {
      const data = await fetchHistory();
      setHistory(data);
    } catch {
      setHistory([]);
    }
  }

  return (
    <main className={darkMode ? 'dark' : ''}>
      <div className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-950 transition-colors duration-500 dark:bg-[#06080f] dark:text-white">
        <BackgroundScene />
        <div className="app-shell relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
          <Navbar darkMode={darkMode} onToggleTheme={() => setDarkMode((value) => !value)} />
          <section className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5">
              <HeroInput onSubmit={lookupVideo} loading={loading} />
              {error ? (
                <div className="rounded-3xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-sm text-red-100 shadow-glow backdrop-blur-xl">
                  {error}
                </div>
              ) : null}
              {video ? (
                <div className="space-y-5">
                  <VideoPreview video={video} />
                  <FormatSelector
                    formats={video.formats}
                    selectedFormat={selectedFormat}
                    onSelect={selectFormat}
                  />
                  <DownloadProgress
                    progress={progress}
                    status={status}
                    disabled={!selectedFormat || status === 'downloading'}
                    onDownload={downloadSelected}
                  />
                </div>
              ) : null}
            </div>
            <HistoryList items={history} onRefresh={refreshHistory} />
          </section>
        </div>
      </div>
    </main>
  );
}
