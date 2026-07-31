import { getNodeRadius } from "../utils/graphUtils";

export default function Legend({
  activeCategory,
  setActiveCategory,
  legendItems,
}) {
  return (
    <>
      <h3>凡例</h3>

      {activeCategory && (
        <button
          type="button"
          className="legend-clear-button"
          onClick={() => setActiveCategory(null)}
        >
          凡例フィルターを解除
        </button>
      )}

      <div className="legend-grid">
        {legendItems.map((item) => {
          const active = activeCategory?.label === item.label;

          return (
            <button
              type="button"
              className={`legend-item${active ? " is-active" : ""}`}
              key={item.label}
              onClick={() => {
                setActiveCategory(active ? null : item);
              }}
            >
              <span
                className="legend-dot"
                style={{ background: item.color }}
              />
              {item.label}
            </button>
          );
        })}
      </div>

      <h3 className="size-legend-title">円の大きさ</h3>
      <div className="size-legend" aria-label="円の大きさは直接つながる資格数を表します">
        {[5, 15, 30, 60].map((count) => (
          <div className="size-legend-item" key={count}>
            <span
              className="size-legend-circle"
              style={{
                width: Math.round(
                  getNodeRadius({ connection_count: count })
                ),
                height: Math.round(
                  getNodeRadius({ connection_count: count })
                ),
              }}
            />
            関連 {count}件
          </div>
        ))}
      </div>
      <p className="size-legend-note">
        円が大きいほど、直接つながる資格が多く、他の資格を探す起点になりやすいことを表します。難易度や人気ではありません。
      </p>
    </>
  );
}
