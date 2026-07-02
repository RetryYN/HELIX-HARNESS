import { execFileSync } from "node:child_process";
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeVersionUpReadiness,
  buildVersionUpActivationPackets,
  buildVersionUpActivationRehearsalPacket,
  buildVersionUpgradeDryRunPlan,
  buildVersionUpSecurityChecklistPacket,
  loadVersionUpReadinessInput,
  type VersionUpReadinessInput,
  versionUpActivationVerificationCommandViolations,
  versionUpReadinessMessages,
} from "../src/lint/version-up-readiness";

function writeFakeRemoteTagGit(binDir: string, tag: string): void {
  const remoteUrl = "https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git";
  const ref = `refs/tags/${tag}`;
  if (process.platform === "win32") {
    writeFileSync(
      join(binDir, "git.cmd"),
      [
        "@echo off",
        'if not "%1"=="ls-remote" exit /b 11',
        'if not "%2"=="--tags" exit /b 12',
        `if not "%3"=="${remoteUrl}" exit /b 13`,
        `if not "%4"=="${ref}" exit /b 14`,
        `echo a148fd304a455e21e631d4dab3c36d59725b1034	${ref}`,
        "",
      ].join("\r\n"),
      "utf8",
    );
    return;
  }
  const path = join(binDir, "git");
  writeFileSync(
    path,
    [
      "#!/bin/sh",
      `test "$1" = "ls-remote" || exit 11`,
      `test "$2" = "--tags" || exit 12`,
      `test "$3" = "${remoteUrl}" || exit 13`,
      `test "$4" = "${ref}" || exit 14`,
      `printf '%s\\t%s\\n' 'a148fd304a455e21e631d4dab3c36d59725b1034' '${ref}'`,
      "",
    ].join("\n"),
    { encoding: "utf8", mode: 0o755 },
  );
  chmodSync(path, 0o755);
}

function input(overrides: Partial<VersionUpReadinessInput> = {}): VersionUpReadinessInput {
  return {
    charter: "version-up 定義\n今版に入れない作業を失わない",
    pillarRequirements: [
      "HR-FR-P1-02",
      "HAC-P1-02a",
      "version-up-readiness",
      "`version_target`",
      "activation 条件",
      "version-up-activation-packet.v1",
      "plan-only activation packet",
      "apply surface を持たない",
      "今版外作業を失わない",
    ].join("\n"),
    functionalDesign: [
      "HB-P1 continuous-autonomy",
      "continuous-run、version-up",
      "signal → mode routing",
      "escalation_boundaries",
    ].join("\n"),
    modeCatalog: [
      "| **version-up** |",
      "[version-up.md](version-up.md)",
      "`version_deferral`",
      "将来版活性化時 → add-feature",
    ].join("\n"),
    modeDoc: [
      "deferred-but-committed-future",
      "status=draft",
      "version_target",
      "VERSION_UP_ALLOWED_TARGETS",
      "activation_decision_record",
      "allowed_outcome",
      "target_version_or_release_trigger",
      "activation_snapshot_id",
      "activation_route",
      "review_by",
      "approval_scope",
      "dry_run_plan",
      "rollback_plan",
      "parked_review_record",
      "review_owner",
      "review_trigger",
      "review_by_policy",
      "stale_action",
      "activation_dependency",
      "decision_packet_route",
      "Version-up source ledger",
      "Semantic Versioning 2.0.0",
      "GitHub Releases",
      "GitHub Environments required reviewers",
      "NIST SSDF SP 800-218",
      "semantic-release",
      "Release Please",
      "GitHub Rulesets",
      "GitHub Merge Queue",
      "Cloudflare Pages limits",
      "Cloudflare Workers limits",
      "Cloudflare D1 limits",
      "Cloudflare Workers KV limits",
      "Cloudflare Access policies",
      "GitHub webhook HMAC SHA-256",
      "OWASP Web Security Testing Guide",
      "external_rehearsal_plan",
      "cost_guardrails",
      "activation_provenance_requirements",
      "adopted version/date",
      "latest official status",
      "adoption decision",
      "activationReadinessSummary",
      "version-up rehearsal",
      "version-up security-checklist",
      "reapprovalTriggers[]",
      "activationSnapshot",
      "snapshotId",
      "HEAD/scope/source/evidence drift",
      "source_status_delta",
      "adoption_decision_delta",
      "workflow_route_impact",
      "date-only refresh",
      "action-binding approval",
      "escalation_boundaries",
      "Version-up source ledger (checked 2026-06-30)",
      "| source | official URL | adopted version/date | latest official status | adoption decision | version-up use | required field impact |",
      "|---|---|---|---|---|---|---|",
      "| Semantic Versioning 2.0.0 | https://semver.org/ | 2.0.0 | current official specification page | adopt-2.0.0 | compatibility intent | version_target target_version_or_release_trigger review_trigger activation_dependency |",
      "| GitHub Releases | https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository | live GitHub docs | live official GitHub docs | adopt-live-docs-for-release-trigger | release/tag trigger | target_version_or_release_trigger review_trigger review_by_policy |",
      "| GitHub Environments required reviewers | https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments | live GitHub docs | live official GitHub docs | adopt-live-docs-for-approval-shape | action-binding approval | review_owner approval_scope |",
      "| NIST SSDF SP 800-218 | https://csrc.nist.gov/pubs/sp/800/218/final / https://csrc.nist.gov/pubs/sp/800/218/r1/ipd | final publication 1.1 | Rev. 1 initial public draft v1.2 | adopt-final-1.1; track-draft-do-not-adopt-until-final | rollback traceability | dry_run_plan rollback_plan stale_action |",
      "| semantic-release | https://semantic-release.gitbook.io/semantic-release | live official docs | live official docs | compare-only-until-release-ADR | release automation candidate | activation_dependency dry_run_plan release automation ADR |",
      "| Release Please | https://github.com/googleapis/release-please | live official repository docs | live official repository docs | compare-only-until-release-ADR | release PR candidate | review_trigger activation_dependency release automation ADR |",
      "| GitHub Rulesets | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets | live GitHub docs | live official GitHub docs | adopt-live-docs-for-gated-push-design | gated push | approval_scope activation_dependency |",
      "| GitHub Merge Queue | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue | live GitHub docs | live official GitHub docs | adopt-live-docs-for-merge-readiness | merge readiness | activation_route review_trigger activation_dependency |",
      "| GitHub Actions secure use | https://docs.github.com/en/actions/reference/security/secure-use / https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target / https://docs.github.com/actions/reference/authentication-in-a-workflow | live GitHub Actions security docs | live official GitHub docs | adopt-live-docs-for-activation-workflow-hardening | activation workflow hardening | approval_scope dry_run_plan external_rehearsal_plan activation_provenance_requirements audit_record |",
      "| Cloudflare Pages limits | https://developers.cloudflare.com/pages/platform/limits/ | live Cloudflare docs | live official Cloudflare docs | adopt-live-docs-for-static-hosting-budget | $0 static SPA budget check | cost_guardrails pages_limit external_rehearsal_plan |",
      "| Cloudflare Workers limits | https://developers.cloudflare.com/workers/platform/limits/ | live Cloudflare docs | live official Cloudflare docs | adopt-live-docs-for-worker-budget | read API request budget | cost_guardrails workers_limit external_rehearsal_plan |",
      "| Cloudflare D1 limits | https://developers.cloudflare.com/d1/platform/limits/ | live Cloudflare docs | live official Cloudflare docs | adopt-live-docs-for-projection-db-budget | projection DB budget | cost_guardrails d1_limit external_rehearsal_plan |",
      "| Cloudflare Workers KV limits | https://developers.cloudflare.com/kv/platform/limits/ | live Cloudflare docs | live official Cloudflare docs | adopt-live-docs-for-projection-cache-budget | projection cache budget | cost_guardrails kv_limit external_rehearsal_plan |",
      "| Cloudflare Access policies | https://developers.cloudflare.com/cloudflare-one/access-controls/policies/ | live Cloudflare docs | live official Cloudflare docs | adopt-live-docs-for-viewer-access-control | read-only dashboard access control | external_rehearsal_plan access_control_check approval_scope |",
      "| GitHub webhook HMAC SHA-256 | https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries | live GitHub docs | live official GitHub docs | adopt-live-docs-for-webhook-signature | webhook authenticity rehearsal | external_rehearsal_plan webhook_signature_check dry_run_plan |",
      "| OWASP Web Security Testing Guide | https://owasp.org/www-project-web-security-testing-guide/ | live OWASP WSTG docs | live official OWASP docs | adopt-live-docs-for-security-testing-shape | security testing checklist for access-control / input / secret exposure surfaces | external_rehearsal_plan dry_run_plan activation_provenance_requirements |",
    ].join("\n"),
    discoveryPlan: "decision_outcome: confirmed\nactivation note (2026-06-30)",
    currentVersion: "0.1.0",
    repoHeadSha: "0123456789abcdef0123456789abcdef01234567",
    semanticFeatureFrontierRecords: [
      {
        recordName: "semantic_feature_frontier_record",
        planId: "PLAN-L7-900-future",
        featureId: "serverless_readonly_share",
        classification: "parked_future_version",
        completionClaimAllowed: false,
        blockers: ["human_approval_pending", "version_up_parked"],
        requiredRoute:
          "version-up activation -> add-feature/rejection path, with approval boundary preserved",
        reason: "version_up_parked",
        sourcePaths: [
          "docs/process/modes/version-up.md",
          "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
        ],
      },
    ],
    plans: [
      {
        file: "PLAN-L7-900-future.md",
        plan_id: "PLAN-L7-900-future",
        status: "draft",
        versionTarget: "future",
        text: [
          "version-up parked",
          "mode=version-up",
          "activation",
          "activation_decision_record:",
          "- allowed_outcome: `activate_future_version` / `reject_or_archive` / `keep_parked_with_review_date`",
          "- target_version_or_release_trigger: distribution release tag",
          "- activation_snapshot_id: activationSnapshot.snapshotId",
          "- activation_route: add-feature -> L2/L3/L4/L6/L7",
          "- review_by: PO + TL",
          "- approval_scope: Cloudflare HMAC webhook",
          "- dry_run_plan: dry-run projection",
          "- rollback_plan: disable binding",
          "- source_ledger_freshness: fresh Version-up source ledger checked 2026-06-30",
          "- source_status_delta: none",
          "- adoption_decision_delta: none",
          "- workflow_route_impact: none while parked",
          "parked_review_record:",
          "- review_owner: PO + TL",
          "- review_trigger: distribution landing",
          "- review_by_policy: trigger-bound",
          "- stale_action: keep_parked_with_review_date or reject_or_archive",
          "- activation_dependency: distribution channel",
          "- decision_packet_route: completion packet",
          "external_rehearsal_plan:",
          "- official_source_basis: Cloudflare Pages/Workers/D1/KV official limits + GitHub webhook HMAC SHA-256 + Cloudflare Access policies",
          "- free_tier_budget_check: Pages Free deploy/file limits, Workers Free request budget, D1/KV free budget checked before activation",
          "- webhook_signature_check: GitHub X-Hub-Signature-256 HMAC validation dry-run",
          "- access_control_check: Cloudflare Access policy protects read-only dashboard route",
          "- no_secret_pii_check: projection excludes secret/PII/raw transcript",
          "- no_prod_write_check: dry-run uses staging or non-production projection only",
          "- rollback_rehearsal: .ut-tdd/evidence/version-up/rollback-rehearsal.json result=pass exit_code=0 disables binding and rebuilds projection from GitHub source",
          "cost_guardrails:",
          "- pages_limit: Cloudflare Pages official limits must fit static SPA artifact",
          "- workers_limit: Workers Free request budget must fit read API and Pages Functions usage",
          "- d1_limit: D1 free storage/query budget must fit projection DB",
          "- kv_limit: Workers KV free read/write/storage budget must fit projection cache",
          "- exceed_action: keep_parked_with_review_date or request_scope_reduction; never silent paid upgrade",
          "activation_provenance_requirements:",
          "- source_ledger: docs/process/modes/version-up.md#version-up-source-ledger checked=2026-06-30",
          "- dry_run_evidence: free-tier budget, HMAC, access-control, no-secret, no-prod-write, rollback rehearsal output",
          "- approval_evidence: activation_decision_record + action_binding_approval_record",
          "- audit_record: approver, actor, tool, target, params hash, command output, rollback/incident route",
          "version_target",
          "Cloudflare HMAC webhook access control external",
          "action-binding approval",
          "escalation_boundaries",
          "approval_scope",
          "dry_run_plan",
          "rollback_plan",
          "exit 1",
        ].join("\n"),
      },
    ],
    ...overrides,
  };
}

describe("version-up-readiness", () => {
  it("U-DECISIONREC-002: passes when mode docs and parked plans expose activation and approval boundaries", () => {
    const result = analyzeVersionUpReadiness(input());
    expect(result.ok).toBe(true);
    expect(result.parkedPlanIds).toEqual(["PLAN-L7-900-future"]);
    expect(versionUpReadinessMessages(result)[0]).toContain("version-up-readiness - OK");
  });

  it("fails activation records that omit source ledger meaning-review fields", () => {
    const base = input().plans[0];
    const result = analyzeVersionUpReadiness(
      input({
        plans: [
          {
            ...base,
            text: base.text
              .split("\n")
              .filter(
                (line) =>
                  !/source_ledger_freshness|source_status_delta|adoption_decision_delta|workflow_route_impact/.test(
                    line,
                  ),
              )
              .join("\n"),
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        { subject: "PLAN-L7-900-future", reason: "missing structured source_ledger_freshness" },
        { subject: "PLAN-L7-900-future", reason: "missing structured source_status_delta" },
        { subject: "PLAN-L7-900-future", reason: "missing structured adoption_decision_delta" },
        { subject: "PLAN-L7-900-future", reason: "missing structured workflow_route_impact" },
      ]),
    );
  });

  it("fails activation records whose source ledger meaning-review fields are placeholders", () => {
    const base = input().plans[0];
    const result = analyzeVersionUpReadiness(
      input({
        plans: [
          {
            ...base,
            text: base.text
              .replace(
                "- source_ledger_freshness: fresh Version-up source ledger checked 2026-06-30",
                "- source_ledger_freshness: source_ledger_freshness",
              )
              .replace("- source_status_delta: none", "- source_status_delta: source_status_delta")
              .replace(
                "- adoption_decision_delta: none",
                "- adoption_decision_delta: adoption_decision_delta",
              )
              .replace(
                "- workflow_route_impact: none while parked",
                "- workflow_route_impact: workflow_route_impact",
              ),
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations.map((violation) => violation.reason)).toEqual(
      expect.arrayContaining([
        "structured source_ledger_freshness must not be placeholder",
        "structured source_status_delta must not be placeholder",
        "structured adoption_decision_delta must not be placeholder",
        "structured workflow_route_impact must not be placeholder",
      ]),
    );
  });

  it("U-DECISIONREC-012: emits a non-destructive activation packet with verification commands for parked version-up plans", () => {
    const packets = buildVersionUpActivationPackets(input());
    expect(packets).toHaveLength(1);
    const packet = packets[0];

    expect(packet.schemaVersion).toBe("version-up-activation-packet.v1");
    expect(packet.planId).toBe("PLAN-L7-900-future");
    expect(packet.generatedAt).toEqual(expect.any(String));
    expect(packet.sourceCommand).toBe("ut-tdd version-up activation-packet --json");
    expect(packet.freshness).toEqual({
      validForMinutes: 1440,
      expiresAt: expect.any(String),
      stale: false,
      policy: "decision-packet-freshness.v1",
    });
    expect(packet.status).toBe("parked_pending_activation_decision");
    expect(packet.planOnly).toBe(true);
    expect(packet.mustNotApply).toBe(true);
    expect(packet.applyCommandAvailable).toBe(false);
    expect(packet.activationAllowed).toBe(false);
    expect(packet.allowedOutcomes).toEqual([
      "activate_future_version",
      "reject_or_archive",
      "keep_parked_with_review_date",
    ]);
    expect(packet.semanticFeatureFrontierRecord).toMatchObject({
      recordName: "semantic_feature_frontier_record",
      planId: "PLAN-L7-900-future",
      featureId: "serverless_readonly_share",
      classification: "parked_future_version",
      completionClaimAllowed: false,
    });
    expect(packet.activationDecision.activation_snapshot_id).toBe("activationSnapshot.snapshotId");
    expect(packet.activationDecision.activation_route).toContain("add-feature");
    expect(packet.parkedReview.decision_packet_route).toContain("completion packet");
    expect(packet.externalBoundaries).toEqual([
      "Cloudflare",
      "HMAC",
      "webhook",
      "access control",
      "secret",
      "external",
    ]);
    expect(packet.blockedReasons).toEqual(
      expect.arrayContaining([
        "plan remains version_target parked; activation decision has not been executed",
        "activation_decision_record.activation_snapshot_id lacks concrete current activationSnapshot.snapshotId",
        "missing concrete approve_action_binding outcome",
      ]),
    );
    expect(packet.nextWorkflowRoutes.map((route) => route.outcome)).toEqual([
      "activate_future_version",
      "reject_or_archive",
      "keep_parked_with_review_date",
    ]);
    expect(packet.externalRehearsalPlan).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          check: "official_source_basis",
          source: "Version-up source ledger and official provider documentation",
        }),
        expect.objectContaining({
          check: "webhook_signature_check",
          evidence: expect.stringContaining("X-Hub-Signature-256"),
        }),
        expect.objectContaining({
          check: "access_control_check",
          source: "Cloudflare Access policy testing",
        }),
        expect.objectContaining({
          check: "no_prod_write_check",
          source: "dry-run projection and no-production-write rehearsal",
        }),
      ]),
    );
    expect(packet.externalRehearsalPlan.map((item) => item.check)).toEqual([
      "official_source_basis",
      "free_tier_budget_check",
      "webhook_signature_check",
      "access_control_check",
      "no_secret_pii_check",
      "no_prod_write_check",
      "rollback_rehearsal",
    ]);
    expect(packet.activationReadinessChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          check: "free_tier_budget_check",
          status: "pending_evidence",
          reason: "external activation requires concrete rehearsal output before approval",
        }),
        expect.objectContaining({
          check: "rollback_rehearsal",
          status: "present",
        }),
        expect.objectContaining({
          check: "dry_run_evidence",
          status: "pending_evidence",
        }),
        expect.objectContaining({
          check: "audit_record",
          status: "pending_evidence",
        }),
        expect.objectContaining({
          check: "pages_limit",
          status: "pending_evidence",
        }),
        expect.objectContaining({
          check: "exceed_action",
          status: "pending_evidence",
        }),
      ]),
    );
    expect(packet.activationReadinessSummary).toMatchObject({
      status: "pending_evidence",
      totalChecks: 17,
      sourceLedgerFresh: true,
      sourceLedgerViolation: null,
      activationAllowed: false,
    });
    expect(packet.activationReadinessSummary.pendingCheckNames).toEqual(
      expect.arrayContaining([
        "free_tier_budget_check",
        "dry_run_evidence",
        "audit_record",
        "pages_limit",
        "workers_limit",
        "d1_limit",
        "kv_limit",
        "exceed_action",
      ]),
    );
    expect(packet.recordTemplates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordName: "activation_decision_record",
          yamlLines: expect.arrayContaining([
            "activation_decision_record:",
            '  - activation_snapshot_id: "<activationSnapshot.snapshotId>"',
          ]),
        }),
        expect.objectContaining({
          recordName: "parked_review_record",
          yamlLines: expect.arrayContaining([
            '  - decision_packet_route: "<decision_packet_route>"',
          ]),
        }),
        expect.objectContaining({
          recordName: "external_rehearsal_plan",
          yamlLines: expect.arrayContaining([
            '  - official_source_basis: "<official_source_basis URL or source ledger reference>"',
          ]),
        }),
        expect.objectContaining({
          recordName: "action_binding_approval_record",
          yamlLines: expect.arrayContaining(['  - approved_params: "<approved_params>"']),
        }),
      ]),
    );
    expect(packet.activationVerificationCommandMatrix).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: "activation-packet-baseline",
          command:
            "bun run src/cli.ts version-up activation-packet --plan PLAN-L7-900-future --json",
          writePolicy: "no-write",
        }),
        expect.objectContaining({
          phase: "version-dry-run",
          command:
            "bun run src/cli.ts version-up activation-packet --plan PLAN-L7-900-future --json",
          writePolicy: "no-write",
          expected: expect.stringContaining("concrete SemVer tag"),
        }),
        expect.objectContaining({
          phase: "external-rehearsal",
          command:
            "bun run src/cli.ts version-up rehearsal --plan PLAN-L7-900-future --no-write --json",
          writePolicy: "no-write",
          evidence: expect.stringContaining("external_rehearsal_plan"),
          sourceUrl: "https://docs.github.com/en/actions/reference/security/secure-use",
          sourceCheckedAt: "2026-07-02",
          latestOfficialStatus: expect.stringContaining("GITHUB_TOKEN permissions"),
          sourceStatusDelta: expect.stringContaining("least-privilege"),
          adoptionDecision: expect.stringContaining("least-privilege-token-scope"),
          adoptionDecisionDelta: expect.stringContaining("external rehearsal evidence"),
          workflowRouteImpact: expect.stringContaining("pending_evidence"),
        }),
        expect.objectContaining({
          phase: "security-testing",
          command:
            "bun run src/cli.ts version-up security-checklist --plan PLAN-L7-900-future --no-write --json",
          writePolicy: "no-write",
          sourceUrl: "https://owasp.org/www-project-web-security-testing-guide/",
          sourceCheckedAt: "2026-07-02",
          sourceStatusDelta: expect.stringContaining("OWASP WSTG"),
          adoptionDecision: expect.stringContaining("wstg"),
          adoptionDecisionDelta: expect.stringContaining("security checks"),
          workflowRouteImpact: expect.stringContaining("security report absence"),
        }),
        expect.objectContaining({
          phase: "state-and-doctor",
          command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor",
          writePolicy: "state-write",
        }),
        expect.objectContaining({
          phase: "approval-packet",
          command: "bun run src/cli.ts action-binding approval-packet --json",
          writePolicy: "no-write",
          sourceUrl:
            "https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments",
          sourceCheckedAt: "2026-07-02",
          latestOfficialStatus: expect.stringContaining("availability constraints"),
          sourceStatusDelta: expect.stringContaining("public-repository gated"),
          adoptionDecision: expect.stringContaining("prevent-self-review-check"),
          adoptionDecisionDelta: expect.stringContaining("GitHub Environments availability"),
          workflowRouteImpact: expect.stringContaining("reviewed_snapshot_binding"),
        }),
      ]),
    );
    for (const row of packet.activationVerificationCommandMatrix) {
      expect(row.sourceCheckedAt, row.phase).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(row.latestOfficialStatus, row.phase).not.toBe("");
      expect(row.sourceStatusDelta, row.phase).not.toBe("");
      expect(row.adoptionDecision, row.phase).not.toBe("");
      expect(row.adoptionDecisionDelta, row.phase).not.toBe("");
      expect(row.workflowRouteImpact, row.phase).not.toBe("");
    }
    expect(packet.reapprovalTriggers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          trigger: "head_sha_or_release_trigger_drift",
          requiredAction: expect.stringContaining("re-run version-up dry-run"),
        }),
        expect.objectContaining({
          trigger: "approval_scope_or_params_drift",
          invalidates: expect.stringContaining("approved actor/tool/target/params"),
        }),
        expect.objectContaining({
          trigger: "source_ledger_or_external_limit_drift",
          requiredAction: expect.stringContaining("source_status_delta"),
        }),
        expect.objectContaining({
          trigger: "rehearsal_or_rollback_evidence_drift",
          source: expect.stringContaining("SLSA provenance"),
        }),
      ]),
    );
    expect(packet.activationSnapshot).toMatchObject({
      releaseTrigger: expect.stringContaining("release"),
      headSha: "0123456789abcdef0123456789abcdef01234567",
      versionTarget: "future",
      planStatus: "draft",
      sourceLedgerCheckedDate: "2026-06-30",
      approvalScopeDigest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
      evidenceDigest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
      invalidatedBy: [
        "head_sha_or_release_trigger_drift",
        "approval_scope_or_params_drift",
        "source_ledger_or_external_limit_drift",
        "rehearsal_or_rollback_evidence_drift",
      ],
    });
    expect(packet.activationSnapshot.snapshotId).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(packet.blockedReasons).toEqual(
      expect.arrayContaining([
        "activation rehearsal evidence pending: free_tier_budget_check",
        "activation rehearsal evidence pending: dry_run_evidence",
        "activation rehearsal evidence pending: audit_record",
        "activation rehearsal evidence pending: pages_limit",
      ]),
    );
    expect(packet.costGuardrails).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ surface: "Cloudflare Workers" }),
        expect.objectContaining({ surface: "Cloudflare D1" }),
      ]),
    );
    expect(packet.provenanceRequirements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ item: "dry_run_evidence" }),
        expect.objectContaining({ item: "audit_record" }),
      ]),
    );
    expect(packet.sourceLedgerFreshness).toMatchObject({
      ledgerLabel: "Version-up source ledger",
      checkedDate: "2026-06-30",
      stale: false,
      maxAgeDays: 90,
      rowCount: 16,
      missingRows: [],
    });
    expect(packet.relatedDecisionPackets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          role: "primary",
          command: "ut-tdd version-up activation-packet --json",
        }),
        expect.objectContaining({
          role: "supporting",
          command: "ut-tdd action-binding approval-packet --json",
        }),
      ]),
    );
    expect(versionUpActivationVerificationCommandViolations(packet)).toEqual([]);
    expect(
      versionUpActivationVerificationCommandViolations({
        ...packet,
        activationVerificationCommandMatrix: packet.activationVerificationCommandMatrix.map(
          (row) =>
            row.phase === "external-rehearsal"
              ? { ...row, command: "record staging evidence later" }
              : row,
        ),
      }),
    ).toEqual([
      {
        subject: "PLAN-L7-900-future.external-rehearsal",
        reason:
          "activationVerificationCommandMatrix command is not an executable approved surface for its writePolicy: record staging evidence later",
      },
    ]);
    expect(
      versionUpActivationVerificationCommandViolations({
        ...packet,
        activationVerificationCommandMatrix: packet.activationVerificationCommandMatrix.map(
          (row) =>
            row.phase === "external-rehearsal"
              ? { ...row, command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor" }
              : row,
        ),
      }),
    ).toEqual([
      {
        subject: "PLAN-L7-900-future.external-rehearsal",
        reason:
          "activationVerificationCommandMatrix command is not an executable approved surface for its writePolicy: bun run src/cli.ts db rebuild && bun run src/cli.ts doctor",
      },
      {
        subject: "PLAN-L7-900-future.external-rehearsal",
        reason:
          "activationVerificationCommandMatrix no-write command may write local state or artifacts: bun run src/cli.ts db rebuild && bun run src/cli.ts doctor",
      },
    ]);
    expect(
      versionUpActivationVerificationCommandViolations({
        ...packet,
        activationVerificationCommandMatrix: packet.activationVerificationCommandMatrix.map(
          (row) =>
            row.phase === "state-and-doctor"
              ? { ...row, command: "bun run src/cli.ts doctor" }
              : row,
        ),
      }),
    ).toEqual([
      {
        subject: "PLAN-L7-900-future.state-and-doctor",
        reason:
          "activationVerificationCommandMatrix command is not an executable approved surface for its writePolicy: bun run src/cli.ts doctor",
      },
      {
        subject: "PLAN-L7-900-future.state-and-doctor",
        reason:
          "activationVerificationCommandMatrix state-write command must be explicit about state rebuild: bun run src/cli.ts doctor",
      },
    ]);
    const rehearsalPacket = buildVersionUpActivationRehearsalPacket(packet);
    expect(rehearsalPacket).toMatchObject({
      schemaVersion: "version-up-activation-rehearsal.v1",
      planId: "PLAN-L7-900-future",
      planOnly: true,
      mustNotApply: true,
      writePolicy: "no-write",
    });
    expect(rehearsalPacket.activationReadinessChecks.length).toBeGreaterThan(0);
    const securityPacket = buildVersionUpSecurityChecklistPacket(packet);
    expect(securityPacket).toMatchObject({
      schemaVersion: "version-up-security-checklist.v1",
      planId: "PLAN-L7-900-future",
      planOnly: true,
      mustNotApply: true,
      writePolicy: "no-write",
    });
    expect(securityPacket.securityChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ check: "github-actions-least-privilege" }),
        expect.objectContaining({
          check: "github-environments-availability",
          requiredEvidence: expect.stringContaining("repository visibility"),
        }),
        expect.objectContaining({ check: "access-control-and-secret-exposure" }),
      ]),
    );
  });

  it("fails parked version-up plans that are detached from live semantic frontier records", () => {
    const result = analyzeVersionUpReadiness(
      input({
        semanticFeatureFrontierRecords: [],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      subject: "PLAN-L7-900-future",
      reason: "missing semantic_feature_frontier_record for parked_future_version",
    });
  });

  it("fails parked version-up semantic frontier records with wrong classification or missing L3 source", () => {
    const semanticRecord = input().semanticFeatureFrontierRecords?.[0];
    if (!semanticRecord) throw new Error("missing version-up semantic frontier fixture");
    const wrongClassification = analyzeVersionUpReadiness(
      input({
        semanticFeatureFrontierRecords: [
          {
            ...semanticRecord,
            classification: "frontier_pending_decision",
          },
        ],
      }),
    );

    expect(wrongClassification.ok).toBe(false);
    expect(wrongClassification.violations).toContainEqual({
      subject: "PLAN-L7-900-future",
      reason:
        "semantic_feature_frontier_record classification frontier_pending_decision expected parked_future_version",
    });

    const missingL3 = analyzeVersionUpReadiness(
      input({
        semanticFeatureFrontierRecords: [
          {
            ...semanticRecord,
            sourcePaths: ["docs/process/modes/version-up.md"],
          },
        ],
      }),
    );
    expect(missingL3.violations).toContainEqual({
      subject: "PLAN-L7-900-future",
      reason:
        "semantic_feature_frontier_record sourcePaths must include docs/design/helix/L3-requirements/pillar-functional-requirements.md",
    });
  });

  it("keeps prose-only rehearsal and provenance requirements pending until concrete evidence is cited", () => {
    const base = input().plans[0];
    const packets = buildVersionUpActivationPackets(
      input({
        plans: [
          {
            ...base,
            text: base.text
              .replace(
                ".ut-tdd/evidence/version-up/rollback-rehearsal.json result=pass exit_code=0 disables binding and rebuilds projection from GitHub source",
                "disable binding and rebuild projection from GitHub source",
              )
              .replace(
                "docs/process/modes/version-up.md#version-up-source-ledger checked=2026-06-30",
                "version-up source ledger is checked at activation review date",
              ),
          },
        ],
      }),
    );

    expect(packets[0].activationReadinessChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          check: "rollback_rehearsal",
          status: "pending_evidence",
        }),
        expect.objectContaining({
          check: "source_ledger",
          status: "pending_evidence",
        }),
        expect.objectContaining({
          check: "dry_run_evidence",
          status: "pending_evidence",
        }),
        expect.objectContaining({
          check: "audit_record",
          status: "pending_evidence",
        }),
      ]),
    );
    expect(packets[0].activationReadinessSummary).toMatchObject({
      status: "pending_evidence",
      pendingChecks: 15,
      sourceLedgerFresh: true,
      activationAllowed: false,
    });
    expect(packets[0].activationReadinessSummary.pendingCheckNames).toContain("rollback_rehearsal");
    expect(packets[0].blockedReasons).toEqual(
      expect.arrayContaining([
        "activation rehearsal evidence pending: rollback_rehearsal",
        "activation rehearsal evidence pending: source_ledger",
        "activation rehearsal evidence pending: dry_run_evidence",
        "activation rehearsal evidence pending: audit_record",
      ]),
    );
  });

  it("surfaces stale source ledger freshness inside activation packets", () => {
    const packets = buildVersionUpActivationPackets(
      input({
        modeDoc: input().modeDoc.replace(
          "Version-up source ledger (checked 2026-06-30)",
          "Version-up source ledger (checked 2026-01-01)",
        ),
      }),
    );

    expect(packets[0].sourceLedgerFreshness).toMatchObject({
      checkedDate: "2026-01-01",
      stale: true,
      violation: expect.stringMatching(
        /^Version-up source ledger checked date is stale: 2026-01-01 \(\d+d > 90d\)$/,
      ),
    });
    expect(packets[0].activationReadinessSummary).toMatchObject({
      status: "pending_evidence",
      sourceLedgerFresh: false,
      sourceLedgerViolation: expect.stringMatching(
        /^Version-up source ledger checked date is stale: 2026-01-01 \(\d+d > 90d\)$/,
      ),
      activationAllowed: false,
    });
    expect(packets[0].activationReadinessSummary.pendingCheckNames).toContain(
      "source_ledger_freshness",
    );
    expect(packets[0].blockedReasons).toEqual(
      expect.arrayContaining([
        expect.stringMatching(
          /^source ledger must be refreshed before activation: Version-up source ledger checked date is stale: 2026-01-01 \(\d+d > 90d\)$/,
        ),
      ]),
    );
    expect(packets[0].applyCommandAvailable).toBe(false);
  });

  it("emits a non-destructive version upgrade dry-run plan with rollback and idempotency evidence", () => {
    const plan = buildVersionUpgradeDryRunPlan({
      currentVersion: "v0.1.0",
      targetVersion: "v0.2.0",
      releaseTrigger: "GitHub release tag v0.2.0",
      releaseTagExists: true,
    });

    expect(plan).toMatchObject({
      schemaVersion: "version-up-dry-run-plan.v1",
      currentVersion: "v0.1.0",
      targetVersion: "v0.2.0",
      normalizedCurrent: "0.1.0",
      normalizedTarget: "0.2.0",
      semverChange: "minor",
      planOnly: true,
      mustNotApply: true,
      applyCommandAvailable: false,
      ok: true,
      releaseTrigger: "GitHub release tag v0.2.0",
      releaseTagRef: "refs/tags/v0.2.0",
      releaseTagSource: "local",
      releaseTagCheckCommand: "git rev-parse --verify refs/tags/v0.2.0",
      releaseTagExists: true,
      releaseTriggerResolved: true,
    });
    expect(plan.migrationPlan).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          step: "compare_current_target",
          command: "ut-tdd version-up dry-run --current v0.1.0 --target v0.2.0 --json",
          requiredEvidence: "semver_diff",
        }),
        expect.objectContaining({ step: "project_setup_dry_run" }),
      ]),
    );
    expect(plan.rollbackPlan).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ step: "restore_previous_tag", command: "git switch v0.1.0" }),
      ]),
    );
    expect(plan.idempotencyChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          check: "repeat_dry_run_has_no_state_change",
          command: "ut-tdd version-up dry-run --current v0.1.0 --target v0.2.0 --json",
        }),
      ]),
    );
    expect(plan.releaseGateChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          check: "release_tag_exists",
          command: "git rev-parse --verify refs/tags/v0.2.0",
          requiredEvidence: "target release tag resolved before activation",
        }),
        expect.objectContaining({ check: "required_checks_green" }),
      ]),
    );
    expect(plan.sourceBasis.map((source) => source.name)).toEqual(
      expect.arrayContaining([
        "Semantic Versioning 2.0.0",
        "GitHub Releases",
        "GitHub Rulesets",
        "GitHub Merge Queue",
      ]),
    );
    expect(plan.blockedReasons).toEqual([]);

    const missingTag = buildVersionUpgradeDryRunPlan({
      currentVersion: "v0.1.0",
      targetVersion: "v0.2.0",
      releaseTagExists: false,
    });
    expect(missingTag.ok).toBe(false);
    expect(missingTag.releaseTagRef).toBe("refs/tags/v0.2.0");
    expect(missingTag.releaseTriggerResolved).toBe(false);
    expect(missingTag.blockedReasons).toContain("target release tag must exist before activation");
    expect(missingTag.releaseGateChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          check: "release_tag_exists",
          requiredEvidence: "target release tag is missing; keep activation blocked",
        }),
      ]),
    );

    const remoteTag = buildVersionUpgradeDryRunPlan({
      currentVersion: "v0.1.0",
      targetVersion: "v0.1.3",
      releaseRemoteUrl: "https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git",
      releaseTagExists: true,
    });
    expect(remoteTag).toMatchObject({
      ok: true,
      semverChange: "patch",
      releaseTagRef: "refs/tags/v0.1.3",
      releaseTagSource: "remote",
      releaseTagCheckCommand:
        "git ls-remote --tags https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git refs/tags/v0.1.3",
      releaseTagExists: true,
      releaseTriggerResolved: true,
    });
    expect(remoteTag.releaseGateChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          check: "release_tag_exists",
          command:
            "git ls-remote --tags https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git refs/tags/v0.1.3",
        }),
      ]),
    );
    expect(remoteTag.migrationPlan).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          step: "compare_current_target",
          command:
            "ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json",
        }),
      ]),
    );
    expect(remoteTag.idempotencyChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          check: "repeat_dry_run_has_no_state_change",
          command:
            "ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json",
        }),
      ]),
    );
  });

  it("rejects downgrade or invalid version-up dry-run targets before any apply surface exists", () => {
    const downgrade = buildVersionUpgradeDryRunPlan({
      currentVersion: "v0.2.0",
      targetVersion: "v0.1.0",
    });
    expect(downgrade.ok).toBe(false);
    expect(downgrade.semverChange).toBe("downgrade");
    expect(downgrade.blockedReasons).toContain(
      "target version must be greater than current version",
    );
    expect(downgrade.applyCommandAvailable).toBe(false);

    const invalid = buildVersionUpgradeDryRunPlan({
      currentVersion: "v0.2.0",
      targetVersion: "latest",
    });
    expect(invalid.ok).toBe(false);
    expect(invalid.semverChange).toBe("invalid");
    expect(invalid.blockedReasons).toContain("current and target versions must be SemVer");
    expect(invalid.mustNotApply).toBe(true);

    const leadingZeroPrerelease = buildVersionUpgradeDryRunPlan({
      currentVersion: "v1.0.0",
      targetVersion: "v1.0.1-01",
    });
    expect(leadingZeroPrerelease.ok).toBe(false);
    expect(leadingZeroPrerelease.semverChange).toBe("invalid");
    expect(leadingZeroPrerelease.blockedReasons).toContain(
      "current and target versions must be SemVer",
    );

    const emptyPrereleaseIdentifier = buildVersionUpgradeDryRunPlan({
      currentVersion: "v1.0.0",
      targetVersion: "v1.0.1-alpha..1",
    });
    expect(emptyPrereleaseIdentifier.ok).toBe(false);
    expect(emptyPrereleaseIdentifier.semverChange).toBe("invalid");

    const prerelease = buildVersionUpgradeDryRunPlan({
      currentVersion: "v1.0.0-alpha.1",
      targetVersion: "v1.0.0-alpha.2",
      releaseTagExists: true,
    });
    expect(prerelease.ok).toBe(true);
    expect(prerelease.semverChange).toBe("prerelease");
  });

  it("U-DECISIONREC-002: fails parked plans that do not explain activation as version-up", () => {
    const result = analyzeVersionUpReadiness(
      input({
        plans: [
          {
            file: "PLAN-L7-901-future.md",
            plan_id: "PLAN-L7-901-future",
            status: "draft",
            versionTarget: "future",
            text: "version_target: future",
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain(
      "missing parked marker mode=version-up",
    );
    expect(result.violations.map((v) => v.reason)).toContain("missing parked marker activation");
    expect(result.violations.map((v) => v.reason)).toContain(
      "missing parked marker activation_decision_record",
    );
    expect(result.violations.map((v) => v.reason)).toContain(
      "missing parked marker parked_review_record",
    );
    expect(result.violations.map((v) => v.reason)).toContain(
      "missing structured activation_decision_record",
    );
  });

  it("U-DECISIONREC-002: fails parked plans that mention activation fields without structured records", () => {
    const result = analyzeVersionUpReadiness(
      input({
        plans: [
          {
            file: "PLAN-L7-903-future.md",
            plan_id: "PLAN-L7-903-future",
            status: "draft",
            versionTarget: "future",
            text: [
              "version-up parked mode=version-up activation version_target",
              "activation_decision_record allowed_outcome review_by approval_scope dry_run_plan rollback_plan",
              "parked_review_record review_owner review_trigger review_by_policy stale_action activation_dependency decision_packet_route",
            ].join("\n"),
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toEqual(
      expect.arrayContaining([
        "missing structured activation_decision_record",
        "missing structured parked_review_record",
      ]),
    );
  });

  it("U-DECISIONREC-004: fails activation records whose allowed_outcome set drifts from the design enum", () => {
    const base = input().plans[0];
    const result = analyzeVersionUpReadiness(
      input({
        plans: [
          {
            ...base,
            text: base.text.replace(
              "`activate_future_version` / `reject_or_archive` / `keep_parked_with_review_date`",
              "`activate_future_version` / `skip_review`",
            ),
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain(
      "invalid allowed_outcome set for activation_decision_record: missing allowed_outcome reject_or_archive,keep_parked_with_review_date; unknown allowed_outcome skip_review",
    );
  });

  it("U-DECISIONREC-007: fails parked version-up plans whose activation record has outcomes but no matching routes", () => {
    const base = input().plans[0];
    const result = analyzeVersionUpReadiness(
      input({
        plans: [
          {
            ...base,
            text: [
              "version-up parked",
              "mode=version-up",
              "activation",
              "activation_decision_record:",
              "- allowed_outcome: `activate_future_version` / `reject_or_archive` / `keep_parked_with_review_date`",
              "- target_version_or_release_trigger: future someday",
              "- activation_snapshot_id: activationSnapshot.snapshotId",
              "- activation_route: direct external activation only",
              "- review_by: later",
              "- approval_scope: Cloudflare HMAC webhook",
              "- dry_run_plan: dry-run projection",
              "- rollback_plan: disable binding",
              "parked_review_record:",
              "- review_owner: PO + TL",
              "- review_trigger: distribution landing",
              "- review_by_policy: later",
              "- stale_action: keep parked",
              "- activation_dependency: distribution channel",
              "- decision_packet_route: private note",
              "version_target",
              "Cloudflare HMAC webhook access control external",
              "action-binding approval",
              "escalation_boundaries",
              "approval_scope",
              "dry_run_plan",
              "rollback_plan",
              "exit 1",
            ].join("\n"),
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        {
          subject: "PLAN-L7-900-future",
          reason: "activate_future_version requires an add-feature Forward route",
        },
        {
          subject: "PLAN-L7-900-future",
          reason: "reject_or_archive requires an archive/rejection route",
        },
        {
          subject: "PLAN-L7-900-future",
          reason: "keep_parked_with_review_date requires a review-date route",
        },
        {
          subject: "PLAN-L7-900-future",
          reason: "parked review requires trigger-bound policy or explicit YYYY-MM-DD date",
        },
        {
          subject: "PLAN-L7-900-future",
          reason: "parked review must remain visible in completion/status decision packet",
        },
      ]),
    );
  });

  it("fails when the feature catalog or requirement trace drops version-up semantics", () => {
    const result = analyzeVersionUpReadiness(
      input({
        pillarRequirements: "HR-FR-P1-02",
        modeCatalog: "| **version-up** |",
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        { subject: "L3 pillar requirements", reason: "missing HAC-P1-02a" },
        { subject: "L3 pillar requirements", reason: "missing version-up-readiness" },
        { subject: "L3 pillar requirements", reason: "missing `version_target`" },
        { subject: "L3 pillar requirements", reason: "missing activation 条件" },
        { subject: "L3 pillar requirements", reason: "missing version-up-activation-packet.v1" },
        { subject: "L3 pillar requirements", reason: "missing plan-only activation packet" },
        { subject: "L3 pillar requirements", reason: "missing apply surface を持たない" },
        { subject: "L3 pillar requirements", reason: "missing 今版外作業を失わない" },
        { subject: "docs/process/modes/README.md", reason: "missing `version_deferral`" },
      ]),
    );
  });

  it("fails when the version-up source ledger loses adoption decisions or source rows", () => {
    const result = analyzeVersionUpReadiness(
      input({
        modeDoc: [
          "deferred-but-committed-future",
          "status=draft",
          "version_target",
          "VERSION_UP_ALLOWED_TARGETS",
          "activation_decision_record",
          "allowed_outcome",
          "target_version_or_release_trigger",
          "activation_snapshot_id",
          "activation_route",
          "review_by",
          "approval_scope",
          "dry_run_plan",
          "rollback_plan",
          "parked_review_record",
          "review_owner",
          "review_trigger",
          "review_by_policy",
          "stale_action",
          "activation_dependency",
          "decision_packet_route",
          "Version-up source ledger",
          "Semantic Versioning 2.0.0",
          "GitHub Releases",
          "GitHub Environments required reviewers",
          "NIST SSDF SP 800-218",
          "semantic-release",
          "Release Please",
          "GitHub Rulesets",
          "GitHub Merge Queue",
          "adopted version/date",
          "latest official status",
          "adoption decision",
          "reapprovalTriggers[]",
          "HEAD/scope/source/evidence drift",
          "source_status_delta",
          "adoption_decision_delta",
          "workflow_route_impact",
          "date-only refresh",
          "action-binding approval",
          "escalation_boundaries",
          "Version-up source ledger (checked 2026-06-30)",
          "| source | official URL | adopted version/date | latest official status | adoption decision | version-up use | required field impact |",
          "|---|---|---|---|---|---|---|",
          "| Semantic Versioning 2.0.0 | https://semver.org/ | 2.0.0 | current official specification page | - | compatibility intent | version_target |",
        ].join("\n"),
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.missingSourceLedgerRows).toContain("GitHub Releases");
    expect(result.sourceLedgerViolations).toContainEqual({
      subject: "docs/process/modes/version-up.md",
      reason: "version-up source ledger Semantic Versioning 2.0.0 has empty adoption decision",
    });
  });

  it("fails when external activation source ledger rows are present only as prose markers", () => {
    const modeDocWithoutExternalLedgerRows = input()
      .modeDoc.split("\n")
      .filter(
        (line) =>
          !line.startsWith("| Cloudflare") &&
          !line.startsWith("| GitHub Actions secure use |") &&
          !line.startsWith("| GitHub webhook HMAC SHA-256 |") &&
          !line.startsWith("| OWASP Web Security Testing Guide |"),
      )
      .join("\n");
    const result = analyzeVersionUpReadiness(
      input({
        modeDoc: modeDocWithoutExternalLedgerRows,
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.missingSourceLedgerRows).toEqual(
      expect.arrayContaining([
        "Cloudflare Pages limits",
        "Cloudflare Workers limits",
        "Cloudflare D1 limits",
        "Cloudflare Workers KV limits",
        "Cloudflare Access policies",
        "GitHub Actions secure use",
        "GitHub webhook HMAC SHA-256",
        "OWASP Web Security Testing Guide",
      ]),
    );
  });

  it("U-SOURCELEDGER-006: fails when version-up source ledger rows drift from expected official URLs or field impacts", () => {
    const result = analyzeVersionUpReadiness(
      input({
        modeDoc: input()
          .modeDoc.replace(
            "https://developers.cloudflare.com/workers/platform/limits/",
            "https://example.com/workers",
          )
          .replace("cost_guardrails workers_limit external_rehearsal_plan", "cost_guardrails"),
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.sourceLedgerViolations).toEqual(
      expect.arrayContaining([
        {
          subject: "docs/process/modes/version-up.md",
          reason:
            "version-up source ledger Cloudflare Workers limits official URL missing expected https://developers.cloudflare.com/workers/platform/limits/",
        },
        {
          subject: "docs/process/modes/version-up.md",
          reason:
            "version-up source ledger Cloudflare Workers limits required field impact missing expected external_rehearsal_plan",
        },
      ]),
    );
  });

  it("fails when Cloudflare Access policy source keeps the legacy URL", () => {
    const result = analyzeVersionUpReadiness(
      input({
        modeDoc: input().modeDoc.replace(
          "https://developers.cloudflare.com/cloudflare-one/access-controls/policies/",
          "https://developers.cloudflare.com/cloudflare-one/policies/access/",
        ),
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.sourceLedgerViolations).toContainEqual({
      subject: "docs/process/modes/version-up.md",
      reason:
        "version-up source ledger Cloudflare Access policies official URL missing expected https://developers.cloudflare.com/cloudflare-one/access-controls/policies/",
    });
  });

  it("fails when the version-up source ledger checked date is stale", () => {
    // U-SOURCELEDGER-003
    const result = analyzeVersionUpReadiness(
      input({
        modeDoc: input().modeDoc.replace(
          "Version-up source ledger (checked 2026-06-30)",
          "Version-up source ledger (checked 2026-01-01)",
        ),
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.sourceLedgerViolations).toContainEqual({
      subject: "docs/process/modes/version-up.md",
      reason: expect.stringMatching(
        /^Version-up source ledger checked date is stale: 2026-01-01 \(\d+d > 90d\)$/,
      ),
    });
  });

  it("accepts refreshed version-up source ledger checked dates without losing table rows", () => {
    // U-SOURCELEDGER-005
    const refreshedPlan = input().plans[0];
    const result = analyzeVersionUpReadiness(
      input({
        modeDoc: input().modeDoc.replace(
          "Version-up source ledger (checked 2026-06-30)",
          "Version-up source ledger (checked 2026-06-15)",
        ),
        plans: [
          {
            ...refreshedPlan,
            text: refreshedPlan.text
              .replaceAll("checked=2026-06-30", "checked=2026-06-15")
              .replaceAll("checked 2026-06-30", "checked 2026-06-15"),
          },
        ],
      }),
    );

    expect(result.ok).toBe(true);
    expect(result.missingSourceLedgerRows).toEqual([]);
    expect(result.sourceLedgerViolations).toEqual([]);
  });

  it("fails activation records whose source_ledger_freshness date diverges from the current ledger heading", () => {
    const result = analyzeVersionUpReadiness(
      input({
        modeDoc: input().modeDoc.replace(
          "Version-up source ledger (checked 2026-06-30)",
          "Version-up source ledger (checked 2026-06-15)",
        ),
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      subject: "PLAN-L7-900-future",
      reason:
        "source_ledger_freshness checked date 2026-06-30 does not match current Version-up source ledger checked 2026-06-15",
    });
  });

  it("changes activationSnapshot when repoHeadSha changes", () => {
    const first = buildVersionUpActivationPackets(
      input({ repoHeadSha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" }),
    )[0];
    const second = buildVersionUpActivationPackets(
      input({ repoHeadSha: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" }),
    )[0];

    expect(first.activationSnapshot.headSha).toBe("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    expect(second.activationSnapshot.headSha).toBe("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
    expect(first.activationSnapshot.snapshotId).not.toBe(second.activationSnapshot.snapshotId);
  });

  it("checks activation_decision_record.activation_snapshot_id against the current activationSnapshot", () => {
    const base = input({ repoHeadSha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" });
    const placeholderPacket = buildVersionUpActivationPackets(base)[0];
    expect(placeholderPacket.blockedReasons).toContain(
      "activation_decision_record.activation_snapshot_id lacks concrete current activationSnapshot.snapshotId",
    );

    const currentPlan = {
      ...base.plans[0],
      text: base.plans[0].text.replace(
        "- activation_snapshot_id: activationSnapshot.snapshotId",
        `- activation_snapshot_id: activationSnapshot.snapshotId ${placeholderPacket.activationSnapshot.snapshotId}`,
      ),
    };
    const currentPacket = buildVersionUpActivationPackets(
      input({
        repoHeadSha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        plans: [currentPlan],
      }),
    )[0];
    expect(currentPacket.blockedReasons).not.toContain(
      "activation_decision_record.activation_snapshot_id lacks concrete current activationSnapshot.snapshotId",
    );
    expect(currentPacket.blockedReasons).not.toContain(
      "activation_decision_record.activation_snapshot_id does not match current activationSnapshot.snapshotId",
    );

    const stalePlan = {
      ...base.plans[0],
      text: base.plans[0].text.replace(
        "- activation_snapshot_id: activationSnapshot.snapshotId",
        "- activation_snapshot_id: activationSnapshot.snapshotId sha256:1111111111111111111111111111111111111111111111111111111111111111",
      ),
    };
    const stalePacket = buildVersionUpActivationPackets(
      input({
        repoHeadSha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        plans: [stalePlan],
      }),
    )[0];
    expect(stalePacket.blockedReasons).toContain(
      "activation_decision_record.activation_snapshot_id does not match current activationSnapshot.snapshotId",
    );
  });

  it("changes activationSnapshot when cost guardrail evidence changes", () => {
    const first = buildVersionUpActivationPackets(
      input({ repoHeadSha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" }),
    )[0];
    const changedPlan = {
      ...input().plans[0],
      text: input().plans[0].text.replace(
        "- workers_limit: Workers Free request budget must fit read API and Pages Functions usage",
        "- workers_limit: Workers Free request budget changed after source ledger refresh",
      ),
    };
    const second = buildVersionUpActivationPackets(
      input({
        repoHeadSha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        plans: [changedPlan],
      }),
    )[0];

    expect(second.costGuardrails).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          surface: "Cloudflare Workers",
          freeLimit: "Workers Free request budget changed after source ledger refresh",
        }),
      ]),
    );
    expect(first.activationSnapshot.evidenceDigest).not.toBe(
      second.activationSnapshot.evidenceDigest,
    );
    expect(first.activationSnapshot.snapshotId).not.toBe(second.activationSnapshot.snapshotId);
  });

  it("blocks activation packets when the git HEAD sha is unavailable", () => {
    const packet = buildVersionUpActivationPackets(input({ repoHeadSha: null }))[0];

    expect(packet.activationSnapshot.headSha).toBeNull();
    expect(packet.blockedReasons).toContain(
      "activation snapshot is not bound to a readable git HEAD sha",
    );
  });

  it("U-DECISIONREC-002: fails external activation candidates without explicit approval and route-fail evidence", () => {
    const result = analyzeVersionUpReadiness(
      input({
        plans: [
          {
            file: "PLAN-L7-902-external.md",
            plan_id: "PLAN-L7-902-external",
            status: "draft",
            versionTarget: "future",
            text: [
              "version-up parked",
              "mode=version-up",
              "activation",
              "activation_decision_record:",
              "- allowed_outcome: `activate_future_version` / `reject_or_archive` / `keep_parked_with_review_date`",
              "- target_version_or_release_trigger: distribution release tag",
              "- activation_snapshot_id: activationSnapshot.snapshotId",
              "- activation_route: add-feature -> L2/L3/L4/L6/L7",
              "- review_by: PO + TL",
              "parked_review_record:",
              "- review_owner: PO + TL",
              "- review_trigger: distribution landing",
              "- review_by_policy: trigger-bound",
              "- stale_action: keep_parked_with_review_date or reject_or_archive",
              "- activation_dependency: distribution channel",
              "- decision_packet_route: completion packet",
              "version_target",
              "Cloudflare HMAC webhook",
            ].join("\n"),
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toEqual(
      expect.arrayContaining([
        "external activation boundary missing action-binding approval",
        "external activation boundary missing escalation_boundaries",
        "external activation boundary missing approval_scope",
        "external activation boundary missing dry_run_plan",
        "external activation boundary missing rollback_plan",
        "external activation boundary missing exit 1",
        "missing structured external_rehearsal_plan",
        "missing structured cost_guardrails",
        "missing structured activation_provenance_requirements",
      ]),
    );
  });

  it("passes against the live repository and keeps PLAN-L7-146 parked", () => {
    const result = analyzeVersionUpReadiness(loadVersionUpReadinessInput());
    expect(result.ok).toBe(true);
    expect(result.parkedPlanIds).toEqual(["PLAN-L7-146-serverless-readonly-share"]);
    expect(result.missingSourceLedgerRows).toEqual([]);
    expect(result.sourceLedgerViolations).toEqual([]);
  });

  it("exposes live parked work through the CLI activation packet surface", () => {
    const raw = execFileSync(
      "bun",
      [
        "run",
        "src/cli.ts",
        "version-up",
        "activation-packet",
        "--plan",
        "PLAN-L7-146-serverless-readonly-share",
        "--json",
      ],
      { encoding: "utf8" },
    );
    const packets = JSON.parse(raw);
    expect(packets).toHaveLength(1);
    expect(packets[0]).toMatchObject({
      schemaVersion: "version-up-activation-packet.v1",
      planId: "PLAN-L7-146-serverless-readonly-share",
      generatedAt: expect.any(String),
      sourceCommand: "ut-tdd version-up activation-packet --json",
      freshness: {
        validForMinutes: 1440,
        expiresAt: expect.any(String),
        stale: false,
        policy: "decision-packet-freshness.v1",
      },
      status: "parked_pending_activation_decision",
      planOnly: true,
      mustNotApply: true,
      applyCommandAvailable: false,
      activationAllowed: false,
    });
    expect(packets[0].externalBoundaries).toEqual(
      expect.arrayContaining(["Cloudflare", "HMAC", "webhook", "access control", "secret"]),
    );
    expect(packets[0].blockedReasons).toEqual(
      expect.arrayContaining([
        "plan remains version_target parked; activation decision has not been executed",
        "activation_decision_record.activation_snapshot_id lacks concrete current activationSnapshot.snapshotId",
        "missing concrete approve_action_binding outcome",
      ]),
    );
    expect(packets[0].externalRehearsalPlan).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ check: "official_source_basis" }),
        expect.objectContaining({ check: "free_tier_budget_check" }),
        expect.objectContaining({ check: "webhook_signature_check" }),
        expect.objectContaining({ check: "access_control_check" }),
        expect.objectContaining({ check: "no_prod_write_check" }),
      ]),
    );
    expect(packets[0].externalRehearsalPlan.map((item: { check: string }) => item.check)).toEqual([
      "official_source_basis",
      "free_tier_budget_check",
      "webhook_signature_check",
      "access_control_check",
      "no_secret_pii_check",
      "no_prod_write_check",
      "rollback_rehearsal",
    ]);
    expect(packets[0].activationReadinessChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          check: "official_source_basis",
          status: "pending_evidence",
        }),
        expect.objectContaining({
          check: "webhook_signature_check",
          status: "pending_evidence",
        }),
        expect.objectContaining({
          check: "no_prod_write_check",
          status: "pending_evidence",
        }),
        expect.objectContaining({
          check: "approval_evidence",
          status: "pending_evidence",
        }),
        expect.objectContaining({
          check: "dry_run_evidence",
          status: "pending_evidence",
        }),
        expect.objectContaining({
          check: "audit_record",
          status: "pending_evidence",
        }),
        expect.objectContaining({
          check: "pages_limit",
          status: "pending_evidence",
        }),
      ]),
    );
    expect(packets[0].activationReadinessSummary).toMatchObject({
      status: "pending_evidence",
      totalChecks: 17,
      sourceLedgerFresh: true,
      activationAllowed: false,
    });
    expect(packets[0].activationReadinessSummary.pendingCheckNames).toEqual(
      expect.arrayContaining([
        "webhook_signature_check",
        "dry_run_evidence",
        "approval_evidence",
        "audit_record",
        "pages_limit",
        "workers_limit",
        "d1_limit",
        "kv_limit",
        "exceed_action",
      ]),
    );
    expect(packets[0].activationVerificationCommandMatrix).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: "activation-packet-baseline",
          command:
            "bun run src/cli.ts version-up activation-packet --plan PLAN-L7-146-serverless-readonly-share --json",
        }),
        expect.objectContaining({
          phase: "version-dry-run",
          command:
            "bun run src/cli.ts version-up activation-packet --plan PLAN-L7-146-serverless-readonly-share --json",
          expected: expect.stringContaining("concrete SemVer tag"),
        }),
        expect.objectContaining({
          phase: "external-rehearsal",
          command:
            "bun run src/cli.ts version-up rehearsal --plan PLAN-L7-146-serverless-readonly-share --no-write --json",
        }),
        expect.objectContaining({
          phase: "security-testing",
          command:
            "bun run src/cli.ts version-up security-checklist --plan PLAN-L7-146-serverless-readonly-share --no-write --json",
        }),
        expect.objectContaining({
          phase: "state-and-doctor",
          command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor",
          sourceCheckedAt: "2026-07-02",
          sourceStatusDelta: "none; local state projection contract reviewed against current HEAD",
          adoptionDecision: "adopt-current-doctor-and-db-rebuild-as-state-convergence-gate",
          adoptionDecisionDelta: "none; keep db rebuild and doctor as activation review gates",
        }),
        expect.objectContaining({
          phase: "full-regression",
          command: "bun run test",
          sourceCheckedAt: "2026-07-02",
          sourceStatusDelta: "none; local full regression policy reviewed against current HEAD",
          adoptionDecisionDelta: "none; keep full regression as future activation blocker",
          workflowRouteImpact: "none; full regression failure blocks activation review",
        }),
      ]),
    );
    expect(packets[0].reapprovalTriggers.map((row: { trigger: string }) => row.trigger)).toEqual([
      "head_sha_or_release_trigger_drift",
      "approval_scope_or_params_drift",
      "source_ledger_or_external_limit_drift",
      "rehearsal_or_rollback_evidence_drift",
    ]);
    expect(packets[0].blockedReasons).toEqual(
      expect.arrayContaining([
        "activation rehearsal evidence pending: webhook_signature_check",
        "activation rehearsal evidence pending: dry_run_evidence",
        "activation rehearsal evidence pending: approval_evidence",
        "activation rehearsal evidence pending: audit_record",
        "activation rehearsal evidence pending: pages_limit",
      ]),
    );
    expect(packets[0].costGuardrails.map((row: { surface: string }) => row.surface)).toEqual([
      "Cloudflare Pages",
      "Cloudflare Workers",
      "Cloudflare D1",
      "Cloudflare Workers KV",
    ]);
    expect(packets[0].provenanceRequirements.map((row: { item: string }) => row.item)).toEqual([
      "source_ledger",
      "dry_run_evidence",
      "approval_evidence",
      "audit_record",
    ]);
    expect(packets[0].recordTemplates.map((row: { recordName: string }) => row.recordName)).toEqual(
      [
        "activation_decision_record",
        "parked_review_record",
        "external_rehearsal_plan",
        "cost_guardrails",
        "activation_provenance_requirements",
        "action_binding_approval_record",
      ],
    );
    expect(packets[0].sourceLedgerFreshness).toMatchObject({
      ledgerLabel: "Version-up source ledger",
      stale: false,
      rowCount: 16,
      missingRows: [],
    });
    expect(versionUpActivationVerificationCommandViolations(packets[0])).toEqual([]);

    const rehearsalRaw = execFileSync(
      "bun",
      [
        "run",
        "src/cli.ts",
        "version-up",
        "rehearsal",
        "--plan",
        "PLAN-L7-146-serverless-readonly-share",
        "--no-write",
        "--json",
      ],
      { encoding: "utf8" },
    );
    const rehearsal = JSON.parse(rehearsalRaw);
    expect(rehearsal).toMatchObject({
      schemaVersion: "version-up-activation-rehearsal.v1",
      planId: "PLAN-L7-146-serverless-readonly-share",
      planOnly: true,
      mustNotApply: true,
      writePolicy: "no-write",
    });
    expect(rehearsal.activationReadinessChecks.length).toBeGreaterThan(0);

    const securityRaw = execFileSync(
      "bun",
      [
        "run",
        "src/cli.ts",
        "version-up",
        "security-checklist",
        "--plan",
        "PLAN-L7-146-serverless-readonly-share",
        "--no-write",
        "--json",
      ],
      { encoding: "utf8" },
    );
    const security = JSON.parse(securityRaw);
    expect(security).toMatchObject({
      schemaVersion: "version-up-security-checklist.v1",
      planId: "PLAN-L7-146-serverless-readonly-share",
      planOnly: true,
      mustNotApply: true,
      writePolicy: "no-write",
    });
    expect(security.securityChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ check: "github-actions-least-privilege" }),
        expect.objectContaining({ check: "pull-request-target-risk-review" }),
        expect.objectContaining({ check: "access-control-and-secret-exposure" }),
      ]),
    );

    const text = execFileSync(
      "bun",
      [
        "run",
        "src/cli.ts",
        "version-up",
        "activation-packet",
        "--plan",
        "PLAN-L7-146-serverless-readonly-share",
      ],
      { encoding: "utf8" },
    );
    expect(text).toContain("activation-snapshot: snapshotId=sha256:");
    expect(text).toContain("sourceLedgerCheckedDate=");
    expect(text).toContain("readiness: status=pending_evidence");
    expect(text).toContain("total=17");
    expect(text).toContain("verification-commands=9");
    expect(text).toContain("record-template activation_decision_record");
    expect(text).toContain("record-template action_binding_approval_record");
    expect(text).toContain(
      "verification-source: external-rehearsal source=GitHub Actions secure use and pull_request_target guidance sourceUrl=https://docs.github.com/en/actions/reference/security/secure-use checked=2026-07-02",
    );
    expect(text).toContain("adoption=adopt-live-docs-for-least-privilege-token-scope");
    expect(text).toContain("statusDelta=none; official GitHub Actions security guidance");
    expect(text).toContain("adoptionDelta=none; keep activation workflow hardening");
    expect(text).toContain("routeImpact=none; missing concrete rehearsal evidence keeps");
    expect(text).toContain(
      "verification-source: security-testing source=OWASP Web Security Testing Guide sourceUrl=https://owasp.org/www-project-web-security-testing-guide/ checked=2026-07-02",
    );
    expect(text).toContain(
      "verification-source: approval-packet source=GitHub Environments required reviewers sourceUrl=https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments checked=2026-07-02",
    );
    expect(text).toContain("readiness-pending: webhook_signature_check");
    expect(text).toContain("readiness-pending: pages_limit");
    expect(text).toContain("reapproval-trigger: head_sha_or_release_trigger_drift");
  });

  it("exposes version-up dry-run through the CLI as JSON", () => {
    const raw = execFileSync(
      "bun",
      [
        "run",
        "src/cli.ts",
        "version-up",
        "dry-run",
        "--current",
        "v0.1.0",
        "--target",
        "v0.2.0",
        "--json",
      ],
      { encoding: "utf8" },
    );
    const plan = JSON.parse(raw);
    expect(plan).toMatchObject({
      schemaVersion: "version-up-dry-run-plan.v1",
      ok: false,
      planOnly: true,
      applyCommandAvailable: false,
      semverChange: "minor",
      releaseTagRef: "refs/tags/v0.2.0",
      releaseTagExists: false,
      releaseTriggerResolved: false,
    });
    expect(plan.blockedReasons).toContain("target release tag must exist before activation");
  });

  it("resolves Pack release tags through an explicit remote in the CLI dry-run", () => {
    const binDir = mkdtempSync(join(tmpdir(), "ut-tdd-version-up-remote-tag-"));
    try {
      writeFakeRemoteTagGit(binDir, "v0.1.3");
      const raw = execFileSync(
        "bun",
        [
          "run",
          "src/cli.ts",
          "version-up",
          "dry-run",
          "--current",
          "v0.1.0",
          "--target",
          "v0.1.3",
          "--release-remote",
          "https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git",
          "--json",
        ],
        {
          encoding: "utf8",
          env: {
            ...process.env,
            PATH: `${binDir}${process.platform === "win32" ? ";" : ":"}${process.env.PATH ?? ""}`,
          },
        },
      );
      const plan = JSON.parse(raw);

      expect(plan).toMatchObject({
        schemaVersion: "version-up-dry-run-plan.v1",
        ok: true,
        semverChange: "patch",
        releaseTagRef: "refs/tags/v0.1.3",
        releaseTagSource: "remote",
        releaseTagCheckCommand:
          "git ls-remote --tags https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git refs/tags/v0.1.3",
        releaseTagExists: true,
        releaseTriggerResolved: true,
        applyCommandAvailable: false,
      });
      expect(plan.migrationPlan).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            step: "compare_current_target",
            command:
              "ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json",
          }),
        ]),
      );
      expect(plan.idempotencyChecks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            check: "repeat_dry_run_has_no_state_change",
            command:
              "ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json",
          }),
        ]),
      );
      expect(plan.blockedReasons).toEqual([]);
    } finally {
      rmSync(binDir, { recursive: true, force: true });
    }
  });
});
