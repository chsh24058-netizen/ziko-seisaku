import { useEffect, useRef, useState } from "react";

export default function Toolbar({
  searchText,
  setSearchText,
  clearSearch,
  normalizedSearch,
  searchCount,
  suggestions,
  onSelectSuggestion,
}) {
  const searchRef = useRef(null);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const showSuggestions =
    isSuggestionOpen && normalizedSearch && suggestions.length > 0;

  useEffect(() => {
    const handleOutsidePointerDown = (e) => {
      if (!searchRef.current?.contains(e.target)) {
        setIsSuggestionOpen(false);
        setActiveSuggestionIndex(-1);
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    return () =>
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
  }, []);

  useEffect(() => {
    setActiveSuggestionIndex(-1);
  }, [searchText]);

  const selectSuggestion = (node) => {
    onSelectSuggestion(node);
    setIsSuggestionOpen(false);
    setActiveSuggestionIndex(-1);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "ArrowDown" && suggestions.length > 0) {
      e.preventDefault();
      setIsSuggestionOpen(true);
      setActiveSuggestionIndex((current) =>
        current >= suggestions.length - 1 ? 0 : current + 1
      );
      return;
    }

    if (e.key === "ArrowUp" && suggestions.length > 0) {
      e.preventDefault();
      setIsSuggestionOpen(true);
      setActiveSuggestionIndex((current) =>
        current <= 0 ? suggestions.length - 1 : current - 1
      );
      return;
    }

    if (e.key === "Enter" && suggestions.length > 0) {
      e.preventDefault();
      const index =
        activeSuggestionIndex >= 0 ? activeSuggestionIndex : 0;
      selectSuggestion(suggestions[index]);
      return;
    }

    if (e.key === "Escape") {
      setIsSuggestionOpen(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const handleClear = () => {
    clearSearch();
    setIsSuggestionOpen(false);
    setActiveSuggestionIndex(-1);
  };

  return (
    <div className="toolbar">
      <div className="search-combobox" ref={searchRef}>
        <input
          className="search-input"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setIsSuggestionOpen(true);
          }}
          onFocus={() => {
            if (normalizedSearch) setIsSuggestionOpen(true);
          }}
          onKeyDown={handleSearchKeyDown}
          placeholder="資格名・分野・試験内容で検索"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={Boolean(showSuggestions)}
          aria-controls="qualification-suggestions"
          aria-activedescendant={
            activeSuggestionIndex >= 0
              ? `qualification-suggestion-${suggestions[activeSuggestionIndex]?.id}`
              : undefined
          }
        />

        {showSuggestions && (
          <div
            id="qualification-suggestions"
            className="search-suggestions"
            role="listbox"
            aria-label="資格の検索候補"
          >
            {suggestions.map((node, index) => (
              <button
                type="button"
                id={`qualification-suggestion-${node.id}`}
                className={`search-suggestion${
                  index === activeSuggestionIndex ? " is-active" : ""
                }`}
                key={node.id}
                role="option"
                aria-selected={index === activeSuggestionIndex}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => selectSuggestion(node)}
                onMouseEnter={() => setActiveSuggestionIndex(index)}
              >
                <span className="search-suggestion-name">{node.name}</span>
                <span className="search-suggestion-meta">
                  {node.category} ／ {node.vendor}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button type="button" className="clear-button" onClick={handleClear}>
        クリア
      </button>

      {normalizedSearch && (
        <span className="result-count">検索結果：{searchCount}件</span>
      )}
    </div>
  );
}
