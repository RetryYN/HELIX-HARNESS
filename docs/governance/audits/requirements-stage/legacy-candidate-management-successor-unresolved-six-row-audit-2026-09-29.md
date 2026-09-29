# 旧candidate管理条件6行の現行関係監査（#2353 proposed recount）

- 監査基準: `bf00aca56add8ca29d9a56af9a989fdeb0a7d969`（#2352 merge後のorigin/main）。
- 対象: #2353提案4,755行recountで`management_successor_unresolved`となる6行。旧4行に#2352で加わったREADMEの2行を累積した集合。
- authority effect: `none`。旧source bytes・line ledger・archive asset状態を固定し、現行文書は関係候補として比較した。
- 結果: 現行の関連文言・保存先は特定したが、6行ともexact formal successor、採択、製品L2/L11 routeを割り当てない。

## 行別結果

| Source ID・旧sourceの意味 | 旧source位置 | 現行候補関係 | 残るgap |
|---|---|---|---|
| `LEGACY-CAND-LINE-000018` — Issue #1728のowner接続とSLO／production／自動修復境界 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/README.md:28` | `docs/governance/authority-state-model.md:17-23, 36, 69` (partial_semantic_overlap); `docs/governance/management-provisional-requirement-registration.md:10-12, 23-38, 50, 65` (partial_semantic_overlap); `docs/governance/new-generation-start-here.md:110-120` (partial_semantic_overlap) | #1728のowner、本文、SLO値・本番操作・自動修復・完了各atomの現行配置は未確認。 |
| `LEGACY-CAND-LINE-000028` — 候補の正本化、二重authority防止、archive・参照更新 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/README.md:42` | `scaffold/README.md:34-39, 64-68` (partial_semantic_overlap); `docs/governance/authority-state-model.md:41-69` (partial_semantic_overlap); `docs/governance/legacy-requirement-carry-forward-policy.md:49-72` (partial_semantic_overlap) | 旧Concept candidateの昇格先、互換性、archive、参照更新を閉じる適用decisionはない。Scaffold Binding手順を旧sourceへ拡張しない。 |
| `LEGACY-CAND-LINE-000034` — 72 INV一括処置を避ける選択項目ごとのowner/差分解決 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/README.md:51` | `docs/governance/requirement-disposition-review-program.md:22-36, 41-56, 73-80, 94-105` (partial_semantic_overlap); `docs/governance/legacy-requirement-carry-forward-policy.md:49-67` (partial_semantic_overlap); `docs/governance/authority-state-model.md:27-36, 69` (partial_semantic_overlap) | 72 INVの個別source IDs、選択状態、現行owner、意味/受入/権限差分を結ぶcurrent crosswalkは未確認。 |
| `LEGACY-CAND-LINE-001067` — 旧5値のinvestment-stage分類とowner再利用 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/development-investment-stage-directives-intake_v1.0.md:17` | `docs/governance/requirement-disposition-review-program.md:41-55, 73-80` (partial_semantic_overlap); `docs/governance/authority-state-model.md:17-23, 27-36` (partial_semantic_overlap) | 旧5分類とRDP候補dispositionのmeaning relation、適用INV、owner identity/transfer先が未確定。 |
| `LEGACY-CAND-LINE-000021` — v4.0承認bytesとU1承認対象の分離 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/README.md:33` | `docs/governance/new-generation-start-here.md:72-78` (partial_semantic_overlap_with_explicit_change); `docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md:34-64` (decision_evidence_not_successor); `docs/governance/decisions/concept-v4.2-goal-owners-approval-2026-09-24.md:27-54` (decision_evidence_not_successor) | line 33のU1固有の対象分離・適用scopeとのrelationは未決。旧行を毎回承認手続きへ昇格させず、v4.0 approval/supersession意味を推定しない。 |
| `LEGACY-CAND-LINE-000037` — 不存在分冊でなく統合版内のINVカードへ参照解決 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/README.md:54` | `archive/legacy-generation-2026-09-14/root/docs/archive/intake/development-investment-stage-directives-source_v1.0.md:preserved source; card spans pending atomization` (preserved_source_location_not_successor); `docs/governance/legacy-migration/candidate/legacy-candidate-source-line-carry-forward.jsonl:source IDs 001056-001068` (preserved_inventory_not_successor); `docs/governance/requirement-disposition-review-program.md:22-36, 73-80` (partial_semantic_overlap) | INV-001〜072のcard span、ID-to-card mapping、current successor/ownerは未整理。pointer correctionだけでadoption/mappingは生じない。 |

## 旧source状態と比較所見

READMEはasset `LEGACY-ASSET-A9F7F40B7F61D64C4F8F`、investment intakeは`LEGACY-ASSET-429B017144C61B9C906D`。asset ledger上、どちらも`disposition: unresolved`、product target unresolved、decision recordなし。#000018はREADMEが列挙する#1728 intake/L1/L3/L10候補も確認し、9群のowner候補表とowner不明時の停止記述を読んだ。これらは旧candidate/unapprovedで、現行approved IDへの割当根拠ではない。#000037は指示先の統合sourceを読み、共通指示・P0-P4・72カード・共通受入を1文書に含み、個別カード節はline 328から始まり、全件index（line 2083以降）のリンクは欠落分冊`06_ITEM_DIRECTIVES.md`を指すことを確認した。READMEの訂正で統合版中のカードへ旧source位置は解決するが、現在のsuccessor/ownerは生成しない。6件すべてline ledger上`historical_candidate`／`draft_candidate`／`preserved_pending_atomization`、`meaning_change_applied: false`、successor IDなし、decision recordなしのまま。

- **#000018:** authority modelはIssue/PR状態から採否を作らず、管理仮登録はsource/候補の場所とtargetを記録する。#1728固有のownerやSLO・本番・自動修復境界へのmappingはない。
- **#000028:** Scaffold Bindingの`check-replacement`→read-after→`retire`はscaffold内の置換手順。旧Concept候補の正本化・compatibility・archive・参照更新に適用するdecisionはない。
- **#000034:** RDP-001とcarry-forward policyはsource atomとidentity単位の一般dispositionを管理する。72 INVの個別selection/current owner/delta crosswalkはない。
- **#001067:** 現行RDP候補dispositionは旧5区分と異なる集合。名称類似で対応づけず、旧候補ごとのmappingは未決。
- **#000021:** 現行入口はConceptを同じ1 fileで改訂し、版別の本文複製を置かない。対象revisionの人間decisionは別の判断記録に残す。旧v4.0候補は旧PLAN上で`candidate_exact_set_only`として承認され、canonical promotion/IR admissionは未完了と記録されている。README line 33は次のv4.1/U1整理を別対象に分ける記述だが、そのcurrent relationは未確定。現行9/17・9/24 decisionは各対象revisionの判断であり、line 33の後継decisionではない。現行はConceptを同一ファイルで改訂するため旧version-file運用と差分がある。毎回承認の手続きは追加しない。
- **#000037:** 統合版内の個別カードへの旧source pointerとarchive sourceは確認。current line ledgerはsource行を保全するが、INV card単位のmapping/owner/successorを確定しない。

## 固定sourceと限界

archive lineの内容SHAと物理bytes SHA/base64、archive asset、line-ledger状態、現行比較資料とdecisionのSHA-256/行参照を[JSON証跡](legacy-candidate-management-successor-unresolved-six-row-audit-2026-09-29.json)へ記録した。#2353 proposal JSONはbranch `codex/stage5-cumulative-recount`のHEAD `9926aebfbec7813d14a84490758783153422d99e`、SHA-256 `5d810a881d29711b0640e8641df2678b6fe9ee41767936d0289e0cf0e4948110`に固定。

本監査はsource-to-current関係候補と残余gapを記録する。formal successor、採択、target approval、coverage/closure、Issue完了、製品L2/L11 route、実装許可は成立しない。旧CLI/runtime/hook/test/CIは実行していない。
