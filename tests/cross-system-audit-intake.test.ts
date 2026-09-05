// PLAN-RECOVERY-1500-cross-system-audit-intake
import { createHash } from "node:crypto";
import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = "docs/reference/cross-system-audit-2026-09-05";
const sourceRoot = "docs/archive/cross-system-audit-2026-09-05/source";
const inventory = JSON.parse(readFileSync(join(root, "inputs.json"), "utf8")) as {
  entries: { path: string; bytes: number; sha256: string }[];
};
const { authority, mapping, source_root } = JSON.parse(
  readFileSync(join(root, "source-map.json"), "utf8"),
) as {
  authority: string;
  source_root: string;
  mapping: { original: string; saved: string }[];
};

describe("外部監査入力の非実行保全", () => {
  it("U-XAUDIT-001: 元checksumと保存内容のexact対応を検査する", () => {
    expect(authority).toBe("historical_reference_only");
    expect(source_root).toBe(sourceRoot);
    expect(mapping).toHaveLength(14);
    expect(inventory.entries).toHaveLength(14);
    expect(new Set(mapping.map((m) => m.original)).size).toBe(14);
    expect(new Set(mapping.map((m) => m.saved)).size).toBe(14);
    expect(readdirSync(sourceRoot).sort()).toEqual(mapping.map((m) => m.saved).sort());
    for (const entry of inventory.entries) {
      const matches = mapping.filter((m) => entry.path === `helix_audit_20260905/${m.original}`);
      expect(matches).toHaveLength(1);
      const saved = matches[0].saved;
      expect(saved).toMatch(/^[A-Za-z0-9_.-]+\.txt$/u);
      const path = join(sourceRoot, saved);
      expect(lstatSync(path).isFile()).toBe(true);
      const data = readFileSync(path);
      expect(data.length).toBe(entry.bytes);
      expect(createHash("sha256").update(data).digest("hex")).toBe(entry.sha256);
    }
    const checksumBytes = readFileSync(join(sourceRoot, "sha256sums.txt"));
    expect(createHash("sha256").update(checksumBytes).digest("hex")).toBe(
      "a1e4c65f8a77207ba8a1576715782c5743f4546aaa87b5f7f90b71b29f1c4c64",
    );
    const sums = checksumBytes.toString("utf8").trim().split("\n");
    expect(sums).toHaveLength(13);
    for (const line of sums) {
      const [digest, name] = line.trim().split(/\s+/u);
      expect(inventory.entries.filter((e) => e.path === `helix_audit_20260905/${name}`)).toEqual([
        expect.objectContaining({ sha256: digest }),
      ]);
    }
    expect(
      inventory.entries.find((e) => e.path.endsWith("/HELIX_CROSS_SYSTEM_AUDIT_2026-09-05.md"))
        ?.sha256,
    ).toBe("dcf0d4e0dcc4db772afac465df10f2412134cd65dcd019a18cb99c9fd39be53f");
  });

  it("U-XAUDIT-002: 欠陥・責務衝突・修正済み対照を欠落なく分離する", () => {
    const text = readFileSync(join(root, "intake.md"), "utf8").split("## 証拠の限界")[0];
    for (const [prefix, count] of [
      ["F", 14],
      ["C", 11],
      ["X", 5],
    ] as const) {
      const ids = [...text.matchAll(new RegExp(`^\\| (${prefix}[0-9]{2}) \\|`, "gm"))].map(
        (m) => m[1],
      );
      expect(ids).toEqual(
        Array.from({ length: count }, (_, i) => `${prefix}${String(i + 1).padStart(2, "0")}`),
      );
    }
  });
});
