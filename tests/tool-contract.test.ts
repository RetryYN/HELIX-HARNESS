import { describe, expect, it } from "vitest";
import {
  auditToolContractRegistry,
  DEFAULT_TOOL_CONTRACTS,
  toolContractRegistryMessages,
  validateToolContractSurface,
} from "../src/orchestration/tool-contract";

describe("typed agent-tool contract registry (HC-P2 / HU-PILLAR-P2-01)", () => {
  it("U-TOOLCONTRACT-001: allows registered tool requests only when required fields are present", () => {
    expect(
      validateToolContractSurface({
        toolName: "exec_command",
        payload: { cmd: "bun run test" },
      }),
    ).toMatchObject({ kind: "allow", contractId: "tool.contract.shell-command.v1" });

    expect(
      validateToolContractSurface({
        toolName: "exec_command",
        payload: {},
      }),
    ).toMatchObject({
      kind: "deny",
      findings: ["missing_required_field:cmd"],
    });
  });

  it("U-TOOLCONTRACT-002: blocks unregistered tool surfaces unless they are explicitly deferred", () => {
    expect(validateToolContractSurface({ toolName: "unknown_tool", payload: {} })).toEqual({
      kind: "deny",
      contractId: null,
      toolName: "unknown_tool",
      findings: ["unregistered_tool_surface:unknown_tool"],
    });

    expect(
      validateToolContractSurface({
        toolName: "future_tool",
        payload: {},
        deferredReason: "PLAN-L7-future owns the surface",
      }),
    ).toMatchObject({
      kind: "defer",
      findings: ["deferred_surface:PLAN-L7-future owns the surface"],
    });
  });

  it("U-TOOLCONTRACT-003: validates response contracts after tool execution", () => {
    expect(
      validateToolContractSurface({
        toolName: "exec_command",
        stage: "response",
        response: { exit_code: 0 },
      }),
    ).toMatchObject({ kind: "allow", contractId: "tool.contract.shell-command.v1" });

    expect(
      validateToolContractSurface({
        toolName: "exec_command",
        stage: "response",
        response: { status: "ok" },
      }),
    ).toMatchObject({
      kind: "deny",
      findings: ["missing_response_field:exit_code"],
    });
  });

  it("U-TOOLCONTRACT-004: keeps Codex spawn_agent typed separately from Claude Agent semantics", () => {
    expect(
      validateToolContractSurface({
        toolName: "spawn_agent",
        payload: { agent_type: "worker", message: "Inspect contract registry" },
      }),
    ).toMatchObject({ kind: "allow", contractId: "tool.contract.codex-spawn-agent.v1" });

    expect(
      validateToolContractSurface({
        toolName: "spawn_agent",
        payload: { agent_type: "worker", model: "gpt-5.5", message: "Override model" },
      }),
    ).toMatchObject({
      kind: "deny",
      findings: ["forbidden_field:model"],
    });
  });

  it("U-TOOLCONTRACT-005: denies bulk spawn even though the surface is registered", () => {
    const decision = validateToolContractSurface({
      toolName: "spawn_agents_on_csv",
      payload: { csv: "worker,task" },
    });
    expect(decision.kind).toBe("deny");
    expect(decision.contractId).toBe("tool.contract.codex-bulk-spawn.v1");
    expect(decision.findings[0]).toContain("surface_denied");
  });

  it("U-TOOLCONTRACT-006: audits the default registry as a doctor-ready hard gate", () => {
    const audit = auditToolContractRegistry(DEFAULT_TOOL_CONTRACTS);
    expect(audit).toMatchObject({ ok: true, checked: 7, allow: 6, deny: 1, defer: 0 });
    expect(toolContractRegistryMessages(audit)[0]).toContain("tool-contract-registry - OK");

    expect(
      auditToolContractRegistry([
        ...DEFAULT_TOOL_CONTRACTS,
        { ...DEFAULT_TOOL_CONTRACTS[0], id: DEFAULT_TOOL_CONTRACTS[1].id },
      ]).ok,
    ).toBe(false);
  });
});
