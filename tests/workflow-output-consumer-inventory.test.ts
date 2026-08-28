import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// PLAN-L7-692-workflow-output-consumer-inventory / U-WFOCI-001..004

const ROOT = process.cwd();
const INVENTORY_PATH = join(ROOT, "config/workflow-output-consumer-inventory.json");
const ALLOWED_DISPOSITIONS = new Set([
  "workflow_primary_identity_migrate",
  "domain_model_keep",
  "compatibility_input_only",
  "historical_keep",
  "superseded_remove",
]);
const EXPECTED_TOKENS = [
  "available_models",
  "default_drive_model",
  "default_model",
  "drive_model",
  "project_drive_model_candidates",
  "selected_drive_model",
  "selected_model",
];
const EXPECTED_SURFACE_PATHS = [
  "src/cli.ts",
  "src/schema/harness-db-tables-design.ts",
  "src/state-db/current-location.ts",
];

interface Entry {
  path: string;
  field_token: string;
  expected_occurrences: number;
  disposition: string;
  responsibility_owner: string;
  producer_symbols: string[];
  consumer_surfaces: string[];
  successor_issues: number[];
}

interface Inventory {
  schema_version: string;
  authority: string;
  measured_head: string;
  issue: number;
  surface_paths: string[];
  tokens: string[];
  entries: Entry[];
}

function loadInventory(): Inventory {
  return JSON.parse(readFileSync(INVENTORY_PATH, "utf8")) as Inventory;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function exactOccurrences(text: string, token: string): number {
  return [...text.matchAll(new RegExp(`\\b${escapeRegExp(token)}\\b`, "g"))].length;
}

describe("WORKFLOW-OUTPUT-CONSUMER-INVENTORY-001", () => {
  it("U-WFOCI-001: current authorityとtoken exact setへ束縛する", () => {
    const inventory = loadInventory();
    expect(inventory.schema_version).toBe("helix-workflow-output-consumer-inventory.v1");
    expect(inventory.authority).toBe("docs/governance/helix-harness-requirements_v1.3.md");
    expect(inventory.measured_head).toMatch(/^[0-9a-f]{40}$/);
    expect(inventory.issue).toBe(1119);
    expect([...inventory.surface_paths].sort()).toEqual(EXPECTED_SURFACE_PATHS);
    expect([...inventory.tokens].sort()).toEqual(EXPECTED_TOKENS);
  });

  it("U-WFOCI-002: 全surface＋field token行列を漏れなくexact照合する", () => {
    const inventory = loadInventory();
    const entriesByKey = new Map(
      inventory.entries.map((entry) => [`${entry.path}\u0000${entry.field_token}`, entry]),
    );
    for (const path of inventory.surface_paths) {
      const source = readFileSync(join(ROOT, path), "utf8");
      for (const token of inventory.tokens) {
        const actual = exactOccurrences(source, token);
        const entry = entriesByKey.get(`${path}\u0000${token}`);
        if (actual === 0) {
          expect(entry, `${path}:${token} has a stale inventory entry`).toBeUndefined();
        } else {
          expect(entry, `${path}:${token} is missing from inventory`).toBeDefined();
          expect(entry?.expected_occurrences, `${path}:${token}`).toBe(actual);
        }
      }
    }
  });

  it("U-WFOCI-003: entry keyと責務metadataをfail-closeする", () => {
    const inventory = loadInventory();
    const keys = inventory.entries.map((entry) => `${entry.path}\u0000${entry.field_token}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const entry of inventory.entries) {
      expect(entry.path).toMatch(/^src\//);
      expect(inventory.surface_paths).toContain(entry.path);
      expect(inventory.tokens).toContain(entry.field_token);
      expect(entry.expected_occurrences).toBeGreaterThan(0);
      expect(entry.responsibility_owner.trim()).not.toBe("");
      expect(entry.producer_symbols.length).toBeGreaterThan(0);
      const source = readFileSync(join(ROOT, entry.path), "utf8");
      for (const symbol of entry.producer_symbols) {
        expect(source, `${entry.path} lacks producer symbol ${symbol}`).toContain(symbol);
      }
      expect(entry.consumer_surfaces.length).toBeGreaterThan(0);
      expect(entry.successor_issues.length).toBeGreaterThan(0);
      expect(entry.successor_issues.every((issue) => issue > 0)).toBe(true);
    }
  });

  it("U-WFOCI-004: unknown dispositionをcurrent判定へ推測しない", () => {
    const inventory = loadInventory();
    expect(inventory.entries.length).toBeGreaterThan(0);
    for (const entry of inventory.entries) {
      expect(ALLOWED_DISPOSITIONS.has(entry.disposition), entry.disposition).toBe(true);
    }
  });
});
