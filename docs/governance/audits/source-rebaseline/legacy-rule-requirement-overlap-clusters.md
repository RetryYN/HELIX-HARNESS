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
| partial_overlap | 40 |
| responsibility_split | 17 |

- 既存のどこにも関係が無い（`new_requirement_candidate`）: 3本 — `RUL-FRM-07`、`RUL-DEV-01`、`RUL-DEV-02`
- HARNESSの規範とOSの運転が混在（`responsibility_split`）: 17本 — `RUL-REL-01`、`RUL-COR-01`、`RUL-COR-02`、`RUL-COR-04`、`RUL-TKT-01`、`RUL-TKT-03`、`RUL-OSM-01`、`RUL-OSM-07`、`RUL-OSA-01`、`RUL-OSA-02`、`RUL-OSA-03`、`RUL-OSA-04`、`RUL-OSA-05`、`RUL-OSA-06`、`RUL-COR-07`、`RUL-OSA-08`、`RUL-OPS-01`。採否時にHARNESS側とOS側へ分ける候補。
- 既存要求と同一の意味（`exact_semantic_duplicate`）: 主relationでは0本、内部relationを含めて1本（`RUL-OSA-03`）。同一判定に要る10項目（actor・目的・入力・出力・正常系・failure・回復・制約・受入・適用範囲）を全て確かめたものではなく、確かめていないものは`partial_overlap`へ下げた。旧要求側のidentityを消さず、successor位置を記録して人間判断へ送る。

## 使い方

- システム群ごとのL2採否（#1852〜#1861）で、対応するclusterの`relations.existing_l2`を接続先候補、`legacy_requirements`を同一・包含の確認対象として使う。
- `responsibility_split`の要求は、HARNESS規範とOS運転へ分割する候補として人間判断へ送る。分割の実施は判断後の要求PRで行う。
- `new_requirement_candidate`の3本は、既存L2への追加候補として個別の要求PRで扱う。

## 確かめていないこと

- relationの正しさは1 model系統の判定であり、独立reviewは本PRのreviewに限る。人間判断はまだ無い。
- 旧要求との関係は分類台帳（system・層・product）に基づく候補であり、旧要求本文との逐語比較はしていない。参照IDは分類台帳のsource-qualified identityへ統一した（台帳に無い1件は`unresolved`）。
- `common_atoms`、`distinct_atoms_by_source`、`acceptance_differences`、`consumer_differences`、`unaccounted_atom_refs`は本書では未評価であり、台帳の`assessment_status`に`unassessed`と記す。空配列は「差分なし」を意味しない。programの完了条件はまだ満たしていない。

## 停止条件

- 本書とcluster台帳から、要求の削除・統合・採否・承認を生成しない。
- 主relationが`exact_semantic_duplicate`でも、原identityを消さない。

## 現在の本文比較：RUL-FRM-01（#1814、2026-10-10）

基準main `2a4882aea5e531fcd5d585b40dc4472537dafd57`。cluster台帳の`OVC-RUL-RUL-FRM-01.bounded_requirement_comparison`へ、原文span/hash、10比較軸、共通/固有条件、受入/consumer差、未比較集合を追加した。元のrelationと過去の比較revision、未評価fieldは歴史として保存する。

RUL-FRM-01の候補本文（工程順序とV-pairを閉じる）と、現行HARNESS001/003/004、NCI001/004、旧FR48/49・HBRP3・FRL103を要求粒度で照合した。双方向trace/片側欠落拒否と、未合意・未検証で進行させない方向は共通する。一方、001は現行層とL2.5区別、003は工程状態と段階証明/Backflow、004は変更影響、旧FR48/49は個別edge/oracle失敗、HBRP3はheld-out・機械/AI境界、FRL103は旧4artifact/PLAN/reportの条件を持つ。目的・入力・出力・回復・範囲が一致しないため完全重複としない。

元cluster noteの「上流未確定での下流進行禁止はL2表に明文なし」は現在の状態ではない。L11-003は未合意・未検証の進行拒否を明示する。この一般禁止を重ねる新候補は作らず、未比較の固有条件は残す。

| 比較範囲 | 結果 | 残るもの |
|---|---|---|
| 候補本文と上記要求の10軸 | 共通/固有条件を記録、partial_overlap維持 | formal successor/統合/retireは未判定 |
| 旧例3件 | 原文を読み、unique FR/placeholder/scenario、注釈regex、self-pairの差を記録 | 個別意味・consumerへの採否/同値証明 |
| underlying rule母集団 | 主294・副224のIDとinventory hashを全件保存 | 全518の個別比較、primary92sourceのconsumer閉包 |
| 全57cluster | 1clusterの候補本文比較を追加 | 他56と、このclusterのraw atom全比較 |

元の`assessment_status=unassessed`は全raw atom・consumer比較が未了であることを引き続き表す。追加した限定比較はその完了を代替しない。空配列を差分なしへ変換せず、未比較を#1814/親#1813で追跡する。rule所属は旧機械対応づけの候補であり確定ownerではない。要求意味/採否/承認、全条件被覆、holding解除、L3再開、#1814 closeを生成しない。旧実行系は全て非実行。
