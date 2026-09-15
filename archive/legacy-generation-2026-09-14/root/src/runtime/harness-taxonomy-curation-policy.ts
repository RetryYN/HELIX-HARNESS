import { createHash } from "node:crypto";

export const HARNESS_TAXONOMY_CURATION_POLICY_SCHEMA_VERSION =
  "harness-taxonomy-curation-policy.v1";

export type HarnessTaxonomyFamily =
  | "runtime_orchestration"
  | "quality_verification"
  | "observability_trace"
  | "memory_knowledge"
  | "security_guardrail"
  | "code_automation";

export interface HarnessTaxonomySource {
  source_id: string;
  source_url: string;
  taxonomy_family?: HarnessTaxonomyFamily | null;
  source_verified?: boolean;
  license_risk?: "low" | "medium" | "high" | "unknown";
  activity_freshness_days?: number | null;
  scope_fit?: "fit" | "partial" | "out_of_scope";
  topic_result_digest: string;
  previous_topic_result_digest?: string | null;
  star_count?: number | null;
}

export interface HarnessTaxonomyCurationReport {
  schema_version: typeof HARNESS_TAXONOMY_CURATION_POLICY_SCHEMA_VERSION;
  ok: boolean;
  read_only: true;
  source_count: number;
  topic_result_digest: string;
  changed_sources: string[];
  policy_references: { plan: string; audit_doc: string };
  curated_sources: Array<
    HarnessTaxonomySource & {
      adoption_basis: "taxonomy_evidence" | "rejected";
      star_count_is_advisory: true;
    }
  >;
  findings: Array<{ code: string; severity: "warning" | "error"; detail: string }>;
  source_command: string;
}

function sha256Json(value: unknown): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
}

export function buildHarnessTaxonomyCurationReport(
  sources: HarnessTaxonomySource[],
  options: { sourceCommand?: string } = {},
): HarnessTaxonomyCurationReport {
  const findings: HarnessTaxonomyCurationReport["findings"] = [];
  const changedSources: string[] = [];
  for (const source of sources) {
    if (!source.taxonomy_family) {
      findings.push({
        code: "unclassified_source_fail_close",
        severity: "error",
        detail: `${source.source_id} is not classified into a HELIX taxonomy family`,
      });
    }
    if (source.source_verified !== true) {
      findings.push({
        code: "source_verification_missing",
        severity: "error",
        detail: `${source.source_id} lacks source verification evidence`,
      });
    }
    if (source.license_risk === "unknown" || source.license_risk === "high") {
      findings.push({
        code: "license_risk_blocks_adoption",
        severity: "error",
        detail: `${source.source_id} license risk is ${source.license_risk}`,
      });
    }
    if (source.activity_freshness_days != null && source.activity_freshness_days > 180) {
      findings.push({
        code: "activity_freshness_stale",
        severity: "warning",
        detail: `${source.source_id} activity is ${source.activity_freshness_days} days old`,
      });
    }
    if (source.scope_fit === "out_of_scope") {
      findings.push({
        code: "scope_fit_rejected",
        severity: "warning",
        detail: `${source.source_id} is out of HELIX scope`,
      });
    }
    if (
      source.previous_topic_result_digest &&
      source.previous_topic_result_digest !== source.topic_result_digest
    ) {
      changedSources.push(source.source_id);
    }
  }

  return {
    schema_version: HARNESS_TAXONOMY_CURATION_POLICY_SCHEMA_VERSION,
    ok: !findings.some((finding) => finding.severity === "error"),
    read_only: true,
    source_count: sources.length,
    topic_result_digest: sha256Json(sources.map((source) => source.topic_result_digest).sort()),
    changed_sources: changedSources.sort(),
    policy_references: {
      plan: "docs/plans/PLAN-L7-383-harness-taxonomy-curation-policy.md",
      audit_doc: "docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md",
    },
    curated_sources: sources.map((source) => ({
      ...source,
      adoption_basis:
        source.taxonomy_family && source.source_verified === true
          ? "taxonomy_evidence"
          : "rejected",
      star_count_is_advisory: true,
    })),
    findings,
    source_command: options.sourceCommand ?? "helix audit taxonomy --json",
  };
}
