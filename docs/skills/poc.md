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
  development_styles:
    - FULL_L1_L12_V
    - PRODUCTION_SCRUM
    - V_DESIGN_SCRUM_IMPLEMENTATION
  case_driven_models:
    - Discovery
    - PoC
---

# PoC 運用

HELIX 内で time-boxed Proof of Concept を実行する方法を扱う
（FR-L1-15 case-driven S0-S4 の仮説から判断までの loop、FR-L1-43 PoC success criteria、
`decision_outcome` recording）。PoC は informal spiking ではなく、machine-recorded investigation cycle である。
採択後のproduction development styleへ進む前に、decision outcomeはPLAN stateと`.helix/`へ
着地していなければならない。

## この skill を読む条件

- case-driven cycleがS2（poc）へ到達し、hypothesisに答えるcodeまたはintegration testが必要。
- `kind: poc` の PLAN を作成または進行している。
- S3 verifyで、S4 decide前のexperimental evidenceが必要。
- `helix doctor` が `decision_outcome` field の無い `poc` PLAN を flag する。

## case-driven phaseのmapping（S0-S4）

| Phase | HELIX action |
|-------|--------------|
| S0 hypothesis | PLAN本文の`## 仮説`へ検証対象を明示し、PLAN `kind: poc`を作成して`status: draft`にする |
| S1 experiment plan | PLAN本文の`## PoC受入条件`へ判定条件を書き、time-boxを設定し、`helix plan lint`が0で終了する |
| S2 poc | `tests/poc/` または tagged branch に spike code / integration test を作成し、evidence を収集 |
| S3 verify | PLAN本文のPoC受入条件に対してevidenceをreviewし、PLANに対して`helix review --uncommitted`を実行する |
| S4 decide | `decision_outcome`を`confirmed` / `rejected` / `pivot`に設定し、PLANを`confirmed`または`completed`へ進め、continuation projectionを確認する |

PLAN `status` field は phase を追跡する:
S0〜S3は`draft`を維持し、S4 decision receiptが揃った後だけ`confirmed`または`completed`へ進める。

## PoC の PLAN frontmatter

```yaml
plan_id: PLAN-DISCOVERY-NN-projection-performance
title: "PLAN-DISCOVERY-NN: projection性能仮説"
kind: poc
layer: cross
workflow_phase: S2
drive: fe
status: draft
created: 2026-MM-DD
updated: 2026-MM-DD
owner: AI
agent_slots:
  - role: aim
    slot_label: "AIM — 仮説とS4判断境界を整理"
generates:
  - artifact_path: docs/plans/PLAN-DISCOVERY-NN-projection-performance.md
    artifact_type: markdown_doc
dependencies:
  parent: null
  requires: []
  references: []
```

本文へ次を記録する。

- `## 仮説`: VitestはCI hardware上で500件のharness-db projectionを2秒未満で処理できる。
- `## PoC受入条件`: `npm test`が2秒未満で完了し、3回連続実行でmemory leakがない。

`workflow_phase: S4`で`decision_outcome`が空のPLANや、S4前に`confirmed`／`completed`を
主張するPLANは`helix plan lint`がrejectする。

## case-driven PoCの§工程表

```
## §工程表
1. [直列] PLAN frontmatter + hypothesis を作成する (S0-S1)
2. [直列] helix plan lint — schemaとcase-driven phaseが正しい
3. [並列] tests/poc/ または scoped branch で spike を実装する (S2)
4. [並列] evidence を収集する: timing、logs、error rates
5. [直列] helix review --uncommitted — poc_criteria に対する findings (S3)
6. [直列] decision_outcome を設定し、PLAN status を更新し、helix doctor を実行する (S4)
7. [直列] helix status — DB projection に outcome と次 action が反映されたことを確認する
```

## Decision outcomes（判断 outcome）

- **confirmed**: hypothesis confirmed。選択済みの`FULL_L1_L12_V`、`PRODUCTION_SCRUM`、
  `V_DESIGN_SCRUM_IMPLEMENTATION`のいずれかへ接続する後続PLANを作成し、その`dependencies`から
  PoC PLANをlinkする。PoC自体をdevelopment styleへ読み替えない。
- **rejected**: hypothesis falsified。同じspikeを繰り返さないよう、理由をS4 decision receiptへ記録する。
- **pivot**: 元の仮説を採択せず、新しい仮説と変更理由をS4 decision receiptへ記録する。
  blocker 解消後に S1 へ戻る。

`confirmed` decisionにより選択済みdevelopment style上の正式なPLANが作られるまで、
`tests/poc/` の spike code を `src/` へ merge しない。

## Validation commands（検証 command）

```
helix plan lint            # case-driven phaseとdecision_outcome境界を検査する
helix doctor               # S4前のproduction claimや未決定outcomeをflagする
helix review --uncommitted # S3 gate evidence
helix status               # stalled Discovery PLANs を surface する
```

## Anti-patterns（避けるパターン）

- `adopt` decision と follow-on `add-impl` PLAN なしに spike code を直接 `src/` へ昇格する。
  これは V-model descent と Reverse back-fill を bypass する。
- `status: done` 後も `decision_outcome` を空のままにする。
  `helix doctor` が surface する false-green になる。
- PoC results を chat や commit message だけに書く。
  session boundary を越えて残すには、evidence を `review_evidence` または `.helix/audit/` に置く必要がある。
- spike だけを time-box し、decision phase を time-box しない。
  S4 decide date の無い PoC は indefinite `active` state として蓄積する。
