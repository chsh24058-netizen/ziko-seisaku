import { useEffect, useState } from "react";
import * as d3 from "d3";

export function useGraphData(nodesCsv, edgesCsv, graphWidth, graphHeight) {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    let simulation;

    Promise.all([d3.csv(nodesCsv), d3.csv(edgesCsv)]).then(
      ([nodeData, edgeData]) => {
        const loadedNodes = nodeData.map((d) => ({
          id: Number(d.id),
          name: d.name,
          type: d.type,
          category: d.category,
          level: Number(d.level),
          study_hours: d.study_hours === "" ? null : Number(d.study_hours),
          pass_rate: d.pass_rate === "" ? null : Number(d.pass_rate),
          vendor: d.vendor || "-",
          url: d.url || "",
        }));

        const loadedLinks = edgeData.map((d) => ({
          source: Number(d.source),
          target: Number(d.target),
          relation: d.relation,
        }));

        simulation = d3
          .forceSimulation(loadedNodes)
          .force(
            "link",
            d3
              .forceLink(loadedLinks)
              .id((d) => d.id)
              .distance((d) => {
                if (d.relation === "learn") return 82;
                if (d.relation === "recommend") return 150;
                return 120;
              })
              .strength(0.75)
          )
          .force("charge", d3.forceManyBody().strength(-720))
          .force(
            "x",
            d3
              .forceX((d) => {
                if (d.type === "スキル") return graphWidth * 0.68;
                return graphWidth * 0.43;
              })
              .strength(0.04)
          )
          .force(
            "y",
            d3
              .forceY((d) => {
                if (d.type === "スキル") return graphHeight * 0.62;
                if (d.level === 1) return graphHeight * 0.76;
                if (d.level === 2) return graphHeight * 0.56;
                if (d.level === 3) return graphHeight * 0.38;
                if (d.level === 4) return graphHeight * 0.18;
                return graphHeight * 0.5;
              })
              .strength(0.12)
          )
          .force("center", d3.forceCenter(graphWidth / 2, graphHeight / 2))
          .force(
            "collision",
            d3.forceCollide().radius((d) => {
              if (d.type === "スキル") return 34;
              return 42 + d.level * 4;
            })
          );

        simulation.on("tick", () => {
          loadedNodes.forEach((d) => {
            const paddingX = 130;
            const paddingY = 95;

            d.x = Math.max(paddingX, Math.min(graphWidth - paddingX, d.x));
            d.y = Math.max(paddingY, Math.min(graphHeight - paddingY, d.y));
          });

          setNodes([...loadedNodes]);
          setLinks([...loadedLinks]);
        });
      }
    );

    return () => {
      if (simulation) simulation.stop();
    };
  }, [nodesCsv, edgesCsv, graphWidth, graphHeight]);

  return { nodes, links };
}
