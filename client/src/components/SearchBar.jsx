import { useState } from "react";


function SearchBar({ onSearch, isLoading }) {
  const [searchTerm, setSearchTerm] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedSearchTerm = searchTerm.trim();

    if (!trimmedSearchTerm) {
      return;
    }

    onSearch(trimmedSearchTerm);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="recipe-search">
        Search for a recipe
      </label>

      <input
        id="recipe-search"
        type="search"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="Try chicken, pasta, curry..."
        disabled={isLoading}
      />

      <button
        type="submit"
        disabled={isLoading || !searchTerm.trim()}
      >
        {isLoading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}

export default SearchBar;