import { describe, expect, it } from "vitest";
import {
  actionBindingApprovalReadinessMessages,
  actionBindingApprovalVerificationCommandViolations,
  analyzeActionBindingApprovalReadiness,
  buildActionBindingApprovalPackets,
  loadActionBindingApprovalReadinessInput,
} from "../src/lint/action-binding-approval-readiness";
import { buildVersionUpActivationPackets } from "../src/lint/version-up-readiness";
import { classifyHighImpactApprovalRequirement } from "../src/lint/workflow-decision-packets";

const RIGHT_ARM = [
  "Action-binding approval decision record",
  "action_binding_approval_record",
  "allowed_outcome",
  "approval_policy_or_named_approver",
  "approval_scope",
  "approved_actor",
  "approved_tool",
  "approved_target",
  "approved_params",
  "review_approval_evidence",
  "reviewed_snapshot_binding",
  "expires_at_or_trigger",
  "audit_record",
  "action-binding-approval-packet.v1",
  "planOnly=true",
  "mustNotApprove=true",
  "approvalCommandAvailable=false",
  "approvalAllowed=false",
  "approvalBindingChecks",
  "approvalVerificationCommandMatrix",
  "GitHub Environments required reviewers",
  "OWASP LLM06:2025 Excessive Agency",
].join("\n");

const OUTSTANDING = [
  "action_binding_approval_record with allowed_outcome, approval_policy_or_named_approver, approval_scope, approved_actor, approved_tool, approved_target, approved_params, review_approval_evidence, reviewed_snapshot_binding, expires_at_or_trigger, and audit_record",
  "approval scope binds approved_actor/approved_tool/approved_target/approved_params before activation",
  "review/approval evidence, reviewed snapshot binding, and expiry or trigger condition recorded before activation",
].join("\n");

const RECORD = [
  "action_binding_approval_record:",
  "- allowed_outcome: `approve_action_binding` / `deny_action` / `request_scope_reduction`",
  "- approval_policy_or_named_approver: PO approval policy",
  "- approval_scope: limited scope for actor/tool/target/params for a high-impact action only",
  "- approved_actor: PO-named operator",
  "- approved_tool: helix CLI action wrapper",
  "- approved_target: Cloudflare deployment target",
  "- approved_params: reviewed command parameters hash",
  "- review_approval_evidence: .helix/evidence/action-binding/review.json result=pass",
  "- reviewed_snapshot_binding: no snapshot-bearing packet applies to this approval",
  "- expires_at_or_trigger: before activation or scope change",
  "- audit_record: .helix/audit/A-123-action-binding.json approver action command result incident route",
].join("\n");

const VERSION_UP_MODE_DOC = "Version-up source ledger (checked 2026-06-30)";
const ACTION_BINDING_TEST_HEAD_SHA = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const NEXT_ACTION_BINDING_TEST_HEAD_SHA = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

function semanticRecord(
  planId: string,
  featureId: string,
  classification: "frontier_pending_decision" | "parked_future_version" | "approval_gated_cutover",
) {
  return {
    recordName: "semantic_feature_frontier_record" as const,
    planId,
    featureId,
    classification,
    completionClaimAllowed: false as const,
    blockers:
      classification === "frontier_pending_decision"
        ? ["human_approval_pending", "po_decision_pending"]
        : classification === "parked_future_version"
          ? ["human_approval_pending", "version_up_parked"]
          : ["human_approval_pending", "irreversible_migration_pending"],
    requiredRoute:
      classification === "frontier_pending_decision"
        ? "S4 decide -> Reverse/Forward merge only after decision_outcome is recorded"
        : classification === "parked_future_version"
          ? "version-up activation -> add-feature/rejection path, with approval boundary preserved"
          : "L14 cutover -> cutover_decision_record + dry-run/rollback/state backup/audit before apply",
    reason:
      classification === "frontier_pending_decision"
        ? "po_decision_pending"
        : classification === "parked_future_version"
          ? "version_up_parked"
          : "irreversible_migration_pending",
    sourcePaths: [
      "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      classification === "parked_future_version"
        ? "docs/process/modes/version-up.md"
        : classification === "approval_gated_cutover"
          ? "docs/process/forward/L08-L14-verification-phase.md"
          : "docs/process/modes/discovery.md",
    ],
  };
}

function versionUpPlanWithSnapshot(snapshotId: string) {
  return {
    file: "PLAN-L7-146.md",
    plan_id: "PLAN-L7-146",
    status: "draft",
    versionTarget: "future",
    text: `requires action-binding approval\n${RECORD.replace(
      "no snapshot-bearing packet applies to this approval",
      `activationSnapshot.snapshotId ${snapshotId}`,
    )}`,
  };
}

function currentVersionUpSnapshotId(
  plan = versionUpPlanWithSnapshot("sha256:0".padEnd(71, "0")),
  repoHeadSha: string | null = null,
) {
  return buildVersionUpActivationPackets({
    charter: "",
    pillarRequirements: "",
    functionalDesign: "",
    modeDoc: VERSION_UP_MODE_DOC,
    discoveryPlan: "",
    currentVersion: "0.1.0",
    repoHeadSha,
    plans: [plan],
  })[0].activationSnapshot.snapshotId;
}

describe("action-binding approval readiness", () => {
  it("classifies high-impact approval requirements by shared sentence context", () => {
    expect(
      classifyHighImpactApprovalRequirement(
        [
          "approval_scope: docs-only review boundary.",
          "review_approval_evidence: approval packet template.",
          "Cloudflare source ledger row is mentioned as reference material.",
        ].join("\n"),
      ).required,
    ).toBe(false);
    expect(
      classifyHighImpactApprovalRequirement(
        "production auth infrastructure deploy requires PO signoff before execution",
      ),
    ).toMatchObject({
      required: true,
      reason: "high_impact_action_binding_required",
    });
    expect(
      classifyHighImpactApprovalRequirement("S4 decision pending and requires human approval.")
        .required,
    ).toBe(false);
    expect(
      classifyHighImpactApprovalRequirement("future activation requires action-binding approval."),
    ).toMatchObject({
      required: true,
      reason: "high_impact_action_binding_required",
    });
  });

  it("accepts pending high-impact approval plans only when they carry structured records", () => {
    const result = analyzeActionBindingApprovalReadiness({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [
        {
          file: "PLAN-X.md",
          plan_id: "PLAN-X",
          status: "draft",
          text: `requires action-binding approval\n${RECORD}`,
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.pendingPlanIds).toEqual(["PLAN-X"]);
    expect(actionBindingApprovalReadinessMessages(result)[0]).toContain(
      "action-binding-approval-readiness - OK",
    );
  });

  it("validates terminal high-impact approval records without emitting terminal packets", () => {
    const plans = [
      {
        file: "PLAN-CONFIRMED.md",
        plan_id: "PLAN-CONFIRMED",
        status: "confirmed",
        text: "requires action-binding approval before deployment",
      },
      {
        file: "PLAN-COMPLETED.md",
        plan_id: "PLAN-COMPLETED",
        status: "completed",
        text: "requires action-binding approval before deployment",
      },
      {
        file: "PLAN-ACCEPTED.md",
        plan_id: "PLAN-ACCEPTED",
        status: "accepted",
        text: "requires action-binding approval before deployment",
      },
      {
        file: "PLAN-ARCHIVED.md",
        plan_id: "PLAN-ARCHIVED",
        status: "archived",
        text: "requires action-binding approval before deployment",
      },
      {
        file: "PLAN-MERGED.md",
        plan_id: "PLAN-MERGED",
        status: "merged",
        text: "requires action-binding approval before deployment",
      },
    ];
    const result = analyzeActionBindingApprovalReadiness({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans,
    });

    expect(result.pendingPlanIds).toEqual(["PLAN-MERGED"]);
    expect(result.ok).toBe(false);
    for (const subject of ["PLAN-CONFIRMED", "PLAN-COMPLETED", "PLAN-ACCEPTED", "PLAN-MERGED"]) {
      expect(result.violations).toContainEqual({
        subject,
        reason: "missing structured action_binding_approval_record",
      });
    }
    expect(result.violations.some((violation) => violation.subject === "PLAN-ARCHIVED")).toBe(
      false,
    );

    const packets = buildActionBindingApprovalPackets({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans,
    });
    expect(packets.map((packet) => packet.planId)).toEqual(["PLAN-MERGED"]);
  });

  it("U-DECISIONREC-014: emits non-destructive approval verification matrices that keep high-impact execution human-gated", () => {
    const packets = buildActionBindingApprovalPackets({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [
        {
          file: "PLAN-X.md",
          plan_id: "PLAN-X",
          status: "draft",
          text: `requires action-binding approval\n${RECORD}`,
        },
      ],
    });

    expect(packets).toHaveLength(1);
    const packet = packets[0];
    expect(packet).toMatchObject({
      schemaVersion: "action-binding-approval-packet.v1",
      planId: "PLAN-X",
      status: "pending_action_binding_approval",
      planOnly: true,
      mustNotApprove: true,
      approvalCommandAvailable: false,
      approvalAllowed: false,
      allowedOutcomes: ["approve_action_binding", "deny_action", "request_scope_reduction"],
      generatedAt: expect.any(String),
      sourceCommand: "helix action-binding approval-packet --json",
      freshness: {
        validForMinutes: 1440,
        expiresAt: expect.any(String),
        stale: false,
        policy: "decision-packet-freshness.v1",
      },
    });
    expect(packet.approvalRecord.approved_actor).toBe("PO-named operator");
    expect(packet.approvalBindingChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "allowed_outcome",
          status: "pending",
          reason: "allowed_outcome lists the enum but does not select a decision outcome",
        }),
        expect.objectContaining({
          field: "approved_actor",
          status: "concrete",
        }),
      ]),
    );
    expect(packet.recordTemplates).toEqual([
      expect.objectContaining({
        recordName: "action_binding_approval_record",
        yamlLines: expect.arrayContaining([
          "action_binding_approval_record:",
          '  - approved_actor: "<approved_actor>"',
          '  - approved_tool: "<approved_tool>"',
          '  - approved_target: "<approved_target>"',
          '  - approved_params: "<approved_params>"',
        ]),
      }),
    ]);
    expect(packet.approvalSnapshot).toMatchObject({
      snapshotId: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
      planTextDigest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
      approvalScopeDigest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
      reviewEvidenceDigest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
      auditDigest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
      siblingDecisionPacketDigest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
      reviewedSnapshotId: null,
      reviewedSnapshotKind: "no-snapshot",
      headSha: null,
      invalidatedBy: expect.arrayContaining([
        "approval_scope_change",
        "review_evidence_change",
        "audit_record_change",
        "sibling_decision_packet_change",
      ]),
    });
    expect(packet.approvalVerificationCommandMatrix).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: "approval-packet-baseline",
          command: "bun run src/cli.ts action-binding approval-packet --plan PLAN-X --json",
          evidence: "action-binding approval packet JSON attached to the approval review",
          sourceCheckedAt: "2026-07-02",
          adoptionDecision: "adopt-current-action-binding-packet-for-approval-review",
        }),
        expect.objectContaining({
          phase: "least-privilege-binding",
          command: "bun run src/cli.ts action-binding approval-packet --plan PLAN-X --json",
          expected:
            "approval scope is limited to the named actor/tool/target/params and does not grant broad or wildcard authority",
          sourceUrl: "https://csrc.nist.gov/glossary/term/least_privilege",
          workflowRouteImpact: expect.stringContaining("request_scope_reduction"),
        }),
        expect.objectContaining({
          phase: "snapshot-binding",
          command: "bun run src/cli.ts action-binding approval-packet --plan PLAN-X --json",
          expected:
            "snapshot-bound approvals cite the current sha256 snapshot id and stale snapshot ids remain blocked",
          sourceUrl:
            "https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments",
          latestOfficialStatus: expect.stringContaining("prevent self-review"),
          adoptionDecision: "adopt-required-reviewer-and-current-snapshot-binding",
        }),
        expect.objectContaining({
          phase: "github-environment-approval-boundary",
          command:
            "bun run src/cli.ts version-up security-checklist --plan PLAN-X --no-write --json",
          expected: expect.stringContaining("repository visibility"),
          evidence: expect.stringContaining("required reviewers"),
          sourceUrl:
            "https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments",
          adoptionDecision: "adopt-github-environments-only-as-evidence-bound-approval-boundary",
        }),
        expect.objectContaining({
          phase: "security-boundary",
          command: "bun run src/cli.ts doctor",
          sourceUrl: "https://code.visualstudio.com/docs/editing/workspaces/workspace-trust",
          adoptionDecision: "adopt-workspace-trust-as-local-execution-boundary",
        }),
        expect.objectContaining({
          phase: "web-security-testing-boundary",
          command: "bun run src/cli.ts action-binding approval-packet --plan PLAN-X --json",
          source: "OWASP Web Security Testing Guide",
          sourceUrl: "https://owasp.org/www-project-web-security-testing-guide/",
          adoptionDecision: "adopt-wstg-as-web-security-testing-boundary-for-action-approval",
        }),
      ]),
    );
    expect(actionBindingApprovalVerificationCommandViolations(packet)).toEqual([]);
    expect(
      actionBindingApprovalVerificationCommandViolations({
        ...packet,
        approvalVerificationCommandMatrix: packet.approvalVerificationCommandMatrix.map((row) =>
          row.phase === "least-privilege-binding"
            ? {
                ...row,
                command:
                  "review approvalBindingChecks[] for concrete approved_actor and approved_tool",
              }
            : row,
        ),
      }),
    ).toEqual([
      {
        subject: "PLAN-X.least-privilege-binding",
        reason:
          "approvalVerificationCommandMatrix command is not an executable approved surface: review approvalBindingChecks[] for concrete approved_actor and approved_tool",
      },
    ]);
    expect(
      actionBindingApprovalVerificationCommandViolations({
        ...packet,
        approvalVerificationCommandMatrix: packet.approvalVerificationCommandMatrix.map((row) =>
          row.phase === "least-privilege-binding"
            ? {
                ...row,
                sourceCheckedAt: "2026-01-01",
              }
            : row,
        ),
      }),
    ).toEqual([
      {
        subject: "PLAN-X.least-privilege-binding",
        reason: expect.stringMatching(
          /^approvalVerificationCommandMatrix sourceCheckedAt is stale: 2026-01-01 \(\d+d > 90d\)$/,
        ),
      },
    ]);
    expect(
      actionBindingApprovalVerificationCommandViolations({
        ...packet,
        approvalVerificationCommandMatrix: packet.approvalVerificationCommandMatrix.map((row) =>
          row.phase === "least-privilege-binding"
            ? {
                ...row,
                sourceCheckedAt: "2999-01-01",
              }
            : row,
        ),
      }),
    ).toEqual([
      {
        subject: "PLAN-X.least-privilege-binding",
        reason: "approvalVerificationCommandMatrix sourceCheckedAt is in the future: 2999-01-01",
      },
    ]);
    expect(
      actionBindingApprovalVerificationCommandViolations({
        ...packet,
        approvalVerificationCommandMatrix: packet.approvalVerificationCommandMatrix.map((row) =>
          row.phase === "least-privilege-binding"
            ? {
                ...row,
                latestOfficialStatus: "TODO",
                workflowRouteImpact: "-",
              }
            : row,
        ),
      }),
    ).toEqual([
      {
        subject: "PLAN-X.least-privilege-binding",
        reason: "approvalVerificationCommandMatrix latestOfficialStatus is missing or placeholder",
      },
      {
        subject: "PLAN-X.least-privilege-binding",
        reason: "approvalVerificationCommandMatrix workflowRouteImpact is missing or placeholder",
      },
    ]);
    for (const row of packet.approvalVerificationCommandMatrix) {
      expect(row.sourceCheckedAt, row.phase).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(row.latestOfficialStatus, row.phase).not.toBe("");
      expect(row.sourceStatusDelta, row.phase).not.toBe("");
      expect(row.adoptionDecision, row.phase).not.toBe("");
      expect(row.adoptionDecisionDelta, row.phase).not.toBe("");
      expect(row.workflowRouteImpact, row.phase).not.toBe("");
    }
    expect(packet.blockedReasons).toEqual(
      expect.arrayContaining([
        "plan carries high-impact approval scope; execution remains human-gated",
        "missing concrete approve_action_binding decision",
      ]),
    );
    expect(packet.nextWorkflowRoutes.map((route) => route.outcome)).toEqual([
      "approve_action_binding",
      "deny_action",
      "request_scope_reduction",
    ]);
    expect(packet.relatedDecisionPackets).toEqual([
      expect.objectContaining({
        role: "primary",
        command: "helix action-binding approval-packet --json",
        scopedCommand: "helix action-binding approval-packet --json --plan PLAN-X",
      }),
    ]);
  });

  it("U-OUTSTANDING-011: keeps sibling S4, version-up, and rename decision packets visible", () => {
    const packets = buildActionBindingApprovalPackets({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      semanticFeatureFrontierRecords: [
        semanticRecord(
          "PLAN-DISCOVERY-10",
          "asset_progress_visualization",
          "frontier_pending_decision",
        ),
        semanticRecord("PLAN-L7-146", "serverless_readonly_share", "parked_future_version"),
        semanticRecord(
          "PLAN-M-02-helix-identifier-rename",
          "name_cutover",
          "approval_gated_cutover",
        ),
      ],
      plans: [
        {
          file: "PLAN-DISCOVERY-10.md",
          plan_id: "PLAN-DISCOVERY-10",
          kind: "poc",
          status: "draft",
          workflowPhase: "S3",
          decisionOutcome: null,
          text: `requires action-binding approval\n${RECORD}`,
        },
        {
          file: "PLAN-L7-146.md",
          plan_id: "PLAN-L7-146",
          status: "draft",
          versionTarget: "future",
          text: `requires action-binding approval\n${RECORD}`,
        },
        {
          file: "PLAN-M-02.md",
          plan_id: "PLAN-M-02-helix-identifier-rename",
          status: "draft",
          text: `identifier rename cutover_decision_record requires action-binding approval\n${RECORD}`,
        },
      ],
    });

    expect(packets.find((p) => p.planId === "PLAN-DISCOVERY-10")?.relatedDecisionPackets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          command: "helix s4 decision-packet --json",
          scopedCommand: "helix s4 decision-packet --json --plan PLAN-DISCOVERY-10",
        }),
      ]),
    );
    expect(
      packets.find((p) => p.planId === "PLAN-DISCOVERY-10")?.semanticFeatureFrontierRecords,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          featureId: "asset_progress_visualization",
          classification: "frontier_pending_decision",
        }),
      ]),
    );
    expect(packets.find((p) => p.planId === "PLAN-L7-146")?.relatedDecisionPackets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          command: "helix version-up activation-packet --json",
          scopedCommand: "helix version-up activation-packet --json --plan PLAN-L7-146",
        }),
      ]),
    );
    expect(packets.find((p) => p.planId === "PLAN-L7-146")?.semanticFeatureFrontierRecords).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          featureId: "serverless_readonly_share",
          classification: "parked_future_version",
        }),
      ]),
    );
    expect(
      packets.find((p) => p.planId === "PLAN-M-02-helix-identifier-rename")?.relatedDecisionPackets,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          command: "helix rename plan --json",
          scopedCommand: "helix rename plan --json",
        }),
      ]),
    );
    expect(
      packets.find((p) => p.planId === "PLAN-M-02-helix-identifier-rename")
        ?.semanticFeatureFrontierRecords,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          featureId: "name_cutover",
          classification: "approval_gated_cutover",
        }),
      ]),
    );
  });

  it("fails sibling action-binding packets that are detached from semantic frontier records", () => {
    const result = analyzeActionBindingApprovalReadiness({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      semanticFeatureFrontierRecords: [],
      plans: [
        {
          file: "PLAN-L7-146.md",
          plan_id: "PLAN-L7-146",
          status: "draft",
          versionTarget: "future",
          text: `requires action-binding approval\n${RECORD}`,
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      subject: "PLAN-L7-146",
      reason: "missing semantic_feature_frontier_record for parked_future_version",
    });
  });

  it("changes approvalSnapshot when approval material changes", () => {
    const basePlan = {
      file: "PLAN-X.md",
      plan_id: "PLAN-X",
      status: "draft",
      versionTarget: null,
      text: `requires action-binding approval\n${RECORD}`,
    };
    const changedParamsPlan = {
      ...basePlan,
      text: basePlan.text.replace(
        "- approved_params: reviewed command parameters hash",
        "- approved_params: narrowed command parameters hash",
      ),
    };
    const changedReviewPlan = {
      ...basePlan,
      text: basePlan.text.replace(
        "- review_approval_evidence: .helix/evidence/action-binding/review.json result=pass",
        "- review_approval_evidence: .helix/evidence/action-binding/review-v2.json result=pass",
      ),
    };
    const [basePacket] = buildActionBindingApprovalPackets({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [basePlan],
    });
    const [changedParamsPacket] = buildActionBindingApprovalPackets({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [changedParamsPlan],
    });
    const [changedReviewPacket] = buildActionBindingApprovalPackets({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [changedReviewPlan],
    });

    expect(changedParamsPacket.approvalSnapshot.approvalScopeDigest).not.toBe(
      basePacket.approvalSnapshot.approvalScopeDigest,
    );
    expect(changedParamsPacket.approvalSnapshot.snapshotId).not.toBe(
      basePacket.approvalSnapshot.snapshotId,
    );
    expect(changedReviewPacket.approvalSnapshot.reviewEvidenceDigest).not.toBe(
      basePacket.approvalSnapshot.reviewEvidenceDigest,
    );
    expect(changedReviewPacket.approvalSnapshot.snapshotId).not.toBe(
      basePacket.approvalSnapshot.snapshotId,
    );
  });

  it("fails sibling action-binding semantic frontier records with wrong classification", () => {
    const result = analyzeActionBindingApprovalReadiness({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      semanticFeatureFrontierRecords: [
        semanticRecord(
          "PLAN-M-02-helix-identifier-rename",
          "name_cutover",
          "parked_future_version",
        ),
      ],
      plans: [
        {
          file: "PLAN-M-02.md",
          plan_id: "PLAN-M-02-helix-identifier-rename",
          status: "draft",
          text: `identifier rename cutover_decision_record requires action-binding approval\n${RECORD}`,
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      subject: "PLAN-M-02-helix-identifier-rename",
      reason:
        "semantic_feature_frontier_record classification parked_future_version expected approval_gated_cutover",
    });
  });

  it("rejects prose-only approval mentions", () => {
    const result = analyzeActionBindingApprovalReadiness({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [
        {
          file: "PLAN-X.md",
          plan_id: "PLAN-X",
          status: "draft",
          text: "requires action-binding approval before Cloudflare activation",
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        { subject: "PLAN-X", reason: "missing structured action_binding_approval_record" },
        { subject: "PLAN-X", reason: "missing structured allowed_outcome" },
        { subject: "PLAN-X", reason: "missing structured approval_scope" },
        { subject: "PLAN-X", reason: "missing structured approved_actor" },
        { subject: "PLAN-X", reason: "missing structured approved_tool" },
        { subject: "PLAN-X", reason: "missing structured approved_target" },
        { subject: "PLAN-X", reason: "missing structured approved_params" },
      ]),
    );
  });

  it("detects the Japanese high-impact action-binding wording emitted by status and handover", () => {
    const planText = [
      "requiredActionJa: 高影響 action の実行前に human/action-binding approval を記録する",
      "外部 API 設定変更と本番 infrastructure activation は未承認のため実行しない。",
    ].join("\n");
    const input = {
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [
        {
          file: "PLAN-JA.md",
          plan_id: "PLAN-JA",
          status: "draft",
          text: planText,
        },
      ],
    };
    const result = analyzeActionBindingApprovalReadiness(input);
    const packets = buildActionBindingApprovalPackets(input);

    expect(result.ok).toBe(false);
    expect(result.pendingPlanIds).toEqual(["PLAN-JA"]);
    expect(result.violations).toContainEqual({
      subject: "PLAN-JA",
      reason: "missing structured action_binding_approval_record",
    });
    expect(packets).toHaveLength(1);
    expect(packets[0]).toMatchObject({
      planId: "PLAN-JA",
      status: "pending_action_binding_approval",
      approvalAllowed: false,
    });
  });

  it("rejects approval records whose allowed_outcome set drifts from the design enum", () => {
    const result = analyzeActionBindingApprovalReadiness({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [
        {
          file: "PLAN-X.md",
          plan_id: "PLAN-X",
          status: "draft",
          text: `requires action-binding approval\n${RECORD.replace(
            "`approve_action_binding` / `deny_action` / `request_scope_reduction`",
            "`approve_action_binding` / `approve_everything`",
          )}`,
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain(
      "invalid allowed_outcome set for action_binding_approval_record: missing allowed_outcome deny_action,request_scope_reduction; unknown allowed_outcome approve_everything",
    );
  });

  it("U-DECISIONREC-009: rejects action-binding records that grant broad approvals or omit review/audit semantics", () => {
    const weakRecord = [
      "action_binding_approval_record:",
      "- allowed_outcome: `approve_action_binding` / `deny_action` / `request_scope_reduction`",
      "- approval_policy_or_named_approver: PO approval policy",
      "- approval_scope: approve deployment",
      "- approved_actor: any operator",
      "- approved_tool: all tools",
      "- approved_target: *",
      "- approved_params: everything",
      "- review_approval_evidence: looks fine",
      "- reviewed_snapshot_binding: missing",
      "- expires_at_or_trigger: never",
      "- audit_record: note",
    ].join("\n");
    const result = analyzeActionBindingApprovalReadiness({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [
        {
          file: "PLAN-X.md",
          plan_id: "PLAN-X",
          status: "draft",
          text: `requires action-binding approval\n${weakRecord}`,
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        { subject: "PLAN-X", reason: "approval_scope must limit the approved action scope" },
        {
          subject: "PLAN-X",
          reason: "approved_actor must not grant broad or wildcard approval",
        },
        {
          subject: "PLAN-X",
          reason: "approved_tool must not grant broad or wildcard approval",
        },
        {
          subject: "PLAN-X",
          reason: "approved_target must not grant broad or wildcard approval",
        },
        {
          subject: "PLAN-X",
          reason: "approved_params must not grant broad or wildcard approval",
        },
        {
          subject: "PLAN-X",
          reason: "review_approval_evidence must name concrete review evidence before approval",
        },
        {
          subject: "PLAN-X",
          reason: "expires_at_or_trigger must define expiry or trigger-bound re-approval",
        },
        {
          subject: "PLAN-X",
          reason:
            "audit_record must capture approver, action/command, result, and incident/backlog/rollback route",
        },
      ]),
    );
  });

  it("U-DECISIONREC-009: rejects approval scope that is limited in wording but has no concrete boundary", () => {
    const weakScopeRecord = RECORD.replace(
      "limited scope for actor/tool/target/params for a high-impact action only",
      "limited scope only",
    );
    const result = analyzeActionBindingApprovalReadiness({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [
        {
          file: "PLAN-X.md",
          plan_id: "PLAN-X",
          status: "draft",
          text: `requires action-binding approval\n${weakScopeRecord}`,
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      subject: "PLAN-X",
      reason: "approval_scope must limit the approved action scope",
    });
  });

  it("rejects review and audit evidence that are only free-text claims without locators", () => {
    const weakEvidenceRecord = RECORD.replace(
      ".helix/evidence/action-binding/review.json result=pass",
      "dry-run and risk review evidence looked good",
    ).replace(
      ".helix/audit/A-123-action-binding.json approver action command result incident route",
      "approver action command result incident route",
    );
    const result = analyzeActionBindingApprovalReadiness({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [
        {
          file: "PLAN-X.md",
          plan_id: "PLAN-X",
          status: "draft",
          text: `requires action-binding approval\n${weakEvidenceRecord}`,
        },
      ],
    });
    const packets = buildActionBindingApprovalPackets({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [
        {
          file: "PLAN-X.md",
          plan_id: "PLAN-X",
          status: "draft",
          text: `requires action-binding approval\n${weakEvidenceRecord}`,
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        {
          subject: "PLAN-X",
          reason: "review_approval_evidence must name concrete review evidence before approval",
        },
        {
          subject: "PLAN-X",
          reason:
            "audit_record must capture approver, action/command, result, and incident/backlog/rollback route",
        },
      ]),
    );
    expect(packets[0].approvalBindingChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "review_approval_evidence",
          status: "pending",
        }),
        expect.objectContaining({
          field: "audit_record",
          status: "pending",
        }),
      ]),
    );
  });

  it("rejects untrusted external URLs as action-binding review or audit evidence", () => {
    const weakEvidenceRecord = RECORD.replace(
      ".helix/evidence/action-binding/review.json result=pass",
      "review_url=https://example.invalid/manual-approval result=pass",
    ).replace(
      ".helix/audit/A-123-action-binding.json approver action command result incident route",
      "audit_url=https://example.invalid/audit/123 approver action command result incident route",
    );
    const trustedEvidenceRecord = RECORD.replace(
      ".helix/evidence/action-binding/review.json result=pass",
      "review_url=https://github.com/example/repo/actions/runs/123456789 result=pass",
    ).replace(
      ".helix/audit/A-123-action-binding.json approver action command result incident route",
      "audit_url=https://github.com/example/repo/commit/0123456789abcdef approver action command result incident route",
    );

    const weakResult = analyzeActionBindingApprovalReadiness({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [
        {
          file: "PLAN-X.md",
          plan_id: "PLAN-X",
          status: "draft",
          text: `requires action-binding approval\n${weakEvidenceRecord}`,
        },
      ],
    });
    const trustedResult = analyzeActionBindingApprovalReadiness({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [
        {
          file: "PLAN-X.md",
          plan_id: "PLAN-X",
          status: "draft",
          text: `requires action-binding approval\n${trustedEvidenceRecord}`,
        },
      ],
    });

    expect(weakResult.ok).toBe(false);
    expect(weakResult.violations).toEqual(
      expect.arrayContaining([
        {
          subject: "PLAN-X",
          reason: "review_approval_evidence must name concrete review evidence before approval",
        },
        {
          subject: "PLAN-X",
          reason:
            "audit_record must capture approver, action/command, result, and incident/backlog/rollback route",
        },
      ]),
    );
    expect(trustedResult.violations.map((violation) => violation.reason)).not.toContain(
      "review_approval_evidence must name concrete review evidence before approval",
    );
    expect(trustedResult.violations.map((violation) => violation.reason)).not.toContain(
      "audit_record must capture approver, action/command, result, and incident/backlog/rollback route",
    );
  });

  it("rejects approval scope that is exclusion-only without an approved target boundary", () => {
    const exclusionOnlyScopeRecord = RECORD.replace(
      "limited scope for actor/tool/target/params for a high-impact action only",
      "secret and production access are out of scope",
    );
    const result = analyzeActionBindingApprovalReadiness({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [
        {
          file: "PLAN-X.md",
          plan_id: "PLAN-X",
          status: "draft",
          text: `requires action-binding approval\n${exclusionOnlyScopeRecord}`,
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      subject: "PLAN-X",
      reason: "approval_scope must limit the approved action scope",
    });
  });

  it("rejects version-up and cutover approvals that do not bind the current snapshot packet", () => {
    const result = analyzeActionBindingApprovalReadiness({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [
        {
          file: "PLAN-L7-146.md",
          plan_id: "PLAN-L7-146",
          status: "draft",
          versionTarget: "future",
          text: `requires action-binding approval\n${RECORD.replace(
            "no snapshot-bearing packet applies to this approval",
            "cutoverSnapshot.snapshotId",
          )}`,
        },
        {
          file: "PLAN-M-02.md",
          plan_id: "PLAN-M-02-helix-identifier-rename",
          status: "draft",
          text: `identifier rename cutover_decision_record requires action-binding approval\n${RECORD.replace(
            "no snapshot-bearing packet applies to this approval",
            "activationSnapshot.snapshotId",
          )}`,
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        {
          subject: "PLAN-L7-146",
          reason:
            "reviewed_snapshot_binding must cite activationSnapshot.snapshotId, cutoverSnapshot.snapshotId, or an explicit no-snapshot basis",
        },
        {
          subject: "PLAN-M-02-helix-identifier-rename",
          reason:
            "reviewed_snapshot_binding must cite activationSnapshot.snapshotId, cutoverSnapshot.snapshotId, or an explicit no-snapshot basis",
        },
      ]),
    );
  });

  it("keeps snapshot field placeholders pending until the concrete current snapshot id is recorded", () => {
    const concreteSnapshot =
      "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    const packets = buildActionBindingApprovalPackets({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [
        {
          file: "PLAN-L7-146.md",
          plan_id: "PLAN-L7-146",
          status: "draft",
          versionTarget: "future",
          text: `requires action-binding approval\n${RECORD.replace(
            "no snapshot-bearing packet applies to this approval",
            "activationSnapshot.snapshotId",
          )}`,
        },
        {
          file: "PLAN-M-02.md",
          plan_id: "PLAN-M-02-helix-identifier-rename",
          status: "draft",
          text: `identifier rename cutover_decision_record requires action-binding approval\n${RECORD.replace(
            "no snapshot-bearing packet applies to this approval",
            `cutoverSnapshot.snapshotId ${concreteSnapshot}`,
          )}`,
        },
      ],
    });

    const versionUpCheck = packets
      .find((packet) => packet.planId === "PLAN-L7-146")
      ?.approvalBindingChecks.find((check) => check.field === "reviewed_snapshot_binding");
    expect(versionUpCheck).toMatchObject({
      status: "pending",
      reason: "snapshot binding names the packet field but not the concrete current snapshot id",
    });
    expect(packets.find((packet) => packet.planId === "PLAN-L7-146")?.blockedReasons).toContain(
      "reviewed_snapshot_binding lacks concrete current snapshot id",
    );

    const cutoverCheck = packets
      .find((packet) => packet.planId === "PLAN-M-02-helix-identifier-rename")
      ?.approvalBindingChecks.find((check) => check.field === "reviewed_snapshot_binding");
    expect(cutoverCheck).toMatchObject({
      status: "concrete",
      reason: "snapshot binding matches this PLAN route",
    });
  });

  it("treats explicit no-snapshot basis as concrete for plans without snapshot-bearing sibling packets", () => {
    const packet = buildActionBindingApprovalPackets({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      plans: [
        {
          file: "PLAN-DISCOVERY-10.md",
          plan_id: "PLAN-DISCOVERY-10-helix-asset-visualization",
          status: "draft",
          text: `requires action-binding approval before external execution\n${RECORD}`,
        },
      ],
    })[0];

    expect(
      packet.approvalBindingChecks.find((check) => check.field === "reviewed_snapshot_binding"),
    ).toMatchObject({
      status: "concrete",
      reason: "explicit no-snapshot basis is recorded",
    });
    expect(packet.blockedReasons).not.toContain(
      "reviewed_snapshot_binding lacks concrete current snapshot id",
    );
  });

  it("rejects version-up approvals whose concrete snapshot id is stale", () => {
    const staleSnapshot = "sha256:1111111111111111111111111111111111111111111111111111111111111111";
    const stalePlan = versionUpPlanWithSnapshot(staleSnapshot);
    const result = analyzeActionBindingApprovalReadiness({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      versionUpModeDoc: VERSION_UP_MODE_DOC,
      repoHeadSha: ACTION_BINDING_TEST_HEAD_SHA,
      currentVersion: "0.1.0",
      plans: [stalePlan],
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      subject: "PLAN-L7-146",
      reason: "reviewed_snapshot_binding does not match current activationSnapshot.snapshotId",
    });

    const stalePacket = buildActionBindingApprovalPackets({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      versionUpModeDoc: VERSION_UP_MODE_DOC,
      repoHeadSha: ACTION_BINDING_TEST_HEAD_SHA,
      currentVersion: "0.1.0",
      plans: [stalePlan],
    })[0];
    expect(stalePacket.blockedReasons).toContain(
      "reviewed_snapshot_binding does not match current activationSnapshot.snapshotId",
    );
    expect(
      stalePacket.approvalBindingChecks.find(
        (check) => check.field === "reviewed_snapshot_binding",
      ),
    ).toMatchObject({
      status: "invalid",
      reason: "snapshot binding does not match current activationSnapshot.snapshotId",
    });

    const nullHeadSnapshot = currentVersionUpSnapshotId(stalePlan, null);
    const nullHeadPlan = versionUpPlanWithSnapshot(nullHeadSnapshot);
    const nullHeadPacket = buildActionBindingApprovalPackets({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      versionUpModeDoc: VERSION_UP_MODE_DOC,
      repoHeadSha: ACTION_BINDING_TEST_HEAD_SHA,
      currentVersion: "0.1.0",
      plans: [nullHeadPlan],
    })[0];
    expect(nullHeadPacket.blockedReasons).toContain(
      "reviewed_snapshot_binding does not match current activationSnapshot.snapshotId",
    );

    const currentSnapshot = currentVersionUpSnapshotId(stalePlan, ACTION_BINDING_TEST_HEAD_SHA);
    const changedHeadSnapshot = currentVersionUpSnapshotId(
      stalePlan,
      NEXT_ACTION_BINDING_TEST_HEAD_SHA,
    );
    expect(currentSnapshot).not.toBe(nullHeadSnapshot);
    expect(currentSnapshot).not.toBe(changedHeadSnapshot);

    const currentPlan = versionUpPlanWithSnapshot(currentSnapshot);
    const currentPacket = buildActionBindingApprovalPackets({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      versionUpModeDoc: VERSION_UP_MODE_DOC,
      repoHeadSha: ACTION_BINDING_TEST_HEAD_SHA,
      currentVersion: "0.1.0",
      plans: [currentPlan],
    })[0];
    expect(
      currentPacket.approvalBindingChecks.find(
        (check) => check.field === "reviewed_snapshot_binding",
      ),
    ).toMatchObject({
      status: "concrete",
      reason: "snapshot binding matches this PLAN route",
    });
  });

  it("blocks version-up snapshot approval validation when repoHeadSha is unavailable", () => {
    const snapshotFromUnknownHead = currentVersionUpSnapshotId(
      versionUpPlanWithSnapshot("sha256:0".padEnd(71, "0")),
      null,
    );
    const plan = versionUpPlanWithSnapshot(snapshotFromUnknownHead);
    const input = {
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      versionUpModeDoc: VERSION_UP_MODE_DOC,
      currentVersion: "0.1.0",
      plans: [plan],
    };

    const result = analyzeActionBindingApprovalReadiness(input);
    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      subject: "PLAN-L7-146",
      reason: "activation snapshot cannot be validated without repoHeadSha",
    });

    const packet = buildActionBindingApprovalPackets(input)[0];
    expect(packet.blockedReasons).toContain(
      "activation snapshot cannot be validated without repoHeadSha",
    );
    expect(
      packet.approvalBindingChecks.find((check) => check.field === "reviewed_snapshot_binding"),
    ).toMatchObject({
      status: "pending",
      reason: "activation snapshot cannot be validated without repoHeadSha",
    });
  });

  it("does not synthesize a null-HEAD activation snapshot when repoHeadSha is unavailable", () => {
    const currentSnapshot = currentVersionUpSnapshotId(
      versionUpPlanWithSnapshot("sha256:0".padEnd(71, "0")),
      ACTION_BINDING_TEST_HEAD_SHA,
    );
    const plan = versionUpPlanWithSnapshot(currentSnapshot);
    const input = {
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      versionUpModeDoc: VERSION_UP_MODE_DOC,
      currentVersion: "0.1.0",
      plans: [plan],
    };

    const result = analyzeActionBindingApprovalReadiness(input);
    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      subject: "PLAN-L7-146",
      reason: "activation snapshot cannot be validated without repoHeadSha",
    });
    expect(result.violations).not.toContainEqual({
      subject: "PLAN-L7-146",
      reason: "reviewed_snapshot_binding does not match current activationSnapshot.snapshotId",
    });

    const packet = buildActionBindingApprovalPackets(input)[0];
    expect(packet.blockedReasons).toContain(
      "activation snapshot cannot be validated without repoHeadSha",
    );
    expect(packet.blockedReasons).not.toContain(
      "reviewed_snapshot_binding does not match current activationSnapshot.snapshotId",
    );
    expect(
      packet.approvalBindingChecks.find((check) => check.field === "reviewed_snapshot_binding"),
    ).toMatchObject({
      status: "pending",
      reason: "activation snapshot cannot be validated without repoHeadSha",
    });
  });

  it("does not synthesize a null-HEAD activation snapshot when repoHeadSha is explicitly null", () => {
    const nullHeadSnapshot = currentVersionUpSnapshotId(
      versionUpPlanWithSnapshot("sha256:0".padEnd(71, "0")),
      null,
    );
    const plan = versionUpPlanWithSnapshot(nullHeadSnapshot);
    const input = {
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      versionUpModeDoc: VERSION_UP_MODE_DOC,
      repoHeadSha: null,
      currentVersion: "0.1.0",
      plans: [plan],
    };

    const packet = buildActionBindingApprovalPackets(input)[0];
    expect(packet.blockedReasons).toContain(
      "activation snapshot cannot be validated without repoHeadSha",
    );
    expect(packet.blockedReasons).not.toContain(
      "reviewed_snapshot_binding does not match current activationSnapshot.snapshotId",
    );
    expect(
      packet.approvalBindingChecks.find((check) => check.field === "reviewed_snapshot_binding"),
    ).toMatchObject({
      status: "pending",
      reason: "activation snapshot cannot be validated without repoHeadSha",
    });
  });

  it("rejects cutover approvals whose concrete snapshot id is stale", () => {
    const staleSnapshot = "sha256:2222222222222222222222222222222222222222222222222222222222222222";
    const currentSnapshot =
      "sha256:3333333333333333333333333333333333333333333333333333333333333333";
    const stalePlan = {
      file: "PLAN-M-02.md",
      plan_id: "PLAN-M-02-helix-identifier-rename",
      status: "draft",
      text: `identifier rename cutover_decision_record requires action-binding approval\n${RECORD.replace(
        "no snapshot-bearing packet applies to this approval",
        `cutoverSnapshot.snapshotId ${staleSnapshot}`,
      )}`,
    };
    const result = analyzeActionBindingApprovalReadiness({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      currentCutoverSnapshotId: currentSnapshot,
      plans: [stalePlan],
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      subject: "PLAN-M-02-helix-identifier-rename",
      reason: "reviewed_snapshot_binding does not match current cutoverSnapshot.snapshotId",
    });

    const stalePacket = buildActionBindingApprovalPackets({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      currentCutoverSnapshotId: currentSnapshot,
      plans: [stalePlan],
    })[0];
    expect(stalePacket.blockedReasons).toContain(
      "reviewed_snapshot_binding does not match current cutoverSnapshot.snapshotId",
    );
    expect(
      stalePacket.approvalBindingChecks.find(
        (check) => check.field === "reviewed_snapshot_binding",
      ),
    ).toMatchObject({
      status: "invalid",
      reason: "snapshot binding does not match current cutoverSnapshot.snapshotId",
    });

    const currentPlan = {
      ...stalePlan,
      text: stalePlan.text.replace(staleSnapshot, currentSnapshot),
    };
    const currentPacket = buildActionBindingApprovalPackets({
      rightArmMd: RIGHT_ARM,
      outstandingTs: OUTSTANDING,
      currentCutoverSnapshotId: currentSnapshot,
      plans: [currentPlan],
    })[0];
    expect(
      currentPacket.approvalBindingChecks.find(
        (check) => check.field === "reviewed_snapshot_binding",
      ),
    ).toMatchObject({
      status: "concrete",
      reason: "snapshot binding matches this PLAN route",
    });
  });

  it("loads the current repo pending approval records", () => {
    const result = analyzeActionBindingApprovalReadiness(loadActionBindingApprovalReadinessInput());

    expect(result.ok).toBe(true);
    expect(result.pendingPlanIds).toEqual([
      "PLAN-DISCOVERY-10-helix-asset-visualization",
      "PLAN-L7-146-serverless-readonly-share",
      "PLAN-M-02-helix-identifier-rename",
    ]);
  });

  it("emits current repo approval packets for every pending high-impact approval PLAN", () => {
    const packets = buildActionBindingApprovalPackets(loadActionBindingApprovalReadinessInput());

    expect(packets.map((packet) => packet.planId)).toEqual([
      "PLAN-DISCOVERY-10-helix-asset-visualization",
      "PLAN-L7-146-serverless-readonly-share",
      "PLAN-M-02-helix-identifier-rename",
    ]);
    expect(packets.every((packet) => packet.approvalAllowed === false)).toBe(true);
    expect(
      packets.every((packet) =>
        packet.approvalBindingChecks.some(
          (check) => check.field === "allowed_outcome" && check.status === "pending",
        ),
      ),
    ).toBe(true);
    expect(
      packets.every((packet) =>
        packet.approvalBindingChecks.some(
          (check) => check.field === "approved_actor" && check.status === "pending",
        ),
      ),
    ).toBe(true);
    expect(packets.flatMap((packet) => packet.blockedReasons)).toContain(
      "missing concrete approve_action_binding decision",
    );
    expect(
      packets.find((packet) => packet.planId === "PLAN-DISCOVERY-10-helix-asset-visualization")
        ?.semanticFeatureFrontierRecords,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          featureId: "asset_progress_visualization",
          classification: "frontier_pending_decision",
        }),
      ]),
    );
    expect(
      packets.find((packet) => packet.planId === "PLAN-L7-146-serverless-readonly-share")
        ?.semanticFeatureFrontierRecords,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          featureId: "serverless_readonly_share",
          classification: "parked_future_version",
        }),
      ]),
    );
    expect(
      packets.find((packet) => packet.planId === "PLAN-M-02-helix-identifier-rename")
        ?.semanticFeatureFrontierRecords,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          featureId: "name_cutover",
          classification: "approval_gated_cutover",
        }),
      ]),
    );
    expect(packets.every((packet) => packet.approvalVerificationCommandMatrix.length === 11)).toBe(
      true,
    );
    expect(
      packets.every((packet) =>
        packet.approvalVerificationCommandMatrix.some(
          (row) =>
            row.phase === "web-security-testing-boundary" &&
            row.source === "OWASP Web Security Testing Guide" &&
            row.sourceUrl === "https://owasp.org/www-project-web-security-testing-guide/",
        ),
      ),
    ).toBe(true);
    expect(
      packets.every((packet) =>
        packet.approvalVerificationCommandMatrix.every(
          (row) =>
            row.sourceCheckedAt &&
            row.latestOfficialStatus &&
            row.sourceStatusDelta &&
            row.adoptionDecision &&
            row.adoptionDecisionDelta &&
            row.workflowRouteImpact,
        ),
      ),
    ).toBe(true);
    expect(
      packets
        .find((packet) => packet.planId === "PLAN-L7-146-serverless-readonly-share")
        ?.approvalVerificationCommandMatrix.find(
          (command) => command.phase === "sibling-decision-packets",
        )?.command,
    ).toContain(
      "bun run src/cli.ts version-up activation-packet --plan PLAN-L7-146-serverless-readonly-share --json",
    );
    expect(
      packets
        .find((packet) => packet.planId === "PLAN-L7-146-serverless-readonly-share")
        ?.approvalVerificationCommandMatrix.find(
          (command) => command.phase === "github-environment-approval-boundary",
        )?.command,
    ).toBe(
      "bun run src/cli.ts version-up security-checklist --plan PLAN-L7-146-serverless-readonly-share --no-write --json",
    );
    expect(
      packets.map(
        (packet) =>
          packet.approvalVerificationCommandMatrix.find(
            (command) => command.phase === "sibling-decision-packets",
          )?.command,
      ),
    ).toEqual([
      expect.stringContaining(
        "bun run src/cli.ts s4 decision-packet --plan PLAN-DISCOVERY-10-helix-asset-visualization --json",
      ),
      expect.stringContaining(
        "bun run src/cli.ts version-up activation-packet --plan PLAN-L7-146-serverless-readonly-share --json",
      ),
      expect.stringContaining("bun run src/cli.ts rename plan --json"),
    ]);
    expect(
      packets.every(
        (packet) => actionBindingApprovalVerificationCommandViolations(packet).length === 0,
      ),
    ).toBe(true);
    expect(
      packets.every(
        (packet) =>
          !packet.approvalVerificationCommandMatrix
            .find((command) => command.phase === "sibling-decision-packets")
            ?.command.includes("action-binding approval-packet"),
      ),
    ).toBe(true);
  });
});
