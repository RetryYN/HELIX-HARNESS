import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const PACKET_PATH = "docs/governance/l3-rebaseline-g3-freeze-packet.md";
const packet = readFileSync(PACKET_PATH, "utf8");

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
    "20186dde0ca6abdc0d0d41bbf1c040ed2116d2fa01dc4c55119267175dd0be61",
  ],
  [
    "docs/test-design/helix/worker-common-contract-acceptance.md",
    "d3be187322ea9fdbda8dd703c9f32faaa62b33d3eeb8e8c0683febc4e938f631",
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
    "42fc7bdcc43c245a714902723f3a21dd367d7006a853713aa5389a61a279dd21",
  ],
  [
    "docs/test-design/helix/github-operations-projection-acceptance.md",
    "7638e322a28a3bb866704feb2fbf431c1d1afba8154883f6f679bb5e52bb9600",
  ],
  [
    "docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md",
    "46ac0554f1e268368111317373c22a839eb8a7f4325b47c1b4a42ccffde40d3f",
  ],
  [
    "docs/test-design/helix/github-autonomous-operations-acceptance.md",
    "fd2100f6449d26118f5da4ce3c0104537b82dc1c14331cf3d7329669ddada237",
  ],
  [
    "docs/design/helix/L3-requirements/github-merge-admission-requirements.md",
    "f8878a2c39233fb93a31aa1bc2cc257d9a64253db5b79264da19cd0b58369c35",
  ],
  [
    "docs/test-design/helix/github-merge-admission-system-test-design.md",
    "f17b4477647ebe349d68b0cae92bedb7b16e898326b269968dac0b168707ded9",
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
    "c7179d279180203231784de1d04928cd9c68e0741cf7f9aa24d572edc18a1ae9",
  ],
  [
    "docs/test-design/helix/github-update-lifecycle-system-test-design.md",
    "117a856a0356da6c5ef7178d9efbe0e52377187b75d6a74d3ef2879b4e0d492d",
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
    "3ceed32fb0f9425c1d5f58391d21e4aa9b535f758bf96935cabb3fa1c96c5fce",
  ],
  [
    "docs/test-design/helix/github-atomic-development-system-test-design.md",
    "2c3c44ed4195c3ab888ea227495559eca71604f686250c26603229cf2e1aff46",
  ],
] as const;

describe("L3 G1/G3 freeze packet v2", () => {
  it("binds the final material snapshot and delegates self-referential receipts externally", () => {
    const plan = readFileSync("docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md", "utf8");
    expect(plan).toContain("- tests/l3-g3-freeze-packet-v2.test.ts");
    expect(packet).toContain("状態: `review-ready-awaiting-external-receipts`");
    expect(packet).toContain("a91ffdc5b2a5be0aac736227ae3944967ceda300");
    expect(packet).toContain("599298df2851376133cd186a456a2ffc56d462b9");
    expect(packet).toContain("GitHub same-HEAD review receiptへ外部束縛");
    expect(packet).toContain("clean隔離rebuild 2回一致をGitHub receiptへ外部束縛");
    expect(packet).toContain("review HEADとmerge HEADのtreeが同一");
    expect(packet).not.toContain("PENDING_PACKET_PR_HEAD");
    expect(packet).not.toContain("PENDING_SAME_HEAD_ISOLATED_REBUILD_X2");
    expect(packet).not.toContain("PENDING_AFTER_PR_98_L3_26_L3_27_MERGE");
    expect(packet).not.toContain("PENDING_L3_26_INDEPENDENT_DIGEST_REVIEW");
  });

  it("binds every listed L3/L10 artifact candidate to its current digest", () => {
    for (const [path, expected] of pairedArtifacts) {
      expect(sha256(path), path).toBe(expected);
      expect(packet, path).toContain(expected);
    }
    expect(sha256("docs/governance/helix-harness-requirements_v1.3.md")).toBe(
      "efe7b903416b17ff4abe00c0227864420d39e6cbc9ec625f36b0b8327cb005eb",
    );
    expect(sha256("docs/governance/l3-progression-authority-rebaseline-2026-07-19.md")).toBe(
      "f7e425c53a42b7a04d02b277d869b9e1dee9ed48b2126505add49569546cfd8d",
    );
    expect(sha256("docs/design/design-catalog.yaml")).toBe(
      "1b61fea46ebe4649200163d4ab0df633cea951b7eef19f424025ab2f435e9de7",
    );
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
    expect(packet).toContain("2026-07-23T21:20:08Z");
    expect(packet).toContain("2026-07-23T21:20:29Z");
    expect(packet).toContain("2026-07-23T21:20:30Z");
    expect(packet).toContain("2026-07-23T21:20:31Z");
    expect(packet).toContain(
      "sha256:7db51be39361040898a90f8e5f84e20ed3d347dbc49b3502125aa7bb0bcca055",
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
    expect(packet).toContain("current pair closure分母は45小PR");
    expect(packet).toContain("6+1+5=12小PR");
    expect(packet).toContain("合計16");
    expect(packet).toContain("pair closure 45 + L6/L7 27 + refactor 12 = 84小PR");
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
    expect(ownerRows.reduce((sum, row) => sum + row.expected_case_count, 0)).toBe(92);
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

  it("binds the five PO decisions without claiming G1/G3 freeze", () => {
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
    expect(packet).toContain("状態: `review-ready-awaiting-external-receipts`");
    expect(packet).toContain("packet PR自身の同一HEAD review");
    expect(packet).toContain("PO最終承認資料として提示してはならない");

    expect(approval).toContain("非正本のreview proposalとしてDraft PR");
    expect(approval).not.toContain("承認後にだけPRを作成する");
    expect(update).toContain("Issue identityとpriorityは直交");
    expect(update).toContain("`P3=Update`という固定対応を正本にしない");
    expect(workflow).toContain("L5契約が閉じた後に専用migration PLAN");
    expect(workflow).toContain("legacy loaderとnested loaderのdual-green");
    expect(requirements).toContain("AWS ECS Fargate + CDK TypeScript");
    expect(requirements).toContain("native auto-mergeは禁止");
    expect(agents).toContain("GitHub native auto-mergeは使わず");
    expect(claude).toContain("GitHub native auto-mergeは使わず");
    expect(audit).not.toContain("safe なら auto-merge");
    expect(audit).not.toContain("safe → auto-merge");
  });
});
