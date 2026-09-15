import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("HELIX evidence boundary indexes", () => {
  it("keeps L7 implementation evidence tied to unit oracles and completion boundaries", () => {
    const text = readFileSync(
      "docs/design/helix/L7-implementation/implementation-evidence-index.md",
      "utf8",
    );
    for (const required of [
      "## 証跡対応",
      "L6 unit oracle trace",
      "`HU-PILLAR-*` 46 件",
      "runtime provenance",
      "projection-only row は trace support",
      "setup/distribution implementation",
      "no-write / plan-only 証跡",
      "whole-program completion boundary",
      "`completionClaimAllowed=false`",
      "G-10 blocked",
    ]) {
      expect(text).toContain(required);
    }
  });
});
