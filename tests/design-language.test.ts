import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeDesignLanguage,
  designLanguageMessages,
  loadDesignLanguageDocs,
} from "../src/lint/design-language";

describe("design-language lint", () => {
  it("U-DESLANG-001: passes Japanese prose while allowing technical identifiers", () => {
    const result = analyzeDesignLanguage(
      [
        {
          path: "docs/design/x.md",
          text: "# HELIX 設計\n\n`ut-tdd doctor` は gate evidence を確認する。\n",
        },
      ],
      { baselineViolations: 0 },
    );

    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it("U-DESLANG-002: detects English-only headings and prose", () => {
    const result = analyzeDesignLanguage(
      [
        {
          path: "docs/design/x.md",
          text: [
            "# Functional Requirements",
            "",
            "This paragraph describes a workflow decision without Japanese prose.",
            "",
            "`This code block is ignored`",
          ].join("\n"),
        },
      ],
      { baselineViolations: 0 },
    );

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toEqual(["english-heading", "english-prose"]);
  });

  it("U-DESLANG-003: allows existing baseline debt but fails when debt increases", () => {
    const docs = [
      { path: "docs/design/a.md", text: "# English Heading\n" },
      { path: "docs/design/b.md", text: "# Another Heading\n" },
    ];

    expect(analyzeDesignLanguage(docs, { baselineViolations: 2 }).ok).toBe(true);
    const increased = analyzeDesignLanguage(docs, { baselineViolations: 1 });

    expect(increased.ok).toBe(false);
    expect(increased.newViolations).toBe(1);
    expect(designLanguageMessages(increased)[0]).toContain("english prose increased by 1件");
  });

  it("U-DESLANG-005: fails same-count English prose replacement by fingerprint drift", () => {
    const baselineDocs = [{ path: "docs/design/a.md", text: "# English Heading\n" }];
    const baseline = analyzeDesignLanguage(baselineDocs, { baselineViolations: 1 });
    const replaced = analyzeDesignLanguage(
      [{ path: "docs/design/a.md", text: "# Different Heading\n" }],
      {
        baselineViolations: 1,
        baselineFingerprint: baseline.fingerprint,
      },
    );

    expect(replaced.ok).toBe(false);
    expect(replaced.newViolations).toBe(0);
    expect(replaced.fingerprintDrift).toBe(true);
    expect(designLanguageMessages(replaced)[0]).toContain("english prose fingerprint changed");
  });

  it("U-DESLANG-004: real repo human-facing docs do not exceed the frozen English-prose baseline", () => {
    const result = analyzeDesignLanguage(loadDesignLanguageDocs());

    expect(result.checked).toBeGreaterThan(500);
    expect(result.ok).toBe(true);
    expect(result.newViolations).toBe(0);
  });

  it("U-DESLANG-006: includes memory, templates, and feedback docs in the real repo audit", () => {
    const paths = loadDesignLanguageDocs().map((doc) => doc.path);

    expect(paths).toContain(".claude/agents/advisor-fable.md");
    expect(paths).toContain(".claude/commands/ship.md");
    expect(paths).toContain(".github/ISSUE_TEMPLATE/add-feature.md");
    expect(paths).toContain(".ut-tdd/audit/A-133-upstream-vmodel-coverage-audit.md");
    expect(paths).toContain(".ut-tdd/review/cross-review-versionup-and-s4-failclose.md");
    expect(paths).toContain(".github/PULL_REQUEST_TEMPLATE.md");
    expect(paths).toContain("README.md");
    expect(paths).toContain("docs/archive/ut-tdd-agent-harness-concept_v2.1.md");
    expect(paths).toContain("docs/feedback-log.md");
    expect(paths).toContain("docs/improvement-backlog.md");
    expect(paths).toContain("docs/memory/README.md");
    expect(paths).toContain("docs/migration/helix-fork-completion-plan.md");
    expect(paths).toContain("docs/reference/ai-agent-harness-directory-reference.md");
    expect(paths).toContain("docs/research/mcp-external-verification-profile-research-2026-06-09.md");
    expect(paths).toContain("docs/skills/SKILL_MAP.md");
    expect(paths).toContain("docs/templates/prompts/effort-classify.md");
  });

  it("U-DESLANG-007: detects English prose in expanded template roots", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-design-language-"));
    try {
      mkdirSync(join(root, "docs", "templates", "prompts"), { recursive: true });
      mkdirSync(join(root, "docs", "memory"), { recursive: true });
      writeFileSync(join(root, "docs", "feedback-log.md"), "# フィードバックログ\n", "utf8");
      writeFileSync(join(root, "docs", "memory", "README.md"), "# 永続メモ\n", "utf8");
      writeFileSync(
        join(root, "docs", "templates", "prompts", "bad.md"),
        "# English Prompt\n\nThis prompt is written only in English prose.\n",
        "utf8",
      );

      const result = analyzeDesignLanguage(loadDesignLanguageDocs(root), { baselineViolations: 0 });

      expect(result.ok).toBe(false);
      expect(result.violations.map((v) => v.path)).toEqual([
        "docs/templates/prompts/bad.md",
        "docs/templates/prompts/bad.md",
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-DESLANG-008: ignores structured record headers as machine fields", () => {
    const result = analyzeDesignLanguage(
      [
        {
          path: "docs/plans/x.md",
          text: "cutover_decision_record:\n  allowed_outcome: approve_cutover\n\n本文は日本語で説明する。\n",
        },
      ],
      { baselineViolations: 0 },
    );

    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });
});
