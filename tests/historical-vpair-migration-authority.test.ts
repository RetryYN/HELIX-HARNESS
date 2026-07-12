import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  classifyHistoricalVpairMigration,
  type HistoricalCandidate,
  parseHistoricalVpairAuthority,
  validateHistoricalMigrationReview,
} from "../src/policy/historical-vpair-migration-authority";
import { verifyPinnedCutoff } from "../src/state-db/historical-vpair-migration-authority";

const d = `sha256:${"a".repeat(64)}` as const;
const oid = "b".repeat(40);
const authority = () =>
  parseHistoricalVpairAuthority(
    JSON.parse(readFileSync("config/historical-vpair-migration-authority.json", "utf8")),
  );
const candidate = (x: Partial<HistoricalCandidate> = {}): HistoricalCandidate => ({
  plan_id: "PLAN-L7-1-x",
  plan_path: "docs/plans/x.md",
  kind: "impl",
  classification: "needs_design",
  reason: "PLAN verification binding absent",
  canonical_reason: "verification_bindings_absent",
  detail: null,
  fingerprint: d,
  has_bindings: false,
  current_semantic_digest: d,
  cutoff_semantic_digest: d,
  current_raw_digest: d,
  cutoff_raw_digest: d,
  cutoff_present: true,
  cutoff_plan_id: "PLAN-L7-1-x",
  cutoff_blob_oid: oid,
  assisted: false,
  load_error: null,
  ...x,
});
describe("historical V-pair migration authority", () => {
  it("U-HVMA-001: [PLAN-L7-437-historical-vpair-migration-authority/U-HVMA-001] cutoff tree identityとspoof/post baseline", () => {
    const a = authority();
    const r = classifyHistoricalVpairMigration({
      authority: a,
      candidates: [candidate(), candidate({ plan_id: "PLAN-L7-2-y", cutoff_present: false })],
    });
    expect(r.counts.historical_unproven).toBe(1);
    expect(r.counts.post_enforcement_violation).toBe(1);
  });
  it("U-HVMA-003: [PLAN-L7-437-historical-vpair-migration-authority/U-HVMA-003] baseline pin完全一致だけpinned backlog", () => {
    const raw = structuredClone(authority()) as Record<string, unknown>;
    const base: Record<string, unknown> = {
      fingerprint: d,
      plan_id: "PLAN-L7-1-x",
      reason: "verification_bindings_absent",
      detail: null,
      plan_path: "docs/plans/x.md",
      cutoff_blob_oid: oid,
      plan_semantic_digest: d,
    };
    const stable = (v: unknown): string =>
      Array.isArray(v)
        ? `[${v.map(stable).join(",")}]`
        : v && typeof v === "object"
          ? `{${Object.entries(v as Record<string, unknown>)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([k, x]) => `${JSON.stringify(k)}:${stable(x)}`)
              .join(",")}}`
          : JSON.stringify(v);
    base.row_digest = `sha256:${createHash("sha256").update(stable(base)).digest("hex")}`;
    raw.rows = [base];
    raw.initial_census_digest = `sha256:${createHash("sha256").update(stable(raw.rows)).digest("hex")}`;
    delete raw.authority_digest;
    raw.authority_digest = `sha256:${createHash("sha256").update(stable(raw)).digest("hex")}`;
    const a = parseHistoricalVpairAuthority(raw);
    expect(
      classifyHistoricalVpairMigration({ authority: a, candidates: [candidate()] }).counts
        .historical_provenance_pinned_backlog,
    ).toBe(1);
    expect(() =>
      classifyHistoricalVpairMigration({
        authority: a,
        candidates: [candidate({ cutoff_semantic_digest: `sha256:${"c".repeat(64)}` })],
      }),
    ).toThrow(/unused historical authority row/);
  });
  it("U-HVMA-005: [PLAN-L7-437-historical-vpair-migration-authority/U-HVMA-005] designはtagだけでpromotion型を持たない", () => {
    const r = classifyHistoricalVpairMigration({
      authority: authority(),
      candidates: [candidate({ assisted: true })],
    });
    expect(r.decisions[0]?.tags).toEqual(["forward_assisted_candidate"]);
    expect(JSON.stringify(r)).not.toContain("eligible");
  });
  it("U-HVMA-007: [PLAN-L7-437-historical-vpair-migration-authority/U-HVMA-007] admissionとprimary件数を保存する", () => {
    const r = classifyHistoricalVpairMigration({
      authority: authority(),
      candidates: [candidate(), candidate({ plan_id: "PLAN-L7-2", kind: "design" })],
    });
    expect(r.source_total).toBe(r.admitted_total + r.rejected_total);
    expect(r.admitted_total).toBe(1);
    expect(r.rejected_total).toBe(1);
  });
  it("U-HVMA-009: [PLAN-L7-437-historical-vpair-migration-authority/U-HVMA-009] independent append-only review束縛", () => {
    const b = classifyHistoricalVpairMigration({
      authority: authority(),
      candidates: [candidate()],
    });
    const review: Record<string, unknown> = {
      schema_version: "historical-vpair-migration-review.v1",
      worker_identity: "w",
      reviewer_identity: "r",
      review_kind: "cross_agent",
      worker_task_id: "worker-task",
      reviewer_task_id: "reviewer-task",
      termination_event_id: "termination-1",
      worker_termination_event_id: "termination-worker-1",
      termination_status: "completed",
      bundle_digest: b.bundle_digest,
      authority_artifact_digest: d,
      authority_generation: 1,
      previous_digest: null,
      reviewed_at: "2026-07-12T00:00:00.000Z",
      expires_at: "2026-07-12T01:00:00.000Z",
      verdicts: [{ plan_id: "PLAN-L7-1-x", verdict: "approve" }],
    };
    const stable = (v: unknown): string =>
      Array.isArray(v)
        ? `[${v.map(stable).join(",")}]`
        : v && typeof v === "object"
          ? `{${Object.entries(v as Record<string, unknown>)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([k, x]) => `${JSON.stringify(k)}:${stable(x)}`)
              .join(",")}}`
          : JSON.stringify(v);
    review.review_digest = `sha256:${createHash("sha256").update(stable(review)).digest("hex")}`;
    expect(
      validateHistoricalMigrationReview({
        value: review,
        bundle: b,
        now: "2026-07-12T00:30:00.000Z",
        authorityBinding: { artifactDigest: d, generation: 1 },
      }),
    ).toBeTruthy();
    expect(() =>
      validateHistoricalMigrationReview({
        value: { ...review, reviewer_identity: "w" },
        bundle: b,
        now: "2026-07-12T00:30:00.000Z",
        authorityBinding: { artifactDigest: d, generation: 1 },
      }),
    ).toThrow();
  });
  it("IT-HVMA-001/002 ST-HVMA-001: pinned configとcutoff ancestor/treeを実repoで検証", () => {
    expect(() => verifyPinnedCutoff(process.cwd(), authority())).not.toThrow();
  });
  it("U-HVMA-002: [PLAN-L7-437-historical-vpair-migration-authority/U-HVMA-002] created spoof禁止", () =>
    expect(
      classifyHistoricalVpairMigration({
        authority: authority(),
        candidates: [candidate({ cutoff_present: false, cutoff_plan_id: null })],
      }).decisions[0]?.primary,
    ).toBe("post_enforcement_violation"));
  it("U-HVMA-004: [PLAN-L7-437-historical-vpair-migration-authority/U-HVMA-004] post baseline禁止", () =>
    expect(
      classifyHistoricalVpairMigration({
        authority: authority(),
        candidates: [candidate({ cutoff_present: false })],
      }).counts.post_enforcement_violation,
    ).toBe(1));
  it("U-HVMA-006: [PLAN-L7-437-historical-vpair-migration-authority/U-HVMA-006] inference禁止", () =>
    expect(
      Object.keys(
        classifyHistoricalVpairMigration({
          authority: authority(),
          candidates: [candidate({ assisted: true })],
        }).decisions[0] ?? {},
      ),
    ).not.toContain("proposal"));
  it("U-HVMA-008: [PLAN-L7-437-historical-vpair-migration-authority/U-HVMA-008] dynamic census", () =>
    expect(
      classifyHistoricalVpairMigration({
        authority: authority(),
        candidates: Array.from({ length: 7 }, (_, index) =>
          candidate({ plan_id: `PLAN-L7-${index + 10}-dynamic` }),
        ),
      }).source_total,
    ).toBe(7));
  it("U-HVMA-010: [PLAN-L7-437-historical-vpair-migration-authority/U-HVMA-010] promotion禁止", () => {
    const state = JSON.stringify({ registry: [], closure_status: "confirmed" });
    classifyHistoricalVpairMigration({ authority: authority(), candidates: [candidate()] });
    expect(JSON.stringify({ registry: [], closure_status: "confirmed" })).toBe(state);
  });
});
