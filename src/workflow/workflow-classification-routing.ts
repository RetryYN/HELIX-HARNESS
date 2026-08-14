import {
  loadWorkflowClassificationCatalog,
  type WorkflowClassificationCatalog,
} from "../schema/workflow-classification-catalog.js";
import type { ContractResult, Finding } from "./contracts.js";

export interface WorkflowClassificationCandidate {
  target_axis: WorkflowClassificationCatalog["signal_bindings"][number]["target_axis"];
  target_id: string;
  matched_signal: string;
  unresolved_until_decision: boolean;
}

export interface WorkflowClassificationRoutingResult extends ContractResult {
  signal: string;
  classification: WorkflowClassificationCandidate | null;
  candidates: WorkflowClassificationCandidate[];
  disposition: "classified" | "unknown" | "decision_required" | "ambiguous";
  exit_code: 0 | 1 | 2;
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("en-US");
}

function finding(code: string, message: string, severity: Finding["severity"]): Finding {
  return {
    code,
    severity,
    evidence_path: "config/workflow-classification-catalog.v1.json",
    message,
  };
}

export function routeSignalToWorkflowClassification(input: {
  signal: string;
  catalog?: WorkflowClassificationCatalog;
  repo_root?: string;
}): WorkflowClassificationRoutingResult {
  const normalizedSignal = normalize(input.signal);
  const catalog = input.catalog ?? loadWorkflowClassificationCatalog(input.repo_root);
  const matched = catalog.signal_bindings
    .flatMap((binding) =>
      binding.signals.map((signal) => ({
        target_axis: binding.target_axis,
        target_id: binding.target_id,
        matched_signal: signal,
        unresolved_until_decision: binding.unresolved_until_decision === true,
        match_length: normalize(signal).length,
        matches: normalizedSignal.includes(normalize(signal)),
      })),
    )
    .filter((candidate) => candidate.matches);

  const longest = Math.max(0, ...matched.map((candidate) => candidate.match_length));
  const candidates = matched
    .filter((candidate) => candidate.match_length === longest)
    .map(({ match_length: _matchLength, matches: _matches, ...candidate }) => candidate)
    .filter(
      (candidate, index, all) =>
        all.findIndex(
          (other) =>
            other.target_axis === candidate.target_axis &&
            other.target_id === candidate.target_id &&
            other.matched_signal === candidate.matched_signal,
        ) === index,
    );

  if (candidates.length === 0) {
    const findings = [
      finding("workflow-classification-unknown", "unknown signal has no typed classification", "warn"),
    ];
    return {
      ok: true,
      findings,
      evidence_paths: [],
      signal: input.signal,
      classification: null,
      candidates: [],
      disposition: "unknown",
      exit_code: 2,
    };
  }

  const identities = new Set(
    candidates.map((candidate) => `${candidate.target_axis}:${candidate.target_id}`),
  );
  if (identities.size > 1) {
    const findings = [
      finding(
        "workflow-classification-ambiguous",
        "signal matches multiple typed identities at equal precedence; explicit decision required",
        "error",
      ),
    ];
    return {
      ok: false,
      findings,
      evidence_paths: ["config/workflow-classification-catalog.v1.json"],
      signal: input.signal,
      classification: null,
      candidates,
      disposition: "ambiguous",
      exit_code: 1,
    };
  }

  const classification = candidates[0] ?? null;
  if (classification?.unresolved_until_decision) {
    const findings = [
      finding(
        "workflow-classification-decision-required",
        "signal is intentionally unresolved until an explicit decision is recorded",
        "warn",
      ),
    ];
    return {
      ok: true,
      findings,
      evidence_paths: ["config/workflow-classification-catalog.v1.json"],
      signal: input.signal,
      classification: null,
      candidates,
      disposition: "decision_required",
      exit_code: 2,
    };
  }

  return {
    ok: true,
    findings: [],
    evidence_paths: ["config/workflow-classification-catalog.v1.json"],
    signal: input.signal,
    classification,
    candidates,
    disposition: "classified",
    exit_code: 0,
  };
}
