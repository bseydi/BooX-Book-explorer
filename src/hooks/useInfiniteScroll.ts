import { useEffect, useRef } from "react";

type Options = {
  enabled: boolean;
  onLoadMore: () => void;
  rootMargin?: string; // ex: "600px" pour précharger avant d’arriver en bas
};

export function useInfiniteScroll({ enabled, onLoadMore, rootMargin = "600px" }: Options) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) onLoadMore();
      },
      { rootMargin }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [enabled, onLoadMore, rootMargin]);

  return ref;
}
