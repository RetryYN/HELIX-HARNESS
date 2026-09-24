---
title: "Concept・要求対応のPO判断 decision record（2026-09-24）"
decision_record_id: HDEC-CONCEPT-REQUIREMENT-PO-2026-09-24
decision_status: recorded
decider_role: PO
decided_at: 2026-09-24
recorded_at: 2026-09-24
source_repository_revision: 93d06d2b0b0d2a28d59783eed1e55c74426f556f
source_packet: docs/governance/crosswalks/concept-requirement-po-decision-packet.md
source_packet_sha256: 35e9cfe2dd20704c80d91c4fefd10f0ab7f26de9c1054fdd7b5822786a72f284
authority_effect: effective_when_this_record_is_admitted_to_main
follow_up: PO最適ドラフトPR（全要求を最終的に詰める後続PR）
---

# Concept・要求対応のPO判断（2026-09-24）

## 記録の範囲

2026-09-24（Asia/Tokyo）のClaude作業sessionで、POに[PO判断パッケージ](../crosswalks/concept-requirement-po-decision-packet.md)
（main `93d06d2b0`、SHA-256 `35e9cfe2…f284`）の各項目を質問票で1件ずつ示し、回答を得た。本書はその回答の記録である。
POの発言は要旨を崩さない範囲で引用し、AIの解釈と区別する。

本判断はPOの指示により**前段階処理**として扱う。本記録と反映PRをCodexの独立reviewを経て一度mainへ入れ、
その後に全要求を「PO最適ドラフトPR」にして最終的に詰める。本記録から要求・要件の承認、L3凍結、実装許可、Issue close、
release、配布repo切替を生成しない。

## 上流文書の判断

質問では各文書のpathとSHA-256を判断パッケージで示した。

| 対象 | 示したSHA-256 | POの回答 | 本記録での扱い |
|---|---|---|---|
| `docs/helix-os/L1-planning/system-intent.md` | `ffbafa47e5b218c4ddfdd170e4ba7c12cd6cdfe518fbdcce5ccbbee7e0b151bc` | 採用 | このbytesを採用。反映PRではbytesを変えない |
| `docs/concept/product-boundary.md` | `9268e35757c9a78baa47122917215b30ece1905d2b3f384c89fbfd4eb2b3ac0a` | 採用 | このbytesを採用。反映PRではbytesを変えない |
| `docs/helix-harness/L1-planning/product-intent.md` | `ece3e268756a55469defa39bba42df9c93a2d331e5034874f54dd9e7bda94e96` | 「問題ないが、1.0で土台は入れる」 | 内容を採用し、1.0土台の追記を指示された。追記後のbytesはこのSHAと異なるため、追記後revisionの確認はPO最適ドラフトPRで行う |
| `docs/concept/helix-five-goals.md` | `e9668e77863af8c128694fb06783becf558e727b530975988fe4db5a5d012f29` | 5大目標は「ルール系のドキュメントとかAIが方針をぶらさないためのもの」。関与表は残し、「対応表は参照用にコンパクトに」 | 内容を採用し、関与表の縮約を指示された。縮約後revisionの確認はPO最適ドラフトPRで行う |
| `docs/helix-web/L1-planning/product-intent.md` | `5bf45a2257c376fe95fbc7762f4e7d1c5bdfd21ed93dee9bb5b54b55c0029c23` | 当初「採用」。後に訂正：「Webのほうはまだ要求化すらしてない。Visionを勝手に拡大解釈してるだけ」 | 採用を撤回。L1ではなくVisionレベルの材料へ分類し直す |
| `docs/helix-web-os/L1-planning/system-intent.md` | `971bfc40448a4fefdff7fd433efd8a72ae44d346dcb613983416c88fade3b20c` | 当初「採用」。後に「同じくVisionレベルに分類し直す」 | 同上 |

## Web・Web-OSの分類

Web L2（9件）とWeb-OS L2（6件）は、AIが2026-09-14にVision v0.1から起こした未承認draftである。POは次のとおり判断した。

- 「構想って言って具体化してないけど？それが何の証拠になるの？最終はローカルコネクタの提供からで最終的にクラウド型にできたらいいね。ぐらいの話で謎に拡張されている」
- 「Visionレベルの話でこれから要求に起こすべき内容であり、いま要求に入ってるのがおかしい。つまり、分類が正しくできてない」

Web・Web-OSのL1とL2は要求層から外し、Visionレベルの材料として扱う。要求は今後POの指示から起こす。
このため、判断パッケージにあったWeb系の機構配置（HDA〔HELIXWEB-L2-006〕を含む）は前提から見直しとなる。

## 全体方針

- 旧HELIXで実現されつつあったものは、すべて採用する。
- 判断が分かれるときは、基本的に新しいものを採用する。
- 1.0土台の7項目（仮ID-BASE-01..07）は、すべて1.0に入れる。
- L1被覆の4件（G1、G3、G4、G5）は、すべて採用する。
- HDA（開発補助モデル）は、2.xの途中からチューニングする。実用レベルに達するまで採用できないため、実装は提供より前に行う。Webでの提供は提供の時間軸（3.0）で考える。

## 工程とCI

- **L2.5**（HIL-FR-19／20）：画面プロトタイプとPoCは、要求と要件の間のL2.5に置く。PO「画面は要求とPoCして不確定要素を減らしてから要件定義に入る」「ハーネスみたいなのを作るのであれば画面プロトは当然スキップするから、2.5のPoCも同様」。
- **動的CI**（HIL-BR-16、HIL-FR-28）：CIの段数は固定しない。PO「必要なCIを回すかたちに変更する。動的ワークフローと同じように動的CIを合成する形式に修正」。検収がticketから必要な検証を導き、CIを組み立てる。
- **リバース**（HIL-FR-01／04、HIL-NFR-03）：実装後に設計修正が出たら、必ずticketとして発行する。PO「それらはチケットにする方針」。
- **要求の文言**：必要なものを導出する形で書く。PO「必要なものを導出する形式なのになぜ決めるみたいな話が出ているのか理解に苦しむ」。

## memory（HMC）

- harness memory（HIL-BR-03、HIL-FR-10）は、CodexとClaudeの連携用に限る。過度な記録を残さない。PO「メモリに書く内容は基本にルールになるよな？これは仕組みで吸収する」。
- **HMC-BR-003**：規則は仕組みで吸収する。知識は、1.0〜2.xではLABOが評価して保持し、3.0からはIntelligenceが改善に使う。Learning／Skill authorityという旧名は使わない。
- **HMC-BR-006**：すべてのproviderで、標準memoryの使用を禁止する。PO「Claude標準メモリも禁止する」への回答として、範囲を全providerに広げた。文言は「混ざらない」から「使わない」へ強める。

## ticket

POの定義：「旧HELIXのplanに責務集中しすぎているからそれを薄くして作業チケットとして発行する仕組み。駆動モデルに即したチケットが発行される仕組みで、フォワードは大、中、小のようにしたら複数人が作業してもできる。トラブルや局所的なものが発生したらリカバリーやインシデント、PoCみたいなのができて、それがイシューやPRに登録される仕組み」。

- **定義**：ticketは、OSの推進が発行する作業の単位である。駆動モデルはticketの種類で置き換える。各ticketは、駆動モデルに由来する進め方を、動的ワークフローとして中に持つ。
- **導出の分担**：HARNESSは、導出のためのコアを持つ。コアは、HELIX-JSONの定義と、JSONどうしの意味をつなぐPythonの意味導出コアである。BRAINはそこから判断し、OSはticketを導いて発行する。PO「OSが導出するためのJSONやPythonとかのコアじゃないの？これはブレインでOSがそこから導き出すんじゃないの？」。
- **Issueとの関係**：ticketが正で、Issueは映しである。Issueをcloseしても、ticketは完了にならない。
- **CIの導出**：ticketは、種類、対象（単体／接続／構成体）、親の要求と版、変更の範囲を持つ。検収は、そこから必要な検証を導いて動的にCIを組み立てる。PO「検証すべきものがチケット見たら出せるだろ？」。
- **発行方式**：
  - ticketは計画から導いて発行する。
  - トラブル系は、範囲と起きたことを入れると、種類・対象・親の要求が導かれて発行される。
  - 範囲が分からないときは、先にDiscoveryで範囲を明らかにする。
- **開発方式との区別**：Scrumは開発方式（枠）であり、駆動モデルではない。PO「スクラムは開発タイプの話で駆動モデルではない」。
- **Forwardの意味**：ForwardはVモデルのことではない。PO「開発タイプがスクラムなどでも規定の路線を走っているのがフォワード」。Forwardは、対象の大きさで大（構成体）・中（接続）・小（単体）に分ける。
- **種類**：Forwardの3種類と、それ以外の16種類である。
  - それ以外の16種類：Discovery、PoC、Prototype、DECIDE、Backflow、Reverse（Scrum Reverseを含む）、Recovery、Incident、Refactor、Design-refactor、Performance-refactor、Redesign、Retrofit、Research、Add-feature、Version-up。
  - 旧HELIXの確定版（`archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29-47`）を起点に、PO判断を加えた。
- **各種類についてのPO判断**：
  - Discovery：開発の途中で検証が必要になったときに発行する。PoCとは分ける。
  - Prototype：画面プロトの名称。
  - DECIDE：裁定のticketで、要求の確認や技術の選定をPR化して決める。
  - Research：参考ソースを集めるだけで、決定には関わらない。
  - Backflow：下流の結果を要求へ戻す。PoCやPrototypeの結果もBackflowで要求へ戻し、要求エンジンの2次形成を経てからDECIDEへ進む。
- **発行の区別**：突発的に発生するものと、計画的に発行できるものを分ける。
- 種類ごとの定義は、[OS L2](../../helix-os/L2-requirements/governance-requirements.md)のticket節に記録する。

## 要求ごとの判断

### HARNESS

| 要求 | POの判断 |
|---|---|
| HARNESS-L2-001 | L2.5を足して合意 |
| HARNESS-L2-002 | リリースカンバン方式を追加して合意 |
| HARNESS-L2-003 | L2.5に直して合意 |
| HARNESS-L2-004 | 「決める」ではなく「導出する」形式に直す |
| HARNESS-L2-005 | 導出と動的CIの形に直す。言語・toolに依存しない条件は保つ |
| HARNESS-L2-006 | サービス①〜⑦の単位で導入できるようにし、リリースカンバン上の状態も確認できるようにする |
| HARNESS-L2-007 | 土台7項目が全機構で共通に成立していることを、1.0の完成条件に足す |
| HARNESS-L2-008 | 要求エンジンは「設計パターンと接続して選択するための質問をなげる機構」である。1次要求形成と、画面プロトやPoCの還流による2次形成に分けて考える。Python coreは「意味導出の基盤として各JSON間を繋ぐ仕組み」とし、HELIX-JSONの構築で、TS系のCI導出コアとJSON間の意味を接続するPythonコアのような構成を想定する。これは改善要求として扱う |
| HARNESS-L2-009 | 上流へ戻す手段もticket（Backflow）にする |

### OS

| 要求 | POの判断 |
|---|---|
| HELIXOS-L2-001・003・009 | 現行のまま |
| HELIXOS-L2-002 | 提供の追跡にリリースカンバンを足す |
| HELIXOS-L2-004 | 4機構に分ける。割当てと進行統制はOS、割当て案はBRAIN、実行はRunner／Sandbox、自己承認の防止と制限はSecurity |
| HELIXOS-L2-005・013 | LABOの責務とする。PO「OSは推進機構、ラボは全体の改善研究機構」 |
| HELIXOS-L2-006 | サービス①〜⑦の単位で導入・更新・復旧できるようにする |
| HELIXOS-L2-007 | BASE-01の共通記録形式に揃える |
| HELIXOS-L2-008 | 動的CIの実行側として書き直す |
| HELIXOS-L2-010 | 推進が動的ワークフローを組み立てることを明記する |
| HELIXOS-L2-011 | 計画と実行を別の要求にし、境目を書く |
| HELIXOS-L2-012 | OSの独立要求から外す。PO「調査がOSに入ってるのがそもそも理解できない。要求を整理する前の話なのか、技術進化に追いつくための話なのか、責務が全然違う」。要求整理前や設計途中の調査は工程内の調査とし、技術進化への追従はBRAIN／LABOが担う |

### ticket候補文書

「要求から開発ticketを導く要求候補」（`docs/governance/candidates/development-ticket-derivation-requirements.md`、DTK 14件）について、POは「いらない」と判断した。
ticketの要求は、本記録のticket節から書き直す。

## 質問の仕方についてのPOの指摘

後続の判断を依頼するときも、同じように扱う。

- 件数をまとめて示さない。内訳に分けて聞く。
- 番号や「残り」で呼ばない。毎回、それ単体で分かる形で内容を示す。
- 質問する前に調べる。聞く用語は説明する。
- 勝手に進めない。判断はPOに聞く。

## revision変更時の扱い

本記録は、上表のSHA-256に対する回答である。対象bytesが変わった場合、それを新しいrevisionへ自動継承しない。
追記・縮約・書換えをしたrevisionは、PO最適ドラフトPRで対象revisionを示して確認する。
