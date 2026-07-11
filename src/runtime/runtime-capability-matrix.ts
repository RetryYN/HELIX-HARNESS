export const RUNTIME_CAPABILITY_MATRIX_SCHEMA_VERSION = "runtime-capability-matrix.v1";

export const RUNTIME_CAPABILITIES = [
  "tool_shell",
  "sandbox",
  "hooks",
  "mcp",
  "browser",
  "lsp",
  "headless",
  "resume",
  "cost_telemetry",
] as const;

export type RuntimeCapability = (typeof RUNTIME_CAPABILITIES)[number];
export type RuntimeCapabilityStatus = "supported" | "limited" | "unsupported";
export type RuntimeId = "codex" | "claude" | "gemini" | "opencode" | "aider";

export type RuntimeCapabilityEntry = {
  status: RuntimeCapabilityStatus;
  evidence_path: string;
  fallback: "use" | "fallback" | "escalate" | "no-op";
};

export type RuntimeCapabilityRecord = {
  runtime: RuntimeId;
  capabilities: Record<RuntimeCapability, RuntimeCapabilityEntry>;
};

export type RuntimeCapabilityRouteDecision = {
  runtime: string;
  ok: boolean;
  status: "supported" | "unsupported";
  required: RuntimeCapability[];
  missing: RuntimeCapability[];
  evidence_paths: string[];
  fallback: "use" | "fallback" | "escalate";
};

export type RuntimeCapabilityMatrixReport = {
  schema_version: typeof RUNTIME_CAPABILITY_MATRIX_SCHEMA_VERSION;
  ok: boolean;
  runtimes: RuntimeCapabilityRecord[];
  route_decision?: RuntimeCapabilityRouteDecision;
  source_command: string;
};

const supported = (evidencePath: string): RuntimeCapabilityEntry => ({
  status: "supported",
  evidence_path: evidencePath,
  fallback: "use",
});

const limited = (
  evidencePath: string,
  fallback: "fallback" | "escalate",
): RuntimeCapabilityEntry => ({
  status: "limited",
  evidence_path: evidencePath,
  fallback,
});

const unsupported = (
  evidencePath: string,
  fallback: "fallback" | "escalate" | "no-op",
): RuntimeCapabilityEntry => ({
  status: "unsupported",
  evidence_path: evidencePath,
  fallback,
});

export const RUNTIME_CAPABILITY_MATRIX: RuntimeCapabilityRecord[] = [
  {
    runtime: "codex",
    capabilities: {
      tool_shell: supported("src/runtime/hosted-preflight.ts"),
      sandbox: supported("AGENTS.md#Hooks"),
      hooks: limited(".codex/hooks.json", "fallback"),
      mcp: supported("AGENTS.md#Skills"),
      browser: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "fallback",
      ),
      lsp: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "fallback",
      ),
      headless: supported("src/runtime/adapter.ts"),
      resume: limited("src/runtime/provider-handover.ts", "fallback"),
      cost_telemetry: limited(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "escalate",
      ),
    },
  },
  {
    runtime: "claude",
    capabilities: {
      tool_shell: supported(".claude/hooks/work-guard.ts"),
      sandbox: limited(".claude/CLAUDE.md", "escalate"),
      hooks: supported(".claude/settings.json"),
      mcp: supported(".claude/CLAUDE.md"),
      browser: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "fallback",
      ),
      lsp: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "fallback",
      ),
      headless: supported("src/runtime/adapter.ts"),
      resume: limited("src/runtime/provider-handover.ts", "fallback"),
      cost_telemetry: limited(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "escalate",
      ),
    },
  },
  {
    runtime: "gemini",
    capabilities: {
      tool_shell: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "escalate",
      ),
      sandbox: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "escalate",
      ),
      hooks: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "escalate",
      ),
      mcp: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "escalate",
      ),
      browser: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "fallback",
      ),
      lsp: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "fallback",
      ),
      headless: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "escalate",
      ),
      resume: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "escalate",
      ),
      cost_telemetry: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "escalate",
      ),
    },
  },
  {
    runtime: "opencode",
    capabilities: {
      tool_shell: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "escalate",
      ),
      sandbox: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "escalate",
      ),
      hooks: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "escalate",
      ),
      mcp: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "escalate",
      ),
      browser: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "fallback",
      ),
      lsp: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "fallback",
      ),
      headless: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "escalate",
      ),
      resume: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "escalate",
      ),
      cost_telemetry: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "escalate",
      ),
    },
  },
  {
    runtime: "aider",
    capabilities: {
      tool_shell: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "escalate",
      ),
      sandbox: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "escalate",
      ),
      hooks: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "escalate",
      ),
      mcp: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "escalate",
      ),
      browser: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "fallback",
      ),
      lsp: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "fallback",
      ),
      headless: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "escalate",
      ),
      resume: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "escalate",
      ),
      cost_telemetry: unsupported(
        "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
        "escalate",
      ),
    },
  },
];

export function isRuntimeCapability(value: string): value is RuntimeCapability {
  return (RUNTIME_CAPABILITIES as readonly string[]).includes(value);
}

export function evaluateRuntimeCapabilityRoute(
  runtime: string,
  required: RuntimeCapability[],
): RuntimeCapabilityRouteDecision {
  const record = RUNTIME_CAPABILITY_MATRIX.find((item) => item.runtime === runtime);
  if (!record) {
    return {
      runtime,
      ok: false,
      status: "unsupported",
      required,
      missing: required,
      evidence_paths: [],
      fallback: "escalate",
    };
  }

  const missing = required.filter(
    (capability) => record.capabilities[capability].status === "unsupported",
  );
  const evidencePaths = required.map((capability) => record.capabilities[capability].evidence_path);
  return {
    runtime,
    ok: missing.length === 0,
    status: missing.length === 0 ? "supported" : "unsupported",
    required,
    missing,
    evidence_paths: [...new Set(evidencePaths)],
    fallback: missing.length === 0 ? "use" : "fallback",
  };
}

export function buildRuntimeCapabilityMatrixReport(options: {
  runtime?: string;
  required?: RuntimeCapability[];
  sourceCommand?: string;
}): RuntimeCapabilityMatrixReport {
  const routeDecision = options.runtime
    ? evaluateRuntimeCapabilityRoute(options.runtime, options.required ?? [])
    : undefined;
  return {
    schema_version: RUNTIME_CAPABILITY_MATRIX_SCHEMA_VERSION,
    ok: routeDecision ? routeDecision.ok : true,
    runtimes: RUNTIME_CAPABILITY_MATRIX,
    ...(routeDecision ? { route_decision: routeDecision } : {}),
    source_command: options.sourceCommand ?? "helix runtime capabilities --json",
  };
}
