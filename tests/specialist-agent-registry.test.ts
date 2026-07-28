import { describe, expect, it } from "vitest";
import {
  analyzeSpecialistAgentRegistry,
  loadSpecialistAgentRegistry,
  selectSpecialistTeam,
} from "../src/runtime/specialist-agent-registry";

// PLAN-L7-480-specialist-agent-registry
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

  it.each([
    ["be", ["api"]],
    ["fe", ["frontend"]],
    ["fullstack", ["integration"]],
    ["db", ["database"]],
    ["agent", ["agent-runtime"]],
  ] as const)("ST-SAREG-001: drive=%sにexactly one worker候補を返す", (drive, capabilities) => {
    const result = selectSpecialistTeam(loadSpecialistAgentRegistry(process.cwd()), {
      drive,
      required_capabilities: [...capabilities],
      required_verification_axes: ["correctness"],
    });
    expect(result.ok).toBe(true);
    expect(result.worker?.drives).toContain(drive);
    expect(result.worker?.authority).toBe("worker");
    expect(result.verifiers).toHaveLength(1);
  });

  it("ST-SAREG-002: correctness/test/securityを異providerの最小teamで被覆する", () => {
    const result = selectSpecialistTeam(loadSpecialistAgentRegistry(process.cwd()), {
      drive: "be",
      required_capabilities: ["api"],
      required_verification_axes: ["correctness", "test", "security"],
    });
    expect(result.ok).toBe(true);
    expect(result.verifiers.map((entry) => entry.agent_id)).toEqual([
      "claude-code-reviewer",
      "claude-security-verifier",
      "claude-qa-verifier",
    ]);
    expect(
      result.verifiers.every((entry) => entry.provider_family !== result.worker?.provider_family),
    ).toBe(true);
  });

  it("IT-SAREG-002: allowlist外launch IDをadmitしない", () => {
    const loaded = loadSpecialistAgentRegistry(process.cwd());
    const registry = structuredClone(loaded.registry);
    expect(registry).not.toBeNull();
    if (!registry) return;
    registry.entries[0].launch_id = "unregistered-worker";
    const digests = Object.fromEntries(
      registry.entries.map((entry) => [entry.sync_source.path, entry.sync_source.digest]),
    );
    const result = analyzeSpecialistAgentRegistry({
      raw_registry: registry,
      definition_digests: digests,
    });
    expect(result.ok).toBe(false);
    expect(result.findings).toMatchObject([
      { code: "launch_not_allowlisted", subject: registry.entries[0].agent_id },
    ]);
  });

  it("IT-SAREG-003: required capability欠落をworker missingへ変換する", () => {
    const result = selectSpecialistTeam(loadSpecialistAgentRegistry(process.cwd()), {
      drive: "db",
      required_capabilities: ["database", "unregistered-capability"],
      required_verification_axes: ["correctness"],
    });
    expect(result.ok).toBe(false);
    expect(result.worker).toBeNull();
    expect(result.findings).toMatchObject([{ code: "worker_missing", subject: "db" }]);
  });

  it("IT-SAREG-005: verification axis欠落を部分team成功へ丸めない", () => {
    const loaded = loadSpecialistAgentRegistry(process.cwd());
    const registry = structuredClone(loaded.registry);
    expect(registry).not.toBeNull();
    if (!registry) return;
    registry.entries = registry.entries.filter(
      (entry) => !entry.verification_axes.includes("security"),
    );
    const result = selectSpecialistTeam(
      { ok: true, registry, findings: [] },
      {
        drive: "be",
        required_capabilities: ["api"],
        required_verification_axes: ["correctness", "security"],
      },
    );
    expect(result.ok).toBe(false);
    expect(result.worker?.agent_id).toBe("codex-backend-worker");
    expect(result.verifiers.map((entry) => entry.agent_id)).toEqual(["claude-code-reviewer"]);
    expect(result.findings).toMatchObject([{ code: "verifier_missing", subject: "security" }]);
  });

  it("ST-SAREG-003: duplicate agent IDを起動候補として扱わない", () => {
    const loaded = loadSpecialistAgentRegistry(process.cwd());
    const registry = structuredClone(loaded.registry);
    expect(registry).not.toBeNull();
    if (!registry) return;
    registry.entries.push(structuredClone(registry.entries[0]));
    const digests = Object.fromEntries(
      registry.entries.map((entry) => [entry.sync_source.path, entry.sync_source.digest]),
    );
    const result = analyzeSpecialistAgentRegistry({
      raw_registry: registry,
      definition_digests: digests,
    });
    expect(result.ok).toBe(false);
    expect(result.findings).toMatchObject([
      { code: "duplicate_agent_id", subject: registry.entries[0].agent_id },
    ]);
  });

  it("U-SAREG-006: repository外を指すdefinition pathを読込前に拒否する", () => {
    const loaded = loadSpecialistAgentRegistry(process.cwd());
    const registry = structuredClone(loaded.registry);
    expect(registry).not.toBeNull();
    if (!registry) return;
    registry.entries[0].sync_source.path = "../outside-definition.md";
    const result = analyzeSpecialistAgentRegistry({
      raw_registry: registry,
      definition_digests: {},
    });
    expect(result.ok).toBe(false);
    expect(result.registry).toBeNull();
    expect(result.findings).toMatchObject([{ code: "registry_schema_invalid" }]);
  });
});
