# HELIX 要件定義書 v1.3 — L1〜L12 Vモデル＋Scrum正本

- **Version**: 1.3
- **Status**: confirmed（PO再確認 2026-07-18）
- **設計コア**: `ハイブリッド設計ドキュメントv1-fixed.zip`
- **旧正本**: `helix-harness-requirements_v1.2.md`（L0〜L14部分はcompatibility referenceへ降格）
- **継承**: v1.2のうち、本書と衝突しない安全・証跡・駆動モデル・agent・DB・GitHub要件は継承する。

## 1. 正本決定

HELIXの工程正本は **L1〜L12のVモデルとScrumのハイブリッド**である。L0〜L14は既存成果物を読み取る期限付きcompatibility inputであり、新規PLAN、template、generator、DB canonical projection、進捗表示、tagはL1〜L12だけを出力する。

本書とv1.2、concept v3.1、旧process文書が衝突する場合、本書と`docs/design/helix/L3-requirements/vmodel-canonical-authority-cutover.md`を正とする。

## 2. 正規layer

| L | 工程 | V字の対 | 完了条件の核 |
|---|---|---|---|
| L1 | 企画 | L12 運用テスト | 価値、目的、対象、非対象、route判断が確定 |
| L2 | 要求＋画面プロト | L11 受入テスト | 要求とプロトを往復し、合意receiptまたは非UI N/A receiptが存在 |
| L3 | 要件定義・凍結 | L10 総合テスト | FR/NFR/AC、出所、優先度、非目標、test oracleが凍結 |
| L4 | 基本設計 | L9 結合テスト | 外部設計、architecture、境界、依存、接続が確定 |
| L5 | 詳細設計＋先行テスト設計 | L8 単体テスト | 内部設計、契約、edge case、test designが対で凍結 |
| L6 | 実装 | L7 TDD closure | L5契約内のproduct code。scope外機能を追加しない |
| L7 | テスト実装・TDD closure | L6 実装 | Red→Green→Refactor、実装とtestの双方向traceを閉じる |
| L8 | 単体テスト | L5 詳細設計 | 合成/局所データで内部設計を検証 |
| L9 | 結合テスト | L4 基本設計 | 接続、依存、transaction、adapter境界を検証 |
| L10 | 総合テスト | L3 要件 | system全体でFR/NFR/ACを検証 |
| L11 | 受入テスト | L2 要求＋画面プロト | 実利用・実データで要求とUXを検証 |
| L12 | 運用テスト・改善還流 | L1 企画 | 運用時間軸、価値、監視、改善を検証し次cycleへ還流 |

本番releaseはL11受入とL12運用テストの間のmilestoneであり、独立layerを増設しない。

正規V-pairは `L1↔L12`、`L2↔L11`、`L3↔L10`、`L4↔L9`、`L5↔L8`、`L6↔L7` の6組だけである。

## 3. L2画面工程

1. UIが存在する案件は、要求⇔画面プロトの反復と合意receiptなしにL3を凍結してはならない。
2. CLI、library、HARNESS等の非UI案件もL2を暗黙に飛ばしてはならない。`not_applicable`、理由、判定者、対象HEAD、要求への影響、再評価条件をreceiptへ残す。
3. ビジュアルDesign HARNESSはUI/UXの生成・評価を担う。L8〜L10の一般検証基盤と混同しない。

## 4. 開発経路

| route | 適用条件 | 工程規律 |
|---|---|---|
| `FULL_L1_L12_V` | 本格system、高リスク、複数境界、規制、未知または分類衝突 | L1〜L12を完全実施 |
| `PRODUCTION_SCRUM_REDUCED_V` | 段階release、小規模、境界既知、tailoring eligibility合格 | 機能sliceごとにL1〜L12 Vを縮約反復し、release合流時に全right-arm evidenceを閉じる |
| `DISCOVERY_POC` | 非productionの仮説探索 | S0〜S4。S4決定前にproduction Forwardへ昇格しない |

unknown、複合、Scrum不適格は`FULL_L1_L12_V`へfail-closeする。Scrumは文書・品質工程の省略機構ではなく、価値slice単位の反復機構である。TDD、Reverse、受入条件、migration、rollback、security、release evidence、L12運用を省略しない。

HELIXは個人開発を前提とするため、Scrumのteam ceremony、velocity競争、複数人role分担は必須にしない。backlog、slice、DoR/DoD、review、retro、段階releaseだけを必要粒度で使う。

### 4.1 Scrum ReverseによるVモデル回帰

Production Scrumは各sliceを実装して終わらせない。次のcheckpointで`SCRUM_REVERSE`を発火し、実装・実測・運用事実からL1〜L5の設計資産を逆生成・補正してVモデルへ引き戻す。

- sprint review前
- release candidate合流前
- public contract、DB schema、主要dependency、NFR budgetの変更時
- 設計traceのないcode、test、metric、運用判断を検出した時
- 同種finding再発、性能退行、障害、手動回避を検出した時

`SCRUM_REVERSE`は `SR0 evidence capture → SR1 observed contract → SR2 V-layer mapping → SR3 design/refactor proposal → SR4 pair freeze and Forward reentry` の5段階とする。SR4 receiptなしにsliceをrelease-readyにしない。Reverseが作るのは実装の説明書ではなく、次の変更を拘束できる要求・要件・基本設計・詳細設計・test/verification/measurement contractである。

### 4.2 Scrum Reverseからの改善連鎖

SR3は差分を次へexactly oneでrouteする。

1. 外部契約・要求・AC変更: `REDESIGN`
2. 外部挙動を保つ責務/依存/命名/共通化/外部化/DDD境界改善: `DESIGN_REFACTOR`
3. 設計を保ったalgorithm、allocation、I/O、concurrency、cache等の性能改善: `PERFORMANCE_REFACTOR`
4. state/schema/runtime移行: `RETROFIT`

Design Refactorはsemantic similarity、consumer、oracle、dependency graphで判断し、名称類似だけで統合しない。Performance Refactorは変更前baseline、budget、workload、profile、統計条件、回帰oracleを先に凍結し、測定不能な「高速化」を禁止する。どちらも機能追加と同一episodeへ混載しない。

### 4.3 検証・計測基盤

設計エンジンはtest caseだけでなく、system完成度を実証する`verification_measurement_contract`を各requirement/NFRから生成する。最低限、性能、信頼性、可用性、回復性、security、privacy、accessibility、互換性、運用性、保守性、cost/resource、data quality、observabilityを対象にする。

各contractはmetric ID、対象requirement/NFR、測定対象、workload/environment/data、baseline、target/SLO、許容差、sampling/window、tool/probe、evidence schema、判定oracle、owner、実行layer、再測定triggerを持つ。code/doc/testがgreenでも必須metricが未測定、stale、非代表環境、閾値未達ならsystem completionを拒否する。

計測はL5で設計し、L7でprobe/fixtureを実装、L8〜L10で局所からsystemへ拡張、L11で利用実態、L12で時間軸/SLO/改善効果を検証する。計測のために本番secret/PIIを露出せず、測定自体のoverheadと再現性も記録する。

## 5. Forward・横軸駆動

- Forwardを正方向とする。
- Reverseは実装事実を設計へ戻す先行taskで、Forward合流前にR0〜R4を閉じる。
- 確定設計を変更する場合はRedesignを先行し、その後Forward実装へ戻る。
- 外部挙動不変の構造改善はDesign Refactorとし、機能追加と混載しない。
- Infinity Loopは監査/改善 ⇔ gate ⇔ 自動走行の横軸であり、最終的にForward正本へ収束する。
- Scrum ReverseはScrumの実装・実測をVモデル資産へ戻す横断経路であり、SR4後にForwardへ再合流する。

## 6. GitHub自律運用

`docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md`を本書のGitHub要件として採用する。Issue→PLAN→branch→PR→CI→merge→tag→memory/DBを一episodeとして閉じる。mainはPR-only、strict aggregate `harness-check`、bypassなし、人間approval不要、cross-runtime review receipt必須とする。

## 7. 設計台帳と完了率

各Lは上位/下位の縦edgeとV字の横pairを持つ。要求、要件、設計、test、Issue、PR、evidence、decisionを`harness.db`へ収束し、orphan、dangling、重複ID、未検証findingを分母から隠さない。

完了率100%は、全requirement、AC、必須edge、V pair、gate evidence、finding dispositionが閉じた場合だけ許可する。L単位tagは進捗の補助証拠であり、DB closureなしに完了率を上げない。

## 8. runtime authority境界

Python/Nodeのauthorityは工程層とは独立にADR epochで決める。ADR-009/ADR-010が同一epochへ収束するまで、どちらかを工程正本の根拠にしてはならず、runtime変更preflightを閉じる。本要件はPython資産の一括移植またはTSへの一括再実装を指示しない。

## 9. 互換mapping

| legacy | canonical |
|---|---|
| L0 charter | L1 企画 |
| L1要求＋L2画面 | L2 要求＋画面プロト |
| L3要件 | L3 要件freeze |
| L4基本 | L4 基本設計 |
| L5詳細＋旧L6機能 | L5 詳細設計＋test contract |
| L7実装 | L6 実装 |
| L8〜L12検証 | L7〜L11 TDD・単体・結合・総合・受入 |
| L13/L14 | L12 運用テスト・改善 |

compatibility inputには`legacy_layer`、canonical outputには`canonical_layer`を保持する。旧path名を残すことは旧authorityを残すことを意味しない。

## 10. 受入条件

- 新規authoring outputにL0、L13、L14が出ない。
- L1〜L12の全layerと6組のV pairがexactly onceで定義される。
- Full V、Production Scrum、Discovery PoCがexactly oneで選択される。
- 非UI案件のL2が証拠付きN/Aとなり、暗黙欠落にならない。
- Production Scrumの各sliceからL1〜L12 pair/evidenceを逆引きできる。
- Production Scrumの各release-ready sliceにSR0〜SR4 receiptがある。
- Scrum Reverse findingがRedesign/Design Refactor/Performance Refactor/Retrofitのexactly oneへrouteされる。
- 必須NFRごとにverification/measurement contractとcurrent evidenceがあり、未測定・stale・閾値未達でcompletionを拒否する。
- legacy artifactはexact mappingでき、未分類・多対多曖昧が0件になる。
- GitHub episodeとDB closureが同一HEADへ収束する。
- authority文書が本書を参照し、L0〜L14をcurrent canonicalと表示しない。
