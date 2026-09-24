---
title: "BRAIN・ヘリックスコア・原本の扱いに関するPO指示 decision record（2026-09-25）"
decision_record_id: HDEC-BRAIN-HELIX-CORE-2026-09-25
decision_status: recorded
decider_role: PO
decided_at: 2026-09-25
recorded_at: 2026-09-25
authority_effect: effective_when_this_record_is_admitted_to_main
follow_up: PO最適ドラフトPR（全要求を最終的に詰める後続PR）
---

# BRAIN・ヘリックスコア・原本の扱いに関するPO指示（2026-09-25）

## 記録の範囲

2026-09-25（Asia/Tokyo）のClaude作業sessionで、POが会話の中で示した指示と意図を記録する。
POの発言はそのまま引用する。AIの整理は、引用と区別して書く。
[Concept](../../concept/helix-concept.md)は、Conceptの運用（人の指示をAIが同じファイルへ反映する）に従い、本記録と同じPRで更新した。
本記録から、要求・要件の承認、L3凍結、実装許可、release、Issue closeを生成しない。

## POの発言

| 論点 | POの発言 |
|---|---|
| 設計テンプレの原本 | ハイブリッド設計ドキュメントについて「これをHELIXコアのベースにしてた」。「もしかしてスキルになってたり？」（調べた結果、スキルにはなっていなかった） |
| 設計パターンの導出 | 「それから設計パターンを導出するから多様な仕組み対応できるって感じになるのに」「それをJSONで管理してPythonで要求導出できる仕組みなんだよな」 |
| 要求で聞くこと | 「こういうシステムにはこういう設計が必要だから要求で聞いておこ。みたいな感じになるからそれを取り込む前提で念頭に置いてくれ」 |
| 設計ユニット・パーツ | 「設計ユニットやパーツって考え方で取り入れる感じ」 |
| OS | 「OSが推進機構だよな？チケット発行とかやるもの。OSは工程管理と推進をやるんだろ？OSはプロダクト単位の固有性を持つ」 |
| BRAIN | 「BRAINはプロダクト単位ではなくHELIX全体の汎用性を持たせる機構」「HELIX-BRAINは本来、こういう設計テンプレとかを学習して意味から構造を取り出す仕組みにしたい」 |
| Intelligence | 「IntelligenceはローカルLLMを使って判断の補助をする仕組み」。その後「HELIX-Intelligenceはヘリックスについて最も知っている部位にしよう。ローカルLLMに判断を依頼したり、バグbotやヘルプbot、クローラー発行をしてHELIX全体監査に寄せる」 |
| コネクタ接続の時期 | Intelligenceの導入版を問うたところ、「使う、というかHELIX-LABOを作るからBRAINもIntelligenceもコネクタ接続できるようにしておかないといけない」 |
| コアとBRAINの接続 | 「BRAINとHARNESSが持つヘリックスコア（プロダクト固有の意味/設計等）をコネクタで接続するほうがよくないか？ヘリックスコアのパターンからBRAINはまたパーツを増やしていけばどんどん賢くなるだろ？」 |
| 利点 | 「HELIX-webを展開したときにユーザーに対しての成果物がDesignならHTMLになるし、設計ならマークダウンになるし、実装ならきれいなコードになってJSON部分やPython部分を公に公開しなくて済むんだよ。ユーザーが作ったシステムの原本と正本の関係で原本をこちらで持てることになる」 |
| 原本の扱い | 「原本をこちらが保有するがあとで解体してパターン取り込みだけして原本破棄になる」 |
| 解体・破棄の内部要件 | 解体の境界、破棄の証拠、契機と期限について、「この辺のはなしっていらなくないか？別に見えないんだからよくね？cursorとかもやってるだろ」 |
| 利用規約での明示 | AIが「成果物から汎用パターンを取り込むことがある」と書く案を出したところ、「ここまで明記する必要はない。HARNESSの改善に利用することがありますぐらいだろ」 |

## Conceptへ反映した内容

- **HELIX-OS**：製品ごとの固有性を持ち、工程管理と推進を担う。
- **HELIX-BRAIN**：製品単位ではなく、HELIX全体に共通する汎用性を持つ。
  - 設計テンプレ等を学習し、意味から構造（設計パターン、設計ユニット・パーツ）を取り出す。
  - 各製品のヘリックスコアとコネクタで接続し、コアのパターンからパーツを増やす。
  - 製品固有の意味・設計は持たない。
- **1.0土台「後から加わる機構の受け口」**：1.0でHELIX-LABOを作るため、BRAINとIntelligenceを1.0からコネクタで接続できるようにしておく。
- **HELIX-Intelligence**：HELIXについて最も知っている部位。ローカルLLMに判断を依頼し、バグbot・ヘルプbot・クローラーを発行して、HELIX全体の監査に寄せる。
- **旧原則の置換**：「BRAINは考え、Intelligenceは育てる」を、上の役割分担を表す原則に置き換えた。
- **HARNESSのコア（ヘリックスコア）**：
  - 製品固有の意味と設計を持つ。
  - 意味と設計はHELIX-JSONで管理し、Pythonで要求を導出する。
  - BRAINとはコネクタで接続する。
- **設計パターン**：設計テンプレから設計パターンを導き、設計ユニット・パーツとして取り入れる。要求エンジンは、必要な入力を要求の段階で質問する。
- **HELIX-Webの成果物**：デザインはHTML、設計はMarkdown、実装はコードで渡す。JSONとPythonは公開しない。
- **原本**：
  - HELIXが保有し、後で解体してパターンだけを取り込んだうえで破棄する。
  - 解体・破棄の内部要件は立てない。
  - 利用規約には「HARNESSの改善に利用することがあります」程度を示す。

## 旧HELIXとの対応

- **ハイブリッド設計ドキュメント**：旧HELIXは`v1-fixed`版を移行元として扱った（`archive/legacy-generation-2026-09-14/root/docs/migration/source-manifests/hybrid-vmodel-source.v1.json`、`.../docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md`）。
  - 採用したのは21件で、catalogとprofilesは設計カバレッジの管理に使った。
  - 設計パターンを導出する仕組みには使っていない。
  - Design Template JSON authority（`.../docs/design/helix/L4-basic-design/design-template-json-authority.md`）は別の系統で作られ、両者は接続されなかった。
  - 本記録の方針はこの接続を前提にする。これは旧HELIXからの変更点である。
- **JSONを正本とし、Markdown・HTMLを生成する考え方**：旧Design Template JSON authorityの`GeneratedViewProjector`にある。これは保持する。

## 未確定の点

後続のPO最適ドラフトPRで確認する。

- **BRAINの稼働中の役割**：現行Conceptにある稼働中の役割（理解、計画、予測、診断、レビュー、配置案）を、BRAINに残すか、Intelligence・OSへ移すか。Conceptには残したまま、新しい役割を加えた。
- **コネクタの担当**：機構間の接続として新しく定めるか、HELIX-CONNECTが担うか。
- **用語「原本」「正本」**：POの発言にある「原本と正本の関係」の対応。AIは「原本＝HELIX側の意味と構造、正本＝利用者へ渡す成果物」と理解したが、POは確認していない。
- **Intelligenceの導入版**：BRAINとIntelligenceは1.0からコネクタで接続できるようにする（PO）。現行Conceptの版表では、Intelligenceは3.0で加わるとしている。Intelligenceの機能（バグbot・ヘルプbot・クローラーの発行、全体監査）をどの版から稼働させるかは未確定。
- **既存判断との整合**：
  - 2026-09-24の判断では、技術進化への追従（クローラー）をBRAIN／LABOが担うとしていた（旧HELIXOS-L2-012）。これをIntelligenceのクローラー発行と、どう分けるか。
  - HARNESS L2には、旧Bugbot候補由来の「限定修復の実行統制はHELIX-OS」という記述がある。これをIntelligenceのバグbot発行と、どう分けるか。
- **導入版と「学習」の意味**：BRAINが設計テンプレを学習する時期（導入版）と、ここでいう学習の意味（モデルの調整か、構造の蓄積か）。
- **既存記述との整合**：前日の判断「HARNESSは導出コアを持ち、BRAINはそこから判断する」（[2026-09-24 decision record](concept-requirement-po-decisions-2026-09-24.md)）と本記録の整理を、要求の文言でそろえること。
