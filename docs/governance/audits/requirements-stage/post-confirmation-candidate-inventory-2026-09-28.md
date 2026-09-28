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

旧HIL-FR-55のTemplate Example Calibratorの意味条件を、[HARNESS-L2-043](../../../helix-harness/L2-requirements/product-requirements.md#L986)と[対L11](../../../helix-harness/L11-acceptance/product-acceptance.md#L728)へ単体候補として再導出した。初回登録`MPR-RC-HARNESS-L2-043-001`を保持し、所属の差分とPO選択欄を明示した生存訂正revisionは`MPR-RC-HARNESS-L2-043-002`である。[coverage receipt](../requirement-registration/harness-template-example-coverage-receipt-2026-09-28.json)は旧原文1行の局所無損失を示す。候補は未採択であり、初版25件の履歴と#2238/#2241後の27件の履歴を変更しない。043を追加した時点の判断集合は28件だった。

## 後続追加：HARNESS-L2-044

| 機構 | 候補・L2本文 | 対のL11 | 生存register revision・coverage receipt |
|---|---|---|---|
| HARNESS | [HARNESS-L2-044：design obligation portfolioの契約coverage（単体能力候補、version_target: 1.0）](../../../helix-harness/L2-requirements/product-requirements.md#L1002) | [L11受入候補](../../../helix-harness/L11-acceptance/product-acceptance.md#L740) | `MPR-RC-HARNESS-L2-044-001`；`harness-contract-portfolio-coverage-receipt-2026-09-28.json#HARNESS-L2-044` |

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

## 後続草稿：HELIXOS-L2-045（判断集合43候補）

| 機構 | 候補・L2本文 | 対のL11 | 生存register revision・coverage receipt |
|---|---|---|---|
| OS | [HELIXOS-L2-045：各機構の検証・test・検出基盤readiness一覧（単体候補）](../../../helix-os/L2-requirements/governance-requirements.md#helixos-l2-045) | [L11受入候補](../../../helix-os/L11-acceptance/governance-acceptance.md#helixos-l2-045) | `MPR-RC-HELIXOS-L2-045-001`; `os-fr-l1-35-readiness-coverage-receipt-2026-09-28.json` |

旧confirmed175のFR-L1-35 archive atom 1件をcandidate inputとして対応づける。旧3区分の意味だけを保持し、対象集合はOS-L1-002の適用対象として選択された範囲に限定する候補。現行機構群・将来Web・version targetを確定しない。OSへのrehome/owner移管と採択は未決。PO packetはversion・対象機構集合・owner入力が未決の間、旧HARNESS source holdingと045候補を生存させsource atomを保持するB（保留）を推奨するが、選択ではない。AはOSへのowner rehomeとversion・対象機構集合の明示を伴う045採択、Cは対象source revision・理由・影響を明示した置換/retireである。version target・対象機構集合・owner dispositionを対象revisionでPOが決める必要がある。候補inputのno_lossはsource mapping範囲のみでsemantic successorや旧holding解消を示さない。既採択OS-L1-002/OS-L2/L11-016への接続を保ち、016のgeneral stateを再定義しない。BR-06/UX-02のdashboard、専用UI、realtime表示は含めない。別revision `V13-BASE-6FAB-L0638`（`MPR-SH-V13-BASELINE-001`）は別atomとして保留し、混合しない。PO packetは同一ファイルで43候補、basis main `249b1f648ce8ece4c6de82917910a752fa94a449`へ追随。


## 後続候補：HELIXOS-L2-046（判断集合44候補）

| 機構 | 候補・L2本文 | 対のL11 | 生存register revision・coverage receipt |
|---|---|---|---|
| OS | [HELIXOS-L2-046：dispatchからmergeまでのauthority・HEAD・scope連続性（connection候補、version_target: 1.0）](../../../helix-os/L2-requirements/governance-requirements.md#helixos-l2-046) | [L11受入候補](../../../helix-os/L11-acceptance/governance-acceptance.md#helixos-l2-046) | `MPR-RC-HELIXOS-L2-046-001`; `helixos-rfa-scope-coverage-receipt-2026-09-28.json` |

旧`LEGACY-CAND-LINE-003612`のRFA-AC-16 acceptance row（`LEGACY-ASSET-00C7DF9250F8A9A25B24`、archive file SHA-256 `c3f62478904e620eced270996360274e2840f9d94eca117d838d0e6dfeda7a86`、line SHA-256 `bafb2bae38d5e4363a90e58405e44e1e4544e85adfaa2b318bef2425a873065c`）一行だけをHELIXOS-L2/L11-046へ未採択候補として対応づける。#2268のcondition overlayで同じ行は条件として再確認され、旧snapshot上のexplanation分類を意味closureの根拠にしない。

既存GitHub運用モデルにあるPR作成・独立review・Ready・exact base/content HEAD・stale・merge admission、OS-004/007/008/010/011が個別に持つassignment・authority・証拠・CI・推進／統合計画を再定義しない。限定残差はこれらの段階間で同じ対象authority/HEAD/scopeを照合し、docs path exemption、exploratory mergeの実装許可化、required skipを拒否するL2/L11接続oracleである。specific required list、CI、追加承認、skip機構は導入しない。RFA-AC-16一行のみの局所candidate inputであり、旧RFA、旧runtime、その他旧sourceのclosureは主張しない。source holding `MPR-SH-CANDIDATE-003`は生存する。A＝限定候補を採択（推奨）、B＝保留、C＝対象revision・理由・影響を付して意味変更／retire。いずれも未選択。

## 後続候補：HELIXLABO-L2-067（#2270後、判断集合45候補）

| 機構 | 候補・L2本文 | 対のL11 | 生存register revision・coverage receipt |
|---|---|---|---|
| LABO | [HELIXLABO-L2-067：初回eligible candidateとAttempt内修復の観測（単体追補候補、1.0）](../../../helix-labo/L2-requirements/labo-requirements.md#helixlabo-l2-067) | [L11受入候補](../../../helix-labo/L11-acceptance/labo-acceptance.md#helixlabo-l2-067) | `MPR-RC-HELIXLABO-L2-067-001`; `labo-firstpass-attempt-repair-coverage-receipt-2026-09-28.json#HELIXLABO-L2-067` |

旧`LEGACY-CAND-LINE-001656`（archive execution-ticket-requirements.md:399）第3文をfirst-eligible境界／repair-round visibility／総Attempt countの3 subatomへ分け、前2件だけをcandidate inputとする。総Attempt count subatomは`MPR-SH-CANDIDATE-003`へpending保全し、067では算出しない。source holdingは生存し、同一行のtelemetry列挙・silent-rename条件、隣接行、旧candidate全体のclosureは主張しない。source/file/line SHA、selected/pending subatom境界、candidate digestおよびL11 digestはsource-lines、coverage receipt、registerへ固定する。

旧source S3はfirst-passの「初回」を最初のeligible candidateとするが、未採択LABO-065の`first_pass`は最初のAttemptの受入oracle結果であり、candidate境界とtask Attempt境界で定義が異なる。両候補が将来採択されても二指標は並立し、旧source定義に沿うのは067の`first_eligible_candidate_result`だけで、065の`first_pass`と同一化・代替・合算しない。採択済みLABO-059の品質・比較・費用意味と現行065本文は変更せず、067の`same_attempt_repair_round_count`も別grainで、総Attempt countを算出せず、065の採択を依存条件としない。OS-L2-014への旧source relationは確認したが、記録上のmeaning coverageはunknownであり、段階構成責務はLABO task telemetryを閉じない。候補採否のPO判断packetはA＝067 exact L2/L11のみ採択を推奨する。B＝source holdingと候補を保留、C＝対象subatom・revision・理由・影響付きの意味変更/retire。`internal_PO_choice`は未決（null）、A/B/Cは未選択で、推奨はPO判断を意味しない。これとは別の未決`definition_alignment`次元ではD1＝065/067を別定義の指標として並立（推奨）、D2＝065を旧定義へ寄せる別revisionについてPO判断、D3＝旧定義を対象revisionで理由・影響付きretireを選ぶが、067 exact revisionの採択Aとは同時選択不可で、A採択後のretireには067別revisionまたはretireの別PO判断が要る。D1なら両候補採択時にも旧source定義に沿うのは067側だけである。D1/D2/D3も未選択で、候補採否を決めない。どの選択肢も実験・資格試験・Worker割当・実装許可を生成しない。

## 後続候補：HELIXLABO-L2-068（#2271後）

| 機構 | 候補・L2本文 | 対のL11 | 生存register revision・coverage receipt |
|---|---|---|---|
| LABO | [HELIXLABO-L2-068：Worker Attempt countの観測（単体追補候補、1.0）](../../../helix-labo/L2-requirements/labo-requirements.md#helixlabo-l2-068) | [L11受入候補](../../../helix-labo/L11-acceptance/labo-acceptance.md#helixlabo-l2-068) | `MPR-RC-HELIXLABO-L2-068-001`; `labo-attempt-count-coverage-receipt-2026-09-28.json#HELIXLABO-L2-068` |

旧`LEGACY-CAND-LINE-001656`第3文S3C（総Attempt count）だけをcandidate inputとする1 atomの局所receipt。S3A/S3Bと#2271のreceiptは保持し、source line全体のclosureは主張しない。OSが明示範囲の全Attempt記録を証拠づけられる時だけdistinct identityを数え、完全性不明はunknownとする。Attempt identityのない実行前拒否intakeは対象外。065の`retry_count`や067のrepair roundから換算しない。候補は`registered_proposal` / `authority_effect:none`、PO未決・未採択。


## 後続訂正：HELIXSECURITY-L2-033 credential境界（判断集合46候補）

現行register末端は`MPR-RC-HELIXSECURITY-L2-033-002`で、初回`-001`をsupersedeする。追加したL2/L11の資格情報境界は、raw secret／credential値またはsecret／機密内容を外部Workerへ渡すtaskをdenyし、値・内容を露出させず既存L2-005の限定credential-use capabilityを用いる認証付きoperationは、既存L2-008/007と該当L2-006の条件内で一律denyしない。旧HR-FR-P2-05の「secret task deny」がこのoperationを含むかは未定義のため、全credential-use taskの禁止はL2-005の採択済み対象revisionへの意味変更としてPO判断へ残す。A（訂正候補採択、推奨）／B（source holdingへ保留）／C（対象revision・理由・影響付き意味変更／retire）は未選択。2 source atom・source-lines・holdingは不変、候補集合は46件のまま。訂正receiptは[`security-v13-worker-context-coverage-receipt-2026-09-28-r2.json`](../requirement-registration/security-v13-worker-context-coverage-receipt-2026-09-28-r2.json)。


## 後続追加：HARNESS-L2-047（現行判断集合47候補）

旧HIL-BR-09/30・HIL-FR-59/60の4 source lineを、[HARNESS-L2-047](../../../helix-harness/L2-requirements/product-requirements.md#harness-l2-047)と[対L11](../../../helix-harness/L11-acceptance/product-acceptance.md#harness-l2-047)へHARNESS配置A候補として限定再導出した。旧source line SHA、candidate/acceptance digest、対象4 atomは[coverage receipt](../requirement-registration/harness-specialist-contract-coverage-receipt-2026-09-29.json)と[source-lines](../requirement-registration/harness-specialist-contract-source-lines-2026-09-29.jsonl)に記録する。登録`MPR-RC-HARNESS-L2-047-001`は`registered_proposal` / `authority_effect:none`。PO未決・未採択。比較案BのINTELLIGENCE配置をPO packetへ保持し、B選択時は本HARNESS配置案から後継を確定しない。入力は4 semantic line atomsのみであり、別holdingのIR identities、残るsemantic lines、旧source全体のclosureを主張しない。

## HELIXCONNECT-L2-008（#2280後の候補、判断集合48）

| 機構 | 候補 | L11 | 登録・receipt |
|---|---|---|---|
| CONNECT | `HELIXCONNECT-L2-008` MCP profile catalogとtyped descriptor供給（unit、1.0、未採択） | `HELIXCONNECT-L11-008` | `MPR-RC-HELIXCONNECT-L2-008-002（-001のdigest訂正revision）`; `connect-v13-hyb-002-profile-supply-coverage-receipt-2026-09-29.json` |

HYB-002の3 clauseをarchive/baseline別revisionの6 atomとしてこの候補へ対応。既存SECURITY-034候補の6 atomと合わせ12 lineage atom。6/12を候補経路へ割り当てたが、採択・意味closureは0/12。`MPR-SH-SUPPLEMENTARY-003` と `MPR-SH-V13-BASELINE-001` は生存。AのCONNECT供給／SECURITY policy分担を推奨案として起草したがPO未選択。Bの全供給SECURITY所有は責務境界の意味変更候補。SECURITY-034の採択は前提としない。

## O1・O2追加候補（判断集合52候補）

| 機構 | 候補L2本文 | 対のL11 | 生存register revision・coverage receipt |
|---|---|---|---|
| OS | [HELIXOS-L2-047：理由付きTicket返却・再発行](../../../helix-os/L2-requirements/governance-requirements.md#helixos-l2-047) | [受入候補](../../../helix-os/L11-acceptance/governance-acceptance.md#helixos-l2-047) | `MPR-RC-HELIXOS-L2-047-001`; `ops-o1-o2-coverage-receipt-2026-09-29.json#HELIXOS-L2-047` |
| OS | [HELIXOS-L2-048：返却・検証不成立feedbackの還流接続](../../../helix-os/L2-requirements/governance-requirements.md#helixos-l2-048) | [受入候補](../../../helix-os/L11-acceptance/governance-acceptance.md#helixos-l2-048) | `MPR-RC-HELIXOS-L2-048-001`; `ops-o1-o2-coverage-receipt-2026-09-29.json#HELIXOS-L2-048` |
| LABO | [HELIXLABO-L2-069：Ticket返却・再発行後評価](../../../helix-labo/L2-requirements/labo-requirements.md#helixlabo-l2-069) | [受入候補](../../../helix-labo/L11-acceptance/labo-acceptance.md#helixlabo-l2-069) | `MPR-RC-HELIXLABO-L2-069-001`; `ops-o1-o2-coverage-receipt-2026-09-29.json#HELIXLABO-L2-069` |
| INTELLIGENCE | [HELIXINTELLIGENCE-L2-074：評価済み返却feedbackの配置案入力](../../../helix-intelligence/L2-requirements/intelligence-requirements.md#helixintelligence-l2-074) | [受入候補](../../../helix-intelligence/L11-acceptance/intelligence-acceptance.md#helixintelligence-l2-074) | `MPR-RC-HELIXINTELLIGENCE-L2-074-001`; `ops-o1-o2-coverage-receipt-2026-09-29.json#HELIXINTELLIGENCE-L2-074` |

4候補は`registered_proposal`／`authority_effect:none`としてPO判断待ちに置く。旧Ticket／feedback sourceの選択節と、新しい返却率・理由分類・機構間還流の提案を区別し、選択外の旧条件をsource holdingへ残す。元のローカル依頼文の「PO意図」欄はClaudeによる要約であり、PO一次発話・対象revision付き採択の証拠ではない。[判断packet](post-confirmation-25-po-decision-packet-2026-09-28.md#o1o2追加候補ticket返却と運用feedback判断集合52候補)にA/B/Cの選択肢を置く。採択・実装許可・運転開始は本inventoryから生成しない。

## O1候補訂正（#2286再レビュー）

上表の `HELIXOS-L2-047` は履歴表示であり、現行登録は `MPR-RC-HELIXOS-L2-047-002`。PO原文と未確認の依存解釈は[判断packet](post-confirmation-25-po-decision-packet-2026-09-28.md)を参照。訂正receiptは `ops-o1-o2-coverage-receipt-2026-09-29-r2.json#HELIXOS-L2-047`、選択5 atomのpartial。採否・依存解釈は未選択。

## O1候補の現行訂正（#2286再レビュー3）

上の047履歴を `MPR-RC-HELIXOS-L2-047-004` で訂正。PO確認回答、対L11、r4 receipt、未採択状態は[判断packet](post-confirmation-25-po-decision-packet-2026-09-28.md)を参照。

## O3・O5追加候補（未採択）

- [HELIXOS-L2-049：Worker稼働観測と低干渉task割当](../../../helix-os/L2-requirements/governance-requirements.md#helixos-l2-049)／[対L11](../../../helix-os/L11-acceptance/governance-acceptance.md#helixos-l2-049)：`MPR-RC-HELIXOS-L2-049-003`（-002を訂正）、[receipt r4](../requirement-registration/helixos-worker-utilization-coverage-receipt-2026-09-29-r4.json)。L11訂正後digest `sha256:d5a3a0c361a6d0056a8c608f5230a52d206c000d7ac81ff969aeaba30ad4d810`。選択atomのみno_loss、残余はholding。PO条件付き承認済み。訂正PR merge後に採択revisionを判断記録へ固定する。
- [HELIXOS-L2-050：独立review capacityの観測と調整](../../../helix-os/L2-requirements/governance-requirements.md#helixos-l2-050)／[対L11](../../../helix-os/L11-acceptance/governance-acceptance.md#helixos-l2-050)：`MPR-RC-HELIXOS-L2-050-003`（-002を訂正）、[receipt r3](../requirement-registration/helixos-reviewer-capacity-coverage-receipt-2026-09-29-r3.json)。L11訂正後digest `sha256:cf4866f2d8beee83eda5389e3b98100cd37cbd609f7c797617b499c1381bfafb`。選択atomのみno_loss、残余はholding。PO条件付き承認済み。訂正PR merge後に採択revisionを判断記録へ固定する。

## O4追加候補（未採択）

- [HELIXOS-L2-051：task単位の作成／review配置](../../../helix-os/L2-requirements/governance-requirements.md#helixos-l2-051)／[対L11](../../../helix-os/L11-acceptance/governance-acceptance.md#helixos-l2-051)：`MPR-RC-HELIXOS-L2-051-002`（-001を訂正）、[receipt r2](../requirement-registration/ops-o4-coverage-receipt-2026-09-29-r2.json)。旧L3 6行はMPR-SH-OPS-LEGACY-L3-001へ原文保全。PO採否未選択。

## INTELLIGENCE-074の現行登録訂正

`MPR-RC-HELIXINTELLIGENCE-L2-074-002`、[空入力集合receipt](../requirement-registration/ops-o1-o2-intelligence-074-empty-coverage-receipt-2026-09-29-r2.json)。旧source意味の被覆は主張しない。

## O6追加候補（未採択）

- [HELIXOS-L2-052：merge後cleanupとbase drift](../../../helix-os/L2-requirements/governance-requirements.md#helixos-l2-052)／[対L11](../../../helix-os/L11-acceptance/governance-acceptance.md#helixos-l2-052)：`MPR-RC-HELIXOS-L2-052-001`、[bounded receipt](../requirement-registration/ops-o6-coverage-receipt-2026-09-29.json)。旧CLAUDE:201とMIC:66 line/remainderは`MPR-SH-OPS-LEGACY-L3-001`へ、旧CI/DB receiptは`MPR-SH-CANDIDATE-003`へ保全。PO採否未選択。
## HELIXCONNECT-L2-009（O7、判断集合57候補）

| 機構 | 候補・L2本文 | 対のL11 | 生存register revision・coverage receipt |
|---|---|---|---|
| CONNECT | [HELIXCONNECT-L2-009：接続方向・実行順序属性とfeedback relation（connection候補、version_target: 1.0）](../../../helix-connect/L2-requirements/connect-requirements.md#helixconnect-l2-009) | [L11受入候補](../../../helix-connect/L11-acceptance/connect-acceptance.md#helixconnect-l11-009) | `MPR-RC-HELIXCONNECT-L2-009-002`（-001を訂正）; `connect-o7-direction-feedback-coverage-receipt-2026-09-29-r2.json` |

候補は新規案である。旧archiveのL3 requirements／governance candidates／L1 requirementsを指定queryで検索し、18件のlexical matchesを読み分けた。UWJ-FR-006の一般workflow loop terminal、HIL-NFR-04の一般上限・stop/checkpoint、MIC-R-02のserial merge後のbase drift再判定等はreference-onlyで、CONNECT relation型の根拠にしない。directionは現行CONNECT-L2-001がすでに接続identityへ含め、retry上限・trace・partial failureも既存CONNECT requirementsが所有する。対象source行・asset・SHA、検索command/result digest/限界、candidate digestは[source-lines](../requirement-registration/connect-o7-direction-feedback-source-lines-2026-09-29.jsonl)と[初回coverage receipt](../requirement-registration/connect-o7-direction-feedback-coverage-receipt-2026-09-29.json)に記録した。訂正後の対L11 digestは`sha256:07e639a165d02d32deb8ae820418aadc9893837b5d3cab5b8387287cd3283ca1`（receipt r2）。PO条件訂正のmerge前で採択状態は変えない。archive-wide absenceや旧意味closureを主張しない。A＝direction/order属性＋typed feedback＋既存policy参照によるbounded loop（推奨）、B＝feedback/bidirectional/serial/parallelを4 kind化、C＝serial/parallelをHARNESS/OSに残す等のscope分割。POはAを条件付き承認済み。登録は訂正revision `MPR-RC-HELIXCONNECT-L2-009-002`のmergeまで`registered_proposal` / `authority_effect:none`。O7を同一のcanonical PO decision packetへ追加した（JSON basis `1aa41a8ba6e750d23a46b832d1513738e84894bb`、49候補）。後続候補統合時は最新mainでcountとbasis revisionを再計算する。


## O9追加候補（未採択、判断集合59）

- [HARNESS-L2-048：対象と役割型による命名・安全なrename](../../../helix-harness/L2-requirements/product-requirements.md#harness-l2-048)／[対L11](../../../helix-harness/L11-acceptance/product-acceptance.md#L793)：`MPR-RC-HARNESS-L2-048-001`、[17 selected clause spans; remainders held in MPR-SH-O9-NAMING-001](../requirement-registration/o9-harness-coverage-receipt-2026-09-29.json)。O9原文はversion targetを指定しないため未設定。
- [HELIXBRAIN-L2-031：役割型の再利用知識](../../../helix-brain/L2-requirements/brain-requirements.md#helixbrain-l2-031)／[対L11](../../../helix-brain/L11-acceptance/brain-acceptance.md#L120)：`MPR-RC-HELIXBRAIN-L2-031-001`、[empty-input receipt](../requirement-registration/o9-brain-coverage-receipt-2026-09-29.json)。BRAIN L1-derived new proposalでありversion target未設定。

両候補のowner・scope・source meaning・adoption・version axesは別々にPO未選択として記録した。source snapshotを含むO9根拠とexact line accountingは[packet](post-confirmation-25-po-decision-packet-2026-09-28.md#o9追加候補対象と役割型による命名再利用語彙判断集合59候補)およびreceiptを参照。


## O10追加候補（未採択、判断集合60候補／60 axis records）

- [HARNESS-L2-049：画面prototypeの表示計測・検査精度・文言量候補](../../../helix-harness/L2-requirements/product-requirements.md#harness-l2-049)／[対L11](../../../helix-harness/L11-acceptance/product-acceptance.md#harness-l11-049)：`MPR-RC-HARNESS-L2-049-002`（`-001`の訂正）、[r2 coverage receipt](../requirement-registration/o10-visual-design-harness-coverage-receipt-2026-09-29-r2.json)。旧VDH-FR-011の1 source spanを選択し、他24 spansを`MPR-SH-VDH-O10-001`へ保持。O10 task basis由来のprecision fixtures・profile-based concise-copyは新規案。049単独入力はrendered prototype/profile/oracle/known fixturesであり、現行039はPattern/CORE/profile制約下prototype generationを定めていない。049はmeasurement-only。construction scopeはA=将来の049 revision／B=別candidate／C=deferの未選択PO frameに記録し、VDH-FR-005 PATTERNはholdingに保持。semantic ID・lifecycle stateも049のscope外。後続版はreal-user/data UX、drift、analytics。PO未選択。
