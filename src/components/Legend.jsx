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
          onClick={() => setActiveCategory(null)}
          style={{
            padding: "8px 10px",
            marginBottom: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            background: "white",
            cursor: "pointer",
            fontWeight: "700",
          }}
        >
          凡例フィルターを解除
        </button>
      )}

      <div className="legend-grid">
        {legendItems.map((item) => {
          const active = activeCategory?.label === item.label;

          return (
            <div
              className="legend-item"
              key={item.label}
              onClick={() => {
                setActiveCategory(active ? null : item);
              }}
              style={{
                cursor: "pointer",
                padding: "8px 10px",
                borderRadius: "10px",
                background: active ? "#e3f2fd" : "transparent",
                border: active ? "1px solid #90caf9" : "1px solid transparent",
              }}
            >
              <span
                className="legend-dot"
                style={{ background: item.color }}
              />
              {item.label}
            </div>
          );
        })}
      </div>
    </>
  );
}
