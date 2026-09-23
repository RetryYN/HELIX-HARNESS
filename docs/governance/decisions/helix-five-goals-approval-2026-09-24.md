---
title: "HELIX自体の5大目標 承認decision record"
decision_record_id: HDEC-HELIX-FIVE-GOALS-0.1
decision_status: approved
decider_role: PO
decided_at: 2026-09-24
recorded_at: 2026-09-24
source_repository_revision: ab218b0ac3ddca85a6ceccb83dcd2515848d1dbf
authority_effect: effective_when_this_record_is_admitted_to_main
---

# HELIX自体の5大目標の承認

## 人間判断と対象

POに、[5大目標本文](../../concept/helix-five-goals.md)のSHA-256
`cfade733b9023bcc3329916206a911794e13f2b4f4f1e198d6c57618049771ca`を示し、
HELIX全体の到達目標として承認するかを確認した。POは「この本文を承認する」と回答した。
この回答は本文のexact bytesへの承認であり、PR mergeやreview結果から推定した承認ではない。

| 対象 | 承認したSHA-256 | 結果 |
|---|---|---|
| `docs/concept/helix-five-goals.md` | `cfade733b9023bcc3329916206a911794e13f2b4f4f1e198d6c57618049771ca` | approve |

本文の5項目は、自走、自己知能型改善、全体simulation、非エンジニアの開発、Worker最適配置である。
本文の`draft_candidate`／`awaiting_human_approval`は承認前snapshotのmetadataであり、承認後の状態は本decisionを優先する。
本文bytesを変更してmetadataを書き換えない。

## 判断の範囲

この承認は、5大目標をHELIX全体の到達方向として固定する。親[Concept v4.1](../../concept/helix-concept-v4.1.md)と
4対象L1の承認済みrevisionは変更しない。5大目標の承認だけで、監査上`partial`の4領域を既存L1に暗黙包含させない。
製品別の追加責務、L1要求の本文・ID、L2／L11、旧要求の要否・successor、数値基準、設計、実装は別判断とする。
七大原則の独立authorityも本decisionの対象外である。

次の対象別要求候補は、[L1被覆監査](../audits/source-rebaseline/l1-goals-principles-coverage-audit.md)が示す
既存被覆と不足を比較し、Concept→対象別L1の順序で提示する。旧要求sourceの意味を落とさず、
人間が対象revision付きで採否するまで現行L1を変更しない。

## revision変更時の扱い

承認対象本文のbytesが変わった場合、この承認を新revisionへ自動継承しない。新しい差分と影響範囲を示して別判断を得る。
