---
schema_version: skill.v1
name: planning-and-task-breakdown
skill_type: orchestration
applies_to:
  layers:
    - L1
    - L3
    - L5
    - L6
    - L7
  drive_models:
    - Forward
    - Add-feature
    - Reverse
    - Scrum
    - Discovery
---

# planning and task breakdown（計画と task 分解）

feature または requirement を PLAN hierarchy と schedule steps に分解する方法を扱う。
steps は agents に delegate するか、deterministically に実行できる粒度へ分ける
（FR-L1-01 PLAN management、FR-L1-13 Forward workflow）。

## この skill を読む条件

- `docs/plans/` に new PLAN file を書く。
- large requirement を child PLANs または schedule steps に分割する。
- `helix doctor` failure が orphaned PLAN または missing `generates` link を報告する。
- §工程表 schedule section に parallel/serial annotation が必要。

## Decomposition target: unit-test-design granularity（分解目標）

breakdown の正しい停止点は、1 つの design document と 1 つの test-design document の pair、
つまり L6/L7 の V-model pair である。unit-test-design granularity で verify できない step は大きすぎるため split する。

step が own design doc（own `generates` artifact）を生成する場合、child PLAN を作る。
standalone doc を生成しない steps は parent PLAN 内の schedule steps に留める。

## PLAN frontmatter の確認

`helix plan lint` を実行する前に、すべての field を確認する。

- [ ] `plan_id` が unique で、filename（`PLAN-<kind>-<NN>`）と一致する。
- [ ] `kind` が `design`、`impl`、`add-design`、`add-impl`、`poc`、
      `reverse`、`recovery`、`refactor`、`retrofit`、`research`、`troubleshoot` のいずれか。
- [ ] `layer` が PLAN の主 target である V-model layer を示す。
- [ ] `drive` が drive model（Forward、Add-feature、Reverse など）を宣言する。
- [ ] `status` が `draft`、`active`、`pair-freeze`、`trace-freeze`、`done`、`cancelled` のいずれか。
- [ ] `generates` が、この PLAN が生成するすべての design/test-design doc を列挙している。
- [ ] `dependencies` が、この PLAN が必要とするすべての upstream PLAN または doc を列挙している。
      referenced ID は resolve できなければならず、できない場合 `helix plan lint` が flag する。
- [ ] `trace-freeze` へ進む前に `review_evidence` が入力されている。

## §工程表（schedule steps）の書き方

schedule steps は numbered にし、execution mode を注釈する。

```
## §工程表
1. [並列] Author L5 detailed design doc — PLAN-L5-NN
2. [並列] Author L6 unit-test design doc — PLAN-L6-NN
3. [直列] pair-freeze review: helix review --uncommitted
4. [直列] implement src/ — PLAN-L7-NN
5. [直列] trace-freeze: bun run test && helix doctor
6. [直列] accept: helix review --uncommitted (no blocking findings)
```

`[並列]` steps は agents 間で concurrently に実行できる。`[直列]` steps は順番に complete する必要があり、
各 step が gate である。pair-freeze と trace-freeze の周辺に serial gate steps が無い schedule は
decomposition error。

## WBS の rule

- design doc を必要とする FR（requirement）ごとに 1 PLAN。
  multiple FRs を 1 PLAN にまとめることは lint violation。
- Add-feature kind では、`dependencies` field に Reverse back-fill pairing を宣言する必要がある。
- `poc` PLAN は Discovery phases（S0-S4）に従う。§工程表は S2(poc) と S3(verify) steps へ明示的に map する。

## Validation commands（検証 command）

```
helix plan lint            # schema、schedule、dependency existence
helix doctor               # harness governance gate 全体
helix graph                # PLAN dependency graph を可視化する
helix status               # active/stalled PLAN を表示する
```

## Anti-patterns（避けるパターン）

- layer annotation なしに "implement everything" と label された steps。
  coarse すぎる。V-model layer transition ごとに 1 step。
- `design` または `add-design` kind で `generates` が空。
  その PLAN が生成した doc は `helix doctor` から見えなくなる。
- `review_evidence` field 未入力のまま `status: done` にする。
  後続 doctor runs が可視化する false-green。
