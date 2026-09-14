---
plan_id: PLAN-RECOVERY-55-typescript-lazy-shared
title: "PLAN-RECOVERY-55 (recovery): TypeScript lazy loader を shared leaf の単一実装へ収束する"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-12 L12 まで harness rule に従い、GitHub Issue / PR を自走収束する"
created: 2026-08-12
updated: 2026-08-12
owner: Codex / TL
github_issue_id: 576
engineering_discipline_required: true
behavior_contract_id: TS-LAZY-SHARED-001
responsibility_owner: impact-ci-recovery
change_slice: atomic
refactor_step: verify_consumer_zero
legacy_retirement_state: consumer_zero
no_code_decision: modify
ddd_modeling_decision: none
contract_preconditions: "PLAN-RECOVERY-40 の lazy proxy 実装は src/lint/typescript-lazy.ts にあり lint 9 module が参照する。一方 PLAN-RECOVERY-54 は requirements -> lint の default deny を守るため src/requirements/requirement-authority-gate.ts 内に createRequire + memo accessor を重複実装している"
contract_postconditions: "canonical 実装を src/shared/typescript-lazy.ts の正確に1件へ収束し、lint 9 module と requirements 1 module は canonical path を直接 import する。src/lint/typescript-lazy.ts は confirmed PLAN-RECOVERY-40 の artifact existence を保つ実装なし re-export shim、live importer 0件、lint-wiring理由付きdeferredとする。requirements -> shared だけを明示許可する"
contract_invariants: "compiler 未使用 CLI と loader/requirements module の import だけでは typescript を load しない。最初の property access 後は createSourceFile を解決できる。requirements -> lint と shared -> requirements は default deny のまま維持し、U-RAC-001..008 の requirement authority 判定を変更しない"
contract_failures: "runtime TypeScript loader 実装が0件または複数件、canonical consumer が lint 9件 + requirements 1件と不一致、旧 shim の理由付きdeferred欠落またはlive importerが1件以上、requirements -> shared 欠落、requirements -> lint または shared -> requirements の許可は fail-close する"
tdd_red_required: true
red_at: "2026-08-12T06:48:58Z"
green_at: "2026-08-12T08:38:42Z"
mutation_oracle_evidence: "tests/typescript-lazy.test.ts::U-TSLAZY-002 と tests/source-boundary-integration.test.ts::IT-SBOUND-007 を実装前に追加し、shared module 不在、旧 loader 実装残存、requirements -> shared exception 不在で 2 test file / 4 failed の Red を確認した。seeded defect は旧 path shim 化前なら canonical loader 実装数 / canonical consumer exact set が red、requirements -> shared exception を除去すれば IT-SBOUND-007 が owner default deny で killed、requirements -> lint または shared -> requirements を許可すれば同 oracle の負方向 assertion が killed する。既存 U-TSLAZY-001 は eager 初期化・空洞 proxy・CLI direct import の3 mutationを既に kill 済み。hosted sandbox の Vitest fork は全 child stdout を空にするため、その環境制約は Red 根拠から除外し、child-process oracle は直接 probe と GitHub CI で再検証する"
complexity_effect: net_negative
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-TSLAZY-001, test_path: tests/typescript-lazy.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-TSLAZY-002, test_path: tests/typescript-lazy.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-TSLAZY-003, test_path: tests/lint-wiring.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: IT-SBOUND-007, test_path: tests/source-boundary-integration.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — 重複 loader と current consumer exact set の棚卸し" }
  - { role: se, slot_label: "SE — shared leaf 抽出、canonical import 置換、旧 path shim 化" }
  - { role: qa, slot_label: "QA — lazy load、唯一実装、正負 module direction の oracle" }
  - { role: tl, slot_label: "TL — Sol による owner 境界、confirmed artifact、trace 整合判断" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-55-typescript-lazy-shared.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-RECOVERY-54-synthesized-legacy-read-detection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/impact-ci-recovery.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/design-reality-binding.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/shared/typescript-lazy.ts, artifact_type: source_module }
  - { artifact_path: src/lint/typescript-lazy.ts, artifact_type: source_module }
  - { artifact_path: src/lint/coding-rules.ts, artifact_type: source_module }
  - { artifact_path: src/lint/ddd-tdd-rules.ts, artifact_type: source_module }
  - { artifact_path: src/lint/dependency-drift.ts, artifact_type: source_module }
  - { artifact_path: src/lint/design-reality-binding.ts, artifact_type: source_module }
  - { artifact_path: src/lint/digest-inventory.ts, artifact_type: source_module }
  - { artifact_path: src/lint/handover-resurrection.ts, artifact_type: source_module }
  - { artifact_path: src/lint/lint-wiring.ts, artifact_type: source_module }
  - { artifact_path: src/lint/plan-specific-vpair-binding.ts, artifact_type: source_module }
  - { artifact_path: src/lint/source-edge-extractor.ts, artifact_type: source_module }
  - { artifact_path: src/requirements/requirement-authority-gate.ts, artifact_type: source_module }
  - { artifact_path: tests/typescript-lazy.test.ts, artifact_type: test_code }
  - { artifact_path: tests/lint-wiring.test.ts, artifact_type: test_code }
  - { artifact_path: tests/source-boundary-integration.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
dependencies:
  parent: docs/plans/PLAN-RECOVERY-40-lazy-typescript-cli-startup.md
  requires:
    - docs/plans/PLAN-RECOVERY-54-synthesized-legacy-read-detection.md
  blocks:
    - issue:576
review_evidence:
  - reviewer: "Claude Fable 5 independent reviewer"
    review_kind: cross_agent
    tests_green_at: "2026-08-12T08:38:42Z"
    reviewed_at: "2026-08-12T08:52:25Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: claude-fable-5
    scope: "PR #578 HEAD 1727a80b0d3551b588cce6a7978dc6b906d3c23e の origin/main...HEAD 全22 pathを、HELIX sealed worker-context packetに束縛したClaude Fable 5 session 035ce9dc-9af5-485b-90db-d6d9d4d14f12でread-only独立レビューした。唯一loader実装、lint 9 + requirements 1のcanonical importer exact set、旧shim live importer 0と理由付きdeferred、requirements -> sharedの正方向、requirements -> lint / shared -> requirementsの負方向、U-TSLAZY-001..003とIT-SBOUND-007、PLAN/L6/L8 traceを照合し、blocker 0、Critical/High 0、approveと判定した。Low suggestionは旧path importer regexの他directory表記までの拡張とduplicate-loader heuristicへのdynamic import検出追加の2件で、runtime reachabilityとowner policyが現受入契約をfail-closeするため非blocker。reviewed_atはtranscript final messageの実timestamp 2026-08-12T08:52:25.925Zを秒精度で採用し、reviewer本文内のhost clockと不一致な自己申告時刻は証跡時刻に使わない。CI run 31577536224は直前material HEAD 5a410c23でfull regressionとBiomeがgreen、overall failureはPLAN draftと現HEADで解消済みentry signalだけだった。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --configLoader runner --project fast tests/lint-wiring.test.ts tests/source-boundary-integration.test.ts --reporter=json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-12T08:38:42Z"
        evidence_path: tests/lint-wiring.test.ts
        output_digest: "sha256:ddb8c76674585c231a32885fab3ee095ba6b11d7ee2af35d6ce6122b1eea9bf2"
        result: "6 suites / 15 tests passed、0 failed。U-TSLAZY-003とIT-SBOUND-007をcurrent HEADで実測"
      - kind: unit_test
        command: "npx --no-install vitest run --configLoader runner --project fast tests/plan-entry-routing.test.ts tests/plan-lint.test.ts --reporter=json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-12T08:37:29Z"
        evidence_path: docs/plans/PLAN-RECOVERY-55-typescript-lazy-shared.md
        output_digest: "sha256:f2492fd0e9b98da197b8a7947015d411c814ea774c1751bf38b927507f301e13"
        result: "4 suites / 66 tests passed、0 failed。entry signalとPLAN frontmatterをcurrent HEADで実測"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-08-12T08:38:36Z"
        evidence_path: src/shared/typescript-lazy.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        result: "exit 0（出力0 byte）"
---

# PLAN-RECOVERY-55：TypeScript lazy loader を shared leaf の単一実装へ収束する

## §1 Recovery 判断

PLAN-RECOVERY-40 は compiler 未使用 CLI で `typescript` を eager load しない契約を閉じた。その後、
PLAN-RECOVERY-54 が requirements owner で TypeScript AST を使う際、`requirements -> lint` の
default deny を守るため同じ `createRequire + memo` を局所実装した。境界違反は避けたが loader が2件となり、
eager-load 回帰と proxy 正当性を owner ごとに別々に維持する debt が生じたため recovery とする。

## §2 設計判断

canonical 実装は lower-level owner の `src/shared/typescript-lazy.ts` に置く。lint 9 module と
`src/requirements/requirement-authority-gate.ts` は全てそこを直接 import する。
`src/lint/typescript-lazy.ts` は PLAN-RECOVERY-40 の confirmed `generates` を満たすため、
`export { default } from "../shared/typescript-lazy"` だけの compatibility shim として残す。
これは loader の第2実装ではなく、live importer を持たない artifact-existence adapter である。
`lint-wiring` は `src/lint/*.ts` を一律にruntime到達性検査するため、このshimを
confirmed artifact維持という理由付き `DEFERRED_LINTS` に登録する。未登録のunwired状態と、
旧path importer復活によるstale-deferred状態はどちらもfail-closeする。

module policy は `requirements -> shared` だけを追加する。`requirements -> lint` と
`shared -> requirements` は引き続き default deny とし、owner cycle を作らない。

## §3 TDD と mutation

source 変更前に `U-TSLAZY-002` と `IT-SBOUND-007` を追加した。前者は canonical loader 実装1件、
canonical direct consumer 10件、旧 shim exact body、旧 import 0件を検査する。後者は
`requirements -> shared` の production allow と、その exception 除去 mutationのdeny、さらに
`requirements -> lint` / `shared -> requirements` の負方向denyを固定する。

同一HEADのfull CIで、互換shimがlint-wiring上のunwiredとして拒否される反例を検出したため、
`U-TSLAZY-003` を追加した。理由付きdeferred登録の欠落と、旧path importer復活による
stale-deferredの両方を既存lint-wiring meta-gateで拒否する。

既存 `U-TSLAZY-001` は import-only非load、property access後load、bundle実起動processの非loadを維持する。
hosted sandbox では Vitest fork が起動した任意の子process（単純な `node -e` を含む）のstdoutが空になるため、
この環境固有失敗を実装Redと混同しない。直接 child probe と同一HEAD GitHub CIで同契約を再確認する。

## §4 変更範囲

- canonical loader 新設と旧 path shim 化
- 旧path shimの理由付きlint-wiring deferred分類
- lint 9 importer と requirements 1 importer の canonical path への置換
- requirements owner 内の局所 accessor 削除と `ts.X` への統一
- `requirements -> shared` policy と正負 oracle
- L6設計、L8テスト設計、PLAN-RECOVERY-54 の後続trace
- 行移動に伴う digest inventory の機械追随

## §5 完了条件

targeted test、typecheck、Biome、PLAN/trace/digest gate、full `harness-check` が同一HEADでgreenになり、
独立review receiptがcurrent HEADへ束縛された後にのみ confirmed / merge 可とする。
