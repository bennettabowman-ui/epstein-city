export type EntityType = 'person' | 'org' | 'location' | 'date';

export interface DocumentRow {
  id: number;
  filename: string;
  importedAt: string;
  sourceHash: string;
  mimeType: string;
}

export interface ChunkRow {
  id: number;
  docId: number;
  pageNumber: number;
  text: string;
}

export interface EntityRow {
  id: number;
  docId: number;
  chunkId: number;
  type: EntityType;
  value: string;
  isPrivate: number;
}

export interface BuildingRow {
  id: number;
  label: string;
  neighborhood: string;
  gridX: number;
  gridY: number;
  size: number;
}
