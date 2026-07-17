import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const REQUIREMENTS = "docs/governance/helix-harness-requirements_v1.3.md";
const AUTHORITY_DOCS = [
  "docs/governance/helix-harness-concept_v3.1.md",
  "docs/governance/gate-design.md",
  "docs/governance/document-system-map.md",
  "docs/process/README.md",
  "docs/process/forward/overview.md",
  "docs/process/modes/README.md",
  "docs/process/modes/discovery.md",
] as const;

const FORBIDDEN_CURRENT_CLAIMS = [
  /出口は必ず\s*Forward\s*L0(?:-|〜)L14/,
  /Forward\s+は[^\n]{0,80}L0\s*(?:→|から)[^\n]{0,40}L14[^\n]{0,40}(?:中核|正規)/,
  /Forward\s+合流先の層番号は\s*L0(?:-|〜)L14[^\n]{0,30}正とする/,
  /L0(?:-|〜)L14\s+V-model\s+本線/,
] as const;

function currentLayerAuthorityViolations(text: string): string[] {
  return FORBIDDEN_CURRENT_CLAIMS.filter((pattern) => pattern.test(text)).map((pattern) =>
    pattern.toString(),
  );
}

describe("L1-L12 canonical layer authority", () => {
  it("pins the canonical layer and V-pair contract in requirements v1.3", () => {
    const requirements = readFileSync(REQUIREMENTS, "utf8");
    expect(requirements).toContain("L1〜L12のVモデルとScrumのハイブリッド");
    expect(requirements).toContain("L1↔L12");
    expect(requirements).toContain("L6↔L7");
    expect(requirements).toContain(
      "authority文書が本書を参照し、L0〜L14をcurrent canonicalと表示しない",
    );
  });

  it.each(AUTHORITY_DOCS)("rejects current L0-L14 authority claims in %s", (path) => {
    const text = readFileSync(path, "utf8");
    expect(text).toContain("helix-harness-requirements_v1.3.md");
    expect(currentLayerAuthorityViolations(text)).toEqual([]);
  });

  it("fails closed when a legacy layer sentence is promoted back to current authority", () => {
    const poisoned = "入口は分岐するが、出口は必ず Forward L0-L14 へ合流する。";
    expect(currentLayerAuthorityViolations(poisoned)).not.toEqual([]);
  });
});
