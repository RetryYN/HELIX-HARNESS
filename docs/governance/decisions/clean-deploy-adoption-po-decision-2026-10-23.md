---
title: "HARNESS-L2-091 クリーンデプロイ提供物のPO判断"
decision_record_id: HDEC-HARNESS-L2-091-CLEAN-DEPLOY-ADOPTION-2026-10-23
decision_status: recorded
decider_role: PO
decided_at: 2026-10-23
recorded_at: 2026-10-23
source_repository_revision: 86d90e986cd645e452b7920491e899e0beadc329
authority_effect: effective_when_this_record_is_admitted_to_main
---

# HARNESS-L2-091 クリーンデプロイ提供物のPO判断

## PO回答の出所

PO回答の転記元は[Issue #3563 comment 6347955060](https://github.com/RetryYN/HELIX-HARNESS/issues/3563#issuecomment-6347955060)。取得したcomment bodyはUTF-8で1,783 bytes、SHA-256は`0195e3526954f512ea17ff8fefb08cbe06aae898295e55edd25953ce89fb9303`（終端LFを追加しない）。

POは、統制が提示した選択肢でHARNESS-L2-091について「採択」を選んだ。Issue commentの存在から採択を生成せず、本記録と対象revisionの対応を採否根拠とする。

## 採択対象revision

| 項目 | 固定値 |
|---|---|
| 提示したPR | #3595 |
| 採択対象commit | `86d90e986cd645e452b7920491e899e0beadc329` |
| 採択対象L2 section SHA-256 | `0bc1a34ff5a8a4b659b7d1171c4673b5ccca3813ded2614816d70075a654a7c0` |
| 採択対象L11 section SHA-256 | `b34ca0ce5399c934ffa508fd583cd9e38c533d840ee8a62c7081df57be731286` |
| 採択対象のregister revision | `MPR-RC-HARNESS-L2-091-002` |

この対象では、内部固有情報の切出し、元の管理責務での保持、意味・所有・利用条件による区別の3点が決まる。package条件、clean／既存／monorepo等の区分、再現・非破壊・更新復旧の具体条件はOS030側または既存条件へ残る。OS030の保留は解除しない。

## 状態更新後revisionとの差分

採択対象revisionから、見出しと本文の状態表示を採択済みへ直し、判断記録の参照と登録IDだけを更新した。要求の意味、対L11の成功・反例、source集合、coverage scopeは変えない。

| 状態更新後の値 | digest |
|---|---|
| L2 section SHA-256 | `7089d14bf1aca2bb49be1243bc8d5a1207ba53bc17f2ff3fdb5ef6257460ac08` |
| L11 section SHA-256 | `68ca8252ba6a3a93577c39418b9ddd2a01d6a4d6a315366cd0ce08468984a6e6` |
| register revision | `MPR-RC-HARNESS-L2-091-004` |

`management_state: registered_proposal`と`authority_effect: none`は仮登録の性質であり、採否statusではない。本判断は要求の採否だけを対象とし、L3承認、実装・実行・配布、受入、release、tag、cutover、内部デプロイ、Issue closeを生成しない。
