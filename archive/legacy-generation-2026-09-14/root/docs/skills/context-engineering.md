---
schema_version: skill.v1
name: context-engineering
skill_type: orchestration
applies_to:
  layers:
    - L1
    - L3
    - L6
    - L7
    - L8
    - L9
    - L10
    - L11
    - L12
    - L13
  drive_models:
    - Forward
    - Discovery
    - Scrum
    - Reverse
    - Recovery
    - Add-feature
---

# context engineering（context 設計）

各 V-model layer invocation へ何を inject するか、context budget 内に収める方法、
すべてを pre-load せず dynamic skill loading を使う条件を扱う
（FR-L1-12 per-layer context/skill injection、harness pillar 4 dynamic context / skill injection の方針）。

## この skill を読む条件

- subagent または team-run prompt に含める docs を設計する。
- subagent prompt が context budget を超えそうである（Sonnet-class model の実用上限は約 200 KB）。
- context injection rule が必要な新しい V-model layer を harness に追加する。
- `helix skill suggest --plan <path>` output に基づいて作業する。

## layer 別 injection table

current task に実際に必要な layer だけを load する。full doc tree を pre-load しない。

| Layer group | 標準 injection | 動的に追加するもの |
|---|---|---|
| L0-L3（concept / requirement） | `CLAUDE.md`、`docs/governance/README.md`、concept / requirements docs | 関連 ADR、L0 glossary |
| L4-L6（design） | feature の L3 requirements、PLAN doc、design doc skeleton | `documentation-and-adrs` skill、parent design doc |
| L7（implementation） | PLAN doc、L6 function-spec、`src/` target files を読む | `gate-planning` skill、test file を追加 |
| L8-L10（integration / system test） | PLAN、test-design doc、`tests/` target を読む | `harness-observability` skill を追加 |
| L11-L14（acceptance / production） | PLAN、acceptance criteria、`helix doctor` output を読む | ADR list、handover state を追加 |

subagent prompt を組み立てる前に、`helix skill suggest --plan <path>` で specific PLAN 向けの
computed skill recommendation を取得する。

## Context budget rules（budget ルール）

- Primary session context ceiling（実用値）は約 150-200 KB。response 用に約 30 KB を残す。
- 追加で load する doc は file size 全体を消費する。bulk directory load ではなく対象を絞ったファイル読み込みを優先する。
- skill は 1 件あたり約 2-4 KB。full catalog ではなく、最も relevant な 1-3 件だけを load する。
- `CLAUDE.md` + `.claude/CLAUDE.md` は合計で約 10 KB。常に含まれるため、prompt 内で内容を重複させない。
- 大きな governance docs（concept、requirements）は各 15-20 KB 程度。design-authority context が必要な場合だけ load する。

## Dynamic loading procedure（動的 load 手順）

1. `helix skill suggest --plan <path>` を実行し、recommended skill set を取得する。
2. top 1-3 skills を load する。task が複数 layer にまたがる場合は、highest-risk layer 用 skill を先に load する。
3. subagent prompt では、その subagent が specific subtask を完了するために必要な docs だけを含める。
   full primary session context を転送しない。
4. load 後、spawn 前に total injected size が budget 内に収まることを確認する。

## Inject しないもの

- Migration snapshot（`docs/archive/`、`vendor source snapshot`）は historical only。
  forward work には不要。
- full `docs/plans/` directory は渡さない。single relevant PLAN file を渡す。
- session log や raw `harness.db` dump は渡さない。代わりに `helix metrics` / `helix find` query を使う。
- credential、API key、PII は prompt context に入れない。safety boundary は `CLAUDE.md` を参照する。

## Skill injection vs static load（動的 injection と静的 load）

Static load（`CLAUDE.md` の read order に載る files）は task に関係なく every session で消費される。
Dynamic load は runtime の task により trigger される。typical session の半分未満にしか適用されない skill は
static read order から外し、`helix skill suggest` または明示的なファイル読み込みで動的に load する。
