# Repository foundation merge admission packet

prepared_at: 2026-09-16
status: pending_exact_pair_review_and_merge
admission_id: RFMA-REPOSITORY-FOUNDATION-0.1
authority_effect: repository_structure_only

## 目的

PR #1797を、HELIX新世代を上流から組み直すrepository基盤としてmergeできるかを、再現可能な証拠だけで判定する。
これはConcept、目標、原則、要求、責務配置、設計、実装の採否判断ではない。repository整理に別の人間承認を設けず、
本packetの機械照合と外部意味reviewをmerge admissionとする。

## admission対象

1. 旧世代4,020 fileを元pathとSHA-256付きの非実行archiveへ隔離し、現行pathから旧workflow、runtime、hook、test、
   AI instructionを起動できない構成。
2. 現行文書をConcept、HELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OS、governanceへ物理分離した構成。
3. GitHubを要求正本にせず、local上流revisionからIssue、PR、commentへ一方向投影し、remoteをread-afterする運用。
4. 旧要求の原文、identity、元status、revision、digestを保持し、要求PRごとに未計上atom 0と管理層の仮登録を要求する
   無損失条件。
5. Conceptから対象別L1、L2／L11、L3／L10、下流pairへ降ろす順序と、未承認・stale・conflict時の停止条件。
6. AIが[新世代作業入口](../../new-generation-start-here.md)から対象、authority状態、読込順、許可作業、停止作業を確認できる
   最小context。

このadmissionで上記構造を採用しても、各containerの内容を承認したことにはならない。旧要求はpendingのまま保持し、
意味変更、統合、縮退、retire、successor割当は後続の要求単位PRへ分離する。

## merge条件

| 条件 | 必要な状態 |
|---|---|
| 静的整合 | [Repository foundation readiness](../../repository-foundation-readiness.md)の条件1〜4がcurrent content HEADで成立 |
| 外部意味review | 許可されたGitHub Claude通路でexact base／content HEAD pairをreviewし、未解消Blocker／Major／Minorが0 |
| review配送 | [PR投影packet](../../github-upstream-pr-packet.md)に従うdelivery receiptがrequest本文、comment ID、base／content full SHA、payload digestと一致 |
| pre-merge read-after | PR base／HEAD、main HEAD、merge可能性、merge方式、branch protection、ruleset、required platform gateをGitHub APIから再取得 |
| 履歴保持 | merge commitを明示し、squash／rebaseを使わず、merge後の二親とPR全履歴のmain祖先性を確認 |

review対象はGitHub APIから取得した`target_base_head`と`target_content_head`のpairで固定する。baseまたはcontentが変われば
以前のreviewは失効し、新しいpairでreviewし直す。PR本文、Issue状態、CI結果だけでは対象revisionを確定しない。

## このadmissionで成立しないもの

- Concept v4.1、HELIXの5大目標、エージェント七大原則の承認。
- HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSのL1、L2／L11、責務詳細の承認。
- 旧要求の追加、削除、統合、縮退、意味変更、successor割当、対象productへの配置。
- 旧資産のreuse、replace、retire、物理削除、旧実装の再activation。
- L3以降の設計・実装、要求engine、管理登録runtime、GitHub同期adapter、新世代CIの開始。
- release、deployment、外部公開、配布repositoryの切替。

既存CodeQL、旧CI、旧test、旧runtimeのgreenはmerge条件に含めない。review commentの存在だけでも合格にせず、対象pair、
delivery receipt、0 findingをread-afterする。

## merge方式

#1797は途中commit SHAをIssue、projection receipt、監査記録のsource revisionとして保持しているため、merge APIまたは
`gh pr merge --merge`でmerge commitを明示する。squash／rebaseへfallbackしない。実行直前にmain HEADがreview済み
`target_base_head`、PR HEADがreview済み`target_content_head`と一致することを再確認する。不一致なら停止し、新しいpairをreviewする。

API応答のmerge commit full SHAを直ちにread-afterし、次を確認する。

1. merge commitが二親を持つ。
2. 第1親が`target_base_head`である。
3. 第2親が`target_content_head`である。
4. PRの途中commitを含む全履歴がmainの祖先である。

一つでも不成立なら統合完了を宣言しない。revert、force-push、履歴改変で隠さず、失敗事実、期待した親、実測したmerge SHAと
親をlocal監査文書のcorrective PRへ記録し、専用GitHub Issueへ投影して人間判断を求める。

## merge後の順序

旧要求はすべてpendingのまま残す。別PRの5大目標、七大原則、Concept revision、対象別L1、個別要求の順に上流から降ろす。
各`requirement` PRは一要求identityを基本単位とし、原atomを「候補へ保持」「別の生存中仮登録へ保留」
「対象revision付き人間decisionで変更・retire」の三集合へ完全分割して、未計上0を示すまでmerge候補にしない。
