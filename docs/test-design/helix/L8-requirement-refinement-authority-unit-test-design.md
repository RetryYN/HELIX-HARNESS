---
title: "Requirement refinement JSON authority L8 unit test design"
canonical_layer_scheme: L1-L12
layer: L8
paired_layer: L5
status: draft
plan: docs/plans/PLAN-RECOVERY-12-requirement-refinement-authority.md
pair_artifact: docs/design/helix/L5-detail/requirement-refinement-authority.md
---

# 要件refinement JSON正本 L8 unit test設計

| oracle | 種別 | 合格条件 |
|---|---|---|
| U-RRA-001 | positive | baseline 153/24/72/24とrefinement bundleを同じrootからloadする |
| U-RRA-002 | negative | refinement shard欠落／partial manifestを拒否する |
| U-RRA-003 | negative | missing／duplicate／related重複ownerを拒否する |
| U-RRA-004 | negative | source digest driftとcompatibility pathを拒否する |
| U-RRA-004b | negative | source bytesを変えずJSONのR／AC本文・edge・polarityだけを同期改竄してもprojection driftで拒否する |
| U-RRA-004c | boundary／mutation | peer-FR自身をATX heading＋header-role oracle表から投影し、mode誤指定・見出し消失・列数driftを拒否する |
| U-RRA-004d | mutation | WCC型6列requirement／5列acceptanceをheader roleで読み、位置固定によるstatement・negative列の誤投影を拒否する |
| U-RRA-004e | boundary／mutation | Given/When/Then表にreverse traceが無い場合、requirement表のforward AC exact setを要求し、欠落を拒否する |
| U-RRA-004f | positive | ID-led bullet requirementを隣接proseや別IDへ広げず投影し、header-role acceptance traceへ接続する |
| U-RRA-004g | mutation | legacy MICのH4／5列ACをfence内だけへ移動、同一ID重複、header reorder、extra列へ変異すると拒否する |
| U-RRA-005 | negative | R→AC未被覆、orphan、duplicate IDを拒否する |
| U-RRA-005b | negative | AC ownerの欠落・重複・implementation/parent terminal不成立を拒否する |
| U-RRA-006 | negative | approved/frozenのapproval欠落、revision／source／subject drift、current HEAD自己参照、非ancestorを拒否する |
| U-RRA-006b | boundary | specified H0→外部receipt→frozen H1を有限に閉じ、H0≠H1かつancestor／subject一致を証明する |
| U-RRA-006c | negative | frozenのPLAN未confirmed、downstream Issue欠落／余剰／closedを拒否する |
| U-RRA-007 | invariant | baseline bytes／count／digestの変更を拒否する |
| U-RRA-008 | projection | generated viewとDBが同じroot digest・別分母を持つ |
| U-RRA-009 | mutation | owner、source projection、approval、PLAN／Issue graph、coverage、baseline比較の各分岐除去をRedにする |

fixtureはMIC-FR-001、MIC-R-01..07、MIC-AC-001..012を使用する。Markdownに文字列が存在するだけでは
U-RRA-001をgreenにしない。

## 表行被覆

| U-ID | 対象 | 反例と期待結果 | test citation |
| --- | --- | --- | --- |
| U-MTROW-001 | 未列挙ACの脱落 | 空行の後の表行もIRの列挙数に依存せず元path・行番号付きで拒否する | `tests/requirement-refinement-authority.test.ts` |
| U-MTROW-002 | 列数不一致 | source digestを更新しても列数不足で捨てられた行を拒否する | `tests/requirement-refinement-authority.test.ts` |
| U-MTROW-003 | 正規境界 | それぞれheaderとseparatorを持つ別表、コードfence中の例を誤拒否しない | `tests/requirement-refinement-authority.test.ts` |
| U-MTROW-004 | 実consumer | 変異前に成功する実authority gateで、未収載表行の元path・行番号を報告する | `tests/requirement-authority.test.ts` |
| U-MTROW-005 | 表のdelimiter | escaped pipeをcell境界と誤認せず、正常な別表を受理する | `tests/requirement-refinement-authority.test.ts` |
| U-MTROW-006 | 閉じpipe欠落 | 末尾cellを捨てず、列数不一致を元path・行番号付きで拒否する | `tests/requirement-refinement-authority.test.ts` |
| U-MTROW-007 | L7 oracle表 | 不正行を診断し、後続の正規oracle行を黙って捨てない | `tests/plan-descent-specific-parent-binding.test.ts` |

## 三社レーン識別子の接合

| U-ID | 対象 | 反例と期待結果 | test citation |
| --- | --- | --- | --- |
| U-TLIR-001 | 識別子構文 | 3LとMICをruntime／JSON schema双方で受理し、空値・数字のみnamespace・小文字開始・空segment・slash・末尾改行を拒否する | `tests/requirement-refinement-authority.test.ts` |
| U-TLIR-002 | 範囲投影 | 3L-R-01..02を2件へ展開し、sourceの範囲だけ03へ拡張した場合はdigest更新後も拒否する | `tests/requirement-refinement-authority.test.ts` |

## 三社レーンの取込集合

| U-ID | 対象 | 反例と期待結果 | test citation |
| --- | --- | --- | --- |
| U-TLIR-MAT-001 | 元Featureの責務分割 | 8契約・25要件・27受入を元IDとFeature groupingのexact setで保持する | `tests/three-lane-ir-admission.test.ts` |
| U-TLIR-MAT-002 | 基準と状態 | 基準153/24/72/24と既存6契約を維持し、元のPO承認とapprovalなしspecified祖先の同一subjectへ束縛して三社だけ凍結する | `tests/three-lane-ir-admission.test.ts` |
| U-TLIR-MAT-003 | 接続の反例 | source、trace、owner、approval欠落、本文改変を個別拒否する | `tests/three-lane-ir-admission.test.ts` |
| U-TLIR-MAT-004 | 表末尾の取り落とし | 連続27行のAC表とIRのAC025/026/027を照合する | `tests/three-lane-ir-admission.test.ts` |
| U-TLIR-MAT-005 | 二相凍結境界 | 自己参照HEAD、旧revision、source集合・owner不一致、未confirmed PLANを個別拒否する | `tests/three-lane-ir-admission.test.ts` |

既存loader、生成view round-trip、DB rebuild oracleも同じ追加集合へ同期する。
DBは基準273行＋既存refinement 131行＋三社60行（8契約＋25要件＋27受入）＝464行とし、
baseline分母を変更せず、root／record digestとowner／oracleの非孤児条件を引き続き検証する。
