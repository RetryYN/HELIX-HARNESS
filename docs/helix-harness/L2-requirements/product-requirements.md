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

- **NFRの識別・根拠と閾値の区別**：計測契約にはstable NFR identity、quality characteristic、source authorityと対象surfaceを結び、error budgetと超過不可のhard limitを通常targetから区別する。未知のbaselineや閾値を推測してgreenにしない。既存034の14項目へ意味を統合して表現しても、これらの条件を脱落させない。
- **品質条件の分類**：既存13品質領域に加え、AIを含む対象では判断再現性、Worker/verifierの独立性、根拠との対応、反復の停止性、費用、provider縮退、memory汚染耐性を適用scopeごとに照合する。非AI対象へ一律に課さず、非適用には対象と理由を記録する。品質の能力要求、観測可能な挙動、技術選択、閾値運用、環境値を分け、旧技術選定をNFR意味へ混在させない。
- **永続化・並行運転の測定**：対象がDB/投影/継続stateを使う場合は、data量、query/projection p95/p99、lock待ち、busy timeout時の縮退、再構築、archive/保守、並行実行、長時間soakを必要な測定条件へ対応させる。旧harness.db、SQLite、vacuum commandの採用は要求せず、選んだ保存方式の対応条件をL3で導出する。再現していない単一障害の原因を確定事実にしない。
- **異常条件と検証手法**：gate・approval・cutover・projection・GitHub・memory・feedbackに相当する対象の権限/状態境界について、fault injection、race、soak、crash recoveryの適用条件を検証契約に残す。property-based、model-based state machine、differential、mutation、fuzz、snapshot compatibilityをriskから選び、選択/非適用の根拠を残す。全ticketの固定CI手順にはせず、HARNESS-L2-005の選択・未完義務回収に従う。試験手法の追加を完成証拠にしない。
- **時系列と改善の接続**：実測値を時点・対象revision・要求・release・regression・改善episodeへ辿れる形で保持し、計測履歴と比較の母集団を維持する。旧P4 event schemaを正本へ戻さず、OSの証拠記録とLABOの改善評価へ同じ因果関係を渡す。計測契約の作成開始に、未来の実測値や改善完了を要求しない。

旧source追補：`LEGACY-ASSET-02319C2481B9E01698D5`のHR-NFR-REG-001〜007（監査基準6fabd125:354–360、PREISO:369–375）を同一条件の別revisionとして保持する。旧NFR registryのschema/層番号/DB/metric event実装を現行へコピーせず、034の計測契約と005のticket/risk選択へ意味再導出する。元の13領域・14項目・4拒否条件を削除しない。未採択追補であり250候補の採択は継承しない。

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

**kind・scope**：HELIX-HARNESS-COREの共通検証契約に属するunit候補。対象revision、ticket、risk、変更範囲および画面適用条件を持つテスト設計・検証gateを扱う。実行、CI編成・運転、ログ/state管理はHELIX-OSの責務であり、本候補はそれらを実行しない。

**既存責務との関係**：`HARNESS-L2-005`はticket・変更範囲・riskから必要な検証を選び、CIに組み立てる規則を所有する。`HARNESS-L2-022`は段階ごとのverification/acceptance oracleと証拠契約を所有する。036は選択された検証プロファイル内で、テスト観点の抜け・レベル間重複とdev-local/CI間の契約差を検査する限定能力であり、005のticket導出、022のoracle、OSの実行責務を置換しない。PR前のticket/riskに応じた検証、Forward小/中/大、危険度の高い変更の早期上位証明、省いた検査の記録と合流先ticketでの回収を維持する。全test段階、全ticket、全環境の同時・全件実行は要求しない。

**入力**：同一対象revisionに結び付く現行の設計成果、テスト設計成果、test-level定義、対象ticketとその適用profile、変更範囲/risk、画面の有無とL2.5 Prototype適用の判定記録、適用可能な要求・設計oracleおよび必要なsource版。成果物の形式は固定せず、現行形式が提供するscope・観点・trace情報を用いる。画面を持つ対象の場合はL2 prototype／screen scope、design-token SSOT、対象画面のscreenshots、state transition定義を渡す。画面の有無・適用判定がunknownなら未評価でHARNESS-L2-003/008の要求形成・Prototype適用判断へ戻す。

**出力**：適用scopeを明示した観点と設計項目の対応、観点抜け一覧、レベル間の重複一覧、pass/failと根拠。対象ticketで選択された同一lint/gate契約をdev-localとCIの双方が参照できる版付き判定入力・結果照合情報を返す。画面を持つticket対象の合意済みscreen scopeでは5軸ごとの`DetectorResult`（pass/failと詳細）およびCI証跡へのrelationを返す。省略がある場合はHARNESS-L2-005に従い理由と回収先ticketを保持する。

**保証すること**：

- 対象scope内で現行設計成果・テスト設計成果・test-level定義を静的に照合し、設計項目に対応しない必要テスト観点または同一観点のレベル間重複を一覧化してWゲートをfailとする。NFR-13由来の「抜け／重複0件」はこの適用scopeの判定条件として保持する。適用外の項目を適用済みと数えない。
- ticket/riskから選ばれた同一lint/gateの内容snapshot・契約版・scopeをdev-localとCIで照合し、片側だけの実行、異なる内容/設定、対象snapshot/revision/scopeの不一致、または結果の欠落を同一条件の検証済みとして扱わない。dev-localとCIのcommit SHA一致は要求せず、editor側で失敗した場合はcommit前の局所修正へ戻す。OSが該当ticketで実行対象と実行時点を編成する。全環境同時実行を036が追加しない。
- 画面を持つticket対象の合意済みscreen scopeでは`mock-promotion`、`design-token-drift`、`a11y-regression`、`visual-regression`、`state-transition-drift`の5軸すべてを決定論的に判定し、各軸のpass証跡を要求する。いずれかのfailまたは証跡欠落はsilent passにしない。非画面と根拠付きで判定された対象ではこの5軸を必須化しない。
- cross-detectionの適用scope内で、依存漏れ、契約漏れ、接続欠損、デグレをそれぞれ検出・報告し、対象gateの合格では各0件を保つ。結果には対象revision、profile/scope、該当箇所、期待条件、観測内容を含める。unknownを0件扱いしない。
- NFR-13のgate通過率「≥90% (KPI D-02、B5=b)」を運用目標として保持する。適用母集団・期間・分母はL3で照合し、意味を変更する場合はPO判断へ戻す。これはticketごとのpass閾値ではない。
- 根拠となるoracle、revision、適用scopeが不足・stale・conflictなら対象の検証結果を保留し、unknownをpassやN/Aへ変えない。要件・oracleの意味差はHARNESS-L2-008または022の責務へ戻す。OSは選択された実行を行い、結果とreceiptを保存する。

**依存区分**：

- **常時必須**：対象revision/ticket/scope、HARNESS-L2-005の適用profileと省略・回収条件、HARNESS-L2-022の対oracle・証拠契約、現行の設計成果・テスト設計成果・テストレベル定義、実行する同一lint/gateの識別子と版。
- **特定操作時のみ**：ticketで検証gateを実行するときは、同じgateをdev-localとCIの両面で照合する。editorで失敗したときはcommit前の局所修正へ戻す。CIに載せる検査の段数・範囲はHARNESS-L2-005のticket/risk規則で決め、全件を一律に実行しない。画面対象の検証操作では下記5軸を適用する。
- **選択した入力元・適用scopeに応じて必須**：画面対象なら、L2 prototype／screen scope、design-token SSOT、対象screenshots、state transition定義と5軸すべてのoracle/証跡を照合する。非画面と根拠付きで判定された対象ではFE証跡を要求しない。画面対象の5軸はどれもN/Aとして除外しない。
- **参照資料のみ**：旧hook名、旧CI job名、旧DB/log path、過去の実装例は要求の出所を示す資料であり、現行runtime依存ではない。

**正常・誤り・未見の境界**：

- 正常：あるticket profileが単体gateだけを選び、設計項目ごとの該当観点が一度ずつ対応する。dev-localとCIが同版・同設定で結果を返し、適用された観点に抜け・重複がないためWゲートはpassする。未選択のsystem testを実行済みとは主張しない。
- 誤り：テスト観点が設計項目に対応しない、同じ観点を複数levelで重複計上する、または画面対象において5軸の一つの証跡がない／failする場合は該当scopeをfailまたは保留する。editorではpassしたがCIは旧版・別設定を実行した場合、二重実行の契約成立としない。
- 未見：未公開の同scope設計項目を追加し、既存のテストレベル定義とoracleから適用観点を照合する。根拠のある対応がない観点は不足、oracleがない場合は未評価として返す。画面適用判定が不明なら未評価とする。画面対象と判定済みなら未見fixtureを理由に5軸の一部を省略せず、5軸すべてに対する結果を照合する。

**画面適用の出所と戻し先**：HARNESS-L2-001/003のScreen Applicability記録（対象要求revision、画面の有無、理由、判定者、HEAD、再評価条件）と、当該ticketが参照する合意済みL2.5 Prototypeのscreen scopeから5軸の対象を特定する。OSはこの根拠をticket/profileへ結び付け、036は一致を照合する。画面があるのにscreen scopeや合意が欠けるときは非適用にせず、該当検証を保留して003/008へ戻す。非画面でPoCだけを要する場合はFE適用にしない。画面追加・scope変更・判定revision更新時は適用を再照合し、以前の非適用を流用しない。

**旧source・保持/変更**：

- `LEGACY-ASSET-6B6C5CB0E481BE01088B`、`docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/functional-requirements.md:52`（FR-L1-21、file SHA-256 `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`、行SHA-256 `b54119ad033bcb2f01c1977710d76249ab80a2789422ed02afa3c54d6ac3799b`）。原文条件は「テスト観点 W 字ゲート (設計項目へのテスト観点抜け検出 + レベル間重複検出を static で fail-close)」。静的な抜け・重複検出とfail-closeを保持し、現行のticket-selected scopeへ適用する。
- 同asset `docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/functional-requirements.md:53`（FR-L1-22、同file SHA、行SHA-256 `1cc6f208ebbbb6d900d791e546db07b6047e7a07e6a2071817391191b3abbdf9`）。原文は「FE detector 5 軸 (mock-promotion / design-token-drift / a11y-regression / visual-regression / state-transition-drift) の決定論的判定」、入力にL2 mock/design-token SSOT/screenshots/画面遷移定義、出力にDetectorResult pass/fail+詳細とCI証跡を指定する。軸・条件付き適用・出力を保持し、旧spec実装の移植はしない。
- `LEGACY-ASSET-5429AA05B022E9F49B0A`、`docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/nfr.md:31`（NFR-06、file SHA-256 `4853a43c5ea12354dc2dab20dc3a52b15ff6be075e49fdaf1bff26280e992122`、行SHA-256 `0e1efa8f6017fd18bc55f46f1c9096c64cf3e0c2d7e73d8abef3bc3ed43c0c80`）。`drive=fe`のとき5軸pass証跡を必須にするfail-closeを保持する。旧`blockOnFailure=true`、exit code、stdin、hook等は現行の実装指定にしない。
- 同asset `docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/nfr.md:51`（NFR-13、同file SHA、行SHA-256 `e1be1261c63355fe7439bad12c1c60df6fc130a91713a7a862169a7e5dbde0a1`）。原文条件は「同一 lint/gate を dev-local (editor PreToolUse / pre-commit) と CI (GHA harness-check) の両方で実行し、editor で fail なら commit 前に局所修正 loop に戻す」、cross-detectionの依存漏れ／契約漏れ／接続欠損／デグレとW抜け／重複の「0 件維持」、gate通過率「≥90% (KPI D-02、B5=b)」。同一適用gateの内容snapshot・契約版・scopeの二面照合、局所修正loop、各0件条件を保持する。旧hook/GHA名は現行実装依存にしない。≥90%は運用目標として保持し、適用母集団・期間・分母をL3で照合する。これを意味変更する場合はPO判断へ戻し、根拠なく個別gateの閾値にしない。全ticketで全検査を同時実行する拡張も行わない。

旧`drive=fe`は原文として保持するが、現行の起動enumにはしない。2026-09-24 PO判断 `docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:75-78` のticket化、およびHARNESS-L2-001/003の画面適用判断へ対応させる。5軸とfail-closeは保持し、適用の出所を画面有無・合意したscreen scope・対象ticketへ再導出する。旧drive fieldの不在で画面検証を脱落させず、非画面のPoCへ拡張しない。

### HARNESS-L2-037 HELIX W二段設計を合流する（composite candidate）

**状態**：新規L2候補。現行の明示採択集合に含まれず、未採択。`version_target: 1.0`候補。独立した要求identityであり、実装許可、設計承認、要件承認、利用者受入を生成しない。

**親L1**：`HARNESS-L1-001`, `HARNESS-L1-004`, `HARNESS-L1-009`。L1-001は上流意図から運用評価までを正規V-pairで構成する根拠、L1-004は検証義務・反例・証拠・差戻し条件、L1-009は要求の種類・構成に合うtemplateから設計義務を導く根拠である。複数Phaseの出力をつなぐ専門workflowを、対象・構成に応じて適用するcomposite能力として具体化する。L1は上流価値を付け足さず、既存L1の意味を変更しない。現行L1-001/009の正規pair・要求構成に応じた設計義務という射程から専門workflowの候補を具体化でき、L1の意味差分は不要である。L1-004はその設計に対するverification pairとevidenceの根拠となる。

**kind・scope・所属**：HARNESS-COREに属する新規composite候補であり、新しいサービスではない。現行`HARNESS-L2-009`が要求kind・target・構成・risk・domainから適用可能なDesign Templateと設計義務を導出し、その版付き適用契約が一般system設計（Phase 1）に続くagent固有設計（Phase 2）を示すscopeに限って適用する。旧`drive=agent`という値だけでは起動しない。2026-09-24のPO判断（docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:75-78）で旧駆動モデルはticket種別へ置き換えられ、Scrum等の開発styleとは別軸とされたため、旧値は現行入力schemaに持ち込まず、009の現行要求分類とtemplate適用判断へ意味を移す。Wを通常の開発style、V-pairそのもの、またはcase-driven modelと同一視しない。旧A-74に従いHARNESS自身の開発には適用せず、外部の対象agent systemへ提供する能力とする。

**既存責務との境界**：

- `HARNESS-L2-009`は対象・要求kind・構成・risk・domainに適したDesign Templateと設計義務、および不足inputのBackflowを所有する。037はPhase間のtrace、二段成果物のscope分離、合流条件を所有し、templateの意味や要求を独自に作らない。
- `HARNESS-L2-026`は個々の要求から相互参照する設計unitと対の検証設計を構成する。`HARNESS-L2-025`はunitを束ねた汎用composite設計の整合を確認する。037はこれらを二段の対象scopeで利用し、単体設計の重複生成も汎用composite義務の置換もしない。候補が適用中なら、それぞれの契約版・receipt・scopeを照合する。
- `HARNESS-L2-022`は各段階のoracle・証拠・状態契約を所有する。037の統合設計成果だけからL3/L10 Verified、L2/L11 Accepted、L1/L12 Observedを生成しない。両Phaseの合意済みL2要求・承認済みL3要件とsystem固有義務の検証は現行L3↔L10 pairで022に渡し、L2↔L11受入、L1↔L12運用評価には別々の条件とtraceを渡す。
- Phase間の設計合流規則は037、CI/Workerの実行・state保存・工程運転はHELIX-OS。HARNESSは「何を満たすか」と差戻し条件を定め、OSは選択された運転契約を適用する。

**開始時入力**：対象product/systemとrevision、要求kind・target・構成・risk・domain、HARNESS-L2-009による適用template/義務/契約版の導出結果、対象scopeを覆うPhase 1の合意済みL2要求・承認済みL3要件とauthority/revision、Phase 1で用いる一般system設計入力とそのtemplate契約。これらで二段scopeが確定した後にPhase 1設計を開始する。開始時にPhase 1/2の設計成果やL9実行結果を要求しない。

**後段入力・受渡し**：Phase 1のL4設計成果ができた後、その成果に対する現行L9対検証receiptを取得し、Phase 2固有の要求形成へ渡す。Phase 2のL4設計成果ができた後にそのL9対検証receiptを取得する。両段階のrevision付き成果・receipt・traceがそろってから合流処理へ進む。旧drive名、`phase.yaml`、旧関数/API名を入力schemaとして固定しない。

**出力**：段階ごとに、対象・revision・scopeを分けたPhase 1 L4設計成果、Phase 1のL9対検証receipt、Phase 2 L4設計成果、Phase 2のL9対検証receiptを記録する。合流出力は両段階のreceiptを入力として、一般system制約からagent固有設計への引継ぎtrace、未解消gap/不整合一覧、L3要件とL10 system oracleで照合可能な統合設計成果または未合流状態を返す。さらにL2/L11 acceptanceおよびL1/L12 observationへの接続traceを持つ。L10判定結果自体はHARNESS-L2-022が所有する。出力には対象revision、参照した契約版、根拠、適用限界、差戻し先を結ぶ。

**保証すること**：

- 適用scopeではPhase 1（一般system）とPhase 2（agent昇華）を別個の設計成果として追跡し、双方のL4設計成果とL9対検証成果、およびPhase間の整合を失わない。Phase 2はPhase 1の承認済みsystem contract/invariantを満たすか、そこから変える必要のある意味差を明示する。
- 統合設計成果を現行のL3要件とL10 system oracleへ渡し、Phase 1の一般system条件、Phase 2のagent固有条件、および両者の差分を同じ対象revisionで照合できる。片方を省略して他方をmergedと呼ばず、下位成果の列挙だけで構成体を合格にしない。L10の合否はHARNESS-L2-022に従う。
- 旧FR-L1-28がいうL11〜L12統合flowは、現行のL2要求↔L11利用者受入とL1意図↔L12運用評価のtraceに対応させる。両pairの固有契約は別々に満たし、統合設計やL10検証から受入・観測結果を推定しない。
- 旧sourceが示すPhase 1（一般system）からPhase 2（agent昇華）への依存順、各Phaseの対付き設計成果、合流後のsystem検証、および受入・運用評価へのtraceを保つ。この二つの意味段階と順序は037の適用scopeでは必須である。追加の全対象固定workflowや一律の運用substepを新設するものではない。旧sourceにあるL9/L10/L11-L12は旧時代の層番号として記録し、現行HARNESS-L2-001のpair（L4↔L9、L3↔L10、L2↔L11、L1↔L12）に意味対応させる。旧artifact名、固定phase field、旧tool/runtime、実装順の細部を現行契約へ移さず、L2-001/022の段階・pair定義を上書きしない。画面上の特定trace表示は全scopeへ一律必須化しない。ただし選択scopeにtrace UIが含まれる場合は、画面上でPhase 1/2の状態、対象revision、合流状態と未解消gapを追跡できることを受入条件とする。UIを含まないscopeでは、同じ情報を該当する設計・検証artifactで追跡できることを求める。

**依存区分**：

- **常時必須**：対象revision/scope、各Phaseの適用段階で必要なL2合意・L3承認のauthority、HARNESS-L2-009の適用template/義務/契約版、Phase間handoff契約、HARNESS-L2-022の現行pair/state/oracle契約。これは開始前に必要な契約であり、後段で生成されるPhase成果や実行receiptを開始前提にはしない。authority、適用契約または必須oracleがunknown/stale/missingなら、その範囲の設計開始または合流を保留する。
- **特定操作時のみ**：009で二段scopeと判定された設計操作に限り、Phase 1のL2合意/L3承認→Phase 1設計・実装/対検証→Phase 2のL2形成/合意・L3要件/承認→Phase 2設計・実装/対検証→両receiptを用いた合流の順で処理する。各L9 receiptは対応する設計成果の生成後に取得し、次段または合流の入力とする。一般system設計だけを行う操作では037を起動しない。統合後にL3↔L10検証、L2↔L11受入、L1↔L12運用評価へ進む場合はそれぞれの段階契約に従うが、037がそれらの結果を前提・代行しない。trace UIを含む選択scopeでは表示上の状態traceも検証し、非UI scopeではartifact traceを検証する。
- **選択した入力元・適用scopeに応じて必須**：Phase 2が参照する個別Design Template、pattern、agent/platform/tool contractは、対象scopeで選択されたものについてidentity/version/applicability/required input/authorityを照合する。選択されていない知識やplatformを暗黙に必須化しない。L2-025/026候補を当該scopeの設計構成に使う場合は、各候補の契約・receipt・互換性を確認する。
- **参照資料のみ**：旧`drive=agent`、`phase.yaml`の`phase_merge` field、`mergeTwoStageAgentDesign`、旧Traceビュー、開発styleの旧名、旧schema/runtimeの例は根拠・履歴として読むだけで、現行実装依存や固定schemaではない。

**正常・誤り・未見**：

- 正常：HARNESS-L2-009が現行要求のkind/target/configuration/risk/domainと適用template版を照合し、二段scopeを導出する。開始時にはPhase 1の合意済みL2要求・承認済みL3要件とPhase 1の設計入力だけがあり、まずPhase 1 L4成果を生成する。Phase 1のL9対検証後、そのrevision付き成果・receiptからPhase 2固有のL2要求とL3要件を形成し、L2合意・L3承認を確認してからagent固有L4成果を生成し、続いてPhase 2のL9対検証を行う。両receiptとtraceが揃い、Phase 2がPhase 1のcontractを保つか明示差分を解消した後、統合設計成果をL3↔L10 system oracleへ渡す。L10結果は022が判定する。L2↔L11 acceptanceとL1↔L12 observationの結果は別stateとして後続へつなぎ、まだ実施していなければ未実施とする。
- 誤り：Phase 2がPhase 1のsystem invariantを破る、required input/phase receiptが欠ける、phase間traceが別revisionを指す、または一方の現行L4設計/L9対検証成果だけをmergedとする場合、037は統合成果を出さず具体的gapと戻し先を返す。設計input欠落はHARNESS-L2-009/形成へ、要求意味変更はHARNESS-L2-008/上流へ、oracle不足はHARNESS-L2-022へ戻す。対象revision・運転記録はOS境界へ返す。
- 未見：未公開のagent構成でも applicabilityが既知の適用契約範囲内なら、同じphase境界・要求oracle・trace条件を適用して内容を照合する。fixtureがないだけでは一律拒否せず、既知条件下の対応は受け入れる。適用範囲外・未定義のauthority/oracle/contractは該当箇所をunknownとして保留し、合流済み・受入済みへ昇格しない。

**旧source・保持/変更**：

- `LEGACY-ASSET-6B6C5CB0E481BE01088B`：`docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/functional-requirements.md:59`（FR-L1-28、file SHA-256 `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`、line SHA-256 `a7b461949218e37e67110567ee4aad528901e8a2536341fc6d23a5cb35590106`）。保持：Phase 1一般system＋Phase 2 agent昇華、各L9成果、L10合流済み成果、L11〜L12統合flow、development style/case-driven modelとの区別。変更：旧固有実装名・手順ではなく、revision/scope/契約版付きの合流契約に再導出する。
- `LEGACY-ASSET-3B905BB196962E2BE624`：`docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/screen-requirements.md:464`（旧画面受入source、file SHA-256 `e5b6964567242a2440ded28ed99c1783f37a9326624c02283c7a975c3020063b`、line SHA-256 `096ba44a8a6a5c8ea7538755f94af4155201ddae5ead9d726611e4712f4d972f`）。旧TraceビューでW二段状態を可視化する記述は、phase state/traceが追える要求へ意味を再導出する。特定画面や表示方式は固定しない。
- `LEGACY-ASSET-96CCD05C4CCA06F50D3D`：`docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/technical-requirements.md:169`（I-4、file SHA-256 `3e105358418cb54af0bc2e414d0b06171715ab2a26ea3b44dd16f932bcbfef88`、line SHA-256 `cc12f3fae870d6917c65a8c671f7de283c931f31788c61502561c894c6c52a5b`）。`drive=agent`確定時Phase 1/2→L10合流stateを持つ意味を保持するが、`phase.yaml`/`phase_merge` fieldは旧方式として移植しない。
- `LEGACY-ASSET-809D616D0D7D844F5720`：`archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/function-spec.md:250`（旧詳細候補、file SHA-256 `f80b69a4d153d7775ecd789aa9e261c140baf2a443ac53a851de710cfce02b14`、line SHA-256 `da0f68bfde9fb763e7936678b9393b42c7b924630bdf1b07f2d53baf09a30785`）。Phase 1/2 design artifactとhandoff evidenceを入力に、merged stateまたはexplicit gapを返し、layer boundaryを保持する条件を参照する。固有function/API名やprovider transcript処理は本候補の規範実装へ固定しない。
- `LEGACY-ASSET-978C267AADC50615A1E2`：`archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/fr-unit-coverage.md:64`（旧coverage対応、file SHA-256 `477c95b229b4ddffd4c2ed76fdfb99d8f3a4e8241b21ae7e883ffa2607d39dbf`、line SHA-256 `b5ff66c0f85a00aa4aa13700b2970733155b99bed54340f5fc8997803168e137`）。`U-FR-L1-28`がPhase1/2 merge stateとagent handoffを対象としていたことを受入の根拠に使う。旧test/runtimeの実行合格は現行受入証拠にしない。

**現行根拠と比較**：`docs/helix-harness/L1-planning/product-intent.md:31,39`（L1-001/004/009、SHA-256 `238ae0590f43c10c0a59a0cea4a9907328752a81388891e1a115d4278db00e1f`）。現行L2 `docs/helix-harness/L2-requirements/product-requirements.md`（HEAD `2beddd2b9e295f46bd6086de5f14148421144513`、SHA-256 `07fe4e2e7a8205d37571fc745f1154022559cf6489022ec6711f3efad3940bcf`）：009 `:60,116`はtemplate選択とunit/connection/composite義務、022 `:447-461`はstage/oracle/acceptance、026 `:530-540`はdesign unit、025 `:544-554`はgeneric composite整合。現行L11 `docs/helix-harness/L11-acceptance/product-acceptance.md`（同HEAD、SHA-256 `006c929d9c00d349b263bcbaa371e7d1638176966511420075cc85a45b9b8321`）：009の受入` :29,69,129-130`、022のstage oracle `:298-304`、025/026のpair acceptance `:332-360`。これらには一般design-template選定、generic composite、一連のstage判定はあるが、対象がagent-systemの場合に限るPhase 1/Phase 2双方のL9成果とL10合流・L11/L12 handoffの一体的な契約はない。037はこの差分だけを補う。

**実物の検証との境界**：各PhaseのL4設計成果の存在・静的整合だけからL9実行receiptを作らない。HARNESS-L2-022に従い、当該scopeのL5以下の設計・実装・必要検証を通った実物について、選択したOSまたは利用者の実行手段が返すL9結果を後段入力として受け取る。037は結果を作らず、契約版・対象revision・oracle・実行状態を照合する。実装や実行がまだ無い段階では設計案と未完義務を保持し、Phase合流済みにはしない。

**Phaseごとの上流と人の判断**：旧Conceptの二回のVを保持する。Phase 1は全体企画を親に一般systemのL2要求合意・L3要件承認を経て設計/実装/対検証へ進む。Phase 1の確定仕様と実物の検証結果をPhase 2への入力とし、agent固有の目的、利用者結果、制約、permission、失敗時の戻し、受入をHARNESS008/024でL2へ形成する。そのL2合意と、そこから導くPhase 2固有のL3要件承認を既存authority手順で得るまでは、Phase 2のL4以下へ進まない。Phase 1の合意・承認をPhase 2へコピーしない。二つのL2/L3 identity・revision・判断記録と合流scopeを別々に保持し、同じcommitやIDを強制しない。Phase 2で外殻の意味を変える必要が出れば該当するPhase 1上流へBackflowし、影響したpairをstaleにして再照合する。技術上の差分だけと推測して上流判断を省略しない。Phase 2が未承認でも要求候補と未完義務の記録は進められるが、設計/実装/合流を済ませたとは扱わない。

旧Concept根拠：`LEGACY-ASSET-75776FE016E550F5355F`、`archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-concept_v3.1.md:343–361`、SHA-256 `b6cecb7bec29d85b36e299f8a594821c1d778328506fe2c056ca330ef76d968c`。一般系とagent系で各々要求/要件からVを通る意味とA-74の自身適用除外を保持する。旧L0-L14は現行ConceptとL1-L12の正規pairへ再導出し、旧provider環境を実装前提にしない。単一L3への畳み込みは本候補では採らない。

### HARNESS-L2-038 候補 — 選択Reverse scopeの内容閉包

**状態**：新規unit候補、`version_target: 1.0`候補、未採択。これはrequirements-stageで照合したHIL-FR-22/35の元条件を、利用者が選んだsource/Full Reverse scopeの内容評価へ限定する提案である。候補の記載はPO判断・実装許可・設計承認を生成しない。

**候補identity / 所属**：`HARNESS-L2-038`、unit、HELIX-HARNESS-CORE候補。旧target crosswalkはFR-22を「HARNESS／OS、コア」(`infinity-functional-target-crosswalk.md:31`)としている。038が定めるのはsource capabilityと要求・設計・検証対の意味上の照合契約である。source型ごとの抽出は共通部品候補027、入口/HELIX形式の変換とunknownは019、保存設計との比較は028、差分改修proposalの構成は029が所有する。038は抽出parser、CONNECT、OSのticket/実行、設計authority、test実行を所有しない。

**親L1候補**：primary `HARNESS-L1-001`, `HARNESS-L1-003`, `HARNESS-L1-004`, `HARNESS-L1-006`, `HARNESS-L1-008`。001/003/004はV-pair・trace、変更影響/stale、対象revisionに合う検証義務・反例・証拠・戻し先を根拠とし、006はfreeze/完了の区別、008は指示と根拠からの要求形成を根拠とする。`HARNESS-L1-005`は038の結果を外部利用者向けsurfaceとして提供するoperationに限り適用し、内部CORE処理には外部提供条件を一律適用しない。L1は現行revisionのまま扱い、候補から親意味の改訂を推定しない。

**既存要求と境界**：HARNESS-L2-019はFull Reverse入口、変換結果・unknown一覧を所有する。027は明示選択されたsource typeの静的なsource-bound observation、source span、抽出限界を返す。HARNESS-L2-008/024は要求候補の形成・質問・人の訂正/合意への収束を、HARNESS-L2-004はrequirementから設計/testへの影響・traceを、HARNESS-L2-035は候補要求の上流根拠と受入寄与をそれぞれ所有する。038はこれらの責務を置き換えず、「選択した能力を調べた/完了した」と主張できる内容根拠・個別閉包を定める。

**対象とscope**：Full Reverseまたは旧資産の意味照合を明示選択した1つの対象revision・source snapshot・source type・scopeに限るunit。全archive/全製品/全4020 assetを常時走査する要求ではない。作業途中の抽出・調査では未選択sourceや未調査能力をunknown/未完として返せる。

**受け取るもの**：

- 対象製品/projectと対象L1/要求revision・authority状態、選択したFull Reverse/legacy-source scopeと適用範囲。
- HARNESS-L2-019のintake/result契約。該当source typeを利用する場合は027のsource observation receipt（source revision/digest、選択範囲、根拠span、unsupported/unknownを含む）。019の完了receiptをsource inspectionの開始前提にしない。
- 対象scopeの能力候補ごとのidentity/source locator/provenance、観測内容、既存要求/候補要求とのrelation、理由付き処置または未決/未観測の記録。外部/旧asset由来の能力とHARNESSが現在所有する要求の意味を混同しない。
- 当該段階で既に存在する要求・設計・対の検証義務とoracleのrevision/authority状態。まだ生成していない後段artifactは入力必須としない。

**提供するもの**：選択された各能力について、個別に追跡できるcoverage resultを返す。最低限、能力のsource identityと根拠span、内容/適用scope、選ばれた既存処置または候補処置と理由、関連する要求identity/候補、対象revision上で既に存在する設計要素・test/oracle・gateへのrelation、未完義務/unknown/矛盾/戻し先を区別する。旧文にあるdisposition語を必須enumとして固定しない。状態語・採否authorityは現行対象の既存契約とauthority状態に従い、038が決定を発行しない。

**保証すること**：

- 選択scope内で個別能力をまとめた一つのcomposite IDだけで全件閉包としない。完了claimの分母は、選択scopeとsource snapshotに束縛された観測manifest中の全抽出capabilityとする。各capabilityは一意IDで一度ずつ結果へ現れ、抽出manifestと結果の件数・identityが一致しなければならない。未調査、未決、根拠のない却下、要求や適用される検証義務へ孤立した能力を、coverage-completeまたはpair-freeze成立と表示しない。manifestにunsupported/unknown範囲があればゼロ件や対象外へ読み替えず、そのscopeの閉包は未完とする。
- 各工程の開始時に将来の設計/test/detector完成を要求しない。能力の観測/要求形成段階は、現段階のsource evidenceと上流判断待ち/後段義務を明記すれば成立し得る。設計、対のtest/oracle、適用gate等の証拠は、それぞれの後段artifactがあり、当該段階の閉包・pair-freeze・完了を主張する時点でのみ該当義務について要求する。
- 各capabilityと、適用対象となるrequirement・basic design・test・detector/gateは、該当endpointが存在する段階では両方向に照合できるrelationを持つ。relationの片側だけが存在し、逆向き照会で孤立が分からない状態を閉包としない。後段endpointがまだ作成されていない途中段階では、将来成果を要求せず未完義務として保持する。適用外をN/A/却下に読み替えず、理由と権限根拠がある場合に限ってその状態を示す。根拠のない`no finding`、空欄、placeholder、旧source文の機械複製、同内容/digestの重複を内容評価または完了根拠にしない。根拠が足りない時はunknown/未完とする。
- capability observation/candidateと採用済み要求、承認設計、実装、実行成功、利用者受入を別状態にする。処置表現は旧enumを固定しないが、現行status/authority上で「既存義務への採用」「既存義務の強化」「意味を変える再設計候補」「根拠・authority付きの却下/対象外」「既存義務への吸収」「未決/unknown」を区別し、理由と吸収先を追跡可能にする。人の意味判断が既存authority modelで必要ならそこへ返し、038は新しい承認者・承認手順を作らない。
- 完了claimが対象にするReverse段階では、固定された旧R0–R4名/schemaを要求せず、現行artifact上で以下の内容を検査できること：根拠とsource範囲のmap、観測された契約、現状(as-is)設計とtest、意図仮説と既存authorityによるPO検証状態、残差とowner/routing。R3相当のPO検証は既存authorityへ接続し、038が承認や検証を生成しない。初期観測・要求形成だけの結果は後段内容未完を明示して成立し得るが、当該段階またはFull Reverse完了を主張するのに必要な内容が欠ければclaimを成立させない。
- 不一致はHARNESS-L2-003/004のBackflowに従い、意味が変わる最上流へ戻す。source解析不足は選択sourceの再観測へ、要求意味は008/024の形成へ、設計境界は014/028へ、検証義務/oracleは004/022へ返す。

**依存区分**：

- **常時必須**：対象revisionとauthority状態、明示されたscope/非対象、HARNESS-L2-010/011の適用pack/input/version契約、038が呼ばれるoperationの019 intake/result境界、要求の形成/trace/Backflowを担う008/024/004の適用契約。作業途中でも選択source identityと観測済み範囲/未完表示は必須。
- **特定操作時のみ必須**：pair-freeze/coverage-complete/Full Reverse完了/no-findingを主張する時は、当該claimが対象とする全selected capability、適用範囲、個別処置理由と、その完了段階で要求されるdesign/test/oracle/gateの証拠。設計または検証をまだclaimしない段階では未来artifactを要求しない。approvedを主張する場合は既存の対象revision付きapproval evidenceが必要。
- **選択した入力元に応じて必須**：019 operationで選択されたsource typeの027 observation/receiptと、選択scopeのasset locator・source span・digest・分類/読取許可。未選択sourceや別revisionは未観測とし、存在/不存在、無影響、空と推定しない。
- **参照資料のみ**：未選択source、背景説明、旧asset全件一覧、旧固定phase名/R0–R4 schema、旧enum、旧runtime/registry/receipt実装。参照しただけでcoverage分母・authority・適用義務にしない。

**単独成立依存**：HARNESS-L2-019の選択scope/結果境界、HARNESS-L2-010/011のpack/input契約、要求形成・trace/Backflowを扱う008/024/004。027は038の特定operationがsource型抽出を要する場合だけ呼び出す入力producerで、027非対応sourceを含む全Reverseに一律依存させない。HARNESS-L2-014/022は該当する設計/検証段階のauthority/oracleとして利用するが、調査開始時の完了receiptを要求しない。OS/CI/実行環境はHARNESS単体成立に必須としない。

**失敗・戻し先**：source revision/scope/span不足、unsupported構文、重複identity、selection変更後のstaleは該当箇所をunknownとして再観測へ戻す。能力の意味/採否根拠が上流にない場合はHARNESS-L2-008/024へ、trace/impact欠落は003/004へ、設計・test/oracleの不整合は014/022または該当ownerへ戻す。工程開始時に将来artifactがないことだけでは失敗とせず、完了claim時に必要な後段義務が未完ならそのclaimを成立させない。

**正常・誤り・未見の判定点**：対L11受入案 [`HARNESS-L2-038`対応のL11受入](../L11-acceptance/product-acceptance.md) に、manifest分母、双方向join、処置意味区分、stage内容のoracleを置く。

**旧HELIXからの再導出（保持と差分）**：

- `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:112`（SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`）のHIL-FR-22を起点にする。能力ごとのID、扱いと理由、HIL requirement/basic design/test/detector-gateへの双方向関係、未判断/根拠なし却下/孤児/集約だけの閉包をpair-freeze不成立にする意味を保持する。
- HIL-FR-35は同旧L1 `:125`、同じSHA（旧target crosswalk `infinity-functional-target-crosswalk.md:44`）から、5つの段階内容・PO検証と、空/placeholder/同文/同digest/対象義務未被覆/根拠なしno-findingを内容成立にしない条件を導出する。
- 差分は対象を明示選択したscopeに限定し、旧固定R0–R4のラベル/schema、状態enum、全旧source一括走査、全製品への一律gateを復活させないこと。ただしFR-35で列挙された段階の意味内容とFR-22の全件・双方向閉包条件は、省略せず現行artifactで検査する。旧FR-22/35のL1/IR atomは新identityの採択、過去データの完了、実装の証拠とは扱わない。

**旧FR-24との境界**：HIL-FR-24は `concept-requirement-po-decision-packet.md:979` と機構crosswalk JSONL:94の既存記録どおり2.0候補（1.0は接続/記録土台）として保持し、本候補へ取り込まない。038はsourceから能力と意味根拠を照合するHARNESS契約であり、外部Product Dataの取得、full/incremental snapshot、watermark、canonical entity mapping、tombstone、schema driftを実装/所有しない。



**固定照合基準**：草稿が照合した現行本文の基準commitは `afc3963085b53a4bf86ac5da8f7663aef1bed144`。旧source・現行L1/L2/L11のfile SHAは下記出典の固定値を参照する。

**段階の内容依存と中断**：source根拠から観測契約、観測契約からas-is設計/test、これらを根拠とした意図仮説/PO検証、最後に差分/routingという内容の依存を保持する。見出し名を変えただけで段階を飛ばせない。選択scopeで必要なobligationが100%に満たなければcheckpoint後も未完とし、budget途中停止を完了へ丸めない。既存契約上不要な操作の追加はしない。旧受入根拠は `LEGACY-ASSET-AFE91778057B7E76BEEC`、`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L1-infinity-loop-operational-test-design.md:62`（HOT-HIL-35）、SHA-256 `4f8f67664e360dcb8b40f9c834953d026c9bf3b359a79a64e68fa2296689e576`。

### HARNESS-L2-039 体験・UI・Frontend契約を同一scopeへ結ぶ（HARNESS-CORE composite候補、version_target: 1.0）

**状態**：新規の未採択候補。2026-09-28に合意した250候補には含まれず、この候補・記載内容をPO採択済みと扱わない。既採択のHARNESS-L2-024/025/026を変更・置換せず、それらの要求形成、設計単体、設計構成体の間で、体験成果とUI/Frontendの契約が同じ対象scope・revisionを指すための構成体条件を追加する。

**親L1**：主親はHARNESS-L1-001（上流意図から運用評価までのV-pair）、HARNESS-L1-003（要求変更の影響を設計・実装・検証へ伝える）、HARNESS-L1-004（対象revision/riskに合う検証義務・oracle・証拠）、HARNESS-L1-006（要求形成、prototype/非UI適用性、合意・freeze・差戻し）、HARNESS-L1-008（指示と根拠から要求を形成し、欠落・矛盾・過剰解釈を確認）とする。HARNESS-L1-009は設計義務・不足入力を戻す関連親。HARNESS-L1-005/007は外部提供時の適用条件とVersion 1成果範囲の文脈で、内部OSを利用者依存に変えたり新しい完成条件を追加したりしない。これらの現行L1本文の意味内であり、Experience/UI/Frontendの新しい企画価値をL1へ追加しない。

**所属・scope**：HELIX-HARNESS-COREのcomposite候補。要求・設計・受入の責務を同一scope・対象revisionで結ぶ契約を定義する。UIの有無を問わず、各要求まとまりの業務目的を親へ辿れることを扱う。画面を持つscopeではExperience、UI、Frontendの適用条件を照合し、画面を持たないscopeではUI項目を根拠付きN/A・再評価条件として残す。UIの存在や契約適用性がunknownならN/Aへ変換しない。全screen/製品に特定技術・field名・固定schemaを強制しない。

**単独で成り立つための依存**（常時必須）：対象Concept/L1および要求・対象のscope/revision/authority状態、HARNESS-L2-008の要求意味・候補と人間合意境界、HARNESS-L2-003/004の段階状態・変更影響とrelation、HARNESS-L2-022の段階別oracle・result・evidence状態を照合する。必要な入力、authority、oracleが欠けるときは不足/未評価を返し、上位の意味や合意を補完しない。HARNESS-COREが契約と設計上のrelation/oracleを所有し、OSのticket発行・割当・CI運転・実行状態記録、利用者環境の実行、L11の利用者受入判断を所有しない。

**特定操作時のみ必須**：UI/UXを含む要求・設計scopeを形成または変更するときは、HARNESS-L2-024の該当するprototype/非UI適用性・screen scope・agreement状態、HARNESS-L2-026の該当unit設計と対の検証設計、およびHARNESS-L2-025の構成体oracle/端から端の整合を照合する。検証義務を決める操作ではHARNESS-L2-005のticket/risk別選択を使う。L2-022に属する段階stateを主張するときはそのoracle/evidence条件を適用する。これら既存要求の完了receiptを039の開始前提にはせず、各操作が必要とする入力だけを要求する。

**選択した入力元に応じて必須**：対象が明示選択するprototype、screen/flow/interaction資料、design token/component実体、content/analytics event定義、frontend data/state owner、permission/logging/error仕様、device・locale・network等の環境条件、および選択Pattern/design systemを使う場合の各source identity・revision・scope・authority状態を束縛する。選択されていないsourceを存在/不存在/適格/成功と推定しない。BRAIN由来Patternを選択した場合は現行の026/025とconnector契約を適用し、039独自の知識正本を持たない。

**参照資料のみ**：旧sourceのfield名・旧registry/schema/runtime、例示に過ぎない画面manifest形式は参照資料とする。039はFE検証の実行結果を自己生成しない。036のFE 5軸を選択scopeの検証に使う場合に限りその契約・版・結果を後段で照合し、036候補の採択は推定しない。旧工程名・旧layer番号を現行の新工程へ作り替えない。

**受け取るもの**：対象L1/L2/L11と適用されるL3要件の対象revision・authority状態、要求原子とそのscope/非目標、該当UI/非UI適用判定、上記で選択された各source、変更影響・risk、既存のV-pair/verification/acceptance oracleと未完義務。

**提供するもの**：同じ対象scope/revisionに結ばれた次のrelationと差分候補を、根拠・authority状態・適用性とともに返す。

- **Experience/要求の親graph**：要求原子または要求まとまりから、適用可能なUser Task、Business Outcome、scenario/context、success result、decision rationaleへ意味上の親を辿る。親が不要または適用不能な要素は理由を記録する。要求を小さく分割しても親成果・成功条件・決定理由の対応を失わせない。単に親fieldを埋めたことを意味成立としない。
- **UI/Frontendの端から端trace**：画面を持つscopeで、適用するscreen/flow/region/slot/interaction/action/state/component/token/content等の要素を、permission/actor、command/API、data/state owner、不変条件、domain event/analytics event、logging/errorと、対応する設計・検証・受入oracleまで結ぶ。適用外のidentity型を機械的に生成しない。上記はsemantic relationとして扱い、旧identity名や特定のデータ構造を要求しない。
- **drift/変更影響**：prototypeと要求、component/DOMと設計、design tokenと描画実体、interactionとE2E、content/analyticsとその要求・oracle、accessibility/responsive/motionに関する適用条件の差をscope単位で示す。変更されたrelationから影響を導き、Affected/Unaffected/Unknownを区別する。UnknownをUnaffectedへ変えず、未評価の実装をpassにしない。意味・要求変更はHARNESS-L2-008および既存Backflowへ、設計・oracle不足はHARNESS-L2-026/025/022へ戻す。
- **riskに応じたUI検証設計**：選択されたUI scopeのriskに基づき、適用するdevice/input/role/locale/data volume/network/concurrent update/destructive/undo要因を選び、risk-based pairwise組合せを設計する。適用外・選外は根拠を残す。全組合せ実行や固定factor一式を強制せず、risk/適用性unknownを合格にしない。検証実行はHARNESS-L2-005に従う。
- **状態と証拠の区別**：設計成果、実装状態、実測UX評価を一つの完成状態にまとめない。`implemented`を主張する場合は現行V-pairで定める実装/検証関係へ結び、`ux_verified`を主張するoperationに限って対象scopeに適用されるL10–L12 real-data evidenceとhuman evaluationを別状態として要求する。これらの未来の実行結果を要求形成・設計契約の作成開始条件にはしない。screen数、route数、placeholder、generic table、screenshot単体で完成を主張しない。
- **Discovery PoCとauthority**：Discovery PoCはprototype/vision仮説の調査・比較を行えるが、対象ownerの既存判断前に`implemented`、`ux_verified`、production-readyまたは採択済みと主張しない。採択された仮説は既存の正規V-pairへ接続する。PoCの固定S0–S4工程や別authority machineを追加しない。HARNESS/AIはproduct vision、brand、体験優先順位、prototype agreement、L3要求freeze、L11利用者acceptance、L12改善採否を自己承認しない。
- **既存stageへのbackfill**：Full V/Scrum等の選択された工程で、該当するprototype agreement、screen ledger/profile、frontend binding、mission/oracle、UX evidence、change deltaの未完義務を現行V-pairの対応する層・受入・戻し先へ結ぶ。適用しないartifactは理由を記録する。UI sliceが既存SR4/review/release合流を求める時点では、適用されるbackfill義務とpair receiptを照合し、未完義務を完了扱いにしない。旧S0–S4やSR4等を別の現行工程、追加freeze、独立承認として新設しない。既存のstage receipt/evidenceの条件を置き換えない。

**保証・authority境界**：本候補は要求意味、prototype agreement、L3 freeze、L11 acceptance、L12改善採否を承認しない。出力は対象ownerが照合できる設計契約・差分・不足・検証義務候補であり、候補の生成/比較/検査から採択・操作権限・実行許可を生成しない。HARNESSは要求/設計/verification契約を所有し、OSは既決authorityに従う進行・実行・証拠記録を所有し、CONNECTは必要な情報配送を所有し、LABOは実測後の評価/改善候補を所有する。この候補はそれらの責務を移さない。

**失敗・戻し先**：親scope/成功条件/authorityがunknownなら要求形成へ戻し、画面適用性やprototype合意が該当して未決ならHARNESS-L2-024へ戻す。trace/設計不整合は026/025、test oracle/段階証拠不足は005/022へ戻し、実行・ticket・記録不足はOSの既存責務へ渡す。source版/互換不明は選択source ownerへ戻す。人が持つ上流の意味に変更が必要な場合だけ、既存判断境界へ選択肢・影響を示す。新たな承認者や承認gateを作らない。

**旧sourceと差分**：asset `LEGACY-ASSET-02319C2481B9E01698D5`。`archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md` SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`。§4.5:265–277のうち269/271/273/275行のExperience/UI/Frontend三契約、Full V/Scrum backfill、PoC/implemented/ux_verifiedの状態差と非自己承認を意味再導出する。§4.9の385–390行（HR-FR-DHR-001–006）と392行（実装・UX証拠が揃うまで完成状態を主張しない条件）からidentity trace、UI applicability、screen-to-acceptance関係、risk-based pairwise、drift、Experience親graphを再導出する。旧ID/field/schema、runtime、固定旧phaseは現行要求へ移さず、個別の適用範囲・現行layer・根拠付きoracleへ再構成する。

**固定照合基準**：現行L1/L2/L11はcommit `d0900f30b92720114c6e0b5f436813d48172a020`。旧sourceの実装方式・211件のinventory（267/277行）や別entity機械の詳細（394行以降）は本候補の一括被覆対象にせず、元のsource保持を継続する。

**UI prototype証拠の受渡し**：UI適用scopeのprototype合意/closureを主張する段階では、操作可能なprototype相当と、同じscope/revisionを実際にwalkthroughした結果・未決事項・訂正を、既存008/024の合意根拠へ結ぶ。静止画や一覧だけを操作可能性・walkthrough実施の証拠へ変換しない。旧manifest schemaは固定せず、未実施なら当該義務を未完として保持する。039の契約候補形成の開始に、未来のprototype完成やwalkthrough完了は要求しない。非UIなら既存の根拠付き非適用判定と再評価条件を保持する。

**UX完了主張時の証拠**：UI/UXが適用されるscopeで`ux_verified`（UX完了）を主張するoperationは、同じ対象scope/revisionに対してL10–L12で評価したreal-data、responsive、motion、accessibility、performance、continuity、人間評価の全軸のcurrent evidenceを必要とする。いずれかの軸の証拠がmissingまたはstale、または適用性がunknownならUX完了を拒否する。UI/UX適用scopeで個別軸をN/Aとして省略しない。`implemented`は既存V-pair上の実装・検証関係で別に判定し、両状態を相互に推定しない。この証拠はUX完了主張の条件であり、候補形成、要求・設計・prototype検討の開始条件ではない。非UI scopeでは既存の根拠付きN/A境界を維持し、UX完了状態を生成しない。旧根拠：`archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:650`、`docs/governance/requirements-source/helix-requirements-v1.3-baseline-6fabd125.txt:631`。

## HARNESS-L2-035 scope拡張の計測条件（追補）

既存035と一体の未採択候補。親HARNESS-L1-008、version_target: 1.0を保持する。

scope拡張候補の受入寄与・最小性を照合するとき、追加機能数だけでなく、複雑さ（complexity）、外部へ公開する面（public surface）、運用上の負債について、変更前後の測定対象・方法・条件・結果を識別できるようにする。候補の形だけを数えて、API/CLI/schema/設定/依存や運用義務の増加を隠さない。HARNESS-L2-034の計測契約を使う場合はその対象・版・適用条件へ結び、測定前の値や適用予算が不明ならunknownとして残す。特定の数式、全製品共通の閾値、唯一の実装方式は原文にないため追加しない。

候補の起草開始には測定完了を要求しない。scope拡張の必要性を満たしたと主張する段階では、上の三観点とauthoritative oracleへの寄与・代替案・minimum-necessary proofを一緒に示す。測定欠落は該当するscope判定を未完にし、低い追加機能数や別観点の好成績で相殺しない。不要な拡張は既存035へ戻し、新たに必要と判明した変更は既存Backflow/ticket境界へ戻す。実行authority、全作業の同期gate、通常作業の毎回の人確認は追加しない。

旧根拠：HIL-NFR-07。原文と所在は[scope計測の原文照合](../../governance/audits/requirements-stage/scope-measures-legacy-differences-2026-09-28.md)。既存035の導出連鎖・循環拒否を置換しない。


## 旧HIL-FR-46/47から再導出するCORE候補

本節の候補はHARNESS-COREが定める版付き契約と候補形成であり、実行器や登録writerを新設しない。共通の親候補は現行HARNESS-L1-001（正規L1–L12とV-pair）、HARNESS-L1-003（変更影響・stale）、HARNESS-L1-004（scope別の検証義務・反例・証拠・差戻し）であり、templateの選択・適用まで扱う041はHARNESS-L1-009も親にする。040が記録するtemplate版は層別契約のidentityであり、template適用の成立は041とL2-009へ渡す。親L1本文の候補状態と意味を変えない。既採択HARNESS-L2-025/026は設計生成・pair oracleの契約なので、この二候補が作る層catalogや原子的obligation抽出の代替ではない。

### HARNESS-L2-040 全層ledger契約と層外anchor（HARNESS-CORE unit候補、version_target: 1.0）

- **親L1**：`HARNESS-L1-001`, `HARNESS-L1-003`, `HARNESS-L1-004`。現行L1本文の候補revisionを入力し、L1–L12とcanonical V-pairを一つの対象構造として扱う。新しいlayer、pair、L0企画価値は追加しない。
- **種別・scope**：HARNESS-COREの単体能力候補。canonical L1–L12について必要なledger契約を列挙し、正規pairをL1↔L12、L2↔L11、L3↔L10、L4↔L9、L5↔L8、L6↔L7の6組として保つ。L0 charterは層外authority anchorとして別参照し、7組目のpairやlayer ledgerへ変換しない。
- **入力**：対象HARNESS L1 revision、canonical pair定義、層ごとのauthority/source revision、各層で有効なledger/template契約版。L0 charterのauthorityは出所と対象revisionを参照するだけで、本候補がauthorityを発行・解釈変更しない。
- **出力**：version付きlayer ledger catalogと、各ledgerのtype・粒度・必須node/edge・authority参照・input/output・entry/exit gate・適用template版を特定できる契約。L0 charterは層外authority anchorの独立recordとしてcatalogに別登録し、identity・対象revision・sourceを残す。ledger rowはstable subject ID、row revision、source span、semantic digest、status、owner、上流/下流edgeを識別できる。対象revisionのlayer snapshotとcoverage receiptに含むべき全件・未完・stale情報を定義する。
- **依存区分**：**常時必須**＝対象L1 revision、canonical six-pair map、根拠に使うauthority/source revisionのidentity。**特定操作時のみ**＝指定layerのcatalog/snapshot/coverageを生成または更新する処理は、その操作scope・対象revision・互換契約がそろった場合だけ対象となる。**選択した入力元に応じて必須**＝L0 charterまたは層別templateを根拠に選ぶ場合、その正確なrevision・適用範囲・authorityを照合する。**参照資料のみ**＝旧runtime/旧層番号、背景説明、実装方式。これらは現行authorityやpairの根拠にしない。
- **所有境界**：HARNESSはcatalogの意味、層ごとの契約、coverage receiptの成立条件を定める。OSは別途認められたscopeで登録・保存・snapshot/projection・ticket実行を運転する。本候補はOSにwriter、ticket、実行、authority、完了状態を与えず、HARNESSがOSの保存成功を代行しない。
- **保証と戻し先**：12層それぞれの必須ledger契約、6 pair、L0層外anchor、row identityと双方向edgeが同じrevisionで追跡できる。層・pair・authority・templateの不足や矛盾はmissing/unknown/staleとして該当範囲のcoverageを未完にし、HARNESSのL1/L2契約ownerまたはauthority ownerへ戻す。catalogが存在するだけでL1承認、L2合意、L3要件承認、OS登録・実行、completionを成立させない。
- **既存候補との境界**：HARNESS-L2-025/026のL3要件から具体設計・pair oracleを作る能力はそのまま維持する。040は設計成果を生成せず、025/026の完了receiptを開始前提としない。040の候補採否や実装完了も025/026から推定しない。

### HARNESS-L2-041 active templateのobligation抽出とgap提示（HARNESS-CORE unit候補、version_target: 1.0）

- **親L1**：`HARNESS-L1-001`, `HARNESS-L1-003`, `HARNESS-L1-004`, `HARNESS-L1-009`。HARNESS-L1-009のtemplate選択・適用条件・要求不足の差戻しを具体化し、L1-001/003/004に従って出典とpair scopeを追跡する。
- **種別・scope**：HARNESS-COREの単体能力候補。指定されたactive template revisionと適用scopeについて、章、field、table row、applicability rule、done-when、pair contractを原子的obligationとして機械抽出する契約を定める。対象となる既存canonical pairの契約は保持し、旧L0–L14配列や追加pairを作らない。
- **入力**：HARNESS-L2-009に基づく選択済みtemplate identity/revision、適用するlayer・要求kind・対象scope、source span、対応ledger契約版（040または互換な版付きledger契約）、抽出器/version identity。active版や適用scopeが不明・矛盾・staleなら処理対象を確定しない。
- **出力**：source span・template revision・適用条件・obligation種別・semantic digestを備えたtemplate atomと、該当ledgerへの候補行。未対応template要素、空/TBD、抽出不能、同一obligation重複は個別gap findingとして示す。抽出器/version digestを出力し、未解決要素をLLMの自由補完や成功扱いで埋めない。候補行は正本ledgerへの登録・採択ではない。
- **依存区分**：**常時必須**＝対象HARNESS-L1 revision、HARNESS-L2-009のtemplate適用契約、要求された抽出scopeと出典を識別できること。**特定操作時のみ**＝選択されたtemplate revisionからatom/proposal/gapを作る処理。**選択した入力元に応じて必須**＝特定layer/templateを選んだ場合、そのtemplateの正確なrevision、applicability分岐、対となるpair契約、版付きledger契約。template ownerがBRAIN等であれば当該templateの入力契約と互換性を使うが、未選択の知識・templateを観測済みとみなさない。**参照資料のみ**＝旧extractor/runtime、非選択のtemplate、背景例。
- **所有境界**：HARNESS-COREはobligationの抽出契約、候補行、gapの意味と戻し先を所有する。HARNESS-L2-009はtemplate適用と必要要求inputのBackflowを所有する。OSは選択された操作のticket/実行/保存/projectionを別の契約に従って運転する。041は台帳writer、OS executor、template authority、L3要件・実装・採択を所有しない。
- **保証と戻し先**：active templateに明記された各対象要素がatomまたは理由付きgapのどちらかに対応し、同一要素の重複や未対応を隠さない。必須要素の欠落、空/TBD、抽出不能、重複、版不一致を解消せず完了扱いにしない。templateの意味・適用性が不明ならHARNESS-L2-009/対象ownerへ、ledger契約不整合なら040相当の契約ownerへ戻す。抽出結果・candidate rowは要求合意、設計成立、受入成功を生成しない。
- **既存候補との境界**：HARNESS-L2-025/026は承認済み要件から具体設計と対oracleを構成・検査する。041はactive templateの要求要素を漏れなく候補化し、空所や抽出限界を明示する前段のCORE契約であり、設計内容・oracle結果を新たに生成したり、025/026を置換・前提化したりしない。

原文sourceとsource holdingは`docs/governance/audits/requirement-registration/harness-layer-ledger-extraction-source-lines-2026-09-28.jsonl`および同じ監査ディレクトリのcoverage receiptに記録する。旧候補行の追加は候補出力の意味として保持し、実際のregistry更新・snapshot・ticket実行は個別に認められたOS側契約へ戻す。

## 旧v1.3 §4.2から再導出するRefactor判定候補

### HARNESS-L2-042 Design Refactor判定とepisode分離（⑤のunit候補、version_target: 1.0）

**authority・親**：本節は未採択候補であり、`HARNESS-L1-003/004/005/007`を親とする。旧requirements v1.3 §4.2 L119（`REQSRC-SUP-00089`、監査基準revision `V13-BASE-6FAB-L0104`）のうち、既採択の`HARNESS-L2-016`と対L11に明記されていないDesign Refactor判定と、Design／Performance Refactorへの機能追加混載禁止を保持する。旧source一行のPerformance Refactor条件は既採択016の契約を参照し、同じ条件の別authorityを作らない。旧source行と監査基準行は同文でも別revisionのatomとして被覆receiptに残す。

- **受け取るもの**：対象artifact・revisionと変更scope、変更前の対設計・契約・要求とoracle、候補の意味上の類似または差異、影響するconsumer、変更前後の依存graph、機能追加の有無。Design RefactorとPerformance Refactorのrouteは`HARNESS-L2-002/003`のSR3条件に従う。
- **提供するもの**：Design Refactorとして進めるかの理由付き判定と、比較した意味・consumer・oracle・依存の根拠、維持すべき契約、拒否またはBackflowが必要な差分を示す。結果は対象scopeとrevisionに限り、名称の一致やticket名だけを判定根拠にしない。
- **保証すること**：Design Refactorとして統合または共通化する判断にsemantic similarity、consumer、oracle、dependency graphを使い、名称文字列が似ていることだけで統合しない。対象の振る舞い・契約・要求を保つ条件は`HARNESS-L2-016`に従う。Design RefactorとPerformance Refactorのいずれも機能追加と同一episodeへ混載しない。機能追加は別episodeへ分け、意味変更が必要なら`HARNESS-L2-003/004/016`のBackflowで該当する左の層へ戻す。Performance Refactorのbaseline・budget・workload・profile・統計条件・回帰oracleは`HARNESS-L2-016`とその対L11の契約を使い、本候補で数値閾値や新しい性能権限を加えない。
- **依存区分**：**常時必須**＝対象revision・scope、対の設計・契約・要求、既存oracle、`HARNESS-L2-016`のRefactor／Backflow契約。**特定操作時のみ**＝SR3のfindingを処理するときの`HARNESS-L2-002/003`のroute、および実際にPerformance Refactorを選ぶときの016の計測契約。**選択した入力元に応じて必須**＝選んだ設計・consumer・dependency graphの版と適用範囲。**参照資料のみ**＝旧runtime、旧workflow、名称類似だけの候補、未選択の改善案。これらを現行authorityや受入証拠にしない。
- **不成立と戻し先**：semantic similarity、consumer、oracle、dependency graphのいずれかが未確認なら判定を未評価に保ち、出典のownerと設計・契約ownerへ不足を戻す。対の設計・契約がない対象は`HARNESS-L2-019`のReverse入口へ、要求・公開契約・永続状態等の意味変更は`HARNESS-L2-003/004/016`の該当Backflow先へ戻す。機能追加の混載は同一episodeのRefactor成立を拒否し、追加要求を別episodeへ分ける。本候補の文書・receipt・登録だけで要求採択、L3要件承認、実装、実行、受入を成立させない。

原文・旧資産・別revisionの関係とsplit被覆は`docs/governance/audits/requirement-registration/harness-refactor-episode-coverage-receipt-2026-09-28.json`に記録する。

## 旧HIL-FR-55から再導出するactive template例coverage候補

### HARNESS-L2-043 active templateのrule／branch別例coverage（HARNESS-CORE unit候補、version_target: 1.0）

- **所属候補・旧差分**：推奨配置はHARNESS-COREとするが、PO未決である。旧HIL-FR-55の対応印は`docs/governance/crosswalks/concept-requirement-po-decision-packet.md:1009`で`HELIX-HARNESS、部品`までを示し、COREまたは個別部品名までは特定しない。HARNESS-L2-009の同packet `:174–178`は同要求自身を`部品：Design Template`へ置く根拠だが、その配置をHIL-FR-55へ移す根拠ではない。CORE案は、選択scopeの例coverage oracleが製品固有の意味・設計を持つHARNESS core側の責務で、BRAINを設計patternの知識源としてconnector接続するという2026-09-25 PO記録（`docs/governance/decisions/brain-helix-core-po-intent-2026-09-25.md:51–55`）を理由とする提案であり、旧配置の証明ではない。043のCORE案は、この限定された候補scopeに対する配置提案として人の選択を待つ。

- **親L1**：`HARNESS-L1-001`, `HARNESS-L1-004`, `HARNESS-L1-009`。001の正規V-pair、004の対象revision/riskに合う検証義務・反例・証拠・差戻し、009のtemplate選択・適用と設計義務を具体化する。親L1の意味やrevisionは変更しない。
- **種別・scope**：HARNESS-COREの単体能力候補（推奨配置、PO未決）。選択されたactive template revisionと対象scopeに適用されるvalidation ruleおよびapplicability branchについて、rule／branchごとの例coverageを評価する。template要素の機械抽出・ledger候補行・抽出gapは041、具体設計生成と設計構成体のoracleは026/025の責務とし、043はそれらを重複実装しない。
- **入力**：対象L1 revision、要求kind・構成・scope、HARNESS-L2-009で選択されたtemplateのidentity/revisionと適用条件、各validation rule/applicability branchの識別可能な内容、rule／branchに適用するrisk根拠、対応するoracle契約。041のtemplate atomが利用可能な場合はsource spanと抽出結果を参照する。active版・適用条件・rule／branch分母・必要なrisk根拠がunknown、conflictまたはstaleなら十分性を判定しない。
- **出力**：対象revision/scope、template版、適用rule／branchの分母、各rule／branchに対応するcanonical positive例と境界negative例、例が確かめるoracle、risk追加例とその不足根拠、重複・冗長性findingを結ぶexample adequacy matrix。全適用rule／branchに最低1件ずつのpositiveとboundary negativeを対応付ける。状態遷移、failure、security、migration、multi-runtime差異は、対象scopeのrisk分析で未被覆と示された場合に限り追加例を求める。例の件数だけで十分性を決めず、rule／branch／該当riskのcoverageを照合する。
- **依存区分**：**常時必須**＝対象HARNESS-L1 revision、対象scope/revision、HARNESS-L2-009のactive template選択・適用契約、適用rule／branchと照合するoracleの識別。**特定操作時のみ**＝選択scopeについてexample adequacy matrixと例coverageを評価する処理。**選択した入力元に応じて必須**＝041のatomを使う場合はそのtemplate/source revisionと抽出scope、risk追加例を判定する場合はその対象scopeのrisk根拠と未被覆領域、multi-runtime差異を扱う場合は選択scope内のruntime条件。**参照資料のみ**＝旧schema、旧runtime、未選択templateやscope外の例。
- **保証と戻し先**：各適用rule／branchにpositiveと境界negativeの双方を対応させ、例がどの条件・oracleを検証するかを追跡できる。対応例またはoracleが欠けるrule／branch、根拠のないN/A、risk未評価、版不一致は未完またはunknownとして示し、件数で相殺しない。active版・適用性不足はHARNESS-L2-009/対象template ownerへ、抽出済みrule／branchの欠落は041相当の抽出契約ownerへ、risk・oracle・検証義務の不足はHARNESS-L2-004/該当ownerへ戻す。候補や例は要求合意、設計成立、採択、実装、受入成功を生成しない。
- **既存候補との境界**：041はactive templateの要素抽出と未対応・空/TBD・抽出不能・重複のgap提示を扱い、rule／branchに対するpositive/negative例の妥当性やcoverage十分性は判定しない。026/025は承認済み要求から具体設計と対oracleを構成・検査し、本候補のtemplate例coverageを代替しない。OSは選択された操作の実行・保存・状態記録を別契約で担う。

- **配置差の選択境界**：旧HIL-FR-55の`部品`という対応印を保持しつつ、現行CORE所属は暫定推奨にとどめる。POが`部品：Design Template`を選ぶ場合も、それはHARNESS-L2-009に示された当該部品の候補配置を043へ適用する新しい判断であり、旧HIL-FR-55から確定済みとして継承しない。

**旧根拠**：`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:145`、旧行SHA-256 `78a2e6c819e73153ce2bbd832c0f87777dba08750fa1b84fcafc916fa7cafa30`。旧Template Example Calibratorの意味条件を保持し、旧schema／runtimeを移植しない。

### HARNESS-L2-044 design obligation portfolioの契約coverage候補（HELIX-HARNESS内の部品候補）

**対応要求**：HARNESS-L2-044（HELIX-HARNESS内の部品候補、単体能力、`version_target: 1.0`、未採択。個別部品の配置はPO判断待ち）。親L1は`HARNESS-L1-001/004/009`。旧sourceはHIL-FR-54、`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:144`（line SHA-256 `502ef00823463c0fd4218c7b554e4b6959fc28aa9006d6d6eb79f555b86b4f67`）。旧PO packet `docs/governance/crosswalks/concept-requirement-po-decision-packet.md:1008`の配置表示は`HELIX-HARNESS、部品`までであり、より具体的な所属は特定しない。

- **種別・scope**：対象revisionのrequirement atomとdesign obligationを契約coverageの意味classへ整理し、適用されるclassとnormative contractの割当を照合するHELIX-HARNESS内の部品候補（単体能力）。旧sourceの分類語やportfolio schemaを現行の固定形式にしない。
- **入力**：対象L1・要求・design scopeとrevision、当該scopeに適用されるrequirement atom／Design Obligation Graph、関連するnormative contract・対oracleのidentity/revisionと適用根拠。L2-009等から導かれる義務や025/026の設計成果を参照する場合も、そのsource revisionとscopeを結ぶ。required atom、契約、適用性またはoracleがunknown/conflict/staleなら閉包判定を行わない。
- **出力**：authority、lifecycle、interface/data/state/event/failure/security/observability/operation、V-pair oracle等の適用義務を意味classへまとめたobligation-to-contract coverageと、対象revision・scope付きportfolio提案。classごとにnormative contractを原則1件割り当て、既存契約の再利用、delta追加、新規契約、根拠付き非適用を区別する。重複割当・意味重複・未被覆classと根拠を示し、未被覆0かつ意味重複0となる最小portfolio候補を提示する。
- **依存区分**（HARNESS-L2-023の4区分）：**常時必須**＝選択された対象L1／要求／design scopeとrevision、そのscopeの適用義務class、normative contract、対oracleおよび各identity・契約版・適用根拠。**特定操作時のみ必須**＝当該portfolioを評価・提案する操作とそのscope。評価操作を選んだときは対象範囲のcoverage閉包を完了できないmissing/unknown/staleがあれば未完または保留を返す。**選択した入力元に応じて必須**＝template由来義務、041の抽出結果、025/026の設計成果を選択入力に含めるscopeでは、そのsource identity/revision・適用範囲・互換を照合する。未選択sourceは未観測とし、不在や合格を推測しない。**参照資料のみ**＝旧schema、旧runtime、背景説明、今回のscopeやauthority・義務・契約・oracleを定めない資料。これらを現行依存や評価根拠へ変換しない。
- **保証と差戻し**：適用classの全てに契約または根拠付き非適用が対応し、各割当が同じ義務意味と対oracleを覆うか照合できる。複数契約への分割は必要な境界と根拠を明示する。意味不明・authority不足は要求ownerへ、template適用・義務導出の不足はHARNESS-L2-009/対象template ownerへ、設計要素やpair oracleの不足はHARNESS-L2-026/022等の該当ownerへ返す。旧schema、旧runtime、特定のPlanner実装は要求せず、候補の出力は要求合意、設計承認、実装、候補採択を生成しない。
- **既存候補との境界**：009はtemplate選択・適用と設計義務を導出し、041はtemplate要素の抽出と未対応gapを示し、043はrule/branchごとの例coverageを評価する。026はunit設計と対検証設計を構成し、025はgeneric compositeの設計整合を検査する。044はそれらの成果を入力に契約portfolio全体のclass coverageを照合する候補であり、義務抽出・設計生成・例妥当性判定・構成体設計oracleを重複実装しない。旧FR-55の例coverageは043、旧FR-56のworkflow phase bindingは別scopeとして扱う。

### HARNESS-L2-045 WBS作業単位の形の規範契約（単体候補、version_target: 1.0）

**authority・親・所属**：本候補は未採択で、現行L2/L11本文はPO判断待ちである。親候補は`HARNESS-L1-001/002/003/004`。HDEC-L2D-S0-02は分割前候補`WBS-HARNESS-001`を承認したが、HARNESS L1親を未解決とし、適用PRに親導出の説明を求めている（`docs/governance/decisions/l2d-s0-approval-and-s1-01-defer-2026-09-19.md:189–191`）。親の対応理由は次のとおりである。L1-001の正規V-pairは作業scopeと対応する検証の対を要求する根拠、L1-002のstyle選択と品質条件維持は変更種別・工程順序・依存と並列／直列を明示する根拠、L1-003の変更影響伝播と未接続／stale確認はscope・依存・対象revisionの追跡根拠、L1-004の検証義務・反例・証拠・差戻し条件は受入・停止・差戻し条件の根拠である。親L1の意味・revisionは変更しない。配置は`HELIX-HARNESS`の作業単位形を定める規範候補までとし、CORE・service・pack等のより具体的な所属を決定しない。

**旧条件と差分**：HDECが承認した分割前行（`docs/governance/candidates/wbs-ledger-requirements.md:64`）と現行split行（`docs/helix-harness/candidates/wbs-ledger-requirements.md:22`）は同一で、行SHA-256は`272c08cdf1a73b07c3ace81bb57f5ef890a0c7339692377b0e143b9fe2474c3a`。HDECの意味承認は現在の045候補採択ではない。旧HELIXの`LEGACY-ASSET-BACB1FC117A09D20F273`、`archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.2.md:516`（旧file SHA-256 `41b38c068e91a767f964ce5ce5d7d5568c1984b3b122b808f9eff61e5a0af401`、行SHA-256 `87b212c752d0cd58fe5f77e496bb45e3e9d7a146d12b0ae84bad7926f7b21087`）は工程stepの並列／直列と依存による順序の意味の先行例である。本候補はそれを抽象的な作業単位条件として保持する。旧IMP-049の直列化3理由と既定並列上限8は本候補の入力atomではなく、同等性・置換・廃止を未判定のまま旧sourceに保持する。旧固定上限値、旧schema、runtime、CLI、hook注入や機械実装方式は移植しない。旧PHCAP-08との意味同等性は未確認であり、本候補から同等性を主張しない。

- **規範対象**：一つの作業単位は、依存、並列／直列、対象scope、予算上限、期限、対応するV-pair検証、受入条件、変更種別、工程順序、停止・差戻し条件を識別できる形で持つ。依存と工程順序を突合し、依存先が未完了の作業を並列可能として扱わず、直列化が必要な関係とその理由を追跡する。依存区分の意味は`HARNESS-L2-023`の常時必須／特定操作時のみ／選択入力元に応じて必須／参照資料のみを再利用し、045で再定義しない。
- **予算・期限の境界**：予算上限と期限は作業単位の値または適用元への参照として保持する。ここでは単位、数値、欠損・超過時の運用gate、許容値決定者、例外を定めない。これらの値の意味、出典、未設定・変更・超過時の扱いはPO判断事項として残し、045単独で新しい閾値や運用条件を作らない。
- **HARNESS／OS境界**：HARNESSは作業単位の規範形と適合条件を定める。OSはその適用revisionを参照して規範項目を台帳schemaへ写し、登録時に有効な規範と照合するが、HARNESS規範を改変せず、規範のない形または不適合・不明な形を登録しない。OS-039はこの登録側消費候補であり、規範の定義や意味変更を担わない。045は台帳、writer、実行器、schema、CLI、ticket発行を新設しない。
- **既存要求との境界**：V-pair対応は`HARNESS-L2-001`、依存の条件区分は`HARNESS-L2-023`、styleと工程順序は`HARNESS-L2-002`、freeze／差戻し／再開条件は`HARNESS-L2-003`、検証義務と証拠は`HARNESS-L2-004/022`の現行契約を具体的な作業単位に結ぶ。これらの意味を置き換えず、下流実行状態や受入成功をHARNESS候補から生成しない。
- **不成立・戻し先**：必須形の欠落、scopeと変更種別の不明、依存と並列／直列または工程順序の矛盾、V-pairと受入条件の不一致、適用規範revisionのunknown/staleは適合を主張できない。規範に照らした不適合は登録不可、適用規範や適合性がunknownなら解消まで保留とし、HARNESS規範ownerへ戻す。検証義務・oracle不足は`HARNESS-L2-004/022`、依存closure不足は`HARNESS-L2-023`、工程routeの意味問題は`HARNESS-L2-002/003`の該当ownerへ返す。

### HARNESS-L2-046 V-model全体workflowとScrum slice deltaのbackfill（単体候補、version_target: 1.0）

**authority・親**：本候補は未採択で、L2/L11の採択・実行・受入を生成しない。親L1候補は`HARNESS-L1-001/002/004`。L1-001の企画から運用評価までの正規V-pair、L1-002の対象に適した開発style、L1-004の検証義務・反例・証拠を根拠に、固定L2-002/003のworkflow・Scrum Reverse条件を具体化する。CORE、service、pack等の配置は決めない。

**旧sourceと保持・変更点**：旧v1.3 §4.4 L259と§10 L647、および同文の監査基準revisionをsource-linesとcoverage receiptに記録する。保持するのは、Full Vではsystem全体workflowを段階的に扱い、選択styleがProduction Scrumの場合はslice deltaを先行しつつ、Scrum Reverseで全体workflowと設計資産へ戻し、SR4 pair-freeze前にrelease-readyとしない条件である。L259が列挙するtransition、loop、terminal、exception、permission、timeout、notification、audit、data、switching、routing、resource allocationの検証条件も保持する。2026-09-25 PO判断による4方式の定義・製品特性に合わせた合成許可（`docs/governance/decisions/po-optimal-draft-po-decisions-2026-09-25.md:51,61`）を保ち、Production Scrum条件はProduction Scrumを選択したscope、または許可された合成内でScrumを適用するscopeのScrum進行部分に限る。変更するのは現行V-pairとHARNESS-L2-002/003の用語・責務へ接続することだけであり、ticket graph、workflow instance、runtime、旧schemaを要求しない。L647はL259と同一atomではなく、詳細条件を含まない別の受入要約として扱う。旧v1.3全521行の被覆やformal successor割当は主張しない。

- **Full Vのsystem workflow**：選択styleがFull Vのscopeでは、対象system workflow revisionを適用するL1〜L5設計層で段階的に明確化・freezeし、対応V-pairによりsystem全体の各transition、loop、terminal、exception、permission、timeout、notification、audit、data、switching、routing、resource allocationを検証する。全体workflowの対象関係、適用する層でのfreeze状態、各条件の適用・検証状態を追跡し、条件や適用層が未定なら完了扱いにしない。このscopeにProduction Scrumのslice delta、Scrum Reverse、SR0〜SR4またはSR4 receiptを要求しない。
- **Production Scrumのdeltaとbackfill**：Production Scrumを選択したscope、または許可された方式合成でScrumを適用する部分に限りslice deltaの先行を許す。該当するScrum進行では、現行L2-002/003のtriggerに従い、sprint review時またはrelease合流前にScrum Reverseでsystem workflowと該当L1〜L5設計資産へbackfillし、旧sourceが要求するSR4 pair-freezeなしにrelease-readyとしない。選択style、方式の定義・合成許可、trigger条件を本候補は変更せず、旧ticketや旧runtimeの形も再導入しない。
- **依存区分と境界**：全scopeで常時必須は選択style、対象system workflow revision、当該styleで適用する層・設計資産と対応V-pair。Full VではFull V段落のscopeと列挙条件が適用される。Production Scrumが選択・合成適用されるscopeに限り、Scrum slice delta、backfill対象と時点、既存trigger/checkpointおよびSR4状態が条件付きで必須となる。特定操作時のみ必須はworkflowまたはslice coverageを照合する操作。選択した入力元に応じて必須は適用するrequirement、design、transition、oracleのsource identity/revision。参照資料のみは旧workflow model、schema、runtime。OSはticket/workflow instanceの生成・記録・運転を担い、本候補はそれらを生成しない。
- **適合・不明時**：Full V scopeではsystem workflowまたは列挙条件の適用・検証関係が不明ならcoverage未完またはunknownとするが、Scrumのslice/backfill/SR4条件を適用しない。Production Scrumが選択・合成適用されるscopeでbackfill対象・時点・SR4 receiptが不明／欠落している場合はScrum scopeのcoverage未完またはunknownとし、当該scopeをrelease-readyと主張できない。既存のSR0〜SR4/checkpointの適用条件に不明があればHARNESS-L2-002/003へ返す。
- **authority境界**：本文とL11例は未実行のcandidate oracleである。候補の存在やcoverage receiptから要求合意、要件承認、OSのticket発行、release許可、利用者受入を生成しない。閾値、追加style、運転gate、旧runtimeとの同等性を新設しない。

## 旧HIL-BR-09/30・HIL-FR-59/60から再導出する専門Worker契約候補

### HARNESS-L2-047 専門Workerの必要性判定と契約生成（HARNESS-CORE単体候補、version_target: 1.0）

- **所属候補・状態**：HARNESS-COREの候補配置A。`HARNESS-L1-001/002/004`を親にする提案で、正式な配置・採択はPO未決である。PO判断packetにはINTELLIGENCE配置Bも残す。`registered_proposal` / `authority_effect: none`。本候補は確定したHARNESS要求として扱わない。
- **旧source・保持範囲**：旧HIL-BR-09（工程表のlayer×drive×task-kind×verification patternからHARNESS所有agent contractを生成する条件）、HIL-BR-30（process、Design Contract Portfolio、judgment pack、task分類を入力とする必要時生成、専門化抑制、境界・最小context・tool/path・budget・停止制約）、HIL-FR-59（runtime-neutral contractの項目とinput/output digest・generation rationale・guard receipt）、HIL-FR-60（測定可能な専門化便益、single-worker sufficient時の既存role、runtime適格性とlifecycle証拠）をこの限定候補の入力sourceとして保持する。選択した4行のfile/line/line SHAは専用source-linesとcoverage receiptへ記録する。他の旧要求行・IR補助contract・旧runtime資産をこの候補で移管完了にしない。
- **入力**：対象task/ticket identityとscope、対象revision、HARNESSの選択済みprocess phase・task-kind・verification pattern・適用するdesign obligation/oracle、対象domain/risk、利用する版付きjudgment pack、single-worker既存roleとの比較条件、対象task classに適用可能なLABO Worker履歴/Bench evidenceと未評価状態、必要に応じてINTELLIGENCE placement proposal、OSのassignment・budget・期限・停止条件、SECURITYの該当authority・制約。欠落・unknown・conflict・stale sourceは入力不足として保持する。
- **必要性判断の出力**：専門知識、独立context、並列性、blind verification等のうち、taskに適用される比較条件に照らした測定可能な利益が示される場合に限り`muster`候補とする。single-worker既存roleで十分なら`existing_role_sufficient`としてそのrole候補へ戻す。比較結果または適用範囲が不明なら`unknown_or_defer`とし、理由・比較対象・evidence・不確実性・差戻し先を記録する。比較可能性は記録するが、旧sourceにない共通の数値thresholdを追加しない。
- **契約生成の出力**：必要性判断が`muster`候補であるときだけ、workflow phase、task-kind、design obligation、domain object、risk、judgment pack、承認済み要求/verification oracleのrevisionへ追跡できるruntime-neutral specialist Worker contractを生成する。contractはobjective、成果物schema、tool guidance、task boundary、context selector、allowed/denied tool/path候補、model/effort class、budget、checkpoint、escalation、verification contractを含む。input/output digest、generation rationale、guard validation結果を結び、同じ正規化入力・生成規則revisionから同じ意味内容とdigestを再現できる。生成物はprovider/runtime固有設定、固定provider/model、固定Worker数を要求しない。
- **所有・authority境界**：HARNESSはprocess/verification contractとruntime-neutralな候補契約の意味、必要性判断と生成結果の検証条件を定める。INTELLIGENCEのplacement proposalとLABOの水準/evidenceは入力材料で、assignmentを決めない。OSはWorker assignment、実行状態、budget/期限、既存allowlist runtimeへのprojection、lease/fencing/失効/retireの適用および結果/evidenceを持つ。SECURITYはoperation authority・隔離制約を持つ。contractのtool/path候補や生成receiptは権限を付与せず、各ownerの正本を置換しない。
- **Workerとverifierの分離**：identity・context・authorityを分離する。provider/modelは記録する。2026-09-26 PO判断に従い、同一provider/modelか否かだけでreviewの独立性を決めない。既存runtime profile、authorityまたはlifecycle適合をOS/SECURITYが確認できない場合、当該起動候補をunknown/deferで戻す。旧lease/fencing/retireの意味条件は保持し、実装方式は固定しない。
- **依存区分**：常時必須＝task/scope/revision、適用HARNESS process/verification contract、必要性比較条件、owner別authority/evidence境界。特定操作時のみ＝taskのmuster判断、runtime-neutral contract生成、OSによるprofile projection/assignment。選択入力に応じて必須＝LABO evidence、INTELLIGENCE proposal、選択domain object/judgment packの適用revision。参照のみ＝旧provider名、旧runtime固有schema/adapter、未選択の候補や実装資産。
- **不成立と戻し先**：測定根拠なしのmuster、single-worker十分性の無視、価格/model/provider名/Bench単独での配置確定は不成立。task/process/oracle不足はHARNESSまたは要求owner、task適性proposal不足はINTELLIGENCE、適用scope/evidence不足はLABO、assignment/profile/lifecycle不足はOS、authority/安全条件不足はSECURITYへ戻す。生成contractだけでassignment、権限、Worker起動、verification、独立review、採択または完了を成立させない。
- **版と範囲**：`version_target: 1.0`は未採択候補の版印であり、初版収載・実装・実行を決めない。候補登録・receiptは選択した4旧source lineだけを対象とし、全旧source集合のclosureを主張しない。

旧原文4行、source holding、scope限定receiptは[`harness-specialist-contract-source-lines-2026-09-29.jsonl`](../../governance/audits/requirement-registration/harness-specialist-contract-source-lines-2026-09-29.jsonl)と[`harness-specialist-contract-coverage-receipt-2026-09-29.json`](../../governance/audits/requirement-registration/harness-specialist-contract-coverage-receipt-2026-09-29.json)に記録する。


### HARNESS-L2-048 役割型と対象による命名・安全なrename候補（unit candidate）

- **authority／状態**：未採択の要求候補。`registered_proposal`／`authority_effect: none`。旧要求全体の移管完了、L3承認、実装・CI起動を主張しない。
- **親L1**：`HARNESS-L1-001`、`HARNESS-L1-003`、`HARNESS-L1-004`。V-model成果物とoracleの対応、変更影響、検証義務を候補化する。
- **対象・版**：設計object、文書上の責務名、module/class/function等のimplementation symbolに対する命名規律。O9の原文にversion targetの指定がないため、版は未指定のままPO判断に残す。
- **要求候補**：対象と役割の型が読み取れる名前を提案し、型語彙の候補は旧`Entity/ValueObject/Aggregate/DomainService/Policy/Specification/Command/Query/DomainEvent/Receipt/Port/Adapter/Repository`を起点にする。実際の識別子文法、各コード要素への型適用、canonical nameはL3設計に委ねる。`Manager/Helper/Util/Data`等の責務不明名は根拠のある役割・consumer・期限付き例外が無ければfinding候補とする。
- **rename候補**：対象identity、implementation symbol、test oracleを別々のedgeで決定論的に対応づけ、名前が変わってもstable IDとoracle identityを保つ。test oracleはdomain object＋operation＋oracle IDへbindし、private実装名だけをoracle identityにしない。自動修正候補は、canonical名が決定済み、internal identifierのみ、全consumerを列挙、semantic signatureとbehavior invariantを検証可能、最小変換とrollbackを用意、をすべて満たす場合に限る。文字列類似だけの統合や責務の推測を禁止する。
- **返却・例外**：役割不明、consumer不明、behavior差分あり、public API/CLI、永続DB field/event、consumerが直接読む設定keyは自動renameせず、理由付きfindingとして作成側またはRedesign/互換migrationを伴うRetrofitへ返す。期限付き例外は理由・owner・expiryを記録して先へ進める候補とし、検出だけで工程を一律停止しない。
- **CI境界**：将来の新世代検査は違反検出、自動修正候補、返却理由の記録までを担う。CIは採択、merge、authorityを決めない。旧CIは対象外。
- **旧sourceとの差分**：HARNESS-L2-048の直接入力はHIL-FR-40、HIL-NFR-24/25および旧basic design §4.4の17選択clause spansに限る。HIL-FR-53 line 143を含む15 full linesと非選択remainderはsource holdingに保持し、この候補が再導出したとは扱わない。旧basic designのtable名や永続schemaを現行設計として移さず、実装方式・DB table・具体検出器はL3以降へ回す。

###### HARNESS-L2-048の適用境界

HARNESSは命名規律と変更時の検証条件を提供する。BRAINは再利用知識として役割語彙の意味・例を提供する候補を別identityで持つ。BRAINの語彙候補はHARNESSの命名規則、製品固有設計の採択、命名decisionを上書きしない。OS/SECURITY等の責務名、既存要求ID、採択済み要求本文の名称変更は本候補に含めない。

### HARNESS-L2-049 画面prototypeの表示計測oracle・検査精度・文言量評価（HELIX-HARNESS unit候補、version_target: 1.0）

**状態**：新規の未採択候補。O10作業依頼を起点に起草した候補であり、要求合意・L3承認・実装・実行を生成しない。049は既に与えられたrenderable prototypeを表示計測するoracleと精度評価だけを所有し、prototypeを生成しない。現在の`HARNESS-L2-039`候補はExperience/UI/Frontend関係とscreen/profile/source contractを扱うが、Pattern・製品CORE・UI profileの制約内でrenderable prototypeを作る能力は定めていない。O10が1.0方向に含めたこの生成能力のowner/scopeは未解決で、PO判断frame A/B/Cを別途提示する。049の現候補scopeは測定専用のままとし、039の採択や未記載の生成能力を推定しない。

**親L1**：`HARNESS-L1-001`（V-model pair）、`HARNESS-L1-003`（変更影響とtrace）、`HARNESS-L1-004`（検証義務・反例・証拠）、`HARNESS-L1-006`（prototypeと合意）、`HARNESS-L1-009`（design template）。対象画面、要求revision、scope、適用する既存contractとそのauthority状態を記録する。候補の親は現在のL1 bytesであり、新しいL1要求や採択を推測しない。

**種別・scope**：HELIX-HARNESSに属するVisual Design HARNESSの単体能力候補。既存のV-model層とpairを使い、別工程、独立承認者、独立実行機構を追加しない。入力されたrenderable prototypeと、その画面・領域・文言役割別profileに適用する表示計測oracleを定める。prototype生成、Experience/UI/Frontendの関係構成、semantic identityの発行はこの候補のscope外である。特にPattern・製品CORE・UI profileの制約内でprototypeを作る能力は現在の039にも記述されていない。O10のprototype生成scopeは未解決decisionとして残り、A＝将来の049 revisionへ追加、B＝別candidateへ分離、C＝deferをPOが選ぶ。どの選択もこの049測定候補を変更・採択せず、選択後の正確なrevisionへ反映する。039は未採択であり、049の入力条件として採択を前提にしない。049単独で成立する入力は、利用許可とscope/revisionが分かるrenderable prototype、選択された適用profile、および既知のpositive/negative fixtureである。pattern/style/Visual Identityは入力済みprototype/profileに明示される場合だけ計測条件として参照し、新しいprofile schemaや固定閾値を作らない。

**入力・出力**：入力はrenderable prototype、対象screen scope/revision、測定対象のdevice classまたはdevice condition、view/viewport条件、適用profile、許可された測定項目とoracle、既知fixtureと期待分類である。prototypeに必要なscreen identityやsource traceがなければ新しく発行せず不足として返す。出力は実際に表示したscope/device/view条件、各測定項目・oracle・手段版・fixture、測定結果と証拠、適用外・未測定・unknown、修正候補、差戻し先を含む。

**表示と機械計測**：入力された対象画面を指定device conditionとview/viewport条件のもとで実際に描画し、その結果に対して適用scopeで定めたアクセシビリティ、コントラスト、画面幅別の崩れ・はみ出し、主要状態（例：empty/loading/error）の有無、文言量を測る。device/view条件が未指定または表示証拠に結べない場合、その条件の測定はunknownとする。測定ごとに対象scope、device/view条件、oracle、手段・版、結果、証拠を結ぶ。O10で新規提案された文言検査は、UI profileの画面・領域・役割別上限目安を根拠に超過、反復、説明のためだけの説明を候補として返す。根拠のない固定上限や閾値は作らない。静止画、DOMの存在、prototypeの生成だけでは表示検証や合格を主張しない。

**検査精度とLABO接続**：各機械検査の適用範囲と判定条件に対し、既知の正例・反例fixtureで誤検出と見逃しを評価可能にする。精度評価が確認できない検査は合格根拠に使わず、warningと未評価範囲を返す。LABOによる検査精度の評価は既存接続の範囲で受ける。評価者・fixtureのauthority、結果保管、配置・実行運転をこの要求が所有しない。候補、fixture、測定回数だけで精度や品質を成立扱いにしない。

**依存・境界**：常時必須は対象scope/revision、UI適用性、既存要求・oracle・profile/source identityと利用許可、結果を結ぶ証拠契約である。Patternを選択する場合は既存BRAIN側の候補または確定済み契約の版・適用条件・反例を照合し、選択しなかったPatternを存在または適格と推定しない。製品固有screen/flow/token/Visual Identityは当該製品のHELIX-HARNESS-COREへ残す。LABOは測定後の評価、INTELLIGENCEは既存の配置案を担う。本候補はBRAIN/LABO/INTELLIGENCEに新しい要求identityや接続を追加せず、各候補が採択済みであるとも扱わない。実行・ticket・state記録・証拠保存は現行の既存owner契約へ渡す。

**authority・状態**：HARNESS/AIはvision、brand、見た目の好み、prototypeへの合意、L3要件freeze、L11利用者受入を自己承認しない。候補出力・機械判定・fixture評価は人の判断を代替しない。049が返す検査状態は測定単位のpass/warning/unknownであり、`implemented`や`ux_verified`を生成しない。O10の状態区別は既存`HARNESS-L2-039`候補と同scopeで重複するため、049単独で状態成立を主張しない。実データ・実利用者によるUX評価、prototypeと実装のdrift検査、計測event結線はO10の後続版へ残す。後続scopeを1.0へ前倒ししない。

**既存要求との境界**：`HARNESS-L2-039`候補はprototype/Experience/UI/Frontendの関係とscreen/profile/binding等のsource contractを広く扱う。049は既にrenderされたscreenについての測定oracleと検査精度・文言量findingだけに限り、039を置換、重複、または前提採択しない。`HARNESS-L2-022`はstageごとのoracle・evidence状態、`HARNESS-L2-005`は選択された検証義務、`HARNESS-L2-034`は選択した場合の計測契約をそれぞれ参照する。BRAIN/LABO/INTELLIGENCEの既存接続は、入力sourceが選択され有効な場合にだけその契約へ返し、新しいrequirement identityを追加しない。

**不成立と戻し先**：prototype/profile/oracle/fixtureの版、scope、authority、利用許可が不明なら測定条件を確定しない。対象の画面が表示されていない、必要な測定・証拠が欠ける、known-positive/negative fixtureで精度を評価できない、profile上限や文言役割の根拠がない場合はpassを返さず、warning/unknownと未完条件を返す。要求意味・見た目の優先順位は上流ownerへ、prototype agreementは`HARNESS-L2-024`の既存境界へ、設計・oracle不足は既存設計ownerへ、検査精度評価はLABOへ戻す。人の判断境界や毎回のapproval gateを追加しない。

**旧sourceと差分**：旧`LEGACY-ASSET-335176749F6322C3CD8D`の`ai-vision-design-harness-engine.md` VDH-FR-011の「主要stateとdevice/view条件」を選択spanとして起点にする。旧`LEGACY-ASSET-4E880D2FCD37879BA300`のdesign-harness-assessment-auditは、実装済みの文書管理と未実装のscreen/prototype機能を区別して改善順を示す背景auditとして参照する。保持点は旧screen state/device/view coverage evidenceである。O10の検査精度fixtureと文言量制約は新規提案であり、情報優先順位は保留した旧VDH-FR-005 spanを意味の参照元にする。既存039候補はExperience/UI/Frontend relationとsource contractを扱うが、Pattern/CORE/profile制約下のprototype generationを定義していない。049はmeasurement-onlyであり、生成範囲は未解決PO frame A/B/Cに保持する。VDH-FR-005のPATTERN spanを含む未選択旧sourceは`MPR-SH-VDH-O10-001`へ保全し、ここで候補入力へ移さない。semantic ID発行や人間承認も049へ再導出しない。変更点は現行layer・親L1・既存ownerへ配置し、211-file intake、旧sub-check、旧DB/runtime、旧L0-L14/旧processを移植しない。assessment auditの旧実装状態を現行の実装根拠にしない。対象sourceと保留分はO10 source inventory/coverage receiptに記録する。


### HARNESS-L2-050 レイヤ台帳リファクタリング証跡候補（HELIX-HARNESS単体、未採択）

**authority／状態**：`registered_proposal`、`authority_effect: none`。これはPOが採択した要求ではなく、2026-09-29の57候補判断にも含まれない新候補である。候補登録は要求採択、L3承認、実装・実行許可、旧要求の正式後継割当を生成しない。`version_target`は旧HIL-FR-50に指定がないため付けない。

**親L1**：`HARNESS-L1-001/003/004`。対象layer ledgerの要求・設計・検証pair、変更影響、検証義務とevidenceを結ぶ。対象revisionのConcept/L1親のauthorityはそれぞれの固定revisionに従い、本候補の登録から親の変更・採択を推定しない。

**対象と役割**：HELIX-HARNESSのlayer-ledger refactor候補を作る前段の比較・evidence条件を定める。入力は対象ledger集合とrevision、比較前後のrow/edge snapshot、比較対象scope、関係するupstream/downstreamおよびleft/right consumer、適用oracle・V-pair、変更差分、rollback計画である。ledger重複、責務混在、semantic/name collision、変更波及、孤立edgeを個別に確認し、差分があればexternalize/commonize/objectize/semantic-rename/split/mergeの候補操作と根拠を記録する。操作名だけで自動変更や同一性を推測しない。

**evidenceと候補出力**：一つの対象revision/scopeに対し、検出条件ごとの該当・非該当・unknown、変更前後のledger差分、全上下・左右consumerの列挙根拠、変更前後oracle、対応V-pair、保持・変更されたbehavior/contract/state、rollback前提と戻し先を結ぶ。列挙の母集団・revisionが示せないconsumer、edge、oracleは「なし」でなくunknownとして残す。候補出力は変更案、影響一覧、pair-preservation evidence、routing根拠を含む。必要な比較情報が欠ける間はbehavior-preservingと判定せず、Design Refactor成功候補を出さない。

**routingと責務境界**：要求または公開contractの意味変更は既存HARNESS境界に従いRedesignへ戻す。永続state変更はRetrofitへ戻す。behavior-preservingで必要evidenceが揃った場合も、この候補はrefactor可否の新たな承認者・gateを作らず、採択済み`HARNESS-L2/L11-016`のrefactor条件および採択済み`HARNESS-L2/L11-042`のDesign Refactor判定へ材料を渡す。042の本文・source scopeは変更しない。HARNESSが意味とrouteを持ち、HELIX-OSは有効な既存authorityの下でwriter/snapshot/appendの運転・記録を持つ。OSはledger意味分類やrefactor適格性を決めない。BRAINの語彙は参考知識に限る。

**旧sourceと差分**：直接のsource atomは旧L1 requirements `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`のHIL-FR-50 line 140だけである（file SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`、line SHA-256 `9d9c14e1dac400ad6cf1cacdd6a54d82d4a09374d128af2ba3036652655fde54`）。旧HOT-HIL-47 line 74およびHST-HIL-033 line 60は受入設計のoracle参照にとどまり、source atomとして数えない。差分は、旧caseのledger-specific trigger、consumer/pair/oracle集約、変更種別ごとのrouting、rollback欠落時の扱いを一つの候補scopeへ明示すること。旧API、ledger schema、runtime、実行手順は移植しない。

**隣接候補と未解決範囲**：HARNESS-L2-042は異なるv1.3 source atomsに基づく採択済み一般判断なので、本候補へ拡張・改訂しない。HARNESS-L2-048の選択rename範囲もHIL-FR-50の被覆に読み替えない。OSのwriter条件はHARNESSの意味条件を代替しない。source receiptはこの一行の局所対応だけを記録し、holdingを解放しない。HIL-FR-51〜55、HIL-FR-50全体のformal closure、旧IR全体、旧実装・旧testの実行は対象外である。


### HARNESS-L2-051 工程終了 evidence の対応候補（HELIX-HARNESS単体、未採択）

**authority／状態**：`registered_proposal`、`authority_effect: none`。本候補はPHCAP-08全体のclosureでも、要求採択・L3承認・実装／実行許可でもない。2026-09-29の57候補判断に含まれず、その判断から採択を継承しない。`version_target`は旧sourceにも今回の対象revisionにも指定がないため付けない。

**親L1と責務**：`HARNESS-L1-001/003/004/006`。HARNESSは工程の意味、stageと正規pair、oracle、停止・再開・完了の条件を持つ。HELIX-OSは既存authorityの下で対象revision、ticket/workflow、evidence参照、停止時の未完義務を記録・引継ぎする。OSのstatusやticket完了からHARNESSのstage exitを決めない。

**候補scope**：stageの進行または終了を主張する場面に限り、対象stage、適用scope、stage goal、canonical/paired layer、責務owner、required output、適用oracle、対象revision/HEAD、参照するevidenceと未完条件の関係を同一対象として追跡できることを求める。候補はHARNESS-L2/L11とL3/L10のpair単位で識別する。下位stageのpassや証拠の存在だけから上位stageの成立を推定しない。

**未完条件の扱い**：採択済みHARNESS-L2-003/022のfreeze・停止・再開およびpair別oracle/evidence条件に沿い、対象scopeの未完事項と不足する根拠を識別する。分類が不明、対象revisionがずれる、必要なpair/oracle/evidenceが欠ける場合はstageを未完またはunknownに保つ。既存要求にない後続責務、承認者、deadline、再入場資格をこの候補から作らない。

**既存要求との関係**：採択済み`HARNESS-L2-003`のfreeze/差戻し/再開/完了・未解決事項条件、`HARNESS-L2-022`のIntegrated/Verified/Acceptedの分離と段階別oracle/evidence/revisionを再定義しない。採択済み`HELIXOS-L2-002/016/017`が持つtrace、欠落/unknown/stale、ticket/workflow、未完義務の記録をstage意味へ昇格しない。これらは部分的な意味対応であり、本候補の採択や旧条件全体の移管を示さない。HARNESS-L2-050のledger-specific evidenceとPHCAP-08の工程終了evidenceを混同しない。

**PO判断待ちの別案（候補本文の規範条件に含めない）**：旧source lines 47–68のfield setをそのまま必須の単一`stage_exit_receipt` schemaにする案、各stageにindependent review receiptを必須化する案、deferへ期限と再入場条件を必須化する案は追加の意味・制約である。採否は別途PO判断が必要であり、ここでは未採択optionとして記録する。現行候補はこれらの必須化を主張しない。

**旧sourceと差分**：`LEGACY-ASSET-D27D4A1511BFD43623A9`（旧`lifecycle-stage-completion-goals.md`、file SHA-256 `21ba24bf781048f1cb03a20172c8049a6112690cda3d0d0f7dd0ba3cb0bd7406`）の選択行47–68、70–72を局所照合した。旧文書はdraftであり、その条件を本候補へcarryせず、正式successorとも数えない。候補のstage/pair/scope/evidence関係は採択済みHARNESS-L2-003/022およびHELIXOS-L2-002/016/017の部分的条件から現行責務へ再導出する。選択した25行はすべてsource holdingに保全する。formal gate/schema、未解決事項の分類、defer属性、自由記述等から完了扱いしない条件も保留し、別判断まで候補入力へ移さない。全stage独立review、期限・再入場条件の必須化も未採択optionとして保留する。旧runtime、旧test、旧process、PHCAP-08全条件を移植しない。

**境界**：coverage receiptは選択した25 source linesをholdingに保全した事実だけを記録し、source atomの候補移管、資産holdingの解除、旧FR全体のsuccessor割当、PHCAP-08の完了、PO合意、stage exitの実績を主張しない。旧sourceに含まれるlines 74–84、関連する別資産・旧case・旧runtimeは対象外である。
### HARNESS-L2-052 canonical commandの意味identityと再送判定（HELIX-HARNESS単体候補、未採択）

- **authority／状態**：新規の未採択候補。`registered_proposal`／`authority_effect: none`。2026-09-29の57候補PO判断の対象外であり、要求採択、L3承認、実装・実行許可、旧要求の正式後継割当を生成しない。`version_target`は旧HIL-FR-52に指定がないため付けない。
- **親L1**：`HARNESS-L1-001/003/004`。要求意味とV-pair、変更影響・trace、oracle・evidenceの責務に限る。OSの保存・commit運転をHARNESSへ移さない。
- **意味identity**：canonicalization commandのidentityは、呼出し側のcommand ID、操作scope、対象base revision、正規化した意味payloadのdigestを結んだものとする。command IDだけ、文書path、PR/Issue番号、到着時刻を意味identityの代替にしない。正規化規則と対象scopeのrevisionを記録し、入力payloadを同じ規則・同じrevisionで評価したときだけ同じ意味digestとする。HARNESSはこの意味照合条件とconflict分類を定め、永続保存や実際のcommitを所有しない。
- **再送・競合条件**：同一command ID・scope・base・payload digestの再送は同一操作identityとして扱い、同じ意味結果へ結ぶ。既に記録されたcommand IDが異なる意味payload digest、scopeまたはbaseに結ばれている場合は`conflict`として返し、先行identityや先行receiptを上書きしない。command IDが同じというだけで異なるpayloadを冪等再送として受理しない。baseのcurrentness／CAS拒否の運転と保存はHELIX-OSの所有であり、本候補はその結果を入力として意味分類する。
- **境界と既存要求**：`HARNESS-L2-003/004/008/016`の既存意味形成、identity、trace、影響、受入責務を変更しない。要求の採否、authority、canonical revision発行、stale伝播、event/projection/receipt保存、rollback、command記録のdurabilityはOSおよび各既存ownerへ残す。本候補から新しい承認者、毎回の人間承認、永続schema、DB名を導入しない。
- **旧sourceと差分**：旧HIL-FR-52 line 142のcommand idempotencyを意味identity条件として再導出する。保持するのは同一操作の再送と異payloadの混同拒否である。異payloadを同一command IDへ送るnegative oracleはHOT-HIL-49を限定的な受入設計参照として加える。HARNESS-L2-052は原子的な多artifact保存・projection・rollbackの実行を持たず、`harness.db`を現行機構名や再利用対象としない。HIL-FR-53 line 143のasset lineage、rename/move/split/merge/supersedeは入力にしない。


### HARNESS-L2-053 意味revisionとpath非依存asset identityの候補（HELIX-HARNESS単体、未採択）

**要求候補**：Semantic Revision and Asset Identityは、path・名称の変更から独立したimmutable asset IDとrevision履歴を保持する。意味変更を新revisionとして記録し、rename、move、split、merge、supersedeに伴うidentity/location履歴、authority、acceptance oracle、typed edgeの欠落を識別できることを求める。

**対象と境界**：要求・設計・資産のidentityと意味revisionを扱うHARNESS側の候補である。identityの具体的な符号化、採番方式、永続化方式、split/merge時のauthority裁定手順はこの候補で決めない。旧assetの実体や配置場所の変更だけから意味変更やauthority移転を推定しない。

**履歴とlineage**：rename/moveは同一identityのlocation履歴として追跡する。意味変更は同一identityの新revisionとして差分を示す。split/merge/supersedeは変更前後のidentity、関係の種別、影響を受けるhistory、authority、oracle、typed edgeを対応付け、欠落または対応不明をunknownとして残す。確認可能な候補成果はasset revision、identity/location history、split/merge disposition、semantic diffである。変換結果やreceiptの存在だけでは、意味保存、authority移転、受入を成立扱いしない。

**既存要求との関係**：採択済み`HARNESS-L2-003`の要求変更・差戻し・revision条件、`HARNESS-L2-004`の上下流traceとstale可視化、`HARNESS-L2-016`の差分分類、`HARNESS-L2-042`のsource revisionと再現可能性をそれぞれ参照する。部分的な意味対応であり、本候補はこれらを再定義せず、FR52候補の採択や先行を前提としない。HARNESS-L2/L11-052の別候補が存在する場合も、採択・順序・依存関係を本候補から生成しない。

**旧sourceと差分**：旧`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md`、file SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`）のline 143、HIL-FR-53を起点とする。保持する意味はpath/name非依存identity、意味変更時のrevision、rename/move/split/merge/supersedeでのhistory・authority・oracle・typed edgeの保持である。現行層への再配置と境界の具体化は意味の再導出であり、旧FR全体の正式successor、実装方式、実行・受入の移管を主張しない。

**authority状態**：source authorityは旧IR上の`specified_frozen`として保持する。target authorityは未採択候補であり、`draft_candidate`相当。候補本文、source atom set、coverage receipt、MPR登録のいずれもPO採択、L3承認、実装・実行許可を生成しない。


### HARNESS-L2-054 専門Worker判定・契約のOS割当handoff候補（接続候補、version_target: 1.0）

- **親・状態**：親は採択済み`HARNESS-L1-001/002/004`。`HARNESS-L2-047`の契約意味・muster判断をOSの既存assignment契約へ渡す不足条件だけを記す未採択候補であり、047の本文・採択条件を変更しない。HARNESS ownerの配置は2026-09-29 PO判断の条件付きA配置に従い、配置Bまたは新たな必須artifactの意味が必要なら対象revision付きPO判断へ戻す。仮登録・候補本文は要求採択、L3承認、assignment・Worker起動を生成しない。
- **適用入力**：047の対象task/ticket identity、scope、要求・oracle revisionに加え、工程表の`layer × drive`、選択済みprocess phase、task-kind、verification pattern、design obligation/oracle、domain/risk、judgment pack revision、single-worker比較条件、適用scopeを持つLABO evidenceと未評価状態を保持する。必要時のみINTELLIGENCE placement proposal、OSのassignment/runtime profile/budget/期限/lifecycle条件、SECURITY authority/制約への参照を結ぶ。`layer`または`drive`の意味対応、適用範囲、revisionが不明・欠落・conflict・staleなら軸を落としたり別値へ推定変換せず`unknown_or_defer`とする。現行process phase等との具体的mappingは本候補で新設せず未決条件として残す。
- **型付きhandoff結果**：HARNESSはtask/scope/source revisionと上記入力のdigest・適用条件に結んで、`muster_candidate`、`existing_role_sufficient`、`unknown_or_defer`のいずれかの意味をOSへ渡す。`muster_candidate`は047のruntime-neutral specialist Worker contract参照（複数の場合はその集合とdigest）、生成規則revision、理由、比較対象/evidence、guard結果を伴う。`existing_role_sufficient`は対象既存roleと比較根拠を示し、新規専門contractを含めない。`unknown_or_defer`は不足・不確実・stale条件、担当owner、再照合に必要な入力を示し、assignmentへ進めない。OSは受け取ったhandoffの同じtask/scope/revisionを既存assignmentへ結び、assignment・profile適格性または保留理由を既存のOS state/evidenceで追跡する。OSの応答・assignmentが欠落、対象不一致または適用条件不明ならhandoffを完了扱いしない。
- **軸と形式の限界**：`layer × drive`と047の関連入力軸を保持する意味条件であり、軸のenum、独自wire format、固定Worker数、TeamDefinition/member schema、provider/runtime固有fieldを定義しない。旧Claude/Codex射影は引き継がない。旧TeamDefinition相当の集約表現・複数contractの構成規則が要求意味として必須か、およびlayer/driveから現行phase等への厳密な対応は未確定であり、必要ならPO/L3設計で判断する。
- **責務・authority境界**：HARNESSは工程・verification意味、必要性判定、runtime-neutral contractとhandoff内容を所有する。OSは割当、runtime profileへのprojection、budget/期限、lease/fencing/失効/retireと実行・結果の記録を既存要求の範囲で所有する。INTELLIGENCEは配置案、LABOは適用可能な能力evidence、SECURITYはoperation authority・制約と隔離の正本を持つ。HARNESS handoff、tool/path候補、contract digest、OS受領記録はauthorityや実行許可を発生させず、各ownerの正本を置換しない。
- **旧sourceとの差分と保留**：旧HIL-BR-09/30、HIL-FR-59/60の工程表軸、専門化判断、contract出力、OS実行への受け渡しを現行責務へ分けて意味再導出する。旧runtime-specific projection、W-agent／TeamDefinition具体schema、IR上の補助・非選択条件、残る旧要求atomは引き継がず生存中holdingへ残す。旧出力のどの部分がHARNESSの集約contractを要求し、どの部分がOS assignmentで満たされるかの追加意味変更はこの候補で決めない。
- **不成立と戻し先**：軸・scope・oracle・contract/evidence revisionの欠落や不一致、OS assignment/profile/lifecycle条件不足は保留し、理由を該当ownerへ戻す。muster根拠なし、single-worker十分性の無視、HARNESSによる割当・起動、提案・証拠からのauthority生成、同一provider/modelだけによる独立性判定、unknown軸の推定補完は不成立とする。候補とL11 oracleは未実行であり、HARNESS-L2-047、OS-L2-004/-042/-043、SECURITYの既存要求を変更・代替しない。

### HARNESS-L2-055 隣接層の双方向trace gate結果候補（HARNESS-CORE unit候補、未採択）

- **状態・親**：未採択候補、`registered_proposal`／`authority_effect: none`。親候補はHARNESS-L1-001/003/004（固定本文はConcept/L1判断記録を参照）。この候補からL1の意味や採否を作らない。
- **要求候補**：HARNESSは指定scopeの隣接layer間について、上位義務が下位へ追跡され、下位で得た発見が上位へ戻る双方向の関係を照合し、scopeごとの未解決 descent と backflow を別に見える結果として提示できる。隣接関係でないedge、親より粗いchild obligation、個別義務を一括aggregateで覆う関係は、その理由を識別できる不成立結果とする。正常、各方向の欠落、粒度・隣接性の不一致を区別する意味契約までを候補とし、評価アルゴリズム、ledger schema、receipt形式、永続化手段はL3以降の設計へ残す。
- **適合・不明時**：対象scopeの隣接layer、row、source revisionまたは必要な関係が確定しない場合はunknown/未完とし、gate成立を示さない。一方向だけ成立しても双方向の成立へ推定しない。stale revision、semantic revision差、snapshot差の判定はNFR-29のcross-conditionとして別holdingに残し、本候補のcoverageへ混ぜない。
- **所有境界**：HARNESSは利用者へ渡す隣接層traceの意味と結果条件を定める。OSは別途合意された契約に基づくledger登録・保存・snapshot・ticket・実行を担う。候補はwriter、実行器、authority、個別の人間確認や新しい許可条件を導入しない。HARNESS-L2-040の層/pair/row catalog、L2-022の段階検証、L2-025/026の設計・対oracle構成を変更せず、これらの存在だけからgate結果を推定しない。
- **差分**：旧HIL-FR-48 line 138と旧assertion 031-01/02/03/05/06の意味を、利用者が確認できる双方向trace gateの結果へ再導出する。保持する旧条件は対応するsource atomとreceiptに限定して記録する。旧API、code、fixture、receipt schema、旧runtime/testの実行結果は移さない。

### HARNESS-L2-056 canonical V-pair gate結果とfeedback候補（HARNESS-CORE composite候補、未採択）

- **状態・親**：未採択候補、`registered_proposal`／`authority_effect: none`。親候補はHARNESS-L1-001/003/004。L0 charterは層外の既存authority anchorとしてのみ参照する。
- **要求候補**：HARNESSはcanonicalな6つのV-pair（L1↔L12、L2↔L11、L3↔L10、L4↔L9、L5↔L8、L6↔L7）をpairごとのatomic oracle対応で照合し、成立したpairと欠落・不一致のpairを局所化して提示できる。L12運用feedbackはL1企画と層外L0 charterの両方へ戻る関係を識別する。pairの片側設計義務または検証証拠がない、設計側と検証側のoracle identityが一致しない、もしくは必要なoracleの実行結果がない場合、該当pairを完了・green扱いにしない。具体的なjoinアルゴリズム、証拠schema、保存・実行機構は後続設計へ残し、L0を第7のpairへ加えない。
- **適合・不明時**：pair定義、対応するatomic oracle、適用scope、feedback先または結果証拠が不明・欠落している範囲はunknownまたは未完として残し、成立範囲を超えて全6組のgate完了としない。異snapshot・stale revisionのcross-conditionはNFR-29 holdingに分離し、この候補のsource atomとして数えない。
- **所有境界**：HARNESSはpair対応と受入結果の意味を定める。OSは実行、保存、登録、運転の契約を別途担う。候補はL1のauthority、L0 charterの意味、実行許可、人手approval、実装方式を変更しない。採択済みHARNESS-L2-040のpair catalog、L2-022の段階別受入、L2-025/026の設計・oracle構成とは別の利用者向けgate結果候補であり、既存節を改訂しない。
- **差分**：旧HIL-FR-49 line 139とassertion 032-01〜08/10/11/13から、canonical pair単位の結果、L12→L1/L0 feedback、片側欠落と未実行oracleの不成立意味を限定再導出する。assertionの`design-defined`/`not-implemented`は結果意味の参考であり旧test実行実績ではない。

### HARNESS-L2-057 closure gate意味条件候補（HARNESS-CORE unit候補、未採択）

- **authority／状態**：未採択候補、`registered_proposal`／`authority_effect: none`。2026-09-29の57候補判断が固定した集合に含まれず、採択・L3承認・実装／実行許可・HIL-FR-07のformal successor割当を生成しない。旧sourceに`version_target`はないため付けない。
- **責務**：HARNESSは今回候補へ移したClosure Gate条件の意味と成立判定oracleを所有する。旧要求全体のclose可否は保留条件を含む別判定として残す。今回候補へ移したPR、CI、独立audit、選択済みstyleへのmerge、oracle、子Issue状態は互いに別の入力・証拠として識別し、一つの状態から他を推測しない。memory compactionは未移管の旧source条件として別項目に表示する。証拠の収集・保存・Issue状態更新とclose操作の運転はHELIX-OS側の候補契約へ渡し、HARNESS自身は実行主体やclose authorityを定めない。
- **対象境界**：一つの指定されたIssue／closure scopeと対象revisionについてだけ評価する。今回候補へ移したPR、CI、audit、merge、oracle、子Issueについて、そのscopeへの適用を既存契約から特定できない、または入力がmissing／stale／unknown／conflictなら候補対象条件を充足とは判定しない。空集合、global closure、他revisionの証拠を補ってはならない。
- **closure条件**：選択されたstyleへのmergeを含む各適用入力の結果・scope・対象revisionが確認でき、必須oracleの結果がcurrentであり、子Issueを含む今回候補の条件に未解決がない場合に限り、そのscopeの候補対象条件の成立結果を返す。この結果だけで旧HIL-FR-07全体のclose可否や実際のcloseを確定しない。merge済みやCI greenだけからoracle合格やIssue closeを生成せず、候補対象条件の成立をIssue close可能、要求受入、stage完了または上流意思決定と同一視しない。
- **memory条件の保留表示**：旧HIL-FR-07のmemory compaction atomと旧HST-CASE-023-03のmemory receipt欠落時close 0件の負例は、source holdingに保全する。今回候補の結果には`memory条件: 未判定（holding）`を別項目として示し、これだけを理由に候補へ移した他の条件の評価を止めない。旧memory receiptの現行証拠との同値、適用scope、欠落時の現行close運転は本候補で決めない。OS-L2-019 continuityやprovider memoryを旧receiptと同一視しない。旧HIL-FR-10 line 100の別event・promote／supersede／no-promotionの意味、IR45のHMC置換／意味変更候補という分類もholdingで参照し、今回候補の採択対象やclose拒否条件へ昇格させない。
- **CI・GitHub projection境界**：新世代CIは未構築であり、旧CIやGitHubのPR／merge状態からCI成功、要求採択、受入、完了を作らない。今回候補で適用が必要なCI証拠を得られない対象はunknownとして候補対象条件を成立にしない。この候補はCI実装・起動や旧CI fallbackを要求しない。
- **差分と保留**：旧HIL-FR-07の七つの検査対象と二つの出力欄のうち、今回候補へ移した8 atomだけを意味入力として扱い、memory compactionの1 atomはholdingへ残す。IR45に従い、oracle／verification／acceptance段階の証拠は各ownerで分離し、一つのclosure receiptへ意味を集約しない。旧assertionは欠落時の反例oracle参照として使う。選択styleの具体的定義、旧memory compactionと現行continuityの対応、CI未構築下での対象別適用、各evidenceのcurrent判定の詳細は本候補で新設せず保留する。旧HIL-FR-07のIR行は`preserved_pending_rehome`のまま保持し、本候補登録からIR全体のclosureを主張しない。

### HARNESS-L2-058 PR findingの六分類とcurrent/successor判定意味候補（HARNESS-CORE unit候補、未採択）

- **親L1**：`HARNESS-L1-004`（検証義務・反例・証拠・差戻し条件）を主親とし、`HARNESS-L1-003`（変更影響の追跡）へ接続する候補。親の意味は変更しない。
- **候補状態**：新identityの意味再導出候補。未採択であり、PR audit、Issue発行、修正、merge、要求受入を実行・許可しない。
- **対象と境界**：選択されたPR監査で観測されたfindingについて、HARNESSはfindingの意味分類とaffected layerを示すためのoracle条件を定める。旧sourceの六つの分類名は`current_pr_fix`、`successor_issue`、`duplicate`、`false_positive`、`accepted_risk`、`telemetry`。現在の要求契約への影響と責務境界を使う`current_pr_fix`／`successor_issue`の区別を保持し、severityだけで分けない。HARNESSはOSの記録・Issue運転・merge authorityを所有しない。
- **比較入力**：既存の要求・contract・impact・coverage relationとPR差分を比較し、各判断のsource revisionとfinding identityを特定できること。source、契約、差分またはaffected layerがmissing／unknown／stale／conflictなら分類根拠を補完せず、未解決として返す。
- **分類意味**：`current_pr_fix`と`successor_issue`の区別には、severityでなく現行contractへの影響と責務境界を使う。旧HIL-FR-09は区別軸を示すが、全境界条件はこの要求で追加しない。non-actionableの四分類は`duplicate`、`false_positive`、`accepted_risk`、`telemetry`である。
- **non-actionableの証拠条件**：`duplicate`には生存targetと、そのtargetが該当acceptance oracleを包含する証拠を要する。`false_positive`には別verifierによる反証と独立reviewを要する。`accepted_risk`には、独立reviewに加え、受容するactionへ結び付いたPO receiptを要する。`telemetry`には観測ownerとexpiryを要する。これらの必要証拠が不足するfindingは確定分類せず`disposition_pending`のままにする。
- **根拠と未完保持**：六分類とcurrent/successorの区別軸は旧HIL-FR-09 line 99、non-actionable条件は旧L5 `github-pr-audit-promotion.md` §3 lines 68–70、旧L4 `infinity-loop-platform-basic-design.md` §4.2 lines 277–280、旧HIL-NFR-21 line 201に基づく。旧HIL-BR-17 line 69／HIL-FR-30 line 120の追加判定・promotion条件をこの候補へ取り込む範囲はPOの意味確認事項として保留する。旧sourceのruntime実装・詳細schemaは移さない。
- **単独成立の依存**：HARNESS-L2-004／005の検証義務・oracleと、OSが提供するfinding/evidence provenanceが選択対象revisionで利用可能であること。HR-FR-HIL-03、HIL-BR-17、HIL-FR-30は旧source上の関係・設計根拠であり、現行採択やformal successor割当を意味しない。
- **受入候補**：同じsource revision・PR差分・契約snapshotを与えたとき、六つの分類語を互いに混同せずtyped候補として表せること。current contract影響と責務境界を変えseverityだけを変えた入力はcurrent/successorの意味を変えない。分類基準または根拠が欠ける例は確定分類を返さず、未解決条件を示す。oracleの実行結果を主張しない。
- **未完保持**：四つのnon-actionable分類は前記source条件を満たす証拠だけを受け入れる。証拠が欠けるケースは`disposition_pending`に保持する。current/successorの詳細な境界条件、HIL-BR-17／FR-30の具体化をこの候補へ含める範囲は、PO意味確認と下流の独立reviewまで決めない。候補登録から採択・下流pairの完了を作らない。
- **旧source**：`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、旧`infinity-loop-platform-requirements.md:99`（HIL-FR-09）。比較対象の分類軸は同`:69`（HIL-BR-17）と`:120`（HIL-FR-30）で照合した。IR上の`HIL-FR-09`は`HR-FR-HIL-03`を参照する。旧runtime、DB、assertionを実行・移植しない。

### HARNESS-L2-059 Issue contractの意味fieldと必須存在候補（unit候補、未採択）

- **状態・親**：未採択候補、`registered_proposal`／`authority_effect: none`。HARNESS-L1-001/002/003/004/008に接続する。source lineにない`version_target`、field default、適用条件を追加しない。
- **要求候補**：HARNESSはIssue contractの意味を所有し、以下の11項目をそれぞれ独立した名前付きfieldとして保持する：`objective`、`acceptance oracle`、`development style`、`case-driven activation`、`specialist capabilities`、`runtime mode`、`affected layers`、`style target`、`risk`、`scope budget`、`digest`。各項目をfieldとして識別でき、他fieldへ結合・省略されていないことを契約revision上で確認できる。出力はversioned issue contractとそのdigestであり、OSの投影や受領によってfield名・意味・requirednessを再定義しない。
- **必須存在の境界**：旧source assertionは11 fieldそれぞれを一つずつ省略した場合の拒否をoracle条件としている。本候補も個別field omissionを不成立とするが、各fieldの型、値域、生成方法、field間依存、適用対象の選び方、値そのものの妥当性規則は定義しない。旧contractの具体的なschema/version/digest encodingは未解決として残す。
- **責務・connection**：HARNESSが11 fieldの意味とversioned contract＋digestを定める。HELIX-OSはHARNESSが発行した同じcontract revision/digestを、既存OSのdurable source intake、projection、routing/handoff上で保持・参照する。OSはfieldをrename、merge、drop、補完、別requiredness化せず、contract意味の正本にならない。OSの保存・受領記録はHARNESSの意味判定または上流authorityを生成しない。
- **既存要求・旧sourceとの差分**：HARNESS-L1-001/002/003/004/008の要求・style選択・oracle/traceの意味に置く。OS-L2-001/007/009等の正本revision、provenance、projection責務を置換しない。旧LEGACY-ASSET-719D5EC9C06FC4AAD0FF line 93のstatement atomを11別fieldと必須presence条件へ対応させ、旧右端output atomは同一のversioned contract＋digestの形で保持する。既存HARNESS-L2-047はspecialist capabilityの判断・contract生成を一部扱うが、FR-03の11 field、個別omission、Issue contract全体は定めない。OS-L2-017/019/023はticket、continuity、handoffの隣接運転を扱うが同じfield契約の正本ではない。旧IR record、assertion/system contract全体、source-line collection全体、schema細部や候補採択は本候補のclosure範囲外であり、別holdingに残す。


### HARNESS-L2-060 工程入力revisionと段階証拠の対応候補（単体、未採択）

- **状態・親**：`registered_proposal`、`authority_effect: none`。未採択候補で、採択済みHARNESS-L1-001/003/004の現行本文を候補親として参照する。2026-09-28 PO判断の採択集合外であり、その判断から採択を継承しない。
- **提供**：現行の適用契約または対象ticketで定まる工程stageについて、そのstageの入力source/revision/digestとstage結果・参照evidenceを対応付ける。結果は対象scopeと入力revisionが一致する場合に限って当該stageの証拠として解釈できる。V-pair、stageの開始・終了・freeze・Backflow・再開・完了意味、適用oracleは既存HARNESS契約が所有する。
- **境界**：stage名と順序を一律に新設せず、適用契約に明示されないstage・遷移・前段関係を推測しない。stage証拠の存在だけで工程完了、pair-freeze、requirement approvalまたは下流実行を成立扱いしない。OSのevent保存・current projection・因果関係記録はHELIXOS-L2-103候補および既存OS契約へ渡す。
- **差戻し**：入力revision/digest、適用stage契約、結果/evidenceの対応が欠落・不一致・stale・unknownの場合、stage成立を推測せず不足した契約またはsource ownerへ返す。
- **旧sourceとの対応と保留**：旧`LEGACY-ASSET-A60CF91DD2AF6693E6F9`（`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-01`、source SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`）および`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`（旧要求raw source `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:91`、file SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`）を起点にする。候補が扱うのは選択した「各段の入力commit/tree digest」atomの意味を現行の対象revision/digestへ結ぶ点だけである。`InfinityLoopEvent`受理、旧`intake→reverse→redesign?→pair-freeze→implementation→local-prejoin-ci→forward-join→internal-postjoin-ci→github-pr→external-ci→audit→merge/issue`列、前段receiptの必須化はこの候補に含めず、現行方式・対象scope・適用条件との意味照合が済むまで`MPR-SH-IR-003#HIL-FR-01`に保留する。旧順序を全対象の普遍工程として再導入せず、旧runtime/schema/test/CIも移植・実行しない。本候補とreceiptはHIL-FR-01全体のclosureまたはformal successor割当を主張しない。旧HR-FR-HIL-02の定義済み工程順・causality join・budget checkpointとHAC-HIL-02a/b/cのoracleは関連contextとして保持し、本source atom集合にも現行必須契約にも混入しない。

### HARNESS-L2-061 文書品質レビュー条件候補（HARNESS-CORE単体、未採択）

- **状態・親**：`registered_proposal`、`authority_effect: none`。未採択候補。親は採択済みHARNESS-L1-001/004（Concept固定bytes SHA-256 `06e210c312fc6a5f18c1fc29248e55ebe9c2eee0c177006e32d7b421af8baa78`、L1 `product-intent.md` SHA-256 `238ae0590f43c10c0a59a0cea4a9907328752a81388891e1a115d4278db00e1f`、承認済み親revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`）。候補本文、登録、receiptは要求採択・L3承認・実行許可を生成しない。旧BR-08/FR-L1-45のidentity authorityはconfirmedだが、target successorは未決・未採択であり、source holdingを解除しない。
- **提供条件**：適用scopeで大規模文書改定と分類される改定、gate evidenceの提出、またはpair freezeの前に、対象文書revisionを変更しないread-onlyの文書品質review結果を得る。大規模の分類条件は既存の適用契約がある場合だけ参照し、本候補で数値閾値・別分類制度を新設しない。適用性または分類根拠がunknownなら適用済みと推定せずunknownとして保持する。reviewは文書品質を評価する専用の能力・結果契約として識別できるが、固定worker名、provider/model、lane、tool、実行方式は定めない。
- **4軸の結果**：review結果は整合、網羅、一貫、明確をそれぞれ独立に示し、各軸の根拠となる対象文書revision・scope・箇所または参照・理由を結ぶ。軸を相殺・集約して個別結果を失わない。指摘がない軸も、その対象と確認結果を明示する。所見は修正案の提示を含められるが、review能力は対象文書を変更しない。
- **不成立・境界**：該当triggerでreviewが未実施、結果・4軸・根拠revision/scopeが欠落またはunknown/staleの場合、対応する文書品質条件をcompleteとせず、適用stage/gateの品質証拠は未完またはunknownとして返す。その品質条件がgateの適用前提なら、reviewが揃うまで当該gateを通過させない。ただしPOは、対象revision・scope・未完の条件・通過を許す理由を明示して記録を残し、当該gateのこの文書review条件だけを例外として通過させられる。記録は監査可能に保持し、review未実施・unknownの事実を消さない。AI、reviewer、gate運転者は自分で例外を作れず、POの記録がない場合は通過できない。この例外は他の品質・安全・authority条件の免除、要求採択、approval、merge、releaseの許可ではない。旧G1/G3/G7/G11を現行の固定gate集合として再導入しない。
- **既存責務との関係・差分**：HARNESS-L2-005のticket/risk別検証選択、HARNESS-L2-022の段階別oracle/evidence、HELIXOS-L2-018の作成と独立review、exact HEADを対象とする現行GitHub reviewは一般・隣接契約として残るが、BR-08/FR-L1-45の三triggerと4軸を個別に保証する契約とは同値でない。本候補はその不足条件と旧FR-L1-45の記録付きPO例外の意味を限定再導出し、各既存要求を改訂・置換しない。旧role名、`.helix/audit`記録先、G1/G3/G7/G11の固定gate集合、`HELIX_DOC_REVIEWER_BYPASS`環境変数は方式として採用しない。保持する点はPOだけが理由を記録して該当文書review条件を例外処置できること、変更する点はその操作方法を旧環境変数・旧保存先へ固定しないことである。旧環境変数だけでは対象revision・scope・未完条件・理由を記録へ結べないため、現行の証拠・authority境界に沿う記録条件へ再導出する。その他の旧方式とsource line全体のclosureは保留し、旧source holdingを維持する。


### HARNESS-L2-062 baseline debtと新規debt ratchet候補（HARNESS-CORE単体、未採択）

- **状態・親**：未採択の要求意味候補、`registered_proposal`／`authority_effect: none`。主親は`HARNESS-L1-004`（対象revisionとriskに合う検証義務・反例・証拠・差戻し条件）。既存のHARNESS-L2-004/005とL11は変更しない。
- **候補条件**：適用可能な既存authorityが与えるbaseline debt集合と、同一scope・比較対象のcurrent debt集合を照合し、baselineに含まれるdebtとbaselineに含まれないnew debtを結果上で区別する。new debtが比較で得られた場合、ratchet結果を成立/passとして返さない（fail-close）。baseline debtの存在だけから許容・免除・解消を推定しない。
- **未確定入力**：baselineのauthority、identity/revision、適用scope、鮮度、current debt集合、両集合に共通して適用するdebt分類基準、baseline更新規則または比較に必要な入力が欠落・unknown・stale・conflictなら、比較結果はunknown/未評価として保持し、ratchet成立を示さない。これらの値や決定者を本候補で新設せず、上流または適用ownerの既存契約へ戻す。閾値やdebt種別も追加しない。
- **所有境界**：HARNESSは対象revisionの検証oracleとfail-close結果の意味を定める。HELIX-OSのL1/L2は管理記録、状態、実行・運転を扱う。近接する採択済みHELIXOS-L2-037（57候補判断）の週次drift/debt観測・ticket引継ぎ候補は別の運転接続であり、HARNESSのdebt分類・baseline authorityやratchet判定を与えない。source owner移管は推定しない。
- **差分と保留**：旧DAC-FR-007 line 54のbaseline/new debt分離とnew-debt fail-closeを限定して再導出する。旧要求はbaseline定義、baseline選定権限、分類閾値、更新条件を指定しないため本候補も定義しない。候補は比較結果の意味だけであり、censusの実装・全repo scope・許可、既存debtの受容、旧source全体のformal successor、採択、実装・実行を主張しない。

### HARNESS-L2-063 source-authority binding and freeze closure (HARNESS-CORE unit candidate)

- **状態・親**：新規候補。親は固定済みHELIX-HARNESS L1の`HARNESS-L1-001`（V-pairと成果物trace）、`HARNESS-L1-003`（変更影響・stale）、`HARNESS-L1-004`（対象revisionに応じた検証義務・反例・証拠・差戻し）、`HARNESS-L1-009`（template適用と設計義務）である。対象L1の固定は親意味の確定であり、本候補の製品版・1.0収載を決めない。候補本文、仮登録、receiptはL1/L2の合意、L3承認、実装・実行許可を生成しない。
- **対象残差**：旧`HR-FR-HIL-17`のうち、原sourceとauthorityを個々のatomへ結び、challenge/dispositionと全atomのrevisionが揃うまで対象revisionをactiveにしない意味、同一freeze対象の全typed edgeとacceptance oracleの閉包、change/stale receipt、template gapの独立review前active禁止をHARNESS契約へ再導出する。入力source atomはreceiptが固定する3つの意味スライスだけである。旧契約に列挙された全要求ID、旧IR、HAC/HAT全体のformal successor・全量被覆は主張しない。
- **入力・出力**：入力は選択scope、対象L1/L2・source authority revision、各source atomのidentity・原文span・適用modality・disposition・challenge状態、HARNESS-L2-009で選択されたtemplate identity/revision/applicability、HARNESS-L2-041のatomまたはgap、HARNESS-L2-040の型付きedge契約、対象revisionに必要な受入oracle、change/staleの前後revisionと差分根拠である。出力はatomごとの由来とauthority状態、edge/oracle closure、未解消gap/challenge、change/stale影響、対象revisionの`eligible`／`incomplete`／`unknown`判定をまとめたfreeze receipt候補である。HARNESSはactiveの意味と適格条件を所有し、OSは既存契約に従い登録・state遷移・ticket・保存を運転する。
- **閉包保証**：対象revisionに含める全atomについて、原source spanとauthority revisionへ遡れる。challengeは対象atomとtarget revisionに結び、未決・根拠不足なら未完として残す。freeze対象の全要求relation、design obligation、対応するL11 oracleを対象scope・同一revisionで対応づけ、型・向き・端点の欠落を個別に示す。適用されるpositive oracleとboundary/negative oracleを持たない義務、実行結果のないoracle、根拠のないN/A、集約のみの対応は閉包に数えない。change receiptは変更前後revision・source/template/ledger identity・影響edge/oracle・stale範囲を示す。必須入力revisionの変化後は旧receiptを現revisionの有効証拠に使わない。
- **template gap境界**：041が示したgapを明示的に保持し、独立reviewの対象revision・reviewerの独立性・finding・解消または未解消状態が揃う前にactiveへ昇格可能としない。自己review、作成側の自己承認、候補作成・登録・issue/PR状態からの昇格は不成立である。独立review結果は意味上の入力であり、追加の定例人間approvalを新設しない。人が持つ要求意味の変更とauthority-state modelが求める対象revisionのdecisionだけ既存判断経路へ戻す。
- **依存区分**（HARNESS-L2-023の4区分）：**常時必須**＝対象L1/L2とsource authority revision、対象scope、選択された全atomのidentity/source span、対象freezeに必要なtyped-edge・oracle契約。**特定操作時のみ**＝freeze closureの評価とrevision eligible判定。評価操作を選んだ場合、closureに必要な入力を欠く範囲は`incomplete`または`unknown`で返す。**選択した入力元に応じて必須**＝templateを用いるscopeでは009の選択・適用条件とtemplate revision、041のatom/gap、040または互換なledger契約、影響を受ける各pair/oracleのrevisionを照合する。未選択source/templateは未観測として扱う。**参照資料のみ**＝旧runtime/API/schema、旧test実行、背景説明、今回の選択scope外のtemplateやoracle。これらから現在のauthority・合格・実行を推定しない。
- **責務境界と既存要求**：HARNESS-COREはsource/authority atomの対応意味、challenge dispositionの要求条件、revision単位のedge/oracle/change/stale closure、およびtemplate-gap review前のactive禁止を定義する。HARNESS-L2-009はtemplateの選択・適用と不足inputのBackflow、HARNESS-L2-041はactive template要素の原子的抽出とgap提示、HARNESS-L2-040はlayer/pair/row catalogとtyped edgeの契約を担う。採択済みHARNESS-L2-035は上流根拠から候補・受入寄与までの導出と循環・scope逸脱の照合を担う。063はこれらを置換せず、個別source atomからfreeze対象全体の受入閉包を結ぶ。HARNESS-L2-022/025/026の検証・設計oracle、HELIX-OSの登録/state/ticket運転、SECURITYの操作authorityを代替しない。
- **不成立と戻し先**：source/authority revision欠落、challenge未解消、atomのTBD/aggregate、orphanまたはtyped edgeの型・向き・端点不一致、必須oracle欠落・未実行、根拠のないN/A、change/stale範囲漏れ、template gapのindependent review欠落はactive適格としない。意味・sourceの不明は該当要求/source ownerへ、template適用・抽出gapは009/041またはtemplate ownerへ、catalog/edge契約不整合は040 ownerへ、OS保存・state・ticketの不足はOSへ戻す。未選択・未観測はpassにもfailureにも読み替えず`unknown`を保つ。
- **旧sourceとの差分**：`LEGACY-ASSET-67761C517521603F844C`の`archive/legacy-generation-2026-09-14/root/requirements-ir/system_contracts.json#/HR-FR-HIL-17`のbehavior・transition_contract・failure_and_evidenceを起点とし、旧`HAC-HIL-17a/b/c`、`HAT-HIL-17`は受入oracleの設計根拠として読む。保持するのは上記3意味スライスと正負・境界oracleである。旧sourceの固定schema、API、runtime、旧active pointerへの書込みは現行契約へ移さず、authority自体をHARNESSが発行する意味にも変えない。原文と選択scope外のsourceは生存source holdingへ残す。

### HARNESS-L2-064 support tierとprofile evidenceの対応候補（HARNESS-CORE unit candidate）

- **状態・親**：未採択の候補、`registered_proposal`／`authority_effect: none`。親は固定済みHELIX-HARNESS L1の`HARNESS-L1-001`／`HARNESS-L1-004`。2026-09-28 PO判断が固定したL1本文とHARNESS-L2-005／022の採択済みrevisionを参照するが、本候補の採択・L3承認・実装／実行許可は生成しない。
- **限定対象**：旧`HR-FR-HIL-14`のsupport tierとprofile結果の対応意味のうち、Linux `primary/full`、macOS `first-class portable`、Windows `compatibility`という区別、同一の選択contract/fixtureを各選択profileへ適用すること、profileごとの結果状態、および別profileの結果から他tierを推定しない条件を扱う。OS差分をadapterへ隔離しdomain logicをforkしない意味は保持し、WSL/Git Bash/PowerShellをcore実行前提にしない。HAC-HIL-14aの「3 OSが定義scopeをgreen」は旧positive oracleとして保持する。候補scopeに3 profileすべてが明示された場合はLinux/macOS/Windowsの3件すべてに個別evidenceを要し、1件以上が未実行・未確認ならHAC-HIL-14aの成立を主張しない。候補自身はscopeを選択しない。fixture内部のpath/process/lock等の個別oracle、adapter violation taxonomy、supply-chain、SBOM、license policyは対象外とし、旧source holdingに残す。
- **適用scope**：どの製品、repository、consumer、配布段階に各tierを適用するかは未選択のまま保持する。既存の上流authorityが明示したscopeとprofile集合を入力に使い、候補自身は選択、全製品への展開、Linux-only化、Windows却下を行わない。scope/profile集合がmissing／unknown／stale／conflictなら適用範囲を補わず`unknown`／未評価を返し、coverageを主張しない。scope選択が未決なら既存scope frameのA（製品能力）／B（repository受入）／C（条件別分割）／D（scope決定まで保全、推奨）をPOへ提示し、選択までHAC-HIL-14a成立を主張しない。旧HAC-HIL-14aの条件を満たすには適用scope内のLinux/macOS/Windows全profileが必要である。特定scopeに一部profileしかないという限定提案が後に選ばれても、それはHAC-HIL-14aと同じ3 OS保証の履行・formal successorを意味しない。未選択profileを暗黙にN/Aとしない。
- **対応保証**：coverageを主張する結果は、各適用scope内のprofileごとにtier、対象revision、共通contract/fixture identity、profile固有environment/run identity、oracle、結果/evidenceを対応づける。全profileへ同一のdomain contract/fixtureを適用し、許される差は選択済みOS adapter側に限る。macOS portable suiteとWindows compatibility smokeをそれぞれのtier結果として分けて示し、未実施なら未実施と記録する。OS-020の実行状態区分を使い、profileのmissing／unknown／skipped／interrupted／staleをgreen、または未選択・未観測を成功へ読み替えない。他tierや別OSの結果を、当該profileの証拠に転用しない。
- **tier意味と負境界**：選択scopeが定めるcore gateの完全な集合を入力として識別し、Linux `primary/full`のcore completionはその全gateをLinuxで実行した結果によってのみ評価する。一部gateのみ実行・成功し残りが未実行／不明ならLinux core completionを未完とする。macOS `portable`とWindows `compatibility`で生じる差異はprofileごとのadapter contract testで検出し、そのtest結果を対象profile・contract/fixture・revisionへ対応づける。test未実施・結果不明を差異なしと扱わない。macOS `portable`またはWindows `compatibility`の結果だけからLinux core completionを成立させない。Windows wrapperのgreenをLinux互換の証拠としない。Linux結果のみからmacOS/Windowsのscope coverageを推定しない。3 OSすべてがscopeに含まれる条件で1 OSだけ成功し残り2 OSがmissing／not runであれば、「3 OSが定義scopeをgreen」のHAC-HIL-14aを不成立／未完とする。profileとtier labelの対応が旧定義と異なる、同一contract/fixtureの対応が欠ける、OS差異をadapter contract testで検出していない、domain logic forkがある、結果を別profileへ付け替える場合は当該coverageを成立扱いしない。scope選択の未決・矛盾は既存scope frameと選択肢をPOへ戻す。verification oracle不足はHARNESS-L2-005 ownerへ、profile実行・environment・receipt不一致はHELIXOS-L2-020 ownerへ戻す。
- **要求stageとの境界**：これはprofile/証拠の解釈契約候補であり、L2/L3の起草・承認・freezeに実行済みのOS runtime successを前提化しない。実装・実行結果が後段で提示された場合のcoverage意味を定める。candidate本文、L11 oracle、または旧test設計はruntime実績を示さない。
- **責務境界**：HARNESSはtier/profile/共通contractとcoverage oracleの意味を定める。HELIX-OSまたは選択した利用者CIは、既存HELIXOS-L2-020に従ってrunを組立・運転・回収し、結果状態を記録する。HELIXOS-L2-021の配布・更新・復旧は別の対象project運転であり、support tierを選択しない。OS-030は保留中の別候補で、ここから本体実行OS・consumer・段階・切替条件を決めない。
- **差分と保留**：旧`HIL-TR-04`、`HIL-FR-34`、`HIL-NFR-09`、`HIL-NFR-19`のtier/profile同一fixture・非推定条件を選択して再導出する。保持点は3 tier区分、3 OS positive oracle、tierごとの異なる証拠責任、共通contract、Linuxで全core gateを実行する条件、macOS/Windows差異をadapter contract testで検出する条件、OS別domain logic fork禁止、および非core shell否定である。候補の限定提案は対象scopeを選択profileの証拠対応だけに保ち、3 OSすべてを要求する旧HAC-HIL-14aと範囲が異なるため、その採用は旧positive oracleの充足やformal successorを意味しない。この適用範囲差は上流へ提示する未決事項である。`hil14c-online-offline-lock-sbom-policy-scope-frame-2026-09-29.md`のA（製品能力）、B（repository固有受入）、C（条件別にscope分割）、D（scope決定まで保全して保留、推奨）はいずれも未選択である。product/repository適用表、配布段階、adapter fixture内部条件は本候補で決めない。旧IRの残り、HAC-HIL-14b/c、HAT-HIL-14全体のformal successor、source holding closureは主張しない。

### HARNESS-L2-065 選択adapter operationの取消・lock failure結果候補（unit candidate、未採択）

- **状態・親**：未採択の限定候補、`registered_proposal`／`authority_effect: none`。親は固定済みHELIX-HARNESS L1の`HARNESS-L1-001`／`HARNESS-L1-004`。採択済みHARNESS-L2-005/022のverification・受入契約に結ぶが、それらの採択をこの候補へ拡張しない。
- **適用条件**：対象は、明示選択されたadapter operationのうち、当該operation contractが子processを所有する、または複数stepのstate mutationを行いlock/contention/timeout failureが適用される範囲に限る。profile、製品、repository、consumer、operation、storage方式はこの候補で選択しない。該当operationがない場合は理由付きN/A、適用性・owner・観測可能性が不明ならunknownとし、全runへ旧fixtureを一律要求しない。
- **取消結果保証**：選択operationに帰属する子processがある場合、runをcancelled terminalとして返す時点で当該runに帰属する実行processの残存は0件である。残存の可能性がある、終了を確認できない、processとrunの帰属が不明な場合はcancelled terminal successにせず`interrupted`／`unknown`を保持し、未完義務とOS assignment/Worker ownerへの返却情報を残す。process起動・停止・回収の実行主体は既存HELIX-OS Worker契約と実行環境であり、HARNESSは状態と受入oracleを定めるだけである。
- **状態変更結果保証**：選択operationが複数stepのstate transactionを持ち、当該operation contractで定めた再試行範囲が尽きてlock競合・timeout failureとなったとき、選択した意味がfailure atomicityを要求する場合はpartial transaction（処理の一部だけが可視な状態）を残さない。partial stateが観測された、または状態を照合できない結果は、このoracleを満たさず、成功・完了・Acceptedへ進めない。既存operation contractがpartial side effectと復旧を許す場合は旧HST-CASE-014-07の厳密なoracleと異なる意味であり、この候補から既存condition充足を主張しない。具体のcommit方式、database製品、lock API、retry数、timeout値は決めない。SQLiteは旧fixtureの一例であり、現行の必須storageではない。
- **failure evidenceと戻し先**：oracleは対象要求/pair revision、選択operation、適用scope、before/afterのstate識別、run/結果状態、部分作用の有無を同じevidenceへ結ぶ。evidenceの欠落、stale、対象違い、観測不能をpassにしない。HARNESS verification/oracle不足はHARNESS-L2-005/022 ownerへ、process lifecycle/lock enforcement/state recoveryの不足は当該Worker実行環境またはstate ownerへ、OS run/receipt/再開の不足はHELIXOS-L2-020 ownerへ返す。必要な左側の意味やtransaction境界が未定ならHARNESS L2/L3の該当要求ownerへBackflowし、OS/HARNESSが意味を補完しない。
- **既存条件との合成**：SECURITY-L2-007/008/009のoperation-scoped制約・authority・停止伝播、HELIXOS-L2-018/019/020のassignment・二重実行防止・未完義務・checkpoint・interrupted等の状態区分、INFRASTRUCTURE-L2-005/010のbefore/after・部分operation・適用recovery/rollback義務、HARNESS-L2-005/022の構造固有oracle・expected failure・evidence・差戻し先を再実装しない。これらは失敗の記録、非成功化、再構築/回復を担うが、失敗時child process残存0や全-or-none transactionを一律に要求しない。root外symlinkによる許可scope外write=0はSECURITY-L2-007のwrite path、実diff、禁止diff拒否、rollback/unknown条件に対応するため、本候補の追加条件にしない。詳細なsymlink/junction/TOCTOUの物理検出試験は既存SECURITY source noteのとおり下流設計に残す。
- **sourceと重複境界**：旧`HIL-FR-34` line 124は同一fixtureのprocess-group/file-lock/SQLite文脈、旧`HIL-TR-05` line 169はprocess/signal/file-lock/storage差分のOS adapter隔離を与える親条件であり、この2行自体は数値0の結果を規定しない。取消terminal時のprocess残存0は旧assertion consumer `LEGACY-ASSET-7B1C7AED3AA401868455` の`HST-CASE-014-06` line 126、lock failure後のpartial transaction 0は同じassetの`HST-CASE-014-07` line 127が直接規定する。source ledgerでは親要求slice 2 atomとconsumer oracle 2 atomを別種別・別identityで保持し、4 atomのset digestへ含める。HARNESS-L2-064の限定候補とは別スライスである。064は同一fixture identityのprofile間対応とtier/non-inferenceだけを扱い、fixture内の個別結果oracleは対象外。domain logic fork=0、profile parity、support tier、3 OSのscope/greenを本候補で重ねてclosureしない。旧HST-CASE-014-04のadapter leak、014-05のsymlink write=0、014-08/10の同一fixture/domain fork、case/space/Unicode/permission/executable discoveryの個別成功値は今回の意味slice外で保持する。
- **候補が扱わないこと**：旧HAC-HIL-14b全体のformal successor、HAT-HIL-14合成受入、HAC-HIL-14a/c、旧IR全6 atomのclosure、旧API/runtime/schema/CI/test、support/product/repository scope、全操作の子process必須化、旧SQLite採用、旧retry上限、旧process-group方式、具体のOS matrixを採択しない。候補記述・登録・文書検証から実装、実行、release、stage完了を推定しない。
- **人間判断へ示す意味差**：旧source holdingは維持する。候補は旧HST-CASE-014-06/07の選択結果をHARNESS oracleへ限定して具体化するため、適用profileと対象operationを未選択に保った部分sliceであり、旧HAC-HIL-14bの全platform fixture拒否・HAT全体の履行を意味しない。製品能力／repository受入／条件別分割／scope決定まで保全する選択肢A/B/C/Dは既存HIL-14 scope frameのまま未選択とし、Dを推奨候補としてのみ示す。
- **旧source**：`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:124,169`、各line SHAは登録source atom set参照。旧assertion `LEGACY-ASSET-7B1C7AED3AA401868455` lines 124-127,389,420の該当行は未実装設計oracleであり、実行・移植しない。

### HARNESS-L2-067 選択source scopeのatomic behavior分解候補（unit）

**状態・所属**：新規の未採択HARNESS-CORE候補。source behaviorの意味上のatomizationを定める。所属・候補採択は未確定で、OSのintake・provenance・記録責務を移さない。旧target routingはOS、後続PO packetはHARNESSを示すため、対象owner選択は[FR37照合監査](../../governance/audits/requirements-stage/ir153-hil-fr35-41-current-condition-audit-2026-10-02.md)の選択肢へ残す。

**版**：旧HIL-FR-37 line127にversion target指定はなく、固定L1親も候補の製品版を決めない。対象版は未指定で、1.0自動収載を示さない。

**親と既存契約の分担**：候補の親は固定revisionの`HARNESS-L1-001/003/004/008`。`HARNESS-L2-019`はReverse scope入口と未観測の保持、`HARNESS-L2-027`は選択source typeの静的観測、`HARNESS-L2-038`は観測manifest中の各capabilityの内容閉包、`HARNESS-L2-040/041`はlayer catalogとtemplate由来obligationの意味をそれぞれ持つ。067はそれらを置き換えず、sourceに現れる一behaviorを一atomに分ける基準と分母を追加する。HARNESS-L2-041のtemplate obligation atomsはsource code behavior atomsとは異なる。OSの`HELIXOS-L2-015/016/019`が担う原source custody/provenance/state記録とも別責務とする。

**対象scope・入力**：Full Reverseまたは旧sourceの意味照合で利用者が明示選択したsource snapshot、read scope、file/entry/symbolに限る。対象revision/digest、読取scopeとauthority、027のsource-bound observationとその抽出限界、extractor/capability版を入力する。067は独自parser、source reader、runtime挙動の実行を要求せず、027が対応しないsourceは未観測/unsupportedのまま保持する。

**提供・保証**：sourceに根拠があるbehaviorを一つずつ独立atomとして表し、各atomにsource span、source revision/digest、extractor version、必要な場合のparent aggregate relation、識別できた入力・出力・副作用を結ぶ。識別不能な入力/出力/副作用は推測せずunknownとして示す。aggregate parentとfile/entry/symbol分類は所在・関係情報であり、coverage分母に数えない。分母は選択scopeに含まれるatomic behavior childであり、parent-child countと個々のchild状態を示す。unclassified/overlap finding、欠落・未閉鎖child、sourceまたはextractor revision変更によるstale childが残る間は、当該scopeをatomic behavior coverage completeと表示しない。038への各childの処置・relationは個別に追跡可能にする。

**差分と境界**：旧HIL-FR-37のbehavior単位、source span、extractor version、親集約、I/O/副作用、親/fileを分母外とする条件を保持する。source observationをrequirement meaning・承認設計・test oracle・runtime実測へ昇格させない。固定旧source schema、archive全量走査、旧failure code、物理registry/DB、旧runtime/testの実行は要求しない。sourceからのatom抽出・coverage観測は要求意味の採否や下流pair完了を決めない。

**不足時の戻し先**：source identity/span/authority不足、unsupported領域、extractor version不明はsource/027 ownerへ戻し、該当範囲をunknownとして保持する。atom identity/parent-child/overlapまたは分母不足は未完findingとしてHARNESS-COREのatomization ownerへ返す。要求/設計/verification endpointへの処置・authority不足は038と既存ownerへ返す。候補本文、receipt、registerは採択・L3承認・実装・実行・受入を生成しない。

### HARNESS-L2-068 Design Refactorの独立変換計画と実施前rollback根拠候補（unit）

**状態・所属**：新規の未採択HARNESS-CORE候補。既存のRefactor判定と実行前提に対し、選択されたDesign Refactor変換を単位ごとに計画し、対・consumer・rollback根拠を揃える条件を追加する。実際の変換方式、rollback手順、tool、schema、CIは定めない。

**版**：旧HIL-FR-39 line129にversion target指定はなく、固定L1親も候補の製品版を決めない。対象版は未指定で、1.0自動収載を示さない。

**既存要求との境界**：`HARNESS-L2-002/003/004`は変更scope、影響、Backflow先とSR3 route、`HARNESS-L2-014`は承認済み設計と設計工程、`HARNESS-L2-016`は振る舞い・契約・要求を保つRefactor、`HARNESS-L2-022`は段階別oracle・検証義務・evidence、`HARNESS-L2-035`は選択scopeに対する根拠・acceptance寄与・最小性・代替案・budgetの照合、`HARNESS-L2-042`はsemantic similarity・consumer・oracle・dependency graphに基づくDesign Refactor判定と機能追加の別episodeを扱う。採択HARNESS-L2-053はasset identityとrename/move/split/merge/supersede後のidentity/location・authority・oracle・typed-edge lineageを対応付け、欠落をunknownにするが、Design Refactorの独立変換計画や接続前のpair更新/回復basisを規定しない。`HARNESS-L2-048`は選択scopeのobject/symbol/oracle安定identityと限定rename安全条件を扱う。068はこれらを置換せず、Design Refactorとして選んだ変更を既存Refactorへ渡す直前の独立変換単位・pair・回復可能性の保証を補う。通常のRefactor、実施許可、追加review承認条件は作らない。

**対象・入力**：一つの対象revisionと明示scopeでDesign Refactorを選んだ場合に限り適用する。現行design graph内の重複contract/policy/schema、責務とstate invariant、全影響consumer、変更前後を比較する既存oracle、候補変換の意味上の差分を入力し、重複候補とその責務・意味・consumer関係を比較する。対象requirement/design pairのrevision、対象scope/non-goals、そのrevisionに適用する既存Scope Authorityの根拠を同じ対象へ結ぶ。`externalize`／`commonize`／`objectize`／`semantic-rename`を独立に評価可能な変換単位として計画し、併用時は単位と依存関係を分けて示す。これらの名称を固定enumや実装操作として要求しない。

**保証**：各変換単位について、変更前後のgraph/semantic signature、対象invariant、全影響consumerとその契約を照合する。重複contract/policy/schemaは単に「関連」としてまとめず、同一scopeで実際に重複する候補として比較し、責務・state invariant・consumer・before/after oracleと照合した結果を個別に示す。semantic renameは名称の文字列類似だけで判断しない。入力、出力、副作用、failure、state transition、call graph、consumer contractを含むsemantic signatureを比較し、意味が同じで名称だけが異なるものは同義名として統一候補にし、名称が同じでも意味が異なるものは別の概念として分離候補にする。その変換で影響を受ける全設計pairと対oracleを特定し、対象revisionに対する設計pairの更新内容と対応oracleのscope/revision/期待意味、全consumer互換性が実際に整合して揃うことを、既存Refactorへ接続する前提とする。同じ対象revisionとscopeに有効な既存Scope Authorityが当該変換を許可することも接続前条件とし、authority根拠がmissing/staleまたは対象scope外なら接続しない。新しい承認手続きは作らず、既存HARNESS-L2-002/003/035のauthority照合へ戻す。必要pairが未更新、stale、欠落、またはoracleが更新設計と不整合なら接続可能としない。更新・stale化予定の列挙や、影響pairをstaleと印すことだけでは通過にならない。observable behavior、public surface、DB semantics、要求の差分を検出した場合は既存Redesign/Retrofit routeへ戻し、Refactorだけで変更を完結させない。各変換の設計Refactor PLAN、変換種別、before/after graph digest、semantic/name-collision evidence、behavior-preservation receiptを対象scope/revisionへ結び、rerouteする場合はreroute receiptへ対象差分と戻し先を結ぶ。振る舞い・contract・要求が保存される範囲では、実施前に対象scopeへ適用可能なrollback/recovery basisとその参照先を特定する。これはrollbackの具体方式や成功実行、新しい承認を要求せず、根拠がmissing/unknown/staleまたは対象差分を戻せない場合に接続可能としない。複数変換の一つが未評価でも他の独立変換の結果は個別に保持する。

**失敗時の戻し先・限界**：重複候補の比較、semantic signature、consumer、paired oracleまたはauthorityが欠ける場合は影響scopeをunknownとしてHARNESS-L2-003/004/016/042の既存ownerへ戻す。observable behavior、public surface、DB semanticsまたは要求に差分がある場合は既存Redesign/Retrofit routeへrerouteし、単なる設計pair更新をもってRefactor内に閉じない。上流意味が変わる場合は該当existing Backflow先へ返す。rollback basis不足は実施前の未完条件として保持し、具体策を発明せずdesign/operation ownerへ戻す。068はrollbackのtest成功、実行可能なprocedure、常時人手approval、全ticketのrollback gate、全種類のRefactor検査、runtime/CI実装を要求しない。

**旧sourceとの差分**：旧HIL-FR-39 line129の独立変換計画、重複contract/policy/schemaの比較、全consumerとbefore/after oracle、semantic signatureに基づくrename（同義名の統一候補と同名異義の分離候補）、behavior preservation・全consumer互換・Scope Authority・設計pair更新・rollbackが揃う場合だけの既存Refactor接続、observable behavior/public surface/DB semantics/要求差分のRedesign/Retrofit rerouteを保持する。旧transform名/API/schema/error codeを現行固定語彙や物理実装へせず、Refactor以外へscopeを広げない。登録とL11 oracleは候補であり要求採択・実装・実行・受入を示さない。

### HARNESS-L2-077 source条件からdesign-obligation graphを閉じる候補（HARNESS-CORE単体、未採択）

- **状態・親**：`registered_proposal`、`authority_effect: none`。親は固定済みHARNESS-L1-001/003/004/009。親L1固定はこの候補の採択、対象scope、製品版または`version_target`を決めない。要求候補、receipt、MPR登録からL3承認・実装・pair freezeを生成しない。
- **対象source条件**：旧`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`のHIL-FR-42 line 132にあるsource/directive→requirement atom→capability/service→domain object→API/data/state/event/failure/security/observability/lifecycle/operation/test oracle/gateの双方向relationと、必須義務の閉包・pair-freeze拒否を一atomとして扱う。HR-FR-HIL-17全体、11層・8出力の一般化、隣接source行はこのcandidate inputではない。
- **入力・結果**：選択済みsource scopeとauthority revision、各source/directive atomと対応requirement atom、そのrequirementからcapabilityまたはservice、domain object、選択scopeで該当する上記11観点へのtyped relation、適用する設計pair/template契約とL11 oracleを与える。obligation graphは各適用関係から必要なdesign obligationを導き、対応するL11 oracleへ結ぶ。結果は同一scope/revision上のobligation graph、atom/義務ごとのdischarge receipt、coverage receipt、未消込findingとして表し、双方向経路、観点ごとの適用性と根拠、未消込・孤児・placeholder・N/A根拠・aggregate dischargeを個別表示する。非適用観点は理由と根拠を明示し、適用性unknownはN/Aへ変換しない。
- **閉包・freeze条件**：選択scopeに含む各source atomから要求atom・capability/service・domain object・適用観点・design obligation・対応oracleまで追跡でき、逆方向から同じ対象へ戻れる場合だけ、そのscope/revisionのgraph coverageをcomplete候補として示せる。未消込義務、孤児node/edge、placeholder、根拠のないN/A、aggregateだけの一括消込、必須typed relationまたはoracleの欠落が1件でもあれば該当scopeのpair-freezeを拒否する。部分coverageや別atomのpassで相殺しない。
- **既存契約との境界**：採択HARNESS-L2-040はlayer/pair/row catalogと一般typed edgeを、041は選択templateのatom/gap抽出を、063は選択済み3 HR-FR-HIL-17 sliceのsource/authority/change/oracle closureを担う。これらの採択済み本文は保持する。本候補はFR-42の11観点と全列挙relationに対するatom単位の適用性・双方向coverage・不足時freeze拒否を明示する限定条件であり、040/041/063の代替、全HR-FR-HIL-17 closure、source owner移管またはformal successorを主張しない。
- **意味・方式の境界**：保持するのは旧FR-42の全列挙、双方向関係、義務生成、個別未解決時のfreeze拒否である。固定database、物理graph/schema、特定ID/edge vocabulary、書込runtime、旧test/CIの実行は要求しない。scope選択と観点の意味が旧条件を変える場合はPO判断へ残す。source holding `MPR-SH-IR-003#HIL-FR-42`は生存し、successorなしを維持する。


### HARNESS-L2-078 typed requirement definitionと変更receiptの条件候補（HARNESS-CORE単体、未採択）

- **状態・親**：`registered_proposal`、`authority_effect: none`。親は固定済みHARNESS-L1-001/003/004/009。親L1固定から本候補の採択、対象scope、製品版または`version_target`を推定しない。要求候補とMPR登録からL3承認・実装許可を生成しない。
- **対象source条件**：旧`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`のHIL-FR-45 line 135を一atomとして扱う。requirement definitionにはstable requirement ID、immutable revision、source atom、canonical statement、BR/FR/TR/NFR、modality、priority、scope/non-goal、authority/rationale、acceptance oracle、owner、risk、capability/service、template applicability、design obligationを、値と意味型が分かる形で保持し、適用する対象・relationをtyped edgeで結ぶ。
- **意味上のfield契約**：上記13 field群は各対象requirement revisionで全項目を必須とし、それぞれの値・意味型とtyped edgeを欠落なく保存する。項目ごとのN/A、適用外、暗黙省略は認めず、値やrelationが不足・unknownなら定義をcompleteとしない。ここでのN/Aはfield適用性ではなく、後述する列挙済み要求変更操作である。固定物理schema、field名、DB、JSON layout、特定storage/APIは規定しない。複数recordを参照する方式も、同じ対象revisionへ13項目すべてとrelationが確実に結び付く場合は排除しない。
- **変更操作receipt**：split/merge/rename/supersede/reject/N/Aを適用する結果は、対象operationと前後scope/revisionを識別し、before/after semantic digest、変更入力となった全source atomごとのdisposition、影響を受けるdownstream範囲とstale/result、適用を許すreview authorityを一組の意味上の証拠として結ぶ。これらが揃わない、相互に不一致、unknownまたはstaleなら該当operationを適用済みにせず、orphan/stale findingとして不足と影響範囲を返す。形式上ひとつのreceipt fileであることや新たな人間承認を要求せず、既存authority契約の決定とreviewを参照する。
- **既存契約との境界**：採択HARNESS-L2-040のstable row/revision/owner/source span/typed edge、採択053のselected asset identityとrename/move/split/merge/supersede lineage、採択063の選択3 sliceに対するatom/challenge/change/stale/oracle closureはその範囲を担う。これらは本候補を採択しない。残差はFR-45の13意味field全体と、列挙6操作それぞれに対する必須証拠群が揃うまで適用しない条件である。reject/N/Aを053のlineageへ仮定で追加せず、既存contractの重複保証を要求しない。
- **意味・方式の境界**：保持するのはFR-45の各field意味、typed relation、6操作の完全receipt条件である。source holding `MPR-SH-IR-003#HIL-FR-45`は生存し、正式successor、source owner移管、全IR/HR条件closure、採択、実装・実行は主張しない。対象scopeまたは旧意味を変更する選択はPO判断へ残す。この候補では13項目すべてを必須とし、N/Aを項目単位の適用外として使わない。旧runtime/schema/test/CIを移植・実行しない。

### HARNESS-L2-072 選択pairのstale revision・異snapshot不成立候補（HARNESS-CORE unit、未採択）

- **状態・親**：未採択の新規候補、`registered_proposal`／`authority_effect: none`。親は固定済みHARNESS-L1-001（V-pair/trace）、L1-003（変更影響・stale）、L1-004（対象revisionの検証義務・反例・証拠）。候補から親の意味・authorityを変更しない。source crosswalk line 57–58の旧target assessment `HARNESS／OS`は未決のまま保持し、この候補のHELIX-HARNESS配置は旧source全体のowner確定・移管を意味しない。version_targetは旧sourceと固定親に指定がないため付けず、版・1.0収載を推定しない。
- **限定source**：旧HIL-FR-48 line 138の`stale revision`拒否と、旧HIL-FR-49 line 139の`異なるsnapshot`拒否、2つの条件sliceのみを扱う。source ledgerは各行の全文/hashとslice offsetを保持する。FR48の他条件、FR49のcanonical pair構成・feedback・片側欠落・未実行oracle、およびNFR-29全体は今回のatom集合へ再計上しない。既存055/056/063の採択本文・選択atom・意味は変更せず、この候補をそれらの追補・formal successor・旧IR全体の移管としない。
- **適用範囲**：入力は既存authorityから指定された対象scope、pair、対象revisionとその関係を用いる。HARNESSは全layer／製品／pairへの対象scopeを選ばず、canonical pair定義やauthorityを拡張しない。scope、pair、対象revisionまたは比較に必要なsource状態がmissing／unknown／conflictなら範囲を補わずunknown／未完とし、成立を返さない。
- **FR48 stale revision条件**：評価対象の隣接vertical pairについて、双方向edgeと粒度が揃っていても、edge endpointがpairの対象revisionに対して古い／superseded semantic revisionを指す場合、そのpairを成立・currentとして扱わない。freshな対象revision同士のpairと、edge先だけ旧revisionとなったpairを区別する。これは stale revision の意味条件であり、revision文字列、digest計算、ledger schema、stale伝播方式は定義しない。
- **FR49 snapshot条件**：評価対象の指定済みcanonical V-pairについて、design artifactとverification evidenceが異なるsnapshotに属する場合、そのpairを成立・greenとして扱わない。snapshot同一性はdesign側とverification側の実際のsnapshot参照を比較して判定する意味条件である。target revision、source authority revision、scope、表示labelまたはoracle identityが一致するだけではsnapshot同一性を代替しない。snapshot identityのfield名、digest生成・比較方法、保存形式は定義しない。
- **結果・責務**：不成立理由をFR48のstale revision、FR49のsnapshot mismatchとして識別し、影響を受けた選択pairを他pairの結果から成立扱いにしない。HARNESSは結果の意味を定め、OSは既存の合意済み運転・登録・保存責務を担う。receipt schema、writer、gateアルゴリズム、実行機構、実装許可を追加しない。
- **旧sourceとの差分・保留**：旧L1 sourceとHST-CASE-031-04/07、HST-CASE-032-12をoracle設計参照として用いる。HST-CASE-031-09/032-14は同一revision/snapshot条件を含むdesign-only summary oracleであり、実行証拠ではない。旧HST/API/schema/runtime/testは移植・実行せず、全旧IR・HAC/HAT条件のformal successorも主張しない。選択atom外の原文義務は`MPR-SH-SEMANTIC-LINE-003`／`MPR-SH-IR-003`へholdingとして残す。


### HARNESS-L2-079 画面prototype artifactとwalkthrough反復の証拠候補（HELIX-HARNESS単体、未採択）

- **状態・親**：未採択の要求候補、`registered_proposal`／`authority_effect: none`。現行HARNESS-L1-006（要求形成、prototype/非UI適用性、合意・freeze・差戻し）と、要求revision・scope・authorityを扱う既存HARNESS-L1/L2を親の現在本文として参照する。旧L1のHIL-FR-18/19（旧L1行108–109）は現行L2/L11へ条件を再対応づける出発点であり、旧L1/L3/L5/L6のlayer番号を現行番号へ機械的に転記しない。候補登録・receipt・fixtureから採択、L3承認、実装、実行、利用者合意または正式successorを生成しない。
- **対象source**：旧`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`のHIL-FR-18 line 108「画面対象のPrototype Builderはscreen ID、主要操作、遷移、9状態fixture、仮データ境界を実行可能artifactへ材料化する。視覚忠実度とは独立に要求発見に必要な操作経路を再生可能にする。 | artifact manifest、digest、起動手順、screen/interaction/state trace」と、HIL-FR-19 line 109「画面対象のWalkthrough Loopはprototype版、ユーザー観測、発見要求deltaまたは`no_delta`、L1反映先、再作成判断を記録し、boundedに反復する。 | walkthrough receipt、requirements delta、iteration checkpoint」を別個の条件群として扱う。旧`CLAUDE.md:84`は旧L1を要求層と定義しているため、FR19の旧L1反映先は現行L2要求へ対応づける。現行L1は企画であり、企画の意味が変わる場合だけ既存の人間判断境界へ戻す。隣接するHIL-FR-17/20、HIL-BR-13、HIL-NFR-11、HR/HAC/HAT全体を選択atomに足さない。旧IRで両条件はspecified/frozen、downstreamはpending pair descentだが、それは実行・現行採択・formal successorを示さない。
- **FR18 — 入力とartifact**：既存の画面適用性判断・要求sourceが画面対象を示す操作に限り、その選択scope/revisionに含まれるscreen ID、主要操作、遷移、state fixture、仮データ境界を実行可能なprototype artifactへ結ぶ。artifactの説明には、再取得できるmanifestとdigest、起動手順、screen／interaction／stateのtraceを含める。静止画、wireframe、prose、表示計測だけを実行可能artifactや要求発見用操作経路の代わりにしない。要求発見に必要な操作経路を再生できることは、視覚忠実度と別の条件として判定する。fixtureは旧consumerに記録された9状態（`empty`, `loading`, `loaded`, `partial`, `error`, `permission_denied`, `offline`, `conflict`, `completed`）それぞれの意味を保った選択scope上の証拠を示す。各stateの意味を別stateへ併合・省略せず、仮データと実データの境界もtrace可能にする。これは旧sourceの9状態条件を保つ候補であり、旧field名・schema・runtime、固定の保存方式や固定数値の新設ではない。
- **FR19 — walkthroughと反映**：walkthrough記録は、対象prototypeの正確なrevision、観測を行ったユーザーactorと観測内容、各発見の要求deltaとその反映対象である要求層（旧L1＝要求、現行L2）および反映状態、または明示された`no_delta`、再作成判断を同じ反復checkpointへ結ぶ。`no_delta`は要求deltaを捏造せず、観測がなかったこととも混同しない。deltaがある場合は対象の現行L2要求と反映結果または未完状態を対応づけ、L2要求への反映は既存012のBackflowと結ぶ。企画（現行L1）の意味変更が生じる場合は既存の人間判断境界に残し、自動更新しない。再作成判断は次の対象artifact/revisionまたは再作成しない根拠へ結ぶ。反復はboundedであり、checkpointは現在のiterationと継続／停止／再作成判断、残る義務を示す。上限の具体数、delta分類enum、schema、owner、実行経路はこのsourceから選ばず、未指定のまま扱う。
- **既存契約との境界**：採択HARNESS-L2-012はPrototypeとPoCの別判定、HTML試作、Decide前production昇格禁止とBackflowを扱うが、旧artifact/walkthrough条件一式を明示しない。採択HARNESS-L2-039は選択scope上のExperience/UI/Frontend relationと適用されるprototype資料を扱うが、artifact作成・全9状態fixture・FR19 receiptの代替ではない。採択HARNESS-L2-049は既に与えられたrenderable prototypeの表示計測専用であり、prototype生成、Pattern選択、screen ID発行、walkthroughを含まない。既存HARNESS-L2-003/024とOS Backflowにあるscope changeによるstale/re-entryの意味はそこへ委ね、本候補で重ねて定義しない。既存採択本文やdecision対象digestを変更しない。
- **依存区分**（採択済みHARNESS-L2-023の4分類意味を適用。本分類の利用からL2-079採択を推定しない）：**常時必須**＝選択された対象要求（旧L1、現行L2）・要求sourceとscope/revision、現行の画面適用性とauthority状態、該当する012/003/024の契約revision、L2-079のL11 oracle、および各依存のidentity/owner/契約版または互換range/適用根拠。同一の要求入力・revisionなら有効依存closureと理由を再現し、missing/unknown/staleな必須依存があれば当該候補条件を保留する。**特定操作時のみ必須**＝選択scopeでprototype artifactを生成または操作経路を再生する時はscreen/operation/transition/state/data義務と実行可能artifact条件、walkthroughを行う時は対象prototype revision、user actor/observation、deltaまたは`no_delta`、対象要求（旧L1、現行L2）と反映状態、rebuild/bounded-checkpoint条件を有効にする。操作条件が不成立と明示的に判定されたときだけその操作依存をclosure外にできる。unknownをfalseとしない。対応操作が選択されない利用ではその操作固有条件を成功・失敗どちらにも計上しない。**選択した入力元に応じて必須**＝対象要求、screen/interaction資料、選択data/source、prototype artifact、walkthrough observationを入力に選んだscopeでは各source identity/revision/scope/適用範囲を結ぶ。未選択sourceは未観測であり不在・適格・成功を推測せず、選択sourceの失敗を別sourceへ暗黙fallbackしない。**参照資料のみ**＝旧HR/HAC/HAT、旧L5/L6 design/testのschema/API/runtimeや背景例はsource atom・現行authority・条件・oracleを決めない限り参考資料で、現行依存や実行証拠に変換しない。旧source lineの意味条件と現行採択済み012/003/024/OS Backflowは参照資料ではなく、上記source／normative dependencyとして扱う。4区分、操作条件、選択source、revisionを同じ要求入力へ束縛し、成立条件だけのclosureを再現する。
- **責務・差分境界**：現Conceptはサービス①を画面試作（HTML）とPoC、現L1-006は要求形成、prototype／非UI適用性、合意、freeze、差戻し、再開、完了の確認としている。採択HARNESS-L2-012も画面prototypeとBackflowをHARNESSの要求機能として持ち、OSは既存の進行・記録責務を担う。本候補はその所属を移さず、旧FR18/19の未明示条件（実行可能artifactのtrace、9状態fixture、仮データ境界、視覚忠実度と独立の再生経路、版付きwalkthroughからの要求反映）を具体化する意味の再導出である。旧crosswalkの`HARNESS／OS・意味変更要`は当時のtarget assessmentとして記録し、現Concept/L1と旧原文の比較で特定できる変更を追加していないため、新しいPO判断や候補開始条件へ昇格させない。旧CLAUDE.md:84の層定義を対応根拠として、旧L1の「要求」を現行L2要求へ対応づける。これは層番号の機械転記ではなく要求意味を保つ層対応である。現行L1は企画として保持し、企画意味が変わる場合だけ既存の人間判断境界へ戻す。正式owner移管・旧要求retire・全体closureは主張しない。仮データを実データ、prototypeをproduction成果、観測を人間合意、deltaまたは`no_delta`を要求採択へ昇格させない。
- **旧consumer根拠・限界**：旧L6 `U-SAP-005/006/007/009`、旧L5 `IT-SAP-005/006/007/008`、HST-CASE-024-02/03/05/06/07/08、旧L5/L6 designは、artifactの実行可能性、9状態の完全性、walkthrough revision・観測・delta/backpropを消費する設計oracleとして参照する。旧state名はその設計資料上の一組として保持し、旧テストが未実装であること、旧schema/APIが存在することから現行実装や現行受入結果を推定しない。旧sourceはread-only参照であり、旧runtime/test/CLI/CIは起動しない。

### HARNESS-L2-080 agent adapterをHARNESS registryから再生成する候補（単体、未採択）

- **状態・親**：本節は未採択候補で、`registered_proposal`／`authority_effect: none`。親対応の判断根拠は、9/28 PO判断が固定したL1対象revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`（L1 file SHA-256 `238ae0590f43c10c0a59a0cea4a9907328752a81388891e1a115d4278db00e1f`）である。同revisionのHARNESS-L1-005（line SHA-256 `3cebaa9a4f570a103b3ac506c1a7fa19ffe654b41f1f12735a4d4e454096a586`）は「HELIX内部の管理機構を暗黙の依存にせず、明示された版・構成・条件でHARNESSを利用できる」意味を持ち、HARNESS-L2-006へ接続する。HIL-NFR-10のregistryを明示sourceとしruntime固有memory/rule siloを正本化しない条件は、この親の明示依存境界をagent adapter再生成へ具体化する候補である。旧sourceがHARNESS-L1 itemを名指ししていないことや現行file metadataがdraftであることを理由に親を否定しない。親revisionの採択と本候補の採択は別であり、本候補からL3承認、実装・実行許可、正式successorを生成しない。
- **選択した旧source**：選択atomは `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-10` のIR identity 1件（statement semantic digest `sha256:da761c1a808418620dacdb8aa7a586ef28a33082df7ebed30b683218493bb093`）。`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`のL1 line 190（line SHA-256 `b5f21b312520ad6a56e1e40efe8c79ccc49645eccad8cddb723094ac2cf35a36`）は同じ文言を示すcorroborationで、別atomではない。条件は、agent adapterが削除されても残るHARNESS registryから再生成できること、およびruntime固有agent memory/rule siloを正本にしないこと。旧HR-FR-HIL-08、HAC-HIL-08a/b/c、HST-CASE-006-21とL5 agent lifecycle記述は条件の解釈と受入oracleの背景として読む。これらを追加source atomや旧runtime実行条件へ数えない。
- **再生成の意味**：選択されたHARNESS registry sourceが利用可能な状態で対象agent adapterが欠落しているfixtureを与える。既存のHARNESS registry内容からその対象adapterを再生成できることを要求する。同じregistry identity/revision/digest、選択対象、明示された適用条件・依存入力を使う再生成では、旧consumerの「同一digest」oracleに照らし同じadapter digestを再現する。registryを使わず、別runtimeのmemory/rule、手編集adapter、前回生成物だけから再生成した扱いにしない。特定runtime、adapter path、registry schema、generator実装、digest方式は固定しない。
- **正本境界**：agentの要求・ruleのsource of truthはHARNESS registry側に置き、runtime固有のagent memory/rule siloを正本として使わない。runtime固有投影やキャッシュの存在一般を禁止する意味ではない。それらがregistryと食い違う場合、runtime siloからruleを採用して正本として成功扱いしない。どのprovider/runtimeを使うか、どのagent群へ適用するかは選択scopeに従い、本候補から全runtime・全productへ拡張しない。
- **採択済みHARNESS-L2-023の依存4区分**：023の4分類は9/28の明示採択対象（row 52）である。実行closureに含まれる依存は、identity、owner、契約version/range、compatibility根拠、適用条件が特定される。**常時必須fixture**＝`fixture:pack-A@v1`（owner `fixture:pack-owner-A`、contract range `fixture:pack-range-A`、class `always_required`、condition `scope=S and pack=A selected`）。入力compatibility宣言 `fixture:compat-pack-A` は採択済みHARNESS-L2-010（固定/current section SHA `9fbd159e2b1cbf31ef16913e29b33417ab2f247e2c0f0328268f2c9f67e2d6b4`）とHARNESS-L2-011（`30eb7f1ebc78889dc640155aa09811c7a6bcc2938bb4e34f122f245442c97952`）の契約revisionをこのfixture packに対応づける。011はそのcallを選ぶ場合に適用する。**特定操作時のみ必須fixture**＝`fixture:adapter-generator-A@v1`（owner `fixture:generator-owner-A`、contract range `fixture:generator-range-A`、class `operation_specific`、condition `operation=regenerate`）、compatibility宣言 `fixture:compat-generator-A` はoperation scope Sのregistry inputとの適合を示す。**選択source依存fixture**＝`fixture:HARNESS-registry-A@r1`（owner `fixture:registry-owner-A`、range `fixture:registry-range-A`、class `selected_source`、condition `source A explicitly selected for scope S`、compatibility宣言 `fixture:compat-registry-A` はpack Aとの互換を示す）および `fixture:agent-target-R@v1`（owner `fixture:target-owner-R`、range `fixture:target-range-R`、同class、condition `target R selected from source A`、compatibility宣言 `fixture:compat-target-R` はregistry Aのtarget mappingを示す）。**参照資料のみfixture**＝旧L5 `LEGACY-ASSET-1D32912A9A194FEAA7DE@sha256:894500dee389a2fab00961697bae4baa71427c5ffe1431bbc77592497b2b3fd7`（fixture owner `fixture:historical-context`、rangeはpinned source SHA、class `reference_only`、condition `interpret legacy oracle only`、compatibility fieldは `not_applicable_for_execution` と023分類に従い明示する）。これは現行実行closureに含めず、参照資料の現owner/versionがunknownでも再生成operationを保留しない。すべての `fixture:*` は受入fixture値であり現行owner/version/schemaを定義しない。実在のHARNESS registry/service ownerやそのversion rangeは未選択のまま別記し、fixtureの具体ownerで現行ownerを推定しない。依存closureの同一入力再現はadapter output digestの再現とは別条件である。
- **欠落・unknownの扱い**：選択operationの実行closure必須dependencyについてidentity、owner、contract version/range、compatibility根拠、適用条件のいずれかが欠落・unknown・staleなら、非適用や成功へ読み替えず、影響する再生成operationをunknown／未完として保留する。reference-only資料のmetadataは実行closureに入らないため、そのcurrent owner/versionがunknownでもoperationを止めない。条件が明示的に不成立の依存だけを該当operationのclosureから除外する。registry自体がmissingなら再生成成功を主張せず、runtime-local siloへfallbackしない。
- **採択済みHARNESS-L2-047との責務境界**：2026-09-29 57候補decision row 52は`MPR-RC-HARNESS-L2-047-001`を「条件付き採択：A配置（HARNESSが契約生成規範を所有）」として固定した。047が採択済みの範囲は、runtime-neutral候補contractの意味・必要性判断・生成と検証条件、および同一正規化入力・生成規則revisionからの同じ意味内容とdigestの再現がHARNESS、既存allowlist runtimeへのprojectionとassignment/lifecycle適用がOSという分担である。080はこの分担を言い換えたり置き換えたりしない。080が追加候補化する範囲は、対象adapterが欠落した場合に選択されたHARNESS registryから再生成できること、runtime固有memory/rule siloを正本にしないこと、および再生成結果の同一入力digest oracleである。HARNESS registryにある契約意味の正本と、OSが扱うruntime-specific adapter projectionを区別し、projectionの生成・配置をHARNESSの責務と主張しない。047の採択範囲と080の候補範囲は別であり、047の採択は080を採択しない。
- **未採択HARNESS-L2-054および旧FR-11/12との関係**：054は047のcontract meaningをOS既存assignmentへ渡すlayer/drive等のhandoff候補で、登録済み候補に留まる。旧FR-11のregistry項目分割・layer×drive意味、旧FR-12のadapter生成・手編集drift等に残る境界は、`ir153-hil-fr10-14-current-condition-audit-2026-10-02.md`の16–17行にある照合結果どおり未決/未割当として保持する。080はその分割、scope、owner、版、provider形式を決定せず、旧FR-11/12全体を閉じたとも主張しない。
- **範囲・版・責務**：旧sourceと現在の親が対象scope、runtime/consumer、product内配置、`version_target`を指定しないため、これらは未選択のまま保持する。OSの既存割当・進行・結果記録、INTELLIGENCE-L2-014の別identity Bot manifestとOS handoff、HARNESS-L2-010/011のpack/call contract、HARNESS-L2-023の依存分類を再定義しない。旧四製品reviewのsource-target記録は `docs/governance/audits/source-rebaseline/infinity-quality-constraint-crosswalk.md` のHIL-NFR-10行（旧ownerをOSへ移すという意味変更案、現行decisionではない）に限って履歴参照する。人の選択肢は、A: HIL-NFR-10の明示語「HARNESS registry」を保持し、047採択済み分担に従ってregistry上の契約意味/生成規範はHARNESS、既存runtimeへのadapter projectionはOSと区別し、service owner・適用scope・version targetは特定せず候補のままにする（推奨。HARNESS-L1-005、HARNESS-L2-010/011、OS-L2-004/010、INTELLIGENCE-L2-014の現行責務意味を変更せず、FR-11/12の未決範囲も確定しない）；B: 047のA配置と異なる責務移動、またはFR-11/12の未決分割を判断する（推奨しない。採択済み047とHARNESS/OS境界に影響する対象revision付きの上流判断が必要）。この候補はAの保持範囲を提示するがBを採択・実行せず、PO判断待ちを候補起草のgateにも作らない。HARNESS-L2-080は意味近接・採択から自動採択されない。
- **旧sourceとの差分・holding**：保持するのは削除後にHARNESS registryから再生成することとruntime固有memory/ruleを正本にしないことの2条件を含むHIL-NFR-10一atomである。過去の四製品reviewでOSを提案先とした分類は履歴上の提案であり、successor assignmentやHARNESS責務移管の決定ではない。本候補は新しい責務移管を行わない。`MPR-SH-IR-003#HIL-NFR-10`は`preserved_pending_rehome`のまま維持し、旧HR-FR-HIL-08全体、旧HAC/HAT全体、旧agent lifecycle実装やruntime/test/CIのclosureを主張しない。

### HARNESS-L2-081 source coverageの全量性と判断trace候補（HARNESS単体、未採択）

- **状態・対象source**：未採択、`authority_effect: none`。選択atomは旧IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-12/statement/text` の一件（statement digest `sha256:a85de817bf5698825a759488e16ad07868c18cfe03a62d7b6fe478e3e422391e`）。HIL-NFR-12は`specified`／`frozen`だが現行successorは未割当で、source holdingを保持する。旧L1のline 192は同じ移行要求の原文 corroborationであり、第二atomには数えない。HR-FR-HIL-09、HAC-HIL-09a/b/c、HAT-HIL-09はconsumer/oracle contextでありsource atomには追加しない。HATは`designed_not_implemented`で実行証拠ではない。HIL-NFR-11/22等の隣接条件を混ぜない。
- **親L1との意味接続**：親target revisionは2026-09-28 PO decisionがf6dad2aのbytesで固定したHARNESS-L1-004（「対象revisionとriskに合う検証義務、反例、証拠、差戻し条件を定義できる」）。HIL-NFR-12が示すfull-source completeness oracle、四つの偽完全性証拠の拒否、判断ごとの由来traceは、このL1 itemの検証義務・反例・証拠の具体化案としてHARNESS-L2/L11-081へ接続する。これは固定L1 bytesに対する提案関係であり、L1本文/tableを改変せず、この候補の採択も継承しない。**version_targetは旧IR/L1および固定判断に明示されていないため未指定のままにする。**
- **規範条件 — 全量列挙**：coverageの完全性を主張する選択source scopeでは、宣言した母集団のすべてのsource pathとentryを列挙し、列挙集合と母集団の差を識別する。文書名だけ、代表fixture、検索結果0件、単一包括requirementだけを100%の根拠にしない。scope/母集団境界またはentry差が未解決なら、その範囲は`unknown`／未完としcompleteにしない。固定件数、全repository走査、定期再走査、旧repository名は要求しない。
- **規範条件 — 判断trace**：source由来の各判断を根拠となったsource path/entry locator、entry digest、抽出時点へ再現可能に結ぶ。対象snapshot/revision不一致、digest欠落・不一致、抽出時点不明はその判断の由来をunknown／未完とする。digest方式、時刻形式、物理schemaは固定しない。
- **HARNESS/OS境界**：HARNESSはcoverage完全性・根拠traceの要求意味/oracleを定義する。source取得、snapshot形成、運転イベント・保存は既存ownerの責務に残す。OS記録が存在するだけでHARNESS oracle passとはしない。
- **HELIXOS-L2-123との境界**：現行のHELIXOS-L2-123候補は旧HIL-BR-14一atomに限り、ZIP・exact 2 repositoryのsource authority receipt、receipt由来のref／entry／edge分母、BR-14各atomの採否からGateまでのtraceを提案している。旧HIL-NFR-12と同じHR-FR-HIL-09／HAC-HIL-09a/b/c／HAT-HIL-09を参照するが、source atomも選択scopeも異なる。081のHARNESS oracleはNFR-12の宣言scopeにおけるpath／entry全量性、偽完全性証拠の拒否、各判断の根拠traceを判定する。123のauthority receipt、BR-14の採否、共通consumer表示だけではNFR-12のentryや判断traceを証明しない。一方、同一scope内のsource entryについてlocator・revision・digest・抽出時点が実データで一致すると確認できる場合、そのsource evidence自体は共有してよい。両方の条件が適用されるoperationでは、各要求固有のscope・全量性・authority／採否条件を各oracleで独立に満たす。081と123は独立候補であり、どちらかの採択が他方の採択、依存、source owner割当を生成しない。
- **採択済み023のdependency classification**：候補は023の常時必須／特定操作時のみ／選択sourceに応じて必須／参照資料のみの意味を適用する。正常入力では同一入力、同一契約revision、同一operation/source選択から四区分と有効closure・理由が再現される。HARNESS-L2-010/011の固定contract revisionはf6dad2a pairで、L2-010 section digest `sha256:9fbd159e2b1cbf31ef16913e29b33417ab2f247e2c0f0328268f2c9f67e2d6b4`、L2-011 `sha256:30eb7f1ebc78889dc640155aa09811c7a6bcc2938bb4e34f122f245442c97952`。このidentity/revisionはfixture・監査根拠であり、ownerを新たに選択しない。具体fixtureと欄別負例は対L11へ記録する。**参照資料のみ**のmetadata不足は参照状態をunknownにするが、必須実行closureを停止しない。
- **PO判断の範囲**：旧carry-forward row 114の`target_assessment`は「OS：source atomの完全列挙と採否追跡。対象集合を固定して実測」と記録するが、これは旧crosswalk由来の歴史的評価で現行PO decisionではない。9/28 PO判断の記録本文（docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md:18、記録commit 03b1969b26a30e9e2b68149bff2e10c5bfe78110、同commit時のfile SHA-256 c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23）は、採択対象revision f6dad2a33e24f000b87d7f09b8d40288257e74ccについて「各確認資料が固定したL1の対象revisionを確定し、L2と対になるL11の要求一式に合意する。各PRの明示候補集合は、記載されているversion_targetと適用条件を保持して採用する」としている。本候補にはversion_targetなし。candidateの起草/reviewは続行でき、採択時の意味配置だけPO判断へ残す。**A（推奨）**：HARNESS-L1-004の検証oracleとして081 L2/L11を採択候補にし、HARNESSが全量性/decision-trace意味を定め、source取得・イベント・保存は既存ownerへ残す。これは歴史的OS assessmentから意味oracleと運転責務を分ける提案で、HIL-NFR-12と081のtarget/relationに影響し、OS実装・権限を追加しない。**B**：現時点でtarget/successorを割り当てずHIL-NFR-12をholdingに残し、081 pairを未採択のまま保つ。Aとの差はHARNESS-L1-004へ要件意味を配置するか、配置を未決に保持するかであり、Bでも旧source意味を弱めない。両方とも現行のsource acquisition/event ownerを変更しない。
- **限界**：候補は一IR atomの静的oracle案。全legacy資産の走査、source全体の実完成、PO採択、L3承認、実装/実行を主張しない。

### HARNESS-L2-082 選択source scope全child receiptのstale化候補（単体、未採択）

- **状態・親**：未採択のHARNESS要求候補。親は9/28に固定されたHARNESS-L1-001/003/004/008のrevisionであり、候補から親の意味やauthorityを変更しない。旧crosswalkとcarry-forwardの対象 assessmentはHARNESS／OS、旧NFR-22のsuccessorは未割当のまま。HARNESSにあるのは規範候補の置き場であり、source custody、extractorの運転、結果の登録・推進・検収の正式ownerを決めない。`version_target`は旧IR sourceにも固定L1にも指定がないため未指定とし、1.0自動収載を示さない。
- **選択source・対象条件**：IR identity `HIL-NFR-22`一atomのsource assetは`LEGACY-ASSET-A60CF91DD2AF6693E6F9`（旧`requirements-ir/requirements.json`、SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`）。旧L1 line 202は`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`（旧`infinity-loop-platform-requirements.md`、SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`）にある同statementのcorroborationで、別atomではない。条件は、extractor revisionの変更、または選択source snapshot内のsource差分が生じたとき、その選択scopeに含まれる全child receiptをstaleとして扱うことである。どのchildの直接source spanが変わったかにかかわらず、同じ選択scopeのprior child receiptをcurrentなcoverage evidenceとして再利用しない。この節はNFR-22原文の全child invalidation条件だけを具体化する。
- **既存条件との関係**：採択HARNESS-L2-038のcapability manifest/closure、ならびに未採択HARNESS-L2-067-001のatomic behavior atomization候補が持つ個別atom、parent/child、source span、extractor revision、分母条件を変更・置換しない。067の選択sourceはHIL-FR-37 line 127一atomであり、NFR-22のformal successorや全child stale化を採択したものではない。038もここで全prior child receiptを一律staleにする条件を追加採択しない。082は旧HIL-NFR-22一atomの残差候補であり、NFR-22全体の正式successor、採択、実行済みcoverageを主張しない。
- **提供・保証**：同一の選択source scopeにsource revision/digestとextractor identity/revisionが束縛された複数child receiptがあるとする。source内で一箇所の差分を検出した場合、またはextractor revisionが変化した場合、以前の選択scopeに属するchild receiptすべてをstaleとして保持し、そのscopeの新しい照合が終わるまで過去receiptを現在のcoverageへ算入しない。aggregate parent、directory/file件数、代表fixtureをatomic behavior childの分母・covered件数として扱わない旧条件は維持するが、その分母設計と個々のchild抽出は067・038の対応範囲として区別し、082単独で再定義しない。
- **対象scope・境界**：一つの利用要求で明示選択されたsource snapshotとそのread scopeに限る。明示選択scope／prior child集合の外にある無関係なreceiptを対象集合へ自動追加しない。同じ選択scopeのprior child集合に属するreceiptは、run identityが違うだけでは全child stale対象から除外しない。未選択sourceは未観測である。source identity、scope、extractor revision、またはchild集合の対応がmissing/unknown/staleなら「変更なし」やcurrentへ読み替えず、affected scopeをunknown／未完として保持する。source diffの物理形式、extractorの実装、receipt schema、具体的digest algorithm、保存場所、固定期間、運転ownerは定めない。
- **採択済みHARNESS-L2-023の依存4区分**：9/28 decision row 52の採択済み023に従い、identity・owner・契約revision・exact適合range・compatibility根拠・適用条件を一組で照合する。以下は候補oracle用mock fixtureで、実製品owner/versionの指定ではない。**常時必須**は`fixture:coverage-pack-A@r1`（owner `fixture:pack-owner-A`、contract revision/range `fixture:coverage-pack-contract-A@r1`/`r1`、class `always_required`、applicability `scope-S AND pack-A selected`）。compatibility fixture `fixture:compat-pack-A@r1`はこれらの欄を結び、HARNESS-L2-010採択契約revisionへのfield別適合結果を記録する。**操作時のみ必須**は`fixture:coverage-recheck-A@r1`（owner `fixture:recheck-owner-A`、contract revision/range `fixture:coverage-recheck-contract-A@r1`/`r1`、class `operation_specific`、applicability `recheck-selected-scope AND (source diff OR extractor revision change)`）。compatibility evidenceはpack A、source/scope、extractor、child receipt collection、operation、010/011の対象契約revisionとfield別判定を結ぶ。**選択source依存**は`fixture:source-A@r1/d1`（owner `fixture:source-owner-A`、contract revision/range `fixture:source-contract-A@r1`/`r1`、class `selected_source`、applicability `source-A explicitly selected for scope-S`）と`fixture:child-receipts-S@r1`（owner `fixture:receipt-owner-S`、contract revision/range `fixture:child-receipt-contract-S@r1`/`r1`、同class、applicability `receipts belong to source-A/scope-S`）。**参照資料のみ**はIR `LEGACY-ASSET-A60CF91DD2AF6693E6F9`およびL1 corroboration `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` line 202（各固定file SHAは上記source記述）、class `reference_only`、applicability `legacy interpretation only`、execution compatibility `not_applicable_for_execution`とする。compatibility evidenceは`compatible`という語だけで済ませず、依存各欄、対象契約revision、source/scope/call、fieldごとの照合結果と理由を持つ。L11-082はexecution class別の各欄欠落/stale、010と011を分離した不適合、reference-only unknownを個別に検査する。fixtureの`r1`はexact mock rangeであり、現行product version、schema、ownerを選択しない。
- **責務境界**：HARNESSはこの候補のcoverage意味と受入oracleを示す。OS側の選択scope custody、extractor運転、receipt保存・状態投影は既存の採択契約の範囲を越えて新規に再配置しない。候補配置から旧OS／HARNESSの責務判断、formal successor、実装許可を推定しない。旧NFR-22のsource holdingは`preserved_pending_rehome`のままである。
- **人間判断材料**：Aは原文の「全child receipt」を選択scope全体へ保持し、全prior child receiptをstale化する案（推奨。旧NFR-22の明示条件を保ち、067/038の既存条件と足し合わせても部分staleへ縮退しない）。Bは本atomをholdingへ残して要求候補化を保留する案（候補本文の不在をclosureとみなさず、NFR-22の現行要求対応は未解決のまま）。Cはsource差分が直接触れたchildとその下流childだけをstale化する案（旧原文の「全child」より狭い意味変更であり、NFR-22の既存source／coverage保証、変更されていないchild receiptの再利用可能性、038との再照合範囲へ影響するため対象revision付きPO判断を要する）。候補起草は判断待ちにしない。いずれの案も現行採択・source disposition・実装／実行を生成しない。
- **旧sourceとの差分・保留**：旧HIL-NFR-22の全文、source identity、atomic denominator条件、aggregate parent/directory/file count/代表fixture除外を保持する。新たに明記するのは、source diffまたはextractor change時のstale範囲を「変更の影響が及んだchild」から「その選択scopeの全prior child receipt」へ具体化する点であり、sourceにない数値、schema、全source一律scopeは導入しない。旧HR-FR-HIL-09/HAC-HIL-09a/b/c/HAT-HIL-09はこの条件のconsumer/oracle文脈として読むが、追加atom・現行実行証拠・旧test合格へ数えない。旧runtime、test、CI、CLIを実行しない。

### HARNESS-L2-083 Domain Objectの不変条件と依存方向候補（単体、未採択）

- **状態・親**：本候補は`registered_proposal`、`authority_effect: none`、未採択である。親は2026-09-28 PO判断が固定した`f6dad2a33e24f000b87d7f09b8d40288257e74cc`のHARNESS-L1-004（「利用者は、対象revisionとriskに合う検証義務、反例、証拠、差戻し条件を定義できる」）。この候補はDomain Objectの設計義務と対応oracleを提案し、L1や採択済み候補を変更しない。`version_target`は旧sourceにも固定L1にもないため未指定とする。
- **選択旧sourceと適用範囲の根拠**：対象は旧IR `requirements.json#/HIL-NFR-25`の一atom（`LEGACY-ASSET-A60CF91DD2AF6693E6F9`、file SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`、statement semantic digest `a8e7e11e262e12aa53009f37e6c288213c1175b2853491cb0f998ac122c09b8d`）。旧L1 `infinity-loop-platform-requirements.md:205`（`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`）は同じ文のcorroborationで、別atomに数えない。旧IR文そのものは適用scopeを限定していない一方、既存の適用範囲評価は一律の全consumer必須化を避け、対象設計方式と根拠の照合を求める。`docs/governance/audits/source-rebaseline/infinity-quality-constraint-crosswalk.md:34`（file SHA-256 `89e623cfb9274034c37e52af9fe0598c0052ee2d743bdf7bb648334289b4f6a8`、line SHA-256 without LF `887aa532fda75f30118a62daaa241524f3e070f57ec5181472fa2c849ec6a333`）および`docs/governance/legacy-migration/ir/legacy-ir-product-routing-bootstrap.jsonl:127`の`PRC-HIL-NFR-25-001`（file SHA-256 `c35934693b273e6cfd03e509886dc22bd1367e78ae1aa4568563a7da252c41e1`、line SHA-256 without LF `35cb90b93effb2e873ad2097ae7051da018290df129f7aa1703a928f80edc6db`）を併せて根拠とする。旧IRのconsumer/oracle contextは受入解釈用であり、現行authorityや実行証拠ではない。
- **役割を宣言した設計scopeでの六条件**：対象design scopeの設計方式がどのDomain Object役割を使うかを明示する。Entity/Aggregateを使う場合は(1) class化自体を目的にせず、identity/invariant/lifecycle/authorityの意味根拠がないpayloadをEntity/Aggregateにしない。(2) Value Objectを使う場合はimmutableに扱う。(3) Aggregateと更新operationを使う場合はroot境界内transactionに限る。(4) Query operationを使う場合はside-effectを持たせない。(5) Domain Eventを使う場合は完了した事実を過去形で表す。(6) domainからAdapter境界へ依存する設計役割を使う場合はPortを介す。設計方式が特定の役割を明示的に使わないと宣言した場合、その役割に結び付く条件は当該scopeの対象外とし、unknown／未完にしない。設計方式またはrole-use宣言自体が不明・欠落・矛盾する場合に限りscopeの適用性をunknown／未完とする。適用対象となる各条件は独立に判定し、他条件の根拠で補わない。
- **HARNESS-L2-048との境界**：責務不明名を根拠なく許さない条件と、testをprivate実装名でなくdomain object＋operation＋oracle IDへbindする条件は、後発の`po-decision-2026-09-29-11candidates.md` row 28（decision file SHA-256 `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`）が採択したHARNESS-L2/L11-048のexact revisionに属する。固定L2/L11 section SHAは`9328dccd943ac8f690d149673a5f05626465990f3197306a45d7b8cca27c34d5`／`4a4d893e909d1ccc32b52cc96b22f82eaef6bffead7037677df561cd2617466d`。以前の57-candidate判断で当時除外された履歴より、この後発row 28が048の採否を定める。083はこの二条件を複製せず、旧sourceの六Domain Object条件だけを扱い、048採択から083の採択を推定しない。
- **依存区分**：採択済みHARNESS-L2/L11-023（2026-09-28 PO decision row 52）の4区分をこの候補のoracle入力に使い、意味を拡張しない。**常時必須**＝選択された要求source、対象設計scope/revision、六つの条件を評価する設計artifactと条件適用根拠。**特定操作時のみ必須**＝Entity/Aggregate mutation、Query、Domain Event publication、Port/Adapter call等の該当操作が選択scopeで行われる場合のoperation evidenceとその条件oracle。操作が明示的に選択されない場合その操作固有conditionは計上せず、適用性unknownなら保留する。**選択source時のみ必須**＝scopeが明示選択したDomain Object/operation/evidence sourceとそのrevision・適用範囲。未選択sourceは未観測で、選択source欠落時のfallbackをしない。**参照資料のみ**＝旧HR-FR-HIL-16、HAC-HIL-16a/b/c、HAT-HIL-16はconsumer/oracle contextに限り、現行実行closureや合格証拠にしない。normative HIL-NFR-25 IR atomおよびその六条件はreference-onlyへ落とさない。
- **責務境界**：HARNESS候補は要求意味・oracleを提示する。実装、runtime、domain modelの実在、L3設計承認、source holdingの移管を示さない。旧sourceの型名・schema・test/runtime方式を複製しない。
- **PO判断材料**：旧IR文は適用scopeを明示しないが、既存crosswalkと`PRC-HIL-NFR-25-001`は全consumerへの一律必須化を避け、設計方式と根拠の照合を求める。適用scopeは未決としてPOへ選択肢を示す。A（推奨）は対象設計方式が明示的に使うDomain Object役割に対応する条件だけを適用し、明示的に使わない役割は対象外とする。Bは適用先をHELIX自身の設計に限定し、その他の設計へのsource条件をholdingに残す。Cは全設計方式へ一律適用する案で、既存の「全consumerへの一律必須条件にしない」という評価と整合しない意味変更として扱う。A/B/Cのいずれも048の二条件と六条件を分離し、候補起草・独立reviewはPO判断待ちにしない。
- **差分・限界**：旧sourceの六条件と、未決の適用範囲に関する既存評価を併記する。候補は宣言された設計方式で使うroleの条件を照合し、未使用roleをunknownへ変換しない。旧assertion caseのうち六条件外のDomainService責務、Specification write、Repository row条件は083のsource atomに追加せずholdingを継続する。新しいdomain object type、fixed schema、全設計への一律適用、採択・実装・実行・全IR closureは主張しない。旧runtime/test/CIは実行しない。
