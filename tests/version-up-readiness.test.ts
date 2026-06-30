import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import {
  analyzeVersionUpReadiness,
  buildVersionUpActivationPackets,
  buildVersionUpgradeDryRunPlan,
  loadVersionUpReadinessInput,
  type VersionUpReadinessInput,
  versionUpReadinessMessages,
} from "../src/lint/version-up-readiness";

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
      "external_rehearsal_plan",
      "cost_guardrails",
      "activation_provenance_requirements",
      "adopted version/date",
      "latest official status",
      "adoption decision",
      "source_status_delta",
      "adoption_decision_delta",
      "workflow_route_impact",
      "date-only refresh",
      "action-binding approval",
      "escalation_boundaries",
      "Version-up source ledger (checked 2026-06-30)",
      "| source | official URL | adopted version/date | latest official status | adoption decision | version-up use | required field impact |",
      "|---|---|---|---|---|---|---|",
      "| Semantic Versioning 2.0.0 | https://semver.org/ | 2.0.0 | current official specification page | adopt-2.0.0 | compatibility intent | version_target target_version_or_release_trigger |",
      "| GitHub Releases | https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository | live GitHub docs | live official GitHub docs | adopt-live-docs-for-release-trigger | release/tag trigger | target_version_or_release_trigger review_trigger |",
      "| GitHub Environments required reviewers | https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments | live GitHub docs | live official GitHub docs | adopt-live-docs-for-approval-shape | action-binding approval | review_owner |",
      "| NIST SSDF SP 800-218 | https://csrc.nist.gov/pubs/sp/800/218/final / https://csrc.nist.gov/pubs/sp/800/218/r1/ipd | final publication 1.1 | Rev. 1 initial public draft v1.2 | adopt-final-1.1; track-draft-do-not-adopt-until-final | rollback traceability | rollback_plan |",
      "| semantic-release | https://semantic-release.gitbook.io/semantic-release | live official docs | live official docs | compare-only-until-release-ADR | release automation candidate | release automation ADR |",
      "| Release Please | https://github.com/googleapis/release-please | live official repository docs | live official repository docs | compare-only-until-release-ADR | release PR candidate | release automation ADR |",
      "| GitHub Rulesets | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets | live GitHub docs | live official GitHub docs | adopt-live-docs-for-gated-push-design | gated push | approval_scope |",
      "| GitHub Merge Queue | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue | live GitHub docs | live official GitHub docs | adopt-live-docs-for-merge-readiness | merge readiness | activation_route activation_dependency |",
      "| Cloudflare Pages limits | https://developers.cloudflare.com/pages/platform/limits/ | live Cloudflare docs | live official Cloudflare docs | adopt-live-docs-for-static-hosting-budget | $0 static SPA budget check | cost_guardrails pages_limit external_rehearsal_plan |",
      "| Cloudflare Workers limits | https://developers.cloudflare.com/workers/platform/limits/ | live Cloudflare docs | live official Cloudflare docs | adopt-live-docs-for-worker-budget | read API request budget | cost_guardrails workers_limit external_rehearsal_plan |",
      "| Cloudflare D1 limits | https://developers.cloudflare.com/d1/platform/limits/ | live Cloudflare docs | live official Cloudflare docs | adopt-live-docs-for-projection-db-budget | projection DB budget | cost_guardrails d1_limit external_rehearsal_plan |",
      "| Cloudflare Workers KV limits | https://developers.cloudflare.com/kv/platform/limits/ | live Cloudflare docs | live official Cloudflare docs | adopt-live-docs-for-projection-cache-budget | projection cache budget | cost_guardrails kv_limit external_rehearsal_plan |",
      "| Cloudflare Access policies | https://developers.cloudflare.com/cloudflare-one/policies/access/ | live Cloudflare docs | live official Cloudflare docs | adopt-live-docs-for-viewer-access-control | read-only dashboard access control | external_rehearsal_plan access_control_check |",
      "| GitHub webhook HMAC SHA-256 | https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries | live GitHub docs | live official GitHub docs | adopt-live-docs-for-webhook-signature | webhook authenticity rehearsal | external_rehearsal_plan webhook_signature_check |",
    ].join("\n"),
    discoveryPlan: "decision_outcome: confirmed\nactivation note (2026-06-30)",
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
          "- activation_route: add-feature -> L2/L3/L4/L6/L7",
          "- review_by: PO + TL",
          "- approval_scope: Cloudflare HMAC webhook",
          "- dry_run_plan: dry-run projection",
          "- rollback_plan: disable binding",
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
          "- rollback_rehearsal: disable binding and rebuild projection from GitHub source",
          "cost_guardrails:",
          "- pages_limit: Cloudflare Pages official limits must fit static SPA artifact",
          "- workers_limit: Workers Free request budget must fit read API and Pages Functions usage",
          "- d1_limit: D1 free storage/query budget must fit projection DB",
          "- kv_limit: Workers KV free read/write/storage budget must fit projection cache",
          "- exceed_action: keep_parked_with_review_date or request_scope_reduction; never silent paid upgrade",
          "activation_provenance_requirements:",
          "- source_ledger: version-up source ledger checked at activation review date",
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

  it("emits a non-destructive activation packet for parked version-up plans", () => {
    const packets = buildVersionUpActivationPackets(input());
    expect(packets).toHaveLength(1);
    const packet = packets[0];

    expect(packet.schemaVersion).toBe("version-up-activation-packet.v1");
    expect(packet.planId).toBe("PLAN-L7-900-future");
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
          check: "webhook_signature_check",
          evidence: expect.stringContaining("X-Hub-Signature-256"),
        }),
        expect.objectContaining({
          check: "access_control_check",
          source: "Cloudflare Access policy testing",
        }),
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
  });

  it("emits a non-destructive version upgrade dry-run plan with rollback and idempotency evidence", () => {
    const plan = buildVersionUpgradeDryRunPlan({
      currentVersion: "v0.1.0",
      targetVersion: "v0.2.0",
      releaseTrigger: "GitHub release tag v0.2.0",
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
    });
    expect(plan.migrationPlan).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          step: "compare_current_target",
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
        expect.objectContaining({ check: "repeat_dry_run_has_no_state_change" }),
      ]),
    );
    expect(plan.releaseGateChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ check: "release_tag_exists" }),
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

    const prerelease = buildVersionUpgradeDryRunPlan({
      currentVersion: "v1.0.0-alpha.1",
      targetVersion: "v1.0.0-alpha.2",
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
      reason: "Version-up source ledger checked date is stale: 2026-01-01 (180d > 90d)",
    });
  });

  it("accepts refreshed version-up source ledger checked dates without losing table rows", () => {
    // U-SOURCELEDGER-005
    const result = analyzeVersionUpReadiness(
      input({
        modeDoc: input().modeDoc.replace(
          "Version-up source ledger (checked 2026-06-30)",
          "Version-up source ledger (checked 2026-06-15)",
        ),
      }),
    );

    expect(result.ok).toBe(true);
    expect(result.missingSourceLedgerRows).toEqual([]);
    expect(result.sourceLedgerViolations).toEqual([]);
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
        "missing concrete approve_action_binding outcome",
      ]),
    );
    expect(packets[0].externalRehearsalPlan).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ check: "free_tier_budget_check" }),
        expect.objectContaining({ check: "webhook_signature_check" }),
        expect.objectContaining({ check: "access_control_check" }),
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
      ok: true,
      planOnly: true,
      applyCommandAvailable: false,
      semverChange: "minor",
    });
  });
});
