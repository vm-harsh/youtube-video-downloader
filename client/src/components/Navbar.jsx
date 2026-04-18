import { Moon, Sun } from 'lucide-react';

export default function Navbar({ darkMode, onToggleTheme }) {
  return (
    <nav className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-14 place-items-center rounded-2xl bg-red-600 text-white shadow-glow">
          <span className="h-0 w-0 border-y-[7px] border-l-[12px] border-y-transparent border-l-white" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-red-500 dark:text-red-400">MERN yt-dlp</p>
          <h1 className="text-xl font-black sm:text-2xl">StreamSave</h1>
        </div>
      </div>
      <button
        type="button"
        onClick={onToggleTheme}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-zinc-200 bg-white/80 text-zinc-950 shadow-glow backdrop-blur-xl transition hover:border-red-400/70 dark:border-white/15 dark:bg-white/10 dark:text-white"
        aria-label="Toggle theme"
      >
        {darkMode ? <Sun size={19} /> : <Moon size={19} />}
      </button>
    </nav>
  );
}
