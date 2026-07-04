---
schema_version: skill.v1
name: threat-model
skill_type: verification
applies_to:
  layers:
    - L2
    - L3
    - L4
    - L5
    - L7
  drive_models:
    - Forward
    - Add-feature
    - Reverse
    - Recovery
---

# threat model（脅威モデル）

HELIX の agent-facing surface に対する threat modeling procedure。
implementation 開始前に L2（screen / IA design）と L3（functional design）で適用する。
adversarial agent input、privilege escalation path、trust boundary violation を L7 code 到達前に
surface することで、FR-L1-09（safety design）を支える。

## この skill を読む条件

- PLAN が agent-callable surface（tool、hook、subagent slot、MCP endpoint）を導入または変更する。
- L2 または L3 design doc が新しい trust boundary（runtime -> OS、agent -> harness DB、
  external API -> harness）を追加する。
- `ut-tdd guardrail` が unresolved finding を報告する。
- Recovery PLAN で、incident 原因の threat が modelled / mitigated 済みであることを示す必要がある。

## HELIX の threat surface inventory

harness には 4 つの primary threat surface がある:

1. **Agent tool invocations.** subagent 内から呼べる任意の `ut-tdd` command。
   Threat: prompt injection による destructive command 実行
   （例: `db rebuild --force` に解決される crafted task string）。
2. **Hook entry points.** `PreToolUse`、`PostToolUse`、`SessionStart`、`Stop`、
   `SubagentStop` hook は stdin JSON を読む。
   Threat: malformed / adversarial JSON により fail-close ではなく fail-open behaviour になる。
3. **Agent allowlist.** `.claude/settings.json` の subagent type allowlist。
   Threat: unlisted agent type が `UT_TDD_ALLOW_RAW_AGENT=1` なしに guard を bypass する。
4. **State files.** doctor と projection writer が読む `.ut-tdd/` YAML/JSON file。
   Threat: broken system を green と報告させる crafted state。

## STRIDE-lite per surface（surface 別確認）

PLAN 内の各 surface について、L3 で次を記録する:

| Threat category | 回答すべき question |
|-----------------|-------------------|
| Spoofing | agent が持っていない role / identity を claim できるか。 |
| Tampering | agent が doctor を evades する形で `.ut-tdd/` state へ write できるか。 |
| Repudiation | 重要な agent action はすべて `.ut-tdd/audit/` に記録されるか。 |
| Information disclosure | hook または tool が credential、PII、session token を leak するか。 |
| Denial of service | malformed input が harness を loop / starvation させられるか。 |
| Elevation of privilege | subagent が evidence なしに guard bypass 必須 command を呼べるか。 |

未回答の question は open threat である。L3 design doc に記録し、pair-freeze 前に mitigation PLAN へ link する。

## Mitigation requirements（緩和要件）

- **Agent guard fail-close.** `agent-guard.ts` hook は unknown `subagent_type` または
  missing model field に対して non-zero で終了しなければならない。fail-open は許容しない。
- **No credentials in state.** `.ut-tdd/`、`docs/`、audit evidence、handover file に
  API key、password、session token を含めない。これらの path に触る PLAN を accept する前に
  `ut-tdd guardrail` を実行する。
- **Audit trail.** すべての guard bypass（`UT_TDD_ALLOW_RAW_AGENT=1` 経由）は
  `.ut-tdd/audit/` に evidence record を書く。trace の無い bypass は禁止。
- **Input validation.** Hook stdin JSON は schema で validate する。invalid payload は silent ignore ではなく
  fail closed する。

## Threat model record（記録形式）

`docs/design/L3/<plan-id>-threat-model.md` に threat model summary を書く:

```
## Trust boundary: <name>
- Surfaces: <list>
- STRIDE findings:
  - <threat category>: <description> -> <mitigated by X | OPEN>
- Residual risks: <list or "none">
- Reviewed by: <agent-slug or "intra_runtime_subagent">
- Date: <ISO-8601>
```

pair-freeze 前に、この doc を PLAN の `review_evidence` field から link する。

## Anti-patterns（避けるパターン）

- "internal-only" surface の threat modelling を skip する。
  agent guard は external bypass attempt を捕捉するが、internal surface も prompt injection で同様に exploit され得る。
- threat model output を handover file へ直接書く。
  artifact を versioned にし、`ut-tdd doctor` が見つけられるよう `docs/design/L3/` を使う。
- `ut-tdd guardrail` green を complete threat model と扱う。
  guardrail は secret と known pattern を検査する。novel attack surface は手動で列挙しなければならない。
