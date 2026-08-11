---
plan_id: PLAN-L7-535-plan-number-uniqueness
title: "PLAN-L7-535 (add-impl): PLAN 採番の衝突を機械で塞ぐ"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-09 デザインハーネスを進めること（session takeover キャリー: PLAN-L7-525 / PLAN-L5-96 の採番重複解消。実測で 15 組と判明し Issue #521 として起票）"
created: 2026-08-10
updated: 2026-08-10
owner: Claude / TL
github_issue_id: 521
engineering_discipline_required: true
behavior_contract_id: U-PLANNUM-001
responsibility_owner: plan-governance
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: pure_function
contract_preconditions: "PLAN の採番は docs/plans を観測して次の空き番号を取る方式であり、並行レーン（Claude / Codex）が同時に払い出すと衝突する。plan_id の一意性は slug を含むため保たれ既存 gate は検出しない。実 repository を数えたところ 15 組が衝突しており（PLAN-L7-170 と PLAN-RECOVERY-40 は 3 本）、prose 中の裸参照は PLAN-L7-525 が 12 件 / PLAN-L5-96 が 8 件でどちらを指すか判別できない"
contract_postconditions: "採番 key（PLAN-<layer>-<number>、slug を含まない）ごとの本数を数え、baseline 許容本数（未登録なら 1）を超えたら fail-close する gate を helix plan lint の既定経路と専用 gate の双方へ配線する。既存 15 組は baseline として凍結し、baseline を下回った key は resolvedBaselineKeys として報告して凍結の固定化を防ぐ"
contract_invariants: "既存 15 組を遡及 fail させない（ratchet。plan-descent / plan-entry-routing と同型）。planIdSchema が許容する slug 付き・slug 省略形の両方を採番対象とし、それ以外の filename は無視して非 PLAN doc を巻き込まない"
contract_failures: "新規衝突（baseline 外の key が 2 本以上、または baseline 登録済み key が baseline を超過）を fail-close する。gate を既定経路から外す配線ミスも oracle が検出する"
tdd_red_required: true
red_at: "2026-08-09T16:20:00Z"
green_at: "2026-08-09T16:22:00Z"
mutation_oracle_evidence: "tests/plan-number-uniqueness.test.ts に対する mutation 実測（vitest run --project fast）で 4/4 killed。(1) analyze が常に ok を返す = killed、(2) baseline から PLAN-L7-525 の entry を削る = killed（実 repo の衝突を実際に見ていることの証拠）、(3) 未登録 key の既定許容を 1 から MAX_SAFE_INTEGER にする = killed、(4) **src/plan/lint.ts の既定合成から本 gate の messages を外す = killed**（gate を書いても既定経路に載っていなければ CI で発火しないため、配線自体を oracle で固定した）。restore 後 exit 0"
complexity_effect: net_negative
complexity_justification: "新規 module 1 本（pure 関数 3 つ）と配線 2 行。手作業の採番確認という暗黙の運用手順を機械へ移した"
removal_trigger: "採番が観測方式ではなく払い出し台帳（DB の連番 allocation）へ移行し、衝突が構造的に起きなくなった時"
parent_design: docs/design/harness/L6-function-design/plan-number-uniqueness.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/plan-number-uniqueness.md, oracle_id: U-PLANNUM-001, test_path: tests/plan-number-uniqueness.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — キャリー 2 件が実は 15 組の systemic な穴だと確定させる" }
  - { role: se, slot_label: "SE — 採番一意性 gate と baseline 凍結" }
  - { role: qa, slot_label: "QA — 配線を含む mutation" }
  - { role: tl, slot_label: "TL — 既存衝突を今直すか凍結するかの判断" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-535-plan-number-uniqueness.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L6-function-design/plan-number-uniqueness.md, artifact_type: design_doc }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/plan-number-uniqueness.test.ts, artifact_type: test_code }
  - { artifact_path: src/lint/plan-number-uniqueness.ts, artifact_type: source_module }
  - { artifact_path: src/plan/lint.ts, artifact_type: source_module }
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-09T16:42:00Z"
    tests_green_at: "2026-08-09T16:40:28Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: claude-sonnet-5
    scope: "2 ラウンド。round1 approve（Critical 0 / Important 1 / Minor 0）。**Important**: 採番重複の追跡先として #175 を引用していたが、#175 は ScreenApplicabilityGate の Issue で無関係であり、baseline 凍結が永久化しない担保（改番を判断する場）がトレース可能な形で存在しない、との指摘。是正として Issue #521 を新規起票し（15 組の一覧・実害の実測値・検出 gate で済んだ範囲・改番の影響範囲・選択肢 3 つ・根治案）、PLAN 2 本の github_issue_id と entry_signals、src / test / 設計 doc のコメントを #521 へ付け替えた。round2 approve（新規 Critical 0 / Important 0 / Minor 1）。**観点 1（baseline 凍結の妥当性）**: reviewer は改番が不可逆 migration であることから分離を合理的と判定し、resolvedBaselineKeys と U-PLANNUM-005 の hard pin により下方硬直化が機械的に防止されていることを確認した。**観点 3（baseline 値の検算）**: reviewer が独立に 2 通りの方法で集計し、15 組（3 本 2 組 + 2 本 13 組）が baseline と 1 件残らず一致、docs/plans 全 889 file が PLAN_FILE_PATTERN にマッチし取りこぼし・過剰マッチ 0 を確認した。配線も既定合成と専用 gate の双方で実行確認済み。round2 では gate ロジック（関数本体・baseline 値・src/plan/lint.ts の配線）が無変更であることを diff で確認した。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/plan-number-uniqueness.test.ts tests/design-coverage.test.ts tests/design-language.test.ts tests/review-evidence.test.ts tests/ddd-tdd-rules.test.ts tests/ci-governance-self-heal.test.ts tests/impl-plan-trace.test.ts tests/plan-descent-specific-parent-binding.test.ts tests/l12-hybrid-recognition.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-09T16:40:28Z", evidence_path: tests/plan-number-uniqueness.test.ts, output_digest: "sha256:c8f4abb4fcd3a8092c3f70cc7c37ba3a6f6ea9afb4656adf3570123199c99060", result: "9 files / 135 tests green、skip 0" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T16:40:28Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0（出力なし）" }
      - { kind: lint, command: "npx --no-install biome check src tests", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T16:40:28Z", evidence_path: biome.json, output_digest: "sha256:a7090bfaa3a2e3a4c11320752a7f89962ed6a4dad9b4a9eac16c12c02a2efb20", result: "exit 0（error 0）" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-09T16:42:00Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-09T16:42:00Z"
    evidence_digest: "sha256:43b968ef9ca9afe149bd27fa22c89b09ba1733acf8167dd6dba2a2094c025ed5"
  entries: []
dependencies:
  parent: docs/plans/PLAN-L7-534-screen-cli-readonly.md
  requires:
    - docs/plans/PLAN-L7-534-screen-cli-readonly.md
  references:
    - docs/design/harness/L6-function-design/plan-entry-routing.md
  blocks: []
---

# PLAN-L7-535: PLAN 採番の衝突を機械で塞ぐ

## §1 キャリーの実体は 2 件ではなく 15 組だった

引き継ぎのキャリーは「PLAN-L7-525 / PLAN-L5-96 の採番重複解消」だったが、実 repository を
数えたところ **15 組**が衝突していた。

| 採番 key | 本数 |
|---|---|
| PLAN-L7-170 / PLAN-RECOVERY-40 | 各 3 本 |
| PLAN-L3-30 / PLAN-L4-53 / PLAN-L5-96 / PLAN-L6-77 / PLAN-L6-78 / PLAN-L7-168 / PLAN-L7-169 / PLAN-L7-171 / PLAN-L7-433 / PLAN-L7-525 / PLAN-L7-527 / PLAN-RECOVERY-12 / PLAN-RECOVERY-39 | 各 2 本 |

中身は無関係な機能同士である（例: `PLAN-L7-527` は psc-gate-wiring と slot-scheduler-quota-handover）。
意図的な慣習ではなく、並行レーンが同時に「次の空き番号」を取った事故である。
**本セッションで起票した `PLAN-L3-30` も衝突していた**（起票時に気付けなかった）。

`plan_id` は slug を含むため一意性が保たれ、既存 gate は検出しない。採番 key の一意性を見る
gate が無かったことが再発の原因である。

## §2 既存 15 組を今は直さない理由

既存衝突の解消は confirmed PLAN の改番であり、`plan_id` と filename に加えて
inbound 参照（設計 doc、テスト設計、他 PLAN の dependencies、review evidence、
`src/lint/l12-hybrid-reviewed-safe-v2.ts` の path pin、prose 中の裸参照）の一括追従を伴う。
両ランタイムのレーンをまたぐ不可逆な migration であり、gate の導入と同じスライスで
片付けるべきものではない。

したがって本 PLAN は **gate の導入と baseline 凍結まで**とし、既存 15 組の改番は
Issue #521 として owner の判断に委ねる。baseline は「許可」ではなく既知の負債であり、
改番が進んだら下げる（`resolvedBaselineKeys` が固定化を検出する）。

## §3 工程表

### Step 1: 実 repo の衝突を数え、gate の red oracle を作る [直列]

根拠: downstream_dependency（キャリーの規模が 2 件か 15 組かで、今直すか凍結するかの判断が変わる）。

### Step 2: gate 実装と plan lint 双方向の配線 → green [直列]

根拠: file_conflict（`src/plan/lint.ts` への集中編集）。

### Step 3: 設計 doc と catalog 登録、digest 再 pin [直列]

根拠: downstream_dependency（design-coverage が catalog 登録を要求し、catalog 変更が 3 箇所の digest pin を無効化する）。

### Step 4: review Step（別 runtime 判定。Codex 使用中は intra_runtime_subagent = code-reviewer を規定代替とする） [直列]

根拠: downstream_dependency（実装と設計記述が揃ってからでないと判定できない）。

## §3.1 実装計画

- `src/lint/plan-number-uniqueness.ts`: `groupPlanNumbers` / `analyzePlanNumberUniqueness` /
  `checkPlanNumberUniqueness` / `planNumberUniquenessMessages` と baseline 定数。
- `src/plan/lint.ts`: 既定合成と `--gate number-uniqueness` の双方へ配線する。
- `docs/design/harness/L6-function-design/plan-number-uniqueness.md` と catalog 登録。
- catalog 変更に伴い `src/lint/design-coverage.ts` の baseline fingerprint と、
  `design-catalog.yaml` の digest を pin する 3 箇所
  （`src/lint/l3-progression-reviewed-digests.ts` / `tests/l3-g3-freeze-packet-v2.test.ts` /
  `docs/governance/l3-rebaseline-g3-freeze-packet.md`）を更新する。

## §4 本 PLAN の非対象

- **既存 15 組の改番**: §2 の理由で Issue #521 へ送る。
- **採番の払い出し方式そのものの変更**（観測方式 → 台帳 allocation）: 衝突を構造的に消す本命だが、
  DB schema と起票フローの設計を伴うため別スライス。本 PLAN は検出までである。
- `plan_id` と filename の一致検査は既存 gate の担当であり重複させない。
