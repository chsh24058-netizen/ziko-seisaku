import Legend from "./Legend";

export default function SidePanel({
  selectedNode,
  selectedLink,
  setSelectedNode,
  setSelectedLink,
  normalizedSearch,
  searchResults,
  activeCategory,
  setActiveCategory,
  legendItems,
}) {
  return (
    <aside className="side-panel">
      <h2>{selectedLink ? "関係の根拠" : "資格情報"}</h2>

      {selectedLink ? (
        <div>
          <h3>
            {selectedLink.source.name}
            <br />
            <span className="relation-arrow">↕</span>
            <br />
            {selectedLink.target.name}
          </h3>

          <p>
            <strong>共通する試験内容：</strong>
            <br />
            {selectedLink.common_topics?.length > 0
              ? selectedLink.common_topics.join("・")
              : "未設定"}
          </p>

          <p>
            <strong>接続した理由：</strong>
            <br />
            {selectedLink.reason || "未設定"}
          </p>

          <p>
            <strong>共通項目数：</strong>
            {selectedLink.common_count}個
          </p>

          {(selectedLink.source_evidence_url ||
            selectedLink.target_evidence_url) && (
            <>
              <p>
                <strong>根拠となる公式情報：</strong>
              </p>
              <div className="evidence-links">
                {selectedLink.source_evidence_url && (
                  <a
                    className="official-link"
                    href={selectedLink.source_evidence_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {selectedLink.source.name}の根拠
                  </a>
                )}
                {selectedLink.target_evidence_url && (
                  <a
                    className="official-link"
                    href={selectedLink.target_evidence_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {selectedLink.target.name}の根拠
                  </a>
                )}
              </div>
            </>
          )}

          <hr />

          <p className="muted">
            線を選択すると、資格同士を結んだ理由と根拠を確認できます。
          </p>
        </div>
      ) : selectedNode ? (
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
            <strong>主催：</strong>
            {selectedNode.vendor}
          </p>

          <p>
            <strong>直接つながる資格：</strong>
            {selectedNode.connection_count}件
          </p>

          <p>
            <strong>主な試験内容：</strong>
            <br />
            {selectedNode.topics?.length > 0
              ? selectedNode.topics.join("・")
              : "-"}
          </p>

          {selectedNode.evidence_note && (
            <p>
              <strong>試験範囲の概要：</strong>
              <br />
              {selectedNode.evidence_note}
            </p>
          )}

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

          {selectedNode.scope_url && (
            <p>
              <strong>試験範囲の根拠：</strong>
              <br />
              <a
                className="official-link"
                href={selectedNode.scope_url}
                target="_blank"
                rel="noreferrer"
              >
                公式の試験範囲を開く
              </a>
            </p>
          )}

          {selectedNode.checked_at && (
            <p className="checked-at">
              公式情報の確認日：{selectedNode.checked_at}
            </p>
          )}

          <hr />

          <p className="muted">
            資格同士を結ぶ線をクリックすると、共通する試験内容を確認できます。
          </p>
        </div>
      ) : (
        <p className="muted">
          左の資格または関係線をクリックすると、ここに詳細が表示されます。
        </p>
      )}

      {normalizedSearch && (
        <>
          <hr />

          <h3>検索結果</h3>

          {searchResults.length > 0 ? (
            searchResults.map((node) => (
              <button
                type="button"
                key={node.id}
                onClick={() => {
                  setSelectedNode(node);
                  setSelectedLink(null);
                }}
                className={`search-result${
                  selectedNode?.id === node.id ? " is-selected" : ""
                }`}
              >
                <strong>{node.name}</strong>
                <br />
                <span className="search-result-meta">
                  {node.category} / {node.type}
                </span>
              </button>
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
