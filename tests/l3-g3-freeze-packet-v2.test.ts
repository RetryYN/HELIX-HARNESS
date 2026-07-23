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
    "c874750a27031647495dd04c5e15113cef263f28904d991c553e61a70d37786f",
  ],
  [
    "docs/test-design/helix/github-approval-recovery-system-test-design.md",
    "74792349b5b0a8669f4e4b1228c775a57e44e6d85cbd292b562d1dcb83b69e86",
  ],
  [
    "docs/design/helix/L3-requirements/github-ci-performance-requirements.md",
    "96e2b1e538138b8d25f46f082317526f3d2691547edb6c3713ae6957cbc5d002",
  ],
  [
    "docs/test-design/helix/github-ci-performance-system-test-design.md",
    "ce58bddaabeda8c214b8678dd68dfcb171100444ec973206fbcfbdfd60530b75",
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
    "836b1a8161052f956aeaa8c52d2a6c63110b92a30eed4bdb03d18cc0b0f87163",
  ],
  [
    "docs/test-design/helix/github-update-lifecycle-system-test-design.md",
    "117a856a0356da6c5ef7178d9efbe0e52377187b75d6a74d3ef2879b4e0d492d",
  ],
  [
    "docs/design/helix/L3-requirements/github-plan-workflow-governance-requirements.md",
    "16b2c56e4fc65a3e495d23262eb4a10356af296964289a31b617888396786a59",
  ],
  [
    "docs/test-design/helix/github-plan-workflow-governance-system-test-design.md",
    "4d28725768506a67fa119d8851aa010114ddcde5c1cd8f315a68c5a369e13202",
  ],
] as const;

describe("L3 G1/G3 freeze packet v2", () => {
  it("keeps the packet non-approvable while snapshot evidence is pending", () => {
    if (packet.includes("PENDING_")) {
      expect(packet).toContain("状態: `draft-not-approvable`");
      expect(packet).toContain("PENDING_AFTER_PR_98_L3_26_L3_27_MERGE");
      expect(packet).toContain("PENDING_SAME_HEAD_ISOLATED_REBUILD_X2");
    }
  });

  it("binds every listed L3/L10 artifact candidate to its current digest", () => {
    for (const [path, expected] of pairedArtifacts) {
      expect(sha256(path), path).toBe(expected);
      expect(packet, path).toContain(expected);
    }
    expect(sha256("docs/governance/helix-harness-requirements_v1.3.md")).toBe(
      "9ef0c31c7838f961ccf968ee70b6b23ce4c10f0108797e3f01ecaf88546529c6",
    );
    expect(
      sha256("docs/governance/l3-progression-authority-rebaseline-2026-07-19.md"),
    ).toBe("f7e425c53a42b7a04d02b277d869b9e1dee9ed48b2126505add49569546cfd8d");
    expect(sha256("docs/design/design-catalog.yaml")).toBe(
      "fca15ea362c8845eeb8c1a4bf0903bc27615a28d751ef793a6287c08f59ff692",
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
    expect(packet).toContain("153/153");
    expect(packet).toContain("24 FR / 72 AC / 24 HAT");
    expect(packet).toContain("unresolved audit 0");
    expect(packet).toContain("missing-test-plan-id=100");
    expect(packet).toContain("21 test file");
    expect(packet).toContain("残44件は15 file");
  });
});
