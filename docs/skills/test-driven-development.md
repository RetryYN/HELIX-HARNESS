---
schema_version: skill.v1
name: test-driven-development
skill_type: testing
applies_to:
  layers:
    - L6
    - L7
    - L8
  drive_models:
    - Forward
    - Add-feature
    - Reverse
    - Refactor
---

# TDD（test-driven development）の規律

UT-TDD の Red-first TDD discipline
（FR-L1-02 test-first implementation order、FR-L1-50 strict TDD/DDD enforcement）を扱う。
implementation 後に書かれた test は design signal を持たず、oracle value も弱い。
この harness では cycle order は non-negotiable である。

## この skill を読む条件

- Forward または Add-feature PLAN で pair-freeze から L7 implementation へ進む。
- Refactor PLAN が source に触れる前に regression coverage を再確認する必要がある。
- Reverse back-fill が existing code path に対する test-first evidence を必要とする。
- `ut-tdd doctor` または `ut-tdd review --uncommitted` が missing test、
  または implementation commit より後の test を flag する。

## Red-Green-Refactor cycle（UT-TDD order）の手順

### 1. Red — failing test を先に書く

- PLAN と paired された L6 unit-test design doc から test contract を導く。
  test を書く前に L6 doc は存在し readable でなければならない。
- `tests/` に single behaviour を exercise する `describe` / `it` block を 1 つ書く。
  `bun run test` を実行し、test が **fails**（Red）することを確認する。
- source change 前に test が pass する場合、それは vacuous assertion か feature が既に存在することを示す。
  どちらも調査が必要で、celebration ではない。
- failing test を standalone commit として commit し、Red evidence を git history に残す
  （FR-L1-02 traceability requirement）。

### 2. Green — pass する最小 source を書く

- new test(s) を pass させるために必要な implementation だけを追加する。
  untested surface area を追加しない。
- `bun run test` を再実行し、既存 tests がまだ pass し、new test が Green になったことを確認する。
- `bun run typecheck` と `bun run lint` を実行する。new violations は許可しない。
- `ut-tdd doctor` を実行する。governance は clean を維持する。

### 3. Refactor — tests Green のまま structure を改善する

- source と tests を rename、extract、reorganise する。behaviour changes はしない。
- 各 structural change 後に full suite
  （`bun run typecheck && bun run lint && bun run test && ut-tdd doctor`）を再実行する。
- test が 1 つでも Red になったら停止し、最後の change を revert する。

## Trace-freeze checklist（review gate 前）

- [ ] 各 new test file が `docs/test-design/` の L6 unit-test design entry に map されている。
- [ ] PLAN `review_evidence` が failing-commit SHA への reference を含む。
- [ ] `bun run test` が 0 で終了し、PLAN-linked rationale の無い `.skip` または `.todo` が残っていない。
- [ ] `bun run typecheck` exits 0.
- [ ] `bun run lint` が exit 0（Biome check: format + lint。`biome lint` 単体ではない）。
- [ ] `ut-tdd doctor` exits 0.
- [ ] `ut-tdd review --uncommitted` が L7 の blocking findings を出さない。

## Oracle strength rules（oracle 強度 rule）

- deterministic な箇所では exact values または structural equality を assert する。
  complex objects に対する `toBeTruthy()` は避ける。non-null なら何でも pass する。
- mock は process boundaries（I/O、network、DB）だけに使う。unit under test を mock しない。
- integration paths（`tests/integration/`）は mocked replacements ではなく real harness state
  （`.ut-tdd/`、`harness.db`）に hit しなければならない。
  過去の incident では mock/real divergence が broken migration path を隠した。

## Anti-patterns（避けるパターン）

- placeholder として `it.todo` を書き、source を先に implement して後から test を埋める。
  cycle order を反転させ、Red evidence を失う。
- `bun run test` ではなく `bun test` を実行する。
  native runner には 5-second sync timeout があり、real failures を反映せず async tests を flaky にすることがある。
- `ut-tdd doctor` green を test design correctness の evidence として扱う。
  doctor は structural governance を確認するが、oracle quality や cycle order は確認しない。
