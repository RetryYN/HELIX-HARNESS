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
- L4/L9には必要な設計意味と証拠pointerだけを残した。L4既存`output_contract.pair_binding`を軸候補とするが、sourceから一意ではないため`axis_selection_status=l4_design_choice_not_unique_from_source`を記録した。今回の2行は対象identity/revision/scopeまたはdesign/oracle revisionの必須記録が未供給なので、L4の既存state vocabularyと`freeze_missing`のbasisに合わせて`expected_state=missing`とした。`failure_code_status=unknown`は状態とは別で、failure codeの意味未確定を示す。L4/L9とも副作用期待は0、固定blindが述べるpair freeze/TDD success/implementation successは生成しない。L9の非対象保全はblindに材料がないため未主張、`execution_state=not_executed`とした。両行の`FrozenContractIntake`はL4 component refsと既存行由来であり、owner拡張はしていない。
- `known_binding`等の合成値、L9の`input`/`source_packet`/`owner_material`/`original_bytes_utf8`、candidate/preservationの重複はL4/L9から除き、固定artifact一箇所に保持した。証跡行はartifact path/SHA/pointerで参照する。固定bytesそのものは変更していない。
- `target_ref`不一致、owner不一致、個別L6/test reference不一致、sequence等値などはblind input/source basisに分類根拠がなく未決。oracleの既知別revisionは既存`foreign_oracle_revision`が扱う。対象revが分かる場合の細分化もここから導出しない。

## R1 review comment 6533283057への対応

- F1: L4 `negative_classification_state_vocabulary`は必須所見/比較軸の未供給を`missing`、null/未決を`unknown`と区別する。盲導出の2 inputは必須target identity/revision/scopeまたはdesign/oracle revisionをnullで未供給にしている。L4既存`freeze_missing`はnull必須凍結記録を未供給として`missing`にする。従って候補状態を両層で`missing`へ揃えた。failure codeは依然`unknown`である。
- F2: 行に`expected_side_effect_count=0`、成功非生成、L4軸選択の不確実性を記録した。L9には`expected_issue`、`expected_partial_material`、`non_target_preserved`、`execution_state`を追加し、非対象材料がblindに無いことを明記した。
- F3: [GitHub上流運用モデル](../../../docs/governance/github-upstream-operating-model.md)264行は、全PR classで`upstream[].path`を`scaffold/`外と定める。main上の既存違反はこの明示条項を上書きしない。固定artifact SHAは各bindingの`verification.oracles`に保持し、WR231 validatorで実bytesと照合する。過去のscaffold upstream path/hashと時点は後続の比較証跡に保全した。
- F4: 変更前WR223 validator revision `c8f20a4f91456f6d5e5c16e1be0083c34aab6651` / SHA-256 `60e8fdc132be18131f42e48f6a617e6391a883efb7e3deb4f6086c3db8029307`、WR206 validator同revision / SHA-256 `0f71c5fce995ca7defecfcec7f9ae8ef572c5b78a91c70313ec2649c75626323`を履歴証跡に保持した。既存validator pathは拡張版を保ち、WR231の固定BASE、2行だけのL4/L9差、WR223固定L8 `candidate_unit_design`、全3 bindingのupstreamとartifact SHAを静的検査する。旧validator bytesは上記revision/SHAで復元できる。別のWR231 validatorも同じ特定条件を独立照合する。

## 既存失敗と旧HELIX

- 現行の直接failure: PR #3967 R1 review comment 6532324816（Issue #3510 thread）は、L3 F01の対象結線義務に対するL4/L9 F01 rowが無いことを指摘した。base `c8f20a4`は#3967 merge後で、既存L4/L9にはF01の5 negative rowsのみ。今回の2 witnessはその未対応条件に対する候補である。
- 旧HELIX asset `LEGACY-ASSET-5E22432B0A5A8F7CC8B3`: `archive/legacy-generation-2026-09-14/root/docs/governance/ddd-tdd-rules.md` SHA-256 `9eac2cc9e5fa8f1177b39f86681fa928cb22070666a5306dce7ae6943597d7af` §23–24。保持点はtest記述時刻でなく意図欠陥を検出する実Redを求める点。旧層番号、CLI/lint/runtime、CI既定は移さず、L3 F01のtarget/pair traceを現行L4へ意味再導出した。資産明細line 888、disposition unresolved。
- 失敗背景 asset `LEGACY-ASSET-A127DEC3EEE6ED63CF17`: `archive/legacy-generation-2026-09-14/root/docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md` SHA-256 `bab121404c956a0a4b403e589bea1c414af59b5996989bea5fab9f98f42f6872` line 71 `UTW-005`はPR trace/review evidenceがlatest HEAD/merge-baseへ再束縛されない失敗を記録する。revision traceの背景類例であり、現行要求・oracle根拠には使わない。asset ledger line 1000、disposition unresolved。
- 旧sourceと監査記録はread-onlyで確認し、実行も現行pathへのcopyもしていない。保持は契約/traceの意味、変更は責務・層・検証経路を現行L3/L4へ再導出する点。

## 既存期待の保全と未決

- L4既存`failure_conditions` 5件、既存分類5件、`output_contract`、L9既存`expected_material`、normal fixture、negative 5行と他caseを維持した。既存期待値は変更せず、L9の合成入力重複だけを除去した。
- timestamp-onlyは既存行が扱う。blindが示す2条件を越えた分類、既知target内のrevision不一致と未供給の区別、sequence等値は未決である。
- F02専用`SCF-B-0185`はF02 row本体が変わっていないことを確認し、L4全体pinを更新した。旧SHAと理由はbinding noteに保持した。
- R1対応で2行のstateを`unknown`から`missing`へ変更した。WR223/WR206/WR231各validatorで固定BASE・候補2行・期待値保全を再検証した後、SCF-B-0185/0192/0193のL4/L9 upstream pinを現在の検証済みbytesへ更新した。`scfctl stale=0`はこの照合後のpin一致を示し、L5/L8の意味照合・4way分類完了を示さない。
- scaffold候補の静的照合は正式設計・実operation・実Red/Green・受入を生成しない。

## 静的検証

比較前baseline (`c8f20a4`) と補正後を照合する。実行結果は作業完了時に追記する。

| 確認 | 結果 |
|---|---|
| JSON parse / existing-material comparison | pass。L4既存F01 conditions/output/分類5行、L9既存F01 expected/fixture/negative5行、他L9 caseを保持。 |
| fixed blind artifact | SHA-256 `2a53b965d023d81e6add971f8693cf633cfd6152c700e863a13da65568de3983` と一致。 |
| `scfctl validate` | `bindings=181 fail=0`。 |
| `scfctl stale` | `stale=0`。3 bindingのL4/L9 pinは固定BASEと2行候補を検査後、現在のbytesへ再束縛。 |
| `check-pair` | L4/L9 pair-bidir pass、L4 ownership pass。L9に既存`byte_sha256` ownership違反35件が残り、全体exit 1。 |
| `check-child` pair links | L4/L9とL5/L8ともpass。 |
| `check-child` negative 4-way | exit 1。counts L4=30, L9=30, L8=0, L5=0、matched=0。今回のwitness id 2件はL4/L9のみで、L5/L8 counterpartなし。4-way完了ではない。 |
| ownership-cap / pins | L9 35件、L8 1647件の既存違反。L4/L5 pass。全4 pin groups pass（15/14/25/25件）。 |
| `git diff --check` | clean。 |

これらは初回時点での文書・binding静的照合結果である。checkerの失敗を成功扱いにしない。L5/L8の意味照合、failure-code分類、既存ownership違反は未解決である。旧runtime・algorithm・test・CI、新runtime/test/CIは実行していない。

## WR223 binding再評価の後続証跡

SCF-B-0192のscaffold artifact参照の配置修正、固定BASEからの差分限定検証、先行WR223時点snapshotの保全結果は[別証跡](post-wr223-binding-recheck-20261031.json)へ記録した。WR223のREADME/verification-summaryは元revisionのbytesへ戻し、比較後結果で上書きしていない。L5/L8照合とfailure classificationは未決のままである。
