import { RefreshCw } from 'lucide-react';
import { formatBytes } from '../utils/formatters.js';

export default function HistoryList({ items, onRefresh }) {
  return (
    <aside className="glass max-h-[760px] overflow-hidden rounded-[28px] p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-cyan-200">History</p>
          <h2 className="text-xl font-semibold">Recent downloads</h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-cyan-300/20"
          aria-label="Refresh history"
        >
          <RefreshCw size={17} />
        </button>
      </div>
      <div className="space-y-3 overflow-y-auto pr-1">
        {items.length === 0 ? (
          <div className="rounded-[22px] border border-white/12 bg-white/8 p-5 text-sm text-slate-300">
            No downloads saved yet.
          </div>
        ) : (
          items.map((item) => (
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
    </aside>
  );
}
