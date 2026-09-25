---
title: "HELIX-BRAIN L1企画案"
canonical_vmodel: L1-L12
canonical_layer: L1
canonical_pair: L12
layer: L1
kind: planning
status: draft
authority_status: draft_candidate
parent_concept: docs/concept/helix-concept.md
source: docs/helix-brain/sources/brain-l1-idea-po-original-2026-09-26.md
decision_record: docs/governance/decisions/brain-l1-idea-po-decisions-2026-09-26.md
created: 2026-09-26
updated: 2026-09-26
---

# HELIX-BRAIN L1企画案

本書の親は[HELIX Concept](../../concept/helix-concept.md)である。本文は、POが2026-09-26に示した[HELIX-BRAIN L1要求アイデアの原文](../sources/brain-l1-idea-po-original-2026-09-26.md)を、企画（L1）の形に整理したものである。
整理にはPOの回答（ビジュアルデザインを1.0から扱う、Visual design HARNESSと連携する）を含める（[判断記録](../../governance/decisions/brain-l1-idea-po-decisions-2026-09-26.md)）。
本書の整理が原文を超えず欠かしていないかは、POが対象revisionで確認する。本書から、要求（L2）の合意、要件（L3）の承認、実装・実行の許可を生成しない。

## 提供価値

HELIX-BRAINは、ソフトウェア開発に必要な再利用できる設計知識を領域ごとに構造化し、Pattern・Design Unit・Partと、それらの適用の条件、関係、制約、反例、根拠、版を持つ。
製品固有の意味や採用の判断を持たず、各製品のHELIX-HARNESS-COREへ再利用できる設計知識を渡す。

- 製品固有の要求・設計・判断の結果は、各製品のHELIX-HARNESS-COREが持つ。BRAINは、製品やAIが変わっても再利用できる設計知識を持つ。
- BRAINは、候補のPattern、必要なinput、関係、代替、制約、根拠を返す。「この製品ではPattern Xを採用する」という判断は、BRAINのauthorityで行わない。
- 今回どれを使うかの稼働中の判断は、INTELLIGENCE等との接続で行う。

## 企画要求

版の列は、その要求を入れる版の印（`version_target`）である。種類の列は、要求の粒度の分け方（2026-09-25のPO指示）による。

| ID | L1企画要求 | 原文 | 版 | 種類 |
|---|---|---|---|---|
| HELIXBRAIN-L1-001 | 人間は、再利用できる設計知識を、意味の異なる設計の領域に分けて管理できる。領域は固定の一覧にせず、追加・分割・統合・退役できる。製品名や特定のprojectを領域として扱わない | BRAIN-L1-001 | 1.0 | 単体 |
| HELIXBRAIN-L1-002 | 人間は、各領域の設計知識を、少なくとも領域→Pattern→Design Unit→Partの階層に分けて持てる。単なるファイル、コードの断片、UI部品の集まりにしない | BRAIN-L1-002 | 1.0 | 単体 |
| HELIXBRAIN-L1-003 | 人間は、Patternについて、形だけでなく、解決する問題、前提、適用できる条件、必要なinput、制約、trade-off、使えない場合、失敗の型、合う・合わないPattern、根拠、成熟度を確認できる。「このPatternがある」ことと「今回これを採用すべき」ことを区別する | BRAIN-L1-003 | 1.0 | 単体 |
| HELIXBRAIN-L1-004 | 人間は、同じ問題に成り立つ複数のPatternを、適用の条件、長所、短所、制約、失敗、費用で比べられる。BRAINは一つを絶対の正解として上書きしない | BRAIN-L1-004 | 1.0 | 単体 |
| HELIXBRAIN-L1-005 | 人間は、領域をまたぐ設計の関係（requires、depends_on、compatible_with、conflicts_with、affects、alternative_to、composed_of等）を、Pattern・Unit・Partの間で辿れる | BRAIN-L1-005 | 1.0 | 単体 |
| HELIXBRAIN-L1-006 | 人間は、ビジュアルデザインを装飾の情報ではなく再利用できる設計知識として持てる（情報設計、視覚の階層、layout、grid、余白と密度、文字組、navigation、部品の構成、form、feedback、空・読込中・errorの状態、responsive、dashboard、内容の階層、accessibility等）。製品固有のVisual Identity（例：黒背景と青のアクセント）は各製品のHELIX-HARNESS-COREに置く | BRAIN-L1-006、PO回答（1.0から扱う） | 1.0 | 単体 |
| HELIXBRAIN-L1-007 | 人間は、Pattern・Unit・Partの出所、由来、根拠、採用の理由、評価した範囲、反例、限界を辿れる。AIが生成したことだけで汎用の知識へ昇格させない | BRAIN-L1-007 | 1.0 | 単体 |
| HELIXBRAIN-L1-008 | 人間は、再利用できる構造ごとのidentityと版を持ち、current、superseded、deprecated、experimental、retired等を区別できる。旧いPatternを黙って新しいものへ置き換えない。どの製品のHELIX-HARNESS-COREがどの版を参照したかを辿れる。実際のprojectで使った版と状態の管理はHELIX-OSに委ねる | BRAIN-L1-008 | 1.0 | 単体 |
| HELIXBRAIN-L1-009 | 人間は、既存のPatternのUnitを組み合わせ、新しい関係を足した構成の候補を表せる。構成の候補を、すぐに確立したPatternへ昇格させず、LABO等の評価の経路を通す | BRAIN-L1-009 | 1.0 | 単体（評価はLABOとの接続） |
| HELIXBRAIN-L1-010 | 人間は、成功した構造だけでなく、Anti-Pattern、失敗のPattern、成り立たない組み合わせ、条件に依存する失敗、退行の事例を構造として持ち、「この条件では何を使ってはいけないか」を返せる | BRAIN-L1-010 | 1.0 | 単体 |
| HELIXBRAIN-L1-011 | 人間は、BRAINへ入る構造が特定の製品の意味から切り離されていることを確かめられる。製品固有の名称、要求、画面、業務のルール、利用者の判断を、汎用の知識へそのまま昇格させない | BRAIN-L1-011 | 1.0 | 単体 |
| HELIXBRAIN-L1-012 | 人間は、BRAINが返すもの（候補のPattern、必要なinput、関係、代替、制約、根拠）と、製品固有の採用の判断とを区別できる。採用の判断はHELIX-HARNESS-CORE、INTELLIGENCE、人の判断等の接続先で行い、責務を混同しない | BRAIN-L1-012 | 1.0 | 単体 |

## 1.0で扱う初期の領域

1.0で最初からすべてを充実させる必要はない。schemaの上で、少なくとも次の領域を扱えるようにする。

- Software Architecture、Application Architecture、Backend、Frontend、API／Integration、Data／Database、Infrastructure、Security（原文の「初期Domain候補」）
- Visual Design、UX／Interaction（POの回答「1.0から扱う」）

ほかの領域の候補（Reliability／Recovery、Performance、Observability、Testing／Quality、Operations／Maintenance、Accessibility）は、HELIXBRAIN-L1-001により追加できる。ここでのSecurityは設計知識の領域であり、機構のHELIX-SECURITYではない。

## 接続の要求として外へ出すもの

次はBRAINの中の要求にせず、接続の要求として定める。接続の間にはコネクタを入れ、コネクタは接続の数だけ置く（[LABOの判断記録](../../governance/decisions/labo-core-engine-po-decisions-2026-09-26.md)、PR #2143）。

| 接続 | 渡すもの | 版 |
|---|---|---|
| HELIX-HARNESS-CORE → BRAIN | 製品固有の設計から、再利用の候補になる構造 | 1.0 |
| LABO → BRAIN | 実績・実験・比較を経て汎用化の候補と評価された構造 | 1.0 |
| BRAIN → HELIX-HARNESS-CORE | 要求・設計の対象に使えるPattern・Unit・Part | 1.0 |
| BRAIN ↔ INTELLIGENCE | BRAINの構造の知識を判断の材料として渡し、INTELLIGENCEが案件の状態への適用の候補を考える | 1.0 |
| BRAIN → HARNESS | Patternが求める設計のinputと論点を、HARNESSの設計義務（HARNESS-L2-009）へつなぐ | 1.0 |
| BRAIN ↔ Visual design HARNESS | Visual design HARNESSは、設計ではなくビジュアルデザイン（画面の見た目と体験）の生成と評価を担うHELIX-HARNESSの中の仕組みである。BRAINからは、ビジュアルデザインとUXのPattern・Unit・Part、適用の条件、反例を渡す。Visual design HARNESSでの利用の結果と評価は、LABOを経てBRAINへ戻し、Visual design HARNESSから直接汎用の知識へ昇格させない（POの回答「Designハーネスと連携する方向性で」「ここでいうDesignハーネスは設計じゃなくてビジュアルデザインのデザインな。」） | 1.0 |
| 外の情報 → LABO → BRAIN | 外の情報をLABOで分解・比較・評価し、再利用の構造の候補としてBRAINへ入れる。外で成功したPatternをそのまま入れない | 2.0 |

1.0では、自前の内部の実績と初期のseedから設計知識の体系を成り立たせる。

## 旧HELIXとの対応

旧HELIXの対応箇所を先に読み、それを起点にした。

| 本書 | 旧HELIX | 保持する点 | 変わる点 |
|---|---|---|---|
| HELIXBRAIN-L1-001 | 旧design catalog（`archive/legacy-generation-2026-09-14/root/docs/design/design-catalog.yaml:9-40`）の設計文書の分類 | 設計を分類して扱う | 分類を、設計文書の種類から、再利用できる設計知識の領域へ変える。領域を固定しない |
| HELIXBRAIN-L1-002 | [2026-09-25のBRAIN・ヘリックスコアのPO指示](../../governance/decisions/brain-helix-core-po-intent-2026-09-25.md)（設計パターンの導出、設計ユニット・パーツ） | 設計パターンと設計ユニット・パーツの考え方 | 領域→Pattern→Design Unit→Partの階層として定める |
| HELIXBRAIN-L1-003、007、010 | DST-HARNESS-002（templateのapplicability、必須input、relation、negative oracle）、DST-HARNESS-005（出典・採否・適用範囲・限界・negative caseを持つseed）（[BRAINの候補](../candidates/design-template-system-requirements.md)） | 適用の条件、使えない場合、出典と限界を持つ | templateから、領域ごとのPattern・Unit・Partへ広げる。失敗の知識を構造として持つ |
| HELIXBRAIN-L1-008 | DST-OS-001（承認済み、seed、候補、retiredの区別と、projectが使ったexact setと版） | 状態の区別と、使った版の追跡 | 汎用の構造の版と状態はBRAIN、projectで使った版と状態の登録はHELIX-OSに分ける（候補の「現行Conceptに照らした担当」と同じ） |
| BRAIN ↔ Visual design HARNESS | 旧v1.3の「ビジュアルDesign HARNESSはUI/UXの生成・評価を担う」（`docs/governance/requirements-source/helix-requirements_v1.3.md:67`）、§4.5 AI Vision Design HARNESSエンジン（同:265-275） | Visual design HARNESSが画面・体験の生成と評価を担う | ビジュアルデザインのうち、製品をまたぐ再利用の構造をBRAINへ、製品固有のscreen・flow・design token・Visual Identityを各製品のHELIX-HARNESS-COREへ分ける。旧§4.9の統合Design HARNESS（同:379-393）はSystem Design（設計）まで含めていたが、Visual design HARNESSはビジュアルデザインに限る |
| HELIXBRAIN-L1-004、009 | 対応なし | — | 複数の正解を併存させることと、Unitを組み合わせた構成の候補は、新しい案である。`archive/`を「alternative_to」「composition candidate」「複数の正解」で探し、BRAINの知識に当たる記述は見つからなかった |

## 既存の候補との関係

[BRAINの候補](../candidates/design-template-system-requirements.md)のうちBRAINが持つ項目は、次のL1を親にする。候補の文言は変えない。要求（L2）として採否するのは、本書のrevisionをPOが確認した後である。

| 候補 | 親にするL1 |
|---|---|
| DST-HARNESS-002（templateの意味契約と版） | HELIXBRAIN-L1-003、005、008 |
| DST-HARNESS-005（seed） | HELIXBRAIN-L1-007、010 |
| DST-OS-001（汎用のtemplateの版と状態の部分） | HELIXBRAIN-L1-008 |
