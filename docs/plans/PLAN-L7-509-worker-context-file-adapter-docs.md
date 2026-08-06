---
plan_id: PLAN-L7-509-worker-context-file-adapter-docs
title: "PLAN-L7-509 (refactor): --worker-context-file 必須化をadapter 3面と運用ガイドへ反映する"
kind: refactor
layer: L7
drive: agent
status: confirmed
route_mode: refactor
entry_signals:
  - "po_directive:2026-08-07 GitHub issue #376（WCC-FR-09で--executeを伴う全worker起動経路が--worker-context-fileを必須化した一方、CLAUDE.md／AGENTS.md／.claude/CLAUDE.mdの人間向け正本が未更新で実CLI契約と乖離している）の修復スライス"
created: 2026-08-07
updated: 2026-08-07
owner: Claude / TL
github_issue_id: 376
engineering_discipline_required: true
behavior_contract_id: WCC-FR09-ADAPTER-DOCS-001
responsibility_owner: worker-context-authority
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: none
backprop_decision: not_required
backprop_decision_reason: "WCC-FR-09の要件・runtime契約は既にmainでgreenであり、本スライスはその契約を人間向け正本へ書き写すdocs整合に限る。上位要求へ返す意味差分は無い"
contract_preconditions: "WCC-FR-09により`helix codex/claude --execute`、`helix loop run`（--dry-run以外）、`helix pair-agent run --execute`、`helix team run --execute`が--worker-context-file <path>を必須とし、未指定はWORKER_CONTEXT_UNSEALEDでfail-closeする。一方CLAUDE.md「正規コマンド」、AGENTS.md「正規コマンド」、.claude/CLAUDE.md「Runtime と委譲」はboundary無しの委譲コマンドだけを記載し、boundary JSONのschema・置き場所・入手手段を示す正本が存在しない"
contract_postconditions: "adapter 3面がいずれも「--executeを伴う起動は--worker-context-file必須」を明記し、対象5経路の実行形とfail-close挙動、boundaryの置き場所（.helix/worker-context/<goal-id>.json）、helix setup projectが生成しない事実を示す。schema・3軸許容値・scope制約・budget・digest形式・失敗コード表・実行例はdocs/governance/worker-context-boundary-operator-guide.mdを正本とする"
contract_invariants: "rule-driftのSHARED_MARKERS／ADAPTER_MARKERSに含まれるmarker文字列（`helix codex --role <role> --task`等）とAdapter Rule Markers sectionの既存行は一字も変更しない。runtime behaviorを変更せず、helix setup projectの契約も拡張しない"
contract_failures: "adapter 3面のいずれかがboundary必須の記述を欠く、marker文字列が崩れてrule-driftが落ちる、operator guideの記述がloadWorkerContextBoundaryFileの実検査と食い違う場合にredになる"
tdd_red_required: true
red_at: "2026-08-06T19:33:40Z"
green_at: "2026-08-06T19:33:58Z"
mutation_oracle_evidence: "oracle=`keeps the adapter rule doc %s on a live reviewed disposition` (tests/l12-hybrid-recognition.test.ts)。src/lint/l12-hybrid-reviewed-safe-v2.tsのAGENTS.md契約digestを全0へ書き換えるmutation（＝再attest漏れ相当）を適用したところ、`expect(reviewed?.contentDigest).toBe(candidate.contentDigest)`がAssertionErrorでkillされRedになることを実測（2026-08-06T19:33:40Z）。mutation revert後は同file 19件がgreen（2026-08-06T19:33:58Z）"
complexity_effect: net_neutral
complexity_justification: "runtime code変更0。adapter 3面へ運用sectionを1つずつ追加し、schema詳細は新規operator guide 1本へ集約して三重記述を避ける。src変更はl12 reviewed digestの再attest 3件のみで判定ロジックには触れない"
removal_trigger: "helix setup projectがboundaryを生成する契約へ拡張され、手書きテンプレート手順が不要になった時（operator guideの§2を置き換える）"
parent_design: docs/design/helix/L3-requirements/worker-common-contract.md
pair_artifact: docs/governance/worker-context-boundary-operator-guide.md
agent_slots:
  - { role: aim, slot_label: "AIM — issue #376の乖離範囲（対象5経路とadapter 3面）の特定" }
  - { role: se, slot_label: "SE — operator guide起草とadapter 3面への運用section追加" }
  - { role: qa, slot_label: "QA — rule-drift marker非破壊の確認とl12再attest oracleのkill実測" }
  - { role: tl, slot_label: "TL — guide記述とloadWorkerContextBoundaryFile実検査の一致確認" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-509-worker-context-file-adapter-docs.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/worker-context-boundary-operator-guide.md, artifact_type: markdown_doc }
  - { artifact_path: CLAUDE.md, artifact_type: markdown_doc }
  - { artifact_path: AGENTS.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/CLAUDE.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-503-worker-context-authority.md
  requires:
    - docs/plans/PLAN-L7-503-worker-context-authority.md
review_evidence:
  - reviewer: "Claude primary runtime (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-06T19:35:36Z"
    tests_green_at: "2026-08-06T19:35:36Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: claude-opus-5
    scope: "単一runtimeのため規定代替のintra_runtime_subagentとして、material変更（新規operator guide、adapter 3面への運用section追加、l12 reviewed digest 3件の再attest、oracle 1件追加、新規PLAN文書）をadversarial reviewしverdict approve。(1) 記述と実装の一致: operator guideの3軸許容値・allowed_paths 1件以上・allowed↔forbiddenの包含禁止・配列内重複禁止・budget safe integer・digest sha256形式は、src/runtime/worker-context-packet.tsのvalidAxes／validScope／validBudget／isShaを読み取って一致を確認した。authority/rule pathがboundaryではなくCURRENT_AUTHORITY_PATHS／CURRENT_RULE_PATHS定数側にあることも確認し、guideへ明記した。(2) 対象経路: --worker-context-fileのCLI option定義4箇所（src/cli.ts）とloop runの`!opts.dryRun && !loadedContext?.ok`分岐を確認し、issue記載の5経路と一致することを検証した。(3) rule-drift非破壊: SHARED_MARKERS／ADAPTER_MARKERSは部分文字列一致であり、既存marker行を一切変更せず追記のみとしたため`rule-drift - OK`を実測。(4) setup生成の扱い: helix setup projectがboundaryを生成しない事実をコード確認のうえ記載し、自動生成は別PLAN（runtime behavior追加）として据え置いた。既定値をharnessが決めるとscope契約の意味が失われるため、勝手に決めない判断を明記している。(5) l12再attest: adapter 3面はいずれもl12 reviewed-safe registry登録済みで、編集により needs_manual_review へ落ちることを実測。編集前後のsignal集合がbit同一（CLAUDE.md 35件／AGENTS.md 29件／.claude/CLAUDE.md 25件、ids=bun_runtime,legacy_pair_l2_l10,legacy_vmodel_span,python_worker_boundary,removed_layer_l13_l14）であることをdetectL12HybridRecognitionSignalsで突合してからdisposition据え置きで再attestし、再attest漏れをkillするoracleを追加した。merge admissionはGitHub Actions required checkの同一HEAD full CIを外部receiptとする。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/l12-hybrid-recognition.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-06T19:33:58Z", evidence_path: tests/l12-hybrid-recognition.test.ts, output_digest: "sha256:262b95a0f60ac697a72651b2dbb626e7b407ca42923e60f5f24279d8545a9855", result: "1 file / 19 tests passed" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-06T19:34:07Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
      - { kind: lint, command: "npx --no-install biome check src tests", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-06T19:34:07Z", evidence_path: biome.json, output_digest: "sha256:359388128710977c6c79f853aee8dc995e5dd40a48f1068638e171de1c7da845", result: "0 error" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint --gate governance", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-06T19:35:36Z", evidence_path: docs/plans/PLAN-L7-509-worker-context-file-adapter-docs.md, output_digest: "sha256:44acd9526c92ee02ce92ae1abed494b0022ee79673a48fd02a0b06143e9e37a8", result: "plan-governance OK" }
---

# PLAN-L7-509: `--worker-context-file` 必須化を adapter 3 面と運用ガイドへ反映する

## 根本原因

WCC-FR-09 により `--execute` を伴う全 worker 起動経路が `--worker-context-file <path>` を
必須化したが、人間向け正本 3 面が未更新で実 CLI 契約と乖離していた（issue #376）。

- `CLAUDE.md` の「正規コマンド」
- `AGENTS.md` の「正規コマンド」
- `.claude/CLAUDE.md` の「Runtime と委譲」

さらに boundary JSON の schema・置き場所・入手手段を示す正本が存在せず、
operator が boundary を書けない状態だった。

## 未決定だった運用方針への回答

issue が挙げた 3 つの未決定事項を、コードを読んで確定または明示的に据え置いた。

1. **`helix setup project` が boundary を生成するか** → **生成しない**（現状のコードを確認済み）。
   既定の `goal_id` / `behavior_contract_id` / `allowed_paths` を harness が勝手に決めると
   scope 契約の意味が失われるため、テンプレートの手書きを正規手順とする。自動生成は runtime
   behavior の追加であり、入れるなら `helix setup project` の契約を拡張する**別 PLAN**とする
   （`removal_trigger` に記録）。
2. **置き場所** → `.helix/worker-context/<goal-id>.json`。`.helix/` 配下だが
   `state` / `cache` / `logs` のような生成 runtime state ではなく、`.gitignore` にも掛からない
   **追跡対象の設定ファイル**として扱う。
3. **authority / rule path の既定値** → boundary には書かない。実装側の定数
   （`src/runtime/worker-context-packet.ts` の `CURRENT_AUTHORITY_PATHS` /
   `CURRENT_RULE_PATHS`）が正であり、boundary 読み込み時に current HEAD へ束縛される。
   この事実を operator guide に明記した。

## 修復

- `docs/governance/worker-context-boundary-operator-guide.md` を新設し、対象経路 5 件・置き場所・
  schema（3 軸許容値 / scope 制約 / budget / digest 形式）・失敗コード表・実行例を集約する。
  schema の記述は `validAxes` / `validScope` / `validBudget` / `isSha` の実検査と突合済み。
- adapter 3 面へ「worker context boundary（WCC-FR-09、`--execute` 時 必須）」section を追加し、
  5 経路の実行形と fail-close 挙動、置き場所、guide への参照を書く。**schema 詳細は三重に
  書かず guide へ委ねる**。

## Adapter Rule Markers を触らない理由

`rule-drift` の `SHARED_MARKERS` / `ADAPTER_MARKERS` は**部分文字列一致**で検査される
（`src/lint/rule-drift.ts`）。marker 行（例: `helix codex --role <role> --task "..."`）は
`--execute` を伴わない dry-run 形として**それ自体は正しい**ため、marker 行は一字も変更せず
**追記のみ**とした。これにより `rule-drift - OK` を維持しつつ、実 CLI 契約との乖離を解消する。

## 検証

- `rule-drift - OK (AGENTS/CLAUDE adapters share required mode and command markers)` を実測。
- `design-language - OK (human-facing docs 1573, english prose 0)` を実測（新規 guide は日本語）。
- adapter 3 面は l12 reviewed-safe registry 登録済みで、編集により `needs_manual_review` へ
  落ちることを実測。編集前後の signal 集合が **bit 同一**
  （CLAUDE.md 35 件 / AGENTS.md 29 件 / .claude/CLAUDE.md 25 件）であることを
  `detectL12HybridRecognitionSignals` で突合してから disposition 据え置きで再 attest した。
- red 実測: `l12-hybrid-reviewed-safe-v2.ts` の AGENTS.md 契約 digest を全 0 へ書き換える
  mutation（＝再 attest 漏れ相当）で新規 oracle が AssertionError で Red
  （2026-08-06T19:33:40Z）。green 実測 19 passed（2026-08-06T19:33:58Z）。

## 非対象

- `helix setup project` の契約拡張（boundary 自動生成）
- `--worker-context-file` の CLI option 仕様・`loadWorkerContextBoundaryFile` の検査列の変更
- Adapter Rule Markers section の marker 行そのものの改訂
