---
plan_id: PLAN-RECOVERY-43-attestation-merge-parent-detection
superseded_by: [PLAN-RECOVERY-44-mixed-authorship-dual-review]
title: "PLAN-RECOVERY-43 (recovery): attestationのmerge commit判定をsubjectからparent数へ是正"
kind: recovery
layer: cross
drive: agent
status: confirmed
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
refactor_step: not_applicable
legacy_retirement_state: removed
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
mutation_oracle_evidence: "U-CPRCONV-017追加時点でRedを実測（API変更を含めて5 failed / 17 passed）、実装後22 passed。Codex round-1のCritical是正後にmutant 3種の単独検出性を実測した。M-1: merge commit判定をparent数からsubject前方一致（`/^Merge /`）へ退行 → 1 failed（U-CPRCONV-017）。M-2: evidence queryのjq補間を壊す（TS文字列のescapeを1段落とす）→ 1 failed（U-CPRCONV-018、Codex round-1 Criticalの再発防止）。M-3: parent数のNumber.isSafeInteger検査を除去 → 1 failed（U-CPRCONV-019）。M-4: core内の実引数欠落（runnerへ渡す配列をslice(0,1)）→ 1 failed。M-5: queryを旧形式へ差し替え → 1 failed。M-6: `--paginate`を除去 → 1 failed。M-7: adapter内の実引数欠落（spawnへ渡す配列をslice(0,1)）→ 1 failed。M-8: adapterのstdout null fallback除去 → 1 failed。M-9: cliがcoreのadapterを使わず自前lambdaで引数を欠落 → 1 failed（いずれもU-CPRCONV-018）。M-10: cli bridgeでrunnerの戻り値へ`args.slice(0,1)`を挟む → 1 failed。M-11: merge側のattestation blockを削除 → 1 failed。M-12: cliが申告値を渡さず定数codexに固定（正しいclaude sealまでfail-closeする退行）→ 1 failed。M-13: runner結果の`status !== 0`をtruthiness判定へ退行（statusがnullのとき素通り）→ 1 failed（U-CPRCONV-018）。M-14: cli helperが常にgeneric_failureを返す（真正申告の一律拒否）→ 1 failed（U-CPRCONV-020）。M-15: merge commit判定の閾値を`parentCount < 2`から等値比較`parentCount !== 2`へ退行（octopus merge＝parent 3以上が実装commitとして数えられる）→ 1 failed（U-CPRCONV-017、round-8が生存を実測したmutation）。M-10/M-11はround-5、M-12はround-6、M-13/M-14はround-7、M-15はround-8が生存または欠落を実測したmutationである。M-4はCodex round-3が、M-7/M-9はround-4がoracle外での生存を実測した mutation であり、oracleをsource文字列検査からrunner／spawn spyによる実引数観測へ移し、adapterごとcoreへ寄せてkillした。全mutant復元後、`npx --no-install vitest run tests/claude-pr-convergence.test.ts` が25 test cases全passで exit 0（`it.each` 3件を含む）。tsc --noEmit exit 0"
complexity_effect: net_neutral
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
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-020, test_path: tests/claude-pr-convergence.test.ts }
review_evidence:
  - reviewer: "Codex independent cross-runtime reviewer"
    review_kind: cross_agent
    reviewed_at: "2026-08-10T22:03:30Z"
    tests_green_at: "2026-08-10T22:03:12Z"
    verdict: approve_after_fixes
    worker_model: claude-opus-5
    reviewer_model: gpt-5.6-sol
    scope: "helix codex --role reviewer（FR-09 worker context boundary、read-only）による9 roundの独立レビュー。round-1（HEAD 167c923f）changes-requested: Critical 1（jq補間がTS文字列escapeで潰れseal/mergeが全件unavailableへ落ちる）/ Important 1（production queryにoracleが無い）/ Minor 1（parent数のsafe integer未検査）。round-2（af6bfaec）Important 1（query定数だけではcli call site差し替えを検出できない）。round-3（2b4e04d7）Important 1（source文字列oracleが実引数欠落slice(0,1)を素通し）/ Minor 1（整形依存）。round-4（7922696c）Important 1（cli adapterがoracle外）。round-5（a3d0489b）Important 2（cli bridge変異とmerge側block削除が生存）/ Minor 1（query完全一致比較の整形依存）。round-6（e5a955a2）Important 1（truthful positive oracle不在で申告値の定数固定が生存）。round-7（169973ca）Important 2（positiveがstderr不在のみ・status null fail-close oracle不在）/ Minor 1（件数不一致）。round-8（466c4161）Important 1（parent数閾値の等値比較化でoctopus mergeが生存）/ Minor 1（Biome）。round-9（HEAD b357c6b3 / tree 96e30b39cbb25612f016a8f7a67d6bb799dea9a3 / worktree clean）approve・Critical 0・Important 0・Minor 1（U-CPRCONV-020のverification_bindings明示、本PLANで是正済み）・PLAN confirm可。reviewerはM-1〜M-15の単独検出とtest件数25 casesを独立再現し、fake ghによる真正merge dry-run exit 0と虚偽申告のexit 1（pr checks未到達）も実測した。sandbox制約（git init／tsx IPCのEPERM）により全suite実行は不可のためtargeted検証であり、full CI greenはGitHub Actions harness-checkを正とする。本entryは技術承認であり、GitHub merge admission用canonical receipt（Codexがseal）を代替しない"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/claude-pr-convergence.test.ts --reporter=json", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-10T22:03:10Z", evidence_path: tests/claude-pr-convergence.test.ts, output_digest: "sha256:2f229128c6b7509564849f3c2fdf266bbc81555e60559bcc50dcd12d89a6e808", result: "Vitest JSON reporter 実出力の SHA-256。25 passed / 0 failed（U-CPRCONV-012〜020 を含む）。Codex reviewer は同 oracle 群と M-1〜M-15 の単独検出を read-only sandbox で独立再実行" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-10T22:03:12Z", evidence_path: src/runtime/claude-pr-convergence.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0（出力 0 byte = 空出力の SHA-256）。Claude / Codex 両 lane で独立に green" }
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

> **correction note（PLAN-RECOVERY-44-mixed-authorship-dual-review により訂正）**
> 本 PLAN は PLAN-RECOVERY-42 から「実測 mixed は **どの申告も通さず** fail-close する」という帰結を
> そのまま引き継いだが、この帰結は**誤り**であった。`CLAUDE.md`「Hybrid 多ランタイム commit 協調」は
> 相手 runtime の commit の上へ成果を積むことを必須運用として規定しており、両 runtime の parent 1
> 実装 commit が同居するブランチは事故ではなく規定運用の正常な帰結である（Issue #539、PR #537 が第 1 号）。
> **PLAN-RECOVERY-44-mixed-authorship-dual-review** が、実測 mixed に対しては `authorRuntime: "mixed"`
> の正直な申告のみを受理し、admission では寄与した各 runtime の分を相手がレビューした receipt を
> **両方**要求する dual-review 方式へ訂正した。
> 本 PLAN の中核である **parent 数による merge commit 判定**（subject 判定の false positive 除去）は
> 訂正されず維持されている。両者は排他ではなく、false positive の除去（本 PLAN）と真正 mixed の
> 受理経路（後継）という順の関係にある。

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
| merge commit 判定 | commit subject の `Merge ` 前方一致 | parent 数 2 個以上（octopus merge の 3 個以上も除外する不等号比較） |
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
fail-close すること、(b) 真正申告（実測 claude / 申告 claude）が attestation を通過し、
**attestation 後にしか起きない gh 呼び出し（`pr checks`）へ到達し、required check pass と
receipt CI 一致を返す fake `gh` のもとで merge dry-run が exit 0 になる**こと、(c) fake `gh` が
受け取る実引数が core の `authorRuntimeEvidenceArgs()` と一致することを end-to-end で束縛する。
負例だけを固定すると、申告値を定数に固定して正しい seal まで fail-close する退行を見逃す
（round-6 Important）。positive の判定に exit 0 を使わないのは、attestation 以降の DB 収束が
環境に依存し oracle が環境依存になるためであり、代わりに実行の到達点で判定する（round-7 Important）。query の比較は意味同値な整形差で壊れないよう構造比較にする
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
