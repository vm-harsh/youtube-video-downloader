import { useEffect, useRef } from 'react';
import { Music, Video } from 'lucide-react';
import { gsap } from 'gsap';
import { attachButtonHover } from '../animations/hover.js';
import { formatBytes } from '../utils/formatters.js';

export default function FormatSelector({ formats, selectedFormat, onSelect }) {
  const gridRef = useRef(null);

  useEffect(() => {
    const buttons = [...gridRef.current.querySelectorAll('button')];
    const cleanups = buttons.map(attachButtonHover);
    gsap.fromTo(buttons, { opacity: 0, y: 12 }, { opacity: 1, y: 0, stagger: 0.05, duration: 0.35, ease: 'power2.out' });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [formats]);

  return (
    <section ref={gridRef} className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {formats.map((format) => {
        const selected = selectedFormat === format.key;
        const Icon = format.audioOnly ? Music : Video;
        return (
          <button
            key={format.key}
            type="button"
            onClick={() => onSelect(format.key)}
            className={`format-button rounded-[22px] border p-4 text-left ${
              selected
                ? 'border-red-400 bg-red-500/20 shadow-glow'
                : 'border-white/14 bg-white/8 hover:border-red-300/70'
            }`}
          >
            <Icon className="mb-4 text-red-200" size={20} />
            <span className="block text-base font-semibold">{format.label}</span>
            <span className="mt-1 block text-xs text-slate-300">{formatBytes(format.size)}</span>
          </button>
        );
      })}
    </section>
  );
}
