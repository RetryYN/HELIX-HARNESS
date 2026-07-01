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

  it("U-DESLANG-004: real repo human-facing docs do not exceed the frozen English-prose baseline", () => {
    const result = analyzeDesignLanguage(loadDesignLanguageDocs());

    expect(result.checked).toBeGreaterThan(500);
    expect(result.ok).toBe(true);
    expect(result.newViolations).toBe(0);
  });
});
