import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const paths = {
  requirement: "docs/governance/helix-harness-requirements_v1.3.md",
  design: "docs/design/helix/L3-requirements/worker-common-contract.md",
  acceptance: "docs/test-design/helix/worker-common-contract-acceptance.md",
  plan: "docs/plans/PLAN-L3-18-worker-contract-benchmark-promotion.md",
  kimiPlan: "docs/plans/PLAN-DISCOVERY-13-kimi-worker-cli-poc.md",
  kimiEvidence: "docs/research/kimi-worker-cli-smoke-2026-07-20.md",
} as const;

const text = Object.fromEntries(
  Object.entries(paths).map(([key, path]) => [key, readFileSync(path, "utf8")]),
) as Record<keyof typeof paths, string>;

describe("L3 worker context authority", () => {
  it("binds the one new responsibility to WCC-FR-09 and its right-arm oracle", () => {
    expect(text.plan).toContain("behavior_contract_id: WCC-FR-09");
    expect(text.plan).toContain("responsibility_owner: worker-context-authority");
    expect(text.design).toContain("| `WCC-FR-09` | context |");
    expect(text.design).toContain("| `WCC-AC-07` | `WCC-FR-09` |");
    expect(text.acceptance).toContain("| `HAT-WCC-09` | `WCC-FR-09`, `WCC-AC-07` |");
    expect(text.requirement).toContain(
      "| `HR-FR-P2-05` | 外部AI workerはversioned descriptor、`worker-context-packet.v1`",
    );
  });

  it("requires the exact provider-neutral context fields and separate axes", () => {
    for (const field of [
      "schema_version: worker-context-packet.v1",
      "current_head:",
      "authority_digest:",
      "effective_rule_packet_digest:",
      "goal_id:",
      "workflow_style:",
      "case_model:",
      "specialist_process:",
      "behavior_contract_id:",
      "responsibility_owner:",
      "allowed_paths:",
      "forbidden_paths:",
      "severity_policy_digest:",
      "required_output_schema:",
      "time_ms:",
      "token_limit:",
      "role_judgment_digest:",
      "task_lens_digest:",
      "payload_digest:",
    ]) {
      expect(text.design, field).toContain(field);
    }
    expect(text.design).toContain(
      "`workflow_style`、`case_model`、`specialist_process`は直交field",
    );
  });

  it("fails closed on compatibility authority, missing boundaries, and payload drift", () => {
    for (const failure of [
      "compatibility/旧layer authority",
      "3軸混同",
      "budget 0",
      "scope外path",
      "digest drift",
    ]) {
      expect(text.acceptance, failure).toContain(failure);
    }
    expect(text.design).toContain("compatibility文書をhistorical fixtureとして参照できても");
    expect(text.design).toContain("current prompt authorityへ注入しない");
  });

  it("keeps Kimi S0-S4 on the case axis and outside Production Scrum", () => {
    for (const source of [text.kimiPlan, text.kimiEvidence]) {
      expect(source).toContain("Discovery／PoC case-driven model");
      expect(source).toContain("Production Scrum");
      expect(source).not.toContain("L12 Vモデル×スクラム");
      expect(source).not.toContain("スクラム軌道");
    }
  });
});
