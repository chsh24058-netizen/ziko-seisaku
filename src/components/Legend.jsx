export default function Legend({
  activeCategory,
  setActiveCategory,
  legendItems,
}) {
  return (
    <>
      <div className="legend-header">
        <h3>凡例</h3>

        {activeCategory && (
          <button
            type="button"
            className="legend-clear-button"
            onClick={() => setActiveCategory(null)}
          >
            フィルターを解除
          </button>
        )}
      </div>

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
    </>
  );
}
