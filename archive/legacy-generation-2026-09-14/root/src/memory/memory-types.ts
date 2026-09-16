export type MemoryLayer = "harness" | "project";

export interface MemoryEntry {
  id: string;
  layer: MemoryLayer;
  key: string;
  body: string;
  supersedes: string | null;
  createdAt: string;
}

/** writeMemory 入力 (coding-rule max-source-params: 3 引数上限のため input object 化)。 */
export interface WriteMemoryInput {
  layer: MemoryLayer;
  key: string;
  body: string;
}

export interface MemoryDeps {
  now(): string;
  stableId(layer: MemoryLayer, key: string, createdAt: string): string;
  isSecret(body: string): boolean;
  readActive(layer: MemoryLayer): MemoryEntry[];
  findByKey(layer: MemoryLayer, key: string): MemoryEntry | null;
  persist(entry: MemoryEntry): void;
}
