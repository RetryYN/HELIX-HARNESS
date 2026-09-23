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

POに、2026-09-24（Asia/Tokyo）のCodex作業sessionの質問票で、[5大目標本文](https://github.com/RetryYN/HELIX-HARNESS/blob/11a22679dc2bfce57d3294759531282445625001/docs/concept/helix-five-goals.md)へのリンクと
SHA-256の短縮表示`cfade733…5de5`を示し、
HELIX全体の到達目標として承認するかを確認した。質問では「これは4製品L1の変更・個別要求・実装を承認するものではありません」と明示した。
POは「この本文を承認する」と回答した。
表示した末尾`5de5`は本文の実際のSHA-256末尾`71ca`と一致しない誤表示だった。
質問時のmain `ab218b0ac3ddca85a6ceccb83dcd2515848d1dbf`にあるリンク先本文を読み、完全なSHA-256を下表へ固定した。
同本文はcommit `4f620e32d2f60f2ce80113db1ba4e01d4facd565`以降、質問時と回答後でbytesが不変である。
review_merge laneもPO本人へ同じ承認判断を直接確認し、「承認した・mergeしてよい」との回答を得た。
対象bytesへの束縛はリンク先の質問時revisionとこの直接確認によるものであり、誤った短縮表示やPR mergeから推定しない。

| 対象 | 承認したSHA-256 | 結果 |
|---|---|---|
| `docs/concept/helix-five-goals.md` | `cfade733b9023bcc3329916206a911794e13f2b4f4f1e198d6c57618049771ca` | approve |

本文の5項目は、自走、自己知能型改善、全体simulation、非エンジニアの開発、Worker最適配置である。
本文の`draft_candidate`／`awaiting_human_approval`は承認前snapshotのmetadataであり、承認後の状態は本decisionを優先する。
本文bytesを変更してmetadataを書き換えない。

## 判断の範囲

この承認は、5大目標をHELIX全体の到達方向として固定する。親[Concept v4.1](https://github.com/RetryYN/HELIX-HARNESS/blob/11a22679dc2bfce57d3294759531282445625001/docs/concept/helix-concept-v4.1.md)と
4対象L1の承認済みrevisionは変更しない。5大目標の承認だけで、監査上`partial`の4領域を既存L1に暗黙包含させない。
製品別の追加責務、L1要求の本文・ID、L2／L11、旧要求の要否・successor、数値基準、設計、実装は別判断とする。
七大原則の独立authorityも本decisionの対象外である。

次に、承認対象本文が定めるとおり、5大目標の差分を取り込んだConcept revisionを別の人間判断へ戻す。
既存Concept v4.1の接続記述だけで、その改訂と責務owner判断が完了したとはみなさない。
そのConcept revisionの承認後に、[L1被覆監査](../audits/source-rebaseline/l1-goals-principles-coverage-audit.md)が示す
既存被覆と不足を比較し、対象別L1要求候補へ分解する。旧要求sourceの意味を落とさず、
人間が対象revision付きで採否するまで現行L1を変更しない。

## revision変更時の扱い

承認対象本文のbytesが変わった場合、この承認を新revisionへ自動継承しない。新しい差分と影響範囲を示して別判断を得る。
