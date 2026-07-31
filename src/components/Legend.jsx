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
        {[
          { count: 5, size: 12 },
          { count: 15, size: 17 },
          { count: 30, size: 22 },
          { count: 60, size: 28 },
        ].map((item) => (
          <div className="size-legend-item" key={item.count}>
            <span
              className="size-legend-circle"
              style={{ width: item.size, height: item.size }}
            />
            関連 {item.count}件
          </div>
        ))}
      </div>
      <p className="size-legend-note">
        円が大きいほど、多くの資格と試験内容が共通しています。
      </p>
    </>
  );
}
