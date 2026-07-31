import { useEffect, useState } from "react";

import nodesCsv from "./data/qualification_nodes.csv?url";
import edgesCsv from "./data/qualification_edges.csv?url";

import "./App.css";

import { useGraphData } from "./hooks/useGraphData";

import Toolbar from "./components/Toolbar";
import GraphView from "./components/GraphView";
import SidePanel from "./components/SidePanel";
import {
  getQualificationReading,
  normalizeSearchText,
} from "./utils/searchUtils";

import {
  isNodeConnectedToSelected,
  isLinkConnectedToSelected,
  isNodeRelatedToSearch,
  isLinkRelatedToSearch,
  isCategoryMatched,
  getLegendItems,
} from "./utils/graphUtils";

const viewportWidth = 1100;
const viewportHeight = 720;
const graphWidth = 3600;
const graphHeight = 2500;

export default function App() {
  const { nodes, links } = useGraphData(nodesCsv, edgesCsv, graphWidth, graphHeight);

  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedLink, setSelectedLink] = useState(null);
  const [hoverNode, setHoverNode] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [minCommonCount, setMinCommonCount] = useState(4);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const normalizedSearch = normalizeSearchText(searchText);
  const visibleRelationLinks = links.filter(
    (link) => Number(link.common_count) >= minCommonCount
  );
  const checkedAt = nodes.reduce((latest, node) => {
    return node.checked_at > latest ? node.checked_at : latest;
  }, "");

  useEffect(() => {
    if (!isGuideOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsGuideOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGuideOpen]);

  const isSearchMatched = (node) => {
    if (!normalizedSearch) return false;

    const values = [
      node.name,
      node.category,
      node.type,
      node.vendor,
      getQualificationReading(node.key),
      ...(node.topics ?? []),
    ];

    return values.some((value) =>
      normalizeSearchText(value).includes(normalizedSearch)
    );
  };

  const searchResults = nodes.filter(isSearchMatched);
  const searchMatchedIds = new Set(searchResults.map((node) => node.id));
  const searchSuggestions = [...searchResults]
    .sort((a, b) => {
      const getRank = (node) => {
        const nameValues = [
          normalizeSearchText(node.name),
          normalizeSearchText(getQualificationReading(node.key)),
        ];

        if (nameValues.some((value) => value.startsWith(normalizedSearch))) {
          return 0;
        }
        if (nameValues.some((value) => value.includes(normalizedSearch))) {
          return 1;
        }
        return 2;
      };

      return (
        getRank(a) - getRank(b) ||
        a.name.localeCompare(b.name, "ja")
      );
    })
    .slice(0, 6);

  const legendItems = getLegendItems();

  const getNodeOpacity = (node) => {
    let selectedOk = true;

    if (selectedNode) {
      selectedOk = isNodeConnectedToSelected(
        node,
        selectedNode,
        visibleRelationLinks
      );
    } else if (selectedLink) {
      selectedOk =
        selectedLink.source.id === node.id || selectedLink.target.id === node.id;
    }

    const searchOk = isNodeRelatedToSearch(
      node,
      normalizedSearch,
      searchMatchedIds,
      visibleRelationLinks
    );

    const categoryOk = isCategoryMatched(node, activeCategory);

    return selectedOk && searchOk && categoryOk ? 1 : 0.12;
  };

  const getLinkOpacity = (link) => {
    if (Number(link.common_count) < minCommonCount) return 0;

    const hasEmphasis =
      selectedNode || selectedLink || normalizedSearch || activeCategory;

    if (!hasEmphasis) {
      return 0.68;
    }

    let selectedOk = true;

    if (selectedNode) {
      selectedOk = isLinkConnectedToSelected(link, selectedNode);
    } else if (selectedLink) {
      selectedOk = selectedLink === link;
    }

    const searchOk = isLinkRelatedToSearch(
      link,
      normalizedSearch,
      searchMatchedIds
    );

    if (!activeCategory) {
      return selectedOk && searchOk ? 0.85 : 0.12;
    }

    const sourceMatched = isCategoryMatched(link.source, activeCategory);
    const targetMatched = isCategoryMatched(link.target, activeCategory);
    const categoryOk = sourceMatched || targetMatched;

    return selectedOk && searchOk && categoryOk ? 0.85 : 0.08;
  };

  const clearSearch = () => {
    setSearchText("");
    setSelectedNode(null);
    setSelectedLink(null);
  };

  const selectSearchSuggestion = (node) => {
    setSearchText(node.name);
    setSelectedNode(node);
    setSelectedLink(null);
  };

  const resetSelection = () => {
    setSelectedNode(null);
    setSelectedLink(null);
  };

  const handleMinCommonCountChange = (value) => {
    const nextValue = Number(value);
    setMinCommonCount(nextValue);

    if (
      selectedLink &&
      Number(selectedLink.common_count) < nextValue
    ) {
      setSelectedLink(null);
    }
  };

  return (
    <div className="app-shell">
      <main className="left-area">
        <div className="title-row">
          <div className="title-main">
            <h1 className="title">情報系資格マップ</h1>
            <button
              type="button"
              className="map-guide-button"
              onClick={() => setIsGuideOpen(true)}
              aria-haspopup="dialog"
            >
              見方・データ基準
            </button>
          </div>
          <div className="dataset-summary">
            収録 {nodes.length}資格 ／ {links.length}関係
          </div>
        </div>

        <Toolbar
          searchText={searchText}
          setSearchText={setSearchText}
          clearSearch={clearSearch}
          normalizedSearch={normalizedSearch}
          searchCount={searchResults.length}
          suggestions={searchSuggestions}
          onSelectSuggestion={selectSearchSuggestion}
        />

        <GraphView
          viewportWidth={viewportWidth}
          viewportHeight={viewportHeight}
          graphWidth={graphWidth}
          graphHeight={graphHeight}
          nodes={nodes}
          links={links}
          selectedNode={selectedNode}
          selectedLink={selectedLink}
          hoverNode={hoverNode}
          setSelectedNode={setSelectedNode}
          setSelectedLink={setSelectedLink}
          setHoverNode={setHoverNode}
          resetSelection={resetSelection}
          isSearchMatched={isSearchMatched}
          getNodeOpacity={getNodeOpacity}
          getLinkOpacity={getLinkOpacity}
          minCommonCount={minCommonCount}
          setMinCommonCount={handleMinCommonCountChange}
        />
      </main>

      <SidePanel
        selectedNode={selectedNode}
        selectedLink={selectedLink}
        setSelectedNode={setSelectedNode}
        setSelectedLink={setSelectedLink}
        normalizedSearch={normalizedSearch}
        searchResults={searchResults}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        legendItems={legendItems}
      />

      {isGuideOpen && (
        <div
          className="guide-overlay"
          onClick={() => setIsGuideOpen(false)}
        >
          <section
            className="guide-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="guide-dialog-header">
              <h2 id="guide-title">見方・データ基準</h2>
              <button
                type="button"
                className="guide-close-button"
                onClick={() => setIsGuideOpen(false)}
                aria-label="説明を閉じる"
              >
                ×
              </button>
            </div>

            <dl className="guide-list">
              <div>
                <dt>線</dt>
                <dd>
                  公式の試験範囲から整理した共通項目が2件以上ある資格同士を結んでいます。
                </dd>
              </div>
              <div>
                <dt>線の太さ</dt>
                <dd>共通する試験内容が多いほど太くなります。</dd>
              </div>
              <div>
                <dt>円の大きさ</dt>
                <dd>
                  共通項目が2件以上あり、直接つながっている資格の総数で決まります。
                </dd>
              </div>
              <div>
                <dt>色</dt>
                <dd>資格の主な分野を表します。</dd>
              </div>
              <div>
                <dt>配置</dt>
                <dd>
                  主な分野ごとにまとめています。位置は難易度や取得順を表しません。
                </dd>
              </div>
            </dl>

            <p className="guide-note">
              右上の「線の表示」で、表示する関係の共通項目数を変更できます。
            </p>
            <p className="guide-checked-at">
              公式情報の確認日：{checkedAt || "読み込み中"}
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
