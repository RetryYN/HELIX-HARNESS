---
schema_version: skill.v1
name: project-management
skill_type: process
applies_to:
  layers:
    - L1
  drive_models:
    - Forward
    - Add-feature
    - Discovery
    - Scrum
    - Reverse
    - Recovery
    - Incident
---

# project management（project 管理）

HELIX の複数 PLAN をまたぐ program / portfolio 視点を扱う
（FR-L1-01 PLAN-as-orchestration）。milestone の健全性、PLAN 間の依存順序、
stall 検出、program boundary での handover discipline を管理する。

`planning-and-task-breakdown` とは責務が異なる。そちらは 1 つの PLAN 内部
（frontmatter fields、§工程表 steps、WBS 粒度）の作成を扱う。この skill は 1 段上で、
どの PLAN が存在し、相互にどう依存し、program 全体が健全かを扱う。

## この skill を読むタイミング

- milestone または session handover 前に、複数 active PLAN をまたいだ program 状態を確認する。
- `ut-tdd doctor` または `ut-tdd status` が、複数 layer group にまたがる stalled / orphaned /
  dependency-blocked PLAN を示している。
- 新しい PLAN を起票するか既存 PLAN を拡張するかを判断する（overlap detection）。
- session boundary を越え、program-level handover を書く必要がある。
- Recovery または Incident drive で、影響 PLAN と unblock 順序を列挙する必要がある。

## Program health commands（program 健全性 command）

```
ut-tdd status               # 全 layer の active/stalled/draft PLAN を確認する
ut-tdd doctor               # program 全体の governance violation を確認する
ut-tdd graph                # dependency graph で cycle と orphan を見つける
ut-tdd plan lint            # PLAN ごとの schema と dependency existence を検証する
ut-tdd handover             # .ut-tdd/handover/CURRENT.json を生成する
ut-tdd metrics              # layer coverage などの progress signal を集計する
```

program review の開始時は `ut-tdd status` と `ut-tdd graph` をセットで実行する。
1 sprint を超えて `active` のまま `trace-freeze` へ進んでいない PLAN は stall signal とみなす。

## Requirement 単位の PLAN discipline

design artifact を必要とする FR には 1 FR につき 1 PLAN を対応させる。これは基礎 rule
（FR-L1-01）である。

- 複数 FR を 1 PLAN に押し込むと `ut-tdd plan lint` violation になる。
- requirement registry に対応 FR が無い PLAN は orphan であり、`ut-tdd doctor` が surface する。
- program 途中で新 FR が出た場合、implementation 前に PLAN を作る。後追い PLAN は Forward work ではなく
  Reverse back-fill である。

## Program level の dependency sequencing

`ut-tdd graph` は PLAN dependency graph 全体を表示する。agents へ parallel work を割り当てる前に、
次を行う。

1. critical path（`直列` dependencies の最長 chain）を特定する。
2. `並列`-safe な PLAN を印付ける（共有 design doc への同時 write が無く、`generates` target が重ならない）。
3. parallel / serial grouping を `.ut-tdd/handover/` の program milestone note に記録する。
   記憶だけに頼らない。

`ut-tdd graph` の cycle は hard block である。直接または推移的に自分自身へ依存する PLAN は前進できない。
共有 dependency を新しい upstream PLAN として切り出して解消する。

## Milestone handover discipline（milestone handover 規律）

各 program milestone（layer group Forward freeze、Sprint boundary、Recovery closure、
Incident post-mortem）で次を行う。

1. `ut-tdd status` を実行し、stalled な active PLAN が無いことを確認する。
2. `ut-tdd doctor` を実行する。milestone 宣言前に exit 0 が必須。
3. `ut-tdd handover` を実行し、program state snapshot を `.ut-tdd/handover/CURRENT.json` に書く。
4. handover の `carry` field には、実際の PLAN status と `git log` で検証した item だけを書く。
   PLAN registry で既に `done` の carry item を copy forward しない。
5. overwrite 前に、直前の `CURRENT.json` を `.ut-tdd/handover/archive/` へ archive する。

handover 記録の無い milestone は closed ではない。

## PLAN overlap detection（PLAN 重複検出）

新しい PLAN を作る前に次を実行する。

```
ut-tdd status               # 同じ layer/FR の既存 PLAN を確認する
ut-tdd plan lint            # duplicate plan_id を flag する
ut-tdd graph                # 提案した dependency が既に存在するかを表示する
```

candidate PLAN が既存 PLAN の `generates` artifacts の 50% 超を重複する場合、新規 PLAN ではなく
既存 PLAN を拡張する。

## Drive-model program patterns（drive model 別 pattern）

| Drive | program level の concern |
|-------|-----------------------|
| Forward | 1 FR につき 1 PLAN。layer-descending order を厳守する。 |
| Add-feature | 新 PLAN は `dependencies` に Reverse back-fill PLAN を必要とする。 |
| Recovery | まず影響 PLAN を列挙し、`troubleshoot` PLAN で unblock 順序を固定する。 |
| Incident | time-boxed。incident PLAN が `done` になるまで `status: active` PLAN を凍結する。 |
| Discovery | PoC PLAN は S0-S4 に time-box し、S4 で `decision_outcome` を必須にする。 |
| Scrum | Sprint boundary = milestone handover。carry items は code と照合して review する。 |

## Anti-patterns（避けるパターン）

- `ut-tdd handover` 出力を PLAN status 読解の代替にする。
  handover は snapshot であり live view ではない。`ut-tdd status` で検証する。
- child PLAN がすべて `done` ではないのに parent PLAN を `done` へ進める。
  program level の false-green になる。
- 特定 FR ではなく作業 grouping の都合で PLAN を作る。
  program scope を膨らませ、requirement 単位の traceability を壊す。
- 速度最大化のため全 step を `[並列]` にする。
  gate（pair-freeze、trace-freeze、accept）は常に `[直列]` であり、省略すると drift が隠れる。
