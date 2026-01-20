import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { FavoritesProvider } from "../context/FavoritesContext";
import { ReadingProvider } from "../context/ReadingContext";

export default function App() {
  return (
    <FavoritesProvider>
      <ReadingProvider>
        <RouterProvider router={router} />
      </ReadingProvider>
    </FavoritesProvider>
  );
}
