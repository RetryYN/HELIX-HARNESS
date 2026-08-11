---
plan_id: PLAN-RECOVERY-44-mixed-authorship-dual-review
title: "PLAN-RECOVERY-44 (recovery): mixed authorship の dual-review admission"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-11 Issue #539 の deadlock（Hybrid commit stacking が生む混在ブランチが admission を通れない）を自走で解消する"
created: 2026-08-11
updated: 2026-08-11
owner: Claude / TL
github_issue_id: 539
engineering_discipline_required: true
behavior_contract_id: GITHUB-CROSS-REVIEW-ADMISSION-001
responsibility_owner: github-cross-review-admission
change_slice: atomic
refactor_step: modify
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: pure_function
supersedes:
  - PLAN-RECOVERY-43-attestation-merge-parent-detection
backprop_decision: not_required
backprop_decision_reason: "PLAN-RECOVERY-42 が確立し PLAN-RECOVERY-43 が引き継いだ『申告 authorRuntime を commit trailer 実測で検証する』契約自体は維持する。訂正するのは mixed 実測時の帰結だけであり、単一 runtime 申告に対する fail-close は不変。要件・設計契約の追加ではなく、既存契約が未定義だった交差ケース（規定運用である Hybrid commit stacking の帰結）への追随である"
contract_preconditions: "PLAN-RECOVERY-42 は実装 commit 間で trailer の有無が混在する PR を `author_runtime_evidence_mixed` として claude / codex いずれの申告も通さず fail-close する。一方 `CLAUDE.md`「Hybrid 多ランタイム commit 協調」は相手 runtime の commit の上へ自分の成果を積むこと（stack / rebase）を必須運用として規定し、相手 commit の revert / 破棄を禁じている。したがって混在ブランチは事故ではなく規定運用の正常な帰結であり、2026-08-10 の PR #537 を第 1 号として、規定どおり co-manage されたすべての PR が receipt を発行できず merge 不能になる（Issue #539）"
contract_postconditions: "実測が mixed の PR は `authorRuntime: \"mixed\"` を正直に申告した receipt のみ seal できる。mixed receipt は単独では admission を通らず、寄与した各 runtime の分を相手 runtime がレビューした receipt が両方（reviewerRuntime = claude と codex の 2 通）現 HEAD に対して揃ったときだけ ready になる。片方のみ、同一 reviewer の 2 通、mixed と単一申告の混在はいずれも `mixed_author_dual_review_incomplete` で fail-close する。mixed receipt の独立性 authority は『authorModel の runtime が reviewerRuntime と異なること』に置く"
contract_invariants: "単一 runtime authored PR の判定は不変（複数 receipt は従来どおり `review_receipt_conflict`、単一申告に対する mixed 実測は従来どおり `author_runtime_evidence_mixed`）。receipt v3 の schema・digest 計算・既存 error set は不変。provider-neutral v4 経路と Kimi fallback 経路には介入しない。trailer 判定ロジック（行頭一致・merge commit 除外）は PLAN-RECOVERY-43 の parent-count authority のまま。新 workflow・DB table・required check 名を追加しない"
contract_failures: "mixed_author_dual_review_incomplete（mixed authored PR に対し両 runtime の現 HEAD receipt が揃っていない）。author_runtime_attestation_mismatch は逆向きの偽装（単一 runtime authored なのに mixed と申告して dual-receipt 経路へ逃がす試み）も遮断する。既存 failure（author_runtime_evidence_missing / _mixed / _unavailable、review_receipt_invalid_or_stale、review_receipt_conflict）は不変"
tdd_red_required: true
red_at: "2026-08-11T03:48:26Z"
green_at: "2026-08-11T03:50:37Z"
mutation_oracle_evidence: "U-CPRCONV-015b / 015c / U-GCRA-011 に対し mutant 4 種の単独検出性を実測した。M-1: mixed 申告を実測非依存で無条件許可（逆向き偽装の穴）→ 1 failed。M-2: dual 要件を `reviewers.size >= 1` へ弱体化 → 1 failed。M-3: mixed の runtime 独立性検査（authorProvider === reviewerRuntime）を削除 → 1 failed。M-4: 単一 authored PR の複数 receipt conflict を解除 → 2 failed。全 mutant 復元後 44 passed、tsc --noEmit exit 0"
complexity_effect: justified_neutral
complexity_justification: "新 module を作らず、既存 pure core（claude-pr-convergence.ts の型と reviewPairFailure / authorRuntimeAttestationFailure）と admission 判定 1 箇所を拡張する。dual 判定は evaluateGitHubCrossReviewAdmission 内の純関数分岐であり、新しい I/O を持たない"
removal_trigger: "runtime identity が cryptographic に証明可能になり、commit 単位の authorship と reviewer 独立性を receipt 1 通で表現できるようになった場合"
parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md
pair_artifact: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-015b, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-015c, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-GCRA-011, test_path: tests/github-cross-review-admission.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — 正本間交差ケース（Hybrid stacking × attestation）の同定" }
  - { role: se, slot_label: "SE — pure core の mixed 対応と admission dual 判定" }
  - { role: qa, slot_label: "QA — 片側 receipt / 同一 reviewer 2 通 / 逆向き偽装の Red-first oracle" }
  - { role: tl, slot_label: "TL — Claude 著 PLAN のため Codex 独立レビュー必須の確認" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-44-mixed-authorship-dual-review.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/github-cross-review-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/claude-pr-convergence.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/github-cross-review-admission.ts, artifact_type: source_module }
  - { artifact_path: tests/claude-pr-convergence.test.ts, artifact_type: test_code }
  - { artifact_path: tests/github-cross-review-admission.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-RECOVERY-43-attestation-merge-parent-detection.md
  requires:
    - docs/plans/PLAN-RECOVERY-42-author-runtime-attestation.md
    - docs/plans/PLAN-RECOVERY-43-attestation-merge-parent-detection.md
  blocks:
    - issue:539
review_evidence:
  - reviewer: "Codex independent cross-runtime reviewer"
    review_kind: cross_agent
    reviewed_at: "2026-08-11T01:15:09Z"
    tests_green_at: "2026-08-11T01:00:01Z"
    verdict: approve
    scope: "PR #545 current head 830cc81234d6859595327bf22a0e3e27fe759deb: mixed authorship admission now requires exactly one current-head receipt from each independent runtime; duplicate-review negative oracle, canonical digest bindings, and PLAN-RECOVERY-43 parent-count authority were checked."
    worker_model: claude-fable-5
    reviewer_model: gpt-5-codex
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/digest.test.ts tests/plan-descent-specific-parent-binding.test.ts tests/design-reality-binding.test.ts tests/github-cross-review-admission.test.ts --reporter=json"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: tests/github-cross-review-admission.test.ts
        output_digest: "sha256:c847107fa6a5f6a8d7cabf1ae7341ee5a4f9b0addcf35ca3ab82ff18bf135637"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        evidence_path: tsconfig.json
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      - kind: lint
        command: "npx --no-install biome check src/runtime/github-cross-review-admission.ts tests/github-cross-review-admission.test.ts config/digest-canonicalization-inventory.json docs/design/helix/L5-detail/github-cross-review-admission.md"
        runner: node
        scope: changed-files
        exit_code: 0
        evidence_path: src/runtime/github-cross-review-admission.ts
        output_digest: "sha256:f706d864e5d4e23b964531f6078ae790a9fae2b52f67b93a92906c1c75d564c5"
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint --gate governance"
        runner: node
        scope: gate
        exit_code: 0
        evidence_path: docs/plans/PLAN-RECOVERY-44-mixed-authorship-dual-review.md
        output_digest: "sha256:12a079c5432a0319c913786bc562b499dd0b434a38321693b7c5cacaf47b590e"
---

# PLAN-RECOVERY-44：mixed authorship の dual-review admission

## §1 なぜ recovery か

PLAN-RECOVERY-42 は PR #525 の虚偽 authorRuntime 申告を是正するため、実装 commit 間で trailer の
有無が混在する PR を `mixed` として **どの申告も通さず** fail-close した。当時これは部分偽装
（Codex 著 PR へ Claude trailer commit を 1 件混入させる等）の遮断として妥当であった。

しかし `CLAUDE.md`「Hybrid 多ランタイム commit 協調」は、相手 runtime の commit の上へ自分の成果を
積むこと（stack / rebase）を **必須運用として規定**し、相手 commit の revert / 破棄を禁じている。
すなわち混在ブランチは異常ではなく、規定どおり co-manage したときの **正常な帰結**である。
両正本は個別には正しいが、両方が同時に成立する交差ケースが未定義のまま main に入った。

2026-08-10、PR #537（Claude 著、Codex が review evidence 追記と digest 再 pin を積んだ）が
`author_runtime_evidence_mixed` で receipt を発行できず merge 不能になった。CI は green、GitHub 側も
mergeable であり、ブロックしていたのは harness 自前の receipt gate である。これは #537 固有ではなく、
以後すべての co-managed PR に波及する構造欠陥であるため recovery として扱う。

「mixed はいずれの申告も通さない」という帰結は PLAN-RECOVERY-42 が導入し、PLAN-RECOVERY-43
（merge commit を parent 数で判定する是正）がそのまま引き継いだ。したがって現在この帰結の authority を
持つのは PLAN-RECOVERY-43 であり、本 PLAN は **PLAN-RECOVERY-43 を supersede** する
（PLAN-RECOVERY-43 側に後継名を含む correction note を置く）。attestation の中核（申告値を実測で
検証する）と parent 数による merge commit 判定は訂正せず維持する。

なお PLAN-RECOVERY-43 は、subject 判定による **false positive の mixed**（PR #517 型）を除去した。
本 PLAN が扱うのはそれとは別の、**真正な mixed**（両 runtime の parent 1 実装 commit が同居する
PR #537 型）である。両者は排他ではなく順に必要である。

## §2 なぜ「単に mixed を許す」ではないのか

mixed を単一 runtime と同格に受理すると、独立性が壊れる。混在ブランチで Codex が receipt を出せば、
Codex 自身が書いた commit を Codex がレビューしたことになる（#537 では `fec283de` が実コード / config の
pin 変更であり、自己レビューは実質的な穴になる）。

そこで本 PLAN は受理条件を **緩めるのではなく分割** する。

- 各 receipt は「**相手 runtime が書いた分を自分がレビューした**」証跡と定義する。
- したがって mixed receipt の独立性 authority は `authorRuntime !== reviewerRuntime` ではなく
  **`authorModel` の runtime が `reviewerRuntime` と異なること**に置く。
- 寄与した各 runtime の分を相手がレビューした receipt が **両方**揃って初めて、ブランチ全体が
  独立レビュー済みになる。片方だけでは、その reviewer 自身の commit が自己レビューのまま残る。

結果として mixed の admission 条件は単一 authored PR より **厳しい**（receipt 1 通 → 2 通）。

## §3 変更境界

| 対象 | 変更 |
|---|---|
| `src/runtime/claude-pr-convergence.ts` | `AttestedAuthorRuntime`（= runtime ∪ `"mixed"`）を追加し `authorRuntime` の型を拡張。`authorRuntimeAttestationFailure` は実測 mixed に対し mixed 申告のみ受理。`reviewPairFailure` は mixed 時に authorModel の runtime で独立性を判定 |
| `src/runtime/github-cross-review-admission.ts` | `evaluateGitHubCrossReviewAdmission` に dual 判定を追加。valid receipt に mixed が 1 通でもあれば、全 valid が mixed かつ reviewerRuntime が両 runtime を覆うことを要求し、digest は receipt digest 群を canonical 順に束ねた 1 値へ確定させる |
| L5 設計 / L8 テスト設計 | mixed の判定順序と oracle（U-CPRCONV-015b / 015c、U-GCRA-011）を追記 |

## §4 攻撃面の評価

- **逆向きの偽装**（単一 runtime authored なのに mixed と申告し、緩い経路へ逃げる）: 実測値と一致しない
  ため `author_runtime_attestation_mismatch` で遮断される。そもそも mixed 経路は receipt 2 通を要するので
  逃げ道として機能しない。
- **頭数合わせ**（同一 reviewer が 2 通発行）: reviewerRuntime の集合が両 runtime を覆わないため
  `mixed_author_dual_review_incomplete` で遮断される。
- **混在申告の混ぜ込み**（mixed 1 通 + 単一申告 1 通）: 全 valid が mixed であることを要求するため遮断される。
- **限界**: PLAN-RECOVERY-42 と同じく、これは cryptographic identity ではなく自己整合検査である。
  trailer を改変できる者は依然として実測値を動かせる。本 PLAN はその限界を引き継ぐ（`removal_trigger` 参照）。

## §5 レビュー分離

本 PLAN は Claude 著であり、かつ Claude 自身が #537 でブロックされている当事者である。したがって
gate を緩める方向の自己都合判断が混入していないかを Codex の独立レビューで検証する必要がある。
本 PLAN 自体は単一 runtime authored（Claude trailer のみ）で起票するため、通常の cross-review
admission（Codex による現 HEAD receipt 1 通）で成立し、循環しない。
