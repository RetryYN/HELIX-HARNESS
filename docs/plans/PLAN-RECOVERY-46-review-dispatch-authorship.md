---
plan_id: PLAN-RECOVERY-46-review-dispatch-authorship
title: "PLAN-RECOVERY-46 (recovery): review 依頼の dispatch を authoring runtime の実測へ束縛する"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-11 PO 指示「自走しろ」。Issue #551（review 依頼の dispatch が authoring runtime を判定せず Claude 著 PR を Claude 自身へ送る）を自走で解消する"
created: 2026-08-11
updated: 2026-08-11
owner: Claude / TL
github_issue_id: 551
engineering_discipline_required: true
behavior_contract_id: CLAUDE-REVIEW-DISPATCH-001
responsibility_owner: claude-memory-wake
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: pure_function
backprop_decision: not_required
backprop_decision_reason: "cross-review の独立性要件そのものは既存契約のままである。変更するのは『その要件を admission gate だけでなく dispatch 時点でも満たす』という適用位置であり、要件・設計契約の追加ではない"
contract_preconditions: "publishClaudePrReviewRequest は対象 PR の authoring runtime を一切判定せずに Claude 収束レーンへ review 依頼を publish する。依頼本文は『Codexが作成または更新したPR』と断定するため、Claude 著の PR が Claude 自身へ自己レビュー要求として届く。受け手は CI 完走まで待ってから attestation gate に弾かれる（実測: PR #517 で約 20 分の CI を空費し、当方が一度 authorRuntime=codex と誤認して receipt 発行を試みた）"
contract_postconditions: "dispatch は commit trailer の実測値を必須入力として受け取る。measured=claude の PR は Claude inbox へ publish せず claude_self_review_request_rejected で fail-close する。measured=codex と measured=mixed は publish し、依頼本文には実測値（measured_author_runtime）を記載して受け手が authorship を誤認できないようにする。evidence が取得できない場合は推測せず author_runtime_evidence_unavailable で fail-close する"
contract_invariants: "attestation gate（authorRuntimeAttestation / authorRuntimeAttestationFailure）の判定は不変であり、本 PLAN は gate を緩めない。receipt schema・digest 計算・既存 failure code は不変。trailer 判定（行頭一致・parent 数 2 以上の merge commit 除外）は PLAN-RECOVERY-43 のまま。Kimi fallback 経路と provider-neutral v4 経路には介入しない。新 workflow・DB table・required check 名を追加しない"
contract_failures: "claude_self_review_request_rejected（Claude 著 PR を Claude 収束レーンへ回そうとした）。author_runtime_evidence_unavailable（runner 非 0 exit、空 evidence、形式不正のいずれか）。pr_dispatch_identity_mismatch / pr_dispatch_head_invalid / pr_dispatch_base_branch_invalid（配送identityが不正。evidence取得前に拒否する）"
tdd_red_required: true
red_at: "2026-08-11T03:47:24Z"
green_at: "2026-08-11T03:53:37Z"
mutation_oracle_evidence: "seeded defect 3 種を 1 件ずつ注入し、各 mutant が単独で killed になることを実測した。M-1（src/runtime/claude-memory-wake.ts: claudeReviewDispatchAllowed を `return true` へ弱体化し自己レビュー遮断を無効化）→ tests/claude-memory-wake.test.ts::U-MEMWAKE-002 が 1 failed で killed。M-2（同関数を `authorRuntime === \"codex\"` へ変え mixed まで過剰遮断）→ tests/claude-memory-wake.test.ts::U-MEMWAKE-002 が 1 failed で killed。M-3（src/runtime/claude-pr-convergence.ts: measureAuthorRuntime の空 evidence 判定を外し commit 0 件を codex とみなす）→ tests/claude-pr-convergence.test.ts::U-CPRCONV-021 が 1 failed で killed。全 mutant 復元後 tests/claude-pr-convergence.test.ts + tests/claude-memory-wake.test.ts で 39 passed（2026-08-11T03:53:37Z）"
complexity_effect: net_neutral
parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md
pair_artifact: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-MEMWAKE-002, test_path: tests/claude-memory-wake.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-021, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-022, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-MEMWAKE-003, test_path: tests/claude-memory-wake.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — gate と dispatch の責務分離の同定" }
  - { role: se, slot_label: "SE — dispatch 入力の必須化と実測・許可判定の単一 core 境界" }
  - { role: qa, slot_label: "QA — claude 遮断 / codex 通過 / mixed 通過 / evidence 不在の 4 分岐 oracle" }
  - { role: tl, slot_label: "TL — Claude 著 PLAN のため Codex 独立レビュー必須の確認" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-46-review-dispatch-authorship.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/claude-memory-wake.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/author-runtime-evidence.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/claude-pr-convergence.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/claude-memory-wake.test.ts, artifact_type: test_code }
  - { artifact_path: tests/claude-pr-convergence.test.ts, artifact_type: test_code }
  - { artifact_path: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-RECOVERY-42-author-runtime-attestation.md
    - docs/plans/PLAN-RECOVERY-43-attestation-merge-parent-detection.md
  blocks:
    - issue:551
review_evidence:
  - reviewer: "Codex TL independent cross-runtime reviewer"
    review_kind: cross_agent
    reviewed_at: "2026-08-11T07:44:49Z"
    tests_green_at: "2026-08-11T07:41:28Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: codex-gpt-5
    scope: "PR #557 に対する Codex TL の独立 cross-runtime review。verdict=approve、Critical 0 / Important 0 / Minor 0。review URL = https://github.com/RetryYN/HELIX-HARNESS/pull/557#pullrequestreview-4903993028（reviewed_at 2026-08-11T07:44:49Z）。review 対象 commit / head = e63cdc59b8ae45124ec792fbea7f3166157f538e。dispatch 層で authoring runtime を実測へ束縛する技術判断（measured=claude を claude_self_review_request_rejected で fail-close し、codex / mixed は publish、evidence 不在は author_runtime_evidence_unavailable で fail-close する 4 分岐）について承認を受けた。本 entry は技術承認であり、GitHub merge admission 用の canonical receipt は terminal CI 後に別途 seal される（本 entry はそれを代替しない）"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/claude-pr-convergence.test.ts tests/claude-memory-wake.test.ts --reporter=json", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-11T07:41:08Z", evidence_path: tests/claude-memory-wake.test.ts, output_digest: "sha256:8a780c4036379eb0ace2559e2085b81a5c2774853e059924ee5b36303d220d3f", result: "Vitest JSON reporter 実出力の SHA-256。41 passed / 0 failed（tests/claude-memory-wake.test.ts::U-MEMWAKE-002 と tests/claude-pr-convergence.test.ts::U-CPRCONV-021 を含む 2 suite 同時実行）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-11T07:41:28Z", evidence_path: src/runtime/claude-memory-wake.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0（出力 0 byte = 空出力の SHA-256）" }
---

# PLAN-RECOVERY-46：review 依頼の dispatch を authoring runtime の実測へ束縛する

## §1 なぜ recovery か

cross-review の独立性は「著者と reviewer が別 runtime であること」で担保される。ところが
`publishClaudePrReviewRequest`（`src/runtime/claude-memory-wake.ts`）は、対象 PR の authoring runtime を
**一切判定せずに** Claude 収束レーンへ review 依頼を publish していた。

さらに依頼本文が「Codexが作成または更新したPRをClaude Code収束レーンで処理してください」と
**断定**していたため、受け手が素直に従うと自己レビュー receipt の発行を試みることになる。

独立性の判定が admission gate にしか存在せず、dispatch 層には無い。gate が最後の砦として
機能してはいるが、それは「設計意図が 1 箇所でしか守られていない」ことを意味する。

## §2 実害（推測ではなく実測）

2026-08-11 に 2 件発生した。

- **PR #517**: 依頼が Claude へ届いたが、実装 commit（parent 1）3 件すべてに Claude trailer があり
  `measuredAuthorRuntimeFromCommits` = `claude`。当方は依頼本文の断定を信じて一度
  `authorRuntime: "codex"` で receipt を発行しようとし、attestation gate に
  `author_runtime_attestation_mismatch` で拒否された。**約 20 分の CI を空費した**。
- **PR #550**: Claude が作成した PR に対し、同じ文面の依頼が Claude へ届いた（measured = `claude`）。

いずれも gate が fail-close したため admission の捏造には至っていない。しかし
「gate が最後の砦になっているだけ」であり、往復コストと authorship 誤認のリスクは残る。

## §3 変更内容

### §3.1 実測 core（`claude-pr-convergence.ts`）

`measureAuthorRuntime` を追加する。attestation が「**申告が正しいか**」を検査するのに対し、
本関数は申告が存在しない段階で「**誰が書いたか**」を返す。

```ts
export function measureAuthorRuntime(input: {
  repository: string;
  prNumber: number;
  run: AuthorRuntimeEvidenceRunner;
}): { ok: true; measured: MeasuredAuthorRuntime } | { ok: false; failure: string };
```

runner 非 0 exit / 空 evidence / 形式不正はいずれも `author_runtime_evidence_unavailable` で
fail-close する。**推測して publish しない**。evidence query の生成は既存の
`authorRuntimeEvidenceArgs` を再利用し、cli 側に判断を残さない（PLAN-RECOVERY-42 で
Codex が指摘した「cli に残した処理は oracle の届かない面になる」を踏襲する）。

### §3.2 dispatch の fail-close（`claude-memory-wake.ts`）

`publishClaudePrReviewRequest` の入力に `authorRuntime` を**必須**で追加し、
`claudeReviewDispatchAllowed` が false を返す場合は publish 前に throw する。

| measured | dispatch | 理由 |
|---|---|---|
| `claude` | **拒否** | Claude 収束レーンへ回すと自己レビュー要求になる |
| `codex` | 許可 | 従来どおり |
| `mixed` | 許可 | 寄与した codex 分を Claude がレビューする必要がある（Issue #539 の dual review） |

依頼本文からは「Codexが作成または更新したPR」という断定を削除し、
`measured_author_runtime: <値>` を記載する。mixed の場合は「claude 著の寄与は Codex 側の
receipt が必要」であることも明示する。

### §3.3 呼び出し側（`cli.ts`）

`github pr-notify` と `github pr-create --claude-converge` の 2 経路で、publish 前に
`measureAuthorRuntimeForDispatch` を通す。実測不能または measured=claude なら非 0 exit で停止する。

## §4 検証

- `U-MEMWAKE-002`: claude 拒否 / codex 通過 / mixed 通過 の 3 分岐と、本文に実測値が入り
  旧断定文が消えていることを押さえる。
- `U-CPRCONV-021`: 実測値の正例 2 種、fail-close 3 種（非 0 exit / 空 stdout / 形式不正）、
  および runner へ canonical query がそのまま渡ることを押さえる。
- `U-CPRCONV-022`: `dispatchMeasuredPrToClaude` が実測・allow-list 判定・publish を単一 core
  境界で実行し、URL/repository/PR番号/40桁HEAD/非空baseをevidence取得前に検証する。codex は発行、claude は自己 review として拒否、evidence 不在は拒否することを
  実配送 artifact まで確認する。CLI 2 経路はこの core に GitHub runner を渡すだけとする。
- `U-MEMWAKE-003`: 汎用 builder と汎用 publisher の双方が `claude-inbox:pr:` 予約 namespace
  を拒否する。payload・origin・URLをcanonicalに偽造しても、measured dispatch coreを通らない
  直接publishは `measured_pr_review_dispatch_required` で停止する。汎用 `helix memory write --v2`
  から同じkey・payload・provenanceを与える実CLI反例も非0 exitになる。

mutation は frontmatter の `mutation_oracle_evidence` に実測値を記録した。M-2（mixed まで
過剰遮断）が単独で killed になることは、`mixed` を通す判断が oracle で明示的に固定されている
ことを意味する。ここを緩めると Issue #539 の dual review が dispatch 側で成立しなくなる。

## §5 範囲外

- **bot 著 PR の誤帰属**（Issue #553）。`measuredAuthorRuntimeFromCommits` は
  `claude` / `codex` / `mixed` の 3 値しか返せず「不明」を表現できないため、trailer を持たない
  Dependabot 等の PR を `codex` と測定する。本 PLAN は dispatch の宛先判定だけを扱い、
  測定語彙の拡張には介入しない。
- **attestation gate の緩和**。本 PLAN は gate を一切変更しない。dispatch を厳しくするだけである。
