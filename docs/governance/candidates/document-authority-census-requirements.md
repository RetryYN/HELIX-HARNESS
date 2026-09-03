---
title: "Document Authority Census要件候補"
status: draft_candidate
authority_status: proposed_pending_l3_confirmation
owner_issue: 1381
plan_id: PLAN-L3-85-document-authority-census
---

# Document Authority Census要件候補

## 1. typed model（型付きモデル）

`DocumentArtifactV1`は最低限、次を保持する。

- `artifact_id`、`repository`、`candidate_head`、`path`、`content_digest`
- `document_class`と`lifecycle_disposition`
- `owner_authority`、`binding_targets`、`source_provenance`
- `generated_by`、`consumer_ids`、`startup_reachability`
- `semantic_epoch`、`declared_state`、`observed_state`

`document_class`の初期集合は、Requirement、Design、Test Design、PLAN、ADR、Governance、Process、Rule、
Agent Instruction（エージェント規則）、Command Instruction（コマンド規則）、Skill（スキル）、Runbook（運用手順）、Reference（参照）、Research（調査）、Candidate（候補）、Migration（移行）、
Compatibility、Historical、Evidence、Audit、Handover、Generated、Consumer Templateとする。

`lifecycle_disposition`のexact setは、`CANONICAL`、`PROJECTION`、`ACTIVE_RULE`、`REFERENCE`、
`CANDIDATE`、`MIGRATION`、`COMPATIBILITY`、`HISTORICAL`、`EVIDENCE`、`GENERATED`とする。
classとdispositionを同一enumまたは一つのfieldへ畳み込まない。

`input_policy`も独立した軸として保持し、exact setは`CURRENT_DECISION_INPUT`、`TEMPORARY_INPUT`、
`MIGRATION_INPUT`、`COMPATIBILITY_INPUT`、`HISTORICAL_INPUT`、`NOT_READ`とする。
`lifecycle_disposition`だけからcurrent入力可否を推測してはならない。`TEMPORARY_INPUT`にはowner、
有効期限または明示的なretirement condition、利用可能なconsumer範囲を必須化し、期限切れ・owner欠落・
retirement condition欠落は`UNKNOWN`へ倒す。temporary、migration、compatibility、historical inputを
current authorityやcurrent outputへ昇格させない。

## 2. 要件

| ID | 要件 | refines |
|---|---|---|
| `DAC-R-001` | inventoryは`git ls-tree`相当のtracked exact HEADを入力とし、path、blob identity、digestを固定する。 | `DAC-FR-001` |
| `DAC-R-002` | class resolverはpathだけで意味を推測せず、class別schema、catalog、frontmatter、owner registryを合成する。競合時はambiguousとして拒否する。 | `DAC-FR-002` |
| `DAC-R-003` | disposition resolverは自己申告を証拠にせず、current authority index、candidate registry、archive境界、生成provenanceへexact joinする。 | `DAC-FR-002` |
| `DAC-R-004` | binding resolverは参照先の存在だけでなく、そのtargetのdisposition、epoch、owner、digestを再帰検査する。cycle、dangling、dead authorityを拒否する。 | `DAC-FR-003` |
| `DAC-R-005` | reverse consumer graphはstartup read、agent rule、hook、CLI、CI、generator、setup template、README linkをconsumer type付きedgeとして保持する。 | `DAC-FR-004` |
| `DAC-R-006` | generated chainはsource digest、generator identity/version、generation receipt、artifact digest、consumer pinを結合し、片側追従をgreenにしない。 | `DAC-FR-005` |
| `DAC-R-007` | finding taxonomyは少なくともUNBOUND、MISBOUND、OVERCLAIM、ZOMBIE、DUAL_AUTHORITY、ACTIVE_CONSUMER_STALE_DOC、GENERATOR_PROPAGATION_DRIFT、REFERENCE_TO_DEAD_AUTHORITY、SEMANTIC_EPOCH_DRIFT、DECLARED_STATE_DRIFT、MISSING_LIFECYCLE、MISSING_OWNER、BROKEN_PAIR_TRACE、GENERATED_WITHOUT_PROVENANCE、STARTUP_AUTHORITY_LEAKを区別する。 | `DAC-FR-008` |
| `DAC-R-008` | severityはactive consumer、startup reachability、authority claim、generator propagation、V-pair影響から決め、file名や古さだけで決めない。 | `DAC-FR-006` |
| `DAC-R-009` | baselineはexact HEAD、finding exact set、理由、owner、期限へ束縛し、新規findingを既存debtで相殺しない。 | `DAC-FR-007` |
| `DAC-R-010` | semantic epoch変更時は、旧epochをcurrentとして読むconsumer、digest pin、README、startup packetをstaleとして検出する。 | `DAC-FR-010` |
| `DAC-R-011` | #825、#1370、本Censusは独立receiptを返し、aggregate gateは三者すべてのgreenを要求する。 | `DAC-FR-009` |
| `DAC-R-012` | scannerはfindingをtyped remediation routeへ投影するが、本文変更、削除、authority昇格、approval生成を実行しない。 | `DAC-FR-008` |
| `DAC-R-013` | `input_policy`はlifecycle dispositionと分離し、temporary／migration／compatibility／historical inputのowner、期限またはretirement condition、consumer範囲を検査する。current authority edgeまたはcurrent outputへの昇格、期限切れinputの黙認、欠落情報の推測をfail-closeする。 | `DAC-FR-003` |

## 3. lifecycle

実装順は次に固定する。

1. 本L1／L3／L10候補のplan固有human approvalとcanonical merge
2. main反映後の再読と#397 Requirement IR admission
3. class／lifecycle schemaとtracked inventory
4. recursive authority resolverとreverse consumer graph
5. semantic epoch（意味世代）、generator provenance（生成来歴）、baseline ratchet（負債増加防止）
6. doctor／CI／DB projectionと#825／#1370 aggregate
7. #206優先是正findingのread-after
8. Reverse fullbackとmain収束

## 4. compatibility

既存の索引、個別lint、archive directory規則はmigration inputとして利用できるが、本registryへ未収載の
自己申告をcurrent authorityへ再出力しない。曖昧なlegacy文書は推測で分類せず、UNKNOWN findingとして隔離する。
`lifecycle_disposition`と`input_policy`の既存値が一対一に対応しない場合は、class別bindingと
consumer graphを根拠に解決し、対応不能ならcurrent decision inputとして扱わない。
