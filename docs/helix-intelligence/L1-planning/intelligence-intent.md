---
title: "HELIX-INTELLIGENCE L1企画案"
canonical_vmodel: L1-L12
canonical_layer: L1
canonical_pair: L12
layer: L1
kind: planning
status: draft
authority_status: draft_candidate
parent_concept: docs/concept/helix-concept.md
source: docs/helix-intelligence/sources/intelligence-l1-idea-po-original-2026-09-26.md
decision_record: docs/governance/decisions/intelligence-l1-idea-po-decisions-2026-09-26.md
created: 2026-09-26
updated: 2026-09-26
---

# HELIX-INTELLIGENCE L1企画案

本書の親は[HELIX Concept](../../concept/helix-concept.md)である。本文は、POが2026-09-26に示した[HELIX-INTELLIGENCE L1要求アイデアの原文](../sources/intelligence-l1-idea-po-original-2026-09-26.md)を、企画（L1）の形に整理したものである。
整理にはPOの回答（4.0にINTELLIGENCEも加える）を含める（[判断記録](../../governance/decisions/intelligence-l1-idea-po-decisions-2026-09-26.md)）。
本書の整理が原文を超えず欠かしていないかは、POが対象revisionで確認する。本書から、要求（L2）の合意、要件（L3）の承認、実装・実行の許可を生成しない。

## 提供価値

HELIX-INTELLIGENCEは、HELIXと開発対象の現在の状態を、根拠・版・不確実性付きで理解し、開発の領域ごとに計画・予測・診断・レビュー・配置等の判断の候補を作る。
判断の結果はauthorityではなく、実行・採択・評価を担う各機構へ接続して使う。

| 機構 | 見るもの |
|---|---|
| HELIX-BRAIN | 何を知っているか |
| HELIX-HARNESSと各製品のHELIX-HARNESS-CORE | 何を満たすべきか |
| HELIX-OS | 何を実際に進めるか |
| HELIX-INTELLIGENCE | 今の状況ではどう判断するか |

INTELLIGENCEは、要求、設計、状態、知識、権限の正本にならない。

## 企画要求

版の列は、その要求を入れる版の印（`version_target`）である。種類の列は、要求の粒度の分け方（2026-09-25のPO指示）による。

| ID | L1企画要求 | 原文 | 版 | 種類 |
|---|---|---|---|---|
| HELIXINTELLIGENCE-L1-001 | 人間は、ソフトウェア開発とHELIX自身の稼働について、判断の対象を領域（Requirement／Meaning Support、Design、Implementation、Verification／CI、Integration／Change、Release、Operation／Incident、Worker、Model／Provider、HELIX Self等）に分けて扱える。領域は固定の一覧にせず、追加・分割・統合・退役できる。各領域は別のシステムではなく、INTELLIGENCEの中の判断の領域とする | INTELLIGENCE-L1-001 | 1.0 | 単体 |
| HELIXINTELLIGENCE-L1-002 | 人間は、領域ごとに必要な判断の能力（Understand、Plan、Predict、Diagnose、Review、Recommend）を、領域×能力の組み合わせとして使える。すべての領域にすべての能力を強制しない | INTELLIGENCE-L1-002 | 1.0 | 単体 |
| HELIXINTELLIGENCE-L1-003 | 人間は、各機構の正本を持たずに、判断のための現在の状況のモデル（対象、要求と設計のrevision、ticket、状態、依存、証拠、未解決のfinding、Worker、model／provider、環境、費用と予算、risk、時間、分かっていることと分からないこと）を作れる。状況のモデルを元の情報のauthorityへ昇格させず、元の情報と食い違えば元の情報を優先する | INTELLIGENCE-L1-003 | 1.0 | 単体（元の情報は各機構からの接続） |
| HELIXINTELLIGENCE-L1-004 | 人間は、観測した事実、導いた解釈、仮説、不明を区別できる。AIが推論した内容を観測した事実として扱わず、判断の根拠に出所、revision、証拠、推論、不確実性を残す | INTELLIGENCE-L1-004 | 1.0 | 単体 |
| HELIXINTELLIGENCE-L1-005 | 人間は、承認済みの要求、HARNESSの工程の契約、現在の状態、依存、risk、BRAINの知識等から、次の作業の計画の候補（目的、対象、前提、依存、順序、並列にできる作業、期待する結果、risk、不確実性、停止の条件、代替）を得られる。INTELLIGENCEはticketを発行せず、計画の候補をOSの推進へ渡す | INTELLIGENCE-L1-005 | 1.0 | 単体（OSへは接続） |
| HELIXINTELLIGENCE-L1-006 | 人間は、現在の状態と変更の候補から、要求・設計・依存への影響、退行、CIの失敗、統合の衝突、性能、release、Workerの失敗、費用と時間の傾向を予測できる。予測に前提、証拠、不確実性、反証の条件を持たせ、実測した事実として扱わない。後の実測との比較はLABOへ渡す | INTELLIGENCE-L1-006 | 1.0 | 単体（LABOへは接続） |
| HELIXINTELLIGENCE-L1-007 | 人間は、発生中の異常・失敗・停滞について、症状から原因の候補、証拠、切り分けを経た診断の案を得られる。一つの相関だけで原因を確定せず、必要な追加の観測と検査を示す。終わった仕事を長く比べて何が改善したかを評価するのはLABOとする | INTELLIGENCE-L1-007 | 1.0 | 単体 |
| HELIXINTELLIGENCE-L1-008 | 人間は、要求の整合、設計、実装、テスト、CI、統合、releaseの準備、運用の変更、HELIX自身を対象にReviewでき、結果をfinding、重さ、範囲、証拠、再現、反例、推奨する経路に分けられる。Reviewの結果だけでmerge、要求の変更、release、受入を成立させない | INTELLIGENCE-L1-008 | 1.0 | 単体 |
| HELIXINTELLIGENCE-L1-009 | 人間は、HELIX全体について、authorityの食い違い、設計と稼働の食い違い、古い前提、証拠の欠落、無効な投影、責務の漏れ、支えのない振る舞い、繰り返す失敗、機構の境界の違反等を監査でき、結果をHEAD、authority、作成者、証拠、再現、反証へ辿れる。自由文の指摘だけでauthorityを変えない | INTELLIGENCE-L1-009 | 1.0 | 単体 |
| HELIXINTELLIGENCE-L1-010 | 人間は、作業の内容と実績から、Workerの配置の候補を得られる。判断の軸は、作業の種類、領域、複雑さ、必要なcontextとtool、成功と失敗の履歴、手戻り、遅延、費用、信頼性とする。価格、モデル名、ベンチマークだけで配置を決めず、実際の割当と進行はOSが行う | INTELLIGENCE-L1-010 | 1.0 | 単体（OSへは接続） |
| HELIXINTELLIGENCE-L1-011 | 人間は、モデルとproviderを一つの固定の能力として扱わず、領域と能力ごとに適性を評価できる。同じcorpus・同じ責務の範囲で、所見、誤検出、見逃し、再現性、遅延、費用を比べ、モデルの更新だけで上位と判定しない | INTELLIGENCE-L1-011 | 1.0 | 単体 |
| HELIXINTELLIGENCE-L1-012 | 人間は、「判断できない」を正常な結果として受け取れる。known、probable、uncertain、unknown、contradictory等を区別し、不足する情報に対して追加の証拠、Discovery、テスト、Review、人の判断等の必要条件を示す。unknownを安全・成功・問題なしへ変えない | INTELLIGENCE-L1-012 | 1.0 | 単体 |
| HELIXINTELLIGENCE-L1-013 | 人間は、重要な判断の候補について、入力のrevision、当てはめた規則、参照したBRAINの知識、観測、前提、model／provider／版、推論の結果、不確実性、退けた代替へ辿り、なぜその候補になったかを検証できる。同じ判断の完全な再生成までは求めない | INTELLIGENCE-L1-013 | 1.0 | 単体 |
| HELIXINTELLIGENCE-L1-014 | 人間は、繰り返し起き、対象・入力・判定の条件・停止の条件を限定できる判断について、専門のBot（Bugbot、Helpbot、Crawlerを含む）を発行できる。Botは、特定の目的に使うWorkerとして実行し（[2026-09-26 PO判断](../../governance/decisions/worker-execution-model-po-decisions-2026-09-26.md)、PR #2149）、INTELLIGENCEとは別のidentityを持ち、目的、範囲、入力、出力、許す操作、停止の条件、版を持つ。Botの追加を新しいauthorityの追加にしない。Botごとの詳細な責務はL2以降で定める | INTELLIGENCE-L1-014 | 1.0 | 単体 |
| HELIXINTELLIGENCE-L1-015 | 人間は、CIや実行で繰り返し現れる失敗について、失敗のパターン、再現性、機械で検出できるか、誤検出、範囲、修復できるかを確かめ、機械で扱えるものからBugbotの候補へ昇格できる。一度だけの失敗から恒久のBotを作らない | INTELLIGENCE-L1-015 | 1.0（ログがたまり機械で判定できるようになった時点で発行する。2026-09-25のPO判断） | 単体 |
| HELIXINTELLIGENCE-L1-016 | 人間は、限定された問題について、検出、診断、修復の候補、限定した修復までをINTELLIGENCEに任せられる。修復の対象は、対象revision、actor、write-set、副作用、予算、期限、再試行、影響の範囲、復旧点を持つ。要求・設計・検証義務を修復器が変えず、意味の変更が必要なら上流へ戻す | INTELLIGENCE-L1-016 | 1.0 | 単体 |
| HELIXINTELLIGENCE-L1-017 | 人間は、限定修復をINTELLIGENCEが担っても、操作の許可（SECURITY）、隔離した実行（Worker）、修復後の検証義務（HARNESS）、検収（OS）が代わられないことを確かめられる。修復の案を作れることから包括的なwrite権限を生成しない | INTELLIGENCE-L1-017 | 1.0 | 接続（SECURITY、Worker、HARNESS、OS） |
| HELIXINTELLIGENCE-L1-018 | 人間は、INTELLIGENCEが現在と次に何をするかを扱い、LABOが過去に何が起き何が効いたかを扱うことを区別できる。INTELLIGENCEは長期の改善の効果を自己評価して採択せず、結果をLABOへ渡し、LABOの評価を判断の材料として受け取る | INTELLIGENCE-L1-018 | 1.0 | 接続（LABO） |
| HELIXINTELLIGENCE-L1-019 | 人間は、BRAINが示す選択肢と、INTELLIGENCEが今回の状態で選ぶ適用の候補とを区別できる。INTELLIGENCEの判断の結果をBRAINの汎用の知識へ直接書き込まず、汎用化はLABO等の評価の経路を通す | INTELLIGENCE-L1-019 | 1.0 | 接続（BRAIN、LABO） |
| HELIXINTELLIGENCE-L1-020 | 人間は、INTELLIGENCEが製品固有の要求・設計・意味を理解の材料として使っても、要求、設計のauthority、受入、製品固有の意味を直接変えないことを確かめられる。食い違い・不足・改善の候補には、適切なBackflowの先を示す | INTELLIGENCE-L1-020 | 1.0 | 単体 |
| HELIXINTELLIGENCE-L1-021 | 人間は、LABOが渡す評価済みの事例・反例・学習の材料を使い、判断の領域または能力に特化したローカルLLM（要求の理解、設計のReview、実装の診断、CIの失敗の診断、統合のReview、Workerの配置、Model Router、監査、限定修復等）を学習・チューニングできる。一つの万能のモデルへの統合を必須とせず、領域や能力ごとの小型のモデルを持つ構成を許す | INTELLIGENCE-L1-021（追加の原文） | 3.0 | 単体（材料はLABOからの接続） |
| HELIXINTELLIGENCE-L1-022 | 人間は、LABOから渡されたデータの利用区分（training、validation、evaluation、holdout、prohibited）を保ち、混同しないことを確かめられる。評価用に隔離した事例を学習へ混ぜず、学習データへの適合だけでモデルの改善を判定しない | INTELLIGENCE-L1-022 | 3.0 | 単体 |
| HELIXINTELLIGENCE-L1-023 | 人間は、モデルの候補について、base model、版、学習データのrevision、チューニングの方法、構成、領域、能力、学習の環境、評価のcorpus、分かっている限界、戻し先を辿れる。どの材料と設定から生まれたか分からない候補を稼働のモデルへ昇格させない | INTELLIGENCE-L1-023 | 3.0 | 単体 |
| HELIXINTELLIGENCE-L1-024 | 人間は、モデルの候補を、同じ責務の範囲と比べられるcorpusで今のモデルと比べられる。成功、所見、誤検出、見逃し、再現性、遅延、費用、資源の消費、失敗のパターンを比べ、新しい・大きい・学習済みであることだけを改善の根拠にしない | INTELLIGENCE-L1-024 | 3.0 | 単体 |
| HELIXINTELLIGENCE-L1-025 | 人間は、モデルごとに領域×能力の適格な範囲を持たせられる。一つのモデルの性能の向上からINTELLIGENCE全体を置き換えず、適格と確かめていない領域へ能力を外挿しない | INTELLIGENCE-L1-025 | 3.0 | 単体 |
| HELIXINTELLIGENCE-L1-026 | 人間は、モデルの候補または採用したモデルの実績をLABOへ返し、品質、誤検知、見逃し、再作業、時間、費用、人の介入、運用の負荷、退行について、過去の方式との差をLABOに独立して評価させられる。INTELLIGENCEの中のモデルの評価だけで、恒久の改善を確定しない | INTELLIGENCE-L1-026 | 3.0 | 接続（LABO） |

1.0では、既存の外部モデルを使って上の判断の能力を成り立たせる（[Concept](../../concept/helix-concept.md)）。

## 接続の要求として外へ出すもの

次はINTELLIGENCEの中の要求にせず、接続の要求として定める。接続の間にはコネクタを入れ、コネクタは接続の数だけ置く（[LABOの判断記録](../../governance/decisions/labo-core-engine-po-decisions-2026-09-26.md)、PR #2143）。

| 接続 | 渡すもの |
|---|---|
| BRAIN → INTELLIGENCE | 汎用のPattern、Unit、Part、適用の条件、反例（判断の材料） |
| HELIX-HARNESS-CORE／HARNESS → INTELLIGENCE | 製品固有の要求、設計、工程の契約、検証義務 |
| LABO → INTELLIGENCE | 過去の評価の結果、成功・失敗・反例、Workerとmodelの実績 |
| INTELLIGENCE → OS | 計画、配置、診断、修復等の実行の候補。登録・ticket化・進行はOSが担う |
| INTELLIGENCE ↔ SECURITY | 必要な操作に対する許可と制約の確認 |
| INTELLIGENCE → OS → Worker | 実作業が要るときは、OSがticketをレーンへ割り当て、レーンの主が呼び出したWorkerが許可済みの範囲だけ実行する。INTELLIGENCE自身をWorkerとして扱わない（[2026-09-26 PO判断](../../governance/decisions/worker-execution-model-po-decisions-2026-09-26.md)、PR #2149） |
| INTELLIGENCE → LABO | 判断、予測、配置、修復の結果（評価の対象） |
| LABO → INTELLIGENCE（3.0） | 評価済みのepisode、学習の材料、反例、評価のset |
| INTELLIGENCE → LABO（3.0） | モデルの結果、予測、判断、失敗（効果と退行の評価の対象） |

## 複数の機構で成り立つもの（構成体の要求）

次はINTELLIGENCEだけの要求にせず、構成体の要求として扱う。

| 構成体 | 機構 |
|---|---|
| 自動の開発計画 | BRAIN、HELIX-HARNESS-CORE、INTELLIGENCE、OS |
| 最適なWorkerの配置 | LABO、INTELLIGENCE、OS |
| 限定の自動修復 | INTELLIGENCE、SECURITY、Worker、HARNESS、OS |
| 継続的な自己改善 | LABO、BRAIN、INTELLIGENCE、OS、HARNESS |
| 将来の動的な開発フロー（Conceptの4.0） | BRAIN、HELIX-HARNESS-CORE、INTELLIGENCE、OS（POの回答「INTELLIGENCEも加える」） |

## 旧HELIXとの対応

旧HELIXの対応箇所を先に読み、それを起点にした。

| 本書 | 旧HELIX | 保持する点 | 変わる点 |
|---|---|---|---|
| HELIXINTELLIGENCE-L1-009 | AAFD-BR-01（[INTELLIGENCEの候補](../candidates/audit-bounded-repair-requirements.md)、元は`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md`） | 監査の提案を対象HEAD・authority・作成者・証拠・再現・反証へ辿り、自由文をauthorityにしない | 監査の対象を、HELIX全体の食い違い・責務の漏れ・境界の違反へ広げる |
| HELIXINTELLIGENCE-L1-011 | AAFD-BR-04（同候補） | モデルの更新を同じcorpus・責務の範囲で比べ、所見・誤検出・見逃し・再現性・費用・遅延を確かめる | 比較を、領域と能力ごとの適性の評価へ広げる |
| HELIXINTELLIGENCE-L1-015〜017 | 旧Bugbot・限定修復の候補（`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-requests.md`、INTELLIGENCEの候補の「限定修復の条件」） | 対象revision・actor・write-set・副作用・予算等を持つ操作だけを修復し、包括的なwrite権限を生成しない。意味の矛盾は上流へ戻す | 修復の候補を、繰り返す失敗から機械で扱えるものだけをBugbotの候補へ昇格させる形にする |
| HELIXINTELLIGENCE-L1-010 | 旧3L-BR-010（`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/three-lane-capacity-profile-requests.md:15`） | 作成・検収・統合の能力を別々に扱う | provider名で固定したlaneから、作業と実績に基づく配置の候補へ変える。実際の割当はOSに残す |
| HELIXINTELLIGENCE-L1-004、012 | RCLS-BR-002（相関を因果、自己評価を独立検証として扱わない。[LABOの候補](../../helix-labo/candidates/improvement-research-requirements.md)）、HARNESS-L2-005（unknownをskipへ変換しない） | 推論と事実を分け、unknownを補完しない | 不確実性の区別を、判断の結果の正常な値として持つ |
| HELIXINTELLIGENCE-L1-022〜025 | Conceptの1.0の土台「データの利用区分」（学習用と評価用を分けられるようにする）と「構成版の固定と切戻し」（3.0以降のモデルの差し替え）、3.0の行（どのデータと設定から生まれたモデルかを追え、学習前と比べ、弱点・適用範囲・撤回先を持つ）、AAFD-BR-04（同じcorpus・責務の範囲での比較） | 利用区分の分離、由来の追跡、比較、戻し先 | 利用区分をtraining・validation・evaluation・holdout・prohibitedに分け、モデルごとに領域×能力の適格な範囲を持たせる |
| HELIXINTELLIGENCE-L1-001〜003 | 対応なし | — | 領域×能力の組み合わせと、現在の状況のモデルは、新しい案である。`archive/`を「Situation Model」「Domain × Capability」「判断領域」で探し、該当する記述は見つからなかった |

## 既存の候補との関係

[INTELLIGENCEの候補](../candidates/audit-bounded-repair-requirements.md)の項目は、次のL1を親にする。候補の文言は変えない。要求（L2）として採否するのは、本書のrevisionをPOが確認した後である。

| 候補 | 親にするL1 |
|---|---|
| 限定修復の条件（旧Bugbot） | HELIXINTELLIGENCE-L1-015、016、017 |
| AAFD-BR-01〜03 | HELIXINTELLIGENCE-L1-009 |
| AAFD-BR-04 | HELIXINTELLIGENCE-L1-011 |
