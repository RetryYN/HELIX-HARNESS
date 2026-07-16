---
title: "Hybrid / Universal ZIP mechanical anchor inventory"
status: draft
created: 2026-07-16
updated: 2026-07-16
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
source_contract: docs/governance/infinity-loop-source-atomization-contract.md
universal_anchor_ledger: docs/governance/universal-workflow-anchor-ledger.md
python_module_anchor_ledger: docs/governance/hybrid-python-module-anchor-ledger.md
---

# Hybrid / Universal ZIP 機械抽出anchor台帳

## §0 判定境界

本台帳はsealed ZIPから決定的に数えられる構造anchorの分母であり、最終behavior atom数ではない。
class、CLI、schema root、template file、generated fixtureなどのcontainer/exposure/fixtureをbehaviorへ二重加算しない。
最終freezeには、全anchorのexactly-one route、意味IR、pending 0、coverage join、独立reviewが別途必要である。

## §1 Hybrid Design Document ZIP

| anchor family | count | 判定 |
|---|---:|---|
| archive entry / unique blob | 703 / 701 | entry custody。exact duplicate alias 2組 |
| Python module | 29 | tool inventory |
| top-level function | 188 | callable candidate |
| method / nested function | 18 / 23 | callable candidate |
| callable anchor合計 | 229 | behavior候補。動的trace前 |
| class container | 7 | weight 0 |
| main guard module | 22 | exposure container |
| CLI subcommand / argument | 19 / 44 | callableへの`exposes` edge |
| leaf CLI route上限 | 40 | behavior数へ直接加算しない |
| local import edge | 63 occurrences / 51 unique | import closure入力 |
| external module名 | 23 | dependency closure入力 |
| JSON Schema file / recursive node | 2 / 60 | contract anchor。nodeをbehaviorと同一視しない |
| OpenAPI path / operation / component schema | 4 / 6 / 7 | operation 6がAPI behavior候補 |
| template file / chapter / block | 77 / 419 / 789 | obligation/instance分類前 |
| docs file / feature scenario / GWT step | 139 / 3 / 14 | normative clause抽出前 |
| SKILL.md | 15 | skill contract候補 |
| generated fixture | 427 | behavior weight 0、lineage必須 |

exact duplicate aliasは次の2組である。entryは703件のまま保持し、canonical anchorへの`duplicates` edgeで
behavior二重算入を防ぐ。

- `api/openapi.yaml` ↔ `build/api_openapi.yaml`
- `templates/profiles.yaml` ↔ `docs/profiles.yaml`

76個のtemplate YAMLは同名docsを持つため、template obligationとinstanceを`instantiates`で結び、同じ規則を
二重計上しない。`build/**` 427件はfixtureとして保持し、producer、input digest、generator version、consumer assertionが
無ければorphanとする。

## §2 Universal Workflow Requirements ZIP

| anchor family | count | 判定 |
|---|---:|---|
| archive entry / unique blob | 14 / 14 | exact duplicate 0 |
| conditional question | 27 | individual disposition candidate |
| base question | 24 | individual disposition candidate |
| runtime orchestration question | 25 | individual disposition candidate |
| question合計 | 76 | primary behavior candidate |
| conditional family / detect term occurrence | 6 / 30 | routing anchor |
| derived surface occurrence / unique | 22 / 17 | derivation edge候補 |
| JSON Schema file / recursive node | 3 / 207 | contract/constraint anchor |
| property / required ref / enum value | 154 / 76 / 39 | constraint clusterへsplit予定 |
| named fixture-case候補 | 13 | behavior weight 0、oracle/lineage入力 |

README、SKILL、contract、mapping、promptのnormative prose clauseはtyped IDを持たず未計数である。
76質問とschema anchorだけでatomic denominator closedを主張しない。

## §3 最小schemaと閉包式

1. `source_entry(entry_id, blob_digest, role, generated, producer_hint)`
2. `candidate_anchor(anchor_id, entry_id, extractor/version, kind, span, structural_digest)`
3. `anchor_route(anchor_id, behavior|container|exposure|fixture|generated|alias|evidence, target, reason)`
4. `behavior_atom(atom_id, semantic_ir, source_spans[])`
5. `relation(from, to, contains|exposes|instantiates|generated_from|duplicates|supports|split_into|composes)`
6. `decision(atom_id, revision, adopt|harden|redesign|reject|absorbed|pending, evidence)`

semantic IRはtrigger/precondition、typed input/output、effect authority、failure/retry、state transition、
invariant/oracleを必須とする。全entryがanchorまたはterminal nonbehaviorへ到達し、各anchorのprimary route exactly 1、
span gap/overlap 0、全behavior atomのcurrent decision exactly 1、pending/orphan 0、HIL→design→assertion→gate join完了時だけ
atomic denominatorをfreezeする。

## §4 現在のclosure

| metric | current | verdict |
|---|---:|---|
| Hybrid entry inventory | 703/703 | PASS |
| Hybrid mechanical anchor extraction | 部分類型を計数済み | PARTIAL |
| Hybrid final behavior atom denominator | unknown | FAIL |
| Universal entry inventory | 14/14 | PASS |
| Universal question anchor | 76/76 observed | PASS（anchorのみ） |
| Universal normative prose ownership | unknown | FAIL |
| Universal final behavior atom denominator | unknown | FAIL |
