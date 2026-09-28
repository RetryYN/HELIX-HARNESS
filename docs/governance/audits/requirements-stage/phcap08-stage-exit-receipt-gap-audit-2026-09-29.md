---
audit_id: PHCAP08-STAGE-EXIT-RECEIPT-GAP-2026-09-29
baseline_commit: b72399eef5c3e6745a0769d1578420b8583c2814
scope: PHCAP-08内の工程終了証拠条件1件
authority_effect: none
legacy_execution: not_run
---

# PHCAP-08 工程終了receipt条件の局所照合

## 結果

旧PHCAP-08 sourceには、工程終了を同一snapshotに束縛された`stage_exit_receipt`で判定し、未解決事項を空・型付き持越し・明示deferへ分類する条件がある。現行の採択済みHARNESS-L2-003/022とOS-L2-002/016/017は工程状態、pair別証拠、作業trace、停止時の未完義務を扱う。一方、**この旧条件と同じ必須要素をまとめて持つ工程終了receipt、および理由・owner・期限・再入場条件を必須とするdefer形の現行L2/L11 successorは、今回確認した対象文書では特定できなかった**。

これはPHCAP-08全体の欠落判定ではない。旧sourceはdraftであり、現行要求への自動移管元ではない。工程ごとの証拠・持越し条件を候補として照合すべき範囲を示す局所監査である。

## 旧source

| 項目 | 根拠 |
|---|---|
| 資産 | `LEGACY-ASSET-D27D4A1511BFD43623A9`、[工程ゴールと完了権限 要件定義](../../../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/lifecycle-stage-completion-goals.md) |
| asset disposition | [legacy-asset-disposition.jsonl](../../legacy-asset-disposition.jsonl) の当該asset行：`authority_status: historical`、`disposition: unresolved`、`implementation_status: unknown` |
| file SHA-256 | `21ba24bf781048f1cb03a20172c8049a6112690cda3d0d0f7dd0ba3cb0bd7406` |
| source status | 旧文書frontmatterは`status: draft`。承認済みの旧要求と読み替えない。 |
| 重要な行 | 45–72行（FR-001、receipt、未解決事項の処置）。source line SHA-256（改行を除くbytes）：47行 `a528f626e2290b57004c4e00a2013807f912dc772d4b624e8bdb5ce7d7df39f2`、70行 `0429748fd8b4b8548c38dc765d753e5ac44dfbdfb0c3b639edccdff6587cf438`、71行 `3152406d54142c6915718fb368ea089e5731d3f7e82a1d578ecf2f2768380f1a`、72行 `57f31034dd61e33bd568e08177cd28984a58d6216d581c78253a1a6049c7567a` |

47–68行の条件は、stage goal、canonical/paired layer、開発方式、case-driven model、specialist processes、scope、owner、required outputs、positive/negative oracles、unresolved items、candidate HEAD、evidence digest、independent review receipt、exit decisionを、同じsnapshotのreceiptへ束縛すること。70–72行は、未解決事項を空集合・後続工程へのtyped carry・理由/owner/期限/re-entry条件付きdeferのどれかに分類し、自由記述やIssue/TODO数だけで完了扱いしないことを記す。74–84行はL2↔L11とL3↔L10の段階別目的、受入oracle、freeze拒否条件を置く。

## 現行要求と判断revision

PO判断recordは固定対象revisionを採択した記録である。current file全体には後続candidateの追記があるため、現在のファイルSHAを採択revisionのSHAと混同しない。

| 対象 | 判断記録・固定対象 | 現行の関連条件 |
|---|---|---|
| HARNESS | [2026-09-28 PO判断](../../decisions/helix-harness-requirements-po-decision-2026-09-28.md)、判断record SHA-256 `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`。固定commit `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、L2 SHA-256 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、L11 SHA-256 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`。本体の既存L2/L11と明示候補24件を採択。 | 採択HARNESS-L2-003は開始・freeze・差戻し・再開・完了条件、対成果物、検証、未解決事項を明示し、成功だけから完了を推定しない（[L2](../../../helix-harness/L2-requirements/product-requirements.md#L54)、[L11](../../../helix-harness/L11-acceptance/product-acceptance.md#L23)）。採択HARNESS-L2-022はIntegrated/Verified/Acceptedを分離し、各段階のoracle/evidence/revisionを照合する（[L11](../../../helix-harness/L11-acceptance/product-acceptance.md#L298)）。 |
| OS | [2026-09-28 PO判断](../../decisions/helix-os-requirements-po-decision-2026-09-28.md)、判断record SHA-256 `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`。固定commit `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、L2 SHA-256 `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`、L11 SHA-256 `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680`。L2-001–029と対のL11一式、候補014–029を採択。 | 採択OS-L2-002は要求から運用までのtrace・欠落/競合把握と、部分成功から全体完了を推定しない境界を持つ（[L2](../../../helix-os/L2-requirements/governance-requirements.md#L55)）。採択OS-L2-016はportfolio上の欠落/未検証/unknown/staleと未完edgeを保持し、017はticket/workflowと停止理由・未完義務を扱う（[L2](../../../helix-os/L2-requirements/governance-requirements.md#L652)、[L11](../../../helix-os/L11-acceptance/governance-acceptance.md#L331)、[L11](../../../helix-os/L11-acceptance/governance-acceptance.md#L338)）。OSは記録・推進・実行状態を扱う。HARNESSの工程意味や受入oracleを決めるownerとはしない。 |

2026-09-28のPO判断は、旧sourceの未完引継ぎ、旧要求被覆完了、retire、holding解除を生成しないと明記する。従って、上記採択条件はreceipt要素の部分的な意味対応として扱い、旧FR-001全体の採択証拠にはしない。

## 現行候補とreceiptの範囲

| 現行candidate / receipt | receiptが示す範囲 | 本監査条件への関係 |
|---|---|---|
| HARNESS-L2-045（未採択）。[coverage receipt](../requirement-registration/harness-wbs-work-shape-coverage-receipt-2026-09-28.json)、SHA-256 `8ead52172b81eb3064bb8ed970b0144c1540729461628d0a98efb2cd8b46362f` | HDECがsplit承認した`WBS-HARNESS-001`の1 atomのみ。旧PHCAP-08同等性とarchive rule atomsは範囲外。 | 作業単位の規範形であり、全工程のexit receiptや未解決事項の持越し/ defer条件を定めない。 |
| HELIXOS-L2-039（未採択）。[coverage receipt](../requirement-registration/helixos-wbs-work-identity-coverage-receipt-2026-09-28.json)、SHA-256 `db8b674441964d781d9be2db25283745ec77b485ec507d93848bd461e41eeba1` | HDECがsplit承認した`WBS-OS-002`の1 atomに限る。旧PHCAP-08全体と旧RUL-TKT-01/02/03等は範囲外。 | OSの登録前identity/適格性であり、stage closure、HARNESS工程判定、exit authorityを扱わない。 |
| [PHCAP-08 condition recovery audit](phcap18-condition-recovery-audit-2026-09-28.json)、SHA-256 `5943b01f893f9d880ad3f83a10783d9442c2e49b7c0b05ff00828b4d68344210` | 当時のL2/L11参照をphase単位で照合。PHCAP-08を意味同等性未解決、正確なWBS successorなしと記録した。 | その監査は後発の045/039 receiptsを含まない。本監査では両receiptの現在の狭い範囲を追加照合し、PHCAP全体の判定更新には使わない。 |

今回確認したL2/L11、register、receiptからは、旧sourceの次の組合せをひとつの工程終了条件として担うexact successorを特定できなかった。

1. 対象stageと正規pair、scope、責務owner、required outputs、positive/negative oracle、candidate HEAD、evidence digest、independent review receipt、exit decisionを同一の工程終了根拠へ結ぶこと。
2. 未解決事項を空・型付き持越し・明示deferに分類し、deferでは理由・owner・期限・再入場条件を保持すること。
3. OSのticket/Issue状態や下位stageの成功から、対象stageのexit decisionを推定しないこと。

採択済みHARNESS-L2-003/022およびOS-L2-002/016/017はこの範囲の周辺条件を持つが、旧FR-001のexact field set、単一snapshot結合、deferの必須属性をすべて明示するものとは確認できない。特に、OS-L2-016/017とL11にある未完義務・停止状態の保持は、各未解決事項のtyped carry/defer disposition一式と同一とは扱えない。

## 責務境界と次の候補範囲

- HARNESSを、工程の意味、L2/L11とL3/L10のpair、required oracle、完了/差戻し条件の規範ownerとする。既存HARNESS-L2-003/022の意味を重複定義せず、旧sourceの不足が現行の条件を拡張するか、単に証拠を構造化するかを候補内で区別する。
- OSは既存のL2-016/017およびauthority境界に沿い、対象revision、ticket/workflow、実行状態、未完義務、receiptへの参照を記録・引継ぎする側とする。OSがHARNESS oracleを決めたり、記録から採択・exit authorityを新設したりしない。
- 次の要求候補にする場合の最小scopeは、工程終了を主張する操作に限ったL2/L11対応である。正常例では必要pair/evidenceが同一対象revision・scopeへ揃うこと、誤り例ではoracle/revision/receipt欠落またはstaleを未完に保つこと、未見例では新しいstage/pair/owner条件をunknownとして推定で閉じないことを示す。未完事項はcarry/deferを区別し、後者で理由・owner・期限・再入場条件を落とさない。具体的なreceipt schema、発行者、deadline値、再入場条件の意味は根拠なしに固定しない。
- これは候補起草の範囲案であり、L2採択、L3要件承認、実装・実行・新runtime許可ではない。旧sourceがdraftであるため、原文をそのまま現行要求に昇格させず、変更意味が上流に触れるときは現行authority modelに従って扱う。

## 非対象と限界

- PHCAP-08全条件、PLAN/current-location/state DBの意味同等性、旧WBS全件の再配置は本監査の対象外。
- PHCAP-07のL10 engine/oracle/CI、PHCAP-19 learning loopは対象外。
- 旧implementation・test design・runtime・CLI・CIを実行していない。現行runtimeの存在、stage-exitの運用実績、受入passを主張しない。
- この記録はHARNESS-L2-003/022またはOS-L2-002/016/017の採択意味を変更しない。要求、authority、実行許可、phase completion、全旧資産coverageを生成しない。

## 参照した現行snapshot

監査baselineはmain `b72399eef5c3e6745a0769d1578420b8583c2814`。現行ファイルbytes SHA-256：HARNESS L2 `111cc0285e94bf0a1569627653ba1c578d5dcdf9dbedbbf168bb9acca3ae8d09`、HARNESS L11 `8f12b0e5b11d6dcba21974bdbf1999bc0ff28fc54686207cbe4cedc3ef4aa70e`、OS L2 `e782654ed653720c378ca1414b8dde54ebc15ec8ac7585232ac5888c74bc7af7`、OS L11 `33c901951d857bfe6e11365eafd1f75910091c2062d1c49fb2aefb2213cba957`。これらは監査時点の全ファイルhashであり、PO判断の固定revision hashではない。
