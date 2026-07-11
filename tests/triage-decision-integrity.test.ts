import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeTriageDecisionIntegrity,
  loadTriageDecisionIntegrityInput,
  PIN_BACKLOG_VERIFIED,
  PIN_CATALOG_DONE,
  PIN_SYSTEM_LEGACY,
} from "../src/lint/triage-decision-integrity";

const root = join(import.meta.dirname, "..");
const base = () => loadTriageDecisionIntegrityInput(root);

describe("triage-decision-integrity (PLAN-L7-428)", () => {
  it("U-TRIAGE-001: real contract passes while unenumerated completion remains blocked", () => {
    const r = analyzeTriageDecisionIntegrity(base());
    expect(r.violations).toEqual([]);
    expect(r.ok).toBe(true);
    expect(r.completionReady).toBe(false);
  });
  it("U-TRIAGE-002: missing and bad schema fail closed", () => {
    expect(
      analyzeTriageDecisionIntegrity({ ...base(), manifest: null }).ok,
    ).toBe(false);
    const input = base();
    input.manifest!.schema_version = "bad";
    expect(
      analyzeTriageDecisionIntegrity(input).violations.map((v) => v.kind),
    ).toContain("invalid-schema");
  });
  it("U-TRIAGE-003: catalog manifest shrink is rejected by independent pin", () => {
    const input = base();
    delete input.manifest!.catalog!.done!["unit-test-design"];
    expect(
      analyzeTriageDecisionIntegrity(input).violations.map((v) => v.kind),
    ).toContain("pinned-set-mismatch");
  });
  it("U-TRIAGE-004: legacy system artifact cannot become canonical", () => {
    const input = base();
    const item = input.catalogItems.find((x) => x.id === "system-test-design")!;
    item.status = "done";
    item.artifact = PIN_SYSTEM_LEGACY;
    const kinds = analyzeTriageDecisionIntegrity(input).violations.map(
      (v) => v.kind,
    );
    expect(kinds).toContain("legacy-artifact-as-canonical");
    expect(kinds).toContain("source-status-drift");
  });
  it("U-TRIAGE-005: backlog missing, extra, and duplicate decisions are rejected", () => {
    for (const ids of [
      PIN_BACKLOG_VERIFIED.slice(1),
      [...PIN_BACKLOG_VERIFIED, "IMP-999"],
      [...PIN_BACKLOG_VERIFIED, "IMP-004"],
    ]) {
      const input = base();
      input.manifest!.backlog!.verified_ids = [...ids];
      expect(
        analyzeTriageDecisionIntegrity(input).violations.map((v) => v.kind),
      ).toContain("pinned-set-mismatch");
    }
  });
  it("U-TRIAGE-006: actual source drift is rejected", () => {
    const input = base();
    input.backlogStatuses.set("IMP-004", "triaged");
    expect(
      analyzeTriageDecisionIntegrity(input).violations.map((v) => v.kind),
    ).toContain("source-status-drift");
  });
  it("U-TRIAGE-007: IMP-118 cannot close while IMP-148 is residual", () => {
    const input = base();
    input.backlogStatuses.set("IMP-118", "verified");
    input.backlogStatuses.set("IMP-148", "verified");
    const kinds = analyzeTriageDecisionIntegrity(input).violations.map(
      (v) => v.kind,
    );
    expect(kinds).toContain("source-status-drift");
    expect(kinds).toContain("residual-not-open");
  });
  it("U-TRIAGE-008: count-only completion and duplicate inflation are rejected", () => {
    const input = base();
    input.manifest!.backlog!.unenumerated_status_claim = {
      expected_count: 10,
      ids: [],
      state: "resolved",
    };
    expect(
      analyzeTriageDecisionIntegrity(input).violations.map((v) => v.kind),
    ).toContain("unresolved-state-invalid");
    input.manifest!.backlog!.unenumerated_status_claim = {
      expected_count: 10,
      ids: Array(10).fill("IMP-001"),
      state: "resolved",
    };
    expect(
      analyzeTriageDecisionIntegrity(input).violations.map((v) => v.kind),
    ).toContain("unresolved-count-unproved");
  });
  it("U-TRIAGE-009: missing canonical artifact is rejected", () => {
    const input = base();
    input.artifactExists = (p) => p !== PIN_CATALOG_DONE["unit-test-design"];
    expect(
      analyzeTriageDecisionIntegrity(input).violations.map((v) => v.kind),
    ).toContain("artifact-not-found");
  });
  it("U-TRIAGE-010: simultaneous manifest/source shrink still fails code pin", () => {
    const input = base();
    delete input.manifest!.catalog!.done!["unit-test-design"];
    input.catalogItems = input.catalogItems.filter(
      (x) => x.id !== "unit-test-design",
    );
    expect(
      analyzeTriageDecisionIntegrity(input).violations.map((v) => v.kind),
    ).toContain("pinned-set-mismatch");
  });
  it("U-TRIAGE-011: real repository loader preserves exact pinned sizes", () => {
    const input = base();
    expect(Object.keys(input.manifest!.catalog!.done!)).toHaveLength(3);
    expect(input.manifest!.backlog!.verified_ids).toHaveLength(14);
  });
});
