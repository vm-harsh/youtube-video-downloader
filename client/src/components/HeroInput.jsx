import { useEffect, useRef, useState } from 'react';
import { Download, Link2, Loader2 } from 'lucide-react';
import { gsap } from 'gsap';

export default function HeroInput({ onSubmit, loading }) {
  const [url, setUrl] = useState('');
  const rootRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(rootRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(url.trim());
  }

  function handleDrop(event) {
    event.preventDefault();
    const text = event.dataTransfer.getData('text/plain');
    if (text) {
      setUrl(text.trim());
    }
  }

  return (
    <form
      ref={rootRef}
      onSubmit={handleSubmit}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      className="glass space-y-5 rounded-[28px] p-5 sm:p-7"
    >
      <div className="space-y-3">
        <p className="text-sm font-medium text-cyan-200">Paste or drop a YouTube URL</p>
        <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-black/20 px-4 py-3">
          <Link2 className="shrink-0 text-cyan-200" size={20} />
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-400"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? <Loader2 className="animate-spin" size={19} /> : <Download size={19} />}
        {loading ? 'Fetching details' : 'Fetch video'}
      </button>
    </form>
  );
}
