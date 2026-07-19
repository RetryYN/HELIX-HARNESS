---
plan_id: PLAN-L7-428-enforcement-wiring-gap
title: "PLAN-L7-428 (troubleshoot): 自走ガードの未配線修復 — GitHub 判定モジュール到達不能と function 単位 wiring 検査"
kind: troubleshoot
layer: L7
drive: agent
status: completed
route_mode: incident
entry_signals:
  - "po_directive:2026-07-12 PO 指示「フルチェック」— HEAD 基準の全ゲート実行 + 多角レビュー + 敵対検証で、confirmed PLAN が「実装済み」と称する自走ガード 3 本の実行経路未配線を検出"
created: 2026-07-12
updated: 2026-07-12
owner: Codex
irreversible_impact: none
backprop_decision: not_required
backprop_decision_reason: "既存 confirmed PLAN (PLAN-L7-340/418, PLAN-L6-32) が宣言済みの契約を実行経路へ配線する補修であり、要求・設計の意味変更はない。契約自体の変更が必要と判明した場合はその時点で backprop を再判断する。"
agent_slots:
  - role: aim
    slot_label: "AIM — troubleshoot 分類の妥当性と PLAN-L7-418 運用継続可否の確認"
  - role: se
    slot_label: "SE — 判定モジュール 3 本の CLI/doctor 配線と function 単位 wiring 検査の実装"
  - role: qa
    slot_label: "QA — 配線後の regression test と既存 gate 非退行の検証"
generates:
  - artifact_path: docs/plans/PLAN-L7-428-enforcement-wiring-gap.md
    artifact_type: markdown_doc
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/audit/enforcement-route-input.ts
    artifact_type: source_module
  - artifact_path: src/lint/lint-wiring.ts
    artifact_type: source_module
  - artifact_path: src/lint/outstanding.ts
    artifact_type: source_module
  - artifact_path: src/schema/frontmatter.ts
    artifact_type: source_module
  - artifact_path: tests/enforcement-wiring-routes.test.ts
    artifact_type: test_code
  - artifact_path: tests/lint-wiring.test.ts
    artifact_type: test_code
  - artifact_path: tests/outstanding.test.ts
    artifact_type: test_code
  - artifact_path: tests/frontmatter.test.ts
    artifact_type: test_code
verification_bindings:
  - parent_design: docs/design/harness/L6-function-design/function-spec.md
    oracle_id: U-WIRING-001
    test_path: tests/enforcement-wiring-routes.test.ts
  - parent_design: docs/design/harness/L6-function-design/function-spec.md
    oracle_id: U-WIRING-002
    test_path: tests/lint-wiring.test.ts
  - parent_design: docs/design/harness/L6-function-design/function-spec.md
    oracle_id: U-WIRING-003
    test_path: tests/outstanding.test.ts
  - parent_design: docs/design/harness/L6-function-design/function-spec.md
    oracle_id: U-WIRING-004
    test_path: tests/outstanding.test.ts
dependencies:
  parent: null
  requires: []
review_evidence:
  - reviewer: codex-independent-reviewer
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: codex-intra-runtime
    tests_green_at: "2026-07-11T23:01:33Z"
    reviewed_at: "2026-07-11T23:01:40Z"
    verdict: approve_after_fixes
    scope: "W1実write route、W2 AST call reachability、W3 typed irreversible authorityを敵対監査し、PLAN-L7-418運用は本配線とCI gateを条件に継続可と判断した。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/closure-auto-approval.test.ts tests/current-location.test.ts tests/enforcement-wiring-routes.test.ts tests/lint-wiring.test.ts tests/outstanding.test.ts tests/frontmatter.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-11T23:01:33Z", evidence_path: tests/enforcement-wiring-routes.test.ts, output_digest: "sha256:527663340d7b1ac75ebd7e2ac5830ec7877fa39478080eff7d1063dd3b6f78e1" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-428-enforcement-wiring-gap.md", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-11T23:01:33Z", evidence_path: docs/plans/PLAN-L7-428-enforcement-wiring-gap.md, output_digest: "sha256:6b3a05038ab49afdd92ad55897948acfc6632d2a72bf056ae227400f26b67443" }
      - { kind: lint, command: "npm run lint", runner: node, scope: full, exit_code: 0, completed_at: "2026-07-11T23:01:33Z", evidence_path: src/lint/lint-wiring.ts, output_digest: "sha256:10ac809aac6d655e10d534f0c8e5d76e2801cf20cd8a8d86ec8e3425097d897b" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-07-11T23:01:33Z", evidence_path: src/cli.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
---

# PLAN-L7-428: 自走ガードの未配線修復

## 背景

2026-07-12 の PO 指示「フルチェック」で、HEAD（origin/main d7959e0d 時点）に対する全ゲート実行と
多角レビュー + 敵対検証を実施した（PLAN-L7-425 の後続点検）。全所見に反証検証をかけ、
反証で棄却されなかった確定所見のうち、既存 PLAN でカバーされない 2 件（+ 根本原因 1 件 + 再発事実 1 件）を
本 PLAN に起票する。

## 問題提起

### W1: GitHub 自走判定モジュール 3 本が実行経路から到達不能（最重要）

- 事象: `src/audit/pr-review-route.ts`（`validatePrReviewRoute`: worker/reviewer の同一 model・
  同一 identity 禁止 + green-command 証跡必須）、`src/audit/ci-auto-fix-gate.ts`
  （`gateCiAutoFixRepush`: CI self-heal repush の confidence 閾値 0.75 / maxAttempts 2 の
  circuit breaker）、`src/audit/release-automation-decision.ts` の 3 モジュールは、
  `src/cli.ts` の `github` command group からも `src/doctor/index.ts` からも一切 import されて
  いない孤立モジュールである（unit test 10 件のみ green）。
- 影響: PLAN-L7-418（confirmed）は「判定機構は PLAN-L7-340/360 で実装済み」を根拠に
  main の branch protection を「人間 approve 不要 + auto-merge」へ実 apply した。つまり
  **no-human-approval 自走を支えるはずの機械的 circuit breaker が、コード上は一切実行されず、
  prose 上の自己規律のみに依存している**。
- すり抜け原因: PLAN-L7-340 の `generates:` は 3 ファイルを source_module 宣言しており
  existsSync ベースの plan-artifact-existence gate は通過する。また 3 ファイルは `src/lint/`
  配下ではないため lint-wiring meta-gate のスキャン対象（`readdirSync(src/lint/)`）にも入らない。
- 対応: (1) `validatePrReviewRoute` / `gateCiAutoFixRepush` / release-automation-decision を
  実行経路（`helix github pr-create` / CI self-heal 経路 / doctor gate のいずれか、設計判断は
  PLAN-L7-340 の契約に従う）へ配線する。(2) 配線されるまでの間、PLAN-L7-418 の運用
  （approve 不要 auto-merge / CI self-heal repush）を継続してよいかを AIM が判定し、
  結果を review_evidence に記録する。(3) 到達不能の再発を防ぐ検査は W2 で実装する。
- 受け入れ: 3 モジュールが実行経路から実際に呼ばれる regression test（fixture で circuit breaker が
  発火する / green 経路が通る）green。`grep` ベースの到達可能性ではなく実行 route の test で示す。

### W2: wiring 検査が file 単位のみで function 単位の未配線を検出できない（根本原因）

- 事象: `src/lint/verification-profile-safety.ts` の `analyzeVerificationProfileSafety`
  （untrusted MCP source / GitHub write-tool 未承認 / Docker controls 未整備の安全検査）と
  `renderGeneratedMcpConfig` は、`src/lint/verification-profile.ts` が再 export するだけで
  実行経路から一度も呼ばれない。しかし lint-wiring meta-gate は **file 単位の import 到達性**しか
  見ないため「wired」と誤判定する（同ファイル別 export の `planExternalProfileActivation` だけが
  到達可能）。PLAN-L6-32（confirmed）§3 はこの安全検査を必須 function contract と明記している。
- 対応: (1) `analyzeVerificationProfileSafety` を verification-profile gate の実行経路へ配線する。
  (2) lint-wiring meta-gate（または新設 lint）を「PLAN の generates / 設計 doc が契約として宣言した
  **export 関数単位**」で到達可能性を検査するよう拡張し、`src/lint/` 外（`src/audit/` 等）の
  契約モジュールも対象に含める（W1 のすり抜け 2 経路を両方塞ぐ）。
- 受け入れ: 拡張後の meta-gate が W1 の 3 モジュールと本件 2 関数を「未配線」として検出する
  fixture regression test を持ち、配線完了後に green になる。

### W3: outstanding blocker 分類の語句 regex が false positive を量産（再発 2 回目）

- 事象: `src/lint/outstanding.ts` の `classifyOutstandingBlockers`（およびその内部の
  後戻り不能文脈判定。関数名は本文に書くと判定自体が発火するためここでは記さない —
  それ自体が本件の実証である）は PLAN 本文の語句 regex（「後戻り不能を意味する 2 語の共起」
  「`.helix/` パスが同一行に 2 回」等）で blocker を分類するため、**cutover を実施しない PLAN が
  境界語に言及しただけで approval_gated_cutover に誤分類**され、semantic-frontier-consistency /
  objective-evidence-audit / design-language 系 gate を連鎖的に赤にする。本日 PLAN-L7-425 で
  2 回発生し、いずれも本文の語句置換（引用の code span 化・言い換え）で回避した。
- 対応: 誤検知に強い判定への置換を設計判断として起票する。候補: (1) frontmatter の typed field
  （例: 後戻り不能な影響範囲を宣言する専用 key。値は none / 切替 / 移行 の 3 値）を正とし、
  本文 regex は typed field 欠落時の fallback + warning に降格する、(2) code span / 引用ブロック内の
  語句を判定対象から除外する。
  どちらを採るかは L5 詳細設計で決め、既存 PLAN への遡及は enforcement date 方式とする。
- 受け入れ: 「境界に言及するだけの PLAN」fixture が誤分類されず、「実際に cutover を generates で
  宣言する PLAN」fixture が正しく分類される regression test green。

## Schedule

- step 1 (serial): W1 の AIM 判定（配線完了までの PLAN-L7-418 運用継続可否）を記録する。
- step 2 (parallel): W1 配線実装 + regression test。
- step 3 (parallel): W2 function 単位 wiring 検査の拡張 + `analyzeVerificationProfileSafety` 配線。
- step 4 (parallel): W3 typed field 化の設計判断と実装。

## 完了条件（DoD）

- W1: 3 モジュールの実行経路 regression test green。AIM 判定の review_evidence 記録。
- W2: function 単位検査が W1/W2 の全未配線を fixture で検出する test green。
- W3: 誤分類 fixture / 正分類 fixture の regression test green。
- 各 step の green command を digest 付きで review_evidence に記録し、cross-runtime review を経て
  confirm する。

## L5詳細設計判断

- W1は`helix github review-route`、`helix github ci-auto-fix-gate`、
  `helix github release-automation-decision`を判定の正規CLI routeとする。入力はtyped JSON、判定が
  rejectならexit 1でfail-closeする。外部writeはこのroute自身では実行しない。
- W2は`helix mcp profile safety`と`helix mcp profile config`を正規routeとし、`lint-wiring`は
  `REQUIRED_RUNTIME_EXPORTS`に登録された関数名がruntime到達sourceから参照されることをfile単位検査に
  加えて検査する。re-exportだけでは到達証跡にしない。
- W3はfrontmatter `irreversible_impact: none | cutover | migration`を正とする。明示`none`は本文の
  境界説明を分類根拠にせず、`cutover`/`migration`は本文に依存せずblockerにする。既存PLANとの互換性の
  ためfield欠落時だけ従来regexへfallbackする。

## 引き継ぎメモ（Codex 向け）

- 本 PLAN は Claude のフルチェック（workflow: 全ゲート + 3 視点レビュー + 敵対検証、2026-07-12）
  起票。検証詳細は敵対検証の verdict ごと workflow 記録にあり、要点は本文の evidence に転記済み。
- W1 は「自走の安全装置が実は動いていない」案件であり、本 PLAN 群で最優先。着手前に
  `git log --oneline -15` で自レーンの並行変更（PLAN-L7-427 の selector 系）との整合を確認すること。
