import { describe, expect, it } from "vitest";
import { buildSourceContentMirrorCompletenessReport } from "../src/runtime/source-content-mirror-completeness";

describe("source content mirror completeness", () => {
  it("separates default content digest from complete all-ref mirror evidence", () => {
    const report = buildSourceContentMirrorCompletenessReport([
      {
        repo: "org/repo",
        refs_digest: "sha256:0123456789abcdef",
        default_tree_digest: "sha256:fedcba9876543210",
        default_branch_content_digest: "sha256:0011223344556677",
        all_ref_content_status: "complete",
        retry_status: "none",
        chunks: [
          {
            chunk_id: "0001",
            status: "ok",
            object_ids: ["blob:a", "blob:a", "blob:b"],
            size_bytes: 128,
            reused_digest: true,
          },
        ],
      },
    ]);

    expect(report.ok).toBe(true);
    expect(report.completion_claim_allowed).toBe(true);
    expect(report.object_dedup_count).toBe(1);
    expect(report.aggregate_content_digest).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it("fail-closes missing refs/tree digests and keeps incomplete repos in retry ledger", () => {
    const report = buildSourceContentMirrorCompletenessReport([
      {
        repo: "org/incomplete",
        refs_digest: null,
        default_tree_digest: null,
        default_branch_content_digest: "sha256:0011223344556677",
        all_ref_content_status: "partial",
        retry_status: "queued",
        chunks: [
          {
            chunk_id: "0002",
            status: "failed",
            object_ids: ["blob:c"],
            size_bytes: 512,
            failure_reason: "rate-limit",
          },
        ],
      },
    ]);

    expect(report.ok).toBe(false);
    expect(report.completion_claim_allowed).toBe(false);
    expect(report.retry_ledger).toEqual([
      { repo: "org/incomplete", status: "partial", retry_status: "queued" },
    ]);
    expect(report.chunk_resume_plan).toEqual([
      { repo: "org/incomplete", next_chunk_id: "0002", reason: "rate-limit" },
    ]);
    expect(report.findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining([
        "refs_digest_missing_fail_close",
        "default_tree_digest_missing_fail_close",
        "all_ref_content_incomplete",
      ]),
    );
  });
});
