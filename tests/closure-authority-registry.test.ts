import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeClosureAuthorityDrift,
  classifyClosureAuthorities,
  loadClosureAuthorityRegistry,
  parseClosureAuthorityRegistry,
} from "../src/state-db/closure-authority-registry";

// PLAN-L7-434-closure-evidence-materialization

const digest = (value: string | Buffer) =>
  `sha256:${createHash("sha256").update(value).digest("hex")}`;
const planId = "PLAN-L7-999-example";
const row = (sourceDigest: string) => ({
  plan_id: planId,
  source_path: "plan.md",
  source_digest: sourceDigest,
  capabilities: ["local_plan_status"],
  bindings: [{ oracle_id: "U-CMAT-001", parent_design: "design.md", test_path: "test.ts" }],
  gates: [
    {
      gate_id: "harness-check",
      command_id: "harness-check",
      command: "helix gate harness-check",
    },
  ],
  migration_reason: null,
});

describe("closure authority registry", () => {
  it("U-CMAT-002: strict versioned schema rejects caller fields and duplicate authority", () => {
    const valid = {
      schema_version: "closure-authority-registry.v1",
      authorities: [row(digest("plan"))],
    };
    expect(parseClosureAuthorityRegistry(valid).authorities).toHaveLength(1);
    expect(() => parseClosureAuthorityRegistry({ ...valid, caller_override: true })).toThrow();
    expect(() =>
      parseClosureAuthorityRegistry({
        ...valid,
        authorities: [valid.authorities[0], valid.authorities[0]],
      }),
    ).toThrow(/duplicate authority/);
    expect(() =>
      parseClosureAuthorityRegistry({
        ...valid,
        authorities: [{ ...valid.authorities[0], command: "rm -rf /" }],
      }),
    ).toThrow();
  });

  it("loads only a repo-contained regular registry and rejects symlink registry", () => {
    const root = mkdtempSync(join(tmpdir(), "closure-registry-"));
    const content = `schema_version: closure-authority-registry.v1\nauthorities: []\n`;
    writeFileSync(join(root, "registry.yaml"), content);
    expect(
      loadClosureAuthorityRegistry({ repositoryRoot: root, registryPath: "registry.yaml" })
        .authorities,
    ).toEqual([]);
    symlinkSync(join(root, "registry.yaml"), join(root, "link.yaml"));
    expect(() =>
      loadClosureAuthorityRegistry({ repositoryRoot: root, registryPath: "link.yaml" }),
    ).toThrow(/regular file/);
    expect(() =>
      loadClosureAuthorityRegistry({ repositoryRoot: root, registryPath: "../outside.yaml" }),
    ).toThrow(/outside repository/);
  });

  it("authority drift: U-CMAT-001 source bytes driftを拒否する", () => {
    const root = mkdtempSync(join(tmpdir(), "closure-registry-"));
    const before = `---\nplan_id: ${planId}\n---\nbefore\n`;
    writeFileSync(join(root, "plan.md"), before);
    const registry = parseClosureAuthorityRegistry({
      schema_version: "closure-authority-registry.v1",
      authorities: [row(digest(before))],
    });
    expect(analyzeClosureAuthorityDrift({ repositoryRoot: root, registry })).toEqual([]);
    writeFileSync(join(root, "plan.md"), "after");
    const drifts = analyzeClosureAuthorityDrift({ repositoryRoot: root, registry });
    expect(drifts[0]?.code).toBe("source_digest_drift");
    expect(
      classifyClosureAuthorities({ candidatePlanIds: [planId], registry, drifts })[0]
        ?.classification,
    ).toBe("invalid");
  });

  it("U-CMAT-001: classifies every candidate exactly once and defaults unknown authority to human", () => {
    const eligible = row(digest("plan"));
    const backfill = {
      ...row(digest("plan")),
      plan_id: "PLAN-L7-998-backfill",
      migration_reason: "V-pair review required",
    };
    const irreversible = {
      ...row(digest("plan")),
      plan_id: "PLAN-L7-997-publish",
      capabilities: ["external_publish"],
    };
    const incomplete = { ...row(digest("plan")), plan_id: "PLAN-L7-996-invalid", bindings: [] };
    const registry = parseClosureAuthorityRegistry({
      schema_version: "closure-authority-registry.v1",
      authorities: [eligible, backfill, irreversible, incomplete],
    });
    const result = classifyClosureAuthorities({
      candidatePlanIds: [
        planId,
        backfill.plan_id,
        irreversible.plan_id,
        incomplete.plan_id,
        "PLAN-L7-995-unknown",
      ],
      registry,
      drifts: [],
    });
    expect(result.map(({ classification }) => classification)).toEqual([
      "eligible",
      "authority_backfill_required",
      "human_only",
      "invalid",
      "human_only",
    ]);
    expect(result).toHaveLength(5);
    expect(result[4]?.reason).toMatch(/default human/);
  });

  it("authority override: U-CMAT-002 caller overrideと重複candidateを拒否する", () => {
    const registry = parseClosureAuthorityRegistry({
      schema_version: "closure-authority-registry.v1",
      authorities: [row(digest("plan"))],
    });
    const result = classifyClosureAuthorities({
      candidatePlanIds: [planId, planId],
      registry,
      drifts: [],
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.classification).toBe("invalid");
    expect(result[0]?.reason).toBe("duplicate candidate");
    expect(
      readFileSync(
        join(import.meta.dirname, "../src/state-db/closure-authority-registry.ts"),
        "utf8",
      ),
    ).not.toContain("callerOverride");
  });
});
