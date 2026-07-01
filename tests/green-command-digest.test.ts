import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  auditGreenCommandDigests,
  checkGreenCommandDigests,
  type DigestAuditDeps,
  greenCommandDigestMessages,
} from "../src/lint/green-command-digest";
import type { ParsedReviewPlan } from "../src/lint/review-evidence";

function plan(
  planId: string,
  greenCommands: { evidence_path: string; output_digest: string }[],
): ParsedReviewPlan {
  return {
    file: `docs/plans/${planId}.md`,
    plan_id: planId,
    kind: "impl",
    status: "confirmed",
    updated: "2026-06-23",
    hasEvidence: true,
    crossEntries: [
      {
        review_kind: "intra_runtime_subagent",
        green_commands: greenCommands.map((g) => ({
          kind: "unit_test",
          command: "bun test",
          runner: "bun",
          scope: "targeted",
          exit_code: 0,
          evidence_path: g.evidence_path,
          output_digest: g.output_digest,
        })),
      },
    ],
  };
}

// deterministic fake content store + hash
const STORE: Record<string, string> = {
  "tests/real.test.ts": "real-content",
};
const deps: DigestAuditDeps = {
  readBytes: (p) => (p in STORE ? Buffer.from(STORE[p]) : null),
  // fake hash = "sha256:" + reversed content padded — deterministic, not real sha256, fine for the unit.
  hash: (bytes) => `sha256:${Buffer.from(bytes).toString("hex")}`,
};

describe("green-command-digest (PLAN-L7-132) — digest 実体検査", () => {
  const realDigest = `sha256:${"a".repeat(64)}`;
  const historicalDigest = `sha256:${"b".repeat(64)}`;

  it("U-GREENCMD-001: passes when output_digest is valid and evidence_path exists", () => {
    const mismatches = auditGreenCommandDigests(
      [plan("PLAN-OK", [{ evidence_path: "tests/real.test.ts", output_digest: realDigest }])],
      deps,
    );
    expect(mismatches).toEqual([]);
  });

  it("U-GREENCMD-001: accepts historical valid digests after evidence_path content evolves", () => {
    const mismatches = auditGreenCommandDigests(
      [
        plan("PLAN-HISTORICAL", [
          { evidence_path: "tests/real.test.ts", output_digest: historicalDigest },
        ]),
      ],
      deps,
    );
    expect(mismatches).toEqual([]);
  });

  it("U-GREENCMD-001: flags a fake/placeholder digest as digest-invalid (the L7-110/114 hole)", () => {
    const mismatches = auditGreenCommandDigests(
      [
        plan("PLAN-FAKE", [
          { evidence_path: "tests/real.test.ts", output_digest: "sha256:110feedbac000001" },
        ]),
      ],
      deps,
    );
    expect(mismatches).toHaveLength(1);
    expect(mismatches[0]?.reason).toBe("digest-invalid");
    expect(mismatches[0]?.plan_id).toBe("PLAN-FAKE");
  });

  it("U-GREENCMD-001: flags a missing evidence_path file", () => {
    const mismatches = auditGreenCommandDigests(
      [plan("PLAN-GONE", [{ evidence_path: "tests/missing.test.ts", output_digest: realDigest }])],
      deps,
    );
    expect(mismatches).toHaveLength(1);
    expect(mismatches[0]?.reason).toBe("file-missing");
    expect(mismatches[0]?.actual).toBe("");
  });

  it("U-GREENCMD-001: skips entries with empty path or digest", () => {
    const mismatches = auditGreenCommandDigests(
      [plan("PLAN-EMPTY", [{ evidence_path: "", output_digest: "" }])],
      deps,
    );
    expect(mismatches).toEqual([]);
  });

  it("U-GREENCMD-002: renders an OK message when clean and a violation when mismatched", () => {
    expect(greenCommandDigestMessages([])[0]).toContain("OK");
    const message = greenCommandDigestMessages([
      {
        plan_id: "PLAN-FAKE",
        evidence_path: "tests/real.test.ts",
        claimed: "sha256:dead",
        actual: "sha256:beef",
        reason: "digest-invalid",
      },
    ])[0];
    expect(message).toContain("violation:");
    expect(message).toContain("PLAN-FAKE");
  });

  it("U-GREENCMD-002: fails closed when the repository root is unreadable", () => {
    const result = checkGreenCommandDigests(
      join(tmpdir(), `ut-tdd-green-command-digest-missing-root-${Date.now()}-nope`),
    );

    expect(result.ok).toBe(false);
    expect(result.messages.join("\n")).toContain("violation:");
  });
});
