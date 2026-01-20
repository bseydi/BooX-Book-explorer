import { useEffect, useState } from "react";

type Props = {
    showAfter?: number; // px
};

export default function BackToTop({ showAfter = 600 }: Props) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        let ticking = false;

        function onScroll() {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                setShow(window.scrollY > showAfter);
                ticking = false;
            });
        }

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [showAfter]);

    if (!show) return null;

    return (
        <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-5 right-5 z-50 rounded-full px-4 py-3 shadow-lg bg-white/90 backdrop-blur hover:bg-white"
            aria-label="Revenir en haut"
            title="Revenir en haut"
        >
            ↑ Haut
        </button>
    );
}
