# A-140 — IMP-083 unit-oracle-substance cross_agent レビュー (2026-06-19)

- review_kind: `cross_agent` / worker: Claude (claude-opus-4-8) / reviewer: Codex QA (gpt-5.5) による確認
- via `helix codex --role qa --task-file .helix/codex-tasks/imp083-unit-oracle-substance-review.md --execute`
- **初回 verdict=fail → 全指摘 remediate → 再検証 green**:
  - **Critical (regex 多セグメント取りこぼし)**: `U-[A-Z0-9]+-[0-9]+` を `U-[A-Z0-9-]+-[0-9]+` へ拡張
    (`U-FR-L1-21-01` / `U-DBPROJ-ATOMIC-01` 等を捕捉、targeted 239→248)。
  - **Important (SSoT 未登録)**: `unit-oracle-substance` を `REQUIRED_RULE_IDS` + SSoT
    `docs/governance/ddd-tdd-rules.md` + test baseInputs policy へ登録 (rule contract 化)。
  - **Minor (inline `|` 誤分割)**: substance を最終セル → `cells.slice(2).join(" ")` (ID+target 除く残り連結) へ。
- 再検証: 実 repo 248 U-* 行 violations 0、ddd-tdd-rules 11 tests + doctor EXIT=0 green。

---

## 初回 verdict 全文 (remediate 前)

**Verdict: fail**

**Critical**
- `^\|\s*U-[A-Z0-9]+-[0-9]+\s*\|` は "末尾 numeric ID を持つ U-* row" としては狭すぎる。
  numeric suffix 前の name segment を 1 つしか match しないため、valid multi-segment IDs が skip される。
  より広い pattern では numeric-suffix U rows が 247 件存在するが、検査対象は 239 件のみ。
  見落とし: `U-FR-L1-21-01`, `U-FR-L1-36`, `U-DBPROJ-ATOMIC-01`, `U-CHGIMPACT-NONGIT-01`。
  stated residual に対する direct false-negative。

**Important**
- new hard rule が `REQUIRED_RULE_IDS` または DDD/TDD Rules SSoT に登録されていない。analyzer policy は
  SSoT rule drift を明示的に検査するため、`unit-oracle-substance` は宣言済み DDD/TDD rule contract の外側にある
  active rule になっている。"No new canonical FR" は問題ないが、この rule は既存の
  FR-L1-50 / DDD-TDD rule surface 配下に表現される必要がある。

**Minor**
- `line.split("|")` は Markdown table aware ではなく、inline `|` が cell count を膨らませる。現在の row は
  final fragment が長いため green のままだが、inline pipe 付近で終わる valid expected behavior は
  false-positive になり得る。現時点の blocker ではなく risk。

依頼された論点について: final-column-as-expected は現在の L7 shape では許容できるが brittle。
L7-only scope は defensible。`<6` + skeleton marker threshold は minimal hard guard として妥当。
`integration-gwt` との overlap は低い (L8 GWT と L7 unit oracle substance は別物)。

検証実行: `bun test tests/ddd-tdd-rules.test.ts` は passed。`doctor` は `ddd-tdd-rules - OK` を報告。
