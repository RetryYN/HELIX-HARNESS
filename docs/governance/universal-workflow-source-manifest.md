---
title: "Universal Workflow Requirements source manifest"
status: draft
created: 2026-07-16
updated: 2026-07-16
owner: PO / TL
anchor_ledger: docs/governance/universal-workflow-anchor-ledger.md
question_ledger: docs/governance/universal-workflow-question-ledger.md
schema: universal-workflow-source-manifest.v1
source_archive: UNIVERSAL-WORKFLOW-REQUIREMENTS-SKILL_v1.1.0.zip
archive_sha256: b6fd08f5054930dde8379969bf9a84cb21270d1b7bac8e87be3bc243ad425d26
entry_count: 14
---

# Universal Workflow Requirements source manifest （日本語の契約見出し）

## §0 Authority境界

本書はUniversal Workflow ZIPをHELIXの独立source familyとしてsealed inventory化する。ZIPはworkflow要求探索、
質問、正規化、要求導出、runtime orchestrationのdomain sourceであり、HELIX全体のjudgment authorityまたは
active skillではない。raw prompt、schema、example、contractを直接実行せず、Node control planeがstrict adapterで
検証したproposalだけをRequirement Definition Ledgerへ渡す。

archive digestと14 entry digestはworkspace ingressで観測済みだが、archive自体は本branchのtracked artifactではない。
したがってbranch単体のsource custody再現は未閉鎖である。§2のschema/contract矛盾も残るため、packageのactive化と
要件freezeは不可とする。entry inventory、aggregate capability group、atomic behavior採否を混同しない。

## §1 Entry inventory（14/14） （日本語の契約見出し）

ZIP内共通prefix `UNIVERSAL-WORKFLOW-REQUIREMENTS-SKILL/`を除いた相対pathをentry identityとする。
`path + NUL + decimal size + NUL + content SHA-256`をpath順にLF連結したentry-set digestは
`sha256:806847ff46e9ca4e520cc35c1a56c0884059776e00c3c7627e459a3af2f22612`である。
extractor/canonicalization versionとsafe ZIP scan receiptは未登録であり、14行はinventory annotationであってatomic採否ではない。

| source ID | entry | size | SHA-256 | class | disposition | （日本語の機械契約記述）
|---|---|---:|---|---|---|
| UWR-E-001 | `README.md` | 1799 | `d7d0c862c8442a1bc567656640dd272dd28e8315ec93339c82978718ba57aec4` | guide | pending:atomization | （日本語の機械契約記述）
| UWR-E-002 | `SKILL.md` | 4011 | `8404f7926814171ffbdaa30927cb5291c81a17e73a2a91beda5d3268eaf9cd75` | skill-policy | harden | （日本語の機械契約記述）
| UWR-E-003 | `schemas/workflow-model.schema.json` | 16583 | `27517ed8bbef8501c77a41130bc7fb6f7f0eae9ded91b6d355d126e4c9cc7229` | schema | harden |
| UWR-E-004 | `schemas/derived-requirements.schema.json` | 1239 | `bba19443b5d440743f24e2d52bd5cf7548988d7c218265f02c34a8c2e5989585` | schema | harden |
| UWR-E-005 | `catalogs/conditional-question-catalog.yaml` | 2372 | `568129425a016144d028bddda523a42030ed82860712bb7925419f5ae26b1cec` | question-catalog | pending:atomization | （日本語の機械契約記述）
| UWR-E-006 | `catalogs/base-question-catalog.md` | 1208 | `e3792cb1d62db0ea23097bced7e985351e2257a04ef7359b75284453c0f9375b` | question-catalog | pending:atomization | （日本語の機械契約記述）
| UWR-E-007 | `catalogs/runtime-orchestration-question-catalog.md` | 1633 | `c8176370f425b9409e5137c6fa88642cb719b008d34a308ceca309981fa3efc0` | question-catalog | harden | （日本語の機械契約記述）
| UWR-E-008 | `examples/approval-workflow.example.json` | 4604 | `d29adddf911770be7a949c8dccd644b50431abf1f0d6ebe4efa10cd2deedd25d` | fixture | harden |
| UWR-E-009 | `examples/runtime-orchestration.example.json` | 2979 | `ea360a0c9d9cea33d585f4cff515ef9feb0253bd09550f7534f49dc6f9d5e3fb` | fixture | harden |
| UWR-E-010 | `contracts/workflow-to-requirement-contract.md` | 1864 | `56609bc0f9c41f315c9767790d03c462b36bc0eabaf63625fe4573aa63942886` | contract | harden |
| UWR-E-011 | `contracts/requirement-contract.schema.json` | 1699 | `277db0d25cc1bcc824ebd7134109ff3859682d433c14d488062bac0caf067dfd` | schema | harden |
| UWR-E-012 | `contracts/derived-mapping.md` | 1194 | `d2aa3864f6b4a632200f8dcce4b753de73b4a837f77f915018589445bf8f5894` | mapping | pending:atomization | （日本語の機械契約記述）
| UWR-E-013 | `contracts/runtime-orchestration-contract.md` | 2284 | `30f975bc054fe5f054e5416f2476ff5f974c08c68127c8ee10299b96a0270f36` | contract | harden |
| UWR-E-014 | `prompts/workflow-extraction-prompt.md` | 992 | `2d9f8729914845f7e61255c6868f8bce98851e1e5d5ab056bce6cb48141a39e1` | prompt | harden |

## §2 Hardening obligations （日本語の契約見出し）

| finding ID | source | blocking defect | required disposition | （日本語の機械契約記述）
|---|---|---|---|
| UWR-F-001 | UWR-E-002/E-014 | skill frontmatterがなく、単一JSONへ相互非互換な2 schemaを同時要求する | HELIX skill化せず、promptをtyped stage別proposalへ分割する |
| UWR-F-002 | UWR-E-003/E-004/E-010/E-011 | `additionalProperties:false`契約とexample/derived itemのfield・型が閉じない | canonical schemaを一つ選び全contract/exampleを再検証する |
| UWR-F-003 | UWR-E-010/E-011 | proseの必須field数とschema必須field数が一致しない | field denominatorとapplicabilityをversioned contractへ統一する |
| UWR-F-004 | UWR-E-008 | approval exampleがAPPROVED/CANCELLED terminalへ到達不能 | terminal transition fixtureを追加しcompleteness gateで検証する |
| UWR-F-005 | UWR-E-007/E-009/E-013 | schedulingを要求するがschedule entity/schema/gateがなく、exampleのallocation必須fieldも不足 | runtime orchestration schemaとresource/schedule oracleを追加する |
| UWR-F-006 | UWR-E-003/E-009/E-013 | `candidates`と`candidate_set`等の命名がdriftする | canonical termとmigration aliasを決定する |

## §3 Provisional requirement authority groups （日本語の契約見出し）

| aggregate group | entries | requirements | authority state | （日本語の機械契約記述）
|---|---|---|---|
| UWR-A-000 package custody | UWR-E-001..014 | HIL-FR-51 | provisional / atomic behavior pending | （日本語の機械契約記述）
| UWR-A-001 workflow-first modeling | UWR-E-003, UWR-E-014 | HIL-BR-26, HIL-FR-53, HIL-NFR-30 | sealed-source / hardening-pending | （日本語の機械契約記述）
| UWR-A-002 interview disposition | UWR-E-005, UWR-E-006, UWR-E-007 | HIL-BR-27, HIL-FR-52, HIL-NFR-32 | sealed-source / hardening-pending | （日本語の機械契約記述）
| UWR-A-003 completeness and derivation | UWR-E-003, UWR-E-004, UWR-E-010, UWR-E-012 | HIL-BR-28, HIL-FR-54, HIL-FR-55, HIL-NFR-31 | sealed-source / hardening-pending | （日本語の機械契約記述）
| UWR-A-004 runtime orchestration | UWR-E-007, UWR-E-009, UWR-E-013 | HIL-BR-29, HIL-FR-56, HIL-NFR-33 | sealed-source / hardening-pending | （日本語の機械契約記述）
| UWR-A-005 strict adapter authority | UWR-E-002, UWR-E-003, UWR-E-004, UWR-E-010, UWR-E-011, UWR-E-013, UWR-E-014 | HIL-TR-12, HIL-NFR-34 | provisional / HELIX-policy-required | （日本語の機械契約記述）

## §4 Closure

- archive identity: 1/1 observed、branch-local retrieval receipt 0/1 （日本語の機械契約記述）
- entry inventory/digest: 14/14 observed、canonicalization receipt 0/1 （日本語の機械契約記述）
- primary mechanical anchor: 328/328 inventory、exact disposition 0/328 （日本語の機械契約記述）
- canonical question ledger: 76/76 ID登録、source value digest/requirement edge 0/76
- anchor candidate exact route: 328/328、target空0、coverage credit 0、verified 0
- atomic entry disposition: 0/14、final behavior atom denominator unknown （日本語の機械契約記述）
- hardening findings: 0/6 resolved
- provisional aggregate groups: 6/6 registered （日本語の機械契約記述）
- provisional requirement edges: 16/16 registered、current authority 0/16 （日本語の機械契約記述）
- active package: 0/1

したがって14 entryの観測inventoryは閉じたが、branch単体custody、atomic behavior分母、採否、current requirement authority、
active package、L5 test design、独立reviewは未完了である。
