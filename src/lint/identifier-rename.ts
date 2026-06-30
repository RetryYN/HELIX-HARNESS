import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export type IdentifierRenameToken = "ut-tdd" | ".ut-tdd" | "area=harness";

export interface IdentifierRenameHit {
  token: IdentifierRenameToken;
  path: string;
  count: number;
}

export interface IdentifierRenameAudit {
  sourceRoot: string;
  targetCli: "helix";
  targetStateDir: ".helix";
  tokens: IdentifierRenameToken[];
  totalHits: number;
  hitsByToken: Record<IdentifierRenameToken, number>;
  filesByToken: Record<IdentifierRenameToken, number>;
  hits: IdentifierRenameHit[];
  cutoverApproved: boolean;
  status: "ready_for_cutover" | "blocked_pending_cutover_approval";
  requiredRecords: string[];
}

export interface IdentifierRenameMapping {
  from: IdentifierRenameToken;
  to: "helix" | ".helix" | "area=helix";
}

export interface IdentifierRenameCutoverPlan {
  schemaVersion: "identifier-rename-cutover-plan.v1";
  status: "ready_for_cutover_packet" | "blocked_pending_cutover_approval";
  planOnly: true;
  mustNotApply: true;
  applyCommandAvailable: false;
  applyAuthorized: boolean;
  targetCli: "helix";
  targetStateDir: ".helix";
  renameMap: IdentifierRenameMapping[];
  audit: Pick<
    IdentifierRenameAudit,
    "status" | "totalHits" | "hitsByToken" | "filesByToken" | "requiredRecords"
  >;
  blockedReasons: string[];
  dryRunPlan: string[];
  rollbackPlan: string[];
  monitoringPlan: string[];
  approvalGate: {
    requiredRecords: string[];
    requiredDecision: "approve_cutover";
    requiredActionBinding: "approve_action_binding";
    approvedActorRequired: true;
    approvedToolRequired: true;
    approvedTargetRequired: true;
  };
}

const TOKENS: IdentifierRenameToken[] = ["ut-tdd", ".ut-tdd", "area=harness"];
const RENAME_MAP: IdentifierRenameMapping[] = [
  { from: "ut-tdd", to: "helix" },
  { from: ".ut-tdd", to: ".helix" },
  { from: "area=harness", to: "area=helix" },
];
const IGNORED_DIRS = new Set([".git", "node_modules", "dist", "coverage"]);
const TEXT_EXTENSIONS = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsonl",
  ".md",
  ".mjs",
  ".ps1",
  ".sh",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);

function hasTextExtension(path: string): boolean {
  const match = path.match(/\.[^.\\/]+$/);
  return match ? TEXT_EXTENSIONS.has(match[0] ?? "") : false;
}

function countToken(text: string, token: IdentifierRenameToken): number {
  return text.split(token).length - 1;
}

function walkTextFiles(root: string): string[] {
  const files: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      const abs = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(abs);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!hasTextExtension(abs)) continue;
      files.push(abs);
    }
  };
  walk(root);
  return files.sort();
}

function cutoverApprovalPresent(root: string): boolean {
  const planPath = join(root, "docs", "plans", "PLAN-M-02-helix-identifier-rename.md");
  if (!existsSync(planPath) || !statSync(planPath).isFile()) return false;
  const text = readFileSync(planPath, "utf8");
  const blockFor = (recordName: string): string => {
    const match = text.match(
      new RegExp(`(?:^|\\n)${recordName}:\\s*\\n([\\s\\S]*?)(?=\\n\\S[^\\n]*:\\s*(?:\\n|$)|$)`),
    );
    return match?.[1] ?? "";
  };
  const valueFor = (block: string, field: string): string | null => {
    const line = block
      .split(/\r?\n/)
      .find((candidate) => new RegExp(`^\\s*-?\\s*${field}:`).test(candidate));
    return line?.replace(new RegExp(`^\\s*-?\\s*${field}:\\s*`), "").trim() ?? null;
  };
  const normalizedValue = (value: string | null): string =>
    (value ?? "").trim().replace(/^["'`]+|["'`]+$/g, "");
  const isExactOutcome = (value: string | null, expected: string): boolean =>
    normalizedValue(value) === expected;
  const cutoverBlock = blockFor("cutover_decision_record");
  const approvalBlock = blockFor("action_binding_approval_record");
  const approvedActor = valueFor(approvalBlock, "approved_actor");
  const approvedTool = valueFor(approvalBlock, "approved_tool");
  const approvedTarget = valueFor(approvalBlock, "approved_target");
  const isConcreteApprovalValue = (value: string | null, deniedPrefix: string): boolean =>
    Boolean(value) && !value?.startsWith(deniedPrefix) && !/^<[^>]+>$/.test(value ?? "");
  return (
    isExactOutcome(valueFor(cutoverBlock, "allowed_outcome"), "approve_cutover") &&
    isExactOutcome(valueFor(approvalBlock, "allowed_outcome"), "approve_action_binding") &&
    isConcreteApprovalValue(approvedActor, "No actor is approved") &&
    isConcreteApprovalValue(approvedTool, "No migration tool is approved") &&
    isConcreteApprovalValue(approvedTarget, "No irreversible target is approved")
  );
}

export function auditIdentifierRenameBlastRadius(root: string): IdentifierRenameAudit {
  const hits: IdentifierRenameHit[] = [];
  const hitsByToken: Record<IdentifierRenameToken, number> = {
    "ut-tdd": 0,
    ".ut-tdd": 0,
    "area=harness": 0,
  };
  const filesByToken: Record<IdentifierRenameToken, number> = {
    "ut-tdd": 0,
    ".ut-tdd": 0,
    "area=harness": 0,
  };

  for (const file of walkTextFiles(root)) {
    const rel = relative(root, file).replace(/\\/g, "/");
    const text = readFileSync(file, "utf8");
    for (const token of TOKENS) {
      const count = countToken(text, token);
      if (count === 0) continue;
      hits.push({ token, path: rel, count });
      hitsByToken[token] += count;
      filesByToken[token] += 1;
    }
  }

  const cutoverApproved = cutoverApprovalPresent(root);
  return {
    sourceRoot: root,
    targetCli: "helix",
    targetStateDir: ".helix",
    tokens: TOKENS,
    totalHits: hits.reduce((sum, hit) => sum + hit.count, 0),
    hitsByToken,
    filesByToken,
    hits,
    cutoverApproved,
    status: cutoverApproved ? "ready_for_cutover" : "blocked_pending_cutover_approval",
    requiredRecords: ["cutover_decision_record", "action_binding_approval_record"],
  };
}

export function buildIdentifierRenameCutoverPlan(root: string): IdentifierRenameCutoverPlan {
  const audit = auditIdentifierRenameBlastRadius(root);
  const blockedReasons = audit.cutoverApproved
    ? []
    : [
        "missing concrete cutover_decision_record.allowed_outcome=approve_cutover",
        "missing concrete action_binding_approval_record.allowed_outcome=approve_action_binding",
        "missing action-bound approved_actor/approved_tool/approved_target for irreversible rename",
      ];

  return {
    schemaVersion: "identifier-rename-cutover-plan.v1",
    status: audit.cutoverApproved ? "ready_for_cutover_packet" : "blocked_pending_cutover_approval",
    planOnly: true,
    mustNotApply: true,
    applyCommandAvailable: false,
    applyAuthorized: audit.cutoverApproved,
    targetCli: audit.targetCli,
    targetStateDir: audit.targetStateDir,
    renameMap: RENAME_MAP,
    audit: {
      status: audit.status,
      totalHits: audit.totalHits,
      hitsByToken: audit.hitsByToken,
      filesByToken: audit.filesByToken,
      requiredRecords: audit.requiredRecords,
    },
    blockedReasons,
    dryRunPlan: [
      "run rename audit and freeze the ut-tdd/.ut-tdd/area=harness blast-radius baseline",
      "rehearse source/test/docs codemod on a non-destructive branch",
      "rehearse state path migration with backup/restore proof for .ut-tdd/harness.db, memory, state, logs, and handover",
      "run targeted identifier-rename tests, typecheck, lint, db rebuild, doctor, and full test suite",
      "run compiled distribution smoke after the CLI/bin rename rehearsal",
    ],
    rollbackPlan: [
      "create a pre-cutover branch or tag at frozen HEAD",
      "backup .ut-tdd/harness.db, memory, state, logs, handover, provider handover, and repo-local hook configs",
      "restore old hook/adapter markers and state paths if doctor or full tests fail",
      "keep or restore a temporary ut-tdd alias only with an explicit sunset PLAN",
      "revert the cutover commit if post-cutover monitoring fails",
    ],
    monitoringPlan: [
      "run helix doctor and legacy alias smoke during the quiet window",
      "rebuild harness.db and inspect status/completion decision packet",
      "check rule-drift, hook adapter parity, and green-command digest after cutover",
      "watch feedback backlog, handover, and runtime logs for path or marker regressions",
    ],
    approvalGate: {
      requiredRecords: audit.requiredRecords,
      requiredDecision: "approve_cutover",
      requiredActionBinding: "approve_action_binding",
      approvedActorRequired: true,
      approvedToolRequired: true,
      approvedTargetRequired: true,
    },
  };
}
