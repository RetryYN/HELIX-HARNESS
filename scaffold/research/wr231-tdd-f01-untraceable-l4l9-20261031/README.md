# WR231 HARNESS-015 F01 L4/L9 untraceable candidate

## 範囲と状態

- Work request: `WR231-TDD-F01-UNTRACEABLE-L4L9`, Issue #3510
- Base: `c8f20a4f91456f6d5e5c16e1be0083c34aab6651`
- 対象: `HARNESS-L4-015-F01` / `HARNESS-L9-015-F01` のuntraceable候補
- 状態: scaffold candidate、`authority_effect=none`。L3/L10の要求意味、承認、実行、受入を変えない。
- L5/L8は変更していない。L4 algorithm、旧CLI/runtime/test/CI、新runtime/test/CIも起動していない。

## 比較前固定artifact

別workerが許可されたL3/L10 F01とL4 F01 sourceから作成したsource-only artifactをbytes不変で収録した: [`source/f01-blind-retry.json`](source/f01-blind-retry.json)。SHA-256は `2a53b965d023d81e6add971f8693cf633cfd6152c700e863a13da65568de3983`。このhashは比較前にIssue [#3510 comment 6532785305](https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6532785305)へ固定された。

Artifactは2つの合成input（対象binding unavailable、design/oracle revision untraceable）と既存timestamp-only条件を記録する。timestamp-onlyは既存L4/L9 F01 negativeにあるため、新しい候補行は作らない。artifactのみが固定入力bytesを持ち、正式oracle・実owner入力・実凍結・実Red・承認を意味しない。

## source照合、識別子、候補の範囲

- 承認済みHARNESS-L3-015-F01: `docs/helix-harness/L3-requirements/functional-requirements.json#/requirements/40`。L6/L5と対test/oracleを実装前に定義・凍結し、対象identity/revision/scopeへ結ぶ。
- 承認済みHARNESS-L10-015-F01: `docs/helix-harness/L10-verification/functional-verification.json#/cases/40`。期待観測は設計/対oracleの版と対象へ辿れること。要件行と照合caseは承認済みreviewed head `a715e777bd59291b26f09c0c1c5481273c6eba2e` の内容と一致する。
- blind artifactが参照したL4 file SHA `738a76b4753a8c51d1c684ae2ffa18d91b7bdbc2794961cde66a47c585aa299b` を持つrevisionは `96083e82980af86a3939f2cd1100bbd2ebf0e6b7`。base `c8f20a4f91456f6d5e5c16e1be0083c34aab6651` のL4 file SHAは `8dfbe628d7beb9b449a3ec48e98b7ed89ebbb4be1ea9b3f061dfd02ba464ea2f`。両revisionの`/contracts/1` row全体は一致せず、base側に既存`negative_classifications` 5件が追加されていた。blindが実際に参照したF01 `failure_conditions`と本文は一致し、それ以外のrow差は既存classificationだった。この差と両revision/hashを比較後に記録した。blindがbase全体を参照したとは扱わず、fixed artifactは編集していない。
- L4 `failure_conditions[].code`は既存のfailure condition keyであり、各`meaning`に結びつく。固定blindの2件はどちらも`failure_code: unknown`で、L3/L10にも新しいfailure codeの意味・enum定義はない。よって追加したfailure conditionsは撤回した。正式L4/L9行の`id`（`WR231-F01-...`）はこの証跡内のcandidate witness row識別子に限定し、failure code/classificationを主張しない。`failure_code_status: unknown`を明示した。
- 静的consumerの調査: `scaffold/tools/design_verification_checker.py`の`_extract_neg_key`は`expected_classification`→`code`→`id`の順に行を識別し、4-way比較の`_normalize_neg_item`は`expected_classification`または`code`をclassification値として比較する。F02用静的validatorもL4 `negative_classifications[].code`を参照する。これらは文書照合であり、failure codeの実行consumerではない。今回の`id`はpopulation/witness識別にのみ使われ、4-way classification値ではない。L5/L8に対応行がなく、4-way完了を主張しない。
- L4/L9には必要な設計意味と証拠pointerだけを残した。L4既存`output_contract.pair_binding`を軸にし、null/未決を`unknown`とする既存state vocabularyを参照する。対象trace不足とpair内design/oracle revision trace不足は別のunresolved witnessとして示す。両行の`FrozenContractIntake`はL4 component refsと既存行由来であり、owner拡張はしていない。
- `known_binding`等の合成値、L9の`input`/`source_packet`/`owner_material`/`original_bytes_utf8`、candidate/preservationの重複はL4/L9から除き、固定artifact一箇所に保持した。証跡行はartifact path/SHA/pointerで参照する。固定bytesそのものは変更していない。
- `target_ref`不一致、owner不一致、個別L6/test reference不一致、sequence等値などはblind input/source basisに分類根拠がなく未決。oracleの既知別revisionは既存`foreign_oracle_revision`が扱う。対象revが分かる場合の細分化もここから導出しない。

## 既存失敗と旧HELIX

- 現行の直接failure: PR #3967 R1 review comment 6532324816（Issue #3510 thread）は、L3 F01の対象結線義務に対するL4/L9 F01 rowが無いことを指摘した。base `c8f20a4`は#3967 merge後で、既存L4/L9にはF01の5 negative rowsのみ。今回の2 witnessはその未対応条件に対する候補である。
- 旧HELIX asset `LEGACY-ASSET-5E22432B0A5A8F7CC8B3`: `archive/legacy-generation-2026-09-14/root/docs/governance/ddd-tdd-rules.md` SHA-256 `9eac2cc9e5fa8f1177b39f86681fa928cb22070666a5306dce7ae6943597d7af` §23–24。保持点はtest記述時刻でなく意図欠陥を検出する実Redを求める点。旧層番号、CLI/lint/runtime、CI既定は移さず、L3 F01のtarget/pair traceを現行L4へ意味再導出した。資産明細line 888、disposition unresolved。
- 失敗背景 asset `LEGACY-ASSET-A127DEC3EEE6ED63CF17`: `archive/legacy-generation-2026-09-14/root/docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md` SHA-256 `bab121404c956a0a4b403e589bea1c414af59b5996989bea5fab9f98f42f6872` line 71 `UTW-005`はPR trace/review evidenceがlatest HEAD/merge-baseへ再束縛されない失敗を記録する。revision traceの背景類例であり、現行要求・oracle根拠には使わない。asset ledger line 1000、disposition unresolved。
- 旧sourceと監査記録はread-onlyで確認し、実行も現行pathへのcopyもしていない。保持は契約/traceの意味、変更は責務・層・検証経路を現行L3/L4へ再導出する点。

## 既存期待の保全と未決

- L4既存`failure_conditions` 5件、既存分類5件、`output_contract`、L9既存`expected_material`、normal fixture、negative 5行と他caseを維持した。既存期待値は変更せず、L9の合成入力重複だけを除去した。
- timestamp-onlyは既存行が扱う。blindが示す2条件を越えた分類、既知target内のrevision不一致と未供給の区別、sequence等値は未決である。
- F02専用`SCF-B-0185`はF02 row本体が変わっていないことを確認し、L4全体pinを更新した。旧SHAと理由はbinding noteに保持した。
- 初回WR231検証時は`SCF-B-0192`がstale=1だった。先行L5/L8証跡が「BASE時点のL4/L9に未対応」と記録し、その後L4/L9へ2 witnessが追加された実質差分が理由だった。後続で固定BASE差分をvalidatorで独立照合し、upstream scaffold参照を修正した結果は末尾の別証跡に記録する。
- scaffold候補の静的照合は正式設計・実operation・実Red/Green・受入を生成しない。

## 静的検証

比較前baseline (`c8f20a4`) と補正後を照合する。実行結果は作業完了時に追記する。

| 確認 | 結果 |
|---|---|
| JSON parse / existing-material comparison | pass。L4既存F01 conditions/output/分類5行、L9既存F01 expected/fixture/negative5行、他L9 caseを保持。 |
| fixed blind artifact | SHA-256 `2a53b965d023d81e6add971f8693cf633cfd6152c700e863a13da65568de3983` と一致。 |
| `scfctl validate` | `bindings=181 fail=0`。 |
| `scfctl stale` | 初回WR231検証時は`stale=1`（SCF-B-0192）。後続のBASE差分validator確認とbinding修正後の結果は末尾の別証跡を参照。 |
| `check-pair` | L4/L9 pair-bidir pass、L4 ownership pass。L9に既存`byte_sha256` ownership違反35件が残り、全体exit 1。 |
| `check-child` pair links | L4/L9とL5/L8ともpass。 |
| `check-child` negative 4-way | exit 1。counts L4=30, L9=30, L8=0, L5=0、matched=0。今回のwitness id 2件はL4/L9のみで、L5/L8 counterpartなし。4-way完了ではない。 |
| ownership-cap / pins | L9 35件、L8 1647件の既存違反。L4/L5 pass。全4 pin groups pass（15/14/25/25件）。 |
| `git diff --check` | clean。 |

これらは初回時点での文書・binding静的照合結果である。checkerの失敗を成功扱いにしない。後続証跡でSCF-B-0192のstaleはpin整合とBASE差分の再検証により解消したが、L5/L8意味照合と既存ownership違反は未解消である。旧runtime・algorithm・test・CI、新runtime/test/CIは実行していない。

## WR223 binding再評価の後続証跡

SCF-B-0192のscaffold artifact参照の配置修正、固定BASEからの差分限定検証、先行WR223時点snapshotの保全結果は[別証跡](post-wr223-binding-recheck-20261031.json)へ記録した。WR223のREADME/verification-summaryは元revisionのbytesへ戻し、比較後結果で上書きしていない。L5/L8照合とfailure classificationは未決のままである。
