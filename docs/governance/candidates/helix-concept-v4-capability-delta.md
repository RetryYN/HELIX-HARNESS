# HELIX Concept v4.0能力根拠

## 調査基準

- repository: RetryYN/HELIX-HARNESS
- baseline main: a122bf933d89a9df8ec9048f26bf4e554dfc5d63
- baseline tree: bee9c3fac6b768201605393a39b21ef0d80cad4d
- concept source digest: sha256:b9174fd408354243711c1245fd4b20c17b25f2b0283725c38f7b822b10519418
- inventory source digest: sha256:10370d8ed8ce33fa45b5271b8d363347cb68b62235082c58cc941ddec697d507
- method: src全path、current governance、design catalog、L3 requirement family、Release composition、
  open Issue／PRの責務inventory

この文書はConcept候補の根拠であり、機能の完成証明ではない。OPERATIONALはbaseline mainで実行面が存在すること、
HARDENINGは実行面に未収束gapがあること、CONFIRMEDはauthorityが存在すること、CANDIDATE／SHADOWはcurrent未昇格、
GAPは責務欠落を表す。

## CapabilityからPlaneへの写像

| Capability family | Baseline状態 | v4 Plane | 主要な未収束 |
|---|---|---|---|
| Human Intent／Authority | CANDIDATE + GAP | Sovereignty | AI解釈、memory、発言からのauthority生成を完全遮断 |
| Requirement Authority／IR | OPERATIONAL + HARDENING | Compiler | Issue／candidate／runtimeのauthority追越し防止 |
| Design Registry／Synthesis | OPERATIONAL + CONFIRMED + SHADOW | Compiler | startup／assignment接続、whole-system synthesis |
| L1-L12／PLAN／Oracle | OPERATIONAL + HARDENING | Assurance Kernel | PLAN kind別verification、controlled debt縮退 |
| Workflow／Routing | OPERATIONAL | Compiler | legacy identityのcurrent surface撤去 |
| Assignment／Worker Runtime | OPERATIONAL + CANDIDATE | Control／Execution | compiled startup、exact lane canary、runway統合 |
| Provider／Model | OPERATIONAL + CANDIDATE | Execution | config attestation、benchmark資格、revision drift |
| Security／Safety | OPERATIONAL + CONFIRMED | Assurance Kernel | 物理identity、再帰target、network／cloud境界 |
| CI／Doctor | OPERATIONAL | Assurance Kernel | impact selectionの実測高速化、mutation coverage |
| Independent Review／Evidence | OPERATIONAL + HARDENING | Assurance／Ledger | 実体検証、append-only訂正 |
| Event／DB／Memory | OPERATIONAL + HARDENING | Ledger | startup exact set、silent skip、memory authority除去 |
| GitHub Governance | OPERATIONAL + HARDENING | Control／Ledger | native graph全体収束、terminal state同期 |
| Recovery／Refactoring | OPERATIONAL + CANDIDATE | Adaptation／Assurance | trigger admission、replacement実証 |
| Release／Distribution | CONFIRMED + primitive稼働 | Release | Slice registry、stable consumer適格性 |
| Deployment／Operations | CONFIRMED + runtime混在 | Lifecycle | provider-neutral runtime、本番E2E |
| UIL／TER／Learning／Audit／Synthesis | CONFIRMED + CANDIDATE + SHADOW | Adaptation | proposalからre-entryまでのE2E |
| CLI／VS Code／Web／generated docs | OPERATIONAL + migration | Projection | surface固有authorityを作らない |

## 採用した結論

1. HELIX全体をHarnessと同一視せず、HarnessをAssurance Kernelへ位置付ける。
2. 37 source familyは製品identityではなく、8 Planeへ束ねるimplementation inventoryとして扱う。
3. provider名は実装例に限定し、logical laneとresponsibilityをConceptのprimary identityにする。
4. Release primitiveが存在してもstable配布完了とは数えず、Slice→Module→Bundle→DevOSを目標契約にする。
5. confirmed／candidate／shadow能力を「現在使える機能」とREADMEへ表示しない。
6. current maturity、Issue番号、baseline hashはevidence側に置き、Conceptの不変定義へ埋め込まない。

## 除外・補正した内容

- 削除済みの一時ファイル名をcompanion authorityにしない。
- baseline時点のCodex／Cursor／Claude構成を恒久topologyにしない。
- current source family数やIssue優先順位をConcept versionの成立条件にしない。
- confirmed authority、runtime primitive、E2E完了を同じ「実装済み」に畳み込まない。
- v4.0候補を根拠にpackage version、repository名、CLI名、state pathを変更しない。
