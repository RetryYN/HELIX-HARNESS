import type { MemoryDeps, MemoryEntry, MemoryLayer, WriteMemoryInput } from "./memory-types";

export type { MemoryDeps, MemoryEntry, MemoryLayer, WriteMemoryInput } from "./memory-types";
export * from "./memory-v2";

export function writeMemory(input: WriteMemoryInput, deps: MemoryDeps): MemoryEntry {
  const { layer, key, body } = input;
  if (deps.isSecret(body)) {
    throw new Error("memory body matched secret policy; write rejected");
  }

  const createdAt = deps.now();
  const entry: MemoryEntry = {
    id: deps.stableId(layer, key, createdAt),
    layer,
    key,
    body,
    supersedes: deps.findByKey(layer, key)?.id ?? null,
    createdAt,
  };

  deps.persist(entry);
  return entry;
}

export function listMemory(layer: MemoryLayer, deps: MemoryDeps): MemoryEntry[] {
  return [...deps.readActive(layer)].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/**
 * SessionStart で毎回 context へ注入されるため、surface は無制限に膨張させない。
 * 直近 maxEntries 件のみ（時系列順）、各 body は maxBodyChars で切り詰める。
 * 隠れた古い entry は件数フッタで `helix memory list harness` へ誘導する。
 */
export interface SurfaceBudget {
  maxEntries?: number;
  maxBodyChars?: number;
}

const SURFACE_MAX_ENTRIES = 12;
const SURFACE_MAX_BODY_CHARS = 240;

export function surfaceMemory(deps: MemoryDeps, budget: SurfaceBudget = {}): string[] {
  const maxEntries = budget.maxEntries ?? SURFACE_MAX_ENTRIES;
  const maxBodyChars = budget.maxBodyChars ?? SURFACE_MAX_BODY_CHARS;

  const all = listMemory("harness", deps);
  const shown = all.slice(-maxEntries);
  const lines = shown.map(
    (entry) => `- [${entry.key}] ${clip(singleLine(entry.body), maxBodyChars)}`,
  );

  const hidden = all.length - shown.length;
  if (hidden > 0) {
    lines.push(`- (+${hidden} older — helix memory list harness)`);
  }
  return lines;
}

function singleLine(value: string): string {
  return value.replace(/\r?\n/g, " ");
}

function clip(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
