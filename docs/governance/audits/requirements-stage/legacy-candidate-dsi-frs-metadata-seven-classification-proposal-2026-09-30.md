# DSI／FRS 7行の分類修正提案

## 概要

- 基準HEAD: `888d8c79660a670829db46c75f25f39a3b7ce1d3`（#2384 merge後）。対象は `001062–001065` と `002073–002075` の7 exact source ID。
- #2382の#2381後 product/unknown pool 478件に対し、6件を `explanation / subtypeなし / not_condition`、001065を `condition / management_process_condition / management_successor_unresolved` とするbounded proposal。適用時のproduct/unknown poolは `478 → 471`。分類差分はcondition -6、explanation +6、management condition +1、product atom -7。
- authority effect: `none`。要求採択、successor、coverage、acceptance、実装、完了を示さず、旧source bytesや過去route auditを書き換えない。
- 002076（提案された実証順）と002077（negative/unknown/stale/unauthorized-write oracle）は実質predicateとして本proposalから除外し、別route auditに残す。

## 旧sourceと分類根拠

### Development Investment Stage Directives intake

旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/development-investment-stage-directives-intake_v1.0.md`、asset `LEGACY-ASSET-429B017144C61B9C906D`, SHA-256 `3cb6ee8a4d342b7f667c0960d08eb0a18fa44372ecb03bd85e0576e59baa4cca`。

旧本文3–7行はsourceを `candidate / unapproved` とし、72候補の照合入口に限定し、承認・v1必須化・一括Issue化・runtime権限・実装完了を成立させないと明示する。16–18行はP0–P4が導入帯で、severity／V-model layer／M0–M5／Release Waveではないと区別する。001065は単なるtrace pointerではなく、分冊にあった不存在の`06_ITEM_DIRECTIVES.md`を保持済みの統合カードへ解決するsource-resolution条件である。これは`docs/governance/candidates/README.md:54`のLEGACY-CAND-LINE-000037（asset `LEGACY-ASSET-A9F7F40B7F61D64C4F8F`、line SHA `237c6ccbe88f272922ff4b7e0918625cb896ffb5d745f672053763b9dfe2b261`）と同じsource-resolution意味で、prior merged `legacy-candidate-management-successor-unresolved-six-row-audit-2026-09-29.json`は`condition / management_process_condition / management_successor_unresolved`に分類している。カード範囲・ID対応・current successor/ownerは依然未整理で、pointer correctionは採択・successor assignmentを作らない。

| ID | 旧source行 | 行の内容 | proposed class | 理由 |
|---|---:|---|---|---|
| 001062 | 11 | INV-001〜072の72候補 | explanation | 候補数・集合scopeの記述 |
| 001063 | 12 | 導入帯P0〜P4 | explanation | taxonomyラベルのみ |
| 001064 | 13 | 依存、導入束、受入、採否、段階引継ぎ、出典 | explanation | 保持する情報カテゴリの列挙のみ |
| 001065 | 14 | 分冊pathを履歴入力の個別カードへ解決 | management_process_condition | 実在しない`06_ITEM_DIRECTIVES.md`を統合版の保持カードへ解決するsource-resolution condition。current successor/ownerは未確定 |

### Functional Release Slice acceptance

旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md`、asset `LEGACY-ASSET-67ADFAB856D954B3C5D2`, SHA-256 `bf3a5293a919a5b293ed5ac2c2f86a85539abbe7959ed9d66ea764922e868cee`。

Frontmatterは`draft_candidate`。§0は旧v0.2のapprovalを acceptance conditions への承認に限定し、implementation acceptance、independent review、canonical promotion、#397 IR admission、publish/cutoverを意味しないと明記する。

| ID | 旧source行 | 行の内容 | proposed class | 理由 |
|---|---:|---|---|---|
| 002073 | 63 | FRS-FR-001..006、6件 | explanation | feature contract数とID範囲のみ |
| 002074 | 64 | FRS-R-01..24、24件 | explanation | supporting requirement数とID範囲のみ |
| 002075 | 65 | FRS-AC-001..026、26件 | explanation | acceptance数とID範囲のみ。個別oracleは参照先rowにある |

## overlay・pool算術

#2353 exact row baselineおよび #2356/#2360/#2363/#2366/#2367/#2368/#2369/#2381 overlay行と7 IDを照合。いずれのprior overlayにも対象IDはなく、proposal前は各IDが`condition/product_requirement_atom/unknown`として#2382の478 poolに入っている。#2384はroute auditで分類を変更しない。

| 指標 | proposal前 | proposal適用仮定 | 差分 |
|---|---:|---:|---:|
| product / unknown pool | 478 | 471 | -7 |
| condition count | 864 | 858 | -6 |
| explanation count | 2,965 | 2,971 | +6 |
| management-process condition subtype | 36 | 37 | +1 |
| management_successor_unresolved route | 36 | 37 | +1 |
| #2384までの全route union | 364 | 364 | 0 |
| poolとroute unionの交差 | 305 | 305 | 0 |
| 未監査pool | 173 | 166 | -7 |

算式: `478 - 305 = 173`; `(478 - 7) - 305 = 166`。route unionは不変。7行のsource IDsは#2378/#2380/#2379/#2383/#2384のselected/prior unionに交差しない。分類差分は6件をexplanation、001065をmanagement conditionとするため、総conditionは6減、explanationは6増、management subtypeとそのunresolved routeは各1増。001065のmanagement unresolvedはsuccessor assignmentやadoptionを意味しない。

## 検証と限界

- 7行すべてをf6dad2 archive bytes、carry-forward line text/SHA、asset ledger file SHAと照合した。
- 001065を過去の000037 source-resolution precedentと照合し、classification/route投影、count table、pinned inputを更新した。
- classification overlayのintersection、route-audit unionとのintersection、478→471の算術を静的に確認した。
- source candidate stateとtarget draft-candidate stateは保持する。後続の個別card/acceptance rowのroute判定は変更しない。
- 旧archive tools、tests、CI、runtimeは実行していない。
