---
title: "通知箱をClaude・Codex・Devin・Antigravityの4者へ広げる PO decision record（2026-10-19）"
decision_record_id: HDEC-FOUR-RUNTIME-MAILBOX-2026-10-19
decision_status: recorded
decider_role: PO
decided_at: 2026-10-19
recorded_at: 2026-10-19
source: 2026-10-19（Asia/Tokyo）のClaude作業session（lane `review_merge`）でのPOの発言と選択
authority_effect: effective_when_this_record_is_admitted_to_main
---

# 通知箱を4者へ広げる（2026-10-19）

## 記録の範囲

本書は、GUIレーンの通知箱（[SCF-B-0003の仮組み](../../../scaffold/review-handoff/README.md)）へDevinとAntigravityを加えるときの、runtimeごとの役割と、この変更のPRの作成・review担当についてのPOの判断を記録する。

本書から、新しい承認手続き・merge gate、要求の意味、L3以下の承認、release・tag・cutover・配布の許可、Issue closeを生成しない。DevinとAntigravityの採用を製品の要求として決めたものでもない。

## POの発言

2026-10-19、POは次のように述べた（原文）。

> アンチグラビティ、デビン、Codex、Claudeの連携確立の仕組みを設計から実装までPR化していれよう。これ入れるだけで、Codexが長々とやっているリファクタリングも早くなる。

> メールボックス形式で

Claudeが「DevinとAntigravityにはどの役割を持たせるか」を選択肢で尋ねた問いに対し、POは次のように答えた（原文）。

> Devinは完全Worker型（作業のみ）。Claudeとcodexは同じ権限、アンチグラビティは要テスト。フロントはきれいに作ることだけわかっている。

「この連携のPRは誰が作り、誰が独立reviewするか」の問いに対し、POは「Claudeが作りCodexがreview (Recommended)」を選んだ。

## 判断

1. **方式**：連携は既存の通知箱（メールボックス）を広げて行う。相手のproviderを起動する方式や非公開IPCは使わない。
2. **ClaudeとCodex**：同じ権限を持つ。PRの作成、独立review、明示merge、作業依頼の送信を、どちらも行える。自分が作成したPRを自分でreview・mergeしない点は、既存の[作成側とレビュー対応側の責務](../github-upstream-operating-model.md#作成側とレビュー対応側の責務)のとおりである。
3. **Devin**：作業だけを行うWorkerとする。
4. **Antigravity**：試験中とし、試験の間はDevinと同じく作業だけを行う。権限を広げるかは、試験の結果を見てPOが決める。「フロントはきれいに作る」は、作業を割り当てるときの材料として記録する。割当の規則にはしない。
5. **この変更のPR**：Claudeが作成し、Codexが独立reviewしてmergeする。

## 「作業だけ」の読み方

POの「完全Worker型（作業のみ）」を、旧HELIXの要求HIL-BR-32の区分に当てて読む。HIL-BR-32の出典は`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:84`で、SHA-256は`db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`である。原文は「Claude/Codex以外の定額worker runtime（Kimi/Grok等）をprecedenceを曲げずproposal-only workerとして接続し、実行を隔離worktree/sandbox内に限定してrepository本体、`.helix/` state、harness DB、credentialへ到達させない。秘密・機密を含む作業の第三者runtime委譲を禁止する。」である。現行では[HELIXSECURITY-L2-029／031](../../helix-security/L2-requirements/security-requirements.md)の未採択候補が、この区分を保持している。

- **作業側ができること**：作業依頼を受け取り、自分用の作業worktreeでcommitを作り、そのcommitとbranch名を作業結果として依頼側へ返す。
- **作業側がしないこと**：push、PRの作成・Ready化・review・merge、作業依頼の送信、Issueの操作。
- **依頼側の扱い**：作業結果を読んで確かめ、取り込む場合は自分が作成側としてPRを作る。そのPRは、ClaudeとCodexのうち作成側でない方が独立reviewする。作業側のcommitを取り込んだことは、PR本文に記録する。
- **依頼の範囲**：秘密・機密を含む作業を依頼しない。repository `RetryYN/HELIX-HARNESS`はpublicであり、作業側が読むのは公開されているコードと文書である。

この読み方は、HIL-BR-32の「proposal-only」「precedenceを曲げない」「秘密・機密の委譲禁止」を保持する。変更する点は二つある。第一に、隔離を、作業側専用のworktreeと運用の決まりで行う。旧要求のsandbox強制は、HELIXSECURITY-L2-029／031が未採択であり、通知箱の機能ではないため、機械的には強制していない。第二に、Gemini系の現行製品であるAntigravityと、Devinを対象に加える。変更の理由は、POが両runtimeを作業者として使うと決めたためである。新しい承認手続きは加えていない。

## 未決として残すもの

- Antigravityの試験の合否と、その後の権限。
- DevinとAntigravityのアカウントの訓練利用opt-outの状態。HELIXSECURITY-L2-029の候補は、opt-outの完了をruntime採用の前提として保持している。この候補は未採択であり、本書ではopt-outの状態を確かめていない。
- 作業側の実行を、sandboxで機械的に隔離すること。
