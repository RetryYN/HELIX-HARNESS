---
schema_version: skill.v1
name: agent-teams
skill_type: orchestration
applies_to:
  layers:
    - L1
    - L3
    - L5
    - L6
    - L7
    - L8
  drive_models:
    - Forward
    - Add-feature
    - Discovery
    - Reverse
    - Recovery
---

# agent teams（チーム実行設計）

HELIX における multi-agent team runs の構造化を扱う。対象は frontier reviewer、
worker、fast checker の role separation、no-self-approval enforcement、team YAML authoring
（FR-L1-12 team run、harness pillar 5: risk または cost を下げる場合だけ roles/runtimes に work を分割）。

## この skill を読む条件

- `.ut-tdd/teams/<team>.yaml` team definition を作成または編集する。
- judgement gate が cross-runtime または cross-model-family review evidence を必要とする。
- Discovery または Add-feature PLAN が parallel worker + reviewer separation を必要とする。
- Recovery incident で fix 検証用の dedicated fast-checker role が必要。

## Team YAML structure（定義構造）

teams は次で実行する。

```
ut-tdd team run --definition .ut-tdd/teams/<team>.yaml
```

team definition は次を宣言する。

| Field | 用途 |
|---|---|
| `name` | team identifier |
| `roles` | role entries（name、agent、model、task）の ordered list |
| `mode` | `parallel` or `serial` |
| `judgement_gate` | binding verdict を出す role |

各 `agent` value は allowlisted `subagent_type` でなければならない。各 `model` は
その agent の frontmatter family と一致しなければならない。team runner は guard を緩めない。

## Role separation rules（役割分離ルール）

**No self-approval.** artefact を生成する agent は、judgement gate を clear する agent を兼ねてはならない。
worker と reviewer slots に different model families を割り当てて強制する。

| Slot | 割り当て例 | ルール |
|---|---|---|
| Worker / implementer | `pmo-haiku` | artefact を生成する |
| Reviewer / frontier | `code-reviewer`（primary model） | gate を clear する。different family を使う |
| Fast checker | `pmo-project-scout` | structural checks のみ担当し、final verdict は出さない |

single-runtime mode（second model family が無い場合）では、reviewer slot は gate を silent pass せず、
`.ut-tdd/audit/` に `intra_runtime_subagent` evidence を記録しなければならない。

## Judgement gate behaviour（判定 gate の挙動）

`ut-tdd gate <id>` は `ut-tdd status` から execution mode を読む。hybrid mode では
cross-family reviewer verdict が必要。single-runtime mode では `intra_runtime_subagent` record が最低条件。
limitation を文書化し、risk が高い場合は escalate する。

## Parallel vs serial mode（並列 / 直列の選択）

worker slots が ordering dependency の無い independent artefacts を生成する場合は `parallel` を使う。
later step が earlier step の verified output を必要とする場合は `serial` を使う
（例: research -> judgement -> ADR authoring）。single team definition 内で mode を混在させることは
supported ではないため、2 つの team runs に分割する。

## Team design checklist（設計チェックリスト）

- [ ] 各 `agent` value が guard allowlist 内にある。
- [ ] 各 `model` が明示され、agent の frontmatter family と一致する。
- [ ] worker と judgement-gate slots が different model families を使う
      （または `intra_runtime_subagent` evidence が planned）。
- [ ] `mode` が `parallel` または `serial` として明示されている。
- [ ] 初回 live execution 前に、`ut-tdd team run --definition <path>` を `--dry-run` equivalent で test 済み。
- [ ] post-run: agent narration を信頼せず、files read + `git status` で artefacts を verify する。

## Anti-patterns（避けるパターン）

- same agent role を worker と judgement-gate の両方へ割り当てる。
  guard はこれを強制しないため、team author が守る必要がある。
- step 2 が step 1 output に依存するのに `parallel` mode を使う。
  non-deterministic results を生む。
- role entry で `model` を省略する。guard は runtime で spawn を reject する。
