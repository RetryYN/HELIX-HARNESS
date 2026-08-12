# NFR typed registry schema 詳細設計

## 1. root schema の構造

root は次の3 fieldだけを持つ。unknown field、空entry、未知schema versionをfail-closeする。

| field | contract |
|---|---|
| `schema_version` | exact `helix-nfr-registry.v1` |
| `registry_id` | exact `nfr-registry` |
| `entries` | 1件以上、stable ID重複なし |

初期 production registry は `HR-NFR-REG-001..003` をexact required traceとする。追加IDは受理できるが、
この3IDの一部欠落を「partial rollout」としてgreenへ縮退しない。

## 2. entry schema の構造

entry は次の24 fieldをexact setで持つ。

| group | fields |
|---|---|
| identity | `nfr_id`、`revision`、`quality_family`、`quality_characteristic` |
| authority/surface | `source_authority`、`target_surface` |
| measurement context | `metric`、`workload`、`environment`、`data`、`sampling` |
| objective declaration | `baseline`、`target`、`slo`、`error_budget`、`hard_limit`、`freshness_policy`、`threshold`、`window` |
| execution pointer | `probe`、`oracle` |
| accountability | `owner`、`evidence_path`、`remeasure_trigger` |

`nfr_id` は `HR-NFR-REG-NNN`、revision は正整数、owner はlower kebab-caseとする。
surfaceとremeasure triggerは空・重複を許さない。

## 3. discriminated union と cross-field binding

### 3.1 baseline

- `unknown`: `status`、非空`reason`、`reference`。
- `measured`: `status`、finite `value`、非空`unit`、`reference`。

### 3.2 target／SLO／budget／limit の宣言

- `unknown`: 数値とunitは`null`、根拠referenceまたはpolicy refを必須とする。
- `declared`: finite value／objectiveとunitを必須とする。

### 3.3 sampling

| method | value | unit |
|---|---|---|
| `all` | `null` | `null` |
| `fixed_count` | positive integer | `count` |
| `ratio` | `0 < value <= 1` | `ratio` |
| `time_interval` | positive finite（正の有限値） | non-empty（非空） |

全methodで `minimum_sample_count >= 1` とreferenceを要求する。

### 3.4 threshold／freshness の束縛

thresholdの`metric_id`と`unit`は同じentryのmetricへ一致させる。`between`はfinite 2値かつ
lower <= upper、他 comparator はfinite scalarとする。これは宣言整合の検査であり、観測値との比較ではない。

freshnessはpositive `max_age_seconds`、`0..1`のrepresentativeness ratio、policy refを持つ。

## 4. authority と source digest

source authorityは6 field exact set（role、canonical layer、id、artifact path、locator、source digest）。
role/layer表はL4設計を正本とする。pathはabsolute、drive path、backslash、`.`／`..` segment、
`.helix/`、`node_modules/`を拒否する。repoRoot指定時はrealpathでrepository脱出を再検査し、
source bytesのSHA-256と宣言digestを比較する。

過去snapshotをmigration比較するときは構造だけを検査する。過去digestを現行source bytesへ当て直すと、
正当なsource改訂でもpreviousが恒常redになるためである。candidateだけをcurrent bytesへ束縛する。

## 5. migration admission の規則

| condition | verdict |
|---|---|
| existing IDがcandidateに無い | `migration_entry_removed` |
| candidate revisionが小さい | `migration_revision_regressed` |
| declaration変更あり、revisionがprevious+1でない | `migration_revision_not_incremented` |
| declaration変更なし、revisionだけ異なる | `migration_revision_empty_bump` |
| new IDのrevisionが1でない | `migration_new_entry_revision_invalid` |

比較時だけrevision fieldを除き、残るtyped declarationをdeep strict equalityで照合する。
入力を変更せず、accepted candidateを返すだけで永続化しない。

## 6. deterministic failure の順序

failure codeはschema、identity、taxonomy、authority、digest/path、measurement declaration、
accountability、migrationの固定順で返す。同じ入力は同じcode順とmessage順を返す。
複数違反を最初の1件へ丸めず、ただし同一messageの重複は除去する。

## 7. L8 pair

`U-NFRREG-001..017` がrootからmigrationまでの全境界を担当する。
unit oracleは構造判定だけを検証し、#220のmetric評価と#221のprobe実行をmockで偽装しない。
