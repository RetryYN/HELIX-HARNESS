---
title: "Universal Improvement source registry L8単体テスト設計"
canonical_layer_scheme: L1-L12
layer: L8
executed_at_layer: L3
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-30
updated: 2026-08-30
owner: QA / Codex TL
plan: docs/plans/PLAN-L7-703-universal-improvement-source-registry.md
pair_artifact: docs/design/helix/L6-function-design/universal-improvement-source-registry.md
github_issue_id: 1231
behavior_contract_id: UNIVERSAL-IMPROVEMENT-SOURCE-REGISTRY-001
responsibility_owner: universal-improvement-source-registry
---

# Universal Improvement source registry L8単体テスト設計

本書はL6設計のsource／detector identity、実体digest、read-only observation admission、doctor接合を
独立oracleへ降ろす。通知、AI出力、DB row、Issue件数を観測正本として利用しない。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-UILSRC-001 | current registry | 10 source kind、source／detector ID、version、read-only policyをexactly oneずつ返す | `tests/universal-improvement-source-registry.test.ts` |
| U-UILSRC-002 | uniqueness／completeness | duplicate source／detector／source kind、required source kind欠落、evidence contractのsource_revision欠落を個別にfail-closeする | `tests/universal-improvement-source-registry.test.ts` |
| U-UILSRC-003 | physical authority | registry／source／detectorのdigest driftとrepository外pathをgreenへ縮退しない | `tests/universal-improvement-source-registry.test.ts` |
| U-UILSRC-004 | valid admission | registered source、schema、detector、revision、evidenceが一致するobservationだけadmitする | `tests/universal-improvement-source-registry.test.ts` |
| U-UILSRC-005 | malformed admission | unknown source、wrong schema／detector／source revision、必須field欠落、invalid digest／timestampに加え、snake_case／dot／空白／bracket／camelCaseで表されたtoken・PII fieldを個別に拒否し、`tokenizer`等の非機密語を誤拒否しない | `tests/universal-improvement-source-registry.test.ts` |
| U-UILSRC-006 | freshness | freshness windowを超えたobservationをstaleとして拒否する | `tests/universal-improvement-source-registry.test.ts` |
| U-UILSRC-007 | doctor happy path | current registryのschema、実体digest、source kindをdoctorがgreen判定する | `tests/universal-improvement-source-registry-doctor.test.ts` |
| U-UILSRC-008 | doctor failure | registry欠落とJSON破損をwarningや空registryへ丸めずredにする | `tests/universal-improvement-source-registry-doctor.test.ts` |
| U-UILSRC-009 | doctor wiring | full doctorのstate、ok判定、messageへ同じcheckをexactly once接続する | `tests/universal-improvement-source-registry-doctor.test.ts` |
| U-UILSRC-010 | physical admission boundary | 構造検査だけの結果、registry integrity欠落・bytes driftをadmissionへ渡さずfail-closeする | `tests/universal-improvement-source-registry.test.ts` / `tests/universal-improvement-source-registry-doctor.test.ts` |
| U-UILSRC-011 | non-forgeable admission proof | 構造結果のboolean偽装とloader成功後のresult改竄をrepository-bound resultとして再利用させず、共通physical identityのTOCTOU再検証を維持する | `tests/universal-improvement-source-registry.test.ts` |

## Red／Green／mutation境界

required source kindを1件削除、registry versionまたはbytesをintegrity更新なしに変異、source／detector digestを0へ
変異、unknown identityを注入、freshness判定を除去、構造検査結果のphysical flagを偽装、loader結果を改竄、doctorのok接続を外す変異は、
対応するU-UILSRC oracleをredにする。テストはsource registryや
repository authorityを書き換えず、一時rootのfixtureだけを終了時に破棄する。
## sensitive fieldポリシーoracle

| Oracle | 正例 | 負極性mutation |
|---|---|---|
| `U-UILSFP-001` | separator／camel／結合／数字接尾辞をfamily分類する | 結合keyまたは数字接尾辞だけを通過させたらfail |
| `U-UILSFP-002` | benign keyを許可する | 部分文字列だけで`tokenizer`等を拒否したらfail |
| `U-UILSFP-003` | sensitive fieldを既存reasonへ畳み込む | raw keyまたは値をfailureへ展開したらfail |
| `U-UILSFP-004` | policy versionとfamily exact setを固定する | version不変でfamilyを変更したらfail |
