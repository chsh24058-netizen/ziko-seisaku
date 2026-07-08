export const getId = (value) => {
  return typeof value === "object" ? value.id : value;
};

export const getNodeColor = (node) => {
  if (node.type === "スキル") return "#43a047";

  if (node.category === "基礎") return "#1e88e5";
  if (node.category === "セキュリティ") return "#e53935";
  if (node.category === "ネットワーク") return "#3949ab";
  if (node.category === "データベース") return "#00897b";
  if (node.category === "クラウド") return "#fb8c00";
  if (node.category === "AI") return "#8e24aa";
  if (node.category === "プログラミング") return "#6d4c41";
  if (node.category === "Linux") return "#546e7a";
  if (node.category === "マネジメント") return "#d81b60";
  if (node.category === "Web") return "#00acc1";
  if (node.category === "データ分析") return "#7cb342";
  if (node.category === "監査") return "#757575";
  if (node.category === "設計") return "#78909c";
  if (node.category === "組込み") return "#8d6e63";

  return "#757575";
};

export const getNodeRadius = (node) => {
  if (node.type === "スキル") return 12;
  return 13 + node.level * 3;
};

export const getShortName = (name) => {
  if (!name) return "";
  return name.length > 18 ? `${name.slice(0, 17)}…` : name;
};

export const isNodeConnectedToSelected = (node, selectedNode, links) => {
  if (!selectedNode) return true;
  if (node.id === selectedNode.id) return true;

  return links.some((link) => {
    const sourceId = getId(link.source);
    const targetId = getId(link.target);

    return (
      (sourceId === selectedNode.id && targetId === node.id) ||
      (targetId === selectedNode.id && sourceId === node.id)
    );
  });
};

export const isLinkConnectedToSelected = (link, selectedNode) => {
  if (!selectedNode) return true;

  const sourceId = getId(link.source);
  const targetId = getId(link.target);

  return sourceId === selectedNode.id || targetId === selectedNode.id;
};

export const isNodeRelatedToSearch = (
  node,
  normalizedSearch,
  searchMatchedIds,
  links
) => {
  if (!normalizedSearch) return true;
  if (searchMatchedIds.has(node.id)) return true;

  return links.some((link) => {
    const sourceId = getId(link.source);
    const targetId = getId(link.target);

    return (
      (searchMatchedIds.has(sourceId) && targetId === node.id) ||
      (searchMatchedIds.has(targetId) && sourceId === node.id)
    );
  });
};

export const isLinkRelatedToSearch = (
  link,
  normalizedSearch,
  searchMatchedIds
) => {
  if (!normalizedSearch) return true;

  const sourceId = getId(link.source);
  const targetId = getId(link.target);

  return searchMatchedIds.has(sourceId) || searchMatchedIds.has(targetId);
};

export const isCategoryMatched = (node, activeCategory) => {
  if (!activeCategory) return true;

  if (activeCategory.type === "スキル") {
    return node.type === "スキル";
  }

  return node.category === activeCategory.label;
};

export const getLegendItems = () => [
  { label: "基礎", color: "#1e88e5" },
  { label: "セキュリティ", color: "#e53935" },
  { label: "ネットワーク", color: "#3949ab" },
  { label: "データベース", color: "#00897b" },
  { label: "クラウド", color: "#fb8c00" },
  { label: "AI", color: "#8e24aa" },
  { label: "プログラミング", color: "#6d4c41" },
  { label: "Linux", color: "#546e7a" },
  { label: "マネジメント", color: "#d81b60" },
  { label: "Web", color: "#00acc1" },
  { label: "データ分析", color: "#7cb342" },
  { label: "監査", color: "#757575" },
  { label: "設計", color: "#78909c" },
  { label: "組込み", color: "#8d6e63" },
  { label: "スキル", color: "#43a047", type: "スキル" },
];
