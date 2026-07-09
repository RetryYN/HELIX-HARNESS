import { describe, expect, it } from "vitest";
import { buildCrossRepoSpecStoreReport } from "../src/runtime/cross-repo-spec-store";

describe("cross-repo spec store", () => {
  it("fail-closes unpinned refs and write operations without approval", () => {
    const report = buildCrossRepoSpecStoreReport({
      store_id: "store:shared-spec",
      source: "git@github.com:RetryYN/shared-spec.git",
      ref: "main",
      operation: "sync",
      read_only: false,
      consuming_plan_id: "PLAN-L7-374",
      artifact_digest: null,
      action_binding_approval_present: false,
    });

    expect(report.ok).toBe(false);
    expect(report.findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining([
        "unpinned_store_ref_fail_close",
        "write_or_sync_requires_action_binding_approval",
        "consuming_plan_missing_store_digest",
      ]),
    );
    expect(report.trusted_artifact).toBe(false);
  });

  it("accepts read-only consumption with pinned ref and artifact digest", () => {
    const report = buildCrossRepoSpecStoreReport({
      store_id: "store:shared-spec",
      source: "git@github.com:RetryYN/shared-spec.git",
      ref: "a148fd304a455e21e631d4dab3c36d59725b1034",
      operation: "read",
      read_only: true,
      consuming_plan_id: "PLAN-L7-374",
      artifact_digest: "sha256:abc",
    });

    expect(report.ok).toBe(true);
    expect(report.trusted_artifact).toBe(true);
    expect(report.dry_run).toBe(true);
  });
});
