import { ClusterOutput } from './cluster';

export interface BuildingLayout {
  clusterId: number;
  neighborhood: string;
  x: number;
  y: number;
  size: number;
}

export function buildCityLayout(clusters: ClusterOutput[]): BuildingLayout[] {
  const neighborhoods = Array.from(new Set(clusters.map((c) => c.theme))).sort();
  return clusters.map((cluster, i) => {
    const nIdx = neighborhoods.indexOf(cluster.theme);
    return {
      clusterId: cluster.id,
      neighborhood: cluster.theme,
      x: (i % 6) * 2 + nIdx * 14,
      y: Math.floor(i / 6) * 2,
      size: Math.max(1, cluster.docIds.length)
    };
  });
}
