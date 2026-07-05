import { describe, expect, it } from "vitest";
import { detectTaskLenses, TASK_LENS_HEADER, taskLensBrief } from "../src/runtime/task-lens";

describe("U-TASKLENS: 思考レンズ検出と注入 (PLAN-L7-338)", () => {
  it("U-TASKLENS-001: 日本語 keyword で各レンズを検出する", () => {
    expect(detectTaskLenses("API の設計を見直す")).toContain("design");
    expect(detectTaskLenses("受入条件の検証をする")).toContain("verification");
    expect(detectTaskLenses("回帰テストを足す")).toContain("test-strategy");
    expect(detectTaskLenses("この不具合の原因を調査して修正")).toContain("troubleshooting");
  });

  it("U-TASKLENS-002: 英語 keyword は語境界で判定し部分一致で誤爆しない", () => {
    expect(detectTaskLenses("fix the login bug")).toContain("troubleshooting");
    expect(detectTaskLenses("add test coverage for the parser")).toContain("test-strategy");
    // "designated" / "protest" / "prefix" は design / test / fix に誤爆しない
    expect(detectTaskLenses("update the designated owner list")).toEqual([]);
    expect(detectTaskLenses("record the protest note")).toEqual([]);
    expect(detectTaskLenses("rename the prefix constant")).toEqual([]);
  });

  it("U-TASKLENS-003: 複数レンズは固定順 (design→verification→test-strategy→troubleshooting) で全件返す", () => {
    const lenses = detectTaskLenses("設計を検証し、テストを足してバグを修正する");
    expect(lenses).toEqual(["design", "verification", "test-strategy", "troubleshooting"]);
  });

  it("U-TASKLENS-004: 無 match / 空 task はレンズ 0 でブリーフは空文字列 (注入しない)", () => {
    expect(detectTaskLenses("update docs wording")).toEqual([]);
    expect(detectTaskLenses("")).toEqual([]);
    expect(detectTaskLenses(undefined)).toEqual([]);
    expect(taskLensBrief("update docs wording")).toBe("");
  });

  it("U-TASKLENS-005: 各レンズのブリーフが領域の中核観点と skill pack pointer を含む", () => {
    const design = taskLensBrief("モジュール設計");
    expect(design).toContain(TASK_LENS_HEADER);
    expect(design).toContain("inventory");
    expect(design).toContain("対案");
    expect(design).toContain("docs/skills/design-doc.md");

    const verification = taskLensBrief("実装の検証");
    expect(verification).toContain("falsifiable");
    expect(verification).toContain("oracle");
    expect(verification).toContain("docs/skills/verification.md");

    const test = taskLensBrief("テスト戦略");
    expect(test).toContain("Red→Green→Refactor");
    expect(test).toContain("境界値");
    expect(test).toContain("docs/skills/test-driven-development.md");

    const trouble = taskLensBrief("障害の原因調査");
    expect(trouble).toContain("再現 → 最小化");
    expect(trouble).toContain("再発防止 test");
    expect(trouble).toContain("docs/skills/debugging-and-error-recovery.md");
  });

  it("U-TASKLENS-006: レンズ pointer の skill pack が実 repo に存在する (dead link 防止)", async () => {
    const { existsSync } = await import("node:fs");
    const briefs = [
      taskLensBrief("設計"),
      taskLensBrief("検証"),
      taskLensBrief("テスト"),
      taskLensBrief("バグ調査"),
    ].join("\n");
    const paths = [...briefs.matchAll(/docs\/skills\/[a-z-]+\.md/g)].map((m) => m[0]);
    expect(paths.length).toBeGreaterThan(0);
    for (const path of new Set(paths)) {
      expect(existsSync(path), `${path} が存在しない`).toBe(true);
    }
  });
});
