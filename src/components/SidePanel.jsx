import Legend from "./Legend";

export default function SidePanel({
  selectedNode,
  setSelectedNode,
  normalizedSearch,
  searchResults,
  acquiredCount,
  qualificationCount,
  isAcquired,
  toggleAcquired,
  activeCategory,
  setActiveCategory,
  legendItems,
}) {
  return (
    <aside className="side-panel">
      <h2>詳細情報</h2>

      <div className="status-card">
        <strong>取得済み：</strong>
        {acquiredCount} / {qualificationCount} 資格
      </div>

      {selectedNode && selectedNode.type === "資格" && (
        <label
          className="acquired-label"
          style={{
            background: isAcquired(selectedNode) ? "#e8f5e9" : "#f6f8fb",
          }}
        >
          <input
            type="checkbox"
            checked={isAcquired(selectedNode)}
            onChange={() => toggleAcquired(selectedNode)}
            style={{ marginRight: "8px" }}
          />
          取得済みにする
        </label>
      )}

      {selectedNode ? (
        <div>
          <h3>{selectedNode.name}</h3>

          <p>
            <strong>種類：</strong>
            {selectedNode.type}
          </p>

          <p>
            <strong>分野：</strong>
            {selectedNode.category}
          </p>

          <p>
            <strong>難易度：</strong>
            {"★".repeat(selectedNode.level)}
            {"☆".repeat(Math.max(0, 5 - selectedNode.level))}
          </p>

          <p>
            <strong>勉強時間：</strong>
            {selectedNode.study_hours !== null
              ? `${selectedNode.study_hours}時間`
              : "-"}
          </p>

          <p>
            <strong>合格率：</strong>
            {selectedNode.pass_rate !== null ? `${selectedNode.pass_rate}%` : "-"}
          </p>

          <p>
            <strong>主催：</strong>
            {selectedNode.vendor}
          </p>

          {selectedNode.url && (
            <p>
              <strong>公式サイト：</strong>
              <br />
              <a
                className="official-link"
                href={selectedNode.url}
                target="_blank"
                rel="noreferrer"
              >
                公式ページを開く
              </a>
            </p>
          )}

          <hr />

          <p className="muted">
            選択したノードと関係のある資格・スキルだけが強調表示されます。
          </p>
        </div>
      ) : (
        <p className="muted">
          左の資格やスキルをクリックすると、ここに詳細が表示されます。
        </p>
      )}

      {normalizedSearch && (
        <>
          <hr />

          <h3>検索結果</h3>

          {searchResults.length > 0 ? (
            searchResults.map((node) => (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className="search-result"
                style={{
                  background:
                    selectedNode?.id === node.id ? "#e3f2fd" : "#f5f7fa",
                }}
              >
                <strong>{node.name}</strong>
                <br />
                <span style={{ color: "#596273" }}>
                  {node.category} / {node.type}
                </span>
              </div>
            ))
          ) : (
            <p className="muted">一致する資格はありません。</p>
          )}
        </>
      )}

      <hr />

      <Legend
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        legendItems={legendItems}
      />
    </aside>
  );
}
