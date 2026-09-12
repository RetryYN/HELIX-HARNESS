import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const planPath = "docs/plans/PLAN-L5-105-cursor-cloud-independent-execution-contract.md";
const designPath = "docs/design/helix/L5-detail/cursor-cloud-independent-execution-contract.md";
const testDesignPath =
  "docs/test-design/helix/L8-cursor-cloud-independent-execution-contract-unit-test-design.md";

const plan = readFileSync(planPath, "utf8");
const design = readFileSync(designPath, "utf8");
const testDesign = readFileSync(testDesignPath, "utf8");

describe("Cursor Cloud independent execution L5/L8 pair", () => {
  it("U-CCI-DESIGN-001: pair and atomic owner are reciprocal", () => {
    expect(plan).toContain(`pair_artifact: ${testDesignPath}`);
    expect(design).toContain(`pair_artifact: ${testDesignPath}`);
    expect(testDesign).toContain(`pair_artifact: ${designPath}`);
    for (const body of [plan, design, testDesign]) {
      expect(body).toContain("behavior_contract_id: CURSOR-CLOUD-INDEPENDENT-EXECUTION-001");
      expect(body).toContain("responsibility_owner: cursor-cloud-execution");
    }
  });

  it("U-CCI-DESIGN-002: all required requirement traces survive descent", () => {
    const required = ["05", "06", "07", "08", "12", "13", "14", "23", "24", "25"];
    for (const id of required) expect(`${design}\n${testDesign}`).toContain(`3L-R-${id}`);
  });

  it("U-CCI-DESIGN-003: L8 oracle IDs are exact and unique", () => {
    const ids = [...testDesign.matchAll(/`(U-CCI-\d{3})`/g)].map((match) => match[1]);
    expect(ids).toEqual(Array.from({ length: 18 }, (_, index) => `U-CCI-${String(index + 1).padStart(3, "0")}`));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("U-CCI-DESIGN-004: failure precedence covers the full lifecycle", () => {
    const reasons = [...design.matchAll(/`(CURSOR_[A-Z_]+)`/g)].map((match) => match[1]);
    expect(new Set(reasons)).toEqual(
      new Set([
        "CURSOR_ASSIGNMENT_SCHEMA_INVALID",
        "CURSOR_ASSIGNMENT_AUTHORITY_STALE",
        "CURSOR_BRANCH_NOT_PREISSUED",
        "CURSOR_BRANCH_OWNERSHIP_CONFLICT",
        "CURSOR_BUDGET_UNAVAILABLE",
        "CURSOR_PREDISPATCH_IDENTITY_MISMATCH",
        "CURSOR_LAUNCH_OUTCOME_UNKNOWN",
        "CURSOR_RUNTIME_POLICY_VIOLATION",
        "CURSOR_EXTERNAL_OBSERVATION_INVALID",
        "CURSOR_REMOTE_OUTPUT_INVALID",
        "CURSOR_REVIEW_STALE_OR_FOREIGN",
        "CURSOR_SAFE_RELEASE_UNPROVEN",
      ]),
    );
  });
});
