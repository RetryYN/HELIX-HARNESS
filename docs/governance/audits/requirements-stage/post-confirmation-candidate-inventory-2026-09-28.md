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
| OS | [HELIXOS-L2-030：HARNESS packageの生成・consumer検証・段階配布（単体候補）](../../../helix-os/L2-requirements/governance-requirements.md#L879) | [L11](../../../helix-os/L11-acceptance/governance-acceptance.md#L480) | `MPR-RC-HELIXOS-L2-030-003` |
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

## 後続追加：HARNESS-L2-043

旧HIL-FR-55のTemplate Example Calibratorの意味条件を、[HARNESS-L2-043](../../../helix-harness/L2-requirements/product-requirements.md#L986)と[対L11](../../../helix-harness/L11-acceptance/product-acceptance.md#L723)へ単体候補として再導出した。初回登録`MPR-RC-HARNESS-L2-043-001`を保持し、所属の差分とPO選択欄を明示した生存訂正revisionは`MPR-RC-HARNESS-L2-043-002`である。[coverage receipt](../requirement-registration/harness-template-example-coverage-receipt-2026-09-28.json)は旧原文1行の局所無損失を示す。候補は未採択であり、初版25件の履歴と#2238/#2241後の27件の履歴を変更しない。043を追加した時点の判断集合は28件だった。

## 後続追加：HARNESS-L2-044

| 機構 | 候補・L2本文 | 対のL11 | 生存register revision・coverage receipt |
|---|---|---|---|
| HARNESS | [HARNESS-L2-044：design obligation portfolioの契約coverage（単体能力候補、version_target: 1.0）](../../../helix-harness/L2-requirements/product-requirements.md#L1002) | [L11受入候補](../../../helix-harness/L11-acceptance/product-acceptance.md#L735) | `MPR-RC-HARNESS-L2-044-001`；`harness-contract-portfolio-coverage-receipt-2026-09-28.json#HARNESS-L2-044` |

旧HIL-FR-54のarchive L1要求表144行1 atomのみをreceipt対象とする。旧packet row 1008は汎用「部品」で、個別component配置は未決。FR55 atomとIR全体を含むsource holdingはactive `MPR-SH-PORTFOLIO-FIXTURE-002`および`MPR-SH-IR-003`へ保留し、044は旧2 atom holding全体の被覆を主張しない。候補はPO未採択、authority effect none。

## 後続追加：HELIXSECURITY-L2-032（#2255後、判断集合36候補）

| 機構 | 候補・L2本文 | 対のL11 | 生存register revision・coverage receipt |
|---|---|---|---|
| SECURITY | [HELIXSECURITY-L2-032：Worker runtimeにおけるpermanent bypass denyの優先順位](../../../helix-security/L2-requirements/security-requirements.md#helixsecurity-l2-032) | [L11受入候補](../../../helix-security/L11-acceptance/security-acceptance.md#helixsecurity-l2-032) | `MPR-RC-HELIXSECURITY-L2-032-001`; `security-v13-worker-bypass-coverage-receipt-2026-09-28.json#HELIXSECURITY-L2-032` |

候補はPO未決・未採択で`authority_effect:none`。旧v1.3 §4.10 HR-FR-P2-07の一行のみを対象とし、旧source captureと他のsource-holding bytesを変更しない。HELIXSECURITY-L2-032追加時の36候補packetは[36候補の判断packet](post-confirmation-25-po-decision-packet-2026-09-28.md)と対応するJSONに束縛する。


## 後続追加：HARNESS-L2-046（現行判断集合37候補）

旧v1.3 §4.4 L259の二文をFull V段階freeze/検証とProduction Scrum slice/backfill条件の別sentence spanに分け、§10 L647を一部重複する要約spanとして[HARNESS-L2-046](../../../helix-harness/L2-requirements/product-requirements.md#harness-l2-046)と[対L11](../../../helix-harness/L11-acceptance/product-acceptance.md#harness-l2-046)へ限定再導出した。source-linesとcoverage receiptは旧archiveおよび6fabd125基準revisionの6 span/4 physical lineを個別保持する。L647は第3独立条件に加算しない。

登録`MPR-RC-HARNESS-L2-046-001`は`registered_proposal` / `authority_effect:none`、PO未採択。Full Vは適用するL1〜L5層で段階freezeし列挙条件を検証する。Scrum slice/backfill/checkpoint/SR4はProduction Scrumまたは既存L2-002/003に従うScrum適用部分だけに限る。2026-09-25 PO判断の方式定義・合成許可を維持し、source holding二集合および固定captureは変更しない。HARNESS-L2-046追加時の37候補packetは[37候補の判断packet](post-confirmation-25-po-decision-packet-2026-09-28.md)と対応JSONに束縛する。


## 後続追加：#2257後のHELIXOS-L2-042（現行判断集合38候補）

旧v1.3 §4.10 HR-FR-P2-08のarchive line 431（REQSRC-SUP-00333、source holding `MPR-SH-SUPPLEMENTARY-003`）1 atomを、[HELIXOS-L2-042](../../../helix-os/L2-requirements/governance-requirements.md#helixos-l2-042)と[対L11](../../../helix-os/L11-acceptance/governance-acceptance.md#helixos-l2-042)へ、strict schema／digest defaultと緩和時の対象・理由・期限・再検証receiptの意味保持候補として局所対応させた。完全同文のbaseline atom `V13-BASE-6FAB-L0412`（6fabd125 line 412）は別revision・別atomとして`MPR-SH-V13-BASELINE-001`へ保全し、archive atomとの同一視・合算はしない。`docs/governance/audits/requirement-registration/os-v13-worker-output-coverage-receipt-2026-09-28.json`および`os-v13-worker-output-source-lines-2026-09-28.jsonl`がsource/candidate digestsを固定する。登録`MPR-RC-HELIXOS-L2-042-001`は`registered_proposal` / `authority_effect:none`。PO未決・未採択。

A＝exact L2/L11-042の限定採択（推奨）、B＝原atomを保留、C＝source revision・理由・影響を特定した意味変更/retire。OSは成果状態を既存assignmentへ束ね、HARNESS-L2-005のverification oracleとSECURITY-L2-007/008の既存authorityを維持する。旧schema/runtime/receiptの移植、候補採択、source holding解除、coverage closure、実装許可は主張しない。machine packetは#2257後main `34c1f48663bec1bcb7071b1889adb3c3a2e20e51`から38候補。


## 後続追加：#2258後のHELIXSECURITY-L2-033（現行判断集合39候補）

| 機構 | 候補・L2本文 | 対のL11 | 生存register revision・coverage receipt |
|---|---|---|---|
| SECURITY | [HELIXSECURITY-L2-033：外部AI Workerの実行文脈束縛と出力の非権威性](../../../helix-security/L2-requirements/security-requirements.md#helixsecurity-l2-033) | [L11受入候補](../../../helix-security/L11-acceptance/security-acceptance.md#helixsecurity-l2-033) | `MPR-RC-HELIXSECURITY-L2-033-001`; `security-v13-worker-context-coverage-receipt-2026-09-28.json` |

旧v1.3 §4.10 HR-FR-P2-05 archive line 428（`REQSRC-SUP-00330`）と6fabd125 baseline line 409の完全同文別revision atomを、両方candidate inputとして区別して保持する。起動前に現行descriptor・HEAD・authority/rule・OS task boundaryを同一dispatchへ束縛し、既存secret denyと出力の非権威性を適用する限定候補である。旧packet schema/runtime、L2-031の追加runtime専用条件の主Workerへの拡張、v1.3全体の被覆は主張しない。source-lines/receiptを追加記録し、両source holdingは未解消のまま。candidateは`registered_proposal` / `authority_effect:none`、PO未決・未採択。packet basis mainは`782a7320925a28d0c7b35ebc54b0ec7cc1329e7c`。

今回の同一packet追随で、既存HELIXOS-L2-042 JSONのarchive line 431 `source_reference_examples[].source_line_sha256`の重複接頭辞`sha256:sha256:`を`sha256:`へ直した。source atomとそのdigestは変えていない。


## 後続追加：#2259後のHELIXOS-L2-043（現行判断集合40候補）

旧v1.3 §4.10 HR-FR-P2-06 archive line 429（`REQSRC-SUP-00331`、holding `MPR-SH-SUPPLEMENTARY-003`）と6fabd125 baseline line 410（別revision・holding `MPR-SH-V13-BASELINE-001`）をtyped-event S1とNode-exclusive S2に分割した。`HELIXOS-L2-043`と対L11へのcandidate inputはS1の2 atomのみで、選択範囲のcoverageはno_loss、`unaccounted_atom_refs:[]`。archive/baseline S2の2 atomは`preserved_pending`としてPO判断へ保全し、source line/HR-FR-P2-06全体はpartialでno_loss/closureを主張しない。正確な原文・file/line/span SHAは`os-v13-p2-06-worker-delegation-source-lines-2026-09-28.jsonl`および`os-v13-p2-06-worker-delegation-coverage-receipt-2026-09-28.json`。登録`MPR-RC-HELIXOS-L2-043-001`は`registered_proposal` / `authority_effect:none`、PO未決。typed-event candidate Aを推奨。Node専有残差はA保持/B現行責務へ再導出/C理由付きretire/D保留、現時点ではDを推奨し、SECURITY/OS/Worker/canonical writerへの意味割当を先取りしない。判断packetは同一ファイルで40候補、basis main `fbfc6f8cf0554a092e794aa61778f319836927ee`へ追随。


## 後続草稿：HELIXOS-L2-044（判断集合41候補案）

旧v1.3 §4.6 HR-FR-HYB-006/HR-AC-HYB-006のarchive line 290（asset `LEGACY-ASSET-02319C2481B9E01698D5`、REQSRC-SUP-00217、holding `MPR-SH-SUPPLEMENTARY-003`）と6fabd125 baseline line 275（別revision・holding `MPR-SH-V13-BASELINE-001`）の同文から、「prose handoverだけの解決」span 2件だけを[HELIXOS-L2-044](../../../helix-os/L2-requirements/governance-requirements.md#helixos-l2-044)および対L11へ未採択候補として入力する。file SHA-256はarchive `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`／baseline `1eecfe3cbbbf1c61956b23ddbd2f28a5146233d0d0be15fddd8098998ed097e1`、両line SHA-256は`2125ab8a351eea42abeb00975c7ff99a80fed5fe914b5c84a50bf6ca4945b931`。他の各revision 3 spans（lifecycle/event-projection/SessionStart、未ack finding消失、source HEAD mismatch）は両source holdingへ保留。候補入力2 atomのみno_loss、source lines/HR-FR/AC condition全体はpartialでclosureを主張しない。source-lines/receiptは`os-v13-hyb-006-feedback-resolution-source-lines-2026-09-28.jsonl`と`os-v13-hyb-006-feedback-resolution-coverage-receipt-2026-09-28.json`。register草稿は`MPR-RC-HELIXOS-L2-044-001`、PO未決。

## 後続候補：HELIXSECURITY-L2-034

旧v1.3 HR-FR-HYB-002 archive line 286（REQSRC-SUP-00213）と6fabd125 baseline line 271を別revisionとして扱い、profile別credential/egress/tool capability fail-close、secret要求拒否、write可能probe拒否の6 selected spansをHELIXSECURITY-L2/L11-034へ未採択候補として再導出した。profile列挙/設定、typed safety/read-only-probe供給、未登録profile拒否の残り6 spansはsource holdingに保全し、旧2行全体のsemantic closureはpartial。詳細は[42候補PO packet](post-confirmation-25-po-decision-packet-2026-09-28.md#後続追加helixsecurity-l2-034判断集合42候補)、[source-lines](../requirement-registration/security-v13-hyb-002-profile-source-lines-2026-09-28.jsonl)、[coverage receipt](../requirement-registration/security-v13-hyb-002-profile-coverage-receipt-2026-09-28.json)を参照。登録`MPR-RC-HELIXSECURITY-L2-034-001`は`registered_proposal` / `authority_effect:none`、PO未決・未採択。CONNECTのprofile catalog供給・adapter ownershipをSECURITYへ移管しない。
