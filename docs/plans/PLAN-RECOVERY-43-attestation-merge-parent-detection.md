---
plan_id: PLAN-RECOVERY-43-attestation-merge-parent-detection
title: "PLAN-RECOVERY-43 (recovery): attestationのmerge commit判定をsubjectからparent数へ是正"
kind: recovery
layer: cross
drive: agent
status: draft
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-10 PLAN-RECOVERY-42のmerge commit除外規則がPR #517で誤判定を起こしたため、実測根拠のある判定へ是正する"
created: 2026-08-10
updated: 2026-08-10
owner: Claude / TL
github_issue_id: 543
engineering_discipline_required: true
behavior_contract_id: GITHUB-CROSS-REVIEW-ADMISSION-001
responsibility_owner: github-cross-review-admission
change_slice: atomic
refactor_step: modify
legacy_retirement_state: retired
no_code_decision: modify
ddd_modeling_decision: pure_function
supersedes: [PLAN-RECOVERY-42-author-runtime-attestation]
contract_preconditions: "PLAN-RECOVERY-42はcontract_invariantsで「merge commit（`Merge `始まり）はtrailer母集団から除く」と宣言し、`measuredAuthorRuntimeFromCommitMessages`はcommit subjectの前方一致でmerge commitを除外していた。しかしmerge commitのsubjectは任意であり、`git merge`に別subjectを与えたmain同期merge（PR #517のhead `f038bdf4`、parent 2、subject `chore(memory): sync screen carry lane with latest main`）はこの規則で除外されない。結果、trailerを持たないmerge commitが実装commitとして母集団に入り、Claude著PRが`author_runtime_evidence_mixed`でfail-closeした（false positive）。gateが正しいreceipt発行を妨げるため、admissionが進まない"
contract_postconditions: "merge commitの除外をparent数（2個以上）で判定する。evidence行は`<parent数>:<base64 message>`とし、`parseAuthorRuntimeEvidence`がparent数のcanonical 10進表記（前置ゼロ・負数・非数値を拒否）とbase64 round-tripの双方を検証する。pure coreは`measuredAuthorRuntimeFromCommits`／`authorRuntimeAttestationFailure`／`parseAuthorRuntimeEvidence`が所有し、seal（`github pr-review-receipt`）とmerge（`pr-merge-reviewed`のcanonical v3経路）の両方が同一coreを通る"
contract_invariants: "PLAN-RECOVERY-42が確立したattestationの検証強度を弱めない。4つのfailure code（`author_runtime_attestation_mismatch`／`author_runtime_evidence_missing`／`author_runtime_evidence_mixed`／`author_runtime_evidence_unavailable`）とfail-close箇所は不変。trailer判定は行頭一致かつ同一行内（`[ \\t]*`）のまま。receipt v3のschema・digest・既存error setは不変。provider-neutral v4経路には介入しない。新workflow・DB table・required check名を追加しない"
contract_failures: "evidence行の形式不正（parent数欠落・非canonical・base64不正）は`author_runtime_evidence_unavailable`。他3コードの意味と発火条件はPLAN-RECOVERY-42のまま"
tdd_red_required: true
red_at: "2026-08-10T19:26:00Z"
green_at: "2026-08-10T19:27:00Z"
mutation_oracle_evidence: "U-CPRCONV-017追加時点でRedを実測（API変更を含めて5 failed / 17 passed）、実装後22 passed。Codex round-1のCritical是正後にmutant 3種の単独検出性を実測した。M-1: merge commit判定をparent数からsubject前方一致（`/^Merge /`）へ退行 → 1 failed（U-CPRCONV-017）。M-2: evidence queryのjq補間を壊す（TS文字列のescapeを1段落とす）→ 1 failed（U-CPRCONV-018、Codex round-1 Criticalの再発防止）。M-3: parent数のNumber.isSafeInteger検査を除去 → 1 failed（U-CPRCONV-019）。M-4: core内の実引数欠落（runnerへ渡す配列をslice(0,1)）→ 1 failed。M-5: queryを旧形式へ差し替え → 1 failed。M-6: `--paginate`を除去 → 1 failed。M-7: adapter内の実引数欠落（spawnへ渡す配列をslice(0,1)）→ 1 failed。M-8: adapterのstdout null fallback除去 → 1 failed。M-9: cliがcoreのadapterを使わず自前lambdaで引数を欠落 → 1 failed（いずれもU-CPRCONV-018）。M-10: cli bridgeでrunnerの戻り値へ`args.slice(0,1)`を挟む → 1 failed。M-11: merge側のattestation blockを削除 → 1 failed（いずれもU-CPRCONV-020、round-5が生存を実測したmutation）。M-4はCodex round-3が、M-7/M-9はround-4がoracle外での生存を実測した mutation であり、oracleをsource文字列検査からrunner／spawn spyによる実引数観測へ移し、adapterごとcoreへ寄せてkillした。全mutant復元後24 passed、tsc --noEmit exit 0"
complexity_effect: justified_neutral
complexity_justification: "新moduleを作らず、既存pure coreの入力型をcommit message配列からcommit記述子配列へ置き換える。判定層は増えず、誤判定を生んでいたsubject前方一致規則は削除する（parent数が単一authority）"
removal_trigger: "canonical receiptがcommit graphよりも強いcryptographic runtime identityでauthoring runtimeを証明できるようになった場合"
parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md
pair_artifact: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-012, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-016, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-017, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-018, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-019, test_path: tests/claude-pr-convergence.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — merge commit判定の信頼源（subject表記 vs commit graph）" }
  - { role: se, slot_label: "SE — pure coreの入力型変更とevidence行形式の配線" }
  - { role: qa, slot_label: "QA — PR #517実測fixtureのRed-first oracle" }
  - { role: tl, slot_label: "TL — Claude著PLANのためCodex独立レビュー必須の確認" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/github-cross-review-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/plans/PLAN-RECOVERY-43-attestation-merge-parent-detection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/claude-pr-convergence.ts, artifact_type: source_module }
  - { artifact_path: tests/claude-pr-convergence.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-RECOVERY-42-author-runtime-attestation.md
  requires:
    - docs/plans/PLAN-RECOVERY-42-author-runtime-attestation.md
  blocks:
    - issue:543
---

# PLAN-RECOVERY-43：attestation の merge commit 判定を parent 数へ是正

## §1 なぜ recovery か（PLAN-RECOVERY-42 の errata）

PLAN-RECOVERY-42 は `contract_invariants` で

> merge commit（`Merge ` 始まり）は trailer 母集団から除く

と宣言した。この claim は **誤り**である。merge commit の subject は任意に指定でき、
`Merge ` 始まりであることは merge commit の必要条件でも十分条件でもない。

実測（2026-08-10、PR #517）:

- head `f038bdf41d2b025d25a79dc7a2bbda68b3acec99` は parent 2 個の実 merge commit だが、
  subject は `chore(memory): sync screen carry lane with latest main`。
- PLAN-RECOVERY-42 の規則ではこれが実装 commit として母集団に入り、Claude trailer を
  持たないため trailer 有無が混在し、`author_runtime_evidence_mixed` で fail-close した。
- 結果、**正しい receipt（authorRuntime=claude）の発行が gate 自身に妨げられた**（false positive）。

本 PLAN は PLAN-RECOVERY-42 を `supersedes` し、同 PLAN には本 PLAN 名を含む correction note を
付す（errata は bidirectional に保つ）。attestation の目的・failure code・検証強度は引き継ぐ。

## §2 是正内容

| 対象 | 変更前 | 変更後 |
|---|---|---|
| merge commit 判定 | commit subject の `Merge ` 前方一致 | parent 数 2 個以上 |
| pure core | `measuredAuthorRuntimeFromCommitMessages(string[])` | `measuredAuthorRuntimeFromCommits({message, parentCount}[])` |
| evidence 行 | `<base64 message>` | `<parent 数>:<base64 message>` |
| evidence 検証 | base64 round-trip | parent 数 canonical 10 進（前置ゼロ・負数・非数値を拒否）＋ base64 round-trip |

parent 数は commit graph の事実であり、subject 表記の影響を受けない。したがって
「subject を `Merge ` 始まりにして実装 commit を母集団から外す」という偽装経路も同時に塞がる
（U-CPRCONV-017 が parent 1 の `Merge upstream fixes by hand` を実装 commit として数えることを固定）。


## §2.1 evidence 取得経路の所有（Codex round-1〜3）

jq の文字列補間 `\(...)` は TypeScript の文字列リテラルでもエスケープとして解釈される。
ソースに `\\(` と書かないと実行時に `(` へ潰れ、query が literal `(.parents | length):...` を返して
**全 evidence が形式不正となり、seal / merge が常に `author_runtime_evidence_unavailable` へ落ちる**。
初版はこの誤りを含んでいた（round-1 Critical）。

是正の過程で分かったのは、**cli 側に残した処理は oracle の届かない面になる**ということである。
query を定数化しただけでは cli が別 query を渡す差し替えを検出できず（round-2 Important）、
source 文字列の包含検査へ移しても実引数の欠落（`args.slice(0, 1)`）が生存し、かつ整形差で
壊れる脆い oracle になった（round-3 Important / Minor）。

cli に runner を残す形でも同じ問題が再発した。adapter 内で `[...args].slice(0, 1)` としても
oracle が届かず生存する（round-4 Important）。

したがって attestation の全経路（引数構築 → 実行 → 復号 → 突き合わせ）に加え、`gh` 実行 adapter
（`ghEvidenceRunner(spawn, cwd)`）も core が所有し、cli は spawn 実体と cwd を渡すだけにする。
U-CPRCONV-018 は runner spy と spawn spy の双方で **実際に渡る command と引数配列**を観測して
固定し、実行失敗・stdout 欠落・形式不正・申告不一致の分岐も同時に測る。

それでも cli 側に残る bridge（runner を包む式）と merge 側の呼び出し有無は source 検査では
閉じない（round-5 Important）。したがって U-CPRCONV-020 が **実 CLI を PATH 上の fake `gh` で
起動**し、seal と merge の両 callsite が (a) 虚偽申告を `author_runtime_attestation_mismatch` で
fail-close すること、(b) fake `gh` が受け取る実引数が core の `authorRuntimeEvidenceArgs()` と
一致することを end-to-end で束縛する。query の比較は意味同値な整形差で壊れないよう構造比較にする
（round-5 Minor）。

## §3 変更境界

| path | 内容 |
|---|---|
| `src/runtime/claude-pr-convergence.ts` | pure core の入力型変更、parent 数判定、evidence 行 parse |
| `src/cli.ts` | attestation の判断も adapter も持たず、core の `authorRuntimeAttestation()` へ `ghEvidenceRunner(spawnSync, cwd)` を渡すだけにする |
| `tests/claude-pr-convergence.test.ts` | U-CPRCONV-012/016 更新、U-CPRCONV-017/018/019/020 追加 |
| L5 設計 / L8 テスト設計 | 判定規則と oracle 表の同期 |

## §4 fail-close 経路

seal（`github pr-review-receipt`）と merge（`pr-merge-reviewed` の canonical v3 経路）の双方で、
evidence 取得失敗・形式不正は `author_runtime_evidence_unavailable`、evidence 0 件は
`author_runtime_evidence_missing`、実装 commit 間の trailer 混在は `author_runtime_evidence_mixed`、
申告と実測の不一致は `author_runtime_attestation_mismatch` で exit 1 とする。

## §5 承認境界

本 PLAN と実装は Claude authored である。merge admission には **Codex による独立レビューと receipt**
を必須とする（PLAN-RECOVERY-42 §5 と同じ）。Codex sandbox の egress 制約は Issue #540 /
PLAN-L7-541 で別途扱う。
