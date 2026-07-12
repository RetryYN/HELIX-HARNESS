import type { SourceEdge } from "./source-edge-extractor";

export interface ModuleCatalog {
  owners: readonly string[];
  ownerOf(path: string): string | null;
  resolve(from: string, specifier: string): string | null;
}

export interface BoundaryException {
  from: string;
  to: string;
  decision: "allow" | "deny";
  owner: string;
  rationale: string;
  review_trigger: string;
  expiry?: string;
  successor_plan?: string;
}

export interface BoundaryPolicy {
  defaults: Readonly<Record<string, "deny">>;
  exceptions: readonly BoundaryException[];
}

export interface BoundaryDecision {
  decision: "allow" | "deny" | "unspecified";
  from_owner: string | null;
  to_owner: string | null;
  reason: string;
}

export interface PolicyFinding {
  reason: string;
  edge?: SourceEdge;
  from_owner?: string;
  to_owner?: string;
}

export function evaluateSourceBoundary(
  edge: SourceEdge,
  catalog: ModuleCatalog,
  policy: BoundaryPolicy,
): BoundaryDecision {
  const fromOwner = catalog.ownerOf(edge.from);
  const toOwner = edge.specifier === null ? null : catalog.resolve(edge.from, edge.specifier);
  if (edge.kind === "unknown_edge_kind")
    return {
      decision: "unspecified",
      from_owner: fromOwner,
      to_owner: toOwner,
      reason: edge.reason,
    };
  if (!fromOwner)
    return {
      decision: "unspecified",
      from_owner: null,
      to_owner: toOwner,
      reason: "unknown from owner",
    };
  if (!toOwner)
    return {
      decision: "unspecified",
      from_owner: fromOwner,
      to_owner: null,
      reason: "unknown to owner",
    };
  if (policy.defaults[fromOwner] !== "deny")
    return {
      decision: "unspecified",
      from_owner: fromOwner,
      to_owner: toOwner,
      reason: "missing owner default",
    };
  const matches = policy.exceptions.filter(
    (entry) => entry.from === fromOwner && entry.to === toOwner,
  );
  if (matches.length > 1)
    return {
      decision: "unspecified",
      from_owner: fromOwner,
      to_owner: toOwner,
      reason: "ambiguous explicit decision",
    };
  if (matches.length === 0)
    return {
      decision: "deny",
      from_owner: fromOwner,
      to_owner: toOwner,
      reason: "owner default deny",
    };
  const match = matches[0];
  if (!match)
    return {
      decision: "unspecified",
      from_owner: fromOwner,
      to_owner: toOwner,
      reason: "missing normalized decision",
    };
  return {
    decision: match.decision,
    from_owner: fromOwner,
    to_owner: toOwner,
    reason: match.rationale,
  };
}

/** PLAN-L7-452 / U-SBOUND-003,007: catalog全ownerとlive edgeをfail-close検査する。 */
export function validateBoundaryPolicyCoverage(
  catalog: ModuleCatalog,
  edges: readonly SourceEdge[],
  policy: BoundaryPolicy,
): PolicyFinding[] {
  const findings: PolicyFinding[] = [];
  for (const owner of catalog.owners) {
    if (policy.defaults[owner] !== "deny")
      findings.push({ reason: "missing_owner_default", from_owner: owner });
  }
  for (const entry of policy.exceptions) {
    if (!catalog.owners.includes(entry.from) || !catalog.owners.includes(entry.to)) {
      findings.push({
        reason: "unknown_exception_owner",
        from_owner: entry.from,
        to_owner: entry.to,
      });
    }
    if (!entry.owner || !entry.rationale || !entry.review_trigger) {
      findings.push({
        reason: "incomplete_exception_metadata",
        from_owner: entry.from,
        to_owner: entry.to,
      });
    }
    if ((entry.expiry && !entry.successor_plan) || (!entry.expiry && entry.successor_plan)) {
      findings.push({
        reason: "incomplete_temporary_exception",
        from_owner: entry.from,
        to_owner: entry.to,
      });
    }
  }
  for (const edge of edges) {
    const decision = evaluateSourceBoundary(edge, catalog, policy);
    if (decision.decision === "unspecified") findings.push({ reason: decision.reason, edge });
  }
  return findings;
}
