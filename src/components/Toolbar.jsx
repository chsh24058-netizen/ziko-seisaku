export default function Toolbar({
  searchText,
  setSearchText,
  onKeyDown,
  clearSearch,
  normalizedSearch,
  searchCount,
}) {
  return (
    <div className="toolbar">
      <input
        className="search-input"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="資格名・分野・スキルで検索"
      />

      <button className="clear-button" onClick={clearSearch}>
        クリア
      </button>

      {normalizedSearch && (
        <span className="result-count">検索結果：{searchCount}件</span>
      )}
    </div>
  );
}
