// PLAN-L7-574-github-workflow-identity-admission — U-GWIDADM-001..009
import { copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  admitGithubWorkflowIdentity,
  GITHUB_WORKFLOW_IDENTITY_CONTRACT_MARKER,
} from "../src/adapters/github-workflow-identity-admission";
import { loadWorkflowClassificationCatalog } from "../src/schema/workflow-classification-catalog";

const PLAN_PATH = "docs/plans/PLAN-L7-574-github-workflow-identity-admission.md";

function fixtureRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "helix-github-identity-admission-"));
  mkdirSync(join(root, "docs", "plans"), { recursive: true });
  mkdirSync(join(root, "docs", "design", "helix", "L3-requirements"), { recursive: true });
  mkdirSync(join(root, "docs", "governance"), { recursive: true });
  mkdirSync(join(root, "config"), { recursive: true });
  copyFileSync(
    "docs/design/helix/L3-requirements/workflow-classification-registry.v1.json",
    join(root, "docs/design/helix/L3-requirements/workflow-classification-registry.v1.json"),
  );
  copyFileSync(
    "config/workflow-classification-catalog.v1.json",
    join(root, "config/workflow-classification-catalog.v1.json"),
  );
  copyFileSync(
    "docs/governance/helix-harness-requirements_v1.3.md",
    join(root, "docs/governance/helix-harness-requirements_v1.3.md"),
  );
  return root;
}

function identity() {
  const catalog = loadWorkflowClassificationCatalog();
  return {
    schema_version: "helix-github-workflow-identity-contract.v1",
    registry_version: catalog.source_registry.registry_version,
    registry_source_digest: catalog.source_registry.registry_source_digest,
    target_axis: "workflow_model",
    target_id: "RETROFIT",
  } as const;
}

function contractBody(value = identity()): string {
  return `${GITHUB_WORKFLOW_IDENTITY_CONTRACT_MARKER}\n\`\`\`json\n${JSON.stringify(value)}\n\`\`\``;
}

function writePlan(
  root: string,
  options: { issue?: number; targetId?: string; path?: string } = {},
) {
  const value = identity();
  const path = options.path ?? PLAN_PATH;
  writeFileSync(
    join(root, path),
    `---\nplan_id: PLAN-L7-574-github-workflow-identity-admission\ngithub_issue_id: ${options.issue ?? 733}\nworkflow_identity:\n  schema_version: helix-plan-workflow-identity.v1\n  registry_version: ${value.registry_version}\n  registry_source_digest: ${value.registry_source_digest}\n  target_axis: workflow_model\n  target_id: ${options.targetId ?? "RETROFIT"}\n---\n`,
  );
}

describe("GitHub workflow identity admission", () => {
  it("U-GWIDADM-001: PLAN issue authorityとIssue／PR／PLAN tupleのexact一致だけを受理する", () => {
    const root = fixtureRoot();
    writePlan(root, { issue: 733 });
    const endpoints: string[] = [];
    const result = admitGithubWorkflowIdentity({
      repository: "RetryYN/HELIX-HARNESS",
      prBody: `${contractBody()}\nRefs #999`,
      changedPaths: [PLAN_PATH],
      repoRoot: root,
      ghApi: (endpoint) => {
        endpoints.push(endpoint);
        return { number: 733, body: contractBody() };
      },
    });
    expect(result).toMatchObject({
      ok: true,
      applicable: true,
      source_issue: 733,
      target_axis: "workflow_model",
      target_id: "RETROFIT",
    });
    expect(endpoints).toEqual(["repos/RetryYN/HELIX-HARNESS/issues/733"]);
  });

  it("U-GWIDADM-002: current typed PLANがないlegacy sliceだけを非適用にする", () => {
    expect(
      admitGithubWorkflowIdentity({
        repository: "RetryYN/HELIX-HARNESS",
        prBody: "legacy",
        changedPaths: ["README.md"],
        ghApi: () => {
          throw new Error("must not fetch GitHub");
        },
      }),
    ).toEqual({ ok: true, applicable: false, reason: "legacy_plan_without_typed_identity" });
  });

  it("U-GWIDADM-003: 複数typed PLANを原子的slice違反として拒否する", () => {
    const root = fixtureRoot();
    const second = "docs/plans/PLAN-L7-575-second.md";
    writePlan(root);
    writePlan(root, { path: second });
    expect(
      admitGithubWorkflowIdentity({
        repository: "RetryYN/HELIX-HARNESS",
        prBody: contractBody(),
        changedPaths: [PLAN_PATH, second],
        repoRoot: root,
      }),
    ).toMatchObject({ ok: false, reason: "workflow_identity_admission_multiple_plans" });
  });

  it("U-GWIDADM-004: PR marker欠落とIssue legacy fieldを別reasonでfail-closeする", () => {
    const root = fixtureRoot();
    writePlan(root);
    const base = {
      repository: "RetryYN/HELIX-HARNESS",
      changedPaths: [PLAN_PATH],
      repoRoot: root,
    };
    expect(
      admitGithubWorkflowIdentity({
        ...base,
        prBody: "missing",
        ghApi: () => ({ number: 733, body: contractBody() }),
      }),
    ).toMatchObject({ ok: false, reason: "workflow_identity_contract_missing" });
    expect(
      admitGithubWorkflowIdentity({
        ...base,
        prBody: contractBody(),
        ghApi: () => ({
          number: 733,
          body: contractBody({ ...identity(), mode: "reverse" } as never),
        }),
      }),
    ).toMatchObject({ ok: false, reason: "workflow_identity_contract_legacy_field_forbidden" });
  });

  it("U-GWIDADM-005: Issue／PR一致でもPLAN tupleとの不一致を拒否する", () => {
    const root = fixtureRoot();
    writePlan(root, { targetId: "RECOVERY" });
    expect(
      admitGithubWorkflowIdentity({
        repository: "RetryYN/HELIX-HARNESS",
        prBody: contractBody(),
        changedPaths: [PLAN_PATH],
        repoRoot: root,
        ghApi: () => ({ number: 733, body: contractBody() }),
      }),
    ).toMatchObject({ ok: false, reason: "workflow_identity_admission_plan_mismatch" });
  });

  it("U-GWIDADM-006: PLAN／GitHub／registry I/O failureを例外透過せず別reasonで閉じる", () => {
    const root = fixtureRoot();
    expect(
      admitGithubWorkflowIdentity({
        repository: "RetryYN/HELIX-HARNESS",
        prBody: contractBody(),
        changedPaths: [PLAN_PATH],
        repoRoot: root,
      }),
    ).toMatchObject({ ok: false, reason: "workflow_identity_admission_plan_invalid" });

    writePlan(root);
    expect(
      admitGithubWorkflowIdentity({
        repository: "RetryYN/HELIX-HARNESS",
        prBody: contractBody(),
        changedPaths: [PLAN_PATH],
        repoRoot: root,
        ghApi: () => {
          throw new Error("GitHub unavailable");
        },
      }),
    ).toMatchObject({ ok: false, reason: "workflow_identity_admission_issue_invalid" });

    writeFileSync(join(root, "config", "workflow-classification-catalog.v1.json"), "{}");
    expect(
      admitGithubWorkflowIdentity({
        repository: "RetryYN/HELIX-HARNESS",
        prBody: contractBody(),
        changedPaths: [PLAN_PATH],
        repoRoot: root,
        ghApi: () => ({ number: 733, body: contractBody() }),
      }),
    ).toMatchObject({ ok: false, reason: "workflow_identity_admission_authority_invalid" });
  });

  it("U-GWIDADM-009: github_issue_idがPR resourceまたは別番号を返した場合はIssue authorityとして受理しない", () => {
    const root = fixtureRoot();
    writePlan(root);
    const base = {
      repository: "RetryYN/HELIX-HARNESS",
      prBody: contractBody(),
      changedPaths: [PLAN_PATH],
      repoRoot: root,
    };
    expect(
      admitGithubWorkflowIdentity({
        ...base,
        ghApi: () => ({ number: 733, body: contractBody(), pull_request: { url: "pr" } }),
      }),
    ).toMatchObject({ ok: false, reason: "workflow_identity_admission_issue_invalid" });
    expect(
      admitGithubWorkflowIdentity({
        ...base,
        ghApi: () => ({ number: 999, body: contractBody() }),
      }),
    ).toMatchObject({ ok: false, reason: "workflow_identity_admission_issue_invalid" });
  });
});
