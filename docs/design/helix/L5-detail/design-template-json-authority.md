---
title: "Design Template JSON authority詳細設計"
layer: L5
artifact_type: design
status: draft
created: 2026-07-31
updated: 2026-07-31
owner: SE
plan: docs/plans/PLAN-L5-82-design-template-json-authority.md
pair_artifact: docs/test-design/helix/L5-design-template-json-authority-integration-test-design.md
related_l4: docs/design/helix/L4-basic-design/design-template-json-authority.md
---

# Design Template JSON authority詳細設計

## §1 schema familyの構成

同じ意味を複数schemaへ複製せず、次の4 document kindを一つのversioned familyで管理する。

| schema ID | 責務 | 本episode |
|---|---|---|
| `helix-design-template.v1` | 再利用可能な設計契約と適用条件 | fieldとvalidationをfreeze |
| `helix-design-template-registry.v1` | template exact set、supersession、registry digest | fieldとvalidationをfreeze |
| `helix-design-shadow-report.v1` | 既存artifactとの意味対応と差分 | fieldとparity判定をfreeze |
| `helix-design-instance.v1` | requirementへ束縛した設計値 | identity/trace接続口だけ。値契約は後続episode |

全objectは`additionalProperties: false`相当で閉じる。schema versionは文書kindごとのmajorを持ち、
unknown majorを互換推測しない。

## §2 Design Template JSONのfield

```yaml
required:
  - schema_version
  - template_id
  - template_version
  - status
  - title
  - layer
  - pair_layer
  - artifact_kind
  - responsibility_owner
  - applicability
  - required_inputs
  - sections
  - trace_contract
  - verification
  - measurement
  - completion
  - downstream_artifact_kinds
  - semantic_digest
```

### identityとlifecycle

- `template_id`: `TPL-`で始まるstable ID。pathやtitleをidentityにしない。
- `template_version`: 1以上の整数。同じID/versionの重複を拒否する。
- `status`: `candidate | verified | approved | canonical | deprecated`の閉じた集合。
- `supersedes`: 同じtemplate classの既存ID/versionだけを参照できる。
- `layer/pair_layer`: current L1–L12 pair exact setだけを許可する。

`candidate -> verified -> approved -> canonical -> deprecated`の順だけを許可する。shadow compilerの
出力は常にcandidateであり、parity greenだけでapproved/canonicalへ昇格しない。

### sectionとfield

`sections`は`section_id`をtemplate内で一意にし、`required`、`fields`、`completion_rule_ids`を持つ。
fieldは`field_id`、`value_type`、`cardinality`、`required`、`trace_kind`、`validation_rule_ids`を持つ。
自由文fieldも意味ownerとtraceを持ち、rationaleだけを構造fieldの代用にしない。

### trace、verification、measurementの契約

- `trace_contract`: requirement、system contract、acceptance、design obligationの必須参照class。
- `verification`: pair template ID、required oracle class、negative oracle、stale条件。
- `measurement`: metric ID、unit、threshold/operatorまたはauthority付きN/A。
- `completion`: required coverage、unresolved policy、independent review、digest一致条件。
- `downstream_artifact_kinds`: current layer/pairで生成可能な閉じたartifact kind。

## §3 applicability式

式nodeは次のdiscriminated unionとする。

```yaml
predicate_node:
  - all: PredicateNode[1..N]
  - any: PredicateNode[1..N]
  - not: PredicateNode
  - comparison:
      field: allowlisted_field_path
      op: eq | neq | in | contains | exists | gt | gte | lt | lte
      value: typed_scalar_or_array
```

一つのnodeに複数variantを置かない。空`all/any`、過剰depth、循環参照、unknown field/operator、
field型とvalue/operatorの不一致をschemaまたはsemantic validationで拒否する。

評価結果は`applicable | not_applicable | evaluation_error`の三値とする。missing fieldやunknown enumを
`not_applicable`へ丸めない。N/Aは`reason`、`authority`、`reentry_trigger`を持つdispositionであり、
predicate falseとは別に記録する。

## §4 registryとexact set

registryは`registry_id`、`registry_version`、`schema_digest`、templateの`id/version/digest/status` exact set、
生成時刻から独立したlogical digestを持つ。同じclass/layer/pair/applicability equivalence classに
canonical normative ownerを原則1件だけ許可する。

template IDの参照はregistry内のexact versionへ解決し、latest暗黙解決をしない。deprecated templateは
replacement、consumer exact set、retention、removal triggerが無ければ受理しない。

## §5 shadow変換とsemantic parity

shadow compilerは既存artifactを直接canonical JSONへ変換せず、次のrecordを作る。

```yaml
shadow_mapping:
  source_artifact_path: repository_relative_path
  source_digest: sha256
  source_authority: current | compatibility | historical
  candidate_template_id: stable_id
  candidate_template_version: integer
  mapped_atoms:
    - source_pointer
    - target_json_pointer
    - semantic_class
    - disposition
  unmapped_atoms:
    - source_pointer
    - reason
    - owner
    - reentry_trigger
  generated_view_digest: sha256
  parity_status: exact | explained_delta | failed
```

`disposition`は`adopt | adapt | supplemental_prose | generated_view | reject`のexactly-oneとする。
source authorityがcompatibility/historicalの場合、その値をcurrent template defaultへ自動昇格しない。

parityは次の全条件の論理積である。

1. current sourceの構造的atomが全てmappedまたはowner付きunmappedである。
2. candidateの各normative fieldがsource atomまたは新規design decisionへtraceする。
3. sourceとcandidateのrequirement、owner、failure、oracle、measurement、pair意味が一致する。
4. generated viewを再生成したlogical contentがcandidateと一致する。
5. duplicate normative owner、fabricated ID、authority昇格が0である。

`explained_delta`は自動greenではなく、独立reviewとdesign decision IDを要求する。`failed`または
unresolved blocking itemが1件でもあればcutover不可とする。

## §6 findingと例外

| finding code | 条件 | disposition |
|---|---|---|
| `schema_invalid` | JSON Schema不適合 | fail-close |
| `template_identity_duplicate` | ID/version重複 | fail-close |
| `template_digest_mismatch` | registryと実fileのdigest不一致 | fail-close |
| `applicability_invalid` | 式木、field、operator、型が不正 | fail-close |
| `trace_incomplete` | 必須trace class欠落 | fail-close |
| `pair_incomplete` | pair template/oracle/revision欠落 | fail-close |
| `measurement_incomplete` | metric/threshold/N/A authority欠落 | fail-close |
| `normative_owner_duplicate` | 同値classに複数owner | fail-close |
| `shadow_atom_unmapped` | owner/re-entryなしの未変換atom | fail-close |
| `shadow_semantic_drift` | sourceとcandidateの意味差 | review required |
| `generated_view_drift` | source digestとviewが不一致 | regenerate、直接編集拒否 |
| `legacy_authority_promotion` | compatibility/historical値をcurrentへ昇格 | fail-close |

validatorは全findingをstable順で返すが、部分的に正しいtemplate/registryをactivation可能として返さない。

## §7 設計リファクタリング判定

L5 close前に、fieldとruleを同値classで再検査する。別名field、Markdown専用metadata、diagram専用trace、
layerごとの同義completionを共通contractへ畳み、template固有差分だけを残す。

本詳細設計は新DB table、Markdown parser、provider adapter、diagram engineを要求しない。L6ではまず
pure validatorとshadow report compilerで成立するかRed testを作り、永続化が不要なら追加しない。
