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

feature や requirement を PLAN 階層と工程 step へ分解する方法を扱う。
step は agent へ委譲できるか、決定的に実行できる粒度まで分ける
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

`[並列]` step は複数 agent が同時並行で実行できる。`[直列]` step は順番に完了させる必要があり、
各 step が gate である。pair-freeze と trace-freeze の周辺に直列 gate step が無い工程表は
分解の誤りである。

## 分割の向き — 縦割り優先・横割り禁止

step / child PLAN の切り方は**縦割り（垂直スライス）**を優先する: 1 step が薄くても
end-to-end で検証可能な振る舞いを届ける単位で切る。「DB 層」「API 層」「画面層」のような
**横割りは task であって独立検証可能な step ではない** — 横割りの step は単体では accept 判定が
できず、「垂直スライスの偽装」（デモは通るが裏が繋がっていない。acceptance-criteria-thinking §2）
を生む温床になる。分割してもなお 1 step が大きすぎる（design doc + test design の pair に
収まらない）なら、それは分割の失敗ではなく理解の不足の信号 — design へ戻る。

## 前倒しで作り込まない（漸進的詳細化）

まだ着手しない将来 step の受入条件・詳細設計を先に埋めない。粒度を粗いまま置くのは正しい
（skip 扱いにするのとは違う）。前倒しで書いた詳細は、着手時点で要件が動いて書き直しになるか、
書き直されずに乖離したまま正本を汚す。詳細化するのは「次に着手する step」だけである
（design-tailoring §3 の粒度基準と同一原則）。

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
