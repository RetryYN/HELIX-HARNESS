import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkDesignRealityBinding } from "../src/doctor/index";
import {
  analyzeDesignRealityBinding,
  evaluateFailureWitness,
  type FailureReachabilityWitness,
} from "../src/lint/design-reality-binding";
import { lintPlanGate } from "../src/plan/lint";
import { sha256Digest } from "../src/runtime/digest";

function fixtureRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "helix-design-reality-"));
  for (const dir of [
    "docs/design/helix/L4-basic-design",
    "docs/design/helix/L5-detail",
    "docs/plans",
    "src/runtime",
    "tests",
  ]) {
    mkdirSync(join(root, dir), { recursive: true });
  }
  return root;
}

function witness(identityFields = ["agent_id", "contract_version"]): FailureReachabilityWitness {
  return {
    reason_code: "WORKER_DESCRIPTOR_CAPABILITY_MISMATCH",
    source_path: "src/runtime/worker.ts",
    source_symbol: "resolveWorkerDescriptor",
    test_path: "tests/runtime.test.ts",
    oracle_id: "U-WDA-004",
    identity_fields: identityFields,
    post_resolution_checks: ["capability_class"],
    fixture: {
      registry: [
        { agent_id: "kimi", contract_version: "1.0.0", capability_class: "implementation" },
      ],
      request: { agent_id: "kimi", contract_version: "1.0.0", capability_class: "verification" },
    },
    expected_reason: "WORKER_DESCRIPTOR_CAPABILITY_MISMATCH",
    mutation: {
      remove_post_resolution_check: "capability_class",
      expected_reason_after_mutation: "OK",
    },
  };
}

function design(binding: unknown): string {
  return `---\ntitle: reality\nlayer: L4\nartifact_type: design\nstatus: confirmed\nupdated: 2026-08-03\n---\n\n<!-- HELIX:design-reality-binding:v1 -->\n\`\`\`json\n${JSON.stringify(binding, null, 2)}\n\`\`\`\n`;
}

function validFixture(): { root: string; binding: Record<string, unknown> } {
  const root = fixtureRoot();
  const runtime = `export function resolveWorkerDescriptor(request: Record<string, string>, entries: Record<string, string>[]): string {
  const matches = entries.filter((entry) => entry.agent_id === request.agent_id && entry.contract_version === request.contract_version);
  if (matches.length === 0) return "WORKER_DESCRIPTOR_NOT_FOUND";
  if (matches.length > 1) return "WORKER_DESCRIPTOR_AMBIGUOUS";
  if (matches[0].capability_class !== request.capability_class) return "WORKER_DESCRIPTOR_CAPABILITY_MISMATCH";
  return "OK";
}\n`;
  writeFileSync(join(root, "src/runtime/worker.ts"), runtime);
  writeFileSync(
    join(root, "tests/runtime.test.ts"),
    `import { expect, it } from "vitest";\nimport { resolveWorkerDescriptor } from "../src/runtime/worker";\nit("U-WDA-004: mismatch", () => { expect(resolveWorkerDescriptor({ agent_id: "kimi", contract_version: "1.0.0", capability_class: "verification" }, [{ agent_id: "kimi", contract_version: "1.0.0", capability_class: "implementation" }])).toBe("WORKER_DESCRIPTOR_CAPABILITY_MISMATCH"); });\n`,
  );
  const binding = {
    schema_version: "helix-design-reality-binding.v1",
    assets: [
      {
        asset_id: "worker-resolver",
        classification: "existing_runtime",
        artifact_path: "src/runtime/worker.ts",
        resource_kind: "typescript_export",
        resource_name: "resolveWorkerDescriptor",
        source_digest: sha256Digest(runtime),
        current_authority: true,
      },
    ],
    failure_reachability: [witness()],
  };
  return { root, binding };
}

describe("design reality binding", () => {
  it("U-DRB-001: exact HEADの実在exportとdigestをgreenにする", () => {
    const { root, binding } = validFixture();
    const file = "docs/design/helix/L4-basic-design/reality.md";
    writeFileSync(join(root, file), design(binding));
    expect(analyzeDesignRealityBinding(root, [file])).toMatchObject({ ok: true, checked: 1 });
  });

  it("U-DRB-002: 存在しないPythonWorkerRegistryを名称類似で代替せず拒否する", () => {
    const { root, binding } = validFixture();
    const assets = binding.assets as Record<string, unknown>[];
    assets[0] = { ...assets[0], resource_name: "PythonWorkerRegistry" };
    const file = "docs/design/helix/L4-basic-design/reality.md";
    writeFileSync(join(root, file), design(binding));
    expect(analyzeDesignRealityBinding(root, [file]).findings).toContainEqual(
      expect.objectContaining({ reason: "missing_runtime_symbol" }),
    );
  });

  it("U-DRB-003: planned資産のexisting昇格とcompatibilityのauthority昇格をfail-closeする", () => {
    const { root, binding } = validFixture();
    binding.assets = [
      {
        asset_id: "future",
        classification: "planned_new",
        behavior_contract_id: "DRB-002",
        responsibility_owner: "future-owner",
        planned_artifact: "src/runtime/future.ts",
        downstream_plan: "docs/plans/PLAN-L7-999-future.md",
        current_runtime: true,
      },
      {
        asset_id: "legacy",
        classification: "compatibility_only",
        artifact_path: "docs/archive/legacy.md",
        reason: "migration only",
        read_only: true,
        current_authority: true,
      },
    ];
    const file = "docs/design/helix/L4-basic-design/reality.md";
    writeFileSync(join(root, file), design(binding));
    expect(analyzeDesignRealityBinding(root, [file]).findings.map((item) => item.reason)).toEqual([
      "invalid_planned_new",
      "invalid_compatibility_only",
    ]);
  });

  it("U-DRB-004: capabilityをidentity keyへ混ぜた到達不能設計を拒否する", () => {
    const unreachable = witness(["agent_id", "contract_version", "capability_class"]);
    expect(evaluateFailureWitness(unreachable)).toBe("WORKER_DESCRIPTOR_NOT_FOUND");
    const { root, binding } = validFixture();
    binding.failure_reachability = [unreachable];
    const file = "docs/design/helix/L4-basic-design/reality.md";
    writeFileSync(join(root, file), design(binding));
    expect(analyzeDesignRealityBinding(root, [file]).findings).toContainEqual(
      expect.objectContaining({ reason: "implementation_identity_mismatch" }),
    );
  });

  it("U-DRB-005: identity解決後のcapability別検証とmutation Redを要求する", () => {
    const reachable = witness();
    expect(evaluateFailureWitness(reachable)).toBe("WORKER_DESCRIPTOR_CAPABILITY_MISMATCH");
    expect(evaluateFailureWitness(reachable, true)).toBe("OK");
  });

  it("U-DRB-006: 文言確認だけのoracleをreachability証拠にしない", () => {
    const { root, binding } = validFixture();
    writeFileSync(
      join(root, "tests/runtime.test.ts"),
      `import { expect, it } from "vitest";\nimport { resolveWorkerDescriptor } from "../src/runtime/worker";\nit("U-WDA-004: prose", () => { expect(resolveWorkerDescriptor).toContain("WORKER_DESCRIPTOR_CAPABILITY_MISMATCH"); });\n`,
    );
    const file = "docs/design/helix/L4-basic-design/reality.md";
    writeFileSync(join(root, file), design(binding));
    expect(analyzeDesignRealityBinding(root, [file]).findings).toContainEqual(
      expect.objectContaining({ reason: "prose_only_reachability" }),
    );
  });

  it("U-DRB-007: PLAN lintとdoctorが同じhard gateを共有する", () => {
    const { root, binding } = validFixture();
    const file = "docs/design/helix/L4-basic-design/reality.md";
    writeFileSync(join(root, file), design(binding));
    expect(lintPlanGate({ gate: "design-reality-binding", repoRoot: root }).ok).toBe(true);
    expect(checkDesignRealityBinding(root).ok).toBe(true);
    (binding.assets as Record<string, unknown>[])[0].source_digest = `sha256:${"0".repeat(64)}`;
    writeFileSync(join(root, file), design(binding));
    expect(lintPlanGate({ gate: "design-reality-binding", repoRoot: root }).ok).toBe(false);
    expect(checkDesignRealityBinding(root).ok).toBe(false);
  });

  it("U-DRB-008: plannedのstale分類とarchiveのcurrent昇格を拒否する", () => {
    const { root, binding } = validFixture();
    mkdirSync(join(root, "docs/archive"), { recursive: true });
    const legacy = "export function legacyResolver(): void {}\n";
    writeFileSync(join(root, "docs/archive/legacy.ts"), legacy);
    writeFileSync(join(root, "src/runtime/future.ts"), "export const future = true;\n");
    writeFileSync(
      join(root, "docs/plans/PLAN-L7-999-future.md"),
      "---\ngenerates:\n  - artifact_path: src/runtime/future.ts\n    artifact_type: source_module\n---\n",
    );
    binding.assets = [
      {
        asset_id: "future",
        classification: "planned_new",
        behavior_contract_id: "DRB-002",
        responsibility_owner: "future-owner",
        planned_artifact: "src/runtime/future.ts",
        downstream_plan: "docs/plans/PLAN-L7-999-future.md",
        current_runtime: false,
      },
      {
        asset_id: "legacy",
        classification: "existing_runtime",
        artifact_path: "docs/archive/legacy.ts",
        resource_kind: "typescript_export",
        resource_name: "legacyResolver",
        source_digest: sha256Digest(legacy),
        current_authority: true,
      },
    ];
    const file = "docs/design/helix/L4-basic-design/reality.md";
    writeFileSync(join(root, file), design(binding));
    expect(analyzeDesignRealityBinding(root, [file]).findings.map((item) => item.reason)).toEqual([
      "planned_asset_already_exists",
      "non_current_runtime_authority",
    ]);
  });
});
