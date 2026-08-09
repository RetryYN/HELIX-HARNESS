---
plan_id: PLAN-RECOVERY-41-cross-review-admission-symmetry
title: "PLAN-RECOVERY-41 (recovery): cross-review admission receiptのauthor↔reviewer対称化"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-10 Issue #514のcross-review admission対称化をClaudeが実装しCodexがレビューする"
created: 2026-08-10
updated: 2026-08-10
owner: Claude / TL
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
contract_postconditions: "canonical receiptのauthor/reviewer runtimeを`IndependentReviewRuntime`（claude|codex）として型付けし、独立性を向きではなく差で判定する。author=claude / reviewer=codexの受理とauthor=codex / reviewer=claudeの後方互換を同一経路で成立させる。同一runtimeのself-reviewは`buildClaudePrReviewReceipt`が`runtime_independence_missing`でfail-closeするため、canonical receiptとしてdecodeできない。未知runtime識別子は`runtime_identity_invalid`で拒否する。`evaluateClaudePrMerge`も同じ対称式へ揃える。runtime独立性の単一authorityはreceipt validator（v2=`buildClaudePrReviewReceipt`、v4=`validateProviderNeutralReviewReceipt`）であり、admission側の再判定は到達不能になったため削除する。receipt commentの人間可読行は実際のauthor/reviewer runtimeを表示する"
contract_invariants: "receipt payloadのfield集合とcanonical digest算出は不変であり、既存のcodex/claude receiptのreceiptId・receiptDigestは変化しない。新workflow・service・DB table・required check名を追加しない。stale HEAD、事後発行、別PR、別repository、重複receipt、approve+blocker、DB非収束の拒否は現行のまま維持する。branch protection設定変更は本責務に含めない"
contract_failures: "runtime_identity_invalid（未知runtime識別子）、runtime_independence_missing（author===reviewer）をreceipt構築時のstable errorとして返す。admission側は同一runtime receiptをdecodeできないため`current_head_review_receipt_missing`へ落とす"
tdd_red_required: true
red_at: "2026-08-10T00:12:00Z"
green_at: "2026-08-10T00:19:00Z"
mutation_oracle_evidence: "実装前ソース（origin/main 5d28912d）へ一時的に戻して新oracle 5件を実行し、U-CPRCONV-007／008／009・U-GCRA-006／007がいずれもRedになることを実測した（5 failed / 27 passed）。実装後は32 passed。U-GCRA-007は初版がdigest改変検知に吸収されて実装前でもGreenだったため、digestまで整合したself-review receiptを手組みする形へ強化し、独立性判定だけを分離して測るRedへ作り直した"
complexity_effect: justified_neutral
complexity_justification: "型の拡張と2箇所の判定式の対称化だけで、新規module・分岐・依存を増やさない。むしろ`atomic-slice-admission.ts`が既に持つ対称なself-review拒否と表現を揃え、同一repository内で独立性判定が2系統に割れている状態を解消する"
removal_trigger: "canonical receiptがruntime識別子ではなくcryptographic runtime identityで独立性を証明できるようになった場合"
parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md
pair_artifact: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-GCRA-006, test_path: tests/github-cross-review-admission.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-GCRA-007, test_path: tests/github-cross-review-admission.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — 要件の対称条件と実装の片方向固定の乖離監査" }
  - { role: se, slot_label: "SE — runtime型と独立性判定の対称化" }
  - { role: qa, slot_label: "QA — 双方向受理・self-review拒否・後方互換のRed-first oracle" }
  - { role: tl, slot_label: "TL — 修正PR自身がgateを通過できることの確認" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-41-cross-review-admission-symmetry.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/claude-pr-convergence.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/github-cross-review-admission.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/github-cross-review-admission.test.ts, artifact_type: test_code }
  - { artifact_path: tests/claude-pr-convergence.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-RECOVERY-40-github-cross-review-admission.md
  requires:
    - docs/plans/PLAN-RECOVERY-40-github-cross-review-admission.md
  blocks:
    - issue:514
review_evidence:
  - reviewer: "Codex independent review (cross-runtime)"
    review_kind: cross_runtime
    reviewed_at: "2026-08-10T01:05:00Z"
    tests_green_at: "2026-08-10T01:02:00Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: gpt-5.6-sol
    scope: "authoring runtimeと別runtimeのCodexが`helix codex --role code-reviewer`（FR-09 sealed worker context、read-only）で2ラウンドreviewした。1回目changes-requested（Critical 0 / Important 1 / Minor 0）。Important-1=PLAN §4とL5 §2が『v2ではself-reviewがdecode前に落ちるがprovider-neutral v4では`independent`へ到達するので多層fail-closeである』と主張していたが事実に反する。v4も`validateProviderNeutralReviewReceipt`が`declared_author_runtime === reviewer_runtime`をdecode前に拒否するため（independent-review-fallback.ts:1609）、v2へ構築時fail-closeを入れた時点で`independent === false`はどちらの経路からも到達不能になっていた。到達不能にしたのは本PLANの変更自身である（変更前はv2のruntimeを検証しておらず、digestを整合させた手組みJSONなら到達し得た）。是正: 主張を書き換えるのではなく到達不能分岐そのもの（`receiptFields`の型field、v2/v4の代入、`valid` filterの条件）を削除し、runtime独立性の単一authorityがreceipt validatorであることを`extractReceipt`・L5 §2・PLAN §4・contract_postconditionsへ明記した。2回目approve（Critical 0 / Important 0 / Minor 1）。Minorは§3変更境界表が最終実装と不一致で、これも是正済み。reviewerはdigestを再計算した手組みv2／v4 self-review receiptを自ら構成して両方が拒否されることを実測し、validatorを通過しつつ同一runtimeとなるreceiptが構成できないことを確認した。後方互換は旧builder（origin/main 5d28912d）と新builderへ同一payloadを渡してreceiptId／receiptDigestの完全一致を実測し、Red-firstは/tmpへorigin/mainを展開して新oracle 5件が正しい理由でRedになることを独立再現した"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/claude-pr-convergence.test.ts tests/github-cross-review-admission.test.ts tests/independent-review-fallback.test.ts tests/kimi-review-admission-bench.test.ts tests/atomic-slice-admission.test.ts tests/design-reality-binding.test.ts tests/harness-check-workflow.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-10T01:02:00Z", evidence_path: tests/github-cross-review-admission.test.ts, output_digest: "sha256:076ce18a4f9c84e3076ba27f7a6c3a8521d1531ba32ffdc4f936f17914b81ec9", result: "7 files / 166 tests green（新規U-CPRCONV-007..009・U-GCRA-006/007と、Kimi fallback・atomic slice admission・design-reality-binding・workflowの回帰を含む）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-10T01:02:00Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0（出力なし）" }
      - { kind: lint, command: "npm run lint", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-10T01:02:00Z", evidence_path: biome.json, output_digest: "sha256:6a7901aaeef52a299307bcbab8d86bcd9b42f0204ac6331bae6a3d2bad02873f", result: "exit 0（error 0、warning 18は既存debtで純増0）" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-10T01:05:00Z"
  review_binding:
    reviewer: "Codex independent review (cross-runtime)"
    reviewed_at: "2026-08-10T01:05:00Z"
    evidence_digest: "sha256:b403553efb77c0055d6e8e36d6080a89208eb239867162f30b03f6ee96c39e94"
  entries: []
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
| `src/runtime/claude-pr-convergence.ts` | `IndependentReviewRuntime` 型と `INDEPENDENT_REVIEW_RUNTIMES` を追加。receipt input の 2 field を literal 固定から同型へ。構築時に未知 runtime と self-review を fail-close。`evaluateClaudePrMerge` の独立性判定を対称式へ |
| `src/runtime/github-cross-review-admission.ts` | validator 通過後は到達不能となった admission-side の `independent` field・v2/v4 の代入・`valid` filter 条件を削除（§4） |
| `src/cli.ts` | receipt comment の人間可読行に実際の author/reviewer runtime を出す |

receipt payload の field 集合と digest 算出は触らない。したがって **既存の codex/claude receipt の
`receiptId` / `receiptDigest` は変化しない**（後方互換）。

## §4 独立性判定の単一 authority と、到達不能になった分岐の削除

runtime 独立性の唯一の authority は **receipt validator** である。

| 経路 | fail-close する場所 | error |
|---|---|---|
| Claude v2 | `buildClaudePrReviewReceipt`（本 PLAN で追加） | `runtime_independence_missing` |
| provider-neutral v4 | `validateProviderNeutralReviewReceipt`（既存、`independent-review-fallback.ts:1609`） | `provider_neutral_receipt_invalid` |

`extractReceipt` は両 validator の例外を捕捉して `null` を返すため、非独立 receipt は admission の判定式へ
到達しない。

初版はここを取り違えていた。admission 側にも `independent` の再判定を置き、「v2 では到達しないが
provider-neutral v4 では到達するので多層 fail-close である」と書いていた。**これは誤りで**、v4 側も
validator が同一 runtime を decode 前に落とすため、v2 に構築時 fail-close を入れた時点で
`independent === false` は**どちらの経路からも到達不能**になっていた。到達不能にしたのは本 PLAN の変更自身で
ある（変更前は v2 の runtime を検証していなかったため、digest を整合させた手組み JSON なら到達し得た）。

独立レビュー（Codex、cross-runtime）が `independent-review-fallback.ts:1609` を根拠にこれを実証したので、
主張を訂正するのではなく **到達不能になった分岐そのものを削除**した。「多層 fail-close」として残すと、
実行され得ない分岐を検証済みと誤読させる。

`U-GCRA-007` が v2 の decode 段階 fail-close を、既存の v4 validator oracle が v4 側をそれぞれ押さえる。

## §5 完了条件

- U-CPRCONV-007/008/009、U-GCRA-006/007 が Red-first で追加され green。
- 既存の U-CPRCONV-001/004/006、U-GCRA-001〜005、Kimi fallback、workflow、atomic slice admission が回帰なし。
- typecheck、Biome、PLAN governance、doctor、full CI が同一 HEAD で green。
- **本 PR 自身がこの gate を dogfood する**。`harness-check` は PR head の sha を checkout するため、対称化を
  含む PR は自身の修正済みロジックで判定される。したがって author=claude / reviewer=codex の receipt を
  この PR に対して発行でき、chicken-and-egg は成立しない。
