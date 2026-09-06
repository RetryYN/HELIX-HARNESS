// PLAN-L7-574-github-workflow-identity-admission — U-GWIDADM-001..009
// PLAN-L7-581-github-workflow-identity-migration-bundle-admission — U-GWIDADM-011..016
// PLAN-L7-674-terminal-fullback-bundle-admission — U-GWIDADM-019..020
// PLAN-L7-681-github-identity-source-diagnostics — U-GWIDADM-021
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  admitGithubWorkflowIdentity,
  GITHUB_WORKFLOW_IDENTITY_CONTRACT_MARKER,
  GITHUB_WORKFLOW_IDENTITY_MIGRATION_BUNDLE_MARKER,
  GITHUB_WORKFLOW_IDENTITY_TERMINAL_BUNDLE_MARKER,
  readExplicitBasePlanSource,
} from "../src/adapters/github-workflow-identity-admission";
import { analyzePrContext } from "../src/lint/github-guards";
import { loadWorkflowClassificationCatalog } from "../src/schema/workflow-classification-catalog";

const PLAN_PATH = "docs/plans/PLAN-L7-574-github-workflow-identity-admission.md";

function fixtureRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "helix-github-identity-admission-"));
  mkdirSync(join(root, "docs", "plans"), { recursive: true });
  mkdirSync(join(root, "docs", "design", "helix", "L3-requirements"), {
    recursive: true,
  });
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

function contractBody(value: unknown = identity()): string {
  return `${GITHUB_WORKFLOW_IDENTITY_CONTRACT_MARKER}\n\`\`\`json\n${JSON.stringify(value)}\n\`\`\``;
}

function migrationBundleBody(planPaths: string[], ownerPlan = PLAN_PATH): string {
  return `${contractBody()}\n${GITHUB_WORKFLOW_IDENTITY_MIGRATION_BUNDLE_MARKER}\n\`\`\`json\n${JSON.stringify(
    {
      schema_version: "helix-github-workflow-identity-migration-bundle.v1",
      owner_plan: ownerPlan,
      plan_paths: planPaths,
    },
  )}\n\`\`\``;
}

function terminalBundleBody(planPaths: string[], ownerPlan = PLAN_PATH): string {
  return `${contractBody()}
${GITHUB_WORKFLOW_IDENTITY_TERMINAL_BUNDLE_MARKER}
\`\`\`json
${JSON.stringify({
  schema_version: "helix-github-workflow-identity-terminal-bundle.v1",
  owner_plan: ownerPlan,
  plan_paths: planPaths,
})}
\`\`\``;
}

function writePlan(
  root: string,
  options: {
    issue?: number;
    targetId?: string;
    path?: string;
    identitySchema?: string;
    identityExtra?: string;
    registryDigest?: string;
    registryVersion?: string;
  } = {},
) {
  const value = identity();
  const path = options.path ?? PLAN_PATH;
  writeFileSync(
    join(root, path),
    `---\nplan_id: PLAN-L7-574-github-workflow-identity-admission\ngithub_issue_id: ${options.issue ?? 733}\nworkflow_identity:\n  schema_version: ${options.identitySchema ?? "helix-plan-workflow-identity.v1"}\n  registry_version: ${options.registryVersion ?? value.registry_version}\n  registry_source_digest: ${options.registryDigest ?? value.registry_source_digest}\n  target_axis: workflow_model\n  target_id: ${options.targetId ?? "RETROFIT"}\n${options.identityExtra ?? ""}---\n`,
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
    ).toEqual({
      ok: true,
      applicable: false,
      reason: "legacy_plan_without_typed_identity",
    });
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
    ).toMatchObject({
      ok: false,
      reason: "workflow_identity_admission_multiple_plans",
    });
  });

  it("U-GWIDADM-011: requirements registry migrationだけをexact PLAN bundleとして受理する", () => {
    const root = fixtureRoot();
    const second = "docs/plans/PLAN-L7-575-second.md";
    writePlan(root, { targetId: "VERSION_UP" });
    writePlan(root, { path: second, targetId: "RECOVERY" });
    const paths = [PLAN_PATH, second];
    const ownerIdentity = { ...identity(), target_id: "VERSION_UP" } as const;
    const result = admitGithubWorkflowIdentity({
      repository: "RetryYN/HELIX-HARNESS",
      prBody: `${contractBody(ownerIdentity)}\n${migrationBundleBody(paths).split("\n").slice(3).join("\n")}`,
      changedPaths: [
        ...paths,
        "docs/design/helix/L3-requirements/workflow-classification-registry.v1.json",
        "config/workflow-classification-catalog.v1.json",
      ],
      repoRoot: root,
      ghApi: () => ({ number: 733, body: contractBody(ownerIdentity) }),
    });
    expect(result).toMatchObject({
      ok: true,
      applicable: true,
      plan_id: "PLAN-L7-574-github-workflow-identity-admission",
      migration_bundle: true,
    });
  });

  it("U-GWIDADM-012: bundle manifest／owner／authority pathの不一致をfail-closeする", () => {
    const second = "docs/plans/PLAN-L7-575-second.md";
    for (const variant of ["manifest_mismatch", "wrong_owner", "missing_registry"] as const) {
      const root = fixtureRoot();
      writePlan(root);
      writePlan(root, { path: second, targetId: "RECOVERY" });
      const actual = [PLAN_PATH, second];
      const manifest =
        variant === "manifest_mismatch"
          ? [PLAN_PATH, "docs/plans/PLAN-L7-999-manifest-only.md"]
          : actual;
      const body = migrationBundleBody(
        manifest,
        variant === "wrong_owner" ? "docs/plans/PLAN-L7-999-absent.md" : PLAN_PATH,
      );
      const changedPaths = [
        ...actual,
        ...(variant === "missing_registry"
          ? ["config/workflow-classification-catalog.v1.json"]
          : [
              "docs/design/helix/L3-requirements/workflow-classification-registry.v1.json",
              "config/workflow-classification-catalog.v1.json",
            ]),
      ];
      expect(
        admitGithubWorkflowIdentity({
          repository: "RetryYN/HELIX-HARNESS",
          prBody: body,
          changedPaths,
          repoRoot: root,
          ghApi: () => ({ number: 733, body: contractBody() }),
        }),
      ).toMatchObject({
        ok: false,
        reason: {
          manifest_mismatch: "workflow_identity_admission_bundle_path_mismatch",
          wrong_owner: "workflow_identity_admission_bundle_owner_invalid",
          missing_registry: "workflow_identity_admission_bundle_authority_path_missing",
        }[variant],
      });
    }
  });

  it("U-GWIDADM-013: bundle内の旧digest混在と未知identityを拒否する", () => {
    const second = "docs/plans/PLAN-L7-575-second.md";
    for (const variant of ["stale_digest", "unknown_identity"] as const) {
      const root = fixtureRoot();
      writePlan(root, { targetId: "VERSION_UP" });
      writePlan(root, {
        path: second,
        targetId: variant === "unknown_identity" ? "NOT_REGISTERED" : "RECOVERY",
        registryDigest: variant === "stale_digest" ? `sha256:${"0".repeat(64)}` : undefined,
      });
      const paths = [PLAN_PATH, second];
      const ownerIdentity = { ...identity(), target_id: "VERSION_UP" } as const;
      const body = `${contractBody(ownerIdentity)}\n${migrationBundleBody(paths).split("\n").slice(3).join("\n")}`;
      expect(
        admitGithubWorkflowIdentity({
          repository: "RetryYN/HELIX-HARNESS",
          prBody: body,
          changedPaths: [
            ...paths,
            "docs/design/helix/L3-requirements/workflow-classification-registry.v1.json",
            "config/workflow-classification-catalog.v1.json",
          ],
          repoRoot: root,
          ghApi: () => ({ number: 733, body: contractBody(ownerIdentity) }),
        }),
      ).toMatchObject({
        ok: false,
        reason: "workflow_identity_admission_bundle_identity_mismatch",
      });
    }
  });

  it("U-GWIDADM-014: non-typed PLAN、marker構文、owner、version、authority片側欠落を拒否する", () => {
    const second = "docs/plans/PLAN-L7-575-second.md";
    const authority = [
      "docs/design/helix/L3-requirements/workflow-classification-registry.v1.json",
      "config/workflow-classification-catalog.v1.json",
    ];
    {
      const root = fixtureRoot();
      writePlan(root, { targetId: "VERSION_UP" });
      writeFileSync(join(root, second), "---\nplan_id: legacy\ngithub_issue_id: 733\n---\n");
      const ownerIdentity = { ...identity(), target_id: "VERSION_UP" } as const;
      expect(
        admitGithubWorkflowIdentity({
          repository: "RetryYN/HELIX-HARNESS",
          prBody: `${contractBody(ownerIdentity)}\n${migrationBundleBody([PLAN_PATH, second]).split("\n").slice(3).join("\n")}`,
          changedPaths: [PLAN_PATH, second, ...authority],
          repoRoot: root,
        }),
      ).toMatchObject({
        ok: false,
        reason: "workflow_identity_admission_bundle_identity_mismatch",
      });
    }
    for (const variant of [
      "duplicate_marker",
      "unsorted",
      "owner_not_version_up",
      "stale_version",
      "missing_catalog",
    ] as const) {
      const root = fixtureRoot();
      writePlan(root, {
        targetId: variant === "owner_not_version_up" ? "RETROFIT" : "VERSION_UP",
      });
      writePlan(root, {
        path: second,
        targetId: "RECOVERY",
        registryVersion: variant === "stale_version" ? "0.0.1" : undefined,
      });
      const paths = [PLAN_PATH, second];
      const ownerIdentity = {
        ...identity(),
        target_id: variant === "owner_not_version_up" ? "RETROFIT" : "VERSION_UP",
      } as const;
      let body = `${contractBody(ownerIdentity)}\n${migrationBundleBody(
        variant === "unsorted" ? [...paths].reverse() : paths,
      )
        .split("\n")
        .slice(3)
        .join("\n")}`;
      if (variant === "duplicate_marker")
        body += `\n${GITHUB_WORKFLOW_IDENTITY_MIGRATION_BUNDLE_MARKER}`;
      expect(
        admitGithubWorkflowIdentity({
          repository: "RetryYN/HELIX-HARNESS",
          prBody: body,
          changedPaths: [
            ...paths,
            ...(variant === "missing_catalog" ? authority.slice(0, 1) : authority),
          ],
          repoRoot: root,
          ghApi: () => ({ number: 733, body: contractBody(ownerIdentity) }),
        }),
      ).toMatchObject({
        ok: false,
        reason: {
          duplicate_marker: "workflow_identity_admission_bundle_contract_invalid",
          unsorted: "workflow_identity_admission_bundle_contract_invalid",
          owner_not_version_up: "workflow_identity_admission_bundle_owner_invalid",
          stale_version: "workflow_identity_admission_bundle_identity_mismatch",
          missing_catalog: "workflow_identity_admission_bundle_authority_path_missing",
        }[variant],
      });
    }
  });

  it("U-GWIDADM-019: terminal fullback bundleは異なるtyped identityを潰さずに受理する", () => {
    const root = fixtureRoot();
    const forward = PLAN_PATH;
    const reverse = "docs/plans/PLAN-REVERSE-568-issue-template-label-typed-authority.md";
    const ownerIdentity = { ...identity(), target_id: "ADD_FEATURE" } as const;
    writePlan(root, { targetId: "ADD_FEATURE" });
    writePlan(root, { path: reverse, targetId: "REVERSE" });
    const paths = [forward, reverse].sort();
    const result = admitGithubWorkflowIdentity({
      repository: "RetryYN/HELIX-HARNESS",
      prBody: terminalBundleBody(paths, forward).replace(
        contractBody(),
        contractBody(ownerIdentity),
      ),
      changedPaths: paths,
      repoRoot: root,
      ghApi: () => ({ number: 733, body: contractBody(ownerIdentity) }),
    });
    expect(result).toMatchObject({
      ok: true,
      applicable: true,
      plan_id: "PLAN-L7-574-github-workflow-identity-admission",
      target_axis: "workflow_model",
      target_id: "ADD_FEATURE",
      terminal_bundle: true,
    });
  });

  it("U-GWIDADM-020: terminal bundleのmanifest、owner、digest、identity、Issue、marker混同を拒否する", () => {
    const forward = PLAN_PATH;
    const reverse = "docs/plans/PLAN-REVERSE-568-issue-template-label-typed-authority.md";
    const extra = "docs/plans/PLAN-L7-999-terminal-bundle-extra.md";
    const paths = [forward, reverse].sort();
    const ownerIdentity = { ...identity(), target_id: "ADD_FEATURE" } as const;
    for (const variant of [
      "duplicate_marker",
      "unsorted",
      "owner_missing",
      "stale_digest",
      "unknown_identity",
      "issue_mismatch",
      "manifest_omission",
      "untyped_plan",
      "migration_marker",
    ] as const) {
      const root = fixtureRoot();
      writePlan(root, { targetId: "ADD_FEATURE" });
      writePlan(root, {
        path: reverse,
        issue: variant === "issue_mismatch" ? 734 : 733,
        targetId: variant === "unknown_identity" ? "NOT_REGISTERED" : "REVERSE",
        registryDigest: variant === "stale_digest" ? `sha256:${"0".repeat(64)}` : undefined,
      });
      if (variant === "manifest_omission") {
        writePlan(root, { path: extra, targetId: "REVERSE" });
      }
      if (variant === "untyped_plan") {
        writeFileSync(
          join(root, extra),
          "---\nplan_id: PLAN-L7-999-terminal-bundle-extra\ngithub_issue_id: 733\n---\n",
        );
      }
      const manifestPaths = variant === "untyped_plan" ? [...paths, extra].sort() : paths;
      const changedPaths =
        variant === "manifest_omission" || variant === "untyped_plan"
          ? [...paths, extra].sort()
          : paths;
      let body = terminalBundleBody(
        variant === "unsorted" ? [...paths].reverse() : manifestPaths,
        variant === "owner_missing" ? "docs/plans/PLAN-L7-999-missing.md" : forward,
      ).replace(contractBody(), contractBody(ownerIdentity));
      if (variant === "duplicate_marker")
        body += `\n${GITHUB_WORKFLOW_IDENTITY_TERMINAL_BUNDLE_MARKER}`;
      if (variant === "migration_marker")
        body += `\n${GITHUB_WORKFLOW_IDENTITY_MIGRATION_BUNDLE_MARKER}`;
      expect(
        admitGithubWorkflowIdentity({
          repository: "RetryYN/HELIX-HARNESS",
          prBody: body,
          changedPaths,
          repoRoot: root,
          ghApi: () => ({ number: 733, body: contractBody(ownerIdentity) }),
        }),
      ).toMatchObject({
        ok: false,
        reason: {
          duplicate_marker: "workflow_identity_admission_bundle_contract_invalid",
          unsorted: "workflow_identity_admission_bundle_contract_invalid",
          owner_missing: "workflow_identity_admission_bundle_owner_invalid",
          stale_digest: "workflow_identity_admission_bundle_identity_mismatch",
          unknown_identity: "workflow_identity_admission_bundle_identity_mismatch",
          issue_mismatch: "workflow_identity_admission_bundle_issue_mismatch",
          manifest_omission: "workflow_identity_admission_bundle_path_mismatch",
          untyped_plan: "workflow_identity_admission_bundle_identity_mismatch",
          migration_marker: "workflow_identity_admission_bundle_contract_invalid",
        }[variant],
      });
    }
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
    ).toMatchObject({
      ok: false,
      reason: "pr_workflow_identity_contract_missing",
    });
    expect(
      admitGithubWorkflowIdentity({
        ...base,
        prBody: contractBody(),
        ghApi: () => ({
          number: 733,
          body: contractBody({ ...identity(), mode: "reverse" } as never),
        }),
      }),
    ).toMatchObject({
      ok: false,
      reason: "issue_workflow_identity_contract_legacy_field_forbidden",
    });
  });

  it("U-GWIDADM-021: Issue／PR contract parser failureをsurface別reasonへ写像する", () => {
    const root = fixtureRoot();
    writePlan(root);
    const valid = contractBody();
    const parserFailures = [
      ["workflow_identity_contract_missing", "missing"],
      ["workflow_identity_contract_duplicate", `${valid}\n${valid}`],
      [
        "workflow_identity_contract_json_invalid",
        `${GITHUB_WORKFLOW_IDENTITY_CONTRACT_MARKER}\n${"```"}json\n{\n${"```"}`,
      ],
      [
        "workflow_identity_contract_schema_invalid",
        contractBody({ ...identity(), unexpected: true }),
      ],
      [
        "workflow_identity_contract_legacy_field_forbidden",
        contractBody({ ...identity(), mode: "reverse" }),
      ],
      [
        "workflow_identity_contract_authority_drift",
        contractBody({ ...identity(), registry_version: "9.9.9" }),
      ],
      [
        "workflow_identity_contract_identity_unknown",
        contractBody({ ...identity(), target_id: "NOT_REGISTERED" }),
      ],
      [
        "workflow_identity_contract_signal_unknown",
        contractBody({ ...identity(), signal_tokens: ["not_registered"] }),
      ],
      [
        "workflow_identity_contract_signal_decision_required",
        contractBody({ ...identity(), signal_tokens: ["user_feedback_iteration"] }),
      ],
      [
        "workflow_identity_contract_signal_mismatch",
        contractBody({ ...identity(), signal_tokens: ["drift"] }),
      ],
    ] as const;

    for (const [genericReason, failureBody] of parserFailures) {
      expect(
        admitGithubWorkflowIdentity({
          repository: "RetryYN/HELIX-HARNESS",
          prBody: valid,
          changedPaths: [PLAN_PATH],
          repoRoot: root,
          ghApi: () => ({ number: 733, body: failureBody }),
        }),
      ).toMatchObject({
        ok: false,
        reason: `issue_${genericReason}`,
      });

      expect(
        admitGithubWorkflowIdentity({
          repository: "RetryYN/HELIX-HARNESS",
          prBody: failureBody,
          changedPaths: [PLAN_PATH],
          repoRoot: root,
          ghApi: () => ({ number: 733, body: valid }),
        }),
      ).toMatchObject({
        ok: false,
        reason: `pr_${genericReason}`,
      });
    }
  });

  it("Issue／PR contractのtuple mismatchは両面由来のcomparison reasonを維持する", () => {
    const root = fixtureRoot();
    writePlan(root);
    expect(
      admitGithubWorkflowIdentity({
        repository: "RetryYN/HELIX-HARNESS",
        prBody: contractBody({ ...identity(), target_id: "RECOVERY" }),
        changedPaths: [PLAN_PATH],
        repoRoot: root,
        ghApi: () => ({ number: 733, body: contractBody() }),
      }),
    ).toMatchObject({
      ok: false,
      reason: "workflow_identity_contract_issue_pr_mismatch",
    });
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
    ).toMatchObject({
      ok: false,
      reason: "workflow_identity_admission_plan_mismatch",
    });
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
    ).toMatchObject({
      ok: false,
      reason: "workflow_identity_admission_plan_invalid",
    });

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
    ).toMatchObject({
      ok: false,
      reason: "workflow_identity_admission_issue_api_failed",
    });

    writeFileSync(join(root, "config", "workflow-classification-catalog.v1.json"), "{}");
    expect(
      admitGithubWorkflowIdentity({
        repository: "RetryYN/HELIX-HARNESS",
        prBody: contractBody(),
        changedPaths: [PLAN_PATH],
        repoRoot: root,
        ghApi: () => ({ number: 733, body: contractBody() }),
      }),
    ).toMatchObject({
      ok: false,
      reason: "workflow_identity_admission_authority_invalid",
    });
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
        ghApi: () => ({
          number: 733,
          body: contractBody(),
          pull_request: { url: "pr" },
        }),
      }),
    ).toMatchObject({
      ok: false,
      reason: "workflow_identity_admission_issue_invalid",
    });
    expect(
      admitGithubWorkflowIdentity({
        ...base,
        ghApi: () => ({ number: 999, body: contractBody() }),
      }),
    ).toMatchObject({
      ok: false,
      reason: "workflow_identity_admission_issue_invalid",
    });
  });

  it("U-GWIDADM-010: PLAN identityの誤schema versionと余剰legacy fieldをstrict拒否する", () => {
    for (const options of [
      { identitySchema: "helix-plan-workflow-identity.v0" },
      { identityExtra: "  mode: reverse\n" },
    ]) {
      const root = fixtureRoot();
      writePlan(root, options);
      expect(
        admitGithubWorkflowIdentity({
          repository: "RetryYN/HELIX-HARNESS",
          prBody: contractBody(),
          changedPaths: [PLAN_PATH],
          repoRoot: root,
        }),
      ).toMatchObject({
        ok: false,
        reason: "workflow_identity_admission_plan_invalid",
      });
    }
  });

  it("U-GWIDADM-015: strict migration bundleは列挙済みforeign PLANの契約を保持して受理する", () => {
    const ownerPlan =
      "docs/plans/PLAN-L7-581-github-workflow-identity-migration-bundle-admission.md";
    const foreignPlan = "docs/plans/PLAN-REVERSE-568-issue-template-label-typed-authority.md";
    const source = "src/lint/github-guards.ts";
    const test = "tests/github-workflow-identity-admission.test.ts";
    const body = [
      "Behavior contract: GWID-MIGRATION-BUNDLE-001",
      "Responsibility owner: github-workflow-identity-admission",
      `Allowed path families: ${source}, ${test}, docs/plans/`,
      `Expected changed paths: ${ownerPlan}, ${foreignPlan}, ${source}, ${test}`,
      `Required companion paths: ${foreignPlan}, ${ownerPlan}, ${test}`,
      "Scope expansion: none",
      GITHUB_WORKFLOW_IDENTITY_MIGRATION_BUNDLE_MARKER,
      "```json",
      JSON.stringify({
        schema_version: "helix-github-workflow-identity-migration-bundle.v1",
        owner_plan: ownerPlan,
        plan_paths: [ownerPlan, foreignPlan].sort(),
      }),
      "```",
    ].join("\n");
    const result = analyzePrContext({
      eventName: "pull_request",
      headBranch: "version-up/security-authority",
      baseBranch: "main",
      body,
      changedPaths: [foreignPlan, ownerPlan, source, test],
      planContracts: [
        {
          path: ownerPlan,
          behaviorContractId: "GWID-MIGRATION-BUNDLE-001",
          responsibilityOwner: "github-workflow-identity-admission",
        },
        {
          path: foreignPlan,
          behaviorContractId: "ISSUE-TEMPLATE-LABEL-TYPED-AUTHORITY-001",
          responsibilityOwner: "issue-template-label-typed-authority",
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it("U-GWIDADM-017: migration bundleのowner PLAN契約不一致をfail-closeする", () => {
    const ownerPlan =
      "docs/plans/PLAN-L7-581-github-workflow-identity-migration-bundle-admission.md";
    const foreignPlan = "docs/plans/PLAN-REVERSE-568-issue-template-label-typed-authority.md";
    const source = "src/lint/github-guards.ts";
    const test = "tests/github-workflow-identity-admission.test.ts";
    const body = [
      "Behavior contract: GWID-MIGRATION-BUNDLE-001",
      "Responsibility owner: github-workflow-identity-admission",
      `Allowed path families: ${source}, ${test}, docs/plans/`,
      `Expected changed paths: ${ownerPlan}, ${foreignPlan}, ${source}, ${test}`,
      `Required companion paths: ${foreignPlan}, ${ownerPlan}, ${test}`,
      "Scope expansion: none",
      GITHUB_WORKFLOW_IDENTITY_MIGRATION_BUNDLE_MARKER,
      "```json",
      JSON.stringify({
        schema_version: "helix-github-workflow-identity-migration-bundle.v1",
        owner_plan: ownerPlan,
        plan_paths: [ownerPlan, foreignPlan].sort(),
      }),
      "```",
    ].join("\n");
    const result = analyzePrContext({
      eventName: "pull_request",
      headBranch: "version-up/security-authority",
      baseBranch: "main",
      body,
      changedPaths: [foreignPlan, ownerPlan, source, test],
      planContracts: [
        {
          path: ownerPlan,
          behaviorContractId: "OTHER-CONTRACT-001",
          responsibilityOwner: "other-owner",
        },
        {
          path: foreignPlan,
          behaviorContractId: "ISSUE-TEMPLATE-LABEL-TYPED-AUTHORITY-001",
          responsibilityOwner: "issue-template-label-typed-authority",
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "pr_scope_plan_contract_mismatch" }),
    );
  });

  it("U-GWIDADM-018: migration bundleのforeign PLAN契約欠落をfail-closeする", () => {
    const ownerPlan =
      "docs/plans/PLAN-L7-581-github-workflow-identity-migration-bundle-admission.md";
    const foreignPlan = "docs/plans/PLAN-REVERSE-568-issue-template-label-typed-authority.md";
    const source = "src/lint/github-guards.ts";
    const test = "tests/github-workflow-identity-admission.test.ts";
    const body = [
      "Behavior contract: GWID-MIGRATION-BUNDLE-001",
      "Responsibility owner: github-workflow-identity-admission",
      `Allowed path families: ${source}, ${test}, docs/plans/`,
      `Expected changed paths: ${ownerPlan}, ${foreignPlan}, ${source}, ${test}`,
      `Required companion paths: ${foreignPlan}, ${ownerPlan}, ${test}`,
      "Scope expansion: none",
      GITHUB_WORKFLOW_IDENTITY_MIGRATION_BUNDLE_MARKER,
      "```json",
      JSON.stringify({
        schema_version: "helix-github-workflow-identity-migration-bundle.v1",
        owner_plan: ownerPlan,
        plan_paths: [ownerPlan, foreignPlan].sort(),
      }),
      "```",
    ].join("\n");
    const result = analyzePrContext({
      eventName: "pull_request",
      headBranch: "version-up/security-authority",
      baseBranch: "main",
      body,
      changedPaths: [foreignPlan, ownerPlan, source, test],
      planContracts: [
        {
          path: ownerPlan,
          behaviorContractId: "GWID-MIGRATION-BUNDLE-001",
          responsibilityOwner: "github-workflow-identity-admission",
        },
        {
          path: foreignPlan,
          behaviorContractId: null,
          responsibilityOwner: null,
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "pr_scope_plan_contract_mismatch" }),
    );
  });

  it("U-GWIDADM-016: marker外のforeign PLANは通常どおりfail-closeする", () => {
    const ownerPlan = "docs/plans/PLAN-L7-581.md";
    const foreignPlan = "docs/plans/PLAN-REVERSE-568.md";
    const test = "tests/github-workflow-identity-admission.test.ts";
    const result = analyzePrContext({
      eventName: "pull_request",
      headBranch: "feature/authority",
      baseBranch: "main",
      body: [
        "Behavior contract: GWID-MIGRATION-BUNDLE-001",
        "Responsibility owner: github-workflow-identity-admission",
        "Allowed path families: docs/plans/, tests/",
        `Expected changed paths: ${ownerPlan}, ${foreignPlan}, ${test}`,
        `Required companion paths: ${ownerPlan}, ${foreignPlan}, ${test}`,
        "Scope expansion: none",
      ].join("\n"),
      changedPaths: [ownerPlan, foreignPlan, test],
      planContracts: [
        {
          path: ownerPlan,
          behaviorContractId: "GWID-MIGRATION-BUNDLE-001",
          responsibilityOwner: "github-workflow-identity-admission",
        },
        {
          path: foreignPlan,
          behaviorContractId: "ISSUE-TEMPLATE-LABEL-TYPED-AUTHORITY-001",
          responsibilityOwner: "issue-template-label-typed-authority",
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "pr_scope_plan_contract_mismatch" }),
    );
  });

  // PLAN-RECOVERY-1543-reviewer-session-model-history — U-GWIDADM-022
  it("U-GWIDADM-022: superseded_by だけを受け取る既存 PLAN は slice 所有者に数えず、successor 1 本を受理する", () => {
    const root = fixtureRoot();
    const superseded = "docs/plans/PLAN-L7-575-superseded.md";
    writePlan(root);
    writePlan(root, { path: superseded, targetId: "RECOVERY" });
    const baseSource = readFileSync(join(root, superseded), "utf8");
    // 既存 PLAN へ frontmatter の superseded_by だけを追加した状態を current にする。
    writeFileSync(
      join(root, superseded),
      baseSource.replace(
        "plan_id: PLAN-L7-574-github-workflow-identity-admission\n",
        "plan_id: PLAN-L7-574-github-workflow-identity-admission\nsuperseded_by: [PLAN-L7-574-github-workflow-identity-admission]\n",
      ),
    );
    const basePlanSource = (path: string) => (path === superseded ? baseSource : null);
    const endpoints: string[] = [];
    const result = admitGithubWorkflowIdentity({
      repository: "RetryYN/HELIX-HARNESS",
      prBody: contractBody(),
      changedPaths: [PLAN_PATH, superseded],
      repoRoot: root,
      basePlanSource,
      ghApi: (endpoint) => {
        endpoints.push(endpoint);
        return { number: 733, body: contractBody() };
      },
    });
    expect(result).toMatchObject({
      ok: true,
      applicable: true,
      plan_id: "PLAN-L7-574-github-workflow-identity-admission",
    });
    expect(endpoints).toEqual(["repos/RetryYN/HELIX-HARNESS/issues/733"]);

    // base を読めない（null）場合は例外を適用せず、従来どおり複数 typed PLAN として拒否する（fail-close）。
    expect(
      admitGithubWorkflowIdentity({
        repository: "RetryYN/HELIX-HARNESS",
        prBody: contractBody(),
        changedPaths: [PLAN_PATH, superseded],
        repoRoot: root,
        basePlanSource: () => null,
      }),
    ).toMatchObject({ ok: false, reason: "workflow_identity_admission_multiple_plans" });

    // superseded_by 以外にも本文が変わっていれば metadata-only ではなく、所有者候補に戻る。
    writeFileSync(
      join(root, superseded),
      `${readFileSync(join(root, superseded), "utf8")}\n訂正注記を追加\n`,
    );
    expect(
      admitGithubWorkflowIdentity({
        repository: "RetryYN/HELIX-HARNESS",
        prBody: contractBody(),
        changedPaths: [PLAN_PATH, superseded],
        repoRoot: root,
        basePlanSource,
      }),
    ).toMatchObject({ ok: false, reason: "workflow_identity_admission_multiple_plans" });
  });
  // PLAN-RECOVERY-1543-reviewer-session-model-history — U-GWIDADM-023
  it("U-GWIDADM-023: 既定の base reader は明示 baseHead の完全 SHA にだけ束縛し、不正・未指定・読取不能では例外を適用せず環境変数や merge-base へ fallback しない", () => {
    const root = fixtureRoot();
    const superseded = "docs/plans/PLAN-L7-575-superseded.md";
    writePlan(root);
    writePlan(root, { path: superseded, targetId: "RECOVERY" });
    const git = (...args: string[]) =>
      execFileSync("git", ["-C", root, ...args], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
    git("init", "-q");
    git("config", "user.email", "fixture@example.invalid");
    git("config", "user.name", "fixture");
    git("add", "-A");
    git("commit", "-q", "-m", "base");
    const baseSha = git("rev-parse", "HEAD");
    // current: superseded_by だけを追加（metadata-only）。base 版は commit 済みの published 状態。
    writeFileSync(
      join(root, superseded),
      readFileSync(join(root, superseded), "utf8").replace(
        "plan_id: PLAN-L7-574-github-workflow-identity-admission\n",
        "plan_id: PLAN-L7-574-github-workflow-identity-admission\nsuperseded_by: [PLAN-L7-574-github-workflow-identity-admission]\n",
      ),
    );
    const admit = (baseHead: string | undefined) =>
      admitGithubWorkflowIdentity({
        repository: "RetryYN/HELIX-HARNESS",
        prBody: contractBody(),
        changedPaths: [PLAN_PATH, superseded],
        repoRoot: root,
        baseHead,
        ghApi: () => ({ number: 733, body: contractBody() }),
      });
    // 有効な明示 base → 例外適用 → successor 1 本を受理。
    expect(admit(baseSha)).toMatchObject({ ok: true, applicable: true });
    // 環境変数に不正 base を置いても、明示 baseHead が無ければ例外は適用されない（env fallback なし）。
    const savedGithub = process.env.GITHUB_BASE_SHA;
    const savedPr = process.env.PR_BASE_SHA;
    process.env.GITHUB_BASE_SHA = baseSha;
    process.env.PR_BASE_SHA = baseSha;
    try {
      expect(admit(undefined)).toMatchObject({
        ok: false,
        reason: "workflow_identity_admission_multiple_plans",
      });
      // 不正な明示 base → merge-base 等へ相殺せず例外不適用（fail-close）。
      expect(admit("invalid-explicit-base")).toMatchObject({
        ok: false,
        reason: "workflow_identity_admission_multiple_plans",
      });
      // 形式は正しいが存在しない SHA → 読取不能 → 例外不適用。
      expect(admit("f".repeat(40))).toMatchObject({
        ok: false,
        reason: "workflow_identity_admission_multiple_plans",
      });
    } finally {
      if (savedGithub === undefined) delete process.env.GITHUB_BASE_SHA;
      else process.env.GITHUB_BASE_SHA = savedGithub;
      if (savedPr === undefined) delete process.env.PR_BASE_SHA;
      else process.env.PR_BASE_SHA = savedPr;
    }
    // reader 単体: 不正 SHA / PLAN 以外の path / 未 commit path は null。
    expect(readExplicitBasePlanSource(root, "not-a-sha", superseded)).toBeNull();
    expect(readExplicitBasePlanSource(root, baseSha, "src/cli.ts")).toBeNull();
    expect(readExplicitBasePlanSource(root, baseSha, "docs/plans/PLAN-missing.md")).toBeNull();
    expect(readExplicitBasePlanSource(root, baseSha, superseded)).toContain(
      "plan_id: PLAN-L7-574-github-workflow-identity-admission",
    );
  });
});
