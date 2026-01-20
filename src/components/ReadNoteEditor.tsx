import { useEffect, useState } from "react";
import { getNote, removeNote, setNote } from "../services/readNotes";

type Props = { workId: string };

export default function ReadNoteEditor({ workId }: Props) {
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(getNote(workId));
  }, [workId]);

  return (
    <div className="mt-3">
      <label htmlFor={`note-${workId}`} className="block text-xs font-medium text-zinc-700">
        Note personnelle
      </label>

      <textarea
        id={`note-${workId}`}
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          setValue(v);
          if (v.trim().length === 0) removeNote(workId);
          else setNote(workId, v);
        }}
        rows={3}
        placeholder="Ex : Très bon worldbuilding, à relire…"
        className="mt-1 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200"
      />
    </div>
  );
}
