import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from "../SearchBar";
import { render } from "@testing-library/react";
import { describe, expect, it, vi} from "vitest";


describe("SearchBar", () => {
  it("permet de sélectionner une suggestion au clavier", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(
      <SearchBar
        initialValue=""
        onSearch={onSearch}
        getSuggestions={async (q) => [q, `${q} 2`, `${q} 3`]}
      />
    );

    const input = screen.getByPlaceholderText(/Titre, auteur/i);
    await user.type(input, "du");

    // ouvre suggestions
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    expect(onSearch).toHaveBeenCalled();
    // 1ère suggestion = "du"
    expect(onSearch).toHaveBeenCalledWith("du");
  });
});
