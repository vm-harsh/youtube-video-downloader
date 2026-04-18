import { RefreshCw } from 'lucide-react';
import { formatBytes } from '../utils/formatters.js';

export default function HistoryList({ items, onRefresh }) {
  const recentItems = items.slice(0, 3);

  return (
    <section className="glass overflow-hidden rounded-[28px] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-red-200">Recent</p>
          <h2 className="text-xl font-semibold">Last 3 downloads</h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-red-500/25"
          aria-label="Refresh recent downloads"
        >
          <RefreshCw size={17} />
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {recentItems.length === 0 ? (
          <div className="rounded-[22px] border border-white/12 bg-white/8 p-5 text-sm text-slate-300">
            No downloads saved yet.
          </div>
        ) : (
          recentItems.map((item) => (
            <article key={item._id} className="rounded-[22px] border border-white/12 bg-white/8 p-4">
              <h3 className="line-clamp-2 font-medium">{item.title}</h3>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                <span className="rounded-full bg-white/10 px-2.5 py-1">{item.format}</span>
                <span className="rounded-full bg-white/10 px-2.5 py-1">{formatBytes(item.size)}</span>
                <span className="rounded-full bg-white/10 px-2.5 py-1">
                  {new Date(item.date).toLocaleString()}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
