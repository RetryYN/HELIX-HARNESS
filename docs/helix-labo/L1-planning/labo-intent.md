---
title: "HELIX-LABO L1企画案"
canonical_vmodel: L1-L12
canonical_layer: L1
canonical_pair: L12
layer: L1
kind: planning
status: draft
authority_status: draft_candidate
parent_concept: docs/concept/helix-concept.md
source: docs/helix-labo/sources/labo-core-engine-po-original-2026-09-26.md
decision_record: docs/governance/decisions/labo-core-engine-po-decisions-2026-09-26.md
created: 2026-09-26
updated: 2026-09-26
---

# HELIX-LABO L1企画案

本書の親は[HELIX Concept](../../concept/helix-concept.md)である。本文は、POが2026-09-26に示した[HELIX-LABO Core Engineの原文](../sources/labo-core-engine-po-original-2026-09-26.md)を、企画（L1）の形に整理したものである。
POは原文について「これでいく」と答えた（[判断記録](../../governance/decisions/labo-core-engine-po-decisions-2026-09-26.md)）。本書の整理が原文を超えず欠かしていないかは、POが対象revisionで確認する。
本書から、要求（L2）の合意、要件（L3）の承認、実装・実行の許可を生成しない。

## 提供価値

HELIX-LABOは、HELIXの全機構・各製品・運用環境から出るログ、証拠、計測値、失敗、再作業、利用結果を横断して集め、関連づける。
内部の実績と外の情報を分解・比較・実験・評価し、各機構へ改善のFeedbackを返す。HELIX全体の観測・研究・評価・還流の中心である。

- LABOは、HELIXの中央制御装置ではない。各機構のauthorityと稼働中のstateの正本を奪わない。
- LABOが持つ中心の対象は、「何が起き、なぜ起き、何を変えたらどうなったか」という、機構をまたぐepisode（一つの開発・運用の一連の出来事）である。
- LABOの最も重要な成果物は、改善そのものではなく、「どの機構の何を改善すべきか」というFeedbackである。Feedbackは提案であり、authorityではない。
- LABOは、HELIXが経験したすべてを次の改善へ変える場所である。

## 見ている時間軸

LABOは過去の振り返りを見る。何が起き、なぜ起き、何を変えたらどうなったかを、記録から評価する。
HELIX-Intelligenceは、現在の把握と未来への行動を見る。稼働中の理解、計画、予測、診断、レビュー、配置案を行う。

| 重なって見える仕事 | LABO（過去） | Intelligence（現在と未来） |
|---|---|---|
| 診断 | 終わった仕事の記録から、失敗の原因候補と欠落を振り返る | 稼働中の状態を把握し、いま何をするかを判断する |
| 外の情報 | 取得した情報の出所を確かめ、分解・比較・評価する | クローラーを発行して情報を取りに行く |
| bot | どのbotの判断が当たり、外れたかを評価し、材料を返す | バグbot、ヘルプbot、全体監査を動かす |

## 企画要求

版の列は、その要求を入れる版の印（`version_target`）である。
種類の列は、要求の粒度の分け方（2026-09-25のPO指示）による。単体はLABOの中で閉じるもの、接続は機構どうしをつなぐもの、構成体は複数の機構にまたがって続けて走るものである。

| ID | L1企画要求 | 原文 | 版 | 種類 |
|---|---|---|---|---|
| HELIXLABO-L1-001 | 人間は、HELIXの全機構・各製品・運用環境から、許可された観測（ログ、証拠、計測値、失敗、再作業、費用、利用結果）を共通の形で集められる。成功だけでなく、失敗、拒否、取消、停止、不明、未観測を区別する。集めても、元の記録・state・authorityは各機構に残る | §3、§5、§24の1〜3 | 1.0 | 接続（各機構からLABOへ） |
| HELIXLABO-L1-002 | 人間は、個別の記録を、要求・ticket・Worker・実装・CI・統合・release・配備・稼働・障害・復旧の一連としてepisodeにまとめ、どの要求・構造・Worker・model・変更・環境から結果が生じたかを比較できる。相関を因果と決めつけない | §3、§6、§24の4 | 1.0 | 単体 |
| HELIXLABO-L1-003 | 人間は、観測した出来事を丸ごと採否せず、良い部分、悪い部分、条件に依存する部分、汎用にできる部分、製品固有の部分、システムにできる部分、運用で補う部分、不明な部分、不要な部分に分けられる | §7 | 1.0 | 単体 |
| HELIXLABO-L1-004 | 人間は、既存の方式の意味・目的・条件・構造を保ったうえで、部分構造の比較と再構成（Vector守破離）により改善の仮説を作り、保つ・減らす・分ける・合わせる・定義し直す・置き換える・移す・退役させる等の操作を評価できる。仕組みを増やすことを目的にしない | §8、§9 | 1.0 | 単体 |
| HELIXLABO-L1-005 | 人間は、改善の候補を今の方式と比べる実験を行い、品質、成功率、誤検知と見逃し、再作業、速度、費用、人の介入量、運用負荷などで評価できる。「動いた」だけを改善としない。結果が一つの事例から製品をまたぐ汎用の構造までのどこまで当てはまるかを測る | §10、§13、§24の5 | 1.0 | 単体（実験の実行はRunner／Sandboxとの接続） |
| HELIXLABO-L1-006 | 人間は、何をシステムに持たせ、何を運用に残すかを評価できる。再現・機械判定・巻き戻しができるものはシステム化の候補とし、文脈や意味の判断に依るものは運用で保証する候補とする。システムにしたものが例外や誤検知を増やしたときは、運用へ戻すことも正規の改善とする | §11、§12、§24の10〜12 | 1.0 | 単体 |
| HELIXLABO-L1-007 | 人間は、評価の結果から、どの機構の何を改善すべきかのFeedbackを得られる。汎用の構造はBRAINへ、判断・監査・bot・モデル改善の材料はIntelligenceへ、工程や契約そのものの問題はHARNESSへ、運転方法の問題はOSへ、製品固有の意味は各製品のヘリックスコアへ、認可・隔離・接続・運転の問題はSecurity、Runner／Sandbox、CONNECT、Web-OSへ返す。Feedbackは提案であり、登録と振り分けはOSが行い、LABOは各機構のauthorityを直接変えない | §14〜§20、§22、§24の7〜9と13 | 1.0 | 接続（LABOから各機構へ） |
| HELIXLABO-L1-008 | 人間は、Feedbackが登録・変更・検証・運用へ進んだ後も、変更後の結果を再び観測し、Feedbackの効果そのものを評価して、HELIXの改善の循環を閉じられる | §23、§25、§24の14〜15 | 1.0 | 構成体（全機構とLABOとOS） |
| HELIXLABO-L1-009 | 人間は、外の情報（OSS、設計資料、論文、Issue、PR等）を、クローラーやCONNECT等で取得したうえで、LABOで出所を確かめ、分解・比較・実験し、汎用の構造の候補としてBRAINへ入れられる。外で成功した方式をそのままBRAINへ入れない | §21、§24の6 | 2.0 | 構成体（Intelligence、CONNECT、LABO、BRAIN） |
| HELIXLABO-L1-010 | 人間は、LABOが評価した事例と反例をIntelligenceへ返し、3.0以降はローカルLLMの学習・チューニング・評価に使える | §16 | 1.0（評価材料）、3.0（学習用の材料） | 接続（LABOからIntelligenceへ） |

## エンジンと接続

LABOの原文にあるエンジンは、次の10個である。集積、相関、構造の分解、Vector守破離、変換、実験、保証の割付（システムと運用）、運用への戻し、一般化、Feedbackの導出。

- 各エンジンは単体の要求として扱う。
- エンジンどうしの接続は、それぞれを接続の要求とする。接続の間にはコネクタを入れ、エンジンを疎結合にする（2026-09-26のPO指示）。
- コネクタは、接続1つにつき1つ置く。接続が増えれば、コネクタもその数だけ増える。
- LABOと他の機構との接続（上の表で「接続」とした要求）にも、同じ考え方でコネクタを入れる。コネクタの仕組みはHELIX-CONNECT（内部の機構どうしの接続と、内部と外部の接続）が担う。
- どのエンジンとどのエンジンをつなぐか（接続の一覧）は、要求（L2）で決める。

## 旧HELIXとの対応

旧HELIXの対応箇所を先に読み、それを起点にした。

| 本書 | 旧HELIX | 保持する点 | 変わる点 |
|---|---|---|---|
| HELIXLABO-L1-002 | 旧評価記録の`improvement_episode_id`（`archive/legacy-generation-2026-09-14/root/src/schema/harness-db-tables-evaluation.ts:32`）、RCLS-BR-002（[LABOの候補](../candidates/improvement-research-requirements.md)） | 改善をepisodeで追う。相関を因果、自己評価を独立検証として扱わない | episodeを、計測だけでなく要求から復旧までの機構をまたぐ一連に広げる |
| HELIXLABO-L1-005 | 旧HBR-P4「自動修復／計測改善」（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:46,92`） | 計測による改善の評価 | 比較の軸を、品質・費用・人の介入量・運用負荷等へ広げる |
| HELIXLABO-L1-005、006 | RCLS-BR-004（project内、独立検証、横断検証、shadow、機構化の段階） | 段階を踏んで機構化する | システムから運用へ戻す経路を正規の改善に加える（旧に対応する記述は見つからなかった） |
| HELIXLABO-L1-007 | RCLS-BR-006（学習結果は提案で、要求・設計・merge・Releaseのauthorityを直接書き換えない） | Feedbackは提案である | 返す先を機構ごとに分ける |
| HELIXLABO-L1-009 | 旧HBR-P8「外部検索／skillify／security boundary」（同`pillar-functional-requirements.md:49,95`） | 出所の記録、隔離、セキュリティの確認 | 取り込み先をBRAINの汎用の構造とし、LABOを評価の境界にする |
| エンジンと接続 | 旧HIL-BR-15、HIL-FR-23（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:67,113`）、旧Product Data Connector Registry（同`docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md:65,554-575`） | 取り込み元ごとに版の付いたコネクタを登録し、由来・schema・権限の方針を固定する | 旧は製品データの取り込み元ごとのコネクタだった。これを、エンジンどうしと機構どうしの接続1つごとのコネクタへ広げる（2026-09-26のPO指示）。`archive/`を「connector」「コネクタ」「疎結合」で探し、機構の中の処理どうしを接続ごとのコネクタで分けた記述は見つからなかった |
| HELIXLABO-L1-004 | 対応なし | — | Vector守破離は新しい案である。`archive/`と`docs/`を「守破離」「Shu-Ha-Ri」「shuhari」で探し、該当はなかった |

## 既存の候補との関係

[LABOの候補](../candidates/improvement-research-requirements.md)にある項目は、次のL1を親にする。候補の文言は変えない。要求（L2）として採否するのは、本書のrevisionをPOが確認した後である。

| 候補 | 親にするL1 |
|---|---|
| HELIXOS-L2-005（改善研究の部分） | HELIXLABO-L1-005、007、008 |
| HELIXOS-L2-012（技術調査） | HELIXLABO-L1-009（内部事例を先に照合する点はHELIXLABO-L1-002） |
| HELIXOS-L2-013（同じ仕事の横断診断） | HELIXLABO-L1-002（終わった仕事の振り返りとして） |
| RCLS-BR-001〜006 | HELIXLABO-L1-001、002、005、006、007 |

## 要求（L2）で詰めること

- 原文§3の観測を結ぶ項目の一覧と、§22のFeedbackの最低限の項目は、要求（L2）の候補として扱う。項目名の確定は要求と設計で行う。
- 観測を各機構から出す接続は、1.0の土台「ログと証拠」「データの利用区分」「後から加わる機構の受け口」（[Concept](../../concept/helix-concept.md)）とHELIX-CONNECTの接続の要求として詰める。
