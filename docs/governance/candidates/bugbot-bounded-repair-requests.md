---
title: "HELIX-bugbot 限定修復の利用目的"
status: draft_candidate
authority_status: approved_pending_canonical_promotion
approval_record_id: L3-PO-1642-001
approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/issues/1642#issuecomment-5575191622"
version: "1.0"
candidate_layer: L1
owner_issue: 1642
plan_id: PLAN-L3-1642-bugbot-bounded-repair
---

# 限定修復の要求候補

BBR-BR01: 開発者・workerが定型逸脱の修正往復を減らし、意味判断が必要な仕事へ集中できること。
登録済みの検証可能な修復だけを機械へ渡し、それ以外は既存worker・Recoveryへ返す。

BBR-BR02: 自動化しても権限・所有権・予算・独立検収を越えず、修復の失敗や反復が
他レーンの変更・調査・Help・継続運転を壊さないこと。

要件候補は[BBR-R01..05](bugbot-bounded-repair-requirements.md)、
受入候補は[BBR-AC01..07](bugbot-bounded-repair-acceptance.md)へ接続する。
BR01→R01/R02/R04→AC01/02/04/07、BR02→R03/R04/R05→AC03/04/05/06で追跡する。

既存GH-FR-011の権限内の機械化は再利用する。#1595の診断・修復候補は実行権ではない。
本候補のL1/L3/L10は`L3-PO-1642-001`で承認済み。正本化・該当IR admission後に実装・限定実証へ進む。
新しい自動適用権限は修復ごとの契約・独立検証・実consumer検証が成立した範囲だけ有効化する。
要求承認のみで包括的書込み権限を付与せず、未定義の意味・権限拡張だけ正規改訂へ返す。
別Policy、DB、scheduler、万能コード生成器は作らず、Aとは別完了で追跡する。
