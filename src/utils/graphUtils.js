export const getId = (value) => {
  return typeof value === "object" ? value.id : value;
};

const categoryColors = {
  基礎: "#356f95",
  セキュリティ: "#a84a3f",
  ネットワーク: "#4d5f91",
  データベース: "#3f7d73",
  クラウド: "#b97832",
  AI: "#7a5a8d",
  プログラミング: "#76594b",
  Linux: "#68737b",
  マネジメント: "#9a5572",
  Web: "#3b8791",
  データ分析: "#6e8a47",
  監査: "#777772",
  設計: "#718493",
  組込み: "#806b55",
};

export const getNodeColor = (node) => {
  return categoryColors[node.category] ?? "#777772";
};

export const getNodeRadius = () => 18;

export const getShortName = (name) => {
  if (!name) return "";
  return name.length > 18 ? `${name.slice(0, 17)}…` : name;
};

const categoryPositions = {
  基礎: [0.5, 0.48],
  セキュリティ: [0.18, 0.25],
  ネットワーク: [0.18, 0.52],
  データベース: [0.38, 0.76],
  クラウド: [0.68, 0.26],
  AI: [0.82, 0.68],
  プログラミング: [0.58, 0.78],
  Linux: [0.32, 0.48],
  マネジメント: [0.8, 0.16],
  Web: [0.68, 0.88],
  データ分析: [0.86, 0.82],
  監査: [0.92, 0.28],
  設計: [0.5, 0.2],
  組込み: [0.28, 0.84],
};

export const getCategoryPosition = (category, width, height) => {
  const [xRatio, yRatio] = categoryPositions[category] ?? [0.5, 0.5];
  return {
    x: width * xRatio,
    y: height * yRatio,
  };
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

  return node.category === activeCategory.label;
};

export const getLegendItems = () => {
  return Object.entries(categoryColors).map(([label, color]) => ({
    label,
    color,
  }));
};
