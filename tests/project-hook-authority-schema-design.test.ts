import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const plan = readFileSync("docs/plans/PLAN-L5-103-project-hook-authority-schema.md", "utf8");
const design = readFileSync("docs/design/helix/L5-detail/project-hook-authority-schema.md", "utf8");
const l8 = readFileSync(
  "docs/test-design/helix/L8-project-hook-authority-schema-unit-test-design.md",
  "utf8",
);
const designCatalog = readFileSync("docs/design/design-catalog.yaml", "utf8");

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

describe("project hook authority L5↔L8 schema", () => {
  it("U-CNWHOOKSCHEMA-DESIGN-001: root exact 12 fieldと暗黙補完禁止を固定する", () => {
    for (const field of [
      "schema_version",
      "execution_root",
      "loader_root",
      "session_project_root",
      "assignment_binding",
      "repository_head",
      "candidate_base_head",
      "current_authority_head",
      "source_material",
      "current_authority_source_material",
      "physical_evidence",
      "lifecycle_policy",
    ])
      expect(design).toContain(`\`${field}\``);
    expect(design).toContain("root exact set");
    expect(design).toContain("primary shared tree、Git remote、provider名から補完しない");
  });

  it("U-CNWHOOKSCHEMA-DESIGN-002: identity、assignment、sourceの軸を分離する", () => {
    expect(design).toContain("device_id");
    expect(design).toContain("file_id");
    expect(design).toContain("hooks_config_digest");
    expect(design).toContain("agent_guard_digest");
    expect(design).toContain("worker_policy_digest");
    expect(design).toContain("観測値と期待値を同じobjectへ上書きしない");
    expect(design).toContain("`session`");
    expect(design).toContain("`assignment`");
    expect(design).toContain("`.claude/settings.json` digestをこのobjectへ入れず");
  });

  it("U-CNWHOOKSCHEMA-DESIGN-003: lifecycleとterminal payload保全をexact化する", () => {
    expect(design).toContain("既定は15000ms、hard ceilingは60000ms");
    expect(design).toContain("parent_terminal_required:false");
    expect(design).toContain("project_hook_lifecycle_timeout");
    expect(design).toContain("placeholderへ変換しない");
    expect(design).toContain("object bytesを変更せず");
  });

  it("U-CNWHOOKSCHEMA-DESIGN-004: failure順とside effect 0を固定する", () => {
    for (const code of [
      "schema_invalid",
      "unsupported_physical_identity",
      "project_hook_source_stale_or_foreign",
      "hook_lifecycle_policy_invalid",
      "project_hook_lifecycle_timeout",
      "terminal_result_mutation_detected",
    ])
      expect(design).toContain(`\`${code}\``);
    expect(design).toContain("hook execution、dispatch、Git、DB、GitHub writeの全て0");
  });

  it("U-CNWHOOKSCHEMA-DESIGN-005: L8 oracleをexact 12件保持する", () => {
    const ids = [...l8.matchAll(/`U-CNWHOOKSCHEMA-(\d{3})`/g)].map((match) => match[1]);
    expect(ids).toEqual(Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(3, "0")));
    expect(l8).toContain("fake clock");
    expect(l8).toContain("foreign treeへのwrite、reset、checkoutをoracle自身も実行しない");
  });

  it("U-CNWHOOKSCHEMA-DESIGN-006: PLANとL5↔L8 pairを束縛する", () => {
    expect(plan).toContain("CNW-R-06..08／CNW-AC-009..013");
    expect(plan).toContain("parent: docs/plans/PLAN-L4-76-project-hook-authority-boundary.md");
    expect(design).toContain(
      "pair_artifact: docs/test-design/helix/L8-project-hook-authority-schema-unit-test-design.md",
    );
    expect(l8).toContain(
      "pair_artifact: docs/design/helix/L5-detail/project-hook-authority-schema.md",
    );
    expect(designCatalog).toContain("docs/design/helix/L5-detail/project-hook-authority-schema.md");
  });

  it("U-CNWHOOKSCHEMA-DESIGN-007: L5/L8 contractをheading＋非空substance＋fail-close条件へ束縛する", () => {
    for (const heading of [
      "## 1. root契約",
      "## 2. repositoryの物理identity",
      "## 3. source materialとassignment binding",
      "## 4. success receiptとsurface projection",
      "## 5. lifecycle policyとterminal payload",
      "## 6. failure契約",
    ]) {
      const body = section(design, heading);
      expect(body.length, heading).toBeGreaterThan(150);
      expect(body, heading).toMatch(/拒否|failure|fail-close|禁止|authority|不変|しない|のみ/u);
    }
    for (const heading of ["## 1. fixture境界", "## 2. mutation反証oracle"]) {
      const body = section(l8, heading);
      expect(body.length, heading).toBeGreaterThan(180);
      expect(body, heading).toMatch(/拒否|failure|write|0|使わない/u);
    }
  });
});
