import { useEffect, useState } from "react";
import * as d3 from "d3";
import { getCategoryPosition, getNodeRadius } from "../utils/graphUtils";

export function useGraphData(nodesCsv, edgesCsv, graphWidth, graphHeight) {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    let simulation;
    let animationFrame;

    Promise.all([d3.csv(nodesCsv), d3.csv(edgesCsv)]).then(
      ([nodeData, edgeData]) => {
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
          connection_count: 0,
        }));

        const nodeById = new Map(loadedNodes.map((node) => [node.id, node]));
        const loadedLinks = edgeData.map((d) => ({
          source: nodeById.get(Number(d.source)),
          target: nodeById.get(Number(d.target)),
          relation: d.relation,
          common_count: Number(d.common_count),
          common_topics: d.common_topics
            ? d.common_topics.split("|").filter(Boolean)
            : [],
          reason: d.reason || "",
          source_evidence_url: d.source_evidence_url || "",
          target_evidence_url: d.target_evidence_url || "",
        }));

        loadedLinks.forEach((link) => {
          link.source.connection_count += 1;
          link.target.connection_count += 1;
        });

        const layoutLinks = loadedLinks.filter(
          (link) => link.common_count >= 3
        );

        simulation = d3
          .forceSimulation(loadedNodes)
          .force(
            "link",
            d3
              .forceLink(layoutLinks)
              .id((d) => d.id)
              .distance((d) => {
                if (d.common_count >= 5) return 125;
                if (d.common_count >= 4) return 165;
                return 245;
              })
              .strength((d) => 0.12 + Math.min(d.common_count, 6) * 0.04)
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
    );

    return () => {
      if (simulation) simulation.stop();
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [nodesCsv, edgesCsv, graphWidth, graphHeight]);

  return { nodes, links };
}
