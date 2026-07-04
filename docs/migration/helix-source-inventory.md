# HELIX source snapshot inventory 記録

## Snapshot

| Item | Value |
|---|---|
| Source | `C:\Users\micro\ai-dev-kit-vscode` |
| Destination | `vendor/helix-source/` |
| Purpose | UT-TDD Agent Harness の TS 再実装に使う能力インベントリ / historical reference snapshot |
| Snapshot policy | 素材としては原則すべて保持し、正本化は段階再実装 / curate で行う。runtime として無修正転用しない |

## Copy した scope

| Top-level path | ファイル数 |
|---|---:|
| `.claude/` | 54 |
| `.claude-plugin/` | 2 |
| `.github/` | 9 |
| `.helix/` | 15 |
| `cli/` | 710 |
| `docs/` | 338 |
| `harness/` | 1 |
| `helix/` | 5 |
| `scripts/` | 6 |
| `skills/` | 255 |
| `src/` | 3 |
| `tests/` | 11 |
| `verify/` | 32 |
| `workflows/` | 1 |
| root files | 9 |

runtime cleanup 後の copied files は 1451 files、約 12.2 MiB。

## 除外した runtime / local state

この snapshot では local state と generated state を意図的に除外している:

- `.git/`
- `.pytest_cache/`
- `.venv/`, `venv/`, `node_modules/`
- `__pycache__/`, `.mypy_cache/`, `.ruff_cache/`
- `.helix/helix.db`
- `.helix/orchestration.db`
- `.helix/audit/`
- `.helix/cache/`
- `.helix/locks/`
- `.helix/tasks/`
- `.helix/tmp/`
- `.helix/budget/cache/`
- `.claude/settings.local.json`
- `.claude/agent-memory/`
- `.claude/scheduled_tasks.lock`
- `.env`, `.env.*`, `*.pem`, `*.key`, `credentials.json`

## Verification

copy 後に absence を確認したもの:

- `vendor/helix-source/.git`
- `vendor/helix-source/.pytest_cache`
- `vendor/helix-source/.helix/helix.db`
- `vendor/helix-source/.helix/orchestration.db`
- `vendor/helix-source/.helix/audit`
- `vendor/helix-source/.helix/cache`
- `vendor/helix-source/.helix/locks`
- `vendor/helix-source/.helix/tasks`
- `vendor/helix-source/.claude/settings.local.json`
- `vendor/helix-source/.env`

## Migration findings の記録

- snapshot 内の 1010 files には、まだ `HELIX`、`helix`、`ai-dev-kit-vscode`、`C:\Users\micro` references が残っている。
- `vendor/helix-source/.gitignore` には `.helix/**` を ignore する rules がある。この snapshot を commit し、`.helix` template files を保持する必要がある場合は、explicit force add するか、必要な templates を `docs/migration/` または UT-TDD template path へ移す。
- `.claude/settings.json` と hook scripts は、まだ original HELIX runtime と absolute local paths を指している。これらは import sources であり、ready-to-use UT-TDD configuration ではない。

## First migration targets の一覧

| Priority | Source | UT-TDD target |
|---|---|---|
| P0 | `cli/helix-doctor`, `cli/lib/doctor_*`, `cli/lib/setup_helper.py` | `ut-tdd doctor` / `ut-tdd setup` |
| P0 | `.claude/settings.json`, `.claude/hooks/*` | package-local Claude hook config の素材 |
| P0 | `cli/codex`, `cli/codex.ps1`, `cli/claude` | Windows-safe Codex / Claude shims |
| P1 | `cli/lib/team_runner.py`, `cli/templates/teams/*` | UT-TDD review/team runner |
| P1 | `skills/`, `skills/SKILL_MAP.md` | UT-TDD skill pack / role map の素材 |
| P1 | `docs/commands/ai-harness.md`, `docs/commands/index.md` | UT-TDD CLI docs |
| P2 | `docs/v2/`, `docs/plans/PLAN-080..100` | later migration 用の design assets |

## High-impact reuse backlog の一覧

この snapshot には、UT-TDD harness rebuild の大部分を guided できる reusable behavior と design ideas が十分含まれている。これらを Python code-port waves として扱ってはならない。TypeScript/Bun reimplementation waves として使う。

execution-level mapping は `docs/migration/helix-porting-map.md` で管理する。

| Wave | Source assets | UT-TDD feature | Reuse class | Notes 補足 |
|---|---|---|---|---|
| W1 | `cli/lib/plan_*`, `cli/templates/plan/*`, `cli/lib/tests/test_plan_*` | `ut-tdd plan lint`, PLAN templates, frontmatter schema | rename + adapt | leverage が最も高い。ほぼ pure Python / markdown で、external dependency は低い。 |
| W2 | `cli/lib/vmodel_*`, `cli/templates/state/vmodel.json`, `cli/lib/tests/test_vmodel_*` | `ut-tdd vmodel lint`, 4 artifact trace | adapt | enum names と UT-TDD trace wording を揃え、validator/test structure は保持する。 |
| W3 | `cli/lib/effort_classifier.py`, `task_type_inference.py`, `task_dispatcher.py`, `skill_recommender.py`, `skill_catalog.py`, related tests | `ut-tdd task classify`, `task estimate`, `skill suggest` | adapt | 新しい task/effort/skill commands に直接対応する。 |
| W4 | `cli/lib/team_runner.py`, `model_registry.py`, `model_fallback.py`, `budget.py`, `cli/templates/teams/*`, related tests | `.ut-tdd/teams/*.yaml`, orchestration policy | adapt | HELIX model names を capability classes (`frontier-reviewer`, `worker`, `fast-checker`) に置き換える。 |
| W5 | `cli/lib/handover.py`, `handover_auto_dump.py`, `transcript_summary.py`, `cli/templates/handover-*` | `ut-tdd handover`, session recovery | rename + adapt | cross-agent と crash/restart continuity に強く適合する。 |
| W6 | `.claude/hooks/*`, `.claude/settings.json`, `.claude/agents/*`, hook tests | Claude Code hook guard / subagent templates | harden + adapt | absolute paths を除去し、package-local `ut-tdd` 経由へ route しなければならない。 |
| W7 | `.github/workflows/*`, `scripts/git-hooks/*`, `.commitlintrc.json`, PR template | `harness-check`, commitlint, branch-kind-check | redesign wrapper + reuse snippets | 既存 branch workflows は required `harness-check` 1 本へ collapse する。 |
| W8 | `cli/lib/escalation_*`, `doctor_recovery_check.py`, `recovery_plan_check.py`, `deferred_findings.py` | escalation L0-L3, recovery PLAN, debt/carry | adapt | 適合度は高いが、local `.helix` DB assumptions は除去が必要。 |
| W9 | `cli/lib/scrum_*`, `reverse_local.py`, `scrum_to_reverse_routing.py`, matrix tests | Scrum x Reverse, R4 routing, `promotion_strategy` | adapt later | Phase 0 CLI が stable になった後に価値が高い。 |
| W10 | `skills/**/SKILL.md`, `docs/agent-skills/*`, references | `docs/skills/*.md` skill packs | curate | runtime config として bulk-copy してはならない。UT-TDD-owned skill docs へ変換する。 |

## Reuse classification の分類

| Class | Meaning | Examples |
|---|---|---|
| `copy-with-rename` | 主に HELIX から UT-TDD への path/name 変更で済む | PLAN templates, handover templates, commitlint |
| `adapt` | logic は残せるが、paths/enums/runtime state は変更が必要 | plan/vmodel validators, task classifier, skill recommender, team runner |
| `harden` | 有用だが、security/path/OS behavior を先に review する必要がある | hooks, Claude settings, shell scripts |
| `redesign-wrapper` | pieces は残し、新しい UT-TDD architecture で wrap する | GitHub workflows, branch protection, escalation aggregation |
| `curate` | knowledge asset であり、そのまま executable ではない | skills, docs, old PLANs, audit findings |

## Immediate Candidates for "7割構築"

usable system を素早く作ることが goal なら、以下の concrete modules と tests から始める:

- `plan_frontmatter.py`, `plan_parser.py`, `plan_schema.py`, `plan_validator.py`, `plan_lint.py`
- `vmodel_loader.py`, `vmodel_lint.py`
- `effort_classifier.py`, `task_type_inference.py`, `skill_recommender.py`, `skill_catalog.py`
- `team_runner.py`, `model_registry.py`, `model_fallback.py`, `budget.py`
- `handover.py`, `handover_auto_dump.py`
- `setup_helper.py`, `doctor_plan_checks.py`, `doctor_recovery_check.py`
- `agent_slots.py`, `agent_mandatory.py`, `agent_policy_guard.py`
- `llm_guard.py`, `research_guard.py`, `redaction.py`, `context_guard.py`
- `audit_validator.py`, `audit_inventory.py`, `audit_hash.py`
- `code_catalog.py`, `code_edges.py`, `code_recommender.py`
- `builders/*`
- corresponding `cli/lib/tests/test_*` files

これらはほぼ local logic であり、`.helix` paths、command names、HELIX-specific enums、Python state assumptions を特定した後に TypeScript/Bun で再実装する。

## Rule

`vendor/helix-source/` は read-only source material である。productizing 中に編集してはならない。selected markdown/templates は curate 対象になった場合だけ UT-TDD-owned paths へ copy する。executable behavior は UT-TDD-owned paths 配下で TypeScript/Bun により再作成する。
