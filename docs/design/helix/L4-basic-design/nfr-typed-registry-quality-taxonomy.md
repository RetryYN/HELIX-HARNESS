---
title: "NFR typed registry と quality taxonomy 基本設計"
layer: L4
artifact_type: design
status: draft
created: 2026-08-12
updated: 2026-08-12
owner: Codex / TL
plan: docs/plans/PLAN-L4-73-nfr-typed-registry-quality-taxonomy.md
pair_artifact: docs/test-design/helix/L9-nfr-typed-registry-quality-taxonomy-system-test-design.md
---

# NFR typed registry と quality taxonomy 基本設計

## 1. 目的と authority

本設計は Issue #219 と `HR-NFR-REG-001..003` を、機械可読な NFR declaration へ降ろす。
正本は `docs/governance/helix-harness-requirements_v1.3.md` §4.3 であり、
`docs/design/**/nfr-grade.md` は compatibility material として authority から除外する。

registry が答えるのは「何を、どの authority と測定契約へ束縛して宣言したか」である。
測定値が閾値を満たすか、probe をいつ実行するか、結果をどこへ保存するかは答えない。

## 2. 責務境界

| component | 責務 | 禁止事項 |
|---|---|---|
| declaration SSoT | stable ID、taxonomy、authority、measurement contractを保持 | 実装コード、command、SQLを保持しない |
| pure analyzer | exact schema、path、digest、cross-field整合を判定 | 入力変更、network、DB、command実行をしない |
| migration admission | stable IDとrevision遷移を比較 | configを書換えない、履歴を保存しない |
| doctor adapter | current configをread-onlyで読み、構造結果を既存doctorへ返す | threshold評価、probe実行、self-healをしない |
| #220 | metric／sampling／freshness／thresholdの意味評価 | registry schema authorityを再定義しない |
| #221 | probe実行、evidence時系列、履歴保存 | declarationを書き換えない |

## 3. 品質 taxonomy

### 3.1 標準品質特性（9）

`functional_suitability`、`performance_efficiency`、`compatibility`、
`interaction_capability`、`reliability`、`security`、`maintainability`、`flexibility`、`safety`。

### 3.2 AI 固有品質特性（7）

`judgment_reproducibility`、`worker_verifier_independence`、`grounding`、
`loop_termination`、`cost_efficiency`、`provider_degradation`、
`memory_contamination_resistance`。

各 entry は `quality_family=standard|ai_specific` と characteristic の組を持つ。
既知 characteristic を別 family へ置く、または未知値を補完して受理することを禁止する。

## 4. source authority 分離

| role | canonical layer | 保持する意味 |
|---|---|---|
| `l1_capability` | `L1` | 能力・品質目標の上位宣言 |
| `l3_observable_behavior` | `L3` | 観測可能な挙動・受入条件 |
| `adr_technical_choice` | `null` | 技術選択と制約 |
| `policy_threshold_operation` | `null` | threshold／SLO運用方針 |
| `runtime_profile_environment` | `null` | runtime／環境profile値 |

role と canonical layer は明示値だけで判定する。artifact path に `L1` や `L3` が含まれていても
layer を推定しない。非 layer role へ layer 値を混ぜる、同一 authority を重複登録する、
compatibility の `nfr-grade.md` を authority にする場合は fail-close する。

## 5. declaration のライフサイクル

1. current authority の path、locator、実bytes SHA-256を取得する。
2. stable `HR-NFR-REG-NNN`、revision、taxonomy、measurement contractを宣言する。
3. pure analyzerでschemaとcross-field整合を検査する。
4. 既存snapshotからの変更ならmigration admissionでstable IDとrevisionを検査する。
5. doctorがcurrent configをread-onlyで再検査する。
6. #220／#221 は受理済みdeclarationをconsumerとして扱う。

material change は revision をちょうど1進める。stable ID削除、revision逆行・飛び越し、
内容不変のrevision bumpは履歴の意味を壊すため受理しない。新規IDはrevision 1から開始する。

## 6. fail-close と安全境界

- root、entry、nested object は exact key set とし、unknown fieldを捨てない。
- source path は repo-relative、realpath後もrepo内、`.helix/` と `node_modules/` を非対象とする。
- source digest は `sha256:<64 lower-hex>` と実bytesの双方を照合する。
- unknown baseline／target／SLO／budget／limit は reasonまたはreferenceを保持し、測定値に偽装しない。
- probe declaration は `read_only: true` に固定するが、registryからprobeを実行しない。
- oracleは `U-*` または `ST-*` と `tests/*.test.ts` へ明示束縛する。

## 7. trace と L9 pair

| requirement（要求） | declaration surface（宣言面） | system oracle（検証） |
|---|---|---|
| `HR-NFR-REG-001` | stable IDとmeasurement contract全field | `IT-NFRREG-001`、`IT-NFRREG-002`、`IT-NFRREG-003` |
| `HR-NFR-REG-002` | 5 authority role、layer分離、実装方式拒否 | `IT-NFRREG-001` |
| `HR-NFR-REG-003` | 標準9特性、AI固有7特性 | `IT-NFRREG-002` |

L9 は config missing、invalid JSON、structural drift、required trace partial をdoctor境界で検証する。
freshnessやthresholdの意味評価をL9 greenへ混載しない。

## 8. 設計実在性束縛

実装assetとfailure witnessはL7実装sliceのcurrent HEADで追加検証する。設計段階で未確定の実在性を
先取りして受理しない。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [],
  "failure_reachability": []
}
```
