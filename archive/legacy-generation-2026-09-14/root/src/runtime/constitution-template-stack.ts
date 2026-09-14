import { sha256Digest } from "./digest";

export const CONSTITUTION_TEMPLATE_STACK_SCHEMA_VERSION = "constitution-template-stack.v1";

export type TemplateSourceKind = "core" | "role" | "preset" | "project";
export type ConstitutionSeverity = "warning" | "error";

export interface ConstitutionTemplateEntry {
  key: string;
  source: TemplateSourceKind;
  priority: number;
  content: string;
  override_reason?: string | null;
}

export interface ResolvedTemplateArtifact {
  key: string;
  selected_source: TemplateSourceKind;
  selected_priority: number;
  resolver_source: string;
  digest: string;
}

export interface ConstitutionTemplateStackReport {
  schema_version: typeof CONSTITUTION_TEMPLATE_STACK_SCHEMA_VERSION;
  ok: boolean;
  resolved_artifacts: ResolvedTemplateArtifact[];
  findings: Array<{ code: string; severity: ConstitutionSeverity; detail: string }>;
  source_command: string;
  read_only: true;
}

function sourceRank(source: TemplateSourceKind): number {
  return { core: 0, role: 1, preset: 2, project: 3 }[source];
}

export function buildConstitutionTemplateStackReport(
  entries: ConstitutionTemplateEntry[],
  options: { sourceCommand?: string } = {},
): ConstitutionTemplateStackReport {
  const findings: ConstitutionTemplateStackReport["findings"] = [];
  const byKey = new Map<string, ConstitutionTemplateEntry[]>();
  for (const entry of entries) {
    const key = entry.key.trim();
    if (!key) {
      findings.push({
        code: "template_key_missing",
        severity: "error",
        detail: "template key is required",
      });
      continue;
    }
    const list = byKey.get(key) ?? [];
    list.push({ ...entry, key });
    byKey.set(key, list);
  }

  const resolved: ResolvedTemplateArtifact[] = [];
  for (const [key, list] of [...byKey.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const sorted = [...list].sort(
      (a, b) => b.priority - a.priority || sourceRank(b.source) - sourceRank(a.source),
    );
    const winner = sorted[0];
    const samePriority = sorted.filter((entry) => entry.priority === winner.priority);
    if (samePriority.length > 1) {
      findings.push({
        code: "template_conflict_not_silent",
        severity: "error",
        detail: `${key} has ${samePriority.length} templates at priority ${winner.priority}`,
      });
    } else if (sorted.length > 1 && !winner.override_reason?.trim()) {
      findings.push({
        code: "template_override_reason_missing",
        severity: "warning",
        detail: `${key} override selected ${winner.source} without explicit reason`,
      });
    }
    resolved.push({
      key,
      selected_source: winner.source,
      selected_priority: winner.priority,
      resolver_source: `${winner.source}:${winner.priority}`,
      digest: sha256Digest(winner.content),
    });
  }

  return {
    schema_version: CONSTITUTION_TEMPLATE_STACK_SCHEMA_VERSION,
    ok: !findings.some((finding) => finding.severity === "error"),
    resolved_artifacts: resolved,
    findings,
    source_command: options.sourceCommand ?? "helix constitution check --json",
    read_only: true,
  };
}
