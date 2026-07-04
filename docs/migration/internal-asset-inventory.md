# UT-TDD internal asset inventory 記録

Status: current-backfilled
Original audit date: 2026-05-29
Current backfill date: 2026-06-12

この document は、HELIX-derived internal runtime assets である subagents、skills、command templates の inventory を記録する。guard mechanism は存在したが、assets 自体がまだ UT-TDD-owned product assets として扱われていない gap が見つかったため、当初は `PLAN-RECOVERY-01` の evidence として作成した。

## Current status の記録

original gap は active repository では closed である。

- active subagent / skill / prompt assets は `asset-drift` で checked される。
- `ut-tdd doctor` は現在、HELIX path residue 0、legacy command residue 0、allowlist missing 0 を報告する。
- `pmo-helix-explorer` と `pmo-helix-scout` は vendor snapshot exploration roles としてのみ残る。HELIX runtime delegation paths ではない。
- HELIX-derived materials は、UT-TDD-owned paths へ curated されるまでは historical または migration reference のままである。

## Original finding の記録

initial inventory では 3 つの asset classes を確認した。

| Asset class | Original finding 元の所見 | UT-TDD target | Current control |
| --- | --- | --- | --- |
| subagent prompts | vendor から copied された 19 prompts に HELIX assumptions が残っていた | `.claude/agents/` で curated された Markdown prompts、role/capability/model boundary を定義 | `agent-guard`, `asset-drift`, `rule-drift` |
| skills | 107 vendor skill files があり、`docs/skills/` は当初 empty だった | curated UT-TDD skill docs と skill injection semantics | `docs/skills/`, `asset-drift` |
| command docs/templates | HELIX command docs は source material としてのみ存在した | UT-TDD CLI subcommands と templates | `ut-tdd` CLI, `schema` command validation |

## Subagent roster の記録

active roster は byte-for-byte vendor copy として扱わない。TypeScript guard と lint controls を持つ UT-TDD-owned prompt layer である。

| Category | Count 件数 | Guard treatment | Current role 現行役割 |
| --- | ---: | --- | --- |
| PMO | 9 | applicable な場合は allowlisted | project / tech / vendor snapshot exploration |
| PdM | 3 | allowlisted | optional な product / market / innovation analysis |
| review | 3 | allowlisted | code review、security audit、QA を担う |
| BE | 2 | direct Agent use から blocked | 必要時は `ut-tdd codex --role ...` へ route |
| DB | 1 | direct Agent use から blocked | 必要時は Codex role へ route |
| DevOps | 1 | direct Agent use から blocked | 必要時は Codex role へ route |

Closed risks:

- active assets 内の absolute local HELIX paths は許可しない。
- active assets 内の legacy HELIX command delegation は許可しない。
- Guard allowlist entries は agent prompt files へ resolve できなければならない。
- asset roots を enrolled した後に empty `docs/skills` を残すことは許可しない。

## Skill inventory の記録

vendor snapshot は read-only のままである。Skills は executable as-is ではなく、UT-TDD へ bulk-loaded しない。使用前に classify する。

| Class | Treatment |
| --- | --- |
| core | harness workflow に直接 tied している場合に UT-TDD-owned docs へ curate する |
| optional | PLAN が要求するまで reference として保持する |
| drop | future requirement が明示的に reopen しない限り migrate しない |

representative core candidates は Reverse、PoC、verification、quality、debt、design-doc、API contract、schedule/WBS、requirements handover、agent design、agent teams である。

## Command inventory の記録

HELIX commands は current operating paths ではない。Command behavior は UT-TDD subcommands として reimplemented または represented されなければならない。

Current rule:

- current commands は `ut-tdd` で始まる。
- recommended command schemas は HELIX command strings を reject する。
- historical command names は migration evidence、tests、または explicit "rejected/superseded" context に限って現れてよい。

## FR Backfill

original missing feature requirements は以下のように backfilled された:

| Candidate | Backfilled target | Meaning 意味 |
| --- | --- | --- |
| FR-AST-1 | FR-L1-46 | UT-TDD subagent roster hardening の要件 |
| FR-AST-2 | FR-L1-47 | UT-TDD skill pack curation の要件 |
| FR-AST-3 | FR-L1-48 | UT-TDD command/subcommand asset curation の要件 |
| FR-AST-4 | FR-L1-49 | internal asset drift lint の要件 |

## Reuse rule の規則

executable behavior は `src/` 配下で TypeScript/Bun により reimplemented する。Markdown assets は UT-TDD-owned paths へ curated してよいが、vendor files は read-only reference のままである。curation なしの runtime use は許可しない。
