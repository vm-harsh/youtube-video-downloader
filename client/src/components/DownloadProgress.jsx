import { useEffect, useRef } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { gsap } from 'gsap';
import { formatBytes } from '../utils/formatters.js';

export default function DownloadProgress({ progress, status, disabled, onDownload }) {
  const barRef = useRef(null);
  const percent = progress.percent ?? Math.min(96, Math.round((progress.loaded / Math.max(progress.loaded + 1, 1)) * 100));

  useEffect(() => {
    gsap.to(barRef.current, {
      width: `${status === 'completed' ? 100 : percent}%`,
      duration: 0.35,
      ease: 'power2.out'
    });
  }, [percent, status]);

  return (
    <section className="glass space-y-4 rounded-[28px] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">Download</p>
          <p className="text-sm text-slate-300">
            {status === 'downloading'
              ? `Received ${formatBytes(progress.loaded)}`
              : status === 'completed'
                ? 'Download completed'
                : status === 'failed'
                  ? 'Download failed'
                  : 'Ready when you are'}
          </p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={onDownload}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'downloading' ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
          Download
        </button>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div ref={barRef} className="h-full w-0 rounded-full bg-gradient-to-r from-cyan-300 to-teal-300" />
      </div>
    </section>
  );
}
