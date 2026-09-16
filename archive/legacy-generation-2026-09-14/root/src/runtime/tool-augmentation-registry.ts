import { detectTaskLenses, type TaskLens } from "./task-lens";

export const TOOL_AUGMENTATION_REGISTRY_SCHEMA_VERSION = "tool-augmentation-registry.v1";

export type ToolCapability =
  | "lsp"
  | "browser"
  | "issue_tracker"
  | "runbook_compiler"
  | "agent_ready_search";

export type ToolRisk = "low" | "medium" | "high";

export interface ToolRequirementProfile {
  read: boolean;
  write: boolean;
  network: boolean;
  credential: boolean;
  sandbox: boolean;
}

export interface ToolAugmentationEntry {
  tool_id: string;
  label: string;
  capability: ToolCapability;
  risk: ToolRisk;
  supported: boolean;
  approval_required: boolean;
  requirements: ToolRequirementProfile;
  lenses: TaskLens[];
  deny_reason: string | null;
}

export interface ToolAugmentationSuggestion {
  tool_id: string;
  capability: ToolCapability;
  selected_by_lenses: TaskLens[];
  auto_execute_allowed: false;
  evidence_claim: false;
  reason: string;
}

export interface ToolAugmentationRegistryReport {
  schema_version: typeof TOOL_AUGMENTATION_REGISTRY_SCHEMA_VERSION;
  ok: boolean;
  task_lenses: TaskLens[];
  registry: ToolAugmentationEntry[];
  suggestions: ToolAugmentationSuggestion[];
  blocked_tools: Array<{ tool_id: string; reason: string }>;
  findings: Array<{ code: string; severity: "warning" | "error"; detail: string }>;
  read_only: true;
  source_command: string;
}

export const TOOL_AUGMENTATION_REGISTRY: ToolAugmentationEntry[] = [
  {
    tool_id: "tool:lsp-readonly",
    label: "LSP read-only symbol/context lookup",
    capability: "lsp",
    risk: "low",
    supported: true,
    approval_required: false,
    requirements: { read: true, write: false, network: false, credential: false, sandbox: false },
    lenses: ["design", "troubleshooting"],
    deny_reason: null,
  },
  {
    tool_id: "tool:browser-dry-run",
    label: "Browser automation dry-run candidate",
    capability: "browser",
    risk: "high",
    supported: false,
    approval_required: true,
    requirements: { read: true, write: false, network: true, credential: false, sandbox: true },
    lenses: ["verification", "test-strategy"],
    deny_reason: "browser/network automation is approval-gated and not auto-executable",
  },
  {
    tool_id: "tool:issue-tracker-readonly",
    label: "Issue tracker read-only context",
    capability: "issue_tracker",
    risk: "high",
    supported: false,
    approval_required: true,
    requirements: { read: true, write: true, network: true, credential: true, sandbox: true },
    lenses: ["design", "troubleshooting"],
    deny_reason: "external issue tracker access requires credential and egress approval",
  },
  {
    tool_id: "tool:runbook-compiler",
    label: "Runbook compiler from repo-local docs",
    capability: "runbook_compiler",
    risk: "medium",
    supported: true,
    approval_required: false,
    requirements: { read: true, write: false, network: false, credential: false, sandbox: false },
    lenses: ["verification", "troubleshooting"],
    deny_reason: null,
  },
  {
    tool_id: "tool:agent-ready-search",
    label: "Agent-ready search over approved local sources",
    capability: "agent_ready_search",
    risk: "medium",
    supported: true,
    approval_required: false,
    requirements: { read: true, write: false, network: false, credential: false, sandbox: false },
    lenses: ["design", "verification", "test-strategy", "troubleshooting"],
    deny_reason: null,
  },
];

export function buildToolAugmentationRegistryReport(
  input: { task?: string | null; sourceCommand?: string } = {},
): ToolAugmentationRegistryReport {
  const taskLenses = detectTaskLenses(input.task ?? "");
  const selected =
    taskLenses.length === 0
      ? TOOL_AUGMENTATION_REGISTRY
      : TOOL_AUGMENTATION_REGISTRY.filter((tool) =>
          tool.lenses.some((lens) => taskLenses.includes(lens)),
        );
  const suggestions = selected.map((tool) => ({
    tool_id: tool.tool_id,
    capability: tool.capability,
    selected_by_lenses: tool.lenses.filter((lens) => taskLenses.includes(lens)),
    auto_execute_allowed: false as const,
    evidence_claim: false as const,
    reason: tool.approval_required
      ? "suggestion only; approval-required tool cannot auto-execute"
      : "suggestion only; task-lens tool candidate is not completion evidence",
  }));
  const blockedTools = TOOL_AUGMENTATION_REGISTRY.filter(
    (tool) => !tool.supported || tool.approval_required,
  ).map((tool) => ({
    tool_id: tool.tool_id,
    reason: tool.deny_reason ?? "unsupported_or_approval_required",
  }));
  return {
    schema_version: TOOL_AUGMENTATION_REGISTRY_SCHEMA_VERSION,
    ok: true,
    task_lenses: taskLenses,
    registry: TOOL_AUGMENTATION_REGISTRY,
    suggestions,
    blocked_tools: blockedTools,
    findings: blockedTools.map((tool) => ({
      code: "tool_not_auto_executable",
      severity: "warning" as const,
      detail: `${tool.tool_id}: ${tool.reason}`,
    })),
    read_only: true,
    source_command: input.sourceCommand ?? "helix tools registry --json",
  };
}
