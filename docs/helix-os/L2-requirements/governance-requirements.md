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

## 段階リリース範囲の要求導出（G8・未採択）

### HELIXOS-L2-026 段階リリース構成の要求導出（単体能力候補）

[PO原文](../../helix-connect/sources/connect-l1-po-original-2026-09-27.md)の「段階リリースは機能として成立する部分を決めてだからほかの要求から導出する仕組みだろ」を受けた候補である。`version_target: 1.0の構築過程から`。v0.1はその過程の構成識別子であり、1.0到達判定や外部公開版を意味しない。

- **種別**：unit。入力要求から構成案と不足を返すOSの導出能力を一単位として扱う。出力される段階構成のcomposite受入はHELIXOS-L2-014の別判定であり、本能力の受入成功へ畳み込まない。
- **親L1**：HELIXOS-L1-002／HELIXOS-L1-005／HELIXOS-L1-007／HELIXOS-L1-008。HELIX自身の段階構成を管理・追跡し、要求・projectionの欠落や不整合を把握する企画意図に接続する。現行Conceptを親とし、L1はdraft_candidateの対象revision確認待ちである。本候補からL1の確認やL2の採択を生成しない。
- **親L2・契約**：HELIXOS-L2-014の段階構成条件、HARNESS-L2-010のpack境界、HARNESS-L2-011の呼出し・権限・隔離・中断再開条件、HARNESS-L2-022の検証と受入契約を参照する。G1〜G7で起こした各機構の単体・接続・構成体候補を導出入力として扱う。候補の存在・ID・記載だけを要求の採択、依存の充足、pack成立の証拠にしない。
- **受け取るもの**：対象revisionとsource authority、目的・仕事範囲、候補要求identityとその状態、要求ごとの入出力・契約版・依存・安全条件・検証範囲、使える環境・権限・人が担う工程と許容分担、候補pack境界、更新・復旧条件。これらと比較基準を同じrevisionへ束縛する。
- **提供するもの**：同じ目的・仕事範囲・許容分担・候補pack境界の下で要求から導いたpack集合とその依存・安全依存の閉包、各packの版・適用対象・収載/除外・入出力・検証条件、要求確認→作業→検証→結果記録まで閉じる経路、成立していない能力の「できないこと」、未解決依存・不足入力・人の担当・戻し先、比較対象の代替構成と再現・更新・切戻しに要る情報。
- **導出規則**：要求に必要な機能を目的達成に必要な範囲で含み、要求・契約・安全依存を全て閉じ、HELIXOS-L2-014の範囲で一周の仕事が成立する集合を比較する。最小性を論じる際は、目的、仕事範囲、許容人分担、候補pack境界、適格性条件、比較基準を固定し、成立する代替構成の候補空間と比較結果を示す。ある集合からpackを一つずつ除いて成立しないことだけでは、候補空間全体に対する最小性の証明としない。代替構成の探索範囲・境界根拠・比較が不足する場合は「最小候補／未立証」と表示し、最小性が証明済みの選定結果とは扱わない。依存閉包の成立可否、実行・受入証拠の充足、最小性の立証を別々に記録し、最小性の未立証だけで既に確かめた依存閉包まで否定しない。空集合、安全依存の省略、境界・分割・所有・版が未決のpackを仮分割した集合は候補から除外する。依存・安全依存がunknown、欠落、conflict、stale、または互換性不明なら不足として保持し、依存が閉じた成立構成としては扱わない。
- **保証する分離**：後の版の能力を前段階の必要条件へしない。段階の起動・更新・復旧を、開発中の未release作業tree、後続段階、または稼働中の別段階なしで成立させる（HELIXOS-L2-014）。要求間のsource trace参照と、起動・更新・復旧に必要な実行前提の依存を分け、trace上の循環だけから実行上の自己依存と断定しない。実行前提が自己bootstrappingの循環を作る場合は不足として示す。pack単体、接続、構成体の証拠を別々に追い、単体成功から接続・構成体の成功を生成しない。段階構成候補の導出、段階の採択、実装・受入、外部配布・tagを別状態・別判断として保持し、本要求や導出結果だけから後続状態・外部作用を発生させない。
- **失敗時の戻し先／未完義務**：要求・authorityの不明は該当sourceまたは要求ownerへ、pack境界・入出力・契約の不明は当該機構とHARNESSへ、依存・安全条件の不明は依存ownerまたはSECURITYへ、資源・復旧条件の不明はINFRASTRUCTUREへ返す。検証失敗は検収・要求の戻し先へ返し、未完義務・証拠・状態・復旧先を保持する。いずれの場合も成功構成と表示せず、空集合や暗黙の代替packで穴を埋めない。
- **通常例と反例**：要求の確認から記録までに必要なOS管理・Worker実行・HARNESS検証と該当する権限/実行環境の安全依存を明示し、そのexact setと人の担当工程を示すのが通常例である。許容された人が一部機能を代行しても、その機能に課された依存契約と安全義務は閉包から除かない。無関係な機構一式を完成待ちに加える、候補が存在するだけで依存済みとする、検証を人の未定分担へ暗黙に押し出す、依存不明を省略する、単に小さい／空の集合を最小と称する、未決packを独断で分割する、代替構成の比較なしに最小と断定する、後の版の能力を前提にする、起動・更新・復旧が未release tree/別段階を要する、対象製品HARNESSの配布とHELIX自身の段階構成を同一化するものは反例である。
- **単独成立の依存**：HELIXOS-L2-014、HARNESS-L2-010／011／022および対象に関係する採択済み要求revision、G1〜G7の該当候補revision、各所有機構の明示された接続・安全契約、許可された資源と人の分担。候補revisionしかない入力は候補導出に限り、要求確認・実行・受入の成立根拠として扱わない。
- **束ねる既存条件**：HELIXOS-L2-014の依存・安全閉包、狭い範囲の端から端の仕事、自己依存禁止、できないこと・更新・切戻し。HARNESS-L2-010／011／022の独立pack、呼出し契約、検証・受入。G1〜G7各機構の単体・接続・構成体要求。旧HELIXの対応source、保持点と変更理由はG8判断・audit資料に参照を記録し、旧runtime、旧分類名、固定構成数は再利用しない。
- **旧HELIXとの対応・保持点と変更点**：`LEGACY-ASSET-201EED9C5D6D2FF4D41B` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md` SHA-256 `bf47d434930bd701d368a49b725d49b00a5af2f385b6e1436b294f7b47796e20` のL23-67（FRS-BR-001/002/004/005/007/009）と、`LEGACY-ASSET-B75E46DBE77592351574` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md` SHA-256 `eb1a7747afacd607217ee9e1905f87e629354a023102c1f32521ff8a9bc54a17` のL31-219（機能単位・依存・検証・manifest/replay・要求coverage）、`LEGACY-ASSET-67ADFAB856D954B3C5D2` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md` SHA-256 `bf3a5293a919a5b293ed5ac2c2f86a85539abbe7959ed9d66ea764922e868cee` のL32-59（依存追跡・unknown fail-close・安全閉包・構成体固有受入）を起点にする。保持するのは独立した機能境界、明示収載/除外、依存と安全の閉包、unknown/staleを成功扱いしないこと、再現・rollback、構成体を個別機能の成功と分ける意味である。変更するのは、旧Slice/Module/Bundle・channelを現在のidentityや前提にせず、HARNESSの現行pack契約とG1〜G7要求候補からOS段階構成を導くこと、候補空間と代替構成の比較を求め証明不足を「最小候補／未立証」とすること、旧実装・runtime・CLI・CIを持ち込まないことである。変更理由は、現行Concept/L1とHARNESS-L2-010／011／022の責務・契約を用いて要求から段階構成を導出するためであり、旧sourceの不在や実装状態によるものではない。

### HELIXOS-L2-027 — 未評価状態からの限定初回実行（構成体候補、1.0）

- **PO起点**：[補強原文](../sources/body-reinforcement-po-original-2026-09-27.md)の第1点、[判断記録](../../governance/decisions/body-reinforcement-po-decisions-2026-09-27.md)。旧要求は`LEGACY-ASSET-50CA1C554747F12266D3`、受入設計は`LEGACY-ASSET-437A6A68F9A9E0AE1B9E`（`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md:43`、SHA-256 `63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707`）で照合した。
- **親L1**：自機構のprimary parentはHELIXOS-L1-003、HELIXOS-L1-009。接続先contextはHELIXLABO-L1-011、HELIXINTELLIGENCE-L1-010。各L1は候補状態であり、本節は対象revision確認・採択を生成しない。
- **関係・旧根拠**：HELIXOS-L2-018のWorker割当・実行統制、HELIXOS-L2-026の要求からの構成導出を補強する構成体候補。018、LABO-055／054、INTELLIGENCE-010の責務を再定義・置換しない。旧 `LEGACY-ASSET-50CA1C554747F12266D3`（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md`、SHA-256 `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd`）のRLO-FR-040（663–666行）はtask class別Bench evidence、未評価表示、score単独によるscope/branch/assignment/merge authority変更禁止を示す。対応受入RLO-AC-030（同source 907行）は未評価を推測値にしない条件を確認する。これらは保持するが、初回の許可判定・入力代行・割当・実行・結果受渡しは閉じないため、現行責務間の接続を追加する。
- **開始時入力**：対象要求とauthorityのexact revision、ticket/task identityと狭いscope、SECURITYが提供する資産の公開範囲とdata-use分類、対象操作の許可/拒否条件、OSが確認する有効な操作authority、限定Workerのidentity/capability、INTELLIGENCEの配置案または同じ契約に沿う人の代行案、LABO水準とその未評価状態、予算・期限・停止条件、HARNESS検証義務とoracle、人が担う確認を束縛する。性能評価が未評価であること自体は拒否条件にしない。OS-L2-026の導出結果は対象scope/依存境界を定める参照根拠であり、実行時の成立依存にしない。
- **実行後の受渡し**：OS-L2-018のassignment/attempt結果、OS-L2-019のevidence/continuity記録、OS-L2-023のhandoff receiptを実行後に束ね、同一scope・revisionのままLABOの観測入力へ渡す。HELIXOS-L2-027は当該runで用いた構成candidateのprovenance参照として記録する。
- **提供**：未評価を維持したまま許可条件内で初回assignment/attemptを実行し、結果と検証証拠をOSの記録経路からLABOの観測入力へ接続する構成体候補。
- **保証**：性能評価の有無と操作許可を別状態にする。この初回経路の「低リスク」は次項の既存条件がすべて成立する限定適格性を指す。SECURITY-L2-016の資産公開範囲をtaskのリスク区分と読み替えず、SECURITYに未定義の低リスクclassification出力を要求しない。OSは各ownerの証拠を対象revision・scopeへ照合して、この経路への適格性と操作authorityを別々に確認する。authority、安全条件、開始に必須の契約/入力のunknown、missing、conflict、stale、明示拒否、またはauthority不足なら実行しない。Bench水準の明示的な「未評価」はそれ自体では拒否条件でなく、許可判定と分離して保持する。初回仕事は人が確認した限定scope、指定Worker、明示予算・期限・停止条件、および固定されたHARNESS検証義務で実施し、予算・停止条件の超過、scope変更、検証条件の欠落時に停止する。配置案の代行者はINTELLIGENCE-L2-010が要求する入力属性・契約revision・適用scopeを使い、根拠と不確実性を保持した候補を提出する。OSは受領receiptに案のsource/actor、入力と契約のrevision、task/scope、作成時点、根拠、未評価表示、受領側revisionを記録し、案を自身の割当判断と混同しない。OSだけが既存authorityに従ってWorkerを指定・割当・停止する。Worker結果は成功・失敗・拒否・中断・unknownを区別し、検証結果と未完義務を記録してLABOへ渡す。成功した初回runも、LABOの評価が成立するまで未評価のまま扱う。
- **単独成立の依存**：HELIXOS-L2-015／017／018／019、HELIXSECURITY-L2-003／005／006／007／008／016の隔離・credential遮断・egress制約・Worker制約・authority・資産分類、および各条件を満たすための既存安全依存、INFRASTRUCTUREの該当資源状態、HARNESSの検証契約と固定oracle。HARNESS-L2-022を満たす検証証拠は必要だが、新世代CIを運転するHELIXOS-L2-020の実装を前提にせず、許容された人の検証分担を明示できる。INTELLIGENCE-L2-010のproposal契約、LABO-L2-055／054の水準・受渡し契約は利用する。INTELLIGENCEまたはLABOの実装結果を開始前入力にできない場合は、人が同じ契約に沿ってproposal/evidenceを明示する。候補文書に記載があるだけではauthorityや実行許可にならない。
- **人の分担**：人による配置案代行はINTELLIGENCEの案を同じscopeで暫定的に供給するだけであり、INTELLIGENCE機能・LABO評価・OS assignmentを成立済みとはしない。人は要求された検証oracle/義務を変更せず、独立して結果を確認できる。人の確認対象、確認結果、actor、対象revision、scope、受領時刻、未完義務をOS evidenceへ残す。
- **失敗時の戻し先／未完義務**：authority/classificationは各owner、task属性/案receiptはOSまたはINTELLIGENCE、Bench source/evidenceはLABO、実行資源はINFRASTRUCTURE、oracle/検証不足はHARNESSへ戻す。成功に見える部分結果があっても要件・assignment・検証・receiptの欠落があれば成立を拒み、停止理由と再開条件を保つ。
- **束ねる既存条件**：HELIXOS-L2-004／009／018／019、HELIXOS-L2-026、HELIXLABO-L2-055／054、HELIXINTELLIGENCE-L2-010。候補は1.0の既存境界内であり、固定model/provider、未知scopeへの適用、権限拡大、後続版機能を追加しない。
- **受渡し関係**：OS-L2-018／019／023のassignment、記録、handoff結果を次のLABO観測の入力にする。HELIXOS-L2-027はそのrunで用いた構成候補としてreceiptへ参照記録するだけで、LABO-L2-057の前提・依存にしない。OS-L2-026も要求から構成を導く機能であり、その導出器を自分の入力や実行依存にしない。

- **初回経路の低リスク適格条件（全条件の積）**：以下を同じtask/attempt・scope・revision・環境へ束縛し、各条件の根拠と確認結果をOSの開始記録へ残す。どれかが不成立、unknown、missing、conflict、staleなら本経路の実行対象にしない。新しい一般的リスク分類やSECURITYの分類語彙は作らず、この限定経路への候補条件として扱う。
  1. 読込・入力・生成/出力の全資産についてHELIXSECURITY-L2-015/016のidentity・owner/source/revisionと分類を照合し、unknown・secret・HELIX-restrictedを含まない。その他の分類も公開許可を意味せず、data-useの許可と操作authorityが別に成立すること。生成予定物には事前に分類/出力scopeを指定し、生成後の差分が外れたら受渡しを止める。
  2. HELIXSECURITY-L2-005/007の境界で、当該作業によるcredential-use、raw secretの読込み・入力・出力を必要とせず、credentialへのアクセスが遮断されている。credentialを要する仕事はこの初回経路の対象外とする。
  3. HELIXSECURITY-L2-006のdefault denyと明示許可一覧に従い、通信なし、または必要なdestination/protocol/path・data分類・量・purpose・authority・expiryが許可範囲と一致する通信だけを使う。許可先外へのegressを含まず、未確認の宛先へ再送しない。
  4. HELIXSECURITY-L2-003のproject/tenant/environment/assignment隔離が確認され、007のwrite path・network・credential・環境変数・timeout・resource limit・差分検査・rollback・結果回収の制約が実行環境へ適用されている。未適用/unsupportedやhostへのfallbackを許さない。
  5. HELIXSECURITY-L2-008のactor/target/operation/revision/environment/scope/expiryに一致する許可が各操作にあり、操作の列挙漏れがない。性能未評価や人の配置案はこの許可を代替しない。
  6. 変更は許可範囲内で取り消せ、変更前状態・復旧手段・復旧先を事前に確認できる。不可逆な外部作用、release、tag、配布を含まない。取り消せることが不明な操作も対象外であり、人の確認だけでこの条件を免除しない。

### HELIXOS-L2-028 作業中支援の受渡し・範囲統制（接続候補）

- **PO起点**：[補強原文](../../helix-harness/sources/capability-reinforcement-po-original-2026-09-27.md)第5項、[判断記録](../../governance/decisions/worker-support-derivation-2026-09-27.md)。
- **親L1**：HELIXOS-L1-003／HELIXOS-L1-009。作業中の継続・handoffと、INTELLIGENCEの案をOSが適格性確認後に進める責務へ接続する。候補の記載はL1確認、採択、実行許可を生成しない。
- **関係**：元Workerのticket/assignmentを保ったまま、詰まった範囲だけINTELLIGENCE支援案または相談用Workerへ結び、回答・分解作業・修正指示を元Workerへ戻すconnection候補。HELIXINTELLIGENCE-L2-068がcandidateを作ることにHELIXOS-L2-028の実相談完了は不要だが、実相談/回答/元Workerへのhandoffには本接続を使う。全体の実作業・検証・必要な再作業はHELIXOS-L2-029のcompositeへ別に束ねる。割当と権限は既存HELIXOS-L2-018、証拠/継続は019、ticket/handoffは017/023に残し、新しいWorker主体を作らない。
- **受け取るもの**：HELIXOS-L2-017のticketと対象revision/scope、HELIXOS-L2-018の元Worker assignment/attempt状態、停止・詰まりの説明とsource、適用される予算・期限・停止条件、必要な場合のHARNESS受入/検証義務、INTELLIGENCEの版付き支援案、選択されたcontext sourceのprovenance、SECURITY/INFRASTRUCTUREの適用制約。
- **提供するもの**：元Workerとの相関を保つ限定相談/支援ticketまたはhandoff、渡すcontextのsource/version/scopeと許可範囲、相談先の案とOSの割当結果の区別、返答・分解単位・修正指示の受領receipt、元Workerへの復帰handoff、未完・停止・差戻し状態。
- **保証すること**：INTELLIGENCEは支援候補を作り、OSだけが既存authorityに従い相談先を指定・割当・停止する。相談は元ticket/要求/acceptance/oracleを変更せず、支援Workerに元Workerのassignment権限や承認権限を移さない。相談を挟む場合も作成者・相談者を独立reviewer扱いしない。支援結果が来ない、sourceが古い、範囲を超える、または停止条件に達したときは継続成功としない。
- **常時必須**：対象ticket/要求revisionとowner、元Worker assignment/authority/scope、OSの予算・期限・停止条件、SECURITYの該当操作authorityと実行制約、INFRASTRUCTUREの該当資源状態、HARNESSが課した既存受入/検証義務。該当sourceの状態・版を照合し、unknown/missing/conflict/staleを成功へ丸めない。
- **操作時必須**：詰まりを相談へ送る場合は、詰まり箇所・相談理由・必要な応答型・相談範囲を特定し、OSが別assignmentとして認可/割当した後だけ送る。分解・修正指示を元Workerへ返す場合は、各subtaskの親ticket・scope・依存・受入条件・停止条件を束ねる。元Worker/model classの水準が明示的に未評価なら、HELIXOS-L2-027の限定初回実行条件を満たす範囲で未評価状態を保って作業を進められる。性能未評価をHELIXOS-L2-027の開始前authority・安全・oracle条件の代替にしない。支援を使わない通常作業には相談先Workerの稼働を求めない。
- **選択入力時必須**：設計、コード、過去の失敗例、BRAIN知識、または特定consult sourceを選んだときは、そのsource identity/revision、利用許可、関連性、範囲、制約を保つ。選択したsourceの許可や版が不明なら当該支援を保留し、未選択sourceは当該handoffの実行依存にしない。
- **参照のみ**：未選択の支援候補一覧や過去の一般的な会話・資料は背景参照に限る。OSが記録した当該ticketの継続条件・停止条件は参照のみへ落とさない。
- **版・単独成立の依存**：`version_target: 1.0`（候補上の目標で、実版・採択を意味しない）。HELIXOS-L2-017／HELIXOS-L2-018／HELIXOS-L2-019／HELIXOS-L2-023、HELIXINTELLIGENCE-L2-068の作業中支援候補（配置は既存の有効assignmentを入力とし、L2-010完了を重ねて要求しない）、HARNESSの該当ticket/検証契約、SECURITYのauthority/隔離、INFRASTRUCTUREの対象資源。候補文書の存在や配置案の受領はruntime・割当・成功の証拠ではない。
- **失敗時の戻し先／未完義務**：ticket/scope/authorityはOS管理・SECURITY、支援案と相談設計はINTELLIGENCE、source/利用許可は各source owner/SECURITY、実行資源はINFRASTRUCTURE、oracleはHARNESSへ戻す。応答なし・失敗・停止では費用・attempt・部分成果・未完義務・再開条件を019へ保持する。固定回数の修正loopを作らず、上限は当該assignmentの既存budget/期限/停止条件に従う。
- **束ねる既存条件**：HELIXOS-L2-004／HELIXOS-L2-009／HELIXOS-L2-017／HELIXOS-L2-018／HELIXOS-L2-019／HELIXOS-L2-023と、ConceptのWorker実行authority。旧agent lifecycleの役割分担・相談と元Workerへの復帰の意味を再導出するが、旧runtime、固定slot/provider、固定cycle数は持ち込まない。

### HELIXOS-L2-029 Worker支援から検証・再作業までの構成体（composite候補、1.0）

- **PO起点**：[補強原文](../../helix-harness/sources/capability-reinforcement-po-original-2026-09-27.md)第5項、[判断記録](../../governance/decisions/worker-support-derivation-2026-09-27.md)。
- **親L1**：HELIXOS-L1-003 primary、HELIXOS-L1-004／HELIXOS-L1-009／HELIXOS-L1-010 context。Workerへの委譲と安全な継続、HARNESS契約に従う検収/証拠、調整責務、統合順と検証集合を一つの対象内に通す。
- **関係**：G19支援を実作業まで閉じるOS構成体候補。単体HELIXINTELLIGENCE-L2-068は事前test/指示/context candidateまたは作業中のdiagnosis/相談案、connection HELIXOS-L2-028は支援相談/返答/元Workerへの受渡し、composite HELIXOS-L2-029は元Workerによる実装・検証・失敗時の再作業・結果/未完義務の記録を結ぶ。三者は別identityであり、単体のproposalや受渡しreceiptだけでは一周成立しない。
- **受け取るもの**：承認済み要求/設計とexact revision、元ticket/task/scope/acceptance、予定または有効な元Worker assignment/identity/model/provider/version/effort、HARNESS-L2-022が定めるpair/oracle/test/受入契約、HELIXINTELLIGENCE-L2-068が事前作成するtest/指示/context候補、OS budget/期限/停止条件、SECURITY/INFRASTRUCTUREの適用制約。作業開始前はtask・oracleから準備したcandidateを受け取れる。作業中に診断・相談する場合だけ詰まり/evidenceを追加し、そのconsult operationを選んだ場合だけHELIXOS-L2-028の相談/response/return receiptを入力にする。execution/review結果receiptは開始条件ではなく本compositeの途中で生成してHARNESS契約に照合する。
- **提供するもの**：元Workerとtaskに束縛された支援済み実装の結果、元Workerによる変更差分/実行記録、HARNESS oracleに対応する検証結果、各ownerから受領した独立review/利用者acceptance receiptを対象revisionへ束縛した記録、失敗時の元Workerへの限定再作業handoff、各ownerのreceiptに基づくverified candidateまたは利用者acceptance receiptがある場合のみacceptedとする状態、receipt欠落時の明示的な未完/停止状態、全段階のprovenance/effort/cost/未完義務。OSはreview/acceptance receiptを生成せず、受領・束縛・状態追跡を担う。
- **保証すること**：HARNESS-L2-022は開始前に参照するverification義務、対、oracle、成果物状態/戻し先の契約入力であり、事前に実行済みのresult receiptをcomposite開始条件にしない。各test/CI結果は実行後に当該契約へ照合し、HELIXOS-L2-020がOS管理下の運転と結果回収を担う。支援agent/consultantが作ったtest案はHARNESSの既存契約とauthorityに照合してから利用候補にし、その支援者/助言者は同じ成果物の独立reviewer/受入者とみなさない。元Workerが実作業と修正を行う。失敗は既存budget/期限内の追加handoffで元Workerへ戻し、pass receiptがない成果物をVerified/Acceptedにしない。合意済みrequirement/test/oracle/権限をAI案が書換えない。
- **常時必須**：HELIXOS-L2-017/HELIXOS-L2-018/HELIXOS-L2-019のticket・assignment・実行/evidence、HARNESS-L2-022の既存oracle/受入契約、適用するSECURITY authority/constraints、対象revision/scope、停止条件。unknown/missing/conflict/staleなら成功表示を拒む。
- **操作時必須**：支援を利用する場合はHELIXINTELLIGENCE-L2-068の候補が必要。事前test/指示準備にはHELIXOS-L2-028の相談receiptを要求しない。実相談を選ぶ場合だけHELIXOS-L2-028 receiptを条件付き依存に加え、有効handoff/responseを確認する。元Workerが実作業を行い、HARNESS-L2-022に結んだtest/oracleをHELIXOS-L2-020の許可済み運転で実行する。oracle fail時は結果・findingを元Workerへ戻して差分を再確認する。すべての再作業は同じscope/budget/期限/停止条件内に限り、固定cycle数を設けず、budget枯渇・停止条件で未完のまま終了する。independent reviewerは作成Workerおよび支援者と別のidentity/context/authorityで契約上の検証を行う。
- **選択入力時必須**：支援source (design/code/failure/BRAIN)を選んだ場合のidentity/version/scope/provenance/利用許可と、選択支援手法/相談/修正内容を段階別に保持する。support無選択でも既存のrequirement/pair/oracleと実作業/検証/記録の義務は消えない。
- **参照のみ**：未選択支援候補、無関係なsource、LABO効果比較は当該仕事の成立に不要な場合の参照に限る。支援有無を評価する比較を明示的に行う場合のみHELIXLABO-L2-060のcomparison contractへ渡す。
- **版・単独成立の依存**：`version_target: 1.0`（candidateの版印、v0.1収載を決定しない）。HELIXOS-L2-017／HELIXOS-L2-018／HELIXOS-L2-019／HELIXOS-L2-020／HELIXOS-L2-023、HELIXINTELLIGENCE-L2-068、HARNESS-L2-022、SECURITYの操作authority、該当INFRASTRUCTURE資源。HELIXLABO-L2-060は効果測定を選択した場合の材料であり、支援loopのruntime prerequisiteではない。CI未構築を理由にoracle passを主張せず、実際の検証方法/受領した証拠を022に照合する。
- **失敗時の戻し先／未完義務**：提案/相談の不足はINTELLIGENCE/OS、作業・scopeは元Worker/OS、oracle/要求意味はHARNESS/要求owner、authorityはSECURITY、環境/資源はINFRASTRUCTUREへ返す。検証fail/stale/不成立で最終状態へ進めず、結果、再作業回数ではなくattempt/effect evidence、実cost、時間、未完義務、再開条件を019へ保持する。
- **束ねる既存条件**：HELIXOS-L2-017／HELIXOS-L2-018／HELIXOS-L2-019／HELIXOS-L2-020／HELIXOS-L2-023、HARNESS-L2-022、HELIXINTELLIGENCE-L2-068、connection HELIXOS-L2-028、HELIXLABO-L2-060（任意の効果測定）。旧協働順序の意味を現行の実行・authorityに合わせて再導出し、旧provider hierarchy、固定修正回数、CLI/runtime/CIは持ち込まない。

### HELIXOS-L2-030 HARNESS packageの生成・consumer検証・段階配布（単体候補）

- **状態**：追補候補。新identityであり、現行のPO合意集合へ採択済みとして加えない。候補上の`version_target: 1.0`はHELIXOS-L1-005／007と、既に1.0で採択されたHELIXOS-L2-021のHARNESS構成版配布運転に対応する能力目標である。これ自体からv0.1収載、製品SemVer、実装、配布、release、tag、外部作用の許可を生まない。後続版・適用条件を既決本文から前倒しまたは変更しない。
- **親L1**：HELIXOS-L1-005、HELIXOS-L1-007。
- **入力**：HARNESSが所有する選択済み機能・構成契約とそのrevision、source repository／HEAD、requirements version／digest、package version候補、artifact digest、明示include／exclude集合、生成index、third-party区分と現行権利根拠、生成環境、consumer scope・対応環境、現在のactive artifactと適格な復旧先、必要な安全依存、既存のSECURITY operation authorityを受け取る。入力が不明・不一致・staleなら、候補生成・昇格・適用の各段階で未完または拒否として記録する。
- **提供**：選択されたHARNESS能力から同一source／requirements／profile入力で再現可能なpackage manifestとimmutable artifactを導出し、consumer検証、昇格段階、active artifact、更新・切戻し証拠をOSの配布運転stateへ束ねる。パッケージの工程・利用者向け契約と機能の受入意味はHARNESSが所有し、OSは生成・対象projectへの導入・更新・復旧・結果記録を所有する。対象projectへの実際の適用はHELIXOS-L2-021へ接続する。下記の技術方式・提供先・channelの意味差は[旧条件の対応と判断事項](../../governance/audits/requirements-stage/package-acceptance-legacy-differences-2026-09-28.md)に原文と選択肢を保全する。HELIX自身の全機構packの段階リリースHELIXOS-L2-014とは別identity・別判定とする。
- **保証すること**：
  1. manifestはsource repository／HEAD、requirements version／digest、package version、artifact digest、正確なinclude／exclude集合、generated index、first／third-party区分、license／attribution、生成環境を結び付け、未宣言file、重複path、digest不一致を拒否する。
  2. dogfood固有PLAN／design／test evidence、`harness.db`、`.helix` runtime state／memory、credential、PII、absolute machine path、development-only audit／handoverをartifactから除外する。consumer runtimeに必要なschema／method／adapter template等はconsumer-safeな公開assetとして明示列挙する。除外によってconsumerのdoctor／gateを弱めない。
  3. clean／既存／monorepo consumerに対するsetup・update・rollback・uninstallの書込みは、入力manifestで宣言したmanaged marker内だけに限定し、再実行しても同じ結果になる。marker外のstandalone生成fileも、package ownershipが確認できない限りconsumer所有として変更・削除しない。`src`、`docs`、test、Git history、consumer-owned evidenceを変更・削除しない。standalone fileがmarker外に必要となる条件はここで暗黙に拡張せず、未解決条件として保持する。
  4. README、現行LICENSE、third-party attribution、provenance、免責と利用／更新／撤去／復旧案内、project adapter、proxy／CA／mirror、support／security境界の説明の有無と内容の一致を検査する。欠落・権利状態不明・manifestとの不整合をpublish candidateへ通さない。旧商用候補の文言や権利を再導入しない。
  5. clean Linux環境でinstall、setup、status、consumer doctor、minimal delegated workflow dry-runをfresh processで確かめる。
  6. Windows環境でも、Linuxと同じ選択source／artifact identityに結び付いたconsumer利用能力とentry surfaceの互換性を確かめる。旧Node／CLI／PowerShell実装を再利用・要求せず、対応実装方式は下流で現行仕様から導出する。
  7. packageのsemverとimmutable tagにsource HEAD／artifact digestを束縛する候補とし、tagの実作成は行わない。各stageのentry criteria、観測window、stop／rollback trigger、promotion receiptを対象revisionへ結び付ける。選定されたstage間のpromotionでは元source／artifact digestを同一に保ち、順序を飛ばしたり、rebuild・手編集で異なるartifactへ差し替えたりしない。具体的stage taxonomyと期間値は現行の明示契約から入力し、旧Lite／Full名や旧channel enumを自動採択しない。旧sourceが定める`canary → preview → stable`の3段promotion、同一artifact、各段のentry criteria／観測window／stop・rollback trigger／receiptは未処分のsource条件として保持し、現行channel taxonomyへの再導出または意味変更の判断が済むまでcovered扱いにしない。
  8. developmentから配布先へのsyncにはdry-run diff、backup、restore rehearsal、consumer canary、post-promotion monitoringを備える。これらの欠落を配布成功にせず、事前計画と実行証拠を区別する。failure時は適格な直前artifact／構成版または明示されたreplacementへengine/package pinとmanaged projectionだけを戻す。consumer project、consumer data、consumer-owned evidenceは巻き戻さない。事前に復旧先・復旧可能範囲が特定できない操作を成功扱いにしない。
  9. local plan／build candidate／dry-run／consumer smokeと、remote sync apply／tag／publish／promotion／配布先切替／identifier・state cutoverを別操作として扱う。外部作用は対象・actor・tool・operation・params・revision・scope・期限・復旧先・monitoringに一致する現行SECURITY authorityが有効な場合だけ進める。欠落、期限切れ、対象・artifact・scope driftは拒否する。有効な既決権限の再利用を認め、通常作業の都度の人間承認を追加しない。package検証の成功自体は操作権限にならない。
- **単独成立の依存**：HELIXOS-L2-005（観測・配布結果と未完義務を登録し振分け）、HELIXOS-L2-007（source／revision／actor／operation／結果証拠の追跡）、HELIXOS-L2-021（対象projectへの選択構成導入・更新・復旧）、HARNESS-L2-006（提供構成・artifact・復旧先の意味と再現条件）、HARNESS-L2-017（対象製品のRelease Port契約）、HELIXSECURITY-L2-008（既存operation authority）、適用対象に必要なHELIXINFRASTRUCTURE資源契約。安全依存の欠落をOS単独で補わない。HELIXOS-L2-014のHELIX自身段階release、HARNESS内部CI実装、旧runtime／旧distribution repositoryは依存にしない。
- **失敗時の戻し先／未完義務**：source／requirements／include-set／artifact不一致はHARNESSの提供契約ownerへ、対象・実行scope・現在state・復旧可否・operation authorityの欠落は該当するOS／SECURITY／INFRASTRUCTURE ownerへ戻す。consumer検証失敗、部分適用、doc／rights unknown、promotion途中を保持し、active成功に書き換えず、再開条件と次の検証義務をL2-007証拠へ結ぶ。
- **旧sourceとの保持と変更**：`LEGACY-ASSET-02319C2481B9E01698D5`（旧`helix-harness-requirements_v1.3.md`、SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`）§4.6.1 lines 296–345のHR-FR-HYB-008／HR-AC-HYB-008-01..09の9受入条件の候補対応と保留先を示す。技術方式・target・channelの意味差を解決済みにしない。`LEGACY-ASSET-9B7682EBDEA171005D45`（旧`distribution-package-release-requirements.md`、SHA-256 `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c`）lines 22–29, 31–64, 68–97のauthority・consumer・immutable artifact・段階・rollback・action-boundaryの役割を現行責務へ再導出する。旧package名、固定repository target、profile ID／allowlist、Node／CLI／PowerShell実装、旧runtimeおよび配布先を継承しないことは、consumer packageを使えるという利用価値の削除を意味しない。
- **束ねる既存条件**：HELIXOS-L2-006／007／021、HELIXOS-L1-005／007、HARNESS-L2-006／017、HELIXSECURITY-L2-008。HELIXOS-L2-014との境界は別のままとする。

### HELIXOS-L2-031 CIの性能計測と正しさを維持する改善回収（単体追補候補、1.0）

- **親・状態**：HELIXOS-L1-004／010。`version_target: 1.0`、未採択の追補候補。020の検収・CI運転に性能観測と回収を追補し、HARNESSのoracleと検証範囲の意味、既決のticket駆動CI方針を変更しない。旧CIを起動せず、本文から実装やmerge許可を生成しない。
- **入力**：対象ticket・source/base HEAD、HARNESSが要求した検証義務と選択/非選択集合・digest、CI profile、runner OS・環境・toolchain・platform・lockfile・artifact digest/locality、resource budgetとexclusive state、variance・flake・queue、cold/warm cache、開始/終了時刻、exit code、output digest、区間ごとの実測、p50/p95を算出できる対象期間と母集団・除外理由、適用する性能予算と判断根拠を受け取る。内部実行と外部CIの両方を使う場合は環境・receiptを分け、片側の実績で他方を達成済みにしない。
- **提供**：正しさの判定とは別の性能状態、wall-clock、runner-minute、queue/区間別duration、failure feedback latencyとp50/p95、予算超過の原因分類、同じepisodeから追跡可能なPerformance Recovery候補/作業義務と改善前後の比較を返す。対象期間・標本不足・missingを明示し、固定値や0を補わない。
- **正しさと性能の区分**：正しさが成立し性能予算だけを超えた場合、正しさの証拠を維持したまま性能未達を記録し、同じepisodeで独立の改善作業へ返す。性能未達を理由に正しさの合格を捏造・失効させず、逆に正しさgreenを性能達成へ流用しない。merge可否は既存admissionと適用する要求の別判定であり、本候補から自動許可・一律禁止を生成しない。元sourceのRecovery Issueという作業projectionを使う場合も要求や採否の正本としない。
- **非縮退の改善**：性能回収は対象HEAD/環境/cache/区間計測、原因、改善前後p50/p95、必須検証集合が失われていない根拠、修正、独立review、再検証receiptを結ぶ。検査削減、閾値緩和、timeout延長による隠蔽、外部CIへの義務の先送りを性能改善としない。wall-clockだけでなくescaped defect、mutation detection、flake、未回収義務とその期限/状態も併記し、安全性を落とした時間短縮を回収完了にしない。
- **運転最適化の境界**：required obligationを変えず、順序・並列度・runner・artifact reuseだけを調整する。stateful資源はlease/fenceなしに並列化せず、artifactをHEAD/lockfile/toolchain/platform/digestへ束縛する。cost model不明、telemetry stale、quota不足時は必要義務を保った既定DAGへ戻す。適用できる既定計画も不明なら未完でownerへ返す。局所failure後の未開始heavy jobは既存budget/停止条件内でcancelできるが、未実行義務をsuccessにしない。必要な持越し義務はorigin ticket/HEAD/obligation identityと最初のterminal receiptへ一度だけ結び、再実行を二重回収に数えない。後段failureを元selector decision・依存edge・最初の検出oracleへ結び、LABO評価/既存Backflowを通じた修正候補へ戻す。観測だけでauthorityや検証契約を変えない。
- **旧数値・工程との対応**：旧GH-NFR-009の重要検査p95 60秒、GH-NFR-010のFull p95 3分は、旧環境/検査集合に束縛された数値候補として原文とともに保持する。現行のすべてのticketへ普遍化せず、適用範囲と計測条件を要件化時に照合する。値を変更・不採用にする場合は要求の意味差として上流へ戻し、未計測を達成済みにしない。旧の全件main回収とnightly補完の固定運転は、2026-09-26のPO判断によるticketからのCI導出、差分証明、LABOのすり抜け分析へ変更済みであり復活させない。必要な義務の未回収は消さない。
- **責務と依存**：常時必須は020の運転契約、HARNESSの義務・oracle、同一runと原計測の追跡、適用する安全/資源条件。新たな修正実行時だけOSの既存ticket/assignmentと許可を要する。観測の独立評価を依頼する場合はLABOへ材料を渡し、LABOのproposalからCI設定を直接変えない。未選択環境や旧数値の説明は参照であり、当該runの実行依存にしない。
- **失敗時**：計測不明・比較条件差は計測/実行主体へ、検証義務の変化はHARNESSへ、資源不足はINFRASTRUCTUREへ返す。独立reviewまたは再検証の証拠がない改善は未完で保持する。誤った高速化を新しいbaselineへ黙って取り込まない。
- **旧source**：github-ci-performance-requirementsのGH-NFR-009〜011/GH-AC-017〜018（draft）、github-atomic-development-requirementsのGH-FR-025（draft）、これらNFRをrefinesに持つci-system-synthesis-requirements（confirmed、CIS-R-10〜15）を両方読む。draftだけを根拠にconfirmed系譜を無視せず、後日の現行PO判断が変更した工程と保持すべき計測/非縮退条件を分ける。旧sourceの正確なpath/行/SHAと採否未処分範囲は被覆receiptへ束縛する。

### HELIXOS-L2-032 Known failureの限定quarantine（単体候補）

- **親L1**：`HELIXOS-L1-004`。
- **状態・版**：新identityの単体追補候補、`version_target: 1.0`。PO採択・実装・実行許可なし。
- **能力境界**：OSは、既に有効なpolicyに記載されたknown failureがquarantine条件を満たすかを判定し、その判定と適用対象を記録する。OSは新たなpolicy authority、HARNESSの検証義務、failureの意味、test内容を作らない。quarantineしない選択では通常failureとして扱う。
- **入力**：対象要求/ ticket、検証profileと選択義務/oracle、check identityと明示されたcheck version、policy登録revision、policyに登録されたbaseline SHA/tree、failure fingerprint、現在の実行のexact HEAD/tree、理由、是正Issue/ticket、owner、expiryまたはiteration上限、代替minimum gateとその根拠/結果、各sourceのprovenanceを受け取る。`policy baseline`と`current run HEAD/tree`は異なるfield・証拠として束縛し、両者が同一であることを暗黙の条件にしない。policyの対象scopeがcurrent runを含むことは明示されたpolicy適用条件で確かめる。
- **単独成立の依存（4区分）**：
  - **常時必須**：対象runでHARNESS-L2-005が導いた必要義務、expected failure/oracle、証拠期限、戻し先を維持する。OS-L2-007に必要なpolicy・check・failure・判定・run evidenceのprovenanceを結び、OS-L2-020の状態区分（success/fail/denied/skipped/interrupted/stale）を消さない。quarantineは失敗をpassへ変換しない。
  - **操作時必須**：policyを作成・変更・延長・停止・適用する操作には、その対象・actor・operation・scope・期限に適用される既存HELIXSECURITY-L2-008 authorityを照合し、OSの既存ticket/assignment/record契約へ結ぶ。有効な既決権限は適用範囲内で再利用でき、通常操作ごとの重複承認を追加しない。実CIの実行時はOS-L2-020を実行・結果回収のownerとして使い、必要なINFRASTRUCTURE resource条件はそのoperationに適用される範囲で照合する。
  - **選択入力時必須**：quarantine適用を選んだ時だけ、登録済みpolicyのcheck identity/version、known fingerprint、policy baseline SHA/tree、reason、remediation Issue/ticketとowner、expiryまたはiteration上限、代替minimum gateを必須入力とする。current HEAD/treeは実行側の独立したidentityとして付ける。baselineはpolicyに登録済みの値と照合し、current HEADと同値とは仮定しない。check versionの一致または明示されたcompatibility条件が確認できない場合は互換と推測せず、quarantine対象外として通常failure/保留へ返す。quarantineを選ばないprofileにはpolicy入力を要求しない。
  - **参照のみ**：旧prejoin→postjoin→externalの固定3段列、旧Node/Python supervisor、旧CI名・runtime方式は現行必須依存にしない。HARNESS-L2-005の動的義務選択とOS-L2-020のprofile/run条件が基準である。
- **提供・保証**：`eligible`または`not eligible`の判定、policy/check/version/fingerprint、登録baseline、current HEAD/tree、対象scope、期限、remediation先、代替minimum gateとそれぞれの証拠をreceiptに記録する。条件を満たした場合もreceiptは限定quarantineの事実を示すだけで、元failureを消さず、check pass、CI全体green、merge/release許可を生成しない。代替minimum gateは適用するHARNESS義務を弱めない。
- **戻し先**：oracle・必要義務の不明はHARNESS-L2-005 owner、profile/run/receipt不一致はOS-L2-020/007、policy authority欠落はSECURITY、実行資源不足はINFRASTRUCTUREへ戻し、該当義務を未完のまま保持する。

- **旧source**：`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:119`（HIL-FR-29）、補助source `REQSRC-SUP-00539`（HAC-HIL-06c）。check/fingerprint/baselineへの限定、理由・是正先・owner・期限/上限・代替gateを保持し、既決の動的CI工程へ再導出する。旧三段CIと他の06条件の全移管は本候補の対象外。原文・SHAはquarantine/replay被覆receiptに束縛する。

### HELIXOS-L2-033 Versioned engine/detector registryと同一snapshot再現証拠（単体候補）

- **親L1**：`HELIXOS-L1-004`（CI・証拠収集）。`HELIXOS-L1-008`のprojection整合は証拠の追跡に関する文脈であり、副次接続。033の機能所有者をL1-008へ移さない。
- **状態・版**：新identityの単体追補候補、`version_target: 1.0`。PO採択・実装・実行許可なし。
- **能力境界**：engine capabilityの機能およびdetectorの判定意味は、それぞれの機能ownerが持つ。HELIX-OSはversion/config/scope付きregistryと、OS-L2-020を通じた実行receipt・artifact/findingの出所・再現比較証拠を所有する。033は第二のCI executor、engine実装、detector判定機能ではない。
- **入力**：選択された対象scope、source/input snapshot identity+digest、target revision、要求/ticket、各engine capability identity・owner・version・config、各detector identity・owner・version・config・適用するengine/output種別、宣言されたversion/compatibility、実行環境、HARNESS-L2-005 oracle/検証義務、OS-L2-020 execution receiptを受け取る。登録・開始時の入力と実行後のreceiptを分け、当該runのresult receiptを開始前提にしない。旧HIL-FR-25の対象能力（build、agent metadata、assignment、schedule、trace、impact等）とHIL-FR-26のdetector種別（spec、schema、trace、consistency、file、metadata）は個別identityとして落とさない。
- **単独成立の依存（4区分）**：
  - **常時必須**：選択scopeとregistry revision、そこで登録・使用すると宣言した各engine/detectorの別identity、owner、version/config、compatibility、入力source/snapshot、HARNESSが課すoracle、OS-L2-007のprovenance保持を明示する。engine artifactとdetector findingのauthority/receiptを区別する。OS自身が機能内容・finding意味・正しさを決めない。
  - **操作時必須**：実行/再実行操作はOS-L2-020により隔離し、run状態・結果・中断/失敗/停止を回収する。登録またはversion/config/scopeを変えるoperationでは適用される既存HELIXSECURITY-L2-008 authorityを照合する。実行のための環境/resource条件は当該operationに適用されるHELIXINFRASTRUCTURE契約で照合する。registryの参照だけから実行・書込権限を得ない。
  - **選択入力時必須**：能力を選択したscope内では、選択集合に含む全engineと全detectorについて、同一登録version/configと同一input snapshotでrunとrerunを行い、その結果を比較する。一部だけのrerunでscope全体の再現性を宣言しない。新source/schema/fixtureを選んだときは、そのidentity・version・provenance・明示compatibilityも入力する。unknown versionまたはcompatibility未宣言は互換と推測せず、該当能力の結果を未評価/拒否として保持する。
  - **参照のみ**：旧ZIP由来の実装形、旧registry/runner実行方式、特定言語・CI製品名は実装依存にしない。旧capabilityとdetectorの対象範囲・結果項目のみ意味として保持する。
- **提供・保証**：engineごとにrun/artifact/digest/exit statusを、detectorごとにrun/finding code/severity/location/subject/evidence/versionとdedupe keyを独立receiptへ記録する。各artifactのoutput digestと各findingのfingerprintを残し、重複を束ねても各runのprovenanceを失わせない。双方にsource/input snapshot digest、target revision、scope、version/config、provenanceを束縛する。同一scope内の全選択capabilityで、登録された同一version/config/inputをrerunした結果が一致した範囲だけ再現証拠を返す。partial、unknown、provenance不足、input/version/config不一致は再現成功として扱わない。再run差異は隠さずquarantine/未完として記録する。
- **戻し先**：registry identity/版/実行receiptの不足はOS、oracle/検証義務はHARNESS-L2-005 owner、engine/detectorの機能意味はその登録owner、authorityはSECURITY、実行環境・resource不足はINFRASTRUCTUREへ戻す。

- **旧source**：同assetの`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:115–116`（HIL-FR-25/26）、補助source `REQSRC-SUP-00617/00549/00550/00551/00641`（HR-FR-HIL-10、AC10a/b/c、HAT10）。原文・SHAは被覆receiptに束縛する。旧ZIP実装・言語・registry方式は復帰させず、機能ownerの版付き能力の登録と再現証拠をOSへ再導出する。

### HELIXOS-L2-034 原指示・finding disposition証拠と異議履歴（単体候補、1.0）

**判定とscope**

現行HELIXOS-L2-015／019は、原eventの不変性、source・actor・時点・revision・digest、訂正履歴、Issue/PR projectionとauthorityの分離、重複・stale・拒否・未実行の区別を既に要求する。対L11も、原event保持、projection状態から要求authorityを変えないこと、source欠落・重複・stale・再構築を受け入れる。しかし、どの証拠があればduplicate／false-positive／accepted-risk／cancel／supersede dispositionを確定できるか、当該dispositionへのchallenge/reopenをどう原記録へ結ぶかは、既存L2/L11の成功・反例oracleにない。したがってsource atomの参照を台帳へ追加するだけでは条件・受入を満たさず、限定した契約候補が必要である。

本候補はHELIX-OSの原event・既存work ticketの管理記録であり、判断を作る能力ではない。HARNESSの要求意味・ticket完了条件、原authorityを持つ既存decision maker、OS-L2-015の正本、OS-L2-019の連続性を置換しない。GitHub Issueのcloseはprojection状態であり、work ticketのcancel／closeを発生させない。新たなPO承認手続き・gate・判断権限を作らず、旧sourceが要求する場合に限り既存の有効なPO decision receiptを記録へ結び付ける。

**親・版**

- **親L1**：HELIXOS-L1-001（対象ごとの正本・判断source・revision管理）、HELIXOS-L1-002（要求から作業・証拠までのtrace）、HELIXOS-L1-008（authority/projection不整合の検出・再構築）。L1 sourceは`docs/helix-os/L1-planning/system-intent.md`、SHA-256 `2bb62571308aa1fde0351ca7242e961ddd25b9c4722196c7bb255cf3ad1cfe0e`。2026-09-28 PO判断により固定L1 revisionが確定している。
- **版**：`version_target: 1.0`候補。HELIXOS-L2-015/019の1.0共通記録土台へつなぐ範囲に限定する。新しいruntime、外部作用、実装許可は導かない。OS-034自体は2026-09-28に採択された明示候補HELIXOS-L2-014〜029に含まれず、未採択候補である。

**入力・出力・保証**

- **分類前の受付**：user directiveとIssue由来eventは分類前に015のdurable intake receiptへ結ぶ。受付が保存できなければ未受領/未完を示し、分類結果だけを残して原指示を落とさない。
- **入力**：OS-L2-015の正本から得る原event identityと不変原文参照、source span、actor、received_at、対象revision、digest、既存supersession chain。出所の種別（user directiveかreview findingか）と処理するdisposition案・理由、該当対象がある場合はlocal ticket identity・現在状態・既存完了条件。選択する根拠sourceはsource identity/revision/digest、利用許可/data-useを付ける。
- **出力**：原eventを変更・削除せず、対象scope・対象revision・提案/確定disposition・根拠・判断者authority・関連する既存ticket/decision/closure receipt・後続challenge/reopenを相関IDで結ぶ記録。根拠またはauthorityが足りない処理は未解決・非終端としてOS-L2-019へ保存し、成功・cancel・closeへ補完しない。
- **保持する証拠条件**：
  - duplicateとして扱う場合は、生存中の同一対象と、その対象が当該要求oracleを包含する証拠を記録する。
  - false-positiveとして扱う場合は、指摘を覆す独立した反証根拠と、そのsource/対象revision、および独立reviewの記録を結ぶ。
  - user directiveのaccepted-risk／cancel／supersedeは、該当する既存PO authorityのdecision receipt、対象scope/revision、理由を結ぶ。review findingのcancel／supersedeも既存PO権限に従う。一方、review findingのfalse-positive／accepted-riskは証拠付き独立reviewを条件とし、PO receiptを一律には要求しない。要求等の人が持つ上流意味を変える場合だけ既存authority手順へ戻す。必要な根拠がない間は当該処分を確定しない。根拠が揃っても原eventを削除・不可視化・終端化せず、異議経路と未完義務を保持する。
  - AIのnon-actionable分類は非終端とし、原記録を保持して既存の判断主体または要求ownerへ返す。
  - appeal/reopenは先行dispositionと新しい反証・判断根拠を同一履歴へ結び、先行原記録を上書きしない。既存ticketの完了receiptがないcloseはticket完了にせず、projection側のcloseと不一致を記録して既存経路へ戻す。
- **既存権限境界**：PO専属のcancel/supersedeは既存PO authorityのreceiptを照合するだけであり、ここで新しいPO承認機会や承認形式を増設しない。他のdisposition判断主体を新設しない。要求意味やacceptance oracleが未確定なら、そのownerへ戻す。
- **単独成立の依存**：HELIXOS-L2-015（正本・source・authority record）、HELIXOS-L2-019（原event・訂正履歴・continuity）、該当する場合は既存local ticketのclosure契約とauthority receipt、Concept 1.0の共通ログ・証拠形式。対象sourceから反証/包含証拠を取る場合、その選択sourceの許可・scope・revision・digestも必要。
- **操作時のみ必須**：duplicate、false-positive、accepted-risk、cancel、supersede、appeal/reopen各処理に固有の証拠は該当処理を提案・確定するときだけ必要。local ticketが閉じられていないdirectiveではticket closure receiptを要求しない。projection Issueのcloseだけでterminal dispositionを作らない。
- **参照資料のみ**：旧storage/schema/runtimeや未選択source。読むだけで実行依存・採択・authority根拠にしない。
- **未選択source条件**：根拠として選択していないsourceは未観測であり、根拠なしの「該当なし」へ置き換えない。
- **失敗時の戻し先／未完義務**：原source、対象ticket、判断authority、根拠、既存receiptのいずれかがmissing/unknown/stale/conflictなら、原eventと未完義務を保ち、当該欠落を補える既存source owner・要求owner・判断authorityへ戻す。projection状態の修正でauthority不足を埋めない。

**旧sourceとの対応**

- `LEGACY-ASSET-A60CF91DD2AF6693E6F9` `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json`（SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`）の`#/HIL-BR-07`は分類前のdurable intake、AIだけによるreject/drop/close/cancel禁止、non-actionable dispositionの非終端、cancel/supersedeのPO専属、closure receiptなしclose拒否またはreopenを求める。
- `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md`（SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`）の126行・`#/HIL-FR-36`は、原文参照/source span/actor/received_at/digest/supersession chain、duplicateの生存target+oracle包含、false-positiveの独立反証、accepted-risk/cancel/supersedeのPO receipt、disposition challenge/appeal/reopen receiptを要求する。
- `LEGACY-ASSET-AFE91778057B7E76BEEC` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L1-infinity-loop-operational-test-design.md`（SHA-256 `4f8f67664e360dcb8b40f9c834953d026c9bf3b359a79a64e68fa2296689e576`）の63行 HOT-HIL-36は、duplicate生存＋oracle包含、false-positive独立反証、cancel/supersede PO receipt、appeal route欠落時の非終端を確認する。
- 旧条件で保持するのは原指示の不変性、処分ごとの根拠、既存PO authority、challenge/reopenである。旧storage/gate実装や新しい人間承認は持ち込まない。HIL-BR-07はsource IRで`specified_frozen`として保全されるが、IR未完引継ぎから旧条件の廃止・採択済successorを推定しない。

照合した現行本文の固定commit：`2197a4bc405d37f133bac4d5e96809c5afec58c1`。旧L1のBR-07は59行、FR-36は126行、旧運転受入HOT-HIL-36は63行。旧原文のIssue語を現行の原event/local ticketと協調projectionへ分離して再導出し、原指示の意味上の取消権限を緩めない。

**R2222-01の原文照合**：同旧L1 `:99`（HIL-FR-09）と`:201`（HIL-NFR-21）も照合した。findingの非actionable分類は独立reviewとappealを持つ非終端記録である。directiveのcancel／supersedeに対するPO権限をfindingへ一般化しない。ただし旧L5 §3 lines 68–70と旧L4 §4.2 lines 277–280が定めるreview findingの`accepted_risk`にはaction-binding PO receipt、旧HIL-NFR-21には独立reviewが必要である。これらのspecific条件はHELIXOS-L2-101候補で保持する。旧provider名/DB viewは現行実装へ移さない。FR-09のformal successor割当と旧IR全体の被覆は本候補から生成しない。

### HELIXOS-L2-035 PR lifecycle event intakeと監査job要求の冪等生成（単体候補）

**状態・種別・版**：HELIX-OS単体unit候補、`version_target: 1.0`候補、未採択。HELIXOS-L2-035は、選択された対象projectのPR lifecycle eventを欠落なく取り込み、同じ観測eventから重複した論理監査jobを生成しないOS能力を定める。旧hook/provider/author runtime、物理queueやdaemonの採用は決めない。候補本文は要求採択・L3承認・実装許可を生成しない。

**親L1候補**：`HELIXOS-L1-002`（project群の作業・検証・提供・運用を追跡し、欠落/競合/staleを把握）、`HELIXOS-L1-004`（承認済み上流・HARNESS契約に従うreview/証拠収集を統制）、`HELIXOS-L1-008`（authority/design/verification/runtime projectionの不整合を検出し原情報から再構築）。いずれも現L1の意味を変更せず、各項の既存scopeに限って具体化する。

**単体責務と既存IDとの境界**：この候補は、既存operationで明示されたproject/repository/source scopeのPR作成・更新・完了eventを受け、eventごとの論理監査job identityとjob requestを一度だけ生成し、event provenanceとともにHELIXOS-L2-010の既存ticket/workflow生成境界へ渡す。035は監査jobの論理identityと生成を所有し、010はそのjobを既存の作業単位としてticket/workflowへ登録し運転する。035の処理完了は、L2-010境界に一つの監査work itemが登録されたreceiptまでであり、監査処理自体の完了ではない。監査のreview・finding分類・writerへの返却・successor昇格は所有しない。`HELIXOS-L2-007`が証拠形式/provenance/相関を、`HELIXOS-L2-009`がdurable event記録・冪等projection/checkpointを、`HELIXOS-L2-010`がticket/workflow生成を所有する。035はその契約をPR event intakeへ具体化する単体能力であり、各IDの責務を置き換えない。HARNESS↔OSのHR-FR-HIL-03 connectionは別候補として残し、この単体候補へ混ぜない。

**対象scope**：既存のproject設定と入力契約で明示されたrepository/workspaceとPR監査operationに限る。その選択scope内のPRではbase branchを理由にevent対象から除かず、stacked PR（baseが別PRのhead branch等）も除外しない。対象scope外のrepositoryを走査する要求ではない。作成runtime名・provider名だけを監査対象の選別条件にしない。

**入力**：

- 既存OS project registry/ticketの対象project、repository identity、PR監査operation scope、現行適用版、およびそのoperationに既に適用されるaccess/operation authority。
- 選択済みevent sourceの現行入力契約と版。eventから、repository/PR identity、lifecycle kind（作成・更新・完了相当）、base/head refと観測対象revision、同一deliveryを識別するevent identityまたは同等の契約情報、source revision/provenanceを識別できること。payloadや契約に欠落があればunknownとして扱い、event不在とは推定しない。
- `HELIXOS-L2-007`の証拠/provenance契約、`HELIXOS-L2-009`のdurable event/idempotent projection境界、`HELIXOS-L2-010`の既存audit work/ticket生成契約。035は下流job完了receiptをintake開始前提にしない。

**出力**：対象project/repository/PR、lifecycle event、base/head refと対象revision、source/event identity、受領時の適用contract revision、受領結果・重複判定・未完理由を記録するevent receiptと、L2-010が消費できる監査job要求を出す。job要求とevent receiptは同一因果relationで辿れる。物理jobの配置先とticket詳細workflowはL2-010または既存の該当ownerが決める。job requestが受理されてL2-010のwork itemへ登録されたreceiptを返すが、review成果物はこの候補の出力ではない。

**保証**：

- 明示scopeのPR作成・更新・完了相当eventを処理対象とし、全base branchとstacked PRを含める。base/refの種類やauthor runtime/provider名による黙示除外をしない。source contractがそのscopeのeventを列挙/配送できない場合は、未観測/不完全として残し、対象PRが存在しない、または全件処理済みとは表示しない。
- 同じsource event/deliveryの再送・再処理は同じ論理監査job identityへ収束し、重複jobを増やさない。新しいlifecycle eventまたは対象revisionを伴う更新は、そのeventとrevisionを記録して既存L2-010の規則に従い新規/更新/後継の論理要求へ反映する。異なるHEADの結果やjobを一つの現行PR状態として混ぜない。
- event捕捉と監査job要求生成は、reviewの完了、CI green、Claude/Codex receipt、merge、requirement採択を成立させない。event receiptやjob requestだけで監査jobの実行・成功・独立review合格を表示しない。
- 旧HIL-BR-02の機能意味（PR作成/更新/完了の検出、監査jobの冪等生成、全base branch、stacked PR包含）を維持する。固定Claude拡張hook、Codex限定author、旧provider、daemon/webhook server、旧実装手順は現行要件に持ち込まない。

**依存区分**：

- **常時必須**：選択operationの対象project/repository/scopeと版、当該入力の既存access/operation authority、HELIXOS-L2-007のprovenance/証拠契約、HELIXOS-L2-009のdurable event/idempotent projection契約、監査job要求を引き継ぐHELIXOS-L2-010境界。event intakeはjob完了receiptに依存しない。
- **特定操作時のみ**：PR監査operationを開始し、各PR eventを捕捉または監査job要求へ変換する時、その操作に適用される現authorityの範囲でsourceを読む権限と内部job要求を記録する許可。新しい個別承認、merge/write permission、review/CI実行権限は追加しない。
- **選択した入力元に応じて必須**：選択event source contract、その版、sourceが保証する対象repo/base branch/event kind/配信・重複識別範囲。event sourceが対象scopeを網羅しないときは不足範囲をunknownとして残し、網羅claimを保留する。他providerの契約を黙って代替しない。
- **参照資料のみ**：未選択repo/source/provider、旧runtime/hook実装、旧固定provider・daemon/webhook設計、HR-FR-HIL-03のHARNESS↔OS接続候補、旧CI/実行履歴。参照のみから現行契約・job実行・承認を生成しない。

**単独成立依存**：既存project/repository scope、対象operationに適用される既存authority、選択event sourceの入力契約、HELIXOS-L2-007/009/010の関係する現行契約。HR-FR-HIL-03 connection、HARNESSのreview実装、旧hook/runtimeは単体成立依存に含めない。

**失敗と戻し先**：scope/authority/source contract/event identity/revision/base refが欠落・unknown・stale・conflictの場合、そのeventを監査済み・job生成済みにせず、不足した入力/契約のownerまたはOS project/ticket管理へ返す。重複eventは既存receiptに結び、二重jobを作らない。base branch coverageやstacked PR状態が分からない時は無視せず対象scopeを未完とする。job生成の重複・ticket lifecycleの問題はL2-010へ、証拠/provenanceの問題はL2-007へ、durable/idempotent projectionの問題はL2-009へ返す。

**現行L2/L11との照合**：現行L2-007は原証拠/provenanceと欠落・重複・古い証拠の識別（`docs/helix-os/L2-requirements/governance-requirements.md:60,295`）、L2-009はeventのdurable記録・冪等projection/checkpoint（同`:62,297`）、L2-010は管理・推進・検収によるticket/workflow編成（同`:63`）を既に所有する。これらは必要な下位契約だが、PR lifecycle eventの発見/取込み、scope中の全base branchとstacked PRを含めること、同じPR eventから監査jobを冪等生成することは明記していない。L11-007のprovenance/stale/重複（`docs/helix-os/L11-acceptance/governance-acceptance.md:27,47`）、L11-009の中断後projection/checkpoint（同`:29,55`）、L11-010の動的workflowと部品境界（同`:30`）にも、このPR event人口の完全性とevent→job冪等性のoracleはない。したがって035は既存責務を置換せず、PR event intakeと論理監査job生成を追加で閉じる単体候補とする。

**旧HELIXからの再導出・保持/変更**：`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`の旧要求本文は `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:54`（SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`）、同一要求IR（`LEGACY-ASSET-A60CF91DD2AF6693E6F9`）は `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json:45-58`（file SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`; 条件本文はline 54）にある。HIL-BR-02の意味は「PR作成/更新/完了eventの検出、監査jobの冪等生成、全base branchを対象、stacked PRを除外しない」として保持する。`LEGACY-ASSET-4305445847D8D431F684`（`archive/legacy-generation-2026-09-14/root/docs/plans/PLAN-L7-473-claude-pr-convergence.md:108-132`、SHA-256 `572715b1267efa3c75ad82428355a653388be69758ecbb152a5f110e3a4cfe95`）は旧Codex/Claude運用計画候補、`LEGACY-ASSET-AC2078FFF049D6B56D19`（`archive/legacy-generation-2026-09-14/root/src/runtime/claude-pr-convergence.ts`、SHA-256 `059f5e925c727fe8003c9e6c72b595d4697bd4d930d97a92cd4a9ee1f5ebdff8`）は旧runtime実装候補として、現行要件の技術設計/実行証拠へ昇格しない。

**製品scope判断との関係**：`docs/governance/decisions/hil-br-02-product-scope-2026-09-23.md:15-44`（decision file SHA-256 `1bf2912691a89cacc2ff1bff23b5c21a48961bb655aa43ec95d5b422c83d64c1`、source revision `5cf43693bd94fe17ce8b340426e847ea53814a06`）で、POはHIL-BR-02全体をHELIX-OS単体のproduct_unitに分類し、HR-FR-HIL-03の4要求間受渡しとend-to-end受入を別connection候補として保持した。この決定はscopeだけで、要求採用・L2/L11適用・successor・実装承認を決めていない。本候補はその分離を守り、HR-FR-HIL-03を035へ統合しない。

**現行根拠と照合基準**：親 `docs/helix-os/L1-planning/system-intent.md:31-42`（SHA-256 `2bb62571308aa1fde0351ca7242e961ddd25b9c4722196c7bb255cf3ad1cfe0e`）、現行L2 `docs/helix-os/L2-requirements/governance-requirements.md:44-47,60-64,293-300`（SHA-256 `077e353d962230943c66a30fba1bd778b5efc40b5506d89b71d4f343b1430559`）、L11 `docs/helix-os/L11-acceptance/governance-acceptance.md:19-31,35-58`（SHA-256 `b1dc0b9fd92de8169b74fbe0072c35bd815da3a36d5c8df8ac60a05df8e6ac13`）。固定照合base commit `d0900f30b92720114c6e0b5f436813d48172a020`。

**配送順序と未完**：新HEADの更新を受けた後で旧HEADのeventが遅着しても、旧eventの由来を保持し、新しい対象revisionを旧状態へ戻さない。event保存とjob登録の途中で停止した場合は009のdurable checkpointと既存receiptから未完分を再開し、登録前のeventを処理済みにせず、登録済みjobを再生成しない。

### HELIXOS-L2-036 Retrofit preflightのticket/plan接続（単体候補、version_target: 1.0）

**状態・所属**：新規候補。既存HELIXOS-L2-010のworkflow/ticket意味を補うOS単体能力であり、L2-010を変更・置換しない。OSは規範上のpreflight義務とその順序、結果状態、未完義務をticketへ束縛する。preflightの技術的な判定oracle・合否意味はHARNESSの検証契約および該当domain ownerが持つ。実際の変更適用は既存SECURITY authorityの範囲でWorkerが行う。別機構・ticket種別・承認者は作らない。

**親L1**：主親HELIXOS-L1-009（管理・推進・検収の分離と許可範囲内の仕事統制）、関連親HELIXOS-L1-010（変更・依存に合う検証集合と収束計画）、HELIXOS-L1-002（作業から提供・運用までの依存/stale/未完義務の把握）。いずれも現行候補本文の射程内とする。親意味の改訂を提案しない。

**目的とscope**：旧requirements v1.3:624はRetrofitへrouteされたすべての`upgrade`にpreflight必須とする。旧Retrofit本文:36,86はpreflightを影響評価に置き、fail時はpassまで移行計画へ進ませない。旧Concept:445,470–471は高リスク時の`requires_preflight`を述べる。036は全upgradeのpreflight義務・結果を同一ticket/source-target scopeへ束縛し、pass前に移行計画を確定済みにせず、apply時にもresultのcurrent性を確認する。影響調査や未確定plan draftは続行できる。preflightの検査内容はHARNESS-L2-005が導く既存oracleで扱い、未定ならHARNESS ownerへ戻す。旧execution-policy-registryの`RETROFIT_STANDARD_SAFE` bindingは`HELIX_DOCTOR`の`action_stage: verify`に対するread-only command policyとして記録し、これだけで全Retrofit changeのapply authority/実行時preflightへ拡張しない。無関係な変更、Prototype、Reverse全般へ拡張しない。

**単独成立依存**：HELIXOS-L2-010のticket/workflow/authority/revision/scope契約、HARNESS-L2-005の対象ticketに対する選択済み検証義務・oracle・expected failure・証拠・戻し先、OS-L2-019の結果provenanceと未完義務継承。検査oracleの内容がHARNESS側で導けない場合、OSが不足を補作せずHARNESS ownerへ戻す。upgrade applicability自体は旧requirementsの全upgrade条件を保持する。

**operation時のみ必須**：Retrofit upgradeでは常に、移行計画を確定する前に、同じsource/target revision・dependency/config scopeに束縛されたpreflight passを確認する。未実施、unknown、stale、scope不一致、HARNESS oracle不合格なら計画は未確定のままとする。preflight実施用ticket・影響評価・未確定plan draftは、result未到来でも開始可能。計画確定後の適用直前にもresultがcurrentであることを確認し、未実施/unknown/stale/不適合なら適用・upgrade完了を成立扱いにしない。適用操作は既存のSECURITY authority/Worker制約に従い、本候補から許可を発行しない。

**選択source依存**：HARNESS oracleが選択するpreflight evidence/source revision、target version、対象scopeを使用し、sourceと根拠を結果へ束縛する。旧process/Conceptはpreflight義務とその高リスク時の工程順を示す一方、旧registryはread-only doctor verify policyを定めるだけで、preflightがdependency compatibilityそのものを判定するのか、対象範囲・影響を記述するのか、そのchecker内容は定義していない（旧Concept §2.6.3、旧execution-policy-registry `RETROFIT_STANDARD_SAFE`）。候補本文ではpreflightを互換性判定と定義しない。HARNESS/domain oracleが明示した判定だけを受け取り、oracleや適用性が未定なら未評価として保持する。入力形式・比較実装・数値閾値は固定しない。

**旧sourceと保持・変更**：旧sourceのtoken名、registry、runtime、schema、特定package manager。主根拠は `archive/legacy-generation-2026-09-14/root/docs/process/modes/retrofit.md:30,36–39,86`（SHA-256 `b7b053d867fd5f59c9256d1d60e4685d64c10ef50ff1f9de665dcf506d13c049`）と旧Concept `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-concept_v3.1.md:445,470–479`（SHA-256 `b6cecb7bec29d85b36e299f8a594821c1d778328506fe2c056ca330ef76d968c`）、旧execution-policy-registry `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/workflow-execution-policy-registry.v1.json:141–155`（SHA-256 `eeb30c1bb51f74798563b31b0802b301fb687d2e750c517061588969a7ff344f`）。requirements v1.3 §9.2:624（asset `LEGACY-ASSET-02319C2481B9E01698D5`, SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`）もupgrade preflightを必須とする。保持する意味は、全Retrofit upgradeにpreflightを要求し、影響評価中の実施・fail時の移行計画停止を同じticketへ結ぶこと。旧sourceはpreflightの技術的中身を互換性判定と特定していないため、その意味を追加しない。

**受け取るもの**：ticket identity/type/parent requirement revision、選択sourceとtarget revision、変更対象dependency/config scope、全upgrade義務に対応するHARNESS-L2-005のoracleと、検査後に取得するresult参照、authority state、既存の移行/rollback計画案と未完義務。今回の確定計画や未来のpass receiptを起票・調査・検査開始の入力にはしない。

**提供するもの**：同一ticket/scope/revisionに束縛されたpreflight適用状態、既存oracleに基づく結果への参照、apply前の未完/unknown/stale/errorと戻し先。OSはpreflight検査結果本体、HARNESS-L2-005が定めるoracleの意味、適用実行を生成しない。

**失敗・戻し先**：義務/oracle不足・意味不明はHARNESS-L2-005 ownerへ、preflight source/evidence不足はsource/domain ownerへ、scope・ticket・revision不一致はOS L2-010へ戻す。authority不足はSECURITY既存経路、実資源不足はINFRASTRUCTURE/OS既存経路へ戻す。未完義務と停止位置を保持し、preflight resultを推測しない。

**受入oracle**：

- 正常: Retrofit upgrade ticketで、同一ticket/scopeに結ばれたpreflight obligationとHARNESS-L2-005のresultがtarget revision/scopeと一致し、既存oracleがpassを返した後に移行計画を確定する。適用時にもresultがcurrentならOSはそのresultをapply operationへ束縛できる。OS自身がpreflight内容や判定を発明しない。
- 誤り: preflight requiredのupgradeでpreflight fail/unknownのまま計画を確定する、または計画確定/適用へstale source snapshotを使う、preflightなしで進む、oracleが不適合/unknownを返す、別ticket/scopeのreceiptを転用する。計画は未確定のまま、またはapply/operation closureを保留し、理由とownerへ戻す。
- 未見: package managerやdependency型が既知fixtureと異なる。選択されたHARNESS oracleとsource/target scopeが一致すればそれに従い、未知型だけを理由に自動fail/passしない。必要なoracleがないなら未評価を返し、HARNESSへ戻す。

**既存境界と根拠**：OS L2-010/HXT-TYPE-16はRetrofitの計画・段階・Forward合流を定義し、L11 `HXT-TYPE-16` は範囲/段階/結果を確認する。一方、旧requirements v1.3:624は全upgradeにpreflightを要求し、旧工程本文は影響評価中の実施と高リスク時failの計画停止を明記する。旧execution registryはread-only doctor verify policyであり、operation/apply authorityを意味しない。HARNESS-L2-003は開始/完了・未完義務、L2-004は変更影響、L2-005はticket/change/riskからverification dutiesを選びunknownをskipにしないが、Retrofit upgradeに対するpreflightと計画確定順序はOS operation契約へ接続されていない。本候補はticket/plan state接続を補い、checkerの技術的意味とauthorityは補作しない。既存OS-L2-010を編集せず、HARNESS-L2-005の一般規則を再定義しない。

**旧承認条件の判断境界**：config_driftの旧TL単独サインオフは[原文・選択肢・推奨](../../governance/audits/requirements-stage/retrofit-preflight-legacy-differences-2026-09-28.md)へ残す。036の候補登録・検証・統合から、その条件の採択・廃止や実操作許可を生成しない。旧command名/registry/schemaは参照資料であり実行依存ではない。

## HELIXOS-L2-030 生成indexの導出条件（追補）

既存030本文と一体の未採択候補。親HELIXOS-L1-005／007、version_target: 1.0を保持し、新identity・製品・実行許可を作らない。

正本indexの内容、適用scope、revision/digestは選択済みHARNESS package contractとその正本sourceから入力する。OSは正本indexの意味・内容を作成または変更しない。`generated index`はその正本indexと、同一のsource/requirements/profile revisionに適用する既存の生成規則から導く派生物として扱い、同じ入力と規則から再生成した内容が一致することを検査する。既存manifest/artifact証拠は正本indexと生成indexのdigest/出所を相関できるよう保持する。生成indexを正本から再導出せず直接編集した場合は、manifestやartifactを編集後のdigestへ更新しても不適格とし、promotionへ進めない。正本index、revision、適用scopeまたは現行生成規則が欠落・不一致・staleなら候補を未完として保持し、正本や生成方式を推測で補わない。

この追補は正本/生成index間の関係と編集拒否だけを定める。固定path/schema/provider、別のindex registry、package/channel方式、所有権の再割当て、外部操作許可は追加しない。既存のparty/license/免責、immutable artifact、staged promotion、およびSECURITY authority条件はそのまま適用する。

旧根拠：HIL-BR-33、HR-FR-HIL-24、HAC-HIL-24a/b/c、HAT-HIL-24。原文・所在・変更境界は[原文照合](../../governance/audits/requirements-stage/package-index-legacy-differences-2026-09-28.md)を参照。

### HELIXOS-L2-037 週次drift・技術負債観測から既存ticket候補への引継ぎ（接続候補、version_target 1.0）

- **状態・親L1**：新規追補候補・未採択、`version_target: 1.0`。主親は `HELIXOS-L1-006`（観測・LABO評価/提案・OS登録/振分け）、状態の欠落/stale可視化は `HELIXOS-L1-002` の範囲で導出する。候補が未採択であることは固定L1/L2/L11 bytesの変更を意味しない。
- **対象・境界**：宣言scopeと対象revisionについて、週次の非同期観測で設計/実装の乖離を既存HARNESS要求・設計oracleに照らして報告する接続と、source/既存ownerが技術負債の累積と分類した観測をLABO評価後にOSの既存candidate/ticketへ記録し、既存のRefactorまたはReverse計画を提案する接続を扱う。週次観測自体は完了gateではなく、差分が見つかった場合だけ既存Reverse/Backflowへ接続する。OSはHARNESS oracle、負債の独自定義、検出閾値を発明しないが、既存OSの優先順位決定責務は維持する。HELIXLABO-L2-063の同種修復再発candidateと同一視せず、その入力が適用可能と示されたときだけ参照する。
- **入力**：対象project/要求・設計revision、適用scope、週次観測のsource identity/revisionと対象設計/実装oracle、またはsource identity/revision付きの負債観測・既存owner評価、負債とされた根拠、既存判断/作業状態、許可範囲。source/既存ownerが蓄積と分類する条件を示していなければunknownのまま保持し、OSは新しい検出閾値や負債定義を補わない。`HELIXOS-L2-019`, `HELIXOS-L2-007` の証拠と `HELIXOS-L2-022` のfeedback/ticket境界を使う。
- **提供**：週次scope観測の結果をsource/evidence/revision/oracleとともに報告し、差分があれば既存HARNESS Reverse/Backflow境界へ渡す。source/ownerが技術負債の累積として分類した観測はLABO評価を経て `HELIXOS-L2-022` のcandidate登録へ引き渡し、既存ticket contractに従う返済PLAN候補（対象・理由・未完義務・source revisionを含む）を返す。PLAN候補は実行ticket/assignment/承認済計画ではない。未解決負債と対応待ちは可視の未完として残す。
- **非ブロック境界**：candidateの記録・返済提案だけを理由に、無関係な作業や全modeを停止しない。既存 `HELIXOS-L2-009`, `HELIXOS-L2-010`, `HARNESS-L2-003` の条件に該当する同一scopeの中断・未合意・未検証はその既存gateどおり扱う。これは不足した負債基準を無条件の通行許可へ変えるものではない。
- **依存区分**：常時必要＝`HELIXOS-L2-007`, `HELIXOS-L2-019` のprovenance/evidenceと、`HELIXOS-L2-022` のcandidate/ticket/還流境界。特定操作時のみ＝選択scopeの週次drift観測時に既存HARNESS oracleを使い、差分があれば既存Reverse/Backflowへ渡す。sourceが負債としてclassifyしたときだけLABO評価と返済ticket候補を作る。選択入力依存＝選択project/scope/revisionとLABO observation/Feedback、適用可能性が明示された場合の `HELIXLABO-L2-063` evidence。参照のみ＝旧CLI名・旧schema/実装、選ばれていないsourceの観測、背景としての一般的負債例。未選択/unknownを「負債なし」としない。
- **失敗・戻し先**：source・revision・負債根拠の欠落は観測source/LABOへ、登録・ticket接続の欠落はHELIXOS-L2-022, HELIXOS-L2-010 ownerへ戻す。classificationがunknownなら未評価candidateとして保ち、0件/解決済みにしない。candidate登録、計画提案、実行、検証、再観測を別状態にする。
- **旧条件と変更**：保持するのは「技術負債の累積検知時に負債記録と返済PLAN提案を作る」意味。変えるのは独自の閾値/自動実行を足さず、source/evaluation authorityに従う点。理由は旧FRの入力/出力は指定するが累積基準、順位、実行承認、閾値を定めていないためである。

**cadenceとL1意味**

旧BR §3.3の「週次」は発動条件欄にあり例示の注記はないため、037候補の1.0 scopeへ非同期観測・報告として含める。weekly checkは対象scopeの設計/実装乖離を既存HARNESS oracleへ照らす観測であり、全件CI、常時稼働engine、工程同期gateを意味しない。差分がない週は報告だけを残し、差分がある場合だけ既存Reverse/Backflowへつなぐ。

親L1は `HELIXOS-L1-002`（状態/欠落把握）と `HELIXOS-L1-006`（観測とLABO Feedback登録/振分け）の意味範囲で導出できる。HARNESS oracle側は `HARNESS-L1-003`, `HARNESS-L1-004` が変更影響・検証義務・差戻しを支える。debt/driftという語がないことだけではL1親射程の不足としない。反例として、source分類を経ずOS自身が新しい負債閾値を決め、全projectの進行を週次同期停止する要求なら既存L1から導けないが、この候補には含めていない。

**観測の未完と開始境界**：観測を開始する入力は選択scope/revision・source契約・oracleであり、今回の観測結果や返済案を先に要求しない。週次の観測が未実施・中断・遅延した期間は未観測と報告し、過去の結果を今期の確認済みへ転用しない。観測未完だけで無関係な工程を止めず、対象scopeに既存gate条件があればその判定は別に行う。

**原文**：[FR-L1-11と業務条件の原文・保持点](../../governance/audits/requirements-stage/debt-drift-legacy-differences-2026-09-28.md)。週次は旧規範頻度として候補へ保持する。旧CLI/runtime/schemaや旧世代の層番号は移植しない。

### HELIXOS-L2-038 Layer ledger writer・snapshot・proposal append（単体候補、version_target: 1.0）

- **親L1**：`HELIXOS-L1-001`（対象・source・authority revisionの管理）、`HELIXOS-L1-002`（portfolioの欠落/stale把握）、`HELIXOS-L1-004`（HARNESS要求・検証契約に基づく統制）、`HELIXOS-L1-008`（projection不整合の検出と原情報からの再構築）。writerの許可済み作業状態への束縛は`HELIXOS-L1-003`の制約内とする。これらの既決L1意味から導くOS実行候補であり、HARNESSの工程・template意味をOSへ移さない。
- **対象と境界**：HARNESSが定義したcanonical layer ledger契約とtemplate atom/proposal/gapを、対象layer・対象revision・authority・scopeに束縛してOSの管理・運転記録へ登録し、layer snapshotを作り、HARNESSのproposalを対象ledgerの候補行へ追記するwriter操作を実行・記録する。HARNESSのledger意味正本とOSのwriter operation記録を別に保持する。OSはHARNESS-L2-040/041のledger type、粒度、必須node/edge、template applicability、atom化、gap判定、意味上の候補内容を決めず、これらを再解釈・補完・書換えしない。OSが所有するのはwriterの運転、対象revision/provenance/stateの束縛、snapshot/projectionの再構築、append操作のdurability・idempotency・失敗/再開記録である。
- **入力**： (1) 登録対象のlayer identity、対象revision/digest、stable subject ID、source span、owner、status、upstream/downstream edge、および選択scope、(2) HARNESS-COREの適用ledger契約・active template契約とそのversion/digest、(3) HARNESS-L2-040/041の型付きlayer catalog、原子的template obligation、proposal、gap finding、extractor/version digestと対応source atom、(4) authority/source record、既存ledger revision/base digest、操作主体・時点・相関ID、許可済みwrite scope、ならびに前回操作のreceipt・中断/未完義務。L0 charterが入力に含まれる場合はcanonical L0層外authority anchorとして識別・参照し、L1-L12 layer rowへ混入させない。
- **提供**：入力を受領した旨とprovenanceを保持するappend-only候補登録receipt、選択scope・layer・source/template/ledger revision・digest・statusを示すlayer snapshot/projection、HARNESS定義proposalの対象ledgerへの追記結果、gap/未完/unknown/stale/conflict状態、writer operation結果と再開相関情報。追記は候補proposal recordの追加であり、HARNESS正本の意味変更や要求採択ではない。既存行の上書き・削除・意味改変を行わず、訂正は新recordと履歴関係として表す。
- **依存4区分**：
  1. **意味契約（writer操作時に必須）**：HARNESS-COREのHARNESS-L2-040/041と対のL11-040/041が定めるlayer/template意味、applicability、atom・proposal・gap契約。HARNESS-L2-009のactive template適用条件は041経由で照合する。HARNESSが生成主体/意味ownerで、OSは入力として消費する。2026-09-29のPO判断はHARNESS-L2-040/041のrevision -002とHELIXOS-L2-038のrevision -001を採択した。採択記録だけではwriter operationの実行許可を生成せず、対象revisionで契約が有効化され、既存operation authority・scopeが成立することを照合する。この節の追加追補はHELIXOS-L2-038 revision -002候補であり、同判断の対象revisionではない。
  2. **authority・provenance（常時）**：`HELIXOS-L2-015`の正本/source/decision authority記録と`HELIXOS-L2-019`のevent/evidence/continuity。Issue/PR/register/receiptから採択、承認、実装権限を生成しない。
  3. **state・trace・snapshot（常時）**：`HELIXOS-L2-016`の対象revision・identity・edge・unknown/stale状態追跡。snapshotは選択入力のprojectionであり、全層・全対象のcoverage完了証明にしない。
  4. **writer operation（append時）**：`HELIXOS-L2-017`の既存ticket/workflow境界と、SECURITYの有効な操作authority・scope、必要な場合のINFRASTRUCTURE資源。writerの選択・再試行・停止は既存operation authorityに従う。HARNESSのsemantic admission、requirement採択、独立review/受入を代行しない。
- **保証**：同一の入力revision・scope・契約version・base digest・payloadに対する重複/再開操作は同一logical proposal recordへ冪等に相関し、二重appendや前revisionのsnapshotをcurrentとする誤りを出さない。同じproposal/correlation IDでpayloadまたはbaseが異なる入力は衝突として保留し、既存recordを上書きしない。新revision/template/contract/baseは影響snapshot/proposalをstaleとして区別する。snapshot/proposal receiptは入力集合と除外・gap・unknownを明示し、選択scope外を含めて全体網羅と主張しない。提案の追記状態（未登録/登録/失敗/unknown）と、HARNESSでの意味判定・採否・下流実施を別状態として保持する。
- **権限境界**：本候補、write成功、snapshot生成、append receipt、PR/Issue/CI/mergeは要求意味・HARNESS契約・人間decision・要求採択・L3承認・SECURITY authority・実装/実行/配布/release許可を生成しない。意味の変更、retire、採択が必要なら既存authority状態モデルに従う該当decisionへ戻す。既存の有効権限は再利用し、毎回の人間承認を新設しない。
- **失敗時の戻し先／未完義務**：対象/layer/source不明、base/digest/revision不一致、scopeまたはauthority欠落、契約/atom/proposal schema unknown、stale input、重複衝突、storage/projection/receipt部分失敗は成功snapshot/appendとして公開しない。未完record、元event、未解決edge、失敗位置、attempt/correlation、再開条件を保持する。source・authority・HARNESS意味の不明はそれぞれ正本/判断主体またはHARNESS契約ownerへ、OS state/projection/writer不整合はOSのL2-015/016/019/017の責務先へ返す。修正後はcurrent baseで再照合し、部分成功から採択・完了を推定しない。
- **旧sourceと変更理由**：旧 `HIL-FR-46` はL1-L12 ledger contract、L0別anchor、row identity/revision/source/digest/status/owner/edge、catalog/snapshot/coverage receiptを要求し、旧 `HIL-FR-47` はactive templateの原子的obligation抽出、ledger proposal、gap/digestを要求した。HARNESSへの意味契約再導出は#2234の`HARNESS-L2-040/041`とL11対へ置かれた。旧sourceのうちwriter実行、snapshot生成、候補行の登録/保存はHARNESS候補や既決OS-L2-015/016/017に明示されない残差であるため、この候補でOSの運転責務として提案する。FR46/47全体の後継割当ではなく、R2 receiptがholdingに残した実行/保存部分に限定する。durability・冪等・中断復旧は旧FR46/47の明文条件とせず、現行OS-L2-019/016/017の継続・状態・運転契約から導く。旧のlayer意味・obligation抽出意味は保持し、旧IR/HR-FR-HIL-18/HAC/HAT全体の被覆や旧runtime挙動の移植は主張しない。
- **source / holding / parent / consumer**：旧sourceは `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:136-137`（旧file SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`、source asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、FR46 line SHA `a62b63ab18b23ac9564d6c7ffca7580ac9471a6d6e7374f8e4a26c93f0441b6c`、FR47 line SHA `785f0998ca9fd2192bcddc638d1ef1233551c251e307e631303642abe7713fad`）。保全先は`MPR-SH-HARNESS-LAYER-LEDGER-EXTRACTION-001`（`MPR-RCPT-HARNESS-LAYER-LEDGER-EXTRACTION-2026-09-28-R2`、authority_effect `none`）。HARNESS消費側は#2234 `HARNESS-L2-040/041`とそのL11-040/041。OS上流parentはHELIXOS-L1-001/002/003/004/008、関連現行unitはL2-015/016/017/019。候補consumerはHARNESSの該当layer ledger・template proposal接続、OSのlayer snapshot/state projection、後続のL3要件・設計pair（別承認/導出待ち）。実装consumerや保管schemaは未確定であり、本候補で固定しない。
- **PO revision境界**：2026-09-29判断記録`po-decision-2026-09-29-57candidates.md`はHELIXOS-L2-038 revision -001（節digest `sha256:603b5db48045408a85d116071a4ad0f8a470064cd073a05beb9bc118f386fd6c`）と対L11 revision -001（節digest `sha256:eabb68eaafc76f0080fbe9cb9c6904005c88b72e7cee9563f2515b4488de2e5d`）を採択し、HARNESS-L2-040/041 revision -002も採択した。この節への追補を含むrevision -002は独立した未採択候補であり、revision -001の採択bytes・authorityを遡及変更せず、追補の採択も生成しない。追補は旧HST-CASE-030-04/05のOS側writer outcome（commit拒否、quarantine保持、current snapshot不更新）の欠落を補う提案であり、HARNESSによるatomicity／nondeterminismの意味判定をOSへ移さない。
- **OS writer negative oracle追補候補（revision -002、未採択）**：HARNESS-041-003が同じ対象input/template/extractor versionに対しatom対応不一致または同一入力・同一extractorの再抽出digest不一致のfindingを返した場合、OSはそのHARNESS outcomeとsource/proposal/base/correlation参照を入力として保持する。OSは原子的意味や抽出決定性を再判定せず、非atomic findingではproposal appendを`rejected`として行数増分0、nondeterminism findingでは対象を`quarantined`としてcurrent projectionの更新0にする。両方で直前のcurrent snapshot/projectionを変更せず、finding・失敗位置・操作receiptを相関可能に保持する。これらのOS出力条件は、HARNESS側のfinding生成、要求採択、操作authorityを代替しない。PO採択済みHARNESS-L2-041 revision -002はこれら二つの追加failure条件を規定していない。旧HST-CASE-030-04/05のcodeは旧caseとの対応印に限り、現行HARNESS finding identityとして固定しない。該当findingの契約を加えるHARNESS-L2-041 revision -003（MPR-RC-HARNESS-L2-041-003）は現行register上の未採択候補であり、それが別途採択・有効化されるまで、このOS追補の二fixtureを実行可能な要求条件として扱わない。

### HELIXOS-L2-039 WBS作業identityと登録前適格性（単体候補、version_target: 1.0）

- **状態と親L1**：039は未採択候補。親は#2199の2026-09-28 PO判断が対象revisionを確定した`HELIXOS-L1-002`（複数projectにまたがる作業の欠落・競合・stale把握）と`HELIXOS-L1-009`（管理・推進・検収の責務分離）である。候補の追加自体はその判断に含まれず、L1採択から039の採択を導かない。
- **対象と境界**：OSが作業候補を台帳へ登録可能とする前に、安定した作業identity、親要求ID、対象product、粒度（task／aggregate）、担当候補、依存、予算の存在を対応づけて確認する。加えて、候補の作業単位形が適用対象となるHARNESS `WBS-HARNESS-001`の有効な契約revisionに適合することを検査する。不適合は登録拒否、契約revisionまたはapplicabilityが不明ならunknownとして登録を保留する。HARNESSの規範内容自体は再定義しない。identityは同じ意味の作業を重複登録しないための参照であり、物理ID書式・台帳schema・分解方式・担当割当・実行許可を新設しない。親要求のkind（unit／connection／composite）は親要求から参照する。推進が行う作業分解・route選択はL2-017、portfolio全体の状態とtraceはL2-016の責務として保つ。
- **入力・提供・保証**：入力は採否済み親要求ID、対象product、taskまたはaggregateの粒度、担当候補、作業の意味と依存、budget参照、既存作業identityとの照合に使う証拠、および適用されるHARNESS `WBS-HARNESS-001`契約revisionとapplicabilityである。提供は、それらを結ぶ登録前判定と作業候補のidentity・親要求・scope・dependency・budgetへのtraceである。親要求が無い、依存が循環、budgetが無い、同じ意味の既存作業がある、または有効契約revisionに形が適合しない場合は新規identityで登録可能としない。契約revision/applicabilityや照合範囲が不明なら適合または重複なしと推定せずunknownで保留する。
- **既存要求との境界**：L2-016は作業から検証・提供・運用までのportfolio状態、欠落・競合・staleを追跡し、L2-017は入力制約からticket graphと適格性確認後のworkflowを推進する。039はその前段で、OS管理対象となる作業identityの同一性と登録前の最低条件を扱う。039は016の全portfolio trace、017の作業分解・route選択・workflow生成、L2-010/011の管理・推進・検収・統合計画を置き換えない。
- **旧sourceと保持／変更**：HDEC-L2D-S0-02は2026-09-19に承認した分割前候補（`docs/governance/candidates/wbs-ledger-requirements.md`）のexact revision（SHA-256 `34711045caea9a6bac6fa1084b056e393593efe76099b7f124af4e17265a84f6`）を`split`判断した。旧WBS-OS-002の原文は「HARNESSが定める作業単位の形（`WBS-HARNESS-001`）に適合しない作業を台帳に登録できない。作業は安定したidentity、親要求ID（親要求のkind＝unit／connection／compositeは親から引く）、対象product、作業の粒度（task／aggregate）、担当候補を持つ｜形に適合しない作業、親要求を持たない作業、依存が循環する作業、予算の無い作業を登録できない。同じ意味の作業を別identityで二重登録しない（`RUL-TKT-01`）」であり、現行のOS split候補にも保持されている（[WBS-OS-002](../candidates/wbs-ledger-requirements.md#helix-os-管理層に対する要求)、表行）。HDECはL2/L11適用を別PRとして残したため、本候補ではこの条件をOSの登録前適格性へ接続し、HARNESSの作業単位形規範（WBS-HARNESS-001）を再定義しない。これは旧WBS全体の移植ではない。
- **RUL-TKT-01の原文と範囲**：旧規則は「PLAN files を作成・更新する前に、既存の `docs/plans/` entries を確認する。重複 PLAN を作るより、既存 PLAN の延長を優先する。」（`archive/legacy-generation-2026-09-14/root/.claude/CLAUDE.md:47-48`）。asset `LEGACY-ASSET-317AE893EF4ADD3AF492`、file SHA-256 `a8dd3ed8854e85ee4e749eb0e3e83195d076586611b697727099f946f42dfaa9`、各行SHA-256 `47=e08be98eb0fa306a41044a2fce273e6659ecd1e53789b4f2bc7d758984d762a2`、`48=e5acedde02b652c3788dd784e45d6fd768b1267a990263efa74d4dacdaf2c7c5`。RUL-TKT-01の旧atom RA-199は`MPR-SH-LEGACY-RULE-004`に保留されている。039が採るのはRA-199由来とはせず、HDEC-L2D-S0-02で承認されたWBS-OS-002の「同じ意味の作業を別identityで二重登録しない」条件に限る。RA-199の「既存PLANの延長を優先」は保留のままで、039に保持したとしない。旧PLANのpath・schema・runtimeも移さない。
- **範囲外と権限境界**：旧PHCAP-08との同等性、WBS-OS-001/003–008の充足、台帳engine/schema/DB/GitHub連携、作業graph全体の生成・独立検収は本候補から主張しない。候補の存在や判定は要求採択、実行・予算の許可、担当割当を生成しない。version_targetは目標版であり、採択状態を表さない。

### HELIXOS-L2-040 retry上限到達時の型付き戻し先（単体候補、version_target: 1.0）

- **親と状態**：`HELIXOS-L1-003`。採択済み`HELIXOS-L2-009`の継続・復旧と`HELIXOS-L2-010`の既存ticket型を接続する未採択候補。2026-09-28のOS判断が固定したL2/L11への追補採択ではない。
- **受け取るもの**：対象ticket／assignment／attemptのidentity、同一episodeに持続する失敗回数とretry lineage、適用中の既存retry budget／Recovery policyのrevision・scope・上限、直近失敗の理由と要求revision、継続元の未完義務。実験retryを扱う場合は本線と別のbudget identityを受け取る。
- **提供するもの**：上限到達か台帳取得不能かを区別した次回retryの可否と、上限到達理由に対応する既存のRecoveryまたはBackflow ticket型・戻し先・元lineageを結ぶ未完引継ぎ。Backflowは要求意味・入力の不足を要求エンジンへ、Recoveryは逸脱・context切れから中断工程へ戻す。理由が他のrouteを要する場合は本候補で型を推測せず、既存`HELIXOS-L2-010`のownerへ返す。
- **保証**：適用policyの上限に達したら追加retryを起動しない。sessionやWorker交代で失敗回数・budgetを初期化せず、持続eventと元ticketから再構成する。台帳取得不能・policy不明・理由不明は許可や成功へ補完しない。上限到達のみで全ticketや無関係な作業を止めず、当該scopeの再試行と未完義務に限る。retryの数値、Recovery policy、ticket型、実行authorityを本候補で新設しない。
- **依存区分**：常時必須は`HELIXOS-L2-009/019`の持続event・checkpointと、`HELIXOS-L2-010`の既存ticket型・戻し先、現在のticket/assignment identity。操作時必須は同じscopeへの次回retry要求と適用中のbudget/policy照合。選択入力は実験retryが選ばれた場合の別budgetとそのlineage。参照のみは旧`HXT-FR-014`の固定runtime/schemaと今回routeしないReverse／Human Required等の旧名称であり、それらを現在の新ticket型へ昇格しない。
- **失敗時の戻し先と未完義務**：event／attempt台帳が読めなければ元の記録owner、policy／上限が不明ならその決定owner、失敗理由と既存型の対応が不明ならOSのticket ownerへ戻し、追加retryを保留する。要求の意味差はHARNESSの要求形成とOS Backflowへ、復旧地点の不明はOS Recoveryへ戻す。停止理由、元ticket、累積回数、budget、未完義務を保持し、route待ちをclose/成功にしない。
- **旧sourceと意味境界**：旧`HXT-AC-015` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-acceptance.md:43`（file SHA-256 `fbfcdfa15fbcd207df3443f0268d37f98cbc050423d596d38e2ed68e6bf0302d`、line SHA-256 `f412f81552711a0846872ed733042aebc93d82bdb508b85b53a124ef5a202e29`）の「retry上限超過→typed Recovery/backflow」を限定して再導出する。親`HXT-FR-014`同`execution-ticket-requirements.md:240–242`（file SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`）のReverse／Human Requiredへの全routeや実験retryの詳細設計は未照合のまま保持し、本候補だけで旧familyを被覆済みにしない。

### HELIXOS-L2-041 再読込不能時の正本再取得を伴う継続（単体候補、version_target: 1.0）

- **親と状態**：親は`HELIXOS-L1-003`。採択済み`HELIXOS-L2-009`の中断後の継続・復旧へ、provider/runtimeで指示経路を再読込できない場合の安全な継続条件を限定して接続する未採択候補である。2026-09-28のOS判断が固定したL2/L11への追補採択ではない。
- **対象と境界**：再読込不能なprovider/runtimeにおける「安全なsession transition」と「coordination-only continuation」を使うという旧条件を、継続時の旧指示、撤回済みclaim、secret、private reasoningの非継承、および継続に必要な外部authority sourceの再取得へ接続する。ここで外部authority sourceの種類、意味、選択、適用条件、取得方式やprovider/runtimeの挙動を新設しない。OS-009の継続・復旧と未完義務の保持を具体化し、再起動、provider fallback、指示再読込機構そのものは定義しない。
- **通常時の条件**：再読込不能時には既存の許可・継続契約に従い、安全なsession transitionとcoordination-only continuationを用いる条件を保持する。旧指示・撤回済みclaim・secret・private reasoningは引き継がず、次の処理が依存する外部authority sourceは継続前に既存の正本経路から再取得する。取得したsourceのidentity/revisionと確認結果を既存のprovenance記録へ結び付け、sourceが提供する意味を会話履歴やrestart packetから再構成しない。
- **再取得不能／不整合**：sourceが取得不能、revisionや正本性が確認不能、またはauthority状態がstale・撤回・conflictの場合、そのsourceに依存する継続をauthority確認済みとして進めない。対象の未完義務と不確実性を保ち、既存authority ownerへ戻す。確認できない範囲だけを保留し、無関係な作業や全providerを一律停止する規則は作らない。
- **隣接要求との境界**：`HELIXOS-L2-009`は継続・復旧、未完義務・予算の保持と二重実行防止を担い、本候補は旧sourceが示す安全なsession transition/coordination-only continuationの条件、および再読込不能時に持ち越さない情報と外部正本の再確認を限定する。候補状態の`CLR-R06`はrestart packetの必要情報・禁止内容に近い条件を記述するが、本候補の採択根拠や同等な採択済み要求ではない。`HELIXSECURITY-L2-005`のraw secretをAI contextへ渡さない境界を維持し、他の禁止情報や外部正本再取得まで同IDで充足したとは扱わない。
- **権限境界と旧source差分**：旧`IPC-R07`のcoordination-only continuation、旧指示・撤回claim・secret・private reasoningを持ち越さない条件、外部正本の再取得を意味起点とする。現行では採択済みOS-009の継続・復旧契約と既存authority/provenance ownerへ接続し、「安全なsession transition」「coordination-only continuation」の厳密な内容や旧runtimeの具体機構を新設・移植しない。候補本文、packet、継続の成立は要求採択、人間decision、authority、実装・実行・配布許可を生成しない。

### HELIXOS-L2-042 Worker成果のschema／digest適格性と緩和後再検証（単体追補候補、version_target: 1.0）

- **親と状態**：親は`HELIXOS-L1-003`。採択済み`HELIXOS-L2-004`のWorker割当・成果形式・実行・成果回収へ、Workerが返す成果の適格性条件を限定して追補する未採択候補である。2026-09-28のOS判断が固定したL2/L11への追補採択ではない。
- **責務と適用範囲**：OSは既存assignmentの対象・scope・期限へWorker成果と検証状態を結び、未検証成果をacceptedとして扱わない。成果に適用するschema／digest policyおよび検証oracleは、選択された既存task/verification contractから受け取る。HARNESSがtask固有の検証義務とoracleを定め、SECURITYは既存のoperation authorityと実行制約を担う。OSはschema、digest algorithm、authority、追加承認経路を発行しない。
- **既定の成果条件**：Worker成果は、assignmentに結ばれた適用schemaに対するstrict validationと、その成果bytesに対応するdigest検証が成立するまで未検証とする。適用schema／digest policyまたはそのrevisionが欠落・unknown・stale、不一致、validation未実施の場合、成果を受理・完了・検証済みへ進めず、理由と未完義務を既存OS evidence/assignmentへ残す。digest一致だけをschema適合、内容の正しさ、authorityの証拠にしない。
- **緩和と再検証**：既存の適用条件に従って成果検証を緩和する場合、緩和対象、理由、有効期限を特定する。緩和下で返された成果は、対象成果とassignment/scopeに結び付く再検証receiptが、選択済みHARNESS oracleと同じ対象revision/scopeに対する結果を示すまでacceptedにしない。receiptまたは参照oracleが欠落・unknown・stale、対象不一致、期限外であれば未完のまま保留する。緩和条件は新しい許可や権限を生まず、既存SECURITY authorityの適用を置き換えない。
- **隣接責務との境界**：`HELIXOS-L2-004`は割当・Worker成果形式・結果回収を担い、`HELIXOS-L2-007/019`は証拠の出典・revision・継続を保持する。HARNESS-L2-005は選択taskに必要なverification/oracleを定め、OSはそのoracleの意味を追加・削除・変更しない。SECURITY-L2-007/008は既存のWorker制約とoperation authorityを担い、本候補はsecurity policyや許可条件を再定義しない。
- **旧sourceとの保持と限界**：旧v1.3 §4.10 HR-FR-P2-08の「strict schema／digest検証を既定」「緩和には対象、理由、期限、再検証receipt」を保持する。旧schema、digest方式、Node/Python実装、provider/runtime、旧receipt形式は移植せず、追加承認者や新しい緩和許可手続きを設けない。旧source全体の再配置やcoverage closureは主張しない。source lineと候補範囲の照合は[source-lines草稿](../../governance/audits/requirement-registration/os-v13-worker-output-source-lines-2026-09-28.jsonl)および[coverage receipt草稿](../../governance/audits/requirement-registration/os-v13-worker-output-coverage-receipt-2026-09-28.json)を参照する。候補本文は要求採択、実装・実行許可を生成しない。

### HELIXOS-L2-043 Worker委譲のapproval request／tool call／result追跡（単体追補候補、version_target: 1.0）

- **親・状態**：`HELIXOS-L1-003`／`HELIXOS-L1-008`に接続する未採択候補。対象はOS assignmentに結び付くWorker委譲のevent追跡に限る。採択・実装・runtime起動の許可を生成しない。
- **保持する条件**：Worker委譲で発生するapproval request、tool call、resultを、それぞれ区別できる既存OS event contract上の型として交換・記録する。各eventは既存のassignment、source／revision、actorおよび因果関係の記録へ結び、request・実行したcall・返却resultの対応を後から追えるようにする。承認要求が既存の適用契約上不要な操作に、新しいapproval requestや承認を追加しない。
- **既存event契約との接続**：`HELIXOS-L2-004`の割当・実行・回収、`HELIXOS-L2-007`の共通証拠/provenance、`HELIXOS-L2-009`のevent永続化・冪等projection・checkpointを使う。既存event形式を置換せず、event schema、transport、adapter、runtimeを本候補で定義しない。
- **権限境界**：approval request eventは承認そのものではなく、tool call eventは操作許可ではなく、result eventは検証・完了・write transactionの決定ではない。eventの型・順序・記録からauthority、承認、成果採択、canonical state変更を生成しない。本候補は承認またはwrite transactionを決定する唯一の機構を定めず、旧Node control plane専有の意味を現行SECURITY／OS／Workerへ移管しない。適用operationの権限と実行は現行の各契約のままとする。
- **失敗・戻し先**：event型、相関、assignment/source/revisionとの対応が欠落・unknown・stale・conflictなら、対応する委譲chainを未完として記録し、既存event/provenance/ticket ownerへ戻す。missing eventをsuccessや承認に補完しない。影響するchainだけを保留し、無関係なWorker作業を一律停止しない。
- **旧sourceとの保持と未決境界**：source-lines/coverage receipt草稿は、旧HR-FR-P2-06のtyped event節だけを本候補への限定対応案とし、同じ行の「Node control planeだけがapprovalとwrite transactionを決定する」という別の意味条件を未計上として保持する。Node専有条件を保持・現行役割へ再導出・retireする判断はPOへ残し、この候補やreceiptで旧行全体のno_loss／condition closureを主張しない。

### HELIXOS-L2-044 feedback prose-only handoverをresolutionとして扱わない（単体追補候補、version_target: 1.0）

- **親・状態**：`HELIXOS-L1-006`に接続する未採択候補。既採択`HELIXOS-L2-007`のfeedback lifecycleとsource/evidence保持に限定して接続し、採択・実装・運用許可を生成しない。
- **保持する条件**：feedback findingのprose handoverだけをresolutionの証拠として扱わない。proseだけでfindingの状態をresolvedへ変更せず、既存のfeedback lifecycleと`HELIXOS-L2-007`が求めるsource/revision付き証拠の条件が満たされたか不明な間は未解決として保持する。本候補はresolutionに必要な証拠の新しい型・十分条件を定義しない。
- **既存責務との境界**：intake、classify、ack、pending、resolutionの区別、未ack findingを消さないこと、およびsource/evidence保持は既存OS契約のまま適用する。prose handoverに独立したauthoritative statusを与えず、新しいactor、承認、通知、event schema、projection、SessionStart条件を追加しない。
- **sourceとの限界**：旧HR-AC-HYB-006のprose-only resolution clauseだけを候補入力とする。未ack findingの消失、source HEAD mismatch、HR-FR-HYB-006のevent/projection lifecycleとSessionStart surfaceは候補外のsource remainderとして保全する。旧行・条件全体の被覆・closureを主張しない。

### HELIXOS-L2-045 各機構の検証・test・検出基盤readiness一覧（単体候補）

- **状態**：HELIX-OSの未採択候補。version targetは未指定。旧HELIX-HARNESSのFR-L1-35をHELIX-OSへ再配置する提案であり、source ownerの移管、要求採択、実装・運用許可を生成しない。FR-L1-35の保持／置換・retireに関する既存の未決A/Bは、[残差disposition記録](../../governance/audits/requirements-stage/legacy-confirmed175-residual-disposition-2026-09-28.md)のとおり未決のまま保つ。
- **親L1**：採択済みHELIXOS-L1-002（複数projectの要求から作業・検証・提供・運用までの欠落・競合・stale把握）。対象親revisionは[OS L1計画](../L1-planning/system-intent.md)の2026-09-28固定bytes。L1-002との接続は候補根拠であり、この候補自体の採択ではない。
- **対象と提供**：OS-L1-002の適用対象として選択された機構について、検証・test・検出基盤の整備状況を「実装済み」「設計済み・実装未」「未設計」の3区分で一覧する。旧sourceの「各機構」をどの現行対象・版へ割り当てるかは確定しておらず、本候補から現行8機構すべて、将来のWeb対象、または特定versionへの適用を推定しない。ここで扱うのは基盤整備状況の分類と一覧であり、個別機構の進行dashboard、専用UI、リアルタイム更新、PO／Worker roster表示は要求しない。
- **既採択状態との境界**：HELIXOS-L2-016／L11-016が定めるportfolio trace・一般state・unknown/staleの意味を変更せず、FR-L1-35の3区分へ置き換えない。分類の根拠が不明または古い対象は既存L2-016に従いunknown/staleのまま扱い、三つのreadiness区分へ推測で割り当てない。
- **旧sourceと再導出**：旧FR-L1-35の条件atomを意味再導出する候補である。ここでの適用対象はOS-L1-002の適用対象として選択された範囲の候補であり、旧sourceが含意する全対象・owner・版の対応は未確定のまま残す。旧HARNESS機能からOS portfolio projectionへの責務・owner移動は提案に留まり、対象範囲・owner・version target・採否についてPO判断待ちとする。旧source、保持範囲、現行L2-016との差分は[限定coverage receipt](../../governance/audits/requirement-registration/os-fr-l1-35-readiness-coverage-receipt-2026-09-28.json)に示す。receiptの候補入力no_lossは入力atomをこの候補範囲へ対応づけた記録であり、POが確定したsemantic successor、採択、旧source holdingの解消を意味しない。

### HELIXOS-L2-046 dispatchからmergeまでのauthority・HEAD・scope連続性（connection候補、version_target: 1.0）

- **親と状態**：採択済み`HELIXOS-L1-009`／`HELIXOS-L1-010`に接続する未採択候補。管理・推進・検収の責務分離と変更・依存に応じた統合順序／検証集合を、既存の作業authorityと運用規則の範囲でつなぐ。候補本文・registerは要求採択、実装・実行・merge許可を生成しない。
- **提供するもの**：一つの選択済み作業scopeについて、dispatch、実行、Ready化、merge admissionの各遷移で対象、適用中のauthority、HEAD/revision、scope、既存契約が要求する検証義務とその結果を照合する接続条件を示す。遷移間に対象HEAD、authority、scopeまたは適用条件が変わった場合は、その変化をstale／未完として扱い、既存の判断・検証・merge admissionを再照合する。工程の一部の成功を後続段階の成功へ伝播しない。
- **禁止する迂回**：pathが`docs/`であることだけを理由に、既存の適用可能なauthority・review・required verificationを省略しない。探索・prototypeのmergeはその限定scopeの証拠共有に限り、本実装やproduction pathへの取り込み許可へ読み替えない。適用中の契約・設定でrequiredとされた確認を、未実施のままskipしてReady／merge可能としない。
- **既存責務との境界**：`HELIXOS-L2-010／011`のticket、推進、統合計画責務、`HELIXOS-L2-004／007／008`のassignment・authority・証拠・CI運転、HELIX-OSのGitHub運用モデルのPR作成／独立review／merge admissionを置き換えない。検証義務の定義はHARNESS、操作authorityはSECURITY、具体的なrequired条件と除外可否はそれぞれ既存ownerの採択済みcontractが持つ。本候補は新しいapproval、check、scope、skipまたは許可方式を定義しない。
- **source範囲と限界**：旧RFA-AC-16の一つのacceptance rowだけをこの接続候補へ対応づける。旧RFA候補全体、隣接AC行、旧engine／schema／runtime、全GitHub operationの実装・受入やsource closureは対象外で、旧条件全体のsuccessorを主張しない。

### HELIXOS-L2-047 チケットの理由付き返却と新revision再発行（単体候補、version_target: 1.0）

- **親と状態**：`HELIXOS-L1-009`に接続する未採択候補。採択済みL2-010のticket/Backflow、L2-004のassignment、L2-007のsource/evidence記録を利用する。候補登録は要求採択、ticket実行・再発行の運用許可を生成しない。
- **提供**：Worker、検収その他の受け手は発行済ticket本文を直接編集せず、作業の誤り・不足・矛盾を、理由、対象条件、根拠source/revisionとともに発行元OSへ返す。返却は元ticket identity、revision、assignmentと因果関係に結び、理由と未完義務を追跡できる。
- **再発行**：OSは元revisionを保持したまま、返却理由に対処した新ticket revisionを発行する。新旧revisionは既存のtyped relation/lineageで結ぶ。assignment、Attempt、結果、authorityは、新revisionの現行契約が明示的に適格化しない限り継承しない。要求意味・scopeの変更、split等が必要な場合は既存authority/Backflow規則へ戻す。provider、actor、model、session、branch、worktree、lease、現時点の優先順位・進捗・measurement値等の運用属性だけをticket意味revisionの変更理由にしない。
- **PO確認済みのTicket非参照境界**：POは「チケットそのものに参照をつけたり実装の一部みたいに扱わないってこと。」と確認した。Ticket自体に他Ticket・成果物への参照を付けて依存の結節点にせず、設計・コード・文書等の成果物からTicketを要求根拠・実装部品として参照しない。Ticketは作業指示であり、根拠は要求・設計・契約の正本へ辿る。作業順序の制約が要る場合は、既存OSの計画・typed relation契約（旧`execution-ticket-requirements.md:212-214`）との適合を照合する。Ticket本文外の特定graphへの配置は旧文・PO回答から一意に決まらない新規案であり、本候補はその配置や既存relation型の変更を採択済みとみなさない。
- **不成立時**：返却理由または根拠が欠落、受け手がticket本文を変更、旧revisionを上書き、再発行時に元revisionを消去、または旧assignment/resultを暗黙継承する場合は不成立。source、対象revision、scope、発行元が不明/stale/conflictなら当該ticketだけを未完としてOSへ返す。
- **責務境界**：OSがticketの発行・再発行主体であり、LABO/INTELLIGENCE等のproposalだけから発行しない。GitHub Issue/PRはticketのprojectionで、編集・close・mergeからticket意味や完了を作らない。L2-007 feedback lifecycle、L2-009継続/復旧、L2-010 ticket kind/Backflow先を置換せず、新しい承認者・承認を加えない。
- **旧sourceとの対応と限界**：旧execution-ticket sourceのimmutable/revisioned条件、ticket本文から運用属性を分離する条件、管理側のproposalはticket意味を直接上書きしない条件を保持する。旧runtime/schemaは移植しない。source-lines/coverage receiptは選択したatomへの対応だけを示し、旧source全体の移管・closureを主張しない。

### HELIXOS-L2-048 返却・検証不成立feedbackの評価・還流接続（connection候補、version_target: 1.0）

- **親と状態**：`HELIXOS-L1-006`／`HELIXOS-L1-009`に接続する未採択候補。L2-007 feedback lifecycle、L2-020の検証不足・oracle欠落時の戻し、L2-047のticket返却/revision lineage、LABOの評価候補、INTELLIGENCEの配置proposalを接続する。いずれの既存責務も置換しない。
- **提供**：ticket返却、検証不能、oracle/input不足のfeedbackを、finding identity、ticket/assignment、対象HEAD/revision/scope、理由、欠けた入力またはoracle、発生元、既存のresolution条件へ結んで運搬する。OSは既存lifecycleでintake、分類、ack、pending、resolutionを区別し、解決証拠が既存条件を満たすまで未解決を保持する。
- **受渡し**：OSは運転・検証観測をLABOへ評価可能なevidence付きcandidateとして渡す。LABOは理由分類、範囲、counterexample、再評価条件を評価し、提案を返す。INTELLIGENCEはLABO評価済みでtask scopeが適合する証拠だけを次回placement proposalの入力にできる。OSだけがticket発行/再発行・割当・進行を決める。
- **還流**：再発行後のticket/resultを元findingとの因果relationで結び、LABOが同一条件での再発行後成立状況を評価できる。未評価、未ack、evidence不足、比較不能をsuccess/resolutionへ変換しない。返却が再発行を要する場合はOS-047と既存ticket契約へ戻す。
- **境界**：LABOは評価とfeedback candidate、INTELLIGENCEは配置案、HARNESSは検証義務/oracle、SECURITYは既存authority/data-use、OSはintake/routing/status/ticket運転を担う。LABOはticket/assignmentを発行・割当せず、INTELLIGENCEはdispatchせず、自由文handoverだけでresolutionにしない。新しいevent schema、status、resolution十分条件、approvalを作らない。
- **閉じたticketの後日finding**：後日判明した不具合/rollback/recoveryは、evidence relationで元ticketへ接続し、時間の近さや同じpathだけから原因を断定しない。元のclosureは保持し、追補assessmentを別に作る。観測window未満、未追跡、打切りをdefect 0件と数えない。
- **旧sourceとの対応と限界**：未解決finding/evidenceを保つこと、管理提案からticket意味を直接上書きしないこと、閉じたticketのclosureを保ったまま後日findingを因果relationで接続し追補assessmentを作ることを意味起点とする。旧lifecycle store/schema/runtimeは移植しない。旧source全体のcoverage closureは主張しない。返却率などの指標は新規案であり、本候補だけでは因果効果や改善完了を確定しない。

### HELIXOS-L2-049 Worker稼働観測と低干渉task割当（単体候補、version_target: 1.0）

- **親と状態**：親は`HELIXOS-L1-003`／`HELIXOS-L1-008`。未採択候補であり、採択済み`HELIXOS-L2-004/005/007/008/009`にあるcapacity計測・backpressureの具体化を提案する。固定L1 revisionの採択から本候補の採択を導かない。
- **要求案**：OSは設定されたresource上限、割当可能、割当中、実行中、遊休、検証待ち、統合待ち、停止・失敗を区別し、assignmentと状態証拠から利用状況を観測する。登録resource数や設定上限を実行中数・accepted throughputと同一視しない。OSの上限は対象・期間・budget・停止条件を持つ変更可能な設定であり、固定Worker数を要求しない。
- **遊休時の割当境界**：遊休Workerへ追加taskを割り当てるのは、ticketが独立にREADYで、依存・優先順・deadline・scope・single-writer/authority lease・changed-path競合・review/merge義務を保ち、低影響の適格性を確認できる場合に限る。適格性の材料はINTELLIGENCEの配置案と既存scope/競合情報を使い、OSが影響評価の意味を再定義しない。元ticketの順序を追い越さず、別assignmentとして成果・予算・未完義務を追跡する。適格な未着手taskがなければ遊休をそのまま記録し、稼働率目的のtaskを作らない。
- **隣接要求との境界**：L2-004は割当と実行回収、L2-007は証拠、L2-008は検証実行、L2-009は継続・復旧とbudgetを所有する。本候補は状態の区別と安全な遊休枠利用を具体化し、HARNESSの工程・検収義務、INTELLIGENCEの配置案、INFRASTRUCTUREの実resource状態、SECURITYのauthorityを置換しない。旧pool/queue schema、provider名、runtime dispatch、CI、PR／DB投影を定義しない。
- **旧sourceから保つ意味と差分**：旧`LEGACY-ASSET-11E8FE0479751F02A4A3`の3L-BR-010（`three-lane-capacity-profile-requests.md:17-21`、file SHA-256 `a428f2de8652b9508456aed358152865a1f96f6978e5d204b1e2dfd3a1d2e1ba`）からcapacity種別とpool上限／active WIPの分離を保つ。旧`LEGACY-ASSET-F172CBC75CAA4FCFC2EB`（`three-lane-capacity-profile-requirements.md:31`、file SHA-256 `d2df9851fcd3db79ffaed03116f85118da43fe26f943412045215a58cfa3804e`）から下流能力に応じたbackpressureを保つ。旧`LEGACY-ASSET-23D3D9769B093AFDCC25`（`management-integration-cell-requirements.md:58-60,104-106`、file SHA-256 `f840e16cab80b88fa4e4730ed49f47f0afeee2050cad309a3d87da4cce057ec6`）の競合しないREADY task、順序、空いた枠への次taskを意味再導出する。旧数値（各社の3/2、burst 5、8-slot）、DB、CI、merge queue実装は持ち込まない。低干渉の選定条件をOS単独で判定する細目は旧記述に根拠がないため新規案としてPO選択肢に示す。

### HELIXOS-L2-050 独立review capacityの観測と調整（単体候補、version_target: 1.0）

- **親と状態**：親は`HELIXOS-L1-003`／`HELIXOS-L1-009`。未採択候補。L2-004の割当・review能力境界とL2-007の証拠を、review queue capacityの原因別調整へ具体化する。採択済みL2/L11のPO判断に追補採択は含まれない。
- **要求案**：OSはreview待ち件数・待ち時間・rework占有率・reviewer稼働率とreviewerの利用可能状態を、運用設定にある各typed閾値・上限・縮退条件と照合する。設定閾値を超えた原因が独立reviewer capacity不足と確認でき、別のdownstream詰まりが主要因でなく、利用可能な独立reviewerが有効なauthority/capability/sessionを持つ場合にだけ、上限内で別対象へのreview assignmentを追加する。各assignmentは対象PRのcandidate generationと対象HEAD/revisionへ一意に束縛し、reviewer identity/context/routeと結果を追跡する。同一PR generationへ複数の主review assignmentを発行せず、HEAD変更時は旧世代の結果を再利用せず新世代として再reviewする。
- **縮退とbackpressure**：review待ち件数・待ち時間・rework占有率・reviewer稼働率が設定した縮退条件を満たす場合は、新規assignmentを減らせる。稼働中leaseを中断・再割当せず、完了後に余剰capacityを縮退する。上限到達、独立reviewer不在、または検証・統合等のreview以外が詰まりの原因なら、reviewer追加を成功とせず、新規Worker dispatchを必要なscopeでbackpressureし、観測値・原因・待ち義務を残す。同一対象の重複reviewをcapacity増加として数えない。
- **隣接要求との境界**：HARNESS-L2-005は作成者と独立検証者の意味・HEAD再検証条件を所有し、OSはreview queueとassignment/capacityを観測し割当を制御する。複数reviewが並行しても、各mergeは既存GitHub運用モデルに従い、その都度最新base・content HEAD・scope・stale状態とmerge admissionを独立に再照合する。capacity増枠はmerge条件を緩めない。SECURITYは既存のauthorityと実行制約を保つ。INTELLIGENCEの配置案は必要に応じ入力にできるが、reviewer適格性やOSのdispatch authorityを代替しない。本候補はprovider数、固定reviewer数、具体的threshold値、session生成runtime、CI／PR／Merge Trainを定義しない。
- **旧sourceから保つ意味と差分**：旧`LEGACY-ASSET-F172CBC75CAA4FCFC2EB`（`three-lane-capacity-profile-requirements.md:35,37-39`、file SHA-256 `d2df9851fcd3db79ffaed03116f85118da43fe26f943412045215a58cfa3804e`）から、review負荷が閾値を超えた場合だけcapacityを増やすこと、review leaseの一意性と差戻しlineageを保つ。旧`LEGACY-ASSET-B143CAC2AFF236C80280`（`three-lane-capacity-profile-acceptance.md:17-24`、file SHA-256 `14075ae16016c3585947f88d5bc633f1e2022a29fbe7a602d4403dd87c14e047`）から、capacity区分、backpressure、未測定増員と二重reviewの拒否をoracleとして再導出する。固定の第3reviewer/providerおよび旧CI/Merge Train/PR/DB fixtureは採用しない。具体的閾値、縮退手順、独立reviewer sessionを追加する操作境界は現行の固定要求にないため新規案として提示する。

### HELIXOS-L2-051 作成／reviewレーンのtask単位選択と配置適性（単体候補、version_target: 1.0）

- **状態・authority**：HELIX-OSの未採択候補、`registered_proposal`、`authority_effect: none`。採択済みHELIXOS-L2-004のWorker assignment、実行、authority、独立reviewを置換しない。要求候補の登録やreviewは、要求採択、assignment実行、runtime呼出しまたは操作authorityを生成しない。
- **親・責務**：採択済みHELIXOS-L1-003（Worker実行と割当）、L1-004（review・証拠統制）、L1-009／010（役割分離と配置案）へ接続する。HELIXOS-L2-004の既存assignment責務を、taskごとの作成／review配置と適性根拠へ具体化する。固定provider数、model名、恒久provider-to-lane表は要求しない。
- **入力・提供**：OSはticketのscope・役割・authority・task class、LABOがHELIX-Benchで測定した適用可能なWorker水準、INTELLIGENCEのticket別配置案、provider/runtime capabilityとそのtask classに対する有効な計測evidenceを照合する。OSは作成（`execution`）と独立review（`review_merge`）の各役割へ個別に適格なruntimeを割り当て、向きをtaskごとに選ぶ。LABOの計測やINTELLIGENCEの提案だけでscope、branch、budget、authority、review成立を変更しない。
- **独立性・返却**：同じ変更の作成と独立reviewに同一runtime/contextを割り当てない。provider名の違いだけで独立性を成立させず、runtime、context、authority、適用review routeの分離を記録する。reviewerは対象content HEADをread-onlyで確認しfindingを記録する。修正は作成責任側へ返し、修正後は新exact HEADとして独立reviewを取り直す。既存L2-004／L2-018／L2-020、L11のreview acceptanceとGitHub上流運用モデルを参照し、受入基準を重複定義しない。
- **配置適格性**：capability eligibilityをtask role/provider capability単位で表現する。Cursor cloud agentはこの候補の範囲で`execution`作成Workerに限り、`review_merge` reviewerへ割り当てない。この条件は配置上の制約であり、Cursor製品一般の安全性評価ではない。要求・設計taskへのClaude優先は、当該taskに適用できるLABO適性evidenceと利用可能性が確認できる範囲の配置案として提示する。未評価、scope外、authority不足を優先指定で迂回しない。
- **停止・戻し**：固定providerが利用不能、適性が未評価、evidenceが不足またはstale、task scope／authorityにunknown・conflictがある場合は適性や割当を推測しない。別の適格な配置をOSが選べるときはその根拠を記録し、選べないときは未割当として理由をOSと入力ownerへ返す。LABOは計測水準、INTELLIGENCEは配置案、OSはticket確認後のassignmentを担い、通知・ACK・provider/reviewer名だけでassignmentやreview receiptを成立させない。
- **旧sourceとの対応・変更**：旧HELIXのworker/reviewer役割分離、設計taskを適性evidenceのあるWorkerへ委譲すること、review finding・変更後HEADを作成責任へ戻す意味を再導出する。旧固定のCodex control／Cursor implementation／Claude review matrix、専用branch方式、旧runtime/hook/CLIは継承しない。taskごとの逆向き配置、Cursor create-only、要求・設計のClaude優先はPO判断対象となる新規候補である。旧source全体のsuccessor／移行完了は主張しない。

### HELIXOS-L2-052 merge後のlocal cleanupと後続PRの再照合（connection候補、version_target: 1.0）

- **親と状態**：採択済みHELIXOS-L1-002／004／009／010に接続する未採択候補。`HELIXOS-L2-010／011`のticket・統合計画、`HELIXOS-L2-035`のPR lifecycle event intake、`HELIXOS-L2-046`のdispatchからmergeまでのauthority・HEAD・scope連続性を置き換えない。本文・仮登録は採択、実装、実行、remote操作の許可を生成しない。
- **merge後のlocal cleanup**：明示mergeと所定のpost-merge read-afterが成功した後、merge済みPRとassignmentの所有関係を確認できるlocal worktreeとlocal branchだけを対象とする。所有関係を確認でき、他assignmentの使用中でなく、未完作業もない対象は、自動かつ冪等にcleanupし、対象と結果を既存の証跡経路で記録する。所有関係、使用状態、参照関係またはmerge後確認がunknown／conflictなら削除せず、未完理由を返す。再試行は同じassignment所有物だけに限定し、他のPR・worktree・branchへ波及させない。
- **remote ref境界**：remote branch／refの削除は、PR merge、post-merge read-after、repository設定または本候補の採択から許可を生成しない。実行には、現行authorityが対象repository、refおよびdelete作用を明示して包含し、実施者が対象・作用・結果を記録できることを要する。該当するauthorityがなければremote refは削除せず、cleanup未完として記録する。旧HELIXのdelete-branch-on-merge設定を現行の削除authorityとして継承しない。
- **base driftの再照合**：上流PRのmerge後、関係する後続PRについて最新baseとの試験merge可能性、`scfctl stale`、依存条件およびreview bindingを再照合する。試験mergeはcontent HEADを書き換えずに行う。base／content HEAD pairがreview済みbindingと一致し、stale=0、依存条件が維持される場合だけ既存状態を保持できる。conflict、stale、依存変化またはbinding不一致は根拠付きの理由とともに作成側へ返す。review／merge側は作成branchを直接修正しない。
- **載せ直しと再review**：作成側が最新baseに合わせて修正しcontent HEADを変えた場合、新HEADとして記録し、現行review通路でそのHEADおよび適用されるbaseとの組に対する独立reviewを改めて依頼する。新HEADのreview結果、未解消blocker 0件、現行merge admissionがそろうまでReady／merge可能として扱わない。通知、ACK、merge event、branch ancestryだけではreview receiptを成立させない。
- **自動rebase**：PR branchへbaseを自動で取り込む操作はこの候補の許容動作に含めない。これはcontent HEADを書き換えて既存review bindingを失効させるため、候補採択や自動rechainから暗黙に許可しない。自動rebaseを後日選択する場合は、本候補と分けて既存のbase不変規則との差、理由、authority境界を判断対象にし、変更後exact HEADの独立reviewとmerge admissionを取り直す。
- **完了境界**：merge後read-afterとcleanupを別々に記録する。merge／cleanup／再照合からticketや要求の完了、Issue close、authority、review成功を生成しない。CIの不足を理由に旧CIを代用しない。
- **旧sourceとの関係**：旧sourceが示す先行merge後のbase drift再判定と、衝突を作成責任へ返す意味を保持する。旧delete-branch-on-merge設定は現行remote delete authorityへ移さず、local cleanupとremote削除の権限を分ける。旧rebase/stackの協業記述をPR branch自動rebaseの要求根拠にしない。

### HELIXOS-L2-053 canonicalization artifact群の原子的確定と失敗隔離（単体候補、未採択）

- **authority／状態**：新規の未採択候補。`registered_proposal`／`authority_effect: none`。2026-09-29の57候補PO判断の明示集合に含まれず、採択・実装・実行許可、旧要求の正式後継割当を生成しない。`version_target`は旧HIL-FR-52に指定がないため付けない。
- **親L1と責務**：`HELIXOS-L1-003/004/008/009`へ接続する。特にL1-008のauthority/design/verification/runtime projection不整合の検出と原情報からの再構築を受け、L1-003の継続・安全な再開、L1-004の承認済みHARNESS契約に従う証拠収集、L1-009の管理責務分離を保つ。HARNESSが持つcanonical意味・command semantic identity・要求採否をOSが再解釈しない。現行採択済みOS-L2/L11-001〜029の固定対象revisionと権限境界は変更しない。
- **対象操作とartifact境界**：既存の有効なauthorityとHARNESSのcanonicalization意味契約に従う単一更新operationを入力とする。対象base revision、変更対象、ownerごとの書込義務を開始前に固定し、Markdown上のcanonical本文／asset revision、event ledger、trace、impact、stale propagation状態、projection、operation receiptの前後revisionと所有先を列挙する。HARNESSおよびその他の意味ownerが持つartifactの内容をOSが作成・承認せず、OSはそれらの変更を記録・永続化・運転する。
- **commitと失敗隔離**：列挙した変更義務は一つの論理operationとして確定する。全境界の必須writeが確定するまで、新しいartifact群を完全なcurrent revisionとして公開せず、先行currentを維持する。Markdown／canonical revision、event・trace・impact・stale関係、projectionまたはreceiptのいずれかの保存・照合に失敗した場合は、その失敗位置、成功／未完write、rollbackまたは隔離先、復旧義務を記録し、部分更新を成功canonicalとして提示しない。途中までの永続byteが残る場合も、current pointer・参照・read pathから確定済み状態として見せない。
- **baseとcommandの照合**：operation開始時のbase revisionをcommit時にcompare-and-swapし、currentが変わっていれば新規canonical revisionを作らず`stale/conflict`として既存状態と不成立義務を返す。OSはHARNESSのcommand identity判定結果を保存境界で参照する。同一command／同一semantic payloadの再送で二重revisionを作らず、同一command／異payloadはHARNESSの意味contractに従いconflictとして拒否し、先行receiptとcurrentを保護する。OSは意味payloadを自ら正規化・判定しない。
- **投影・receipt**：成功receiptはoperation／command identity、対象scope、baseと前後revision、更新義務・owner、write countと各write結果、参照関係、適用されたprojection revisionを同一結果へ結ぶ。失敗receiptは同じscopeへ失敗位置、部分writeの可視性、rollback/隔離の結果、再開・再試行に残る義務を記録する。旧`harness.db`は旧source内の歴史的projection名としてのみ参照し、現行DB、schemaまたは技術選定を指定しない。
- **既存要求との境界**：採択済みHELIXOS-L2-001/002/007/009の正本・revision、event/provenance、projection、継続／復旧の一般条件を置換せず、具体的なFR-52対象のfailure isolationを追加する。既存L11の一般更新・stale・再送条件を再定義しない。command semantic identityはHARNESS-L2-052候補の責務であり、HARNESSが別途採択されるまでは本候補の同一payload／異payload判定は条件付き入力であって新しいauthorityではない。
- **旧sourceとの差分**：旧HIL-FR-52 line 142の複数artifact単一operation、部分成功の非公開、base CAS、before/after/write/rollback/conflict receiptをOS運転要件として再導出する。旧`harness.db`名・実schema・transaction方式・runtimeは継承せず、現行artifact境界はownerごとに照合する。HOT-HIL-49は各保存境界でfaultを注入するoracle設計入力とし、旧test/runtimeは実行しない。HIL-FR-53 line 143とrename/move/split/merge/supersede履歴はscope外である。

### HELIXOS-L2-054 Closure Gate証拠照合・close運転のHARNESS handoff候補（connection候補、未採択）

- **authority／状態**：未採択候補、`registered_proposal`／`authority_effect: none`。2026-09-29の57候補判断に含まれず、採択、L3承認、実装／実行許可、Issue close authority、HIL-FR-07のformal successor割当を生成しない。旧sourceに`version_target`はないため付けない。
- **親・接続**：採択済みHELIXOS-L1-001/003/004/008/009およびL2-017/019/023の管理・推進・continuity・handoff責務へ接続する。HARNESS-L2-057候補が定める候補対象条件の評価結果を受け取り、OSはPR、CI、独立audit、選択済みstyleへのmerge、子Issue状態等の運転上の証拠を照合・記録する。OSはclosure条件、oracleの意味または要求採否を再解釈しない。
- **evidence handoff**：一つのIssue／closure scopeと対象revisionを保ち、HARNESSの候補対象条件の成立／不成立／unknown結果、参照されたevidenceのscope・revision・観測結果、未完条件を対応付ける。OSは各証拠を別個に受け取り、missing／stale／unknown／conflictを保ったままHARNESSへ戻す。PR、CI、audit、merge、child Issueの状態を互いの代理証拠にしない。CIは新世代で未構築のため、必要なCI証拠がなければunknownとして運転を保留し、旧CIで補わない。
- **receiptとclose運転**：HARNESSが同じscope/revisionについて候補対象条件の成立を返し、別途有効な既存operation authorityと旧HIL-FR-07の未移管条件を含む適用契約に基づくclose可否が確定した場合に限り、OSは要求されたclose operationの可否・実行結果とclosure receiptを対応付けて記録できる。候補対象条件の成立だけから旧HIL-FR-07全体のclose可否を推定しない。HARNESS結果がない、証拠が欠落、またはscope/revisionが不一致ならcloseしない。候補は新しいauthority、追加の人間承認、実行方式、永続化schemaを定めない。
- **memory条件の分離**：旧HIL-FR-07のmemory compaction atomと旧HST-CASE-023-03のmemory receipt欠落時close 0件の負例は、source holdingのまま別項目`memory条件: 未判定（holding）`として引き継ぐ。OSはこの未判定項目をHARNESS候補の成立条件へ混ぜず、PR／CI／audit等の候補対象条件の照合を続ける。旧receiptと現行continuity/HMC証拠の同値、適用scope、現行close運転での扱いは本候補から生成しない。provider memoryやsummaryを旧receiptと同一視せず、旧負例をretireしない。
- **状態・権限境界**：closure receipt、PR/Issue状態、close可否、実際のclose operation結果、要求受入、stage完了、requirements authorityを別状態として扱う。receiptやIssue closeから要求採択・完了を作らず、Issue／GitHubは共有・証拠projectionとして扱う。HARNESS-L2-057のclosure意味判定を置換せず、現在有効なoperation authorityを超えるcloseを実行しない。
- **旧sourceと保留**：旧HIL-FR-07 line 97のPR／CI／独立audit／選択styleへのmerge／子Issue状態の運転照合と、出力`closure receipt`をOS側へ再配置する。旧memory compactionと現行continuityの意味差および未移管条件のclose判定、style選択の意味、CI未構築時の適用、OSが実際にcloseを実行する条件は未解決として保持する。旧HIL-FR-07のIR行・選択外source atomは生存中source holdingに残し、旧実装・CLI・testを実行しない。

### HELIXOS-L2-055 ready Issue claimと実装開始前の工程照合（単体候補、未採択）

- **authority／状態**：新規の未採択候補。`registered_proposal`／`authority_effect: none`。2026-09-28のHELIX-OS候補採用集合に含まれず、要求採択、ticket発行、assignment実行、実装tool起動の許可、または旧要求の正式後継割当を生成しない。
- **親L1と責務**：HELIXOS-L1-003／009に接続する。OSはticket・assignment authority、ready状態の参照、Workerへの割当とclaim lease、停止理由の記録を担う。Workerは割当の範囲内で作業する主体であり、OSの代わりにauthorityやreadyを決めない。LABOの水準、INTELLIGENCEの配置案、SECURITYの実行制約は各ownerの既存契約に従う。
- **claim条件**：既存ticket／assignment authorityとIssue projectionの対応が有効で、対象revision・scopeが一致し、既存OS契約上readyな作業だけをclaim対象とする。leaseは既存のWorker assignment／lease契約へ結び、assignment、対象revision、scope、開始・期限、結果を追跡する。Issue表示やstatusだけからticket、assignment、authority、完了を生成しない。
- **実装開始前の工程照合と差分**：旧HIL-FR-08はReverse／Redesign／pair-freezeの未完了を列挙し、工程の適用条件を区別せず実装tool開始前に遮断する。本候補は現行HARNESSのScoped Reverse（HARNESS-L2-003／004）と既存のRedesign・pair条件へ再導出する未採択提案であり、対象scopeに適用すると現行契約またはticketで確定した工程だけを照合する。適用が確定した工程が未完了ならclaimを拒否する。現行decisionで非適用と確定している工程は除外する。適用性がunknown／未定義なら適用済みとも非適用とも推定せず、既存ticket／authority ownerへ返して判断根拠を得るまでready claimを成立扱いしない。旧FR-08の一律gate atomは本候補で置換・retireせず、MPR-SH-IR-003#HIL-FR-08にpreserved_pending_rehomeとして残す。この条件付き案は未採択であり、旧gate atomの後継や旧FR-08全体closureを主張しない。
- **責務・provider差分**：旧HIL-FR-08の「Codex実行器」を現行へそのまま置かず、2026-09-26のWorker実行モデル判断とHELIXOS-L1／L2-004のOS assignment責務へ配置し直す。Worker共通実行契約はHELIX-OSが持ち、provider名、CLI、IDE、runtime製品名を要求主体や恒久的な実行器として固定しない。この変更は主体と責務の現行モデルへの再導出であり、ready claim、lease、blocked reason、未完工程で実装を開始しない意味は保持する。
- **不成立・返却**：ready状態、ticket／assignment authority、対象revisionまたはscopeがmissing／unknown／conflict／stale、leaseが無効、または適用工程が未完了ならclaimとtool起動を拒否する。理由、観測した参照／revision、未完義務を記録しOSの発行元または入力ownerへ返す。失敗はIssue close、要求変更、承認、権限の生成につながらない。
- **旧sourceとの対応と限界**：HIL-FR-08 line 98のready Issue claim、適用確定済み工程の未完了時のtool起動抑止、claim lease、blocked reasonを保持し、assertion HST-CASE-002-10のnegative oracleを参照する。工程適用性のscope化は明示した意味差分であり、旧一律gate atomはholdingへ保全し、未採択の条件付き案から旧FR-08全体closureを主張しない。leaseのduration、renewal、競合解決の詳細は既存OS Worker契約へ委ね、この候補で新設しない。旧assertionは設計oracle参照であり、旧runtime／testを実行しない。source atom receiptは選択したFR-08 atomに限られ、IR全体や隣接要求のclosureを主張しない。

### HELIXOS-L2-101 PR finding dispositionの証拠receiptと異議連結候補（単体候補、未採択）

- **親L1候補**：`HELIXOS-L1-001`（判断source・revision管理）、`HELIXOS-L1-002`（作業・検証・提供・運用の追跡）、`HELIXOS-L1-008`（authority／projection不整合の検出・再構築）。親の意味を変更しない。
- **種別・版**：HELIX-OS単体unit候補、未採択。旧HIL-FR-09は対象versionを指定していないため、この候補からversion scopeを追加しない。起票元main `26e547515d620bb53036c2f085cfc3f0293888d4`のrequirement/L11本文と仮登録には`HELIXOS-L2-101`が未定義。`ticket-id-connection-audit-2026-09-25.md:115`のHELIXOS-L2-056はDECIDE ticketの非採用routeという歴史的mappingであり、同監査はID 100までのmappingを含む。衝突を避けて101を選び、歴史的mappingは変更しない。
- **actor境界**：旧原文の「Claude監査器」は固定providerをactorに置く表現である。2026-09-26 PO判断記録「Worker実行モデル」では、laneをreview等の役割割当先とし、独立reviewを作成側と別のreviewer identity・context・authority・routeで定義する。provider/modelは記録するが同一providerか否かは独立性の根拠にしない。要求意味・分類oracleはHARNESS、assignment・実行状態・証拠記録のownerはOS、実行主体はWorkerとする。ここでは旧actorの意図したreview役割を保持し、Claude固定を現行意味として継承しない。
- **責務**：既存のPR auditから受け取るfinding identity、source/対象revision、根拠参照、affected layer、提案された六分類の記録を、typed disposition receiptとその独立review・appeal参照へ結び付ける管理要求候補である。HARNESSの分類oracle、findingの正誤判断、Issue作成、修正、merge、要求採否を所有しない。OS-L2-034の原指示/finding記録・処分根拠・異議履歴、およびOS-L2-007／009のprovenance・durable event境界を置き換えない。
- **状態境界**：receiptはfindingと判断履歴を追跡する証拠projectionであり、non-actionable四分類（duplicate／false_positive／accepted_risk／telemetry）によって元findingを削除・不可視化・終端化しない。append-only receiptとappeal/reopen参照を残す。証拠が不足する分類は`disposition_pending`とし、receipt、GitHub Issue状態またはreview結果だけから要求受入、Issue完了、cancel、supersede、authorityを生成しない。
- **分類ごとの根拠**：duplicate receiptは生存targetとacceptance oracle包含証拠を結ぶ。false_positive receiptは別verifierの反証と独立reviewを結ぶ。accepted_risk receiptは独立reviewと、受容対象actionへ結び付くPO receiptの両方を結ぶ。telemetry receiptは観測ownerとexpiryを記録する。必要条件のいずれかが欠ける間は`disposition_pending`を維持する。
- **directive権限との区別**：accepted_riskのfindingに必要なaction-binding PO receiptは、当該findingのrisk acceptanceを既存PO authorityへ結ぶ。user directiveのcancel／supersedeに対するPO権限をfindingへ一般化せず、両者を同じdisposition／receiptとして扱わない。OS-L2-034はdirectiveのcancel／supersede権限をfindingへ一般化しない一方、旧L5 §3／L4 §4.2が定めるfindingの`accepted_risk`固有のaction-binding PO receiptと旧HIL-NFR-21の独立review条件を明記する。本候補はそのspecific evidenceをtyped receiptへ結び、OS-L2-034の原記録・異議履歴を置換しない。
- **不足時**：finding、evidence、affected layer、対象revision、独立reviewまたはappeal先がmissing／unknown／stale／conflictなら、receiptを確定状態として補完せず非終端の未解決参照を維持する。OSはHARNESSのoracle不足を分類根拠へ読み替えない。
- **単独成立の依存**：HELIXOS-L2-007（provenance）、009（durable event／projection）、034（既存の原記録・処分根拠・異議履歴）と、HARNESSが別途定めるfinding意味条件。034の対象外または条件未決の分類を本候補から採択済みとみなさない。
- **現行の意味変更根拠**：`docs/governance/decisions/worker-execution-model-po-decisions-2026-09-26.md`（SHA-256 `1c93bf0aadccfdf6b536a32d3923a17fbd00a1fd830850f9369b5b6d6b12efb2`）「独立reviewとレーン」「Workerの要求の置き場所」。これはPO判断済みのactor／reviewer境界であり、新しい承認を作らない。
- **旧source**：HIL-FR-09 line 99、HIL-BR-17 line 69、HIL-FR-30 line 120、HIL-NFR-21 line 201は`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`。詳細条件は`LEGACY-ASSET-1BE290A45D9095E0F803`の旧L5 `github-pr-audit-promotion.md` §3 lines 68–70、`LEGACY-ASSET-C35E93F2D36777CD7462`の旧L4 `infinity-loop-platform-basic-design.md` §4.2 lines 277–280。user directive由来のcancel／supersedeは旧HIL-FR-36 line 126とHOT-HIL-36 line 63の別scopeとして読む。これらは旧runtime・schemaの採用を意味しない。

### HELIXOS-L2-102 HARNESS Issue contractのdurable intake・projection・handoff候補（connection候補、未採択）

- **状態・接続**：未採択候補、`registered_proposal`／`authority_effect: none`。HARNESS-L2-059の意味contractを消費し、HELIXOS-L1-001/003/004/008/009の正本revision、intake、projection、assignment/handoff責務へ接続する。HARNESS-L2-059の採択や上流authorityを前提・生成しない。
- **耐久projection**：既存のOS intake/provenance/projection責務の範囲で、対象Issue source identityとHARNESS contractの同一revision、11 fieldのfield identity、version、digestを対応付けてdurableに保持・参照できる。projectionはHARNESSの意味fieldをrename、merge、drop、default補完またはrequiredness変更せず、contract revision/digestがsource/intake/handoff間で一致するかを識別する。OSは値の意味、schema、field applicability、digestの意味・計算法を定義しない。
- **intakeと不確実状態**：source identity、contract revisionまたはdigestが欠落・不一致・重複競合・staleで、既存OS contractから有効な参照先が確定しない場合、その不確実状態を保ったまま該当handoffを完了扱いしない。新しい拒否コード、再試行回数、追加approval、永続化schemaや具体routing規則は本候補で定めず、既存OS契約へ委ねる。
- **責務境界**：HARNESSがIssue contractと11 fieldの規範意味、各field必須存在、version/digest関係を所有する。OSはsource/intake/revision/projection/handoffのdurable運転と既存状態の証拠を担う。OS projectionやIssue/GitHub表示、受領記録は要求意味・要求採択・実行authorityを作らない。新しい外部作用やIssue状態更新は追加しない。
- **旧source・部分coverage**：旧LEGACY-ASSET-719D5EC9C06FC4AAD0FF line 93のright-column output atom `versioned issue contract＋digest`だけをHARNESS-L2-059の意味contractに接続し、同一revision/digestをOSで耐久projection/intake/handoffする候補とする。旧line 93 statementのfield意味とomission条件はHARNESS候補に帰属する。既存HELIXOS-L2-017/019/023はticket/workflow、evidence continuity、管理から検収へのhandoffを部分的に支えるが、11 field schemaや個別omissionを所有しない。旧IR recordと`system_contracts.json#HR-FR-HIL-01`にあるsource identity、untrusted input、exactly-once、duplicate/conflict、quarantine、routing等の追加条件は本候補のcoverageに加算せず、`MPR-SH-IR-003#HIL-FR-03`を含む既存holdingに残す。


### HELIXOS-L2-103 工程stage eventと状態projectionの因果記録候補（接続、未採択）

- **状態・親**：`registered_proposal`、`authority_effect: none`。`HELIXOS-L1-001/002/008`およびHARNESSの候補`HARNESS-L2-060`に接続する未採択候補。L2/L11採択済み意味、操作authority、HARNESSのstage判定を変更しない。
- **提供**：既存の適用契約に従ってOSがstage eventを受け取る場合、そのeventをappend-onlyの証拠として保ち、対象scope/revisionと因果関係を辿れる形でcurrent stateへ投影する。event、現在のprojection、利用可能なparent/cause IDまたは既存因果参照の関係を失わず、重複・順序不一致・親参照欠落は補作せず未解決として示す。
- **責務境界**：HARNESSが工程意味、適用stage、要求される証拠と遷移条件を持つ。OSは既存authority内で記録・projection・引継ぎを担い、工程順序、stage pass、pair-freeze、要求採否を独自に判定しない。L2-007/009およびL2-023の証拠、durable event/projection、handoff条件を置換せず、HARNESS-L2-060または既存の適用契約が与えないstage/event schemaを新設しない。
- **不成立・unknown**：対象revision/scope、source event、HARNESS outcome、または既存causal referenceがmissing／stale／conflictの場合、current projectionの成立や工程遷移を推測せず、未解決eventと復旧義務を保持して当該ownerへ返す。event receiptやprojectionは、実行・検証・merge・承認・完了の証拠を代替しない。
- **旧sourceとの対応と保留**：旧`LEGACY-ASSET-A60CF91DD2AF6693E6F9`（旧IR SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`、HIL-FR-01）と`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`（raw requirements SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`、line 91）を起点にする。選択したappend-only event、current state、parent/cause ID atomを現行OSの記録・projection責務へ限定して再導出する。旧工程列、InfinityLoopEventの固定schema、前段receiptによる普遍的遷移条件、および旧FR-01のend-to-end lifecycleは`MPR-SH-IR-003#HIL-FR-01`に保留する。HARNESS-L2-060が与える入力revision条件を超えてHARNESSの意味をOSへ移さず、本候補・receiptから旧要求全体closureやformal successorを主張しない。旧HR-FR-HIL-02のcausality/checkpoint contractとHAC-HIL-02a/b/cは関連oracle contextであり、実行せず本候補のsource atomまたは固定schemaとして扱わない。

### HELIXOS-L2-104 操作authority・実行隔離・品質受入の独立記録候補（接続、未採択）

- **状態・親**：未採択候補、`registered_proposal`／`authority_effect: none`。親候補は`HELIXOS-L1-003`（Worker委譲と許可範囲）および`HELIXOS-L1-004`（検証・証拠統制）。起草時のHELIX-OS L1本文は`draft_candidate`であり、当該L1の対象revision確認・承認を主張しない。
- **対象**：一つのWorker operationについて、SECURITYの操作authority判定、Worker実行環境が返す制約・隔離の適用観測、HARNESS契約に基づく要求品質の検証／受入結果を、対象operation・要求revision・scopeへ対応付けて別々に参照できることを提案する。異なる対象revisionやscopeの記録を組み合わせない。
- **責務境界**：SECURITYは操作authorityと実行制約の方針を所有する（HELIXSECURITY-L2-008／022、L1-007／008）。Worker実行環境はSECURITYの制約を強制し、適用観測を返す。OSは既存assignment／Worker運転の範囲で三つの記録を対象へ結び、未取得・不一致をそのまま示す。HARNESSは対象要求と対応L11 oracleによる品質検証・受入契約を所有する（HARNESS-L2-022）。本候補は各ownerの判定、Worker実行、追加gate、拒否条件または承認を新設しない。
- **非代用**：authority判定の成立から隔離適用の成立または要求品質の成立を推定しない。隔離の適用観測からoperation authorityまたは品質受入を推定しない。品質oracleの成立からauthorityまたは隔離を推定しない。OSの結合記録は各結果の証明でなく、各ownerの結果を別の結果へ昇格させない。
- **不足・不一致**：三つの記録のいずれかが欠落、scope／revision不一致、unknownまたはstaleなら、その次元を未解決として示し、他の次元の結果で補完しない。各ownerの既存契約に従う処置・差戻しを変えず、本候補から一律停止、追加の人手確認、実装許可またはstage完了を導かない。
- **旧sourceと差分**：`LEGACY-ASSET-BD058F87FFAF55080296`、旧`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-release-crosswalk.md:14`（file SHA-256 `0ec3030afb38f1729e9a0c0945110b87762237f9548ab79faf5630ad9e538abb`、line SHA-256 `579bede1d203b2aea9b95c21471bb1a652b84a04d1ba67619304040e4d6a22f6`）を起点とする。Guard・Sandbox・品質検証の別責務と相互非代用を保持する。旧crosswalkのPKG-D07にはprimary Module未確定とあるため、それだけから機構所有を決めず、現行の採択済み責務へ再配置した。旧Guard/Sandbox名やruntimeを現行owner・実装として復活させず、機構間の判定結果をOSが代行しない。
- **範囲限界**：この候補は旧line atomだけを扱い、SECURITY／HARNESS／OSの要求一式、旧Concept候補全体、runtime実装・実行・受入実績、旧候補全体のsuccessor closureを主張しない。


### HELIXOS-L2-105 incident episodeの復旧証拠相関（単体候補、未採択）

- **状態・authority**：HELIX-OSの未採択候補。`registered_proposal`／`authority_effect: none`。候補登録、receiptまたは文書上のoracleは、要求採択、ticket発行、runtime実行、incident close、production変更権限または受入実行を生成しない。旧sourceに版指定がないため`version_target`を追加しない。
- **親L1と責務**：採択済み`HELIXOS-L1-002`をprimary、`HELIXOS-L1-006`をcontextとする。OSは、既存契約によりincidentとして記録された一つのproduction事象に、現行の復旧確認証拠と復旧手順・rollback記録が同一事象を指す関係を保って登録し、その証拠関係の充足状態を表示する。HARNESS/対象ownerが持つ適用可能な回復確認oracleの意味、OS-L2-010が持つticket/workflow種別・発行・戻り先・工程構成、既存L2-007の共通証拠形式は変更しない。
- **証拠相関**：OSは既存のincident identity/refと同一episodeを示す安定した参照を使い、対象project、scope、影響revision、および同一episodeへ属する(i)既存ownerの回復確認結果とそのsource/oracle revision、(ii)回復に使ったprocedureの記録、(iii)実施・未実施を区別できるrollback記録を関連付ける。OSは製品固有SLO/KPIやthresholdを新設・推定せず、各証拠の内容を作成・判定しない。既存system-of-recordから証拠とidentityを参照できない場合は不足を表示する。
- **証拠状態**：三つの関係が同じincident identity、project/scope、影響revisionに結ばれ、sourceが現行で、適用可能な回復確認結果がownerから得られた場合だけ、OSは「記録上の復旧証拠一式が揃う」と報告できる。欠落または不一致があれば「不足」、freshness・適用範囲・owner判定が不明なら`unknown`として保持する。これはincident ticketのclose、製品のhealth、rollback成功、恒久修正、postmortem、またはreleaseの判定ではない。
- **重複しない境界**：HELIXOS-L2-010／L11のincident種別、ticket発行、workflow、恒久対策の戻り先、およびHELIX-HARNESS旧FR-L1-16の緊急対応・hotfix・release・収束後のbackfillを再定義しない。本候補は既存incident参照に紐づく復旧証拠の相関と記録上の充足状態に限る。旧sourceのimmediate production release、既定severity、固定応答時間、旧PLAN/token/CLI/runtimeは含めない。
- **人間判断の保全**：旧`incident.md`のon-call／TL／PM三者承認や旧`incident-runbook.md`のproduction change前approvalは、新世代へ移管・撤回・置換しない。既存SECURITY操作authorityと有効な既決権限を参照し、追加の人間承認、承認主体、承認時点を新設しない。これらの旧meaning decisionは生存中source holdingで保持する。
- **旧sourceからの再導出と限界**：旧`LEGACY-ASSET-9E033C3E39BE107D4CF1`のline 43から「収束確認」と「復旧手順・rollback記録」の二spanだけを、同一incident episodeに対する証拠関係として限定再導出する。source/file/line/span digestは専用source-lines ledgerとreceiptに固定する。source fileの他条件、旧runbook、旧PLANとそのtest、PHCAP-17全体、Web-OS service incidentsは本候補の被覆範囲外であり、生存中source holdingに残す。


### HELIXOS-L2-106 authority binding参照先の再帰検査候補（単体候補、未採択）

- **状態・authority**：HELIX-OSの未採択候補。`registered_proposal`／`authority_effect: none`。本候補の記載、登録、静的確認は要求採択、権限の成立、scanner/runtimeの実装・実行または受入を生成しない。
- **親L1・owner候補**：採択済みHELIXOS-L1-001／008に接続する候補。HELIX-OS管理はL2-015で管理するauthority記録の対象となる参照関係の提示と未解決状態の保持を担う。これは旧要求のowner移管または本候補の採択を確定しない。
- **対象条件**：既存のauthority binding recordが参照するtargetについて、recordの参照先を再帰的に確認し、既存のtarget ownerが当該targetを失効・互換・履歴状態として示す場合、そのtargetへのcurrent edgeを有効なauthority参照として扱わない。判定対象は入力として特定されたbinding/reference chainとその参照先に限る。
- **状態・差戻し**：target、edge、対象revisionまたはtarget ownerの状態が欠落・unknown・conflict・staleなら適合と推定せず、未解決として保持し、既存のsource/target ownerへ確認を戻す。状態語の意味と適用可否は各target ownerの既存契約に従う。
- **境界**：HELIXOS-L2-015のsource identity/revision/digest/authority出所追跡を維持し、その一般記録要件を置換しない。全文書census、全repo scanner、binding schema、互換性・失効・履歴化の新たな判定規則、再帰深度・性能、finding taxonomy、修復・削除・edge書換え、旧CLI/runtime/test/CIを定めない。参照されたtarget ownerが既存状態を提示しない場合、本候補から状態を作らない。
- **旧source・限定範囲**：`LEGACY-ASSET-D201753B1A0CC6EA3980`、旧`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/document-authority-census-requests.md:50`、source file SHA-256 `81ac3006a11a087c069b196c1512b078ad5f19c1cff1da0ff34d8986ff2feb66`、line SHA-256 `77e1d9bc1f98f2a1f1cf0094dd280fb83d001ffe8ee422f1c951da2d72898212`を起点とする。この旧line atomの限定的な再導出候補であり、DAC-FR-003の全条件、文書Authority Census全体、旧source ownerの移管、formal successor、実装・実行・採択の成立を主張しない。`MPR-SH-CONFIRMED-003`は生存させる。
- **version_target**：旧source文書のversion 1.0を参照情報として記録する。対象適用範囲と本候補の版採択は未確定である。

### HELIXOS-L2-107 finding taxonomy/mapping revision-pinned handoff候補（connection候補、未採択）

- **authority／状態**：HELIX-OSの未採択候補、`registered_proposal`／`authority_effect: none`。2026-09-28に固定されたL1・L2/L11 decisionの採択集合には含まれず、本候補から要求採択、L3承認、実装・実行許可、旧DAC-FR-008のformal successor割当を生成しない。旧source ownerのHELIX-OSへの移管も決めない。
- **親L1・owner候補**：HELIXOS-L1-001／008／009に接続する管理・projection検出・推進経路のhandoff候補。HELIX-OSは、別途選択され現行として参照可能なtaxonomy/mapping revisionに沿うfinding参照を既存owner/workflowへ渡す責務の候補である。finding taxonomyの意味・type判定とtypeごとの所管は本候補のownerとして確定しない。
- **入力と保持**：既に発生元が付したfinding参照、その既存type identityまたは未解決type状態、source identity・対象revision/digest・scope、及び明示的に選択されたtaxonomy revisionとtype-to-destination mapping revisionを入力にする。HELIX-OSはfindingのtype、source、revisionを上書き・省略せず、両参照先のrevisionと対応関係をhandoffに保持する。taxonomy上のtypeを新設、再分類、翻訳、列挙しない。
- **mapping handoff**：参照されたtaxonomy/mapping revisionとその関係が既存authority記録でcurrentかつ一意に確認できる場合だけ、そのmappingに明記されたdestination referenceをfindingに結び付け、既存owner/workflowへhandoff情報として渡せる。候補は新しいowner、route、ticket、dispatch、修正操作や永続化schemaを作らず、mapping targetの意味を再解釈しない。
- **未解決時**：taxonomy/mappingまたは対応関係がmissing、stale、unknown、conflict、ambiguous、未登録なら、そのfindingのtype/source/revisionを保ったままroutingをunresolvedとして返し、destinationを推測・fallback選択しない。影響を受けない別findingの評価を一律停止しない。分類そのものが曖昧な入力は、既存の未解決type状態をそのまま保持し、候補側でtypeを決めない。
- **既存要求との境界**：HELIXOS-L2-015のsource identity/revision/digestとauthority記録、L2-017のticket/workflow、L2-019の証拠・continuityを重複定義しない。既存契約へ渡す型付きhandoffのidentity／revision関係に限る。HARNESS-L2-004/005のverification／backflow義務、HARNESS-L2-008の要求kind再分類、HELIXOS-L2-040のretry上限routeを置換・拡張しない。HELIXOS-L2-106はDAC-FR-003のみを扱い、本候補へ拡張しない。
- **旧source・保留**：`LEGACY-ASSET-D201753B1A0CC6EA3980`の旧`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/document-authority-census-requests.md:55`から、修正先を推測しないhandoff境界を限定再導出する。旧lineの「findingをtyped taxonomyで発行」およびtaxonomyを使う曖昧分類の意味はsource holdingに保留する。旧`DAC-R-007`のtype名列挙と`DAC-R-012`のscanner責務は関連contextであり、本候補のsource atom集合へ含めない。`DAC-BR-004`の旧Recovery／Redesign／Refactoring／Requirement Re-entry名を現行routeやownerへ一対一対応させない。型分類、採用taxonomy、mappingの所管・適用範囲、旧source owner、formal successorは未決であり、旧scanner/runtime/CLI/test/CIを使わない。

### HELIXOS-L2-108 artifactからconsumerへの逆向きgraph候補（単体候補、未採択）

- **状態・authority**：HELIX-OSの未採択候補。`registered_proposal`／`authority_effect: none`。候補本文、登録、静的確認は要求採択、census実行、startup、生成または受入完了を生成しない。
- **親L1・責務**：採択済み`HELIXOS-L1-001`／`HELIXOS-L1-008`へ接続する候補。OS管理は、入力として特定されたartifactとconsumerの参照関係を保持し、artifact側からconsumer側へ逆引きできるgraph projectionを示す。L2-015のsource identity/revision/digest/authority出所記録を使う。
- **入力範囲と関係**：照合入力は、対象HEAD、artifact identity/revision/digest、consumer identity/revision、各consumerのstartup入口、生成関係、およびその入力が明示するscopeと対象classを特定する。source ownerが提示するauthoritative forward artifact→consumer relationと、OSがそこから作るreverse projectionは別の入力／出力として保持する。forward relationの期待集合はreverse projectionから作らない。consumerのstartup reachabilityと生成伝播も別々の関係として示す。forward relation、scope、または対象classが不明・未提示・閉じていない場合、未列挙範囲を完全として扱わず`unknown`に保つ。
- **結果**：同じ対象HEADと明示scopeについて、authoritative forward relationとreverse projectionを双方向に照合し、各artifactから宣言consumerを逆引きできること、各reverse edgeに対応するforward edgeがあること、およびforward edgeの欠落を検出できることを示す。startup reachabilityと生成伝播も別々に追跡する。scope外、inactive、またはrevision不一致は個別に示し、他の関係から補完しない。
- **境界**：既存L2-015の一般authority記録、L2-016のportfolio state、HARNESS-L2-010/011のartifact/package入出力・依存・検証契約を置換しない。HARNESSはartifactとpackの意味および検証義務を定め、OSは明示入力上の参照とreachabilityを投影する。明示された機構間operationがある場合のconnection identity・契約互換・送受信はHELIX-CONNECTの既存契約を使い、本候補からrepo-local relationをconnectionと見なさない。全repo census、consumer classの選定、未入力sourceの探索、startupの実行、生成の実行、owner/class/statusの新 taxonomy、finding severity/routing、修復・削除・edge書換え、旧CLI/runtime/test/CIは定めない。
- **未解決と差戻し**：target ownerがconsumer、startup入口、生成関係またはscopeを提示しない場合、OSはrelationを推測せずunknownとして保持し、既存source/target ownerへ確認を返す。意味上の不足は対応する既存authorityへ戻す。
- **旧source・限定範囲**：`LEGACY-ASSET-D201753B1A0CC6EA3980`のarchive `document-authority-census-requests.md:51`（source file SHA-256 `81ac3006a11a087c069b196c1512b078ad5f19c1cff1da0ff34d8986ff2feb66`、line SHA-256 `9eeafcb6a2c3c4b4bd65ad22a1b0b8da22c9ce7e51bdc4a3423a6fbe19fe61c4`）のDAC-FR-004一atomから意味を再導出する候補。全source consumer閉包、source owner移管、formal successor、採択、実装・実行・L11受入は未確定。`MPR-SH-CONFIRMED-003`は生存させる。
- **version_target**：未指定。旧source identityが記す版を現行適用版へ読み替えない。

### HELIXOS-L2-109 source-to-consumer provenance chain候補（単体候補、未採択）

- **状態・authority**：HELIX-OSの未採択候補。`registered_proposal`／`authority_effect: none`。候補本文、登録、静的確認は要求採択、source authority、生成実行、consumer起動または受入完了を生成しない。
- **親L1・責務**：採択済み`HELIXOS-L1-001`／`HELIXOS-L1-008`へ接続する候補。OS管理は、入力として選ばれた一つのsource-to-consumer provenance chainのidentity/revision/digestと各関係を同一chain上で追跡できるようにする。sourceの意味とgeneratorの動作はそれぞれの既存ownerが持つ。
- **chain条件**：入力は対象HEADと選択scopeを明示し、source identity/revision/digest、generator identity/revision、generated artifact identity/revision/content digest、およびconsumer identity/revisionを関係付きで特定する。各edgeの両端identityとrevisionがchain内で一致し、同じ生成artifactを同じconsumer relationへ辿れることを記録する。入力に欠けた要素や開いたscopeは`unknown`として残す。
- **結果**：一つの選択chainの各node/edgeとdigestを順に辿れ、異なるchain・revision・digestを混ぜない関係記録を示す。chain内のsource、generator、artifact、consumerのどれかが欠ける、revision/digestが一致しない、またはconsumer edgeが未宣言なら不完全として示す。
- **境界**：既存L2-015/007/019のauthority provenance・共通証拠・event continuityを置換しない。HARNESS-L2-010/011が所有するartifact/package意味、生成可能性、呼出し契約と、明示された機構間通信に対するHELIX-CONNECT契約をOSが再定義しない。本候補は選択されたsource-to-consumer relationの記録結合に限り、全artifact census、generatorの実行/検証、consumerのstartup実行、外部接続の生成、chainの自動発見、全体severity/disposition、finding taxonomy、routing、修復・削除、旧CLI/runtime/test/CIを定めない。
- **未解決と差戻し**：node/edgeのauthority、revision、digest、適用範囲またはownerが欠落・unknown・conflict・staleなら、chain適合を推定せず未解決として保持し、source、generator、artifactまたはconsumerの既存ownerへ確認を返す。
- **旧source・限定範囲**：`LEGACY-ASSET-D201753B1A0CC6EA3980`のarchive `document-authority-census-requests.md:52`（source file SHA-256 `81ac3006a11a087c069b196c1512b078ad5f19c1cff1da0ff34d8986ff2feb66`、line SHA-256 `d032e840fb88ab1cf46f096553a8ba597473f2faa903ba71cf264e11cda4755d`）のDAC-FR-005一atomから意味を再導出する候補。DAC-FR-004やDAC-FR-006〜008、文書census全体、source owner移管、formal successor、採択、実装・実行・L11受入は未確定。`MPR-SH-CONFIRMED-003`は生存させる。
- **version_target**：未指定。旧source identityが記す版を現行適用版へ読み替えない。

### HELIXOS-L2-110 semantic epoch変更後のactive consumer digest pin差分候補（単体候補、未採択）

- **状態・authority**：HELIX-OSの未採択候補。`registered_proposal`／`authority_effect: none`。本文、登録、静的fixtureは要求採択、実装、scanner実行、finding発生または受入を示さない。
- **親L1・責務候補**：採択済み`HELIXOS-L1-001`／`HELIXOS-L1-008`に接続する管理・整合projection候補。OSは、明示された対象revisionとactive consumerの参照を並べ、提供されたsemantic epoch evidenceに照らして一致・差分・unknownを記録する。source内容とepochの意味は当該source ownerが示し、consumerのactive性と参照関係は既存ownerが提示する。本候補はsourceまたはconsumer ownerの移管を決めない。
- **限定入力**：一つの明示されたsemantic source identityについて、旧・現行のsemantic epochとそれぞれのdigestまたは同等のrevision-bound evidence、対象scope、active decision利用を行う一つ以上のconsumer identity/revision、そのconsumerが読むsource identity、consumerのepoch/digest pinを入力する。明示epoch evidenceは意味世代の変更を示す。content digest差だけからsemantic epoch変更を推定しない。対象は入力で特定されたsource・consumer関係だけとし、repo全域や未提示consumerを探索・完全集合として扱わない。
- **差分条件候補**：同じsource identity/scopeについて、source ownerが提示する現行epochがconsumerのactive claim/pinが参照するepochより後であり、consumerが旧epochをcurrent decision inputとして読む関係が明示される場合、その選択された関係を旧DAC taxonomy名`SEMANTIC_EPOCH_DRIFT`の候補findingとして示す。epochとdigestが一致し、active decision consumerのpinが現行source revisionへ束縛される場合は本条件のfindingを出さない。旧digestの存在だけではfindingを出さない。
- **unknown条件候補**：epoch、source revision/digest、consumer active性、consumer→source edge、対象scopeのいずれかがmissing、unknown、stale、conflictまたは一意に結べない場合、stale／適合を推定せず`unknown`として保持する。epoch evidenceが無い場合は、digestが異なっていてもepoch変更やstaleを確定しない。
- **非finding境界**：入力で`COMPATIBILITY`、`HISTORICAL`、`REFERENCE`相当と明示され、active decision inputとして読まれる関係が示されないartifactは、存在や旧digest pinだけで本候補のfindingにしない。これらがactive decision inputへ接続することを明示する入力は候補条件に含めず、DAC-NFR-002に関する追加の拒否規則も確定しない。
- **既存要求との境界**：HELIXOS-L2-015のsource identity/revision/digest/authorityとunknown保持を使うが、一般要件を置換しない。HELIXOS-L2-108のartifact→consumer relation projectionおよびL2-109のsource-to-consumer provenance chainを再定義・拡張しない。各候補が別に選択したscope/edgeだけを本入力へ渡せる。severity、優先順位、auto-repair、本文書換え、削除、owner rehome、formal successor、全repo census、未提示consumerの完全性、旧runtime/CLI/test/CIは定めない。
- **旧source・限定範囲**：`LEGACY-ASSET-D201753B1A0CC6EA3980`の旧DAC-FR-010 line 57一atomをcandidate inputとする。旧DAC-R-010 line 65とDAC-AC-016 line 41は旧source上の差分対象とoracle名を確認する関連contextであり、candidate input atomに含めない。旧DAC-NFR-002 line 64はhistorical/compatibility/referenceの非finding境界の根拠として参照し、その全条件やactive-decision拒否意味はcandidate inputに含めない。`MPR-SH-CONFIRMED-003`を生存させ、旧source owner、formal successor、適用対象、source全体のclosure、採択、実装・実行・受入を未確定に保つ。
- **version_target**：旧DAC sourceのversion 1.0を参照情報として記録する。現行適用版と候補採択は未確定。

### HELIXOS-L2-111 三つの独立receiptのAND結合候補（未採択）

- **状態・authority**：HELIX-OSの未採択候補。仮登録は`registered_proposal`／`authority_effect: none`。候補本文と静的receipt案は、要求採択、実装、receipt発行、Census完了、または受入を示さない。
- **親L1・責務候補**：採択済み`HELIXOS-L1-001`、`HELIXOS-L1-004`、`HELIXOS-L1-008`に接続する管理上の結合候補。各receiptの意味、生成者、scope、authority、証拠はそれぞれの既存ownerが持ち、この候補はownerや責務を移さない。
- **入力集合候補**：candidate input atomは`MPR-SH-CONFIRMED-003`が保持する旧DAC-FR-009 line 56の一atomだけとする。この行が示す要求materialization監査（`#825`）、startup projection（`#1370`）、Document Authority Censusの三receiptを別々の入力として受け取る。各receiptのidentity、対象revision、scope、provenance、および明示statusを独立して保持する。Issue番号は旧source上の参照ラベルであり、現在の要求・契約・receipt identityとのexact mappingは未確認のため推定しない。
- **結合条件候補**：aggregateを`green`とするのは、上記三つの独立receiptがすべて明示的に`green`を返す場合だけとする。一つでも明示的な非greenがある場合はaggregateをgreenにしない。receiptがmissing、stale、unknown、または別の非green状態を示す場合、その入力状態とprovenanceを保持し、aggregateをgreenにしない。aggregate状態の優先順位、状態変換、欠損の修復、receipt内容の再評価は定めない。
- **分離境界**：旧DAC-FR-009が併記する`#206`は旧surface是正の責務境界を示す参照として記録するが、旧DAC-R-011が列挙する三つの独立receiptには含めない。`#206`を第四receiptとして扱わず、その現行契約・責務対応も推定しない。
- **既存要求との境界**：既存のL2要求やCI・review・Censusの具体的な監査条件を再定義しない。三receiptの内部schema、green判定根拠、監査方法、receipt発行者、issue lifecycle、severity、merge admissionを定めず、GitHub Issue状態からreceipt statusを生成しない。
- **旧source・限定範囲**：candidate input atomは旧DAC-FR-009 line 56一行だけとする。DAC-R-011 line 66とDAC-AC-017 line 42は三receiptの独立性と境界を確認する関連context/oracle evidenceであり、confirmed175 holdingやcandidate input atomとして数えない。`MPR-SH-CONFIRMED-003`を生存させ、旧source owner、formal successor、対象適用範囲、採択、実装・実行・受入およびsource全体のclosureを未確定に保つ。
- **version_target**：未指定。旧sourceのversion 1.0を現行適用版や候補採択へ読み替えない。

### HELIXOS-L2-112 Product Dataの版束縛read projection候補（connection候補、未採択）

- **authority・状態**：未採択候補、`registered_proposal`／`authority_effect: none`。2026-09-28の採択済みOS L2/L11 16件には含まれない。候補文書、source atom照合、receiptまたは静的oracleから、要求採択、L3承認、実装・runtime実行、外部接続、操作authority、requirements-stage closureを生成しない。
- **親L1と版の提案**：HELIXOS-L1-001／008は2026-09-28の[HELIX-OS PO判断](../../governance/decisions/helix-os-requirements-po-decision-2026-09-28.md)が固定したL1対象revisionに含まれる。decision記載の対象path SHA-256 `2bb62571308aa1fde0351ca7242e961ddd25b9c4722196c7bb255cf3ad1cfe0e`は固定commit `f6dad2a33e24f000b87d7f09b8d40288257e74cc`上のL1 bytesと一致し、現行main上の同path bytesとも一致する。L1の候補metadataは固定時点の本文として維持され、authorityはdecision recordから読む。この採択済み親は、新規`HELIXOS-L2-112`／L11候補の採択を意味しない。旧crosswalk上の「HIL-FR-24は2.0候補、1.0は接続・記録基盤のみ」という版配置を提案の起点として保持する。`version_target: 2.0 candidate`は未決の候補値であり、正式導入版、product scope、owner、参加consumer集合を確定しない。
- **source registryとsource key**：明示的に選択されたread source registrationとrevision-bound connector contractを入力にする。source identity、source種別、source側record keyのscope、connector/schema/mapping contract revision、credential reference、classification、read/write policy、sync mode、source owner、enabled state、適用するdata-use/authority参照を区別して追跡する。enable/disableは既存の有効なoperation authority下で行う明示的な状態遷移とし、各遷移receiptにsource registration identity/revision、connector contract identity/revision/content digest、要求状態、結果状態、既存authority参照を結ぶ。contract digestまたは対象registry/contract revisionが要求時と結果時に不一致・stale/unknownなら状態を切り替えず、結果receiptに不成立理由と観測revisionを記録する。receiptは既存操作の結果証拠であり、新しい承認主体・承認工程・許可を作らない。実credential、secret、header、connection string、raw record payloadを登録・receipt・通常projection・agent contextへ複製しない。source keyの意味と安定性はsource ownerの宣言を参照し、OSがprovider-specific schemaや業務意味を決めない。
- **projection**：有効な既存read scope/access条件の下で、明示選択されたsource registrationについてfullまたはincremental snapshotを候補的に取り込み、source record identityからconsumer ownerが宣言したcanonical entity、さらに明示選択されたrequirement/design/Issue等のconsumer identity・revisionへのmapping edgeを保持する。source revision、connector/schema/mapping revision、snapshot identity/digest、lineage、鮮度状態、cursor/watermark、tombstone、schema drift/stale findingを同じprojection resultへ結ぶ。各consumerの意味、mapping規則、選択集合、freshness threshold、retention期間、要求採否、Issue状態をOSが創作しない。
- **HIL-BR-15 consumer fanoutの条件**：旧HIL-BR-15が名指すconsumer役割は、設計判断、coverage、impact、Issue routing、docgen、detectorであり、各役割を独立に追跡する。明示選択されたProduct Data sourceをこれらの役割へ供給する結果では、適用される各consumer identity・revision、consumer ownerが宣言したcanonical entity/mapping、sourceからのlineageを個別に結ぶ。あるroleへのmapping edgeを別roleの被覆とみなさず、選択済みconsumerのidentity/revision・mapping・lineageが欠ける場合はそのfanoutを失敗とし、完全なfanoutと表示しない。owner、role applicability、scopeまたは必要revisionの値が未指定ならunknownとして保持する。sourceが未選択ならこのfanoutは未観測であり、参照のみの記録を供給成功や非該当へ読み替えない。実際のsource、参加consumer、roleの適用範囲、owner、schema、業務上のmapping semanticsは未決であり、OSは具体値を割当てない。六役割を一律に採択済み集合とはせず、未選択roleも非該当と推定しない。完全coverageを主張する候補fixtureは、六roleごとにowner/scopeに基づく「適用・consumer選択とmapping」または「非適用の明示根拠」を記録する。どちらも確定していないroleが残ればpartial/unknownとする。原文、保持点、上記scope選択肢、推奨および影響要求は`hil11-br15-product-data-consumer-fanout-audit-2026-10-02.md`に記録する。
- **full/incrementalとcurrentの条件**：同じsource/connector revision・sync intent・cursor基点・content digestの再送で二重のprojection効果を作らない。incremental cursor/watermarkはsource側登録済みcodec/順序契約で比較し、単調性が確認できる場合だけ選択snapshotとmappingを一体のrevision-bound resultとして提示する。更新前後revisionの混在、途中page欠落、重複または衝突するsource key、mapping欠落、partial response、結果の不一致では新しいcurrentを提示しない。途中で失敗した部分成果、失敗位置、隔離／再開に残る義務と戻し先を保持する。
- **tombstone・freshness・schema境界**：明示tombstoneをrecord/entity/mapping edgeへ結び、影響するconsumer mappingをstaleとして示す。incremental取得で単に現れなかったrecordを削除と推測しない。完全性が確認されたfull snapshotからの消失を削除へ変換する条件は、source ownerの契約と選択scopeに明記されている場合に限る。freshness期限切れ、source変更、unknown lineage、schema drift、cursor逆行をcurrent扱いしない。新schemaを既定・推測で解釈せず、問題sourceのprojectionをstale/failed/quarantinedとして示し、前の良好revisionと状態を区別する。source/ownerが選択したfreshness SLAとretention policyのrevision/referenceを入力および証拠に保持する。policy referenceがmissing/unknown/staleなら該当状態を未知として示し、数値freshness SLA、retention値、再取得間隔は原source/ownerが確定するまで候補から新設しない。
- **data-use・redaction境界**：source ownerとSECURITYの既存classification、data-use、retention policy、freshness SLA、read/write authorityを参照する。許可された最小fieldだけをread projectionへ流し、redaction後の許可出力のみ通常projectionやagent contextの候補入力にする。classification/accessがunknown、権限scopeが不一致・失効、必要redactionが未確認、PII/secret/raw payloadが通常出力へ漏れる場合はそのsource/resultを通さず、理由・source revision・隔離参照だけを残す。OSはアクセス許可を付与せず、CONNECTのtransport eligibilityやSECURITYの判定を代替しない。
- **oracle証拠と未解決時**：成功resultには、source/connector/schema/mapping revision、明示scope、選択consumer refs、snapshot/digest、cursor start/endまたはfull intent、watermark、mapping edge、lineage/freshness、適用redaction/classification、freshness SLA、retention policy referenceが対応する。enable/disable result receiptもsource/connector contract identity・revision・digest・既存authorityへ束縛する。negative resultには阻止されたcurrent/watermark前進、原因、影響範囲、stale/quarantine状態、復旧ownerを対応させる。未知のconsumer/contract/lineage、権限、cursor順序、schema compatibilityまたはfreshnessは成功へ補完せず`unknown`として保持する。
- **既存責務との境界**：OS-L2-015/016および007/009のsource identity、provenance、event/projection、耐久記録、再構築の一般条件を変更しない。HARNESS-L2-019の既存source reverse、採択済みHARNESS-L2-027の静的artifact observation、HARNESS-L2-038のReverse closureをProduct Data ingestionやcanonical mappingの既存被覆へ拡張しない。CONNECT一般の接続互換・transportは利用可能な別条件であり、Product Data source schema/cursor/snapshot/projection意味をCONNECTへ移さない。SECURITYは許可とdata-use、source/consumer ownerは業務意味・schema・mapping、OSは許可範囲内での選択read result・durable projection/evidenceを担う候補である。
- **旧source・部分coverage**：`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、旧L1要求source `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:67,113,114,197`（file SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`）のHIL-BR-15／HIL-FR-23／HIL-FR-24／HIL-NFR-17四atomを選択する。old IR source SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`、supplementary contract `HR-FR-HIL-11`（`LEGACY-ASSET-67761C517521603F844C`、SHA-256 `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab`）、HAC-HIL-11a/b/c（`LEGACY-ASSET-4886CEF2A7AB5B7AA5C8`、SHA-256 `4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19`）、HAT-HIL-11（SHA-256 `7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a`）と旧L5/L6のProduct Data source/canonical key/lineage/tombstone/privacy責務設計を起点に意味を再導出する。Node/Python分担、harness.db、特定transaction/DB port、旧API、test fixture、CI/runtime、active connector数上限は現行候補へ移さない。選択した四atom以外、旧supplementary contractの全field、全HAC/HAT/HST/U-PDC、全consumerやformal successorへのclosureは主張せず、`MPR-SH-IR-003`／`MPR-SH-CANDIDATE-003`／`MPR-SH-SUPPLEMENTARY-003`のholdingと旧carry-forwardを生存させる。
- **version_target**：`2.0 candidate`。旧crosswalkの配置案を保存した候補であり、1.0／2.0のPO採択、旧HIL要求のtarget移管、正式successor、source owner移転を意味しない。


### HELIXOS-L2-113 GitHub監査の決定的規則・semantic finding境界候補（connection候補、未採択）

- **authority／状態**：HELIX-OSを提案targetとする未採択candidate。仮登録は`registered_proposal`／`authority_effect: none`。本候補、register、receipt、静的acceptance案は要求採択、source ownerの移管、実装・実行許可、GitHub操作または受入を生成しない。現行ownerは未決のまま保持する。
- **親L1・提案責務**：POが対象revisionを確定・採択した`HELIXOS-L1-001`／`HELIXOS-L1-008`に接続する、既存HELIX機構をまたぐ決定的監査とsemantic findingの責務境界候補。現行system-intent.mdの`authority_status: draft_candidate` metadataは本文revision採否の正本ではなく、2026-09-28 PO decisionが固定SHA `2bb62571308aa1fde0351ca7242e961ddd25b9c4722196c7bb255cf3ad1cfe0e`を確定・採択している。OSは三つの境界を接続する要求候補の提案targetであり、GitHub監査の全能力、各gate、model評価、laneまたはproviderの現在ownerを主張しない。
- **対象と入力**：明示されたGitHub audit scope、対象revision、適用可能な決定的規則の正本revisionとそのNode gateによる判定、semantic findingを生成するmodel revisionと当該評価根拠のidentity・revision・scopeを対応させる。対象・規則・評価の対応が未提示ならunknownとして保持し、別taskやrevisionの記録から補完しない。
- **要求保証**：決定的規則の判定はNode gateが行い、semantic modelの結果で変更・置換しない。semantic findingだけを、対象scope/model revisionに対応する評価根拠が明示されたmodelへ委譲する。評価根拠が一致しない、未評価、staleまたはunknownの場合は委譲を成立済みにせず、未解決を返す。この監査capabilityは既存HELIXの責務境界で扱い、第四provider laneまたは独立Control Planeを新設しない。
- **権限・責務境界**：本候補はNode gateの規則集合や実行契約、semantic modelの評価方法・threshold、finding分類・severity・route、lane/provider数、issue/PR/CI/merge操作、現在ownerを新設しない。既存の各正本とownerが持つ意味・権限を接続し、別ownerへ移さない。候補はGitHubやIssue状態から要求authorityを生成しない。
- **既存要求との関係**：`HELIXOS-L2-015`のauthority/source記録、`HELIXOS-L2-018`のWorker割当・実行統制、`HELIXOS-L2-020`の検収/CI運転を置換・拡張しない。`HELIXINTELLIGENCE-L2-073`は自由文のみからのdetector置換・direct projection境界、`HELIXLABO-L2-071`は3L-BR-008に由来するtask class別qualificationの限定scopeとして参照し、本sourceの後継やowner決定に読み替えない。HELIXINTELLIGENCE-L2-072のshadow評価候補も本候補の採択・運用根拠ではない。
- **旧sourceとの対応**：`LEGACY-ASSET-A6926200F28B26300432`、旧`three-lane-cloud-governance-requests.md:63,65`の3L-BR-007一atomを起点とする。決定的規則をNode gateに保持すること、semantic findingだけを評価済みmodelへ委譲すること、GitHub監査を第四provider laneまたは別Control PlaneにしないことをL2保証として保持する。旧L3の3L-R-15/16/17は、Node決定的規則の対象、semantic findingの非修正提示、severityと作用範囲の具体化を担う下位refinementとして対応を記録し、候補本文へ別の数値・rule listを取り込まない。旧3L-AC-016/017/018はL11 oracleの由来として参照し、runtime実行証拠にはしない。
- **保持点・変更点・理由**：保持するのは三条件の責務分離と第四lane/別Control Planeの排除である。変更するのは、旧3社provider配置・cloud実装・GitHub動作の固定を現行lane、Worker、requirement/oracle/evaluation recordへ無断転記せず、明示scope/revisionに結ぶ要求境界として再導出する点である。理由は現行Conceptと機構境界が旧provider配置を現行owner/実装として採択しておらず、sourceにないlaneやruntimeを再導入できないためである。提案target、source owner、対象版、primary ownerの選定は未決で、POの対象revision判断へ提示する。
- **version_target**：未指定。旧sourceの版や旧層番号を現行適用版・採択状態へ読み替えない。

### HELIXOS-L2-114 worker/verifier loopの継続適格性候補（未採択）

- **状態・authority**：HELIX-OSの未採択候補。仮登録は`registered_proposal`／`authority_effect: none`。本文、L11 oracle、receiptまたは静的検証は、HELIXOS-L2-009の採択範囲変更、要求採択、ticket発行、実行許可、runtime green、受入実行を生成しない。
- **親L1・責務候補**：採択済みHELIXOS-L1-003（許可範囲内のWorker委譲・実行統制）とHELIXOS-L1-008（状態・証拠projectionの整合）に接続する単体候補。継続の既存authority・budget・deadline・未完義務はHELIXOS-L2-004／009／019のownerに残る。本候補は継続を実行せず、loop再入の適格性候補だけを扱う。
- **対象範囲**：既存operationが一つのworker/verifier反復loopを明示した場合の、同一episode内の次反復への適格性候補。一般のsession復旧、担当交代、ticket再発行、retry上限、CI再実行、別工程へのhandoffを一括して同じloopとみなさない。
- **旧条件の全項対応**：旧`LEGACY-ASSET-899A61905AFBC415F595`の`HR-BR-07`は、`status==running`、時間窓内、`lastVerdict!=pass`、`iteration<max`の4条件すべてを同時に満たす場合だけ継続する。候補は4条件をANDのまま保持し、次の現行対応を未解決として明示する。
  1. 旧`status==running`：現行のticket、assignment、workflow、sessionのいずれかの表示状態と同一視しない。対象episodeを継続可能とする状態と判断sourceを特定する必要がある。
  2. 旧「時間窓内」：現行HELIXOS-L2-009の期限・許可範囲と、旧窓の意味が同一とは仮定しない。開始・終了境界、時刻の基準、適用ownerを現在のoperation契約から確認する。旧sourceにあった窓の具体schemaや値を移さない。
  3. 旧`lastVerdict!=pass`：HARNESSの個別oracleのpassやCI greenを同一loopの終端passへ読み替えない。既存operationが当該loopの終端判定として明示したverdictだけを入力候補とする。
  4. 旧`iteration<max`：旧`max`や数値を固定・移植しない。既存operationが反復上限を定義するか、そのownerを特定する。HELIXOS-L2-040の失敗retry上限を反復loop上限の後継として扱わない。
- **候補条件**：上記4条件を現行の対象・revision・scope・authorityへ独立に対応付け、各conditionが明示的に真のときに限り、その同じloopの次反復を「適格」と表示できる。いずれかが偽なら次反復を適格とせず、いずれかの対応、入力、source revision、verdict境界または上限がmissing／unknown／stale／conflictなら`unknown`のままにし、理由と既存ownerへの確認先を残す。候補は新しいstatus、verdict、時間窓、上限のschemaや閾値を定義しない。
- **既存要求との境界**：HELIXOS-L2-009のevent永続化・冪等projection・checkpoint・budget・期限・未完義務保持と二重副作用防止、HELIXOS-L2-004のassignment authority、HELIXOS-L2-019のevent continuityを再定義しない。既存の継続が許可されること、次のWorkerをdispatchすること、または工程を完了することを本候補から生成しない。HARNESSの検証義務・oracleはHARNESS ownerが定義し、passを本候補の終端verdictへ自動変換しない。
- **人間判断点と推奨**：旧`running`と現行のoperation状態、旧時間窓と現行deadline/許可、旧loop終端`pass`と各HARNESS oracle結果の意味は同一性未確認であり、直接対応を採択済みと扱わない。PO選択肢は (A) worker/verifier loopに限り旧4条件の意味を保持し、各条件の現行authority ownerを明示する、(B) 反復loopごとに適用状態・時間条件・終端判定・上限を既存ownerが個別に決め、旧4条件は比較根拠としてholdingに残す、(C) 現行OSに共通のworker/verifier loopがないとしてこの条件を要求化せず保留する。推奨は(B)：4つの安全述語は比較・検収に残しつつ、状態語・時間意味・verdict終端性・上限の適用をoperation ownerへ結び、値や旧loopを全工程へ拡張しない。AまたはBで採択する場合、L1-003／008の継続責務とL2-004／009／019および対L11の適用範囲を具体化する。Cの場合、それらの採択済み要求は変えず、当該旧条件を未対応のまま保持する。
- **旧source・限定範囲**：旧`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/orchestration-memory.md`の22–27行（file SHA-256 `9c88351f237d00c809f2cf7796fa30942f0ee2c3ad071842e719861551ccca5c`）のHR-BR-07継続条件を起点とする。今回のsource atomは26–27行の2行だけ。停止rule、失敗分類、メモリ二層、secret拒否、self-evaluation、DB/job queue、旧runtime/testはこの候補に含めず、当該assetの他条件やformal successor/closureも主張しない。PHCAP-20の初期inventory状態や未実装runtimeを要求欠落の根拠にしない。
- **version_target**：未指定。旧sourceに記されたversionや実装予定を現行適用版・候補採択へ読み替えない。

### HELIXOS-L2-117 選択event generation identityの個別検査候補（単体候補、未採択）

- **状態・authority**：HELIX-OSの未採択候補、`registered_proposal`／`authority_effect: none`。これは2026-09-28のHELIX-OS L2/L11採択集合に含まれず、登録・候補本文・静的fixtureから要求採択、L3承認、CI実装・実行、merge admissionまたは受入完了を生成しない。
- **親L1・責務**：固定・採択済み`HELIXOS-L1-004`へ接続する候補。HELIX-OSは、既存HARNESS契約が選択したCI event scopeについてgeneration identityを構成する各入力の欠落・不一致を独立に検出できる受入oracleを保持する。HARNESSが持つ検証義務・oracle意味を変更せず、providerから来たfieldの意味もOSが定義しない。
- **選択scopeのidentity**：候補fixtureでは、選択されたevent class、適用されるPR ID、対象HEAD、run ID、attemptの各facetを別々に与え、generation identityと入力要素の関係を追跡する。旧sourceが列挙した`event class`、`PR ID`、`HEAD`、`run ID`、`attempt`の一つずつの欠落または改変を個別fixtureにし、各々で同一・有効なgenerationとして受け入れない。残りの入力が一致しても欠落・改変facetを補完せず、異なるfacetの値を代用しない。
- **決定的な正常対応**：同じ選択scopeと同じ適用facet集合・値に対して、毎回同じgeneration identityを再現することを候補条件とする。eventやfacetの順序、identityの生成アルゴリズムはここで追加しない。
- **正常対照と未確定の適用意味**：同じ選択scopeで適用可能と明示された全facetが一致する正常対照を置き、欠落・改変fixtureの拒否が有効な正常identityを誤拒否しないことを確認する。旧sourceの`PR ID`が全event classで必須か、PR event classに限って必須かは現行L1/L2で確定していない。PO選択肢はA「旧行どおり全列挙facetを一律必須として保持」、B「event classに対する適用可能性を選択scopeで示し、PR IDは該当event classのみ必須とする」であり、推奨はB。Bは旧sourceの列挙facetを削除せず、適用範囲だけを明示する。いずれもprovider固有field名・event enum・生成tupleの永続schemaは固定しない。
- **対象と受入境界**：候補に選択されたgeneration scopeのidentity oracleだけを扱う。全CIへの一括適用、queue/concurrency、schedule置換、cancel/supersede、post-main/review consumer、receipt再構築、bounded GitHub rehearsal、runtime/database/provider adapterの仕様は含まない。旧CIG-AC-003/005/007等の隣接conditionや選択されていないCIG-R全体は本候補のinputではない。
- **現行要求との関係**：採択済みHELIXOS-L2-008／L11-008はHARNESS義務に基づくCI profile生成と実行状態を扱い、HELIXOS-L2-020／L11-020はexact HEAD/oracle/environment/run identityを要求する。本候補はこれらを置換せず、個々のgeneration identity facet欠落・改変を拒否する受入oracle候補に限る。NCI-OS-003／004とpaired L11候補はpipeline/run binding、異なるHEAD等を扱うが、旧AC-001のevent class／PR ID／run ID／attemptごとの個別negativeと正常対照を明記しないため、同条件の保持または採択とは扱わない。
- **旧source・差分・未解決**：`LEGACY-ASSET-0B75B173425C200EA8CD`、旧`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-acceptance.md:14`（file SHA-256 `7c7ba00bec6fbf50c65c4ee48a849eaef4f038229b99daa0bc19a519fbda70cc`、line SHA-256 `77c358b5bc3253bac4d39a55685fae93570d3e4288ca161de1a195b676eea412`）のCIG-AC-001一行を候補入力にする。個別欠落・改変拒否と合法対照を保持する。旧CIG-R-01の固定event enum、repository/workflow/ref/HEAD tuple、GitHub native implementation、旧runtime/rehearsalは現行条件へ移さない。source atomは`ci-event-identity-negative-oracle-source-lines-2026-10-02.jsonl`と同名coverage receiptが束縛する。旧source owner、適用event scope、PR identity適用条件、formal successor、採択、実行受入は未確定であり、生存中`MPR-SH-CANDIDATE-003`を変更しない。

### HELIXOS-L2-115 終端runへの遅着Worker結果を受理しない（単体追補候補、未採択）

- **状態・authority**：HELIX-OSの未採択候補。`registered_proposal`／`authority_effect: none`。本候補、対L11、source receipt、登録は要求採択、実装、実行、result採択または操作許可を生成しない。
- **対象**：既存OS assignmentに結び付いた一つの実行attemptについて、既存契約によりtimeout、cancel、期限・lease失効、process終了その他の終端結果が確定した後に返るlateまたはduplicate resultを扱う。
- **保持する条件**：終端後に到着したresultは、そのattemptの成功結果またはcanonicalなaccepted stateとしてcommitされず、既に確定した終端状態を変更しない。遅着result自体、そのsource／revision、assignment／attempt、到着関係と終端理由は既存のevent／evidence契約に従って追跡可能にし、古いresultを現在のassignmentへ流用しない。正当なresultが終端前に戻った場合の検証・受理は既存assignment、authority、HARNESS oracleの条件に従い、本候補が新しい成功条件を作らない。
- **依存と接続**：`HELIXOS-L2-004／018`のassignment・attempt・期限・停止、`HELIXOS-L2-007／019`のsource/revision・evidence・stale・未完義務、`HELIXOS-L2-009`のdurable eventとcheckpoint、採択済み`HELIXOS-L2-043`のrequest／call／result相関を使う。既存の終端・停止判断を置換せず、どの機構がresultの品質やoperation authorityを判断するかも変更しない。
- **不成立・戻し先**：終端後resultで成功・accepted・current assignment結果へ進む、終端履歴を上書きする、別attemptへ適用する、またはsource／revision／終端理由を追跡できない場合は不成立。該当assignmentを既存OSの未完／staleとして保ち、発生元またはassignment ownerへ戻す。無関係な作業を一律に停止しない。
- **旧source・保持点・差分・理由・限界**：`LEGACY-ASSET-A60CF91DD2AF6693E6F9`の旧`requirements.json#/HIL-FR-27`、source file SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`が要求する原条件は「失効runのlate resultをcommitしない」であり、このexpiry条件を候補でも保持する。候補はさらに、timeout、cancel、process終了などを独立した新しい終端種別として作らず、既存OS contractがすでに終端と定義する場合に限って適用すること、同一attemptのduplicateまたはassignment／attempt／source／revision不一致resultをaccepted/currentへ進めないことを提案する。追加する理由は、旧expiry拒否の意味を保ったまま、既存契約の終端事実とresultのassignment／attempt／source／revisionを結び、遅着・重複・取り違えが確定済み結果を変えない範囲を明らかにするためである。この限定一般化とduplicate/mismatchの追加は原文そのものではなく未採択の候補差分であり、対象revision付きPO判断を要する。PO判断材料のA（既存契約で明示された終端原因までの限定一般化を採択、推奨）／B（原文のexpired-run条件だけへ限定し、追加条件は未決のまま保持）／C（適用run・terminal種別の選択まで候補を保留）は[`ir153-hil-fr25-31-current-pairs-condition-audit-2026-10-02.md`](../../governance/audits/requirements-stage/ir153-hil-fr25-31-current-pairs-condition-audit-2026-10-02.md#fr27候補115のpo判断点)とcoverage receiptに記録する。raw旧L1 line 117と`HR-FR-HIL-12`、`HAC-HIL-12a/b/c`、`HAT-HIL-12`は要求の出自・隣接条件・旧oracle範囲を照合する資料であり、旧Node/Python supervisor、protocol handshake/schema/digest、JSON Lines、transport、固定terminal receipt/fence、process管理・runtimeを現行方式として要求しない。旧FR-27全体、design template未解決事項、関連HAC/HAT全体のclosureまたはformal successorを主張しない。
- **version_target**：旧sourceは版を指定しないため追加しない。

### HELIXOS-L2-118 検証義務を保つrun置換・終端証拠（単体候補、未採択）

- **状態・authority**：HELIX-OSの未採択候補、`registered_proposal`／`authority_effect: none`。2026-09-28の採択済みL2/L11集合に含まれず、候補本文・receipt・静的fixtureは要求採択、L3承認、CI実装・実行、merge admission、操作許可または要求closureを生成しない。
- **親L1・責務**：固定・採択済み`HELIXOS-L1-004`へ接続するOS候補。HARNESSが検証義務とoracleを定め、OSは承認済み義務に従うrunの生成・置換・結果回収・状態復元を扱う。OSは義務・oracleを追加、削除または再定義しない。
- **独立event class・current main**：source-faithfulな選択肢Aでは、`main_push`、`schedule`、`workflow_dispatch`、別PRは相互にcancelせず、schedule/manual safety-netを含む別event classがcurrent main HEADのpost-main検収をcancel・代替しない。同一PRのnewer HEADが置換できるのはそのPRのstale HEADだけであり、newer scheduleが置換できるのはolder scheduleだけである。`cancel-in-progress:false`の指定だけで無制限並走をbounded controlの代替にしない。義務identity/HEAD一致だけから別event classのcancelまたは結果流用を許可しない。
- **有界置換**：staleな対象generationだけを置換対象にでき、置換を通じて未完のrequired verificationとcurrent main検収を失わない。異なる義務範囲やevent classに影響を広げず、全runの無制限な並走・queue、費用、古い証拠の累積を許容しない。schedule queueの上限またはTTLを超える場合も、older scheduleだけを置換対象にし、runまたはrequired verificationをsilent dropしない。置換・期限到達で未完義務が残るときは、その未完状態をconsumerから確認でき、terminal evidenceがない状態をsuccessにしない。必須義務を保持するbounded controlを要求するが、具体的な数値上限、TTL、provider concurrency方式、状態enumは固定しない。
- **終端結果・追跡**：current canonical HEADのterminal evidenceを安定して確認し、各read-after結果をその結果を生じたrun IDへ結び付ける。current main pushとscheduleは、それぞれ対応するrun IDのterminal evidenceとして独立に照合する。run IDが欠落・不一致なら結果をterminalとして結び付けず、関係をunknown／未完として残す。証拠欠落または対象不明もunknown／未完として残す。cancel、supersede、handoffの理由と対象を後から再構築できる。required verificationの削減、cancelled runの成功扱い、同一HEADであっても異なる義務に属する結果の流用を高速化として認めない。同じ義務範囲での置換、handoff、terminal read-afterに必要な証拠を明示する。特定のreceipt field/schema/DB projectionは定めない。
- **依存と境界**：採択済みHELIXOS-L2-007／009／018／019の証拠・event・assignment/attempt・未完義務・projection/checkpoint保持と、HELIXOS-L2-008／020のHARNESS義務に基づくprofile生成・隔離実行・回収に接続する。候補`NCI-OS-003／004／005`および`NCI-HARNESS-002／003`は関連する未採択条件として参照できるが、本候補がその採択や適用scopeを生成しない。HELIXOS-L2-117のidentity facet単位の欠落・改変検査、または候補115の単一assignment/attempt終了後のlate result不採用を置換しない。
- **意味差と判断待ち**：旧source条件を保つAは、前項のevent間相互cancel禁止、同一PRのstale HEADだけの置換、newer scheduleからolder scheduleだけの置換、異event class結果を高速化に使わない条件を維持する。event名をprovider APIや固定schemaにすることまでは要求しない。Bは、名前付きevent classを単なるfixtureにし、同一義務/generationなら異なるevent class間でも結果を流用可能とする義務中心の一般化である。これは旧sourceの相互cancel禁止・別event class結果非流用を弱め得る意味変更であり、POの明示選択と影響scopeが決まるまで採用しない。推奨はA（旧sourceの否定条件を保持し、provider/schema詳細は固定しない）。Bを選ぶ場合は同一義務内のevent class横断流用を許す範囲を判断対象として記録する。
- **旧source・対象範囲**：選択atomは`LEGACY-CAND-LINE-000470`、`000472`、`000474`、`000491`、`000492`、`000496`、`000497`、`000499`、`000500`、`000501`、`000502`、`000527`、`000528`、`000529`。各原文、path、物理行、file/line SHA、legacy ledger record、asset参照は`ci-event-concurrency-source-lines-2026-10-02-r2.jsonl`および`ci-event-concurrency-coverage-receipt-2026-10-02-r2.json`に束縛する。`000470`のqueue上限/TTL超過時にsilent dropしない条件を本候補のbounded replacementへ追補し、数値やstatus enumは固定しない。`000472`のcancelled runをpost-main/review/deferred-success consumerが拒否する条件は既存oracleへsource mappingする。`000474`のmain-push/schedule独立terminalとcancel/handoff理由・対象の再構築も既存条件へmappingする。各read-after結果を対応run IDへ結び付け、run ID欠落・不一致をunknown／未完とする正常・negative oracleだけを今回追補する。`000527`はevent class間の相互cancel禁止と同一PR stale-HEAD限定置換、`000528`はその限定述語の続きとolder-schedule-only置換、`000529`は無制限並走を代替策としない条件を保持する。過去のrouting分類は条件の不存在を意味しない。`000478`および`000474`の実runtime/rehearsal条件はcanonical promotion後の別PLANへ残し、この要求候補の実行gateにしない。旧event classをprovider API/schemaとして固定すること、旧receipt field、GitHub native concurrency、DB/doctor/telemetry、旧runtime/test/CI/rehearsalは移さない。生存中`MPR-SH-CANDIDATE-003`、formal successor、source owner、scope、採択、実行受入、source全体のclosureは未確定のまま維持する。
- **version_target**：旧sourceに指定がないため追加しない。


### HELIXOS-L2-119 Codex・Claude協働episodeの圧縮とcontinuity分離候補（未採択）

- **状態・authority**：HELIX-OSの未採択要求候補。`registered_proposal`／`authority_effect: none`。文書、fixture、仮登録は採択、実装、実行、知識昇格を生まない。
- **親L1・責務**：採択済み`HELIXOS-L1-003`／`HELIXOS-L1-008`の中断後再開と原情報からの再構築へ接続する。OSはCodexとClaudeの協働episodeの証拠圧縮・再開情報をつなぐ。要求意味、規則、知識の正本・評価・昇格はOS memoryへ置かない。2026-09-24 PO判断の「harness memoryはCodexとClaudeの連携用に限る」「過度な記録を残さない」を保持する。
- **入力**：協働作業の完了境界を示す既存episode/checkpointと、raw実行ログ、PR、test/CI、監査所見の四source classをそれぞれ照合し、各classについて選択sourceのidentity、revision、event/span、利用区分と、存在・非該当・欠測・失敗の状態を受け取る。非該当として圧縮対象から外す場合も出典と理由を記録し、未提示・unknownを非該当へ読み替えない。
- **提供・保証**：四source classすべてについてcoverage結果を返し、存在し選択されたsourceを要約へ圧縮する。要約の各主張は元sourceの識別可能なevent/spanへ辿れ、非該当・欠測・失敗も個別に見える。episodeの完了・未完状態を返す。進捗、再開位置、未完義務、停止理由は`HELIXOS-L2-019`のepisode continuationへ保持し、長期の知識候補と同じ項目・同じ正本へ混載しない。圧縮summaryそのものを永続知識とみなさず、永続知識として区別できる内容だけを知識候補へ分離する。継続summaryはknowledge candidateや採択済み規則ではない。
- **知識境界**：OSは永続知識を自ら承認・昇格しない。長期知識として扱う場合は、既存のauthorityと2026-09-24 PO判断に従う（1.0〜2.xではHELIX-LABOが評価・保持し、3.0からはHELIX-INTELLIGENCEが改善に使う）。要求・設計・受入・運用規則・嗜好はmemoryの正本へ移さず、規則は仕組みで吸収する。provider native memoryは使わない。
- **依存区分**：2026-09-27 PO判断（`docs/governance/decisions/body-reinforcement-po-decisions-2026-09-27.md`）の各パック共通4区分を適用する。常時必須＝source/authority/evidence provenance（L2-015）とepisode continuity（L2-019）、data-use境界。特定操作時のみ＝完了境界で圧縮が選択された場合の圧縮・coverage確認。選択入力依存＝そのepisodeで選ばれたraw log／PR／test/CI／audit sourceと各span。参照のみ＝旧DB、旧extension/hook、旧memory schema、圧縮対象episodeと無関係な背景資料、将来の知識promoter実装。選択入力依存の未選択sourceと、未接続・未選択のsource classは未観測として保持し、参照のみへ分類しない。
- **失敗・未完義務**：source classのcoverage未完、選択sourceの欠落、span不明、digest/revision不一致、利用不許可、圧縮出力とsourceの対応不明、保存/projection失敗があれば、coverageまたは圧縮を完全・成功として示さない。原eventと既存continuationから未完位置・不足evidenceを保ち、発生元またはauthority ownerへ返す。raw logやsecretの混載、進捗の知識化、自己昇格、provider memoryだけからの再開を受入可能にしない。
- **既存要求との境界**：L2-019の一般provenance・episode再構築・未完義務保持、L2-005の改善候補登録・振分け、L2-009の永続event/checkpoint、HMC-BR-003／006を再定義しない。候補が追加するのはBR-03のsource種別とspan coverage、圧縮結果・continuation・知識候補を分離して確かめる対である。L2-112 Product Data projectionやL2-118 CI event concurrencyとは別機能である。
- **旧source・意味差**：旧`LEGACY-ASSET-A60CF91DD2AF6693E6F9`のIR `HIL-BR-03`一atomを起点にする。旧L1 line 55は関連する同一要求文の由来で、別atomとして加算しない。旧文の「Claude CodeはCodex完了時」を現行POのCodex・Claude連携範囲へ対応づけ、「DB continuation」は旧技術として持ち込まずL2-019のepisode continuationへ対応づける。HR-FR-HIL-07とHAC/HAT-HIL-07は親・consumer/oracle contextであり、この一atom候補がそれら全体を閉じない。`MPR-SH-IR-003#HIL-BR-03`と旧source holdingを維持する。
- **未決の意味差**：圧縮を適用するsource集合の選択条件と、旧actor/DB表現から現行の協働episodeへ置く対応は候補上の再導出である。receiptのPO判断packetに選択肢を残し、旧要求の意味変更・適用scope・正式successorをこの候補や仮登録から確定しない。
- **version_target**：親L1または選択した旧atomに値がないため未指定。

### HELIXOS-L2-121 HIL-BR-12 intakeとstyle接続の未採択候補

- **状態・authority**：未採択の`registered_proposal`、`authority_effect: none`。候補本文・receipt・仮登録は要求採択、旧要求のformal successor、L3承認、実装・実行許可を生成しない。旧`MPR-SH-IR-003#HIL-BR-12`は生存させる。
- **親と責務**：主親は採択済み`HELIXOS-L1-002`（作業から運用までの追跡）と`HELIXOS-L1-008`（要求・判断出所）に接続する。HELIX-OSはGitHub由来Issue/PR/CI eventとユーザーが差し込むIssue/PLANを同じintake契約へ受け取り、source/cause/authorityの区別を保って投影・割当責務へ渡す。HARNESSはproduction development styleとcase-driven activationの規範を所有し、OSはHARNESSの選択結果を変えない。INTELLIGENCEのplacementは案、assignmentと進行統制はOS、実行はWorker、権限制限はSECURITYが担う。
- **保証**：同じcontract boundaryへ正規化した各work itemで、(1)HARNESSの選択済みdevelopment style、(2)そのstyleまたはoperationに対するcase-driven activation条件、(3)必要なspecialist capability、(4)処理後に再接続するstyle上の工程位置を別々の意味として保持する。specialist capabilityはwork itemに必要な能力制約であり、team/muster構成やprovider/model名、INTELLIGENCEの配置案だけで代用しない。OS assignmentは必要能力との適合を確かめ、実行主体へ渡す。style再接続点は選択済みHARNESS styleの工程境界へ対応づけ、OSが独自phaseやticket kindを作らない。
- **依存区分・同入力閉包**：依存区分は、採択済みHARNESS-L2-023の固定意味を使用する（2026-09-28 HARNESS PO decisionで固定L2/L11 revision中の明示候補として採択）。依存はidentity、owner、contract version/range、適用条件・根拠を、HARNESS pack/contract revisionと本intakeのoperation・scope・明示source selectionへ束縛する。同じpack/contract revisionとintake条件を再評価したとき、有効依存closureとその理由が一致する。
- **常時必須**：source identity/provenance、cause、authority区分、正規化後のcontract revision、選択styleとcase定義のidentity/owner/契約版/適用根拠、および常時依存の有効closureを保持する。採否・作業許可をGitHub状態から推定しない。既存SECURITY authorityは常に適用する。
- **特定操作時のみ必須**：依存候補のoperation条件を入力から評価し、成立した操作の依存を必須として閉じる。HARNESS caseの条件が明確に不成立の場合に限り、そのoperation依存を当該利用のclosure外にする。style変更または再接続操作では、選択styleとその工程上の再接続先を照合する。specialist capability制約のあるwork itemをassignmentするときは、identity/owner/contract版と適合根拠を確認する。
- **選択した入力元に応じて必須**：利用者が明示選択したGitHub Issue/PR/CI eventまたはuser Issue/PLANのidentity、owner/source authority、contract version/range、scope、対象revision/span、適用根拠をselectionに束縛し、選択されたsourceを成立させる全依存を閉じる。未選択sourceは未観測であり、存在・不在・適格性・成功を推定しない。選択sourceの欠測、読取失敗、版不一致、unknownから他sourceへの暗黙fallbackをしない。
- **参照資料のみ**：旧`harness.db`、旧Issue schema、Claude hook、固定agent/muster構成、旧workflow/runtime/test/CIは意味再導出の資料に限る。実行条件・source authority・検証oracle・安全制約を担う文書は参照のみへ落とさない。旧実装やtestを実行・移植しない。unknownな条件をfalse、非適用、参照のみへ読み替えず、必要なidentity/owner/version/適用根拠がmissing/unknown/staleなら該当operationを保留する。
- **失敗・戻し先**：正規化、source/cause、採否またはauthority、style、activation case、capability、再接続点のいずれかがmissing/unknown/stale/conflictなら、該当facetを完了扱いせずOS intake/assignmentの未完として保持する。style/activation意味の不足はHARNESS ownerへ、capability evidence/assignment不足はOS assignment ownerおよび既存SECURITY境界へ戻す。unknownなcaseを非該当へ、未知capabilityを満足へ、未知再接続先をdefault phaseへ読み替えない。
- **保持と変更**：保持するのは旧HIL-BR-12の同一intake契約への正規化と、development style・case-driven activation・specialist capability・style再接続点を決定する4 facetである。旧IRは決定主体や物理schema/routeの実装を特定していないため、authority・責務は現行HARNESS/OS/INTELLIGENCE/Worker/SECURITY境界へ再導出する。旧DB/schema/hookを再導入せず、具体的enum・provider・実行手段は固定しない。
- **既存条件との関係**：採択済み`HARNESS-L2-002/003`はstyleの選択・方式/工程の意味・開始/凍結/差戻しを、採択済み`HELIXOS-L2-001/002/003/004/010`は要求出所、作業追跡、共通統制とproduct方式の分離、assignment、ticket/workflow境界をそれぞれ保持する。さらに採択済み`HARNESS-L2-023`の依存4区分、dependency identity/owner/contract version-range/applicability evidence、同入力closure再現性、unknown fail-close、選択source failure時fallback禁止をそのまま適用する。本候補はこれらを変更せず、BR-12四facetがintakeからHARNESS style、OS assignment、再接続点まで一つずつ辿れる条件を補う。既存の一般traceやcapability/muster行だけでは四facetすべての保持を主張しない。
- **旧source・限界**：選択したsource atomは旧IR `requirements.json#/HIL-BR-12` statement一件（asset `LEGACY-ASSET-A60CF91DD2AF6693E6F9`）のみ。旧L1 `infinity-loop-platform-requirements.md:64`（asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`）は同じstatementの由来を確認するcorroborating sourceで、別atomではない。関連する`HR-FR-HIL-01`、`HAC-HIL-01a/b/c`、`HAT-HIL-01`はconsumer/oracle contextでありsource atom数へ加えない。HATは`designed_not_implemented`であり実行証拠ではない。旧runtime/test/CI、固定Issue schema、exactly-onceの旧実装手段は移植せず、HR/HAC全体のclosureも主張しない。
- **version_target**：旧source identityに値がないため指定しない。
### HELIXOS-L2-120 Agent instance lifecycle outcome and terminal separation (candidate, unadopted)

- **状態・authority**：HELIX-OSの要求候補。`registered_proposal`／`authority_effect: none`。この本文、対L11候補、receipt、MPR登録はHIL-FR-32の採択、正式successor、実行許可、runtime/test/CI実行または受入完了を生成しない。
- **親Concept・L1・責務候補**：ConceptはHELIX-OSを機構として置き、製品の属性と区別する。対象は採択済みHELIXOS-L1-003（許可範囲内のWorker委譲・実行・安全な再開）とHELIXOS-L1-008（authority/design/verification/runtime projectionの不整合検出と原情報からの再構築）。既存OS L2-018が持つassignment/attempt・進行・停止・handoffと、L2-019が持つevent/evidence/continuityの接続上に置く。現行OSが明示したworker operation内のinstance lifecycleだけを提案し、HARNESSが定める要求・検証義務、SECURITYの権限判断、INFRASTRUCTUREの実資源判断を移管しない。
- **入力と結果**：明示されたoperation/lifecycle契約revisionと責任owner、登録identity/登録根拠、対象ticket・要求revision・scope、assignment/attemptとinstance identity、authority/capability/期限、実行中checkpoint、resultと独立verificationの証拠を照合する。状態遷移と根拠eventを同じinstance/assignment/attemptへ結び、登録identityと根拠から適格化へ進み、配置/招集・lease取得・実行・checkpoint・completed/failed/cancelledの各結果・独立verification・releaseを別々に確認できるようにする。quarantine/retirementは当該instanceを停止させる終端branchとして区別する。sourceが要求するinstance event、lease/heartbeat、context/result/verification receiptの意味を保持するが、固定物理receipt、event schema、status enum、provider/APIを作らない。
- **依存区分（採択済みHARNESS-L2-023の4区分を適用）**：常時必須は、選択operationのidentity・責任owner・契約revision・適用理由、対象ticket/要求revision/scope、lifecycle instance/assignment identity、authority、適用oracle/evidenceであり、同一入力から同じ有効依存閉包を再現する。特定操作時のみ必須は、lifecycleを評価・遷移・再開・終端化する選択操作とそのscopeであり、該当操作の必要証拠がmissing/unknown/staleならその操作を保留する。選択入力元に応じて必須となるのは、実際に選んだoperation contract・checkpoint/result/verification sourceと各revision/scopeである。未選択inputは未観測として保ち、存在・不在・適格・成功を推定せず、別sourceへfallbackしない。参照資料のみは旧enum/controller/provider/schema/transportと背景資料であり、現行の権限・適用性・evidence・oracleの代用にしない。unknownをfalse/non-applicableにしない。四区分はHARNESS-L2-023の意味を本候補のinstance lifecycle inputsへ対応づけるもので、OS120をHARNESSが採択した、またはHARNESS要求の意味をOSへ移管したとはしない。
- **保証と失敗時**：operationで定義された`registered→eligible→mustered→leased→running→checkpointed→completed/failed/cancelled→verified→released`の意味順序、権限、証拠が同じ対象revision/scopeでそろった場合だけ、そのstageをcurrentとして示す。旧ラベルやenumを固定しないが、意味stageを省略もしない。登録identityや登録根拠の欠落を含む欠落・重複・stale・期限/lease/fence不一致・遷移競合は成功stateへ進めずunknown/未完として理由と責任ownerを残し、再開時も未完義務・累積制約・source revisionを保つ。`failed`/`cancelled` resultを成功へ読み替えず、verificationはresultの確認であってsuccess判定の自動代行ではない。releaseは独立verification後に限る。quarantined/retired instanceを同じidentityのeligible/running/releasedへ戻さない。sourceにない自動再投入、retry上限、新authorityや承認gateは追加しない。
- **現行要求との境界**：採択済みHELIXOS-L2-018/L11-018のassignment/attempt・lease/停止・handoff、L2-019/L11-019のevent provenance・再構築・未完義務、L2-020/L11-020の検収状態分離、L2-023/L11-023のhandoff traceを置換しない。未採択候補HELIXOS-L2-115は単一assignment/attemptの終端後late resultを扱い、HELIXOS-L2-118はCI event generation間のrun置換・終端証拠を扱う。本候補はそれらのlate-result条件やCI event/run generation置換条件を重複定義せず、agent instance内の状態遷移・result/verification/releaseとquarantine/retirement branchの意味だけを補う。
- **旧source・保持点・差分・限界**：旧`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`（旧L1要求原文line 122、raw file SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`、line SHA-256 `6a3c46753ca175a66314732911155516f21f06b857fc65af4ea948e281d01d66`）のinstance lifecycle progression、completed/failed/cancelled後の独立verification/release、quarantined/retired終端branchと、instance/lease/heartbeat/context/result/verification evidenceを意味条件として保持する。旧状態名を現行provider/runtimeの固定enumへ移さず、現行operation契約に対応するsemantic stageとして照合する。old HR-FR-HIL-08/HAC-HIL-08a/b/c/HAT-HIL-08のregistry/team、lease/fence/checkpoint/verify、manual drift/self-verify/double-lease/old-fence反例は補助source consumerとして照合対象に置くが、この一行候補の全HAC/HAT closureや旧team schemaの採択とはしない。旧JSONL/registry/lease transportや具体implementationは移さない。原文、既存pairとの対応、意味差、判断点は `docs/governance/audits/requirement-registration/helixos-l2-120-hil-fr32-lifecycle-coverage-receipt-2026-10-02.json` と同source JSONLに固定する。
- **PO判断点・推奨**：A) 現行OS operation契約がinstance lifecycleを明示する全operationへこの意味stage保証を共通適用する（推奨。一般形の旧Agent Lifecycle Controller条件を保持する。各operationのowner・契約revision・適用理由は個別に示す）；B) lifecycle全体を下位設計のみに残し、L2候補を採用せずHIL-FR-32をholdingに保つ；C) POがこの候補判断packetで個別に選択したoperation identity/scopeだけへ適用し、他のlifecycle宣言operationも未選択・未観測のまま候補scope外に保つ（Aより狭い明示的部分適用）。AとCの差は自動的な全該当operation適用か、列挙されたsubsetだけの適用かであり、いずれも候補起草・独立reviewを止めず、採択・適用scopeの決定だけを保持する。影響はOS L1-003/008、採択L2/L11-018/019/020/023、候補115/118との境界に限る。
- **version_target**：旧sourceに指定なし。現行適用versionは未指定のままとする。
