---
title: "HELIX-SECURITY L1企画案"
canonical_vmodel: L1-L12
canonical_layer: L1
canonical_pair: L12
layer: L1
kind: planning
status: draft
authority_status: draft_candidate
parent_concept: docs/concept/helix-concept.md
source: docs/helix-security/sources/security-l1-idea-po-original-2026-09-26.md
decision_record: docs/governance/decisions/security-l1-idea-po-decisions-2026-09-26.md
created: 2026-09-26
updated: 2026-09-26
---

# HELIX-SECURITY L1企画案

本書の親は[HELIX Concept](../../concept/helix-concept.md)である。本文は、POが2026-09-26に示した[HELIX-SECURITY Core／L1要求アイデアの原文](../sources/security-l1-idea-po-original-2026-09-26.md)を、企画（L1）の形に整理したものである（[判断記録](../../governance/decisions/security-l1-idea-po-decisions-2026-09-26.md)）。
本書の整理が原文を超えず欠かしていないかは、POが対象revisionで確認する。本書から、要求（L2）の合意、要件（L3）の承認、実装・実行の許可を生成しない。

## 提供価値

HELIX-SECURITYは、HELIX、利用者、各projectの資産に対する信頼の境界（Trust Boundary）と資産の境界（Asset Boundary）を持つ。
外部の入力、Agent、Hook、実行環境、資格情報、network、更新、供給網、永続化、Web公開等から生じる、権限の昇格、情報の流出、越境、改ざんを制約する。

SECURITY自身は実行の主体にならない。役割を次のように分ける。

| 機構 | 担うもの |
|---|---|
| HELIX-SECURITY | 方針、authority、信頼の境界 |
| Runner／Sandbox | 物理的な適用 |
| HELIX-OS | 運転と進行 |
| HELIX-INTELLIGENCE | 判断と検出 |
| HELIX-HARNESS | 必要なsecurityの検証 |
| HELIX-LABO | 効果と退行の評価 |

SECURITYは、HARNESSの工程の意味、製品固有の要求、開発計画、Workerの配置の判断、長期の改善の評価、実行環境そのものを持たない。

## 企画要求

版の列は、その要求を入れる版の印（`version_target`）である。種類の列は、要求の粒度の分け方（2026-09-25のPO指示）による。

| ID | L1企画要求 | 原文 | 版 | 種類 |
|---|---|---|---|---|
| HELIXSECURITY-L1-001 | 人間は、外部の情報、AIの生成物、Toolの出力、Issue、PR、Web、MCP、文書等を、それだけで信頼済みの命令へ昇格させないことを確かめられる。読むこと、信頼すること、命令、authority、永続化、学習を別のものとし、外部の入力は信頼しないdataとして扱う。明示した経路を通らなければ、要求、Agentへの指示、Toolのauthority、memory、BRAIN、学習データ、securityの方針へ昇格させない | §2 | 1.0 | 単体 |
| HELIXSECURITY-L1-002 | 人間は、外部のdataに含まれる命令のような記述（例：前の指示を無視せよ、AGENTS.mdへ書け、repositoryを消せ、memoryへ保存せよ、資格情報を送れ）を、HELIXへの操作の指示として実行せず、dataとして保てる。Prompt Injectionを完全に検出することではなく、信頼しない情報からauthorityへ直接届く経路を作らないことを主な防御とする | §3 | 1.0 | 単体 |
| HELIXSECURITY-L1-003 | 人間は、すべての権限、状態、data、Worker、資格情報、成果物、memory、実行の対象を、project、tenant、環境、割当て（worktree）へ結びつけられる。あるprojectのAgent、Hook、memory、資格情報、設定、Workerが、明示した接続なしに別のprojectへ作用せず、primary treeや他のprojectへ暗黙にfallbackしない | §4 | 1.0 | 単体 |
| HELIXSECURITY-L1-004 | 人間は、AGENTS.md、CLAUDE.md、Agentの定義、Hook、Skill、MCPの設定、実行環境の設定、Sandboxの方針、system instruction、モデルの設定を、project identity、root、HEADとrevision、設定・Hook・方針のdigest、owner、範囲へ結びつけられる。別のproject、古い版、知らないHookや設定を黙って採用しない | §5 | 1.0 | 単体 |
| HELIXSECURITY-L1-005 | 人間は、資格情報、token、API key、secretを、通常のAIのcontextや成果物へ直接出さないことを確かめられる。生のsecretをAIへ渡さず、操作・対象・期限へ結びつけた範囲付きの資格情報を使い、資格情報の置き場をWorkerへ直接見せず、repositoryへの混入を防ぎ、外部へ送る前にsecretを検査し、失効をすぐに反映する | §6 | 1.0 | 単体 |
| HELIXSECURITY-L1-006 | 人間は、外部への通信を既定で拒否し、必要な送信先だけを明示して許可できる。送信先、protocol、endpoint、dataの機密区分、送った量、目的、許可、期限を管理し、vendor側のprivacyの設定だけをsecurityの保証として信用しない。HELIX側でnetworkの許可一覧、pathの絞り込み、送信量の計測、dataの最小化を強制できる | §7 | 1.0 | 単体 |
| HELIXSECURITY-L1-007 | 人間は、AI Worker、CLI、Agent、Toolを、許可した隔離の実行環境でだけ動かせる。書き込めるpathの限定、networkの制限、資格情報の遮断、環境変数の最小化、timeout、資源の上限、fileの差分の検査、巻き戻し、結果の回収を最低の条件とする。制約はSECURITYが決め、Runner／Sandboxが物理的に適用する | §8 | 1.0 | 接続（Runner／Sandbox） |
| HELIXSECURITY-L1-008 | 人間は、操作（読む、書く、実行、network、install、削除、merge、release、deploy、資格情報の使用、securityの変更）ごとにauthorityを分けられる。「このAgentを使える」から包括的な書込みやdeployの権限を生成せず、影響の大きい操作には、actor、対象、操作、revision、環境、範囲、期限を結びつけた個別のauthorityを求める | §9 | 1.0 | 単体 |
| HELIXSECURITY-L1-009 | 人間は、authorityの失効、範囲の逸脱、不明な外部の副作用、資格情報の漏洩、異常な通信、実行環境の逸脱を検出したときに、失効と隔離を、OS（新しい割当ての停止）、Runner（実行の停止）、CONNECT（通信の停止）、資格情報（使用の停止）、成果物（accessの停止）へ伝えられる。不明な状態を成功として続けない | §10 | 1.0 | 構成体（SECURITY、OS、Runner／Sandbox、CONNECT） |
| HELIXSECURITY-L1-010 | 人間は、source、依存、package、plugin、MCP、Skill、Agentの定義、Hook、実行環境の設定、Sandboxの方針、モデルとその重み、promptとsystem instruction、Connector、基盤の設定の更新について、出所、digest、依存・権限・network・資格情報・Hookと設定の差分、新しい実行物、既知のfinding、巻き戻しの可否を確かめてから受け入れられる。新しい版であることだけを更新の理由にしない | §11 | 1.0 | 単体 |
| HELIXSECURITY-L1-011 | 人間は、fileの差分だけでなく、更新による能力の変化（例：読むだけから、書く・shell・networkへ）を検出し、版の差分から能力の差分、securityへの影響を導ける。モデル、Agent、MCP、plugin等にも当てる | §12 | 1.0 | 単体 |
| HELIXSECURITY-L1-012 | 人間は、HELIXへ取り込む外部の実行資産（package、container image、GitHub repository、MCP server、plugin、Skill、Agent package、モデル、binary）について、出所、作成者、版、digest、依存、権限、networkの振る舞い、既知のrisk、更新の差分、巻き戻しを辿れる。知らない供給元や実行能力を暗黙に信頼済みへ昇格させない | §13 | 1.0 | 単体 |
| HELIXSECURITY-L1-013 | 人間は、code、package、モデル、設定、securityの方針等が、生成から利用まで同じ対象であることを、identity、版、digest、出所、作成者、build、検証で確かめられる。「CIで検証した物」と「実際に配布・実行した物」を食い違わせない | §14 | 1.0 | 単体 |
| HELIXSECURITY-L1-014 | 人間は、外部の情報やAgentの出力を、永続の情報へ無条件に昇格させないことを確かめられる。contextからmemory、episodeから学習データ、製品の知識からBRAINへの昇格の境界を扱い、memoryの汚染、Prompt Injectionの永続化、学習データやBRAINの汚染を防ぐ | §15 | 1.0 | 構成体（SECURITY、LABO、BRAIN、INTELLIGENCE） |
| HELIXSECURITY-L1-015 | 人間は、HELIX自身の資産（HELIX-HARNESS-COREのHELIX-JSON・意味のコア・要求エンジン・内部の検証、BRAINの蓄えた設計知識、INTELLIGENCEの内部のprompt・判断の設定・専門モデル・routing、LABOのepisode・評価のcorpus・学習の材料、OSのauthorityと状態・構成・運転の記録、SECURITYの方針と資格情報）を保護の対象として識別できる | §16 | 1.x（識別と区分の土台は1.0） | 単体 |
| HELIXSECURITY-L1-016 | 人間は、HELIXの内部の資産を公開の範囲（public、customer-owned、service-internal、HELIX-confidential、HELIX-restricted、secret）で分け、HELIX-confidential以上を、Webの応答、APIの応答、log、error、stack trace、debugの出力、source map、Toolの結果、成果物、LLMのcontextへ無条件に出さない | §17 | 1.x（区分の土台は1.0） | 単体 |
| HELIXSECURITY-L1-017 | 人間は、system promptの表示、内部のarchitectureの全説明、隠れたToolの一覧、BRAINの全Patternのdump、内部APIの列挙のような意味の上での内部情報の抜き取りに対し、利用者に公開したservice contractを超える内部情報を回答として生成しないことを確かめられる | §18 | 1.x | 単体（意味の判断はINTELLIGENCEとの接続） |
| HELIXSECURITY-L1-018 | 人間は、内部のendpointの列挙、隠れたToolの探索、filesystemの探索、モデルや設定の探索、coreのdumpの要求、繰り返す無許可の読み取り、projectをまたぐ探索、debugの情報の誘発といった内部構造の探索の行動を観測し、繰り返しや組み合わせからriskを判断する材料を残せる | §19 | 1.x | 単体（判断はINTELLIGENCEとの接続） |
| HELIXSECURITY-L1-019 | 人間は、secretの送信の検査と同じ考え方をHELIXの資産へ広げ、HELIX-JSON、BRAINの生のdump、内部のpromptと方針、学習のcorpus、securityの方針を止め、利用者の成果物と公開したHARNESSの成果物を通すように、公開してよい物と内部の資産を機械的に区別できる | §20 | 1.x | 単体 |
| HELIXSECURITY-L1-020 | 人間は、決まった規則で強制するSecurity Guard（Injection、Scope、Hook、Secret、Egress、Runtime、Permission、Core Asset）と、意味の判断と診断を行うSecurity Botを分けられる。Security Botが必要なときはINTELLIGENCEのBotを発行する仕組みと接続し、Bot自身に包括的な書込みの権限を与えない | §21 | 1.0（Guard）、Botは必要になったとき | 単体（BotはINTELLIGENCEとの接続） |

1.xの要求（015〜019）は、Webの公開に伴って実利用の条件として成り立たせる。後から付けられないため、分類、資産のidentity、公開の区分等の土台は1.0から入れておく（原文§24、Conceptの1.0の土台「データの利用区分」）。

## 接続の要求と構成体の要求として外へ出すもの

機構をまたぐ処理は接続の要求、複数の機構で成り立つsecurityの能力は構成体の要求として扱う（原文§23）。接続の間にはコネクタを入れ、コネクタは接続の数だけ置く（[LABOの判断記録](../../governance/decisions/labo-core-engine-po-decisions-2026-09-26.md)、PR #2143）。

| 流れ | 種類 | 機構 |
|---|---|---|
| 外部のdata → CONNECT → SECURITYの境界 → LABO／INTELLIGENCE | 接続 | CONNECT、SECURITY、LABO、INTELLIGENCE |
| INTELLIGENCEの操作の依頼 → SECURITY（許可・拒否・制約） → OS（許可された作業） → Runner／Sandbox | 構成体 | INTELLIGENCE、SECURITY、OS、Runner／Sandbox |
| 更新の候補 → SECURITYの受け入れ → Runner／Sandbox → HARNESSの検証 → OSの昇格 | 構成体 | SECURITY、Runner／Sandbox、HARNESS、OS |
| Webの利用者 → HELIX-Web → HELIX-Web-OS → SECURITYの資産の境界 → HELIXの内部 | 構成体（1.x） | HELIX-Web、HELIX-Web-OS、SECURITY |

## 旧HELIXとの対応

旧HELIXの対応箇所を先に読み、それを起点にした。

| 本書 | 旧HELIX・現行の上位 | 保持する点 | 変わる点 |
|---|---|---|---|
| HELIXSECURITY-L1-008、009 | 旧SEA候補（`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/security-engagement-authority-requests.md`）。現行ではHELIX-OSの要求案の「Security engagementの統制条件」とHARNESSの要求案の「Security要求に適用する工程条件」が再採否待ちとして持つ | target、operation、environment、network／dataの範囲、期限へ操作のauthorityを結びつけ、authorizationの不在、範囲の逸脱、失効、古い状態、unknownで操作を止める | 対象を、security engagementから、HELIXのすべての操作へ広げる。方針とauthorityはSECURITY、停止の適用はOS・Runner・CONNECTへ分ける |
| HELIXSECURITY-L1-005 | 旧securityのmodule（secretに似たtokenのpatternを単一の正本にする。`archive/legacy-generation-2026-09-14/root/docs/design/harness/L4-basic-design/architecture.md:63`）、[Capability Lease bootstrapの判断記録](../../governance/decisions/capability-lease-bootstrap-approval-2026-09-20.md) | secretの判定を一つの正本に置く。資格情報を範囲と期限で貸す | secretの境界を、AIのcontext、成果物、外部への送信まで広げる |
| HELIXSECURITY-L1-003 | Conceptの1.0の土台「隔離の単位」（project、tenant、環境を、すべての記録、権限、data、資源に最初から付ける） | 隔離の単位 | 割当て（worktree）を単位に加え、他のprojectへの暗黙のfallbackを禁じる |
| HELIXSECURITY-L1-010、011、013 | Conceptの1.0の土台「構成版の固定と切戻し」 | 構成の版の固定と巻き戻し | 更新の受け入れで、能力の差分とsecurityへの影響を確かめる |
| HELIXSECURITY-L1-015、016 | Conceptの1.0の土台「データの利用区分」（出典、権利、機密区分、学習や外部送信に使ってよいか） | 記録する時点での区分 | 区分を、HELIX自身の資産の公開範囲へ広げる |
| HELIXSECURITY-L1-001、002、017 | 旧HR-NFR-P8-02（HBR-P8。`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:186,297`、security filterは同`docs/design/helix/L4-basic-design/pillar-basic-design.md:145-146`） | 外部のtextをraw・metadata・instructionに分け、外部data由来の命令を隔離し、prompt injection、tool injection、data exfiltrationの誘導を監査へ残す | 旧は検出と分類（deny、review、redaction）を主な防御としていた。本書は、検出に頼らず、信頼しない情報からauthorityへ直接届く経路を作らないことを主な防御にする。抜き取りの対象を、HELIX自身の資産（system prompt、内部のarchitecture、BRAINのdump等）へ広げる |
| HELIXSECURITY-L1-014、018 | 対応なし | — | 永続化の境界（memory・学習データ・BRAINの汚染）と、内部構造の探索の検出は、新しい案である。`archive/`を「memory poisoning」「probing」で探した。「memory poisoning」は0件、「probing」はMCPのprofileの確認に関するもので、探索の検出ではなかった |

## 現行の要求案との食い違い

HARNESSの要求案の「Security要求に適用する工程条件」には、「具体的な特権操作・credential管理はHELIX-OSが統制する」とある。一方、Conceptの機構の表はHELIX-SECURITYに「資格情報」を置き、本書もSECURITYが資格情報の方針とauthorityを持つとする。
Conceptに合わせ、資格情報の方針とauthorityはSECURITYが持ち、OSはそれに従って運転する形へ、HARNESSの要求案の文言を後続で改める（[判断記録](../../governance/decisions/security-l1-idea-po-decisions-2026-09-26.md)）。
