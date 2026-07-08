import { getNodeColor, getNodeRadius, getShortName } from "../utils/graphUtils";

export default function GraphView({
  graphWidth,
  graphHeight,
  nodes,
  links,
  selectedNode,
  hoverNode,
  setSelectedNode,
  setHoverNode,
  resetSelection,
  isSearchMatched,
  isAcquired,
  getNodeOpacity,
  getLinkOpacity,
}) {
  return (
    <div className="graph-card">
      <svg
        className="graph-svg"
        viewBox={`0 0 ${graphWidth} ${graphHeight}`}
        preserveAspectRatio="xMidYMid meet"
        onClick={resetSelection}
      >
        {links.map((link, index) => (
          <line
            key={index}
            x1={link.source.x}
            y1={link.source.y}
            x2={link.target.x}
            y2={link.target.y}
            stroke="#757575"
            strokeWidth={getLinkOpacity(link) > 0.2 ? 2 : 1}
            opacity={getLinkOpacity(link)}
          />
        ))}

        {nodes.map((node) => {
          const matched = isSearchMatched(node);
          const acquired = isAcquired(node);
          const radius = getNodeRadius(node);

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNode(node);
              }}
              onMouseEnter={() => setHoverNode(node)}
              onMouseLeave={() => setHoverNode(null)}
              style={{ cursor: "pointer" }}
              opacity={getNodeOpacity(node)}
            >
              <circle
                r={radius}
                fill={getNodeColor(node)}
                stroke={
                  selectedNode?.id === node.id
                    ? "#111827"
                    : matched
                    ? "#ffeb3b"
                    : acquired
                    ? "#2e7d32"
                    : "white"
                }
                strokeWidth={
                  selectedNode?.id === node.id || matched || acquired ? 4 : 2
                }
              />

              {acquired && (
                <g>
                  <circle
                    cx={radius - 2}
                    cy={-radius + 2}
                    r="9"
                    fill="white"
                    stroke="#2e7d32"
                    strokeWidth="2"
                  />
                  <text
                    x={radius - 2}
                    y={-radius + 6}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="bold"
                    fill="#2e7d32"
                  >
                    ✓
                  </text>
                </g>
              )}

              <text
                y={radius + 15}
                textAnchor="middle"
                fontSize="10.5"
                fontWeight={selectedNode?.id === node.id ? "700" : "500"}
                fill="#263238"
              >
                {getShortName(node.name)}
              </text>
            </g>
          );
        })}

        {hoverNode && (
          <g transform={`translate(${hoverNode.x + 20}, ${hoverNode.y - 20})`}>
            <rect
              width="220"
              height="68"
              rx="10"
              fill="white"
              stroke="#cfd5df"
              opacity="0.96"
            />
            <text x="12" y="24" fontSize="13" fontWeight="bold">
              {hoverNode.name}
            </text>
            <text x="12" y="46" fontSize="12" fill="#596273">
              {hoverNode.category} / {hoverNode.type}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
