import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  dContractGateChecksSchema,
  dContractModeRoutingSchema,
  evaluateRouteCommand,
  routeSignalToMode,
  validateDContractDsl,
  validateRouteConfigText,
} from "../src/workflow/routing-contracts";

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "d-contract");
const modeRoutingText = readFileSync(join(fixtureDir, "mode-routing.yaml"), "utf8");
const gateChecksText = readFileSync(join(fixtureDir, "gate-checks.yaml"), "utf8");

describe("D-CONTRACT DSL routing contracts (PLAN-L7-312)", () => {
  it("loads valid mode-routing and gate-checks fixtures without rewriting existing route behavior", () => {
    const result = validateDContractDsl({
      modeRoutingText,
      gateChecksText,
      requiredGateIds: ["G1", "G8"],
      modeRoutingPath: "tests/fixtures/d-contract/mode-routing.yaml",
      gateChecksPath: "tests/fixtures/d-contract/gate-checks.yaml",
    });

    expect(result.ok).toBe(true);
    expect(result.mode_routing?.routes.map((route) => route.mode)).toEqual([
      "reverse",
      "refactor",
      "forward",
    ]);
    expect(Object.keys(result.gate_checks?.gates ?? {})).toEqual(["G1", "G8"]);
    expect(dContractModeRoutingSchema.safeParse(result.mode_routing).success).toBe(true);
    expect(dContractGateChecksSchema.safeParse(result.gate_checks).success).toBe(true);
    expect(routeSignalToMode({ signal: "doctor failure" }).candidates).toContain("reverse");
    expect(evaluateRouteCommand({ signal: "feature_addition" }).recommended_command?.command).toBe(
      "helix task classify",
    );
    expect(validateRouteConfigText({ path: "route.yaml", text: "route: ok" })).toEqual([]);
  });

  it("fails closed for unknown mode values", () => {
    const result = validateDContractDsl({
      modeRoutingText: modeRoutingText.replace("mode: reverse", "mode: unknown-mode"),
      gateChecksText,
      requiredGateIds: ["G1"],
    });

    expect(result.ok).toBe(false);
    expect(result.findings.map((finding) => finding.code)).toContain(
      "d-contract-mode-routing-schema",
    );
    expect(result.mode_routing).toBeNull();
  });

  it("fails closed when a required gate is missing", () => {
    const result = validateDContractDsl({
      modeRoutingText,
      gateChecksText,
      requiredGateIds: ["G1", "G14"],
    });

    expect(result.ok).toBe(false);
    expect(result.findings.map((finding) => finding.code)).toContain(
      "d-contract-missing-required-gate",
    );
  });

  it("fails closed for next routing cycles", () => {
    const result = validateDContractDsl({
      modeRoutingText: [
        "routes:",
        "  - signal: a",
        "    mode: reverse",
        "    priority: 1",
        "    next: [b]",
        "  - signal: b",
        "    mode: refactor",
        "    priority: 2",
        "    next: [a]",
      ].join("\n"),
      gateChecksText,
      requiredGateIds: ["G1"],
    });

    expect(result.ok).toBe(false);
    expect(result.findings.map((finding) => finding.code)).toContain("d-contract-next-cycle");
  });

  it("fails closed for non helix next_action commands", () => {
    const legacyRuntimeName = ["ut", "tdd"].join("-");
    const result = validateDContractDsl({
      modeRoutingText,
      gateChecksText: gateChecksText.replace(
        "command: helix doctor",
        `command: ${legacyRuntimeName} doctor`,
      ),
      requiredGateIds: ["G1"],
    });

    expect(result.ok).toBe(false);
    expect(result.findings.map((finding) => finding.code)).toContain(
      "d-contract-gate-checks-schema",
    );
    expect(result.gate_checks).toBeNull();
  });
});
