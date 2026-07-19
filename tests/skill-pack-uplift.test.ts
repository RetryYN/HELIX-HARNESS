import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { analyzeDesignLanguage, loadDesignLanguageDocs } from "../src/lint/design-language";
import {
  analyzeJudgmentCoreCoverage,
  loadJudgmentCoreCoverageInput,
} from "../src/lint/judgment-core-coverage";
import { analyzeSkillAssignments, loadSkillAssignmentDocs } from "../src/lint/skill-assignment";

const repoRoot = join(import.meta.dirname, "..");

const skill = (name: string): string =>
  readFileSync(join(repoRoot, "docs", "skills", `${name}.md`), "utf8");

/**
 * PLAN-L7-419 skill pack 判断力アップリフトの regression fence。
 * 新規 5 pack の存在と routing frontmatter、brush-up 済み pack の中核判断フレーム anchor、
 * judgment-core v2 と全 marker の同期を real-repo で検査する (prose claim の機械的代替)。
 */
describe("skill pack uplift (PLAN-L7-419)", () => {
  const newPacks = [
    "test-thinking",
    "code-minimalism",
    "design-tailoring",
    "acceptance-criteria-thinking",
    "skill-authoring",
  ];

  it("U-SKUP-001: registers the five new packs with valid skill.v1 routing frontmatter", () => {
    const docs = loadSkillAssignmentDocs(repoRoot);
    for (const name of newPacks) {
      const doc = docs.find((d) => d.path === `docs/skills/${name}.md`);
      expect(doc, `docs/skills/${name}.md が catalog に存在する`).toBeDefined();
      expect(doc?.metadata.name).toBe(name);
    }
    const result = analyzeSkillAssignments(docs);
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it("U-SKUP-002: lists every new pack in the SKILL_MAP trigger table", () => {
    const map = skill("SKILL_MAP");
    for (const name of newPacks) {
      expect(map, `SKILL_MAP trigger table に ${name} 行がある`).toContain(name);
    }
  });

  it("U-SKUP-003: carries the core judgment frames in the new packs", () => {
    expect(skill("test-thinking")).toContain("壊れ方");
    expect(skill("test-thinking")).toContain("いつ止めるか");
    expect(skill("code-minimalism")).toContain("7 段の問い");
    expect(skill("design-tailoring")).toContain("記録先");
    expect(skill("acceptance-criteria-thinking")).toContain("1 AC = 1 判定");
    expect(skill("skill-authoring")).toContain("自由度");
  });

  it("U-SKUP-004: keeps the adversarial attacker/defender contract in adversarial-review", () => {
    const pack = skill("adversarial-review");
    expect(pack).toContain("攻撃者の規約");
    expect(pack).toContain("防御者の規約");
    expect(pack).toContain("no_attack");
    expect(pack).toContain("PASS-WEAK");
  });

  it("U-SKUP-005: keeps the nine-state matrix in browser-testing-and-screen-verification", () => {
    const pack = skill("browser-testing-and-screen-verification");
    expect(pack).toContain("9 状態マトリクス");
    expect(pack).toContain("報告の型");
  });

  it("U-SKUP-006: syncs judgment-core v2 across all agent and command markers", () => {
    const input = loadJudgmentCoreCoverageInput(repoRoot);
    expect(input.ssotVersion).toBe(2);
    const result = analyzeJudgmentCoreCoverage(input);
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });

  const touchedPacks = [
    ...newPacks,
    "adversarial-review",
    "browser-testing-and-screen-verification",
    "planning-and-task-breakdown",
    "testing",
    "judgment-core",
    "estimation",
  ];

  it("U-SKUP-007: references only real helix subcommands in touched packs", () => {
    const helpFor = (args: string[]): string =>
      execFileSync("npx", ["--no-install", "tsx", "src/cli.ts", ...args, "--help"], {
        cwd: repoRoot,
        encoding: "utf8",
      });
    const commandsIn = (help: string): Set<string> => {
      const idx = help.indexOf("Commands:");
      if (idx < 0) return new Set();
      return new Set([...help.slice(idx).matchAll(/^ {2}([a-z][a-z0-9-]*)/gm)].map((m) => m[1]));
    };
    const topLevel = commandsIn(helpFor([]));
    expect(topLevel.size).toBeGreaterThan(20);
    const subCache = new Map<string, Set<string>>();
    const subCommandsOf = (cmd: string): Set<string> => {
      const cached = subCache.get(cmd);
      if (cached) return cached;
      const subs = commandsIn(helpFor([cmd]));
      subCache.set(cmd, subs);
      return subs;
    };
    for (const name of touchedPacks) {
      const body = skill(name);
      for (const match of body.matchAll(/helix ([a-z][a-z0-9-]*)(?: ([a-z][a-z0-9-]*))?/g)) {
        const [, cmd, sub] = match;
        expect(topLevel.has(cmd), `${name}: \`helix ${cmd}\` は実在する subcommand`).toBe(true);
        if (sub) {
          const subs = subCommandsOf(cmd);
          // 第 2 語が subcommand なら実在必須。subcommand を持たない command への第 2 語は
          // 引数 (例: helix gate <id>) として許容する。
          if (subs.size > 0) {
            expect(subs.has(sub), `${name}: \`helix ${cmd} ${sub}\` は実在する第 2 階層`).toBe(
              true,
            );
          }
        }
      }
    }
  });

  it("U-SKUP-008: keeps the japanese-prose gate green over the packs this PLAN touched (design-language)", () => {
    // repo 全体の debt は doctor の design-language gate が正本。ここでは本 PLAN の
    // touched files に英語 prose debt が無いことだけを fail-close で固定する。
    const touchedPaths = new Set([
      ...touchedPacks.map((name) => `docs/skills/${name}.md`),
      "docs/skills/SKILL_MAP.md",
      "docs/plans/PLAN-L7-419-skill-mythos-uplift.md",
    ]);
    const result = analyzeDesignLanguage(loadDesignLanguageDocs(repoRoot));
    const mine = result.violations.filter((v) => touchedPaths.has(v.path));
    expect(mine).toEqual([]);
    // .claude/commands/*.md は design-language loader の対象外のため、同じ英語 prose
    // ヒューリスティック (baseline 0) を command 本文へ直接適用して fail-close にする。
    const commandsDir = join(repoRoot, ".claude", "commands");
    const commandDocs = readdirSync(commandsDir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => ({
        path: `.claude/commands/${f}`,
        text: readFileSync(join(commandsDir, f), "utf8"),
      }));
    const commandResult = analyzeDesignLanguage(commandDocs, { baselineViolations: 0 });
    expect(commandResult.violations).toEqual([]);
    // 行単位ヒューリスティックは「日本語 1 字を英文へ混ぜる」改変で回避できる (敵対検証
    // round 4 の反例)。file 単位の日本語/英語 文字数比 (現行 1.35-1.84) を閾値 1.0 で
    // 固定し、英語主体化への置換を構造的に fail-close にする。
    // 閾値 1.3 は現行実測 (1.35-1.84) の直下。局所編集の相殺余地を最小化する。
    // 日本語混在 1 行の英語主体化は検出器の責務外の受入済み残余リスク
    // (PLAN-L7-419 §4「残余リスク受入」、advisor-fable 諮問 2026-07-11)。
    for (const doc of commandDocs) {
      const japanese = (doc.text.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      const english = (doc.text.match(/[A-Za-z]{2,}/g) ?? []).length;
      expect(
        japanese >= english * 1.3,
        `${doc.path}: 日本語/英語 比 (${(japanese / english).toFixed(2)}) が 1.3 を下回った — 英語主体 prose 化の疑い`,
      ).toBe(true);
    }
    // 追補の導線 anchor (test-thinking への接続) も固定する。
    const testCommand = readFileSync(join(commandsDir, "test.md"), "utf8");
    expect(testCommand).toContain("test-thinking");
    expect(testCommand).toContain("壊れ方");
  });

  it("U-SKUP-009: carries license attribution for external sources (CC-BY citation)", () => {
    const pack = skill("skill-authoring");
    expect(pack).toContain("CC-BY 3.0");
    expect(pack).toContain("https://github.com/google/eng-practices");
    expect(skill("judgment-core")).toContain("CC-BY 3.0");
  });

  it("U-SKUP-010: gives adversarial FLAG priority over self-consistency majority voting", () => {
    expect(skill("skill-authoring")).toContain(
      "多数決は敵対検証（adversarial-review）の verdict を上書きしない",
    );
    expect(skill("adversarial-review")).toContain("FLAG");
  });

  it("U-SKUP-011: keeps the vertical-slice and progressive-elaboration substance in brushed packs", () => {
    const planning = skill("planning-and-task-breakdown");
    expect(planning).toContain("縦割り（垂直スライス）");
    expect(planning).toContain("前倒しで作り込まない");
    const testing = skill("testing");
    expect(testing).toContain("オラクルの出所");
    expect(testing).toContain("test-thinking");
  });
});
