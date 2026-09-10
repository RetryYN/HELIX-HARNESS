import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  currentWorkflowModelIds,
  loadWorkflowClassificationCatalog,
} from "../schema/workflow-classification-catalog";

export interface DriveModelPassageDoc {
  file: string;
  content: string;
}

export interface DriveModelPassageRow {
  file: string;
  workflowIdentity: string;
  requiredColumns: string;
}

export interface DriveModelPassageViolation {
  file: string;
  workflowIdentity?: string;
  reason:
    | "missing_section"
    | "missing_table"
    | "malformed_row"
    | "missing_identity"
    | "unexpected_identity"
    | "duplicate_identity"
    | "missing_forward_target"
    | "missing_residual_status"
    | "missing_expected_identity";
}

export interface DriveModelPassageResult {
  checked: number;
  rows: DriveModelPassageRow[];
  violations: DriveModelPassageViolation[];
  expectedWorkflowModelIds: string[];
  ok: boolean;
}

const SECTION_RE = /^##\s+Section\s+2\.1\s+Workflow-model Passage Certificate (Required|必須)\s*$/m;
const NEXT_SECTION_RE = /^##\s+/m;

/** current authorityのworkflow_model集合をgenerated catalogから取得する。 */
export function currentWorkflowModelPassageIdentities(repoRoot: string = process.cwd()): string[] {
  return currentWorkflowModelIds(loadWorkflowClassificationCatalog(repoRoot));
}

function section(content: string): string {
  const match = content.match(SECTION_RE);
  if (!match || match.index === undefined) return "";
  const rest = content.slice(match.index + match[0].length);
  const end = rest.search(NEXT_SECTION_RE);
  return end < 0 ? rest : rest.slice(0, end);
}

function tableRows(text: string): string[][] {
  return text
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

function hasForwardTarget(text: string): boolean {
  return /forward|re-entry|route|target|routing/i.test(text);
}

function hasResidualStatus(text: string): boolean {
  return /residual status|status|gap|parked|po decision/i.test(text);
}

export function analyzeDriveModelPassage(
  docs: DriveModelPassageDoc[],
  expectedWorkflowModelIds: readonly string[] = currentWorkflowModelPassageIdentities(),
): DriveModelPassageResult {
  const rows: DriveModelPassageRow[] = [];
  const violations: DriveModelPassageViolation[] = [];
  const expectedIdentities = [...expectedWorkflowModelIds];
  const expectedIdentitySet = new Set(expectedIdentities);

  for (const doc of docs) {
    const body = section(doc.content);
    if (!body) {
      violations.push({ file: doc.file, reason: "missing_section" });
      continue;
    }
    const parsed = tableRows(body);
    if (parsed.length < 2) {
      violations.push({ file: doc.file, reason: "missing_table" });
      continue;
    }
    const header = parsed[0].map((cell) => cell.toLowerCase());
    const identityIndex = Math.max(
      header.indexOf("workflow model / identity"),
      header.indexOf("ワークフロー識別子"),
    );
    const columnsIndex = header.findIndex(
      (cell) =>
        cell === "required certificate columns" ||
        cell.includes("certificate columns") ||
        cell === "必須証跡項目",
    );
    if (identityIndex < 0 || columnsIndex < 0) {
      violations.push({ file: doc.file, reason: "malformed_row" });
      continue;
    }

    const documentIdentities = new Set<string>();
    for (const cells of parsed.slice(1)) {
      const workflowIdentity = cells[identityIndex] ?? "";
      const requiredColumns = cells[columnsIndex] ?? "";
      if (!workflowIdentity) {
        violations.push({
          file: doc.file,
          reason: "missing_identity",
        });
        continue;
      }
      if (!requiredColumns) {
        violations.push({ file: doc.file, workflowIdentity, reason: "malformed_row" });
        continue;
      }
      if (!expectedIdentitySet.has(workflowIdentity)) {
        violations.push({ file: doc.file, workflowIdentity, reason: "unexpected_identity" });
      }
      if (documentIdentities.has(workflowIdentity)) {
        violations.push({ file: doc.file, workflowIdentity, reason: "duplicate_identity" });
      }
      documentIdentities.add(workflowIdentity);
      if (!hasForwardTarget(requiredColumns)) {
        violations.push({ file: doc.file, workflowIdentity, reason: "missing_forward_target" });
      }
      if (!hasResidualStatus(requiredColumns)) {
        violations.push({ file: doc.file, workflowIdentity, reason: "missing_residual_status" });
      }
      rows.push({ file: doc.file, workflowIdentity, requiredColumns });
    }

    const seen = documentIdentities;
    for (const workflowIdentity of expectedIdentities) {
      if (!seen.has(workflowIdentity)) {
        violations.push({ file: doc.file, workflowIdentity, reason: "missing_expected_identity" });
      }
    }
  }

  return {
    checked: docs.length,
    rows,
    violations,
    expectedWorkflowModelIds: expectedIdentities,
    ok: violations.length === 0,
  };
}

export function loadDriveModelPassageDocs(
  repoRoot: string = process.cwd(),
): DriveModelPassageDoc[] {
  const target = join(
    repoRoot,
    "docs",
    "plans",
    "PLAN-RECOVERY-1715-drive-passage-catalog-authority.md",
  );
  if (!existsSync(target)) return [];
  return [
    {
      file: join(
        "docs",
        "plans",
        "PLAN-RECOVERY-1715-drive-passage-catalog-authority.md",
      ),
      content: readFileSync(target, "utf8"),
    },
  ];
}

export function driveModelPassageMessages(result: DriveModelPassageResult): string[] {
  if (result.checked === 0) {
    return ["workflow-model-passage - violation: passage certificate table not found"];
  }
  if (result.violations.length > 0) {
    const sample = result.violations
      .slice(0, 8)
      .map((v) => `${v.file}${v.workflowIdentity ? `:${v.workflowIdentity}` : ""}:${v.reason}`)
      .join(", ");
    return [
      `workflow-model-passage - violation ${result.violations.length} (${sample}); all current workflow identities need Forward target and residual status evidence`,
    ];
  }
  return [
    `workflow-model-passage - OK (checked=${result.checked}, identities=${result.rows.length}, expected=${result.expectedWorkflowModelIds.length})`,
  ];
}
