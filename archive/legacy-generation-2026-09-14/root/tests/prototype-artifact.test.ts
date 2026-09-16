// PLAN-L7-511-screen-applicability-proto / U-SAP-006（HST-CASE-024-02/03/07）
import { describe, expect, it } from "vitest";
import type {
  PrototypeManifestV1,
  PrototypeStateFixtureV1,
  PrototypeTaskV1,
} from "../src/design/screen-applicability";
import {
  computePrototypeManifestDigest,
  PROTOTYPE_STATE_KINDS,
  validatePrototypeArtifact,
} from "../src/design/screen-applicability";

const task: PrototypeTaskV1 = {
  task_id: "task-1",
  capability_id: "cap-ui",
  requirement_revision: 1,
  obligation_digest: "sha256:obligation",
  status: "building",
};

function manifest(overrides: Partial<PrototypeManifestV1> = {}): PrototypeManifestV1 {
  const base = {
    artifact_id: "artifact-1",
    revision: 1,
    executable_locator: "prototypes/cap-ui/index.html",
    content_digest: "sha256:content",
    build_digest: "sha256:build",
    startup_command_digest: "sha256:startup-cmd",
    startup_receipt_digest: "sha256:startup-receipt",
    screen_trace_digest: "sha256:screen-trace",
    interaction_trace_digest: "sha256:interaction-trace",
    state_trace_digest: "sha256:state-trace",
    data_trace_digest: "sha256:data-trace",
    temporary_data_boundary_digest: "sha256:tmp-boundary",
    producer_digest: "sha256:producer",
    ...overrides,
  };
  return { ...base, manifest_digest: computePrototypeManifestDigest(base) };
}

function states(): PrototypeStateFixtureV1[] {
  return PROTOTYPE_STATE_KINDS.map((state, index) => ({
    state,
    fixture_id: `fixture-${state}`,
    input_digest: `sha256:input-${index}`,
    expected_view_digest: `sha256:view-${index}`,
  }));
}

describe("U-SAP-006 validatePrototypeArtifact", () => {
  it("U-SAP-006: 9状態完備のexecutable manifestでready receipt exactly-one（同義入力は同digest）", () => {
    const a = validatePrototypeArtifact(task, manifest(), states());
    const b = validatePrototypeArtifact(task, manifest(), [...states()].reverse());
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) {
      expect(a.value.artifact_id).toBe("artifact-1");
      expect(a.value.revision).toBe(1);
      expect(a.value.capability_id).toBe("cap-ui");
      expect(a.value.state_set_digest).toBe(b.value.state_set_digest);
      expect(a.value.receipt_digest).toBe(b.value.receipt_digest);
    }
  });

  it.each([
    ["executable_locator空 (static-only)", { executable_locator: "" }],
    ["absolute locator", { executable_locator: "/abs/proto.html" }],
    ["build_digest欠落", { build_digest: "" }],
    ["startup_command_digest欠落", { startup_command_digest: "" }],
    ["startup_receipt_digest欠落 (startup failure)", { startup_receipt_digest: "" }],
  ])("HST-CASE-024-02: %s はHIL_PROTOTYPE_NOT_EXECUTABLE", (_label, override) => {
    const result = validatePrototypeArtifact(task, manifest(override), states());
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_PROTOTYPE_NOT_EXECUTABLE");
  });

  it.each([
    ["content_digest欠落", { content_digest: "" }],
    ["screen trace欠落", { screen_trace_digest: "" }],
    ["interaction trace欠落", { interaction_trace_digest: "" }],
    ["state trace欠落", { state_trace_digest: "" }],
    ["data trace欠落", { data_trace_digest: "" }],
    ["temporary data boundary欠落", { temporary_data_boundary_digest: "" }],
    ["producer provenance欠落", { producer_digest: "" }],
  ])("HST-CASE-024-07: %s はHIL_PROTOTYPE_ARTIFACT_INCOMPLETE", (_label, override) => {
    const result = validatePrototypeArtifact(task, manifest(override), states());
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_PROTOTYPE_ARTIFACT_INCOMPLETE");
  });

  it("manifest_digest 1 byte改変はHIL_PROTOTYPE_ARTIFACT_INCOMPLETE", () => {
    const tampered = { ...manifest(), manifest_digest: "sha256:tampered" };
    const result = validatePrototypeArtifact(task, tampered, states());
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_PROTOTYPE_ARTIFACT_INCOMPLETE");
  });

  it.each(PROTOTYPE_STATE_KINDS.map((kind) => [kind] as const))(
    "HST-CASE-024-03: 状態 %s の欠落はHIL_PROTOTYPE_STATE_MISSING",
    (kind) => {
      const result = validatePrototypeArtifact(
        task,
        manifest(),
        states().filter((s) => s.state !== kind),
      );
      expect(result.ok).toBe(false);
      if (!result.ok)
        expect(result.failures.map((f) => f.code)).toContain("HIL_PROTOTYPE_STATE_MISSING");
    },
  );

  it("状態重複（同一kind 2件）はHIL_PROTOTYPE_STATE_MISSING", () => {
    const duplicated = [...states(), states()[0]];
    const result = validatePrototypeArtifact(task, manifest(), duplicated);
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_PROTOTYPE_STATE_MISSING");
  });

  it("state fixtureのfield欠落はHIL_PROTOTYPE_STATE_MISSING", () => {
    const broken = states();
    broken[3] = { ...broken[3], expected_view_digest: "" };
    const result = validatePrototypeArtifact(task, manifest(), broken);
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_PROTOTYPE_STATE_MISSING");
  });

  it("完了済みtask（status=complete）へのready発行はfail-close", () => {
    const result = validatePrototypeArtifact({ ...task, status: "complete" }, manifest(), states());
    expect(result.ok).toBe(false);
  });

  it.each([
    ["requirement_revision非整数", { requirement_revision: 1.5 }],
    ["requirement_revision 0", { requirement_revision: 0 }],
    ["capability_id欠落", { capability_id: "" }],
    ["obligation_digest欠落", { obligation_digest: "" }],
  ])("task側field不正（%s）はHIL_PROTOTYPE_ARTIFACT_INCOMPLETE", (_label, override) => {
    const result = validatePrototypeArtifact({ ...task, ...override }, manifest(), states());
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.failures.map((f) => f.code)).toContain("HIL_PROTOTYPE_ARTIFACT_INCOMPLETE");
  });
});
