import { useEffect, useRef } from 'react';
import { Clock, Copy } from 'lucide-react';
import { gsap } from 'gsap';
import { formatDuration } from '../utils/formatters.js';

export default function VideoPreview({ video }) {
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(cardRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' });
  }, [video]);

  async function copyThumbnail() {
    await navigator.clipboard.writeText(video.thumbnail);
  }

  return (
    <article ref={cardRef} className="glass overflow-hidden rounded-[28px]">
      <img src={video.thumbnail} alt={video.title} className="aspect-video w-full object-cover" />
      <div className="space-y-4 p-5">
        <h2 className="line-clamp-2 text-xl font-semibold leading-snug">{video.title}</h2>
        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-2 rounded-full bg-zinc-950/[0.06] px-3 py-1 dark:bg-white/10">
            <Clock size={16} />
            {formatDuration(video.duration)}
          </span>
          <button
            type="button"
            onClick={copyThumbnail}
            className="inline-flex items-center gap-2 rounded-full bg-zinc-950/[0.06] px-3 py-1 transition hover:bg-red-500/25 dark:bg-white/10"
          >
            <Copy size={16} />
            Thumbnail URL
          </button>
        </div>
      </div>
    </article>
  );
}
