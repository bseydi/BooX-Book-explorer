import { Link, NavLink, Outlet } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { useReading } from "../context/ReadingContext";
import { getLastSearchUrl } from "../services/lastSearch";
import BackToTop from "./BackToTop";
import Footer from "./Footer";

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "rounded-xl px-3 py-2 text-sm font-medium transition",
          isActive ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-700 hover:bg-zinc-100",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

export default function Layout() {
  const { favorites } = useFavorites();
  const { read } = useReading();

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-b from-indigo-50 via-zinc-50 to-white text-zinc-900">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-0 font-semibold">
            <span className="inline-flex h-8 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white">
              BooX
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavItem to={getLastSearchUrl()}>Recherche</NavItem>

            <NavItem to="/favorites">
              <span className="inline-flex items-center gap-2">
                Favoris
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-100 px-2 text-xs text-zinc-700">
                  {favorites.length}
                </span>
              </span>
            </NavItem>

            <NavItem to="/read">
              <span className="inline-flex items-center gap-2">
                Lu
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-100 px-2 text-xs text-zinc-700">
                  {read.length}
                </span>
              </span>
            </NavItem>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
