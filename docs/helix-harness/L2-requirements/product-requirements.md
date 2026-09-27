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
[工程要求source被覆監査](../../governance/legacy-migration/harness-workflow/harness-workflow-source-coverage.md)は、同監査の`scope`に列挙した工程範囲から
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
| HARNESS-L2-002／003 | requirements v1.3 §4.1（L94、L96-106）／§4.2（L112-119、L138-139）に従い、スクラムの各sliceでcheckpoint triggerに該当した場合は`SR0 evidence capture → SR1 observed contract → SR2 V-layer mapping → SR3 design/refactor proposal → SR4 pair freeze and Forward reentry`を実行する。v1.3 L104-106にある4 entity、SR4 publish条件、provisional非canonicalをHARNESS条件とし、SR4 receiptなしにrelease-readyへ進めず、findingをRedesign／Design Refactor／Performance Refactor／Retrofitのexactly oneへ送る。Design Refactorでobservable behavior／public surface／DB semantics／要求に差分があれば、`HIL-BR-21`／`HIL-FR-39`／`HIL-FR-50`に従いRedesign／Retrofitへrerouteする。v1.3 L107-108が参照するentity要件と宣言oracle、およびentity要件が指すconfirmed親文書は[300行全量台帳](../../governance/legacy-migration/delegated-document/scrum-reverse-source-line-inventory.md)で保持する。親文書と対になるconfirmed受入文書は[file-blob holding](../../governance/legacy-migration/delegated-document/delegated-requirement-document-source-inventory.md)で保持し、後続要求PRでatom化するまでcurrent authorityへ昇格させない。Scrum Reverseはスクラムの工程条件であり、POの開発方式の定義（[2026-09-25の判断記録](../../governance/decisions/po-optimal-draft-po-decisions-2026-09-25.md)）に従い、方式を合成した場合もスクラムで進める部分に適用する（例：リリースカンバンのリリース単位の中をスクラムで作る場合、ハイブリッドのユニットをスクラムで作る場合）。旧v1.3が旧ハイブリッド（V設計＋Scrum実装）のsliceに適用していたのは、旧ハイブリッドがスクラムの実装を含んでいたためであり、この考え方を保つ |
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

## リリース単位の要求とパック境界

本節は[2026-09-26のPO判断](../../governance/decisions/core-first-pack-po-decisions-2026-09-26.md)（本体で機能を成立させ、検証済みのパックを作り、それをWeb版の製品として編成する）に従う未採否の候補である。Conceptの「HELIX-HARNESS」の節（サービス①〜⑦を単独で成立・利用・リリースできる単位とし、要求を単体・接続・構成体に分ける）と、HARNESS L1冒頭の「個別サービスと接続の受入差分は要求対応表へ送る」を受け、HARNESS-L2-001〜009が横断の観点で持つ条件を、リリース単位ごとの単体要求、受渡しの接続要求、統合した製品の構成体要求として束ね直す。

束ね直しは既存条件の所在を移さない。各IDの「束ねる既存の条件」に挙げた本文は元の節に残り、その意味をここで変えない。新しく加えるのは、パックの境界（HARNESS-L2-010）と、画面・作業環境から切り離して呼べる条件（HARNESS-L2-011）、ProvisionalからAcceptedまでの検証と受入の契約をコアの単位へ割り当てること（HARNESS-L2-022）、各リリース単位が受け取るもの・提供するもの・保証すること・単独で成り立つための依存の明示である。旧HELIXとの対応は判断記録の「旧HELIXとの対応」に置く。本節から採択、L3承認、実装許可、Web製品の要求を生成しない。

| L2要求 | 粒度 | 親L1候補 |
|---|---|---|
| HARNESS-L2-010 | 単体（全リリース単位に共通の境界） | HARNESS-L1-005／HARNESS-L1-008 |
| HARNESS-L2-011 | 単体（全リリース単位に共通の呼出し条件） | HARNESS-L1-005 |
| HARNESS-L2-012 | 単体（① 画面プロト／PoC） | HARNESS-L1-005／HARNESS-L1-007／HARNESS-L1-006 |
| HARNESS-L2-013 | 単体（② 要件定義） | HARNESS-L1-005／HARNESS-L1-007／HARNESS-L1-008／HARNESS-L1-001 |
| HARNESS-L2-014 | 単体（③ 設計） | HARNESS-L1-005／HARNESS-L1-007／HARNESS-L1-009／HARNESS-L1-001 |
| HARNESS-L2-015 | 単体（④ 開発） | HARNESS-L1-005／HARNESS-L1-007／HARNESS-L1-001／HARNESS-L1-004 |
| HARNESS-L2-016 | 単体（⑤ リファクタリング） | HARNESS-L1-005／HARNESS-L1-007／HARNESS-L1-003 |
| HARNESS-L2-017 | 単体（⑥ リリース） | HARNESS-L1-005／HARNESS-L1-007／HARNESS-L1-004 |
| HARNESS-L2-018 | 単体（⑦ 運用保守） | HARNESS-L1-005／HARNESS-L1-007／HARNESS-L1-001 |
| HARNESS-L2-019 | 単体（入口：フルリバース） | HARNESS-L1-003／HARNESS-L1-005 |
| HARNESS-L2-020 | 接続（リリース単位の受渡し） | HARNESS-L1-003／HARNESS-L1-008 |
| HARNESS-L2-021 | 構成体（統合したHELIX-HARNESS） | HARNESS-L1-007／HARNESS-L1-008 |
| HARNESS-L2-022 | 単体（コア：検証と受入の契約） | HARNESS-L1-005／HARNESS-L1-001／HARNESS-L1-004 |

012〜018の親は、外部提供（HARNESS-L1-005）とVersion 1の完成範囲（HARNESS-L1-007）に加えて、各サービスの機能に対応する既存のL1を示す。022はコアの単位であり、外部提供（HARNESS-L1-005）、V-pairで運用評価まで構成すること（HARNESS-L1-001）、検証義務・証拠・差戻し条件（HARNESS-L1-004）を親とする。L1の本文は変えない。

### HARNESS-L2-010 パックの境界

利用者は、HARNESSの能力を、入力・出力・必要な依存・検証範囲・版が明確で、交換・更新できる能力のまとまり（パック）として識別し、検証済みのパックを組み合わせてリリース単位を成立させられる。

- パックは関数やフォルダの単位ではない。一つのbehavior contract、または分けると意味を失う密結合したcontractのまとまりとする。
- 各パックは、入力の契約、出力の契約、必要な依存（他のパック、部品、コア、外部の実行接続）、検証範囲（単体として証明する義務とoracle）、版を宣言する。宣言のない依存を実行時に暗黙に使わない。
- パックは所属するリリース単位（サービス①〜⑦）、部品、コアのいずれかに所有される。一つのパックを二つのリリース単位が所有しない。複数のリリース単位から使う能力は部品またはコアに置く（Conceptの「サービスを支えるもの」）。
- リリース単位へ収めるパックと収めないパックを明示する。未検証・未適格のパックを暗黙に収めない。パックの版と成熟度、リリース単位の版、統合した製品の版を別に持ち、パックの昇格だけで上位を昇格させない。上位の未完の部分で、適格なパックを隠さない。
- 同じ入力と版から同じパックの成果物を再現でき、失敗時は直前の適格な版または明示した置換えへ戻せる。
- 全部を一つの巨大なパックへ戻さない。パックが大きくなり交換・更新できなくなったら、Design-refactorで分ける（HARNESS-L2-005の密結合の扱い）。
- 束ねる既存の条件：「提供構成と再現性の条件」のFRS-BR-001／002／003／005／009、HARNESS-L2-008の単体・接続・構成体の区別。

### HARNESS-L2-011 画面・作業環境から切り離して呼べる条件

利用者は、各パックを、特定の画面や作業環境に依存しない呼出しで使える。これは、後でHELIX-Web等の別の利用者側から使えなくなる作り方を避けるための条件であり、Webの要求・設計を本要求から導かない。

- **入出力**：特定の画面、特定のGUI、特定のローカルpath、特定のAI provider、特定のCI製品を前提にせず、宣言した入出力の契約で呼べる。画面は入出力を使う側に置く。
- **版・依存**：呼出しは、能力名、契約の版、必要な依存の版を持つ。未対応の版を黙って読み替えない（Conceptの1.0土台「接続契約と版」）。
- **権限の受渡し**：パックは、呼出し元が渡した権限と隔離の単位（project、tenant、環境）の範囲で動く。パックを使うことを、HELIX本体の稼働DB、鍵、内部統制を呼出し元と共有することにしない。権限の方針とauthorityはHELIX-SECURITYが持つ。
- **進行・結果・証拠**：進行の状態、結果の状態、証拠を、相関IDとともに呼出し元へ返す（Conceptの1.0土台「ログと証拠」）。結果の保存と表示は呼出し元が行う。
- **停止・再開**：途中で止められ、冪等キーと記録した途中の状態から再開でき、期限切れを成功にしない（Conceptの1.0土台「接続契約と版」「構成版の固定と切戻し」）。
- 束ねる既存の条件：Conceptの1.0土台7項目、HARNESS-L2-006の「HELIX内部の管理対象や運用記録を持たなくても、明示された構成で提供機能を利用できる」。

### HARNESS-L2-012 ① 画面プロト／PoC（単体）

- **受け取るもの**：合意前のL2要求（1次形成）と、画面の有無、技術的な成立性の不確定要素の判定。
- **提供するもの**：画面の試作（HTML）、PoCの結果（成立性の証拠）、要求へ戻す候補（Backflow）。
- **保証すること**：PrototypeとPoCを別に判定する。結果をBackflowで要求へ戻し、2次形成とDecideを経るまで要件へ進めない。非適用のときは非適用・理由・判定者・HEAD・要求への影響・再評価条件を残す。試作とPoCの成果をDecideの裁定前にproductionの成果へ昇格させない。
- **単独で成り立つための依存**：試作の対象範囲を示す要求の記述だけで使え、②〜⑦を必須にしない。要求の記述は②の出力でも、HARNESS-L2-019で持ち込んだ既存の文書でもよい。
- 束ねる既存の条件：HARNESS-L2-001のL2.5、HARNESS-L2-003（`HIL-BR-13`とScreen Applicability、L2.5の位置）、HARNESS-L2-002／003（PoCとDiscoveryの起動条件）。

### HARNESS-L2-013 ② 要件定義（単体）

- **受け取るもの**：Concept・企画（L1）、利用者の指示と根拠、①の結果（適用したとき）。
- **提供するもの**：要件定義の書類。L2要求とL11受入の対、L3要件とL10総合検証の対を、人の承認を待つ形で渡す。
- **保証すること**：1次形成と、①の結果を戻した2次形成を区別する。欠落・企画外追加・矛盾・重複・過剰解釈・対象違い・scope／non-goal逸脱・変更影響を提示する。単体・接続・構成体を別の要求identityで持つ。人の承認なしに要件を確定しない。出力を承認済み要求や操作権限へ自動昇格させない。
- **単独で成り立つための依存**：要求エンジン（部品）とコアを使う。①、③〜⑦を必須にしない。
- 束ねる既存の条件：HARNESS-L2-008、HARNESS-L2-001、「要求形成・合意・反復の工程条件」。

### HARNESS-L2-014 ③ 設計（単体）

- **受け取るもの**：承認済みのL3要件と工程契約。
- **提供するもの**：設計書（L4基本設計、L5詳細設計、L6の契約）と、対になる検証の設計（L9、L8、L7）。
- **保証すること**：要求のkind・対象・構成・risk・domainに合うDesign Templateから設計義務を導く。単体・接続・構成体それぞれに固有の設計義務を分けて持ち、下の設計を束ねただけで上の義務を満たしたとしない。templateが必要とする要求入力の不足は、質問・要求候補としてBackflowで上流へ戻す。templateから要求の意味を決めない。
- **単独で成り立つための依存**：Design Template（部品）、コア、BRAINとのコネクタを使う。承認済みの要件は②の出力でも、HARNESS-L2-019で持ち込んだ既存の要件でもよい。
- 束ねる既存の条件：HARNESS-L2-009、「Design Templateと要求backflow」、HARNESS-L2-001の対。

### HARNESS-L2-015 ④ 開発（単体）

- **受け取るもの**：凍結済みの設計（L6の契約、L5の詳細設計）と対の検証。
- **提供するもの**：ミスなく作られたコードと、設計・テストとの双方向trace。成果物の状態はProvisional（次の結合へ渡してよい）とする。
- **保証すること**：Vの谷（L6↔L7）で、設計の契約→実装→Red→Green→局所のRefactor→原子CIまでを閉じる。局所のRefactorはpublic contract、要求、architectureの意味、stateの意味を変えない。原子CIの合格を、品質の証明、システムの成立、利用者の受入、Releaseの成立にしない。PRの前に回すCIはticketとの関係から決め、省いた検査を記録する。
- **単独で成り立つための依存**：コアの工程契約と検証契約を使う。CIの組み立てと運転はHELIX-OSの検収であり、利用者の環境では利用者のCIへ検証契約を渡す（HARNESS-L2-005）。④だけの出力はProvisionalまでである。Integrated以降へ進めるときは、コアの検証と受入の契約（HARNESS-L2-022）を組み合わせる。
- 束ねる既存の条件：HARNESS-L2-003（Vの谷、成果物の状態）、HARNESS-L2-005（PRの前のCI、省いた検査の回収）。

### HARNESS-L2-016 ⑤ リファクタリング（単体）

- **受け取るもの**：実装済みのコード、対の設計と契約、構造を改善する理由（finding、密結合、性能の退行等）。
- **提供するもの**：境界を保ったきれいなコード。
- **保証すること**：振る舞い・契約・要求を保てる変更だけをRefactorする。詳細の契約が違えばL5へ、architectureや境界が違えばL4へ、要求や受入が違えばL3／L2へ、製品の価値が違えばL1へBackflowし、右側が左側のauthorityを黙って書き換えない。Performance Refactorはbaseline・budget・workload・profile・統計条件・回帰oracleを先に固定する。
- **単独で成り立つための依存**：対の設計と契約がないコードは、先にHARNESS-L2-019で設計へ戻してから扱う。④を必須にしない。
- 束ねる既存の条件：HARNESS-L2-003／004（右側のRefactorとBackflow、Refactor／Design-refactor／Performance-refactor）、HARNESS-L2-002／003（Scrum ReverseのSR0–SR4）、「構造改善に適用する変更条件」。

### HARNESS-L2-017 ⑥ リリース（単体）

- **受け取るもの**：HARNESS-L2-022の契約で検証・受入を通った成果物（Verified、Accepted）と、開発の開始時から持つRelease Portの条件。HELIXの外で検証・受入を行った成果物も、HARNESS-L2-022の「外部の成果の持ち込み」の条件を満たせば受け取る。
- **提供するもの**：対象製品のリリースの仕組み（成果物の識別、対象環境、依存、securityの条件、rollback、配備の条件）。これは利用者の製品のための仕組みであり、HELIX自身の実行環境（HELIX-INFRASTRUCTURE）ではない。
- **保証すること**：Release Portの必須条件を満たしたものだけをRelease-eligibleにする。回収されない省いた検査が残っていれば止める。同じ入力から同じ成果物を再現でき、失敗時は直前の適格な版へ戻せる。配備（Deployed）を運用評価（Observed）と区別する。
- **単独で成り立つための依存**：検証済みの成果物とRelease Portの条件だけで使える。配布の実行はHELIX管理下ではHELIX-OSが運転し、利用者の環境では利用者の配備手段へ仕組みを渡す。
- 束ねる既存の条件：HARNESS-L2-003（Release Port、成果物の状態）、HARNESS-L2-005（省いた検査の回収）、FRS-BR-005、「外部提供の条件」。

### HARNESS-L2-018 ⑦ 運用保守（単体）

- **受け取るもの**：配備済みの製品と、その製品が承認した運用品質の要求（可用性、信頼性、性能、容量、費用、security、privacy、運用、保守、回復、observabilityの適用・非適用・unknown・決定owner）。
- **提供するもの**：ログを取り、改善し続ける仕組み。L12運用評価、観測、観測から要求へ戻す再要求化の経路。
- **保証すること**：designed、implemented、verified、observed、operatedを別の状態とし、文書・実装・CIの存在だけで後の状態を成立させない。L12の観測から再要求化へ、同じ要求revisionで接続する。品質の値、対象環境、RTO／RPO、保持期間、予算を全製品へ固定しない。
- **単独で成り立つための依存**：配備済みの製品と運用品質の要求だけで使え、①〜⑥を必須にしない。HELIX管理下の監視・incident・復旧の運転はHELIX-OS、改善効果の評価はHELIX-LABOであり、HARNESSは仕組みの契約を持つ。
- 束ねる既存の条件：「運用品質を落とさない工程条件」、HARNESS-L2-003（Observed）、Conceptの1.0土台「ログと証拠」「計測」。

### HARNESS-L2-019 入口：フルリバース（単体）

- **受け取るもの**：持ち込まれた既存の要件、コード、PoC。
- **提供するもの**：HELIXの形（要求・設計・検証の対とtrace）へ変換した成果と、変換できなかった部分・由来の不明な部分の一覧。
- **保証すること**：どのリリース単位からでも入れる。由来が不明、旧資産、設計traceの欠落のときの復旧の手段として全体のReverseを使い、変換の結果を承認済みの要求・設計にしない。変換できない部分をunknownとして残し、推定で埋めない。
- **単独で成り立つための依存**：コアを使う。入った先のリリース単位を必須にしない。
- 束ねる既存の条件：Conceptの「入口：フルリバース」、HARNESS-L2-003／004（Scoped Reverseと全体のReverse）。

### HARNESS-L2-020 リリース単位の受渡し（接続）

利用者は、開発方式の枠にリリース単位を並べたとき、隣り合う単位の受渡しを接続要求として確かめられる。

- **入力と出力**：前の単位の出力の契約と、次の単位の入力の契約を、契約の版とともに照合する。版が合わない受渡しを黙って読み替えない。
- **失敗時の戻し先**：受渡しで意味の差が見つかれば、下流で書き換えずにBackflowで意味が変わる最上流の層へ戻す（HARNESS-L2-003／004の戻し先の規則）。
- **未完の義務の引継ぎ**：省いた検査、未解決の事項、unknown、人の判断待ちを次の単位へ引き継ぎ、合流先で回収する。引き継いだことを完了にしない。
- **単独利用との両立**：前の単位を使わず外部の成果を持ち込んだ場合も、同じ入力の契約で照合する（HARNESS-L2-019）。
- **成果物の状態の受渡し**：④の出力（Provisional）を⑥へ直接渡さない。HARNESS-L2-022の契約でVerified、Acceptedまで進めたもの、または外部で同じ条件を満たした成果物だけを⑥へ渡す。
- 束ねる既存の条件：HARNESS-L2-002（枠に並べたところに接続要求が生まれる）、HARNESS-L2-005（省いた検査の回収）、HARNESS-L2-008／009（接続固有の要求と設計義務）。

### HARNESS-L2-021 統合したHELIX-HARNESS（構成体）

利用者は、サービス①〜⑦と入口・部品・コアをつないだHELIX-HARNESSを、開発全体に使える一つの構成体として確かめられる。

- **端から端まで**：要求の形成から設計・実装・検証と受入（HARNESS-L2-022）・リリース・運用保守まで一つの対象で通し、L12の観測や実績の評価から要求へ戻す経路まで辿れる。
- **構成体に固有の義務**：端から端のtrace、横断する非機能、統合した版の更新・rollback、L12の運用検証を、個別のリリース単位の成功とは別に確かめる。下の成立の証拠がそろい、構成体に固有の義務を満たしたことを確かめてから成立とする。
- **HELIXの改善への還流**：実績の評価と改善の提案はHELIX-LABOとHELIX-OSが担う。HARNESSは、観測と評価の結果を要求へ戻す受け口を持ち、改善を自分で実行しない。
- 束ねる既存の条件：HARNESS-L2-007（Version 1の完成）、HARNESS-L2-005（構成的保証と差分証明）、HARNESS-L2-008（構成体固有の目的・failure・受入を失わない）、FRS-BR-009。

### HARNESS-L2-022 検証と受入の契約（コアの単体）

利用者は、成果物をProvisionalからIntegrated、Verified、Acceptedへ進める検証と受入を、コア（HELIX-HARNESS-CORE）が提供する契約のパックとして使える。Conceptは、コアに「テスト、CIの仕組み。すべてのリリース単位を横断して成立させる」を置いている。また、複数のリリース単位から使う能力は部品またはコアに置く（HARNESS-L2-010）。このため、この段階をサービス①〜⑦のどれにも所有させず、コアに置く。HARNESS-L2-003の成果物の状態、段階ごとの証明、戻し先は変えない。

- **受け取るもの**：Provisionalの成果物、対の設計（L5詳細設計、L4基本設計）、L3要件、L2要求とL11受入の条件、対の検証の設計（L8、L9、L10）。
- **提供するもの**：段階ごとの検証の契約と状態の遷移。
  - Provisional→Integrated：L8でL5と、L9でL4と照合するScoped Reverse、境界の照合・Refactor・結合の証明。
  - Integrated→Verified：L10でL3要件と照合するシステムの証明。下の証明とシステムに固有の義務との差分の確認。
  - Verified→Accepted：L11の受入の条件（成功条件と反例）による利用者受入と、その記録。
- **保証すること**：各段階を別の状態とする。単体と結合の証明はシステムの証明の証拠として積み上げるが、システムに固有の義務との差分を確かめずにVerifiedとしない。L10の合格でL11を合格にしない。
- **不一致の扱い**：振る舞い・契約・要求を保てる不一致は、右側でRefactorし、同じ段階の検証をやり直す。意味の変更が必要な不一致は、見つけた検証層で戻し先を固定せず、HARNESS-L2-003／004の規則に従って意味が変わる左側の層へBackflowする（詳細の契約はL5、architectureや境界はL4、要求や受入はL3／L2、製品の価値はL1）。右側が左側のauthorityを黙って書き換えない。L11で意味の差が見つかれば、コードを直接直して合わせず、Backflowで要求へ戻す（HARNESS-L2-003）。
- **実行側との境界**：HARNESSは契約（何を、どの対と照合し、何を証拠とし、どこへ戻すか）を持つ。テストとCIの運転、ticketの発行、検収は、HELIXの管理下ではHELIX-OSの推進と検収が担う。利用者の環境では、利用者のCIと受入の手段へ契約を渡す。HELIX-OSを必須の依存にしない。
- **外部の成果の持ち込み**：HELIXの外で結合・検証・受入を行った成果物は、対象revision、照合した対、oracle、結果、証拠の識別がこの契約の条件を満たすとき、その状態として⑥へ持ち込める。条件を満たさない部分は満たした段階までの状態とし、成果物の存在だけで上の状態にしない。
- **単独で成り立つための依存**：コアの追跡と対の設計を使う。④を必須にしない。成果物は④の出力でも、HARNESS-L2-019で持ち込んだものでもよい。
- 束ねる既存の条件：HARNESS-L2-003（成果物の状態、L10とL11の区別）、HARNESS-L2-003／004（Scoped Reverse、右側のRefactor、戻し先）、HARNESS-L2-005（構成的保証と差分証明）、FRS-BR-009。

### HARNESS-L2-023 利用条件別の依存宣言（単体追補候補、1.0）

**親L1**：HARNESS-L1-005。外部利用者がHELIX内部管理へ暗黙依存せず、明示された版・構成・条件で利用できるという企画を、利用条件ごとの依存宣言へ具体化する。現行親本文の対象revision確認はPOに残し、この候補から確認済み扱いにしない。

**既存契約**：HARNESS-L2-010、HARNESS-L2-011。候補はこの二つを置換せず、全リリース単位から利用する共通依存宣言を追補する。

各pack identityは、依存の宣言に加えて、その依存がどの利用条件で必要になるかを、次の4区分のいずれかとして記録する。区分と条件はpack revisionに束縛し、同一の要求入力から同じ有効依存閉包を再現できる。

1. **常時必須**：当該packのあらゆる許可された利用に必要。利用ごとにidentity、契約版、状態、証拠を照合する。
2. **特定操作時のみ必須**：packが宣言した特定操作を行うとき必要。操作名・適用条件を前もって示す。条件成立時は必須として閉じ、missing/unknown/staleならその操作を保留する。条件不成立ならその操作を含まない当該利用に限って閉包外とできる。
3. **選択した入力元に応じて必須**：利用者が明示選択したsource/providerを読むとき必要。source identity、契約版、scopeを選択とともに束縛する。選択されたsourceの依存はすべて閉じる。未選択sourceは「未観測」と記録し、存在・不在・適格性・成功を推測しない。選択sourceの失敗から別sourceへの暗黙fallbackをしない。
4. **参照資料のみ**：背景説明・用語解説など、そのpackの実行条件・成果・authorityを左右しない資料。利用時の実行依存閉包には入れない。実行条件、source authority、検証oracle、安全制約として効く文書は参照資料へ分類して義務を消さない。

**受け取るもの**：pack IDとsource revision、HARNESS-L2-010/011のcontract revision、利用要求のoperation、対象/scope、明示選択した入力元identity、必要な権限・隔離・data-use分類、候補依存のidentity/owner/契約version/互換範囲と、その適用条件。

**提供するもの**：各依存の4区分・条件・版・ownerを示す依存宣言と、その利用要求に対する有効依存閉包（必要、条件不成立で対象外、未選択かつ未観測、参照のみ、unknown/stale/保留を区別）。利用に使った依存の版・scope・判定根拠をHARNESS-L2-011の相関ID付き結果/証拠へ結び付ける。

**保留と戻し先**：packの依存identity・区分・条件・版rangeが欠落/曖昧なら、pack契約ownerへ戻しHARNESS-L2-010の契約改訂候補にする。呼出し固有のoperation/source/scope/権限/receiptの不足や版不一致は、呼出しownerへ戻しHARNESS-L2-011の入力修正または再実行候補にする。authority、安全条件、または親の要求scopeが不明・矛盾している場合は、そのauthority ownerまたはHARNESS-L1-005の利用境界の意味を持つPOへ戻して明示的な根拠を得る。修正・根拠が揃うまで該当操作を保留し、別source・手作業・参照資料へ迂回しない。

**保証すること**：

- 一つのpackが全対応sourceを持てることは、どの利用でも全sourceが必須であることを意味しない。逆に、個々のsourceや操作を選択した利用では、その選択を成立させる該当依存を省略できない。
- 適用条件の真偽を要求入力と宣言から決定できる。条件の欠落、曖昧さ、矛盾、stale、互換range不明は、当該条件を非適用または参照のみと推定せずunknown/保留にする。
- **安全依存をoptional化しない**。認可、authority、隔離、排他、credential/data-use、監査証拠、停止/復旧などの安全条件は、操作または選択sourceの条件に応じて現れる場合も、該当条件下では必須依存である。その適用条件自体がunknownなら保留し、閉包から落とさない。
- 代行者が人でも依存宣言・必要な権限・隔離・版照合・検証・記録の義務は同じ。人の実施はdependencyを削除せず、同じ契約の成果とsource/actor/revision/scope/受領/検証receiptを供給する。契約にない人の判断や口頭受領はclosure evidenceにならない。
- 依存区分はtarget packの機能・owner・上位要求・版成熟度を変更しない。後続版の依存を1.0に強制せず、また1.0で必要な安全依存を後続版扱いにして削らない。今回選択しなかった能力も、1.0全体に属する完成義務を削除・延期したことにはしない。

**単独で成り立つための依存**：HARNESS-L2-010（pack identity/契約/依存宣言）、HARNESS-L2-011（利用ごとの入力scope・版・権限・状態/証拠）と、分類対象の依存宣言・利用入力。分類結果がmissing/unknownであることも出力でき、対象依存の実装がすべて存在することを分類能力自身の成立条件にしない。利用実行には、その結果が求める有効な依存を別途充足する。依存閉包の結果そのものが、未採択候補や利用対象機能の成立・実装許可にはならない。

**旧FRSとの関係**：FRS-BR-004/005/009、FRS-R-12/13/14/23、FRS-AC-012/013/014/025の保持点（影響追跡、安全閉包、unknown/stale fail-close、局所単位の再現/rollback）を現行pack契約へ再導出する。変更点は旧Slice/Module/Bundleの宣言構造を移さず、既存HARNESS-L2-010/011へ利用条件を4区分で明記すること。変更理由は、対応可能な接続の一覧と一利用に必要な依存を読み分けられるようにし、選択した構成を安全閉包の根拠付きで成立させるためである。

**束ねる既存条件**：HARNESS-L2-010の明示的依存・版・scope・所有・収載/除外、HARNESS-L2-011の版照合・明示権限・隔離・相関証拠・失敗/再開。新しいmechanism、dependency registry、runtime、approval、依存ownerは作らない。


- **原文・照合証拠**：[PO補強原文](../../helix-os/sources/body-reinforcement-po-original-2026-09-27.md)第2点、[起点判断記録](../../governance/decisions/body-reinforcement-po-decisions-2026-09-27.md)、[全機構の依存監査](../../governance/audits/g10-pack-dependency-audit.md)。旧FRSのasset ID・path・行・SHAと原条件は監査に保持する。

### HARNESS-L2-024 — 要求形成の質問優先と収束根拠

**親L1**：primaryはHARNESS-L1-008（要求形成の収束）。HARNESS-L1-006は形成・合意・freeze等の状態分離を保持するcontext parent。HARNESS-L1-005／007／001は単独service・Version 1・V-modelのcontext。現行親はdraft_candidateで、対象revisionの確認・採択を生成しない。`version_target: 1.0`。

**kind / boundary**：単体（HARNESS要求形成engineの利用条件）。既存HARNESS-L2-008の意味処理能力を追補し、HARNESS-L2-013の② serviceで単独利用できる補強。HARNESS-L2-008/013を置換せず、OS側に別engine・question service・approval ledgerを作らない。

**入力**：engine／product pack revision、対象ConceptとL1 revision、利用者の指示・参照根拠のidentity/revision/scope、現在とprior candidate、既回答・訂正・defer・agreementの記録とactor/owner、利用可能な過去iteration履歴と差分（履歴の固定件数を必須としない）、候補間の矛盾・重複、actor/task、正常/取消/failure/timeout/recovery、P0/P1 surface、implicit requirement matrix、prototype/非UIの適用性と、該当時には現行HARNESS-L2-008の工程で得た合意・根拠（非適用時には理由と再評価条件）、各不足の不確実性・影響・下流変更cost・人間専決区分。

**出力**：version/scope/sourceに結び付いた構造化要求候補と意味差分、質問・既存open questionの継続状態、優先理由と影響範囲、矛盾・欠落・未確定事項、deferのowner/re-entry条件、適用対象と非適用根拠、残る必須人間判断（原文、決める選択肢、推奨案、影響候補）、収束判定と不足理由を返す。候補は人間の訂正・合意・採否待ちであり、approved requirement、L3承認、操作許可へ昇格しない。

**収束契約**：

1. 同一対象revision・scope・既回答を照合して質問履歴を再利用する。回答済み質問を同じ意味で聞き直さない。既に開いて未回答の質問は新規重複で再発行せず同じopen item、owner、状態を提示する。再質問が必要なら回答された事実を消さず、変わった根拠・revision・scopeと意味差分を明示する。
2. 未解決質問候補の順序は旧RDJ-FR-003の影響度×不確実性×下流変更cost×人間専決度の各要素に対応する入力根拠を示し、影響の大きい不足・未決事項から先に提示する。数値weight、閾値、固定質問数を根拠なく新設せず、同順位なら、packのversioned inputとして固定したtie-break規則と根拠を適用し、同じ候補・既回答・入力revisionから次の質問と順序を一意に再現する。規則が未定義または同じ入力から複数の選択が残る場合は選択未確定を示し、pack契約ownerへ不足を戻す。実装方式や根拠のない数値weightをこの候補で固定しない。risk/authority等の人間専決値はエンジンが補完せず、原文・選択肢・推奨・影響候補を持つ判断待ちへ送る。
3. 合意済みの回答・要求を再開する場合は、新しいsource/revision、矛盾を示すfinding、影響するscopeと差分を特定する。エンジンは再開を自動確定せず、影響を受ける項目だけを対象ownerへ理由付きで照会する。新しい根拠がない同じscopeでの再確認は拒否する。
4. 収束判定は、actor/task、正常・取消・failure・timeout・recovery、P0/P1 surface、矛盾/deferとowner/re-entry、暗黙matrixの必須領域、利用可能なiteration履歴と差分根拠、prototype/非UI適用性について現行HARNESS-L2-008の工程で得た合意・根拠（該当時）を確認する。旧条件の「直近2 iteration」を最低件数にせず、過去履歴がない/少ないこと自体を必須事項unknownと同一視しない。各要求領域を解決済み／明示保留／非適用（理由・判断者・対象revision・再評価条件）／必須事項unknownで区別する。必須事項unknown、未ownerの必須事項、未説明の矛盾、P0/P1の未分類欠落は形成資料の不足として提示し、PO確認待ちそのものとは区別する。必要な形成情報と根拠・残存判断一覧が揃った場合は「人の確認・合意待ちの候補」として提示できるが、これは合意・freeze・採択完了ではない。人の合意状態は別個に確認し、engineが収束判定から生成しない。prototype／非UI合意が該当して未了でも、要求候補・根拠・未決判断packetを形成して当該合意待ちの状態で提示できる。既存合意がある前提の記録欠落は形成資料不足として区別し、合意前のfreeze・下流承認を生成しない。
5. score、fixture score、質問回数、訂正率、反復iteration数、無変更iteration、timeoutを単独の収束判定にしない。固定iteration上限は設けない。timeout時は進行停止・状態保持・actor/scope/最後の確定revision/open item/再入条件を返し、回答や合意を捏造せず、再開条件が揃うまで待つ。

**保証と既存engine対応**：HARNESS-L2-008とREQENG-HARNESS-001/002/003/004の既存抽出・意味差分・質問・影響処理へ、revision/scope単位の既回答照合、質問順序の説明、合意再開根拠、必須条件の収束判定を補う。REQENG-HARNESS-005/006の製品pack分離と決定論を保持し、REQENG-HARNESS-007およびHARNESS-L2-013の提案・人承認境界を保持する。OSは人の反応/採否eventを登録・監視する既存責務に留まり、要求の意味を重複所有しない。prototype/PoC結果からHARNESS-L2-008へ戻る現行Backflow、単体/connection/compositeのidentity、failure/timeout、trace、owner/re-entryも落とさない。

**単独成立依存と戻し先**：HARNESS-L2-008（要求候補・意味質問）とHARNESS-L2-013（②単独service）およびその候補revision付きHARNESS-L1親。初回で既回答がないことは明示的な空の履歴として区別する。存在するはずの回答・合意の記録、対象revisionのL1、根拠scope、actor/ownerまたは適用matrixがmissing/unknown/staleなら影響する質問の確定・収束を保留し、HARNESS要求ownerへ不足を戻す。上流の目的・scope・人が決める値が不明ならHARNESS-L1-008または意味を持つPOへ戻す。操作・記録・採否の実行はOS側既存consumerへ戻し、HARNESSに登録/承認権限を追加しない。

**旧RDJとの関係**：RDJ-FR-003/007とRDJ-AC-003/007の意味を保持し、RDJ-FR-002のevent履歴・決定論replay、FR-004のsuccess/cancel/failure/timeout/recovery、FR-006の暗黙matrixと人間decision、AC-006の自動accept拒否を関連条件として結ぶ。変更点は固定反復回数・旧手続きを新設せず、利用可能な履歴と変更根拠を照合し履歴件数を成立条件にせず、現行HARNESS engine候補のquestion-volume/correction-rateを同じ／未見fixtureで補助計測すること。質問/訂正measurementの改善値だけでは必須要件未決を閉じない。

**原文と旧資産**：[PO補強原文](../../helix-os/sources/body-reinforcement-po-original-2026-09-27.md)第3項を起点とする。旧RDJ-FR-003/007は `LEGACY-ASSET-E78B8D68CC327AA00991`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/requirement-discovery-json-authority.md:48,52`、SHA-256 `361a9ef773f7cf36cc0953f70cad205184ca952f2cb672431e5b929121ef1f61`。対のAC003/007は `LEGACY-ASSET-AD746F4F3487103519F9`、`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/requirement-discovery-json-authority-acceptance.md:22,26`、SHA-256 `3462b3da8269668c848799b07305f2fe135d8902de02121c2048d5686d98dc0e`。旧FR007の固定「直近2 iteration」は原条件として記録するが、PO指示に従い現行の最低回数にしない。履歴・差分・必須条件の照合という意味を再導出する。`LEGACY-ASSET-4A7A45BC495D1B2677A2`、`archive/legacy-generation-2026-09-14/root/requirements-ir/refinement_contracts.json:1-2828`、SHA-256 `6230d6c0ae341ea45eba1e9bf1d40389363b9f1f12c158e5b5c15799122e1443`には該当RDJ契約がなく、他機能の契約を代替根拠にしない。旧runtime・schema実装は移植/実行しない。


## G15 設計合成の単体・接続・構成体候補

起点は[PO原文第1項](../sources/capability-reinforcement-po-original-2026-09-27.md)と[判断記録](../../governance/decisions/capability-reinforcement-po-decisions-2026-09-27.md)。既存HARNESS-L2-014の意味を弱めず、新しい要求範囲は独立candidate identityにする。要求の意味はHARNESS-L2-008に残し、L2で形成された要求→L3要件としての承認→L4〜L6設計の順を守る。候補や設計出力からL3承認、設計承認、実装許可、採択を生成しない。

### HARNESS-L2-026 要求から相互参照する具体設計を構成する（unit candidate）

- **親L1**：`HARNESS-L1-005`, `HARNESS-L1-007`, `HARNESS-L1-009`, `HARNESS-L1-001`。HARNESS-L1-009は設計templateで必要な義務を導き、入力不足を戻す根拠。HARNESS-L1-001は要求から設計・検証までを正規V-pairでつなぐ根拠。親の企画意味は追加しない。
- **対象・kind・版・scope**：③設計サービスが利用する設計構成能力のunit candidate、`version_target: 1.0`。指定された製品・要求revision・L3要件revision・design scopeだけを扱う。
- **014との所有・パック境界**：HARNESS-L2-014は利用者向け③設計サービスの入力受付・不足差戻し・成果提供を所有し、026はその内部で要求から相互参照する設計と対の検証設計を構成する交換可能な能力パックを所有する。利用者は014を選び、その依存閉包へ026が常時必須として入る。026を第二の③製品として選ばせない。014の出力契約を本候補の具体処理で満たすには026が必要であり、014の単独利用は他の①②④〜⑦サービスを必須にしないという意味で、内部能力026なしで成立する意味ではない。026は014の完了receiptを入力に要求せず、宣言したL3・工程入力から構成できる。026の交換時は014との入出力契約版・scope・互換と対の受入を再照合し、不一致・staleなら014の設計提供を保留する。014本文・出力責任を変更せず、依存の具体化を本節に追補する。
- **入力**：対象L2要求/L11とのtrace、承認済みL3要件と工程契約、risk/scope、Design Template、HELIX-HARNESS-CORE契約、および常時利用可能なBRAIN connector契約。L3承認根拠がない入力は設計確定へ進めない。
- **出力**：L4基本設計・L5詳細設計・L6契約と対のL9/L8/L7検証設計。要求/L3要件→画面/flow/state→API/command→permission/actor→domain data/DB invariant→verification oracleのidentity付き双方向trace、参照契約版、unknown/N/A、変更影響、失敗・差戻し先を含む。
- **保証すること**：承認済み要件の制約を該当する設計要素とoracleへ結び、単体・接続・構成体の固有義務を分ける。template、CORE、BRAIN connectorを必要とする。BRAIN connectorの存在・版・互換照合は常時必須だが、個別Patternの選択と内容照合はその知識を使う場合の選択依存であり、全知識の完成を待たない。BRAINは知識を提供し、HARNESS/COREが製品設計を構成する。Pattern同士の衝突を検出した場合は、競合する制約・根拠・影響範囲を示し、要求の不変条件を満たす代替構成を比較可能な候補として返す。意味を保つ代替がない場合は不足として示し、要求入力不足や矛盾を推測で埋めず要求形成へ戻す。
- **依存区分**：**常時必須**＝承認済みL3要件/対象revision、HARNESS-L2-009設計義務、Design Templateの対応契約版、COREおよびBRAIN connectorの契約版・互換範囲、HARNESS-L2-010/011 pack契約とHARNESS-L2-022の対検証設計契約（026の出力である対の生成自体は省略しない）。**特定操作時のみ**＝UI対象を扱う操作のprototype/非UI適用合意・screen contract、各設計対象に適用される個別oracle（適用対象で必要な欠落は保留）。**選択した入力元に応じて必須**＝具体Patternを利用する操作ではそのPattern identity/version/compatibility/applicability/required input/relation/反例をすべて照合する。特定Patternを選ばないscopeは未選択・未観測と記録し、全BRAIN知識が存在すると推測しない。**参照資料のみ**＝背景説明や旧設計例。required input、authority、oracle、security/permissionを参照扱いへ落とさない。
- **正常・境界例**：「申請は承認後に編集できない」という承認済みL3要件から、申請state/承認遷移、編集API/command precondition、actor別permission、画面の編集可否と拒否結果、DB/data更新不変条件を一貫した候補設計としてtraceする。DB製品や実装方式は固定せず、どの設計でも不変条件を満たすoracleを定義する。
- **失敗・戻し先**：画面だけ編集不可でAPIは更新可能、permissionが残る、state raceでDB更新が通る、traceが別revisionを指す場合は不整合。意味の不足はHARNESS-L2-008の要求形成、L3要件の変更はそのauthority owner、Patternの意味・版はBRAIN、設計contract/traceはHARNESSへ戻す。承認後訂正を許す意味変更を本candidateで決めない。

BRAIN知識接続の正本は、[HELIXBRAIN-L2-030](../../helix-brain/L2-requirements/brain-requirements.md)とその対の受入に置く。本unitはCOREのBRAIN connector契約を常時必須とし、個別Pattern利用時にだけそのPatternの条件・版・required inputを照合する。

### HARNESS-L2-025 要求から整合した設計・対oracleを閉じる（composite candidate）

- **親L1**：`HARNESS-L1-001`, `HARNESS-L1-004`, `HARNESS-L1-005`, `HARNESS-L1-007`, `HARNESS-L1-009`。対象はHARNESS-L2-026 unitの設計と、必要な場合のHELIXBRAIN-L2-030接続を束ねた設計構成体である。
- **対象・kind・版・scope**：設計出力と対の検証設計の相互整合を確かめるcomposite candidate、`version_target: 1.0`。一つの対象revision/要求scopeの端から端設計を扱う。
- **014/026との分担**：014が提供する設計成果について、026は設計要素を構成し、025は要素をつないだ端から端の固有義務を検査する。025は014を代替する製品でも026を重複生成するunitでもない。014が相互参照する設計一式の整合を提供する際は025の対象scopeの検査が常時必須となる。025は026の成果を受け取るが、026の生成は025完了に依存しない。014→026・025、025→026の向きで閉じ、014完了への自己依存を作らない。
- **入力**：HARNESS-L2-026の設計unit出力、常時必須のHELIXBRAIN connector契約状態、選択したPatternがあればHELIXBRAIN-L2-030 receipt、要求/L3 revision、画面/API/DB/permission/state/oracle scope。
- **出力**：端から端の双方向trace、要素間relation、構成体固有の横断invariant・failure path、対の検証設計、conflict/unknown/alternative/差戻し先。
- **保証すること**：unitやconnectionの成功だけで構成体を成立扱いせず、要求→設計要素→oracleの端から端trace、画面/API/DB/permission/stateの整合、正常/拒否/failure pathを別途確認する。BRAIN connector契約は常時必須。BRAIN知識を使う場合はHELIXBRAIN-L2-030 receiptと使用Patternの全条件を必須とする。knowledge selection自体は対象scopeで必要とされた場合だけで、利用可能な全BRAIN知識を要求しない。採択、承認、実装・利用者受入状態は作らない。
- **依存区分**：**常時必須**＝HARNESS-L2-026設計unit契約とreceipt、対象L3 authority/revision、CORE/Design Template/BRAIN connectorの版・互換、構成体scopeとHARNESS-L2-022 oracle契約。**特定操作時のみ**＝UI要素を含むscopeのprototype/screen contract、各設計対象に適用される個別oracle（構成体の対検証設計自体は常時必須）。**選択した入力元に応じて必須**＝Pattern利用時はHELIXBRAIN-L2-030 receiptと選択Patternの全required input/relation/version。Pattern非利用は非適用根拠を付け未観測とする。**参照資料のみ**＝背景・旧例。構成体invariantの根拠を代替しない。
- **正常・境界例**：承認後編集禁止の要件について申請作成→承認→編集要求→拒否まで、画面/API/permission/state/data invariantと各oracleを一つのtraceで辿り、実装経路が違っても同じ意味を保つ設計を確認する。
- **失敗・戻し先**：下位要素の成功を集めただけ、片方向trace、競合するstate/permission、見落としたPattern衝突、未定oracle、承認後も更新可能な経路があれば不合格。意味差はHARNESS-L2-008、L3差はL3 owner、汎用Pattern/relation差はBRAIN、設計/pair不備はHARNESS-L2-026/022の形成へ戻す。
## G16 既存製品のReverseと差分改修の候補

起点は[PO原文第2項](../sources/capability-reinforcement-po-original-2026-09-27.md)と[判断記録](../../governance/decisions/capability-reinforcement-po-decisions-2026-09-27.md)。第2項の要求は、HARNESS-L2-019の初回Full ReverseとHARNESS-L2-003／004の影響追跡・Scoped Reverse・Backflowをつなぎ、外部編集後も継続利用できる処理として具体化する。既存identityは置換せず、下記027–029を追加candidateとする。G15のHARNESS-L2-026（unitの設計構成）と025（design/composite整合）候補は保存設計modelの関連入力として照合する。G15の判断記録はその候補の根拠でありG16の個別判断ではない。G15の候補出力を承認済み設計とみなさず、現対象revisionのauthority状態に従う。

### HARNESS-L2-027 外部実物からの構造・振舞い抽出（unit candidate）

- **所属候補（未採択）**：HELIX-HARNESS共通部品。利用先：Full Reverseを選択する各サービス。019共通入口のsource型抽出packとしてsource/provenanceを返し、COREの意味/trace契約と③/014の設計authorityを保持する。019の完了を抽出開始条件にしない。 HARNESS-L2-010に従い主owner候補は一つとする。記載は所属採択・v0.1収載・実装許可を生成しない。

- **親L1**：`HARNESS-L1-001`, `HARNESS-L1-003`, `HARNESS-L1-005`。001のV-model上の成果物接続、003の要求変更と下流構造の影響追跡、005の外部利用者が明示されたversion/configuration/conditionで使う契約を具体化する。これは現HARNESS-L2-019の親L1（003／005）に沿った、source extraction処理の候補である。
- **既存要求とidentity**：HARNESS-L2-019 Full Reverse（既存requirement/code/PoCの持込み、HELIX形式への変換、unknownの保持）を前提にし、初回移行identityを上書きしない。
- **対象・kind・版・scope**：unit、`version_target: 1.0`候補。利用者が選択した対象製品・source revision・read scopeの静的artifact（code、DB定義/schema、API定義、設定）から、構造と根拠のある振舞い記述を抽出する。実行中service・顧客DB dataの走査、実適用は含めない。
- **受け取るもの**：HARNESS-L2-019の入力対象・製品／project identity、選択source typeごとのsource snapshot/reference・revision/digest、明示scope、HARNESS-L2-019の既存intake/result境界と同じ対象・入力契約に結ぶ情報（019の処理完了receiptは要求しない）。対象sourceの読み取りに必要な適用条件・権限/data classification。
- **提供するもの**：検出したcomponent/interface/state/schema/dependency/config relationと根拠source spanを結んだversion-bound observation/candidate、抽出できない・不明な箇所、source間の矛盾、未選択sourceの未観測表示、extractor/capabilityの範囲。不確実な内容を設計正本へ書かない。
- **保証すること**：source observationと保存設計authorityを区別し、type別に抽出可能な情報・適用限界を示す。code構造から推定した振舞いは観測証拠や要求意味と誤表示しない。既存コード中のcustom processingも観測差分候補として識別し、後続packへ位置・根拠を渡す。source/read契約とHARNESS-L2-019/010/011に従う。HARNESS-L2-019はrelease unit共通のFull Reverse入口とHELIX形式への変換結果・unknownの所有者であり、HARNESS-L2-027はそこで呼び出され得る選択source型の抽出unit/pack candidateである。019の利用operationが027の対応するsource typeを選択した場合、027はそのoperationの必須依存となり、019は対象・source type・scope・versionを結ぶinput contractを渡し、027のobservation receiptを019のresult boundaryへ受け取る。019は027非対応の既存sourceを扱う利用まで027へ依存させない。027自身は019の完了receiptを前提にせず、019のintake/result boundaryと同じ対象・入力契約へ接続して単独抽出できる。HARNESS-L2-010がpack identity/version/依存境界、011が呼出し時のinput/scope/receipt条件を所有する。HARNESS-L2-014は承認設計と設計工程を所有し、027の観測・候補をcanonical designや承認成果へ昇格させない。
- **依存区分**：**常時必須**＝HARNESS-L2-019のintake/result boundary、HARNESS-L2-010/011のpack identity・input revision/scope/contract・receipt、対象source snapshot identity/digestと許可されたread boundary。**特定操作時のみ必須**＝選択source型がrequires schema/version/parser/profile-specific contractなら当該型の契約。静的範囲を越えて振舞いを検証する操作を追加する場合は別scope/権限/oracleが揃うまで保留。**選択した入力元に応じて必須**＝code、DB定義、API定義、設定のうち選択したsource typeと各sourceの互換・証拠一式。選択しなかったtypeは未観測とし存在・不在・不存在のいずれも推測しない。**参照資料のみ**＝今回のsource observationを決めない背景説明・旧example。選択sourceのrevision/digest、read scope、access authorityは参照資料へ分類しない。027のraw extractionはrequirement revision・保存design・acceptance oracleを必須入力にせず、任意に添えられた要求/設計情報からsource observationやauthorityを変更しない。
- **単独成立依存**：HARNESS-L2-019のintake/result boundary（完了receiptは不要。019が027対応source typeを選ぶ利用では、027を019 operationの必須依存としてinput contract/observation receiptを交換する）、HARNESS-L2-010/011のpack/call boundary、対象source snapshot/read boundary。既存HARNESS-L2-014はcanonical design authorityの所有者であり、027はその承認設計やdesign revisionを必須入力としない。保存designとの比較は028の依存であり、027単体でdesign conformityを保証しない。
- **失敗・戻し先**：source digest/revision missing/stale、未許可scope、unsupported type/construct、schema conflictは該当箇所をunknown/unsupportedとして示し、必要ならinput/source ownerへ戻す。別parser/sourceへ黙ってfallbackしない。識別できないcodeは既存の正当な処理を消す／変更する判断に使わない。

### HARNESS-L2-028 観測差分と保存設計の照合（connection candidate）

- **所属候補（未採択）**：HELIX-HARNESS共通部品。利用先：②要件定義・③設計・④開発・⑤リファクタリング等、差分の対象となるサービス。observationと保存designの比較を共有し、affected requirement/design/code/dataを該当ownerへ戻す。⑤専用にはせず、CONNECTの共通通信と業務上の比較を分ける。 HARNESS-L2-010に従い主owner候補は一つとする。記載は所属採択・v0.1収載・実装許可を生成しない。

- **親L1候補**：`HARNESS-L1-001`, `HARNESS-L1-003`, `HARNESS-L1-004`, `HARNESS-L1-005`, `HARNESS-L1-006`。001のV-pair、003の変更影響、004の検証義務、005の明示的な外部利用条件、006の差戻し・再開条件を、sourceと保存revision間の比較へ接続する案。既存relationの置換や承認済み導出ではない。
- **既存要求とidentity**：HARNESS-L2-027 unitのsource-bound observationを、対象製品のcurrent saved design/model revision・requirement traceへ接続する境界要求。比較候補として使うsaved revisionは対象revision/source/authority状態が特定できるものとし、approvedとの主張はそのrevisionに結び付くapproval receiptがある場合だけ許す。authority状態がunknownまたはstaleならapprovedへ昇格せず比較結果を保留する。HARNESS-L2-014（③設計）を設計authority/契約の既存入口とし、G15の026/025候補は、採用・対象化されている場合に限り相互参照する。**HARNESS-L2-028はcode/API/DBの業務接続要求ではなく、Reverse observationと保存design間のpack connectionである。**対象製品のAPI接続を新しい責務として所有しない。
- **対象・kind・版・scope**：connection、`version_target: 1.0`候補。1つのproduct identity、source revision、保存design/requirement revision、比較scopeの組だけを結ぶ。
- **受け取るもの**：027のobservation receipt、source/target revision、現在の保存designとrequirement trace、過去の比較baseline（存在する場合のみ）、HARNESS-L2-003/004のAffected/Unaffected/UnknownとBackflow契約。
- **提供するもの**：保存designに対するobserved delta（追加／変更／削除候補）と影響するidentityのexact set、保持すべき外部custom logic、矛盾・未知・unsupported relation、affected design/pair/test scope、推奨Backflow先。design / observed implementation / derived interpretationを別々に示す。
- **保証すること**：既知traceの比較は影響する箇所に限る。full reverseは由来不明・trace欠落・比較不能からの復旧時に限り、通常の狭い差分比較の代替にしない。推定edgeや構造的近さだけでimpact causal chainを確定せず、unknownをUnaffectedやunchangedへしない。HARNESS-L2-003/004に従い、意味保存差分と意味変更を分ける。
- **依存区分**：**常時必須**＝027のvalid source receipt、対象製品identityと比較scope、current saved design revisionおよび比較対象requirement revision/authority状態、HARNESS-L2-003/004 impact/backflow contract、HARNESS-L2-010/011 versioned connection contract。比較候補として使うsaved revisionは対象revision/source/authority状態が既知でなければならず、approvedとの主張は当該revisionに結び付くapproval receiptがある場合だけ許す。authority状態がunknownまたはstaleならapprovedへ昇格せず比較結果を保留する。current saved designは観測差分との比較基準として必須であり、G16で新たに作るdesign delta proposalの事前承認は要求しない。**特定操作時のみ必須**＝API単位への限定、DB migration影響、特定behavior/stateを扱う比較を要求する場合、そのoperationに必要な対象別design/oracle/data ownership contract。**選択した入力元に応じて必須**＝baselineを選ぶ場合はexact prior source/design revisionとdigest、選択されたsource typeごとの027 receiptと対応関係。未選択baseline/sourceは未観測。**参照資料のみ**＝設計例・解説。関係identityやoracle根拠を参照扱いにしない。
- **単独成立依存**：027 source observation、対象revision/source/authority状態が既知のcurrent saved design revision、requirement relation graph、HARNESS-L2-010/011/003/004。approved状態を主張する場合は当該revisionのapproval receiptを要し、unknown/stale状態はapprovedへ昇格させない。G15-026/025が当該保存designの作成元ならそのrevision/receiptを入力にできるが、candidateであること自体はapproval証拠にならない。
- **失敗・戻し先**：revision不一致、missing relation、partial extraction、複数の矛盾design、custom logicの所有範囲不明では、unknown/affected候補と必要なsource/design再照合を出し、当該差分の結論を保留する。要求／製品意味の不一致はHARNESS-L2-008またはL1 ownerへBackflowし、技術上の曖昧さをコード修正で隠さない。

### HARNESS-L2-029 差分に基づく往復改修案（composite candidate）

- **所属候補（未採択）**：HELIX-HARNESS-CORE。利用先：設計・code・dataの差分案に関係する各サービス。複数サービスの意味・設計・影響traceを同じscopeで束ねる構成体の所有候補。各成果のauthorityと適用は該当サービスへ残し、候補生成から実変更を行わない。 HARNESS-L2-010に従い主owner候補は一つとする。記載は所属採択・v0.1収載・実装許可を生成しない。

- **親L1候補**：`HARNESS-L1-001`, `HARNESS-L1-003`, `HARNESS-L1-004`, `HARNESS-L1-005`, `HARNESS-L1-006`。V-pair追跡、変更影響、検証義務、明示構成の利用、差戻し・再開条件を保ち、複数unit/connection成果を一つのchange proposal bundleにする案。Version 1製品群の完成判定（L1-007）はこの限定proposalの親意味に含めず、existing L2-019/003/004のcontractへ接続する。
- **既存要求とidentity**：027 source extraction unitと028 Reverse-to-design connectionを束ね、保存designと外部で改変された実物の差を利用者が反復して比較・改修できる提案にする。
- **対象・kind・版・scope**：composite、`version_target: 1.0`候補。対象source revision、saved design/requirement revision、限定されたaffected API/component/data scopeにだけproposalを出す。
- **受け取るもの**：027 extraction receipt、028 delta exact setとそこで照合したcurrent saved design/requirement revision（対象revision/source/authority状態が既知であること。approvedとの主張は当該revisionに結び付くapproval receiptがある場合だけ許し、unknown/staleをapprovedへ昇格しない。029は設計差分を比較する構成体のためこの保存revisionが常時必須。新しいdesign delta proposalの事前承認は不要）、API contract（API repair案を作る操作時）、DB schema/data ownership contract（migration案を作る操作時）と各適用version、affected scope/unknown/custom logic annotations、選択したoperationのverification constraints。新規の設計差分はproposalであり、既承認設計として扱わない。
- **提供するもの**：相互参照されたchange proposal bundle：①影響範囲に限定した設計差分、②関連API等だけを変更するcode repair案、③必要な場合のdata/schema migration案（source/target schema、対象範囲、前提、影響/rollbackに関する未知と必要oracleを含む）、④変更対象外として保持するcustom logicと理由、⑤実施前に必要なL2/L3 Backflow・verification obligations・unsupported/unknown一覧。Proposalはdiff/planであり、codeを書換えずmigrationを実行しない。
- **保証すること**：external editを取り込むたびsource revisionを新設して差分を再評価できる。範囲内proposalは、source→observation→design delta→code/data proposalのtraceと影響理由を持つ。対象API変更の案に無関係なAPIやcustom logicを混入しない。要求・design authorityをproposalが更新せず、L2-003/004の意味保持Refactor／Backflowを守る。単体・connectionの成立だけでcomposite成立としない。
- **依存区分**：**常時必須**＝027 unit receipt、028 connection receipt（同じproduct/scope/source revisionと対象revision/source/authority状態が既知のcurrent saved design/requirement revisionへの有効な照合）、対象requirement revision/authority状態、current saved design revision、affected-set/backflow relation、HARNESS-L2-010/011/003/004/022の適用契約とproposal identity/scope。approvedとの主張は当該design revisionに結び付くapproval receiptがある場合だけ許し、unknown/staleをapprovedへ昇格しない。029は028を必須に束ねるため保存design revisionも常時必要な比較基準である。生成するdesign deltaはcandidate proposalであり、そのproposalの事前承認や新設計の承認receiptは入力依存にしない。API/data ownershipは該当API変更案またはdata migration案を選ぶoperationでのみ必要。migration案を返す場合も実適用の権限・CI runtimeを暗黙に取得しない。**特定操作時のみ必須**＝data/schema migration案ではsource/target schema契約、当該dataのowner/許可、必要なloss/rollback/compatibility oracle。API code案では当該APIのcontract・対象実装revision・validation oracle。これらの案を出さず、また該当API/dataを変更対象にしないoperationではAPI/data ownershipやDB migration依存を要求せず、no-change rationaleを明示できる。**選択した入力元に応じて必須**＝利用者が明示選択したsource type/baseline/external edit snapshotの対応receipt一式。選ばれていないrepository/branch/providerの変更は未観測とし比較対象にしない。**参照資料のみ**＝背景情報・類似製品例。適用要件、data ownership、security条件を参照扱いにしない。
- **単独成立依存**：027、028（current saved design/requirement revisionに束縛された有効receipt）、HARNESS-L2-019の入口/result境界、003/004、010/011、適用される022 oracle contract。保存design revisionは029の比較基準として常時必須だが、生成する新設計差分は提案状態であり、その候補の事前承認を前提にしない。HARNESS-L2-014/015の設計・開発作業を自動起動・実行することは依存にしない。
- **失敗・戻し先**：差分がrequirements/design authorityを変える場合はL2-008/対応する上流ownerへ戻す。code behavior contract/設計境界不明はHARNESS-L2-014/Designへ、検証oracle不足はHARNESS-L2-022へ、DB意味/owner/migration data-loss risk不明はauthority/source ownerへ戻して保留する。未知sourceをdefault parseして補完せず、提案から自動patch/migration/commit/releaseを発行しない。

**旧HELIXとの対応（保持／変更）**：`LEGACY-ASSET-B5B5E71B2AF1459D59A1`（旧FR-14: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:406–426`、SHA-256 `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a`）から、既存コード/design/dependencyのsource-based reverse、as-is/gap/routingの候補化、unknownを残す点を起点とする。`LEGACY-ASSET-D11F51092619506417E4`（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/multimodal-design-harness-authority.md:56–69,128–140`、SHA-256 `baf570f59ac838302f69a27b17a6febca78bf911278af21a9d2f4f9e87a1edd2`）のReverse extraction provenance・candidate境界は意味参照とし、視覚domainのsource setやschemaを全productへ移さない。`LEGACY-ASSET-EB3700B0088F311C2295`（AAFD delta requirements `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md:50–78`、SHA-256 `685d95abf7218410b807dd9c58efd73a45b0b1937f820fefacf111fb2276bc1a`）からsource/digest結合・affected exact set・unknown・authority non-writeの意味を保持するが、internal audit delta schemaをコピーせず、product code/DB/API/configへの意味再導出とする。変更点は「最初に取り込む」から利用者のexternal edits後の再比較・限定change proposalsへ広げること。根拠はPO第2項であり、旧runtime/CLI/Reverse workflowを実行・移植しない。

## G18 テスト・再現ケース生成候補（HARNESS）

起点は[PO原文](../sources/capability-reinforcement-po-original-2026-09-27.md)第4項と[判断記録](../../governance/decisions/test-reproduction-derivation-2026-09-27.md)。旧要求・運用の対応、保持点と変更点は 同判断記録の旧source照合を参照する。ここで定義するのはテスト・再現ケースの作成能力であり、テスト実行、oracleの意味決定、受入状態の更新を新設しない。G16候補 `HARNESS-L2-027`〜`HARNESS-L2-029` と独立した候補identityであり、G17の候補と同じ処理を二重所有しない。以下は未採択の候補で、v0.1収載を決めない。

### HARNESS-L2-030 テストscenario・case・data・double生成（単体候補、version_target 1.0）

- **所属候補（未採択）**：HELIX-HARNESS-CORE。利用先：case/data/double生成を選択する各サービス。Conceptの横断test/CIに対応する共有生成pack。014の対設計と022のoracle/検証義務を使用し、OS-020または利用者CIの実行責務を所有しない。 HARNESS-L2-010に従い主owner候補は一つとする。記載は所属採択・v0.1収載・実装許可を生成しない。

**親L1**：`HARNESS-L1-001`, `HARNESS-L1-004`, `HARNESS-L1-005`, `HARNESS-L1-007`。HARNESS-L1-001は要求から検証までを対で追跡する企画、HARNESS-L1-004は対象revision/riskに合う検証義務・反例・証拠・戻し先、HARNESS-L1-005/007は外部利用とVersion 1の適用範囲を根拠とする。

**種類と境界**：単体のversioned capability pack候補。`HARNESS-L2-014`が所有する対の設計と、`HARNESS-L2-022`が所有する検証・受入oracle/段階契約を具体的scenario/case/fixture候補へ写す。014の設計authorityや022のoracle/検証義務/stage/state/受入を置換・追加しない。HARNESS-L2-010が030のpack identity/version/依存境界、HARNESS-L2-011が呼出し時の入力/scope/互換性/receiptを所有する。生成caseの実行・結果収集は選択された`HELIXOS-L2-020`または利用者CIが行い、OS利用時のpacket接続は032を通す。execution result/consumer receiptは呼出し後の結果であり、030を開始する前提ではない。

**受け取るもの**：対象artifact/API/state-transitionのrevisionとscope、承認済みL3要件、`HARNESS-L2-014`の対応する設計・対の検証設計、`HARNESS-L2-022`の適用oracle/期待observable behavior、選択したexternal contractおよびfixture/sourceの版。API/state仕様の記述だけから未定義の要求意味を補わない。

**提供するもの**：安定case identity、case family/actor/precondition/操作列、再現可能なtest data、必要なexternal-service double contract、対象requirement/design/oracleとのtrace、適用範囲・source版・seedまたは生成入力、未生成/未確定条件の一覧。boundary、permission、cancel、orderingをcase familyとして扱う。doubleは選択された外部契約の限定stubであり、実サービス全体の同等性を主張しない。

**依存区分**：
- **常時必須**：対象revision/scope、承認済み要件と`HARNESS-L2-014`の対応設計、`HARNESS-L2-022`の適用oracle/検証義務契約、`HARNESS-L2-010/011`のpack/call version・依存・scope・receipt契約、case artifact identity/schema、source利用権限と対象data class。oracleまたは操作許可がunknown/missing/conflictなら該当caseを確定せず保留する。
- **特定操作時のみ**：boundary case生成時は仕様で定義された境界、取消case生成時はstate transition上の取消可否、権限case生成時は承認済みactor/action permission、external double生成時は対象サービスの呼出し・失敗・副作用契約を要求する。選択されない操作familyは当該実行の必須条件ではない。
- **選択した入力元に応じて必須**：選択したAPI schema/state model/design/oracle/external contractそれぞれのidentity、revision、互換性、対象scope。選ばれていないprovider・schema・patternは未観測として記録し、存在や適用可能性を推測しない。
- **参照資料のみ**：背景説明、旧test例、過去のlog例など、今回の期待値・権限・適用範囲を決めない資料。承認済みrequirement、security permission、適用oracleはこの区分へ落とさない。

**保証すること**：入力された規範とoracleへtraceできる候補を返し、根拠がない期待値・権限・境界は発明しない。同一の固定入力・source version・scopeからcase意味を再現できるよう、生成条件を記録する。生成caseの存在、件数、coverageは品質、欠陥不存在、実行成功の証拠としない。意味が未確定なら要求/契約ownerへ戻し、要求意味変更は`HARNESS-L2-003`/`HARNESS-L2-004`の戻し先に従う。

### HARNESS-L2-031 ログ・入力からの最小再現と回帰候補生成（単体候補、version_target 1.0）

- **所属候補（未採択）**：HELIX-HARNESS共通部品。利用先：④開発・⑤リファクタリングのfailure、⑦運用保守のincident等。PO原文の障害を本番incidentだけへ限定せず、許可されたlog/inputから再現・回帰候補を共有提供する。CORE/022のoracle/traceと選択executorの隔離実行を保持する。 HARNESS-L2-010に従い主owner候補は一つとする。記載は所属採択・v0.1収載・実装許可を生成しない。

**親L1**：`HARNESS-L1-001`, `HARNESS-L1-004`, `HARNESS-L1-005`, `HARNESS-L1-007`。`HARNESS-L1-004`の反例・証拠・戻し先と、`HARNESS-L1-001`のV-pair traceを具体化する。

**種類と境界**：単体のversioned capability pack候補。HARNESS-L2-031は許可された障害入力からsanitized reproduction candidateと回帰test candidateを作り、HARNESS-L2-022はoracle/受入意味、OS-020または利用者CIは隔離実行/result receiptを所有する。HARNESS-L2-010が031のpack identity/version/依存境界、HARNESS-L2-011がcall/input/scope/compatibility/receiptを所有し、032が選択executorへのrun-request packetを接続する。段階は①log/inputからreduction candidate生成、②選択executorへの隔離run request、③後続run resultを次のreduction inputとして受ける、④同一oracle failureが保たれた範囲を再現候補として確定、⑤修正後は別revisionの回帰run結果を後段証拠として結ぶ。将来のrun receiptや修正後passを①の前提にしない。候補生成だけでは縮小後の同一failureを確認済みと主張しない。

**受け取るもの**：障害の対象revision、bounded logと対応する入力/操作列、環境・依存版・seed（得られる場合）、取得/利用許可、sanitization規則、関連する要件/API/state contractと独立oracleの参照。副作用を再送しないためのexternal-call制約を含む。

**提供するもの**：元failureの識別子/digest、sanitized入力、最小化手順と各縮小段階、各段階の032 run-request packet、後続実行結果を受ける入力口、reproduction recipe、固定oracleで照合したobservable symptom、再現可否/不足証拠、候補regression case、修正前failure runと将来の修正後runへ結ぶscope/version trace。将来のrun resultは生成開始前入力でなく段階後の証拠であり、選択executorのreceiptが返るまで同一failure確認は未完とする。修正後resultがまだ無い場合も回帰test candidateは作れるが、回帰成立済みとはしない。

**依存区分**：
- **常時必須**：当該log/inputの対象scopeでの取得・利用許可、対象revisionとの関係、security/data handling契約、`HARNESS-L2-022`のfailure oracleまたはoracle ownerへの明示参照、`HARNESS-L2-010/011`の031 pack/call version・依存・scope・receipt契約、外部副作用の抑止条件。いずれか不明なら機微入力を処理せず保留する。
- **特定操作時のみ**：log/input minimizationと同一failure確認を選んだ時だけbounded log、入力、操作列、環境/依存版情報、HARNESS-L2-032経由で選ぶOS-020または利用者CIの隔離run request/後続result receiptを要求する。各resultを得てから次の縮小候補を作る。回帰candidate作成に必要なのは独立oracleと修正前failureの基準であり、修正後resultは候補生成の前提ではなく、修正後revisionで後段実行した結果receiptである。incident inputを扱わないrunにはincident reproductionを要求しない。
- **選択した入力元に応じて必須**：選んだlog、request payload、state snapshot、依存応答記録、OS-020または利用者CI executor等のsource identity/version、許可scope、取得時刻またはrevision結合情報、redaction結果。縮小確認では選択executorの各段階run receiptを次の段階入力として結ぶ。未選択source/executorは未観測とする。
- **参照資料のみ**：背景incident narrative、既知の似たfailure、過去の再現手順のうち、現在の入力許可・oracle・対象revisionを確定しないもの。適用oracleとsecurity/data許可は参照扱いへ落とさない。

**保証すること**：機微情報を隠し、与えられたscope内で入力を小さくし、同じoracle上のfailureが保たれるかを記録する。再現不能、根因unknown、必要な環境情報不足を明示し、元failureの事実を保持する。rerun成功で初回failureを消さず、test削除/skip、oracle弱化、coverage数値だけで修正成功を主張しない。期待挙動が上流で未決なら`HARNESS-L2-003`/`HARNESS-L2-004`に従い意味ownerへ戻す。

### HARNESS-L2-032 生成artifactからOS-020実行契約への接続（接続候補、version_target 1.0）

- **所属候補（未採択）**：HELIX-HARNESS-CORE。利用先：030/031利用サービスと選択したOS-020または利用者CI。test artifact/oracle/revision/scopeをexecutor inputへ写す業務上の接続packを所有する。CONNECTは利用時の登録・版照合・通信・再送・追跡を担い、032の業務意味は持たない。実行・隔離・結果回収は選択executorへ残す。 HARNESS-L2-010に従い主owner候補は一つとする。記載は所属採択・v0.1収載・実装許可を生成しない。

**親L1**：`HARNESS-L1-001`, `HARNESS-L1-004`, `HARNESS-L1-005`, `HARNESS-L1-007`。HARNESSが契約を外部利用可能にし、検証証拠を対象revisionと結び付ける企画を具体化する。実行主体の企画根拠は`HELIXOS-L1-004`であり、本候補はOSのrun制御をHARNESSへ移さない。

**種類と境界**：接続能力。`HARNESS-L2-030`/`HARNESS-L2-031`のcase/repro artifactから、選択した`HELIXOS-L2-020`または利用者CIへ送るversioned input/run-request packetを作る。HARNESSは検証義務/oracle/artifact identity/scope/target revisionを、OSまたは利用者CIは実行・隔離・結果収集を所有する。最初のrun receiptは032の送信入力でなく下流出力、031が次の縮小段階を選ぶ際の後続入力である。

**受け取るもの**：case/repro artifactとsource identity、適用契約/oracle版、target revision/scope、必要runner capabilityと許可条件、選択consumerの受入schema/compatibility契約。consumer receiptがまだないことを理由に初回packet接続を不能にしない。

**提供するもの**：consumer schemaに適合するrun input packet、case identityとoracle参照の対応、対象HEAD/scope/source versionの結合、未解決compatibility/permission項目、consumerへ渡した内容のreceipt参照枠。execution outcomeはconsumerが返し、HARNESSはその意味を捏造しない。

**依存区分**：
- **常時必須**：HARNESS case artifact schema、対象revision/scope、適用oracle/検証義務、consumerの明示schema/version/compatibility、security/permissionと実行境界。unknown/mismatchは保留し、不足したoracleをoptional扱いにしない。
- **特定操作時のみ**：隔離実行、network-disabled、external double注入、seed/timeout指定など、artifactで要求するrunner capabilityだけを当該run時に要求する。
- **選択した入力元に応じて必須**：選んだOS-020または利用者CI consumerのidentity/version/schemaと対応するrunner capability。未選択consumerは未観測。
- **参照資料のみ**：他consumer用の例、履歴run packet、旧CI構成など。必要なoracle/schema/permissionを参照資料へ降格しない。

**保証すること**：生成caseの意図とoracle参照を損なわずconsumerへ渡し、対象revision・scope・source versionの対応を保持する。実行・成功/failure判定・CI ticket発行・再開はconsumer責務である。受渡し成功をtest pass、品質受入、artifact state昇格とみなさない。接続契約の欠落/不整合は送り先consumerの責任ownerへ戻す。

### HARNESS-L2-033 failure-to-regression trace構成体（構成体候補、version_target 1.0）

- **所属候補（未採択）**：HELIX-HARNESS-CORE。利用先：case生成・再現・回帰を選択する各サービス。複数packを跨ぐtest/CIのtrace構成体を所有する。unit/接続成立と回帰成立を分け、014/022の意味authority、OS/利用者CIの実行を引き取らない。 HARNESS-L2-010に従い主owner候補は一つとする。記載は所属採択・v0.1収載・実装許可を生成しない。

**親L1**：`HARNESS-L1-001`, `HARNESS-L1-004`, `HARNESS-L1-005`, `HARNESS-L1-007`。対象は`HARNESS-L2-030`または`HARNESS-L2-031`の生成能力と、必要に応じ`HARNESS-L2-032`のconsumer接続を含む端から端の作成/受渡しtrace。HARNESS-L2-022の検証・受入契約は構成体の規範入力であり置換しない。

**種類と境界**：構成体候補。通常contract-derived caseとincident-derived minimized reproを、同一のartifact/execution/trace境界で結ぶ。failure inputがない通常case生成にincident reproductionを要求せず、選択した操作のみに条件付き依存を適用する。構成体自身が生成するcaseの受入receiptまたはOS run resultを、構成体を生成/開始する前提にしない。

**受け取るもの**：開始時の対象revision/scope、HARNESS-L2-022適用oracle、対の設計または許可されたincident source、必要なunit pack identity/schema/version、選択consumerを使う場合のHARNESS-L2-032 compatibility。初期入力に将来の生成receipt、run結果、修正後passを要求しない。run receiptは先行段階の後で返る結果を次段階が受ける。各sourceの許可と適用範囲を保持する。

**提供するもの**：source→failure/original input→reduction candidate→032隔離run request→後続resultで同一failure確認→regression candidate→修正前revisionでのfail→修正後revisionでのpass（修正runを選択した場合）→consumer packet/result receiptを段階順につなぐtrace、対象revision/version、failure/reproduction status、生成物ごとのscopeと不足事項。033が回帰成立を主張する時は独立oracle上で縮小前後の同一failure、修正前fail、修正後passの全条件を要し、trace/候補生成だけを成功にしない。修正後passやconsumer resultは作成開始前の入力でなく後段結果である。単体結果・接続結果を同じ成功状態へ潰さない。

**依存区分**：
- **常時必須**：対象revision/scope、HARNESS-L2-022のoracle/義務契約、少なくとも一つの選択unit能力（030または031）のidentity/version/適用範囲、artifact trace schema、安全な入力処理。
- **特定操作時のみ**：incident縮小・同一failure確認を選ぶ場合は031のsanitized incident input、必要に応じHARNESS-L2-014の対象pair/design、032 run-request connection、選択executor（OS-020または利用者CI）の各段階isolated result receiptを要求し、各result後に次のreduction candidateを生成する。回帰candidateを作るだけなら修正後run resultは要求しない。033が「回帰成立」と判定する操作では、縮小前後を同一oracleで確認し、修正前revisionのfailと修正後revisionのpassの各run receiptが後段結果として必要。case/recipe packetをrunnerへ送る場合は032 contractとconsumerを選択する。未選択operationは未実施として明示する。
- **選択した入力元に応じて必須**：選択された設計/spec/oracle/log/input/consumer contract各identity、version、compatibility、権限。未選択の設計sourceやconsumerを暗黙に補完しない。
- **参照資料のみ**：今回のsource/oracle/permissionを規定しない過去例・背景。構成体の必須traceやsecurity契約は参照に落とさない。

**保証すること**：各構成要素と適用条件の関係を追跡でき、未完/未再現/未接続/未実行の差を明示する。033の回帰成立oracleは、縮小前後の同一failure、修正前revisionでのfail、修正後revisionでのpassを独立receiptで確かめる。修正前後のrun結果は作成開始前入力ではなく段階後の証拠である。case生成・repro成立・CI pass・HARNESS-L2-022のstage受入を同一判定にしない。上流の期待結果が不足すれば要求/設計/oracle ownerへ、source permissionが不足すればsecurity/data ownerへ、consumer契約が不整合ならconsumer ownerへ戻す。

### 候補関係と1.0境界

`HARNESS-L2-014`は対の設計、`HARNESS-L2-022`はoracle/義務/stage受入契約を所有し、`HARNESS-L2-030`/`031`はそれらを入力にする独立versioned capability pack/unit、`HARNESS-L2-032`は選択executorへの接続、`HARNESS-L2-033`は全段階を追う構成体を所有する。HARNESS-L2-010は各pack identity/version/依存境界、HARNESS-L2-011はcall/input/scope/compatibility/receiptを所有する。既存014/022の置換・意味変更ではない。PO第4項が求めるtest/data/double/repro/regression能力を含む一方、v0.1収載、必要case数、coverage率、mutation閾値、reduction上限、全欠陥不存在の保証は未採択。実行は選択したOS-020または利用者CI、oracle authorityはHARNESS-L2-022/上流requirementに残す。030/031/032のpackまたは依存契約を交換・更新した場合、HARNESS-L2-010/011のversion/compatibility照合後、影響を受ける未実行candidate・artifact・consumer packetを新revisionへ結び直し、選択したoperationのcase/oracle/reduction・consumer適合性を再検証する。HARNESS-L2-014の対設計またはHARNESS-L2-022のoracle/義務契約が更新された場合も、それに依存するcase/repro/regression candidateのtrace・期待値・適用scopeを新契約へ再照合し、不一致はstaleとして該当operationを再生成/再検証する。旧pack/result receiptを新版の合格へ流用しない。

## 旧計測契約の条件引継ぎ（REG-03・追補候補）

### HARNESS-L2-034 要求別の計測契約と完成判定（コアの単体候補、version_target 1.0）

- **親**：HARNESS-L1-001／004／005、Conceptの1.0土台「計測」とCOREの検証契約。HARNESS-L2-022の段階判定へ計測義務を渡す能力であり、022の判定やOSの実行を別実装しない。
- **利用者の結果**：対象要求・非機能要求について、何をどの条件で測り、何を満たせば完成と判断できるかを確認できる。テストが成功していても、必要な計測が不足する対象を完成と取り違えない。
- **入力**：対象の要求／非機能要求とrevision、適用scope、対の設計・受入、環境・負荷・dataの条件、既決の目標・判定根拠、計測結果と出所。値・形式の未確定をAIが既決として補わない。
- **提供**：要求ごとの版付き検証・計測契約。少なくともmetric ID、対象requirement/NFR、測定対象、workload/environment/data、baseline、target/SLO、許容差、sampling/window、tool/probe、evidence schema、判定oracle、owner、実行layer、再測定triggerを区別して保持する。必須項目の欠落を別項目や自由記述で相殺しない。具体的な値・schema・probe選定は通常のL3要件で根拠付きに導出する。
- **品質領域の保証**：性能、信頼性、可用性、回復性、security、privacy、accessibility、互換性、運用性、保守性、cost/resource、data quality、observabilityを対象に、適用する条件と理由付き非適用を確認する。判断材料不足はunknownとして残し、非適用や無制限へ変えない。すべての製品に同じ数値・環境を押し付けない。
- **判定の保証**：対象要求で必須としたmetricの未測定、stale、非代表環境、閾値未達が一つでもあれば、その対象のsystem completionを成立させない。code/doc/testのgreen、別環境・別revisionの結果、他metricの好成績で相殺しない。HARNESS-L2-022のVerifiedとAcceptedを区別し、実測結果から要求合意や利用者受入記録を生成しない。
- **工程の保証**：計測方法の設計→probe/fixtureの実装→局所からsystemへの検証→利用実態の受入→時間軸/SLO/改善効果の運用評価を、現行の対の設計・証拠へ接続する。旧L5／L7等の層番号を新世代へ転記せず、L3で各実行責務と現行layerを対応づける。計測のoverheadと再現条件を残し、本番secret／PIIを計測のために露出しない。
- **責務の保証**：HARNESSは契約と義務・判定を持つ。OSまたは利用者の実行手段が許可範囲内で計測し証拠を返す。INFRASTRUCTUREはHELIX本体の資源・環境の観測、LABOは選択した比較評価を持ち、その結果だけで製品の要求適合・完成・authorityを確定しない。
- **失敗と引継ぎ**：不足field、unknownの目標、古い結果、代表性不明、未達を個別に示し、契約・設計・環境・測定・要求の該当ownerへ返す。再測定trigger、停止理由、未完のmetricを保持する。意味を保った技術具体化はL3へ進め、要求意味を変える必要があるものだけをHARNESS-L2-003／004のBackflowへ戻す。
- **常時必須の依存**：対象要求とrevision、HARNESS-L2-022の段階・oracle契約、COREのtrace、適用条件と判断出所。
- **特定操作時の依存**：実測時の実行手段・資源・既存SECURITY/data-use境界。機構間通信を使う場合のCONNECT契約。計測契約の起草に実測の完了を要求しない。
- **選択入力元**：OSまたは利用者のCI／計測手段。比較評価を使う場合のLABO、HELIX本体資源を観測する場合のINFRASTRUCTURE。外部利用にHELIX内部の管理機構一式を要求しない。
- **参照のみ**：旧計測source、技術選定の資料、後続版の高度な観測能力。後続版INFRASTRUCTURE能力を1.0の必須依存へ前倒ししない。

旧sourceは `LEGACY-ASSET-02319C2481B9E01698D5` revision 3、`archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:245–252`（SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`）。補助sourceの `REQSRC-SUP-00192〜00194` に原文が残る。品質領域、14項目、4失敗条件、工程・秘密保護・overhead・再現性を意味再導出して保持し、旧runtime、層番号、固定技術は転用しない。候補は元のHARNESS-L2-003／004／005／018／022の本文を置換しない。2026-09-28のPO判断が固定した250候補の採用を、この追補revisionの採用や実装許可へ継承しない。

### HARNESS-L2-035 要求候補の導出根拠と受入への寄与の照合（CORE単体追補候補、1.0）

- **親・状態**：HARNESS-L1-008。`version_target: 1.0`、未採択の追補候補。既存008/024の要求形成に、scopeの根拠を後付けの候補だけで循環させない照合を具体化する。人の指示を受けて候補を起こすことと、その候補を採用済みにすることを分ける。
- **入力**：対象機能・要求候補、目的・scope/non-goal、原指示とその出所、対象Concept/L1/既存要求のrevisionとauthority状態、候補までの導出関係、寄与する受入条件、必要性・代替案・適用予算の根拠を受け取る。原指示は指示として保持し、記録されたことだけで対象revisionの合意へ変換しない。
- **提供・保証**：各候補について、原指示または該当する上流revisionまでの導出経路、受入への寄与、不要なscope拡張の有無、代替案との違い、予算消費の根拠、不足・矛盾を返す。根拠のある上流から候補へ至る関係と、その関係のauthority状態を辿れることを要する。候補自身、同時に作った要求ID同士、AIの提案だけを互いの唯一の根拠にして正当化しない。要求番号があることや台帳登録があることを根拠充足としない。
- **循環と未完の区別**：根拠の導出関係が循環する、上流が存在しない、対象revisionが異なる、出所の状態が不明な場合、根拠充足を主張せず不足として要求形成へ戻す。正常なFeedback循環、sourceからの訂正履歴、実行の反復をこの導出関係と混同して一律に拒否しない。単にgraph形が非循環でも、上流の意味に含まれない能力ならscope逸脱として返す。
- **必要性の照合**：最小性は、選択scopeの受入・安全・依存条件へ必要な寄与を持つか、不要な拡張や代替可能性を説明できるかを検査する意味とする。全体最適の数値や唯一の実装方式をここで推定しない。後続版・先行投資として根拠のある候補を、初版の最小構成に入らない理由だけで削除しない。budgetの値が不明なら不明として区別し、0と見なしたり新しい人間承認手続きを加えたりしない。
- **依存・責務**：常時必要なのは008/024の対象sourceと上流意味・候補・受入条件。OSを使う構成ではOSのauthority/記録・ticket登録へ結果を渡すが、COREの意味照合をOSへ移さず、OSの実行権限をCOREが決めない。外部の管理機構やCIをCORE単体の成立に必須化しない。実装・実行は別操作であり、本照合の結果から許可しない。
- **失敗時**：原文・上流revision不足はsource ownerへ、意味衝突・根拠循環・不要拡張は要求形成の訂正へ戻し、該当候補と不足根拠を保持する。人が決める要求意味の差がある場合だけ、原文・選択肢・推奨・影響先を付けて既存の人間判断へ返す。
- **旧source**：旧`infinity-loop-platform-requirements.md`（`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`）のHIL-FR-38（128行）とHIL-NFR-23（203行）、およびRequirement IRの同identityを起点に、scope根拠・受入寄与・最小性・代替案・budget根拠・循環拒否を保持する。旧L0表記は現行Concept/L1等の上流へ対応させ、旧Scope Authority Gateというruntimeや毎操作のgateを新設しない。sourceの正確なpath・行・SHAとIR対応は被覆receiptに保存する。

### HARNESS-L2-036 検証観点の完全性とローカル・CIの同一契約（CORE単体候補、1.0）

**状態**：追加候補。2026-09-28に明示された採択集合には含まれず、未採択。`version_target: 1.0`候補。要求・設計・実装・CIの採択または実装許可を生成しない。

**親L1**：`HARNESS-L1-001`, `HARNESS-L1-004`。L1-004の対象revisionとriskに合う検証義務、反例、証拠、差戻し条件、およびL1-001の正規V-pairに基づく。L1にない検証閾値や全環境一律実行を追加しない。

**kind・scope**：HELIX-HARNESS-COREの共通検証契約に属するunit候補。対象revision、ticket、risk、変更範囲および適用するdriveを持つテスト設計・検証gateを扱う。実行、CI編成・運転、ログ/state管理はHELIX-OSの責務であり、本候補はそれらを実行しない。

**既存責務との関係**：`HARNESS-L2-005`はticket・変更範囲・riskから必要な検証を選び、CIに組み立てる規則を所有する。`HARNESS-L2-022`は段階ごとのverification/acceptance oracleと証拠契約を所有する。036は選択された検証プロファイル内で、テスト観点の抜け・レベル間重複とdev-local/CI間の契約差を検査する限定能力であり、005のticket導出、022のoracle、OSの実行責務を置換しない。PR前のticket/riskに応じた検証、Forward小/中/大、危険度の高い変更の早期上位証明、省いた検査の記録と合流先ticketでの回収を維持する。全test段階、全ticket、全環境の同時・全件実行は要求しない。

**入力**：同一対象revisionに結び付く現行の設計成果、テスト設計成果、test-level定義、対象ticketとその適用profile、変更範囲/risk、drive判定、適用可能な要求・設計oracleおよび必要なsource版。成果物の形式は固定せず、現行形式が提供するscope・観点・trace情報を用いる。UI/FE対象の場合はL2 prototype／screen scope、design-token SSOT、対象画面のscreenshots、state transition定義を渡す。未選択driveは未観測として扱い、FE条件を暗黙に適用しない。

**出力**：適用scopeを明示した観点と設計項目の対応、観点抜け一覧、レベル間の重複一覧、pass/failと根拠。対象ticketで選択された同一lint/gate契約をdev-localとCIの双方が参照できる版付き判定入力・結果照合情報を返す。`drive=fe`では5軸ごとの`DetectorResult`（pass/failと詳細）およびCI証跡へのrelationを返す。省略がある場合はHARNESS-L2-005に従い理由と回収先ticketを保持する。

**保証すること**：

- 対象scope内で現行設計成果・テスト設計成果・test-level定義を静的に照合し、設計項目に対応しない必要テスト観点または同一観点のレベル間重複を一覧化してWゲートをfailとする。NFR-13由来の「抜け／重複0件」はこの適用scopeの判定条件として保持する。適用外の項目を適用済みと数えない。
- ticket/riskから選ばれた同一lint/gateの内容snapshot・契約版・scopeをdev-localとCIで照合し、片側だけの実行、異なる内容/設定、対象snapshot/revision/scopeの不一致、または結果の欠落を同一条件の検証済みとして扱わない。dev-localとCIのcommit SHA一致は要求せず、editor側で失敗した場合はcommit前の局所修正へ戻す。OSが該当ticketで実行対象と実行時点を編成する。全環境同時実行を036が追加しない。
- `drive=fe`では`mock-promotion`、`design-token-drift`、`a11y-regression`、`visual-regression`、`state-transition-drift`の5軸すべてを決定論的に判定し、各軸のpass証跡を要求する。いずれかのfailまたは証跡欠落はsilent passにしない。非FE driveではこの5軸を必須化しない。
- cross-detectionの適用scope内で、依存漏れ、契約漏れ、接続欠損、デグレをそれぞれ検出・報告し、対象gateの合格では各0件を保つ。結果には対象revision、profile/scope、該当箇所、期待条件、観測内容を含める。unknownを0件扱いしない。
- NFR-13のgate通過率「≥90% (KPI D-02、B5=b)」を運用目標として保持する。適用母集団・期間・分母はL3で照合し、意味を変更する場合はPO判断へ戻す。これはticketごとのpass閾値ではない。
- 根拠となるoracle、revision、適用scopeが不足・stale・conflictなら対象の検証結果を保留し、unknownをpassやN/Aへ変えない。要件・oracleの意味差はHARNESS-L2-008または022の責務へ戻す。OSは選択された実行を行い、結果とreceiptを保存する。

**依存区分**：

- **常時必須**：対象revision/ticket/scope、HARNESS-L2-005の適用profileと省略・回収条件、HARNESS-L2-022の対oracle・証拠契約、現行の設計成果・テスト設計成果・テストレベル定義、実行する同一lint/gateの識別子と版。
- **特定操作時のみ**：ticketで検証gateを実行するときは、同じgateをdev-localとCIの両面で照合する。editorで失敗したときはcommit前の局所修正へ戻す。CIに載せる検査の段数・範囲はHARNESS-L2-005のticket/risk規則で決め、全件を一律に実行しない。`drive=fe`の検証操作では下記5軸を適用する。
- **選択した入力元・適用scopeに応じて必須**：`drive=fe`なら、L2 prototype／screen scope、design-token SSOT、対象screenshots、state transition定義と5軸すべてのoracle/証跡を照合する。FE driveを選択していない対象ではFE証跡を要求しない。drive=feの5軸はどれもN/Aとして除外しない。
- **参照資料のみ**：旧hook名、旧CI job名、旧DB/log path、過去の実装例は要求の出所を示す資料であり、現行runtime依存ではない。

**正常・誤り・未見の境界**：

- 正常：あるticket profileが単体gateだけを選び、設計項目ごとの該当観点が一度ずつ対応する。dev-localとCIが同版・同設定で結果を返し、適用された観点に抜け・重複がないためWゲートはpassする。未選択のsystem testを実行済みとは主張しない。
- 誤り：テスト観点が設計項目に対応しない、同じ観点を複数levelで重複計上する、またはFE driveにおいて5軸の一つの証跡がない／failする場合は該当scopeをfailまたは保留する。editorではpassしたがCIは旧版・別設定を実行した場合、二重実行の契約成立としない。
- 未見：未公開の同scope設計項目を追加し、既存のテストレベル定義とoracleから適用観点を照合する。根拠のある対応がない観点は不足、oracleがない場合は未評価として返す。未知のdriveは未評価とする。`drive=fe`が選択済みなら未見fixtureを理由に5軸の一部を省略せず、5軸すべてに対する結果を照合する。

**旧source・保持/変更**：

- `LEGACY-ASSET-6B6C5CB0E481BE01088B`、`docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/functional-requirements.md:52`（FR-L1-21、file SHA-256 `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`、行SHA-256 `b54119ad033bcb2f01c1977710d76249ab80a2789422ed02afa3c54d6ac3799b`）。原文条件は「テスト観点 W 字ゲート (設計項目へのテスト観点抜け検出 + レベル間重複検出を static で fail-close)」。静的な抜け・重複検出とfail-closeを保持し、現行のticket-selected scopeへ適用する。
- 同asset `docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/functional-requirements.md:53`（FR-L1-22、同file SHA、行SHA-256 `1cc6f208ebbbb6d900d791e546db07b6047e7a07e6a2071817391191b3abbdf9`）。原文は「FE detector 5 軸 (mock-promotion / design-token-drift / a11y-regression / visual-regression / state-transition-drift) の決定論的判定」、入力にL2 mock/design-token SSOT/screenshots/画面遷移定義、出力にDetectorResult pass/fail+詳細とCI証跡を指定する。軸・条件付き適用・出力を保持し、旧spec実装の移植はしない。
- `LEGACY-ASSET-5429AA05B022E9F49B0A`、`docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/nfr.md:31`（NFR-06、file SHA-256 `4853a43c5ea12354dc2dab20dc3a52b15ff6be075e49fdaf1bff26280e992122`、行SHA-256 `0e1efa8f6017fd18bc55f46f1c9096c64cf3e0c2d7e73d8abef3bc3ed43c0c80`）。`drive=fe`のとき5軸pass証跡を必須にするfail-closeを保持する。旧`blockOnFailure=true`、exit code、stdin、hook等は現行の実装指定にしない。
- 同asset `docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/nfr.md:51`（NFR-13、同file SHA、行SHA-256 `e1be1261c63355fe7439bad12c1c60df6fc130a91713a7a862169a7e5dbde0a1`）。原文条件は「同一 lint/gate を dev-local (editor PreToolUse / pre-commit) と CI (GHA harness-check) の両方で実行し、editor で fail なら commit 前に局所修正 loop に戻す」、cross-detectionの依存漏れ／契約漏れ／接続欠損／デグレとW抜け／重複の「0 件維持」、gate通過率「≥90% (KPI D-02、B5=b)」。同一適用gateの内容snapshot・契約版・scopeの二面照合、局所修正loop、各0件条件を保持する。旧hook/GHA名は現行実装依存にしない。≥90%は運用目標として保持し、適用母集団・期間・分母をL3で照合する。これを意味変更する場合はPO判断へ戻し、根拠なく個別gateの閾値にしない。全ticketで全検査を同時実行する拡張も行わない。
