import { REVIEWED_SAFE_DISPOSITIONS } from "./l12-hybrid-reviewed-safe-v2";

export const REVIEWED_SAFE_ARTIFACT_FAMILIES = [
  {
    familyId: "document-semantic-diff",
    paths: [
      "docs/design/helix/L6-function-design/document-semantic-diff.md",
      "docs/test-design/helix/L8-document-semantic-diff-contracts.md",
      "docs/plans/PLAN-L7-712-document-semantic-diff-node-authority.md",
    ],
  },
] as const;

export type ReviewedSafeInventoryLifecycleFinding = {
  code:
    | "family_member_not_reviewed_safe"
    | "reviewed_safe_member_still_authority_review"
    | "section_count_mismatch";
  familyId?: string;
  path?: string;
  section?: 6 | 7;
  declaredCount?: number;
  actualCount?: number;
};

function sectionText(inventoryText: string, section: number, nextSection: number): string {
  const start = inventoryText.indexOf(`## ${section}.`);
  const end = inventoryText.indexOf(`\n## ${nextSection}.`, start);
  if (start < 0 || end < 0) return "";
  return inventoryText.slice(start, end);
}

function bulletPaths(text: string): string[] {
  return [...text.matchAll(/^- `([^`]+)`/gm)].map((match) => match[1] ?? "");
}

function declaredCount(text: string): number | null {
  const match = text.match(/^## \d+\.[^\n]*（(\d+)）/m);
  return match?.[1] ? Number(match[1]) : null;
}

export function analyzeReviewedSafeInventoryLifecycle(
  inventoryText: string,
  reviewedSafePaths: ReadonlySet<string> = new Set(
    REVIEWED_SAFE_DISPOSITIONS.map((row) => row.path),
  ),
): { ok: boolean; findings: ReviewedSafeInventoryLifecycleFinding[] } {
  const findings: ReviewedSafeInventoryLifecycleFinding[] = [];
  const sections = [
    { section: 5 as const, text: sectionText(inventoryText, 5, 6) },
    { section: 6 as const, text: sectionText(inventoryText, 6, 7) },
    { section: 7 as const, text: sectionText(inventoryText, 7, 8) },
  ];
  const authorityReviewPaths = new Set(sections.flatMap((entry) => bulletPaths(entry.text)));

  for (const family of REVIEWED_SAFE_ARTIFACT_FAMILIES) {
    for (const path of family.paths) {
      if (!reviewedSafePaths.has(path)) {
        findings.push({
          code: "family_member_not_reviewed_safe",
          familyId: family.familyId,
          path,
        });
      }
      if (authorityReviewPaths.has(path)) {
        findings.push({
          code: "reviewed_safe_member_still_authority_review",
          familyId: family.familyId,
          path,
        });
      }
    }
  }

  for (const entry of sections.filter(
    (candidate): candidate is { section: 6 | 7; text: string } => candidate.section !== 5,
  )) {
    const declared = declaredCount(entry.text);
    const actual = bulletPaths(entry.text).length;
    if (declared !== actual) {
      findings.push({
        code: "section_count_mismatch",
        section: entry.section,
        declaredCount: declared ?? undefined,
        actualCount: actual,
      });
    }
  }

  return { ok: findings.length === 0, findings };
}
