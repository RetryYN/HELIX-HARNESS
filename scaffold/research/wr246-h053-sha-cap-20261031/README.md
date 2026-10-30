# WR246 H053 L8 subject digest cap 調査

status: scaffold research evidence（正式L8改訂、承認、実行済みtestではない）
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

## L8からの移動可否

QA §3はL5にtest用合成fixture本体を置かず、L8を対象・反例/期待・oracle ID・test citationのU-ID表に限る。したがって具体値をL5へ移すことも、L8内で別名に置き換えることも行わない。固定baseのADD-22..27に`test_citation` fieldはなく、L7にsemantic-asset-lineageのtest fileもない。関数参照だけをtest citationとみなす根拠は確認できなかった。

各値とsubject Refの対応は30/30、同identityのsource Ref/body hashは29/30の範囲で再解決できた。唯一のsource-missing caseであるADD-25 Q4は、その不在自体が反例の意味である。ADD-26 Q4では、宣言SHAとraw content digestの不一致を確認した。ADD-27 Q4はsource body一致と資格Ref unresolvedを区別している。これらをL5にfixtureとして移すとQA配置境界に反し、L8から単純に消すとU-IDに必要なtest citationがない。従って正式L5/L8本文を変更せず、capを30件から下げるのは未完とする。mapping artifactは値の行き先と分岐意味を調べたsource-only evidenceであり、test code・正式oracle・承認済みfixtureではない。

## 旧HELIXと失敗事例

- 旧HELIX `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` (`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:143`): path非依存ID、意味revision、lineage、authority/oracle/typed edgeを保持する意味の再導出。初回の記録照合に限り、変換/保存は生成しない。
- 旧HELIX `LEGACY-ASSET-AFE91778057B7E76BEEC` (`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L1-infinity-loop-operational-test-design.md:76`)、`LEGACY-ASSET-C7F0C3B79CBAA72960BF` (`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:53,82`): authority/oracle/typed edgeとidentity/history欠落の負例を個別に対応づける。旧操作・旧testは実行しない。
- 同種のcap解消はPR #3954 / WR211 (`scaffold/research/wr211-hash-reference-reconciliation-20261031/README.md`): 43件から13の重複参照を除き、期待とcase inputは不変、残る30のQualification inputは維持した。WR246でそれらの参照重複と実際の各branch用Qualification claimを分けて調べた。
- 失敗事例PR #3978 / WR238 R1 (`docs/governance/audits/wr238-process-state-l5l8-alignment-correction-r1.json`): L9 counterpartが無い2行に「L9と一致」とするgeneric verdictがあった。参照元にないoracle/test対応を推定しないため、今回もtest citationを作らず未解決にした。
- QA §3 `docs/governance/design-verification-quality-assurance.md` はL8への全返却・seed・COPY・hash・巨大fixtureの持ち込み、およびL5へのtest用合成fixture本体を禁止する。このため具体fixtureをL5へ移さず、L8でhashのkeyを改称してcapを通すこともしない。

## 検証

`validate_static_candidate.py` は指定baseのGit objectを読み、30行のpointer/valueとsubject/source Ref対応、Envelope content digest、branch/期待参照、L5抽象契約、固定source revision、test citationの有無を静的に確認する。設計checker `check-child` は変更前後の測定に使うが、L4/L5 algorithm、旧runtime/test/CIは実行しない。check-child結果は `verification-summary.json` に記録する。
