// @helix-repo-wide-guard
// PLAN-L3-85-document-authority-census / DAC-AC-001..023
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { parseMarkdownFrontmatter } from "../src/lint/shared";

const repoRoot = join(import.meta.dirname, "..");
const paths = {
  l1: "docs/design/helix/L1-requirements/document-authority-census-requests.md",
  l3: "docs/design/helix/L3-requirements/document-authority-census-requirements.md",
  l10: "docs/test-design/helix/document-authority-census-acceptance.md",
  l12: "docs/test-design/helix/document-authority-census-recognition.md",
} as const;

const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");
const markdownBody = (text: string) => {
  const match = /^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/.exec(text);
  if (!match) throw new Error("frontmatter境界が不正です");
  return match[1];
};
const digestBody = (text: string) =>
  `sha256:${createHash("sha256").update(markdownBody(text)).digest("hex")}`;
const ids = (text: string, pattern: RegExp) =>
  [...markdownBody(text).matchAll(pattern)].map((match) => match[1]);
const sequence = (prefix: string, count: number) =>
  Array.from({ length: count }, (_, index) => `${prefix}${String(index + 1).padStart(3, "0")}`);

describe("PLAN-L3-85 Document Authority Census source promotion", () => {
  it("DAC-PROMOTE-001: canonical L1↔L12とL3↔L10を双方向に固定する", () => {
    const expected = [
      [paths.l1, "L1", "L12", paths.l12],
      [paths.l12, "L12", "L1", paths.l1],
      [paths.l3, "L3", "L10", paths.l10],
      [paths.l10, "L10", "L3", paths.l3],
    ] as const;
    for (const [path, layer, pair, pairArtifact] of expected) {
      const frontmatter = parseMarkdownFrontmatter(read(path));
      expect(frontmatter, path).not.toBeNull();
      expect(frontmatter?.canonical_vmodel, path).toBe("L1-L12");
      expect(frontmatter?.canonical_layer, path).toBe(layer);
      expect(frontmatter?.canonical_pair, path).toBe(pair);
      expect(frontmatter?.pair_artifact, path).toBe(pairArtifact);
      expect(frontmatter?.status, path).toBe("confirmed");
    }
  });

  it("DAC-PROMOTE-002: 承認済み意味集合を欠落・重複なく保持する", () => {
    expect(ids(read(paths.l1), /`(DAC-BR-\d{3})`/g)).toEqual([
      "DAC-BR-001",
      "DAC-BR-002",
      "DAC-BR-003",
      "DAC-BR-004",
      "DAC-BR-005",
    ]);
    expect(ids(read(paths.l1), /`(DAC-FR-\d{3})`/g)).toEqual(sequence("DAC-FR-", 10));
    expect(ids(read(paths.l3), /`(DAC-R-\d{3})`/g)).toEqual(sequence("DAC-R-", 13));
    expect(ids(read(paths.l10), /`(DAC-AC-\d{3})`/g)).toEqual(sequence("DAC-AC-", 23));
  });

  it("DAC-PROMOTE-003: 承認digestとcanonical body digestを混同しない", () => {
    for (const path of [paths.l1, paths.l3, paths.l10]) {
      const text = read(path);
      const frontmatter = parseMarkdownFrontmatter(text);
      expect(frontmatter?.approval_record_id, path).toBe("L3-PO-1381-001");
      expect(frontmatter?.approved_raw_digest, path).toMatch(/^sha256:[0-9a-f]{64}$/);
      expect(frontmatter?.canonical_body_digest, path).toBe(digestBody(text));
    }
  });

  it("DAC-PROMOTE-004: candidate pathを第二正本として残さない", () => {
    for (const name of ["requests", "requirements", "acceptance"]) {
      expect(
        existsSync(join(repoRoot, `docs/governance/candidates/document-authority-census-${name}.md`)),
        name,
      ).toBe(false);
    }
  });
});
