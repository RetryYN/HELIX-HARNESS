---
plan_id: PLAN-RECOVERY-35-wbb-selected-candidate-dead-path
title: "PLAN-RECOVERY-35 (recovery): worker blind benchmark selected_candidate_id dead path除去"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-07 GitHub issue #379（evaluateWorkerBlindBenchmarkで非空が確定済みのrankingに対する到達不能な空文字列fallbackが残存し、receipt schema上「選定なし」という別状態が有効値のように見える）の修復スライス"
created: 2026-08-07
updated: 2026-08-07
owner: Claude / TL
github_issue_id: 379
engineering_discipline_required: true
behavior_contract_id: WBB-SELECTED-CANDIDATE-001
responsibility_owner: worker-blind-benchmark
change_slice: atomic
refactor_step: modify
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "evaluateWorkerBlindBenchmarkは`if (evaluations.length < 2) return failure(\"WORKER_BLIND_PROVENANCE_DUPLICATE\")`を通過済みの地点でreceipt payloadを構成する。ループ本体はevaluation 1件につきrowを1件pushするかfailureで早期returnするため、rankingの長さはevaluations.length（>= 2）と一致し非空が確定している。それにもかかわらず`selected_candidate_id: ranking[0]?.candidate_id ?? \"\"`という到達不能なoptional chain + 空文字列fallbackが残存する"
contract_postconditions: "receipt payloadのselected_candidate_idは`ranking[0].candidate_id`への直接参照となり、fallback式を持たない。helix-worker-blind-benchmark-receipt.v1のselected_candidate_idは常にrank 1候補のcandidate_idと一致し、空文字列が記録される経路は存在しない"
contract_invariants: "実行時behaviorは変更しない（除去したfallbackは到達不能でありobservableな差分を生じない）。WorkerBlindBenchmarkReceiptV1のschema、ranking行の構成・整列規則（blind_score降順→effective_cost昇順→opaque_candidate_key辞書順）、receipt_digestのcanonicalization、fail-close判定列は一切変更しない。design-reality-bindingのsource_digest citationはfile全体のsha256であるためsource変更に追随して更新するが、asset_id／artifact_path／resource_name／classificationは変更しない"
contract_failures: "selected_candidate_idがranking rank 1のcandidate_idと不一致、空文字列fallbackの復活（mutation）、rankingが2件未満のままreceiptが生成される経路をfail-closeする"
tdd_red_required: true
red_at: "2026-08-06T17:46:22Z"
green_at: "2026-08-06T17:46:53Z"
mutation_oracle_evidence: "tests/worker-isolation-broker.test.ts::U-WBB-004で、selected_candidate_idを`\"\"`のみへ書き換えるmutation（fallback支配化）は`AssertionError: expected '' to be 'candidate-b'`でkillされRedへ戻ることを実測（2026-08-06T17:46:22Z）。修正適用後は同ファイル27件がgreen（2026-08-06T17:46:53Z）"
complexity_effect: net_negative
complexity_justification: "到達不能なoptional chain + 空文字列fallbackを削除し直接参照へ置き換える。production codeは純減で、追加は既存oracle U-WBB-004への不変条件assertion 3行のみ（新規oracle IDもdesign binding assetも増やさない）。design docs 3件はsource_digest citationの1値更新のみで散文・契約記述は不変"
removal_trigger: "rankingの非空性が型システム上の静的契約（non-empty tuple型等）として表現され、本assertionが冗長と同一基準で証明された時"
parent_design: docs/design/helix/L6-function-design/worker-blind-benchmark.md
pair_artifact: tests/worker-isolation-broker.test.ts
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/worker-blind-benchmark.md, oracle_id: U-WBB-004, test_path: tests/worker-isolation-broker.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — issue #379の到達不能性根拠（evaluations.length >= 2 guardとrow push対応）の確認" }
  - { role: se, slot_label: "SE — ranking[0]への直接参照化とfallback削除" }
  - { role: qa, slot_label: "QA — U-WBB-004への不変条件assertion追加と空文字列mutationのkill実測" }
  - { role: tl, slot_label: "TL — behavior非変更の境界確認とdigest inventory無変化の実測" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-35-wbb-selected-candidate-dead-path.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/worker-blind-benchmark.ts, artifact_type: source_module }
  - { artifact_path: tests/worker-isolation-broker.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-blind-benchmark.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-risk-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/worker-blind-benchmark.md, artifact_type: design_doc }
dependencies:
  parent: docs/plans/PLAN-L7-504-worker-blind-benchmark.md
  requires:
    - docs/plans/PLAN-L7-504-worker-blind-benchmark.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime, round 1)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-06T17:53:20Z"
    tests_green_at: "2026-08-06T17:50:28Z"
    verdict: request_changes
    worker_model: claude-opus-5
    reviewer_model: claude-sonnet-5
    scope: "単一runtimeのため規定代替のintra_runtime_subagentとして、read-only reviewer subagentがmaterial変更（src/runtime/worker-blind-benchmark.ts 1行、tests/worker-isolation-broker.test.ts assertion 3行、新規PLAN文書）をadversarial review。Critical 0件。Important 1件でverdict request_changes: `helix plan lint <this plan>`がdesign-reality-bindingのstale_source_digest violationを3件（L4-basic-design/worker-blind-benchmark.md:worker-blind-benchmark、L4-basic-design/worker-risk-admission.md:worker-blind-receipt、L5-detail/worker-blind-benchmark.md:worker-blind-benchmark）検出するのに、PLANのgreen_commandsがplan lintを一切cite していなかった。Minor 2件: (1) dependencies.referencesが未mergeブランチ上のPLAN-RECOVERY-34を指しdangling citationになる、(2) 追加assertionは旧式`ranking[0]?.candidate_id ?? \"\"`へのrevert自体はequivalent mutantとしてkill不能（PLAN本文が明示済みの構造的限界）。到達不能性(A)・behavior非変更(B)・receipt_digest不変(C)・assertion非トートロジー性(D)はコードトレースで確認されCritical 0件。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/worker-isolation-broker.test.ts tests/worker-blind-benchmark.test.ts tests/digest.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-06T17:50:21Z", evidence_path: tests/worker-isolation-broker.test.ts, output_digest: "sha256:0406b1b13b657ece6694487763dd7ce71a854042ba911ff65faac45f503f18a1", result: "3 files / 36 tests passed, 1 skipped" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-06T17:50:27Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
      - { kind: lint, command: "npx --no-install biome check src tests", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-06T17:50:28Z", evidence_path: biome.json, output_digest: "sha256:45981ff734eab8a60c8cecc796a5f3ee214ec98fb96c563264602ac750b660f4", result: "773 files checked, 0 error (既存 17 warnings)" }
  - reviewer: "Claude primary runtime (intra-runtime, round 2 — round 1 指摘の実測切り分けと是正)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-06T18:00:30Z"
    tests_green_at: "2026-08-06T18:00:14Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: claude-opus-5
    scope: "round 1のImportant指摘を実測で切り分けた。同一PLANに対する`plan lint`を、(a) 本変更適用後 → design-reality-binding violation 3件、(b) src/runtime/worker-blind-benchmark.tsのみ変更前へ戻した状態 → `design-reality-binding — OK (checked=22)`、として二条件で実行し、当該violationがbaseline debtではなく本変更が起点であることを確定した。design-reality-bindingのsource_digestはsrc/lint/design-reality-binding.ts:709のとおりfile全体sha256の完全一致検査であるため、1行変更でも必ずstaleになる。是正として3 design docのworker-blind-benchmark.ts citationをsha256:55a923a3…からsha256:79efa4bf…（変更後file digest）へ更新し、`design-reality-binding — OK (checked=22)`へ復帰することを再実測。散文・asset_id・artifact_path・resource_nameは不変。round 1のMinor(1)はdependencies.referencesからPLAN-RECOVERY-34を削除して解消。Minor(2)はequivalent mutantという構造的限界の記録であり本文§検証に明記済みのため受容。tests/design-reality-binding.test.tsを含む4 fileで59 passed/1 skipped、tsc exit 0を再実測。merge admissionはGitHub Actions required checkの同一HEAD full CIを外部receiptとする。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/worker-isolation-broker.test.ts tests/worker-blind-benchmark.test.ts tests/digest.test.ts tests/design-reality-binding.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-06T17:58:49Z", evidence_path: tests/worker-isolation-broker.test.ts, output_digest: "sha256:c2c942a28942c5d11258d747136cc6297736751fb510705dc0136753b14f2405", result: "4 files / 59 tests passed, 1 skipped" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-06T17:58:58Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
      - { kind: lint, command: "npx --no-install biome check src tests", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-06T17:50:28Z", evidence_path: biome.json, output_digest: "sha256:45981ff734eab8a60c8cecc796a5f3ee214ec98fb96c563264602ac750b660f4", result: "773 files checked, 0 error (既存 17 warnings)" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-RECOVERY-35-wbb-selected-candidate-dead-path.md", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-06T18:00:14Z", evidence_path: docs/plans/PLAN-RECOVERY-35-wbb-selected-candidate-dead-path.md, output_digest: "sha256:7421f3e27a18f2f29041489ba3cc8a4f201bdb7d0c932e826f5bebef5734429a", result: "design-reality-binding OK (checked=22) を含む全 gate OK" }
---

# PLAN-RECOVERY-35: worker blind benchmark selected_candidate_id dead path 除去

## 根本原因

`src/runtime/worker-blind-benchmark.ts` の `evaluateWorkerBlindBenchmark` は、関数冒頭で
`if (evaluations.length < 2) return failure("WORKER_BLIND_PROVENANCE_DUPLICATE")` により
評価対象が 2 件以上であることを確定させている。続く for-of ループは evaluation 1 件につき
`rows.push(...)` に到達するか `failure` で早期 return するかの二択であり、`rows.length` は
`evaluations.length`（>= 2）と必ず一致する。`ranking` は `rows.map(...)` なので同じく非空である。

しかし receipt payload の構成箇所では
`selected_candidate_id: ranking[0]?.candidate_id ?? ""` と optional chain + 空文字列 fallback を
残しており、この fallback は到達不能な dead path である（issue #379）。
`selected_candidate_id` の空文字列は receipt schema 上「選定なし」という**別の状態**を意味しうるため、
到達不能な fallback が有効値のように見えてしまう。将来 `evaluations.length` の下限を緩めた場合には、
空文字列が silent に receipt へ入り込む穴になる。

## 修復

- `selected_candidate_id` を `ranking[0].candidate_id` への直接参照へ置き換え、
  `?.` / `?? ""` を削除する。behavior 変更なしの refactor。
- 既存 oracle `U-WBB-004`（`tests/worker-isolation-broker.test.ts`）へ不変条件 assertion を追加し、
  `ranking.length >= 2` かつ `selected_candidate_id === ranking[0].candidate_id` かつ
  `selected_candidate_id !== ""` を固定する。新規 oracle ID を起こさないため、
  `docs/test-design/helix/L8-worker-blind-benchmark-unit-test-design.md` の citation 列と
  `tests/design-reality-binding.test.ts` の binding は変更不要である。

## 検証

- red 実測: 修正前に mutation（`selected_candidate_id: ""` のみへ書換）を適用した状態で
  `U-WBB-004` が `AssertionError: expected '' to be 'candidate-b'` で Red
  （2026-08-06T17:46:22Z）。これは fallback 支配化 mutation の kill 証跡でもある。
- green 実測: 修正適用後に `tests/worker-isolation-broker.test.ts` 全体で 27 passed / 1 skipped、
  `worker-blind-benchmark` / `digest` を含む 3 file で 36 passed / 1 skipped
  （2026-08-06T17:46:53Z）。`tsc --noEmit` exit 0（2026-08-06T17:46:46Z）。
- `config/digest-canonicalization-inventory.json` は `scanDigestInventory` の再実測で rows 249 件が
  一致することを確認済み（行数不変の 1 行置換のため再生成不要）。
- `design-reality-binding` は本変更起点で stale 化することを二条件実測で確定した。同一 PLAN への
  `plan lint` を (a) 変更適用後 → violation 3 件、(b) `src/runtime/worker-blind-benchmark.ts` のみ
  変更前へ戻した状態 → `design-reality-binding — OK (checked=22)` として比較し、baseline debt では
  ないことを切り分けている。`source_digest` は `src/lint/design-reality-binding.ts:709` のとおり
  file 全体 sha256 の完全一致検査なので、1 行変更でも必ず stale になる。是正として 3 design doc の
  `worker-blind-benchmark.ts` citation を `sha256:55a923a3…` から `sha256:79efa4bf…` へ更新し、
  `design-reality-binding — OK (checked=22)` へ復帰することを再実測した。
- なお旧コード（`?.` + `??` 残存）そのものは到達不能ゆえ本 oracle では検出不能であり、この性質は
  dead path 除去の本質的な限界として PLAN-RECOVERY-34 と同様に記録する。oracle は
  「`selected_candidate_id` が常に rank 1 の `candidate_id` と一致する」という behavioral contract を
  固定し、fallback が live 化する mutation を kill する。

## 非対象

- `WorkerBlindBenchmarkReceiptV1` schema・ranking 行構成・整列規則・`receipt_digest` の
  canonicalization の変更
- `ranking` 非空性の型表現（non-empty tuple 化）そのもの（別スライスの型表現テーマ。
  `removal_trigger` に記録）
- issue #378（`sealWorkerBlindJudgeContext` の capability 要求 signature 化）— 同一 module を
  触るが behavior contract が別であり、別スライスとして分離する。
