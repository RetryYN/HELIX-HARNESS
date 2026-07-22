import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { resolveMemoryView } from "../src/memory/memory-v2";

const REQUIREMENTS = "docs/governance/helix-harness-requirements_v1.3.md";
const AUDIT = "docs/governance/harness-memory-reconciliation-audit-2026-07-19.md";

describe("harness memory reconciliation binding", () => {
  // PLAN-L7-458-harness-memory-canonical-retirement / U-MEMV2-005e.
  it("accounts for the exact 39-entry memory union", () => {
    const audit = readFileSync(AUDIT, "utf8");
    expect(audit).toContain("ID和集合 **39件**");
    const rows = [...audit.matchAll(/^\|\s*(\d+)\s*\| `([^`]+)` \|/gm)];
    expect(rows.map((row) => Number(row[1]))).toEqual(
      Array.from({ length: 39 }, (_, index) => index + 1),
    );
    expect(new Set(rows.map((row) => row[2])).size).toBe(39);
    expect(rows.map((row) => row[2])).toEqual(
      expect.arrayContaining([
        "system-audit-2026-07-14-goal",
        "v051-completion-claim-correction",
        "v051-final-reverification",
        "hybrid-engine-requirements-extraction-gaps",
        "nfr-consolidation-improvement-audit",
        "design-harness-status",
        "requirements-consistency-audit",
        "authoring-admission-directive",
        "l12-canonical-vmodel-direction",
        "worker-runtime-research-2026-07-19",
      ]),
    );
  });

  it("backfills the worker-runtime research without conflating Python authority", () => {
    const requirements = readFileSync(REQUIREMENTS, "utf8");
    const l1 = readFileSync("docs/design/helix/L1-requirements/pillar-requirements.md", "utf8");
    const l3 = readFileSync(
      "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      "utf8",
    );
    for (const id of ["HR-FR-P2-05", "HR-FR-P2-06", "HR-FR-P2-07", "HR-FR-P2-08", "HR-FR-P6-06"]) {
      expect(requirements).toContain(id);
      expect(l3).toContain(id);
    }
    expect(l1).toContain("authorityを持たない外部worker");
    expect(requirements).toContain("Python semantic coreとは別");
    const discovery = readFileSync(
      "docs/plans/PLAN-DISCOVERY-12-grok-build-worktree-precedent.md",
      "utf8",
    );
    expect(discovery).toContain("worktreeの払い出し");
    for (const id of ["HR-FR-P2-05", "HR-FR-P2-06", "HR-FR-P2-07", "HR-FR-P2-08", "HR-FR-P6-06"]) {
      expect(discovery).toMatch(new RegExp(`^\\| ${id} \\| [^|]+ \\| L4 `, "m"));
    }
  });

  it("binds every reconciled key to one retirement authority entry", () => {
    const authority = JSON.parse(
      readFileSync("docs/governance/generated/harness-memory-retirement-authority.json", "utf8"),
    ) as {
      authority_id: string;
      schema_version: number;
      source_revision: string;
      consumer_id: string;
      layer: string;
      entries: Array<{
        memory_id: string;
        key: string;
        targets: Array<{ path: string; sha256: string }>;
      }>;
    };
    const payload = JSON.stringify({
      schema_version: authority.schema_version,
      source_revision: authority.source_revision,
      consumer_id: authority.consumer_id,
      layer: authority.layer,
      entries: authority.entries,
    });
    expect(authority.authority_id).toBe(
      `sha256:${createHash("sha256").update(payload).digest("hex")}`,
    );
    expect(authority.entries).toHaveLength(39);
    expect(new Set(authority.entries.map((entry) => entry.memory_id)).size).toBe(39);
    expect(new Set(authority.entries.map((entry) => entry.key)).size).toBe(39);
    for (const entry of authority.entries) {
      expect(entry.targets.length).toBeGreaterThan(0);
      expect(
        entry.targets.some((target) => {
          const content = readFileSync(target.path, "utf8");
          return (
            content.includes(entry.key) &&
            target.sha256 === `sha256:${createHash("sha256").update(content).digest("hex")}`
          );
        }),
      ).toBe(true);
    }
  });

  it("U-MEMV2-005e: retires every repository harness-memory payload from active surfaces", () => {
    const authority = JSON.parse(
      readFileSync("docs/governance/generated/harness-memory-retirement-authority.json", "utf8"),
    ) as { entries: Array<{ key: string }> };
    const retiredKeys = new Set(authority.entries.map((entry) => entry.key));
    const raw = readFileSync(".helix/memory/harness.jsonl", "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as unknown);
    const view = resolveMemoryView(raw, "2026-07-19T23:59:59.999Z", "harness");
    expect(view.activeEntries.filter((entry) => retiredKeys.has(entry.key))).toEqual([]);
    expect(view.damaged).toBe(0);
    expect(view.tombstones.length).toBeGreaterThan(0);
    expect(view.tombstones.every((entry) => entry.body === "")).toBe(true);
  });

  it("backfills every hybrid extraction gap with paired acceptance IDs", () => {
    const requirements = readFileSync(REQUIREMENTS, "utf8");
    for (let index = 1; index <= 10; index += 1) {
      const suffix = String(index).padStart(3, "0");
      expect(requirements).toContain(`HR-FR-HYB-${suffix}`);
      expect(requirements).toContain(`HR-AC-HYB-${suffix}`);
    }
    for (const term of [
      "closure authority",
      "MCP profile catalog",
      "S0 backlog → S1 plan → S2 poc → S3 verify → S4 decide",
      "memory v2",
      "feedback lifecycle",
      "skill engine",
      "distribution",
      "VSCode surface",
      "GH-FR-001..017",
      "GH-FR-018..021",
    ])
      expect(requirements, `${term} missing`).toContain(term);
  });

  it("promotes authoring admission without weakening human boundaries", () => {
    const requirements = readFileSync(REQUIREMENTS, "utf8");
    for (const id of [
      "HIL-BR-26",
      "HIL-FR-51",
      "HIL-FR-52",
      "HIL-FR-53",
      "HIL-NFR-30",
      "HIL-NFR-31",
      "HIL-NFR-32",
    ])
      expect(requirements).toContain(id);
    expect(requirements).toContain("Proposal→Candidate→Canonical");
    expect(requirements).toContain("AIが黙って要求を落とすことを禁止");
  });

  it("binds NFR registry and unified Design HARNESS without completion overclaim", () => {
    const requirements = readFileSync(REQUIREMENTS, "utf8");
    for (let index = 1; index <= 7; index += 1)
      expect(requirements).toContain(`HR-NFR-REG-${String(index).padStart(3, "0")}`);
    for (let index = 1; index <= 6; index += 1)
      expect(requirements).toContain(`HR-FR-DHR-${String(index).padStart(3, "0")}`);
    expect(requirements).toContain("runtime未実装の能力は`designed`以上へ昇格せず");
    expect(requirements).toContain("risk-based pairwise");
  });

  it("updates operational rules for ADR-010, autonomous GitHub, and Codex hook trust", () => {
    const agents = readFileSync("AGENTS.md", "utf8");
    const claude = readFileSync("CLAUDE.md", "utf8");
    const claudeRuntime = readFileSync(".claude/CLAUDE.md", "utf8");
    expect(agents).toContain("Codex CLI 0.144+");
    expect(agents).toContain("hooks.state.trusted_hash");
    expect(agents).toContain("External Source Research");
    expect(claude).toContain("明示依頼を待たずpush→PR→auto-merge→CI監視→self-heal");
    expect(claudeRuntime).toContain("Pythonはversioned contract内の恒久semantic core");
    expect(claudeRuntime).not.toContain("proposal-only Python worker");
  });
});
