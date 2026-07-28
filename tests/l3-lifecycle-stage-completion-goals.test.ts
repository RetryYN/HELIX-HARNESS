import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const requirementPath = "docs/design/helix/L3-requirements/lifecycle-stage-completion-goals.md";
const acceptancePath = "docs/test-design/helix/lifecycle-stage-completion-goals-acceptance.md";
const planPath = "docs/plans/PLAN-L3-47-lifecycle-stage-completion-goals.md";

const requirement = readFileSync(requirementPath, "utf8");
const acceptance = readFileSync(acceptancePath, "utf8");
const plan = readFileSync(planPath, "utf8");

describe("L3/L10 lifecycle-stage completion authority", () => {
  it("STAGE-GOAL-U-001: fixes one behavior and exactly seven stage goals", () => {
    expect([...requirement.matchAll(/^### (STAGE-GOAL-FR-\d{3}) /gm)].map((row) => row[1])).toEqual(
      ["STAGE-GOAL-FR-001"],
    );
    expect([...requirement.matchAll(/^#### (STAGE-GOAL-R-\d{2}) /gm)].map((row) => row[1])).toEqual(
      Array.from({ length: 7 }, (_, index) => `STAGE-GOAL-R-${String(index + 1).padStart(2, "0")}`),
    );
    expect(plan).toContain("behavior_contract_id: STAGE-GOAL-FR-001");
    expect(plan).toContain("responsibility_owner: lifecycle-stage-completion-authority");
  });

  it("STAGE-GOAL-U-002: binds the exact stage-exit receipt fields", () => {
    const match = requirement.match(/stage_exit_contract:\n((?: {2}- [a-z_]+\n)+)/);
    expect(match).not.toBeNull();
    expect([...(match?.[1] ?? "").matchAll(/ {2}- ([a-z_]+)/g)].map((row) => row[1])).toEqual([
      "stage_goal_id",
      "canonical_layer",
      "paired_layer",
      "development_style",
      "case_driven_model",
      "specialist_processes",
      "exact_scope",
      "responsibility_owner",
      "required_outputs",
      "positive_oracles",
      "negative_oracles",
      "unresolved_items",
      "candidate_head",
      "evidence_digest",
      "independent_review_receipt",
      "exit_decision",
    ]);
  });

  it("STAGE-GOAL-U-003: binds all current L1-L12 pairs and no current L14 goal", () => {
    for (const pair of ["L1 企画", "L2 要求", "L3 要件", "L4 基本設計", "L5 詳細設計", "L6 実装"]) {
      expect(requirement).toContain(pair);
    }
    for (const pair of [
      "L12 運用テスト",
      "L11 受入テスト",
      "L10 総合テスト",
      "L9 結合テスト",
      "L8 単体テスト",
      "L7 テスト実装",
    ]) {
      expect(requirement).toContain(pair);
    }
    expect(requirement).toContain("cutover指示書§5が隔離したcompatibility layer scheme");
    expect(requirement).toContain("current authorityはL1〜L12と正規6 pairだけ");
    expect(requirement).not.toMatch(/current authority.{0,30}L14/u);
  });

  it("STAGE-GOAL-U-004: keeps style, case-driven, and specialist axes separate", () => {
    expect(requirement).toContain(
      "V-model、Production Scrum、V設計＋Scrum実装Hybridは同列のdevelopment style",
    );
    expect(requirement).toContain("Discovery／PoC等のcase-driven model");
    expect(requirement).toContain("Design HARNESS等のspecialist process");
    expect(requirement).toContain("どのstyleも\n本書の工程ゴールを省略しない");
    expect(acceptance).toContain(
      "Discovery／PoCまたはDesign HARNESSの成果を入力しても、選択済みstyleの正規pair receiptなしに完了しない",
    );
  });

  it("STAGE-GOAL-U-005: covers every stage with paired positive and negative acceptance", () => {
    const acceptanceIds = [...acceptance.matchAll(/\| `(STAGE-GOAL-AC-\d{3})` \|/g)].map(
      (row) => row[1],
    );
    expect(acceptanceIds).toEqual(
      Array.from(
        { length: 14 },
        (_, index) => `STAGE-GOAL-AC-${String(index + 1).padStart(3, "0")}`,
      ),
    );
    for (let index = 1; index <= 7; index += 1) {
      const id = `STAGE-GOAL-R-${String(index).padStart(2, "0")}`;
      expect(acceptance.match(new RegExp(`\\| \`${id}\` \\|`, "g"))).toHaveLength(2);
    }
  });

  it("STAGE-GOAL-U-006: rejects weak completion evidence and hidden unresolved work", () => {
    expect(requirement).toMatch(
      /成果物の存在、\nGitHubの表示だけを完了authorityにしない。/,
    );
    for (const forbiddenCompletion of [
      "stale HEAD",
      "片側oracle",
      "未解決隠蔽",
      "別branchの証拠",
      "現PRへ無限逆流",
    ]) {
      expect(`${requirement}\n${acceptance}`).toContain(forbiddenCompletion);
    }
    expect(requirement).toContain(
      "`unresolved_items`は空集合、後続工程へ送るtyped carry、\nまたは理由・owner・期限・再入場条件を持つ明示defer",
    );
  });

  it("STAGE-GOAL-U-007: limits old definitions to compatibility input", () => {
    expect(acceptance).toContain(
      "cutover指示書§5のcompatibility layer scheme、`PRODUCTION_SCRUM_REDUCED_V`、旧drive値をcurrent output",
    );
    expect(requirement).toContain("旧定義の成功でcurrent\ncanonical failureを相殺しない");
    expect(plan).toContain(
      "current authorityへ戻さず、L4以降の設計／実装／実行完了を先取りしない",
    );
  });
});
