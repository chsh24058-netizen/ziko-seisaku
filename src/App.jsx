import { useState } from "react";

import nodesCsv from "./data/qualification_nodes.csv?url";
import edgesCsv from "./data/qualification_edges.csv?url";

import "./App.css";

import { useGraphData } from "./hooks/useGraphData";
import { useAcquired } from "./hooks/useAcquired";

import Toolbar from "./components/Toolbar";
import GraphView from "./components/GraphView";
import SidePanel from "./components/SidePanel";

import {
  isNodeConnectedToSelected,
  isLinkConnectedToSelected,
  isNodeRelatedToSearch,
  isLinkRelatedToSearch,
  isCategoryMatched,
  getLegendItems,
} from "./utils/graphUtils";

const graphWidth = 1100;
const graphHeight = 720;
const storageKey = "acquiredQualificationIds";

export default function App() {
  const { nodes, links } = useGraphData(nodesCsv, edgesCsv, graphWidth, graphHeight);
  const { acquiredIds, toggleAcquired } = useAcquired(storageKey);

  const [selectedNode, setSelectedNode] = useState(null);
  const [hoverNode, setHoverNode] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  const normalizedSearch = searchText.trim().toLowerCase();

  const isSearchMatched = (node) => {
    if (!normalizedSearch) return false;

    const values = [node.name, node.category, node.type, node.vendor];

    return values.some((value) =>
      String(value ?? "").toLowerCase().includes(normalizedSearch)
    );
  };

  const searchResults = nodes.filter(isSearchMatched);
  const searchMatchedIds = new Set(searchResults.map((node) => node.id));

  const isAcquired = (node) => {
    return node.type === "資格" && acquiredIds.includes(node.id);
  };

  const qualificationCount = nodes.filter((node) => node.type === "資格").length;
  const acquiredCount = nodes.filter((node) => isAcquired(node)).length;

  const legendItems = getLegendItems();

  const getNodeOpacity = (node) => {
    const selectedOk = selectedNode
      ? isNodeConnectedToSelected(node, selectedNode, links)
      : true;

    const searchOk = isNodeRelatedToSearch(
      node,
      normalizedSearch,
      searchMatchedIds,
      links
    );

    const categoryOk = isCategoryMatched(node, activeCategory);

    return selectedOk && searchOk && categoryOk ? 1 : 0.12;
  };

  const getLinkOpacity = (link) => {
    const selectedOk = selectedNode
      ? isLinkConnectedToSelected(link, selectedNode)
      : true;

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

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      setSelectedNode(searchResults[0]);
    }
  };

  const clearSearch = () => {
    setSearchText("");
    setSelectedNode(null);
  };

  const resetSelection = () => {
    setSelectedNode(null);
  };

  return (
    <div className="app-shell">
      <main className="left-area">
        <div className="title-row">
          <h1 className="title">情報系資格スキルツリー</h1>
          <div className="progress-pill">
            取得済み：{acquiredCount} / {qualificationCount} 資格
          </div>
        </div>

        <Toolbar
          searchText={searchText}
          setSearchText={setSearchText}
          onKeyDown={handleSearchKeyDown}
          clearSearch={clearSearch}
          normalizedSearch={normalizedSearch}
          searchCount={searchResults.length}
        />

        <GraphView
          graphWidth={graphWidth}
          graphHeight={graphHeight}
          nodes={nodes}
          links={links}
          selectedNode={selectedNode}
          hoverNode={hoverNode}
          setSelectedNode={setSelectedNode}
          setHoverNode={setHoverNode}
          resetSelection={resetSelection}
          isSearchMatched={isSearchMatched}
          isAcquired={isAcquired}
          getNodeOpacity={getNodeOpacity}
          getLinkOpacity={getLinkOpacity}
        />
      </main>

      <SidePanel
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
        normalizedSearch={normalizedSearch}
        searchResults={searchResults}
        acquiredCount={acquiredCount}
        qualificationCount={qualificationCount}
        isAcquired={isAcquired}
        toggleAcquired={toggleAcquired}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        legendItems={legendItems}
      />
    </div>
  );
}
