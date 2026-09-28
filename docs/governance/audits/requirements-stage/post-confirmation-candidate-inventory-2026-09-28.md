# 8機構確認後に生じた要求候補25件の採否待ち一覧

基準mainは `5e42b759addec0166af3d0fd98ca878a8c851f10`（#2234統合後）。[確認PRの採択250件](po-confirmation-closure-2026-09-28.json)と現行仮登録の生存候補をidentityで差し引いた。固定PO判断は250件を採用したが、その後の25件を採用・保留・不採用へ分類した判断はない。L2/L11本文があること、registerへの登録、PR mergeやreviewは採択を生成しない。

この25件は上記基準時点の記録である。後続PR #2238・#2241統合後の現行生存候補は27件（この一覧の25件と追加2件）で、追加分も未採択である。基準時点の記述は当時の履歴として保持し、現在の件数は後続差分を含めて読む。

| 機構 | 候補・L2本文 | 対のL11 | 生存register revision |
|---|---|---|---|
| HARNESS | [HARNESS-L2-034：要求別の計測契約と完成判定（コアの単体候補、version_target 1.0）](../../../helix-harness/L2-requirements/product-requirements.md#L693) | [L11](../../../helix-harness/L11-acceptance/product-acceptance.md#L465) | `MPR-RC-HARNESS-L2-034-003` |
| HARNESS | [HARNESS-L2-035：要求候補の導出根拠と受入への寄与の照合（CORE単体追補候補、1.0）](../../../helix-harness/L2-requirements/product-requirements.md#L719) | [L11](../../../helix-harness/L11-acceptance/product-acceptance.md#L485) | `MPR-RC-HARNESS-L2-035-002` |
| HARNESS | [HARNESS-L2-036：検証観点の完全性とローカル・CIの同一契約（CORE単体候補、1.0）](../../../helix-harness/L2-requirements/product-requirements.md#L730) | [L11](../../../helix-harness/L11-acceptance/product-acceptance.md#L493) | `MPR-RC-HARNESS-L2-036-002` |
| HARNESS | [HARNESS-L2-037：HELIX W二段設計を合流する（composite candidate）](../../../helix-harness/L2-requirements/product-requirements.md#L777) | [L11](../../../helix-harness/L11-acceptance/product-acceptance.md#L527) | `MPR-RC-HARNESS-L2-037-002` |
| HARNESS | [HARNESS-L2-038：候補 — 選択Reverse scopeの内容閉包](../../../helix-harness/L2-requirements/product-requirements.md#L834) | [L11](../../../helix-harness/L11-acceptance/product-acceptance.md#L574) | `MPR-RC-HARNESS-L2-038-001` |
| HARNESS | [HARNESS-L2-039：体験・UI・Frontend契約を同一scopeへ結ぶ（HARNESS-CORE composite候補、version_target: 1.0）](../../../helix-harness/L2-requirements/product-requirements.md#L891) | [L11](../../../helix-harness/L11-acceptance/product-acceptance.md#L638) | `MPR-RC-HARNESS-L2-039-002` |
| HARNESS | [HARNESS-L2-040：全層ledger契約と層外anchor（HARNESS-CORE unit候補、version_target: 1.0）](../../../helix-harness/L2-requirements/product-requirements.md#L944) | [L11](../../../helix-harness/L11-acceptance/product-acceptance.md#L685) | `MPR-RC-HARNESS-L2-040-002` |
| HARNESS | [HARNESS-L2-041：active templateのobligation抽出とgap提示（HARNESS-CORE unit候補、version_target: 1.0）](../../../helix-harness/L2-requirements/product-requirements.md#L955) | [L11](../../../helix-harness/L11-acceptance/product-acceptance.md#L695) | `MPR-RC-HARNESS-L2-041-002` |
| INTELLIGENCE | [HELIXINTELLIGENCE-L2-072：Judgment pack候補とshadow評価（単体候補、version_target: 1.0）](../../../helix-intelligence/L2-requirements/intelligence-requirements.md#L561) | [L11](../../../helix-intelligence/L11-acceptance/intelligence-acceptance.md#L289) | `MPR-RC-HELIXINTELLIGENCE-L2-072-004` |
| LABO | [HELIXLABO-L2-061：比較評価のtask・oracle隔離と履歴の完全性（単体追補候補、1.0）](../../../helix-labo/L2-requirements/labo-requirements.md#L457) | [L11](../../../helix-labo/L11-acceptance/labo-acceptance.md#L205) | `MPR-RC-HELIXLABO-L2-061-001` |
| LABO | [HELIXLABO-L2-062：外部調査の主張と原文箇所の照合（単体追補候補、2.0）](../../../helix-labo/L2-requirements/labo-requirements.md#L470) | [L11](../../../helix-labo/L11-acceptance/labo-acceptance.md#L217) | `MPR-RC-HELIXLABO-L2-062-001` |
| LABO | [HELIXLABO-L2-063：修復手順の再発評価と予防候補への還流（構成体追補候補、1.0）](../../../helix-labo/L2-requirements/labo-requirements.md#L480) | [L11](../../../helix-labo/L11-acceptance/labo-acceptance.md#L225) | `MPR-RC-HELIXLABO-L2-063-001` |
| LABO | [HELIXLABO-L2-064：Worker比較評価の候補名遮蔽と再現条件（単体候補、1.0）](../../../helix-labo/L2-requirements/labo-requirements.md#L491) | [L11](../../../helix-labo/L11-acceptance/labo-acceptance.md#L233) | `MPR-RC-HELIXLABO-L2-064-002` |
| LABO | [HELIXLABO-L2-065：候補Worker資格とtask別性能証拠（単体候補、1.0）](../../../helix-labo/L2-requirements/labo-requirements.md#L503) | [L11](../../../helix-labo/L11-acceptance/labo-acceptance.md#L241) | `MPR-RC-HELIXLABO-L2-065-001` |
| OS | [HELIXOS-L2-030：HARNESS packageの生成・consumer検証・段階配布（単体候補）](../../../helix-os/L2-requirements/governance-requirements.md#L879) | [L11](../../../helix-os/L11-acceptance/governance-acceptance.md#L480) | `MPR-RC-HELIXOS-L2-030-002` |
| OS | [HELIXOS-L2-031：CIの性能計測と正しさを維持する改善回収（単体追補候補、1.0）](../../../helix-os/L2-requirements/governance-requirements.md#L900) | [L11](../../../helix-os/L11-acceptance/governance-acceptance.md#L500) | `MPR-RC-HELIXOS-L2-031-001` |
| OS | [HELIXOS-L2-032：Known failureの限定quarantine（単体候補）](../../../helix-os/L2-requirements/governance-requirements.md#L913) | [L11](../../../helix-os/L11-acceptance/governance-acceptance.md#L513) | `MPR-RC-HELIXOS-L2-032-001` |
| OS | [HELIXOS-L2-033：Versioned engine/detector registryと同一snapshot再現証拠（単体候補）](../../../helix-os/L2-requirements/governance-requirements.md#L929) | [L11](../../../helix-os/L11-acceptance/governance-acceptance.md#L524) | `MPR-RC-HELIXOS-L2-033-001` |
| OS | [HELIXOS-L2-034：原指示・finding disposition証拠と異議履歴（単体候補、1.0）](../../../helix-os/L2-requirements/governance-requirements.md#L945) | [L11](../../../helix-os/L11-acceptance/governance-acceptance.md#L539) | `MPR-RC-HELIXOS-L2-034-002` |
| OS | [HELIXOS-L2-035：PR lifecycle event intakeと監査job要求の冪等生成（単体候補）](../../../helix-os/L2-requirements/governance-requirements.md#L987) | [L11](../../../helix-os/L11-acceptance/governance-acceptance.md#L581) | `MPR-RC-HELIXOS-L2-035-001` |
| OS | [HELIXOS-L2-036：Retrofit preflightのticket/plan接続（単体候補、version_target: 1.0）](../../../helix-os/L2-requirements/governance-requirements.md#L1033) | [L11](../../../helix-os/L11-acceptance/governance-acceptance.md#L620) | `MPR-RC-HELIXOS-L2-036-001` |
| OS | [HELIXOS-L2-037：週次drift・技術負債観測から既存ticket候補への引継ぎ（接続候補、version_target 1.0）](../../../helix-os/L2-requirements/governance-requirements.md#L1075) | [L11](../../../helix-os/L11-acceptance/governance-acceptance.md#L652) | `MPR-RC-HELIXOS-L2-037-001` |
| SECURITY | [HELIXSECURITY-L2-029：第三者runtimeへの委譲データと訓練利用条件（単体追補候補、1.0）](../../../helix-security/L2-requirements/security-requirements.md#L405) | [L11](../../../helix-security/L11-acceptance/security-acceptance.md#L89) | `MPR-RC-HELIXSECURITY-L2-029-002` |
| SECURITY | [HELIXSECURITY-L2-030：agentic機能の自動適用範囲を広げるときの確認（単体追補候補、1.0）](../../../helix-security/L2-requirements/security-requirements.md#L417) | [L11](../../../helix-security/L11-acceptance/security-acceptance.md#L97) | `MPR-RC-HELIXSECURITY-L2-030-001` |
| SECURITY | [HELIXSECURITY-L2-031：追加worker runtimeのproposal-only・隔離境界（単体追補候補、1.0）](../../../helix-security/L2-requirements/security-requirements.md#L427) | [L11](../../../helix-security/L11-acceptance/security-acceptance.md#L104) | `MPR-RC-HELIXSECURITY-L2-031-001` |

一覧の25件は後続の局所候補であり、採用・保留・不採用の判断をまだ受けていない。候補の意味と`version_target`は各L2/L11本文、入力原文と被覆範囲は各`coverage_receipt_ref`で確認する。原文の意味変更・retireを選ぶ場合はその対象source・revision・理由・影響を付けてPO判断へ出す。判断後も実装・受入実行とは別である。

この一覧は手順6の採否対象を失わないための監査であり、採否欄を推測で埋めない。

## 後続差分：#2238・#2241統合後の追加候補2件

下記2件は基準main後に追加され、現在の生存registerに登録された候補である。PRのmerge、候補本文、L11、receipt、registerは採択や人間decisionを生成しない。両coverage receiptの`authority_effect`は`none`で、候補状態も`unadopted`と記録されている。

| 機構 | 候補・L2本文 | 対のL11 | 生存register revision・coverage receipt |
|---|---|---|---|
| HARNESS | [HARNESS-L2-042：Design Refactor判定とepisode分離（⑤のunit候補、version_target: 1.0）](../../../helix-harness/L2-requirements/product-requirements.md#L970) | [L11受入候補](../../../helix-harness/L11-acceptance/product-acceptance.md#L707) | `MPR-RC-HARNESS-L2-042-001`；`harness-refactor-episode-coverage-receipt-2026-09-28.json#HARNESS-L2-042`（#2241、merge `945a30bebe20e66097125d27aec5931b8b95cc0c`） |
| OS | [HELIXOS-L2-038：Layer ledger writer・snapshot・proposal append（単体候補、version_target: 1.0）](../../../helix-os/L2-requirements/governance-requirements.md#L1096) | [L11受入候補](../../../helix-os/L11-acceptance/governance-acceptance.md#L671) | `MPR-RC-HELIXOS-L2-038-001`；`os-layer-ledger-writer-coverage-receipt-2026-09-28.json#HELIXOS-L2-038`（#2238、merge `bf1c30cec0e08919c3624e5172ac9fdc8632af2c`） |

HARNESS-L2-042のreceiptは旧v1.3 §4.2 L119の異なる2 source revisionを別atomとして保持し、Performance Refactor条件は採択済みL2/L11-016を参照するsplitを記録する。HELIXOS-L2-038のreceiptは旧HIL-FR-46/47のwriter・snapshot・proposal保存部分をOS候補として分け、HARNESS側の意味契約候補とsource holdingを残す範囲を記録する。いずれも旧source全体の正式後継、実装、受入実行を確定しない。

## 後続訂正：HARNESS-L2-039のUX証拠条件

初版25件の基準表は登録`MPR-RC-HARNESS-L2-039-002`を保持する。旧v1.3 §10 L650とbaseline L631の同文別revisionを候補039へ追補した後の生存registerは`MPR-RC-HARNESS-L2-039-003`であり、r3 coverage receiptは24 revision atomsを局所対象とする。対L11もUX完成主張時の7軸current evidence欠落・stale拒否を追補した。候補039は引き続き未採択で、27件の総数は変わらない。
