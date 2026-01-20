import { useEffect, useState } from "react";
import { getRating, setRating } from "../services/readRatings";

type Props = { workId: string };

export default function StarRating({ workId }: Props) {
  const [value, setValue] = useState(0);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    setValue(getRating(workId));
  }, [workId]);

  const shown = hover || value;

  return (
    <div className="mt-3 flex items-center gap-3">
      <div role="group" aria-label="Note sur 5 étoiles" className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => {
          const star = i + 1;
          const filled = star <= shown;

          return (
            <button
              key={star}
              type="button"
              onClick={() => {
                const next = star === value ? 0 : star;
                setValue(next);
                setRating(workId, next);
              }}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className={[
                "text-xl transition active:scale-95",
                filled ? "text-amber-400" : "text-zinc-300 hover:text-amber-300",
              ].join(" ")}
              aria-pressed={star === value}
              aria-label={`Noter ${star} sur 5`}
            >
              {filled ? "★" : "☆"}
            </button>
          );
        })}
      </div>

      <span className="text-xs text-zinc-600">
        {value ? `${value}/5` : "Non noté"}
      </span>
    </div>
  );
}
