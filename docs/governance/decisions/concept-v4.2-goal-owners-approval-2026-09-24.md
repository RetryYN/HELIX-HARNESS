---
title: "Concept v4.2 製品責務 承認decision record"
decision_record_id: HDEC-CONCEPT-V4.2-GOAL-OWNERS-2026-09-24
decision_status: approved
decider_role: PO
decided_at: 2026-09-24
recorded_at: 2026-09-24
source_repository_revision: 03324caefac54d3ce5df6c06d1e61d6f92640041
authority_effect: effective_when_this_record_is_admitted_to_main
---

# Concept v4.2の承認

## 人間判断と対象

POは2026-09-24（Asia/Tokyo）、[PR #2118](https://github.com/RetryYN/HELIX-HARNESS/pull/2118)の
Concept v4.2本文に対し、完全なSHA-256
`b395a54c42782d93651f2a5660736b0330f013ccfd10af925c61c53ec355eebf`を示した質問へ
「このConcept本文を承認する」と回答した。質問は4目標のHARNESS・OSの責務、
Web／Web-OS固有事項を各L1判断へ残すこと、L1要求と実装は承認対象外であることを明示した。
対象bytesは質問時のPR HEAD `03324caefac54d3ce5df6c06d1e61d6f92640041`で固定する。

| 対象 | 承認したSHA-256 | 結果 |
|---|---|---|
| `docs/concept/helix-concept-v4.2.md` | `b395a54c42782d93651f2a5660736b0330f013ccfd10af925c61c53ec355eebf` | approve |

このrecordがmainへ統合された時点で、Concept v4.2を現行Conceptとし、
[承認済みv4.1](concept-v4.1-and-four-l1-approval-2026-09-17.md)の歴史的revisionを保持する。
v4.2本文の`draft_candidate`／`awaiting_human_approval`は承認前snapshotのmetadataであり、
統合後のauthority状態は本decision recordを優先する。対象本文bytesは変更しない。

## 判断の範囲

自走、全体simulation、非エンジニア利用、Worker最適配置について、
HARNESSの開発・検証契約、HELIX-OSの運転、個別製品・Web-OSの境界をConcept上の責務として承認する。
学習・改善の第2目標およびv4.1の他の境界は維持する。

この承認は、4対象L1の改訂、個別L1／L2／L11要求、旧要求のsuccessor・採否、
技術選定、実装、CI、release、deploymentを承認しない。
既存L1の被覆監査で`partial`とされた4領域を、Concept承認だけで`covered`に変更しない。
対象別L1候補を差分と旧要求sourceへ対応づけ、各対象revisionについて別に人間判断を受ける。

## revision変更時の扱い

承認対象本文のbytesが変わった場合、この承認を新revisionへ自動継承しない。
差分と影響範囲を示して別判断を得る。
