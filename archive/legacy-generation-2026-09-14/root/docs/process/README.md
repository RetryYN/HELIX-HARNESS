<!-- HELIX:L3-PROGRESSION-AUTHORITY:v1 -->
> **L3進行authority**: 層・pair・runtime判断は `docs/governance/l3-progression-authority-rebaseline-2026-07-19.md` を正とする。本文に残る旧layerのpathやIDはcompatibility inputとしてのみ扱い、current gateの判定へ直接使用しない。
> **層正本**: `docs/governance/helix-harness-requirements_v1.3.md` のL1-L12 canonical contractに従う。

# docs/process — current workflow guidance (L1-L12)

本書はHELIXの「どう開発を進めるか」を定義するprocess入口である。requirementsとregistryが意味を決め、
このdirはその意味を人間が実行できる手順へ投影する。harnessの機能要件やruntime実装そのものは
`docs/design/`、`docs/test-design/`、`src/`の各正本を参照する。

## 1. 正本境界

分類の意味authorityと機械的な投影先は次のとおりである。

```text
requirements
  → versioned workflow classification registry
  → generated workflow catalog
  → process / runtime / CLI / DB projection
```

| surface | current source | role |
|---|---|---|
| 意味authority | `docs/governance/helix-harness-requirements_v1.3.md` | 要求・route・state・gateの最終正本 |
| typed mirror | `docs/design/helix/L3-requirements/workflow-classification-registry.v1.json` | versioned machine-readable registry |
| current catalog | `config/workflow-classification-catalog.v1.json` | registryから生成するprojection |
| 旧catalog | `config/drive-route-catalog.json` | compatibility inventory。意味判定には使わない |

current identityは次のtupleだけで表す。

```text
registry_version + registry_source_digest + target_axis + target_id
```

異なるaxisを一つのroute enum、CLI引数、DB fieldへ畳み込まない。旧`mode`／`model`等の入力は
compatibility adapterで一方向変換し、変換元とwarningをreceiptへ残す。曖昧・未知・unsupportedな入力を
推測してcurrent identityへ昇格させず、`ambiguous`または`unsupported`でfail-closeする。legacy identityは
current PLAN、Issue、PR、DB、doctor、CLI、生成文書へ再出力しない。

## 2. L1-L12 Forwardと正規pair

ForwardはL1からL12へ進み、次の6 pairを同時に閉じる。

| 左腕 | 右腕 | 確認するもの |
|---|---|---|
| L1 企画 | L12 運用テスト・改善還流 | 価値、route、運用時間軸、改善 |
| L2 要求・画面プロト | L11 受入テスト | 要求、操作、実利用、受入 |
| L3 要件定義・凍結 | L10 総合テスト | FR/NFR/AC、system挙動、test oracle |
| L4 基本設計 | L9 結合テスト | 外部境界、依存、transaction、adapter |
| L5 詳細設計・先行テスト設計 | L8 単体テスト | 契約、edge case、局所検証 |
| L6 実装 | L7 TDD closure | product code、test code、Red→Green→Refactor |

L0 charterは層外のauthority anchorであり、L1へ投影してからForwardを開始する。旧layerの既存成果物を
読む場合もこのpairへ対応づけ、currentの要件、PLAN、template、generator、DB projection、進捗表示、tagの
判定入力へ直接戻さない。

## 3. 独立した分類axis

PLANやwork itemは、次の問いを別々のfieldで保持する。

| axis | 問い | current identityの例 |
|---|---|---|
| development style | productionをどうdeliveryするか | `FULL_L1_L12_V` / `PRODUCTION_SCRUM` / `V_DESIGN_SCRUM_IMPLEMENTATION` |
| case-driven model | 不確実な仮説をどう検証するか | `DISCOVERY_POC` |
| workflow model | 現在のsignalやdriftをどう処理するか | `REVERSE` / `RECOVERY` / `INCIDENT` / `REFACTOR` / `RETROFIT` |
| subroute | 親style内の接続工程は何か | `SCRUM_REVERSE` |
| state machine | どの状態遷移を使うか | `DISCOVERY_POC_S0_S4` / `SCRUM_REVERSE_SR0_SR4` |
| specialist drive | どの専門職を招集するか | `BE` / `FE` / `FULLSTACK` / `DB` / `AGENT` |
| PLAN kind | PLANの変更目的は何か | `design` / `impl` / `reverse` / `retrofit` |
| execution mode | どのruntime構成で実行するか | `STANDALONE` / `CLAUDE_ONLY` / `CODEX_ONLY` / `HYBRID` |
| specialist workflow | 専門workflowを使うか | `SCREEN_DESIGN` |
| specialist capability | どの能力を付加するか | `UNIVERSAL_WORKFLOW` / `NFR_MEASUREMENT` / `DESIGN_HARNESS` |

Production ScrumとV設計＋Scrum実装Hybridはdevelopment styleであり、Reverse／Recovery等のworkflow model、
専門職drive、execution modeと同じ分類ではない。Discoveryはcase-driven modelであり、Production Scrumのphaseや
同じstate machineではない。Scrum ReverseはProduction ScrumまたはHybridを親に持つsubrouteである。

## 4. delivery styleとcase route

| current identity | 適用条件 | Forward接続 |
|---|---|---|
| `FULL_L1_L12_V` | system全体、高risk、複数境界、未知、分類衝突 | L1-L12を一貫して閉じる |
| `PRODUCTION_SCRUM` | 境界既知、継続成長、高feedback、段階release | L3 freeze後にslice化し、各sliceをV-pair evidenceへ戻す |
| `V_DESIGN_SCRUM_IMPLEMENTATION` | 複雑なsystemだが段階releaseが必要 | L1-L5とtest designをfreeze後、L6以降をslice化する |
| `DISCOVERY_POC` | 非productionの仮説、実現性、不確実性の検証 | `S0→S1→S2→S3→S4`の決定後に選択済みstyleへ接続 |

全production styleでL1-L3とユーザー要件承認を省略しない。routeはL3 freeze時に、要求確定度、境界・依存の
複雑性、実装規模、feedback頻度、段階release、risk・migration影響を根拠receiptへ束ねて同時合意する。
unknown、複合、Scrum不適格、route判定不能は`FULL_L1_L12_V`へfail-closeする。

Production Scrum／Hybridのsliceは、必要なcheckpointで`SCRUM_REVERSE`を発火する。`SR0 evidence capture →
SR1 observed contract → SR2 V-layer mapping → SR3 design/refactor proposal → SR4 pair freeze and Forward
reentry`を閉じ、L1-L5のcanonical設計資産へtyped traceを戻す。SR4 receiptなしにrelease-readyとしない。

## 5. signalから実行証跡まで

正規導出線は次の一方向である。

```text
signal / work item
  → target_axis + target_id
  → execution policy / state machine
  → workflow / specialist binding
  → receipt（HEAD、contract、digest、owner、evidence）
```

signalからbranch名、PLAN kind、専門職、runtime構成を直接推測しない。decision pending、approval boundary、
destructive operation、credential access、production impactは別conditionとして保持し、execution policyと
Node transaction boundaryで再検証する。AIは候補・根拠・confidence・unresolved itemを提案できるが、要求確定、
権限付与、high-impact action、正本state更新、gate passを自己承認しない。

## 6. 読む順序と完了境界

1. [requirements](../governance/helix-harness-requirements_v1.3.md) — L1-L12、development style、state、gateの意味authority。
2. [Forward overview](forward/overview.md) — L1-L12とV-pairの実行順。
3. [workflow分類索引](modes/README.md) — typed axis、registry、state machine、legacy境界。
4. [Scrum／Discovery](modes/scrum.md) と [各workflow model](modes/reverse.md) — selected identityごとの手順。
5. [drive route system](drive-route-system.md) — signalからtyped identity、policy、evidenceへの接着。
6. [gates](gates.md) — current gate、独立review、DB convergence、L12還流。

process文書の変更はrequirementsとregistryを先に確認し、対象surfaceを一つずつatomicに移行する。文書を
書き換えただけでは完了とせず、targeted test、typecheck、doctor、DB rebuild、CI、Claude exact-HEAD review、
main read-afterを同じidentityへ束縛する。次cycleへのL12還流は、実運用のmetric、drift、誤判断、manual bypass、
改善差分をevidenceとして記録してから行う。

## 7. compatibility boundary

compatibility inputは既存artifactの読込と移行監査に限定する。currentの意味authority、生成物、DB canonical
projection、PR契約、完了判定へ旧分類を再利用しない。互換pathを残す場合はcompatibility-onlyと明示し、
requirements→registry→generated projectionの正規参照列から外す。
