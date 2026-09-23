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

このrecordがmainへ統合された時点で、Concept v4.2のexact本文承認を有効にする。
現行Conceptは[承認済みv4.1](concept-v4.1-and-four-l1-approval-2026-09-17.md)を維持し、
下記の昇格条件5を満たす別の適用記録までv4.2を現行入口へ切り替えない。
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

## 昇格条件と下流への影響

| Concept v4.2の昇格条件 | 現在の状態 |
|---|---|
| 1. exact revisionの人間承認 | 上記のPO回答と対象SHAで成立 |
| 2. 4対象L1の親revision付替え影響 | 既存4対象L1はv4.1を親とする承認済み本文のまま有効。自走・全体simulation・非エンジニア利用・Worker最適配置の不足をL1で具体化し、v4.2を親とする新revisionへの付替えと本文採否は後続判断。現行L1を暗黙に書き換えない |
| 3. L2／L11 draftの下流影響 | 現在のdraftは既存L1とv4.1系列を参照する候補のまま保持。L1改訂後に親revisionと対象要求への影響を確認するまで正式適用しない |
| 4. supersede・互換・保存・rollback | v4.1本文を現行のまま保持し、将来のv4.2適用後も歴史的承認revisionとして保存する。v4.2の主要差分は5大目標のうち4領域の責務明確化で、9原則・既存4製品境界・他の意味を維持するため、既存L1の承認を失効させない。適用後に責務差分を撤回または変更する人間判断が出た場合は、v4.1を再び現行Conceptに指定するdecisionを記録し、入口と台帳を戻す。L1改訂後なら影響するL1以降も別途判断する |
| 5. canonicalization・main read-after | 未実施。L1影響と参照digestの更新を揃えた別の適用差分をreview_merge laneで確認し、main統合後に本文SHA、decision record、入口、台帳、依存Bindingをread-afterする。本PRのmergeだけでv4.2を現行Conceptへ昇格させない |

承認済みv4.2と現行v4.1を区別し、既存L1を維持して対象別の改訂候補を作る。

## revision変更時の扱い

承認対象本文のbytesが変わった場合、この承認を新revisionへ自動継承しない。
差分と影響範囲を示して別判断を得る。
