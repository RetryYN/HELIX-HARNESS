---
title: "Concept v4由来L2要求のL11受入設計"
canonical_vmodel: L1-L12
canonical_layer: L11
canonical_pair: L2
layer: L11
kind: test_design
status: draft
authority_status: migration_crosswalk_only
freeze_blocking: true
created: 2026-09-14
updated: 2026-09-14
pair_artifact: docs/design/helix/L2-requirements/concept-v4-derived-requirements.md
---

# Concept v4由来L2要求のL11受入設計

本書は総称HELIXのL11受入正本ではない。混在するHCV4-L2要求を対象別L11へ分解するときに、
利用場面とnegative caseを失わないためのmigration sourceである。対象別L2／L11の承認後は非実行archiveへ移す。

本書は対象別移管前の混在L2要求に対応する受入案であり、実施結果ではない。全6件とも未実施。
L3候補のL10 oracleとは分け、利用者が対象・状態・判断根拠を確認できるかを実操作で検証する。
合意済み要求revisionとプロトまたは適用性receipt、検証対象artifact、入力データ、操作、期待結果、
実結果、独立検証者の記録が揃うまでpassにしない。未実装の画面をモックだけで受入済みとしない。

| 受入ID | L2要求 | 利用者による確認と反例 |
|---|---|---|
| HCV4-L11-001 | HCV4-L2-001 | 要求・選択・承認・採否の対象と版を確認できる。相談だけの発言や別revisionへの承認を入力しても、対象変更の承認済み表示・実行許可が生じない |
| HCV4-L11-002 | HCV4-L2-002 | 一つの要求からowner・成果・検証・配布・運用へ辿れる。owner欠落・複数owner・trace切れを個別に投入し、不足箇所を確認できる |
| HCV4-L11-003 | HCV4-L2-003 | 完了根拠の対象版と実行結果へ到達できる。未実行oracle・不一致digest・別HEADのreview・projectionだけのclaimを、それぞれ未検証として識別できる |
| HCV4-L11-004 | HCV4-L2-004 | runtime交代前後で同じ要求・承認・作業状態を確認できる。期限切れlease・不明HEAD・不足capabilityの各場合に再開せず、必要な解決事項が分かる |
| HCV4-L11-005 | HCV4-L2-005 | 機能の提供範囲とartifactを確認して導入・更新・復旧の結果を辿れる。未適格Sliceの混入、release済みだがdeployment失敗、rollback未検証を成功と表示しない |
| HCV4-L11-006 | HCV4-L2-006 | 観測から改善候補・影響要求・採否・再検証へ辿れる。未承認候補や単発経験によって要求・Policyが変更されず、保留・棄却理由も確認できる |

対象別の受入先は[HARNESS L11](../harness/L11-product-acceptance.md)と
[HELIX-OS L11](../helix-os/L11-governance-acceptance.md)。
[L2移管対応](../../design/helix/L2-requirements/concept-v4-derived-requirements.md)に従って具体条件・反例を分離する。
本書の6件と対象別の要求件数を加算して全要求数とせず、同じ条件の重複受入で移管済みとは判定しない。

HCV4-L11-001..006は両対象のL11へ全件移管先を記録済みである。各IDは工程・提供契約をHARNESS、
実行・記録・管理統制をHELIX-OSへ分割するため両方から参照される。二重実行する受入IDではなく、
旧混在条件を対象別の利用結果へ分解するsource relationである。状態は全件`split_pending_approval`とする。

## 統制とプロダクト別開発方式の分離の確認

HCV4-L11-001／002／003／004／006では、L2に記録した2026-09-14のPO指摘に対応する具体化案を確認する。

- 異なる言語・開発styleの2プロダクトで、共通に必要な要求trace・承認・検証・完了証拠と、各プロダクトの選択値を区別できる。
- 一方のテストツールや作業分割を変更しても、他方の設定や共通統制を暗黙変更しない。変更した側の要求revisionと検証対応を辿れる。
- プロダクト設定による承認省略、自己reviewの独立扱い、証拠なし完了を拒否し、拒否理由を確認できる。
- HELIXのPython／Node構成や旧15画面を、対象プロダクトの実装・UI必須条件として誤表示しない。
- 非UIの適用性記録とL2要求を確認でき、画面がないことによる要求欠落を許容しない。

以上は未実行の受入案であり、実行engineの分離済み・既存候補の承認済みを意味しない。

## memory責務変更の受入先

HMC-BR-001..006の条件と反例は[HELIX-OS L11](../helix-os/L11-governance-acceptance.md)の
「memory責務変更の受入条件」へ移管した。移管先も未実行であり、文書移管を受入成功として数えない。

## 提供・再編要求の受入先

構成管理・配布運用の反例は[HELIX-OS L11](../helix-os/L11-governance-acceptance.md)、
外部提供物の成立条件は[HARNESS L11](../harness/L11-product-acceptance.md)へ分離した。いずれも未実行。

## 要求形成・人間反応の受入先

判断記録・反復管理の反例は[HELIX-OS L11](../helix-os/L11-governance-acceptance.md)、
工程の合意・影響限定・検証条件は[HARNESS L11](../harness/L11-product-acceptance.md)へ分離した。いずれも未実行。

## 監査・学習・成果の出所に関する受入先

AAFD4件・RCLS6件・PPS4件の反例は[HELIX-OS L11](../helix-os/L11-governance-acceptance.md)へ移管した。
文書の移管を候補採択や利用者受入の完了として扱わない。
