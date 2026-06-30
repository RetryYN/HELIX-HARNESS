import { describe, expect, it } from "vitest";
import {
  analyzeVersionUpReadiness,
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
      "adopted version/date",
      "latest official status",
      "adoption decision",
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
          "- stale_action: keep parked",
          "- activation_dependency: distribution channel",
          "- decision_packet_route: completion packet",
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
              "- stale_action: keep parked",
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
});
