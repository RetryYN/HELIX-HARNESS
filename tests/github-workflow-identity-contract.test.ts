import { describe, expect, it } from "vitest";
import {
  compareIssuePrWorkflowIdentityContracts,
  GITHUB_WORKFLOW_IDENTITY_CONTRACT_MARKER,
  GITHUB_WORKFLOW_IDENTITY_CONTRACT_SCHEMA,
  type GithubWorkflowIdentityContract,
  parseGithubWorkflowIdentityContract,
} from "../src/schema/github-workflow-identity-contract";
import {
  loadWorkflowClassificationCatalog,
  type WorkflowClassificationCatalog,
} from "../src/schema/workflow-classification-catalog";

// PLAN-L7-573-github-workflow-identity-ingest — U-GWID-001..005

function contractValue(catalog: WorkflowClassificationCatalog): GithubWorkflowIdentityContract {
  return {
    schema_version: GITHUB_WORKFLOW_IDENTITY_CONTRACT_SCHEMA,
    registry_version: catalog.source_registry.registry_version,
    registry_source_digest: catalog.source_registry.registry_source_digest,
    target_axis: "workflow_model",
    target_id: "VERSION_UP",
    signal_tokens: ["version_deferral"],
  };
}

function body(value: unknown): string {
  return [
    "## Workflow identity contract",
    GITHUB_WORKFLOW_IDENTITY_CONTRACT_MARKER,
    "```json",
    JSON.stringify(value),
    "```",
  ].join("\n");
}

describe("GitHub typed workflow identity contract", () => {
  const catalog = loadWorkflowClassificationCatalog(process.cwd());

  it("U-GWID-001: Issue／PRのstrict typed tupleをcurrent catalogへexact照合する", () => {
    const value = contractValue(catalog);
    expect(parseGithubWorkflowIdentityContract(body(value), catalog)).toEqual({
      ok: true,
      contract: value,
    });
  });

  it("U-GWID-002: marker欠落／重複／壊れたJSON／legacy identityを別reasonで拒否する", () => {
    expect(parseGithubWorkflowIdentityContract("no contract", catalog)).toMatchObject({
      ok: false,
      reason: "workflow_identity_contract_missing",
    });
    const validBody = body(contractValue(catalog));
    expect(
      parseGithubWorkflowIdentityContract(`${validBody}\n${validBody}`, catalog),
    ).toMatchObject({ ok: false, reason: "workflow_identity_contract_duplicate" });
    expect(
      parseGithubWorkflowIdentityContract(
        `${GITHUB_WORKFLOW_IDENTITY_CONTRACT_MARKER}\n\`\`\`json\n{\n\`\`\``,
        catalog,
      ),
    ).toMatchObject({ ok: false, reason: "workflow_identity_contract_json_invalid" });
    expect(
      parseGithubWorkflowIdentityContract(
        body({ ...contractValue(catalog), mode: "reverse", route_mode: "reverse" }),
        catalog,
      ),
    ).toMatchObject({
      ok: false,
      reason: "workflow_identity_contract_legacy_field_forbidden",
      detail: "mode,route_mode",
    });
    expect(
      parseGithubWorkflowIdentityContract(
        body({ ...contractValue(catalog), unexpected: true }),
        catalog,
      ),
    ).toMatchObject({ ok: false, reason: "workflow_identity_contract_schema_invalid" });
  });

  it("U-GWID-003: stale authority tupleと未知identityを推測せず拒否する", () => {
    expect(
      parseGithubWorkflowIdentityContract(
        body({ ...contractValue(catalog), registry_version: "9.9.9" }),
        catalog,
      ),
    ).toMatchObject({ ok: false, reason: "workflow_identity_contract_authority_drift" });
    expect(
      parseGithubWorkflowIdentityContract(
        body({
          ...contractValue(catalog),
          registry_source_digest: `sha256:${"0".repeat(64)}`,
        }),
        catalog,
      ),
    ).toMatchObject({ ok: false, reason: "workflow_identity_contract_authority_drift" });
    expect(
      parseGithubWorkflowIdentityContract(
        body({ ...contractValue(catalog), target_id: "UNKNOWN_WORKFLOW" }),
        catalog,
      ),
    ).toMatchObject({ ok: false, reason: "workflow_identity_contract_identity_unknown" });
  });

  it("U-GWID-004: signalのunknown／decision／ambiguity／identity矛盾を別reasonで閉じる", () => {
    expect(
      parseGithubWorkflowIdentityContract(
        body({ ...contractValue(catalog), signal_tokens: ["not_registered"] }),
        catalog,
      ),
    ).toMatchObject({ ok: false, reason: "workflow_identity_contract_signal_unknown" });
    expect(
      parseGithubWorkflowIdentityContract(
        body({ ...contractValue(catalog), signal_tokens: ["user_feedback_iteration"] }),
        catalog,
      ),
    ).toMatchObject({
      ok: false,
      reason: "workflow_identity_contract_signal_decision_required",
    });
    const ambiguousCatalog = {
      ...catalog,
      signal_bindings: [
        ...catalog.signal_bindings,
        { signals: ["version_deferral"], target_axis: "workflow_model", target_id: "REVERSE" },
      ],
    } as WorkflowClassificationCatalog;
    expect(
      parseGithubWorkflowIdentityContract(body(contractValue(catalog)), ambiguousCatalog),
    ).toMatchObject({ ok: false, reason: "workflow_identity_contract_signal_ambiguous" });
    expect(
      parseGithubWorkflowIdentityContract(
        body({ ...contractValue(catalog), signal_tokens: ["drift"] }),
        catalog,
      ),
    ).toMatchObject({ ok: false, reason: "workflow_identity_contract_signal_mismatch" });
  });

  it("U-GWID-006: signal mismatchは宣言target・解決target・許容signalを案内し判定は緩めない", () => {
    const mismatch = parseGithubWorkflowIdentityContract(
      body({
        ...contractValue(catalog),
        target_id: "REFACTOR",
        signal_tokens: ["regression_dev"],
      }),
      catalog,
    );
    expect(mismatch).toMatchObject({
      ok: false,
      reason: "workflow_identity_contract_signal_mismatch",
    });
    if (mismatch.ok) throw new Error("expected mismatch");
    expect(mismatch.detail).toContain("declared target_id=REFACTOR");
    expect(mismatch.detail).toContain('signal "regression_dev" resolves to RECOVERY');
    expect(mismatch.detail).toContain("either set target_id: RECOVERY");
    expect(mismatch.detail).toContain("use a REFACTOR signal");
    expect(mismatch.detail).toContain("debt_degradation");
    expect(mismatch.detail).toContain("code_smell");
    expect(mismatch.detail).toContain("structural");
  });

  it("U-GWID-007: marker欠落は対象IssueとAccepted formを示し、番号指定時はissue=#Nを含む", () => {
    const missing = parseGithubWorkflowIdentityContract("no contract", catalog);
    expect(missing).toMatchObject({ ok: false, reason: "workflow_identity_contract_missing" });
    if (missing.ok) throw new Error("expected missing");
    expect(missing.detail).toContain("marker absent");
    expect(missing.detail).toContain("PLAN github_issue_id");
    expect(missing.detail).toContain("Accepted form:");
    expect(missing.detail).toContain(GITHUB_WORKFLOW_IDENTITY_CONTRACT_MARKER);
    expect(missing.detail).toContain("schema_version");
    expect(missing.detail).toContain("target_id");

    const numbered = parseGithubWorkflowIdentityContract("no contract", catalog, {
      issueNumber: 153,
    });
    expect(numbered).toMatchObject({ ok: false, reason: "workflow_identity_contract_missing" });
    if (numbered.ok) throw new Error("expected missing");
    expect(numbered.detail).toContain("issue=#153");
    expect(numbered.detail).toContain("Accepted form:");
    expect(numbered.detail).toContain(GITHUB_WORKFLOW_IDENTITY_CONTRACT_MARKER);
  });

  it("U-GWID-005: IssueとPRの別identityを同一episodeとして受理しない", () => {
    const issue = contractValue(catalog);
    expect(compareIssuePrWorkflowIdentityContracts(issue, issue)).toEqual({
      ok: true,
      contract: issue,
    });
    const mismatches = [
      [{ registry_version: "9.9.9" }, "registry_version"],
      [{ registry_source_digest: `sha256:${"0".repeat(64)}` }, "registry_source_digest"],
      [{ target_axis: "case_driven_model" }, "target_axis"],
      [{ target_id: "REVERSE" }, "target_id"],
    ] as const;
    for (const [change, detail] of mismatches) {
      expect(compareIssuePrWorkflowIdentityContracts(issue, { ...issue, ...change })).toEqual({
        ok: false,
        reason: "workflow_identity_contract_issue_pr_mismatch",
        detail,
      });
    }
  });
});
