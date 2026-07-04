# HELIX から UT-TDD への porting map

> **superseded (ADR-001, 2026-05-27)**: 本 map は HELIX Python code の file 単位 port 計画だったが、実装方針が **TypeScript で全面再実装（HELIX は概念のみ取り込み）** に変更されたため、**code-port 計画としては superseded**。本書は **HELIX 能力 inventory / TS 再実装時の機能参照**として残置する。既存の `src/ut_tdd/*.py`（W1-W3a port）も TS 再実装で置換予定。正本は `../adr/ADR-001-ut-tdd-harness-redesign-and-language.md` / `concept_v3.1` / `requirements_v1.2`。

## 目的

この document は、HELIX snapshot を UT-TDD-owned asset へ変換するための実行 map だった。現在は ADR-001 により、file 単位 port ではなく TypeScript/Bun による再実装の参照 inventory として扱う。

source snapshot は `vendor/helix-source/` に read-only material として残す。UT-TDD functionality は、選別した asset を UT-TDD-owned path へ移し、rename、HELIX/local 前提の除去、test 接続を行う前提で作成する。

## porting rule の扱い

| rule | requirement |
|---|---|
| source は read-only | productize 中に `vendor/helix-source/` を編集しない。 |
| target が behavior を所有 | runtime code は `src/ut_tdd/`、`scripts/`、`.ut-tdd/`、`.claude/`、`.github/`、`docs/skills/` など UT-TDD-owned path に置く。 |
| test は code と一緒に移す | 各 porting unit は対応する test、または新しい UT-TDD fixture を含める。 |
| name を置換 | `helix`、`.helix`、`HELIX`、absolute local path は、`ut-tdd`、`.ut-tdd`、`UT-TDD`、repo-relative path へ置き換える。 |
| OS 前提を normalize | Linux/WSL-only shell behavior は Windows PowerShell と POSIX entrypoint を持たせる。 |
| external provider 前提を isolate | provider SDK/auth-dependent behavior は optional とし、default path に含めない。 |

## reuse class の定義

| class | meaning |
|---|---|
| `copy-with-rename` | 主に filename、command、path replacement で済むもの。 |
| `adapt` | core logic は有用だが、enum、path、state layout、command name を変更する必要があるもの。 |
| `harden` | 有用だが、有効化前に security、path、OS、failure-mode review が必要なもの。 |
| `redesign-wrapper` | 内部部品は残しつつ、新しい UT-TDD command/workflow boundary で公開するもの。 |
| `curate` | knowledge source。executable code ではなく UT-TDD documentation/skill pack へ変換するもの。 |

## wave plan の概要

| wave | 目的 | primary command/output | reuse class | priority |
|---|---|---|---|---|
| W1 | PLAN schema と lint | `ut-tdd plan lint` | `adapt` | P0 |
| W2 | V-model trace lint | `ut-tdd vmodel lint` | `adapt` | P0 |
| W3 | task/effort/skill の routing | `ut-tdd task classify`, `task estimate`, `skill suggest` | `adapt` | P0 |
| W4 | team orchestration | `ut-tdd team run`, `.ut-tdd/teams/*.yaml` | `adapt` | P1 |
| W5 | handover/session recovery | `ut-tdd handover`, session summary の出力 | `copy-with-rename` + `adapt` | P1 |
| W6 | setup/doctor/runtime detection | `ut-tdd setup`, `ut-tdd doctor`, `ut-tdd status` の実行 | `adapt` | P0 |
| W7 | Claude Code hooks/agents | `.claude/settings.json`, `.claude/hooks/*`, `.claude/agents/*` | `harden` | P1 |
| W8 | GitHub と git hooks | `harness-check`, commitlint, branch-kind-check | `redesign-wrapper` | P1 |
| W9 | Scrum/Reverse の routing | Scrum x Reverse、R4、`promotion_strategy` の扱い | `adapt` | P2 |
| W10 | skill packs | `docs/skills/*.md` | `curate` | P1 |
| W11 | builder と workflow generation | workflow/task/agent builder | `adapt` | P2 |
| W12 | audit、metrics、dashboard の整理 | audit inventory、metrics、dashboard summary の生成 | `adapt` | P2 |
| W13 | security、guardrails、redaction の強化 | LLM guard、research guard、redaction、security check の実行 | `harden` | P1 |
| W14 | learning と replay | learning engine、shadow replay、recipe metrics | `redesign-wrapper` | P3 |
| W15 | local HTTP/API bridge | hooks/telemetry 向け optional local API | `redesign-wrapper` | P3 |
| W16 | asset/code catalog の整理 | asset template、code catalog、code edge の管理 | `adapt` | P2 |
| W17 | lock/job/rollback/cutover の hardening | lock、job queue、rollback、cutover rehearsal の管理 | `harden` | P2 |

## detailed map の一覧

| wave | HELIX source | UT-TDD target | 必要な修正 | tests / verification |
|---|---|---|---|---|
| W1 | `cli/lib/plan_frontmatter.py` | `src/ut_tdd/plan_frontmatter.py` | `.helix` default を置換し、path handling を normalize する。 | `cli/lib/tests/test_plan_frontmatter.py` を port する。 |
| W1 | `cli/lib/plan_parser.py` | `src/ut_tdd/plan_parser.py` | HELIX frontmatter name を UT-TDD §1 enum へ置き換える。 | `test_plan_parser.py` を port する。 |
| W1 | `cli/lib/plan_schema.py` | `src/ut_tdd/plan_schema.py` | `requirements_v1.1.md` の `VALID_*` table と同期する。 | `test_plan_schema.py` を port し、enum drift fixture を追加する。 |
| W1 | `cli/lib/plan_validator.py`, `plan_lint.py` | `src/ut_tdd/plan_validator.py`, `src/ut_tdd/plan_lint.py` | `promotion_strategy`、`skill_doc`、task command、branch exception を追加する。 | `test_plan_validator.py`、`test_plan_deps_helper.py` を port する。 |
| W1 | `cli/templates/plan/*/template.md` | `docs/templates/plan/*/template.md` | HELIX wording を rename し、UT-TDD artifact/role field を追加する。 | 全 template に `ut-tdd plan lint` を実行する。 |
| W2 | `cli/lib/vmodel_loader.py`, `vmodel_lint.py` | `src/ut_tdd/vmodel_loader.py`, `src/ut_tdd/vmodel_lint.py` | 4 artifact + mandatory 8 directed edge + G3.8 に合わせる。 | `test_vmodel_loader.py`、`test_vmodel_lint.py`、`test_vmodel_multi_drive.py` を port する。 |
| W2 | `cli/templates/state/vmodel.json` | `docs/templates/state/vmodel.json` | L3.8 と L6 QA doc-first trace を追加する。 | `ut-tdd vmodel lint` で fixture validation を行う。 |
| W3 | `cli/lib/effort_classifier.py` | `src/ut_tdd/task/effort_classifier.py` | role/model reference を rename し、§7.2 の JSON contract として公開する。 | `test_effort_classifier.py` を port する。 |
| W3 | `cli/lib/task_type_inference.py`, `task_dispatcher.py` | `src/ut_tdd/task/classifier.py`, `src/ut_tdd/task/dispatcher.py` | UT-TDD kind/drive/size/complexity へ map する。 | `test_task_type_inference.py`、`test_task_dispatcher.py` を port する。 |
| W3 | `cli/lib/skill_catalog.py`, `skill_recommender.py`, `skill_classifier.py` | `src/ut_tdd/skills/catalog.py`, `src/ut_tdd/skills/recommender.py`, `src/ut_tdd/skills/classifier.py` | `docs/skills/*.md` を canonical とし、vendor は candidate のみにする。 | `test_skill_catalog.py`、`test_skill_recommender.py`、`test_skill_classifier.py` を port する。 |
| W3 | `cli/templates/prompts/effort-classify.md`, `skill-search.md`, `skill-classify.md` | `docs/templates/prompts/*.md` | HELIX model-specific assumption を除去し、capability class で route する。 | prompt fixture smoke を行う。 |
| W4 | `cli/lib/team_runner.py` | `src/ut_tdd/team_runner.py` | `frontier-reviewer` / `worker` / `fast-checker` を enforce し、同一 model approval を forbid する。 | `test_team_runner.py`、`test_axis_14_orchestration.py` を port する。 |
| W4 | `cli/lib/model_registry.py`, `model_fallback.py`, `budget.py` | `src/ut_tdd/orchestration/*` | fixed model name を capability class と local override に置換する。 | `test_model_fallback.py`、`test_budget.py`、`test_budget_cli.py` を port する。 |
| W4 | `cli/templates/teams/*` | `.ut-tdd/teams/*.yaml` templates or `docs/templates/teams/*` | tracked default template と ignored `local*.yaml` を分離する。 | YAML parser と budget sum = 100 を確認する。 |
| W5 | `cli/lib/handover.py`, `handover_auto_dump.py` | `src/ut_tdd/handover.py`, `src/ut_tdd/handover_auto_dump.py` | state を `.ut-tdd/handover/` へ移し、`.helix` DB assumption を除去する。 | `test_handover.py` を port する。 |
| W5 | `cli/lib/transcript_summary.py` | `src/ut_tdd/transcript_summary.py` | provider/runtime を optional にする。 | local fixture summary test を追加する。 |
| W5 | `cli/templates/handover-current.*.template` | `docs/templates/handover/*` | field を UT-TDD runtime mode へ rename する。 | template render smoke を行う。 |
| W6 | `cli/lib/setup_helper.py`, `init_helpers.py` | `src/ut_tdd/setup.py`, `src/ut_tdd/init_helpers.py` | Windows/macOS/Linux を first-class にし、WSL requirement を置かない。 | `test_init_helpers.py` を port し、PowerShell/POSIX smoke を実行する。 |
| W6 | `cli/lib/doctor_plan_checks.py`, `doctor_recovery_check.py` | `src/ut_tdd/doctor/*` | `.helix` ではなく `.ut-tdd` を check し、local state は ignore する。 | `test_doctor_plan_checks.py`、`test_doctor_recovery_check.py` を port する。 |
| W6 | `cli/lib/compatibility_adapter.py`, `paths.py` | `src/ut_tdd/runtime/*` | `standalone` / `claude-only` / `codex-only` / `hybrid` を実装する。 | runtime fixture matrix を追加する。 |
| W7 | `.claude/settings.json` | `.claude/settings.json` | absolute hook command を repo-local `ut-tdd` に置換し、Windows path を verify する。 | hook config smoke と absolute path grep を行う。 |
| W7 | `.claude/hooks/*` | `.claude/hooks/*` | UT-TDD guard 経由で route し、HELIX DB write を除去する。 | shell-compatible な hook test を port し、必要に応じて PowerShell wrapper を追加する。 |
| W7 | `.claude/agents/*` | `.claude/agents/*` or `docs/templates/agents/*` | role を UT-TDD role/capability class へ rename する。 | Markdown lint と role enum validation を行う。 |
| W8 | `.github/workflows/*` | `.github/workflows/harness-check.yml`, `escalation-stale.yml` | branch-specific workflow を 1 つの required check に集約する。 | GitHub workflow syntax check と branch matrix fixture を行う。 |
| W8 | `scripts/git-hooks/*`, `cli/templates/hooks/*` | `scripts/git-hooks/*`, `scripts/install-hooks.*` | PowerShell installer を追加し、指定箇所のみ fail-close にする。 | shell syntax と PowerShell smoke を実行する。 |
| W8 | `.commitlintrc.json`, `.github/pull_request_template.md`, `CODEOWNERS` | same UT-TDD paths | owner と UT-TDD PR section を置換する。 | commitlint fixture と CODEOWNERS syntax check を行う。 |
| W9 | `cli/lib/scrum_local.py`, `scrum_reverse_matrix.py`, `scrum_to_reverse_routing.py` | `src/ut_tdd/scrum/*`, `src/ut_tdd/reverse/*` | `promotion_strategy`、R4 forward routing、PoC no direct merge を追加する。 | `test_scrum_*`、`test_reverse_*` を port する。 |
| W9 | `skills/workflow/reverse-*`, `skills/workflow/poc` | `docs/skills/reverse-pack.md`, `docs/skills/planning-pack.md` | UT-TDD skill pack docs へ curate する。 | `ut-tdd skill suggest` fixture を行う。 |
| W10 | `skills/common/testing`, `workflow/verification`, `quality-lv5` | `docs/skills/test-pack.md` | G3.8、L6 QA doc-first、vmodel lint に接続する。 | skill schema と suggestion fixture を行う。 |
| W10 | `skills/workflow/design-doc`, `api-contract`, `db`, `ui` | `docs/skills/design-pack.md` | add-design/add-impl と Pair freeze に接続する。 | skill schema と PLAN fixture を行う。 |
| W10 | `skills/common/code-review`, `coding`, `error-fix`, `refactoring` | `docs/skills/implementation-pack.md` | worker/reviewer split と G4 に接続する。 | skill schema と review fixture を行う。 |
| W10 | `skills/workflow/runbook`, `incident`, `postmortem`, `debt-register` | `docs/skills/operations-pack.md` | recovery と escalation に接続する。 | recovery PLAN fixture を行う。 |
| W11 | `cli/lib/builders/*` | `src/ut_tdd/builders/*` | HELIX registry name を置換し、UT-TDD template と verify script を emit する。 | `test_builders.py`、`test_builders_concrete.py` を port する。 |
| W11 | `docs/adr/ADR-002-builder-system-foundations.md`, `ADR-008-builder-abstraction.md`, `docs/design/L2-builder-system.md` | `docs/design/builder-system.md` or ADR references | architecture を UT-TDD builder design へ curate する。 | documentation consistency check を行う。 |
| W12 | `cli/lib/audit_*.py`, `audit_validator.py`, `audit_inventory.py`, `audit_hash.py` | `src/ut_tdd/audit/*` | team audit は local git state ではなく CI artifact に保存する。 | `test_audit_*.py` を port し、`.ut-tdd/audit/*.jsonl` が tracked でないことを verify する。 |
| W12 | `cli/helix-dashboard`, `docs/commands/dashboard.md`, `docs/metrics/*` | `ut-tdd dashboard` or CI job summary renderer | mandatory local server を避け、static summary/JSON を優先する。 | `test_dashboard_aggregation.py` を port する。 |
| W12 | `docs/v2/A-audit/*` | `docs/migration/audit-findings/*` | historical evidence と regression idea として curate する。 | link check のみ行う。 |
| W13 | `cli/lib/llm_guard.py`, `research_guard.py`, `research_tool_guard.py`, `redaction.py`, `context_guard.py` | `src/ut_tdd/guards/*` | secrets/destructive action のみ fail-close にし、external research は policy-gated のままにする。 | `test_llm_guard.py`、`test_research_guard.py`、`test_research_tool_guard.py`、`test_skill_dispatcher_redaction.py` を port する。 |
| W13 | `skills/common/security`, `skills/agent-skills/security-and-hardening`, `docs/security-guidelines.md` | `docs/skills/security-pack.md`, `docs/security/` | OWASP/secret/auth guidance を UT-TDD skill pack へ curate する。 | security checklist fixture を行う。 |
| W14 | `cli/lib/learning_engine.py`, `cli/lib/learning/*`, `docs/design/L2-learning-engine.md`, `ADR-003-learning-engine.md` | `src/ut_tdd/learning/*` or later package | optional とし、Phase 0 を persistent DB に依存させない。 | enabled 時に `test_learning_engine.py`、`test_learning_package.py` を port する。 |
| W14 | `cli/lib/shadow_replay.py`, replay tests | `src/ut_tdd/replay/*` | local mandatory hook ではなく CI regression replay として使う。 | `test_shadow_replay_unit.py`、`test_replay_integration.py` を port する。 |
| W15 | `cli/lib/http_api/*` | `src/ut_tdd/http_api/*` | optional local bridge のみにし、auth required、default open server は禁止する。 | `test_http_api_*.py` を port する。 |
| W15 | `cli/lib/event_envelope.py`, `hook_payload.py` | `src/ut_tdd/events/*` | hook/CI event envelope を normalize する。 | `test_event_envelope_unit.py`、`test_hook_payload.py` を port する。 |
| W16 | `cli/lib/code_catalog.py`, `code_edges.py`, `code_recommender.py` | `src/ut_tdd/code_index/*` | merge gate ではなく trace hint と code ownership に使う。 | `test_code_catalog.py`、`test_code_edges.py`、`test_code_recommender.py` を port する。 |
| W16 | `cli/helix-asset`, `cli/templates/assets/*`, `docs/generated-assets.yaml` | `ut-tdd asset` or docs asset catalog | generated docs/assets governance に有用な optional 機能とする。 | `test-helix-asset.bats` を later smoke として port する。 |
| W17 | `cli/lib/lock_helper.py`, `concurrent_lock.py` | `src/ut_tdd/lock/*` | cross-platform file lock とし、stale lock が forever block しないようにする。 | `test_lock_skill.py`、`test_lock_critical_path.py`、`test_concurrent_lock.py`、`test_stale_lock_cleanup.py` を port する。 |
| W17 | `cli/lib/job_queue_helper.py`, `job_p0_guard.py` | `src/ut_tdd/jobs/*` | optional local queue とし、Phase 0 に background daemon を要求しない。 | `test_job_queue_helper.py`、`test_job_p0_guard.py` を port する。 |
| W17 | `rollback_orchestrator.py`, `cutover_orchestrator.py`, rollback/cutover docs | `src/ut_tdd/release/*`, `docs/release/` | release hardening として扱い、default developer path にはしない。 | `test_rollback_orchestrator_unit.py`、`test_cutover_orchestrator_unit.py` を port する。 |

## cross-cutting replacement checklist の確認

- [ ] `helix` command name を `ut-tdd` へ変更する。
- [ ] `.helix/` state path を `.ut-tdd/` へ変更する。
- [ ] migration/history doc を除き、`HELIX` product naming を `UT-TDD Agent Harness` へ変更する。
- [ ] `C:\Users\micro` などの absolute local path を runtime file から除去する。
- [ ] Linux-only shell call に PowerShell または Python equivalent を用意する。
- [ ] runtime-generated file を ignore する（`.ut-tdd/state/*`、`.ut-tdd/cache/*`、`.ut-tdd/audit/*`、`.ut-tdd/teams/local*.yaml`）。
- [ ] vendor candidate reference を canonical runtime input として使わない。
- [ ] ported test は Windows と POSIX で pass させる。難しい場合は POSIX-only と明記し、tracked follow-up を置く。

## wave ごとの acceptance

各 wave は、次を満たしたときだけ complete とする。

- UT-TDD target file が `vendor/` の外に存在する。
- 対応する test または fixture が `vendor/` の外に存在する。
- `git diff --check` が pass する。
- relevant smoke command が document 化されている。
- この file の porting row を、future PLAN で implemented と mark できる。
