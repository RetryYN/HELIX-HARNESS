import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const relatedLayerLines = [
  "related_l3: docs/design/helix/L3-requirements",
  "related_l4: docs/design/helix/L4-basic-design",
  "related_l5: docs/design/helix/L5-detail",
  "related_l6: docs/design/helix/L6-function-design",
];

describe("HELIX related layer pair metadata", () => {
  it("keeps broad HELIX adoption test-design pairs tied to concrete L3-L6 design files", () => {
    for (const path of [
      "docs/test-design/helix/upstream-substance-gap.md",
      "docs/test-design/helix/legacy-helix-extension.md",
    ]) {
      const text = readFileSync(path, "utf8");
      for (const line of relatedLayerLines) {
        expect(text, `${path} must include ${line}`).toContain(line);
      }
    }
  });

  it("does not let the upstream directory pair replace explicit L3-L6 descent evidence", () => {
    const upstream = readFileSync("docs/test-design/helix/upstream-substance-gap.md", "utf8");
    expect(upstream).toContain("pair_artifact: docs/design/helix/");
    expect(upstream).toContain("`related_l3`〜`related_l6` を正");
    expect(upstream).toContain("広い directory pair だけで L3-L6 降下済みと扱わない");
  });
});
