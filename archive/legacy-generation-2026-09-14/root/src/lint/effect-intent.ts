/**
 * Adapter-neutral lint analyzer contract (PLAN-L7-451).
 *
 * Snapshot construction and every effect belong to loaders/executors.  This module accepts an
 * already immutable snapshot and evaluates pure rules only; it deliberately has no Node or
 * runtime adapter dependency.
 */
export type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer Item)[]
    ? readonly DeepReadonly<Item>[]
    : T extends object
      ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> }
      : T;

export type FindingSeverity = "error" | "warn" | "info";

export interface Finding {
  rule_id: string;
  code: string;
  severity: FindingSeverity;
  detail: string;
}

export interface AnalyzerRule<T> {
  readonly id: string;
  evaluate(snapshot: DeepReadonly<T>): readonly Omit<Finding, "rule_id">[];
}

/** Evaluate an immutable snapshot without accepting or invoking an effect port. */
export function analyzeSnapshot<T>(
  snapshot: DeepReadonly<T>,
  rules: readonly AnalyzerRule<T>[],
): Finding[] {
  return rules.flatMap((rule) =>
    rule.evaluate(snapshot).map((finding) => ({
      rule_id: rule.id,
      code: finding.code,
      severity: finding.severity,
      detail: finding.detail,
    })),
  );
}
