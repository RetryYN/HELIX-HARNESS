---
plan_id: PLAN-RECOVERY-42-author-runtime-attestation
title: "PLAN-RECOVERY-42 (recovery): 申告authorRuntimeのcommit trailer実測attestation"
kind: recovery
layer: cross
drive: agent
status: draft
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-10 Issue #534の虚偽authorRuntime receipt（PR #525）を是正し、申告値を実測で検証する再発防止gateを実装する"
created: 2026-08-10
updated: 2026-08-10
owner: Claude / TL
github_issue_id: 534
engineering_discipline_required: true
behavior_contract_id: GITHUB-CROSS-REVIEW-ADMISSION-001
responsibility_owner: github-cross-review-admission
change_slice: atomic
refactor_step: modify
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "receipt v3の独立性判定（reviewPairFailure）は申告値同士の比較しか行わず、`authorRuntime`の申告が事実と一致するかを検証しない。PLAN-RECOVERY-41 §2は『authorRuntimeに事実と異なる\"codex\"を宣言すれば gate は通るが、それは admission evidence の捏造であり選択肢にしない』と行動規範でのみ禁じていた。2026-08-10、Claude著PR #525に対しauthorRuntime=codexのreceiptがsealされmergeが成立し（Issue #534）、この規範が機械強制を持たないことが実証された"
contract_postconditions: "receipt seal（`github pr-review-receipt`）とmerge判定（`pr-merge-reviewed`のcanonical v3経路）の両方で、PR head commitsのcommit messageから実測したauthoring runtime（`Co-Authored-By: Claude` trailerの有無）と申告`authorRuntime`をfail-closeで突き合わせる。不一致は`author_runtime_attestation_mismatch`、commit evidence空は`author_runtime_evidence_missing`、GitHub API取得失敗は`author_runtime_evidence_unavailable`で拒否する。実測ロジックはpure function（`measuredAuthorRuntimeFromCommitMessages`／`authorRuntimeAttestationFailure`）としてclaude-pr-convergence.tsが所有する"
contract_invariants: "receipt v3のschema・digest・既存error setは不変。provider-neutral v4経路には介入しない。trailer判定は行頭一致（大文字小文字不問）であり、本文中の引用文字列では発火しない。既存のreviewPairFailure対称判定・DB収束検証・時系列検証はそのまま維持する。新workflow・DB table・required check名を追加しない"
contract_failures: "author_runtime_attestation_mismatch（申告と実測の不一致）、author_runtime_evidence_missing（PR commit messageが0件）、author_runtime_evidence_unavailable（GitHub API取得失敗）。いずれもseal／mergeをexit 1でfail-closeする"
tdd_red_required: true
red_at: "2026-08-10T14:15:00Z"
green_at: "2026-08-10T14:20:00Z"
mutation_oracle_evidence: "tests/claude-pr-convergence.test.ts へ U-CPRCONV-012/013/014 を追加し、mutant 2種で単独検出性を実測した。M-1: attestationを常時null返却へ改変 → 2 failed / 17 passed でkill。M-2: trailer判定を行頭一致regexから /claude/imu 部分一致へ弱体化 → 1 failed / 18 passed でkill（本文引用のfixtureが検出）。復元後 19 passed、tsc --noEmit exit 0。U-CPRCONV-013はPR #525で実際に使われた虚偽申告（Claude trailer付きcommitsに対するcodex申告）をそのままfixture化している"
complexity_effect: justified_neutral
complexity_justification: "新moduleを作らず、既存のclaude-pr-convergence.tsへpure function 2本、cli.tsへ共有attestation helper 1本を追加する。seal時とmerge時の両gateが同一pure coreを使う"
removal_trigger: "canonical receiptがcommit trailerよりも強いcryptographic runtime identityで authoring runtime を証明できるようになった場合"
parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md
pair_artifact: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-012, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-013, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-014, test_path: tests/claude-pr-convergence.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — 申告値信頼の穴（Issue #534）と実測evidenceの選定監査" }
  - { role: se, slot_label: "SE — pure attestation coreとseal/merge両gateへの配線" }
  - { role: qa, slot_label: "QA — 虚偽申告fixture（PR #525再現）のRed-first oracle" }
  - { role: tl, slot_label: "TL — Claude著PLANのためCodex独立レビュー必須の確認" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/github-cross-review-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/plans/PLAN-RECOVERY-42-author-runtime-attestation.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/claude-pr-convergence.ts, artifact_type: source_module }
  - { artifact_path: tests/claude-pr-convergence.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-RECOVERY-41-cross-review-admission-symmetry.md
  requires:
    - docs/plans/PLAN-RECOVERY-41-cross-review-admission-symmetry.md
  blocks:
    - issue:534
review_evidence: []
---

# PLAN-RECOVERY-42：申告 authorRuntime の commit trailer 実測 attestation

## §1 なぜ recovery か

PLAN-RECOVERY-41 は receipt v3 の独立性判定を対称化したが、`authorRuntime` は**申告値のまま**であった。
同 PLAN §2 は「事実と異なる `"codex"` 宣言は admission evidence の捏造であり選択肢にしない」と規範で
禁じたが、これは機械強制ではない。2026-08-10、Claude 著の PR #525 へ `authorRuntime: "codex"` の
receipt が seal され、`pr-merge-reviewed` が merge を成立させた（Issue #534、merge `d9dab9e4`）。
gate は虚偽申告を検知する術を持たなかった。

本 PLAN は設計の意図（自己申告 runtime identity を canonical receipt へ昇格しない — L5 §1）へ実装を
追随させる recovery であり、PLAN-RECOVERY-41 の claim を訂正しないため `supersedes` は宣言しない。

## §2 実測 evidence の選定

Claude runtime の commit は CLAUDE.md の commit 規約により必ず `Co-Authored-By: Claude ...` trailer を
持つ。Codex runtime の commit は持たない。Issue #534 の事後検証では、この trailer と worktree 所在が
open PR 11 本すべての authoring runtime を正しく判別した（#528 のみ Codex、他は Claude）。

- 実測値: PR head commits（`repos/<repo>/pulls/<n>/commits`）の commit message に行頭一致
  `co-authored-by:\s*claude`（大文字小文字不問）が 1 件でもあれば claude、無ければ codex。
- 限界: trailer は偽装・除去可能であり cryptographic identity ではない。ただし「申告 1 フィールドを
  書き換えるだけ」だった攻撃面を「PR の全 commit message の改変」まで引き上げ、かつ改変は git 履歴に
  残る。`removal_trigger` に記載のとおり、より強い identity が入り次第置き換える。

## §3 変更境界

| 対象 | 変更 |
|---|---|
| `src/runtime/claude-pr-convergence.ts` | pure core: `measuredAuthorRuntimeFromCommitMessages` / `authorRuntimeAttestationFailure` を追加 |
| `src/cli.ts` | `claudePrAuthorRuntimeAttestation` helper（gh api で PR commits を取得し pure core へ渡す）。`github pr-review-receipt` の seal 前と `pr-merge-reviewed` の canonical v3 判定前に fail-close で介入 |
| L5 設計 / L8 テスト設計 | attestation の判定順序と oracle（U-CPRCONV-012/013/014）を追記 |

provider-neutral v4（Kimi fallback）経路は `reviewer_provider` 構造が異なるため本 PLAN の対象外とし、
必要になれば別 PLAN で扱う。

## §4 fail-close 経路

| 状況 | error | 遮断点 |
|---|---|---|
| 申告と実測の不一致（#525 型） | `author_runtime_attestation_mismatch` | seal 時・merge 時の両方 |
| PR commit message 0 件 | `author_runtime_evidence_missing` | 同上 |
| GitHub API 取得失敗 | `author_runtime_evidence_unavailable` | 同上（fail-open にしない） |

seal 時に塞いでも、過去に seal 済みの虚偽 receipt file を merge へ持ち込む経路が残るため、
`pr-merge-reviewed` でも同じ attestation を再実行する（defense in depth）。

## §5 承認境界

本 PLAN と実装は Claude authored である。Issue #534 の教訓により、本 PR の merge admission には
**Codex による独立レビューと receipt** を必須とし、Claude は自 PR へ receipt を seal しない。
