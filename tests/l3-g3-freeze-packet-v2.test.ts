// PLAN-L7-551-state-db-schema-ddl-authority — U-SDDA-007
// PLAN-L7-561-workflow-classification-generated-catalog — U-WFCAT-005
// PLAN-L7-569-typed-plan-workflow-identity — U-TPWID-005
// PLAN-L7-573-github-workflow-identity-ingest — U-GWID-006
// PLAN-L7-562-workflow-classification-typed-routing — U-WFROUTE-005
// PLAN-L7-563-workflow-execution-policy-projection — U-WFEPROJ-005
// PLAN-L7-565-workflow-execution-policy-resolution — U-WFEPOLRES-005
// PLAN-L7-566-workflow-execution-routing-consumer — U-WFEXROUTE-005
// PLAN-L7-567-workflow-execution-routing-cli — U-WFEXCLI-005
// PLAN-L7-568-workflow-classification-legacy-adapter — U-WFLEG-007
// PLAN-L7-570-design-elicitation-typed-classification — U-DESIGNELIC-004
// PLAN-L7-576-github-execution-episode-state — U-GHEP-008
// PLAN-L7-578-github-execution-episode-right-arm-evidence — U-GHEPRE-006
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  assertL3G3BootstrapPolicyContract,
  type BootstrapPolicy,
  createL3G3LogicalDbReceipt,
} from "../src/doctor/l3-g3-logical-db-receipt";
import { SCHEMA_VERSION } from "../src/schema/harness-db";

const PACKET_PATH = "docs/governance/l3-rebaseline-g3-freeze-packet.md";
const PLAN_PATH = "docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md";
const packet = readFileSync(PACKET_PATH, "utf8");
const plan = readFileSync(PLAN_PATH, "utf8");

const requiredFreezeTargetPlans = [
  "PLAN-L3-15-requirements-authority-chain-remediation",
  "PLAN-L3-16-scrum-reverse-entity-requirements",
  "PLAN-L3-17-lifecycle-state-separation-requirements",
  "PLAN-L3-18-worker-contract-benchmark-promotion",
  "PLAN-L3-19-github-operations-projection",
  "PLAN-L3-21-contextual-pr-review-db-convergence",
  "PLAN-L3-22-github-ci-performance-recovery",
  "PLAN-L3-23-github-approval-recovery",
  "PLAN-L3-24-github-environment-promotion",
  "PLAN-L3-25-github-update-lifecycle",
  "PLAN-L3-26-github-plan-workflow-governance",
  "PLAN-L3-27-github-trace-authority-hygiene",
  "PLAN-L3-28-feedback-test-owner-closure-disposition",
  "PLAN-L3-29-feedback-test-owner-recognition-disposition",
  "PLAN-L3-30-feedback-test-owner-direct-disposition",
  "PLAN-L3-31-feedback-test-owner-residual-disposition",
  "PLAN-L3-32-feedback-refactor-disposition",
  "PLAN-L3-33-downstream-queue-numbering",
  "PLAN-L3-34-residual-responsibility-recount",
  "PLAN-L3-35-downstream-queue-correction",
  "PLAN-L3-36-atomic-development-contract",
  "PLAN-L3-37-atomic-downstream-queue",
  "PLAN-L3-38-freeze-issue-projection-sync",
  "PLAN-L3-39-po-decision-reflection",
  "PLAN-L3-40-delivery-route-selection",
  "PLAN-L3-42-delivery-route-downstream-queue",
  "PLAN-L3-43-management-integration-cell-model",
  "PLAN-L3-47-lifecycle-stage-completion-goals",
  "PLAN-L3-48-requirement-style-case-authority",
  "PLAN-L3-49-helix-bench-evaluation",
  "PLAN-L3-50-technology-stack-authority",
  "PLAN-L3-51-multimodal-design-harness-authority",
  "PLAN-L3-52-github-security-admission",
] as const;

const preApprovalDraftPlans = [
  "PLAN-L3-15-requirements-authority-chain-remediation",
  "PLAN-L3-16-scrum-reverse-entity-requirements",
  "PLAN-L3-17-lifecycle-state-separation-requirements",
  "PLAN-L3-19-github-operations-projection",
  "PLAN-L3-21-contextual-pr-review-db-convergence",
  "PLAN-L3-22-github-ci-performance-recovery",
  "PLAN-L3-23-github-approval-recovery",
  "PLAN-L3-24-github-environment-promotion",
  "PLAN-L3-25-github-update-lifecycle",
  "PLAN-L3-26-github-plan-workflow-governance",
] as const;

function freezeTargetPlanSet(document: string): {
  schema_version: string;
  plans: string[];
} {
  const match = document.match(
    /<!-- freeze-target-plan-set:start -->\s*```json\s*([\s\S]*?)\s*```\s*<!-- freeze-target-plan-set:end -->/,
  );
  expect(match, "freeze target PLAN manifest").not.toBeNull();
  return JSON.parse(match?.[1] ?? "{}") as {
    schema_version: string;
    plans: string[];
  };
}

function freezeTargetPlanLifecycle(document: string): {
  schema_version: string;
  pre_approval_draft_plans: string[];
  requirement_definition_transition: string;
  plan_status_transition: string;
  plan_confirmation_policy: string;
} {
  const match = document.match(
    /<!-- freeze-target-plan-lifecycle:start -->\s*```json\s*([\s\S]*?)\s*```\s*<!-- freeze-target-plan-lifecycle:end -->/,
  );
  expect(match, "freeze target PLAN lifecycle manifest").not.toBeNull();
  return JSON.parse(match?.[1] ?? "{}") as {
    schema_version: string;
    pre_approval_draft_plans: string[];
    requirement_definition_transition: string;
    plan_status_transition: string;
    plan_confirmation_policy: string;
  };
}

function sha256(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

const pairedArtifacts = [
  [
    "docs/design/helix/L3-requirements/scrum-reverse-entity-model.md",
    "d6ac0ebe30737d0534ccb98943b3e277eb9a551236761baaae8e6b77b14b04ac",
  ],
  [
    "docs/test-design/helix/scrum-reverse-entity-model-acceptance.md",
    "bea0f4548fa223a4cceabed25a3bf8da0388d711c9be352122fb8d0b7ecccfe2",
  ],
  [
    "docs/design/helix/L3-requirements/lifecycle-state-separation.md",
    "a4077092ff5f268cfc58af2823573565f1144f3d88b696b9f59cf20112ff857b",
  ],
  [
    "docs/test-design/helix/lifecycle-state-separation-acceptance.md",
    "73a371eadd006c4f850cc0129f8c6cdf2b44c17d8356b94164cf253711c4f60c",
  ],
  [
    "docs/design/helix/L3-requirements/worker-common-contract.md",
    "773280fa06cfb06989c4d2d66b15499635d14cd024b77401c18715c9d0588290",
  ],
  [
    "docs/test-design/helix/worker-common-contract-acceptance.md",
    "c8dff734891a6a7350feb9b698c40e1616946cdd424433d662f1da49d8ac800d",
  ],
  [
    "docs/design/helix/L3-requirements/predecessor-harness-mechanism-hardening-requirements.md",
    "c0978eae37f6c7c8e113191404c0fd76328818e438b0ea5b3cf98ebd489a6639",
  ],
  [
    "docs/test-design/helix/predecessor-harness-mechanism-hardening-acceptance.md",
    "d352ba205db85aee1f5cb0f5bcf11fb86f1cb3e59b68b3aba3728b54bb6c416a",
  ],
  [
    "docs/design/helix/L3-requirements/github-operations-projection.md",
    "14048b7e9a109aeeb5c31cf87ae3b6228fb54af08c2fd6fad0ce1e058afab88c",
  ],
  [
    "docs/test-design/helix/github-operations-projection-acceptance.md",
    "7638e322a28a3bb866704feb2fbf431c1d1afba8154883f6f679bb5e52bb9600",
  ],
  [
    "docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md",
    "b387f8a4ffd324d2abd210439bc791611d4e6c8aa2498fe5facccc48fc7f552f",
  ],
  [
    "docs/test-design/helix/github-autonomous-operations-acceptance.md",
    "192c4839f128d955346b420d494ed1b2ba98627976dc6e0314623e790a7ab0f0",
  ],
  [
    "docs/design/helix/L3-requirements/l12-scrum-rebaseline-requirements.md",
    "7da3f49682819b5e6f3e68b5ebd55ae5e84f7561e1b7e6f4ada49c1a41a2f730",
  ],
  [
    "docs/test-design/helix/l12-scrum-rebaseline-acceptance.md",
    "f584c65a126e3a1389131451192c5efe5f1bb59bb2c032714f003e87f8093df6",
  ],
  [
    "docs/design/helix/L3-requirements/github-merge-admission-requirements.md",
    "8f6c1af2d9fdc8c9d2c392ce55498b278fc55563c21537033f35f743893da96a",
  ],
  [
    "docs/test-design/helix/github-merge-admission-system-test-design.md",
    "301149dc90ce99901d6405282874bbeacc86355acc8f8099e885bb134631fcb1",
  ],
  [
    "docs/design/helix/L3-requirements/github-approval-recovery-requirements.md",
    "ddd7159e9ece094ff7ac1320395dabe8c0f83ebb291c1983559d7b605cf42a0c",
  ],
  [
    "docs/test-design/helix/github-approval-recovery-system-test-design.md",
    "74792349b5b0a8669f4e4b1228c775a57e44e6d85cbd292b562d1dcb83b69e86",
  ],
  [
    "docs/design/helix/L3-requirements/github-ci-performance-requirements.md",
    "7a9b3534671516be8810e40a8c96119e885eb431a4753518b56fe2479b9263d1",
  ],
  [
    "docs/test-design/helix/github-ci-performance-system-test-design.md",
    "8014f6ceab95bcfe3bdb717f2d813de12fa09d8dee492ec221a8800ed799a232",
  ],
  [
    "docs/design/helix/L3-requirements/github-environment-promotion-requirements.md",
    "f5b13f4b1602eda78a9bd474f6a98050f089ad734fb90afc871fd15f75cb5410",
  ],
  [
    "docs/test-design/helix/github-environment-promotion-system-test-design.md",
    "2267f75d68599d2e3f5c559b4400174604836599d8c32a37ea2af4c418f3a691",
  ],
  [
    "docs/design/helix/L3-requirements/github-update-lifecycle-requirements.md",
    "03bdf1060bc0ca9eec468f72f3b2b81328779695b95f95fd014662fd17fc1ab5",
  ],
  [
    "docs/test-design/helix/github-update-lifecycle-system-test-design.md",
    "8272df56f1f876c784637de5caf0985f6a45923e9dc7f8aa661e245010818d99",
  ],
  [
    "docs/design/helix/L3-requirements/github-plan-workflow-governance-requirements.md",
    "3de67351ab91fb0626d3c9ad2974b12739f278343f061142f1a839b0a7c6a617",
  ],
  [
    "docs/test-design/helix/github-plan-workflow-governance-system-test-design.md",
    "4d28725768506a67fa119d8851aa010114ddcde5c1cd8f315a68c5a369e13202",
  ],
  [
    "docs/design/helix/L3-requirements/github-atomic-development-requirements.md",
    "c025741e505bc244da7319448f2396aab1930d35c6877f1f16c403d342fddbf8",
  ],
  [
    "docs/test-design/helix/github-atomic-development-system-test-design.md",
    "a36eff5d2becc09bdb4c83f6b9ddf17423ca93e33486c2f0e20246aa5762168e",
  ],
  [
    "docs/design/helix/L3-requirements/management-integration-cell-requirements.md",
    "f840e16cab80b88fa4e4730ed49f47f0afeee2050cad309a3d87da4cce057ec6",
  ],
  [
    "docs/test-design/helix/management-integration-cell-acceptance.md",
    "fc9c2312019d59554d921c808b36c2a8f4422ceab89dd8af918c08d5dc04b34c",
  ],
  [
    "docs/design/helix/L3-requirements/lifecycle-stage-completion-goals.md",
    "21ba24bf781048f1cb03a20172c8049a6112690cda3d0d0f7dd0ba3cb0bd7406",
  ],
  [
    "docs/test-design/helix/lifecycle-stage-completion-goals-acceptance.md",
    "72c193a904027ed118433a92a049b7330a9da0cfdfac7a5a06dc0887a54e7f65",
  ],
  [
    "docs/design/helix/L3-requirements/helix-bench-evaluation.md",
    "a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116",
  ],
  [
    "docs/test-design/helix/helix-bench-evaluation-acceptance.md",
    "6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185",
  ],
  [
    "docs/design/helix/L3-requirements/technology-stack-authority.md",
    "a37579d6e1ac48895fce5efdcbaafa42d416ceaf94c1b0e6fe1d044785ab4fb1",
  ],
  [
    "docs/test-design/helix/technology-stack-authority-acceptance.md",
    "ead7e3197c21cdc843c098d8ceb5f00d442800002d1c34792f5e160e9e38039d",
  ],
  [
    "docs/design/helix/L3-requirements/multimodal-design-harness-authority.md",
    "2849eaef786d6e2014cc2369c3cbf994ed66c0e09244a447f2da536a4d6db1f5",
  ],
  [
    "docs/test-design/helix/multimodal-design-harness-authority-acceptance.md",
    "d83e8ce533f456a2f58d07164ec5d5ec540791277bd9209d2fa79987a1163951",
  ],
  [
    "docs/design/helix/L3-requirements/github-security-admission-requirements.md",
    "0a25ec678f4f45b8741f9ad4c8c71d28f140160d575a1b39187faf9857d03a72",
  ],
  [
    "docs/test-design/helix/github-security-admission-system-test-design.md",
    "6ee1f7d3292418f03c4affe16e7e5cf6725e009278abd2b1407f46ed457b089b",
  ],
] as const;

const styleCaseAuthorityArtifacts = [
  [
    "docs/design/harness/L1-requirements/functional-requirements.md",
    "a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008",
  ],
  [
    "docs/design/harness/L1-requirements/screen-requirements.md",
    "e5b6964567242a2440ded28ed99c1783f37a9326624c02283c7a975c3020063b",
  ],
  [
    "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md",
    "db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb",
  ],
  [
    "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
    "68a7b624d7b0358edb67c1e8030f35f69a4e7524331b5f1ff456d3e2e1062f3d",
  ],
  [
    "docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md",
    "ab6c9ceef3e80dcee39351c989ab4368acad122dc7421aaf97c729e63a6d6a93",
  ],
] as const;

describe("L3 G1/G3 freeze packet v2", () => {
  it("U-GHEPRE-006: right-arm evidenceのL6/L8 pairをPLANへ束縛する", () => {
    const plan = readFileSync(
      "docs/plans/PLAN-L7-578-github-execution-episode-right-arm-evidence.md",
      "utf8",
    );
    const design = readFileSync(
      "docs/design/helix/L6-function-design/github-execution-episode-right-arm-evidence.md",
      "utf8",
    );
    const testDesign = readFileSync(
      "docs/test-design/helix/L8-github-execution-episode-right-arm-evidence-unit-test-design.md",
      "utf8",
    );
    expect(plan).toContain(
      "parent_design: docs/design/helix/L6-function-design/github-execution-episode-right-arm-evidence.md",
    );
    expect(plan).toContain(
      "pair_artifact: docs/test-design/helix/L8-github-execution-episode-right-arm-evidence-unit-test-design.md",
    );
    expect(design).toContain(
      "pair_artifact: docs/test-design/helix/L8-github-execution-episode-right-arm-evidence-unit-test-design.md",
    );
    expect(design).toContain(
      "plan: docs/plans/PLAN-L7-578-github-execution-episode-right-arm-evidence.md",
    );
    expect(testDesign).toContain(
      "parent_design: docs/design/helix/L6-function-design/github-execution-episode-right-arm-evidence.md",
    );
    expect(testDesign).toContain(
      "pair_artifact: docs/design/helix/L6-function-design/github-execution-episode-right-arm-evidence.md",
    );
    expect(testDesign).toContain(
      "plan: docs/plans/PLAN-L7-578-github-execution-episode-right-arm-evidence.md",
    );
  });

  it("U-GHEP-008: execution episode schemaとL6/L8 pairをPLANへ束縛する", () => {
    const executionPlan = readFileSync(
      "docs/plans/PLAN-L7-576-github-execution-episode-state.md",
      "utf8",
    );
    const executionDesign = readFileSync(
      "docs/design/helix/L6-function-design/github-execution-episode-state.md",
      "utf8",
    );
    const executionTestDesign = readFileSync(
      "docs/test-design/helix/L8-github-execution-episode-state-unit-test-design.md",
      "utf8",
    );
    const locationPlan = readFileSync(
      "docs/plans/PLAN-L7-577-github-execution-episode-location-projection.md",
      "utf8",
    );
    const locationDesign = readFileSync(
      "docs/design/helix/L6-function-design/github-execution-episode-location-projection.md",
      "utf8",
    );
    const locationTestDesign = readFileSync(
      "docs/test-design/helix/L8-github-execution-episode-location-projection-unit-test-design.md",
      "utf8",
    );
    expect(SCHEMA_VERSION).toBe(46);
    expect(executionPlan).toContain(
      "parent_design: docs/design/helix/L6-function-design/github-execution-episode-state.md",
    );
    expect(executionPlan).toContain(
      "pair_artifact: docs/test-design/helix/L8-github-execution-episode-state-unit-test-design.md",
    );
    expect(executionDesign).toContain(
      "pair_artifact: docs/test-design/helix/L8-github-execution-episode-state-unit-test-design.md",
    );
    expect(executionTestDesign).toContain(
      "pair_artifact: docs/design/helix/L6-function-design/github-execution-episode-state.md",
    );
    expect(locationPlan).toContain(
      "parent_design: docs/design/helix/L6-function-design/github-execution-episode-location-projection.md",
    );
    expect(locationPlan).toContain(
      "pair_artifact: docs/test-design/helix/L8-github-execution-episode-location-projection-unit-test-design.md",
    );
    expect(locationDesign).toContain(
      "pair_artifact: docs/test-design/helix/L8-github-execution-episode-location-projection-unit-test-design.md",
    );
    expect(locationTestDesign).toContain(
      "pair_artifact: docs/design/helix/L6-function-design/github-execution-episode-location-projection.md",
    );
  });

  it("U-GHEPL-008: location projectionのL6/L8 pairをPLANへ束縛する", () => {
    const locationPlan = readFileSync(
      "docs/plans/PLAN-L7-577-github-execution-episode-location-projection.md",
      "utf8",
    );
    const locationDesign = readFileSync(
      "docs/design/helix/L6-function-design/github-execution-episode-location-projection.md",
      "utf8",
    );
    const locationTestDesign = readFileSync(
      "docs/test-design/helix/L8-github-execution-episode-location-projection-unit-test-design.md",
      "utf8",
    );
    expect(locationPlan).toContain(
      "parent_design: docs/design/helix/L6-function-design/github-execution-episode-location-projection.md",
    );
    expect(locationPlan).toContain(
      "pair_artifact: docs/test-design/helix/L8-github-execution-episode-location-projection-unit-test-design.md",
    );
    expect(locationDesign).toContain(
      "pair_artifact: docs/test-design/helix/L8-github-execution-episode-location-projection-unit-test-design.md",
    );
    expect(locationTestDesign).toContain(
      "pair_artifact: docs/design/helix/L6-function-design/github-execution-episode-location-projection.md",
    );
  });

  it("binds the required freeze target PLAN exact set without legacy ranges or duplicates", () => {
    const planManifest = freezeTargetPlanSet(plan);
    const packetManifest = freezeTargetPlanSet(packet);
    expect(requiredFreezeTargetPlans).toHaveLength(33);
    expect(planManifest.schema_version).toBe("helix-l3-g3-freeze-target-plan-set.v1");
    expect(planManifest.plans).toEqual(requiredFreezeTargetPlans);
    expect(new Set(planManifest.plans).size).toBe(planManifest.plans.length);
    expect(packetManifest).toEqual(planManifest);
    for (const planId of requiredFreezeTargetPlans) {
      expect(sha256(`docs/plans/${planId}.md`)).toMatch(/^[a-f0-9]{64}$/);
      expect(plan).toContain(`- docs/plans/${planId}.md`);
    }
    for (const legacyScope of ["L3-16〜19", "L3-15〜39", "L3-16〜39"]) {
      expect(plan).not.toContain(legacyScope);
    }
    expect(plan).toContain("authoring runtimeと異なる独立AI-B");
    expect(plan).not.toContain("packet を別 runtime (Codex)");
  });

  it("discloses the ten draft PLANs without conflating requirement freeze and PLAN closure", () => {
    const planLifecycle = freezeTargetPlanLifecycle(plan);
    const packetLifecycle = freezeTargetPlanLifecycle(packet);
    const actualDraftPlans = requiredFreezeTargetPlans.filter((planId) =>
      readFileSync(`docs/plans/${planId}.md`, "utf8").match(/^status: draft$/m),
    );
    expect(preApprovalDraftPlans).toHaveLength(10);
    expect(actualDraftPlans).toEqual(preApprovalDraftPlans);
    expect(planLifecycle).toEqual(packetLifecycle);
    expect(packetLifecycle).toEqual({
      schema_version: "helix-l3-g3-freeze-target-plan-lifecycle.v1",
      pre_approval_draft_plans: [...preApprovalDraftPlans],
      requirement_definition_transition: "153/153_active_to_frozen",
      plan_status_transition: "none",
      plan_confirmation_policy: "independent_slice_closure_only",
    });
    expect(packet).toContain("全PLANのoperational closure済みを意味しない");
    expect(packet).toContain("requirement freezeを各PLANの設計・実装・検証完了へ読み替えない");
  });

  it("binds the final material snapshot and delegates self-referential receipts externally", () => {
    expect(plan).toContain("PLAN-L7-465-g3-logical-db-bootstrap-verifier.md");
    expect(plan).not.toContain(
      "artifact_path: tests/l3-g3-freeze-packet-v2.test.ts\n    artifact_type: test_code",
    );
    expect(packet).toContain("状態: `g1-g3-definition-freeze-confirmed`");
    expect(packet).toContain("G1/G3 freeze transaction");
    expect(packet).toContain("issues/288#issuecomment-5137504131");
    expect(packet).toContain("153/153 definitionを同一transactionでfrozenへ遷移");
    expect(packet).toContain("PR #131でdelivery route意味残差");
    expect(packet).toContain("PR #133でdelivery route PLANのreview evidence");
    expect(packet).toContain("PR #134でdelivery routeのdownstream queue");
    expect(packet).toContain("PR #130のsame-HEAD review、CI、DB receipt");
    expect(packet).toContain("L12R-FR-001..014 / L12R-AC-001..022");
    expect(packet).toContain("schema、router、DB projectionはL6/L7未実装");
    expect(packet).toContain("01dc7a6ad3bf0df33605c00eab18bf41587f01e4");
    expect(packet).toContain("13b891f4101e7fe7378a3825f0e924ec615cd135");
    expect(packet).toContain(
      "sha256:3351a371e2643af122882f65a52cc25c63269786bbd2c87d4e1115a46191eb75",
    );
    // 現行Requirement JSON root digestはlive manifestと突合し、stale記載をfail-closeする。
    const manifestRootDigest = (
      JSON.parse(readFileSync("requirements-ir/manifest.json", "utf8")) as { root_digest: string }
    ).root_digest;
    expect(manifestRootDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(packet).toContain(manifestRootDigest);
    expect(packet).toContain(
      "sha256:3c2c844b9ea4d906c336a3f3021d061078ce2f911ac46db3962e57d378239e35",
    );
    expect(packet).toContain("PR #138/#142");
    expect(packet).toContain("PR #150");
    expect(packet).toContain("PR #156");
    for (const pr of ["#247", "#259", "#261", "#262", "#265", "#272", "#278", "#279"]) {
      expect(packet).toContain(`PR ${pr}`);
    }
    expect(packet).toContain("GitHub same-HEAD review receiptへ外部束縛");
    expect(packet).toContain("tracked authority projection rebuild 2回一致");
    expect(packet).toContain("policy記載のruntime観測8入力をprojectionから明示除外");
    expect(packet).toContain("`.helix/evidence/run-debug/runtime-verification.jsonl` はtracked");
    expect(packet).toContain("helix-l3-g3-logical-db-bootstrap-policy.v2");
    expect(packet).toContain("l3-g3-logical-db-bootstrap-policy.json");
    expect(packet).toContain("npx tsx src/doctor/l3-g3-logical-db-receipt.ts");
    expect(packet).toContain("review HEADとmerge HEADのtreeが同一");
    expect(packet).not.toContain("PENDING_PACKET_PR_HEAD");
    expect(packet).not.toContain("PENDING_SAME_HEAD_ISOLATED_REBUILD_X2");
    expect(packet).not.toContain("PENDING_AFTER_PR_98_L3_26_L3_27_MERGE");
    expect(packet).not.toContain("PENDING_L3_26_INDEPENDENT_DIGEST_REVIEW");
  });

  it("executes the versioned logical DB bootstrap policy instead of checking prose only", () => {
    const policy = JSON.parse(
      readFileSync("docs/governance/l3-g3-logical-db-bootstrap-policy.json", "utf8"),
    ) as {
      schema_version: string;
      normalization_marker: string;
      observation_columns: string[];
      checkpoint_tables: string[];
      stale_rules: unknown[];
      orphan_rules: unknown[];
    };
    expect(policy.schema_version).toBe("helix-l3-g3-logical-db-bootstrap-policy.v2");
    expect(policy.observation_columns.length).toBeGreaterThan(0);
    expect(new Set(policy.observation_columns).size).toBe(policy.observation_columns.length);
    expect(policy.checkpoint_tables).toEqual([
      "artifact_registry",
      "descent_obligations",
      "plan_registry",
      "review_evidence_registry",
    ]);
    expect(policy.stale_rules).toHaveLength(1);
    expect(policy.orphan_rules).toHaveLength(1);

    const receipt = createL3G3LogicalDbReceipt(process.cwd(), {
      afterRebuild(db) {
        for (const table of [
          "drive_runs",
          "hook_events",
          "feedback_lifecycle",
          "runtime_verification_events",
          "loop_iterations",
          "model_evaluations",
        ]) {
          expect(db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get()?.n, table).toBe(0);
        }
        expect(
          db
            .prepare(
              "SELECT COUNT(*) AS n FROM model_runs WHERE evidence_path LIKE '.helix/evidence/pair-agent/%'",
            )
            .get()?.n,
          "pair-agent model_runs",
        ).toBe(0);
      },
    });
    expect(receipt.schema_version).toBe("helix-l3-g3-logical-db-bootstrap-receipt.v2");
    expect(receipt.canonicalization_contract).toEqual({
      object_keys: "lexicographic_ascending",
      array_order: "preserve",
      binary: "unsigned_byte_array",
      encoding: "utf8",
      digest: "sha256",
    });
    expect(receipt.table_order).toBe("lexicographic_ascending");
    expect(receipt.column_order).toBe("lexicographic_ascending");
    expect(receipt.row_order).toEqual({
      columns: "all non-observation columns in lexicographic order",
      fallback: "all columns in lexicographic order",
    });
    expect(receipt.normalization_marker).toBe(policy.normalization_marker);
    expect(receipt.observation_columns).toEqual(policy.observation_columns);
    expect(receipt.observation_columns_digest).toBe(
      "sha256:75bf22b6d9fbe4467aa3474c6df11c85eed1e7e0d34d75306730830c426381d4",
    );
    expect(receipt.source_head).toMatch(/^[a-f0-9]{40}$/);
    expect(receipt.policy_digest).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(receipt.verifier_digest).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(receipt.projection_digest).toBe(receipt.replay_projection_digest);
    expect(receipt.checkpoint_digest).toBe(receipt.replay_checkpoint_digest);
    expect(receipt.checkpoint_tables).toEqual(receipt.replay_checkpoint_tables);
    expect(receipt.checkpoint_population_valid).toBe(true);
    expect(Object.values(receipt.checkpoint_row_counts).every((count) => count > 0)).toBe(true);
    expect(receipt.workspace_attestation.clean).toBe(true);
    expect(receipt.projection_input_mode).toBe("tracked-authority-runtime-logs-excluded");
    expect(receipt.excluded_projection_inputs).toEqual([
      ".helix/logs/plan/*.digest.json",
      ".helix/logs/session/*.jsonl",
      ".helix/logs/feedback-lifecycle.jsonl",
      ".helix/handover/provider/*.json",
      ".helix/evidence/run-debug/runtime-verification.jsonl",
      ".helix/evidence/pair-agent/*.json",
      ".helix/state/loop/*.iterations.jsonl",
      ".helix/config/model-opt-in.yaml",
    ]);
    expect(receipt.excluded_projection_steps).toEqual([
      "projectDriveRuns",
      "projectHookEvents",
      "projectRuntimeVerificationEvents",
      "projectPairAgentRunEvidence",
      "projectLoopIterations",
      "projectFeedbackLifecycle",
      "projectModelEvaluations",
    ]);
    expect(receipt.executed_excluded_projection_steps).toEqual([]);
    expect(receipt.replay_executed_excluded_projection_steps).toEqual([]);
    expect(receipt.schema_revision).toBe(SCHEMA_VERSION);
    expect(receipt.replay_schema_revision).toBe(SCHEMA_VERSION);
    expect(receipt.stale_population_valid).toBe(true);
    expect(receipt.stale_count + receipt.replay_stale_count).toBe(0);
    expect(receipt.orphan_population_valid).toBe(true);
    expect(receipt.orphan_count + receipt.replay_orphan_count).toBe(0);
    expect(receipt.finding_count + receipt.replay_finding_count).toBe(0);
    expect(receipt.unexpected_unstable_columns).toEqual([]);
    expect(receipt.converged).toBe(true);
    expect(receipt.receipt_digest).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it("rejects policy sort and canonicalization declarations that the verifier does not implement", () => {
    const policy = JSON.parse(
      readFileSync("docs/governance/l3-g3-logical-db-bootstrap-policy.json", "utf8"),
    ) as BootstrapPolicy;
    for (const mutant of [
      { ...policy, schema_version: "helix-l3-g3-logical-db-bootstrap-policy.v999" },
      { ...policy, table_order: "preserve" },
      { ...policy, column_order: "schema_order" },
      { ...policy, row_order: { ...policy.row_order, columns: "primary_key_only" } },
      { ...policy, row_order: { ...policy.row_order, fallback: "unspecified" } },
      { ...policy, normalization_marker: "<unsupported>" },
      {
        ...policy,
        observation_columns: [...policy.observation_columns, "workflow_runs.started_at"],
      },
      { ...policy, rebuild_count: 1 },
      {
        ...policy,
        projection_input_policy: {
          ...policy.projection_input_policy,
          tracked_workspace_required: false,
        },
      },
      {
        ...policy,
        projection_input_policy: {
          ...policy.projection_input_policy,
          runtime_logs: "include",
        },
      },
      {
        ...policy,
        projection_input_policy: {
          ...policy.projection_input_policy,
          excluded_paths: [".helix/logs/unknown.jsonl"],
        },
      },
      {
        ...policy,
        projection_input_policy: {
          ...policy.projection_input_policy,
          excluded_projection_steps: ["projectUnknownRuntimeState"],
        },
      },
      ...Object.keys(policy.canonical_json).map((key) => ({
        ...policy,
        canonical_json: {
          ...policy.canonical_json,
          [key]: `unsupported_${key}`,
        },
      })),
    ]) {
      expect(() =>
        assertL3G3BootstrapPolicyContract(mutant as unknown as BootstrapPolicy),
      ).toThrow();
    }
  });

  it("rejects stale rows, relational orphans, and empty checkpoint populations", () => {
    const receipt = createL3G3LogicalDbReceipt(process.cwd(), {
      afterRebuild(db, ordinal) {
        if (ordinal !== 2) return;
        db.exec(
          "UPDATE artifact_registry SET status = 'stale' WHERE artifact_id = (SELECT artifact_id FROM artifact_registry LIMIT 1)",
        );
        db.exec(
          "UPDATE artifact_progress_events SET artifact_path = '__missing__' WHERE artifact_progress_event_id = (SELECT artifact_progress_event_id FROM artifact_progress_events LIMIT 1)",
        );
        db.exec("DELETE FROM review_evidence_registry");
      },
    });
    expect(receipt.replay_stale_count).toBe(1);
    expect(receipt.replay_orphan_count).toBe(1);
    expect(receipt.replay_checkpoint_population_valid).toBe(false);
    expect(receipt.converged).toBe(false);
  });

  // U-G3DB-008: checkout の絶対 path を投影すると logical digest がcheckout位置の関数になる。
  // 同一HEADの別checkoutで同じfreeze証拠を返せるよう、実DB全体にrootが現れないことを固定する。
  it("keeps projected rows free of the checkout absolute path", () => {
    const repoRoot = process.cwd();
    const leaks: string[] = [];
    createL3G3LogicalDbReceipt(repoRoot, {
      afterRebuild(db, ordinal) {
        if (ordinal !== 1) return;
        const tables = db
          .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
          .all() as Array<{ name: string }>;
        for (const { name } of tables) {
          const columns = db.prepare(`PRAGMA table_info("${name}")`).all() as Array<{
            name: string;
          }>;
          for (const column of columns) {
            const hit = db
              .prepare(
                `SELECT "${column.name}" AS value FROM "${name}" WHERE "${column.name}" LIKE ? LIMIT 1`,
              )
              .get(`%${repoRoot}%`) as { value?: unknown } | undefined;
            if (hit) leaks.push(`${name}.${column.name}`);
          }
        }
      },
    });
    expect(leaks).toEqual([]);
  });

  // PLAN-L7-492-development-model-design-admission
  it("U-DESIGNCOV-016: binds every listed L3/L10 artifact candidate to its current digest", () => {
    expect(pairedArtifacts).toHaveLength(40);
    expect(styleCaseAuthorityArtifacts).toHaveLength(5);
    for (const [path, expected] of pairedArtifacts) {
      expect(sha256(path), path).toBe(expected);
      expect(packet, path).toContain(expected);
    }
    for (const [path, expected] of styleCaseAuthorityArtifacts) {
      expect(sha256(path), path).toBe(expected);
      expect(packet, path).toContain(expected);
    }
    expect(sha256("docs/governance/helix-harness-requirements_v1.3.md")).toBe(
      "98e8e9369809d0da2b7325cb9e38b0976a12bb4e03b53e6c7c8b479721990e28",
    );
    expect(sha256("docs/generated/requirements/requirement-definition.generated.md")).toBe(
      "5725dfb74f50593403284dc8c36732bbce71d99091d463b55e9e3014b9edc6c1",
    );
    expect(sha256("docs/governance/l3-progression-authority-rebaseline-2026-07-19.md")).toBe(
      "f7e425c53a42b7a04d02b277d869b9e1dee9ed48b2126505add49569546cfd8d",
    );
    // PLAN-L5-86 worker-descriptor-admission: L5/L8のcurrent catalog pinを実行可能に固定する。
    const designCatalogDigest = "e860cadd456e3673f134c6a169e65e01cdf9ec90d169ef8c5d2d611977274c93";
    expect(sha256("docs/design/design-catalog.yaml")).toBe(designCatalogDigest);
    expect(packet).toContain(designCatalogDigest);
  });

  it("U-WFCAT-005: propagates the workflow catalog design registration into the G3 freeze digest", () => {
    const designCatalogDigest = "e860cadd456e3673f134c6a169e65e01cdf9ec90d169ef8c5d2d611977274c93";
    const designCatalog = readFileSync("docs/design/design-catalog.yaml", "utf8");
    expect(designCatalog).toContain(
      "docs/design/helix/L6-function-design/workflow-classification-generated-catalog.md",
    );
    expect(designCatalog).toContain(
      "docs/test-design/helix/L8-workflow-classification-generated-catalog-runtime-unit-test-design.md",
    );
    expect(sha256("docs/design/design-catalog.yaml")).toBe(designCatalogDigest);
    expect(packet).toContain(designCatalogDigest);
  });

  it("U-WFROUTE-005: propagates the typed routing design registration into the G3 freeze digest", () => {
    const designCatalogDigest = "e860cadd456e3673f134c6a169e65e01cdf9ec90d169ef8c5d2d611977274c93";
    const designCatalog = readFileSync("docs/design/design-catalog.yaml", "utf8");
    expect(designCatalog).toContain(
      "docs/design/helix/L6-function-design/workflow-classification-typed-routing.md",
    );
    expect(designCatalog).toContain(
      "docs/test-design/helix/L8-workflow-classification-typed-routing-unit-test-design.md",
    );
    expect(sha256("docs/design/design-catalog.yaml")).toBe(designCatalogDigest);
    expect(packet).toContain(designCatalogDigest);
  });

  it("U-SDDA-007: state DB authority registrationをL3 freeze digestへ同期する", () => {
    const designCatalogDigest = "e860cadd456e3673f134c6a169e65e01cdf9ec90d169ef8c5d2d611977274c93";
    expect(sha256("docs/design/design-catalog.yaml")).toBe(designCatalogDigest);
    expect(packet).toContain(designCatalogDigest);
  });

  it("U-WFEPROJ-005: propagates policy projection design registration into the G3 freeze digest", () => {
    const designCatalogDigest = "e860cadd456e3673f134c6a169e65e01cdf9ec90d169ef8c5d2d611977274c93";
    const designCatalog = readFileSync("docs/design/design-catalog.yaml", "utf8");
    expect(designCatalog).toContain(
      "docs/design/helix/L6-function-design/workflow-execution-policy-projection.md",
    );
    expect(designCatalog).toContain(
      "docs/test-design/helix/L8-workflow-execution-policy-projection-runtime-unit-test-design.md",
    );
    expect(sha256("docs/design/design-catalog.yaml")).toBe(designCatalogDigest);
    expect(packet).toContain(designCatalogDigest);
  });

  it("U-WFEPOLRES-005: propagates policy resolution design registration into the G3 freeze digest", () => {
    const designCatalogDigest = "e860cadd456e3673f134c6a169e65e01cdf9ec90d169ef8c5d2d611977274c93";
    const designCatalog = readFileSync("docs/design/design-catalog.yaml", "utf8");
    expect(designCatalog).toContain(
      "docs/design/helix/L6-function-design/workflow-execution-policy-resolution.md",
    );
    expect(designCatalog).toContain(
      "docs/test-design/helix/L8-workflow-execution-policy-resolution-runtime-unit-test-design.md",
    );
    expect(sha256("docs/design/design-catalog.yaml")).toBe(designCatalogDigest);
    expect(packet).toContain(designCatalogDigest);
  });

  it("U-WFEXROUTE-005: propagates routing consumer registration into the G3 freeze digest", () => {
    const designCatalogDigest = "e860cadd456e3673f134c6a169e65e01cdf9ec90d169ef8c5d2d611977274c93";
    const designCatalog = readFileSync("docs/design/design-catalog.yaml", "utf8");
    expect(designCatalog).toContain(
      "docs/design/helix/L6-function-design/workflow-execution-routing-consumer.md",
    );
    expect(designCatalog).toContain(
      "docs/test-design/helix/L8-workflow-execution-routing-consumer-runtime-unit-test-design.md",
    );
    expect(sha256("docs/design/design-catalog.yaml")).toBe(designCatalogDigest);
    expect(packet).toContain(designCatalogDigest);
  });

  it("U-WFEXCLI-005: propagates routing CLI registration into the G3 freeze digest", () => {
    const designCatalogDigest = "e860cadd456e3673f134c6a169e65e01cdf9ec90d169ef8c5d2d611977274c93";
    const designCatalog = readFileSync("docs/design/design-catalog.yaml", "utf8");
    expect(designCatalog).toContain(
      "docs/design/helix/L6-function-design/workflow-execution-routing-cli.md",
    );
    expect(designCatalog).toContain(
      "docs/test-design/helix/L8-workflow-execution-routing-cli-runtime-unit-test-design.md",
    );
    expect(sha256("docs/design/design-catalog.yaml")).toBe(designCatalogDigest);
    expect(packet).toContain(designCatalogDigest);
  });

  it("U-TPWID-005: propagates typed PLAN identity pair into the G3 freeze digest", () => {
    const designCatalogDigest = "e860cadd456e3673f134c6a169e65e01cdf9ec90d169ef8c5d2d611977274c93";
    const designCatalog = readFileSync("docs/design/design-catalog.yaml", "utf8");
    expect(designCatalog).toContain(
      "docs/design/helix/L6-function-design/typed-plan-workflow-identity.md",
    );
    expect(designCatalog).toContain(
      "docs/test-design/helix/L8-typed-plan-workflow-identity-unit-test-design.md",
    );
    expect(sha256("docs/design/design-catalog.yaml")).toBe(designCatalogDigest);
    expect(packet).toContain(designCatalogDigest);
  });

  it("U-GWID-006: propagates GitHub workflow identity contract pair into the G3 freeze digest", () => {
    const designCatalogDigest = "e860cadd456e3673f134c6a169e65e01cdf9ec90d169ef8c5d2d611977274c93";
    const designCatalog = readFileSync("docs/design/design-catalog.yaml", "utf8");
    expect(designCatalog).toContain(
      "docs/design/helix/L6-function-design/github-workflow-identity-contract.md",
    );
    expect(designCatalog).toContain(
      "docs/test-design/helix/L8-github-workflow-identity-contract-unit-test-design.md",
    );
    expect(sha256("docs/design/design-catalog.yaml")).toBe(designCatalogDigest);
    expect(packet).toContain(designCatalogDigest);
  });

  // PLAN-L7-574-github-workflow-identity-admission — U-GWIDADM-008
  it("U-GWIDADM-008: GitHub workflow identity admission pairをG3 freeze digestへ伝播する", () => {
    const designCatalogDigest = "e860cadd456e3673f134c6a169e65e01cdf9ec90d169ef8c5d2d611977274c93";
    const designCatalog = readFileSync("docs/design/design-catalog.yaml", "utf8");
    expect(designCatalog).toContain(
      "docs/design/helix/L6-function-design/github-workflow-identity-admission.md",
    );
    expect(designCatalog).toContain(
      "docs/test-design/helix/L8-github-workflow-identity-admission-unit-test-design.md",
    );
    expect(sha256("docs/design/design-catalog.yaml")).toBe(designCatalogDigest);
    expect(packet).toContain(designCatalogDigest);
  });

  // PLAN-L7-575-plan-registry-workflow-identity-projection — U-DBWID-006
  it("U-DBWID-006: PLAN registry typed identity pairをG3 freeze digestへ伝播する", () => {
    const designCatalogDigest = "e860cadd456e3673f134c6a169e65e01cdf9ec90d169ef8c5d2d611977274c93";
    const designCatalog = readFileSync("docs/design/design-catalog.yaml", "utf8");
    expect(designCatalog).toContain(
      "docs/design/helix/L6-function-design/plan-registry-workflow-identity-projection.md",
    );
    expect(designCatalog).toContain(
      "docs/test-design/helix/L8-plan-registry-workflow-identity-projection-unit-test-design.md",
    );
    expect(sha256("docs/design/design-catalog.yaml")).toBe(designCatalogDigest);
    expect(packet).toContain(designCatalogDigest);
  });

  it("U-WFLEG-007: legacy adapter設計登録をG3 freeze digestへ伝播する", () => {
    const designCatalogDigest = "e860cadd456e3673f134c6a169e65e01cdf9ec90d169ef8c5d2d611977274c93";
    const designCatalog = readFileSync("docs/design/design-catalog.yaml", "utf8");
    expect(designCatalog).toContain(
      "docs/design/helix/L6-function-design/workflow-classification-legacy-adapter.md",
    );
    expect(designCatalog).toContain(
      "docs/test-design/helix/L8-workflow-classification-legacy-adapter-unit-test-design.md",
    );
    expect(sha256("docs/design/design-catalog.yaml")).toBe(designCatalogDigest);
    expect(packet).toContain(designCatalogDigest);
  });

  it("U-DESIGNELIC-004: design elicitation typed分類登録をG3 freeze digestへ伝播する", () => {
    const designCatalogDigest = "e860cadd456e3673f134c6a169e65e01cdf9ec90d169ef8c5d2d611977274c93";
    const designCatalog = readFileSync("docs/design/design-catalog.yaml", "utf8");
    expect(designCatalog).toContain(
      "docs/design/helix/L6-function-design/design-elicitation-typed-classification.md",
    );
    expect(designCatalog).toContain(
      "docs/test-design/helix/L8-design-elicitation-typed-classification-unit-test-design.md",
    );
    expect(sha256("docs/design/design-catalog.yaml")).toBe(designCatalogDigest);
    expect(packet).toContain(designCatalogDigest);
  });

  it("keeps every new L3 owner visible as an unresolved post-freeze downstream obligation", () => {
    for (const owner of [
      "management-integration-cell-orchestration",
      "lifecycle-stage-completion-authority",
      "development-model-requirement-projection",
      "helix-benchmark-evaluation-authority",
      "helix-technology-stack-authority",
      "design-harness-multimodal-authority",
      "github-security-admission",
      "security-capability-broker-authority",
    ]) {
      expect(packet, owner).toContain(`\`${owner}\``);
    }
    expect(packet.match(/`downstream_reservation_pending_after_g1_g3`/g)).toHaveLength(9);
    expect(packet).toContain("`PLAN-L3-62`");
    expect(packet).toContain("SEC-FR-CAP-001..007");
    expect(packet).toContain("SEC-AC-CAP-001..010");
  });

  it("freezes development style, case-driven model, and specialist process as separate axes", () => {
    expect(packet).toContain("Vモデル、Production Scrum、V設計＋Scrum実装Hybridを同列の開発style");
    expect(packet).toContain("Discovery／PoC等をcase-driven model");
    expect(packet).toContain("Design HARNESS等を専門工程");
    expect(packet).toContain("Requirement Engine");
    expect(packet).toContain("旧L0–L14 taxonomy");
    expect(packet).toContain("`PRODUCTION_SCRUM_REDUCED_V`");
  });

  it("contains the five-question batch and unresolved issue dispositions", () => {
    for (const question of [
      "L3承認前のdraft PR",
      "merge方式",
      "Update priority",
      "flat PLAN migration",
      "AWS reference profile",
    ]) {
      expect(packet).toContain(question);
    }
    for (const issue of ["#30", "#73", "#74", "#75"]) {
      expect(packet).toContain(issue);
    }
    expect(packet).toContain("ADOPTED_L3_L10_DOWNSTREAM_RESERVED_PENDING_FREEZE");
    expect(packet).toContain("DISPOSITION_SYNCED_DOWNSTREAM_RESERVED_PENDING_EXECUTION");
    expect(packet).toContain("ADOPTED_DOWNSTREAM_RESERVED_PENDING_IMPLEMENTATION");
    expect(packet).toContain("2026-07-25T18:27:27Z");
    expect(packet).toContain("2026-07-23T21:20:29Z");
    expect(packet).toContain("2026-07-23T21:20:30Z");
    expect(packet).toContain("2026-07-23T21:20:31Z");
    expect(packet).toContain(
      "sha256:37d385f2105d79add7bcc41011d719411c84aae5a06df0e12434ebaa38ec71a4",
    );
    expect(packet).toContain("153/153");
    expect(packet).toContain("24 FR / 72 AC / 24 HAT");
    expect(packet).toContain("unresolved audit 0");
    expect(packet).toContain("missing-test-plan-id=100");
    expect(packet).toContain("21+9+27+35=92");
    expect(packet).toContain("自己owner 8件");
    expect(packet).toContain("9+6+5 partition");
    expect(packet).toContain("PLAN slice closureとrequirements freezeの分離");
    expect(packet).toContain(
      "requirements definition 153件のG1/G3 freeze、downstream ownership実装、L4着手承認を意味しない",
    );
    expect(packet).toContain("個別PLANのreview evidenceを代替しない");
    expect(packet).toContain("G3後のGitHub 5責務・10小PR境界");
    expect(packet).toContain("原子的開発5責務・15小PR境界");
    expect(packet).toContain("pair closure 10枠、L6/L7 5枠、15枠");
    expect(packet).toContain("`L3Q-PC-036..045`");
    expect(packet).toContain("`L3Q-IT-023..027`");
    for (const workstream of [
      "atomic_slice_admission",
      "impact_ci_recovery",
      "mini_refactor_migration",
      "dependency_frontier_task_extraction",
      "pr_exclusive_lease",
    ]) {
      expect(packet).toContain(workstream);
    }
    expect(packet).toContain("7+5+4+14+5=35");
    expect(packet).toContain("最小7小PR");
    expect(packet).toContain("12+9+9+6+20+1=57");
    expect(packet).toContain("最小6小PR");
    expect(packet).toContain("初期pair closure分母は23小PR");
    expect(packet).toContain("current pair closure分母は35小PR");
    expect(packet).toContain("追補`L3Q-PC-024..035`");
    expect(packet).toContain("current pair closure分母は47小PR");
    expect(packet).not.toContain("current pair closure分母は45小PR");
    expect(packet).toContain("6+1+5=12小PR");
    expect(packet).toContain("合計16");
    expect(packet).toContain("pair closure 47 + L6/L7 28 + refactor 12 = 87小PR");
    expect(packet).toContain("right-arm execution evidence前");
    for (const planId of [
      "PLAN-L3-28-feedback-test-owner-closure-disposition",
      "PLAN-L3-29-feedback-test-owner-recognition-disposition",
      "PLAN-L3-30-feedback-test-owner-direct-disposition",
      "PLAN-L3-31-feedback-test-owner-residual-disposition",
      "PLAN-L3-32-feedback-refactor-disposition",
    ]) {
      expect(packet).toContain(planId);
    }
    const ownerRows = ["closure", "recognition", "direct", "residual"].flatMap((family) => {
      const disposition = JSON.parse(
        readFileSync(`docs/governance/feedback-test-owner-disposition-${family}.json`, "utf8"),
      ) as {
        bindings: Array<{
          test_path: string;
          expected_case_count: number;
        }>;
      };
      return disposition.bindings;
    });
    expect(ownerRows).toHaveLength(19);
    expect(new Set(ownerRows.map((row) => row.test_path)).size).toBe(19);
    // 初期missing-test 100件の8+92 snapshotとは別に、manifestは後続PLANが同じtest fileへ
    // 追加した独立oracleも含むcurrent case集合を追跡する。
    expect(ownerRows.reduce((sum, row) => sum + row.expected_case_count, 0)).toBe(95);
    for (const planId of ["PLAN-L7-351", "PLAN-L7-349", "PLAN-L7-150"]) {
      expect(packet).toContain(planId);
    }
    for (const planId of ["PLAN-L3-27", "PLAN-L3-20", "PLAN-L3-13"]) {
      expect(packet).toContain(planId);
    }
    for (const stem of [
      "github-merge-admission-ci-performance",
      "github-approval-recovery",
      "github-environment-promotion",
      "github-update-lifecycle",
      "github-plan-workflow-governance",
    ]) {
      expect(packet).toContain(`docs/design/helix/L4-basic-design/${stem}.md`);
      expect(packet).toContain(`docs/test-design/helix/L9-${stem}-integration.md`);
      expect(packet).toContain(`docs/design/helix/L5-detail/${stem}.md`);
      expect(packet).toContain(`docs/test-design/helix/L8-${stem}-contracts.md`);
    }
  });

  it("binds the five PO decisions and the snapshot-bound G1/G3 freeze without downstream claims", () => {
    const approval = readFileSync(
      "docs/design/helix/L3-requirements/github-approval-recovery-requirements.md",
      "utf8",
    );
    const update = readFileSync(
      "docs/design/helix/L3-requirements/github-update-lifecycle-requirements.md",
      "utf8",
    );
    const workflow = readFileSync(
      "docs/design/helix/L3-requirements/github-plan-workflow-governance-requirements.md",
      "utf8",
    );
    const requirements = readFileSync("docs/governance/helix-harness-requirements_v1.3.md", "utf8");
    const agents = readFileSync("AGENTS.md", "utf8");
    const claude = readFileSync("CLAUDE.md", "utf8");
    const audit = readFileSync("docs/governance/audit-framework.md", "utf8");

    expect(packet).toContain("issuecomment-5064713980");
    expect(packet).toContain("5問decision unresolvedは0");
    expect(packet).toContain("状態: `g1-g3-definition-freeze-confirmed`");
    expect(packet).toContain("packet PR自身の同一HEAD review");
    expect(packet).toContain("L4以降、実装、oracle実行が完了したとは扱わない");

    expect(approval).toContain("非正本のreview proposalとしてDraft PR");
    expect(approval).not.toContain("承認後にだけPRを作成する");
    expect(update).toContain("Issue identityとpriorityは直交");
    expect(update).toContain("`P3=Update`という固定対応を正本にしない");
    expect(workflow).toContain("L5契約が閉じた後に専用migration PLAN");
    expect(workflow).toContain("legacy loaderとnested loaderのdual-green");
    expect(requirements).toContain("AWS ECS Fargate + CDK TypeScript");
    expect(requirements).toContain("native auto-mergeは禁止");
    expect(agents).toContain("GitHub native auto-mergeは禁止");
    expect(claude).toContain("GitHub native auto-mergeは禁止");
    expect(audit).not.toContain("safe なら auto-merge");
    expect(audit).not.toContain("safe → auto-merge");
  });
});
// PLAN-L7-577-github-execution-episode-location-projection — U-GHEPL-008
