---
title: "Claude統制での作業割当とruntime連携に関するPO判断記録（2026-10-22）"
decision_record_id: HDEC-CONTROL-LANE-COORDINATION-2026-10-22
decision_status: recorded
decider_role: PO
decided_at: 2026-10-22
recorded_at: 2026-10-22
source: 2026-10-22のPO指示と、Issue #3510の作業分解コメント
authority_effect: operational_direction_only
---

# Claude統制での作業割当とruntime連携（2026-10-22）

## 記録の範囲

本記録は、ClaudeからCodexとDevinへ作業を割り当て、作成者と独立したreview・mergeを運転する当面の分担、およびruntimeを固定しない方針を記録する。対象は[Issue #3510 WI-1の作業分解](https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6322619661)であり、WI-2のworktree回収、scaffold script、binding、現在の`bind`へのcontrol機能追加は含まない。

記録の根拠は、POの直接発言・選択と、AIが運転案として提示した提案を区別する。差分300行は統制側の初期提案値であり、POの確定値ではない。本記録は要求の意味・採否、L3以下の承認、新しいmerge admission、runtime capabilityや権限の拡張、Issue完了を生成しない。

## POの発言と選択

2026-10-22、POは次のように述べた（[Issue #3510 comment](https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6322619661)に記録）。

> まずはClaude、Codex、アンチグラビティ、Devinの連携系をさきに見直して、ラストタッチ方式でワークツリーを削除する。放置1週間で自動化カットとかかな。そしてお前がコントロールとして作業をCodexとDevinに割り当ててレビュー＆マージする方式にする。Codexは掘りすぎるから巨大ファイルが出来上がって詰むわ。

同じ会話で、放置worktreeは「退避してから消す」、肥大化には「1依頼1論点・差分上限」とする選択が記録された。これはWI-2を含む作業分解の背景であり、本WI-1ではworktreeの削除・回収規則を定めない。

2026-10-21の先行PO指示は「もちろん、場合によってはcursorも入るし。」である（[Issue #3510 comment](https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6297204998)）。providerをClaude、Codex、Devin、Antigravityの固定一覧にせず、場面に応じて追加できる枠を保つ。

同Issue本文に記録された2026-10-21のPO発言は次のとおりである。

> 専用じゃなくて本当はコントロールレーンに置きたい。hookで起動できるからレビュー担当をしているだけ。

> 基本はどのプロバイダーが一番その時に合っているかでしかないから役割は入れ替わる前提にならないとおかしい。

これはcontrolの役割を考えるPO指示である。一方、Issue本文の`bind`へcontrolを追加する完了条件は作業案に含まれているが、本WI-1の依頼はその機能実装を含まない。現行`bind`のrole集合を変えず、運用上の担当として記録する。

## 判断と運転案

1. **当面の統制と作成**：Claudeは作業範囲・完了条件をIssueに明記してCodexまたはDevinへ割り当て、作成側でないPRの独立review、merge admissionの確認、明示merge、read-afterを担う。CodexはPR作成側を担う。Devinはproposal commitを返し、採用する場合はCodexが内容を検収・取り込んでPRを作成する。
2. **独立性**：割当をしたことだけでは割当側はPRのcontent producerにならない。Claudeが依頼した作業でも、自身が対象PRの内容を作成または編集した場合、そのPRを独立reviewしない。DevinのproposalをCodexが取り込んでPRを作った場合、Claudeが独立review・mergeする。
3. **runtimeの選択**：runtimeを固定しない。割当時点の作業適性（能力、停止後に通知で起きられるか、必要なGitHub操作能力、コスト）を見て入れ替える。Cursor等を閉じた一覧で排除しない。適性判断は割当材料であり、現行`bind`に未実装のcontrol laneを追加したり、Devin・Antigravity等の権限を広げたりしない。
4. **依頼の粒度**：一つの依頼は一つの論点とし、対象fileと完了条件を明記する。単一の巨大JSON nodeへの追記を始める前に分割設計を提示する。
5. **差分上限の提案**：統制側は1PRあたり変更行（追加と削除の合計）300行を初期上限として提案する。これをPO確定の規則とは扱わない。超過が見込まれたら、超過前に作成側が分割案を返し、作業の分割と上限を統制側が確認する。

従前のIssue本文の「決めること（案）」には、統制側が自分で割り付けたPRをreview・mergeしない案があった。2026-10-22のPO指示は統制側に独立reviewとmergeを割り当てているため、判定を「割当したか」ではなく「そのPRの内容を作成・編集したか」に置く。統制側がcontent producerなら独立review不可、割当だけで内容を作っていなければreview可能である。PR作成側が自分のPRをreviewしない既存規則は維持する。

## 旧HELIXとの対応と失敗からの起点

旧sourceは、`archive/legacy-generation-2026-09-14/root/CLAUDE.md:191-214`「GitHub 自走運用」と`216-236`「Hybrid 多ランタイム commit 協調」である（`LEGACY-ASSET-6EBDB617A8104A7756D0`）。また、2026-10-19の[4runtime PO判断](four-runtime-mailbox-po-decision-2026-10-19.md)と現行運用モデルの「GUIレーンの運転と通知」も照合した。

- **保持する点**：作成側と独立review・merge側を分けること、相手のcommitや未統合成果を失わないこと、runtime名を恒久的な役割 identity にしないこと。
- **変更する点**：Claudeを当面の統制担当として明示し、Issue上の範囲・完了条件付き割当、Devin proposalからCodexによる取込、依頼の論点・差分を小さく保つ運転案を記録する。旧世代の自走runtime、CLI、CI、hook、権限モデルは引き継がない。
- **変更の理由**：POの2026-10-22指示と、PR #2424・#2562で通知箱の逆向き依頼が届かず作業が止まったこと、#1609で作成側が独立review/merge経路より先にmergeしたことを踏まえる。PR #2564では274件のL3/L10草稿を一つのPRで扱った。#3510 commentは、9月17日の整理から約35日でworktreeが624件・532 GBに達した#2093の観測とともに、作業の過掘り・巨大ファイルによる停滞を今回の見直し理由に記録している。これらは運転上の変更理由であり、新しい製品要求や承認gateを生成しない。

旧sourceのruntime間調整と相手成果の保全は意味を引き継ぎ、固定された二runtimeの規則や旧runtimeの実行通路は再導入しない。2026-10-19判断のClaude/Codex同権限、Devinの作業側、Antigravityの試験中という記録はその判断範囲で保持する。今回のPO指示は当面の作業分担を上書きするが、Devin・Antigravityの権限拡張や試験終了を意味しない。

## 未決・対象外

- 300変更行の上限は統制側の提案であり、POの確定判断は記録されていない。
- Cursor等のproviderを実際に登録・利用する適性と、各runtimeの通知・GitHub操作能力は割当時に確認する。
- `bind`にcontrol laneを実装する判断、WI-2のworktree回収・scaffold実装、その他の権限変更は本記録の対象外である。
- 作業依頼やreviewの通知配送、PR classごとの既存merge admission、PR作成者が自己reviewしない規則は現行運用モデルに従う。本記録から新しいgateや承認回数を加えない。
