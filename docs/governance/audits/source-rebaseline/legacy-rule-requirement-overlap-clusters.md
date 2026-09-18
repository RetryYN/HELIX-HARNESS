---
title: "旧ルール群由来の要求候補57本と既存要求の重複候補cluster（RDP-002）"
status: draft
program_id: RDP-002
authority_effect: none
created: 2026-09-18
---

# 旧ルール群由来の要求候補57本と既存要求の重複候補cluster（RDP-002）

## これは何か

[旧ルール群から導いた要求候補](../../candidates/legacy-rule-derived-requirements.md)の57本（`RUL-*`）について、既存の対象別L2（HARNESS-L2-*、HELIXOS-L2-*）、既存の要求候補、旧要求（IR 153件・confirmed identity 175件）との関係を、[要求間の責務・機能重複review program](../../requirement-overlap-review-program.md)のrelation語彙で付けた。1要求1 clusterで、機械記録は[cluster台帳](legacy-rule-requirement-overlap-clusters.jsonl)にある。
関係付けはClaude Opusが行い、比較したrevisionはcluster台帳の`compared_revisions`にある。本書は重複候補の発見であり、要求の削除・統合・採否ではない。全clusterの`human_decision_ref`はnullである。

## 集計

| 主relation | 件数 |
|---|---:|
| partial_overlap | 35 |
| responsibility_split | 17 |
| exact_semantic_duplicate | 3 |
| no_material_overlap | 2 |

- 既存のどこにも関係が無い（`new_requirement_candidate`）: 5本 — `RUL-FRM-07`、`RUL-DEV-01`、`RUL-DEV-02`、`RUL-OSM-09`、`RUL-OPS-02`
- HARNESSの規範とOSの運転が混在（`responsibility_split`）: 17本 — `RUL-REL-01`、`RUL-COR-01`、`RUL-COR-02`、`RUL-COR-04`、`RUL-TKT-01`、`RUL-TKT-03`、`RUL-OSM-01`、`RUL-OSM-07`、`RUL-OSA-01`、`RUL-OSA-02`、`RUL-OSA-03`、`RUL-OSA-04`、`RUL-OSA-05`、`RUL-OSA-06`、`RUL-COR-07`、`RUL-OSA-08`、`RUL-OPS-01`。採否時にHARNESS側とOS側へ分ける候補。
- 既存要求と同一の意味（`exact_semantic_duplicate`）を含む: 4本 — `RUL-COR-05`→HIL-TR-06、`RUL-OSM-02`→HIL-FR-12、`RUL-OSP-02`→HIL-FR-63、`RUL-OSA-03`→HIL-BR-17／HIL-FR-30。旧要求側のidentityを消さず、successor位置を記録して人間判断へ送る。

## 使い方

- システム群ごとのL2採否（#1852〜#1861）で、対応するclusterの`relations.existing_l2`を接続先候補、`legacy_requirements`を同一・包含の確認対象として使う。
- `responsibility_split`の要求は、L2本文へ入れる前にHARNESS規範とOS運転へ分割した2本の候補にする。
- `new_requirement_candidate`の5本は、既存L2への追加候補として個別の要求PRで扱う。

## 確かめていないこと

- relationの正しさは1 model系統の判定であり、独立reviewは本PRのreviewに限る。人間判断はまだ無い。
- 旧要求との関係は分類台帳（system・層・product）に基づく候補であり、旧要求本文との逐語比較はしていない。

## 停止条件

- 本書とcluster台帳から、要求の削除・統合・採否・承認を生成しない。
- 主relationが`exact_semantic_duplicate`でも、原identityを消さない。
