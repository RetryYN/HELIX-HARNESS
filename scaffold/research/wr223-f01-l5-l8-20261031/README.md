# WR223 HARNESS-015 F01 L5/L8候補

## 範囲と状態

- Issue: #3510、依頼 `WR223-HARNESS-TDD-FLOW-F01-L5L8`
- 基点: `dd5931cfff4ff786da2ced44de2a40529edf7b71`
- Binding: `SCF-B-0192`
- 対象: `HARNESS-L5-015-F01` と `HARNESS-L8-015-F01` の候補annotationだけ
- 状態: scaffold候補、`authority_effect=none`。承認済みL3/L10の意味と既存L4/L9の散文・部分期待を手動照合した記録であり、正式な設計、独立oracle、実行結果、受入、4way成立ではない。

L4/L9とL8の既存unit-case ID一覧、L5の既存contract、既存L8 unit casesは変更しない。candidate caseはL8既存case rowの入れ子へ置き、canonical `unit_case_ids`／`unit_cases`へ追加しない。checker用keyの改名、singleton classの新設、candidate行の4way件数への計上はしない。

## 固定artifactと比較順序

### r1からr2への差分

- r1 [`source/f01-blind-draft-r1.json`](source/f01-blind-draft-r1.json)、SHA-256 `e4f7be9befded4f2398209eac0d3ef226c0cd62cefa5e47d013a18e87f265bbd` は、別担当がL3 MarkdownとL4 F01散文だけから固定した意味範囲で、L10本文を読まずに作成された。
- r2 [`source/f01-blind-draft-r2.json`](source/f01-blind-draft-r2.json)、SHA-256 `fa047d5d871913b696ba5e01d9227ce13a68bc827ff6e8c66cc29d8e69d7e647` は、承認済みrevisionのL3 JSON rowとL10 JSON caseを追加して意味範囲を更新し、approval/main-admission調査と露出監査を追記した。L10の正例には未実装／未修正状態からの順序照合が入り、負例を後付け・未凍結・別revision・時刻だけへ具体化した。r1を上書きせず両版を保全した。
- r2はIssue [#3510 comment 6531844362](https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6531844362)へ固定済み。r2のSHAは比較開始前に照合し、候補artifactにも同一bytesを収録した。
- 比較順序: r1を固定 → L3/L10 JSONとrepo内decision/auditで承認source revision・main admissionを確認 → r2を固定してIssueへ記録 → L4/L9と既存L5/L8を比較 → L5だけを変更・commit → そのcommitのL5 bytesをL8 source pinへ設定 → L8候補を追加。

固定artifactは意味範囲だけを持つ。schema、具体入力値、分類実装、正式期待値、実Red/Green、4way成立は固定せず、候補からも生成しない。

## 承認済みsourceとrevision

- L3正本: `docs/helix-harness/L3-requirements/functional-requirements.json`。F01 rowは承認reviewed head `a715e777bd59291b26f09c0c1c5481273c6eba2e` の `/requirements/40`。decisionの承認時JSON SHA-256 `62a954e9…d6689` は当該head上で一致する。
- L10正本: `docs/helix-harness/L10-verification/functional-verification.json`。F01 caseは同reviewed headの `/cases/40`。decisionの承認時JSON SHA-256 `e2580d52…6ace7c` は当該head上で一致する。
- `docs/governance/audits/prerequisite-l3-l10-definition-audit-2026-10-12.json` はF01 row pairをPR2943、approval comment 6113131428、merge commit `28739e940176b0128c49b4646615674ba33b6771`へ結び、両base rowがaudit entryと一致する。PR2943 merge commitは基点の祖先である。
- 後続034 decision PR2959は追加13組と先行113組不変を記録し、merge commit `de53e71f2f3bb0f260a792244fe8badd46f4274d` は基点の祖先である。基点のL3/L10 file SHAは同decisionのpinsと一致し、F01 row/caseはapproval audit entryと同じ。
- 両decision metadataには `recorded_pending_final_review_and_main_admission` が残る。main admissionは上記repo内audit・merge ancestryで確認できたが、metadataのfinal-review語が未解消か更新漏れかは不明として残す。Issue/PR本文はこの作業で開いていない。

## L5/L8候補

L5候補の第1commitは `f97e1ff9331bafdc5d87b4f6e1af067020e78b76`、同revisionのL5全体SHA-256は `216e8f04638ab8734c91333bbb6bae48031e13224d084eb9fc750f125d703610`。L8 candidate source pinはこのrevisionと全体SHAを固定する。既存L5 F01 fieldsとsemantic rulesは同一で、末尾へcandidate-only分類案を追加した。

L8 candidateは1 positive、5 negative witnessを持つ。正例projectionはL4 `/contracts/1/output_contract` とL9 `/cases/1/expected_material` を参照する。負例projectionは対応するL4 `negative_classifications` とL9 `negative_cases` の軸、状態、owner、副作用数を短く写し、各入力witnessは既存L9 owner-material pointerを指す。L4のoutput pointerは静的に解決する。L9 fixtureは `synthetic_independent_owner_design_fixture` であり、正式owner由来inputと主張しない。

| candidate witness | source条件 | candidate projectionの根拠 |
|---|---|---|
| positive normal | L9 normal fixture | L4 output contract + L9 expected material |
| freeze missing | 凍結記録の欠落 | L4/L9 `freeze_missing` |
| test after body | 本体変更後の凍結 | L4/L9 `test_after_body` |
| foreign oracle revision | oracleのrevision不一致 | L4/L9 `foreign_oracle_revision` |
| freeze as Red | 凍結だけをRed扱い | L4/L9 `freeze_as_red` |
| timestamp only | 早い作成時刻だけで原記録なし | L4/L9 `freeze_timestamp_only` |

`freeze_missing`と`freeze_timestamp_only`は双方 `freeze_before_body=missing` だが別条件のまま別witnessにした。各候補行のIDはresearch内識別子で、既存の6件の`unit_case_ids`や35件の`unit_cases`へ加えていない。従ってcanonical four-way negative row数を増やさない。 静的 `design_verification_checker.py check-child` もこの候補後に4way countsを `L4=28, L9=28, L8=0, L5=0` と報告し、matched=0のまま。L4/L9 pairとL5/L8 pair自体はpassしたが、full negative 4wayはfail/residualのままであり、このcandidateは件数へ入らない。ownership-capはL9で35件、L8で1647件が残り、pinsは4文書ともpass。

## 既存失敗と旧HELIXとの対応

現行の同種gapは `scaffold/research/wr206-tdd-flow-neg-4way-pr-a-20261031/README.md` に記録されている。L4/L9に負例28件ずつがありL5/L8は0件、child照合で33件の失敗が残り、ownership-capもL8で既存1647件の指摘が残る。ここではF01だけに候補pairを置く。残る27件、ownership-cap、4way完成は扱わない。

旧HELIXの対応sourceは `LEGACY-ASSET-5E22432B0A5A8F7CC8B3`、`archive/legacy-generation-2026-09-14/root/docs/governance/ddd-tdd-rules.md`（SHA-256 `9eac2cc9e5fa8f1177b39f86681fa928cb22070666a5306dce7ae6943597d7af`）と `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/vmodel-pair-freeze.md` である。保持するのは契約先行、pairを実在する設計とtestへ明示的に結ぶこと、Redは意図した欠陥の実観測であること。変えるのは旧lint/層番号/実装形式を移植せず、現行承認済みL3/L10 F01と現行L4/L9に従ってL5/L8候補の意味・source pin・witnessを組み立てる点である。候補設計のために旧runtimeやlintを再利用・実行しない。

同種の失敗記録 `archive/legacy-generation-2026-09-14/root/.helix/audit/A-114-ddd-tdd-strengthening-reaudit.md:37-41` は15件のPLANがdraftかつreview evidenceなしの間に実装がshippedしていた状態（implementation ahead of confirmed PLAN）を示す。旧 `PLAN-REVERSE-28-red-first-tdd-evidence.md` はRed-first evidenceが機械的に強制されていなかったgapを記録する。これは固定sourceの意味を変える根拠ではなく、候補を承認済み設計・実観測と誤認しない境界の参考にした。

## 検証と未決

再現可能な静的validatorは [`validate_static_candidate.py`](validate_static_candidate.py)。JSON parse、source revision/file hashes、RFC6901 pointer解決、L4/L9/L8既存bytes・期待の不変、L8 L5 final pin、r1/r2 hashes、候補IDとcanonical IDの分離を確認する。validatorはL4/L5 algorithmを実行しない。旧HELIX runtime/test/CIと新runtime/test/CIは起動しない。 実行結果はvalidator PASS、`scfctl validate` `bindings=177 fail=0`、`scfctl stale` `stale=0`、staged `git diff --check` はclean。

正式な入力owner、production schema/codec、分類優先順位、L5/L8正式設計、independent oracle、実行・受入、全negative 4way matching、L8 ownership-cap、通常のL3再開は未成立のまま残す。候補artifactの存在やvalidatorの成功でこれらを生成しない。
