import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";

export type L14CloseAuditStatus = "closed" | "partial" | "gap" | "blocked-human";

export interface L14CloseAuditInput {
  repoRoot?: string;
  auditPath: string;
  auditMd: string;
}

export interface L14CloseAuditRow {
  item: string;
  question: string;
  evidence: string;
  gap: string;
  boundary: string;
  nextAction: string;
  status: L14CloseAuditStatus;
}

export interface L14CloseAuditResult {
  ok: boolean;
  rows: L14CloseAuditRow[];
  violations: string[];
  openRows: L14CloseAuditRow[];
}

const AUDIT_PATH = ".helix/audit/A-144-l14-close-audit.md";

const EXPECTED_ITEMS = [
  "P0-forward-convergence",
  "P1-autonomous-engine",
  "P2-orchestration-loop",
  "P3-verification-foundation",
  "P4-self-maintenance",
  "P5-context-efficiency",
  "P6-github-automation",
  "P7-agent-memory",
  "P8-external-security",
  "P9-db-convergence",
] as const;

const VALID_STATUSES = new Set<L14CloseAuditStatus>(["closed", "partial", "gap", "blocked-human"]);

const REQUIRED_EVIDENCE_BY_ITEM: Record<(typeof EXPECTED_ITEMS)[number], readonly string[]> = {
  "P0-forward-convergence": [
    "src/lint/forward-convergence.ts",
    "tests/semantic-frontier-consistency.test.ts",
  ],
  "P1-autonomous-engine": [
    "src/lint/completion-decision-packet.ts",
    "tests/completion-decision-packet.test.ts",
  ],
  "P2-orchestration-loop": [
    "docs/plans/PLAN-L7-304-loop-iterations-db-schema.md",
    "docs/plans/PLAN-L7-307-loop-continuous-run-heartbeat.md",
  ],
  "P3-verification-foundation": ["docs/process/gates.md", "tests/vmodel-pair.test.ts"],
  "P4-self-maintenance": [
    ".helix/audit/A-134-harness-telemetry-self-improvement-audit.md",
    "src/lint/telemetry-closure.ts",
  ],
  "P5-context-efficiency": [
    "docs/plans/PLAN-L7-315-context-doc-router.md",
    "tests/context-doc-router.test.ts",
  ],
  "P6-github-automation": [
    ".github/workflows/harness-check.yml",
    "docs/plans/PLAN-L7-230-destructive-git-command-guard.md",
  ],
  "P7-agent-memory": [
    "docs/plans/PLAN-L7-175-helix-orchestration-memory-impl.md",
    "docs/plans/PLAN-L7-176-helix-orchestration-memory-runtime.md",
  ],
  "P8-external-security": [
    "src/lint/action-binding-approval-readiness.ts",
    "src/lint/cutover-readiness.ts",
  ],
  "P9-db-convergence": ["src/state-db/projection-writer.ts", "tests/projection-writer.test.ts"],
};

const REQUIRED_BOUNDARY_MARKERS_BY_ITEM: Record<
  (typeof EXPECTED_ITEMS)[number],
  readonly string[]
> = {
  "P0-forward-convergence": ["Forward", "semantic frontier"],
  "P1-autonomous-engine": ["completionClaimAllowed=false", "version-up"],
  "P2-orchestration-loop": ["heartbeat", "loop"],
  "P3-verification-foundation": ["G8-G14", "pair"],
  "P4-self-maintenance": ["feedback", "improvement"],
  "P5-context-efficiency": ["context", "fail-open"],
  "P6-github-automation": ["push", "PR"],
  "P7-agent-memory": ["memory", "DB"],
  "P8-external-security": ["human", "cutover"],
  "P9-db-convergence": ["harness.db", "projection"],
};

function tableRows(md: string): string[][] {
  return md
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && line.endsWith("|"))
    .map((line) =>
      line
        .slice(1, -1)
        .split("|")
        .map((cell) => cell.trim()),
    )
    .filter((cells) => !cells.every((cell) => /^:?-{3,}:?$/.test(cell)));
}

function normalizedHeader(cell: string): string {
  const lower = cell.toLowerCase();
  if (lower.startsWith("item") || cell.includes("項目")) return "item";
  if (lower.includes("question") || cell.includes("監査質問")) return "question";
  if (lower.includes("evidence") || cell.includes("証跡")) return "evidence";
  if (lower.includes("gap") || cell.includes("差分")) return "gap";
  if (cell.includes("境界") || lower.includes("boundary")) return "boundary";
  if (cell.includes("次アクション") || lower.includes("next")) return "next";
  if (lower.startsWith("status") || cell.includes("状態")) return "status";
  return lower;
}

function normalizeStatus(raw: string): L14CloseAuditStatus | null {
  const value = raw.replaceAll("`", "").trim();
  return VALID_STATUSES.has(value as L14CloseAuditStatus) ? (value as L14CloseAuditStatus) : null;
}

function pathExistsInsideRepo(repoRoot: string | undefined, path: string): boolean {
  if (!repoRoot || !path || isAbsolute(path)) return false;
  const resolved = resolve(repoRoot, path);
  const rel = relative(repoRoot, resolved);
  if (rel.startsWith("..") || isAbsolute(rel)) return false;
  return existsSync(resolved);
}

function citedPaths(cell: string): string[] {
  return [...cell.matchAll(/`([^`]+)`/g)]
    .map((m) => m[1])
    .filter((path) => /^[.\w/-]+\.[\w-]+$/.test(path));
}

export function analyzeL14CloseAudit(input: L14CloseAuditInput): L14CloseAuditResult {
  const violations: string[] = [];
  const parsed = tableRows(input.auditMd);
  const rows: L14CloseAuditRow[] = [];

  if (parsed.length < 2) {
    return {
      ok: false,
      rows,
      openRows: [],
      violations: [`${input.auditPath}: audit matrix table is missing`],
    };
  }

  const header = parsed[0].map(normalizedHeader);
  const indexes = {
    item: header.indexOf("item"),
    question: header.indexOf("question"),
    evidence: header.indexOf("evidence"),
    gap: header.indexOf("gap"),
    boundary: header.indexOf("boundary"),
    next: header.indexOf("next"),
    status: header.indexOf("status"),
  };
  if (Object.values(indexes).some((index) => index < 0)) {
    return {
      ok: false,
      rows,
      openRows: [],
      violations: [`${input.auditPath}: audit matrix header is malformed`],
    };
  }

  for (const cells of parsed.slice(1)) {
    const item = cells[indexes.item] ?? "";
    const question = cells[indexes.question] ?? "";
    const evidence = cells[indexes.evidence] ?? "";
    const gap = cells[indexes.gap] ?? "";
    const boundary = cells[indexes.boundary] ?? "";
    const nextAction = cells[indexes.next] ?? "";
    const status = normalizeStatus(cells[indexes.status] ?? "");
    if (!item || !question || !evidence || !gap || !boundary || !nextAction || !status) {
      violations.push(`${input.auditPath}: malformed row for ${item || "(unknown)"}`);
      continue;
    }
    rows.push({ item, question, evidence, gap, boundary, nextAction, status });
  }

  const byItem = new Map(rows.map((row) => [row.item, row]));
  for (const expected of EXPECTED_ITEMS) {
    const row = byItem.get(expected);
    if (!row) {
      violations.push(`${input.auditPath}: missing expected item ${expected}`);
      continue;
    }
    for (const requiredPath of REQUIRED_EVIDENCE_BY_ITEM[expected]) {
      if (!row.evidence.includes(`\`${requiredPath}\``)) {
        violations.push(`${expected}: missing required evidence citation ${requiredPath}`);
      } else if (!pathExistsInsideRepo(input.repoRoot, requiredPath)) {
        violations.push(`${expected}: required evidence path does not exist ${requiredPath}`);
      }
    }
    for (const marker of REQUIRED_BOUNDARY_MARKERS_BY_ITEM[expected]) {
      if (!row.boundary.includes(marker)) {
        violations.push(`${expected}: missing boundary marker ${marker}`);
      }
    }
    if (row.status !== "closed" && /^(なし|none)$/i.test(row.gap.replaceAll("`", "").trim())) {
      violations.push(`${expected}: non-closed row must name a gap`);
    }
    if (
      row.status !== "closed" &&
      /^(なし|none)$/i.test(row.nextAction.replaceAll("`", "").trim())
    ) {
      violations.push(`${expected}: non-closed row must name next action`);
    }
  }

  for (const row of rows) {
    for (const path of citedPaths(row.evidence)) {
      if (!pathExistsInsideRepo(input.repoRoot, path)) {
        violations.push(`${row.item}: cited evidence path does not exist ${path}`);
      }
    }
  }

  const openRows = rows.filter((row) => row.status !== "closed");
  return { ok: violations.length === 0, rows, openRows, violations };
}

export function loadL14CloseAuditInput(repoRoot = process.cwd()): L14CloseAuditInput {
  const path = AUDIT_PATH;
  return {
    repoRoot,
    auditPath: path,
    auditMd: readFileSync(resolve(repoRoot, path), "utf8"),
  };
}

export function l14CloseAuditMessages(result: L14CloseAuditResult): string[] {
  if (result.ok) {
    const statusSummary = result.openRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1;
      return acc;
    }, {});
    const openSummary = Object.entries(statusSummary)
      .map(([status, count]) => `${status}=${count}`)
      .join(", ");
    return [
      `l14-close-audit - OK (items=${result.rows.length}, open=${result.openRows.length}${openSummary ? `, ${openSummary}` : ""})`,
    ];
  }
  return [`l14-close-audit - violation: ${result.violations.join("; ")}`];
}
