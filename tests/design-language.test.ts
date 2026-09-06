// @helix-repo-wide-guard
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkDesignLanguage, runDoctorGate } from "../src/doctor/index";
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
          text: "# HELIX 設計\n\n`helix doctor` は gate evidence を確認する。\n",
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
    expect(result.violations).toHaveLength(0);
  });

  it("U-DESLANG-006: includes memory, templates, and feedback docs in the real repo audit", () => {
    const paths = loadDesignLanguageDocs().map((doc) => doc.path);

    expect(paths).toContain(".claude/agents/advisor-fable.md");
    expect(paths).toContain(".claude/commands/ship.md");
    expect(paths).toContain(".github/ISSUE_TEMPLATE/add-feature.md");
    expect(paths).toContain(".helix/audit/A-133-upstream-vmodel-coverage-audit.md");
    expect(paths).toContain(".helix/review/cross-review-versionup-and-s4-failclose.md");
    expect(paths).toContain(".github/PULL_REQUEST_TEMPLATE.md");
    expect(paths).not.toContain("README.md");
    expect(paths).toContain("docs/archive/helix-agent-harness-concept_v2.1.md");
    expect(paths).toContain("docs/feedback-log.md");
    expect(paths).toContain("docs/improvement-backlog.md");
    expect(paths).not.toContain("docs/memory/README.md");
    expect(paths).toContain("docs/migration/helix-fork-completion-plan.md");
    expect(paths).toContain("docs/reference/ai-agent-harness-directory-reference.md");
    expect(paths).toContain(
      "docs/research/mcp-external-verification-profile-research-2026-06-09.md",
    );
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

  it("U-DESLANG-012: generated Requirement IR refinement table rows are machine fields", () => {
    const generatedRow =
      "| DIST-LITE-FR-001 | HR-FR-HIL-24 | 5 | 9 | specified | sha256:c633228ce61d0187cbb377d3d50b6e4f7360185b20d4d39d3dcd7f547b143fbb |";
    const canonical = analyzeDesignLanguage(
      [
        {
          path: "docs/generated/requirements/requirement-definition.generated.md",
          text: generatedRow,
        },
      ],
      { baselineViolations: 0 },
    );
    const authoredDocument = analyzeDesignLanguage(
      [{ path: "docs/design/x.md", text: generatedRow }],
      { baselineViolations: 0 },
    );
    const unreviewedFamily = analyzeDesignLanguage(
      [
        {
          path: "docs/generated/requirements/requirement-definition.generated.md",
          text: "| FUTURE-FR-001 | English prose must not bypass review |",
        },
      ],
      { baselineViolations: 0 },
    );

    expect(canonical.ok).toBe(true);
    expect(authoredDocument.violations.map((violation) => violation.reason)).toEqual([
      "english-prose",
    ]);
    expect(unreviewedFamily.violations.map((violation) => violation.reason)).toEqual([
      "english-prose",
    ]);
  });

  it("U-DESLANG-011: limits the G-10 structured audit exception to its canonical record", () => {
    const structuredRecord =
      "| G-10 | This structured evidence record contains machine-only fields |";
    const canonical = analyzeDesignLanguage(
      [{ path: "docs/governance/helix-objective-evidence-audit.md", text: structuredRecord }],
      { baselineViolations: 0 },
    );
    const wrongDocument = analyzeDesignLanguage(
      [{ path: "docs/plans/x.md", text: structuredRecord }],
      { baselineViolations: 0 },
    );
    const wrongRecord = analyzeDesignLanguage(
      [
        {
          path: "docs/governance/helix-objective-evidence-audit.md",
          text: "| G-11 | This English prose must remain detectable |",
        },
      ],
      { baselineViolations: 0 },
    );

    expect(canonical.ok).toBe(true);
    expect(wrongDocument.violations.map((violation) => violation.reason)).toEqual([
      "english-prose",
    ]);
    expect(wrongRecord.violations.map((violation) => violation.reason)).toEqual(["english-prose"]);
  });

  it("U-DESLANG-009: includes every non-README tracked Markdown document in the real repo audit", () => {
    const trackedMarkdown = spawnSync("git", ["ls-files", "*.md"], {
      cwd: process.cwd(),
      encoding: "utf8",
    })
      .stdout.split(/\r?\n/)
      .filter(
        (path) =>
          path &&
          existsSync(path) &&
          !/(^|\/)readme\.md$/i.test(path) &&
          !path.startsWith("docs/archive/handover/") &&
          !path.startsWith("docs/archive/intake/"),
      );
    const auditedPaths = new Set(loadDesignLanguageDocs().map((doc) => doc.path));

    const missing = trackedMarkdown.filter((path) => !auditedPaths.has(path));

    expect(missing).toEqual([]);
  });

  it("U-DESLANG-010: ignores generated and byte-preserved handover history while keeping live authored docs", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-design-language-handover-"));
    try {
      mkdirSync(join(root, "docs", "handover"), { recursive: true });
      mkdirSync(join(root, "docs", "archive", "handover"), { recursive: true });
      writeFileSync(
        join(root, "docs", "handover", "session-handover-2026-07-08.md"),
        "# Generated Handover\n\nThis generated packet contains machine field names only.\n",
        "utf8",
      );
      writeFileSync(
        join(root, "docs", "handover", "SESSION-2026-07-08-handover.md"),
        "# 引き継ぎ\n\n本文は日本語で記録する。\n",
        "utf8",
      );
      writeFileSync(
        join(root, "docs", "archive", "handover", "legacy.md"),
        "# Historical Handover\n\nThis file is retained byte-for-byte as retirement evidence.\n",
        "utf8",
      );

      const docs = loadDesignLanguageDocs(root);

      expect(docs.map((doc) => doc.path)).toEqual(["docs/handover/SESSION-2026-07-08-handover.md"]);
      expect(analyzeDesignLanguage(docs, { baselineViolations: 0 }).ok).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-DESLANG-018: byte-preserved intake原文を言語正本の検査対象にしない", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-design-language-intake-"));
    try {
      mkdirSync(join(root, "docs", "archive", "intake", "source"), { recursive: true });
      mkdirSync(join(root, "docs", "governance"), { recursive: true });
      writeFileSync(
        join(root, "docs", "archive", "intake", "source", "original.md"),
        "# Original External Document\n\nThis source must remain byte preserved.\n",
        "utf8",
      );
      writeFileSync(
        join(root, "docs", "governance", "current.md"),
        "# Current English Authority\n\nThis authored guidance must remain detectable.\n",
        "utf8",
      );

      const docs = loadDesignLanguageDocs(root);
      expect(docs.map((doc) => doc.path)).not.toContain(
        "docs/archive/intake/source/original.md",
      );
      expect(analyzeDesignLanguage(docs, { baselineViolations: 0 }).violations.map((v) => v.path)).toEqual([
        "docs/governance/current.md",
        "docs/governance/current.md",
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  // PLAN-RECOVERY-1493-design-language-early-detection:
  // 検出時点と位置表示だけを前倒しし、design-language の判定内容と baseline は変えない。
  it("U-DESLANG-013: reports violation locations even when the message is a fingerprint drift", () => {
    const result = analyzeDesignLanguage([
      {
        path: "docs/plans/PLAN-X.md",
        text: "# タイトル\n\n## Current Recovery V-pair oracle\n\n本文です。\n",
      },
    ]);

    expect(result.ok).toBe(false);
    expect(result.fingerprintDrift).toBe(true);
    expect(result.violations).toHaveLength(1);

    const message = designLanguageMessages(result)[0] ?? "";

    expect(message).toContain("english prose fingerprint changed");
    expect(message).toContain("docs/plans/PLAN-X.md:3:english-heading");
  });

  it("U-DESLANG-014: single-gate doctor execution matches the shared design-language check", () => {
    const gate = spawnSync(
      "npx",
      ["--no-install", "tsx", "src/cli.ts", "doctor", "--gate", "design-language", "--json"],
      { cwd: process.cwd(), encoding: "utf8" },
    );

    expect(gate.status).not.toBeNull();

    const parsed = JSON.parse(gate.stdout) as { ok: boolean; gate: string; messages: string[] };
    const shared = checkDesignLanguage(process.cwd());

    expect(parsed.gate).toBe("design-language");
    expect(parsed.ok).toBe(shared.ok);
    expect(parsed.messages).toEqual(shared.messages);
    expect(gate.status).toBe(shared.ok ? 0 : 1);

    // 実 repo は violation 0 のため、違反経路でも判定が一致することを fixture で固定する。
    const root = mkdtempSync(join(tmpdir(), "helix-doctor-gate-"));
    try {
      mkdirSync(join(root, "docs", "design"), { recursive: true });
      writeFileSync(
        join(root, "docs", "design", "bad.md"),
        "# タイトル\n\n## Current Recovery V-pair oracle\n",
        "utf8",
      );

      const violating = checkDesignLanguage(root);

      expect(violating.ok).toBe(false);
      expect(violating.messages[0]).toContain("docs/design/bad.md:3:english-heading");
      expect(runDoctorGate("design-language", root)).toEqual({
        ok: violating.ok,
        gate: "design-language",
        messages: violating.messages,
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }

    expect(runDoctorGate("nope", process.cwd()).ok).toBe(false);
  });

  it("U-DESLANG-015: the design-language gate runs in preflight before the full regression shards", () => {
    const workflow = readFileSync(
      join(process.cwd(), ".github/workflows/harness-check.yml"),
      "utf8",
    );
    const preflightStart = workflow.indexOf("\n  full-regression-preflight:");
    const preflightEnd = workflow.indexOf("\n  full-regression-bulk", preflightStart);

    expect(preflightStart).toBeGreaterThan(-1);
    expect(preflightEnd).toBeGreaterThan(preflightStart);

    const preflight = workflow.slice(preflightStart, preflightEnd);
    const gateIndex = preflight.indexOf("doctor --gate design-language");
    const guardIndex = preflight.indexOf("npm run test:repo-guards");

    expect(gateIndex).toBeGreaterThan(-1);
    expect(guardIndex).toBeGreaterThan(-1);
    expect(gateIndex).toBeLessThan(guardIndex);
  });

  it("U-DESLANG-017: --gate は scope 検証の後に評価され、profile / setup-smoke / toolchain との併用を fail-close する", () => {
    const run = (args: string[]) =>
      spawnSync("npx", ["--no-install", "tsx", "src/cli.ts", "doctor", ...args, "--json"], {
        cwd: process.cwd(),
        encoding: "utf8",
      });

    const badScope = run(["--gate", "design-language", "--scope", "invalid"]);
    expect(badScope.status).toBe(1);
    expect(badScope.stdout).toContain("unknown scope invalid");
    expect(badScope.stdout).not.toContain('"gate"');

    for (const extra of [
      ["--profile", "consumer"],
      ["--profile", "invalid"],
      ["--setup-smoke"],
      ["--scope", "toolchain"],
    ]) {
      const combined = run(["--gate", "design-language", ...extra]);
      expect(combined.status, extra.join(" ")).toBe(1);
      const parsed = JSON.parse(combined.stdout) as {
        ok: boolean;
        gate: string;
        messages: string[];
      };
      expect(parsed.ok).toBe(false);
      expect(parsed.gate).toBe("design-language");
      expect(parsed.messages[0]).toContain("cannot be combined");
    }
  });

  it("U-DESLANG-016: prototype 継承 property 名を gate id にしても unknown gate として fail-close する", () => {
    for (const gate of ["toString", "constructor", "__proto__", "hasOwnProperty"]) {
      const result = runDoctorGate(gate, process.cwd());
      expect(result.ok, gate).toBe(false);
      expect(result.gate).toBe(gate);
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toContain(`unknown gate ${gate}`);
      expect(result.messages[0]).toContain("design-language");
    }
  });
});
