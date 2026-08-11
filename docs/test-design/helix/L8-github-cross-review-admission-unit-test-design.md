---
title: "HELIX L8 単体テスト設計 — GitHub cross-review admission"
layer: L8
artifact_type: test_design
kind: recovery
status: draft
created: 2026-08-09
updated: 2026-08-11
owner: QA / TL
plan: PLAN-RECOVERY-40-github-cross-review-admission
pair_artifact: docs/design/helix/L5-detail/github-cross-review-admission.md
behavior_contract_id: GITHUB-CROSS-REVIEW-ADMISSION-001
responsibility_owner: github-cross-review-admission
requirements:
  - GH-AC-014
  - GH-AC-015
  - GH-AC-016
---

# HELIX L8 単体テスト設計 — GitHub cross-review admission

| Oracle | 対象 | 正例 | 独立negative mutation |
|---|---|---|---|
| `U-GCRA-001` | `evaluateGitHubCrossReviewAdmission` | Draft defer、Ready current-HEAD canonical receipt＋repository-owned current logical DB receiptの49 field／HEAD／5 digest exact join | DraftをReady扱い、Readyを無条件green、空DB receipt、別の自己整合canonical DB receipt |
| `U-GCRA-001c` | 同上 | Kimi S4 admission verifier comment＋created/updated/admission時系列＋failure＋lease＋packet＋output/findings＋logical DB receiptのexact join | 実体のないverifier digest、admission後PATCH、任意DB digest、各provenance改変 |
| `U-GCRA-001d` | `canonicalLogicalDbReceiptValid` | canonical v2 exact field setと収束式、Ready時のrepository-owned再生成receiptとの完全一致 | field欠落、workspace dirty、population false、checkpoint/schema mismatch、excluded step、unstable column |
| `U-GCRA-002` | 同上 | canonical JSON marker | PLAN自己申告、旧prose marker、malformed JSON |
| `U-GCRA-003` | 同上 | receipt/required workflow/PR/CI/comment URLの同一HEAD・時系列join | stale receipt、別HEAD/別workflow/別PR CI、review後完了、別comment URL |
| `U-GCRA-004` | 同上 | OPENかつreview時刻≤comment時刻、receipt exactly one | future review、duplicate/conflict、MERGED後receipt |
| `U-GCRA-005` | `evaluateReviewedMergeReadAfter` | reviewed HEADがmerge parentであり、candidate treeとmerge commit treeが同一 | 別tree、別merge commit、reviewed HEAD非parent、read-after不能 |
| `U-GCRA-005a` | `persistReviewedMergeReadAfterReceipt` | verified／merged_unverifiedのfull canonical receiptをGit共通runtimeへ0600・immutable保存 | full body欠落、digest改変、failure receipt未保存、既存bytes conflict |
| `U-GCRA-005b` | `pr-merge-reviewed` adapter | candidate／merge commitをGitHubから別々にread-afterし、full receipt永続化とreason 0を成功条件へ接続 | 片側取得除去、evaluator／persistence未接続、path欠落またはreason有りを成功扱い |
| `U-GCRA-006` | `evaluateGitHubCrossReviewAdmission` | author=claude / reviewer=codexのreceiptを同じcanonical経路で受理し、receipt digestを返す | 片方向固定の独立性判定（author=codex かつ reviewer=claude のみ受理） |
| `U-GCRA-007` | 同上 | digestまで整合した同一runtime receiptをdecode段階でcanonicalへ昇格しない | self-reviewの受理、digest改変検知への吸収 |
| `U-GCRA-008` | 同上 | v2 receiptはIssue closure／Kimi bootstrapのhistorical readに限定しcurrent Readyへ昇格しない | v2をcurrent receiptとして受理 |
| `U-CPRCONV-012` | `measuredAuthorRuntimeFromCommits` | merge commitを除く実装commitへの行頭`Co-Authored-By: Claude` trailer（同一行内・大文字小文字不問）でauthoring runtimeを実測し、本文中の引用と`Co-Authored-By:`直後の改行では発火しない | trailer部分一致への弱体化、改行許容`\s*`への退行、行頭一致の除去 |
| `U-CPRCONV-013` | `authorRuntimeAttestationFailure` | 申告authorRuntimeと実測の不一致を双方向とも`author_runtime_attestation_mismatch`で拒否する（PR #525の虚偽申告fixtureを含む） | attestationの常時通過、片方向のみの検査 |
| `U-CPRCONV-014` | 同上 | commit evidence 0件を`author_runtime_evidence_missing`でfail-closeする | evidence空の申告通過 |
| `U-CPRCONV-015` | 同上 | 実装commit間のtrailer混在（部分偽装疑い）を`author_runtime_evidence_mixed`でどの申告に対しても拒否する | mixed判定の`.some()`退行、片申告のみの遮断 |
| `U-CPRCONV-015b` | 同上 | 実測mixedに対し`"mixed"`申告のみ受理し、単一runtime実測へのmixed申告は`author_runtime_attestation_mismatch`、evidence 0件は`author_runtime_evidence_missing`で拒否する | mixed申告の実測非依存な無条件許可（逆向き偽装の穴） |
| `U-CPRCONV-015c` | `buildClaudePrReviewReceipt` | mixed著者receiptは`authorModel`のruntimeが`reviewerRuntime`と異なることを要求する（自己レビューを`runtime_independence_missing`で拒否） | mixed時のruntime独立性検査の削除 |
| `U-CPRCONV-016` | `parseAuthorRuntimeEvidence` | evidence行`<parent数>:<base64 message>`のparent数がcanonical 10進でない、またはbase64不正な行が1つでもあればevidence全体を無効化し`null`を返す（呼出側が`author_runtime_evidence_unavailable`で遮断） | 不正行の素通しdecode、parent数検証の除去、前置ゼロ・負数の受理 |
| `U-CPRCONV-017` | `measuredAuthorRuntimeFromCommits` | merge commitの除外をparent数（2個以上、octopus mergeの3個以上を含む）で判定し、subject表記に依存しない。conventional commit subjectのmain同期mergeをmixedへ落とさず、`Merge `始まりでもparent 1なら実装commitとして数える | subject prefix判定への回帰、閾値の等値比較化（parent 3が実装commit扱い）、merge commitの母集団への混入 |
| `U-CPRCONV-018` | `authorRuntimeAttestation` / `ghEvidenceRunner` | runner spyとspawn spyで観測したcommandと実引数配列（`--paginate`とjq補間を保ったquery）がexactであり、非0 exit・status null・stdout欠落・形式不正はunavailable／missing、申告不一致はmismatchへ落ちる。cliは判断もadapterも持たずspawn実体とcwdを渡すだけ | TS文字列escapeの潰れ、core／adapter双方での実引数欠落（slice）、query差し替え、`--paginate`欠落、stdout null fallback除去、`status !== 0`のtruthiness退行、cliでのadapter迂回 |
| `U-CPRCONV-019` | `parseAuthorRuntimeEvidence` | parent数がsafe integerでないevidence行を無効化する | Number.isSafeInteger検査の除去 |
| `U-CPRCONV-020` | `github pr-review-receipt` / `github pr-merge-reviewed` | 実CLIをPATH上のfake `gh`で起動し、虚偽申告は両callsiteが`author_runtime_attestation_mismatch`でfail-closeして後続の`pr checks`へ進まず、真正申告はattestationを通過して`pr checks`へ到達し、4経路すべてでfake `gh`の実引数がcoreの`authorRuntimeEvidenceArgs()`と一致する | cli bridgeでの実引数欠落、merge側attestation blockの削除、seal側配線の除去、申告値の定数固定、真正申告の一律拒否 |
| `U-CPRCONV-021` | `measureAuthorRuntime` | canonical evidence argsをrunnerへ渡し、Claude/Codexを実測する。非0・空・形式不正は推測せず`author_runtime_evidence_unavailable`で拒否する | evidence不在時のCodex既定化、query差し替え、runner非0の通過 |
| `U-CPRCONV-022` | `dispatchMeasuredPrToClaude` | repository／PR URL identityをevidence取得前に照合し、実測Codex/mixedだけを予約namespaceへpublish、Claudeとevidence不在を拒否する | caller申告値の直接publish、identity不一致後のevidence実行、Claude自己review配送 |
| `U-CPRCONV-023` | `github pr-notify` / `github pr-create --claude-converge` | fake `gh`を使う実CLIでCodex evidenceだけがnotifyをpublishしClaude evidenceを拒否する。両callsiteが同一の`dispatchMeasuredPrToClaude`と`ghEvidenceRunner`へ束縛される | CLI側のauthor固定、片callsiteの低層publisher直呼び、実測adapter迂回 |
| `U-GCRA-011` | `evaluateGitHubCrossReviewAdmission` | mixed著者PRは現HEADに対する両runtime（reviewer=claudeとcodex）のreceiptが揃ったときだけReadyにし、片側のみ・同一reviewer 2通・mixedと単一申告の混在を`mixed_author_dual_review_incomplete`で拒否する。単一authored PRの複数receiptは`review_receipt_conflict`のまま | dual要件の`size >= 1`への弱体化、単一authored PRのconflict解除 |
| `U-GCRA-WF-001` | `harness-check.yml` | candidate HEAD checkout、comment全page、PR head SHA run、CLI fail-close | default merge ref、merge SHA query、単一page、別checkへ分離 |
| `U-GCRA-WF-002` | 同上 | command exitをrequired jobへ伝播 | `|| true`、step skip、draft固定値化 |

GitHub APIはunitでmock成功を合格根拠にせず、workflow source mutationと実PR dogfoodを対にする。最終system証拠は、
Draft full CI、comment receipt、Ready rerun、required `harness-check` success、merge timestamp、candidate／merge tree同一receiptの順序を同一PRで記録する。
