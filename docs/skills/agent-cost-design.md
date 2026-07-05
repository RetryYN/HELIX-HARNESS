---
schema_version: skill.v1
name: agent-cost-design
skill_type: orchestration
applies_to:
  layers:
    - L1
    - L2
    - L3
    - L7
  drive_models:
    - Forward
    - Add-feature
    - Discovery
---

# エージェントコスト設計

lightweight subagent roles へいつ・どう delegate するか、そして高価な model capacity を必要な場所だけで使う
agent orchestration をどう設計するかを扱う
（FR-L1-37 model/effort recommendation、FR-L1-38 model evaluation、harness pillar 5 の方針:
risk または cost を下げる場合だけ work を roles/runtimes へ分割）。

## この skill を読む条件

- research または summarisation subtask が primary model の large context を消費しそう。
- `helix claude --role <role>` を呼ぶ前に delegation を構造化する必要がある。
- Discovery / Scrum cycle に、parallel sub-tasks へ分割できる broad exploration phase がある。

## モデル階層の割り当て

| タスク種別 | 割り当て先 |
|---|---|
| 複数 source の web research、docs summarisation | `pmo-haiku` |
| 収集済み facts からの hypothesis generation | `pmo-haiku` |
| ADR 作成、gate review、design judgement | primary session model |
| Security / adversarial review | primary model または `security-audit` / `code-reviewer` |
| 定型 status / handover formatting | `pmo-haiku` |

subtask が parallelisable で、repository-state judgement を必要とせず、cost saving が verification overhead を上回る場合、
delegation は正当化できる。subagent spawn 時は必ず `model` を明示する。
model 省略は expensive parent model を inherit し、budget を消費する。

## helix 経由の delegation

```
helix claude --role pmo-haiku --task "..."            # execute
helix claude --role pmo-haiku --task "..." --dry-run  # inspect the prompt first
```

subagent calls は raw provider spawn ではなく、`helix claude` / `helix codex` /
`helix team run` 経由で route する。session lifecycle、handover warnings、cost telemetry を capture するのは wrapper だけ。

## delegation prompt の構造

含めるもの: (1) objective — どの decision に効くか、(2) scope constraints、(3) required output format、
(4) research の source-count floor（`research` skill 参照）、(5) bare summary ではなく reasoning-chain requirement
（観測事実 -> 解釈 -> 仮説 -> 検証方法）。

## delegated output の検証

delegated agent output は claim であり evidence ではない。authoritative として記録する前に、
少なくとも 1 つの cited source を自分で spot-check し、reasoning chain が存在することを確認する。
output が既存 PLAN dependency または ADR decision を変える場合は full review gate へ escalate する。
agent が報告した counts は narration を信じず、自分で recompute する。

## cost evidence の記録

Token/cost telemetry は `helix telemetry` で expose され、`model_runs` へ project される（FR-L1-38）。
agent call path を追加する場合は run metadata（runtime、model、role、drive、plan_id、timings）を記録する。
metadata のみで、prompt/response text、credentials、PII は記録しない。call が wrapper を外れた場合は、
cost obligation が silent drop されないよう manual `.helix/audit/` entry を記録する。

## Anti-patterns（避けるパターン）

- repository-state judgement（"is this PLAN complete?"）を lightweight role に delegate する。
  `.helix/` state を信頼できる精度で読めない。
- well-structured parallel split の方が安い場面で sequential delegations を行う。
- spot-check なしに raw delegated output を PO へ forward する。
