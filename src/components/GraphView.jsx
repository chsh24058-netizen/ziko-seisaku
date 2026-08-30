import { useEffect, useRef, useState } from "react";
import {
  getCategoryPosition,
  getLegendItems,
  getNodeColor,
  getNodeRadius,
  getShortName,
} from "../utils/graphUtils";

const minZoom = 0.2;
const initialZoom = 0.25;
const maxZoom = 2.4;
const minNodeScreenRadius = 8;
const minCategoryLabelScreenSize = 11;
const minStrokeScale = 0.45;
const getLinkStrokeWidth = (similarity) => {
  const score = Math.max(0, Math.min(1, Number(similarity) || 0));

  if (score >= 0.8) return 11;
  if (score >= 0.65) return 8;
  if (score >= 0.55) return 6;
  if (score >= 0.45) return 4;
  if (score >= 0.35) return 2.5;
  if (score >= 0.25) return 1.5;
  return 1;
};

const createFitView = (
  viewportWidth,
  viewportHeight,
  graphWidth,
  graphHeight
) => {
  const padding = 44;
  const k = Math.min(
    (viewportWidth - padding * 2) / graphWidth,
    (viewportHeight - padding * 2) / graphHeight
  );

  return {
    x: (viewportWidth - graphWidth * k) / 2,
    y: (viewportHeight - graphHeight * k) / 2,
    k,
  };
};

const createInitialView = (
  viewportWidth,
  viewportHeight,
  graphWidth,
  graphHeight
) => {
  const k = initialZoom;

  return {
    x: (viewportWidth - graphWidth * k) / 2,
    y: (viewportHeight - graphHeight * k) / 2,
    k,
  };
};

export default function GraphView({
  viewportWidth,
  viewportHeight,
  graphWidth,
  graphHeight,
  nodes,
  links,
  selectedNode,
  selectedLink,
  hoverNode,
  setSelectedNode,
  setSelectedLink,
  setHoverNode,
  resetSelection,
  isSearchMatched,
  getNodeOpacity,
  getLinkOpacity,
  minSimilarity,
}) {
  const svgRef = useRef(null);
  const panRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [view, setView] = useState(() =>
    createInitialView(viewportWidth, viewportHeight, graphWidth, graphHeight)
  );

  const fitView = () => {
    setView(createFitView(viewportWidth, viewportHeight, graphWidth, graphHeight));
  };

  useEffect(() => {
    setView(
      createInitialView(
        viewportWidth,
        viewportHeight,
        graphWidth,
        graphHeight
      )
    );
  }, [viewportWidth, viewportHeight, graphWidth, graphHeight]);

  useEffect(() => {
    if (!selectedNode || selectedNode.x === undefined) return;

    setView((current) => {
      const nextZoom = Math.max(current.k, 0.8);
      return {
        x: viewportWidth / 2 - selectedNode.x * nextZoom,
        y: viewportHeight / 2 - selectedNode.y * nextZoom,
        k: nextZoom,
      };
    });
  }, [selectedNode, viewportWidth, viewportHeight]);

  const changeZoom = (nextZoom, centerX, centerY) => {
    setView((current) => {
      const k = Math.max(minZoom, Math.min(maxZoom, nextZoom));
      const ratio = k / current.k;
      return {
        x: centerX - (centerX - current.x) * ratio,
        y: centerY - (centerY - current.y) * ratio,
        k,
      };
    });
  };

  const zoomFromCenter = (delta) => {
    changeZoom(
      view.k + delta,
      viewportWidth / 2,
      viewportHeight / 2
    );
  };

  const handleWheel = (e) => {
    e.preventDefault();

    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * viewportWidth;
    const y = ((e.clientY - rect.top) / rect.height) * viewportHeight;
    const delta = e.deltaY < 0 ? 0.01 : -0.01;

    changeZoom(view.k + delta, x, y);
  };

  const handlePanStart = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    svgRef.current.setPointerCapture(e.pointerId);
    panRef.current = {
      pointerId: e.pointerId,
      clientX: e.clientX,
      clientY: e.clientY,
      x: view.x,
      y: view.y,
      scaleX: viewportWidth / rect.width,
      scaleY: viewportHeight / rect.height,
      moved: false,
    };
    setIsPanning(true);
  };

  const handlePanMove = (e) => {
    if (!panRef.current || panRef.current.pointerId !== e.pointerId) return;

    const start = panRef.current;
    if (
      Math.abs(e.clientX - start.clientX) > 3 ||
      Math.abs(e.clientY - start.clientY) > 3
    ) {
      start.moved = true;
    }
    setView((current) => ({
      ...current,
      x: start.x + (e.clientX - start.clientX) * start.scaleX,
      y: start.y + (e.clientY - start.clientY) * start.scaleY,
    }));
  };

  const handlePanEnd = (e) => {
    if (!panRef.current || panRef.current.pointerId !== e.pointerId) return;

    const shouldResetSelection =
      e.type === "pointerup" && !panRef.current.moved;

    if (svgRef.current.hasPointerCapture(e.pointerId)) {
      svgRef.current.releasePointerCapture(e.pointerId);
    }
    panRef.current = null;
    setIsPanning(false);

    if (shouldResetSelection) {
      resetSelection();
    }
  };

  const handleMinimapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const graphX = ((e.clientX - rect.left) / rect.width) * graphWidth;
    const graphY = ((e.clientY - rect.top) / rect.height) * graphHeight;

    setView((current) => ({
      ...current,
      x: viewportWidth / 2 - graphX * current.k,
      y: viewportHeight / 2 - graphY * current.k,
    }));
  };

  const categories = getLegendItems();
  const visibleLinks = links.filter((link) => getLinkOpacity(link) > 0.2);
  const minimapLinks = links.filter(
    (link) =>
      Number(link.common_count) >= 2 &&
      Number(link.similarity) >= minSimilarity
  );
  const minimapViewport = {
    x: -view.x / view.k,
    y: -view.y / view.k,
    width: viewportWidth / view.k,
    height: viewportHeight / view.k,
  };
  const strokeScale = Math.max(minStrokeScale, Math.min(1, view.k));
  const categoryLabelFontSize = Math.max(
    30,
    minCategoryLabelScreenSize / view.k
  );

  return (
    <div className="graph-card">
      <div className="graph-controls" aria-label="マップ操作">
        <button
          type="button"
          onClick={() => zoomFromCenter(0.01)}
          aria-label="拡大"
        >
          ＋
        </button>
        <span>{Math.round(view.k * 100)}%</span>
        <button
          type="button"
          onClick={() => zoomFromCenter(-0.01)}
          aria-label="縮小"
        >
          −
        </button>
        <button type="button" className="fit-button" onClick={fitView}>
          全体
        </button>
      </div>

      <div className="relation-filter">
        <span>関連度42%以上（{visibleLinks.length}本）</span>
      </div>

      <div className="graph-help">
        背景をドラッグ：移動　ホイール：拡大・縮小
      </div>

      <svg
        ref={svgRef}
        className={`graph-svg${isPanning ? " is-panning" : ""}`}
        viewBox={`0 0 ${viewportWidth} ${viewportHeight}`}
        preserveAspectRatio="xMidYMid meet"
        onWheel={handleWheel}
        onPointerMove={handlePanMove}
        onPointerUp={handlePanEnd}
        onPointerCancel={handlePanEnd}
      >
        <rect
          className="graph-background"
          width={viewportWidth}
          height={viewportHeight}
          onPointerDown={handlePanStart}
        />

        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          <g className="category-labels" aria-hidden="true">
            {categories.map((item) => {
              const position = getCategoryPosition(
                item.label,
                graphWidth,
                graphHeight
              );

              return (
                <text
                  key={item.label}
                  x={position.x}
                  y={position.y - 95}
                  textAnchor="middle"
                  fill={item.color}
                  style={{ fontSize: categoryLabelFontSize }}
                >
                  {item.label}
                </text>
              );
            })}
          </g>

          {visibleLinks.map((link) => {
            const selected = selectedLink === link;
            const opacity = getLinkOpacity(link);
            const linkStrokeWidth = getLinkStrokeWidth(link.similarity);

            return (
              <g
                key={`${link.source.id}-${link.target.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(null);
                  setSelectedLink(link);
                }}
                style={{
                  cursor: opacity > 0.2 ? "pointer" : "default",
                  pointerEvents: opacity > 0.2 ? "auto" : "none",
                }}
              >
                <line
                  x1={link.source.x}
                  y1={link.source.y}
                  x2={link.target.x}
                  y2={link.target.y}
                  stroke="transparent"
                  strokeWidth={Math.max(14, linkStrokeWidth + 8)}
                  vectorEffect="non-scaling-stroke"
                />
                <line
                  x1={link.source.x}
                  y1={link.source.y}
                  x2={link.target.x}
                  y2={link.target.y}
                  stroke={selected ? "#1f2421" : "#777b78"}
                  strokeWidth={
                    (selected ? linkStrokeWidth + 3 : linkStrokeWidth) *
                    strokeScale
                  }
                  opacity={opacity}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}

          {nodes.map((node) => {
            const matched = isSearchMatched(node);
            const radius = Math.max(
              getNodeRadius(node),
              minNodeScreenRadius / view.k
            );
            const showLabel =
              view.k >= 0.62 ||
              matched ||
              selectedNode?.id === node.id ||
              hoverNode?.id === node.id;
            const keepLabelReadable = showLabel && view.k < 0.62;
            const labelFontSize = keepLabelReadable ? 13 / view.k : 13;
            const labelOffset = keepLabelReadable ? 18 / view.k : 18;
            const labelStrokeWidth = keepLabelReadable ? 4 / view.k : 4;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(node);
                  setSelectedLink(null);
                }}
                onMouseEnter={() => setHoverNode(node)}
                onMouseLeave={() => setHoverNode(null)}
                style={{ cursor: "pointer" }}
                opacity={getNodeOpacity(node)}
                tabIndex="0"
                role="button"
                aria-label={`${node.name}の詳細を表示`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedNode(node);
                    setSelectedLink(null);
                  }
                }}
              >
                <circle
                  r={radius}
                  fill={getNodeColor(node)}
                  stroke={
                    selectedNode?.id === node.id
                      ? "#1f2421"
                      : matched
                      ? "#e0ad2f"
                      : "#fffefb"
                  }
                  strokeWidth={
                    (selectedNode?.id === node.id || matched ? 5 : 3) *
                    strokeScale
                  }
                  vectorEffect="non-scaling-stroke"
                />

                {showLabel && (
                  <text
                    y={radius + labelOffset}
                    textAnchor="middle"
                    fontSize={labelFontSize}
                    fontWeight={selectedNode?.id === node.id ? "700" : "600"}
                    fill="#2c312e"
                    stroke="#fffefb"
                    strokeWidth={labelStrokeWidth}
                    paintOrder="stroke"
                  >
                    {getShortName(node.name)}
                  </text>
                )}
              </g>
            );
          })}

          {hoverNode && (
            <g
              className="hover-card"
              transform={`translate(${hoverNode.x + 24 / view.k}, ${
                hoverNode.y - 24 / view.k
              }) scale(${1 / view.k})`}
            >
              <rect
                width="245"
                height="72"
                rx="2"
                fill="#fffefb"
                stroke="#8b8b84"
                opacity="0.98"
              />
              <text x="12" y="26" fontSize="14" fontWeight="bold">
                {hoverNode.name}
              </text>
              <text x="12" y="51" fontSize="13" fill="#596273">
                {hoverNode.category} / 関連資格 {hoverNode.connection_count}件
              </text>
            </g>
          )}
        </g>
      </svg>

      <div className="minimap-shell">
        <span>全体マップ</span>
        <svg
          className="minimap"
          viewBox={`0 0 ${graphWidth} ${graphHeight}`}
          onClick={handleMinimapClick}
          role="img"
          aria-label="全体マップ。クリックすると表示位置を移動します"
        >
          {minimapLinks.map((link) => (
            <line
              key={`${link.source.id}-${link.target.id}`}
              x1={link.source.x}
              y1={link.source.y}
              x2={link.target.x}
              y2={link.target.y}
              stroke="#b6bbb7"
              strokeWidth="8"
            />
          ))}
          {nodes.map((node) => (
            <circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r={getNodeRadius(node)}
              fill={getNodeColor(node)}
            />
          ))}
          <rect
            x={minimapViewport.x}
            y={minimapViewport.y}
            width={minimapViewport.width}
            height={minimapViewport.height}
                fill="rgba(36, 95, 132, 0.08)"
                stroke="#245f84"
            strokeWidth="10"
          />
        </svg>
      </div>
    </div>
  );
}
