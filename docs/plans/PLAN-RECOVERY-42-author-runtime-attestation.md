---
plan_id: PLAN-RECOVERY-42-author-runtime-attestation
superseded_by: [PLAN-RECOVERY-43-attestation-merge-parent-detection]
title: "PLAN-RECOVERY-42 (recovery): 申告authorRuntimeのcommit trailer実測attestation"
kind: recovery
layer: cross
drive: agent
status: confirmed
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
refactor_step: not_applicable
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "receipt v3の独立性判定（reviewPairFailure）は申告値同士の比較しか行わず、`authorRuntime`の申告が事実と一致するかを検証しない。PLAN-RECOVERY-41 §2は『authorRuntimeに事実と異なる\"codex\"を宣言すれば gate は通るが、それは admission evidence の捏造であり選択肢にしない』と行動規範でのみ禁じていた。2026-08-10、Claude著PR #525に対しauthorRuntime=codexのreceiptがsealされmergeが成立し（Issue #534）、この規範が機械強制を持たないことが実証された"
contract_postconditions: "receipt seal（`github pr-review-receipt`）とmerge判定（`pr-merge-reviewed`のcanonical v3経路）の両方で、PR head commitsのcommit messageから実測したauthoring runtime（`Co-Authored-By: Claude` trailerの整合）と申告`authorRuntime`をfail-closeで突き合わせる。不一致は`author_runtime_attestation_mismatch`、commit evidence空は`author_runtime_evidence_missing`、実装commit間でtrailer有無が混在する場合は`author_runtime_evidence_mixed`、GitHub API取得失敗またはbase64不正evidenceは`author_runtime_evidence_unavailable`で拒否する。実測ロジックはpure function（`measuredAuthorRuntimeFromCommitMessages`／`authorRuntimeAttestationFailure`／`parseAuthorRuntimeEvidence`）としてclaude-pr-convergence.tsが所有する。本attestationはcryptographic identityではなく自己整合検査であり、捏造の攻撃面を申告1フィールドからPR全commitの履歴改変へ引き上げるもの"
contract_invariants: "receipt v3のschema・digest・既存error setは不変。provider-neutral v4経路には介入しない。trailer判定は行頭一致かつ同一行内（`[ \\t]*`、改行を跨がない・大文字小文字不問）であり、本文中の引用文字列や`Co-Authored-By:`直後の改行では発火しない。merge commit（`Merge `始まり）はtrailer母集団から除く。既存のreviewPairFailure対称判定・DB収束検証・時系列検証はそのまま維持する。新workflow・DB table・required check名を追加しない"
contract_failures: "author_runtime_attestation_mismatch（申告と実測の不一致）、author_runtime_evidence_missing（PR commit messageが0件）、author_runtime_evidence_mixed（実装commit間のtrailer混在＝部分偽装または多runtime混在の疑い）、author_runtime_evidence_unavailable（GitHub API取得失敗またはbase64不正evidence）。いずれもseal／mergeをexit 1でfail-closeする"
tdd_red_required: true
red_at: "2026-08-10T14:15:00Z"
green_at: "2026-08-10T14:20:00Z"
mutation_oracle_evidence: "tests/claude-pr-convergence.test.ts の U-CPRCONV-012〜016 に対し mutant 6種の単独検出性を実測した。M-1: attestation常時null化 → 3 failed / 18 passed。M-2: trailer判定を /claude/imu 部分一致へ弱体化 → 1 failed。M-3: trailer regexを改行許容の \\s* へ退行 → 1 failed（U-CPRCONV-012の改行fixture、Codex round-1指摘の再発防止）。M-4: mixed判定を .some() へ退行 → 1 failed（U-CPRCONV-015）。M-5/M-6: base64検証（round-trip）の除去 → 1 failed（U-CPRCONV-016）。round-3で文字種regexとround-tripの二重層のうちregex層のmutantが生存したため、検証authorityをround-trip単一へ整理して再実測した（Codex round-2の長さ不正指摘 A / AA= / AAAAA / 非正規padding QR== をfixture化）。全mutant復元後 21 passed、tsc --noEmit exit 0。U-CPRCONV-013はPR #525で実際に使われた虚偽申告をそのままfixture化している"
complexity_effect: net_neutral
complexity_justification: "新moduleを作らず、既存のclaude-pr-convergence.tsへpure function 2本、cli.tsへ共有attestation helper 1本を追加する。seal時とmerge時の両gateが同一pure coreを使う"
removal_trigger: "canonical receiptがcommit trailerよりも強いcryptographic runtime identityで authoring runtime を証明できるようになった場合"
parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md
pair_artifact: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-012, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-013, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-014, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-015, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-016, test_path: tests/claude-pr-convergence.test.ts }
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
review_evidence:
  - reviewer: "Codex independent cross-runtime reviewer"
    review_kind: cross_agent
    reviewed_at: "2026-08-10T16:57:33Z"
    tests_green_at: "2026-08-10T16:41:00Z"
    verdict: approve_after_fixes
    worker_model: claude-fable-5
    reviewer_model: gpt-5.6-sol
    scope: "helix codex --role reviewer（FR-09 worker context boundary GOAL-2026-08-issue-534-author-runtime-attestation-review、read-only）による 3 round の独立レビュー。round-1（HEAD 7ec70249）changes-requested: Critical 1（trailer 偽装可能性と契約文言の不一致）/ Important 3（mixed 非遮断・regex 改行跨ぎ・配線 oracle 不足）/ Minor 1（base64 未検証 decode）。round-2（HEAD edff99df）changes-requested: Important 1（base64 長さ不正 A / AA= / AAAAA の受理を Node 実測で提示）。round-3（HEAD bf78cd43 / tree abb093f3fecbde552baf33ef6a96e52be32054f8 / worktree clean）approve・残所見 0・PLAN confirm 可。round-4（HEAD 606f4821、2026-08-10T16:57:33Z）で src/tests が bf78cd43 から不変（git diff -- src tests 空）であることを確認。round-trip 検証が A / AA= / AAAAA / QR== を拒否し QQ== を受理することを reviewer が実測。sandbox 制約（git init EPERM）により全 suite 実行は不可のため targeted 検証であり、full CI green は GitHub Actions harness-check を正とする。本 entry は技術承認であり、GitHub merge admission 用 canonical receipt を代替しない。receipt の seal 物理実行は Codex sandbox の GitHub egress 遮断（author_runtime_evidence_unavailable で fail-close）により Claude が代行する（PO 承認 2026-08-10、§5.1）。申告値 authorRuntime=claude / reviewerRuntime=codex は事実であり、本 PLAN の attestation gate 自身が trailer 実測で検証する"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/claude-pr-convergence.test.ts --reporter=json", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-10T16:40:00Z", evidence_path: tests/claude-pr-convergence.test.ts, output_digest: "sha256:ced4ae609b5839213e921b7fccaeacb608146779ac696c0376b6e900ec9ace65", result: "Vitest JSON reporter 実出力の SHA-256。21 passed / 0 failed（U-CPRCONV-012〜016 を含む）。Codex reviewer は U-CPRCONV suite 5 passed / typecheck exit 0 / biome exit 0 / git diff --check exit 0 を read-only sandbox で独立再実行" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-10T16:40:30Z", evidence_path: src/runtime/claude-pr-convergence.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0（出力 0 byte = 空出力の SHA-256）。Claude / Codex 両 lane で独立に green" }
---

# PLAN-RECOVERY-42：申告 authorRuntime の commit trailer 実測 attestation

> **correction note（PLAN-RECOVERY-43-mixed-authorship-dual-review により訂正）**
> 本 PLAN の contract_failures にある「実装 commit 間で trailer が混在する場合は **どの申告も通さず**
> fail-close する」という帰結は**誤り**であった。`CLAUDE.md`「Hybrid 多ランタイム commit 協調」は
> 相手 runtime の commit の上へ成果を積むことを必須運用として規定しており、混在ブランチは事故ではなく
> 規定運用の正常な帰結である（Issue #539、PR #537 が第 1 号）。
> **PLAN-RECOVERY-43-mixed-authorship-dual-review** が、実測 mixed に対しては `authorRuntime: "mixed"`
> の正直な申告のみを受理し、admission では寄与した各 runtime の分を相手がレビューした receipt を
> **両方**要求する dual-review 方式へ訂正した。単一 runtime 申告に対する mixed 実測の fail-close
> （本 PLAN の中核である「申告値を実測で検証する」契約）は訂正されず維持されている。

## §1 なぜ recovery か

PLAN-RECOVERY-41 は receipt v3 の独立性判定を対称化したが、`authorRuntime` は**申告値のまま**であった。
同 PLAN §2 は「事実と異なる `"codex"` 宣言は admission evidence の捏造であり選択肢にしない」と規範で
禁じたが、これは機械強制ではない。2026-08-10、Claude 著の PR #525 へ `authorRuntime: "codex"` の
receipt が seal され、`pr-merge-reviewed` が merge を成立させた（Issue #534、merge `d9dab9e4`）。
gate は虚偽申告を検知する術を持たなかった。

本 PLAN は設計の意図（自己申告 runtime identity を canonical receipt へ昇格しない — L5 §1）へ実装を
追随させる recovery であり、PLAN-RECOVERY-41 の claim を訂正しないため `supersedes` は宣言しない。

## §2 実測 evidence の選定

Claude runtime の commit は運用実態として `Co-Authored-By: Claude ...` trailer を持ち、Codex runtime の
commit は持たない（Codex round-1 レビューの指摘どおり、repo 内規約はこの trailer を必須と明文化して
おらず、これは repo 規則ではなく Claude Code 側の commit 生成挙動に由来する運用不変量である）。
Issue #534 の事後検証では、この trailer と worktree 所在が open PR 11 本すべての authoring runtime を
正しく判別した（#528 のみ Codex、他は Claude）。

- 実測値: PR head commits（`repos/<repo>/pulls/<n>/commits`）のうち merge commit（`Merge ` 始まり）を
  除いた実装 commit を母集団とし、行頭一致 `co-authored-by:[ \t]*claude`（同一行内・大文字小文字不問）が
  **全件**にあれば claude、**0 件**なら codex、**混在**なら `mixed` としてどの申告も通さない。
- 限界（Codex round-1 レビューで明確化）: trailer は author が commit message を書き換えれば偽装・除去
  できるため、本 attestation は cryptographic identity の証明ではなく**自己整合検査**である。効果は
  「申告 1 フィールドの書き換え」で成立していた捏造（#525 型）を「PR 全 commit の履歴改変」まで
  引き上げること、および部分偽装を `mixed` fail-close で遮断することに限る。`removal_trigger` に
  記載のとおり、より強い identity が入り次第置き換える。

## §3 変更境界

| 対象 | 変更 |
|---|---|
| `src/runtime/claude-pr-convergence.ts` | pure core: `measuredAuthorRuntimeFromCommitMessages` / `authorRuntimeAttestationFailure` / `parseAuthorRuntimeEvidence` を追加 |
| `src/cli.ts` | `claudePrAuthorRuntimeAttestation` helper（gh api で PR commits を取得し pure core へ渡す）。`github pr-review-receipt` の seal 前と `pr-merge-reviewed` の canonical v3 判定前に fail-close で介入 |
| L5 設計 / L8 テスト設計 | attestation の判定順序と oracle（U-CPRCONV-012〜016）を追記 |

provider-neutral v4（Kimi fallback）経路は `reviewer_provider` 構造が異なるため本 PLAN の対象外とし、
必要になれば別 PLAN で扱う。

## §4 fail-close 経路

| 状況 | error | 遮断点 |
|---|---|---|
| 申告と実測の不一致（#525 型） | `author_runtime_attestation_mismatch` | seal 時・merge 時の両方 |
| PR commit message 0 件 | `author_runtime_evidence_missing` | 同上 |
| 実装 commit 間で trailer 有無が混在（部分偽装疑い） | `author_runtime_evidence_mixed` | 同上 |
| GitHub API 取得失敗 / base64 不正 evidence | `author_runtime_evidence_unavailable` | 同上（fail-open にしない） |

seal 時に塞いでも、過去に seal 済みの虚偽 receipt file を merge へ持ち込む経路が残るため、
`pr-merge-reviewed` でも同じ attestation を再実行する（defense in depth）。

## §5 承認境界

本 PLAN と実装は Claude authored である。Issue #534 の教訓により、本 PR の merge admission には
**Codex による独立レビューと receipt** を必須とする。レビュー実体は Codex の 4 round（上記
review_evidence）であり、receipt の申告値は `authorRuntime=claude` / `reviewerRuntime=codex` として
事実に一致する。

### §5.1 seal 物理実行の例外（PO 承認 2026-08-10）

`helix codex --execute` の Codex sandbox は api.github.com への egress が遮断されており、seal
（`github pr-review-receipt`）内の本 attestation gate 自身が commit evidence を取得できず
`author_runtime_evidence_unavailable` で fail-close した（Codex は迂回せず停止したことを報告済み）。
そのため PO は **レビュー実体を Codex のまま据え置き、seal コマンドの物理実行だけを Claude が代行する**
例外を承認した。

- 申告値は事実であり、本 PLAN が実装した attestation gate 自身が PR head commits の trailer 実測により
  `authorRuntime=claude` を機械検証する（虚偽申告なら同 gate が exit 1 で拒否する）。
- 例外の対象は **コマンドの実行主体のみ**であり、独立レビュー要件そのものを緩めない。
  Issue #534 の禁止事項（事実と異なる `authorRuntime` の申告）は本例外の対象外であり、引き続き禁止する。
- 恒久解（Codex 側で seal 可能にする経路 = CI 側 seal または sandbox への evidence 注入）は
  後続 PLAN で起票する。本例外を恒常運用の前例としない。

## §6 訂正記録（errata、2026-08-10）

本 PLAN の `contract_invariants` にある

> merge commit（`Merge ` 始まり）は trailer 母集団から除く

という claim は誤りであった。merge commit の subject は任意であり、`Merge ` 始まりは merge commit の
必要条件でも十分条件でもない。PR #517 の head `f038bdf4`（parent 2、subject
`chore(memory): sync screen carry lane with latest main`）がこの規則で除外されず、
`author_runtime_evidence_mixed` の false positive を起こした。

後継 PLAN **PLAN-RECOVERY-43**（`docs/plans/PLAN-RECOVERY-43-attestation-merge-parent-detection.md`）が
本 PLAN を `supersedes` し、merge commit 判定を parent 数（2 個以上）へ是正する。attestation の目的・
4 つの failure code・検証強度は PLAN-RECOVERY-43 に引き継がれる。本 PLAN の記述は履歴として残し、
上書きしない。
