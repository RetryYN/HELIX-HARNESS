---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-OSM-09
group: OS管理
product: OS
atoms_primary: 29
atoms_secondary: 8
issue_projection: none
---

# RUL-OSM-09（OS管理／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

repositoryの運用規約を定める。commit文面の形式、統合後のbranchの廃棄、命名、追跡する生成物の範囲、設定の置き場の集約、個人設定と共有規則の分離、文書から環境固有のpathを除く。

## 主として対応づいた規則（29件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-003` | エージェントはファイル名を英語にし、コード・識別子・commit messageには既存の規約を適用する。 | doc_language | prose | AGENTS.md:34-35; CLAUDE.md:128-129 |
| `RA-024` | エージェントは個人overrideをCLAUDE.local.mdまたはAGENTS.override.mdに置き、AGENTS.override.mdをGit追跡しない。 | memory_context | prose | AGENTS.md:346-348; CLAUDE.md:300-305 |
| `RA-026` | エージェントはadapter文書にmachine-localな絶対pathを書かない。 | safety_security | prose | CLAUDE.md:333-333 |
| `RA-028` | エージェントは明示追跡対象のaudit・provider-handover証跡以外のlocal runtime artifactをGit追跡しない。 | safety_security | prose | CLAUDE.md:289-289 |
| `RA-158` | repository運用者はdelete-branch-on-merge設定を維持する。 | review_merge | prose | AGENTS.md:323-323; CLAUDE.md:201-201 |
| `RA-285` | エージェントはConventional Commitsを使う。 | behavior_discipline | prose | AGENTS.md:292-293; CLAUDE.md:184-184 |
| `RB0-033` | 機械向けsurfaceの作成者は判定語・key・識別子に安定したASCII英語を使い、日本語や記号へ依存させない。 | doc_language | lint／doctor | docs/governance/coding-rules.md:74-77; docs/governance/coding-rules.md:93-108 |
| `RB04-161` | 作業者はmainを常にデプロイ可能に保ち、壊れた場合は他作業を止めてでも最優先で修正する。 | behavior_discipline | prose | docs/governance/ai-dev-team-operations_v1.1.md:85-91 |
| `RB06-279` | 管理者は生成runtime stateを文書目的でGit追跡せず、監査Markdown・正規化evidence・provider記録を区別して追跡する。 | memory_context | prose／config | docs/governance/repository-structure.md:118-119; docs/governance/repository-structure.md:140-156 |
| `RB06-286` | 設定管理者はconfig-in-package.json対応toolをpackage.jsonへ集約し、不要な新dotfileを作らない。 | tooling_runtime | prose | docs/governance/repository-structure.md:170-170 |
| `RB07-021` | GitHub運用guardはmerge commit以外のsubjectをConventional Commitsとして検査する。 | review_merge | prose／gate | docs/governance/helix-harness-upstream-reconciliation-audit-2026-07-07.md:94-99 |
| `RB07-226` | commit作成者は許可されたConventional Commit typeとPLANまたはmodule scopeを使い、subjectを命令形・末尾periodなしにする。違反はcommit-msg hookで拒否する。 | review_merge | prose／hook | docs/skills/git.md:33-47 |
| `RB07-227` | 旧Git運用では複数行commit messageをBash heredocで渡し、PowerShell here-stringを使わない。 | tooling_runtime | prose／hook | docs/skills/git.md:49-57 |
| `RC01-103` | coding-rulesは、機械向けstatus形式の文字列に指定の日本語判定語があるのにASCII判定tokenがない場合、不合格にする。describe/it/testの直接呼出しのタイトル文字列は除く。 | doc_language | lint | src/lint/coding-rules.ts:258-262; src/lint/coding-rules.ts:295-315; src/lint/coding-rules.ts:607-616 |
| `RC01-173` | runtime-portabilityは、検査対象src配下のファイルが.tsまたは.gitkeepでない場合、不合格にする。loaderはsrc/web配下を.gitkeep以外除外する。 | tooling_runtime | lint | src/lint/runtime-portability.ts:24-28; src/lint/runtime-portability.ts:167-177; src/lint/runtime-portability.ts:339-341 |
| `RE01-071` | commit作成者はConventional Commitsの許可されたtypeを使い、PR内の全commitを規約に適合させる。 | behavior_discipline | lint／ci | docs/governance/helix-harness-requirements_v1.2.md:1164-1173 |
| `RE01-072` | 旧solo運用では規定のGit運用要件を例外扱いにできるが、team運用では必須とする。 | review_merge | prose | docs/governance/helix-harness-requirements_v1.2.md:1187-1187 |
| `RE01-110` | 作業者は生成されたruntime stateをGit管理対象にせず、review guidanceの提供を完了判定の代わりにしてはならない。 | evidence_claim | prose／config | docs/governance/helix-harness-requirements_v1.2.md:1542-1551 |
| `RE01-157` | 構成変更者はrepository structureの正本に従い、package・tsconfig・core logicを重複配置しない。 | tooling_runtime | prose／doctor | docs/governance/helix-harness-requirements_v1.2.md:2356-2356; docs/governance/helix-harness-requirements_v1.2.md:2414-2426 |
| `RG10-014` | branch作成者はgoverned prefixの後にスラッシュと目的を表す短い名前を置く。 | behavior_discipline | prose | docs/governance/github-operation-rules.md:24-24 |
| `RG13-004` | 保守者はscripts/をHELIXの薄いOS entrypoint専用とし、userローカルに配備するKimi guard実体は監査文書へ掲載して追跡記録を残す。 | tooling_runtime | prose | docs/governance/kimi-code-extension-security-audit-2026-08-06.md:64-67 |
| `RG14-010` | Python workerの配置担当者は、workers/python/<capability>/にHDS-HIL-12／14でfreezeしたdescriptor、entrypoint、schema、lockだけを置く。 | tooling_runtime | prose | docs/governance/repository-structure.md:107-107 |
| `RG14-011` | テストコードの作成者は、tests/の配置をsrcの構造に対応させる。 | behavior_discipline | prose | docs/governance/repository-structure.md:111-111 |
| `RG14-012` | repository管理者は、配布条件のcanonical top-level fileであるLICENSEをGit追跡対象に含める。 | behavior_discipline | prose | docs/governance/repository-structure.md:163-163 |
| `RG14-013` | 設定管理者は、rootを探索するツールのconfigを、rootのファイル数を減らす目的で別フォルダへ隠してはならない。 | tooling_runtime | prose | docs/governance/repository-structure.md:165-165 |
| `RG14-014` | 設定管理者は、lintとformatをBiomeのbiome.json一つに集約し、target commandをnpm run lint／npm run formatとする。 | tooling_runtime | prose | docs/governance/repository-structure.md:168-168 |
| `RG14-015` | テスト設定管理者は、Vitestのvitest.config.tsを追跡対象の例外とし、G7のjson-summary coverage evidenceとfast／slow project分割を同ファイルで一元管理する。 | tooling_runtime | prose | docs/governance/repository-structure.md:169-169 |
| `RG14-016` | 設定管理者は、target root configの上限をpackage.json、package-lock.json、tsconfig.json、.editorconfig、biome.json、vitest.config.tsの6ファイルとし、transition lockを分母外で別管理する。 | tooling_runtime | prose | docs/governance/repository-structure.md:173-173 |
| `RG17-010` | commit担当者は、.helix/のruntime state、.env file、generated artifactをrepositoryへ含めてはならない。 | safety_security | prose | docs/skills/git.md:62-64 |

## 副として対応づいた規則（8件）

`RB04-288`、`RB05-002`、`RB07-144`、`RE01-014`、`RE01-130`、`RE01-139`、`RE01-158`、`RG14-009`
