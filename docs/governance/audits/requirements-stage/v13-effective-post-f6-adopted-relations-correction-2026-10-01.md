# v1.3 effective current-relation correction overlay (2026-10-01)

このoverlayはqualified poolの131行すべてについて、queueの後発採択source citation、登録coverage receiptのsource-line SHA一致、2026-09-28／29／30のPO判断を照合した現在状態の有効viewである。個別修正は各行の`effective_current_view_correction`を優先する。F6時点の比較を後発判断で書き換えず、古い残余文のうち「採択関係・routeが存在しない」と読める現在形だけを明示範囲で置き換える。

## 全131行の静的join結果

- 母集団: 1–131、131 unique rank / 131 unique source item ID。queue/crosswalkのitem ID、archive path、file SHA、物理行、line SHAを照合した。
- queueにある後発採択source citation: 9行、11 citation records（rank 20, 21, 23, 25, 46–48, 87, 115）。queue上の効果はcitation-onlyであり、citationをcondition-level coverageとは扱わない。
- 登録receipt内のexact source-line SHA + 行番号 + 原文一致: 19行（rank 23, 46–49, 52, 56, 70–76, 86–88, 115, 121）。receiptのsource path/file SHAを行ったり来たりで補正せず、JSON内で`exact_source_identity`と`line_sha256_and_text_only`を区別した。
- rank90/91は437–438行にまたがる一文の隣接境界、rank117は固定F6 line105とのexact text relation、rank124はlive26採択との限定的な意味関係として手動記録した。rank124のHIL-FR-07 receiptはこのv1.3行のexact identity pinではない。

## 有効relation correction

| Rank | Source | 現在の有効relationと残る境界 |
|---:|---|---|
| 20 | `REQSRC-SUP-00051` / 67 | Adopted BRAIN-L2-023 fixed pair cites this exact v1.3 line; queue effect is citation_only. Current adopted relation exists. Residual: Visual Design HARNESS ownership/generation-evaluation, BRAIN→LABO learning return, and distinction from L8–L10 are not established by this citation. |
| 21 | `REQSRC-SUP-00077` / 102 | Adopted OS-L2-010 and HARNESS-L2-002/003 fixed pairs cite this exact v1.3 line; both queue effects are citation_only. Residual: full terminal output set (requirements/design/test/verification/measurement contracts) is not fully verified; no source-condition closure follows. |
| 23 | `REQSRC-SUP-00089` / 119 | Exact L119 receipt splits Performance Refactor (HARNESS-016) from Design Refactor and same-episode mixing atoms. D57 later adopts HARNESS-042, so the receipt’s pre-adoption candidate wording is historical. Preserve F6 finding as-of F6. No formal successor, holding retirement, or execution/acceptance closure is inferred. |
| 25 | `REQSRC-SUP-00105` / 139 | Adopted HARNESS-L2-002/003 pair cites this exact row; queue effect is citation_only. Preserve its fixed-F6 residual; citation is not full condition coverage. |
| 46 | `REQSRC-SUP-00192` / 247 | Exact source atom is carried in HARNESS-034 Measurement Contract receipt; D57 adopts exact L2/L11. Current relation exists beyond F6-era HARNESS-022 comparison. No formal successor or executed acceptance. |
| 47 | `REQSRC-SUP-00193` / 249 | Exact source atom is carried in HARNESS-034 receipt; D57 adopts exact pair. Bounded relation; no source-row closure or executed acceptance. |
| 48 | `REQSRC-SUP-00194` / 251 | Exact source atom is carried in HARNESS-034 receipt; D57 adopts exact pair. Bounded relation; no formal successor or end-to-end execution/acceptance closure. |
| 49 | `REQSRC-SUP-00198` / 259 | Full V/Scrum receipt carries two exact L259 source-line atoms into HARNESS-046; D57 adopts that exact pair. Supersedes current-state “no source-bound pair” claim. Receipt is bounded and does not assign formal successor, retire source holding, or claim execution/acceptance. |
| 52 | `REQSRC-SUP-00213` / 286 | CONNECT/SECURITY receipts split exact source-line spans. D57 conditionally adopts CONNECT-008 -002, selecting CONNECT supply and SECURITY safety decision. Supersedes pre-adoption status; source hold and unselected profile/security boundaries remain. No closure or SECURITY policy transfer. |
| 56 | `REQSRC-SUP-00217` / 290 | OS feedback receipt splits exact source line; only prose-handover-alone atom maps to OS-044, later adopted in D57. Lifecycle/event/SessionStart, unacknowledged finding, and source-HEAD mismatch atoms remain outside selected scope; no closure/holding retirement. |
| 70 | `REQSRC-SUP-00284` / 369 | Exact source atom is carried in HARNESS-034 r3 receipt; D57 adopts the pair. Limited receipt scope; no formal successor or execution/acceptance closure. |
| 71 | `REQSRC-SUP-00285` / 370 | Exact source atom is carried in HARNESS-034 r3 receipt; D57 adopts the pair. Limited receipt scope; no formal successor or execution/acceptance closure. |
| 72 | `REQSRC-SUP-00286` / 371 | Exact source atom is carried in HARNESS-034 r3 receipt; D57 adopts the pair. Limited receipt scope; no formal successor or execution/acceptance closure. |
| 73 | `REQSRC-SUP-00287` / 372 | Exact source atom is carried in HARNESS-034 r3 receipt; D57 adopts the pair. Limited receipt scope; no formal successor or execution/acceptance closure. |
| 74 | `REQSRC-SUP-00288` / 373 | Exact source atom is carried in HARNESS-034 r3 receipt; D57 adopts the pair. Limited receipt scope; no formal successor or execution/acceptance closure. |
| 75 | `REQSRC-SUP-00289` / 374 | Exact source atom is carried in HARNESS-034 r3 receipt; D57 adopts the pair. Limited receipt scope; no formal successor or execution/acceptance closure. |
| 76 | `REQSRC-SUP-00290` / 375 | Exact source atom is carried in HARNESS-034 r3 receipt; D57 adopts the pair. Limited receipt scope; no formal successor or execution/acceptance closure. |
| 86 | `REQSRC-SUP-00330` / 428 | Exact archived atom is carried in SECURITY-033 Worker Context receipt; D57 adopts exact SECURITY-033 pair. Receipt is 1 of 2 source atoms; packet/schema/all worker conditions and execution remain outside. |
| 87 | `REQSRC-SUP-00332` / 430 | Queue citation and SECURITY-032 receipt identify exact source line; D57 adopts the pair. Receipt is the single HR-FR-P2-07 atom; it does not close adjacent providers/runtime, retire holding, or prove deny execution. |
| 88 | `REQSRC-SUP-00334` / 432 | OS-030 package receipt carries exact content atom, but D57 holds OS-030. Candidate/source relation only, not adoption. Keep package and separate publish/cutover authority atom pending; no adopted relation is inferred. |
| 90 | `REQSRC-SUP-00337` / 437 | No exact queue citation or exact line-SHA receipt hit for line 437. It starts the split blind-benchmark sentence continued by rank 91/line438; adjacency is context, not adopted binding. |
| 91 | `REQSRC-SUP-00338` / 438 | No exact queue citation or exact line-SHA receipt hit for line 438. Rank90/line437 is split-sentence context; rank87/line430 SECURITY-032 is a distinct row and does not transfer. Keep fixed-F6 no-direct-pair finding and benchmark/admit-retire residual. |
| 115 | `REQSRC-SUP-00483` / 624 | Exact line624 is carried by OS Retrofit preflight receipt; D57 adopts OS-036. Supersedes “no source-specific pair routes this signal to Retrofit/preflight.” No runtime, holding retirement, or closure. |
| 117 | `REQSRC-SUP-00500` / 643 | Exact text counterpart occurs in adopted fixed HARNESS-L2-002/003 at line105: \| HARNESS-L2-002／003 \| requirements v1.3 §4.1（L94、L96-106）／§4.2（L112-119、L138-139）に従い、スクラムの各sliceでcheckpoint triggerに該当した場合は`SR0 evidence capture → SR1 observed contract → SR2 V-layer mapping → SR3 design/refactor proposal → SR4 pair freeze and Forward reentry`を実行する。v1.3 L104-106にある4 entity、SR4 publish条件、provisional非canonicalをHARNESS条件とし、SR4 receiptなしにrelease-readyへ進めず、findingをRedesign／Design Refactor／Performance Refactor／Retrofitのexactly oneへ送る。Design Refactorでobservable behavior／public surface／DB semantics／要求に差分があれば、`HIL-BR-21`／`HIL-FR-39`／`HIL-FR-50`に従いRedesign／Retrofitへrerouteする。v1.3 L107-108が参照するentity要件と宣言oracle、およびentity要件が指すconfirmed親文書は[300行全量台帳](../../governance/legacy-migration/delegated-document/scrum-reverse-source-line-inventory.md)で保持する。親文書と対になるconfirmed受入文書は[file-blob holding](../../governance/legacy-migration/delegated-document/delegated-requirement-document-source-inventory.md)で保持し、後続要求PRでatom化するまでcurrent authorityへ昇格させない。Scrum Reverseはスクラムの工程条件であり、POの開発方式の定義（[2026-09-25の判断記録](../../governance/decisions/po-optimal-draft-po-decisions-2026-09-25.md)）に従い、方式を合成した場合もスクラムで進める部分に適用する（例：リリースカンバンのリリース単位の中をスクラムで作る場合、ハイブリッドのユニットをスクラムで作る場合）。旧v1.3が旧ハイブリッド（V設計＋Scrum実装）のsliceに適用していたのは、旧ハイブリッドがスクラムの実装を含んでいたためであり、この考え方を保つ \| Prior rank audit omitted this route from fixed_f6_relations, so “not established” is superseded for the exactly-one route clause only. Pin SHA 8433f26d2bd2ed385fee35e3d994f52295690e8fa0911022935fe9530bc61f84. No broader Scrum/source closure or successor. |
| 121 | `REQSRC-SUP-00504` / 647 | Exact L647 summary atom is carried in Full V/Scrum receipt and HARNESS-046 is adopted by D57. Receipt says L647 overlaps L259 and is not a third independent condition. No extra requirement count, successor, or execution/acceptance closure. |
| 124 | `REQSRC-SUP-00510` / 653 | Live26 PO decision adopts HARNESS-057 gate meaning/close eligibility with OS-054 evidence/close handoff. This is a bounded semantic relation to line653, but its receipt source is HIL-FR-07, not this v1.3 row SHA. Do not label as exact row citation/receipt binding or formal successor. Source holding, detailed mapping, and execution/acceptance remain unresolved. |

## 一次証跡pin

decision record、L2/L11の固定bytesとsection SHA、source-citation/coverage receiptのfile SHAは、[完全な131-row JSON overlay](v13-effective-post-f6-adopted-relations-correction-2026-10-01.json)に格納した。rank117の固定F6 line 105もrevision、行text、line SHAをpinする。

## 比較時点と権限境界

rank監査のfixed F6比較revisionは`f6dad2a33e24f000b87d7f09b8d40288257e74cc`である。後発採択はその時点のhistorical findingを遡及変更しない。rank117は同じF6本文に既に存在するexactly-one routeを元auditのrelation inventoryが落としていたため、その一点だけeffective viewで補正した。

このoverlayは正式successor割当、source condition closure、source holdingのretire、authority効果、実装許可、L11受入実行を生成しない。receiptの`no_loss`はreceiptが定めるsource atom範囲に限る。未採択・条件付き採択・保留は各PO recordの状態を維持する。

検証はdocument revision、ID対応、物理行/line SHA、citation/receipt/pair pinsの静的確認に限定した。旧runtime、test、CIは実行していない。
