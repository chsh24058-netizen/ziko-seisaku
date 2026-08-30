import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = path.join(
  rootDir,
  "src",
  "data",
  "qualification_catalog.json"
);
const passRatesPath = path.join(
  rootDir,
  "src",
  "data",
  "qualification_pass_rates.json"
);
const nodesPath = path.join(
  rootDir,
  "src",
  "data",
  "qualification_nodes.csv"
);
const edgesPath = path.join(
  rootDir,
  "src",
  "data",
  "qualification_edges.csv"
);

const allowedCategories = new Set([
  "基礎",
  "セキュリティ",
  "ネットワーク",
  "データベース",
  "クラウド",
  "AI",
  "プログラミング",
  "Linux",
  "マネジメント",
  "Web",
  "データ分析",
  "監査",
  "設計",
  "組込み",
]);

const allowedTopics = new Set([
  "IT基礎",
  "コンピュータ基礎",
  "OS",
  "Linux",
  "アルゴリズム",
  "プログラミング",
  "OOP",
  "ソフトウェア開発",
  "Web",
  "データベース",
  "SQL",
  "データ分析",
  "統計",
  "データエンジニアリング",
  "AI基礎",
  "機械学習",
  "深層学習",
  "生成AI",
  "ネットワーク基礎",
  "ルーティング・スイッチング",
  "ネットワーク設計",
  "無線",
  "セキュリティ基礎",
  "ID・アクセス管理",
  "暗号",
  "リスク管理",
  "セキュリティ運用",
  "インシデント対応",
  "クラウド基礎",
  "クラウド設計",
  "クラウド運用",
  "クラウドセキュリティ",
  "DevOps",
  "コンテナ",
  "システム設計",
  "組込み",
  "プロジェクト管理",
  "ITサービス管理",
  "IT戦略",
  "監査",
  "ガバナンス",
  "自動化",
  "コスト管理",
]);

const csvCell = (value) => {
  const text = String(value ?? "");
  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
};

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const passRates = JSON.parse(fs.readFileSync(passRatesPath, "utf8"));
const keys = new Set();
const names = new Set();

catalog.forEach((item, index) => {
  const label = `catalog[${index}]`;

  if (!item.key || keys.has(item.key)) {
    throw new Error(`${label}: keyがないか重複しています: ${item.key}`);
  }
  if (!item.name || names.has(item.name)) {
    throw new Error(`${label}: nameがないか重複しています: ${item.name}`);
  }
  if (!allowedCategories.has(item.category)) {
    throw new Error(`${label}: 未定義のcategoryです: ${item.category}`);
  }
  if (!item.vendor || !item.url || !item.scope_url || !item.evidence_note) {
    throw new Error(
      `${label}: vendor/url/scope_url/evidence_noteが不足しています`
    );
  }
  if (!item.url.startsWith("https://") || !item.scope_url.startsWith("https://")) {
    throw new Error(`${label}: url/scope_urlはHTTPSの公式URLにしてください`);
  }
  if (!Array.isArray(item.topics) || item.topics.length < 2) {
    throw new Error(`${label}: topicsは2個以上必要です`);
  }
  if (new Set(item.topics).size !== item.topics.length) {
    throw new Error(`${label}: topicsが重複しています`);
  }

  const unknownTopics = item.topics.filter((topic) => !allowedTopics.has(topic));
  if (unknownTopics.length > 0) {
    throw new Error(
      `${label}: 未定義のtopicsがあります: ${unknownTopics.join(", ")}`
    );
  }

  keys.add(item.key);
  names.add(item.name);
});

Object.entries(passRates).forEach(([key, item]) => {
  if (!keys.has(key)) {
    throw new Error(`合格率データが存在しない資格を参照しています: ${key}`);
  }
  if (
    !Number.isFinite(item.rate) ||
    item.rate < 0 ||
    item.rate > 100 ||
    !item.period ||
    !item.source_url?.startsWith("https://") ||
    !item.checked_at
  ) {
    throw new Error(`合格率データが不正です: ${key}`);
  }
});

const categoryOrder = [
  "基礎",
  "プログラミング",
  "Web",
  "Linux",
  "ネットワーク",
  "セキュリティ",
  "データベース",
  "データ分析",
  "AI",
  "クラウド",
  "設計",
  "組込み",
  "マネジメント",
  "監査",
];

const sortedCatalog = [...catalog].sort(
  (a, b) =>
    categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category) ||
    a.vendor.localeCompare(b.vendor, "ja") ||
    a.name.localeCompare(b.name, "ja")
);

const nodes = sortedCatalog.map((item, index) => ({
  id: index + 1,
  ...item,
}));

const idByKey = new Map(nodes.map((node) => [node.key, node.id]));
const edges = [];

for (let i = 0; i < nodes.length; i += 1) {
  for (let j = i + 1; j < nodes.length; j += 1) {
    const source = nodes[i];
    const target = nodes[j];
    const targetTopics = new Set(target.topics);
    const commonTopics = source.topics.filter((topic) =>
      targetTopics.has(topic)
    );
    if (commonTopics.length < 2) continue;

    const unionTopics = new Set([...source.topics, ...target.topics]);
    const similarity = commonTopics.length / unionTopics.size;
    const similarityPercent = (similarity * 100).toFixed(1);

    edges.push({
      source: source.id,
      target: target.id,
      sourceKey: source.key,
      targetKey: target.key,
      relation: "official_scope_overlap",
      commonCount: commonTopics.length,
      unionCount: unionTopics.size,
      similarity,
      commonTopics,
      reason: `公式試験範囲で「${commonTopics.join(
        "・"
      )}」が共通し、全${unionTopics.size}項目中${
        commonTopics.length
      }項目が一致しているため（関連度${similarityPercent}%）。`,
      sourceEvidenceUrl: source.scope_url,
      targetEvidenceUrl: target.scope_url,
    });
  }
}

edges.sort(
  (a, b) =>
    a.source - b.source ||
    b.commonCount - a.commonCount ||
    a.target - b.target
);

const nodeHeader = [
  "id",
  "key",
  "name",
  "type",
  "category",
  "vendor",
  "url",
  "scope_url",
  "topics",
  "evidence_note",
  "checked_at",
  "pass_rate",
  "pass_rate_period",
  "pass_rate_url",
  "pass_rate_checked_at",
];
const nodeRows = nodes.map((node) => {
  const passRate = passRates[node.key];

  return [
    node.id,
    node.key,
    node.name,
    "資格",
    node.category,
    node.vendor,
    node.url,
    node.scope_url,
    node.topics.join("|"),
    node.evidence_note,
    node.checked_at ?? "2026-07-30",
    passRate?.rate ?? "",
    passRate?.period ?? "",
    passRate?.source_url ?? "",
    passRate?.checked_at ?? "",
  ];
});

const edgeHeader = [
  "source",
  "target",
  "relation",
  "common_count",
  "union_count",
  "similarity",
  "common_topics",
  "reason",
  "source_evidence_url",
  "target_evidence_url",
];
const edgeRows = edges.map((edge) => [
  idByKey.get(edge.sourceKey),
  idByKey.get(edge.targetKey),
  edge.relation,
  edge.commonCount,
  edge.unionCount,
  edge.similarity.toFixed(6),
  edge.commonTopics.join("|"),
  edge.reason,
  edge.sourceEvidenceUrl,
  edge.targetEvidenceUrl,
]);

const toCsv = (header, rows) =>
  `\uFEFF${[header, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\n")}\n`;

fs.writeFileSync(nodesPath, toCsv(nodeHeader, nodeRows), "utf8");
fs.writeFileSync(edgesPath, toCsv(edgeHeader, edgeRows), "utf8");

console.log(
  JSON.stringify(
    {
      qualifications: nodes.length,
      relationshipCandidates: edges.length,
      relationshipRule:
        "共通トピック2個以上を候補とし、Jaccard係数のしきい値で表示",
    },
    null,
    2
  )
);
