import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const plan = readFileSync("docs/plans/PLAN-L4-76-project-hook-authority-boundary.md", "utf8");
const design = readFileSync(
  "docs/design/helix/L4-basic-design/project-hook-authority-boundary.md",
  "utf8",
);
const l9 = readFileSync(
  "docs/test-design/helix/L9-project-hook-authority-boundary-system-test-design.md",
  "utf8",
);

describe("project hook authority L4↔L9 boundary", () => {
  it("U-CNWHOOKBOUND-001: CNW-AC-009..013をexactに配置する", () => {
    const ids = [...design.matchAll(/`CNW-AC-(\d{3})`/g)].map((match) => match[1]);
    expect(ids).toEqual(["009", "010", "011", "012", "013"]);
    expect(plan).toContain("CNW-R-06..08／CNW-AC-009..013");
  });

  it("U-CNWHOOKBOUND-002: component責務と暗黙fallback禁止を固定する", () => {
    for (const component of [
      "PhysicalRepositoryIdentityCapture",
      "ProjectHookAuthorityResolver",
      "AssignmentRootAuthoritySelector",
      "ProjectHookSurfaceProjector",
      "BoundedHookLifecycleSupervisor",
      "NotificationWakeWorkerPort",
    ]) {
      expect(design).toContain(`\`${component}\``);
    }
    expect(design).toContain("primary shared treeへfallbackしない");
    expect(design).toContain("lexical path一致だけでsame判定しない");
  });

  it("U-CNWHOOKBOUND-003: 4 surfaceの同一receiptとphysical identityを固定する", () => {
    expect(design).toContain("SessionStart／doctor／status／dispatch");
    expect(design).toContain("単一`project_hook_authority_receipt`");
    expect(design).toContain("realpath");
    expect(design).toContain("device／inode相当");
    expect(design).toContain("project_hook_source_stale_or_foreign");
  });

  it("U-CNWHOOKBOUND-004: bounded lifecycleとterminal result保全を固定する", () => {
    expect(design).toContain("既定15秒、hard ceiling 60秒");
    expect(design).toContain("project_hook_lifecycle_timeout");
    expect(design).toContain("親processのterminal化");
    expect(design).toContain("result、session ID、candidate HEAD、verdict");
    expect(design).toContain("NotificationWakeWorkerPort");
  });

  it("U-CNWHOOKBOUND-005: L9 system oracleをexact 8件保持する", () => {
    const ids = [...l9.matchAll(/`ST-CNW-HOOK-(\d{3})`/g)].map((match) => match[1]);
    expect(ids).toEqual(Array.from({ length: 8 }, (_, i) => String(i + 1).padStart(3, "0")));
    expect(l9).toContain("foreign fixtureへのwrite、reset、checkout");
    expect(l9).toContain("unsupported physical fieldをsameへ補完");
  });

  it("U-CNWHOOKBOUND-006: L4↔L9 pairを双方向に束縛する", () => {
    expect(design).toContain(
      "pair_artifact: docs/test-design/helix/L9-project-hook-authority-boundary-system-test-design.md",
    );
    expect(l9).toContain(
      "pair_artifact: docs/design/helix/L4-basic-design/project-hook-authority-boundary.md",
    );
  });
});
