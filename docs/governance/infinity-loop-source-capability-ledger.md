---
title: "HELIX Infinity Loop source capability採否台帳"
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
source_gate: HIL-FR-21/HIL-FR-22
---

# HELIX Infinity Loop source capability採否台帳

## §0 完全性契約

本台帳は、sourceを読んだことではなく、source内のcapabilityをHELIXの要件、基本設計、テスト、Gateへ
結線したことを証明する。`pending`、source pathなし、根拠なしreject、HIL IDなし、testなしの行が1件でも
残る間は、PLAN-L1-07のpair-freezeを許可しない。

判定語彙は`adopt / harden / redesign / reject / absorbed / pending`とする。複数機能を一つの代表行で
合格させず、engine/detectorは実行単位へ分解する。生成済みfixtureもsource集合から除外せず、
runtime capabilityとは別の`regression_fixture`分類で追跡する。

## §0.1 chat一次要求台帳

chatはZIP/旧UTより上位の一次要求sourceである。要約へ吸収して行を落とさず、独立した要求単位を
`HC-CHAT-*`として採番する。`mapped`は要件IDが存在するだけであり、L4/HOT/Gateの実装完了を意味しない。
commit後は本ファイルのblob digestをchat要求snapshot bindingとして扱い、後続chat deltaは既存行のsilent rewriteではなく
新規行または`supersedes`で追加する。

意味単位への分解だけでは発言の存在証拠にならないため、§0.2の`CHAT-U-*`を発言occurrence台帳とする。
同じ要求の再指示も削除せず、既存`HC-CHAT-*`への再確認として別occurrenceを残す。

| chat ID | chat要求（意味を保持した記録） | HIL requirement | L4 block | HOT | coverage |
|---|---|---|---|---|---|
| HC-CHAT-001 | 将来のデータ駆動HARNESSとしてproduct dataと連携する | HIL-BR-15、HIL-FR-23/24 | §8 product-data | HOT-HIL-21/22 | mapped |
| HC-CHAT-002 | Pythonを第一級runtimeとして取り入れ、TS/Nodeと役割分離する | HIL-TR-02/03/07..10、HIL-FR-27 | §1/§2 | HOT-HIL-11/23/24 | mapped |
| HC-CHAT-003 | Bun依存を是正しNode化する | HIL-BR-19、HIL-TR-01/11、HIL-FR-33 | §10 cutover | HOT-HIL-25 | mapped |
| HC-CHAT-004 | Windowsライク前提を外し、Linux中心のmulti-OS対応にする | HIL-TR-04..06、HIL-FR-34、HIL-NFR-19 | §11 OS adapter | HOT-HIL-12/26 | mapped |
| HC-CHAT-005 | 現内部CIは多くが落ちるため一旦隔離し、旧UTの検証logicを参照して再構築する | HIL-BR-20、HIL-FR-29、HIL-NFR-16 | §3/§10 | HOT-HIL-28 | mapped |
| HC-CHAT-006 | Codexを要件確定後の自動推進/実行engineとし、Claude Codeをユーザー指示・監査・改善側にする | HIL-BR-01、HIL-NFR-02 | §1/§3 | HOT-HIL-01/14 | mapped |
| HC-CHAT-007 | Claude Code hookでCodexのPRを検出し監査/改善eventを起動する | HIL-BR-02、HIL-FR-02 | §1 GitHub bridge | HOT-HIL-01 | mapped |
| HC-CHAT-008 | 監査findingからIssueを立て、HARNESS memoryへ記録し、Codexが設計判断して再実装するW-agent loop | HIL-BR-17、HIL-FR-09/10/30 | §3 finding loop | HOT-HIL-29 | mapped |
| HC-CHAT-009 | Codexは設計文書を見て実装し、ClaudeはDBの依存/接続をメタ監査する視点分離 | HIL-FR-08/09、HIL-NFR-02 | §1 runtime separation | HOT-HIL-08/14 | mapped |
| HC-CHAT-010 | ユーザー指示をClaude側でIssue/PLAN化し、memoryまたはGitHubからCodex intakeへ渡す | HIL-BR-12、HIL-FR-03/30 | §1 Intake | HOT-HIL-08/29 | mapped |
| HC-CHAT-011 | 全Issueを駆動モデルとUniversal Reverseのpairにし、例外なく処理する | HIL-BR-04、HIL-FR-04、HIL-NFR-03 | §3/§4 Reverse Gate | HOT-HIL-03 | mapped |
| HC-CHAT-012 | Reverseの処理量を省かない。省くと証拠が出ないため強制機構にする | HIL-NFR-03、HIL-FR-04 | §3 Reverse invariant | HOT-HIL-03 | mapped |
| HC-CHAT-013 | ReverseはForward合流前かつ実装前の先タスクにする | HIL-BR-04、HIL-FR-01/08 | §3 state machine | HOT-HIL-03/27 | mapped |
| HC-CHAT-014 | 設計修正後にForward実装する場合は第一級Redesign駆動モデルを追加する | HIL-BR-05、HIL-FR-05/31 | §3 Redesign | HOT-HIL-04/30/31 | mapped |
| HC-CHAT-015 | Forward合流前簡易CI→合流後内部CI→GitHub外部CI/PRの順にする | HIL-BR-16、HIL-FR-28、HIL-NFR-15 | §3 staged CI | HOT-HIL-27 | mapped |
| HC-CHAT-016 | Issue蓄積と実装logからForward設計判断、skill生成、設計document coverageを永続改善する | HIL-BR-11、HIL-FR-14 | §1 learning promotion、L5 `memory-learning-promotion.md` §5、L6同名設計§2 | HOT-HIL-09 | design-lowered: `design_coverage_delta`と同一分母before/afterをL5/L6へ降下済み（実装未完） |
| HC-CHAT-017 | 工程/taskに連動してHELIX subagentを動的生成し、旧UTを参照する | HIL-BR-09/18、HIL-FR-11..13/32 | §7 agent lifecycle | HOT-HIL-07/32/33 | mapped |
| HC-CHAT-018 | subagent定義をruntime siloでなくHARNESS所有の標準として保持する | HIL-BR-09/18、HIL-NFR-10、HIL-FR-11/12/32 | §7 registry | HOT-HIL-07/32 | mapped |
| HC-CHAT-019 | 既存HARNESSの検出機構とengineを強化し、強制力を上げる | HIL-FR-15/25/26、HIL-NFR-08/13 | §1/§6 detector | HOT-HIL-10/23 | mapped |
| HC-CHAT-020 | Codex完了時のmemory圧縮責務をClaude Codeが担う | HIL-BR-03、HIL-FR-10 | §1 compactor | HOT-HIL-02 | mapped |
| HC-CHAT-021 | AIにIssueを無駄として落とされない機械的Issue Gateを作る | HIL-BR-06/07、HIL-FR-03..08 | §4 gate matrix | HOT-HIL-03..05 | mapped |
| HC-CHAT-022 | acceptanceに不要な機能拡張を機械的に防ぐ | HIL-BR-08、HIL-FR-06、HIL-NFR-07 | §4 Scope Gate | HOT-HIL-06 | mapped |
| HC-CHAT-023 | Forwardを正とし、横軸を監査/改善⇔Gate⇔自動走行のInfinity Loopにする | HIL-BR-01/10、HIL-FR-01 | §0/§3 | HOT-HIL-08/13 | mapped |
| HC-CHAT-024 | `ハイブリッド設計ドキュメントv1-fixed.zip`のcore engineと検出system/databaseを抽出採用する | HIL-FR-15/21/22/25/26、HIL-TR-10 | §5/§6 | HOT-HIL-10/19/20/23 | mapped |
| HC-CHAT-025 | `unison-ai-product/UT-TDD_AGENT-HARNESS`を全branch込みで検査して採用を強化する | HIL-FR-16/21/22 | §5 source coverage | HOT-HIL-10/20 | mapped |
| HC-CHAT-026 | 現行資産を全棚卸しする | HIL-FR-16/21/22、HIL-NFR-12 | §5 source coverage | HOT-HIL-10/20 | mapped |
| HC-CHAT-027 | 確定に必要な基本設計は要件定義と並行して実施する | PLAN-L1-07 §2、L4本書 | L4全節＋19 slice registry | L4 trace review／quartet progress receipt | in-progress: receipt未完 |
| HC-CHAT-028 | 画面対象ではprototype作成/walkthroughで潜在要求を引き出した後に要件をfreezeする | HIL-BR-13、HIL-FR-17..20 | §9 applicability | HOT-HIL-17/18 | mapped |
| HC-CHAT-029 | 今回はHARNESS構築で画面要求なし。ただし暗黙省略でなく明示skipする | HIL-BR-13、HIL-FR-17/20、HIL-NFR-11 | §9 no-UI receipt | HOT-HIL-16 | mapped |
| HC-CHAT-030 | ZIPにもあるcapabilityを見落とさず、抽出→採否→要件→設計→test→Gateを強制する | HIL-BR-14、HIL-FR-21/22、HIL-NFR-12 | §5 coverage Gate | HOT-HIL-19/20 | mapped |
| HC-CHAT-031 | chat内の全要求も台帳へ入れ、見落としを許さない | HIL-BR-14/23/24、HIL-FR-22/36、HIL-NFR-27 | 本§0.1/§0.2、PLAN-L1-07 §4、L3 HR-FR-HIL-01/17、HDS-HIL-01/05/17 | HOT-HIL-19/20/36/42/43、source ledger lint／occurrence逆引きlint（未実装） | in-progress |
| HC-CHAT-032 | 時間をかけても確実に行い、代表サンプルや推測で完了にしない | HIL-NFR-08/12 | §5 completeness | HOT-HIL-19/20 | mapped |
| HC-CHAT-033 | subagentを利用可能slot最大で並列利用し、全体/項目別進捗を百分率で報告する | execution contract（本PLAN agent slots/進捗報告） | CHAT-U-024、orchestration evidence | session/agent receipt＋固定分母progress receipt | in-progress: receipt未完 |
| HC-CHAT-034 | 設計自体に外部化、共通化、オブジェクト化を行う設計リファクタリング概念を入れる | HIL-BR-21、HIL-FR-39、HIL-NFR-24 | §4.3 Design Refactor | HOT-HIL-39、HST-HIL-025 | mapped |
| HC-CHAT-035 | 関数の意味的類似性または名称衝突を根拠にrenameを提案し、似た名前だけの誤判定を防ぐ | HIL-FR-39、HIL-NFR-24 | §4.3 semantic rename | HOT-HIL-39、HST-HIL-025 | mapped |
| HC-CHAT-036 | DDD domain object型設計と命名catalogを用いて責務/invariantを明確化し、実装symbolとtest oracleを分離可能にする | HIL-BR-21、HIL-FR-40、HIL-NFR-25 | §4.4 Domain Object/Naming | HOT-HIL-40、HST-HIL-026 | mapped |
| HC-CHAT-037 | 実装規則より弱い設計規則を強化し、設計templateを要求系統/service系統へ結んで設計漏れを機械排除する | HIL-BR-22、HIL-FR-41、HIL-FR-42、HIL-NFR-26 | §4.6 Design Obligation Graph | HOT-HIL-41、HST-HIL-027 | mapped |
| HC-CHAT-038 | Requirement Translator subagentで要求を原子化し、templateに表現できない要求をTemplate Gap Issueとしてtemplate改善loopへ戻す | HIL-BR-23、HIL-FR-43、HIL-FR-44、HIL-NFR-27 | §4.7 Requirement Translator / Template Improvement | HOT-HIL-42、HST-HIL-028 | mapped |
| HC-CHAT-039 | 要件定義自体を設計台帳化し、原文/atom/authority/oracle/service/template/obligation/revisionと変更判断を正本化する | HIL-BR-24、HIL-FR-45、HIL-NFR-28 | §4.5 Requirement Definition Ledger | HOT-HIL-43、HST-HIL-029 | mapped |
| HC-CHAT-040 | L0–L14の各Lへ連鎖台帳を置き、templateから機械抽出・追加記載・台帳ベース設計refactorを行い、上下隣接pairと左右V-pairの両方を必須にする | HIL-BR-25、HIL-FR-46..50、HIL-NFR-29 | §4.8 Layer Ledger Chain | HOT-HIL-44..47、HST-HIL-030..033 | mapped |
| HC-CHAT-041 | 設計完了率を固定分母で可視化し、成果物作成、独立監査、pair freeze、実装検証を混同せず個別に報告する | HIL-NFR-28、HIL-NFR-29 | design slice registry §2/§3、design progress ledger | generated progress receipt、pair freeze receipt | in-progress: receipt未完 |

chatから意味要求41件を捕捉したが、hosted chat surfaceはevent ID、raw content digest、安定timestampをrepoへ公開していない。
したがってraw transcriptに対する未採番0件は未証明である。product要求38件はHILへ、当該作業だけの
`HC-CHAT-027/033/041`はexecution contractへmappingした。§0.2は現在の会話surfaceで参照できる23発言と
current user-provided `/goal objective` 1件をexact保存するが、
非表示またはcontext圧縮済み発言の完全manifestとは主張しない。PO確認またはnative transcript manifestなしに
38/38完全性を主張しない。

## §0.2 chat発言occurrence台帳

capture scopeは、2026-07-15の現在の会話surfaceで本文を参照できたユーザー発言である。本文は表へ要約せず、
以下の引用blockに保持する。`native_event_id`とsource timestampはsurface非公開のため`unavailable`とし、
台帳内sequenceを代替識別子にしない。後続発言は追記し、同義であっても既存occurrenceを上書きしない。

### CHAT-U-001

- native_event_id: `unavailable`
- maps_to: `HC-CHAT-001`、`HC-CHAT-002`、`HC-CHAT-003`

> 将来的にデータ駆動のHARNESSとしてプロダクトデータと連携する仕組みを構想しているんだけどPython化をしたいんだよね。あとBunがあまりよろしくないからこれ是正してノード化したいんだけどいけるかな？

### CHAT-U-002

- native_event_id: `unavailable`
- maps_to: `HC-CHAT-005`

> ふむ。あと内部のCIが多分ほぼ全部落ちるからいったん無視してあとでもとのUTハーネスのロジックを参考に改修するほうがROIが高いと思われる。

### CHAT-U-003

- native_event_id: `unavailable`
- maps_to: investigation directive

> 確認してどこから手を入れるか目測を立ててくれる？

### CHAT-U-004

- native_event_id: `unavailable`
- maps_to: `HC-CHAT-027`

> ちょっとね、やばい構想を思いついてしまってね。要件定義からやらない？って提案なのだけど。

### CHAT-U-005

- native_event_id: `unavailable`
- maps_to: `HC-CHAT-006`から`HC-CHAT-019`

> ①ClaudeCode＋Codexを使った循環型実行監査システム化
> Codexを要件定義以降の自動推進エンジンとしてL3以降のUIデザインを除くすべての実行。ClaudeCode側はユーザーの指示と監査と改善を司る。
> ②ギットハブ連動イベント駆動監査システム
> Codexが実装してPRを出してClaudeCodeはhookで検出する⇒PR対応をして同時に監査/改善イベント発動⇒イシューを立ち上げてハーネスメモリに記載⇒Codexがイシューから設計判断をして実装をWエージェントループをする。
> ③実行/監査の視点分離
> Codexは設計ドキュメントを見ながら実装する⇒ClaudeCodeはデータベースを見ながら依存関係や接続関係の監査、メタ視点で外部設計や詳細設計レベルでの改善を見つけ出す。
> ④ユーザー差し込みイシュー＆プラン
> ClaudeCode側でユーザーが指示をしてイシューやプランをClaudeCodeに書かせてハーネスメモリに記載またはギットハブから拾って実装対応をする。
> ⑤駆動モデル連動イシュー
> イシューは駆動モデルに連動して強制的にリバースとペアにして、フォワード合流前に簡易CI検証⇒フォワード合流後CI⇒ギットハブ側外部CIプルリクエストへ
> ⑥イシュー駆動側の永続スキル改善
> イシューをため込みフォワードの設計判断を強化。実装ログシステム化してスキル生成システムや設計ドキュメントカバレッジ強化へ
> ⑦工程/タスク連動型動的サブエージェント生成
> 工程表と連動してヘリックスサブエージェントを連動生成。詳細はUTハーネスを参考に。
>
> あとは既存のUTハーネスの検出機構や現行エンジンの強化改善と強制力強化の方針。ざっくり整理して最もAI単独で完璧に自走できそうな想定がこれ。

### CHAT-U-006

- native_event_id: `unavailable`
- maps_to: `HC-CHAT-012`から`HC-CHAT-015`、`HC-CHAT-020`

> ClaudeCode拡張ならhookでPRを拾えるのが実際わかってる。Codex完了時のメモリ圧縮責務も負う感じだな。リバースは既存の駆動モデルとのペアになる。処理量は省かない。ここを省くと証拠がでない。だから強制機構になる。ただし、リバースは実装がフォワード合流前の先タスクとする。設計修正でフォワードで実装の場合はリデザインという駆動モデルを追加して対応する。あとUTハーネスをちゃんと見てこい。勝手に想像でやんな。

### CHAT-U-007

- native_event_id: `unavailable`
- maps_to: concept confirmation

> かなり強くなりそうだろ？

### CHAT-U-008

- native_event_id: `unavailable`
- maps_to: `HC-CHAT-021`

> イシューゲートみたいなの作れないかな？AIに依頼するとこれ無駄に落とされかねないからできれば機械的に。

### CHAT-U-009

- native_event_id: `unavailable`
- maps_to: `HC-CHAT-022`

> あとは無駄な機能拡張な。

### CHAT-U-010

- native_event_id: `unavailable`
- maps_to: `HC-CHAT-023`

> ヘリックスの名前をもじってフォワードを正としたときの横軸のインフィニティループだな。∞を監査/改善⇔ゲート⇔自動走行の。

### CHAT-U-011

- native_event_id: `unavailable`
- maps_to: `HC-CHAT-028`

> ところでさ、画面要求（プロトモデル作成）に作成工程入ってなくないか？

### CHAT-U-012

- native_event_id: `unavailable`
- maps_to: `HC-CHAT-028`

> 画面プロト作成後に要件定義のはずなのにすっ飛ばしているよね？

### CHAT-U-013

- native_event_id: `unavailable`
- maps_to: `HC-CHAT-029`

> HARNESS構築だから画面要求はないけども、明示的にスキップするのとそうじゃないのは意味が違うんだけど。

### CHAT-U-014

- native_event_id: `unavailable`
- maps_to: `HC-CHAT-030`、`HC-CHAT-032`

> ハイブリッド設計ドキュメントカバレッジのZIPにもあるよな？こういうのを絶対に見落とすなよ。だからゲートを強化しないといけないのを理解しろよ。

### CHAT-U-015

- native_event_id: `unavailable`
- maps_to: `HC-CHAT-031`（再確認、要求強度を維持）

> chatの内容も台帳に入れろよ。

### CHAT-U-016

- native_event_id: `unavailable`
- maps_to: `HC-CHAT-034`

> ちょっと疑問なんだけど、設計自体に設計リファクタリングって概念入れれるかな？外部化、共通化、オブジェクト化みたいな。

### CHAT-U-017

- native_event_id: `unavailable`
- maps_to: `HC-CHAT-035`（`HC-CHAT-034`のrename判定詳細）

> 関数類似性が近いから名称を変えようみたいにする感じで、名称似てるから変えようとか。

### CHAT-U-018

- native_event_id: `unavailable`
- maps_to: `HC-CHAT-036`

> DDDオブジェクト型設計だっけ？古い概念だけどきれいに回せそう。命名ルールとかも作るとテストと実装を分けやすかったり。

### CHAT-U-019

- native_event_id: `unavailable`
- maps_to: `HC-CHAT-037`

> 実装面では結構ルールが引かれているけど、設計面のルールは若干弱いんじゃないかな？あとは設計テンプレートと要求系統やサービス系統で紐づけたり。そうすると、設計漏れがそもそもなくならないか？

### CHAT-U-020

- source: このchat（PO発言、2026-07-15）
- exact: `要求翻訳サブエージェントみたいなのできるかな？テンプレートになければテンプレート改善に回すループみたいな。`
- maps_to: `HC-CHAT-038`

### CHAT-U-021

- source: このchat（PO発言、2026-07-15）
- exact: `要件定義の設計台帳化は？`
- maps_to: `HC-CHAT-039`

### CHAT-U-022

- source: このchat（PO発言、2026-07-15）
- exact: `各Lで下の台帳を作る連鎖台帳設計で、テンプレート抽出からの機械抽出、追加記載、台帳ベース設計リファクタリングを入れるのはどうだろうか？これが上下ペアと左右ペアならないといけないみたいな。`
- maps_to: `HC-CHAT-040`

### CHAT-U-023

- source: このchat（PO発言、2026-07-15）
- exact: `設計完了率は見えているのかい？`
- maps_to: `HC-CHAT-041`

### CHAT-U-024

- source: このchatのuser-provided `/goal objective`（2026-07-15）
- native_event_id: `unavailable`
- exact:

```text
Python＋TS/node化（脱Bun）、脱WindowsライクからLinux中心のマルチOS対応。サブエージェントのHARNESS保持標準化。自己改善＋自己監査のヘリックスインフィニティループを含めたチャット内のすべての要件、ハイブリッド設計ドキュメントv1-fixed.zipのコアエンジン＋検出システムデータベース、unison-ai-product/UT-TDD_AGENT-HARNESSのブランチ含めた全検査からの抽出採用強化、既存資産の全棚卸し。確定に基本設計が必要な場合は平行して実施して要件定義書を固める。見落としは一切許さない。時間をかけてもいいが確実にやること。

サブエージェントをスロットMAXで使って効率よく実施して全体進捗と各項目の進捗を％で報告する。
```
- maps_to: `HC-CHAT-002`、`HC-CHAT-003`、`HC-CHAT-004`、`HC-CHAT-016`、`HC-CHAT-018`、`HC-CHAT-023`、`HC-CHAT-024`、`HC-CHAT-025`、`HC-CHAT-026`、`HC-CHAT-027`、`HC-CHAT-031`、`HC-CHAT-032`、`HC-CHAT-033`

## §1 source snapshot台帳

### §1.1 ハイブリッド設計文書ZIP

- source: `ハイブリッド設計ドキュメントv1-fixed.zip`
- SHA-256: `9c547ba8bc9eaf3a12f27254fd3eb6d04b37fb8c899f13d56ceb0d2cff179fb3`
- inspection root: `/tmp/hybrid-docgen-v1-fixed/hybrid-docgen`（read-only展開。product runtime pathではない）
- file count: **703**
- 全entry path＋contentの合成SHA-256: `eb1d3238a833d7eb65ce92a2fae5c946f500f249b23c9d0d91a86b5111542cc5`
- 展開size: **10,373,451 bytes**
- source自己診断: 17/17 pass、統合detect: 11/11 green。ただしprototype/skip receipt 0件でもgreenになるため、完全性Gateの合格証拠には使用不可。

| top-level group | file count | 分類 | 台帳上の扱い |
|---|---:|---|---|
| `.claude/` | 16 | workflow/authoring/review skill | skill semanticsとして個別抽出 |
| `.github/` | 1 | CI gate | CI policy候補 |
| `.vscode/` | 3 | editor adapter | portability判定対象 |
| `api/` | 1 | OpenAPI fixture | schema/trace用fixture |
| `build/` | 427 | generated xlsx/md/png/review/signal | regression fixture。runtime実装数へ二重計上しない |
| `docs/` | 139 | source document/data/spec/ADR | document catalogと意味契約へ分解 |
| `schema/` | 2 | document/spec JSON schema | schema engine入力 |
| `scripts/` | 1 | pre-commit hook | hook hardening候補 |
| `templates/` | 77 | source template | catalog/coverage対象 |
| `tools/` | 29 | Python engine/detector | 各fileを独立capabilityとして採否 |
| root policy/docs/config | 7 | policy/setup/dependency | source boundaryとdistribution候補 |
| **合計** | **703** | — | top-level未分類 **0** |

この703件の集合はZIP digestへbindする。entryの増減またはdigest変更時は本節と全capability receiptをstale化する。

### §1.2 旧UT全remote branch

inspection clone: `/tmp/ut-harness-inspect`（read-only）。`origin` symbolic refは`origin/main`と同一commitのため
branch数へ二重計上しない。

| remote ref | commit SHA | 固有差分の一次分類 | 状態 |
|---|---|---|---|
| `origin/main` | `e506a67e9c243cc9781ff4a6d8d1870b072fd37b` | route filing、Issue queue、memory、team/agent、Reverse | semantic inventory中 |
| `origin/work/l6-81-agent-registry-design` | `ffb13d6c87b3903fbef89d4632b04b1267ecd772` | HARNESS agent registry/runtime projection/muster | semantic inventory中 |
| `origin/work/l6-82-universal-pr-trigger` | `9bcdbe5af48345af13485c1d098390cd4de935bc` | 全PR trigger/github-ci-policy fail-close | semantic inventory中 |
| `origin/work/l7-418-plan-asset-v2` | `a588981b4d580ad78f1534bc47fc065ddb5cef01` | evidence producer auth/lease/custody/re-entry | semantic inventory中 |
| `origin/work/l7-421-test-hygiene-live-tree-fence` | `c163e6e5d4ec41c8b5192355e10cc5cc88102e50` | test hygiene/live-tree fence。固有差分0でもabsorbed根拠必須 | semantic inventory中 |

### §1.3 現行HELIX

現行sourceはcommit SHA、tracked tree、uncommitted foreign workを分離する。正式baselineはcommit/push済HEADであり、
他runtimeの作業中変更を現行capabilityとして誤採用しない。symbol/doc/testの完全manifestは本台帳の後続節で
source pathとtest pathをjoinする。

## §2 ZIP Python engine/detector全29 file

本節の`採否`はfile単位の**preliminary disposition**であり、HIL-FR-22のcurrent atomic decisionではない。
全行がatom ID、source span、semantic signature、decision reason、design/test/gate edgeを欠くため、入力/出力/副作用/
failureと既存HELIX重複を原子化し終えるまで機械状態は`pending`、covered weightは0とする。

| 能力ID | source | capability | 配置候補 | 採否 | HIL trace |
|---|---|---|---|---|---|
| HZ-TOOL-001 | `tools/activation.py` | profile/feature activation | Python data | harden（強化） | HIL-FR-15/22/25 |
| HZ-TOOL-002 | `tools/agent_docs.py` | agent向け文書材料化 | Python document | adopt（採用） | HIL-FR-15/22/25 |
| HZ-TOOL-003 | `tools/agent_meta.py` | `defines/read_first/done_when`導出・検証 | Python detector | harden（強化） | HIL-FR-15/22 |
| HZ-TOOL-004 | `tools/assign.py` | 実行割当台帳 | Python analysis | redesign（再設計） | HIL-FR-15/22/25 |
| HZ-TOOL-005 | `tools/build.py` | source→validate→derive→render orchestration | Python document | redesign（再設計） | HIL-FR-15/22 |
| HZ-TOOL-006 | `tools/consistency.py` | 設計間整合検出 | Python detector | harden（強化） | HIL-FR-15/22 |
| HZ-TOOL-007 | `tools/derive_traces.py` | trace edge導出 | Python analysis | harden（強化） | HIL-FR-15/22 |
| HZ-TOOL-008 | `tools/diagram_dsl.py` | diagram/wireframe DSL | Python document | harden（強化） | HIL-FR-15/18/22/25 |
| HZ-TOOL-009 | `tools/diff_report.py` | source/build差分report | Python detector | adopt（採用） | HIL-FR-15/22/25 |
| HZ-TOOL-010 | `tools/export_sheets.py` | spreadsheet export | optional integration | pending（reject候補。non-goal/反証/gate未結線） | HIL-FR-15/22 |
| HZ-TOOL-011 | `tools/fix_names.py` | legacy filename補正 | migration-only | harden（強化） | HIL-FR-16/22 |
| HZ-TOOL-012 | `tools/hook_gate.py` | hookからgate起動 | adapter | redesign（再設計） | HIL-FR-02/22 |
| HZ-TOOL-013 | `tools/id_utils.py` | typed ID utility | Python core | adopt（採用） | HIL-FR-15/22/25 |
| HZ-TOOL-014 | `tools/impact.py` | impact graph/query | Python analysis | harden（強化） | HIL-FR-09/15/22 |
| HZ-TOOL-015 | `tools/md_export.py` | Markdown export | Python document | adopt（採用） | HIL-FR-15/22/25 |
| HZ-TOOL-016 | `tools/package.py` | generated bundle packaging | Python document | adopt（採用） | HIL-FR-15/22/25 |
| HZ-TOOL-017 | `tools/render.py` | document rendering | Python document | adopt（採用） | HIL-FR-15/22/25 |
| HZ-TOOL-018 | `tools/review.py` | structured review record | Python analysis | harden（強化） | HIL-FR-09/15/22/25 |
| HZ-TOOL-019 | `tools/schedule.py` | L/WBS schedule projection | Python analysis | harden（強化） | HIL-FR-13/15/22/25 |
| HZ-TOOL-020 | `tools/schema_check.py` | JSON/YAML schema検査 | Python detector | harden（強化） | HIL-FR-15/22 |
| HZ-TOOL-021 | `tools/scope.py` | source scope列挙 | Python core | redesign（再設計） | HIL-FR-06/16/17/21/22 |
| HZ-TOOL-022 | `tools/selftest.py` | engine self-test | verification | harden（強化） | HIL-FR-15/22/25/26 |
| HZ-TOOL-023 | `tools/spec_check.py` | typed spec検査 | Python detector | harden（強化） | HIL-FR-15/22 |
| HZ-TOOL-024 | `tools/spec_trace.py` | spec↔feature trace検査 | Python detector | harden（強化） | HIL-FR-15/22 |
| HZ-TOOL-025 | `tools/spec_types.py` | typed spec model | Python core | harden（強化） | HIL-FR-15/22 |
| HZ-TOOL-026 | `tools/style.py` | workbook/doc style | Python document | adopt（採用） | HIL-FR-15/22/25 |
| HZ-TOOL-027 | `tools/util.py` | shared utility | Python core | pending（absorbed候補。absorbed_by atom未確定） | HIL-FR-15/22/25 |
| HZ-TOOL-028 | `tools/validate.py` | document validation composition | Python detector | harden（強化） | HIL-FR-15/22 |
| HZ-TOOL-029 | `tools/verify_files.py` | expected file completeness | Python detector | harden（強化） | HIL-FR-15/21/22 |

## §3 source横断capability

本節はaggregate parentの探索台帳であり、各行のcovered weightは0である。表中decisionは子atomへ継承せず、
子ごとのcurrent decisionが閉じるまでpreliminary dispositionとしてのみ扱う。

| capability ID | source | capability | decision | 要求/Gate接続 | 未完了証拠 |
|---|---|---|---|---|---|
| HZ-CAP-001 | `docs/107_Vモデル・レベル定義.yaml:142,167,185-186` | 画面先行、prototype合意、evolutionary UI、throwaway stub | harden（強化） | HIL-BR-13、HIL-FR-17..20 | no-UI frontmatter draftのみ。DB receipt/Gate検証は未実装 |
| HZ-CAP-002 | `ハーネス導入ガイド.md:108,179` | 合意なきL3 freeze禁止、assign証跡 | harden（強化） | HIL-FR-20/22 | detector/DB receipt未設計 |
| HZ-CAP-003 | `docs/wbs.yaml:46` | 要求を画面prototypeから引き出す | harden（強化） | HIL-BR-13 | task生成未設計 |
| HZ-CAP-004 | `docs/51_画面検証(UIテスト)設計.yaml` | prototype/9状態/visual/a11y検証 | harden（強化） | HIL-FR-18..20 | fixture schema未設計 |
| HZ-CAP-005 | `.claude/skills/vmodel-workflow/SKILL.md` | V-model実行表 | redesign（再設計） | HIL-FR-20/22 | 作成工程が無く合意工程から開始する欠陥 |
| HZ-CAP-006 | `templates/diagrams.yaml` + `tools/diagram_dsl.py` | Low-Fi wireframe生成 | adopt（採用） | HIL-FR-18 | 操作可能prototypeの代替にはしない |
| HZ-CAP-007 | `docs/catalog.yaml` + 123系文書source/template/build | document catalog/coverage | harden（強化） | HIL-FR-15/21/22/25 | capability単位のapplicabilityへ再設計が必要 |
| HZ-CAP-008 | `schema/*.json` + `tools/schema_check.py` | typed document/spec schema | harden（強化） | HIL-FR-15/22 | HELIX canonical schema mapping未設計 |
| HZ-CAP-009 | `docs/specs/*.feature` + spec tools | BDD/spec trace fixture | adopt（採用） | HIL-FR-15/22 | regression fixture binding未設計 |
| HZ-CAP-010 | `build/**` 427 files | generated regression corpus | pending（fixture採用候補） | HIL-FR-15/21/22 | 427 fixture別producer/input/version/consumer assertion未結線 |
| HZ-CAP-011 | `.claude/skills/vmodel-*` 7件 | V-model authoring/judgment/test/review skill pack | harden（強化） | HIL-FR-14/22 | HARNESS skill registryへcurate未実施 |
| HZ-CAP-012 | `.claude/skills/scrum-*` 8件 | Scrum authoring/splitting/review/workflow skill pack | harden（強化） | HIL-FR-14/22 | HARNESS skill registryへcurate未実施 |
| HZ-CAP-013 | `docs/110`〜`122` + BDD fixtures | V/Scrum hybrid lifecycle assets | harden（強化） | HIL-FR-14/22 | 現行workflowとの差分採否未結線 |
| HZ-CAP-014 | `.vscode/**` + root onboarding docs | IDE/onboarding adapter | harden（強化） | HIL-FR-16/22/33/34 | Linux-primary/Node distributionへ未結線 |

## §4 旧UT branch capability

本節もbranch/file aggregateの探索台帳で、covered weightは0である。52 branch delta fileとmain baselineから
behavior atomを抽出し、個別decisionへ分解するまで採否確定とは扱わない。

| capability ID | source ref | capability | decision | HIL trace | 未完了証拠 |
|---|---|---|---|---|---|
| HU-CAP-001 | `origin/main` | routeFiling mode/kind/layer/pairing obligation | harden（強化） | HIL-FR-01/03/04/05 | Redesign/Universal Reverse schemaへ統合未設計 |
| HU-CAP-002 | `origin/main` | issue queue/intake | redesign（再設計） | HIL-FR-03/08 | dry-run/human前提を自走Gateへ強化未設計 |
| HU-CAP-003 | `origin/main` | memory promotion | harden（強化） | HIL-FR-10/14 | Claude compactor責務との境界未設計 |
| HU-CAP-004 | `origin/main` | `screen-driven-requirements` | harden（強化） | HIL-BR-13、HIL-FR-17..20 | 孤立skillからGateへの結線未実装 |
| HU-CAP-005 | `origin/work/l6-81-agent-registry-design` | HARNESS registry/runtime projection/blind/muster | harden（強化） | HIL-FR-11..13 | current registry差分のsymbol ledger待ち |
| HU-CAP-006 | `origin/work/l6-82-universal-pr-trigger` | 全PR trigger + CI policy fail-close | adopt（採用） | HIL-BR-02、HIL-FR-02 | Claude hook payload設計待ち |
| HU-CAP-007 | `origin/work/l7-418-plan-asset-v2` | producer auth/lease/custody/re-entry | harden（強化） | HIL-FR-03/07/08 | Issue/evidence DB schema待ち |
| HU-CAP-008 | `origin/work/l7-421-test-hygiene-live-tree-fence` | detached snapshot/live-tree test hygiene | harden（強化） | HIL-FR-16/22/33/34 | branchは旧mainへ吸収済みだが現行HELIXには主要実体が無い |

### §4.1 旧mainと現行HELIXの差分探索証拠

- 旧main: 1,784 files。
- 現行で同一pathあり: 836/1,784 (46.9%)。同一bytes: 56/1,784 (3.1%)。
- `src/`: 165/272 path一致 (60.7%)、`tests/`: 123/208 path一致 (59.1%)。
- 完全欠落群: `disposition 0/8`、`elicitation 0/2`、`plan-asset 0/15`、`profile 0/2`、
  `projection/evaluation 0/11`、`vmodel-contract 0/2`、`trace 0/1`。
- 旧lint 87 moduleのうち同一path欠落9件:
  `db-currency`、`gate-id-format`、`gate-run-coverage`、`github-ci-policy`、`personal-path`、
  `right-lung-doc-governance`、`sub-doc-schema-integrity`、`test-design-naming`、`write-encoding-guard`。

path一致率はcapability搭載率ではない。各欠落・同名変更について個別の`absorbed/redesign/reject/adopt`証拠を
作るための探索下限として用いる。

現行部分機能の実走証拠:

```text
npx --no-install vitest run tests/agent-slots.test.ts tests/agent-ssot-runtime-projection.test.ts
tests/agent-guard.test.ts tests/team-model-policy.test.ts tests/harness-check-workflow.test.ts
tests/closure-auto-approval.test.ts tests/closure-evidence-materialization.test.ts --reporter=dot
exit 0 / 7 files / 92 tests
```

このgreenはregistry/muster/universal PR trigger/HMAC producer auth/live-tree isolationの欠落を被覆しない。

## §5 coverage集計（draft）

| 集合 | source量閉じ | capability採番 | 採否確定 | requirement trace | design/test/gate全join |
|---|---:|---:|---:|---:|---:|
| chat要求 | 捕捉41件、raw完全性未証明 | 41 summary rows | product 38 + execution 3 | HIL traceは部分 | 0実装証拠 |
| ZIP file集合 | path分類703/703 | engine 29 + aggregate親14。atomic child未閉鎖 | preliminaryのみ | aggregateを合格算入不可 | 0 atomic join |
| 旧UT remote refs | ref分類5/5 | aggregate 8。main 1,784 filesのatomic child未閉鎖 | preliminaryのみ | aggregateを合格算入不可 | 0 atomic join |
| 現行HELIX | seed HEAD full-tree分類1,931/1,931（core 1,756＋outside 175） | aggregate未採番。atomic child未閉鎖 | preliminaryのみ | HIL foundation突合中 | 0 atomic join |

file/ref/path分類率は作業進捗であり、capability完全性の合格証拠ではない。最終合格はatomic behavior全集合で
`pending=0`、orphan=0、aggregate parent算入0、source集合差分0、全joinありを機械検査した時だけ成立する。
