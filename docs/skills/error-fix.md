---
schema_version: skill.v1
name: error-fix
skill_type: process
applies_to:
  layers:
    - L4
    - L6
    - L7
    - L8
  drive_models:
    - Recovery
    - Incident
    - Forward
    - Add-feature
    - Reverse
---

# error fix（エラー修正）

Recovery または Incident drive の下で、confirmed defect に targeted fix を適用する。
original error を捕捉できたはずの regression test が Green になり commit されるまで、fix は complete ではない。
regression tests なしの fix は繰り返される。harness は fix-without-test を incomplete unit of work として扱う。

## この skill を読む条件

- `ut-tdd doctor` check、CI failure、runtime error が defect と確認済み
  （flaky environment issue ではない）。
- Recovery または Incident PLAN が open で、root cause が特定済み。
- Forward または Add-feature PLAN が implementation 中に adjacent code の defect を発見した。
  fix は別 scope・別 commit にする必要がある。

## Fix protocol（修正手順）

### 1. source に触れる前に reproduce する

source を変更する前に、error を reproduce する failing test を書く。
これは fix の Red step であり、defect が real であることを確認し、regression fence を与える。

```
bun run test tests/<affected>.test.ts
```

test は current HEAD で、修正対象と同じ exact error により fail しなければならない。
failing test は `test(module): add regression for <error>` のような message で commit する。

### 2. fix の scope を決める

module に L5 design doc が存在する場合は読み、error がどれかを特定する。

- function boundary 内の **logic error** — source のみで fix する。
- **contract violation** — function は spec 通りだが spec が誤っている。先に L5 doc を更新し、その後 source を fix する。
- **missing guard** — spec が cover していない input case。source fix 前に L5 と L6 へ case を追加する。

spec と矛盾する source を、spec 更新なしに fix しない。これは `ut-tdd doctor` が検出できない可能性のある
descent gap を作る。

### 3. minimal fix を適用する

regression test を Green にするために必要な行だけを変更する。同じ commit で adjacent code cleanup や refactor を行わない。
scope creep は review を難しくし、secondary defect を入れた場合の revert も難しくする。

full gate sequence を実行する。

```
bun run typecheck && bun run lint && bun run test && ut-tdd doctor
```

fix commit 前にすべての gates が Green でなければならない。

### 4. evidence を記録する

- PLAN または audit entry を参照する `fix(module): description` message で fix を commit する。
- PLAN `review_evidence` field を regression-test SHA と fix SHA で更新する。
- fix が public API または `.ut-tdd/` state structure に触れる場合、PLAN close 前に
  `ut-tdd review --uncommitted` を実行する。

## Recovery / Incident exit conditions（終了条件）

Recovery または Incident 配下の fix PLAN は、次を満たす場合だけ close する。

- [ ] regression test が Green で、fix commit 前に commit 済み。
- [ ] `bun run typecheck && bun run lint && bun run test && ut-tdd doctor`
      が fix HEAD ですべて green。
- [ ] root cause を PLAN または `.ut-tdd/audit/` entry に記録済み
      （defect の内容だけでなく、それを許した条件を書く）。
- [ ] prevention measure を特定済み。new `ut-tdd doctor` gate、lint rule、
      または earlier に捕捉できた design doc update のいずれか。
- [ ] `ut-tdd review --uncommitted` に blocking findings が無い。
- [ ] Handover が updated または closed（`ut-tdd handover`）。

## Anti-patterns（避けるパターン）

- reproduction test なしに source を fix する。
  fix が defect を実際に address したか検証できず、同じ defect が silent re-enter しうる。
- fix commit に refactor を含める。
  regression bisection を難しくし、異なる種類の change を混ぜてしまう。
- prevention measure を記録せずに Recovery PLAN を close する。
  harness は re-occurrence prevention を exit contract として要求する（forced-stop Recovery policy）。
- defect を表面化させた type error を `// @ts-ignore` で黙らせる。
  type error は evidence であり、黙らせると future regressions が隠れる。
