import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { isSecretLike } from "../security/secret-policy";
import type { MemoryDeps, MemoryEntry, MemoryLayer } from "./memory-types";
import { resolveMemoryView } from "./memory-v2";

interface FileMemoryDepsOptions {
  root: string;
  now?: () => string;
}

export function fileMemoryDeps(opts: FileMemoryDepsOptions): MemoryDeps {
  const memoryDir = join(opts.root, ".helix", "memory");
  const now = opts.now ?? (() => new Date().toISOString());
  const pathFor = (layer: MemoryLayer) => join(memoryDir, `${layer}.jsonl`);

  const readActive = (layer: MemoryLayer): MemoryEntry[] => {
    const raw = readRawLayer(pathFor(layer));
    return resolveMemoryView(raw, new Date().toISOString(), layer).activeEntries.map((entry) => ({
      id: entry.id,
      layer,
      key: entry.key,
      body: entry.body,
      supersedes: entry.supersedes,
      createdAt: entry.createdAt,
    }));
  };

  return {
    now,
    stableId: (layer, key, createdAt) => `${layer}:${key}:${createdAt}`,
    isSecret: isSecretLike,
    readActive,
    findByKey: (layer, key) =>
      readActive(layer)
        .filter((entry) => entry.key === key)
        .at(-1) ?? null,
    persist: (entry) => {
      mkdirSync(memoryDir, { recursive: true });
      appendFileSync(pathFor(entry.layer), `${JSON.stringify(entry)}\n`, "utf8");
    },
  };
}

function readRawLayer(path: string): unknown[] {
  if (!existsSync(path)) return [];
  let content: string;
  try {
    content = readFileSync(path, "utf8");
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") return [];
    throw error;
  }
  return content.split(/\r?\n/).flatMap((line) => {
    if (line.trim() === "") return [];
    try {
      return [JSON.parse(line) as unknown];
    } catch {
      return [];
    }
  });
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
