import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { isSecretLike } from "../state-db";
import type { MemoryDeps, MemoryEntry, MemoryLayer } from "./memory-types";

interface FileMemoryDepsOptions {
  root: string;
  now?: () => string;
}

export function fileMemoryDeps(opts: FileMemoryDepsOptions): MemoryDeps {
  const memoryDir = join(opts.root, ".helix", "memory");
  const now = opts.now ?? (() => new Date().toISOString());
  const pathFor = (layer: MemoryLayer) => join(memoryDir, `${layer}.jsonl`);

  const readLayer = (layer: MemoryLayer): MemoryEntry[] => {
    const path = pathFor(layer);
    if (!existsSync(path)) return [];

    let content: string;
    try {
      content = readFileSync(path, "utf8");
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") return [];
      throw error;
    }

    const entries: MemoryEntry[] = [];
    for (const line of content.split(/\r?\n/)) {
      if (line.trim() === "") continue;
      const entry = parseMemoryEntry(line);
      if (entry?.layer === layer) entries.push(entry);
    }
    return entries;
  };

  const readActive = (layer: MemoryLayer): MemoryEntry[] => {
    const entries = readLayer(layer);
    const superseded = new Set(
      entries.map((entry) => entry.supersedes).filter((id): id is string => id !== null),
    );
    return entries.filter((entry) => !superseded.has(entry.id));
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

function parseMemoryEntry(line: string): MemoryEntry | null {
  let value: unknown;
  try {
    value = JSON.parse(line);
  } catch {
    // Historical jsonl is append-only and may contain damaged lines; ignore only that line.
    return null;
  }
  if (!isRecord(value)) return null;
  if (value.layer !== "harness" && value.layer !== "project") return null;
  if (typeof value.id !== "string") return null;
  if (typeof value.key !== "string") return null;
  if (typeof value.body !== "string") return null;
  if (value.supersedes !== null && typeof value.supersedes !== "string") return null;
  if (typeof value.createdAt !== "string") return null;
  return {
    id: value.id,
    layer: value.layer,
    key: value.key,
    body: value.body,
    supersedes: value.supersedes,
    createdAt: value.createdAt,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
