import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import type { StatusLevel, UiTokens } from "./types";

const STATUS_LEVELS: StatusLevel[] = ["ok", "warn", "error", "empty", "loading"];

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  throw new Error(`invalid token section: ${label}`);
}

function asString(value: unknown, label: string): string {
  if (typeof value === "string" && value.length > 0) return value;
  throw new Error(`invalid token string: ${label}`);
}

function asNumber(value: unknown, label: string): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  throw new Error(`invalid token number: ${label}`);
}

function readStringPath(root: Record<string, unknown>, path: string): string {
  const value = path.split(".").reduce<unknown>((acc, key) => asRecord(acc, path)[key], root);
  return asString(value, path);
}

function readNumberPath(root: Record<string, unknown>, path: string): number {
  const value = path.split(".").reduce<unknown>((acc, key) => asRecord(acc, path)[key], root);
  return asNumber(value, path);
}

export function defaultTokenPath(repoRoot = process.cwd()): string {
  return join(repoRoot, "docs", "design", "harness", "L4-basic-design", "tokens.yaml");
}

export function loadUiTokens(path = defaultTokenPath()): UiTokens {
  const parsed = parseYaml(readFileSync(path, "utf8"));
  const root = asRecord(parsed, "root");
  const status = asRecord(asRecord(asRecord(root.color, "color").status, "color.status"), "status");

  return {
    version: readNumberPath(root, "version"),
    mode: "light",
    color: {
      status: Object.fromEntries(
        STATUS_LEVELS.map((level) => {
          const entry = asRecord(status[level], `color.status.${level}`);
          return [
            level,
            {
              fg: asString(entry.fg, `color.status.${level}.fg`),
              bg: asString(entry.bg, `color.status.${level}.bg`),
              icon: asString(entry.icon, `color.status.${level}.icon`),
            },
          ];
        }),
      ) as UiTokens["color"]["status"],
      fg: {
        default: readStringPath(root, "color.fg.default"),
        muted: readStringPath(root, "color.fg.muted"),
        onAccent: readStringPath(root, "color.fg.onAccent"),
      },
      canvas: {
        default: readStringPath(root, "color.canvas.default"),
        subtle: readStringPath(root, "color.canvas.subtle"),
        inset: readStringPath(root, "color.canvas.inset"),
      },
      border: {
        default: readStringPath(root, "color.border.default"),
        muted: readStringPath(root, "color.border.muted"),
      },
      accent: {
        fg: readStringPath(root, "color.accent.fg"),
        emphasis: readStringPath(root, "color.accent.emphasis"),
        subtle: readStringPath(root, "color.accent.subtle"),
      },
      danger: { emphasis: readStringPath(root, "color.danger.emphasis") },
    },
    size: {
      layout: {
        minWidth: readNumberPath(root, "size.layout.minWidth"),
        gutter: readNumberPath(root, "size.layout.gutter"),
        contentMaxWidth: readStringPath(root, "size.layout.contentMaxWidth"),
      },
      table: {
        rowHeight: readNumberPath(root, "size.table.rowHeight"),
        cellPadX: readNumberPath(root, "size.table.cellPadX"),
        cellPadY: readNumberPath(root, "size.table.cellPadY"),
      },
      control: {
        height: readNumberPath(root, "size.control.height"),
        minTarget: readNumberPath(root, "size.control.minTarget"),
      },
      radius: {
        sm: readNumberPath(root, "size.radius.sm"),
        md: readNumberPath(root, "size.radius.md"),
      },
    },
    type: {
      font: {
        body: readStringPath(root, "type.font.body"),
        mono: readStringPath(root, "type.font.mono"),
      },
      fontSize: {
        body: readNumberPath(root, "type.fontSize.body"),
        small: readNumberPath(root, "type.fontSize.small"),
        h1: readNumberPath(root, "type.fontSize.h1"),
        h2: readNumberPath(root, "type.fontSize.h2"),
        code: readNumberPath(root, "type.fontSize.code"),
      },
      lineHeight: {
        body: readNumberPath(root, "type.lineHeight.body"),
        dense: readNumberPath(root, "type.lineHeight.dense"),
      },
      weight: {
        regular: readNumberPath(root, "type.weight.regular"),
        medium: readNumberPath(root, "type.weight.medium"),
        bold: readNumberPath(root, "type.weight.bold"),
      },
    },
    focus: {
      ringColor: readStringPath(root, "focus.ringColor"),
      ringWidth: readNumberPath(root, "focus.ringWidth"),
      ringOffset: readNumberPath(root, "focus.ringOffset"),
      ringStyle: readStringPath(root, "focus.ringStyle"),
    },
    motion: {
      pollIntervalSec: readNumberPath(root, "motion.pollIntervalSec"),
      spinnerDurationMs: readNumberPath(root, "motion.spinnerDurationMs"),
      reducedMotion: readStringPath(root, "motion.reducedMotion"),
    },
  };
}
