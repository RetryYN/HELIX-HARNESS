# 旧要求retirement判断 前提分類表

status: draft_review_pending
authority_effect: none
source_generation: HELIX v1.3 Requirement IR

## 読み方

対象9件は現行HARNESS／OSの採用済み要求ではない。旧HELIX全体の要求を無損失で保持している`preserved_pending_rehome`である。ここでは現行製品とL2への移管候補だけを示す。現行L2／L11も再採否中なので、本表から採用、統合、retireを生成しない。

## 5比較群の結論

| 群 | 旧要求 | 何の要求か | 要求間の関係 | 現在の結論 |
|---|---|---|---|---|
| RET-001 | `HIL-FR-05`, `HIL-FR-31` | 上流変更後にV-model工程へ戻す条件と、その運転時の拒否制御 | 部分重複を含む具体化候補。完全重複ではない | 製品sliceとL11を分けるまでretirement不可 |
| RET-002 | `HIL-BR-17`, `HIL-FR-30` | audit findingを現PR修正か後続ticketへ振り分ける業務方針と機能 | 上位業務要求→機能具体化 | trace関係として保持。重複retirement候補から除外 |
| RET-003 | `HIL-BR-24`, `HIL-FR-45` | 要件定義を履歴管理する業務目的とledger機能 | 上位業務要求→機能具体化 | trace関係として保持。重複retirement候補から除外 |
| RET-004 | `HIL-NFR-26`, `HIL-NFR-28` | 設計義務の完全性と要求定義の完全性 | 同型の品質制約だが分母が異なる兄弟要求 | 接続関係を定義するまで統合不可 |
| RET-005 | `HIL-TR-08` | Node↔Python間IPCの旧技術方式と境界品質 | 技術bindingの代替調査対象。重複ではない | research／PoC前に方式を廃止しない |

## 要求別の対象と移管候補

| 旧要求 | 旧HELIXで何を要求しているか | HARNESS slice候補 | OS slice候補 | 現行L2候補 | retirement前の未解決事項 |
|---|---|---|---|---|---|
| `HIL-FR-05` | 設計欠陥を影響層へ戻し、V-pairをstale化して再freezeする工程全体 | V-pair、prototype／skip receipt、再freeze、Reverse→Redesign→Forward順序 | 影響層routing、stale伝播、差戻し、PO escalation、receipt管理 | HARNESS `L2-003`,`L2-004`; OS `L2-003`,`L2-004`,`L2-007`,`L2-011` | atom単位の製品分割とL11。FR-31との共通部だけを同定する |
| `HIL-FR-31` | 再承認前の実装claimとForward合流を拒否する再入場制御 | 再承認するpair／prototype agreementの条件 | stale化、claim／合流拒否、re-entry task／receipt運転 | HARNESS `L2-003`,`L2-004`; OS `L2-003`,`L2-004`,`L2-007`,`L2-011` | FR-05の具体化か独立OS運転要求かをL11までtraceする |
| `HIL-BR-17` | findingを責務とscopeで現PR修正／後続Issueへ分け、破棄と逆流を防ぐ業務規則 | 分類境界、contract影響、破棄／再流入禁止 | writer返却、Issue／Reverse／memory／queue推進 | HARNESS `L2-003`,`L2-005`; OS `L2-010`,`L2-013` | 上位業務要求として残しFR-30へのtraceとacceptanceを割り当てる |
| `HIL-FR-30` | BR-17の方針を実行し、writer返却または後続ticket群を生成する機能 | disposition条件、evidence影響、欠落時ready拒否 | 重複判定、返却、Issue等の原子生成、causality管理 | HARNESS `L2-003`,`L2-005`; OS `L2-010`,`L2-013` | actor／旧component名を現行責務へ写し、BR-17との具体化traceを作る |
| `HIL-BR-24` | 要件定義自体を設計対象とし、原文から設計義務・revisionまで履歴で結ぶ業務要求 | 原子要求、分類、scope、acceptance、template、design obligation契約 | authority、revision、履歴、projection管理 | HARNESS `L2-004`,`L2-008`,`L2-009`; OS `L2-001`,`L2-002`,`L2-007` | 上位業務要求として残しFR-45とL11 acceptanceへtraceする |
| `HIL-FR-45` | stable ID、immutable revision、typed edge、変更receipt、stale findingを扱うledger機能 | field、typed relation、変更操作、receiptの意味契約 | immutable ledger、revision、stale／orphan検査運転 | HARNESS `L2-004`,`L2-008`,`L2-009`; OS `L2-001`,`L2-002`,`L2-007` | BR-24との具体化trace、HARNESS定義とOS保存機構のatom分割 |
| `HIL-NFR-26` | design obligationを設計内容、edge、test oracle／N/Aで個別に満たす品質 | 意味ある消込条件、TBD／空欄／一括消込禁止 | edge、oracle、N/A receipt状態管理 | HARNESS `L2-004`,`L2-005`,`L2-009`; OS `L2-002`,`L2-007` | design obligationを分母とするL11 acceptance |
| `HIL-NFR-28` | active requirementをsource、authority、acceptance等へ個別に結ぶ品質 | requirement coverageと設計完全性契約 | typed edge、ambiguity、orphan、stale検査 | HARNESS `L2-004`,`L2-008`,`L2-009`; OS `L2-001`,`L2-002`,`L2-007` | active requirementを分母とするL11。NFR-26とは接続するが統合しない |
| `HIL-TR-08` | NodeとPythonをchild process＋JSON Lines over stdioで結ぶ旧技術制約 | 境界が必要な場合のversion、identity、sequence、deadline、digest品質 | process境界と診断channel運転 | 割当不可。L2より先に方式を固定しない | 新世代に境界が存在するかresearchしPoC比較。方式と方式非依存品質を分ける |

表中の`L2-*`は各製品prefixを省略した候補表記であり、採用済みsuccessor IDではない。

## 次の停止点

9要求のatomをHARNESS／OSへ分け、現行L2／L11候補へtraceするところまでで停止する。完全重複が証拠付きで残った場合だけ、対象要求の原文、関係、移管先、Aを選んだ場合に変わること／変わらないことを示す新しい質問を5件以内で作る。
