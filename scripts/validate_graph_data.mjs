import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { csvParse } from "d3-dsv";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(rootDir, "src", "data");

const readCsv = (filename) =>
  csvParse(
    fs
      .readFileSync(path.join(dataDir, filename), "utf8")
      .replace(/^\uFEFF/, "")
  );

const nodes = readCsv("qualification_nodes.csv");
const edges = readCsv("qualification_edges.csv");
const nodeById = new Map(nodes.map((node) => [node.id, node]));
const edgeKeys = new Set();
const degree = new Map(nodes.map((node) => [node.id, 0]));

for (const node of nodes) {
  if (!node.id || !node.name || !node.category || !node.vendor) {
    throw new Error(`必須項目が不足しているノードがあります: ${node.id}`);
  }
  if (!node.url.startsWith("https://") || !node.scope_url.startsWith("https://")) {
    throw new Error(`公式URLがHTTPSではありません: ${node.name}`);
  }
  if (node.topics.split("|").filter(Boolean).length < 2) {
    throw new Error(`試験トピックが2個未満です: ${node.name}`);
  }
}

for (const edge of edges) {
  const source = nodeById.get(edge.source);
  const target = nodeById.get(edge.target);
  if (!source || !target) {
    throw new Error(`存在しないノードを参照する接続があります: ${edge.source}-${edge.target}`);
  }

  const key = [Number(edge.source), Number(edge.target)]
    .sort((a, b) => a - b)
    .join("-");
  if (edgeKeys.has(key)) {
    throw new Error(`重複した接続があります: ${key}`);
  }
  edgeKeys.add(key);

  const sourceTopics = new Set(source.topics.split("|").filter(Boolean));
  const targetTopics = new Set(target.topics.split("|").filter(Boolean));
  const commonTopics = edge.common_topics.split("|").filter(Boolean);

  if (commonTopics.length < 2) {
    throw new Error(`共通トピックが2個未満の接続があります: ${key}`);
  }
  if (Number(edge.common_count) !== commonTopics.length) {
    throw new Error(`共通トピック数が一致しない接続があります: ${key}`);
  }
  if (
    commonTopics.some(
      (topic) => !sourceTopics.has(topic) || !targetTopics.has(topic)
    )
  ) {
    throw new Error(`ノードの試験範囲と一致しない接続があります: ${key}`);
  }
  if (
    !edge.source_evidence_url.startsWith("https://") ||
    !edge.target_evidence_url.startsWith("https://")
  ) {
    throw new Error(`根拠URLが不足している接続があります: ${key}`);
  }

  degree.set(source.id, degree.get(source.id) + 1);
  degree.set(target.id, degree.get(target.id) + 1);
}

const isolatedNodes = nodes
  .filter((node) => degree.get(node.id) === 0)
  .map((node) => node.name);
const maxDegree = Math.max(0, ...degree.values());

console.log(
  JSON.stringify(
    {
      qualifications: nodes.length,
      relationships: edges.length,
      isolatedQualifications: isolatedNodes,
      maximumDegree: maxDegree,
    },
    null,
    2
  )
);
