# HELIX新世代 Concept入口

## 現在の方針

HELIXは一つの製品ではなく、複数の製品と統制機構を接続する全体構想である。

| 対象 | 役割 |
|---|---|
| HELIX-HARNESS | 外部へ提供する製品。V-model、層、pair、要求形成、設計、検証、差戻し、完了条件を持つ |
| HELIX-OS | 内部の管理・統制・自動走行・継続改善機構。HARNESS自身を含むHELIXプロジェクト群を管理し、HARNESS改善を中核責務として実行する |
| HELIX-Web | HARNESS Version 1完成後に提供するConnector型Web製品。ダッシュボードで開発進行・成果・証拠を利用者へ示す |
| HELIX-Web-OS | HELIX-OS外でWeb service runtimeを運転する。許可された観測をHELIX-OSへ返し、改善loopで接続する |

[Concept本文](helix-concept-v4.1.md)と[製品責務境界](product-boundary.md)が、この意味を詳細化し、5大目標と七大原則を
製品責務、authority、構造原則、上流順序へ接続する。
[HELIX自体の5大目標候補](helix-five-goals.md)はHELIX全体が実現する価値を示し、個別要求と実装方式は固定しない。
[HELIXエージェントの七大原則候補](helix-principles.md)は、その価値へ進むエージェントの共通行動基準を示す。
両候補ともConceptに従属する。Concept v4.1と4対象L1の承認は
[2026-09-17 decision record](../governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md)に、
各対象fileのSHA-256を分けて記録する。PRのmergeだけではauthorityにならない。
Concept／製品責務境界→5大目標→七大原則→対象別L1の順に読む。

## 既に示された方向

1. GitHubは要求意味の正本ではなく、共有・作業・review・証拠のprojectionである。
2. 旧世代は元構造を保った非実行archiveへ隔離し、新世代のbaseline、oracle、fallbackにしない。
3. 新世代はConceptから対象別L1、L2／L11、L3／L10、下流pairへ順に降ろす。
4. 旧CIを使わず、承認済み上流から新世代CIを設計する。
5. AI向け文書も承認済み上流から生成し、HARNESS工程、OS実行context、個別製品要求を混在させない。
6. HARNESS Version 1は複数の異なる実プロダクト開発とHELIX自身への適用で検証する。
7. HELIX-Webの展開はHARNESS Version 1完成を前提とする。
8. repository整理と運用上流はfoundation PRで確立し、個別要求は一要求identityずつ別PRで詰める。

## 承認後も成立していないもの

- 対象別L2要求・prototype／非UI条件の個別採否と合意。
- L3以降、新世代CI、AI manifest／生成器、runtime、release、deployment。
- archive sourceの意味移管完了と物理削除。

文書に余計な意味や欠落がなければ、人間の判断は「この方向で進める」で足りる。修正する場合は、上表または8項目の
どこが違うかだけを示す。内部では[判断packet](../governance/audits/source-rebaseline/concept-v4.1-human-decision-packet.md)が
対象revisionとSHA-256を保持する。
