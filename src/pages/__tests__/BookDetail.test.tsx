import { screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import BookDetail from "../BookDetail";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("BookDetail", () => {
  it("charge work + auteur + notes", async () => {
    render(
      <MemoryRouter initialEntries={["/book/OL999W"]}>
        <Routes>
          <Route path="/book/:id" element={<BookDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Work OL999W")).toBeInTheDocument();
    expect(await screen.findByText(/Author OL1A/i)).toBeInTheDocument();

    // notes (ex: 4.2)
    expect(await screen.findByText(/4\.2/i)).toBeInTheDocument();
  });
});
