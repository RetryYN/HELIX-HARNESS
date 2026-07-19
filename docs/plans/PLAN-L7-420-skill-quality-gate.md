---
plan_id: PLAN-L7-420-skill-quality-gate
title: "PLAN-L7-420 (impl): skill generator 品質化 + skill-quality gate — 重複と低品質 pack の取込を fail-close で防ぐ (FR-L1-47 / FR-L1-12)"
kind: impl
layer: L7
drive: agent
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
status: confirmed
route_mode: forward
entry_signals:
  - "po_directive:2026-07-11 PO 指示「skill ジェネレータ & skill ゲートも強化できる？skill を品質高く作るのと既存の重複をガードして低品質を取り込まないみたいな」(PLAN-L7-419 の後続)"
backprop_decision: not_required
backprop_decision_reason: "FR-L1-47 (skill pack curate) の機械強制の追加であり要求・設計の意味変更はない。PLAN-L7-70 が手作業で一掃した generic stub / 重複 pack の再流入を、生成側 (scaffold) と取込側 (doctor gate) の両面で fail-close にする既定路線内の強化。"
created: 2026-07-11
updated: 2026-07-11
owner: Claude
agent_slots:
  - role: tl
    slot_label: "TL — skill-quality lint 設計 (閾値の実測根拠) と scaffold 品質 skeleton"
generates:
  - artifact_path: docs/plans/PLAN-L7-420-skill-quality-gate.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/skill-quality.ts
    artifact_type: source_module
  - artifact_path: src/skill-engine/scaffold.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/skill-quality.test.ts
    artifact_type: test_code
  - artifact_path: tests/skill-scaffold.test.ts
    artifact_type: test_code
  - artifact_path: tests/skill-scaffold-cli.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L8-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L5-06-skill.md
  requires:
    - docs/plans/PLAN-L7-419-skill-mythos-uplift.md
    - docs/plans/PLAN-L7-317-skill-scaffold-generator.md
    - docs/plans/PLAN-L7-70-skill-pack-curation.md
review_evidence:
  - reviewer: codex-independent-reviewer
    review_kind: cross_agent
    reviewed_at: "2026-07-11T21:38:43+09:00"
    tests_green_at: "2026-07-11T21:38:43+09:00"
    verdict: approve_after_fixes
    scope: "severity-first 独立レビュー。L6 契約、L8 U-SKQUAL-001..006、lint/scaffold/CLI/doctor 配線を突合した。High 1 件（PLAN が要求する SKILL_MAP 登録と未記入時 doctor red の案内が CLI 操作結果に無い）を修正し、JSON/text 双方の oracle を追加。重複・境界値・近似本文・catalog 双方向同期・real-repo gate に未解消 blocker なし。"
    worker_model: claude-fable-5
    reviewer_model: gpt-5.6
    green_commands:
      - kind: unit_test
        command: "bun test tests/skill-quality.test.ts tests/skill-scaffold.test.ts tests/skill-scaffold-cli.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T21:38:43+09:00"
        evidence_path: tests/skill-quality.test.ts
        output_digest: "sha256:9091d36e22a565e720dc624e43d02e34ed3d0d4766a13326304b1a97471e510c"
      - kind: typecheck
        command: "bunx tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-11T21:38:43+09:00"
        evidence_path: tests/skill-scaffold-cli.test.ts
        output_digest: "sha256:252ac659312b2a437e8f82ec017f7e4c883819865ea0fdf69c959b84c7615287"
related_l0: docs/governance/helix-harness-concept_v3.1.md
related_l0_extra: docs/design/harness/L1-requirements/functional-requirements.md
---

# PLAN-L7-420 (impl): skill generator 品質化 + skill-quality gate

## 0. 目的

PLAN-L7-70 は 47 pack の generic stub を手作業で一掃したが、再流入を防ぐ機械 gate が無い。
現状の欠落（2026-07-11 実測）:

- **generator**: `helix skill create`（PLAN-L7-317）は「この skill は…初期 scaffold である」
  という generic stub 本文を生成する — L7-70 が一掃した antipattern の再生産装置になっている。
- **gate**: `skill-assignment` は frontmatter enum のみ検査。本文の実質・pack 間重複・
  SKILL_MAP との同期は無検査（低品質 pack も重複 pack も doctor green で取り込める）。

## 1. 範囲

### A. `src/lint/skill-quality.ts`（新規 lint、doctor gate `skill-quality`）

検査（すべて fail-close、閾値は 2026-07-11 の実測に根拠を置く）:

| 検査 | violation kind | 閾値と根拠 |
|---|---|---|
| 重複名 | duplicate-name | frontmatter `name` / file slug の衝突 = 0 件（現行 0。大小文字は正規化して比較） |
| 近似重複本文 | near-duplicate-content | 正規化文字 shingle（16-gram、空白・記号・数字除去）の共有率 shared/min > 0.35。現行最大 0.107（reverse-r2 × reverse-r4）に対し 3 倍の余裕。行単位一致と異なり、改行位置・句読点・見出し番号の変更では回避できない |
| SKILL_MAP 同期 | unregistered-skill / dangling-trigger | 全 pack が trigger table に載る（SKILL_MAP 自身を除く）。table が実在しない pack 名を参照しない |
| 実質下限 | stub-body | frontmatter 除去後の本文 < 1200 字 または `##` 節 < 2。現行最小: 本文 2098 字（reverse-r1）・節 4（reverse-rgc） |
| 未記入 scaffold | unfilled-scaffold | `<!-- 記入:` marker の残存 = 0（scaffold B の穴埋め marker。埋めるまで doctor red） |
| 旧文言 residue | generic-stub | L7-70 が一掃した stub 定型句（「初期 scaffold である」等）の残存 = 0 |

### B. `src/skill-engine/scaffold.ts` の品質 skeleton 化

- 本文 template を skill-authoring pack（PLAN-L7-419）の実証パターン準拠に差し替える:
  §0 態度の先出し / 発火条件 / 視点カタログ or 手順 / 禁止事項（アンチパターン表）/
  証跡・検証の各節に `<!-- 記入: ... -->` 穴埋め marker と書き方ガイドを埋め込む。
  未記入のまま landing すると gate A が fail-close にする（stub の再流入防止）。
- **生成時 重複ガード（inventory-first の機械化）**: 既存 catalog（`docs/skills/`）に対して
  name/slug 衝突と近似名（片方が他方を含む等）を検出し、「新規作成ではなく既存 pack の
  拡張を検討せよ」という finding を返す。`--write` は衝突時に fail する。
- CLI 出力に「SKILL_MAP trigger table への行追加」と「記入完了まで doctor red」の案内を出す。

### C. 配線

- doctor: `checkSkillQuality` を既存 gate 群（skill-assignment の隣）に登録し、
  ok 集約と messages 出力へ追加する。
- tests: `tests/skill-quality.test.ts`（synthetic + real-repo regression の回帰検証）、
  `tests/skill-scaffold.test.ts`（新 template が gate A を「未記入=fail / 記入済=pass」で
  通ることを両方向で検証）。

## 2. 受入条件

- 現行 61 pack（SKILL_MAP 含む catalog）に対して `skill-quality` gate が green
  （閾値が現実に適合していることの実測証明）。
- 変異検査: (a) 既存 pack を複製した近似重複、(b) 1000 字未満の stub、(c) SKILL_MAP 未登録
  pack、(d) 未記入 scaffold の 4 変異がそれぞれ fail する test を持つ。
- `helix skill create` の生成物は、穴埋め記入後に skill-assignment + skill-quality の両 gate を
  pass する（test で機械検証）。
- typecheck / lint / targeted tests / doctor green。cross-runtime review evidence を
  confirmed 前に記録する。

## 3. 敵対検証の経過（cross-runtime、attacker=Codex gpt-5.6）

| round | verdict | 所見と是正 |
|---|---|---|
| 1 | fail (Important 6 / Minor 1) | ①SKILL_MAP 登録検査が全文 substring 一致（api が api-contract で誤登録扱い）→ trigger table 節の Pack 列 token 完全一致に限定。②scaffold の既定 description が禁止句「初期 scaffold である」を生成 → 穴埋め marker 文言へ差し替え（既定経路の e2e test 追加）。③近似重複が行完全一致で改行・句読点変更に脆弱 → 正規化文字 16-gram shingle 共有率へ変更（reflow 変異の検出 test 追加、実測最大 0.107）。④閾値の変異検出網なし → 閾値 pin + 境界値 test（節数 1/2・文字数境界）追加。⑤unregistered-skill の変異 test なし → 追加。⑥近似名ガードが部分文字列を hard block（api/api-contract 型の正当な分離を作成不能）→ hyphen 語境界の包含のみ advisory（ok を落とさない）に変更。⑦(Minor) 重複名の大小文字 → lowercase 正規化 |
| 2 | fail (Important 2) | ①本文長の境界 test が厳密でない（見出し分の加算で 1199/1200 を突けない）→ body.length をちょうど下限 / 下限-1 に固定する fixture へ是正（`<` → `<=` 演算子変異を検出）。②語境界包含の判定が先頭・末尾のみで中間位置（advanced-api-contract-guide ⊃ api-contract）を見逃す → hyphen segment 列の連続部分列判定へ是正 + 中間包含 test 追加。他 5 所見は排除済みと判定 |
| 3 | pass | 新規所見なし。round 2 の 2 所見（本文長境界 fixture の厳密固定 / hyphenSegmentContains の中間位置対応）の排除を確認 |

## 4. 状態

2026-07-11 confirmed。lint、品質 scaffold、生成時 inventory、CLI 操作案内、doctor hard gate、
L6/L8 V ペアを実装し、独立レビューで発見した CLI 案内欠落を是正した。targeted 22 tests と
TypeScript typecheck が green。未解消 blocker はない。
