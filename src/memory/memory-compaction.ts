import {
  appendFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { isRecord } from "../shared/value-guards";
import type { MemoryDeps, MemoryEntry, MemoryLayer } from "./memory-types";

export const MEMORY_COMPACTION_THRESHOLDS = {
  totalEntries: 200,
  supersededRatio: 0.5,
} as const;

export interface CompactMemoryInput {
  layer: MemoryLayer;
  dryRun?: boolean;
}

export interface CompactMemoryResult {
  layer: MemoryLayer;
  kept: number;
  removedSuperseded: number;
  removedDamaged: number;
  backupPath: string | null;
  applied: boolean;
}

export interface MemoryCompactionAdvice {
  total: number;
  superseded: number;
  damaged: number;
  ratio: number;
  recommend: boolean;
}

export interface CompactionDeps {
  pathFor(layer: MemoryLayer): string;
  auditPath(): string;
  readFile(path: string): string | null;
  ensureDir(path: string): void;
  backupFile(sourcePath: string, backupPath: string): void;
  writeFile(path: string, content: string): void;
  renameFile(from: string, to: string): void;
  removeFile(path: string): void;
  appendFile(path: string, content: string): void;
}

interface ParsedMemoryLine {
  entry: MemoryEntry | null;
  damaged: boolean;
}

export function compactMemory(
  input: CompactMemoryInput,
  deps: MemoryDeps & CompactionDeps,
): CompactMemoryResult {
  const layer = input.layer;
  const sourcePath = deps.pathFor(layer);
  const raw = deps.readFile(sourcePath) ?? "";
  const analysis = analyzeMemoryLines(linesOf(raw), layer);
  const resultBase = {
    layer,
    kept: analysis.active.length,
    removedSuperseded: analysis.removedSuperseded,
    removedDamaged: analysis.removedDamaged,
  };

  if (input.dryRun) {
    const result = { ...resultBase, backupPath: null, applied: false };
    appendAudit(result, true, deps);
    return result;
  }

  if (raw === "") {
    // layer file 未作成/空。backup 対象が無いため書換えも backup も行わない (dryRun と対称)。
    const result = { ...resultBase, backupPath: null, applied: false };
    appendAudit(result, false, deps);
    return result;
  }

  const timestamp = safeTimestamp(deps.now());
  const backupPath = `${sourcePath}.bak-${timestamp}`;
  deps.ensureDir(sourcePath);
  deps.backupFile(sourcePath, backupPath);

  const tempPath = `${sourcePath}.tmp-${timestamp}`;
  try {
    deps.writeFile(tempPath, serializeEntries(analysis.active));
    deps.renameFile(tempPath, sourcePath);
  } catch (error) {
    try {
      deps.removeFile(tempPath);
    } catch {
      // best-effort cleanup; original failure remains the reported error
    }
    throw error;
  }

  const result = { ...resultBase, backupPath, applied: true };
  appendAudit(result, false, deps);
  return result;
}

export function memoryCompactionAdvice(entries: readonly string[]): MemoryCompactionAdvice {
  const analysis = analyzeMemoryLines(entries, null);
  const total = entries.filter((line) => line.trim() !== "").length;
  const ratio = total === 0 ? 0 : analysis.removedSuperseded / total;
  return {
    total,
    superseded: analysis.removedSuperseded,
    damaged: analysis.removedDamaged,
    ratio,
    recommend:
      total >= MEMORY_COMPACTION_THRESHOLDS.totalEntries ||
      ratio >= MEMORY_COMPACTION_THRESHOLDS.supersededRatio,
  };
}

export function nodeMemoryCompactionDeps(opts: { root: string }): CompactionDeps {
  const memoryDir = join(opts.root, ".helix", "memory");
  return {
    pathFor: (layer) => join(memoryDir, `${layer}.jsonl`),
    auditPath: () => join(opts.root, ".helix", "logs", "memory-compaction.jsonl"),
    readFile: (path) => {
      if (!existsSync(path)) return null;
      try {
        return readFileSync(path, "utf8");
      } catch (error) {
        if (isNodeError(error) && error.code === "ENOENT") return null;
        throw error;
      }
    },
    ensureDir: (path) => {
      mkdirSync(dirname(path), { recursive: true });
    },
    backupFile: (sourcePath, backupPath) => {
      copyFileSync(sourcePath, backupPath);
    },
    writeFile: (path, content) => {
      writeFileSync(path, content, "utf8");
    },
    renameFile: (from, to) => {
      renameSync(from, to);
    },
    removeFile: (path) => {
      rmSync(path, { force: true });
    },
    appendFile: (path, content) => {
      mkdirSync(dirname(path), { recursive: true });
      appendFileSync(path, content, "utf8");
    },
  };
}

function analyzeMemoryLines(entries: readonly string[], layer: MemoryLayer | null) {
  const parsed = entries
    .filter((line) => line.trim() !== "")
    .map((line) => parseMemoryLine(line, layer));
  const validEntries = parsed
    .map((line) => line.entry)
    .filter((entry): entry is MemoryEntry => entry !== null);
  const supersededIds = new Set(
    validEntries.map((entry) => entry.supersedes).filter((id): id is string => id !== null),
  );
  const active = validEntries
    .filter((entry) => !supersededIds.has(entry.id))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return {
    active,
    removedSuperseded: validEntries.length - active.length,
    removedDamaged: parsed.filter((line) => line.damaged).length,
  };
}

function parseMemoryLine(line: string, layer: MemoryLayer | null): ParsedMemoryLine {
  let value: unknown;
  try {
    value = JSON.parse(line);
  } catch {
    return { entry: null, damaged: true };
  }
  if (!isRecord(value)) return { entry: null, damaged: true };
  if (value.layer !== "harness" && value.layer !== "project") {
    return { entry: null, damaged: true };
  }
  if (layer !== null && value.layer !== layer) return { entry: null, damaged: true };
  if (typeof value.id !== "string") return { entry: null, damaged: true };
  if (typeof value.key !== "string") return { entry: null, damaged: true };
  if (typeof value.body !== "string") return { entry: null, damaged: true };
  if (value.supersedes !== null && typeof value.supersedes !== "string") {
    return { entry: null, damaged: true };
  }
  if (typeof value.createdAt !== "string") return { entry: null, damaged: true };
  return {
    entry: {
      id: value.id,
      layer: value.layer,
      key: value.key,
      body: value.body,
      supersedes: value.supersedes,
      createdAt: value.createdAt,
    },
    damaged: false,
  };
}

function serializeEntries(entries: MemoryEntry[]): string {
  return entries.length === 0
    ? ""
    : `${entries.map((entry) => JSON.stringify(entry)).join("\n")}\n`;
}

function appendAudit(
  result: CompactMemoryResult,
  dryRun: boolean,
  deps: MemoryDeps & CompactionDeps,
) {
  deps.appendFile(
    deps.auditPath(),
    `${JSON.stringify({
      at: deps.now(),
      layer: result.layer,
      kept: result.kept,
      removedSuperseded: result.removedSuperseded,
      removedDamaged: result.removedDamaged,
      backupPath: result.backupPath,
      dryRun,
    })}\n`,
  );
}

function linesOf(value: string): string[] {
  return value.split(/\r?\n/);
}

function safeTimestamp(value: string): string {
  return value.replace(/[^0-9A-Za-z_-]/g, "-");
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
