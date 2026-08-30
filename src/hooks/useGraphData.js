import { useEffect, useState } from "react";
import * as d3 from "d3";
import { getCategoryPosition, getNodeRadius } from "../utils/graphUtils";

export function useGraphData(
  nodesCsv,
  edgesCsv,
  graphWidth,
  graphHeight,
  minSimilarity
) {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let simulation;
    let animationFrame;
    let cancelled = false;

    setError(null);

    Promise.all([d3.csv(nodesCsv), d3.csv(edgesCsv)]).then(
      ([nodeData, edgeData]) => {
        if (cancelled) return;

        const loadedNodes = nodeData.map((d) => ({
          id: Number(d.id),
          key: d.key,
          name: d.name,
          type: d.type,
          category: d.category,
          vendor: d.vendor || "-",
          url: d.url || "",
          scope_url: d.scope_url || d.url || "",
          topics: d.topics ? d.topics.split("|").filter(Boolean) : [],
          evidence_note: d.evidence_note || "",
          checked_at: d.checked_at || "",
          pass_rate: d.pass_rate === "" ? null : Number(d.pass_rate),
          pass_rate_period: d.pass_rate_period || "",
          pass_rate_url: d.pass_rate_url || "",
          pass_rate_checked_at: d.pass_rate_checked_at || "",
          connection_count: 0,
        }));

        const nodeById = new Map(loadedNodes.map((node) => [node.id, node]));
        const loadedLinks = edgeData.map((d) => ({
          source: nodeById.get(Number(d.source)),
          target: nodeById.get(Number(d.target)),
          relation: d.relation,
          common_count: Number(d.common_count),
          union_count: Number(d.union_count),
          similarity: Number(d.similarity),
          common_topics: d.common_topics
            ? d.common_topics.split("|").filter(Boolean)
            : [],
          reason: d.reason || "",
          source_evidence_url: d.source_evidence_url || "",
          target_evidence_url: d.target_evidence_url || "",
        }));

        const activeLinks = loadedLinks.filter(
          (link) =>
            link.common_count >= 2 && link.similarity >= minSimilarity
        );

        activeLinks.forEach((link) => {
          link.source.connection_count += 1;
          link.target.connection_count += 1;
        });

        const layoutLinks = activeLinks;

        simulation = d3
          .forceSimulation(loadedNodes)
          .force(
            "link",
            d3
              .forceLink(layoutLinks)
              .id((d) => d.id)
              .distance((d) => {
                if (d.similarity >= 0.6) return 120;
                if (d.similarity >= 0.4) return 155;
                if (d.similarity >= 0.25) return 190;
                return 230;
              })
              .strength((d) => 0.12 + Math.min(d.similarity, 1) * 0.28)
          )
          .force("charge", d3.forceManyBody().strength(-720))
          .force(
            "x",
            d3
              .forceX((d) => getCategoryPosition(d.category, graphWidth, graphHeight).x)
              .strength(0.13)
          )
          .force(
            "y",
            d3
              .forceY((d) => {
                return getCategoryPosition(
                  d.category,
                  graphWidth,
                  graphHeight
                ).y;
              })
              .strength(0.15)
          )
          .force("center", d3.forceCenter(graphWidth / 2, graphHeight / 2))
          .force(
            "collision",
            d3.forceCollide().radius((d) => {
              return getNodeRadius(d) + 28;
            })
          );

        setLinks([...loadedLinks]);

        simulation.on("tick", () => {
          if (animationFrame) return;

          animationFrame = requestAnimationFrame(() => {
            animationFrame = null;

            loadedNodes.forEach((d) => {
              const paddingX = 110;
              const paddingY = 100;

              d.x = Math.max(paddingX, Math.min(graphWidth - paddingX, d.x));
              d.y = Math.max(paddingY, Math.min(graphHeight - paddingY, d.y));
            });

            setNodes([...loadedNodes]);
          });
        });
      }
    ).catch(() => {
      if (cancelled) return;

      setNodes([]);
      setLinks([]);
      setError(
        "資格データを読み込めませんでした。ページを再読み込みしてください。"
      );
    });

    return () => {
      cancelled = true;
      if (simulation) simulation.stop();
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [nodesCsv, edgesCsv, graphWidth, graphHeight, minSimilarity]);

  return { nodes, links, error };
}
