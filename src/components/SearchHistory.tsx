
type Props = {
  items: string[];
  onPick: (q: string) => void;
  onClear: () => void;
};

export default function SearchHistory({ items, onPick, onClear }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="mt-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-600">Recherches récentes</p>
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 active:scale-95"
        >
          Effacer
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-95"
            title={`Rechercher : ${q}`}
          >
            {q}
          </button>
        ))}
      </div>
    </section>
  );
}
