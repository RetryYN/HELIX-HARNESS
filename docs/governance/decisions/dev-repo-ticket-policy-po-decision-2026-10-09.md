---
title: "開発repositoryのチケット方針 PO decision record（2026-10-09）"
decision_record_id: HDEC-DEV-REPO-TICKET-POLICY-2026-10-09
decision_status: recorded
decider_role: PO
decided_at: 2026-10-09
recorded_at: 2026-10-09
source: 2026-10-09（Asia/Tokyo）のClaude作業session（lane `review_merge`）での、POへの質問への回答
authority_effect: effective_when_this_record_is_admitted_to_main
---

# 開発repositoryのチケット方針（2026-10-09）

## 記録の範囲

本書は、HELIXの開発repositoryの運用（Feature Ticket、Issueへの投影、Issueのclose）について、POが選んだチケット方針を記録する。運用への反映は[GitHub上流運用モデル](../github-upstream-operating-model.md)「IssueとFeature Ticket」と[Feature Ticketの索引](../feature-tickets/README.md)で行う。

製品の要求（HELIX-OSのticket・workflowに関する`HELIXOS-L2-017`、`HELIXOS-L2-102`、`HARNESS-L2-059`等）は変えない。製品にも同じ方針を入れるかは、L2の意味の変更として別に判断する。本書から、Concept・L1・L2の変更、新しい承認手続き・merge gate、Issue close、実装を生成しない。

## 経緯

Claudeは、運用モデルの改訂の材料として、POが示した開発repository `RetryYN/ProFine`（revision `c5389d5763c7ef37f5522e8ee1280e194f2181ae`）を読み取りで調べた。ProFineは2026-10-07に、チケットの書き戻しと依存によるgateの肥大を受けて、チケットの方針を改めていた（同repositoryの`docs/revisions/2026-10-07-ticket-independence-policy.md`）。書き戻しの事例は同repositoryの`docs/tickets/GOV-0001`（Issueの二重作成）と`GOV-0006`（PR番号の書き戻しでHEADが進む）にある。同じ型の失敗は、[失敗→機構→承認済み要求の対応表](../audits/failure-requirement-crosswalk-2026-10-09.md)の`T07`にも記録している。

Claudeは、この方針をHELIXでも採るかをPOに尋ねた。質問と選択肢、回答は次のとおりである（原文）。

> 質問：ProFineで10/07に決めた「チケットは作業種別とタスク内容だけ。書き換えない（state・PR番号・Issue番号を書き戻さない）、再発行する。依存関係を持たせず、それを前提にしたgateを作らない。正本は設計書」を、HELIXでも採る？
>
> 選択肢「開発repoの運用に採る (Recommended)」：HELIXの開発repoの運用モデル（Feature Ticket、Issue投影、Issueのclose）をこの方針に合わせて改める。製品（HELIX-OSのticket要求、HELIXOS-L2-017等）は変えない。製品にも入れるかは、L2の意味の変更として別に判断する
>
> 回答：「開発repoの運用に採る (Recommended)」

## 判断：開発repositoryのチケット方針

1. **ticketは作業種別と作業内容だけを持つ。** ticketは要求・設計の正本ではない。正本は設計書（Conceptから下流の各層の文書と、判断記録）に置き、ticketを破棄しても、設計書から作業を再構成できる状態を保つ。
2. **ticketは書き換えない。** 作業内容を変えるときは新しいticketを発行し、元のticketは残す。状態、PR番号、Issue番号、merge結果をticketへ書き戻さない。ticketとGitHubの対応は、ticketの外のappend-onlyの記録（projection receipt）に置く。
3. **ticketに依存関係を持たせず、それを前提にしたgateを作らない。** 作業の順序と前提は、設計書と判断記録の側で確かめる。ticketの依存や状態を、CI・review・merge・作業開始の条件にしない。ticketが一枚欠けても、CI・review・mergeは止まらない。
4. **IssueはticketのGitHub上の写しである。** Issueの状態やcloseから、ticketの状態、要求の意味、承認、完了を生成しない（`AGENTS.md`「現在の境界」）。

本書より前に発行したFeature Ticket（`docs/governance/feature-tickets/`の11件）は書き換えない。それらの状態・依存の記載は発行時の記録として残し、作業開始やmergeの条件として使わない。

## 旧HELIXとの対応

| 旧source | 保持する点 | 変える点 |
|---|---|---|
| `LEGACY-ASSET-3A15E5645D2D2A59DFF5`／`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md`（101行、190行）／SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b` | ticketはimmutable/revisionedであり、GitHubのviewを独立に編集できる正本にしない。ticketは要求・要件の正本を置き換えない（100行） | なし |
| 同上（212〜218行の`HXT-FR-007`依存graphと`HXT-FR-008` READY projection） | ― | 開発repositoryの運用では、ticketに依存関係もREADYの状態も持たせない。順序と前提は設計書と判断記録で確かめる。旧sourceは製品の実行ticket候補であり、製品の要求（HELIXOS-L2-017等）は本書では変えない |

## 本書から生成しないもの

Concept・L1・L2の変更、製品のticket要求の変更、新しい承認手続き・merge gate、既存ticketの書き換え、Issue close、実装、release、内部デプロイ。
