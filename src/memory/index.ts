import type { MemoryDeps, MemoryEntry, MemoryLayer, WriteMemoryInput } from "./memory-types";

export type { MemoryDeps, MemoryEntry, MemoryLayer, WriteMemoryInput } from "./memory-types";

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

export function surfaceMemory(deps: MemoryDeps): string[] {
  return listMemory("harness", deps).map((entry) => `- [${entry.key}] ${singleLine(entry.body)}`);
}

function singleLine(value: string): string {
  return value.replace(/\r?\n/g, " ");
}
