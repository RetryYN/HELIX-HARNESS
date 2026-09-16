---
feature_ticket_id: FT-OS-REQGUARD-001
title: "HELIX-OS要求登録bot・監査crawler・admission CI"
product_target: HELIX-OS
primary_role: management_governance
state: proposed_upstream_waiting
priority_order: 10
created: 2026-09-17
authority_effect: work_projection_only
github_projection:
  issue: 1837
  url: https://github.com/RetryYN/HELIX-HARNESS/issues/1837
  projection_receipt_ref: docs/governance/audits/source-rebaseline/github-feature-ticket-projection-2026-09-15.md
  read_after_state: OPEN
parent_requirements:
  - HELIXOS-L2-001
  - HELIXOS-L2-002
  - HELIXOS-L2-005
  - HELIXOS-L2-007
  - HELIXOS-L2-013
acceptance_source: docs/helix-os/L11-acceptance/governance-acceptance.md
depends_on:
  - FT-OS-REQREG-001
  - FT-OS-GITHUBSYNC-001
---

# FT-OS-REQGUARD-001: HELIX-OS要求登録bot・監査crawler・admission CI

## PO指示

2026-09-17（Asia/Tokyo）、POは本作業会話で次を指示した。

> CI＋登録bot＋クローラー置いたらいいんじゃね？イシュー案件だな。

本ticketはこの指示を、要求採用や実装許可へ変換せず、上流で具体化する作業候補として保持する。

## 目的

要求候補を管理層へ登録するwriter、未登録・参照切れ・projection driftを探索するread-only crawler、要求PRの
merge admissionをfail-closeで検証する新世代CIを分離して整備する。GitHubを巡回して要求を推定する仕組みにはせず、
repo-owned上流、管理層仮登録record、projection receiptから状態を再構築できるようにする。

## 責務分離

### 登録bot

- `FT-OS-REQREG-001`で確定する入力契約に従い、Concept、企画、指示、手動候補、HARNESS要求エンジン出力を管理層へ登録する。
- append-only record、stable identity、source locator／digest、causal relation、actor、時点、対象productを保持する。
- 再送を冪等に扱い、訂正は旧recordを上書きせず新revisionで接続する。
- 要求の採否、分類、承認、L2 authority、実装許可を生成しない。

### 監査crawler

- repo-owned source、要求atom inventory、管理層register、Feature Ticket、projection receipt、GitHub read-afterをread-onlyで照合する。
- 未登録source、未計上atom、digest不一致、wrong product、stale／superseded参照、孤立relation、GitHub projection driftをfindingとして出す。
- GitHub Issue／PR／commentから要求本文、採否、承認、完了を逆生成しない。
- findingからregister、要求文書、Issueを自動修正せず、登録botまたは作成側へ原因とsourceを返す。

### requirements-admission CI

- HARNESSが所有する無損失coverage contractと、HELIX-OS管理層の仮登録receiptをread-only入力にする。
- 対象要求候補のsemantic digest、source atom集合digest、`coverage_result: no_loss`、未計上atom 0を検証する。
- 生存中`registered_proposal`、親Concept／Vision／企画／L1 revision、対象product、`unit`／`connection`／`composite`、L2↔L11対応を検証する。
- local ticketとGitHub projectionのsource revision／payload digest／read-after一致を検証する。
- 欠落、重複、unknown、conflict、stale、wrong product、receipt不一致ではfail-closeする。
- CI greenから要求採用、人間承認、実装完了、Issue close、merge指示を生成しない。

## 所有境界

- HELIX-HARNESSはsource atomの無損失分割・被覆、要求kind、L2↔L11、negative oracleのnormative contractを所有する。
- HELIX-OSは登録bot、crawler、CIの実行、権限分離、schedule、receipt、finding routing、観測・復旧を所有する。
- 登録botのwrite権限をcrawlerまたはCIへ渡さない。crawlerとCIは要求・register・GitHub projectionを修正しない。
- GitHub同期は`FT-OS-GITHUBSYNC-001`を経由し、本ticketが別の同期writerを作らない。

## 降下順序

1. 要求整理で管理層register schema、source atom namespace、要求kind、L2↔L11、無損失receiptを確定する。
2. `FT-OS-REQREG-001`の登録契約をfreezeし、登録botのL3／L10を作る。
3. crawlerの探索範囲、差分identity、再走査境界、finding schema、負荷上限をL3／L10で定義する。
4. requirements-admission CIを、確定済みregisterとcrawler receiptから導出する。
5. shadow実行でfalse positive／false negativeを測定し、旧CIとdual-greenにせず新世代gateとして有効化する。
6. GitHub required checkへの接続は、HELIX-OSの別`operation_change`とし、review対応側のmerge責務を置き換えない。

## 停止条件

- 親Concept／L1／L2、管理層register schema、source atom namespace、無損失coverage contractのいずれかが未確定。
- 登録bot、crawler、CIの権限が分離されていない。
- CIが旧workflow、旧test、旧runtime、旧DBをoracleまたは実装基盤として使う。
- GitHub状態から要求意味、採否、承認、完了を逆生成する。
- crawlerまたはCIが要求文書、register、Issue／PRを直接修正する。

現在はFeature TicketとGitHub Issue projectionだけを作成する。要求整理、L3以降、bot、crawler、CI、runtime、
required check設定は開始しない。
