import { useEffect, useState } from "react";

import nodesCsv from "./data/qualification_nodes.csv?url";
import edgesCsv from "./data/qualification_edges.csv?url";

import "./App.css";

import { useGraphData } from "./hooks/useGraphData";

import Toolbar from "./components/Toolbar";
import GraphView, { createFitView } from "./components/GraphView";
import SidePanel from "./components/SidePanel";
import {
  getQualificationReading,
  normalizeLiteralSearchText,
  normalizeSearchText,
  matchesSearch,
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
  const minSimilarity = 0.42;
  const { nodes, links, error: dataError } = useGraphData(
    nodesCsv,
    edgesCsv,
    graphWidth,
    graphHeight,
    minSimilarity
  );
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedLink, setSelectedLink] = useState(null);
  const [hoverNode, setHoverNode] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(0.25);

  const handleFitView = () => {
    const fitView = createFitView(viewportWidth, viewportHeight, graphWidth, graphHeight);
    setZoomLevel(fitView.k);
  };

  const normalizedSearch = normalizeSearchText(searchText);
  const literalSearch = normalizeLiteralSearchText(searchText);
  const visibleRelationLinks = links.filter(
    (link) =>
      Number(link.common_count) >= 2 &&
      Number(link.similarity) >= minSimilarity
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
    return matchesSearch(node, normalizedSearch, searchText);
  };

  const searchResults = nodes.filter(isSearchMatched);
  const searchMatchedIds = new Set(searchResults.map((node) => node.id));
  const searchSuggestions = [...searchResults]
    .sort((a, b) => {
      const getRank = (node) => {
        const nameValues = [
          normalizeLiteralSearchText(node.name),
          normalizeSearchText(node.name),
          normalizeSearchText(getQualificationReading(node.key)),
        ];
        const searchValues = [literalSearch, normalizedSearch].filter(Boolean);

        if (
          nameValues.some((value) =>
            searchValues.some((searchValue) => value.startsWith(searchValue))
          )
        ) {
          return 0;
        }
        if (
          nameValues.some((value) =>
            searchValues.some((searchValue) => value.includes(searchValue))
          )
        ) {
          return 1;
        }
        return 2;
      };

      return (
        getRank(a) - getRank(b) ||
        a.name.localeCompare(b.name, "ja")
      );
    });

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
    if (
      Number(link.common_count) < 2 ||
      Number(link.similarity) < minSimilarity
    ) {
      return 0;
    }

    const hasEmphasis =
      selectedNode || selectedLink || normalizedSearch || activeCategory;

    if (!hasEmphasis) {
      return 0.75;
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
      return selectedOk && searchOk ? 0.9 : 0.18;
    }

    const sourceMatched = isCategoryMatched(link.source, activeCategory);
    const targetMatched = isCategoryMatched(link.target, activeCategory);
    const categoryOk = sourceMatched && targetMatched;

    return selectedOk && searchOk && categoryOk ? 0.9 : 0;
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
              使い方・データ基準
            </button>
          </div>
          <div className="dataset-summary">
            収録 {nodes.length}資格 ／ 表示 {visibleRelationLinks.length}関係
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
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          onFitView={handleFitView}
        />

        {dataError ? (
          <div className="data-error" role="alert">
            <strong>データの読み込みに失敗しました</strong>
            <span>{dataError}</span>
          </div>
        ) : (
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
            minSimilarity={minSimilarity}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            toolbarZoomLevel={zoomLevel}
          />
        )}
      </main>

      <SidePanel
        selectedNode={selectedNode}
        selectedLink={selectedLink}
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
              <h2 id="guide-title">使い方・データ基準</h2>
              <button
                type="button"
                className="guide-close-button"
                onClick={() => setIsGuideOpen(false)}
                aria-label="説明を閉じる"
              >
                <span className="guide-close-icon" aria-hidden="true">×</span>
              </button>
            </div>

            <h3 className="guide-section-title">基本的な使い方</h3>
            <ol className="guide-steps">
              <li>
                <strong>資格を探す：</strong>
                検索欄へ資格名・分野・主催団体を入力します。
              </li>
              <li>
                <strong>詳細を見る：</strong>
                円を選ぶと資格情報、線を選ぶと共通する試験内容と関連度を右側に表示します。
              </li>
              <li>
                <strong>分野で絞る：</strong>
                右側の凡例を選ぶと、その分野の資格と分野内の関係を確認できます。
              </li>
              <li>
                <strong>関連度の基準：</strong>
                共通項目が2個以上あり、関連度42%以上の関係を表示します。
              </li>
              <li>
                <strong>マップを動かす：</strong>
                背景をドラッグするとマップが移動し、ホイールまたは右上のボタンで拡大・縮小できます。「全体」で表示を戻せます。
              </li>
            </ol>

            <h3 className="guide-section-title">マップの見方</h3>
            <dl className="guide-list">
              <div>
                <dt>線</dt>
                <dd>
                  公式の試験範囲から整理した共通項目が2件以上あり、選択した関連度以上の資格同士を結んでいます。
                </dd>
              </div>
              <div>
                <dt>線の太さ</dt>
                <dd>Jaccard係数による関連度が高いほど太くなります。</dd>
              </div>
              <div>
                <dt>円の大きさ</dt>
                <dd>すべての資格を同じ大きさで表示します。</dd>
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
              <div>
                <dt>合格率</dt>
                <dd>
                  主催団体が公式に公表した値だけを対象期間とともに表示します。確認できない資格は「非公開」と表示します。
                </dd>
              </div>
            </dl>

            <p className="guide-note">
              関連度 ＝ 共通項目数 ÷ 2資格が持つ項目の合計種類数（Jaccard係数）です。関連度42%以上の関係を表示します。
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
