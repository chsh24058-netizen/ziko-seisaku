/**
 * ひらがなとカタカナを相互変換
 */
const toHiragana = (str) => {
  return str.replace(/[\u30a1-\u30f6]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) - 0x60);
  });
};

/**
 * テキストを正規化する
 * - ひらがな/カタカナをひらがなに統一
 * - 大文字を小文字に統一
 * - 全角スペースを削除
 * - 句読点を削除
 */
export const normalizeSearchText = (value) => {
  if (!value) return "";
  
  let text = String(value);
  
  // ひらがな/カタカナをひらがなに統一
  text = toHiragana(text);
  
  // 大文字を小文字に統一
  text = text.toLowerCase();
  
  // スペース、句読点などを削除
  text = text.replace(/[\s\p{P}\p{S}ー　]/gu, "");
  
  return text;
};

/**
 * ノードのテキスト表現をすべて取得して結合
 */
export const getNodeSearchText = (node) => {
  const parts = [
    node.name || "",
    node.category || "",
    node.type || "",
    node.vendor || "",
    ...(node.topics ? node.topics.split("|") : []),
  ];
  
  // すべてのテキストを結合して正規化
  return normalizeSearchText(parts.join(" "));
};

/**
 * 検索テキストがノードに含まれるか判定
 */
export const matchesSearch = (node, normalizedSearchText) => {
  if (!normalizedSearchText || !node) return false;
  
  const nodeSearchText = getNodeSearchText(node);
  return nodeSearchText.includes(normalizedSearchText);
};

export const getQualificationReading = (key) => {
  // 必要に応じて読みを返す
  return "";
};
