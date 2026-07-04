---
schema_version: skill.v1
name: poc
skill_type: verification
applies_to:
  layers:
    - L1
    - L2
  drive_models:
    - Discovery
    - Scrum
    - Forward
---

# PoC 運用

UT-TDD 内で time-boxed Proof of Concept を実行する方法を扱う
（FR-L1-15 Discovery S0-S4 の仮説から判断までの loop、FR-L1-43 PoC success criteria、
`decision_outcome` recording）。PoC は informal spiking ではなく、machine-recorded investigation cycle である。
Forward implementation へ進む前に、decision outcome は PLAN state と `.ut-tdd/` に着地していなければならない。

## この skill を読む条件

- Discovery cycle が S2（poc）に到達し、hypothesis に答えるための code または integration test が必要。
- `kind: poc` の PLAN を作成または進行している。
- Scrum S3 verify step で、S4 decide 前の experimental evidence が必要。
- `ut-tdd doctor` が `decision_outcome` field の無い `poc` PLAN を flag する。

## Discovery phase の mapping（S0-S4）

| Phase | UT-TDD action |
|-------|--------------|
| S0 backlog | FR を elicited。`hypothesis` field 付きで PLAN `kind: poc` を作成し、`status: draft` |
| S1 plan | PLAN `poc_criteria` field に acceptance criteria を書き、time-box を設定し、`ut-tdd plan lint` が 0 で終了 |
| S2 poc | `tests/poc/` または tagged branch に spike code / integration test を作成し、evidence を収集 |
| S3 verify | `poc_criteria` に対して PoC evidence を review し、PLAN に対して `ut-tdd review --uncommitted` を実行 |
| S4 decide | `decision_outcome` を `adopt` / `reject` / `defer` に設定し、PLAN を `done` または `cancelled` へ進め、handover を書く |

PLAN `status` field は phase を追跡する:
`draft`（S0-S1） -> `active`（S2） -> `trace-freeze`（S3） -> `done` / `cancelled`（S4）。

## PoC の PLAN frontmatter

```yaml
kind: poc
layer: L2
drive: Discovery
status: active
hypothesis: "Can Vitest handle 500 harness-db projections in under 2 s?"
poc_criteria:
  - "bun run test completes under 2000 ms on CI hardware"
  - "No memory leak observed in 3 consecutive runs"
decision_outcome: ""   # filled at S4
generates:
  - docs/design/poc/L2-poc-projection-perf.md
review_evidence: []
```

`done` status なのに `decision_outcome` が空の `poc` PLAN は、`ut-tdd plan lint` が reject する。

## Discovery PoC の §工程表

```
## §工程表
1. [直列] PLAN frontmatter + hypothesis を作成する (S0-S1)
2. [直列] ut-tdd plan lint — schema と poc_criteria が存在する
3. [並列] tests/poc/ または scoped branch で spike を実装する (S2)
4. [並列] evidence を収集する: timing、logs、error rates
5. [直列] ut-tdd review --uncommitted — poc_criteria に対する findings (S3)
6. [直列] decision_outcome を設定し、PLAN status を更新し、ut-tdd doctor を実行する (S4)
7. [直列] ut-tdd handover — 次 session / agent のために outcome を記録する
```

## Decision outcomes（判断 outcome）

- **adopt**: hypothesis confirmed。productionise 用に Forward `add-impl` PLAN を作成し、
  new PLAN の `dependencies` から PoC PLAN を link する。
- **reject**: hypothesis falsified。PLAN は `status: cancelled`。同じ spike を繰り返さないよう、
  理由を `review_evidence` に記録する。
- **defer**: inconclusive。blocker を `review_evidence` に記録し、handover に TTL を設定する。
  blocker 解消後に S1 へ戻る。

`adopt` decision により Reverse back-fill pairing 付きの正式な `add-impl` PLAN が作られるまで、
`tests/poc/` の spike code を `src/` へ merge しない。

## Validation commands（検証 command）

```
ut-tdd plan lint            # poc_criteria と decision_outcome を検査する
ut-tdd doctor               # done なのに outcome が空の poc PLAN を flag する
ut-tdd review --uncommitted # S3 gate evidence
ut-tdd handover             # 次 session への S4 baton
ut-tdd status               # stalled Discovery PLANs を surface する
```

## Anti-patterns（避けるパターン）

- `adopt` decision と follow-on `add-impl` PLAN なしに spike code を直接 `src/` へ昇格する。
  これは V-model descent と Reverse back-fill を bypass する。
- `status: done` 後も `decision_outcome` を空のままにする。
  `ut-tdd doctor` が surface する false-green になる。
- PoC results を chat や commit message だけに書く。
  session boundary を越えて残すには、evidence を `review_evidence` または `.ut-tdd/audit/` に置く必要がある。
- spike だけを time-box し、decision phase を time-box しない。
  S4 decide date の無い PoC は indefinite `active` state として蓄積する。
