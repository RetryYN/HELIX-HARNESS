export type ToolContractDisposition = "allow" | "deny" | "defer";
export type ToolContractDecisionKind = "allow" | "deny" | "defer";

export interface ToolContract {
  id: string;
  toolName: string;
  owner: "HC-P2" | "HC-AC" | "runtime";
  disposition: ToolContractDisposition;
  requiredFields: string[];
  responseRequiredFields: string[];
  forbiddenFields: string[];
  reason: string;
}

export interface ToolContractRequest {
  toolName?: string | null;
  payload?: Record<string, unknown> | null;
  response?: Record<string, unknown> | null;
  stage?: "request" | "response" | "roundtrip";
  declaredContractId?: string | null;
  deferredReason?: string | null;
}

export interface ToolContractDecision {
  kind: ToolContractDecisionKind;
  contractId: string | null;
  toolName: string;
  findings: string[];
}

export interface ToolContractRegistryAudit {
  ok: boolean;
  checked: number;
  allow: number;
  deny: number;
  defer: number;
  findings: string[];
}

export const DEFAULT_TOOL_CONTRACTS: readonly ToolContract[] = [
  {
    id: "tool.contract.claude-agent.v1",
    toolName: "Agent",
    owner: "HC-P2",
    disposition: "allow",
    requiredFields: ["subagent_type", "model"],
    responseRequiredFields: ["status"],
    forbiddenFields: [],
    reason: "Claude subagent dispatch must carry explicit role and model for agent-guard.",
  },
  {
    id: "tool.contract.codex-spawn-agent.v1",
    toolName: "spawn_agent",
    owner: "HC-P2",
    disposition: "allow",
    requiredFields: ["agent_type"],
    responseRequiredFields: ["status"],
    forbiddenFields: ["model"],
    reason: "Codex direct spawn inherits parent model and must declare an allowlisted agent_type.",
  },
  {
    id: "tool.contract.codex-bulk-spawn.v1",
    toolName: "spawn_agents_on_csv",
    owner: "HC-P2",
    disposition: "deny",
    requiredFields: [],
    responseRequiredFields: [],
    forbiddenFields: [],
    reason: "Bulk spawn bypasses per-agent ownership; route through team or pair-agent workflow.",
  },
  {
    id: "tool.contract.codex-apply-patch.v1",
    toolName: "apply_patch",
    owner: "HC-AC",
    disposition: "allow",
    requiredFields: ["patch"],
    responseRequiredFields: ["status"],
    forbiddenFields: [],
    reason: "Codex apply_patch is freeform; patch body is the typed request payload.",
  },
  {
    id: "tool.contract.codex-write-file.v1",
    toolName: "write_file",
    owner: "HC-AC",
    disposition: "allow",
    requiredFields: ["path", "content"],
    responseRequiredFields: ["status"],
    forbiddenFields: [],
    reason: "Hosted/Codex write_file must name the target path and content.",
  },
  {
    id: "tool.contract.shell-command.v1",
    toolName: "exec_command",
    owner: "runtime",
    disposition: "allow",
    requiredFields: ["cmd"],
    responseRequiredFields: ["exit_code"],
    forbiddenFields: [],
    reason: "Shell execution must be represented as an explicit command string.",
  },
  {
    id: "tool.contract.local-shell.v1",
    toolName: "local_shell",
    owner: "runtime",
    disposition: "allow",
    requiredFields: ["cmd"],
    responseRequiredFields: ["exit_code"],
    forbiddenFields: [],
    reason: "Local shell execution must be represented as an explicit command string.",
  },
] as const;

function hasText(value: unknown): boolean {
  return typeof value === "string"
    ? value.trim().length > 0
    : value !== null && value !== undefined;
}

function registryMap(contracts: readonly ToolContract[]): Map<string, ToolContract> {
  return new Map(contracts.map((contract) => [contract.toolName, contract]));
}

export function validateToolContractSurface(
  input: ToolContractRequest,
  contracts: readonly ToolContract[] = DEFAULT_TOOL_CONTRACTS,
): ToolContractDecision {
  const toolName = input.toolName?.trim() ?? "";
  if (!toolName) {
    return { kind: "deny", contractId: null, toolName: "", findings: ["missing_tool_name"] };
  }

  const contract = registryMap(contracts).get(toolName);
  if (!contract) {
    if (hasText(input.deferredReason)) {
      return {
        kind: "defer",
        contractId: null,
        toolName,
        findings: [`deferred_surface:${input.deferredReason}`],
      };
    }
    return {
      kind: "deny",
      contractId: null,
      toolName,
      findings: [`unregistered_tool_surface:${toolName}`],
    };
  }

  const findings: string[] = [];
  if (hasText(input.declaredContractId) && input.declaredContractId !== contract.id) {
    findings.push(`contract_id_mismatch:${input.declaredContractId}->${contract.id}`);
  }
  const payload = input.payload ?? {};
  const stage = input.stage ?? "request";
  if (stage === "request" || stage === "roundtrip") {
    for (const field of contract.requiredFields) {
      if (!hasText(payload[field])) findings.push(`missing_required_field:${field}`);
    }
  }
  if (stage === "response" || stage === "roundtrip") {
    const response = input.response ?? {};
    for (const field of contract.responseRequiredFields) {
      if (!hasText(response[field])) findings.push(`missing_response_field:${field}`);
    }
  }
  for (const field of contract.forbiddenFields) {
    if (hasText(payload[field])) findings.push(`forbidden_field:${field}`);
  }
  if (contract.disposition === "deny") findings.push(`surface_denied:${contract.reason}`);
  if (contract.disposition === "defer") findings.push(`surface_deferred:${contract.reason}`);

  if (
    contract.disposition === "deny" ||
    findings.some((finding) => !finding.startsWith("surface_deferred"))
  ) {
    return { kind: "deny", contractId: contract.id, toolName, findings };
  }
  if (contract.disposition === "defer") {
    return { kind: "defer", contractId: contract.id, toolName, findings };
  }
  return { kind: "allow", contractId: contract.id, toolName, findings };
}

export function auditToolContractRegistry(
  contracts: readonly ToolContract[] = DEFAULT_TOOL_CONTRACTS,
): ToolContractRegistryAudit {
  const findings: string[] = [];
  const ids = new Set<string>();
  const tools = new Set<string>();
  let allow = 0;
  let deny = 0;
  let defer = 0;

  for (const contract of contracts) {
    if (!contract.id.trim()) findings.push("missing_contract_id");
    if (!contract.toolName.trim()) findings.push(`missing_tool_name:${contract.id}`);
    if (!contract.reason.trim()) findings.push(`missing_reason:${contract.id}`);
    if (ids.has(contract.id)) findings.push(`duplicate_contract_id:${contract.id}`);
    if (tools.has(contract.toolName)) findings.push(`duplicate_tool_name:${contract.toolName}`);
    ids.add(contract.id);
    tools.add(contract.toolName);
    if (contract.disposition === "allow") allow++;
    if (contract.disposition === "deny") deny++;
    if (contract.disposition === "defer") defer++;
    if (contract.disposition === "allow" && contract.requiredFields.length === 0) {
      findings.push(`allow_without_required_fields:${contract.id}`);
    }
    if (contract.disposition === "allow" && contract.responseRequiredFields.length === 0) {
      findings.push(`allow_without_response_fields:${contract.id}`);
    }
  }

  return {
    ok: findings.length === 0 && contracts.length > 0,
    checked: contracts.length,
    allow,
    deny,
    defer,
    findings,
  };
}

export function toolContractRegistryMessages(result: ToolContractRegistryAudit): string[] {
  if (result.ok) {
    return [
      `tool-contract-registry - OK (checked=${result.checked}, allow=${result.allow}, deny=${result.deny}, defer=${result.defer})`,
    ];
  }
  return [
    `tool-contract-registry - violation: ${result.findings.length} registry issue(s): ${result.findings
      .slice(0, 8)
      .join(", ")}`,
  ];
}
