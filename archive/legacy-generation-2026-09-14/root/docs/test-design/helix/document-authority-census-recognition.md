---
canonical_vmodel: L1-L12
canonical_layer: L12
canonical_pair: L1
title: "Document Authority Census利用目的認識設計"
layer: L12
kind: redesign
status: confirmed
created: 2026-09-12
updated: 2026-09-12
owner: QA / Codex TL
plan: PLAN-L3-85-document-authority-census
parent_design: docs/design/helix/L1-requirements/document-authority-census-requests.md
pair_artifact: docs/design/helix/L1-requirements/document-authority-census-requests.md
---

# Document Authority Census利用目的認識設計

本書は[L1要求](../../design/helix/L1-requirements/document-authority-census-requests.md)の
`DAC-BR-001..005`を実利用から認識するL12設計である。要求、authority昇格、runtime実装、削除権限を追加しない。
L3要件とL10 oracleは[PLAN-L3-85](../../plans/PLAN-L3-85-document-authority-census.md)へ接続する。

| L1要求 | 実利用で認識する状態 | 必須の下流証拠 | 認定しない反例 |
|---|---|---|---|
| `DAC-BR-001` | 利用者が同一HEAD上でcanonical、candidate、reference、compatibility、historicalを一意に区別できる | class、lifecycle、input policy、ownerのexact projectionと利用者確認 | path名や自己申告だけの分類、UNKNOWNの推測 |
| `DAC-BR-002` | startup、rule、generator、CLI、CI、templateのactive consumerがstale authorityを読まない | reverse consumer graphと`STARTUP_AUTHORITY_LEAK`等のnegative oracle | scannerの存在だけ、consumer未接続、legacy成功による相殺 |
| `DAC-BR-003` | source変更時にgenerated artifact、digest、index、consumer、V-pairの追従対象が決定的に得られる | 同一HEADのprovenance chain、双方向pair、上下edge、変更前後の再現結果 | source側だけの更新、手作業リスト、片方向trace |
| `DAC-BR-004` | findingが意味変更せず既存Recovery、Redesign、Refactoring、Requirement Re-entryへ戻る | typed finding、route理由、owner、admission receipt | scannerによる本文変更、削除、approval生成、曖昧routeの自動選択 |
| `DAC-BR-005` | baseline debtとnew debtが分離され、UNKNOWNが増えず段階的に減る | exact baseline、new-debt ratchet、owner・期限、時系列measure |既存debtによる新規finding相殺、分母縮小、未分類除外 |

認識結果はL1要求の充足証拠であり、L3/L10の個別oracle、Requirement IR admission、runtime green、Release admissionを代用しない。
