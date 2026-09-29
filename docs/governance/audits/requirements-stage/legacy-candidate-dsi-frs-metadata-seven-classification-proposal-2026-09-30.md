# DSI／FRS metadata 7行の分類修正提案

## 概要

- 基準HEAD: `888d8c79660a670829db46c75f25f39a3b7ce1d3`（#2384 merge後）。対象は `001062–001065` と `002073–002075` の7 exact source ID。
- #2382の#2381後 product/unknown pool 478件に対し、7件を `explanation / subtypeなし / not_condition` とするbounded proposal。適用時は `478 → 471`。
- authority effect: `none`。要求採択、successor、coverage、acceptance、実装、完了を示さず、旧source bytesや過去route auditを書き換えない。
- 002076（提案された実証順）と002077（negative/unknown/stale/unauthorized-write oracle）は実質predicateとして本proposalから除外し、別route auditに残す。

## 旧sourceと分類根拠

### Development Investment Stage Directives intake

旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/development-investment-stage-directives-intake_v1.0.md`、asset `LEGACY-ASSET-429B017144C61B9C906D`, SHA-256 `3cb6ee8a4d342b7f667c0960d08eb0a18fa44372ecb03bd85e0576e59baa4cca`。

旧本文3–7行はsourceを `candidate / unapproved` とし、72候補の照合入口に限定し、承認・v1必須化・一括Issue化・runtime権限・実装完了を成立させないと明示する。16–18行はP0–P4が導入帯で、severity／V-model layer／M0–M5／Release Waveではないと区別する。

| ID | 旧source行 | 行の内容 | proposed class | 理由 |
|---|---:|---|---|---|
| 001062 | 11 | INV-001〜072の72候補 | explanation | 候補数・集合scopeの記述 |
| 001063 | 12 | 導入帯P0〜P4 | explanation | taxonomyラベルのみ |
| 001064 | 13 | 依存、導入束、受入、採否、段階引継ぎ、出典 | explanation | 保持する情報カテゴリの列挙のみ |
| 001065 | 14 | 分冊pathを履歴入力の個別カードへ解決 | explanation | trace pointer。指す個別cardとは別identity |

### Functional Release Slice acceptance

旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md`、asset `LEGACY-ASSET-67ADFAB856D954B3C5D2`, SHA-256 `bf3a5293a919a5b293ed5ac2c2f86a85539abbe7959ed9d66ea764922e868cee`。

Frontmatterは`draft_candidate`。§0は旧v0.2のapprovalを acceptance conditions への承認に限定し、implementation acceptance、independent review、canonical promotion、#397 IR admission、publish/cutoverを意味しないと明記する。

| ID | 旧source行 | 行の内容 | proposed class | 理由 |
|---|---:|---|---|---|
| 002073 | 63 | FRS-FR-001..006、6件 | explanation | feature contract数とID範囲のみ |
| 002074 | 64 | FRS-R-01..24、24件 | explanation | supporting requirement数とID範囲のみ |
| 002075 | 65 | FRS-AC-001..026、26件 | explanation | acceptance数とID範囲のみ。個別oracleは参照先rowにある |

## overlay・pool算術

#2353 exact row baselineおよび #2356/#2360/#2363/#2366/#2367/#2368/#2369/#2381 overlay行と7 IDを照合。いずれのprior overlayにも対象IDはなく、各IDは#2353で `condition/product_requirement_atom/unknown` のまま#2382の478 poolへ入っている。#2384はroute auditで分類を変更しない。

| 指標 | proposal前 | proposal適用仮定 | 差分 |
|---|---:|---:|---:|
| product / unknown pool | 478 | 471 | -7 |
| #2384までの全route union | 364 | 364 | 0 |
| poolとroute unionの交差 | 305 | 305 | 0 |
| 未監査pool | 173 | 166 | -7 |

算式: `478 - 305 = 173`; `(478 - 7) - 305 = 166`。route unionは不変。7行のsource IDsは#2378/#2380/#2379/#2383/#2384のselected/prior unionに交差しない。

## 検証と限界

- 7行すべてをf6dad2 archive bytes、carry-forward line text/SHA、asset ledger file SHAと照合した。
- classification overlayのintersection、route-audit unionとのintersection、478→471の算術を静的に確認した。
- source candidate stateとtarget draft-candidate stateは保持する。後続の個別card/acceptance rowのroute判定は変更しない。
- 旧archive tools、tests、CI、runtimeは実行していない。
