export default function Navbar() {
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
    </nav>
  );
}
