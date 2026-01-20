import { Link, NavLink } from "react-router-dom";

function FooterLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className="text-sm text-zinc-600 transition hover:text-zinc-900 hover:underline"
    >
      {children}
    </NavLink>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 font-semibold">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white">
                B
              </span>
              <span>BooX</span>
            </Link>
            <p className="max-w-md text-sm text-zinc-600">
              BooX est un book explorer avec recherche, favoris et suivi de lectures avec notes & ratings.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                App
              </p>
              <div className="flex flex-col gap-2">
                <FooterLink to="/">Recherche</FooterLink>
                <FooterLink to="/favorites">Favoris</FooterLink>
                <FooterLink to="/read">Lu</FooterLink>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Data
              </p>
              <a
                href="https://openlibrary.org"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-zinc-600 transition hover:text-zinc-900 hover:underline"
              >
                Open Library
              </a>
              <p className="text-xs text-zinc-500">
                Données fournies par Open Library.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Projet
              </p>
              <a
                href="https://github.com/bseydi"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-zinc-600 transition hover:text-zinc-900 hover:underline"
                title="bseydi"
              >
                GitHub
              </a>
              <p className="text-xs text-zinc-500">TypeScript • React • Tailwind</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-zinc-200 pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} BooX</p>
          <p>
            Made with ❤️ —{" "}
            <a
              href="https://openlibrary.org/developers/api"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-900 hover:underline"
            >
              API docs
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
