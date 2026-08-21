import { describe, expect, it } from "vitest";
import {
  classifyFinalRecognitionDisposition,
  scanL12HybridRecognitionCandidates,
} from "../src/lint/l12-hybrid-recognition";
import { REVIEWED_SAFE_DISPOSITIONS } from "../src/lint/l12-hybrid-reviewed-safe-v2";

// PLAN-REVERSE-186-derived-requirement-trace-backfill
describe("Issue #186 derived trace Reverse reviewed disposition", () => {
  it("Reverse fullback PLANをlive candidate digestとfalse-positive判定へ束縛する", () => {
    const path = "docs/plans/PLAN-REVERSE-186-derived-requirement-trace-backfill.md";
    const candidate = scanL12HybridRecognitionCandidates().find((entry) => entry.path === path);
    expect(candidate).toBeDefined();
    if (!candidate) throw new Error(`derived trace Reverse PLAN candidate missing: ${path}`);
    const reviewed = REVIEWED_SAFE_DISPOSITIONS.find((entry) => entry.path === path);
    expect(reviewed).toBeDefined();
    expect(reviewed?.contentDigest).toBe(candidate.contentDigest);
    expect(classifyFinalRecognitionDisposition(candidate)).toBe("false_positive");
  });
});
