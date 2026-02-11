interface DocFeature { docId: number; entities: string[]; keywords: string[] }

export interface ClusterOutput {
  id: number;
  label: string;
  theme: string;
  docIds: number[];
}

export function clusterDocs(features: DocFeature[]): ClusterOutput[] {
  const grouped = new Map<string, DocFeature[]>();

  for (const f of features) {
    const theme = f.keywords[0] ?? 'General';
    if (!grouped.has(theme)) grouped.set(theme, []);
    grouped.get(theme)!.push(f);
  }

  return Array.from(grouped.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([theme, docs], index) => {
      const entityCounts = new Map<string, number>();
      const keywordCounts = new Map<string, number>();
      for (const d of docs) {
        d.entities.forEach((e) => entityCounts.set(e, (entityCounts.get(e) ?? 0) + 1));
        d.keywords.forEach((k) => keywordCounts.set(k, (keywordCounts.get(k) ?? 0) + 1));
      }
      const topEntities = sortedKeys(entityCounts).slice(0, 3);
      const topKeyword = sortedKeys(keywordCounts)[0] ?? 'files';
      return {
        id: index + 1,
        label: [...topEntities, topKeyword].join(' • '),
        theme,
        docIds: docs.map((d) => d.docId)
      };
    });
}

function sortedKeys(m: Map<string, number>) {
  return Array.from(m.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key]) => key);
}
