import { Moon, Sun } from 'lucide-react';

export default function Navbar({ darkMode, onToggleTheme }) {
  return (
    <nav className="flex items-center justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-red-400">MERN yt-dlp</p>
        <h1 className="text-2xl font-semibold sm:text-3xl">Video Downloader</h1>
      </div>
      <button
        type="button"
        onClick={onToggleTheme}
        className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/10 text-white shadow-glow backdrop-blur-xl transition hover:border-red-400/70"
        aria-label="Toggle theme"
      >
        {darkMode ? <Sun size={19} /> : <Moon size={19} />}
      </button>
    </nav>
  );
}
