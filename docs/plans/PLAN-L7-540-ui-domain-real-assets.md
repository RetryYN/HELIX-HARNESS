---
plan_id: PLAN-L7-540-ui-domain-real-assets
title: "PLAN-L7-540 (add-impl): UI Domain 実 asset 正本と doctor 実 gate 配線で SA-UDP-02/03 を着地する（U-UDP-008/009）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-10 進めて（#177 全 slice 着地後、#209 残 L9 のうちチェーン非依存の SA-UDP-02/03 へ）"
created: 2026-08-10
updated: 2026-08-10
owner: Claude / TL
github_issue_id: 209
engineering_discipline_required: true
behavior_contract_id: VDH-FR-005
responsibility_owner: ui-domain-pattern-profile
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: dual_green
no_code_decision: add_code
ddd_modeling_decision: pure_function
contract_preconditions: "#209 slice1〜4 で純関数群・pairwise selector・CLI 表面は着地済みだが、実 product profile / 実 Pattern Contract / 実共通 Rule Pack / 実 risk matrix の正本 asset が repo に存在せず、SA-UDP-02（実 gate 配線経由の 3 者同時 load）と SA-UDP-03（生成→消費の全経路）が L9 として未検証。doctor にも ui-domain gate が配線されていない"
contract_postconditions: "config/ui-domain/harness-console-bundle.json が L2 正本（docs/design/harness/L2-screen/、G2 freeze 済み）から抽出した 5 section（domain 50 entity / contract / profile / pack / pairwise）の実 asset 正本として存在し、src/lint/ui-domain-gate.ts が evaluateUiDomainBundle + 5 section 同時宣言強制で検査、runFullDoctor が集約する。L9 system test（U-UDP-008/008b/008c/009/009b）が SA-UDP-02/03 を実 repo に対して常時検証する"
contract_invariants: "asset は L2 の抽出であり L10 委譲の具体値（hex/px/font 実名）を持ち込まない（L5 §8.1）。L2 が沈黙する motion は保守的既定である旨を value 内へ明記する。graph section は #257 到達まで宣言しない。evaluateUiDomainBundle の任意宣言仕様（合成 bundle 用）は変えず、5 section 義務は実 asset gate 側にだけ課す。gate は fail-open しない（asset 欠落・破損 JSON・非 record すべて ok=false）"
contract_failures: "section を asset から消して検査を骨抜きにする経路（section-missing で fail-close）、section 失敗を messages へ写像せず green 化する経路、asset 欠落を ok=true に倒す fail-open 経路、doctor 集約から gate が漏れて実行環境で効かない経路、実 asset の high risk entry 欠落・contract 対象非実在を見逃す経路を、U-UDP-008 系 / 009 系 5 oracle で塞ぐ"
tdd_red_required: true
red_at: "2026-08-10T14:10:05Z"
green_at: "2026-08-10T14:11:19Z"
mutation_oracle_evidence: "tests/ui-domain-system.test.ts が U-UDP-008/008b/008c/009/009b を機械検査する。6 mutation をすべて exit 非 0 で kill することを実測（6/6、各 mutation 後 restored で 5/5 green を確認）。locator と改変内容: (1) src/lint/ui-domain-gate.ts の必須 section 検査 if (record[section] === undefined) → if (false)（骨抜き許容）、(2) 同 section 失敗写像 if (section.ok) continue → if (true) continue（fail-open）、(3) 同 catch 節の ok: false → ok: true（asset 欠落 fail-open）、(4) src/doctor/index.ts の全体 ok チェーンから uiDomainBundle.ok && を削除（doctor 集約漏れ）、(5) config/ui-domain/harness-console-bundle.json の risk_matrix から high entry を全削除、(6) 同 contract.required[0].target_id を非実在 CMP-nonexistent へ。mutation script は各置換前に assert a in s で anchor 一致を検証し、no-op 置換を生存と誤読する経路（PLAN-L7-539 で踏んだ偽の生存）を塞いだ"
complexity_effect: justified_positive
complexity_justification: "新規は asset JSON 1 本 + 薄い gate module 1 本 + doctor 集約 4 行 + L9 test 1 本で、既存純関数の signature・挙動は変えない。実 asset の正本化により #209 の L9 assertion が合成 fixture ではなく実 repository 検証になる"
removal_trigger: "#257（Canonical Design IR intake）到達後に L2→asset の抽出が canonical IR 供給へ置換された時点で、本 asset JSON の手動保守を撤去し gate の入力を IR 経路へ差し替える（gate 自体と L9 assertion は存続）"
parent_design: docs/design/helix/L6-function-design/ui-domain-pattern-profile.md
pair_artifact: docs/test-design/helix/L8-ui-domain-pattern-profile-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/ui-domain-pattern-profile.md, oracle_id: U-UDP-008, test_path: tests/ui-domain-system.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #209 残 L9 のうちチェーン非依存の SA-UDP-02/03 を先行スライスに" }
  - { role: se, slot_label: "SE — L2 正本からの asset 抽出と gate / doctor 配線の実装" }
  - { role: qa, slot_label: "QA — 骨抜き・fail-open・集約漏れ・被覆検算の独立性を oracle で塞ぐ" }
  - { role: tl, slot_label: "TL — L10 委譲値の非持ち込みと motion 保守的既定の authority 判断" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-540-ui-domain-real-assets.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/ui-domain-pattern-profile.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/ui-domain-pattern-profile.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L4-ui-domain-pattern-profile-system-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L8-ui-domain-pattern-profile-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: config/ui-domain/harness-console-bundle.json, artifact_type: json_config }
  - { artifact_path: src/lint/ui-domain-gate.ts, artifact_type: source_module }
  - { artifact_path: tests/ui-domain-system.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-523-ui-domain-cli.md
  requires:
    - docs/plans/PLAN-L7-523-ui-domain-cli.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-10T14:35:00Z"
    tests_green_at: "2026-08-10T14:35:43Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex への独立レビュー依頼は wake チャネル不在（Issue #532）のため PR 上で行い、規定代替の intra_runtime_subagent（claude-sonnet-5, read-only + 一時 mutation 実測）が実施した。verdict=approve（Important 2 / Minor 3）→ Important は全件是正済み。**Important-1**: TOK-typography value の『実 font 名は L10 確定』が L2 ui-element §3 タイポグラフィ行に明示帰属を持たない。是正: §3 冒頭注記（High-Fi 確定は L10 委譲）への帰属を value 内へ明記。**Important-2**: tests/slow/doctor.test.ts の expectedHardGates 台帳へ uiDomainBundle が未登録で、hard-gate 網羅性検査から漏れる。是正: 台帳へ登録し U-GREENCMD-003 の green を実測。**Minor**: U-UDP-008b が文字列 containment である点（既存慣習 U-GREENCMD-003 と同型式と評価）、U-UDP-009 の UDP_AXES 共有（fixture と入力 axes の突合自体は独立と評価）、pairwise 軸 level の出所が asset 本体に無い点（asset_note へ全軸の出所を追記して是正）。**reviewer の独立検証**: domain 50 entity を L2 正本（screen-list / ui-element / wireframe）と個別突合して全一致・L10 委譲値の持ち込み無しを確認。mutation は (1) section-missing 検査の if(false) 化と (5) high risk entry 全削除の 2 件を独立実測し red を確認、実測後の cp 復元と git status 一致まで検証した（残り 4 件は未実測と明記）。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/ui-domain-system.test.ts tests/ui-domain-cli.test.ts tests/design-language.test.ts tests/digest.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-10T14:35:43Z", evidence_path: tests/ui-domain-system.test.ts, output_digest: "sha256:643c68e2752496e101ec18b40465e30528325047df63f685711cf9b0a8f5fd48", result: "4 files / 25 tests green" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-10T14:37:00Z", evidence_path: docs/plans/PLAN-L7-540-ui-domain-real-assets.md, output_digest: "sha256:970ff15834d8431bf91c6598de2e7efc5d8f75adba2f093d6c18e7750a5017f4", result: "5 gate すべて OK" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-10T14:35:43Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
  - reviewer: "Codex TL (independent current-HEAD review)"
    review_kind: cross_agent
    reviewed_at: "2026-08-10T14:51:47Z"
    tests_green_at: "2026-08-10T14:51:39Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: gpt-5-codex
    scope: "PR #537 current HEAD 4e6363aca783f3c25cac89ea984e6a5c60fd5c40 を severity-first で独立確認。実 asset の 5 section 同時 load、asset 欠落・破損 JSON・section 欠落・pack 混入・contract 競合の fail-close、doctor の ok 集計/全体 ok/messages 3 点、risk matrix の pair coverage/high-risk/deterministic selection と 8-axis consumer completeness を確認し、Critical/Important/Minor 0。現行 tree に canonical pr-review-receipt CLI は存在しないため、合成 receipt や GitHub approve は行わず、read-only review evidence のみを記録する。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/ui-domain-system.test.ts tests/ui-domain-cli.test.ts tests/design-language.test.ts tests/digest.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-10T14:51:27Z", evidence_path: tests/ui-domain-system.test.ts, output_digest: "sha256:0ee6ccaceb09ad593f98c018b68ccf94817edf54d0be191101d8d77d139bdab0", result: "4 files / 25 passed" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-10T14:51:35Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-540-ui-domain-real-assets.md", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-10T14:51:39Z", evidence_path: docs/plans/PLAN-L7-540-ui-domain-real-assets.md, output_digest: "sha256:abab0fc84420f8301b0410dd560263d4a0e807960b2ce66bed0356cfc4418444", result: "5 gates OK" }
      - { kind: lint, command: "npx --no-install biome check config/ui-domain/harness-console-bundle.json docs/design/helix/L5-detail/ui-domain-pattern-profile.md docs/design/helix/L6-function-design/ui-domain-pattern-profile.md docs/plans/PLAN-L7-540-ui-domain-real-assets.md docs/test-design/helix/L4-ui-domain-pattern-profile-system-test-design.md docs/test-design/helix/L8-ui-domain-pattern-profile-unit-test-design.md src/doctor/index.ts src/lint/ui-domain-gate.ts tests/slow/doctor.test.ts tests/ui-domain-system.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-10T14:51:39Z", evidence_path: src/lint/ui-domain-gate.ts, output_digest: "sha256:5b4d85326331ee71775026a04d7040b8e4520c5e92dc3b115ea826b12697492b", result: "exit 0" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-10T14:35:00Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-10T14:35:00Z"
    evidence_digest: "sha256:43dd37f12d5165a29d5b85cfefef4acfa1c6a54f99daf8e99e5ba4ae8953f6da"
  entries: []
---

# PLAN-L7-540: UI Domain 実 asset 正本と doctor 実 gate 配線（SA-UDP-02/03）

## §1 背景

Issue #209 は slice1〜4 で機能面（純関数群 / pairwise selector / registry consumer trace /
CLI 表面）を着地済みだが、L9 system assertion（SA-UDP-01〜03）は「実 repository の実 doc・
実 fixture 一式」を要求するため、実 asset 正本が無い限り検証できない（Issue #209 ブロック記録
コメント参照）。本 PLAN は上流がすでに揃っている SA-UDP-02/03 を着地させる。SA-UDP-01 は
#257（Canonical Design IR intake）と実 registry population が上流であり、本 PLAN の対象外
（L4 system test design に未実装ブロックとして明示）。

## §2 スコープ

1. **実 asset 正本** `config/ui-domain/harness-console-bundle.json` — L2 正本
   `docs/design/harness/L2-screen/` からの抽出（抽出規約は L5 §8.1 が正本）。
   domain は 50 entity（画面 15 / フロー 2 / ナビゲーション 3 / 領域 5 / 部品 10 /
   操作パターン 4 / トークン 4 / コンテンツ 2 / フィードバック 2 / 状態 5）、
   PTN-cli-copy の Pattern Contract（S5=b の UI 直接実行禁止を forbidden で機械化）、
   PRF-harness-console profile、PCK-udp-common 共通 Rule Pack、8 軸 pairwise + risk matrix。
2. **実 gate** `src/lint/ui-domain-gate.ts` — bundle 評価 + 5 section 同時宣言強制
   （骨抜き防止）+ fail-open 禁止。
3. **doctor 配線** — runFullDoctor の ok 集計 / 全体 ok / メッセージ集約へ uiDomainBundle を追加。
4. **L9 総合テスト** `tests/ui-domain-system.test.ts` — U-UDP-008/008b/008c（SA-UDP-02）と
   U-UDP-009/009b（SA-UDP-03、被覆 3 条件を selector の自己申告に依らず独立検算）。

## §3 受入条件

- 実 repo に対する `checkUiDomainBundleGate` が green（U-UDP-008 で常時検証）。
- 実 asset への注入反例（pack 混入 / contract 競合 / section 骨抜き）が同一 gate 経路で
  fail-close する（機械検査、prose claim ではない）。
- doctor 集約 3 点の配線を U-UDP-008b が機械確認する。
- 実 risk matrix からの fixture 生成が被覆 3 条件（ペア被覆 100% / high risk 全件 / 決定的
  順序）を独立検算で満たし、8 軸完全代入 + fixture_id 一意で consumer 接続可能な形である。
- mutation 6/6 kill（anchor assert 付き script で no-op 置換の偽生存を排除）。
