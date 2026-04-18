import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { AudioLines, Bolt, ShieldCheck, Sparkles } from 'lucide-react';
import Navbar from './components/Navbar.jsx';
import HeroInput from './components/HeroInput.jsx';
import VideoPreview from './components/VideoPreview.jsx';
import FormatSelector from './components/FormatSelector.jsx';
import DownloadProgress from './components/DownloadProgress.jsx';
import HistoryList from './components/HistoryList.jsx';
import BackgroundScene from './three/BackgroundScene.jsx';
import { useDownloader } from './hooks/useDownloader.js';
import { fetchHistory } from './services/api.js';

gsap.registerPlugin(ScrollToPlugin);

export default function App() {
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const shellRef = useRef(null);
  const heroRef = useRef(null);
  const featureRef = useRef(null);
  const fetchedVideoRef = useRef(null);
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

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

      timeline
        .fromTo(shellRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35 })
        .fromTo(
          '.nav-reveal',
          { opacity: 0, y: -14 },
          { opacity: 1, y: 0, duration: 0.55 },
          '-=0.1'
        )
        .fromTo(
          '.hero-copy > *',
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 0.72, stagger: 0.08 },
          '-=0.2'
        )
        .fromTo(
          '.hero-panel',
          { opacity: 0, y: 34, rotateX: 8 },
          { opacity: 1, y: 0, rotateX: 0, duration: 0.78 },
          '-=0.52'
        )
        .fromTo(
          '.feature-card',
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.07 },
          '-=0.35'
        );

      gsap.to('.ticker-track', {
        xPercent: -50,
        duration: 26,
        ease: 'none',
        repeat: -1
      });

      gsap.to('.signal-bar', {
        scaleY: 0.35,
        duration: 0.8,
        ease: 'sine.inOut',
        stagger: { each: 0.08, yoyo: true, repeat: -1 }
      });
    }, shellRef);

    return () => context.revert();
  }, []);

  useEffect(() => {
    if (!video || !fetchedVideoRef.current) {
      return;
    }

    const context = gsap.context(() => {
      gsap.to(window, {
        scrollTo: { y: fetchedVideoRef.current, offsetY: 24 },
        duration: 1,
        ease: 'power3.inOut'
      });

      gsap.fromTo(
        '.fetched-video-section > *',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: 'power3.out', delay: 0.18 }
      );
    }, fetchedVideoRef);

    return () => context.revert();
  }, [video]);

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
      <div className="relative min-h-screen overflow-hidden bg-[#f7f7f7] text-zinc-950 transition-colors duration-500 dark:bg-[#0f0f0f] dark:text-white">
        <BackgroundScene />
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_16%,rgba(255,0,0,0.24),transparent_32%),radial-gradient(circle_at_85%_32%,rgba(0,204,255,0.12),transparent_26%),linear-gradient(180deg,rgba(15,15,15,0)_0%,rgba(15,15,15,0.22)_100%)]" />

        <div ref={shellRef} className="app-shell relative z-10 min-h-screen opacity-0">
          <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
            <div className="nav-reveal">
              <Navbar darkMode={darkMode} onToggleTheme={() => setDarkMode((value) => !value)} />
            </div>

            <section ref={heroRef} className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1.04fr_0.96fr] lg:py-14">
              <div className="hero-copy max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-white/75 px-3 py-2 text-sm font-semibold text-zinc-800 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.08] dark:text-red-100">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-red-600 text-white">
                    <Sparkles size={14} />
                  </span>
                  YouTube-ready downloads with motion polish
                </div>

                <div className="space-y-4 py-7">
                  <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-normal text-zinc-950 dark:text-white sm:text-6xl lg:text-7xl">
                    YouTube Video Downloader
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-zinc-700 dark:text-zinc-300 sm:text-xl">
                    Paste a link, preview the video, pick a format, and download with a fast interface built around the YouTube red, black, and white visual language.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { value: 'MP4', label: 'Video formats' },
                    { value: 'MP3', label: 'Audio extraction' },
                    { value: 'yt-dlp', label: 'Download engine' }
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-[0_18px_46px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.08]">
                      <p className="text-2xl font-black text-red-600 dark:text-red-400">{item.value}</p>
                      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hero-panel">
                <div className="landing-panel relative overflow-hidden rounded-[32px] border border-zinc-200 bg-white/[0.84] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.16)] backdrop-blur-2xl dark:border-white/[0.12] dark:bg-[#151515]/[0.78]">
                  <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-red-500" />
                      <span className="h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                      <span className="h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                    </div>
                    <div className="flex h-7 items-end gap-1.5">
                      {[0.45, 0.75, 0.55, 0.95, 0.62].map((height, index) => (
                        <span
                          key={index}
                          className="signal-bar block w-1.5 origin-bottom rounded-full bg-red-500"
                          style={{ height: `${height * 24}px` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="pt-12">
                    <HeroInput onSubmit={lookupVideo} loading={loading} />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section ref={featureRef} className="border-y border-zinc-200 bg-white/70 py-5 backdrop-blur-xl dark:border-white/10 dark:bg-black/[0.24]">
            <div className="mx-auto grid w-full max-w-7xl gap-3 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
              {[
                { icon: Bolt, title: 'Fast Lookup', body: 'Pull metadata before choosing the final file.' },
                { icon: AudioLines, title: 'Audio + Video', body: 'Switch between video files and audio-only saves.' },
                { icon: ShieldCheck, title: 'Local Flow', body: 'Preview, select, and download from one clean screen.' }
              ].map(({ icon: Icon, title, body }) => (
                <article key={title} className="feature-card rounded-2xl border border-zinc-200 bg-white/[0.86] p-5 shadow-[0_16px_46px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.08]">
                  <Icon className="mb-4 text-red-600 dark:text-red-300" size={24} />
                  <h2 className="text-lg font-bold">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mx-auto w-full max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
            <div className="ticker overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-950 py-3 text-white shadow-[0_18px_60px_rgba(0,0,0,0.16)] dark:border-white/10">
              <div className="ticker-track flex w-max gap-8 whitespace-nowrap px-4 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">
                {Array.from({ length: 2 }).map((_, groupIndex) => (
                  <div key={groupIndex} className="flex gap-8">
                    <span className="text-red-400">Paste URL</span>
                    <span>Preview metadata</span>
                    <span>Select format</span>
                    <span>Download media</span>
                    <span className="text-red-400">Repeat faster</span>
                  </div>
                ))}
              </div>
            </div>

            <HistoryList items={history} onRefresh={refreshHistory} />

            <div ref={fetchedVideoRef} className="fetched-video-section scroll-mt-6 space-y-5">
              {error ? (
                <div className="rounded-3xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-sm text-red-700 shadow-glow backdrop-blur-xl dark:text-red-100">
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
          </section>
        </div>
      </div>
    </main>
  );
}
