import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const AGENT_CATALOG_SCHEMA_VERSION = "agent-catalog-watch.v1";
export const DEFAULT_AGENT_CATALOG_INVENTORY =
  "docs/governance/helix-awesome-agent-catalog-inventory-2026-07-07.tsv";
export const DEFAULT_AGENT_CATALOG_AUDIT =
  "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md";

export type AgentCatalogCandidate = {
  name: string;
  source: string;
  capability_family: string;
  adoption_status: "candidate" | "source_rejected" | "unclassified";
  rejection_reasons: string[];
};

export type AgentCatalogWatchReport = {
  schema_version: typeof AGENT_CATALOG_SCHEMA_VERSION;
  ok: boolean;
  source_repo: string;
  inventory_path: string;
  audit_path: string;
  inventory_count: number;
  inventory_sha256: string;
  capability_family_counts: Record<string, number>;
  rejected_count: number;
  unclassified_count: number;
  candidates: AgentCatalogCandidate[];
  findings: Array<{
    code: string;
    severity: "info" | "warning" | "error";
    detail: string;
  }>;
  source_command: string;
};

const SOURCE_REPO = "https://github.com/e2b-dev/awesome-ai-agents";

const FAMILY_RULES: Array<{ family: string; pattern: RegExp }> = [
  { family: "browser_lsp_tooling", pattern: /browser|lsp|mcp|tool|adapter|router/i },
  { family: "runtime_orchestration", pattern: /orchestr|runner|workflow|team|swarm|mesh|plane/i },
  { family: "agent_session_control", pattern: /session|terminal|cli|command|shell|chat/i },
  { family: "quality_verification", pattern: /test|qa|lint|review|eval|verify|benchmark/i },
  { family: "observability_trace", pattern: /trace|log|observ|monitor|sight|telemetry/i },
  { family: "memory_knowledge", pattern: /memory|knowledge|rag|vector|context/i },
  { family: "planning_project_management", pattern: /plan|kanban|task|runbook|project|issue/i },
  {
    family: "security_guardrail",
    pattern: /guard|security|policy|sandbox|credential|secret|preflight/i,
  },
  { family: "code_automation", pattern: /code|coder|coding|software|repo|pr|diff/i },
];

const SOURCE_REJECT_RULES: Array<{ reason: string; pattern: RegExp }> = [
  { reason: "closed_source_or_saas_only", pattern: /closed[- ]?source|saas[- ]?only/i },
  { reason: "license_unknown", pattern: /license unknown|unlicensed/i },
  { reason: "leak_derived", pattern: /leak|exfil/i },
  { reason: "guardrail_stripping", pattern: /jailbreak|bypass guardrail|strip guardrail/i },
];

export function classifyAgentCatalogCandidate(name: string, source: string): AgentCatalogCandidate {
  const haystack = `${name} ${source}`.trim();
  const rejectionReasons = SOURCE_REJECT_RULES.filter((rule) => rule.pattern.test(haystack)).map(
    (rule) => rule.reason,
  );
  if (rejectionReasons.length > 0) {
    return {
      name,
      source,
      capability_family: "source_rejected",
      adoption_status: "source_rejected",
      rejection_reasons: rejectionReasons,
    };
  }

  const family = FAMILY_RULES.find((rule) => rule.pattern.test(haystack))?.family;
  if (!family && /^https:\/\/github\.com\//i.test(source)) {
    return {
      name,
      source,
      capability_family: "code_automation",
      adoption_status: "candidate",
      rejection_reasons: [],
    };
  }
  if (!family && /^https?:\/\//i.test(source)) {
    return {
      name,
      source,
      capability_family: "source_rejected",
      adoption_status: "source_rejected",
      rejection_reasons: ["non_repository_or_saas_surface"],
    };
  }
  if (!family) {
    return {
      name,
      source,
      capability_family: "unclassified",
      adoption_status: "unclassified",
      rejection_reasons: [],
    };
  }

  return {
    name,
    source,
    capability_family: family,
    adoption_status: "candidate",
    rejection_reasons: [],
  };
}

export function parseAgentCatalogInventory(text: string): AgentCatalogCandidate[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [name = "", source = ""] = line.split("\t");
      return classifyAgentCatalogCandidate(name.trim(), source.trim());
    });
}

export function buildAgentCatalogWatchReport(
  repoRoot: string,
  options: {
    inventoryPath?: string;
    auditPath?: string;
    sourceCommand?: string;
  } = {},
): AgentCatalogWatchReport {
  const inventoryPath = options.inventoryPath ?? DEFAULT_AGENT_CATALOG_INVENTORY;
  const auditPath = options.auditPath ?? DEFAULT_AGENT_CATALOG_AUDIT;
  const absoluteInventoryPath = join(repoRoot, inventoryPath);
  const findings: AgentCatalogWatchReport["findings"] = [];
  if (!existsSync(absoluteInventoryPath)) {
    return {
      schema_version: AGENT_CATALOG_SCHEMA_VERSION,
      ok: false,
      source_repo: SOURCE_REPO,
      inventory_path: inventoryPath,
      audit_path: auditPath,
      inventory_count: 0,
      inventory_sha256: "",
      capability_family_counts: {},
      rejected_count: 0,
      unclassified_count: 0,
      candidates: [],
      findings: [
        {
          code: "inventory_missing",
          severity: "error",
          detail: `${inventoryPath} is missing`,
        },
      ],
      source_command: options.sourceCommand ?? "helix audit agent-catalog --json",
    };
  }

  const inventoryText = readFileSync(absoluteInventoryPath, "utf8");
  const candidates = parseAgentCatalogInventory(inventoryText);
  const capabilityFamilyCounts: Record<string, number> = {};
  for (const candidate of candidates) {
    capabilityFamilyCounts[candidate.capability_family] =
      (capabilityFamilyCounts[candidate.capability_family] ?? 0) + 1;
  }
  const rejectedCount = candidates.filter(
    (candidate) => candidate.adoption_status === "source_rejected",
  ).length;
  const unclassifiedCount = candidates.filter(
    (candidate) => candidate.adoption_status === "unclassified",
  ).length;
  if (unclassifiedCount > 0) {
    findings.push({
      code: "unclassified_candidate",
      severity: "error",
      detail: `${unclassifiedCount} catalog candidates are not mapped to a HELIX capability family`,
    });
  }
  if (!existsSync(join(repoRoot, auditPath))) {
    findings.push({
      code: "audit_doc_missing",
      severity: "warning",
      detail: `${auditPath} is missing`,
    });
  }

  return {
    schema_version: AGENT_CATALOG_SCHEMA_VERSION,
    ok: unclassifiedCount === 0 && findings.every((finding) => finding.severity !== "error"),
    source_repo: SOURCE_REPO,
    inventory_path: inventoryPath,
    audit_path: auditPath,
    inventory_count: candidates.length,
    inventory_sha256: createHash("sha256").update(inventoryText).digest("hex"),
    capability_family_counts: Object.fromEntries(Object.entries(capabilityFamilyCounts).sort()),
    rejected_count: rejectedCount,
    unclassified_count: unclassifiedCount,
    candidates,
    findings,
    source_command: options.sourceCommand ?? "helix audit agent-catalog --json",
  };
}
