import { screen } from "@testing-library/react";
//import userEvent from "@testing-library/user-event";
import Home from "../Home";
import { renderWithRouter } from "../../test/render";
import { describe, expect, it } from "vitest";

describe("Home", () => {
  it("lance une recherche et affiche des résultats", async () => {
    renderWithRouter(<Home />, "/?q=dune&page=1");

    // attend titre résultat
    expect(await screen.findByText(/Résultats pour/i)).toBeInTheDocument();

    // au moins un item
    expect(await screen.findByText("dune book 1.0")).toBeInTheDocument();
  });

  it("affiche 'Fin des résultats' quand canLoadMore est false", async () => {
    renderWithRouter(<Home />, "/?q=dune&page=2");

    // attend la liste
    expect(await screen.findByText("dune book 1.0")).toBeInTheDocument();

    // numFound=6, page1=3 docs, page2=3 docs => items=6 => fin
    expect(await screen.findByText(/Fin des résultats/i)).toBeInTheDocument();
  });
});
