import { useEffect, useRef, useState } from "react";

export default function Toolbar({
  searchText,
  setSearchText,
  clearSearch,
  normalizedSearch,
  searchCount,
  suggestions,
  onSelectSuggestion,
  zoomLevel,
  setZoomLevel,
  onFitView,
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

    if (e.key === "Enter" && showSuggestions) {
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

  const handleZoomInputChange = (e) => {
    const value = e.target.value;
    if (value === "") return;
    const num = Number(value);
    if (!isNaN(num)) {
      const clamped = Math.max(0.2, Math.min(2, num / 100));
      setZoomLevel(clamped);
    }
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(2, zoomLevel + 0.1);
    setZoomLevel(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.2, zoomLevel - 0.1);
    setZoomLevel(newZoom);
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
          placeholder="資格名・分野・主催団体で検索"
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

      <div className="size-control">
        <label htmlFor="zoom-slider">ズーム：</label>
        <input
          id="zoom-slider"
          type="range"
          min="0.2"
          max="2"
          step="0.1"
          value={zoomLevel}
          onChange={(e) => setZoomLevel(Number(e.target.value))}
          className="zoom-slider"
        />
        <input
          type="number"
          min="20"
          max="200"
          step="5"
          value={Math.round(zoomLevel * 100)}
          onChange={handleZoomInputChange}
          className="zoom-input"
          aria-label="ズームレベルを入力"
        />
        <span className="size-value">%</span>
        <button
          type="button"
          onClick={onFitView}
          className="fit-button"
          aria-label="全体を表示"
        >
          全体
        </button>
      </div>
    </div>
  );
}
