---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 386e4083f1a47c2d09ea75ea774772421a44b6f5dd9eaa331d6ea773cd683ffa
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: 97a9e0a4cfd5999f5178ec13f758ef71c334191aac51ed43c3bb9570bd762784
rule_id: RUL-OSM-09
group: OS管理
product: OS
atoms_primary: 37
atoms_secondary: 13
issue_projection: none
---

# RUL-OSM-09（OS管理／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

repositoryの運用規約を定める。commit文面の形式、統合後のbranchの廃棄、命名、追跡する生成物の範囲、設定の置き場の集約、個人設定と共有規則の分離、文書から環境固有のpathを除く。

## 主として対応づいた規則（37件）

| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 副 | 出どころ | 由来 |
|---|---|---|---|---|---|---|---|---|
| `RA-003` | エージェントはファイル名を英語にし、コード・識別子・commit messageには既存の規約を適用する。 | doc_language | prose | n/a | — | — | AGENTS.md:34-35; CLAUDE.md:128-129 | A／gpt-6-astra |
| `RA-024` | エージェントは個人overrideをCLAUDE.local.mdまたはAGENTS.override.mdに置き、AGENTS.override.mdをGit追跡しない。 | memory_context | prose | n/a | CLAUDE.local.md、AGENTS.override.md | — | AGENTS.md:346-348; CLAUDE.md:300-305 | A／gpt-6-astra |
| `RA-026` | エージェントはadapter文書にmachine-localな絶対pathを書かない。 | safety_security | prose | n/a | — | — | CLAUDE.md:333-333 | A／gpt-6-astra |
| `RA-028` | エージェントは明示追跡対象のaudit・provider-handover証跡以外のlocal runtime artifactをGit追跡しない。 | safety_security | prose | n/a | .helix/ runtime artifacts | — | CLAUDE.md:289-289 | A／gpt-6-astra |
| `RA-158` | repository運用者はdelete-branch-on-merge設定を維持する。 | review_merge | prose | n/a | GitHub repository設定 | — | AGENTS.md:323-323; CLAUDE.md:201-201 | A／gpt-6-astra |
| `RA-285` | エージェントはConventional Commitsを使う。 | behavior_discipline | prose | n/a | — | — | AGENTS.md:292-293; CLAUDE.md:184-184 | A／gpt-6-astra |
| `RB0-033` | 機械向けsurfaceの作成者は判定語・key・識別子に安定したASCII英語を使い、日本語や記号へ依存させない。 | doc_language | lint／doctor | n/a | machine-surface-language、CLI/doctor/lint/gate/oracle | — | docs/governance/coding-rules.md:74-77; docs/governance/coding-rules.md:93-108 | B／gpt-6-astra |
| `RB04-161` | 作業者はmainを常にデプロイ可能に保ち、壊れた場合は他作業を止めてでも最優先で修正する。 | behavior_discipline | prose | n/a | — | — | docs/governance/ai-dev-team-operations_v1.1.md:85-91 | B04／gpt-6-astra |
| `RB06-279` | 管理者は生成runtime stateを文書目的でGit追跡せず、監査Markdown・正規化evidence・provider記録を区別して追跡する。 | memory_context | prose／config | n/a | .helix state/cache/logs/tmp/CURRENTとaudit/evidence | — | docs/governance/repository-structure.md:118-119; docs/governance/repository-structure.md:140-156 | B06／gpt-6-astra |
| `RB06-286` | 設定管理者はconfig-in-package.json対応toolをpackage.jsonへ集約し、不要な新dotfileを作らない。 | tooling_runtime | prose | n/a | — | `RUL-DEV-03` | docs/governance/repository-structure.md:170-170 | B06／gpt-6-astra |
| `RB07-021` | GitHub運用guardはmerge commit以外のsubjectをConventional Commitsとして検査する。 | review_merge | prose／gate | fail_close | github ops guard | `RUL-OSA-06` | docs/governance/helix-harness-upstream-reconciliation-audit-2026-07-07.md:94-99 | B07／gpt-6-astra |
| `RB07-226` | commit作成者は許可されたConventional Commit typeとPLANまたはmodule scopeを使い、subjectを命令形・末尾periodなしにする。違反はcommit-msg hookで拒否する。 | review_merge | prose／hook | fail_close | feat/fix/chore/docs/refactor/test/style/ci/perf | `RUL-OSA-06` | docs/skills/git.md:33-47 | B07／gpt-6-astra |
| `RB07-227` | 旧Git運用では複数行commit messageをBash heredocで渡し、PowerShell here-stringを使わない。 | tooling_runtime | prose／hook | fail_close | 旧commit-msg hookの入力制約 | — | docs/skills/git.md:49-57 | B07／gpt-6-astra |
| `RC01-103` | coding-rulesは、機械向けstatus形式の文字列に指定の日本語判定語があるのにASCII判定tokenがない場合、不合格にする。describe/it/testの直接呼出しのタイトル文字列は除く。 | doc_language | lint | fail_close | OK/violation/warning等の固定token集合 | `RUL-OSA-06` | src/lint/coding-rules.ts:258-262; src/lint/coding-rules.ts:295-315; src/lint/coding-rules.ts:607-616 | C01／gpt-6-astra |
| `RC01-173` | runtime-portabilityは、検査対象src配下のファイルが.tsまたは.gitkeepでない場合、不合格にする。loaderはsrc/web配下を.gitkeep以外除外する。 | tooling_runtime | lint | fail_close | 旧TypeScript専用core構成 | — | src/lint/runtime-portability.ts:24-28; src/lint/runtime-portability.ts:167-177; src/lint/runtime-portability.ts:339-341 | C01／gpt-6-astra |
| `RE01-071` | commit作成者はConventional Commitsの許可されたtypeを使い、PR内の全commitを規約に適合させる。 | behavior_discipline | lint／ci | fail_close | commit type allowlist | — | docs/governance/helix-harness-requirements_v1.2.md:1164-1173 | E01／claude-opus |
| `RE01-072` | 旧solo運用では規定のGit運用要件を例外扱いにできるが、team運用では必須とする。 | review_merge | prose | n/a | solo/teamによる旧Git運用例外 | `RUL-OSA-01` | docs/governance/helix-harness-requirements_v1.2.md:1187-1187 | E01／claude-opus |
| `RE01-110` | 作業者は生成されたruntime stateをGit管理対象にせず、review guidanceの提供を完了判定の代わりにしてはならない。 | evidence_claim | prose／config | n/a | runtime生成物とreview guidance | `RUL-FRM-04` | docs/governance/helix-harness-requirements_v1.2.md:1542-1551 | E01／claude-opus |
| `RE01-157` | 構成変更者はrepository structureの正本に従い、package・tsconfig・core logicを重複配置しない。 | tooling_runtime | prose／doctor | fail_close | root package/tsconfigと旧repo-structure文書 | `RUL-COR-01` | docs/governance/helix-harness-requirements_v1.2.md:2356-2356; docs/governance/helix-harness-requirements_v1.2.md:2414-2426 | E01／claude-opus |
| `RG10-014` | branch作成者はgoverned prefixの後にスラッシュと目的を表す短い名前を置く。 | behavior_discipline | prose | n/a | governed branch prefix | — | docs/governance/github-operation-rules.md:24-24 | G10／claude-opus |
| `RG11-008` | 目標証跡監査は、layer coverage artifactがgit trackedであることも検査対象に含める。 | evidence_claim | doctor | fail_close | objective-evidence-audit gate | `RUL-FRM-04` | docs/governance/helix-objective-evidence-audit.md:50-50 | G11／claude-opus |
| `RG13-004` | 保守者はscripts/をHELIXの薄いOS entrypoint専用とし、userローカルに配備するKimi guard実体は監査文書へ掲載して追跡記録を残す。 | tooling_runtime | prose | n/a | scripts/、Kimi guardの文書内ソース記録とuserローカル配備 | `RUL-OSM-02` | docs/governance/kimi-code-extension-security-audit-2026-08-06.md:64-67 | G13／claude-opus |
| `RG14-010` | Python workerの配置担当者は、workers/python/<capability>/にHDS-HIL-12／14でfreezeしたdescriptor、entrypoint、schema、lockだけを置く。 | tooling_runtime | prose | n/a | workers/python/<capability>/、HDS-HIL-12／14 | `RUL-COR-05` | docs/governance/repository-structure.md:107-107 | G14／claude-opus |
| `RG14-011` | テストコードの作成者は、tests/の配置をsrcの構造に対応させる。 | behavior_discipline | prose | n/a | tests/がsrcをmirrorする配置規約 | `RUL-FRM-05` | docs/governance/repository-structure.md:111-111 | G14／claude-opus |
| `RG14-012` | repository管理者は、配布条件のcanonical top-level fileであるLICENSEをGit追跡対象に含める。 | behavior_discipline | prose | n/a | 当時のLICENSEはMIT License | `RUL-FRM-09` | docs/governance/repository-structure.md:163-163 | G14／claude-opus |
| `RG14-013` | 設定管理者は、rootを探索するツールのconfigを、rootのファイル数を減らす目的で別フォルダへ隠してはならない。 | tooling_runtime | prose | n/a | JS／TSツールのroot config探索 | `RUL-COR-05` | docs/governance/repository-structure.md:165-165 | G14／claude-opus |
| `RG14-014` | 設定管理者は、lintとformatをBiomeのbiome.json一つに集約し、target commandをnpm run lint／npm run formatとする。 | tooling_runtime | prose | n/a | Biome、biome.json、npm run lint／npm run format | `RUL-COR-05` | docs/governance/repository-structure.md:168-168 | G14／claude-opus |
| `RG14-015` | テスト設定管理者は、Vitestのvitest.config.tsを追跡対象の例外とし、G7のjson-summary coverage evidenceとfast／slow project分割を同ファイルで一元管理する。 | tooling_runtime | prose | n/a | Vitest、G7、PLAN-L7-348、vitest.config.ts | `RUL-OSA-05` | docs/governance/repository-structure.md:169-169 | G14／claude-opus |
| `RG14-016` | 設定管理者は、target root configの上限をpackage.json、package-lock.json、tsconfig.json、.editorconfig、biome.json、vitest.config.tsの6ファイルとし、transition lockを分母外で別管理する。 | tooling_runtime | prose | n/a | 指定された6種類のroot configとtransition lock | `RUL-COR-05` | docs/governance/repository-structure.md:173-173 | G14／claude-opus |
| `RG17-010` | commit担当者は、.helix/のruntime state、.env file、generated artifactをrepositoryへ含めてはならない。 | safety_security | prose | n/a | 旧.helix/ runtime stateとgenerated artifactの登録除外方針 | `RUL-OSM-04` | docs/skills/git.md:62-64 | G17／claude-opus |
| `RG23-004` | change-impactの変更集合抽出は、.helix/harness.dbのjournal・shm・walという一時ファイルを変更pathとして数えない。 | tooling_runtime | lint | n/a | SQLite の harness.db-journal/shm/wal | — | src/lint/change-impact.ts:76-78; src/lint/change-impact.ts:301-312 | G23／claude-opus |
| `RG23-007` | branch-kindは、codex・dependabot・renovateを接頭辞とするautomation branchを、未登録branch prefixの違反対象から除外する。 | process_gate | lint | n/a | AUTOMATION_BRANCH_PREFIXES | — | src/lint/branch-kind.ts:209-209; src/lint/branch-kind.ts:225-233 | G23／claude-opus |
| `RG35-002` | tracked-canonicalのbaseline（既知例外集合）は空に保たなければならず、baselineへの追加は新規driftを許容する穴になるため慎重に行う。 | process_gate | prose／lint | n/a | TRACKED_CANONICAL_BASELINE | `RUL-OSA-06` | src/lint/tracked-canonical.ts:9-16 | G35／claude-opus |
| `RG39-008` | Claude wake state rootは、git common dir配下のhelix-runtime領域に置き、git管理外の場合だけrepository-localのstate領域へfallbackする。 | tooling_runtime | prose | fail_open | .helix/state/claude-memory-wake という具体path | — | src/runtime/claude-memory-wake.ts:343-355 | G39／claude-opus |
| `RG40-008` | 文書report書込器は、出力先をrepository配下の固定artifact root（.helix/artifacts/document-diff）に限定する。 | safety_security | prose | fail_close | .helix/artifacts/document-diff という具体path | `RUL-COR-06` | src/runtime/document-report-write-port.ts:93-96; src/runtime/document-report-write-port.ts:118-123 | G40／claude-opus |
| `RG40-021` | orchestration eventのjournalとcheckpointは、repository配下の固定path（.helix/audit/orchestration-events.jsonl と .helix/state/orchestration-checkpoint.json）に置く。 | tooling_runtime | prose | n/a | .helix 配下の具体path | — | src/runtime/event-projection-checkpoint-transaction.ts:106-112 | G40／claude-opus |
| `RG41-008` | push前commitlintは、比較基準をremote tracking refに置き、取得できない場合はremote HEAD（解決できなければmain）とのmerge-baseで代替する。先頭コロンの削除refspecは検査対象外とする。 | process_gate | hook | fail_close | refs/remotes/<remote>/main という既定名 | `RUL-OSA-06` | src/runtime/git-command-guard-hook.ts:92-118 | G41／claude-opus |

## 副として対応づいた規則（13件）

`RB04-288`、`RB05-002`、`RB07-144`、`RE01-014`、`RE01-130`、`RE01-139`、`RE01-158`、`RG14-009`、`RG30-007`、`RG33-001`、`RG35-001`、`RG37-005`、`RG42-022`
