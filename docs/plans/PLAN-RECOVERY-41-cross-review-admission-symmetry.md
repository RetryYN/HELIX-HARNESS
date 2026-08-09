---
plan_id: PLAN-RECOVERY-41-cross-review-admission-symmetry
title: "PLAN-RECOVERY-41 (recovery): cross-review admission receiptのauthor↔reviewer対称化"
kind: recovery
layer: cross
drive: agent
status: draft
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-10 Issue #514のcross-review admission対称化をcurrent gateを迂回せず原子的に回復する"
created: 2026-08-10
updated: 2026-08-10
owner: Codex / TL
github_issue_id: 514
engineering_discipline_required: true
behavior_contract_id: GITHUB-CROSS-REVIEW-ADMISSION-001
responsibility_owner: github-cross-review-admission
change_slice: atomic
refactor_step: modify
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "PLAN-RECOVERY-40が凍結した設計は§1で「自己申告runtime identityをcanonical receiptへ昇格しない」、§2.2で「runtime独立性」と対称に書かれているが、実装は`authorRuntime: \"codex\"` / `reviewerRuntime: \"claude\"`のliteral固定型と`authorRuntime === \"codex\" && reviewerRuntime === \"claude\"`の片方向判定になっている。provider-neutral v4は`reviewer_provider: \"kimi\"`とfallback chainを前提とするため通常のClaude-authored PRの受け皿にならない。結果としてauthor=claudeのPRはcanonical receiptを構築できず`current_head_review_receipt_missing`で必ずredになる"
contract_postconditions: "current receiptをv3へ上げ、author/reviewer runtimeとmodelをcanonical digestへ束縛する。方向対称性と`checkCrossAgentModelPair`による別model/provider familyをvalidatorでfail-closeし、author=claude / reviewer=codexと逆方向を同一経路で受理する。v2はbyte互換historical decodeだけに残し、Ready admissionはv3を必須にする。identity/session/contextおよびreview input manifest/findingの非自己申告 provenanceは別blocking child Issueで扱い、本PLANは主張しない。"
contract_invariants: "v2 bytesはhistorical decodeとして不変に維持し、旧builderと同じHEAD、CI、verdict、DB収束、URL、時刻の意味検証を再実行する。current v3のdigestはmodel fieldsを含む。新workflow・service・DB table・required check名を追加しない。stale HEAD、事後発行、別PR、別repository、重複receipt、approve+blocker、DB非収束の拒否は現行のまま維持する。branch protection設定変更は本責務に含めない"
contract_failures: "runtime_identity_invalid（未知runtime識別子）、runtime_independence_missing（author===reviewer）、model_independence_missing（missing／unknown／same model/provider）、model_runtime_binding_mismatch（runtimeとmodel providerの不一致）をreceipt構築時のstable errorとして返す。current admissionはv2または不正receiptをcanonicalへ昇格せず`current_head_review_receipt_missing`へ落とす"
tdd_red_required: true
red_at: "2026-08-10T00:12:00Z"
green_at: "2026-08-10T00:19:00Z"
mutation_oracle_evidence: "実装前ソース（origin/main 5d28912d）へ一時的に戻して新oracle 5件を実行し、U-CPRCONV-007／008／009・U-GCRA-006／007がいずれもRedになることを実測した（5 failed / 27 passed）。実装後は32 passed。U-GCRA-007は初版がdigest改変検知に吸収されて実装前でもGreenだったため、digestまで整合したself-review receiptを手組みする形へ強化し、独立性判定だけを分離して測るRedへ作り直した"
complexity_effect: justified_neutral
complexity_justification: "新module・service・workflowを作らず、既存receipt validatorへmodel pairを追加する。GitHub admission、Issue closure、Kimi bootstrapに重複していたcomment decodeを1つのshared decoderへ削減し、runtime/model判定も同一moduleのpair coreへ統合する"
removal_trigger: "canonical receiptがruntime識別子ではなくcryptographic runtime identityで独立性を証明できるようになった場合"
parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md
pair_artifact: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-GCRA-006, test_path: tests/github-cross-review-admission.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-GCRA-007, test_path: tests/github-cross-review-admission.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-GCRA-008, test_path: tests/github-cross-review-admission.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-010, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-011, test_path: tests/claude-pr-convergence.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — 要件の対称条件と実装の片方向固定の乖離監査" }
  - { role: se, slot_label: "SE — runtime型と独立性判定の対称化" }
  - { role: qa, slot_label: "QA — 双方向受理・self-review拒否・後方互換のRed-first oracle" }
  - { role: tl, slot_label: "TL — 修正PR自身がgateを通過できることの確認" }
generates:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/github-cross-review-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: config }
  - { artifact_path: docs/plans/PLAN-RECOVERY-41-cross-review-admission-symmetry.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/adapters/github-issue-closure-graph.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/claude-pr-convergence.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/github-cross-review-admission.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/independent-review-fallback.ts, artifact_type: source_module }
  - { artifact_path: tests/claude-pr-convergence.test.ts, artifact_type: test_code }
  - { artifact_path: tests/github-cross-review-admission.test.ts, artifact_type: test_code }
  - { artifact_path: tests/github-issue-closure-graph-adapter.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-RECOVERY-40-github-cross-review-admission.md
  requires:
    - docs/plans/PLAN-RECOVERY-40-github-cross-review-admission.md
  blocks:
    - issue:514
---

# PLAN-RECOVERY-41：cross-review admission の対称化

## §1 なぜ recovery か

PLAN-RECOVERY-40 が凍結した設計は最初から対称である。L5 §1 は「自己申告 runtime identity を canonical
receipt へ昇格しない」と書き、§2 の判定順序 2 は「runtime 独立性」と書く。Issue #489 の Required behavior も
「authoring runtime と reviewer runtime/model family の独立性」であり、どちらが author かを固定していない。

実装だけが片方向に固定されていた。したがって本 PLAN は設計変更ではなく、**設計に実装を追随させる recovery**
である。PLAN-RECOVERY-40 の claim を訂正するものではないため `supersedes` は宣言しない。

## §2 実測した実害

2026-08-09T14:41:03Z に PR #494 が main へ入って以降、Claude-authored PR は canonical receipt を構築できず
`current_head_review_receipt_missing` で必ず red になる。PR #506（Issue #215 の L6/L7 スライス）は
`harness-check` の他ステップが全て success、独立レビュー approve / blockers 0 でありながら、この 1 gate だけで
merge 不能になっていた。

`authorRuntime` に事実と異なる `"codex"` を宣言すれば gate は通るが、それは admission evidence の捏造であり
選択肢にしない。

## §3 変更境界

| 対象 | 変更 |
|---|---|
| `src/runtime/claude-pr-convergence.ts` | current receiptをv3へ上げ、runtime/modelをdigestへ含める。runtimeの方向差、model/provider family差、runtime↔model provider対応を共通pair coreで検査する。v2 historical/current v3を読むcanonical comment decoderを所有する |
| `src/runtime/github-cross-review-admission.ts` | canonical decoderを再利用しcurrent v3だけをReady admissionへ昇格する。v2をcurrent evidenceとして拒否する |
| `src/adapters/github-issue-closure-graph.ts` | human prose regexを廃止し、shared decoderでv2 historicalとv3 currentを読む |
| `src/runtime/independent-review-fallback.ts` | Kimi bootstrapのClaude verifier evidenceをshared decoderへ接続し、v2 historical compatibilityを維持する |
| `src/cli.ts` | current comment markerをv3へ更新し、人間可読行に実際のauthor/reviewer runtimeを出す |
| 設計・テスト設計・inventory | v3/v2境界、model pair、consumer exact set、digest hitとReality Bindingを同期する |

current v3はmodel fieldsを含むためv2とdigestが異なる。後方互換とは、**既存v2 bytesとdigestを変更せず、
Issue closure／Kimi bootstrapのhistorical evidenceとしてshared decoderが読めること**を指す。Ready admissionと
`loadClaudePrReviewReceipt`はv3のみをcurrent evidenceとして受理する。

## §4 独立性判定の単一 authority と、到達不能になった分岐の削除

runtime/model独立性のauthorityは`claude-pr-convergence.ts`の共通pair coreである。receipt構築・v3 validator・
`pr-merge-reviewed`判定は同じcoreを使い、consumerはcanonical decoderの成否を再利用する。

| 経路 | fail-close する場所 | error |
|---|---|---|
| Claude/Codex v3 | `buildClaudePrReviewReceipt`／`validateClaudePrReviewReceipt` | `runtime_independence_missing`、`model_independence_missing`、`model_runtime_binding_mismatch` |
| Claude/Codex v2 | historical decoderのみ | current Readyでは`current_head_review_receipt_missing` |
| provider-neutral v4 | `validateProviderNeutralReviewReceipt`（既存） | `provider_neutral_receipt_invalid` |

`extractReceipt` は両 validator の例外を捕捉して `null` を返すため、非独立 receipt は admission の判定式へ
到達しない。

admission側にbooleanの独立性再判定を複製しない。v3はshared decoderのvalidator、v4は既存validatorを通過した
receiptだけが候補集合へ入る。merge判定は同じv3 pair coreを再利用し、validatorを迂回したtyped objectも拒否する。

`U-GCRA-007`がself-review decode failure、`U-GCRA-008`がv2 current昇格拒否、`U-CPRCONV-010`が
model/provider pairとruntime対応、`U-CPRCONV-011`がshared v2/v3 decoderを押さえる。既存v4 validator oracleは
Kimi側を維持する。

## §5 完了条件

- U-CPRCONV-007〜011、U-GCRA-006〜008がRed-firstまたは既存historical fixtureからgreen。
- 既存の U-CPRCONV-001/004/006、U-GCRA-001〜005、Kimi fallback、workflow、atomic slice admission が回帰なし。
- typecheck、Biome、PLAN governance、doctor、full CI が同一 HEAD で green。
- **本PR自身がcurrent v3 gateをdogfoodする**。逆方向（author=claude / reviewer=codex）は実行oracleで閉じ、
  実行時actor/input/finding provenanceを追加するblocking child Issue #519のPRで実運用E2Eを行う。#519がclosedに
  なるまで親Issue #489の完了は主張しない。
