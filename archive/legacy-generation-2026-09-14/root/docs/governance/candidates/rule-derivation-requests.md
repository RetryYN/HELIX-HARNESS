---
title: "ルールの機械導出と診断・Help"
status: draft_candidate
authority_status: approved_pending_canonical_promotion
approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/issues/1595#issuecomment-5562000124"
approved_revision: "2.0"
version: "2.0"
candidate_layer: L1
owner_issue: 1595
plan_id: PLAN-L3-1595-rule-derivation
---

# ルールの機械導出と診断・Helpの要求

## G-BR-001 利用者価値

承認済みの許容境界を操作入口で実効的に守り、正常な試作や調査を妨げず、失敗時に根拠と安全な修復候補を取得できる。

## 責務と追跡

主Issue #1595、既存owner #825へ接続する。
詳細8要求は[要件候補](rule-derivation-requirements.md)、対応する8受入は[受入候補](rule-derivation-acceptance.md)に保持する。
本書内IDは候補の局所IDであり、canonical Requirement IR登録済みとは扱わない。
要求採用、canonical/IR admission、実装、有効化、退役を別状態で追跡する。

## 取込み証跡

2026-09-06受領原稿のSHA-256: `d742a1df564d8645ff2bfa2da9b3668c7e59e2aacfdb85e91be3412bdfa69fe7`。
原稿の全8要求本文を要件候補へ保持し、8つの受入へ対応付けた。原稿全文はIssue #1595にも保存する。
本要求はprovider-neutralであり、Codexの設定や読込み仕様の変更事実を未検証のまま前提にしない。
実装時にprovider/version/configと実読込みを測定し、既存供給との差を検証する。
