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
| `U-CPRCONV-EXT-001` | `measuredAuthorRuntimeFromCommits` | 実装commitの母集団が全件bot著かつClaude trailer 0件のとき`external`を返す。botとcodex／claudeの混在は`external`にしない。bot flagを持たない母集団の測定結果は不変。bot著でもtrailerがあれば`claude` | external分岐の削除（#553の誤帰属が復活）、混在ガードを`every`から`some`へ緩める |
| `U-CPRCONV-EXT-002` | `AUTHOR_RUNTIME_EVIDENCE_QUERY` / `authorRuntimeEvidenceArgs` | bot identityを射影する3フィールドquery定数と`gh`実引数配列のexact一致 | wire formatの旧2フィールドへの巻き戻し |
| `U-CPRCONV-EXT-003` | `parseAuthorRuntimeEvidence` | `<parent数>:<bot flag>:<base64 message>`だけを受理し、旧2フィールド形式と`0`/`1`以外のbot flagを拒否する | bot flag厳密検査の削除、旧形式のdual-read化 |
| `U-CPRCONV-EXT-004` | `authorRuntimeAttestationFailure` | bot著PRへのcodex／claude／mixed申告を`author_runtime_attestation_mismatch`で拒否し、非bot PRへの`external`申告も対称に拒否する | external実測の削除 |
| `U-CPRCONV-EXT-005` | `buildClaudePrReviewReceipt` | `external`著者receiptはclaude／codexどちらのreviewerでも受理し、`reviewerModel`のproviderが`reviewerRuntime`と一致することと`authorModel`が空でないことは要求する | external分岐の削除、reviewer側束縛の解除、authorModel空チェックの削除 |
| `U-CPRCONV-016` | `parseAuthorRuntimeEvidence` | evidence行`<parent数>:<base64 message>`のparent数がcanonical 10進でない、またはbase64不正な行が1つでもあればevidence全体を無効化し`null`を返す（呼出側が`author_runtime_evidence_unavailable`で遮断） | 不正行の素通しdecode、parent数検証の除去、前置ゼロ・負数の受理 |
| `U-CPRCONV-024` | `persistClaudePrReviewReceipt` / `assertClaudePrReviewReceiptSlotAvailable` | mixed authorshipのClaude/Codex receiptを同一PR/HEADへreviewer別immutable pathで保存・再読込でき、同一reviewerの異内容receiptはconflictになる。同一generationのCLI再sealは既存receiptとcommentを再利用し、異なるgenerationは別slotへ分離する | reviewerを含まないfilenameへの退行、同一reviewer上書き、同一generationの重複comment、comment後の既知conflict |
| `U-CPRCONV-026` | `github pr-notify`（PLAN-RECOVERY-59） | CI evidenceのunavailable、non-terminal、missingの3分岐ではClaude inboxへ外部通知を発行せず、typed failureでfail-closeする | CI取得失敗時の推測通知、queued／non-terminalのsuccess偽装、CI不在の通知発行 |
| `U-CPRCONV-028` | `buildClaudePrReviewReceipt` / CI generation parser | terminal run・attempt・conclusionのtyped generationをreceiptId、digest、safe filenameへ束縛し、run／conclusion不一致を拒否する | generation欠落、malformed、別run、別conclusion、PR／HEADだけの旧identity |
| `U-CPRCONV-029` | v3 compatibility decoder / comment read-after / current loader | v3 receiptをread-onlyでdecodeし、current v4 loaderとcomment read-afterへ昇格させない | v3をcurrent Ready evidenceまたはmerge receiptとして受理 |
| `U-CPRCONV-030` | `persistClaudePrReviewReceipt` / generation history / slot claim | 同一generationの再保存はexactly-once、別generationは別immutable slotかつ`supersedesReceiptId`で履歴化し、comment投稿前の並行claim競合はfail-closeする | 旧slot上書き、generationを含まないfilename、同一generationの重複comment／DB terminal、pending claimの無視 |
| `U-CPRCONV-031` | `evaluateClaudePrMerge` / `pr-merge-reviewed` | CI runのHEAD・terminal status・workflow・event・attempt・conclusionがreceipt generationと一致したときだけmerge評価へ進む | attempt 1 receiptでattempt 2 successを通す、non-terminal、別workflow、generation mismatch |
| `U-GCRA-030` | `evaluateGitHubCrossReviewAdmission` | v3 compatibility receiptをdecodeできてもcurrent Ready admissionはrejectし、v4 generationとCI tupleだけを受理する | v3／旧receiptのgreen、CI run idだけの一致、attempt欠落 |
| `U-CPRCONV-017` | `measuredAuthorRuntimeFromCommits` | merge commitの除外をparent数（2個以上、octopus mergeの3個以上を含む）で判定し、subject表記に依存しない。conventional commit subjectのmain同期mergeをmixedへ落とさず、`Merge `始まりでもparent 1なら実装commitとして数える | subject prefix判定への回帰、閾値の等値比較化（parent 3が実装commit扱い）、merge commitの母集団への混入 |
| `U-CPRCONV-018` | `authorRuntimeAttestation` / `ghEvidenceRunner` | runner spyとspawn spyで観測したcommandと実引数配列（`--paginate`とjq補間を保ったquery）がexactであり、非0 exit・status null・stdout欠落・形式不正はunavailable／missing、申告不一致はmismatchへ落ちる。cliは判断もadapterも持たずspawn実体とcwdを渡すだけ | TS文字列escapeの潰れ、core／adapter双方での実引数欠落（slice）、query差し替え、`--paginate`欠落、stdout null fallback除去、`status !== 0`のtruthiness退行、cliでのadapter迂回 |
| `U-CPRCONV-019` | `parseAuthorRuntimeEvidence` | parent数がsafe integerでないevidence行を無効化する | Number.isSafeInteger検査の除去 |
| `U-CPRCONV-020` | `github pr-review-receipt` / `github pr-merge-reviewed` | 実CLIをPATH上のfake `gh`で起動し、虚偽申告は両callsiteが`author_runtime_attestation_mismatch`でfail-closeして後続の`pr checks`へ進まず、真正申告はattestationを通過して`pr checks`へ到達し、4経路すべてでfake `gh`の実引数がcoreの`authorRuntimeEvidenceArgs()`と一致する | cli bridgeでの実引数欠落、merge側attestation blockの削除、seal側配線の除去、申告値の定数固定、真正申告の一律拒否 |
| `U-CPRCONV-021` | `measureAuthorRuntime` | canonical evidence argsをrunnerへ渡し、Claude/Codexを実測する。非0・空・形式不正は推測せず`author_runtime_evidence_unavailable`で拒否する | evidence不在時のCodex既定化、query差し替え、runner非0の通過 |
| `U-CPRCONV-022` | `dispatchMeasuredPrToClaude` | repository／PR URL identity、40桁HEAD、非空base branchをevidence取得前に照合し、実測Codex/mixedだけを予約namespaceへpublish、Claudeとevidence不在を拒否する | caller申告値の直接publish、identity不一致後のevidence実行、不正HEADのdead spool、Claude自己review配送 |
| `U-CPRCONV-023` | `github pr-notify` / `github pr-create --claude-converge` | fake `gh`を使う実CLIでCodex evidenceだけがnotifyをpublishしClaude evidenceを拒否する。両callsiteが同一の`dispatchMeasuredPrToClaude`と`ghEvidenceRunner`へ束縛される | CLI側のauthor固定、片callsiteの低層publisher直呼び、実測adapter迂回 |
| `U-MEMWAKE-003` | `buildClaudeInboxEntry` / `publishClaudeInboxEntry` / `helix memory write --v2` | 汎用builder・汎用publisher・汎用memory CLIは`claude-inbox:pr:`予約namespaceを拒否する。canonical payload・origin・URLを持つ偽造entryでも直接publishできず、実測coreだけが内部capabilityで配送できる | 公開低層publisherまたは汎用memory writeによるmeasured dispatch迂回、consumer検証だけへの依存 |
| `U-MEMWAKE-REARM-004` | `recordClaudePrReviewTerminal` | same-HEADのPR／HEADに対して指定された`ci_evidence_generation`のinbox projectionだけをREVIEWED／TERMINALへ進める | 別attemptのreceiptで最新entryを閉じる、generation欠落、legacy entryの暗黙選択 |
| `U-GCRA-011` | `evaluateGitHubCrossReviewAdmission` | mixed著者PRは現HEADに対する両runtime（reviewer=claudeとcodex）のreceiptが揃ったときだけReadyにし、片側のみ・同一reviewer 2通・mixedと単一申告の混在を`mixed_author_dual_review_incomplete`で拒否する。単一authored PRの複数receiptは`review_receipt_conflict`のまま | dual要件の`size >= 1`への弱体化、単一authored PRのconflict解除 |
| `U-GCRA-EXT-001` | `evaluateGitHubCrossReviewAdmission` | `external`著者PRはclaude／codexいずれか1通のreceiptでReadyにし（dual-receipt経路へ入らない）、2通は従来どおり`review_receipt_conflict`にする | externalをmixed経路へ流す、単一receipt要件の解除 |
| `U-GCRA-WF-001` | `harness-check.yml` | candidate HEAD checkout、comment全page、PR head SHA run、CLI fail-close | default merge ref、merge SHA query、単一page、別checkへ分離 |
| `U-GCRA-WF-002` | 同上 | command exitをrequired jobへ伝播 | `|| true`、step skip、draft固定値化 |
| `U-CPRCONV-040` | `buildClaudePrReviewReceipt` / `validateClaudePrReviewReceipt` | producerがinput exact field setを検査してcanonical fieldだけを射影し、任意の非空`summary`を保持する | inputのunknown field許可、provider-neutral `schema_version`混入、空summaryの受理 |
| `U-GCRA-010` | `evaluateGitHubCrossReviewAdmission` | Claude v4とprovider-neutral v4をexact schema valueで識別する | `schema_version` propertyの存在だけでClaude receiptをprovider-neutralへ誤分類する |
| `U-GCRA-012` | `evaluateGitHubCrossReviewAdmission` | invalid候補をschema、独立性、CI、identity、DB provenance、時系列へ型付き分解し、comment URLだけを安全なlocatorとして返す | 全predicateをgeneric `review_receipt_invalid_or_stale`だけへ再統合、reason取り違え、receipt本文の診断流出 |
| `U-CPRCONV-002` | `claude-pr-convergence` CLI | `--correct-malformed`はreason exact setを要求し、対象・既存訂正をGitHub投稿前に検査してから実commentのread-afterと訂正receiptをsealする | unknown reason、valid／missing target、既存訂正への重複comment、comment read-after前のseal |
| `U-CPRCONV-041` | `persistClaudePrReviewReceiptCorrection` / `findClaudePrReviewReceipt` | malformed canonical bytesを保持し、prior byte digest・同一PR／HEAD／reviewer／CI generation・reason・corrected receipt digestをauthorizationへ束縛して別slotをcurrentへ選ぶ。authorization reasonとIDを同時改変しても拒否する | malformed slot上書き、authorizationなしのcorrected receipt選択、unknown reason、tampered exact join、訂正済みslotへの重複comment |
| `U-CPRCONV-042` | `assertClaudePrReviewReceiptCorrectionTarget` / `persistClaudePrReviewReceiptCorrection` | valid slot、対象欠落、異内容訂正、部分write、invalid reasonをfail-closeし、同一内容のpersistenceだけを冪等にする | valid receipt上書き、silent spool退避、conflicting correctionの採用、reason自由入力 |

## 現行Recovery V-pair oracle

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CPRCONV-040 | `buildClaudePrReviewReceipt` / `validateClaudePrReviewReceipt` | unknown field付きinput、provider-neutral `schema_version`混入、空summaryを拒否し、canonical fieldだけを射影する | `tests/claude-pr-convergence.test.ts` |
| U-GCRA-010 | `evaluateGitHubCrossReviewAdmission` | Claude v4とprovider-neutral v4をexact schema valueで識別し、property presenceだけの誤分類を拒否する | `tests/github-cross-review-admission.test.ts` |
| U-GCRA-012 | `evaluateGitHubCrossReviewAdmission` | invalid候補をschema、独立性、CI、identity、DB provenance、時系列へ型付き分解し、receipt本文を診断へ流出させない | `tests/github-cross-review-admission.test.ts` |
| U-CPRCONV-002 | `claude-pr-convergence` CLI | `--correct-malformed`はreason exact setを要求し、対象・既存訂正をGitHub投稿前に検査してから実commentのread-afterと訂正receiptをsealする | `tests/cli-surface.test.ts` |
| U-CPRCONV-041 | `persistClaudePrReviewReceiptCorrection` / `findClaudePrReviewReceipt` | malformed canonical bytesを保持し、prior byte digestと同一identityへ束縛したauthorization付き別slotだけをcurrentへ選ぶ | `tests/claude-pr-convergence.test.ts` |
| U-CPRCONV-042 | `assertClaudePrReviewReceiptCorrectionTarget` / `persistClaudePrReviewReceiptCorrection` | valid／missing target、異内容訂正、部分write、invalid reasonを拒否し、同一内容だけを冪等化する | `tests/claude-pr-convergence.test.ts` |

GitHub APIはunitでmock成功を合格根拠にせず、workflow source mutationと実PR dogfoodを対にする。最終system証拠は、
Draft full CI、comment receipt、Ready rerun、required `harness-check` success、merge timestamp、candidate／merge tree同一receiptの順序を同一PRで記録する。
