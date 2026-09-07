---
canonical_vmodel: L1-L12
canonical_layer: L1
canonical_pair: L12
title: "HELIX-bugbot 限定修復の利用目的"
layer: L1
kind: redesign
status: draft
authority_status: canonical_source
approval_record_id: L3-PO-1642-001
approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/issues/1642#issuecomment-5575191622"
approved_revision: "1.0"
approved_candidate_head: 98cdc24c12e47057b1a7d6d3b156a96bf5ef4d8d
approved_raw_digest: "sha256:530b35bb77fb22bc4ea2643e86b24bffe5f5e91444445605b56b5968f0fb2f5f"
version: "1.0"
owner_issue: 1642
plan: PLAN-L3-1642-bugbot-bounded-repair
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/bugbot-bounded-repair-recognition.md
next_pair_freeze: L12
---

# 限定修復の利用目的

本書は承認済みBBR-BR01..02のcanonical sourceである。候補の第二正本は残さず、
承認時のraw bytesと有効化条件の来歴を[既存PLAN](../../../plans/PLAN-L3-1642-bugbot-bounded-repair.md)で保持する。
新配置の独立技術review前は文書・PLANともdraftを維持する。source配置はRequirement IR admission、
実装・実consumer受入の完了でも、新しい自動書込み権限の有効化でもない。

BBR-BR01: 開発者・workerが定型逸脱の修正往復を減らし、意味判断が必要な仕事へ集中できること。
登録済みの検証可能な修復だけを機械へ渡し、それ以外は既存worker・Recoveryへ返す。

BBR-BR02: 自動化しても権限・所有権・予算・独立検収を越えず、修復の失敗や反復が
他レーンの変更・調査・Help・継続運転を壊さないこと。

要件sourceは[BBR-R01..05](../L3-requirements/bugbot-bounded-repair-requirements.md)、
総合テスト設計は[BBR-AC01..07](../../../test-design/helix/bugbot-bounded-repair-acceptance.md)へ接続する。
BR01→R01/R02/R04→AC01/02/04/07、BR02→R03/R04/R05→AC03/04/05/06で追跡する。

既存GH-FR-011の権限内の機械化は再利用する。#1595の診断・修復候補は実行権ではない。
本書と対応するL3/L10は`L3-PO-1642-001`で承認済み。正本化の独立検収・該当IR admission後に実装・限定実証へ進む。
新しい自動適用権限は修復ごとの契約・独立検証・実consumer検証が成立した範囲だけ有効化する。
要求承認のみで包括的書込み権限を付与せず、未定義の意味・権限拡張だけ正規改訂へ返す。
別Policy、DB、scheduler、万能コード生成器は作らず、Aとは別完了で追跡する。

## 利用目的の認識

本書は利用目的のcanonical L1 sourceであり、正規pairはL1↔L12である。
[L12認識設計](../../../test-design/helix/bugbot-bounded-repair-recognition.md)は既存BR01..02だけからの
派生draftであり、原承認3文書に含まれていたとは主張しない。新しい閾値・意味・権限を追加せず、
新HEADの独立技術reviewと実consumerでの認識は未完了として扱う。
