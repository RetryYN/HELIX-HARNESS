import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { L3_PROGRESSION_REVIEWED_DIGESTS } from "../src/lint/l3-progression-reviewed-digests";

const plan = readFileSync("docs/plans/PLAN-L4-76-project-hook-authority-boundary.md", "utf8");
const design = readFileSync(
  "docs/design/helix/L4-basic-design/project-hook-authority-boundary.md",
  "utf8",
);
const l9 = readFileSync(
  "docs/test-design/helix/L9-project-hook-authority-boundary-system-test-design.md",
  "utf8",
);
const designCatalogPath = "docs/design/design-catalog.yaml";
const designCatalog = readFileSync(designCatalogPath, "utf8");
const freezePacket = readFileSync("docs/governance/l3-rebaseline-g3-freeze-packet.md", "utf8");

function section(document: string, heading: string): string {
  const lines = document.split(/\r?\n/);
  const start = lines.indexOf(heading);
  if (start < 0) throw new Error(`section missing: ${heading}`);
  const depth = heading.match(/^#+/)?.[0].length ?? 0;
  const end = lines.findIndex(
    (line, index) =>
      index > start && /^#+ /.test(line) && (line.match(/^#+/)?.[0].length ?? 0) <= depth,
  );
  const body = lines
    .slice(start + 1, end < 0 ? undefined : end)
    .join("\n")
    .trim();
  if (!body) throw new Error(`section empty: ${heading}`);
  return body;
}

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

  it("U-CNWHOOKBOUND-007: L4設計登録をG3 freeze digestへ伝播する", () => {
    const digest = createHash("sha256").update(designCatalog).digest("hex");
    expect(designCatalog).toContain(
      "docs/design/helix/L4-basic-design/project-hook-authority-boundary.md",
    );
    expect(L3_PROGRESSION_REVIEWED_DIGESTS[designCatalogPath]).toBe(digest);
    expect(freezePacket).toContain(`design catalog digest候補: \`sha256:${digest}\``);
  });

  it("U-CNWHOOKBOUND-008: L4/L9 contractをheading＋非空substance＋fail-close条件へ束縛する", () => {
    for (const heading of [
      "## 2. component境界",
      "## 3. 正規入力と出力port",
      "## 4. physical identityとassignment state",
      "## 5. lifecycleと結果保全",
      "## 6. failureとside effect境界",
    ]) {
      const body = section(design, heading);
      expect(body.length, heading).toBeGreaterThan(180);
      expect(body, heading).toMatch(/拒否|failure|fail-close|禁止|不変|authority/u);
    }
    for (const heading of ["## 1. system fixture境界", "## 2. system接合のnegative oracle"]) {
      const body = section(l9, heading);
      expect(body.length, heading).toBeGreaterThan(180);
      expect(body, heading).toMatch(/拒否|失敗|fail|write|0/u);
    }
  });
});
