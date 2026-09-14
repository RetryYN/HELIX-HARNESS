import { describe, expect, it } from "vitest";
import {
  buildRuntimeCapabilityMatrixReport,
  evaluateRuntimeCapabilityRoute,
  isRuntimeCapability,
} from "../src/runtime/runtime-capability-matrix";

describe("runtime capability matrix", () => {
  it("emits a read-only matrix with evidence paths", () => {
    const report = buildRuntimeCapabilityMatrixReport({});
    expect(report.ok).toBe(true);
    expect(report.runtimes.length).toBeGreaterThanOrEqual(5);
    expect(
      report.runtimes.find((runtime) => runtime.runtime === "codex")?.capabilities.tool_shell,
    ).toMatchObject({
      status: "supported",
      evidence_path: expect.any(String),
    });
  });

  it("fails closed for unknown runtimes", () => {
    expect(evaluateRuntimeCapabilityRoute("unknown", ["tool_shell"])).toMatchObject({
      ok: false,
      status: "unsupported",
      missing: ["tool_shell"],
      fallback: "escalate",
    });
  });

  it("keeps capability validation explicit", () => {
    expect(isRuntimeCapability("hooks")).toBe(true);
    expect(isRuntimeCapability("telepathy")).toBe(false);
  });

  it("includes evidence paths in route decisions", () => {
    const decision = evaluateRuntimeCapabilityRoute("codex", ["tool_shell", "hooks"]);
    expect(decision.ok).toBe(true);
    expect(decision.evidence_paths.length).toBeGreaterThan(0);
    expect(decision.evidence_paths).toContain("src/runtime/hosted-preflight.ts");
  });
});
