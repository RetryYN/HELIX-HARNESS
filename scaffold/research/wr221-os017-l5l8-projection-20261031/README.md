# WR221 OS017 L5/L8 U-ID candidate review

## 範囲とdecision evidence

この研究artifactはWR221依頼に対するscaffold候補です。作業対象base `a53f04482ff883decf1019dc9c212ab712271749` に対するL5/L8正式文書はbyte-identicalに保ち、4層markerや正式membershipを作っていません。最新main `edcb17bb84b5134b4b3149b4521058d983cf972c` を別refから取得した新worktreeへ移し、4対象classと63 U-ID rowを再照合しました。

OS017の前提行は委任decisionの対象です。`HDEC-OS-WORKFLOW-PREREQUISITE-L3L10-2026-10-12` はreviewed head `5c62d19b78fca3be1964c0cd3157a540950150dc` のOS017/020/023追加12組を承認し、draft/not_executed metadataを固定bytesとして保持すると記録します。独立review結果はPR #2952 comment `6113847591`（exact HEAD `5c62d19b78fca3be1964c0cd3157a540950150dc`、base `d7652c53faf9c7cba6c13faa9a50e24f3e0b2b3e`、no_findings/委任承認成立）。PRはmerge commit `2945b75bc5a71c19885a62a867b0a884399bffae` でmainへ入り、現baseはその子孫です。admission記録は `docs/governance/audits/prerequisite-l3-l10-definition-audit-2026-10-12.json` にあります。

承認scopeに017-B01/F01–F03が明記されています。現在のL3/L10文書内にあるF01/B01の4対象rowは、reviewed headに埋め込まれたapproved objectsと各row単位で一致します。文書statusは `draft_not_approved` / `not_executed` のままですが、decision本文はそのmetadataを固定して承認しています。これは実操作、実環境、受渡し、L11 acceptanceの成立を意味しません。

## 4 class候補と63 unit row

WR221の範囲は従来4候補に限定しています。#3965でmainに追加された第5候補 `OS017-NEG-workflow-resume-source_unresolved` とL9 cases 51/53のsource-class refsは別作業のため対象外であり、candidate projectionへ加えていません。validatorは4対象classの内容・source pointerがWR221 baseと同一であることを検証します。L4に第5候補が存在する現行mainとの差分は認識しつつ、4対象のみで63 rowを構成します。L9側は全217 integration expectedがtask baseから不変であることを確認します。

L4 `/failure_classifications` の4候補を、source pointerから対応する既存L8 `unit_cases` 行へ結びました。`u-id-candidate-projection.json` は各classの共通compact expectedと対象function群を一度だけ記録し、各U-ID行はunit IDとL7 case pointerだけを保持します。静的validatorが各U-IDについてL8 `project_call`と7 call IDsをL7へ解決し、L5 function ID、raw input、既存compact expected、L5 membershipを再計算して照合します。期待値やcall IDを63行へ複製していません。

| L4 candidate class | ordered finding / condition | facet state | U-ID row数 |
|---|---|---|---:|
| `OS017-NEG-inputs-source_unresolved` | `[source_unresolved]` / `workflow_material_unknown` | inputs / unknown | 34 |
| `OS017-NEG-inputs-source_conflict` | `[source_conflict]` / `workflow_material_violation` | inputs / violation | 17 |
| `OS017-NEG-ownership-source_unresolved` | `[source_unresolved]` / `workflow_material_unknown` | ownership / unknown | 6 |
| `OS017-NEG-ownership-source_conflict` | `[source_conflict]` / `workflow_material_violation` | ownership / violation | 6 |

各候補rowのownerは `ticket-workflow-owner`。L4候補のexpected fieldsとL3/L10義務、L7のraw `given_input_ref` graphからsource-onlyで期待を記録し、既存L8 compact expectedとの一致を静的に照合しました。L9の値は整合比較に限り、期待の生成には使いません。

各U-ID rowの`project_call` 1件とfunction-call ID 7件はL7 `function_calls`で解決し、対象function `F01701`–`F01708` はL5の既存function IDsにも存在します。これは呼出し対象の参照であり、L5 class-output crosswalkではありません。validatorは計441個のunit `function_calls`に加え、63個の`project_call`も解決します。

## 未成立とQA §3の不足

QA §3のU-ID rowは対象、反例と期待結果、oracle ID、test citationを扱います。候補artifactで既存sourceから参照できた範囲は次のとおりです。

- **対象**: L8 unit rowの`project_call`と7 call IDs → L7 call records → L5 function IDs。
- **反例**: L4 source pointerとL8 `source_case_pointer`が指すL7 `given_input_ref` raw graph。
- **期待**: L4候補のcondition/finding codes。existing L8 compact expectedは保持・比較値。
- **oracle ID**: L8 unit-contract単位のL10 `system_oracle_ref` とL9 `source_l9_oracle_ref`を記録しました。どれがQA上のU-ID単位oracle IDかは確定しておらず、割当てていません。
- **test citation**: 現行L8 unit rowsに該当項目・citationはありません。function-call IDをtest citationと読み替えず、nullのままにしています。tests/runtimeは実行していません。

既存L8 case membershipから見えるL5 contract参照は、inputs conflict 17件がF01、ownership unknown/conflict各6件がB01です。inputs unresolvedは31件がF01のみですが、3件は複数contractにまたがります。

| U-ID | L7 pointer | 既存L5 contract refs |
|---|---|---|
| `OS017-L8-EXPECTED-BINDING-REQUIREMENT_REVISION-UNKNOWN` | `/cases/92` | F01, F02, F03 |
| `OS017-L8-EXPECTED-BINDING-SCOPE-UNKNOWN` | `/cases/93` | F01, F02, F03 |
| `OS017-L8-EXPECTED-BINDING-CONTRACT_REVISION-UNKNOWN` | `/cases/95` | F01, F02 |

以上の参照は既存L8のcase/unit-contract membershipです。これらの複合membershipから単一L5機能を選ばず、L5 output crosswalkは全4 classで未形成のままです。test citation未観測およびper-U-ID oracle identity未割当のため、候補はQA §3を満たす完了投影ではなく `candidate_partial_incomplete` です。

L8の217 compact expectationsはすべて保持しています。正式L5/L8ファイルにcandidate class IDやclass membershipを追加していません。したがって正式4層membership、4way PASS、実行済みとは扱えません。

## 4way reachability

正式L5/L8 pathsはWR221 task baseと一致しています。baseline記録（task base時点）は `L4=4, L9=0, L8=0, L5=0, failures=6`。最新mainでは第5 L4 classが別途追加されています。最新main上のcheck-child実測は `L4=5, L9=0, L8=0, L5=0, failures=8` です。増加した第5 class（L4）とcases 51/53のL9候補参照はこの候補の対象外で、全体countと4対象classの範囲限定candidateを混同しません。L4/L9とL5/L8のpair PASSは4way成立を意味しません。

L4/L5 algorithm、runtime、旧HELIX CLI/runtime/test/CI、新runtime/test/CIは実行していません。SCF-B-0189はこのscaffold証拠とそのsource pinsだけを登録します。新gateは追加していません。

## 旧HELIX sourceとfailure根拠

旧source `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md`（`LEGACY-ASSET-3A15E5645D2D2A59DFF5`）§4（80–85行）とHXT-FR-001..003（190–198行）から、要求正本、Design/PLAN、ExecutionTicket、Assignment、Attempt、Measurementとsource/scopeの境界を照合しました。意味の再導出を行い、旧CLI/DB/schemaは移植しません。

旧failure audit `archive/legacy-generation-2026-09-14/root/docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md`（`LEGACY-ASSET-A127DEC3EEE6ED63CF17`）UTW-002（68行）はprose handoverとevent-first正本の競合、UTW-005（71行）はHEAD/merge-baseへの証跡再束縛欠落、UTW-021（87行）は自己申告をcompletion evidenceとする弱点を記録します。今回のfixtureが同failureを再現したとは主張しません。source pointer・expected・owner境界を分け、候補参照を完了根拠へ変えない方針の照合材料としました。

## 静的検証

`validate_candidate.py`は、decision admissionと4対象row、L4→L7 raw pointer→L8 U-ID graph、L7 function-call→L5 function解決、各U-ID compact expected、既存L5 membership/oracle refs、未観測test citation、L5/L8のbase byte一致、SCF upstream pinsを静的に確認します。期待値の導出にL9を用いず、test citationも作りません。
