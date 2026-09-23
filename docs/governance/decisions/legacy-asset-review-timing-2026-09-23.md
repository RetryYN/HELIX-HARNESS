---
title: "旧資産の採否判断時期に関するPO decision record"
decision_record_id: HDEC-LEGACY-ASSET-REVIEW-TIMING-2026-09-23
decision: sequence_selected_asset_disposition_after_requirement_scope
decider_role: PO
decided_at: 2026-09-23
recorded_at: 2026-09-23
source_repository_revision: b0b16ecc63cb5da72c55787e846ca2ae3ab6425c
authority_effect: selected_legacy_asset_disposition_timing_only
---

# 旧資産の採否判断時期に関するPO decision record

## POの指示

POは2026-09-23の作業sessionで、旧資産を再構築時に調べる目的と順序を次のように指示した。

> 旧資産が使えるのか使えないのか、再構築の参照をするときに見落とさないかだけだろ？

> 要求整理してから要件定義時に見ればいいだろ、それなら捨てる範囲、拾う範囲が限定されんだから。

> 今回の判断に必要な根拠が揃ったら、その調査は止める

## 判断対象と順序

この判断は、`origin/main`の`b0b16ecc63cb5da72c55787e846ca2ae3ab6425c`にある既存統制を前提として、選択された旧資産のreuse dispositionを行う時期を明確にする。

| 対象文書 | 基準revision | SHA-256 |
|---|---|---|
| [`legacy-asset-reuse-control.md`](../legacy-asset-reuse-control.md) | `origin/main` `b0b16ecc63cb5da72c55787e846ca2ae3ab6425c` | `50209331b605762822cc2a2611f7663533c00039a114a31690ce8e3dc902f582` |
| [`archive-first-transition-record-2026-09-14.md`](../archive-first-transition-record-2026-09-14.md) | `origin/main` `b0b16ecc63cb5da72c55787e846ca2ae3ab6425c` | `6296dd7d58d058ae4d0eeadc294c81ca8b32c646b378fefc11554b3373824b8f` |

順序は次のとおりとする。

1. [RDP](../requirement-disposition-review-program.md)の生存中source holdingと意味relation closureを読み、要求atomを無損失に保持する。source holdingの読込と要求閉包は要求disposition判断の前提であり、この条件を変更しない。
2. 要求の要否と対象製品scopeを整理する。
3. scopeが定まった後、L3要求定義で関係する旧資産を台帳から選ぶ。選択した資産について、設計・実装へ進む前にsource、判断史、failure、consumerを読み、既存の[旧資産再利用統制](../legacy-asset-reuse-control.md)と[project rules](../../../AGENTS.md)に従って再利用・破棄・置換等を個別に判断する。

## 調査の停止条件

要求整理では、今回の要求要否・製品scopeの判断に必要な原文と関係が揃った時点で、その判断のための調査を止める。L3で選んだ旧資産も、今回の再利用・破棄・置換判断に必要な根拠が揃った時点で調査を止める。依存先、利用先、過去の障害が新たに見つかったことだけを理由に、調査範囲を自動的に広げない。判断に必要な根拠が欠ける場合は欠けた対象を明示し、それ以外の未確認資産は台帳に未判断のまま保全する。未確認をゼロにすることを完了条件にしない。

個別要求をPO判断へ送る際のsource holdingと意味relationの範囲は、[個別要求判断の調査停止境界](rdp-identity-evidence-boundary-2026-09-23.md)に記録する。

## 適用範囲と非効果

archive manifest全4,020件と資産明細台帳の全件対応は維持する。全4,020件を要求disposition前に意味・製品・consumer・実装の観点で分析することは要求しない。RDP source holdingの読込・無損失閉包と、L3で選択した資産のreuse dispositionは別の判断である。

この判断は、旧資産の要求意味を一括採用したり、選択資産を一括rejectしたりしない。旧統制の「要求欠落を防ぐ閉包」条件2を、要求判断前に全4,020資産へ一律適用する解釈はsupersedeする。RDP source holdingの要求atom閉包は維持し、L3で選定した資産に含まれるbehavior atomは対象別L2／L11、明示的不採用判断、または`unresolved`へ一度ずつ接続する。未選定資産は台帳上`unresolved`のまま保全し、未確認を「要求なし」や「不要」の証拠にしない。

また、これは旧資産のcopy、実行、現行pathへの配置、または設計・実装を許可する判断ではない。完全一致再利用の個別記録、digest/read-after、実行禁止境界、その他既存の統制を変更しない。

## superseded interpretation

本branchのcommit `48e4f2eaba654aaa2b6027e5ff9f20eed846c96c`で提案されていた次の文書digestには、要求source閉包と資産dispositionの順序を一つの統制本文で再記述する解釈が含まれていた。この再記述は採用せず、統制本文を上記基準revisionへ戻した。過去の未成立事項も当時の記録として復元し、本decisionを追記注記として適用する。

| 提案revision | SHA-256 |
|---|---|
| `legacy-asset-reuse-control.md` at `48e4f2eaba654aaa2b6027e5ff9f20eed846c96c` | `9a1c541dee6ad59ab411a91cce539ea7545a87a8a300943cd4251caf3de0a32d` |
| `archive-first-transition-record-2026-09-14.md` at `48e4f2eaba654aaa2b6027e5ff9f20eed846c96c` | `6c2ba6540c7761aae4f2f2227ccc28272bf1f37fb2b93fefc1b43d2699dc834d` |

このdecisionは提案文書をsourceとして新しい事実や要求を生成するものではない。正本はPOの上記指示と、維持される既存統制である。
