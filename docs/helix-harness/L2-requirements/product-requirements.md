---
title: "提供プロダクトHARNESSの利用要求"
canonical_vmodel: L1-L12
canonical_layer: L2
canonical_pair: L11
layer: L2
kind: design
status: draft
freeze_blocking: true
created: 2026-09-14
updated: 2026-09-26
pair_artifact: docs/helix-harness/L11-acceptance/product-acceptance.md
parent_l1_candidate: docs/helix-harness/L1-planning/product-intent.md
---

# 提供プロダクトHARNESSの利用要求

2026-09-14のPO指示に従い、提供するプロダクトをHARNESS、HELIXプロジェクト群の統制をHELIX-OSとして
要求の対象を分離する。本書は既存の混在要求から分離した案であり、個別要求の合意・IR移管は未完了である。
旧`harness/L1-requirements`や`L2-screen`の配置だけを現行採用の根拠にしない。

sourceで採用済みだった要求意味は、そのsource authorityを保って[無損失carry-forward方針](../../governance/legacy-requirement-carry-forward-policy.md)に従って保持する。新世代targetへの配置は未承認である。
本書と参照crosswalkに残る「再採否」「不採用」「棄却」は、明示された旧owner、旧技術、旧CI、旧実装方式、
または元からcandidateだった項目にだけ適用する。原要求IDと要求意味を削除・縮退・candidate降格する意味には使わない。
原要求は対象product、責務、粒度、接続関係を再配置し、未被覆atomを`pending`として残す。要求意味の変更または
retireには、対象ID・revision・理由・影響を持つ人間decisionを必要とする。

HARNESSはVモデル等の開発工程を規定する提供プロダクトである。Worker実行、CI運転、ログ保存、
プロジェクト群の管理・統制はHELIX-OS側に置く。学習（RCLS）と改善の評価はHELIX-LABO側に置く（[2026-09-25 PO判断](../../governance/decisions/mechanism-placement-po-decisions-2026-09-25.md)）。

外部利用者へ提供する範囲はHARNESSである。提供物の仕様・版・導入条件を明示し、HELIX内部の
プロジェクト群、Worker割当、学習記録、ログ、CI運用をそのまま利用者の必須構成にしない。
提供範囲と依存条件は明示して管理し、内部運用が存在することだけを暗黙の外部依存にしない。

親は[HARNESS L1企画候補](../L1-planning/product-intent.md)である。現在は親ConceptとL1が未承認のため、
以下のrelationは接続案であり、承認済み導出ではない。

| L2要求 | 親L1候補 |
|---|---|
| HARNESS-L2-001 | HARNESS-L1-001 |
| HARNESS-L2-002 | HARNESS-L1-002 |
| HARNESS-L2-003 | HARNESS-L1-002／HARNESS-L1-003／HARNESS-L1-006 |
| HARNESS-L2-004 | HARNESS-L1-003／HARNESS-L1-004／HARNESS-L1-006 |
| HARNESS-L2-005 | HARNESS-L1-004 |
| HARNESS-L2-006 | HARNESS-L1-005 |
| HARNESS-L2-007 | HARNESS-L1-007 |
| HARNESS-L2-008 | HARNESS-L1-008 |
| HARNESS-L2-009 | HARNESS-L1-009 |

| ID | HARNESSに対する利用要求 | 主な移管元 | 確認する結果 |
|---|---|---|---|
| HARNESS-L2-001 | 企画・要求・L2.5（Prototype・PoC）・要件・設計・実装・検証をL1–L12と正規V-pairで構成できる。画面や不確定要素のない対象ではL2.5を飛ばせる | v1.3 §2、HBR-P3、2026-09-24 PO判断 | L2要求とL11受入、L3要件とL10総合検証を混同せず、各層の成果と対が分かる。L2.5の結果を要求の合意と区別する |
| HARNESS-L2-002 | 対象プロダクトの特性に合わせて開発方式（Vモデル、スクラム、ハイブリッド、リリースカンバン）を選び、または合成して進められる。L3までは方式によらず一律共通に進める | HBR-P0／P1、v1.3 §4、2026-09-24 PO判断、[2026-09-25 PO判断](../../governance/decisions/po-optimal-draft-po-decisions-2026-09-25.md) | 4つの方式を下の定義どおりに区別し、駆動（ticketの種類）と混同しない。どの組み合わせでも、L1–L3と人の要件承認、V字の対、品質条件を落とさない。提供の単位ごとにリリースカンバン上の状態が分かる |
| HARNESS-L2-003 | 工程の開始・凍結・差戻し・再開・完了に必要な条件を確認できる。画面や不確定要素のある対象は、L2.5のPrototype・PoCで不確定要素を減らしてから要件へ進む。Vの左側（Forward）は原子CIの最低保証で暫定の成果を速く作り、Vの谷（L6↔L7）より右側は、結合の範囲を広げるたびに実物を対の設計と照合し、意味を保てる範囲で直してから証明を強める | HBR-P0／P3、HNFR-P3、2026-09-24 PO判断、[2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md) | 必要な合意、対成果物、検証、未解決事項が明示され、実行成功だけで工程完了にならない。成果物の状態を、前の状態の成立から推定しない。Releaseの条件を最初から持ち、終わりで初めて探さない |
| HARNESS-L2-004 | 要求から設計・テストへの対応と、変更時の再検証範囲を導出できる | HBR-P3／P9、2026-09-24 PO判断 | 上下流traceとV-pairの欠落を識別し、変更した要求が検証から落ちない |
| HARNESS-L2-005 | ticketとの関係（Forward 小・中・大、V字の対、触るコネクタ、変更の種類）と、変更の内容・layer・riskから必要な検証義務と証拠条件を導出し、PRの前に回すCIを動的に組み立てるための規則を定められる。CIの組み立てと運転はHELIX-OSの検収が行う。言語・tool・実装方式に依存しない | HNFR-P3、v1.3 §4、旧GH-FR-025、新世代CI要求候補、2026-09-24 PO判断、[2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md) | CIの段数を固定せず、特定CIやWorkerに依存せず、対象revision、oracle、expected failure、証拠、有効期限、差戻し先を説明できる。全件の実行を既定にせず、省いた検査を記録して合流先のticketで回収する |
| HARNESS-L2-006 | 外部利用者が、サービス①〜⑦の単位で提供範囲・版・必要依存・導入条件とリリースカンバン上の状態を確認し、必要なサービスを選んで導入・利用できる | 2026-09-14 PO指示、HBR-P6の提供物側条件、2026-09-24 PO判断 | HELIX内部の管理対象や運用記録を持たなくても、明示された構成で提供機能を利用できる |
| HARNESS-L2-007 | 検証フェーズで複数のプロダクトを開発し、HELIX自身のプロジェクトにも適用した結果と、Conceptの1.0土台7項目が全機構で共通に成立していること、サービス①〜⑦のすべてがそれぞれ単独で成り立ち、つなげて開発全体に使えることを含めて、HELIX-HARNESS製品群Version 1の完成を確認できる | 2026-09-14 PO指示、Vision §3／§13、2026-09-24 PO判断、2026-09-25 PO判断（7サービスすべて） | 性質の異なる対象で要求から受入・運用評価までの成立証拠を確認し、HELIX-Web等の展開前提を判定できる。Web自体の完成をVersion 1へ含めない |
| HARNESS-L2-008 | 要求エンジンは、設計パターンと接続して選択するための質問を投げる。Concept／企画L1、利用者指示と根拠から1次要求を形成し、L2.5のPrototype・PoCの結果をBackflowで還流して2次形成する。単体・接続・構成体の対象粒度を分け、要求化漏れ・企画外追加・矛盾・重複・過剰解釈・対象違い・scope／non-goal逸脱・変更影響を提示して、人間の訂正と合意により要求へ収束できる | [2026-09-15 PO発言記録](../../concept/product-boundary.md)、旧Requirement Engine／ADR-010、2026-09-24 PO判断 | 意味導出の基盤は、HELIX-JSONの各JSONの間の意味をつなぐPythonコアとし、複数製品へ適用できる（HELIX-JSONの構築とPythonコアは改善要求として扱う）。機能A、A→Bの接続、A–Cから成るシステムAの要求と成立を混同せず、出力を承認済み要求や操作権限へ自動昇格させない |
| HARNESS-L2-009 | 要求kind、対象、構成、risk、domainに合うversioned Design Templateから必要な設計義務を導き、templateが必要とする要求入力の不足を質問・要求候補としてBackflow ticketで上流へ戻せる | 2026-09-15 PO指示、旧Design Template Registry、2026-09-24 PO判断 | 初期seedを参照して設計の恣意性を抑え、templateから要求意味を自動決定せず、unit・connection・composite固有の設計と検証へ接続できる |

## Design Templateと要求backflow

[設計template system要求候補](../../helix-brain/candidates/design-template-system-requirements.md)のうち、製品の要求へtemplateを適用して
設計義務を導く部分（DST-HARNESS-001／003／004／006／007）をHARNESS-L2-009の適用待ち具体化として保持する。
汎用のtemplate・設計パターン・設計ユニット・パーツとその版・seedはHELIX-BRAINが持ち、HELIX-HARNESS-COREはBRAINとコネクタで接続する（Concept）。Forwardでは合意要求から適用templateと設計義務を導く。Backflowではtemplate必須inputの
欠落を質問、矛盾、derived requirement candidate、N/A判断候補としてHARNESS-L2-008へ返す。template本文、生成文書、
旧schemaから要求意味・人間合意を生成しない。初期seedはarchiveと実例から意味を個別採否し、適用範囲と限界を持たせる。

## ticket導出のためのコア

2026-09-24のPO判断（[decision record](../../governance/decisions/concept-requirement-po-decisions-2026-09-24.md)）により、ticketはHELIX-OSの推進が導いて発行する作業の単位とする。
ticketの定義・種類・発行方式は[HELIX-OS L2のticket節](../../helix-os/L2-requirements/governance-requirements.md#ticket)に置く。
HARNESSは、OSがINTELLIGENCEの判断を材料にticketを導くためのコアを持つ。コアは、工程の語彙・順序・停止・差戻し・完了条件と、落としてはならない工程義務（必要な層と対、成果物、oracle、人の判断が要る場所、戻し先）を、HELIX-JSONの定義と、JSONどうしの意味をつなぐPythonの意味導出コアとして提供する。
INTELLIGENCEはコアを材料に稼働中の判断（計画・配置の候補）を行い（2026-09-25 PO判断「稼働はインテリジェンス」。BRAINは汎用の設計知識を渡す）、OSはticketとその中の動的ワークフローを導いて発行し、検収はticketから必要な検証を導く。HARNESS自身はticketを発行しない。
開発方式が変わっても、コアの工程義務を落とさない。具体条件は本書の工程規則表と[GitHub上流運用モデルの条件付き工程contract](../../governance/github-upstream-operating-model.md#harnessの条件付き工程contract)に従う。
旧「要求からの開発ticket導出要求候補」はPO判断で退役した。

移管元の本文は[柱要求](../../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md)、
[要件v1.3](../../../archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md)を参照する。
上表は条件群の分離であり、移管元の全条件・数値・追補を置換済みではない。

HARNESS自身の開発にも、その対象としての要求・設計・検証が必要である。HARNESSの実装言語や画面を
利用者のプロダクトへ一律強制しない。[HELIX-OS要求](../../helix-os/L2-requirements/governance-requirements.md)は
HARNESSの工程規則を参照してWorker・CIを動かし、証拠を保存し、プロジェクトの進行を制御する。
「何を満たせば進めるか」の定義と、「実行・記録して進行を制御する」責務を分ける。
HELIX管理下への導入・更新の実行はOSの運用側で扱う。外部利用者が導入・利用できるための提供物の条件はHARNESS-L2-006が所有し、OSの内部運用要求だけで代替しない。

## 工程規則として保持する具体条件

要件v1.3 §2–4の条件を対象別に整理する。以下はHARNESSが規定し、OSが適用する条件である。
[工程要求source被覆監査](../../governance/harness-workflow-source-coverage.md)は、同監査の`scope`に列挙した工程範囲から
要求source 108 clauseを原文・digest付きの非網羅追加索引として保持する。下表への参照や索引への不在だけで
successor割当や移管完了を生成しない。

| 親要求 | 具体条件 |
|---|---|
| HARNESS-L2-002／003 | 2026-09-24のPO判断により、DiscoveryとPoCは別のticketに分け、旧S4 decideはDecide ticketへ独立させる。Researchは参考ソースを集めるだけで決定に関わらない。Scrumは開発方式であり駆動ではない。ticketの種類・発行・合流先は[OSのticket節](../../helix-os/L2-requirements/governance-requirements.md#ticket)に置き、以下の行は旧条件の保持点を残してticketの形へ書き直したものである |
| HARNESS-L2-001 | 正規pairはL1↔L12、L2↔L11、L3↔L10、L4↔L9、L5↔L8、L6↔L7。L0 charterは層外の上位根拠とし、旧物理pathの層番号を現行pairへ混入させない |
| HARNESS-L2-002 | requirements v1.3 §4の「全production styleでL1–L3と人間の要件承認を必要とし、L3凍結時にstyleを合意する」を保ち、L3までは方式によらず一律共通に進める（2026-09-25 PO判断）。L4以降は方式の定義に従う。Vモデルは、ウォーターフォールの単独製品型で、slice化しない（旧Full V）。スクラムは、最小の製品で市場投入を急ぎ、利用の記録から改善していく市場投入先行方式で、L3後にslice化する（旧Production Scrum）。利用の記録から分かった改善はBackflowで要求へ戻す。ハイブリッドは、Vモデルを土台に、1つの開発工程から多くのユニット拡張単位へ広げ、1つのコア製品と複数の製品を最後に結合する方式である。旧「V設計＋Scrum実装Hybrid（L5後にslice化）」から意味を変えた。リリースカンバンは、リリース段階をv1、v2、v3と切りながら、最終的なプロダクトゴールへ進む方式である。方式の選択や合成で品質条件を省略しない |
| HARNESS-L2-002 | `HR-FR-HYB-003`／`FR-L1-15`／`HIL-BR-28`に従い、DiscoveryとPoCは仮説・実現性を検証する、開発方式とは別のticketとする。Scrum等の開発方式のphaseとして扱わず、Decideの裁定前にproduction成果へ昇格させない |
| HARNESS-L2-002 | requirements v1.3 §4（`docs/governance/requirements-source/helix-requirements_v1.3.md:73-75,83-85`）は、開発styleを三つから適用可能な一つだけ選び、未選択、複数選択、適用条件不成立をfail-closeしていた。2026-09-25のPO判断「これらは製品特性に合わせて合成可能である」により、4つの方式を合成できるようにする。保持する点は、方式の未選択と適用条件不成立のfail-close、およびどの組み合わせでもL1–L3・要件承認・V字の対・品質条件を落とさないことである。変更する点は、複数の方式の合成を認めることである |
| HARNESS-L2-002／003 | `HR-FR-HYB-003`／`FR-L1-15`／`HIL-BR-28`と起動source `docs/governance/requirements-source/helix-requirements_v1.3.md:631`の起動条件を保ち、[OSのticket節](../../helix-os/L2-requirements/governance-requirements.md#ticket)の発行・合流先に振り分ける。要求の段階で技術的な成立性が不明なとき（`feasibility_unknown`）はL2.5のPoCを計画して発行し、その結果はBackflowで要求へ戻し、要求エンジンの2次形成を経てDecideへ進む。要求・成功条件・範囲が分からないとき、または開発の途中で検証が必要になったとき（`requirement_undefined`、`success_condition_unclear`、`design_uncertain`、開発途中の成立性の確認を含む）はDiscoveryを発行し、旧`S0 hypothesis → S1 experiment plan → S2 → S3 verify`の仮説・計画・限定した実験・検証を中に持ち、結果を発行元のticketへ戻す。Discoveryの結果が要求の意味を変える場合だけ、Backflowで要求へ戻し、2次形成とDecideを経る。旧`S4 decide`はDecideで行い、結果を採用・不採用・方針変更のいずれかにする（旧`decision_outcome`のconfirmed／rejected／pivot）。検証の成功だけで採用にしない。要求の意味に関わる裁定は、旧S4と同じく人の判断とする |
| HARNESS-L2-002／003 | `FR-L1-27`と起動source `docs/governance/requirements-source/helix-requirements_v1.3.md:632`の起動条件を保つ。`tech_decision_required`、`option_comparison_needed`、`adr_required`ではResearchを発行し、Researchは判断基準・候補・比較のための参考ソースを集めて依頼元へ返す。選定はDecideで行い、その記録（旧ADR）を、技術の選定ならL4基本設計の判断材料へ、要求に影響するなら要求へ接続する。Researchの成果物だけで選定を決まったものとしない。成立性の実験が必要になれば、要求の段階ならL2.5のPoCを、開発の途中ならDiscoveryを発行する |
| HARNESS-L2-002／003 | requirements v1.3 §4.1（L94、L96-106）／§4.2（L112-119、L138-139）に従い、スクラムの各sliceでcheckpoint triggerに該当した場合は`SR0 evidence capture → SR1 observed contract → SR2 V-layer mapping → SR3 design/refactor proposal → SR4 pair freeze and Forward reentry`を実行する。v1.3 L104-106にある4 entity、SR4 publish条件、provisional非canonicalをHARNESS条件とし、SR4 receiptなしにrelease-readyへ進めず、findingをRedesign／Design Refactor／Performance Refactor／Retrofitのexactly oneへ送る。Design Refactorでobservable behavior／public surface／DB semantics／要求に差分があれば、`HIL-BR-21`／`HIL-FR-39`／`HIL-FR-50`に従いRedesign／Retrofitへrerouteする。v1.3 L107-108が参照するentity要件と宣言oracle、およびentity要件が指すconfirmed親文書は[300行全量台帳](../../governance/scrum-reverse-source-line-inventory.md)で保持する。親文書と対になるconfirmed受入文書は[file-blob holding](../../governance/delegated-requirement-document-source-inventory.md)で保持し、後続要求PRでatom化するまでcurrent authorityへ昇格させない。Scrum Reverseはスクラムの工程条件であり、POの開発方式の定義（[2026-09-25の判断記録](../../governance/decisions/po-optimal-draft-po-decisions-2026-09-25.md)）に従い、方式を合成した場合もスクラムで進める部分に適用する（例：リリースカンバンのリリース単位の中をスクラムで作る場合、ハイブリッドのユニットをスクラムで作る場合）。旧v1.3が旧ハイブリッド（V設計＋Scrum実装）のsliceに適用していたのは、旧ハイブリッドがスクラムの実装を含んでいたためであり、この考え方を保つ |
| HARNESS-L2-003 | `HIL-BR-13`とScreen Applicability条件に従い、L2.5の適用はPrototypeとPoCで別に判定する。Prototypeは画面の有無で、PoCは画面の有無に関係なく技術的な成立性が不明かどうかで判定する（2026-09-24 PO「画面がなくてもPoCは必要な場合があるだろ」）。適用したものの結果はL2.5で要求へ還流し、合意をL3凍結前に確認する。両方とも非適用のときだけL2.5を飛ばし、L2要求は省略せず、非適用・理由・判定者・HEAD・要求への影響・再評価条件を記録する |
| HARNESS-L2-003 | `HIL-BR-13`は「UI prototypeを独立phaseにしない」としていたが、2026-09-24のPO判断でL2.5の位置を取る。L2.5では`L2要求 ↔ Prototype`を反復して操作・状態・failureを確認し、結果はBackflowで要求へ戻し、Decideの裁定なしにL3をfreezeしない。保持する点は要求とprototypeの反復と合意前freeze禁止、変更点はL2.5という位置とticket化、理由はPOの指示「画面は要求とPoCして不確定要素を減らしてから要件定義に入る」である |
| HARNESS-L2-003 | 実装は凍結済み設計の範囲に従い、L6↔L7でRed→Green→Refactorと双方向traceを閉じる。L10総合検証、L11利用者受入、L12運用評価を別の状態として扱う |
| HARNESS-L2-003 | [2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md)に従い、Vの谷（L6↔L7）では、設計の契約→実装→Red→Green→局所のRefactor→原子CIまでを閉じ、成果物をProvisional（次の結合へ渡してよい）にする。局所のRefactorは、public contract、要求、architectureの意味、stateの意味を変えない。変える必要があればBackflowする。原子CIの合格は、品質の証明、システムの成立、利用者の受入、Releaseの成立を意味しない |
| HARNESS-L2-003／004 | [2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md)に従い、右側では結合の範囲を広げるたびに、実物を対の設計と照合する（Scoped Reverse）。L8はL5詳細設計と、L9はL4基本設計と、L10はL3要件と照合する。正規のForwardで要求・設計・対・revision・ticket・成果物が分かっているときは、その範囲の「設計の想定と実物」だけを比べる。全体のReverseは、由来が不明、旧資産、設計traceの欠落、正規の設計を信用できない、大きなずれのときの復旧の手段として残す。L9では、interface、依存の向き、stateとdataの所有、transaction、失敗の伝わり方、retry、timeout、冪等性、結合度、責務の重複を見る |
| HARNESS-L2-003／004 | [2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md)に従い、振る舞い・契約・要求を保てる変更は右側でRefactorする。詳細の契約が違えばL5へ、architectureや境界が違えばL4へ、要求や受入が違えばL3／L2へ、製品の価値が違えばL1へBackflowし、右側が左側のauthorityを黙って書き換えない。これは`HIL-BR-21`／`HIL-FR-39`／`HIL-FR-50`のRedesign／Retrofitへのrerouteを保つ。小さな境界のRefactorは今のForward ticketの中で行い、独立した大きな構造の改善、横断する改善、architecture全体の整理はRefactor／Design-refactor／Performance-refactorのticketにする。通常の照合ではticketを発行しない。設計と実装の明らかなずれ、由来の欠落、同種のfindingの再発、性能の退行、障害後の恒久対策、Scrum Reverseのcheckpoint、大きな設計の退行ではReverse ticketを発行する |
| HARNESS-L2-003 | [2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md)に従い、成果物の状態をWorking→Provisional→Integrated→Verified→Accepted→Release-eligible→Deployed→Observedと進める。Provisionalは原子CI、Integratedは境界の照合・Refactor・結合の証明、VerifiedはL10のシステムの証明、AcceptedはL11の受入、Release-eligibleはRelease Portの必須条件、Deployedは対象環境への配備、ObservedはL12の運用評価を通ったことを表す。単体と結合の証明はシステムの証明の証拠として積み上げ、システムに固有の義務との差分を確かめずにVerifiedとせず、L10の合格でL11を自動で合格にしない。L11で意味の差が見つかれば、コードを直接直さず、Backflowで要求へ戻して必要なForwardをやり直す |
| HARNESS-L2-003 | [2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md)に従い、開発の開始時からRelease Portを持つ。Release Portには、必要な証明、成果物の識別、対象環境、依存、securityの条件、rollback、配備の条件、受入の状態を置き、各工程で満たしていく |
| HARNESS-L2-004 | 要求変更・public contract変更・設計trace欠落等の際は、影響する設計と対検証へ差し戻す。Scrumの実装事実もreview・release合流前に設計資産へ戻し、必要なpair凍結を確認する |
| HARNESS-L2-008 | [2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md)に従い、単体・接続・構成体は、それぞれ別の要求identityとして成立の状態を持つ。下の構造の成立は、それを含む上の構造の成立の証拠として集める。上の構造の成立は、下の証拠がそろい、上の構造に固有の義務も満たしたことを確かめてから導き、下の成立だけで無条件に導かない。構成体を単体と接続へ分解しても、構成体に固有の目的、振る舞い、failure、制約、受入を失わない。分類が誤っていたと実装・Reverse・検証・運用の観測から分かれば、下流で書き換えずにBackflowで要求の形成へ戻す。再分類では、元の要求identityと種類、新しい種類の候補、根拠のfinding、対象revision、影響する設計と検証、既存の成果を再利用できるかを追い、元のidentityを黙って書き換えない |
| HARNESS-L2-009 | [2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md)に従い、単体・接続・構成体それぞれに固有の設計義務を導く。単体は内部の振る舞い・state・failure等、接続はinterface・向き・所有・順序・retry・timeout・冪等性・部分的なfailure等、構成体はarchitecture・端から端までの振る舞い・システムの不変条件・復旧・非機能・運用等である。下の構造の設計を束ねただけで上の構造の設計義務を満たしたとしない。構成体を分解するときは、単体の義務、接続の義務、構成体に固有の義務を分けて持ち、構成体に固有の義務が空のときも空である根拠を確かめる |
| HARNESS-L2-004 | [2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md)に従い、変更の影響は、要求・設計・検証の間のrelationから導く。証拠と影響はrelationを通じて上へ伝えるが、変更された下の構造の成立の状態を、上の構造へそのまま伝えない（単体の変更から接続や構成体をfailedにしない）。影響の状態をAffected、Unaffected、Unknownで区別し、成立の状態と混同しない。UnknownをUnaffectedとして扱わず、再検証の結果によってだけ、その構造の成立の状態を改める。旧AAFD（`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:20-25,42`）の、影響を受けた集合だけを扱いunknownを補完しない条件を保ち、単体・接続・構成体のrelationへ当てる |
| HARNESS-L2-005 | [2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md)に従い、検証の義務を構造の粒度ごとに別に導く。単体は単体の検証、接続は境界・結合の検証、構成体はシステムの検証とし、上の構造は固有のoracle、expected failure、証拠の条件を持つ。下の証明は上の証明の証拠として積み上げ、上の構造では、固有の義務との差分だけを証明する（構成的保証と差分証明）。すべての単体の合格は接続の前提の証拠であり、接続に固有の義務を満たして接続の合格となる。構成体も同じとする。下の証明と組み合わせの契約がそろい、未解決の構成体に固有の義務がないことをHARNESSの契約で示せるときは、構成体の合格を機械的に導いてよく、大きな端から端までの検証をやり直さない。構成体に固有の非機能（例：システム全体の応答時間）のように下の証明で表せない義務は、別に証明する |
| HARNESS-L2-005 | [2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md)に従い、PRの前に回すCIは、ticketとの関係から決める。Forward 小は原子CI、Forward 中は境界の証明（触ったコネクタの契約を含む）、Forward 大はシステムの証明を基本とする。認証、DBのmigration、security、releaseの変更のように危険度の高い変更は、小さな変更でも上の証明を早めに求める。mainの健全性は、変更がticketの範囲を超えていないかの確認で保ち、範囲の外への変更があれば止める。merge直後の全件実行と夜間の補完は既定にしない。省いた検査は記録し、合流先のticket（Forward 小は中か大、中は大）で回収する。回収されないまま残っていれば、Release Portで止める。影響が広がる密結合が見つかったら、その変更で影響する接続・構成体の検査をそのPRで広げ、成立するまで合流させない。そのうえで、CIを恒常的に重くして守らず、設計の不具合としてDesign-refactorを発行して結合を切る。検査をすり抜けて後で見つかった失敗は、HELIX-LABOが振り返り、原子CIやコネクタの契約が足りているかを評価して返す |
| HARNESS-L2-005 | 旧GH-FR-025（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/github-atomic-development-requirements.md:29,52-62`）は、PRでは影響範囲だけを検査し、省いた検査の集合を記録して、main合流の直後に全件で回収し、夜間に欠落を補完し、危険度の高い変更は最初から全件にしていた。保持する点は、影響する範囲だけを選ぶこと、省いた検査を記録して黙って捨てないこと、危険度の高い変更を軽い検査で通さないことである。変更する点は、範囲を決める元を変更の差分からticketへ移すこと、回収の場所をmerge直後の全件実行から合流先のticketへ移すこと、夜間の補完をやめることである。理由は、POの「既存の方式はちょっと推進が遅いから」と、危険度の高い変更の原因が密結合だったことである |
| HARNESS-L2-005 | 検証条件には対象要求revision、成果物、入力、oracle、expected failure、実結果、証拠の有効期限、差戻し先を含める。required／conditional／informational／N/Aを理由付きで区別し、unknownをskipへ変換しない。CI成功・画面表示・文書登録だけを利用者受入や全工程完了の証拠にしない |

HARNESSの規則が定める「未充足なら進行不可」を、OSがWorker停止・再割当・CI・記録・表示へ適用する。
具体的なWorker起動方式やCIサービス名はこの工程規則の所有対象にしない。

## 新世代CIへ渡す検証契約

[新世代CI要求候補](../candidates/next-generation-ci-requirements.md)の
NCI-HARNESS-001..004をHARNESS-L2-004／005の適用待ち具体化として保持する。HARNESSはCI workflowを所有せず、
layer、V-pair、artifact class、変更種別、riskから検証義務を定義する。profile生成・runner・queue・cache・retry・
provider接続・run監視はHELIX-OSの責務である。

上流意味review、設計検証、実装test、merge admission、利用者受入、release、運用評価を一つの`CI green`へ畳み込まない。
旧CIのjob集合やworkflow名を新契約の分母にせず、承認された上流revisionから必要なoracleを降ろし直す。
本節は要求案であり、既存CIの変更・実行・適格化を行わない。

## 旧資産退役に適用する工程条件

[旧資産退役要求候補](../../governance/candidates/legacy-asset-retirement-requirements.md)の
LAR-HARNESS-001..003をHARNESS-L2-003／004／005／006の適用待ち具体化として保持する。退役前に旧資産の要求、
behavior、設計、検証、consumerと後継上流IDを照合し、必要なpair、oracle、expected failure、利用者受入、差戻し条件を
確認する。archive資料をcurrent authority・実行可能成果・検証済み能力にせず、旧実装とのparityやdual-greenを要求しない。
本節では旧資産を移動・削除・停止しない。

変更不要な既存資産は、再実装を必須にしない。HARNESS-L2-004／005／006では、archive manifestを母集団として、
完全一致再利用と意味再導出を区別する。完全一致再利用には、同じ製品責務と要求revisionで意味・interface・権利・
security・consumer・実行境界が変わらないこと、source／target digestが一致すること、必要なpairとoracleを満たすことを
要求する。いずれかが不明ならコピー済み・移管済みと扱わず、意味再導出または未判定へ戻す。

## 運用品質を落とさない工程条件

[旧NIO候補](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/infrastructure-operations-quality-l1-request-candidates.md)は、
[新世代対応表](../../governance/audits/source-rebaseline/new-generation-operational-quality-source-crosswalk.md)で
HARNESS、HELIX-OS、個別製品へ再分類した。旧Issue owner、既存計測・logging・incident engineの再利用は継承しない。

HARNESS-L2-003／004／005では、対象製品の可用性、信頼性、性能、容量、費用、security、privacy、運用、保守、
回復、observabilityについて、適用・非適用・unknown・決定ownerをL2で確認し、設計・検証・L12観測・再要求化へ
同じ要求revisionで接続する。designed、implemented、verified、observed、operatedを別状態とし、文書・実装・CIの
存在だけで後続状態を成立させない。

HARNESSは品質値、対象環境、RTO／RPO、保持期間、予算、blast radiusを全製品へ固定しない。それらは各製品の
要求とrelease条件で承認する。HELIX-OSによる監視・incident・復旧の実行成功も、製品利用者の受入や運用成立を代替しない。
本節は工程条件の要求案であり、計測、故障注入、CI、復旧、自動修復を実行しない。

## 外部提供の条件

HARNESS-L2-006では、提供機能、構成版、artifact、必要依存、導入・更新条件を対応づける。
利用者が選択した機能を明示された条件で利用でき、非提供機能・未対応条件も確認できることを要求する。
HELIX内部のWorker割当、学習履歴、CI運転、プロジェクト群の状態を、説明のない必須依存として持ち込まない。
提供物が必要とする実行接続は明示し、内部機構の一括同梱を条件にしない。
本要求は外部利用が成立する条件であり、配布先の切替・公開・リリース承認を代替しない。

## 要求形成・合意・反復の工程条件

[要求エンジンPythonコア要求候補](../candidates/requirement-engine-python-core-requirements.md)を
HARNESS-L2-008の適用待ち具体化として保持する。要求意味の抽出、構造化、質問、semantic diff、trace、影響候補は
HARNESSが所有する。HELIX-OSは入力・出力・訂正・採否・改善eventを登録、実行、監視するが、要求意味を複製しない。
Python coreはDB、Git、GitHub、repository、credentialへ直接writeしない。HARNESSは外部consumerも使える出力schema、
対象revision、stale、重複、prohibited payloadの再検証契約を提供し、OSはその契約に従うtransactional consumerとして登録する。
transactional boundaryとwire formatの実装技術はL3以降で選定する。
指示と抽出結果の齟齬は強化材料として保持するが、生会話、Issue、logやエンジン出力を要求正本・承認・学習許可へ変換しない。
単体要求、対象間の接続要求、複数要素から成る構成体要求を別identityで持ち、包含・接続・依存・制約・検証relationで結ぶ。
単体の成立から接続、統合、製品全体の成立を推定せず、組合せ固有のbehavior、failure、回復、全体制約と受入を要求する。

[AVS候補](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/authority-vocabulary-requests.md)、
[RFA候補](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirement-formation-scoped-admission-requests.md)、
[DGH候補](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/design-grounding-human-convergence-requests.md)から工程条件を分離する。
RFAは候補承認済み・正本化待ち、AVS／DGHはdraftであり、本書への記載で採用状態を変更しない。
OS側が判断記録・反復実行を所有し、HARNESS側は以下の進行条件を所有する。

| 親要求 | 出典 | 工程として満たす条件 |
|---|---|---|
| HARNESS-L2-003 | AVS-BR-001／003、RFA-BR-02 | 相談・依頼・採択・要件承認・操作認可を区別してscopeとrevisionを照合する。委任済み意図の技術的具体化は反復承認を必須にせず、未委任の意味・権限変更は別判断を要する |
| HARNESS-L2-003／005 | AVS-BR-004 | 指示の存在を技術的正しさ・review・完了の証拠にせず、独立した技術理由と反証可能な検証で進行条件を満たす |
| HARNESS-L2-004 | RFA-BR-03、DGH-BR-02 | 変更の影響要求・設計・対検証を再確定し、影響しない有効作業を一律失効させない |
| HARNESS-L2-003／005 | RFA-BR-01、DGH-BR-01／03 | 目的・前提・外部実例・既存資産・比較根拠と、受容済みの軸・未解決findingを確認する。客観品質と人間の受容を相殺せず、両者に必要な確認を残す |

これらを別の要求形成engineや承認台帳として実装することは要求しない。人間反応の記録・解釈分離・履歴管理はOS側へ接続する。

## 管理変更を製品Forwardへ戻す条件

[旧Management Scrum policy](../../../archive/legacy-generation-2026-09-14/root/docs/governance/management-scrum-product-forward.md)は、
[新世代対応表](../../governance/audits/source-rebaseline/new-generation-management-change-source-crosswalk.md)で再採否する。
HARNESS-L2-003／004では、管理上の観測や改善判断から製品要求を直接変更せず、意味が変わる最上流の対象層へ
変更候補を戻し、差戻し・再合意・pair再凍結・再検証の必要範囲を決める。
HARNESS-L2-004の無損失変更contractは、入力source atom集合を当該要求へ保持する集合、別の生存中候補へ残す集合、対象revision付き人間decisionで変更・retireする集合へ完全分割し、未計上atomを0にする。HELIX-OS管理はこの被覆receiptと要求候補を仮登録するが、仮登録から要求採用・実装許可を生成しない。

管理上の緊急性、Issue作成、Project状態、既存CI成功を、V-pair、上下trace、検証、利用者受入の省略理由にしない。
旧Management Scrum policyにある管理作業の`S0..S4`、Scrum運用ceremony、旧adapterをHARNESSの固定workflowとして継承しない。これはrequirements v1.3 §4.1の製品開発用Scrum Reverse（SR0–SR4、release-ready条件、finding routing）を外す意味ではない。本節は工程条件の要求案であり、
現行AGENTS／CLAUDE、hook、Issue template、workflow、CIを変更・実行しない。
旧Scrum Operation候補のDoR／DoD、sprint review等も固定ceremonyやV-model layerとして採用しない。
着手・完了・受入・改善還流に必要な意味だけをHARNESS-L2-003／005へ再採否し、管理状態の保存と表示はOSへ委ねる。

## 限定修復に適用する検証条件

[旧Bugbot候補](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-requests.md)は、
[新世代対応表](../../governance/audits/source-rebaseline/new-generation-bounded-repair-source-crosswalk.md)で再採否する。
HARNESS-L2-005では、自動・手動を問わず修復後に必要な要求revision、oracle、expected failure、独立検証、
consumer受入、差戻し条件を維持する。必須test削除、閾値緩和、scope拡張、意味digestの無審査更新でgreen化しない。
修復器の登録や旧CI自己修復成功は検証義務・操作許可を代替しない。修復の検出から実行までは、2026-09-25 PO判断により[HELIX-INTELLIGENCEの候補](../../helix-intelligence/candidates/audit-bounded-repair-requirements.md)へ移した。

## 構造改善に適用する変更条件

[旧Refactoring Trigger候補](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/refactoring-trigger-admission-requirements.md)は、
[新世代対応表](../../governance/audits/source-rebaseline/new-generation-refactoring-trigger-source-crosswalk.md)で再採否する。
HARNESS-L2-004／005では、構造改善が要求・public contractの意味を保存するか、影響する上流・設計・V-pair、
必要な再検証、差戻し先を確認する。意味変更、実装故障、外部環境変化を一つのrefactoring routeへ丸めない。
旧候補にはL1利用要求がないため、新世代の利用者価値が確定するまでL3 triggerを採用しない。

## Worker capacityに依存しない検証条件

[旧Three Lane候補](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/three-lane-capacity-profile-requests.md)は、
[新世代対応表](../../governance/audits/source-rebaseline/new-generation-worker-capacity-source-crosswalk.md)で再採否する。
HARNESS-L2-005では、作成側と検証側の独立性、対象revision変更時の再検証、証拠の有効性を、provider名、
固定worker数、PR、Merge Train、既存CIに依存せず定める。登録capacityや並列数を独立検証・受入済み成果の証拠にしない。

## Security要求に適用する工程条件

[旧SEA候補](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/security-engagement-authority-requests.md)は、
[新世代対応表](../../governance/audits/source-rebaseline/new-generation-security-engagement-source-crosswalk.md)で再採否する。
HARNESS-L2-003／004／005では、対象製品が承認した保護対象、data、操作、環境、network、severity、開示条件から、
設計・threat・verification・独立review・利用者受入へ接続する。推定、再現、検証、修復、再検証、運用成立を別状態にし、
旧broker、provider、CI greenで相殺しない。特権操作と資格情報（credential）の方針・authority（認可、範囲、失効、隔離）はHELIX-SECURITYが持ち、HELIX-OSはそれに従って特権作業のticketと割当てを運転する（[Concept](../../concept/helix-concept.md)の機構の表、[2026-09-26のSECURITY判断記録](../../governance/decisions/security-l1-idea-po-decisions-2026-09-26.md)）。

## 利用許諾を確認できる提供条件

[旧Commercial License候補](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/helix-commercial-license-requirements.md)は、
[新世代対応表](../../governance/audits/source-rebaseline/new-generation-license-distribution-source-crosswalk.md)で再採否する。
旧「HELIX全体」の一括商用方針を採用せず、HARNESS-L2-006では外部提供するHARNESSの範囲、artifact、適用許諾版、
第三者通知、導入・更新・復旧条件を利用者が確認できる要求だけを候補として保持する。

有償・評価・SaaS・OEM・再配布、所有権、学習利用、紹介表示等の具体条件は未決であり、正式な事業・法務判断を
本要求案から生成しない。候補merge、CI、配布成功を契約発効にせず、現行LICENSEと過去版の許諾を変更しない。

## AIへ渡す工程契約

[AI可読上流文書の要求候補](../candidates/ai-readable-authority-requirements.md)の
AIDOC-HARNESS-001..003をHARNESS-L2-001／003／005の適用待ち具体化として保持する。AIは対象HARNESS版、layer、
V-pair、artifact、required oracle、差戻し・完了条件を承認済みsourceから取得し、生成要約から該当する正本revisionへ
逆参照できなければならない。未承認、stale、compatibility、historical、unknownをcurrent契約と区別する。

HARNESSのAI向け文書へWorker inventory、provider session、CI運転、HELIX内部memoryを混入させない。
旧Core Reads、AGENTS／CLAUDE、promptを新世代のbaselineにせず、物理path、manifest schema、生成器は上流確定後に
L3／L10から導出する。本節では現行AI文書、hook、adapter、runtimeを変更しない。

## 開発投資候補から採る工程意味

[旧INV-001..072](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/development-investment-stage-directives-intake_v1.0.md)は、
[新世代対応表](../../governance/audits/source-rebaseline/new-generation-investment-candidate-crosswalk.md)で全件分類した。
HARNESS-L2-003／004／005／006では、到達可能性、変更影響、検証義務、反例、再資格、提供依存等の工程意味だけを
再採否する。旧P0..P4、既存CI、prepare、cache、shard、fixture、warm環境、test generatorを要求や実装順として採用しない。
INV番号、投資priority、費用削減見込みを、利用者要求・合意・検証済み能力の代替にしない。

## 提供構成と再現性の条件

[FRS v0.2候補](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md)からHARNESSの提供物側の条件を分離する。
v0.2候補の承認記録は旧RLS・既存CI・DevOS・Cursorを含む旧製品境界に対するものであり、新世代へ継承しない。
以下は[新世代対応表](../../governance/audits/source-rebaseline/new-generation-release-composition-source-crosswalk.md)で
再採否を待つ意味候補であり、本対象別L2の合意・IR admission・公開を代替しない。

| 親要求 | 出典 | 提供物・工程の条件 |
|---|---|---|
| HARNESS-L2-006 | FRS-BR-001／002／003 | 提供する機能単位のcontract・source・依存・受入・artifact・復旧先へ辿れ、構成の収載・除外を特定できる。未指定・未適格な機能を上位の提供構成へ暗黙収載せず、各構成階層の版と成熟度を区別する。旧Slice／Module／Bundle名とchannel enumは未採択 |
| HARNESS-L2-004／005 | FRS-BR-004／007 | 要求revisionと変更箇所から影響する構成・検証条件へ辿れる。所有・実装・接続・検証の欠落、unknownやambiguousを「影響なし」にしない |
| HARNESS-L2-006 | FRS-BR-005 | 同一source・registry・profileから同一manifestとartifactを再現でき、clean consumerで利用できる。失敗時の復旧対象は適格な直前版または明示replacementとして識別できる |
| HARNESS-L2-005／006 | FRS-BR-009 | 機能単位の必要な安全依存を明示し、組合せの統合・更新・復旧・L12運用検証を個別機能の成功と区別する |

[提供構成追補](../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-release-crosswalk.md)のPKG-D01..13は、
[新世代Concept・Package対応表](../../governance/audits/source-rebaseline/new-generation-concept-package-source-crosswalk.md)で
再採否を待つ選択viewの候補であり、
正式なModule／Sliceのidentityや公開版を生成する根拠にしない。growth-offでも通常開発が成立すること、
公開版から構成・source・artifact・検収証拠へ辿れること、未採択Visionを必須依存にしないことを候補条件として保持する。
文書版・Visionの節目・公開SemVerは別軸である。内部学習機構をHARNESSへ一括同梱する条件へ戻さない。
構成の再編判断、生成・配布・復旧の実行はOS側が所有する。旧CIの先行利用は新世代では採用せず、
要求整理後に承認済み上流から新しいCI要求・設計・検証を導出する。
PKG-D01..13の名前・個数、旧Module対応、Lite／Full、`8+1`構成をHARNESSの固定提供分母にしない。

## L3候補との境界

AVS／RFA／DGH／FRSの既存L3候補とID範囲は[OS側の接続表](../../helix-os/L2-requirements/governance-requirements.md)を参照する。
これらの文書には工程条件と実行・管理機構が混在している。HARNESS-L2-003／004／005／006の具体化として参照する場合は、
提供する条件・契約とOS内部の実行方法を分け、候補文書全体をHARNESSの実装仕様へ一括採用しない。
対象別L3の全件対応・凍結は未完了であり、リンクの存在を完了証拠にしない。

## ticket導出コアの詳細IDと分担

本節は既存本文の条件群を追跡するための未採否の整理案である。本文の意味・ticket種類・発行・合流先を追加・削除しない。詳細IDは主要求の連番と分け、既存のHXT-RQと衝突しない接頭辞を使う。単体は一つの機構で閉じる要求、接続は機構どうし、またはticket種類どうしをつなぐ連続処理、構成体は複数機構にまたがる全体である。ticketの対象の粒度（Forward 大・中・小）とは別であり、種類の定義一組を単体として扱う。

「システム」は要求としてシステムへ吸収する部分、「運用」は既存本文・旧source・PO判断にある入力や判断を補う部分を示す。運用の新しい承認手順・周期は作らない。実装済み・受入済みを表さない。各IDの成功条件・反例は対のL11、出典と旧ID対応は[再整理監査](../../governance/audits/source-rebaseline/ticket-id-redo-audit-2026-09-26.md)に置く。

| 詳細ID | 粒度 | 親主要求 | 対象とする既存の条件群 | システムへ吸収する部分 | 運用で補う部分 |
|---|---|---|---|---|---|
| HXT-CORE-01 | 単体 | HARNESS-L2-002／HARNESS-L2-008 | 「ticket導出のためのコア」の工程契約全体。 | HARNESSが工程語彙・順序・停止・差戻し・完了条件と、層と対・成果物・oracle・人の判断箇所・戻し先を、HELIX-JSONの定義とPythonの意味導出コアとして提供する。開発方式が変わっても義務を落とさない。 | 人の判断を要する場所と要求・工程の適用根拠を入力する。意味未決をコアの自動推定だけで確定しない。 |
| HXT-CORE-02 | 接続 | HARNESS-L2-002／HARNESS-L2-008 | HARNESSのコア提供からOSのticket発行・検収への接続。OS側の構成体はHXT-SYS-01。 | INTELLIGENCEはコアを判断材料にし、OSの推進がticket・動的ワークフローを導いて発行し、検収が必要検証を導く。HARNESS自身は発行しない。 | 計画・配置の案の根拠と人の判断を提供する。BRAINの汎用設計知識とINTELLIGENCEの稼働中の判断を分ける。 |
