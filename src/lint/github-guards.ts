import { createHash } from "node:crypto";
import { isAtomicContractId } from "../schema/atomic-contract-id";
import { auditIssueClosureGraph, type IssueClosureGraphSnapshot } from "./issue-closure-graph";

export interface CommitlintFinding {
  code: "non_conventional_subject";
  severity: "error";
  subject: string;
  message: string;
}

export interface CommitlintResult {
  ok: boolean;
  subjectCount: number;
  findings: CommitlintFinding[];
}

export interface PrContextInput {
  eventName?: string;
  headBranch?: string;
  baseBranch?: string;
  body?: string;
  changedPaths?: string[];
  planContracts?: PrPlanContract[];
  closureGraphRequired?: boolean;
  closureGraphSnapshots?: IssueClosureGraphSnapshot[];
}

export interface PrPlanContract {
  path: string;
  behaviorContractId: string | null;
  responsibilityOwner: string | null;
}

export interface PrContextFinding {
  code:
    | "poc_main_direct_merge"
    | "hotfix_postmortem_missing"
    | "hotfix_recovery_plan_missing"
    | "issue_closure_outcome_missing"
    | "issue_closure_receipt_missing"
    | "issue_closure_children_missing"
    | "issue_closure_decision_receipt_missing"
    | "issue_closure_po_decision_missing"
    | "issue_closure_graph_missing"
    | "issue_closure_graph_invalid"
    | "pr_scope_manifest_missing"
    | "pr_scope_contract_invalid"
    | "pr_scope_owner_invalid"
    | "pr_scope_path_family_invalid"
    | "pr_scope_expected_paths_invalid"
    | "pr_scope_changed_paths_mismatch"
    | "pr_scope_path_outside_manifest"
    | "pr_scope_companion_invalid"
    | "pr_scope_companion_missing"
    | "pr_scope_source_companions_missing"
    | "pr_scope_plan_contract_missing"
    | "pr_scope_plan_contract_mismatch"
    | "pr_scope_expansion_invalid";
  severity: "error";
  message: string;
}

export interface PrContextResult {
  ok: boolean;
  eventName: string;
  headBranch: string;
  baseBranch: string;
  findings: PrContextFinding[];
}

export interface PrContextSnapshot {
  repository: string;
  prNumber: number;
  body: string;
  headRef: string;
  baseRef: string;
  headSha: string;
  baseSha: string;
  snapshotDigest: `sha256:${string}`;
}

function prContextSnapshotDigest(
  payload: Omit<PrContextSnapshot, "snapshotDigest">,
): `sha256:${string}` {
  const canonical = JSON.stringify(payload);
  const hex = createHash("sha256").update(canonical, "utf8").digest("hex");
  return `sha256:${hex}`;
}

interface RawPrContextSnapshot {
  repository?: unknown;
  number?: unknown;
  body?: unknown;
  head_ref?: unknown;
  base_ref?: unknown;
  head_sha?: unknown;
  base_sha?: unknown;
}

export function parsePrContextSnapshot(
  source: string,
  expected: { repository: string; prNumber: number },
): PrContextSnapshot {
  let raw: RawPrContextSnapshot;
  try {
    raw = JSON.parse(source) as RawPrContextSnapshot;
  } catch (cause) {
    const converted = new Error("pr_context_snapshot_json_invalid", { cause });
    throw converted;
  }
  if (raw.repository !== expected.repository || raw.number !== expected.prNumber) {
    throw new Error("pr_context_snapshot_identity_mismatch");
  }
  if (
    typeof raw.body !== "string" ||
    typeof raw.head_ref !== "string" ||
    raw.head_ref.length === 0 ||
    typeof raw.base_ref !== "string" ||
    raw.base_ref.length === 0 ||
    typeof raw.head_sha !== "string" ||
    !/^[0-9a-f]{40}$/.test(raw.head_sha) ||
    typeof raw.base_sha !== "string" ||
    !/^[0-9a-f]{40}$/.test(raw.base_sha)
  ) {
    throw new Error("pr_context_snapshot_schema_invalid");
  }
  const payload = {
    repository: raw.repository,
    prNumber: raw.number,
    body: raw.body,
    headRef: raw.head_ref,
    baseRef: raw.base_ref,
    headSha: raw.head_sha,
    baseSha: raw.base_sha,
  };
  return {
    ...payload,
    snapshotDigest: prContextSnapshotDigest(payload),
  };
}

const CONVENTIONAL_COMMIT_PATTERN =
  /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\([A-Za-z0-9._-]+\))?: .+/;

// PR ベース自走運用 (PLAN-L7-418) では git 既定 subject の merge / revert commit が正常な産物として
// 履歴に入る。upstream commitlint の既定 ignores と同じく機械生成 subject は検査対象から除外する
// (push 済み履歴は書き換え禁止のため、gate 側が git の実挙動へ追随する)。
const GENERATED_SUBJECT_IGNORES = [/^Merge /, /^Revert "/];
const ISSUE_CLOSING_REFERENCE = /(^|\n)Closes[ \t]+#\d+\b/i;
// PR テンプレはガイドとして行末にインライン HTML コメントを残すため、値の後のコメントは許容する。
const TRAILING_INLINE_COMMENT = "(?:[ \\t]*<!--[^>]*-->)?[ \\t]*(?:\\n|$)";
const ISSUE_CLOSURE_OUTCOME = new RegExp(
  `(^|\\n)[ \\t]*(?:[-*][ \\t]*)?(?:Issue closure outcome|Outcome):[ \\t]*(resolved|rejected|quarantined|superseded|cancelled)${TRAILING_INLINE_COMMENT}`,
  "i",
);
const RESPONSIBILITY_OWNER = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const SAFE_SCOPE_PATH =
  /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))(?!.*[\\*?[\]{}])[\p{L}\p{N}_.@/+ -]+\/?$/u;
const OVERBROAD_SCOPE_FAMILIES = new Set([
  ".github/",
  "config/",
  "docs/",
  "scripts/",
  "src/",
  "tests/",
]);
const APPROVED_EXPANSION =
  /^approved[ \t]+receipt=https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/(?:issues|pull)\/\d+#issuecomment-\d+[ \t]+reason=.{12,}$/;
const MIGRATION_BUNDLE_MARKER = "<!-- HELIX:github-workflow-identity-migration-bundle:v1 -->";

interface MigrationBundleManifest {
  ownerPlan: string;
  planPaths: Set<string>;
}

function parseMigrationBundleManifest(body: string): MigrationBundleManifest | null {
  if (!body.includes(MIGRATION_BUNDLE_MARKER)) return null;
  const suffix = body.split(MIGRATION_BUNDLE_MARKER)[1] ?? "";
  const match = suffix.match(/^[ \t]*\r?\n```json[ \t]*\r?\n([\s\S]*?)\r?\n```/u);
  if (!match) return null;
  try {
    const raw = JSON.parse(match[1] ?? "") as {
      owner_plan?: unknown;
      plan_paths?: unknown;
    };
    if (
      typeof raw.owner_plan !== "string" ||
      !Array.isArray(raw.plan_paths) ||
      raw.plan_paths.some((path) => typeof path !== "string")
    ) {
      return null;
    }
    return {
      ownerPlan: raw.owner_plan,
      planPaths: new Set(raw.plan_paths as string[]),
    };
  } catch {
    return null;
  }
}

function fieldValue(body: string, field: string): string | undefined {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return body
    .match(new RegExp(`(?:^|\\n)[ \\t]*(?:[-*][ \\t]*)?${escaped}:[ \\t]*(\\S.*)`, "i"))?.[1]
    ?.trim();
}

function fieldValues(body: string, field: string): string[] {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return Array.from(
    body.matchAll(new RegExp(`(?:^|\\n)[ \\t]*(?:[-*][ \\t]*)?${escaped}:[ \\t]*(\\S.*)`, "gi")),
    (match) => (match[1]?.trim() ?? "").replace(/[ \t]*<!--[^>]*-->[ \t]*$/, "").trim(),
  );
}

function commaValues(value: string): string[] {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function isSafeScopePath(path: string): boolean {
  const withoutTrailingSlash = path.endsWith("/") ? path.slice(0, -1) : path;
  return (
    SAFE_SCOPE_PATH.test(path) &&
    withoutTrailingSlash.length > 0 &&
    withoutTrailingSlash.split("/").every((part) => part.length > 0 && part !== ".") &&
    !path.startsWith("+")
  );
}

function pathCovered(path: string, family: string): boolean {
  return family.endsWith("/") ? path.startsWith(family) : path === family;
}

function frontmatterScalar(text: string, field: string): string | null {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const value = text.match(new RegExp(`^${escaped}:[ \\t]*(.+)$`, "m"))?.[1]?.trim() ?? "";
  if (!value) return null;
  return value.replace(/^["']|["']$/g, "").trim() || null;
}

export function readPrPlanContract(path: string, text: string): PrPlanContract {
  return {
    path,
    behaviorContractId: frontmatterScalar(text, "behavior_contract_id"),
    responsibilityOwner: frontmatterScalar(text, "responsibility_owner"),
  };
}

function closureReceiptPresent(body: string): boolean {
  const value = fieldValue(body, "Closure receipt") ?? "";
  return (
    /\bPLAN-[A-Z0-9-]+\b/.test(value) &&
    /\b[0-9a-f]{7,40}\b/i.test(value) &&
    /\b(?:test|CI|harness-check)\b/i.test(value) &&
    /\breview\b/i.test(value)
  );
}

function childDispositionPresent(body: string): boolean {
  return new RegExp(
    `(^|\\n)[ \\t]*(?:[-*][ \\t]*)?Child Issues:[ \\t]*(?:none|#\\d+[ \\t]+(?:resolved|deferred|split|superseded|cancelled)(?:[ \\t]*[,;][ \\t]*#\\d+[ \\t]+(?:resolved|deferred|split|superseded|cancelled))*)${TRAILING_INLINE_COMMENT}`,
    "i",
  ).test(body);
}

export function analyzeCommitSubjects(subjects: string[]): CommitlintResult {
  const normalizedSubjects = subjects.map((subject) => subject.trim()).filter(Boolean);
  const findings = normalizedSubjects
    .filter((subject) => !GENERATED_SUBJECT_IGNORES.some((pattern) => pattern.test(subject)))
    .filter((subject) => !CONVENTIONAL_COMMIT_PATTERN.test(subject))
    .map((subject): CommitlintFinding => {
      return {
        code: "non_conventional_subject",
        severity: "error",
        subject,
        message: `non-conventional commit subject: ${subject}`,
      };
    });
  return {
    ok: findings.length === 0,
    subjectCount: normalizedSubjects.length,
    findings,
  };
}

export function commitlintMessages(result: CommitlintResult): string[] {
  if (result.ok) {
    return [`commitlint - OK (subjects=${result.subjectCount})`];
  }
  return [
    `commitlint - violation: errors=${result.findings.length}, subjects=${result.subjectCount}`,
    ...result.findings.map((finding) => `commitlint - block ${finding.code}: ${finding.message}`),
  ];
}

export function analyzePrContext(input: PrContextInput): PrContextResult {
  const eventName = input.eventName ?? "";
  const headBranch = input.headBranch ?? "";
  const baseBranch = input.baseBranch ?? "";
  const body = input.body ?? "";
  const changedPaths = [...new Set(input.changedPaths ?? [])].sort();
  const planContracts = new Map((input.planContracts ?? []).map((plan) => [plan.path, plan]));
  const findings: PrContextFinding[] = [];

  if (eventName !== "pull_request") {
    return { ok: true, eventName, headBranch, baseBranch, findings };
  }

  if (headBranch.startsWith("poc/") && baseBranch === "main") {
    findings.push({
      code: "poc_main_direct_merge",
      severity: "error",
      message:
        "poc/* branches must pass S4 and re-enter through reverse/* or feature/* before main",
    });
  }

  if (headBranch.startsWith("hotfix/") && baseBranch === "main") {
    if (!/(^|\n)##[ \t]+Postmortem\b/.test(body)) {
      findings.push({
        code: "hotfix_postmortem_missing",
        severity: "error",
        message: "hotfix/* PR requires a ## Postmortem section",
      });
    }
    if (!/(PLAN-|recovery)/.test(body)) {
      findings.push({
        code: "hotfix_recovery_plan_missing",
        severity: "error",
        message: "hotfix/* PR requires recovery PLAN evidence",
      });
    }
  }

  if (changedPaths.length > 0) {
    const contractValues = fieldValues(body, "Behavior contract");
    const ownerValues = fieldValues(body, "Responsibility owner");
    const familyValues = fieldValues(body, "Allowed path families");
    const expectedPathValues = fieldValues(body, "Expected changed paths");
    const companionValues = fieldValues(body, "Required companion paths");
    const expansionValues = fieldValues(body, "Scope expansion");
    if (
      contractValues.length === 0 ||
      ownerValues.length === 0 ||
      familyValues.length === 0 ||
      expectedPathValues.length === 0 ||
      companionValues.length === 0 ||
      expansionValues.length === 0
    ) {
      findings.push({
        code: "pr_scope_manifest_missing",
        severity: "error",
        message:
          "PR diff requires Behavior contract, Responsibility owner, Allowed path families, Expected changed paths, Required companion paths, and Scope expansion",
      });
    } else {
      const contract = contractValues[0] ?? "";
      if (contractValues.length !== 1 || !isAtomicContractId(contract)) {
        findings.push({
          code: "pr_scope_contract_invalid",
          severity: "error",
          message: "Behavior contract must contain exactly one atomic contract ID",
        });
      }
      const owner = ownerValues[0] ?? "";
      if (ownerValues.length !== 1 || !RESPONSIBILITY_OWNER.test(owner)) {
        findings.push({
          code: "pr_scope_owner_invalid",
          severity: "error",
          message: "Responsibility owner must contain exactly one kebab-case owner",
        });
      }
      const families = commaValues(familyValues[0] ?? "");
      if (
        familyValues.length !== 1 ||
        families.length === 0 ||
        new Set(families).size !== families.length ||
        families.some((family) => !isSafeScopePath(family) || OVERBROAD_SCOPE_FAMILIES.has(family))
      ) {
        findings.push({
          code: "pr_scope_path_family_invalid",
          severity: "error",
          message:
            "Allowed path families must be unique, responsibility-scoped safe exact paths or directory prefixes; repository-root families are forbidden",
        });
      } else {
        const outside = changedPaths.filter(
          (path) => !families.some((family) => pathCovered(path, family)),
        );
        if (outside.length > 0) {
          findings.push({
            code: "pr_scope_path_outside_manifest",
            severity: "error",
            message: `changed paths outside declared scope: ${outside.join(", ")}`,
          });
        }
      }
      const expectedPaths = commaValues(expectedPathValues[0] ?? "");
      if (
        expectedPathValues.length !== 1 ||
        expectedPaths.length === 0 ||
        new Set(expectedPaths).size !== expectedPaths.length ||
        expectedPaths.some((path) => !isSafeScopePath(path) || path.endsWith("/"))
      ) {
        findings.push({
          code: "pr_scope_expected_paths_invalid",
          severity: "error",
          message: "Expected changed paths must be unique safe exact paths",
        });
      } else {
        const expectedSet = new Set(expectedPaths);
        const undeclared = changedPaths.filter((path) => !expectedSet.has(path));
        const absent = expectedPaths.filter((path) => !changedPaths.includes(path));
        if (undeclared.length > 0 || absent.length > 0) {
          findings.push({
            code: "pr_scope_changed_paths_mismatch",
            severity: "error",
            message: `actual diff must exactly match Expected changed paths (undeclared=${undeclared.join(", ") || "none"}; absent=${absent.join(", ") || "none"})`,
          });
        }
      }
      const companionValue = companionValues[0] ?? "";
      const companions = companionValue.toLowerCase() === "none" ? [] : commaValues(companionValue);
      if (
        companionValues.length !== 1 ||
        (companionValue.toLowerCase() !== "none" &&
          (companions.length === 0 || companions.some((path) => !isSafeScopePath(path))))
      ) {
        findings.push({
          code: "pr_scope_companion_invalid",
          severity: "error",
          message: "Required companion paths must be none or safe exact changed paths",
        });
      } else {
        const migrationBundle = parseMigrationBundleManifest(body);
        const missing = companions.filter((path) => !changedPaths.includes(path));
        if (missing.length > 0) {
          findings.push({
            code: "pr_scope_companion_missing",
            severity: "error",
            message: `required companion paths absent from diff: ${missing.join(", ")}`,
          });
        }
        if (
          changedPaths.some((path) => path.startsWith("src/")) &&
          (!companions.some((path) => path.startsWith("docs/plans/")) ||
            !companions.some((path) => path.startsWith("tests/")))
        ) {
          findings.push({
            code: "pr_scope_source_companions_missing",
            severity: "error",
            message: "src changes require explicit changed PLAN and test companion paths",
          });
        }
        const declaredPlans = companions.filter((path) => /^docs\/plans\/PLAN-.*\.md$/.test(path));
        for (const path of declaredPlans) {
          const plan = planContracts.get(path);
          if (!plan) {
            findings.push({
              code: "pr_scope_plan_contract_missing",
              severity: "error",
              message: `required PLAN companion contract could not be read: ${path}`,
            });
            continue;
          }
          const isMigrationBundlePlan = migrationBundle?.planPaths.has(path) === true;
          const isMigrationOwner = migrationBundle?.ownerPlan === path;
          const contractMatches =
            plan.behaviorContractId === contract && plan.responsibilityOwner === owner;
          const explicitlyBoundForeignPlan =
            isMigrationBundlePlan &&
            !isMigrationOwner &&
            plan.behaviorContractId !== null &&
            plan.responsibilityOwner !== null;
          if (!contractMatches && !explicitlyBoundForeignPlan) {
            findings.push({
              code: "pr_scope_plan_contract_mismatch",
              severity: "error",
              message: `required PLAN companion must bind behavior_contract_id=${contract} and responsibility_owner=${owner}: ${path}`,
            });
          }
        }
      }
      const expansion = expansionValues[0] ?? "";
      if (
        expansionValues.length !== 1 ||
        (expansion !== "none" && !APPROVED_EXPANSION.test(expansion))
      ) {
        findings.push({
          code: "pr_scope_expansion_invalid",
          severity: "error",
          message:
            "Scope expansion must be none or include a reviewable approved receipt pointer and reason; CI validates syntax only",
        });
      }
    }
  }

  if (ISSUE_CLOSING_REFERENCE.test(body)) {
    const outcome = body.match(ISSUE_CLOSURE_OUTCOME)?.[2]?.toLowerCase();
    if (!outcome) {
      findings.push({
        code: "issue_closure_outcome_missing",
        severity: "error",
        message:
          "Issue-closing PR requires Outcome: resolved|rejected|quarantined|superseded|cancelled",
      });
    }
    if (!closureReceiptPresent(body)) {
      findings.push({
        code: "issue_closure_receipt_missing",
        severity: "error",
        message:
          "Issue-closing PR requires Closure receipt with PLAN ID, HEAD SHA, test/CI, and review evidence",
      });
    }
    if (!childDispositionPresent(body)) {
      findings.push({
        code: "issue_closure_children_missing",
        severity: "error",
        message:
          "Issue-closing PR requires Child Issues: none or an explicit disposition for every child",
      });
    }
    if (input.closureGraphRequired) {
      const graphs = input.closureGraphSnapshots ?? [];
      const closingIssues = Array.from(body.matchAll(/(?:^|\n)Closes[ \t]+#(\d+)\b/gi), (match) =>
        Number(match[1]),
      ).sort((left, right) => left - right);
      const graphIssues = graphs
        .map((graph) => graph.parent_issue.number)
        .sort((left, right) => left - right);
      const missingGraphIssues = closingIssues.filter(
        (issueNumber) => !graphIssues.includes(issueNumber),
      );
      if (missingGraphIssues.length > 0) {
        findings.push({
          code: "issue_closure_graph_missing",
          severity: "error",
          message: `closing Issue has no read-after-GitHub closure graph snapshot issues=${missingGraphIssues.join(",")}`,
        });
      }
      if (
        new Set(graphIssues).size !== graphIssues.length ||
        graphIssues.some((issueNumber) => !closingIssues.includes(issueNumber))
      ) {
        findings.push({
          code: "issue_closure_graph_invalid",
          severity: "error",
          message: `issue_closure_parent_exact_set_mismatch closing=${closingIssues.join(",") || "-"} governed=${graphIssues.join(",") || "-"}`,
        });
      }
      for (const graph of graphs) {
        const report = auditIssueClosureGraph(graph);
        for (const graphFinding of report.findings) {
          findings.push({
            code: "issue_closure_graph_invalid",
            severity: "error",
            message: `${graphFinding.code} ${graphFinding.subject}: ${graphFinding.detail}`,
          });
        }
      }
    }
    const decisionReceipt = fieldValue(body, "Decision receipt") ?? "";
    if (
      (outcome === "rejected" || outcome === "quarantined") &&
      (!decisionReceipt || /^(?:none|not_required)\b/i.test(decisionReceipt))
    ) {
      findings.push({
        code: "issue_closure_decision_receipt_missing",
        severity: "error",
        message: `${outcome} Issue closure requires a terminal Decision receipt`,
      });
    }
    const poDecision = fieldValue(body, "PO decision") ?? "";
    if (
      (outcome === "superseded" || outcome === "cancelled") &&
      (!poDecision || /^(?:none|not_required)$/i.test(poDecision))
    ) {
      findings.push({
        code: "issue_closure_po_decision_missing",
        severity: "error",
        message: `${outcome} Issue closure requires a non-empty PO decision`,
      });
    }
  }

  return {
    ok: findings.length === 0,
    eventName,
    headBranch,
    baseBranch,
    findings,
  };
}

export function prContextGuardMessages(result: PrContextResult): string[] {
  if (result.ok) {
    return [
      `pr-context-guard - OK (event=${result.eventName || "-"}, head=${result.headBranch || "-"}, base=${result.baseBranch || "-"})`,
    ];
  }
  return [
    `pr-context-guard - violation: errors=${result.findings.length}`,
    ...result.findings.map(
      (finding) => `pr-context-guard - block ${finding.code}: ${finding.message}`,
    ),
  ];
}
