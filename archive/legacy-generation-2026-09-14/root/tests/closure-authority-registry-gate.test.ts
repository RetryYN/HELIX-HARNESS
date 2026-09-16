import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkClosureAuthorityRegistry } from "../src/doctor";
import {
  analyzeClosureAuthorityRegistry,
  closureAuthorityRegistryMessages,
  loadClosureAuthorityRegistryLintInput,
} from "../src/lint/closure-authority-registry";

const digest = (value: string) => `sha256:${createHash("sha256").update(value).digest("hex")}`;

function repository(registry: string): string {
  const root = mkdtempSync(join(tmpdir(), "closure-authority-gate-"));
  mkdirSync(join(root, "docs", "governance"), { recursive: true });
  writeFileSync(join(root, "docs", "governance", "closure-authority-registry.yaml"), registry);
  return root;
}

function registryRow(sourceDigest: string): string {
  return `schema_version: closure-authority-registry.v1
authorities:
  - plan_id: PLAN-L7-999-example
    source_path: docs/plans/example.md
    source_digest: ${sourceDigest}
    capabilities: [local_plan_status]
    bindings:
      - oracle_id: U-CMAT-001
        parent_design: docs/design/example.md
        test_path: tests/example.test.ts
    gates:
      - gate_id: harness-check
        command_id: harness-check
        command: helix gate harness-check
    migration_reason: null
`;
}

describe("closure authority registry hard gate", () => {
  it("空registryをvalidとして常設loaderから検査する", () => {
    const root = repository("schema_version: closure-authority-registry.v1\nauthorities: []\n");
    const result = analyzeClosureAuthorityRegistry(loadClosureAuthorityRegistryLintInput(root));
    expect(result).toEqual({ authorityCount: 0, drifts: [], ok: true });
    expect(closureAuthorityRegistryMessages(result)).toEqual([
      "closure-authority-registry - OK (authorities=0, drift=0)",
    ]);
    expect(checkClosureAuthorityRegistry(root).ok).toBe(true);
  });

  it("unknown fieldとduplicate authorityをstrict parseでfail-closeする", () => {
    const unknown = repository(
      "schema_version: closure-authority-registry.v1\nauthorities: []\nunknown: true\n",
    );
    expect(checkClosureAuthorityRegistry(unknown)).toMatchObject({ ok: false });

    const row = registryRow(digest("plan")).split("authorities:\n")[1];
    const duplicate = repository(
      `schema_version: closure-authority-registry.v1\nauthorities:\n${row}${row}`,
    );
    expect(checkClosureAuthorityRegistry(duplicate)).toMatchObject({ ok: false });
  });

  it("registry rowのsource digest driftをdoctor hard-failする", () => {
    const before = "---\nplan_id: PLAN-L7-999-example\n---\nbefore\n";
    const root = repository(registryRow(digest(before)));
    mkdirSync(join(root, "docs", "plans"), { recursive: true });
    writeFileSync(join(root, "docs", "plans", "example.md"), before);
    expect(checkClosureAuthorityRegistry(root).ok).toBe(true);

    writeFileSync(join(root, "docs", "plans", "example.md"), "after");
    const result = checkClosureAuthorityRegistry(root);
    expect(result.ok).toBe(false);
    expect(result.messages.join("\n")).toContain("source_digest_drift");
  });
});
