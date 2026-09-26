---
title: "HELIX-OSのプロジェクト群統制要求"
canonical_vmodel: L1-L12
canonical_layer: L2
canonical_pair: L11
layer: L2
kind: design
status: draft
freeze_blocking: true
created: 2026-09-14
updated: 2026-09-26
pair_artifact: docs/helix-os/L11-acceptance/governance-acceptance.md
parent_l1_candidate: docs/helix-os/L1-planning/system-intent.md
---

# HELIX-OSのプロジェクト群統制要求

2026-09-14のPO指示に基づく対象別の分離案。HELIX-OSは管理・統制、Worker、ログ、CI、継続・復旧の機能を所有する。改善の効果と退行の評価はHELIX-LABOが担う（2026-09-24 PO判断：「OSは推進機構、ラボは全体の改善研究機構」）。
HARNESSは提供プロダクトである。名称やフォルダの分離だけで個別要求の合意・実装・受入は成立しない。

sourceで採用済みだった要求意味は、そのsource authorityを保って[無損失carry-forward方針](../../governance/legacy-requirement-carry-forward-policy.md)に従って保持する。新世代targetへの配置は未承認である。
本書と参照crosswalkに残る「再採否」「不採用」「棄却」は、明示された旧owner、旧技術、旧CI、旧実装方式、
または元からcandidateだった項目にだけ適用する。原要求IDと要求意味を削除・縮退・candidate降格する意味には使わない。
OSは原要求からsuccessorへのtraceと未被覆atomを管理し、意味変更・縮退・retireを人間decisionなしに登録しない。
旧source集合を管理層の`registered_source_holding`へ先に仮登録する。要求PRのmerge前に、要求候補revision、対象product、入力source atom完全集合、HARNESS無損失被覆receipt、今回保持するatom、別の生存中仮登録へ残すatom、人間decision対象atomを`registered_proposal`へ仮登録する。未計上atom、stale、digest不一致、wrong product、仮登録欠落が一件でもあればmerge可能状態にしない。いずれの仮登録も要求採用や実装許可ではない。

HELIX-OSの目的は、HARNESSを含むHELIXプロジェクト群を管理・統制し、HARNESSを自身へ適用してHARNESSそのものを
改善し続けることにある。各product、HELIX自身、WEB-OSからの許可された運用結果も同じ改善機構へ接続する。
外部へ輸出するプロダクトはHARNESSであり、本要求でHELIX-OSの外販・配布を目的化しない。
HELIXOS-L2-005の改善還流は、観測→候補→採否→要求・設計変更→検証→再観測まで追跡する。
候補の生成件数やログの蓄積だけで改善達成とせず、採用した変更の効果と退行を確認する。

親は[HELIX-OS L1企画候補](../L1-planning/system-intent.md)である。現在は親ConceptとL1が未承認のため、
以下のrelationは接続案であり、承認済み導出ではない。

| L2要求 | 親L1候補 |
|---|---|
| HELIXOS-L2-001 | HELIXOS-L1-001／HELIXOS-L1-008 |
| HELIXOS-L2-002 | HELIXOS-L1-002／HELIXOS-L1-007／HELIXOS-L1-008 |
| HELIXOS-L2-003 | HELIXOS-L1-001 |
| HELIXOS-L2-004 | HELIXOS-L1-003 |
| HELIXOS-L2-005 | HELIXOS-L1-006 |
| HELIXOS-L2-006 | HELIXOS-L1-005／HELIXOS-L1-007 |
| HELIXOS-L2-007 | HELIXOS-L1-002／HELIXOS-L1-004／HELIXOS-L1-007／HELIXOS-L1-008 |
| HELIXOS-L2-008 | HELIXOS-L1-004 |
| HELIXOS-L2-009 | HELIXOS-L1-003／HELIXOS-L1-008 |
| HELIXOS-L2-010 | HELIXOS-L1-009 |
| HELIXOS-L2-011 | HELIXOS-L1-010 |
| HELIXOS-L2-012 | HELIXOS-L1-011 |
| HELIXOS-L2-013 | HELIXOS-L1-012 |

| ID | HELIX-OSに対する利用要求 | 主な移管元 | 確認する結果 |
|---|---|---|---|
| HELIXOS-L2-001 | プロジェクトごとの企画・要求正本・採否・合意revisionと担当責務を確認できる | HCV4-L2-001／002、HBR-P9 | GitHubの状態から要求を推定せず、何に対する要求かと判断の出所が分かる |
| HELIXOS-L2-002 | プロジェクト群の要求から作業・実装・検証・提供・運用まで追跡し、欠落と競合を把握できる。提供はリリースカンバン上の状態として追跡できる | HCV4-L2-002／003、HBR-P3／P9、2026-09-24 PO判断 | 未接続・未合意・未実装・未検証を区別し、部分成功で全体完了にならない |
| HELIXOS-L2-003 | 共通統制と各プロダクトの開発方式の選択を区別し、変更影響を対象範囲へ伝播できる | PO指摘、HCV4-L2-001／004／006、HBR-P0 | あるプロダクトの方式変更が他プロダクトや共通統制を暗黙に変えない |
| HELIXOS-L2-004 | Workerへ作業を割り当てて実行・回収し、優先度・予算・依存・レビュー能力の制約内で進行を統制できる | 常駐レーン・三社レーン要求、HBR-P1／P2、2026-09-24 PO判断 | 実行担当の交代で責務・未完義務・累積制約が失われず、自己承認や二重割当を防ぐ。担当は3つの機構と、作業の主体であるWorker（機構ではない）に分ける：割当てと進行統制はOS、割当て案はINTELLIGENCE（2026-09-25 PO判断「稼働はインテリジェンス」。2026-09-24判断ではBRAIN。案の材料は、LABOがHELIX-Benchで出したモデルクラスの水準。[2026-09-26 PO判断](../../governance/decisions/handoff-integration-po-decisions-2026-09-26.md)）、実行はWorker（2026-09-26 PO判断。旧Runner／Sandboxの実行の能力はWorkerへ移し、実行の制約はSECURITYが定めてWorkerの実行環境が強制する）、自己承認の防止と権限の制限はSECURITY |
| HELIXOS-L2-005 | HARNESS自身への適用を含む観測・失敗・改善候補を、出典と適用範囲を保持して登録し、還流先へ振り分けられる。観測と作業の結果はLABOへ渡し、LABOが返す改善の提案（Feedback）を登録し、還流先へ振り分け、採否の後にticketにして回す（OSはPMにあたり、LABOはPMOとして評価と提案を出す。[2026-09-26 PO判断](../../governance/decisions/handoff-integration-po-decisions-2026-09-26.md)）。改善の評価と研究はHELIX-LABOが担う（[HELIX-LABOの候補](../../helix-labo/candidates/improvement-research-requirements.md)、2026-09-25 PO判断） | HBR-P4／P7／P8、HCV4-L2-006、2026-09-24 PO判断、2026-09-25 PO判断 | 改善候補を出典と適用範囲付きで登録し、経験を正本へ勝手に昇格させず、還流先の欠落を検出できる |
| HELIXOS-L2-006 | HARNESSの提供版を、サービス①〜⑦の単位で、リリースカンバン上の状態を見て新規・既存プロジェクトへ導入し、更新・復旧できる | HBR-P6、柱要求§2.7、v1.3 HR-FR-HYB-008、2026-09-24 PO判断 | source・要求revision・artifactが辿れ、既存成果を壊さず導入できる |
| HELIXOS-L2-007 | Worker・判断・操作・検証のログと証拠を、Conceptの1.0土台（BASE-01）の共通形式で保存し、対象プロジェクトと要求revisionから参照できる | HBR-P7／P9、v1.3 HR-FR-HYB-006、2026-09-24 PO判断 | 欠落・重複・古い証拠を識別し、ログの存在だけで承認・完了にしない |
| HELIXOS-L2-008 | HARNESSのコアとticketから導いた検証義務と統合計画に従い、検収がその変更に必要なCIを動的に合成し（CIの規則はHARNESS、組み立てと運転はOS）、隔離して実行・監視・回収・再開できる | HBR-P6、v1.3 HR-FR-HYB-010、新世代CI要求候補、2026-09-24 PO判断 | 上流意味reviewと下流CIを分け、未実行・失敗・中断・staleを区別し、旧CI greenで新世代未実行やreview・承認を代替しない |
| HELIXOS-L2-009 | 中断・担当交代・障害後に、許可範囲内で継続・復旧できる | HBR-P1／P2、HNFR-P5／P8 | 累積予算・期限・未完義務を保持し、二重実行や範囲外操作を防ぐ |
| HELIXOS-L2-010 | 管理・推進・検収を別責務として編成し、同じticketと因果関係を保ちながら双方向に調整できる。推進は案件ごとに必要な工程を動的ワークフローとして組み立てる。1.0の組み立ては、HARNESSが定めた工程の部品を規則どおりに組み合わせ、途中結果で差し戻すことに限る。部品にない流れまでINTELLIGENCEの判断で組み立てて再計画するのは、Conceptの4.0である | HELIX-OS編成案 §1／2／6、2026-09-15 PO指示、2026-09-24 PO判断、[2026-09-26 PO判断](../../governance/decisions/handoff-integration-po-decisions-2026-09-26.md) | 管理はコアの接続状況（trace、依存、stale）を登録し、目的・要求・制約・許可・優先度・依存・資源・予算・期限・停止・HARNESS版と接続状況を推進へ渡す。推進はHARNESSのnormative工程語彙・順序を参照し、operational tag、mapping、composition、workflow instance生成規則を所有してticketと成果を生成する。管理は登録・統制し、検収はHARNESS contractへの収束を判断する。推進は、INTELLIGENCEの計画・配置の案を受け、承認済みの要求、HARNESSの工程契約、許可、予算、依存、LABOが出した水準に照らして適格性を確かめてから採り、案を無条件に実行しない。許可内の直接通信を保ち、固定モデル数や全通信の中央中継を要求しない |
| HELIXOS-L2-011 | ticket、設計、実差分、統合先、依存と承認済みHARNESS契約から、統合順序・統合単位・検証実行計画を導出し、実行結果とbase変更に応じて再計画できる。1.0の再計画は、HARNESSの工程の部品と検証義務の範囲での組み直しとする | HELIX-OS編成案 §1／4、2026-09-24 PO判断 | 本要求は計画を導く側であり、計画からCIを合成して実行する側はHELIXOS-L2-008とする。HARNESSの検証義務を追加・削除せず、実際の統合候補で具体化する。必要CI欠落、影響不明、契約解釈不明、stale結果を拒否し、review、内容検証、merge admission、release、運用評価を分けて収束させる |
| HELIXOS-L2-012 | 【HELIX-LABOへ移管（2026-09-25 PO判断）】技術調査。本文は[HELIX-LABOの候補](../../helix-labo/candidates/improvement-research-requirements.md)へ移した | HELIX-OS編成案 §3／6、2026-09-24 PO判断、2026-09-25 PO判断 | 要求整理前や設計途中の調査は工程内の調査（Research ticket）とする |
| HELIXOS-L2-013 | 【HELIX-LABOへ移管（2026-09-25 PO判断）】同じ仕事の横断診断。本文は[HELIX-LABOの候補](../../helix-labo/candidates/improvement-research-requirements.md)へ移した | HELIX-OS編成案 §5、2026-09-24 PO判断、2026-09-25 PO判断 | 同じ仕事への関連付けに使う原記録の保存はHELIXOS-L2-007に残す |

移管元は[柱要求](../../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md)、
[Concept v4由来整理案](../../governance/crosswalks/legacy-concept-derived-requirements.md)、
[常駐レーン](../../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/resident-lane-orchestration-requests.md)、
[三社レーン](../../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/three-lane-cloud-governance-requests.md)。
承認済み・未承認・IR移管済みの状態が異なるため、上表への収載を一括採択と扱わない。

[HARNESS要求](../../helix-harness/L2-requirements/product-requirements.md)の具体的な開発能力を重複定義しない。
HELIX-OSはHARNESSが規定する層・pair・工程条件を参照し、Worker・CIの実行結果を証拠として収集して進行を制御する。
OS内に工程規則の別正本を作らず、適用するHARNESS版とプロジェクトの選択を記録する。
HELIX-OS自身の変更も要求・判断・検証へ追跡し、統制する立場を自己承認権限へ拡張しない。

[要求エンジンPythonコア要求候補](../../helix-harness/candidates/requirement-engine-python-core-requirements.md)の意味処理は
HARNESS-L2-008が所有する。HELIX-OSはHELIXOS-L2-001／002／005／007／013として、Concept／企画L1、エンジン入力、
出力L2候補、人間の訂正・採否、採用要求、後続で判明した見逃し・誤検出を同じ因果IDで管理へ登録する。HARNESS engineが
出した企画との差分・分類を受け、戻す層、判断者、状態、改善eventへroutingする。OSが意味差分や影響を独自算出しない。
engine共通、製品固有pack、入力不足、運用誤りの改善候補へ接続する。登録、ログ蓄積、自己評価だけで
要求採用や強化済みにせず、採択した改善をHARNESSの要求・設計・検証と効果再観測へ戻す。
管理入口は意味未分類の原eventを因果ID、source、actor、対象、permission、data class付きで先に登録し、要求分類schemaを
固定しない。単体、接続、構成体のidentity候補と包含・接続・依存relationは、HARNESS要求エンジン確定後に別のversioned
分類projectionとして関連付ける。原eventを再分類で書き換えず、単体の進行・証拠・完了を接続や構成体へ自動伝播しない。

[設計template system要求候補](../../helix-brain/candidates/design-template-system-requirements.md)の汎用のtemplate・設計パターンと
その版・seedはHELIX-BRAINが持ち、製品の要求への適用規則と設計義務はHARNESS-L2-009（HELIX-HARNESS-CORE）が持つ。
HELIX-OSはHELIXOS-L2-001／002／005／007／013として、対象projectが使ったtemplateのexact setと版、適用、義務、N/A、
backflow、成果、finding、再作業、受入、運用結果を各製品の記録として登録する。
template未登録、stale、conflict、必要input欠落では任意様式へfallbackせず、停止または要求エンジンへ戻す。複数projectの
結果から改善候補を登録して振り分けるが、効果と退行の評価はHELIX-LABOが担い、利用回数やAI自己評価でtemplateを変更・昇格しない。

ticketの要求は、次の「ticket」節に置く。旧「要求からの開発ticket導出要求候補」は2026-09-24のPO判断で退役した。

HELIXOS-L2-004／007では、reviewer identity、review対象、review route、実行権限を別に扱う。provider名や
「reviewを通す」という依頼だけから、GitHub、ローカルCLI、API、IDE、Subagentの呼び出し等の任意通路を選ばない。
route、account／credential、network、費用、read／write範囲、期限が許可されていない場合は`review_waiting`で停止し、
別通路の過去許可、timeout、無出力をfallback認可へ変換しない。無許可で開始した実行は停止し、結果をreview証拠へ採用しない。

## ticket

2026-09-24のPO判断（[decision record](../../governance/decisions/concept-requirement-po-decisions-2026-09-24.md)）による。本節は未採否の要求案であり、詳細ID・親要求・対L11の接続は末尾の「ticket要求の詳細IDと分担」に示す。

ticketは、HELIX-OSの推進が発行する作業の単位である。旧HELIXではPLANに責務が集中していた。ticketはその責務を薄くし、作業ticketとして発行する。
PO「駆動モデルに即したチケットが発行される仕組みで、フォワードは大、中、小のようにしたら複数人が作業してもできる。トラブルや局所的なものが発生したらリカバリーやインシデント、PoCみたいなのができて、それがイシューやPRに登録される仕組み」。

- 駆動モデルはticketの種類で置き換える。各ticketは、駆動モデルに由来する進め方を、動的ワークフローとして中に持つ。
- Scrum等は開発方式（枠）であり、ticketの種類ではない。
- HARNESSは導出のためのコア（HELIX-JSONの定義とPythonの意味導出コア）を持つ。INTELLIGENCEはそれを材料に稼働中の判断（計画・配置の候補）を行い（2026-09-25 PO判断「稼働はインテリジェンス」。BRAINは汎用の設計知識を渡す）、推進はticketを導いて発行する。
- ticketは、種類、対象（単体／接続／構成体）、親の要求と版、変更の範囲を持つ。検収は、そこから必要な検証を導き、CIを動的に組み立てる。
  - 2026-09-26のPO判断（[判断記録](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md)）により、検収は、HARNESSの検証義務に従い、PRの前に回すCIをticketとの関係（Forward 小・中・大、V字の対、触るコネクタ、変更の種類）から組み立てる。変更がticketの範囲を超えていれば止める。省いた検査を記録し、合流先のticketで回収されたかを確かめる。検収はoracleを勝手に削除・追加しない。
  - 同じ判断記録により、OSはForward 小・中・大の定義を変えずに、要求identityごとの進行と成立の状態を別に持つ。Forward 小・中の完了は上のticketの証拠として集め、上のticketの完了は、HARNESSが導いた上の固有の義務との差分が満たされたことを確かめてから記録する。下のticketの完了だけで上のticketの完了を生成しない。relationから変更の影響を導いて再検証の候補へつなぎ、影響の状態（Affected、Unaffected、Unknown）を成立の状態と混同しない。HARNESSが導いた上の検証義務を下のCIの合格で省かない。Backflowで構造を分類し直した後は、新しい要求revisionから必要なticket、設計義務、検証義務を導き直す。OSはHARNESSの構造の意味を定義し直さない。
- ticketが正で、GitHub IssueとPRは映しである。Issueのcloseやmergeで、ticketは完了にならない。
- 2026-09-26のPO判断（[判断記録](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md)）により、検査をすり抜けて後で見つかった失敗は、閉じたticketへ証拠付きのrelationで接続し、HELIX-LABOの振り返りへ渡す。元の完了の記録は書き換えず、追補の評価を別に記録する。時間的な近さや同じpathだけで原因のticketを断定しない。LABOが返した原子CIやコネクタの契約の評価は、HELIXOS-L2-005の改善候補として登録し、還流先へ振り分ける。旧HXB-FR-007（`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:319`）の、閉じたTicketに後日見つかった不具合を証拠付きrelationで接続し、元のclosureを保存して追補assessmentを新発行する条件を保つ。変える点は、振り返りと評価の担い手をLABOとしたことである（HARNESS-L2-005の同じ判断の受け側）。
- ticketは計画から導いて発行する。トラブル系は、範囲と起きたことを入れると、種類・対象・親の要求が導かれて発行される。範囲が分からないときは、先にDiscoveryで明らかにする。
- 突発的に発生するものと、計画的に発行できるものを分ける。
- [2026-09-26 PO判断](../../governance/decisions/handoff-integration-po-decisions-2026-09-26.md)により、OSはPMにあたり、ticketの発行・割当て・進行を決める。周辺の機構はPMOにあたり、案・標準・評価・制約を出すが、ticketを発行しない。L2.5より前の上流段階のticket（PoC、Prototype、Decide、Backflow）も、OSの推進が登録済みの要求とBackflowから発行する。INTELLIGENCEはこれらの案を出せるが、案だけからticketを発行しない。旧HIL-BR-13（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:65`）と旧Requirement Re-entry（`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:242`）の、上流の段階の作業を登録された要求と戻しから始める点を保つ。変える点は、発行の主体をOSの推進と明示したことである。
- 独立reviewのfindingは、OSの推進が受け、今のPRで直すもの（同じ責務・既存のscopeの中で安全かつ局所的に閉じるもの）と、次のticketにするもの（独立した責務、別の設計、lifecycle、性能改善）に振り分ける。今のPRで直すものは作成のレーンへまとめて返し、次のticketにするものは同じ因果IDで新しいticketとして発行する。AIの自由な判断だけでfindingを捨てず、次のticketにしたfindingを今のPRへ戻さない。旧HIL-BR-17（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:69`）と旧HIL-FR-30（同`:120`）の振り分けの規則、writerへの返却、破棄と再流入の禁止を保つ。変える点は、振り分けの受け手をOSの推進とし、`successor_issue`をIssueではなく次のticketとしたことである（ticketが正、Issueは映し）。

### ticketの種類

旧HELIXの確定版（`archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29-47`）を起点に、PO判断を加えた。

Forwardは本流である。開発方式がVモデル・Scrum・Hybridのどれであっても、その方式の規定の路線を走るticketをForwardとする。ほかのticketは、最後にForwardへ合流する。

| 種類 | 何のticketか | 発行 | 合流先 |
|---|---|---|---|
| Forward 大 | 構成体（システム全体）を、開発方式の規定路線で要求から受入まで通す | 計画 | 本流 |
| Forward 中 | 接続（機能と機能のつなぎ）を、開発方式の規定路線で作る | 計画 | Forward 大 |
| Forward 小 | 単体の機能を、開発方式の規定路線で作る | 計画 | Forward 中／大 |
| Discovery | 開発の途中で検証が必要になったとき、または範囲が分からないときに確かめる | 突発 | 発行元のticket |
| PoC | 技術的に成り立つかを確かめる。画面の有無に関係なく、成立性が不明なときに発行する。本番実装にはしない | 計画（L2.5） | Backflow→要求エンジンの2次形成→Decide |
| Prototype | 画面の操作と使う人の反応を確かめる。画面のない対象では発行しない | 計画（L2.5） | Backflow→要求エンジンの2次形成→Decide |
| Decide | 裁定。要求の確認や技術の選定をPR化して決める | 計画 | 採用→Forward、不採用→記録して終了、方針変更→次の計画 |
| Backflow | 下流の結果（PoC・Prototypeの結果、要求の入力不足、下流で分かったこと）を要求へ戻す | PoC・Prototypeの後は計画、それ以外は突発 | 要求エンジン（L2） |
| Reverse | 実装の事実から設計へ戻す。Scrum Reverseを含む | 突発（設計と実装のずれ、同種finding再発、性能退行、障害等）と計画（Scrum Reverseのcheckpoint：sprint review前、release candidate合流前、public contract・DB schema・主要dependency・NFR budgetの変更時。旧`helix-harness-requirements_v1.3.md:94-102`） | Forwardの該当層 |
| Recovery | AIの逸脱・暴走・context切れから正常な地点へ戻す | 突発 | 中断していた工程 |
| Incident | 本番障害に緊急対応する | 突発 | 運用評価（L12）。恒久対策はReverse経由 |
| Refactor | 振る舞いを変えずにコードの構造を直す | 計画（範囲を入れれば事象からも発行可） | Forward 小 |
| Design-refactor | 外部の振る舞いを保って設計の構造を直す | 計画（範囲を入れれば事象からも発行可） | Forward |
| Performance-refactor | 設計を保って性能を上げる。測れない高速化は不可 | 計画（範囲を入れれば事象からも発行可） | Forward |
| Redesign | 外部の約束・要求・受入条件を変えて設計をやり直す | 計画 | Forward（要求が変わるときはDecideを経る） |
| Retrofit | 依存・基盤・構成の更新に合わせて段階的に移行する | 計画（範囲を入れれば事象からも発行可） | Forwardの該当層 |
| Research | 選定や比較のための参考ソースを集める。決定には関わらない | 計画 | 依頼元 |
| Add-feature | 既存のものに機能を差分で追加する | 計画 | Forwardの該当層 |
| Version-up | 後の版へ回した項目を保全し、時期が来たら取り込む | 計画 | 取り込み時にDecide→Add-feature |
| Experiment（案） | LABOの比較実験。改善の候補を今の方式と比べるために、追加の実行が要るときだけ発行する。評価対象のticketとは別のticketにし、本線と別の予算と列で動かす | 計画（LABOの比較実験の依頼をOSが登録） | LABOの評価（結果はFeedbackとしてOSへ戻る） |
| Training（案、3.0） | INTELLIGENCEのローカルLLMの学習・チューニング。LABOが利用区分を付けた材料だけを使う | 計画（INTELLIGENCEの学習の案をOSが登録） | LABOの評価→Decide |

周辺の機構の作業とticketの種類の対応は、次のとおりである（[2026-09-26 PO判断](../../governance/decisions/handoff-integration-po-decisions-2026-09-26.md)。L2は仮決め）。
- LABOの比較実験：Experimentとする。旧Execution Ticket候補（`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:157-163`）の、ExperimentDefinitionを実行前に固定し、新しい実行が要るときだけ作業ticketを作り、評価作業のticketと評価対象のticketを混同せず、評価作業の完了で対象のticketを閉じない点と、同`:343`の本線と実験の予算・列を分ける点を保つ。通常の開発の観測だけで足りる評価（HELIX-BenchによるWorkerの水準の集計を含む）では、ticketを発行しない。種類の名前を明示したのは新しい案である。
- INTELLIGENCEの学習：Trainingとする。旧HELIXにモデルの学習を作業ticketとする記述はなく（旧`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-intake.md:164`はweightsのfine-tuningを要求しないとしていた）、新しい案である。3.0の版の印を付ける。
- INTELLIGENCEのbot：botは特定の目的に使うWorkerとして、既存の種類のticketの割当てで動かし、新しい種類を足さない。Crawlerの情報収集はResearch、Bugbotの限定修復は発生元のticketの中の割当て（下の「Worker・学習・ログ・CIの具体条件」のPatch Bot Workerの条件）とする。
- Web提供側（HELIX-WEB-OS）のjob：WEB-OSの展開後のjobは内部OSのstate・writer・authorityへ収容しない（下の「管理対象としてのHELIX-WebとHELIX-WEB-OS」）ため、本表に種類を足さない。WEB-OSはまだ要求に落としていないため（[2026-09-26のPO回答](../../governance/decisions/handoff-integration-po-decisions-2026-09-26.md)）、扱いはWEB-OSを要求に落とすときに決める。

旧定義との違いは次の4点である。
- DiscoveryとPoCは、旧HELIXでは1つだった（PoCはS2）。PO判断で分けた。
- 旧S4 decideはDiscovery専用だった。Decideとして独立させた。
- 旧Researchは決定（ADR）まで含んでいた。PO判断で決定を外した。
- Redesign・Design-refactor・Performance-refactorは、旧HELIXに手順書がない。旧要件の記述だけを起点にした。

BackflowとForward 大・中・小の旧HELIXとの対応は次のとおりである。
- Backflowは、旧HIL-FR-31 Upstream Redesign Re-entry（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:121`：影響した層がL1ならL1/L12の対を、L2ならL2/L11の対と画面の適用判定・prototypeの合意をstaleにし、再承認の前の実装claimとForward合流を拒否する）と、旧Requirement Re-entry（`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:242`：retryの上限超過等で、理由に応じてRecovery、Reverse、Requirement Re-entry、Human Requiredへ戻す）に当たる。保つ点は、下流で分かったことを上流へ戻し、合意が戻る前にForwardへ合流させないことである。変える点は、名前をBackflowとし、ticketの種類の一つとして要求エンジン（L2）へ戻す形にしたことである（2026-09-24 PO判断）。
- 旧HIL-BR-13（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:65`：画面のある対象はprototype→walkthrough→要求back-propagation→合意の後に要件を凍結し、画面のない対象は証拠付きのskip receiptでだけ通す）は、Prototype→Backflow→要求エンジンの2次形成→Decideの流れに当たる。保つ点は、画面のある対象で合意の前に要件を凍結しないこと、飛ばす場合に証拠を残すことである。変える点は、PoCを画面の有無と別に判定することである（HARNESS-L2-003）。
- Forward 大・中・小は、旧HELIXでは一つのForward（`archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:33`の`FULL_L1_L12_V`）であり、大きさの区分はなかった。旧HIL-FR-31のForward合流は、ほかのticketが最後にForwardへ合流する点として保つ。構成体・接続・単体に分けたのは2026-09-24のPO判断による。

## 旧資産の退役・archive統制

[旧資産退役要求候補](../../governance/candidates/legacy-asset-retirement-requirements.md)のLAR-OS-001..007を、
HELIXOS-L2-001／002／003／006／007／009の適用待ち具体化として保持する。asset identity、revision、対象、authority状態、
provenance、dispositionと、source、runtime、AI read、CI、registry、生成、配布、外部writer、復元のconsumer relationを追跡する。

旧資産は元の相対構造、provenance、digestを保った非実行archiveへ先に隔離し、current startup、authority検索、AI context、
runtime、CI discovery、package command、復元経路から外す。現行pathには新世代上流の入口と停止条件だけを置く。
隔離後にsemantic atom、consumer、採否、replacementを追跡し、承認上流から新しいartifactとoracleを再導出する。
archive原文と判断史を保全し、物理削除は法的・security等の理由と別のaction-binding approvalがある場合に限る。

HELIXOS-L2-002／006／007では、archive manifestの全資産を母集団として、完全一致再利用、意味再導出、置換、退役、
archive限定、不採用、未判定を資産ごとに追跡する。完全一致再利用が承認された資産はarchiveから現行pathへコピーし、
source／target pathとdigest、製品owner、上流要求、consumer、権利、secret、外部作用、実行性、採否revisionを記録する。
copy後にdigestとconsumerをread-afterし、旧startup、runtime、CI、hook、prompt、設定を暗黙に再有効化しない。
変更不要と確認できた資産を再実装せず、未判定資産を「不要」と解釈して要求・behaviorを落とさない。

## 管理上の観測と製品変更の入口

[旧Management Scrum policy](../../../archive/legacy-generation-2026-09-14/root/docs/governance/management-scrum-product-forward.md)は、
[新世代対応表](../../governance/audits/source-rebaseline/new-generation-management-change-source-crosswalk.md)に従って
HELIX-OSの管理統制とHARNESSのForward条件へ分ける。旧policyのconfirmed状態、Issue-first、`S0..S4`、Scrum Reverse、
既存adapter／template／test／CIを新世代へ継承しない。

HELIXOS-L2-001／002／003／005／007では、gate漏れ、監査所見、運用上の再発等を対象・出典・revision・影響・
重複・調査・候補・採否・戻し先とともにrepo-owned intakeへ記録する。remote Issue／Projectは必要に応じて同期する
projectionとし、その状態から要求意味・承認・完了を逆生成しない。採択した変更は対象製品の意味が変わる最上流へ戻し、
OSが要求を直接書き換えたり自己承認したりしない。本節ではGitHub、DB、workflow、CIを操作しない。

[旧Scrum Operation候補](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/scrum-operation-typed-projection-requirements.md)は、
[新世代管理状態対応表](../../governance/audits/source-rebaseline/new-generation-management-state-projection-crosswalk.md)に従って
再採否する。HELIXOS-L2-002／004／005／007／009では、要求・責務・作業・判断・証拠のauthority identityを参照し、
進行、blocker、待ち、失敗、検証、改善候補等を再構築可能な管理viewへ投影する。Project、Issue、DB、dashboard、roadmapから
要求意味・承認・完了を逆生成せず、missing・unknown・stale・conflict・projection failureを完了へ補完しない。
旧7 operation、旧layer配置、既存DB／roadmap／test／CIは新世代のschema・oracleではない。

## 限定修復の統制条件

旧Bugbot候補に由来する限定修復の統制条件は、2026-09-25 PO判断により[HELIX-INTELLIGENCEの候補](../../helix-intelligence/candidates/audit-bounded-repair-requirements.md)へ移した。

## 構造改善候補の統制条件

[旧Refactoring Trigger候補](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/refactoring-trigger-admission-requirements.md)は、
[新世代対応表](../../governance/audits/source-rebaseline/new-generation-refactoring-trigger-source-crosswalk.md)に従って再採否する。
HELIXOS-L2-001／002／003／005／007では、観測、finding、改善候補、scope、根拠、意味保存、必要検証、採否、
割当、結果、効果、失効を区別する。未評価、unknown、stale、partial、findingなし、no actionを別状態として保持し、
単一metric、AI評価、file size、Issue数、定期scan、旧CI結果から候補の採択・実行を生成しない。
旧UIL、System Synthesis、RF0..RF6、current 9 scope、既存scanner／CIを新世代へ継承しない。

## Worker capacityの統制条件

[旧Three Lane候補](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/three-lane-capacity-profile-requests.md)は、
[新世代対応表](../../governance/audits/source-rebaseline/new-generation-worker-capacity-source-crosswalk.md)に従って再採否する。
HELIXOS-L2-004／005／007／008／009では、利用可能resource、割当上限、active WIP、実行中、検証待ち、統合待ち、
予算、期限、競合、再作業、停止・縮退を区別する。pool登録数や最大値を稼働・accepted throughputとして表示せず、
下流処理能力と検証独立性を保つ範囲でbackpressureを適用する。

provider、model、account、runner、reviewer数は有期resource profileとして扱い、三社、Codex／Cursor／Claude、
定常3／2、burst 5、8-slotを恒久要求にしない。対象revision変更後は証拠を再評価し、stale reviewを流用しない。
本節ではWorker dispatch、旧三社lane、既存CI、Merge Train、PR／DB projectionを実行しない。

## Security engagementの統制条件

[旧SEA候補](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/security-engagement-authority-requests.md)は、
[新世代対応表](../../governance/audits/source-rebaseline/new-generation-security-engagement-source-crosswalk.md)に従って再採否する。
HELIXOS-L2-001／003／004／005／007／009では、対象製品が承認したtarget、operation、environment、network／data scope、
期限へ操作authorityを束縛し、通常作業と特権Workerのresource・証拠を分ける。authorization不在、scope drift、revoke、
stale、unknownでは新規・実行中操作を停止し、候補文書・Issue・過去承認・provider accessから実行権限を生成しない。

sensitive security dataは対象製品のdata classificationに従い、通常DB、log、memory、Issue、PR、AI context、配布物へ
流出させない。保管・暗号化・retention・disclosure方式は未承認であり、本節ではcredential、network、scan、exploit、
production、external service、旧broker、既存CIを操作しない。

## 利用許諾・配布の統制条件

[旧Commercial License候補](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/helix-commercial-license-requirements.md)は、
[新世代対応表](../../governance/audits/source-rebaseline/new-generation-license-distribution-source-crosswalk.md)に従って再採否する。
HELIXOS-L2-001／002／006／007では、承認済みの製品scope、契約版、対象asset、第三者条件、artifact、release、
配布・更新・復旧結果を対応づける。権利不明、適用版不一致、未発効を識別し、候補文書・PR・CI・配布成功から
契約内容、権利、公開許可を生成しない。

HELIX-OSは内部統制機構として扱い、HARNESSやHELIX-Web等の外部提供条件と一括契約にしない。
具体的な条文・価格・契約・課金・LICENSE変更・repository visibility・公開・配布は本節の対象外である。

## AI可読文書の生成・適用統制

[AI可読上流文書の要求候補](../candidates/ai-readable-authority-requirements.md)のAIDOC-OS-001..008を、
HELIXOS-L2-001／002／003／004／005／007／009の適用待ち具体化として保持する。session開始時に対象project・product、
authority revision、HARNESS契約、assignment、許可・禁止、予算、停止条件、必須readを解決し、会話、Issue、memory、
旧実装から不足項目を補完しない。

AI可読文書は承認上流から一方向に生成し、source、digest、生成版、適用scopeを保持する。HARNESS工程契約、OS実行統制、
個別製品要求を別source relationとして組み立て、要約してもauthority、禁止、停止条件、未解決事項、次の必須readを落とさない。
source更新時は影響文書をstale化し、再生成・semantic diff・read-after前に実行へ使わない。読取りrevision、未読、参照失敗、
競合を記録し、「読んだはず」やsession記憶を証拠にしない。

AI文書のinput、registry、activation、generation、distribution、enforcement、recovery、citationを別relationとして追跡し、
読取り主体、適用時点、scope、source revisionを保持する。一件の文字列置換、一つの静的read set、旧lint greenだけで
consumer移管完了と判定しない。現行relationの要求源は
[consumer relation inventory](../../governance/audits/source-rebaseline/legacy-ai-consumer-relation-inventory.md)に記録する。

現行AGENTS.md、CLAUDE.md、`.claude/`、`.codex/`、hook、adapter、promptはlegacy runtime inputとしてinventoryに留め、
旧AI文書は要求整理開始時に非実行archiveへ隔離し、現行pathの最小入口から参照しない。物理削除は行わない。
新世代manifest、生成器、prompt、token budgetはL3以降で再導出する。

## 開発投資候補の取扱い

[旧INV-001..072](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/development-investment-stage-directives-intake_v1.0.md)は、
[新世代対応表](../../governance/audits/source-rebaseline/new-generation-investment-candidate-crosswalk.md)でexact 72件を分類した。
HELIXOS-L2-001..009では、authority、作業、証拠、変更、resource、AI context、learning、費用、効果等の意味候補だけを
個別採否する。INV ID、P0..P4、旧Issue／owner、既存graph／DB／scheduler／adapter／CIを新世代要求や実装順にしない。

INV-043の旧Cursor早期E2Eは不採用とし、有界Worker委譲の意味だけを別のWorker要求源へ移す。
INV-068／070／071／072は対象製品・data・権利・評価要求が成立するまで将来研究として保留する。
72件をIssue／PLANへ一括変換せず、本節では旧CI、Cursor、DB、scheduler、既存実装を起動しない。

## Worker・学習・ログ・CIの具体条件

以下は柱要求と要件v1.3の既存条件をOS側へ具体化したもの。候補固有の拡張や数値上限は、出典の採用状態を
確認して別に移管する。provider名や固定レーン数をOS全体の恒久要件にしない。

| 親要求 | 保持する条件 | 出典 |
|---|---|---|
| HELIXOS-L2-004 | Workerの目的・成果形式・許可範囲・予算・期限を割当に結び、実行・停止・成果回収を追跡する。作成側と検証側を区別し、独立検証不成立を明示する。作成したWorker自身またはそのSubagentによるreviewを独立reviewに数えない。CLI／IDE／hosted surfaceの差でguardの適用有無を隠さない | HBR-P2、柱要求§2.6 |
| HELIXOS-L2-005 | 検出から改善候補・採否・再検証へ接続する。学習の発火・利用・効果・誤推薦・古い版を計測し、知見の登録だけを有効性の証拠にしない。記録と改善候補の登録はOS、効果の評価と学習（RCLS）はHELIX-LABOが担う（2026-09-25 PO判断。学習の分離は[OS L1](../L1-planning/system-intent.md)のとおり照合中）。経験からHARNESS工程規則を直接書き換えない | HBR-P4／P8、v1.3 HR-FR-HYB-007 |
| HELIXOS-L2-007 | 作業・判断・検証の原証拠と出典を保持する。feedbackはintake・classify・ack・pending・resolutionを区別し、未ack findingを消さない。memoryの内容を責務正本へ反映してからretireし、古い指示を再提示しない | HBR-P7／P9、v1.3 HR-FR-HYB-005／006 |
| HELIXOS-L2-008 | 承認済み上流revision、HARNESS版、対象product、変更集合からCI profileを生成し、結果を要求・pair・oracle・HEAD・環境・runner・実行世代へ結ぶ。上流意味review、下流verification、merge、releaseを別pipeline classにする。失敗種別と差戻し先を保持し、検査を弱めてgreenにしない | HBR-P6、v1.3 HR-FR-HYB-010／§6、新世代CI要求候補 |
| HELIXOS-L2-009 | eventをdurableに記録して冪等に投影し、成功後だけcheckpointを公開する。session交代で予算・期限・失敗回数・未完義務を初期化せず、同一作業の二重claimや副作用を防ぐ | HBR-P1、HNFR-P5、柱要求§2.7 |

ログ保存・DB投影は要求の意味正本を代替しない。必要な証拠の種類と工程条件はHARNESSを参照し、
その収集・保全・有効性確認と実行制御をHELIX-OSが担う。

Agentic Workerは探索を含む有界な調査・設計・実装・testを担う。Patch Bot Workerは、正解とwrite-setが
承認済み契約から一意に決まる限定修復だけをHELIXOS-L2-004の配下で担い、行数で分類しない。
設計選択が必要なら推進責務へ返し、修復者とHELIXOS-L2-011の最終検収者を分ける。いずれも要求・権限を
自己拡張せず、具体runtime、provider、固定Worker数を本要求では決めない。

## 新世代CIの再構築条件

[新世代CI要求候補](../candidates/next-generation-ci-requirements.md)のNCI-OS-001..008を、
HELIXOS-L2-008の適用待ち具体化として保持する。既存workflow、job、required check、review admissionはlegacy implementationであり、
新世代CIの要求分母や合格oracleにしない。GitHub Actions等は交換可能なprovider adapterとする。

新旧CIはidentity、writer、evidence namespaceを分け、旧CIは実行せずarchive referenceとしてのみ扱う。上流意味review専用laneが整う前に、Concept／L1／L2／L3候補を
旧PR・旧CIへ接続しない。新世代CIの実装は、対象別上流の確定後にL3／L10から再導出し、shadow比較、cutover、rollback、
consumer read-afterを経て旧writerを停止する。shadow実行では新世代だけを要求oracleへ照合し、旧CIとのdual runやparityを求めない。
本節ではworkflow、runtime、gate、設定を変更しない。

## 運用品質の管理・統制条件

[旧NIO候補](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/infrastructure-operations-quality-l1-request-candidates.md)は、
[新世代対応表](../../governance/audits/source-rebaseline/new-generation-operational-quality-source-crosswalk.md)に従って
再採否する。旧Issue番号をownerにせず、既存measurement、event、logging、alert、incident、lifecycle、Requirement Re-entry
engineの再利用を新世代要件にしない。

HELIXOS-L2-002／005／007では、管理対象の要求revisionからrelease準備・artifact受渡しと、展開先runtimeが所有する
配備・設定・計測・log・通知・incident・backup・restore・rollback・maintenance・decommission・費用の適用状態と証拠へ
辿り、欠測・stale・collector停止をhealthyへ変換しない。OSは証拠と進行を統制するが、展開先runtimeの実行authorityを
吸収しない。
運用観測からの差分は改善候補として出典とscopeを保持し、人間の採否や対象製品の要求を直接書き換えない。

HELIXOS-L2-004／006／009では、通知・担当・ack・期限・復旧操作・中断・再開を追跡し、対象、actor、権限、予算、
影響範囲、復旧先、独立検証が成立する範囲だけを実行対象にする。NIO候補は操作認可や自動修復権限を付与しない。
具体SLO、RTO／RPO、保持期間、対象環境は個別製品・releaseの承認済み要求を参照する。本節では旧機構、CI、
故障注入、production操作、自動修復を実行しない。

## 管理対象としてのHELIX-WebとHELIX-WEB-OS

2026-09-14のPO指示「Vision2のHELIX-WebはHELIX-OSが管理する」と「展開時はHELIX-OSの外にHELIX-Web-OSを作る」を、
HELIXOS-L2-001／002／003／005の具体的な対象と境界として保持する。HARNESS、HELIX-Web、HELIX-WEB-OSは
それぞれ要求正本・合意revision・進行状態を持ち、OSが開発・改善projectとして横断管理する。
Web固有の利用者体験やサービス要求は[HELIX-Web側](../../../helix-web/docs/helix-web/README.md)へ置く。
展開後のtenant、Connector job、service state、credential、配備・監視・復旧は
[HELIX-WEB-OS側](../../../helix-web/docs/helix-web-os/README.md)へ置き、HELIX-OSの内部state・writer・authorityへ収容しない。
HELIX-WEB-OSからは、許可されたservice log、telemetry、incident、利用結果を出典・scope・目的・同意・revision・
時点・欠測付きで受領する。HELIXOS-L2-005／007／013により他projectの証拠と突合し、改善候補、採否、対象別変更、
再検証、再観測へ接続する。credential、tenant原data、範囲外logを吸収せず、受領logから要求を直接変更しない。
Webで適用するHARNESS版と採用能力を追跡し、Webの変更だけを理由にHARNESSの共通規則や他プロダクトの要求を変更しない。
Webでの実践証拠をHELIX改善へ戻す際は、出典・利用可能範囲・採否・変更対象・検証結果を保持する。
管理対象への位置づけは、Web／WEB-OSの全機能の採択、開発完了、公開時期の確定を意味しない。

## 有期限通知とmemoryの責務

2026-09-24のPO判断により、harness memoryはCodexとClaudeの連携用に限り、過度な記録を残さない。PO「メモリに書く内容は基本にルールになるよな？これは仕組みで吸収する」。
最新の[HMC利用者要求候補](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/harness-memory-coordination-boundary-requests.md)は、
有期限な連絡・受渡し・再開通知への限定を要求する。HELIX-OSの要求案として次の条件を保持する。
HMC候補は人間承認記録済み・独立検収／正本化待ちと宣言されているが、本書でIRやruntimeへ昇格させない。

| 出典 | 対応L2要求 | 利用者が確認できるべき具体条件 |
|---|---|---|
| HMC-BR-001 | HELIXOS-L2-004／009 | runtimeを跨いでassignment、review依頼、handover、heartbeat、確認待ちを有期限な通知として受け渡せる |
| HMC-BR-002 | HELIXOS-L2-001／009 | 通知から各対象の正本を再取得でき、stale pointerやHEAD不一致を把握できる。要求の意味は要求文書・指定JSONへ、実行状態はその状態authorityへ戻る。Issue本文を要求正本として再取得しない |
| HMC-BR-003 | HELIXOS-L2-001／005 | 要求・設計・受入・運用規則・ユーザー嗜好をmemoryの正本へ移さない。規則にあたる内容は仕組みで吸収する。知識は1.0〜2.xではHELIX-LABOが評価して保持し、3.0からはHELIX-INTELLIGENCEが改善に使う。参照先を確認できる（2026-09-24 PO判断で旧「Learning／Skill authority」を置換） |
| HMC-BR-004 | HELIXOS-L2-001／007 | 通知中の相談・質問・仮説・叱責・AI解釈から承認・決定・完了を生成しない |
| HMC-BR-005 | HELIXOS-L2-004／009 | 重複配送・再送・消費・期限切れ・訂正・crash後再開を追跡できる。無効記録は監査履歴として参照できてもcurrent guidanceへ再表示されない |
| HMC-BR-006 | HELIXOS-L2-004／009 | すべてのproviderの標準memory（provider native memory）を使わない。session history・user設定も共有通知やauthorityへ暗黙混入しない（2026-09-24 PO判断で「混入しない」から「使わない」へ強化） |

HBR-P7とHIL-BR-03等の旧memory中心要求は、この責務分離に従って要求本文・受入・consumerを同じrevisionへ
移行する対象である。通知本文の削除やmemory件数減少を移行成功の証拠にしない。
要求・知識・作業状態の移管先、原文provenance、再取得可用性、訂正履歴、未移管項目を確認してから置換する。
retention／purge期間と既存記録の削除は本要求案で決定しない。

通知はtyped pointerを運び、各対象の正本へ再取得する。要求の意味はローカル要求文書・指定JSONを参照し、
Issue／PRは対応する作業や統合の記録として参照する。作業管理の現在値を要求の意味や採否へ転用しない。
HMC-BR-004の「作業依頼」も自動的な承認・決定・完了への昇格対象にしない。
HMC-BR-006のprovider設定詳細はProvider Configurationの責務とし、OSの通知機構へ混在させない。
保持・削除期間の数値、authority語彙、JSON key orderingは本移管で新規定義しない。

## 成果の出所に関する候補条件

PPSの要求候補をHELIX-OSの対象別要求案へ接続する。PPSはHELIXOS-L2-004／007に対応する。
draftであり、以下への収載を採択・正本昇格と扱わない。出典は[PPS](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/producer-provenance-separation-requests.md)である。
同じ節にあった監査（AAFD）は[HELIX-INTELLIGENCEの候補](../../helix-intelligence/candidates/audit-bounded-repair-requirements.md)へ、学習（RCLS）は[HELIX-LABOの候補](../../helix-labo/candidates/improvement-research-requirements.md)へ、2026-09-25 PO判断により移した。

| 出典 | 保持する具体条件 |
|---|---|
| PPS-BR-01 | 内容のproducer、commit実行者、PR公開者を別々に確認できる |
| PPS-BR-02 | Git actorの違いだけで独立review成立としない |
| PPS-BR-03 | assignment scopeとcandidate HEADに結びつくprovenance graphから成果の経路を再現できる |
| PPS-BR-04 | 過去の不明producerを推定で承認済みにせず、段階的移行を示す。mixedとunknownを区別し、外部botからHELIX producerを推定しない |

PPSは成果生成者、commit実行者、PR公開者、独立reviewerを別identityとして記録する。
双方の寄与と独立reviewが実測されたmixedは正規の受理状態として保持し、unknownへ劣化させない。
Git actor・署名・provider routingの再設計は本移管の対象外である。
独立性の工程基準はHARNESS-L2-005を参照し、OSはproducerの実証拠を保存・照合する。

## 会話継続と外部状態からの再構成

[会話寿命管理の要求候補](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/conversation-lifetime-reconstruction-requests.md)の
CLR-BR-001はHELIXOS-L2-009の追加検討入力であり、状態保存はHELIXOS-L2-007、割当継承はHELIXOS-L2-004へ接続する。詳細CLR-R01..08とL10 oracleは未承認候補であり、
L2の合意・L11受入を代替しない。利用者向け条件を次のように保持する。

| 出典 | 利用時に保持・確認する条件 |
|---|---|
| CLR-R01 | 目的・受入・未解決意図・棄却理由・失敗仮説の未保存や不明を識別でき、重要情報が欠ける場合は切替を保留する |
| CLR-R02 | 要求・判断・成果・証拠は既存ownerへ保存し、checkpointから未commit差分・実行中処理・累積予算へ辿れる。未承認意図は承認済み要求にならない |
| CLR-R03 | 保存・再取得・意味と版の対応を確認できた範囲だけを次回入力から外す。会話原本や監査証拠の削除と混同しない |
| CLR-R04 | 継続・compact・新sessionの選択根拠と実provider能力を確認でき、非対応・観測不能を成功扱いしない |
| CLR-R05 | 切替前後で未完義務・担当履歴・予算・期限・retryを引き継ぎ、二重writer・二重副作用を防ぐ。session交代だけで独立review成立としない |
| CLR-R06 | 最小restart packetでも必要情報を黙って切らず、不足時は分割取得または保留する。取消権限や他案件の情報を混入させない |
| CLR-R07 | 同一条件で3方式を比較し、意図保持・品質・見逃し・再試行・再取得・時間・総費用を確認できる。初期context減少だけを成功としない |
| CLR-R08 | shadowから段階的に導入し、生成・保存・受信・利用・検証・運用有効化を別状態で確認する。既存continuation等を重複する第二正本を作らない |

本候補のL11では、利用者が切替前後の目的・受入・未完作業と制約を比較できること、保存失敗や版混在で
作業完了・切替成功と誤表示しないこと、実行中処理を再起動して二重実行しないことを確認する。
L10の障害注入成功だけで利用者合意を取得済みとしない。

詳細は[CLR要件候補](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/conversation-lifetime-reconstruction-requirements.md)を参照する。
CLR-R02のcheckpointはrepo・branch・worktree・HEAD、未追跡変更、実行中Worker／CI／外部操作、契約版と失敗回数を含む必要範囲の派生viewとする。
CLR-R04ではhook未発火も観測不能と区別して記録する。CLR-R05の切替はsafe point、保存・再取得、旧writer停止またはhandover、後継の再束縛、再構成確認の順で扱う。
CLR-R06ではsecret、private reasoning、撤回claim、作成側の結論誘導もrestart packetへ混入させない。
CLR-R07は同一task・HEAD・要求・provider／model／設定で隔離比較し、保存・再構成を含む費用とtoken／cacheも記録する。
CLR-R08はshadow、無副作用復元、単一task境界、未commit・未追跡差分・長期実行へ段階を分ける。
Skill、Rule導出、会話寿命は別の要求・受入・完了状態として維持する。

## 要求形成・人間反応の具体化

[AVS](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-requests.md)、
[RFA](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirement-formation-scoped-admission-requests.md)、
[DGH](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/design-grounding-human-convergence-requests.md)をHELIXOS-L2-001／002／003／007へ対応づける。
RFAは承認済み・正本化待ちの候補、AVS／DGHはdraft候補として扱い、同じ採用状態に丸めない。

| 出典 | 利用者が確認できるべき具体条件 |
|---|---|
| AVS-BR-001 | 相談・質問・叱責・緊急性だけで人間承認を生成せず、AIが導出した作業候補を人間の発言と区別できる |
| AVS-BR-002 | architectureや責務境界を継続的に拘束する判断はADR等の版付き記録へ辿れる |
| AVS-BR-003 | selection、approval、disposition、一時的技術評価を別identityとして確認できる |
| AVS-BR-004 | 作業指示と技術的正しさ・完了証拠を区別できる。委任scope内の手段選択は根拠付きで進み、指示の逐語実行を理由に検証を省略しない |
| AVS-BR-005 | agent連絡と長期authorityを区別し、通知から正本へ戻れる |
| AVS-BR-006 | drift等からAIが起票した作業を人間指示に偽装せず、実際の開始理由を追跡できる |
| RFA-BR-01 | 目的・前提・選択肢・根拠を比較し、利用者意図との食い違いを確認できる |
| RFA-BR-02 | 委任済み意図の範囲では技術的具体化が反復承認を要求せず進む。未委任の意味・権限変更は区別される |
| RFA-BR-03 | 変更で影響する要求・検証・writerだけを再確定し、無関係な有効作業の継続を確認できる |
| DGH-BR-01 | 外部実例と既存資産を論点ごとに参照し、根拠付きDesign候補を比較できる |
| DGH-BR-02 | 人間の反応とAI解釈を別に確認し、客観品質と主観的な受容を相殺せず影響scopeだけを再作業できる |
| DGH-BR-03 | 反復で受容した軸を保持し、findingの解消・再発・未解決を比較して収束を確認できる |

本L2案の具体化を既存の要求形成機構とは別のRequirement Engineや承認台帳へしない。
未取得の人間反応を補完せず、既存承認の有効なscopeと新たな意味変更を個別に照合する。
候補の完成を、無関係なCI改善・Recovery・限定委譲の待機条件に追加しない。

OSは判断の出典・scope・revisionと反復結果を記録し、下記HARNESSの工程条件を参照して適用する。
AVS-BR-001のdirective候補は実行意図・対象・許可scopeが明示またはtyped assignmentから解決できる場合に限る。
作業依頼を扱えることと、要求承認・恒久decision・完了を自動生成することを分ける。
AVS-BR-006の開始理由には現行workflow分類のsignalを使用し、旧po_directiveはcompatibility input-onlyとする。
RFAの要求形成は企画・前提・調査・限定PoC・プロト・反応・比較を反復し、全件を直列待機gateにしない。
RFA／DGH候補はWeb製品化、独立Research／Approval／Requirement Engine、新DB・scheduler・route、全体planner解放、包括的公開権限を追加しない。
Fullの成立とLiteへの昇格を区別し、利用者報告を原因確定・再現済み不具合へ自動変換しない。

## 提供・再編要求の具体化

[FRS v0.2利用者要求候補](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md)の9要求を、
[新世代対応表](../../governance/audits/source-rebaseline/new-generation-release-composition-source-crosswalk.md)に従って
HELIXOS-L2-002／004／005／006の構成・配布運用条件へ再分類する。旧RLS・既存CI・DevOS・Cursorを含むv0.2への
過去承認は新世代へ継承せず、この案からCI、Worker、公開manifest、配布先を変更しない。

| 出典 | L2で保持する具体条件 |
|---|---|
| FRS-BR-001 | behavior contract・source・依存・受入・artifact・rollbackの証拠を機能単位で確認できる |
| FRS-BR-002 | 提供構成へ含む機能と除外する機能をexact setで確認でき、未指定・未適格な機能を暗黙収載しない |
| FRS-BR-003 | 機能単位と上位構成の版・成熟度を別に追跡し、一方の昇格で他方を自動昇格させない。旧Slice／Module／Bundle名とchannel enumは未採択 |
| FRS-BR-004 | 変更pathから影響する所有単位・機能・提供構成と必要な検証へ辿れる。unknown・ambiguousを影響なしに変換しない |
| FRS-BR-005 | 同一source／registry／profileからmanifest・artifactを再現し、clean consumerで検証してqualifiedな直前版または明示replacementへ戻せる |
| FRS-BR-006 | 要求・所有・依存・検証・利用実績を根拠に責務の維持・分割・統合・移管候補を比較できる。未検証の再編はshadowとして区別する |
| FRS-BR-007 | 対象要求revisionごとに実装・検証・owner・提供構成・未成立条件を辿り、未所属・二重所有・未実装・未接続・未検証を区別できる |
| FRS-BR-008 | 新世代では不採用。要求整理中に既存CIを内部利用・比較・効果測定しない。Cursor固有条件は提供構成から外し、Worker要求源として別途再採否する |
| FRS-BR-009 | 各機能単位の安全依存閉包を確認し、構成全体の統合・更新・rollback・運用検証を個別機能の成功とは別に確認する。Lite／Full名は未採択 |

[Concept・Vision提供構成案](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-release-crosswalk.md)のPKG-D01..13は
利用者向け選択viewの旧候補である。[新世代対応表](../../governance/audits/source-rebaseline/new-generation-concept-package-source-crosswalk.md)に従い、
工程・提供契約はHARNESS、Worker・CI・配布操作はOS、将来能力は個別製品へ分ける。正式Module／Slice identityや公開版を生成する根拠にしない。
同案のgrowth-offでの通常開発、対象製品ReleaseとHELIX自己Releaseの権限分離、公開版から原証跡への追跡、
未採択Visionの必須依存化禁止は、RLS／FRSへの要求差分として保持する。採用済みとする前に対象revisionの合意が必要である。
PKG-D01..13の名前・個数、旧Module対応、Lite／Full、`8+1`構成、旧CI先行投入をOSの固定管理分母にしない。

提供物として成立する条件はHARNESS-L2-006、変更影響の工程条件はHARNESS-L2-004／005を参照する。
OSはこの条件に従う構成管理・生成・検証・配布・復旧の実行と証拠を所有する。
FRS-BR-003では未完の上位構成内にある適格な機能単位を不必要に隠さない。FRS-BR-004では局所検証と全体critical pathを分けて扱う。
FRS-BR-007のWaveは依存と検収証拠から導出し、説明用の9群・17系統を固定分母にしない。
FRS-BR-008は既存CI先行利用として棄却し、CI要求は上流確定後にNCIから降ろし直す。外部Workerの有界割当は
HELIXOS-L2-004へ別系列で接続し、旧provider・branch・review方式を継承しない。
FRS-BR-009は必要な安全依存が不足する場合に投入を止め、無関係な基盤の完成を一律の待機条件にしない。
提供構成の単位をworkflow、route、provider lane、repository境界の別名にせず、責務所有と選択的収載を区別する。
本移管でrepository分割、別builder・DB・要求正本、配車・全体planner、OPSやsecurity brokerの再実装を要求しない。

## L3候補への接続

対象別L2の具体化先として既存L3候補を参照する。以下は接続先の識別であり、全FRの意味被覆、対象別L3凍結、
候補の正本昇格を完了した証拠ではない。候補のL10をOS利用者のL11受入へ転用しない。

| L2条件群 | 既存L3候補とID範囲 | 接続するOS要求 |
|---|---|---|
| HMC | [HMC要件](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/harness-memory-coordination-boundary-requirements.md)：HMC-FR-001..006 | HELIXOS-L2-001／004／005／007／009 |
| AAFD | [AAFD要件](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md)：AAFD-FR-001..004、AAFD-R-01..15 | HELIXOS-L2-005／007 |
| RCLS | [RCLS要件](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requirements.md)：RCLS-FR-001..006 | HELIXOS-L2-004／005 |
| PPS | [PPS要件](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/producer-provenance-separation-requirements.md)：PPS-R-01..07 | HELIXOS-L2-004／007 |
| CLR | [CLR要件](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/conversation-lifetime-reconstruction-requirements.md)：CLR-R01..08 | HELIXOS-L2-004／007／009 |
| AVS | [AVS要件](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-requirements.md)：AVS-FR-001..005 | HELIXOS-L2-001／003／007 |
| RFA | [RFA要件](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirement-formation-scoped-admission-requirements.md)：RFA-RF-01..04、RFA-RC-01..05、RFA-GH-01..03 | HELIXOS-L2-001／002／003／007 |
| DGH | [DGH要件](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/design-grounding-human-convergence-requirements.md)：DG-R-01..04、HR-R-01..04、DC-R-01..04 | HELIXOS-L2-001／002／003／007 |
| FRS | [FRS要件](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md)：FRS-FR-001..006、FRS-R-01..24 | HELIXOS-L2-002／004／005／006／008 |

HARNESSの工程・提供条件に関係するRFA／DGH／FRS等は、OSの実行機構だけで条件を再定義しない。
既存候補の親L1参照は履歴として残し、対象別L2への正式接続は候補の改訂・承認範囲と併せて整合させる。

## 要求正本を更新する管理条件

HELIXOS-L2-001／002／007／009を、指定JSONのHIL-BR-26、HIL-FR-51..53、HIL-NFR-30..32と
HR-FR-HIL-19から具体化する。原文は[JSON正本](../../../archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json)、
[契約](../../../archive/legacy-generation-2026-09-14/root/requirements-ir/system_contracts.json)を参照する。新しいAdmission Engineや要求DBの追加ではない。

| 条件 | 利用者が確認できるべき結果 |
|---|---|
| 変更案の保持 | 未確定の要求変更も原文・理由・対象・変更前revisionとともに保持し、正本化待ちを理由に消失させない |
| 更新範囲の提示 | 変更する要求・契約・受入・検証・下流影響を示し、意味変更と生成projectionの追従を区別する |
| 適用判断 | 適用するpolicy・根拠・scopeから自動適用、修復、必要な人間判断、拒否、競合を区別する。既に許可された変更を同じ理由で再質問しない |
| 原子的な確定 | 要求revision・履歴・trace・下流失効・生成view・DB・receiptの整合を確認できる。部分更新を現行正本として公開しない |
| 競合と再実行 | staleな変更前revisionを拒否し、同じoperationの再試行で二重更新しない。失敗時は元状態または復旧待ちを明示する |
| 旧版からの保護 | 互換Markdown・旧shadow・Issue本文から現行JSONを再生成して最新要求を巻き戻さない |
| 更新経路の実証 | 契約文書やCLI名の存在だけで更新可能と表示せず、正規経路の実行結果・before／after revision・receiptへ辿れる |

現時点でこの更新経路の実証は未取得。[L2凍結境界の是正調査](../../governance/audits/source-rebaseline/l2-freeze-ir-correction.md)では、
既存PLAN用transaction等を要求shard更新の代用にできないことを確認した。利用者要求の文書化と実装完了を分ける。

## Execution Ticketと継続観測

[既存L2候補](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requests.md)の7要求をOSの対象別要求へ接続する。
候補はproposed_pending_l3_confirmationであり、既存の対文書を移動・再承認したことにはしない。
Workerの共通の実行契約はHELIX-OSが持つ（[2026-09-26 PO判断](../../governance/decisions/worker-execution-model-po-decisions-2026-09-26.md)）。Workerは独立した機構ではなく、作業を実行する主体である。作成やreview等の役割はレーンへ割り当て、Workerはレーンの主がSubagentとして呼び出して作業させるモデルである（例：GUIのレーンの主がOpusなら、Subagentとして呼び出したSonnetがWorker）。
ticketは必要なWorkerを指定する。指定は三段で決める（[2026-09-26 PO判断](../../governance/decisions/handoff-integration-po-decisions-2026-09-26.md)）。LABOがHELIX-BenchでWorkerの作業履歴を集計し、どのモデルクラスなら対応できるかの水準を出す。INTELLIGENCEがその水準を材料に、ticketごとの配置の案を作る。OSの推進がその案を確かめて指定し、割り当てる。評価していないモデルには「未評価」の印を付け、評価済みと混同しない。Benchの水準やINTELLIGENCEの案だけで、scope、branch、assignment、merge authorityを変えない（旧HXB-FR-015 `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:349-351`、旧RLO-FR-040 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md:663-666`の`provider_default_unbenchmarked`）。
HELIXOS-L2-004の配下で、次を扱う。

- Workerへのassignment：ticket、指定したモデルクラス、呼び出したレーン、要求のrevision、project、環境、役割、予算、期限を結びつける。SECURITYがauthorityを失効させたときは、新しい割当てを止め、実行中の割当ても止める（上の「Security engagementの統制条件」のrevoke時の停止）。
- 実行の状態：割り当て、受け入れ、実行中、完了と、停止・取り消し・失敗・authorityの失効を区別する。具体の状態名は下流の設計で決め、OSの作業の進行の状態と混同しない。
- capability：Workerごとに使える能力（coding、shell、test、review、research等）と、provider、model、実行環境、役割、設定を記録する。Workerのidentityをmodel名と同じものとせず、modelの変更だけでWorkerのidentityや責務を暗黙に変えない。
- 結果と証拠：Workerのidentity、provider、model、役割、ticket、要求のrevision、project、環境、実行環境、authority、制約、開始と終了の時刻、結果、成果物、実行の証拠を辿れる。
- Subagentとしての呼び出しの観測：どのレーンの主が、何の目的で、どのauthorityの下でWorkerを呼び出したか、消費した資源、関与した成果を、必要な範囲で辿れる。providerの内部の推論そのものは求めない。Workerの範囲は、呼び出したレーンの範囲・authority・予算以下とする。
- handover、retry、revokeとの接続：再割当てや再試行で責務と未完の義務を失わず、SECURITYからの失効で実行を止めて途中の成果物を隔離する。作業の終了時に、process、一時の資格情報、環境、一時file、lock、networkのsession、資源の予約を次のassignmentへ暗黙に引き継がない。

authority・権限の制約・隔離の条件はSECURITY、CPU・GPU・host等の実際の資源とその状態はHELIX-INFRASTRUCTURE（[2026-09-26 PO判断](../../governance/decisions/infrastructure-concept-placement-po-decisions-2026-09-26.md)）、Workerの配置の案はINTELLIGENCEが持ち、OSはこれらを重複して定義しない。OSが持つのは作業と変更の状態（Work／Change State）であり、HELIX-INFRASTRUCTUREの実行環境の資源の状態（Runtime Resource State）を二重に正本にしない。

独立reviewは、作成側とは別のreviewerのidentity・context・authority・review routeで行い、作成側の結論を引き継がず、独立して証拠を確かめられることを条件にする。provider・modelは記録するが、同じproviderだから独立でない、別のproviderだから独立であるとはしない。reviewの依頼は、通知の経路で別のreviewerへ渡す。
レーンとWorkerは別の概念である。レーンは役割（例：Codexのレーンに作成、Claudeのレーンにreview）の割当て先であり、provider名や固定のレーン数を恒久の要件にしない。

HXT-RQ-01／04／07はHELIXOS-L2-004、02は007、03／05は005、06は009を具体化する。

| 出典 | OSが保持する利用条件 |
|---|---|
| HXT-RQ-01 | 仕事の意味、実行担当、一回の試行、測定結果を独立させ、再割当後も追跡できる |
| HXT-RQ-02 | 通常開発の成功・失敗・拒否・中断・待ちを継続観測し、成功例だけを集計しない |
| HXT-RQ-03 | 同じモデル・同じ仕事に対するHELIXの効果を、固定条件と公平な採点で検証できる |
| HXT-RQ-04 | 追加実験は限定的に行い、開発レーン・review capacity・費用を圧迫しない |
| HXT-RQ-05 | 劣化・適性・費用の実測を既存の能力評価・配車・Requirement Re-entry（現行のBackflow）へ還流する |
| HXT-RQ-06 | 旧実装から安全に移行し、既存benchmarkと開発を新Ticket完成待ちで循環停止させない |
| HXT-RQ-07 | 人間は意味・予算・危険操作の境界を決め、依存・優先度・WIPによる実行順はHELIXが決める |

通常の仕事から観測receiptまでの到達、欠損検出、replay一致、固定条件比較、予算強制、既存ownerへの還流を確認する。
計測コードやdashboardの存在だけを成功とせず、改善なし・劣化・判定不能も正当な測定結果として保持する。
既存Benchを新Ticket完成待ちにせず、切替scopeを限定する。HARNESSは検証条件を定め、OSは試行・観測の記録と還流先への振り分けを運用し、HELIX-Benchでの評価はHELIX-LABOが担う（[2026-09-25 PO判断](../../governance/decisions/mechanism-placement-po-decisions-2026-09-25.md)、[2026-09-26 PO判断](../../governance/decisions/worker-execution-model-po-decisions-2026-09-26.md)）。

## ticket要求の詳細IDと分担

本節は既存本文の条件群を追跡するための未採否の整理案である。本文の意味・ticket種類・発行・合流先を追加・削除しない。詳細IDは主要求の連番と分け、既存のHXT-RQと衝突しない接頭辞を使う。単体は一つの機構で閉じる要求、接続は機構どうし、またはticket種類どうしをつなぐ連続処理、構成体は複数機構にまたがる全体である。ticketの対象の粒度（Forward 大・中・小）とは別であり、種類の定義一組を単体として扱う。

「システム」は要求としてシステムへ吸収する部分、「運用」は既存本文・旧source・PO判断にある入力や判断を補う部分を示す。運用の新しい承認手順・周期は作らない。実装済み・受入済みを表さない。各IDの成功条件・反例は対のL11、出典と旧ID対応は[再整理監査](../../governance/audits/source-rebaseline/ticket-id-redo-audit-2026-09-26.md)に置く。

| 詳細ID | 粒度 | 親主要求 | 対象とする既存の条件群 | システムへ吸収する部分 | 運用で補う部分 |
|---|---|---|---|---|---|
| HXT-TYPE-01 | 単体 | HELIXOS-L2-010 | 「ticketの種類」の「Forward 大」行全体（何のticketか・発行・合流先を一組とする）。 | OSは「Forward 大」を、表の目的・発行区分・合流先を一組として扱う。 | 構成体の要求と受入の範囲・開発方式を既存の判断主体が定める。 |
| HXT-TYPE-02 | 単体 | HELIXOS-L2-010 | 「ticketの種類」の「Forward 中」行全体（何のticketか・発行・合流先を一組とする）。 | OSは「Forward 中」を、表の目的・発行区分・合流先を一組として扱う。 | 接続する機能と境界を要求・設計で定める。 |
| HXT-TYPE-03 | 単体 | HELIXOS-L2-010 | 「ticketの種類」の「Forward 小」行全体（何のticketか・発行・合流先を一組とする）。 | OSは「Forward 小」を、表の目的・発行区分・合流先を一組として扱う。 | 単体の責務と範囲を要求・設計で定める。 |
| HXT-TYPE-04 | 単体 | HELIXOS-L2-010 | 「ticketの種類」の「Discovery」行全体（何のticketか・発行・合流先を一組とする）。 | OSは「Discovery」を、表の目的・発行区分・合流先を一組として扱う。 | 不確かな事象と調査結果を入力する。根拠不足を解決済みにしない。 |
| HXT-TYPE-05 | 単体 | HELIXOS-L2-010 | 「ticketの種類」の「PoC」行全体（何のticketか・発行・合流先を一組とする）。 | OSは「PoC」を、表の目的・発行区分・合流先を一組として扱う。 | 技術的成立性の不明点・結果を確かめ、要求へ戻す。 |
| HXT-TYPE-06 | 単体 | HELIXOS-L2-010 | 「ticketの種類」の「Prototype」行全体（何のticketか・発行・合流先を一組とする）。 | OSは「Prototype」を、表の目的・発行区分・合流先を一組として扱う。 | 画面の操作と使う人の反応を確認し、合意を記録する。 |
| HXT-TYPE-07 | 単体 | HELIXOS-L2-010 | 「ticketの種類」の「Decide」行全体（何のticketか・発行・合流先を一組とする）。 | OSは「Decide」を、表の目的・発行区分・合流先を一組として扱う。 | 既存のauthority境界に従う判断主体が裁定する。PR化だけを採用判断にしない。 |
| HXT-TYPE-08 | 単体 | HELIXOS-L2-010 | 「ticketの種類」の「Backflow」行全体（何のticketか・発行・合流先を一組とする）。 | OSは「Backflow」を、表の目的・発行区分・合流先を一組として扱う。 | 入力不足や下流の発見と、必要な上流判断を入力する。 |
| HXT-TYPE-09 | 単体 | HELIXOS-L2-010 | 「ticketの種類」の「Reverse」行全体（何のticketか・発行・合流先を一組とする）。 | OSは「Reverse」を、表の目的・発行区分・合流先を一組として扱う。 | Scrum部分のcheckpointを計画し、sprint review前・release candidate合流前・public contract／DB schema／主要dependency／NFR budget変更時という既存条件を当てる。日付や周期を新設しない。 |
| HXT-TYPE-10 | 単体 | HELIXOS-L2-009／HELIXOS-L2-010 | 「ticketの種類」の「Recovery」行全体（何のticketか・発行・合流先を一組とする）。 | OSは「Recovery」を、表の目的・発行区分・合流先を一組として扱う。 | 逸脱・context切れと復旧地点を確認する。許可範囲を越える復旧を自動許可しない。 |
| HXT-TYPE-11 | 単体 | HELIXOS-L2-010 | 「ticketの種類」の「Incident」行全体（何のticketか・発行・合流先を一組とする）。 | OSは「Incident」を、表の目的・発行区分・合流先を一組として扱う。 | 本番で起きた障害・対応結果・恒久対策の根拠を記録する。 |
| HXT-TYPE-12 | 単体 | HELIXOS-L2-010 | 「ticketの種類」の「Refactor」行全体（何のticketか・発行・合流先を一組とする）。 | OSは「Refactor」を、表の目的・発行区分・合流先を一組として扱う。 | 範囲と振る舞い保存の根拠を入力する。 |
| HXT-TYPE-13 | 単体 | HELIXOS-L2-010 | 「ticketの種類」の「Design-refactor」行全体（何のticketか・発行・合流先を一組とする）。 | OSは「Design-refactor」を、表の目的・発行区分・合流先を一組として扱う。 | 設計構造の変更範囲と外部の振る舞いを保つ根拠を入力する。 |
| HXT-TYPE-14 | 単体 | HELIXOS-L2-010 | 「ticketの種類」の「Performance-refactor」行全体（何のticketか・発行・合流先を一組とする）。 | OSは「Performance-refactor」を、表の目的・発行区分・合流先を一組として扱う。 | 測定条件・測定結果を確認する。測れない高速化を成立させない。 |
| HXT-TYPE-15 | 単体 | HELIXOS-L2-010 | 「ticketの種類」の「Redesign」行全体（何のticketか・発行・合流先を一組とする）。 | OSは「Redesign」を、表の目的・発行区分・合流先を一組として扱う。 | 外部の約束・要求・受入条件の変更を既存の判断主体へ戻す。 |
| HXT-TYPE-16 | 単体 | HELIXOS-L2-010 | 「ticketの種類」の「Retrofit」行全体（何のticketか・発行・合流先を一組とする）。 | OSは「Retrofit」を、表の目的・発行区分・合流先を一組として扱う。 | 移行範囲と段階・結果を確認する。 |
| HXT-TYPE-17 | 単体 | HELIXOS-L2-010 | 「ticketの種類」の「Research」行全体（何のticketか・発行・合流先を一組とする）。 | OSは「Research」を、表の目的・発行区分・合流先を一組として扱う。 | 参考ソースと出典を確かめ、裁定はResearchに含めない。 |
| HXT-TYPE-18 | 単体 | HELIXOS-L2-010 | 「ticketの種類」の「Add-feature」行全体（何のticketか・発行・合流先を一組とする）。 | OSは「Add-feature」を、表の目的・発行区分・合流先を一組として扱う。 | 既存の層へ追補する機能差分を定める。 |
| HXT-TYPE-19 | 単体 | HELIXOS-L2-010 | 「ticketの種類」の「Version-up」行全体（何のticketか・発行・合流先を一組とする）。 | OSは「Version-up」を、表の目的・発行区分・合流先を一組として扱う。 | 後の版へ回す項目と取り込む時期を計画する。 |
| HXT-TYPE-20 | 単体 | HELIXOS-L2-010／HELIXOS-L2-005 | 「ticketの種類」の「Experiment（案）」行全体（何のticketか・発行・合流先を一組とする）。 | OSは「Experiment（案）」を、表の目的・発行区分・合流先を一組として扱う。 | LABOが比較条件と追加実行の要否を評価する。観測だけで足りる場合は新ticketを求めない。 |
| HXT-TYPE-21 | 単体 | HELIXOS-L2-010／HELIXOS-L2-005 | 「ticketの種類」の「Training（案、3.0）」行全体（何のticketか・発行・合流先を一組とする）。 | OSは「Training（案、3.0）」を、表の目的・発行区分・合流先を一組として扱う。 | LABOの材料の利用区分と評価、既存の判断主体の裁定を使う。3.0の案を現行の実行許可にしない。 |
| HXT-FLOW-01 | 接続 | HELIXOS-L2-010／HELIXOS-L2-002 | PoC／Prototype→Backflow→要求エンジンの2次形成→Decide→Forward。 | 適用を別判定し、結果を要求へ還流して裁定へつなぐ。採用時だけForwardへ進め、不採用・方針変更の分岐は種類表を保つ。 | 人が持つ要求・画面の合意と裁定を入力する。 |
| HXT-FLOW-02 | 接続 | HELIXOS-L2-010／HELIXOS-L2-005 | Incident→運用評価（L12）、恒久対策→Reverse→Forwardの該当層。 | 緊急対応、運用評価、恒久対策の戻し先を接続する。 | 障害事実と恒久対策の根拠を入力し、影響した要求・設計を確認する。 |
| HXT-FLOW-03 | 接続 | HELIXOS-L2-010 | Version-up→Decide→Add-feature→Forwardの該当層。 | 後の版の項目を保全し、取り込み時の裁定と追加差分へ接続する。 | 取り込み時期・裁定・既存層の差分を判断する。 |
| HXT-FLOW-04 | 接続 | HELIXOS-L2-010 | 範囲不明・途中の検証必要→Discovery→発行元のticket。 | 範囲が不明ならDiscoveryへ接続し、結果を発行元へ戻す。 | 未知の事象・検証結果と範囲を確かめる。 |
| HXT-FLOW-05 | 接続 | HELIXOS-L2-010／HELIXOS-L2-011／HELIXOS-L2-008 | Forward 小・中・大の合流、検収によるCI導出と省略検査の回収。 | HARNESSの義務に従い、PR前の範囲をticket・V字の対・コネクタ・変更種類から組み立て、範囲超過で止める。省いた検査を記録して合流先で回収する。要求identityごとの進行・成立を分け、上位固有の義務との差分を満たしてから上位完了を記録する。Affected／Unaffected／Unknownと成立を混同せず、Backflowで分類を変えたら新revisionからticket・設計義務・検証義務を導き直す。 | 変更範囲・接続・統合先と根拠を確認する。Unknownを根拠なしにUnaffectedへ補完しない。 |
| HXT-FLOW-06 | 接続 | HELIXOS-L2-002／HELIXOS-L2-005／HELIXOS-L2-007 | 閉じたticketの後日失敗→証拠付きrelation→LABO振り返り→OS改善候補の登録・還流。 | 元のclosureを保存し追補評価を接続する。LABOが返す原子CI・コネクタ契約の評価を改善候補として登録して振り分ける。 | 因果の証拠を調べ、LABOが評価する。時間的な近さや同じpathだけで原因を断定しない。 |
| HXT-FLOW-07 | 接続 | HELIXOS-L2-010／HELIXOS-L2-002 | 独立reviewのfinding→推進の振り分け→今のPRの作成レーン又は同じ因果IDの次ticket。 | 同じ責務・既存scope内で安全かつ局所的に閉じるものを一括返却し、独立責務・別設計・lifecycle・性能改善は次ticketにする。 | 独立reviewが根拠を出し、責務・scopeの判断材料を確かめる。AIの自由判断だけでfindingを捨てない。 |
| HXT-FLOW-08 | 接続 | HELIXOS-L2-010／HELIXOS-L2-005 | LABOの比較実験依頼→OSのExperiment登録・実行→LABO評価→Feedback→OS。 | 追加実行だけを別ticket・別予算・別列で運転し、評価対象と評価作業を分離する。観測だけで足りる評価には発行しない。 | LABOが比較条件を固定し評価する。予算等の人の境界を入力する。 |
| HXT-FLOW-09 | 接続 | HELIXOS-L2-010／HELIXOS-L2-005 | INTELLIGENCEのTraining案→OS登録→LABO評価→Decide（3.0の案）。 | 利用区分付き材料の学習の案と登録、評価、裁定の接続を保つ。 | LABOが材料の利用区分・評価を担い、既存の判断主体が裁定する。 |
| HXT-SYS-01 | 構成体 | HELIXOS-L2-010／HELIXOS-L2-011／HELIXOS-L2-008／HELIXOS-L2-002 | HARNESSのコア→INTELLIGENCEの計画・配置案→OSの推進によるticket・動的ワークフローの導出と発行→検収の検証計画・CI組み立て。ticket節の共通条件全体。 | OSは計画又は事象から種類・対象・親要求と版・変更範囲を保って発行する。上流段階も登録済み要求とBackflowから発行する。周辺機構は発行せず、BRAINは汎用の設計知識を渡す。案は無条件に実行しない。開発方式をticket種類とせず、進め方をticket内に持つ。ticketを正、Issue／PRを映しとし、closeやmergeだけで完了にしない。1.0は定義済み部品の規則による組合せ・差戻しに限り、部品外の流れの生成は4.0とする。 | 人は既存のauthority境界に従って意味・予算・危険操作の境界を決める。運用は計画・事象・判断の根拠を入力する。システムへ吸収する条件と運用で補う判断を混同せず、未決は判断済みに補完しない。 |
| HXT-USE-01 | 単体 | HELIXOS-L2-004／HELIXOS-L2-010 | 「周辺の機構の作業とticketの種類の対応」のbotとWeb提供側jobの境界。 | CrawlerはResearch、Bugbotは発生元ticket内の割当てとし、新しい種類を足さない。WEB-OSの展開後jobを内部OSのstate・writer・authorityへ収容しない。 | Bugbotは既存の限定修復条件に従う。WEB-OSのjobの扱いはWEB-OSを要求へ落とすときに決め、内部OSが推測で種類を作らない。 |

## HELIX自身の段階リリース

本節は[2026-09-27のPO判断](../../governance/decisions/stage-release-po-decisions-2026-09-27.md)に従う未採否の候補である。HELIXを1.0の完成まで一度に作るのではなく、構築の途中から、検証済みのパックを組み合わせた稼働構成を段階ごとにリリースし、それを使って次の段階を作る。本節から採択、L3承認、実装許可、最初の段階リリースの実施、外部公開を生成しない。

| L2要求 | 粒度 | 親L1候補 |
|---|---|---|
| HELIXOS-L2-014 | 構成体（HELIX自身の段階リリース） | HELIXOS-L1-005／HELIXOS-L1-007／HELIXOS-L1-008 |

### HELIXOS-L2-014 HELIX自身の段階リリース

人間は、HELIXを1.0の構築過程から、検証済みのパックを必要な依存とともに組み合わせた段階的な稼働構成（段階リリース）としてリリースし、各段階の能力・構成・証拠を保存・再現できる。前の段階を使いながら次の段階を構築・検証し、案件の状態を保って更新・復旧できる。段階リリースの成立と、1.0の到達判定は別に判定する。

- **呼び方**：段階リリースはv0.1、v0.2…のように識別し、1.0の到達判定を通った構成をv1.0（本体）とする。これはHELIX自身の段階リリースの識別子であり、外部公開の版番号ではない。外部公開やWeb提供は、段階リリースとは別に判断する。
- **同じパックから組む**：段階リリースを別系統の簡易実装にしない。[HARNESS-L2-010](../../helix-harness/L2-requirements/product-requirements.md#harness-l2-010-パックの境界)のパックから組む小さな稼働構成とし、次の段階ではパックを追加・更新する。各パックに必要な安全の依存を含めて組み、無関係な機構の完成を待たない。必要な安全の条件が欠ける段階はリリースしない。
- **狭くても一周する**：各段階は、対応する範囲を限ってでも、要求の確認→作業→検証→結果の記録まで仕事が一周して終わる構成とする。全部の機能を薄く並べることを段階の成立としない。自動化していない工程を人が担う場合は、その分担を明記する。
- **一組として保存するもの**：使うパックと依存の版、必要な設定・data形式、対応環境、できること・できないこと、その範囲の受入の証拠、更新・切戻しの条件を一組にする。ソースのtagだけを段階リリースとしない。
- **混ぜないもの**：案件の実data、秘密情報、資格情報を段階リリースへ含めない。これらのbackupと移行は別に扱う（HELIXINFRASTRUCTURE-L1-017〜019、資格情報の方針はHELIX-SECURITY）。
- **前の段階で次を作る**：安定した段階リリースで次の段階を開発し、新しい構成を検証してから乗り換える。新しい段階に問題があれば前の段階へ戻せ、前の到達点を失わない。乗り換えと戻しで、案件の状態と記録を引き継ぐ。
- **自己依存を持たない**：各段階は、開発中のHELIX自身（未リリースの作業tree、次の段階、稼働中の別の段階）に依存せずに起動・更新・復旧できる（HELIXINFRASTRUCTURE-L1-020）。宣言のない依存を使わない（HARNESS-L2-010）。段階を細かく切ることで、隠れた自己依存を見つけて取り除く。
- **判定を分ける**：段階リリースの成立は、その段階で宣言した範囲の受入・統合・更新・切戻し・運用の検証で、個別のパックの成功とは別に判定する。1.0の到達判定は、Conceptの1.0の完成条件で別に判定する。段階リリースが出たことを理由に、最終の要求や、その段階で必要な品質条件を減らさない。減らすのは各段階の提供範囲だけである。
- **所有の分担**：OSは段階リリースの構成管理・生成・検証・配布・切戻しの運転と証拠を持つ。パックの境界と検証・受入の契約はHARNESS（HARNESS-L2-010／011／022）、実行環境の構成の識別と巻き戻しはHELIX-INFRASTRUCTURE（1.0の範囲のHELIXINFRASTRUCTURE-L1-017〜020／022）が持つ。対象製品のリリース（HARNESSのサービス⑥）と、HELIX自身の段階リリースを混同しない。
- **後の版の能力を前提にしない**：各段階は、その時点で成立している能力だけで組む。まだ成立していない能力（1.0の範囲のものを含む）は、その段階の「できないこと」として明記し、必要なら人の分担で補う。Infrastructureの変更を候補・隔離・部分の適用・昇格と段階を踏んで適用する能力（HELIXINFRASTRUCTURE-L1-023、1.0より後、版は未定）は後の拡張であり、その完成を段階リリースの成立の前提にしない。本要求から023の前倒しを導かない。
- **旧HELIXとの関係**：FRS-BR-008（正式配布の前から、必要な検証を保って内部で使う）とFRS-BR-009（安全依存閉包、検収済みの組合せを個別の成功とは別に確かめる）を起点にする。本書「提供・再編要求の具体化」でのFRS-BR-008の不採用は旧CIの先行利用に限り、本要求は旧CIを使わない。Lite／Fullの名前は採らない。対応表は判断記録の「旧HELIXとの対応」に置く。


## HELIX-OS機能単位の要求候補（G1・未採択）

以下は既存HELIXOS-L2-001〜014を削除・置換せず、ConceptとHELIX-OS L1の現行責務に機能単位で接続する追補候補である。既存本文・表・例外・非機能条件・数値・未決事項はそれぞれの元のIDと位置に残り、この追補は要約で置き換えない。既存条件を束ねる対応表は参照indexであり、source atomの移管、縮退、retire、採択を行わない。HELIX-OSは製品ではなく、HELIX自身と対象project群を管理・推進・検収する機構である。

この起草の親入力はdraft base `719e05d579584ac961256bdb8b11f8fc7b643a14`の[Concept](../../concept/helix-concept.md)（SHA-256 `06e210c312fc6a5f18c1fc29248e55ebe9c2eee0c177006e32d7b421af8baa78`）と[HELIX-OS L1企画候補](../L1-planning/system-intent.md)（SHA-256 `2bb62571308aa1fde0351ca7242e961ddd25b9c4722196c7bb255cf3ad1cfe0e`）である。両親の現行本文はcandidate revisionであり、本節から採択・実装許可を生成しない。候補ID自体が各要求identityであり、パックを別要求IDや物理packageとするものではない。個別に交換・更新できる将来のパック実体は、各要求候補の境界に従って別の機能identityを持ち、少なくとも契約version、成果物version、依存identity/version、検証範囲、適用対象・収載/除外、互換範囲、更新/復旧先を相互参照可能にする。`version_target`は到達目標であり、契約版・成果物版の値や採択状態を表さない。identity/version/依存/検証範囲が不明または互換性不明の間は交換・更新を完了扱いにしない。契約・成果物・依存versionが変わった場合は影響する接続をstale化し、該当範囲を再検証する。交換途中の部分成功、未完義務、復旧先は引き継ぎ、個別パックの成功を接続・構成体へ自動伝播しない（HARNESS-L2-010／011の機能単位・接続・構成体の境界に接続）。

### HELIXOS-L2-015 管理・authority記録（単体候補）

- **親L1**：HELIXOS-L1-001／008。
- **入力**：対象とsourceのidentity・revision・digest、actor・時点、正本、判断record、意味未分類の原event、および訂正・競合・staleの事実。
- **提供**：対象別Concept・L1・要求・採否・合意revision・責務と出所を登録し、正本とIssue/PR等のprojectionを分けて参照する管理記録。
- **保証**：authorityの出所・対象revision・差分・訂正履歴を辿れ、原eventは後から分類しても不変。管理record、PR、Issue、CI、memoryから要求意味・人間decision・実装許可を生成しない。
- **単独成立の依存**：対象別の正本とauthority記録形式、Concept 1.0の共通ログ・証拠形式。version_targetは1.0の土台。
- **失敗時の戻し先／未完義務**：対象不明、revision不一致、digest欠落、authority conflictは管理record上で未解決に保ち、出所となる正本・判断主体へ返す。未解決状態と訂正前eventを次の処理へ引き継ぐ。
- **束ねる既存条件**：HELIXOS-L2-001／003／007のうち正本・判断source・対象revision・責務、共通統制とproduct方式の分離に関する条件。既存L2のそれ以外の条件も元の箇所に存続する。

### HELIXOS-L2-016 Portfolio trace・状態（単体候補）

- **親L1**：HELIXOS-L1-002／007／008。
- **入力**：対象要求と版、HARNESS契約版、unit/connection/composite identityと関係、依存・owner・実差分・検証・提供・運用記録。
- **提供**：対象ごとの要求から作業・実装・検証・提供・運用までの状態とtrace。欠落・競合・staleを正本revisionへ関連づける。
- **保証**：未接続、未合意、未実装、未検証、未提供、unknown、staleを区別し、下位の成功から接続・構成体・別projectの完了を推定しない。提供状態をrelease kanban上で追跡する。
- **単独成立の依存**：L2-015、対象ごとのHARNESS/製品正本、関係するconnectionと検証・evidence記録。version_target: 1.0の対象機構に適用。
- **失敗時の戻し先／未完義務**：owner・依存・実差分・検証先が不明ならunknown/conflictのまま対象要求または関係するsourceへ返す。未解決edgeとstale理由を保持し、再評価するまで下流完了に進めない。
- **束ねる既存条件**：HELIXOS-L2-002／006／007／008／011／014から、portfolio trace、提供kanban、依存・impact・検証計画・段階リリース状態に関する条件。L2-014自体は独立した既存構成体要求として残る。

### HELIXOS-L2-017 推進・ticket/workflow（単体候補）

- **親L1**：HELIXOS-L1-009／010。
- **入力**：管理が登録した目的・要求・制約・許可・優先度・依存・資源・予算・期限・停止条件・HARNESS版・接続状況、INTELLIGENCEの計画案、HARNESSの工程契約。
- **提供**：対象・kind・親revision・scope・依存・受入義務・戻し先を結ぶticket graphと、適格性確認後のworkflow instance。
- **保証**：推進はOSが担い、INTELLIGENCE案を無条件に採らず、HARNESSの工程語彙・順序・義務をOS内で再定義しない。1.0ではHARNESS定義済み工程部品の規則的な組合せと途中結果による差戻しを行う。部品にない流れまで組み立てる能力は`version_target: 4.0`として保持し、1.0の成立条件にしない。
- **単独成立の依存**：L2-015／016、HARNESS工程契約、SECURITYのauthority制約、INTELLIGENCEの案とLABOの水準が提供される場合の評価材料。version_target: 1.0。
- **失敗時の戻し先／未完義務**：入力不足・unknown・conflict・未解決依存・scope逸脱はticketを実行可能にせず、未解決の要求・許可・依存へ返す。再開時に元の要求revision、停止理由、未完義務、予算/期限制約を維持する。
- **束ねる既存条件**：HELIXOS-L2-003／010／011、現行のticket意味・workflow・handoffを記すHXT-TYPE-01〜21／HXT-FLOW-01〜09／HXT-SYS-01、およびHELIXOS-L2-008／010／011の部品workflow・検収・統合計画条件。Execution Ticket旧候補の条件は旧source basisとして確認し、存在しない現行IDを作らない。旧mode名や一本道workflowを追加しない。

### HELIXOS-L2-018 Worker割当・実行統制（単体候補）

- **親L1**：HELIXOS-L1-003。
- **入力**：L2-017のticket revision/digest、配置案、LABO/HELIX-Benchのモデルクラス水準、SECURITY制約、INFRASTRUCTUREの資源状態、レーンとWorkerの実行結果。
- **提供**：assignmentとattemptの追跡、許可範囲内の割当・進行・停止・成果回収、および担当交代時のhandoff。
- **保証**：ticket・要求revision・authority・Worker・呼出しレーン・scope・予算・期限・成果・証拠を辿る。assignmentは実行の制約/認可や実資源の正本を代行しない。作成Workerが自分の成果を承認または独立review済みに扱わない。provider名のみで独立性を判定しない。
- **単独成立の依存**：L2-017、SECURITYの権限・制約、INFRASTRUCTUREの資源、LABOの水準とINTELLIGENCEの配置案。version_target: 1.0。
- **失敗時の戻し先／未完義務**：権限・lease・capability・期限・予算・head等の不一致は実行を停止し、停止理由を記録して管理/推進へ返す。交代・失効後も累積制約と未完義務を引き継ぎ、二重作業を防ぐ。
- **束ねる既存条件**：HELIXOS-L2-004／009、ticket詳細のassignment/attempt/recovery、resident-laneとthree-lane由来の委譲・handoff・自己承認防止条件。固定provider数や旧Runner/Sandbox主体を導入しない。

### HELIXOS-L2-019 Evidence・continuity（単体候補）

- **親L1**：HELIXOS-L1-002／003／004／008。
- **入力**：共通形式のevent、source/revision、相関ID、actor、data-use class、実行・検証結果、訂正、checkpoint、未完義務。
- **提供**：episode内の要求・判断・変更・実行・検証・手戻り・運用結果の原記録、参照、再構築用projectionと再開情報。
- **保証**：欠落、重複、stale、拒否、未実行を成功証拠から分け、provenanceと訂正履歴を保つ。担当/session/runtimeが変わっても期限、budget、失敗回数、未完義務とscopeを失わない。provider memoryをcontinuityの正本にしない。
- **単独成立の依存**：L2-015／018、Concept 1.0の共通ログ・証拠、利用区分、機構間接続契約。version_target: 1.0の土台。
- **失敗時の戻し先／未完義務**：書込・projection・replayに失敗した記録は成功checkpointとして公開せず、失敗位置から再構築する。欠落証拠を発生元の機構へ戻し、再開時も失敗と未完義務を保持する。
- **束ねる既存条件**：HELIXOS-L2-001／002／004／005／007／009、およびHBR-P7/P9由来のprovenance、event、projection整合、bounded continuity条件。

### HELIXOS-L2-020 検収・CI運転（単体候補）

- **親L1**：HELIXOS-L1-004。
- **入力**：ticket graph、承認済み要求/pair/oracle、HARNESS版と検証義務、実差分/base、runner/環境、必要なconnection/evidence。
- **提供**：ticket/変更に必要なCI profileの組立、隔離実行、結果の回収・監視・再開。
- **保証**：HARNESSが検証義務を定め、OS検収が実行を組み立て運転する。success/fail/denied/skipped/interrupted/staleを区別し、上流意味review・利用者受入・merge・releaseをCI結果へ統合しない。oracleをOS判断で追加・削除しない。
- **単独成立の依存**：L2-016／017／019、HARNESS検証契約、SECURITY制約、INFRASTRUCTURE実行資源。version_target: 1.0。新世代CI未構築のため、旧CIを実行・代用しない。
- **失敗時の戻し先／未完義務**：検証不足・oracle欠落・環境違いは未完としてHARNESS契約またはticketへ返す。中断・失敗では同じHEAD/義務/許可境界に束縛した未完状態を引き継ぐ。
- **束ねる既存条件**：HELIXOS-L2-002／007／008／011、HBR-P3/P6およびHR-FR-HYB-010由来の動的検証・隔離・証拠・計画/実行責務分離。

### HELIXOS-L2-021 HARNESS構成版の対象project配布・更新・復旧（単体候補）

- **親L1**：HELIXOS-L1-005／007。
- **入力**：選択するHARNESS構成版のexact component set/source/artifact、要求revision、対象project、許可scope、互換性・適格性・運用証拠。
- **提供**：HARNESS構成版を対象projectへ配布・更新・復旧し、candidate/active構成版、対象、artifact、操作状態、復旧先を追跡するOSの配布運転。
- **保証**：bundleへの収載・除外を明示し、別artifactへの切替や既存成果の無断消失を拒否する。対象projectのサービス提供版の配布・更新は、HELIX自身（全機構のパック）の段階的な稼働構成・切戻しを定めるHELIXOS-L2-014と別identity・別判定である。021はHARNESS構成版をprojectへ導入する能力に限られ、HELIX全体のstage releaseをサービスの選択配布へ読み替えない。選択対象と必要な安全依存だけを配布でき、他の全製品の完成待ちを前提にしない。未決の後続能力は`version_target`を保ち、1.0の依存にしない。
- **単独成立の依存**：L2-015／016／019／020、HARNESSの該当サービス契約・artifact、SECURITYの操作authority、INFRASTRUCTURE資源。個別project配布の構成版scopeは選択対象と必要依存に限る。HELIX自身のstage releaseはL2-014を構成体identityとして参照し、1.0全体判定はL2-025で別評価する。
- **失敗時の戻し先／未完義務**：適格性・互換性・source digest・権限不明なら導入を止め、管理/提供元へ返す。更新失敗では直前qualified版または明示replacementの復旧先、途中成果と未完義務を保持する。tag/publication/cutoverを無許可で行わない。
- **束ねる既存条件**：HELIXOS-L2-002／006のHARNESS構成版の対象project配布、更新・復旧条件。HELIXOS-L2-014のHELIX自身の段階リリースは別構成体identityであり、021の意味へ統合しない。FRS-BR-001〜007/009の機能単位・明示収載・成熟度・impact・再現性・rollback・安全閉包条件を参照する。旧Slice/Module/Bundle名、channel、固定構成数を正本化しない。

### HELIXOS-L2-022 改善候補登録・還流（単体候補）

- **親L1**：HELIXOS-L1-006。
- **入力**：対象/要求revision、source event、適用範囲、HELIX-LABOの独立評価・提案・比較実験依頼、判断状態、還流先候補。
- **提供**：観測→候補→既存判断主体の採否→ticket→変更・検証→再観測への登録・振分け・trace。
- **保証**：OSは候補を記録しticket化を進行するが、改善の効果・退行を評価するownerはLABOであり、LABOの提案から要求・設計・authorityを直接変更しない。知識取込やローカルLLM学習など後続版の機能を1.0に持ち込まない。
- **単独成立の依存**：L2-015／016／019、LABO評価契約、対象正本、判断主体とticket契約。改善循環の記録は1.0土台。
- **失敗時の戻し先／未完義務**：評価・適用範囲・判断先・還流先が不明なら候補を未解決のまま保持し、評価または人間decisionの該当主体へ返す。棄却理由・再評価条件・未完の再検証義務を失わない。
- **束ねる既存条件**：HELIXOS-L2-005／007およびHBR-P4/P7/P8由来の観測・feedback・根拠・再検証。L2-012/013の移管済み研究・横断診断ownerをOSへ戻さない。

### HELIXOS-L2-023 管理→推進→Worker→検収の受渡し（接続候補）

- **親L1**：HELIXOS-L1-001／002／003／004／009／010。
- **入力**：L2-015/016のauthority・接続状況、L2-017のticket、L2-018のassignment/attempt、L2-020の検証義務と結果、L2-019のevidence。
- **提供**：管理から推進、Worker、検収、管理への一連のhandoffを、対象revision/digest・因果ID・scope・未完義務・停止理由・証拠に束縛する。
- **保証**：各単体、接続固有条件、構成体条件を別に確認する。単体成立からhandoffまたは次段受入・ticket完了を自動生成しない。管理/推進/検収/Workerの責務は交差してもauthorityを混同しない。
- **単独成立の依存**：L2-015〜020の各必要unitとversioned interface、SECURITY/INFRASTRUCTUREとの対応する境界。version_target: 1.0。
- **失敗時の戻し先／未完義務**：handoffのrevision/digest/authority/証拠不一致は接続を未成立として保持し、発生側の正本または管理へ返す。受信側が未完義務を受理した証拠が揃うまで元ticketを完了にしない。
- **束ねる既存条件**：HELIXOS-L2-001〜004／007〜011、現行のticket詳細ID HXT-TYPE-01〜21／HXT-FLOW-01〜09／HXT-SYS-01／HXT-USE-01が示すticket graph・種類・flow・構成体・周辺job境界。

### HELIXOS-L2-024 HARNESS提供・運用→LABO→OSの受渡し（接続候補）

- **親L1**：HELIXOS-L1-005／006／007。
- **入力**：L2-021の提供版・対象・許可scope、利用/運用実績、L2-019の共通evidence/data-use classification、LABO評価とFeedback。
- **提供**：対象別成果をLABO評価へ渡し、その結果をOSの改善候補・判断先・採択後ticket・検証・再観測へ戻す接続。
- **保証**：顧客/Web tenant・権限・dataと本体OS authorityを分離し、許可された範囲を越えて記録を共有しない。提供完了、運用記録、LABO評価、要求採否、改善効果を別状態にする。
- **単独成立の依存**：L2-019／021／022、版付きLABO接続、SECURITYのdata-use/操作境界。version_target: 1.0で後続の観測受け口を用意するが、後の版の学習・推薦自体は依存にしない。
- **失敗時の戻し先／未完義務**：利用許可・data class・対象revision・評価範囲の不一致は送信/候補採用を止め、権限ownerまたはLABOへ返す。未評価、未判断、再検証待ちを引き継ぐ。
- **束ねる既存条件**：HELIXOS-L2-005／006／007／014、Conceptの成長循環および1.0ログ/data-use土台。

### HELIXOS-L2-025 HELIX-OS統合運転（構成体候補）

- **親L1**：HELIXOS-L1-001〜010。L1-011/012の移管済み研究・横断診断をOS機能として含めない。
- **入力**：採用済み対象revision、選択されたHARNESS構成版、L2-015〜024の各identity/revision/state/evidence、既存人間判断と停止条件。
- **提供**：HELIX自身と性質の異なる複数projectについて、要求形成・authorityからticket、Worker、検収、提供/運用、LABO評価、OS還流までを説明・統制する構成体の状態。
- **保証**：単体・connection・compositeは別identity。1.0全体の確認ではHARNESSの7製品それぞれの単体成立、選択構成のconnection、構成体固有の端から端の受入を個別に確認する。各種未完・unknown・stale・未許可・人判断待ちを隠さず、2.0/3.0/4.0/5.0の能力を1.0条件の前提にしない。
- **単独成立の依存**：L2-015〜024の該当revision、Conceptと対象別L1/L2、HARNESS/周辺機構の必要な接続契約、許可された資源。version_target: 1.0の全体到達確認に限る。個別の初期配布や単体成立は全7製品の完成待ちを要さない。
- **失敗時の戻し先／未完義務**：端から端のtraceやconnectionが欠ける場合、欠けたsource/unit/connectionへ返し、未完の受入義務を保持する。構成体の状態をunit単独成功で上書きしない。
- **束ねる既存条件**：HELIXOS-L2-001〜011／014のうち統合固有条件。HELIXOS-L2-012/013は対象外でありLABO移管状態を維持する。

### 既存ID対応index

| 既存要求 | 新候補の参照先 | 追跡する原条件 |
|---|---|---|
| HELIXOS-L2-001 | 015／016／019／023／025 | 正本・判断出所・revision・trace |
| HELIXOS-L2-002 | 016／019／021／023／024／025 | 要求から運用までの欠落/stale/競合、release kanban状態 |
| HELIXOS-L2-003 | 015／017／023 | 共通統制とproduct方式の分離、変更影響の伝播 |
| HELIXOS-L2-004 | 018／019／023 | Worker割当・実行・回収、scope/予算/依存/review制約 |
| HELIXOS-L2-005 | 022／024／025 | 観測、LABO評価、Feedback、採否後ticketと再検証 |
| HELIXOS-L2-006 | 021／024／025 | 7製品の提供・更新・復旧、および許可された受渡し |
| HELIXOS-L2-007 | 015／016／019／023／024 | 共通証拠、provenance、相関ID、data-use、欠落/stale |
| HELIXOS-L2-008 | 016／020／023／025 | HARNESS検証義務、CI組立・隔離実行・再開、review/受入分離 |
| HELIXOS-L2-009 | 018／019／023／025 | 中断・交代時の制約/budget/期限/未完義務、二重実行防止 |
| HELIXOS-L2-010 | 017／018／020／023／025 | 管理・推進・検収・Workerの責務分担、ticket workflow |
| HELIXOS-L2-011 | 016／017／020／023／025 | 統合順・単位・検証計画、実候補/base更新の再計画 |
| HELIXOS-L2-012 | 対象外。LABOの研究候補を参照 | 技術調査のownerをOSへ戻さず、HELIX-LABOへの移管状態を保つ |
| HELIXOS-L2-013 | 対象外。LABOの横断診断候補を参照 | 効果・横断診断のownerをOSへ戻さず、LABOおよびINTELLIGENCE/SECURITY等との責務境界を保つ |
| HELIXOS-L2-014 | 016／024／025。021は対象project配布との接続だけを参照 | HELIX自身（全機構パック）の段階稼働構成と候補/稼働版・切戻し。021のHARNESS構成版配布とidentity/判定を分ける |

このindexは既存条件の参照であり、既存本文の置換・圧縮ではない。要求IDの意味を変える、削減・分割・統合・retireする人間判断はここから生成しない。

### 旧source basisと現行L2保持箇所の根拠確認

旧sourceは現行L2の要求意味を保持している根拠の確認に用いる。次表は旧atomを新候補へ割り当てるcrosswalkではなく、新候補が既存L2の保持箇所を参照する際の根拠確認である。現行保持箇所は既存のHELIXOS-L2-001〜014の節・条件を示す。015〜025への新旧atom割当て、旧source atomの完全集合、意味変更・retireはここから主張しない。source atomの完全な無損失traceは別途のcarry-forward receiptで管理する。旧実装・workflow・CLI・DB・test・受入結果は移行せず、合格証拠にもしない。asset ID、archive path、source SHA-256は資産台帳と照合して記録する。

| 旧asset ID・source | SHA-256 | 旧sourceで確認した主題 | 現行L2に既にある保持箇所と変更境界 |
|---|---|---|---|
| `LEGACY-ASSET-18F7940E7994634D39A1` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md` | `7a73fa86acd8e5a7b755a9479f67c4d2af1579e533df101b1b3294eeceb0d8cc` | L46-67のHBR-P0/P1/P2/P3/P4/P6/P7/P8/P9にある逸脱・工程復帰、合意範囲継続、Worker、検証、改善、配布、記録、外部境界、traceの主題。 | 既存L2-001〜014のauthority・共通統制・Worker・改善還流・提供・証拠・検収・復旧・workflow・統合計画の条件を確認する根拠。旧自動修復・外部検索・memory・CI/gated-push実装は現行保持箇所とせず、旧sourceの方式を現行条件へ割り当てない。 |
| `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md` | `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` | L38-47、L49-79のHIL-BR-01〜28にある画面適用、workflow/ticket、trace、source/authority/scopeの主題。 | 既存L2-001／002／003／004／007／009／010／011／014のauthority・trace・scope・handoff・recovery・段階構成条件を確認する根拠。旧Issue/harness.db/Claude hook/固定agent構成は保持箇所としない。 |
| `LEGACY-ASSET-3A15E5645D2D2A59DFF5` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md` | `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b` | L18-185、L186-289、L376-508の旧ticket input/identity/dependency/admission/assignment/attempt/retry/review/evidence/lifecycle/projection/replay/security/release/management条件。 | 現行の保持箇所として、既存L2-004／007／008／009／010／011／014と、HXT-RQ／HXT-TYPE／HXT-FLOW／HXT-SYS／HXT-USEの現行本文を確認する根拠。旧候補IDを現行IDと同一視せず、旧runtime実装・DBを移さない。Worker/SECURITY/INFRASTRUCTURE/LABOの現行責務境界は現行L2本文による。 |
| `LEGACY-ASSET-201EED9C5D6D2FF4D41B` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md` | `bf47d434930bd701d368a49b725d49b00a5af2f385b6e1436b294f7b47796e20` | L21-67のFRS-BR-001〜009にある機能単位の独立確認、明示収載/除外、成熟度、impact、再現配布/rollback、安全依存、構成体の独立受入。 | 既存L2-002／006／008／011／014のportfolio trace、対象projectへの提供/復旧、検収、統合計画、HELIX段階構成条件を確認する根拠。旧Slice/Module/Bundle名・channel・個数を保持条件へしない。 |
| `LEGACY-ASSET-B75E46DBE77592351574` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md` | `eb1a7747afacd607217ee9e1905f87e629354a023102c1f32521ff8a9bc54a17` | L31-219のFRS-FR-001〜006/R-01〜24にあるidentity/lifecycle、ownership、admission/recovery、impact/CI、manifest/replay、要求coverageの主題。 | 既存L2-002／006／008／011／014のtrace・HARNESS構成版の配布/更新/復旧・検収・統合計画・HELIX段階構成条件を確認する根拠。旧Module/Bundle構成やchannelを現行の要求identityにしない。 |
| `LEGACY-ASSET-2B0DE689AA572DE66181` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/resident-lane-orchestration-requests.md` | `0ff33afc0cf22a4cf1ffb3f33334069f1d624f0f67f56451b16632ed6d5d52fe` | L1/L2のresident execution/lane/assignment/queue/continuity候補。 | 既存L2-004／007／009／010のWorker実行、記録、continuity、handoff条件を確認する根拠。旧常駐/provider固有方式は保持条件としない。 |
| `LEGACY-ASSET-A6926200F28B26300432` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/three-lane-cloud-governance-requests.md` | `e96a70f02c517f33d9cbdc43d92e6d7b36ded7bbf023226f1cc4f63b5f7c2765` | L1/L2の複数laneによる作成/review/承認分離候補。 | 既存L2-004／007／009／010のlane/Worker区別、独立review、authority、handoff条件を確認する根拠。旧provider数や3社固定を現行条件としない。 |

この根拠確認表は既存L2保持箇所の説明であり、旧atomから新候補への割当て、receiptの代替、要求意味の新規移管ではない。

保持位置はbase `719e05d579584ac961256bdb8b11f8fc7b643a14` の本書で次の行に固定する。今回もこれらの行は同一bytesで残る。

| 根拠source | 現行で保持する行・節 |
|---|---|
| pillar-requirements | 54〜62行（001〜009）、286〜305行（Worker・学習・ログ・CIの具体条件） |
| infinity-loop-platform-requirements | 103〜168行（ticketと上流作業・finding還流）、425〜457行（要求形成・人間反応） |
| execution-ticket-requirements | 534〜609行（Execution Ticket、HXT-RQ-01〜07、HXT-TYPE-01〜21、HXT-FLOW-01〜09、HXT-SYS-01、HXT-USE-01） |
| functional-release-slice-requests / requirements | 459〜493行（提供・再編の具体条件と保持/不採用範囲）、611〜633行（HELIX自身の段階リリースの別identity） |
| resident-lane-orchestration / three-lane-cloud-governance | 57・62行（004/009）、219〜229行（Worker capacity）、293・298行（Worker/記録）、396〜423行（継続と再構成）、534〜609行（割当てと試行・handoff） |

### 人の判断が残る点

- 親Concept/L1の現行本文は未承認candidate revisionであり、そのexact revisionを採るかはこの候補から決めない。
- L2-015〜025と既存L2-001〜014の対応・束ねは、原要求意味の削減・縮退・retireやtarget adoptionを承認しない。source atomの意味変更・retire等が必要なものは対応する人間decisionへ残す。
- Conceptの版境界1.0/1.x/2.0/3.0/4.0/5.0を改訂しない。後続版能力を前版の成立条件にしない。個別配布は選択された適格サービスと必要安全依存を対象にし、7製品全体の完成判定と混ぜない。
