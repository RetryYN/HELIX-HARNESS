import { describe, expect, it } from "vitest";
import {
  analyzeSpecialistAgentRegistry,
  loadSpecialistAgentRegistry,
  selectSpecialistTeam,
} from "../src/runtime/specialist-agent-registry";

// PLAN-L7-479-specialist-agent-registry
describe("specialist agent registry", () => {
  it("U-SAREG-001: repository registryとdefinition digest/allowlistをexact照合する", () => {
    const result = loadSpecialistAgentRegistry(process.cwd());
    expect(result.ok).toBe(true);
    expect(result.registry?.schema_version).toBe("specialist-agent-registry.v1");
    expect(result.registry?.entries).toHaveLength(9);
  });

  it("U-SAREG-002: definition digest driftを起動可能として扱わない", () => {
    const loaded = loadSpecialistAgentRegistry(process.cwd());
    const registry = structuredClone(loaded.registry);
    expect(registry).not.toBeNull();
    if (!registry) return;
    const digests = Object.fromEntries(
      registry.entries.map((entry) => [entry.sync_source.path, entry.sync_source.digest]),
    );
    digests[registry.entries[0].sync_source.path] = `sha256:${"0".repeat(64)}`;
    const result = analyzeSpecialistAgentRegistry({
      raw_registry: registry,
      definition_digests: digests,
    });
    expect(result.ok).toBe(false);
    expect(result.findings.map((finding) => finding.code)).toContain("definition_digest_mismatch");
  });

  it("U-SAREG-003: drive/capabilityからworkerとcross-provider verifierを決定する", () => {
    const result = selectSpecialistTeam(loadSpecialistAgentRegistry(process.cwd()), {
      drive: "be",
      required_capabilities: ["api", "implementation"],
      required_verification_axes: ["correctness", "test"],
    });
    expect(result.ok).toBe(true);
    expect(result.worker?.agent_id).toBe("codex-backend-worker");
    expect(result.verifiers.map((entry) => entry.agent_id)).toEqual([
      "claude-code-reviewer",
      "claude-qa-verifier",
    ]);
    expect(
      result.verifiers.every((entry) => entry.provider_family !== result.worker?.provider_family),
    ).toBe(true);
  });

  it("U-SAREG-004: 同providerしかいないverification axisをfail-closeする", () => {
    const loaded = loadSpecialistAgentRegistry(process.cwd());
    const registry = structuredClone(loaded.registry);
    expect(registry).not.toBeNull();
    if (!registry) return;
    registry.entries = registry.entries.filter(
      (entry) => entry.authority === "worker" || entry.provider_family === "codex",
    );
    const result = selectSpecialistTeam(
      { ok: true, registry, findings: [] },
      {
        drive: "be",
        required_capabilities: ["api"],
        required_verification_axes: ["correctness"],
      },
    );
    expect(result.ok).toBe(false);
    expect(result.findings).toMatchObject([
      { code: "independent_verifier_missing", subject: "correctness" },
    ]);
  });

  it("U-SAREG-005: model classがMODEL_IDSにないentryをadmitしない", () => {
    const loaded = loadSpecialistAgentRegistry(process.cwd());
    const registry = structuredClone(loaded.registry);
    expect(registry).not.toBeNull();
    if (!registry) return;
    registry.entries[0].model_class = "unknown-class";
    const digests = Object.fromEntries(
      registry.entries.map((entry) => [entry.sync_source.path, entry.sync_source.digest]),
    );
    const result = analyzeSpecialistAgentRegistry({
      raw_registry: registry,
      definition_digests: digests,
    });
    expect(result.ok).toBe(false);
    expect(result.findings).toMatchObject([
      { code: "model_class_not_in_ssot", subject: registry.entries[0].agent_id },
    ]);
  });
});
