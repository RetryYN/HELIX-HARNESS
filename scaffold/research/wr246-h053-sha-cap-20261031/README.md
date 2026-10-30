# WR246 H053 L8 subject digest cap 調査

status: scaffold research evidence（正式test/実行証拠ではない）
authority_effect: none
base: `03141af4af6c5c3d9dc1f1bf075f29d96928d0f7`

## 結果

WR211で残したL8 forbidden-key 30件を行別に調べた。対象は `additional_unit_cases` のADD-22..ADD-27、それぞれ5つのQualification `subject_sha256`である。30値すべてがQualificationの`subject_ref.sha256`と一致するが、同identityのsource_ref/Envelopeでの裏付けはbranchごとに異なる。全30件についてowner、qualification Ref、subject Ref、digest、source_ref/Envelope pointer、branch、function参照、期待axis・rule refを[`subject-sha-mapping.json`](subject-sha-mapping.json)に記録した。期待値自体は固定baseのL8だけに保持する。

| case | branch | subject digestが識別する値 | sourceとの関係 | 既存期待との対応 |
|---|---|---|---|---|
| ADD-22 Q0..Q4 | qualified non-applicability whole | map-QA authority、map-QO oracle、relation-body LS、relation-record LS、typed-edge reasonのQualification subject | 各body/recordのsource Refに一致。reason Envelope body digestも一致 | authority/oracle=`matched`、typed edge=`not_applicable`。期待値は変更しない |
| ADD-23 Q0..Q4 | foreign-scope non-applicability whole | map-QO、map-QE、relation-body/record LS、foreign reasonのsubject | source Ref/body digestは一致するがreasonのscopeはforeign | authority missing/unknown、oracle/typed edge matched。scope mismatch ruleを維持 |
| ADD-24 Q0..Q4 | unselected foreign control | ADD-23と同じforeign fixture subject群 | source Ref/body digestは一致。foreign reasonはunselected control | `expected_comparison`の既存状態をそのまま維持。selected reasonと混同しない |
| ADD-25 Q0..Q4 | selected reason source missing | map-QA/map-QO/relation-body/record/typed-edge claim | Q0..Q3はsourceあり。Q4の`reason:typed-edge`はsource_ref/Envelope自体が無い | typed-edge=`unknown`、source_missing rule |
| ADD-26 Q0..Q4 | selected reason source bytes mismatch | ADD-25と同じ subject群 | Q0..Q3は正常。Q4 subject/ref SHAは`727d…`だがEnvelope body SHAは`e514…` | typed-edge=`unknown`、source_bytes_mismatch rule |
| ADD-27 Q0..Q4 | selected reason qualification unresolved | ADD-25と同じ subject群 | body digestは一致。Q4 selected qualification Refは未解決 | typed-edge=`unknown`、qualification_unresolved rule |

これら30値は文書source pinではなく、期待出力でもない。合成fixtureのQualification input（外部に出ていないsource claimを含む）で、L5 `Qualification.subject_sha256`を検査する具体値に当たる。値の抽象的な責務と検査条件は既存L5の`type_contract/types/Qualification/subject_sha256`と`HARNESS-L5-053-validate_lineage_input` algorithm[2]にある。

## L8材料の撤去と保持

PR #3986 R1 F1の指摘と、#3510 comment 6447665479の軽量化決定に従い、ADD-22..27のtyped fixture inputにあった`subject_sha256` 30 propertyをL8から撤去した。`removed_materials`に決定参照、撤去前commit/path、件数と意味、将来L7への引継ぎ境界を記録した。L5は未変更、L8のcase ID・branch・他input・function_ref・expected・expected_comparison・rule refsは維持した。key改名やexpectedへの移動はしていない。

`subject-sha-mapping.json`は固定baseから採取した30行の比較証拠としてbytesを変更せず保全した。これはscaffold-onlyの著述・照合材料であり、正式fixture、test code、承認済みoracle、test citationではない。QA §3に従ってL5へfixtureを移さず、正式L8からscaffold evidenceへの参照も追加していない。将来L7を作る際、mappingのbranch/subject/sourceの区別を引き継ぎ、期待とcitationは承認済み契約に従って独立に記す。

### 撤去前のgit provenanceと先例

- #3510 [decision comment 6447665479](https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6447665479)は、BRAIN以外のL8/L9にも同じ軽量化基準を適用し、`removed_materials`で撤去元を辿らせ、要求の意味・git履歴・新しいgateを変えないと決定している。
- #3911の`docs/helix-security/L8-unit-verification/configuration-revision-integrity.json`は、撤去前をcommit `1b91e01d30ab40b5023b06d72f1fd83039ce7590`で指す。`removed_materials`が全文写し・L9重複・補助digestの種類と件数を列挙し、function expected、oracle recipe、pointer、source pinを保持する。
- #3924の`docs/helix-security/L8-unit-verification/data-use-classification.json`は、撤去前commit `860e9c8ff5607f8b00890a04393b147f1c142f2d`とpathを残す。L3/L10・L9複製、source pin以外の補助hashを撤去材料として区別し、単体入力/期待、function expected、traceとrecipeを保持する。
- #3929の`docs/helix-security/L8-unit-verification/project-scope-isolation.json`は、撤去前commit `c24f3a662b6f50d28875f4b090969b144cab3538`からのpathを残す。192件の文書側hashを種類別に数え、反例と期待、275件のsource pin、fixture digestは保持したと記録する。
- #3930の`docs/helix-security/L8-unit-verification/credential-value-boundary.json`は、直前の記録commit `c3f5fac3770c5a3aa456ab36f1d7bf25447da209`とpathを維持し、`removed_materials`のkey改称を戻して既存名を保った。

これらは各merge commitとその第一親の同一pathを`git show`で直接確認した。今回もbase commit `03141af4af6c5c3d9dc1f1bf075f29d96928d0f7`の同一pathに撤去前の全文が保存される。添付のmappingは撤去値の意味を行別に読むための固定証拠であり、L8の正式契約には昇格しない。

## 旧HELIXと失敗事例

- 旧HELIX `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` (`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:143`): path非依存ID、意味revision、lineage、authority/oracle/typed edgeを保持する意味の再導出。初回の記録照合に限り、変換/保存は生成しない。
- 旧HELIX `LEGACY-ASSET-AFE91778057B7E76BEEC` (`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L1-infinity-loop-operational-test-design.md:76`)、`LEGACY-ASSET-C7F0C3B79CBAA72960BF` (`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:53,82`): authority/oracle/typed edgeとidentity/history欠落の負例を個別に対応づける。旧操作・旧testは実行しない。
- 同種のcap解消はPR #3954 / WR211 (`scaffold/research/wr211-hash-reference-reconciliation-20261031/README.md`): 43件から13の重複参照を除き、期待とcase inputは不変、残る30のQualification inputは維持した。WR246でそれらの参照重複と実際の各branch用Qualification claimを分けて調べた。
- 失敗事例PR #3978 / WR238 R1 (`docs/governance/audits/wr238-process-state-l5l8-alignment-correction-r1.json`): L9 counterpartが無い2行に「L9と一致」とするgeneric verdictがあった。参照元にないoracle/test対応を推定しないため、今回もtest citationを作らず未解決にした。
- QA §3 `docs/governance/design-verification-quality-assurance.md` はL8への全返却・seed・COPY・hash・巨大fixtureの持ち込み、およびL5へのtest用合成fixture本体を禁止する。このため具体fixtureをL5へ移さず、L8でhashのkeyを改称してcapを通すこともしない。

## 検証

`validate_static_candidate.py` は指定baseのGit objectを読み、30行の撤去前pointer/valueとsubject/source Ref対応、Envelope content digestを確かめる。候補L8が30個の指定input memberだけを除き、branch/function/全期待/残りのinputを維持したこと、L5がbase bytesと同一であることも静的に比較する。設計checker `check-child` は変更前後の測定に使うが、L4/L5 algorithm、旧runtime/test/CIは実行しない。初回調査の測定は `verification-summary.json` に保持し、R1対応後の測定は `verification-summary-r1.json` に記録する。
