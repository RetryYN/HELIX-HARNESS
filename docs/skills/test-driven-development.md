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

HELIX の Red-first TDD discipline（Red 先行 TDD 規律）
（FR-L1-02 test-first implementation order、FR-L1-50 strict TDD/DDD enforcement）を扱う。
implementation 後に書かれた test は design signal（設計 signal）を持たず、oracle value（検証価値）も弱い。
この harness では cycle order（サイクル順序）は non-negotiable（交渉不可）である。

## この skill を読む条件

- Forward または Add-feature PLAN で pair-freeze から L7 implementation へ進む。
- Refactor PLAN が source に触れる前に regression coverage（回帰被覆）を再確認する必要がある。
- Reverse back-fill が existing code path（既存 code path）に対する test-first evidence を必要とする。
- `helix doctor` または `helix review --uncommitted` が missing test、
  または implementation commit より後の test を flag する。

## Red-Green-Refactor cycle（HELIX order）の手順

### 1. Red — failing test を先に書く

- PLAN と paired された L6 unit-test design doc から test contract（テスト契約）を導く。
  test を書く前に L6 doc は存在し readable でなければならない。
- `tests/` に single behaviour（単一の振る舞い）を exercise する `describe` / `it` block を 1 つ書く。
  `bun run test` を実行し、test が **fails**（Red）することを確認する。
- source change 前に test が pass する場合、それは vacuous assertion か feature が既に存在することを示す。
  どちらも調査が必要で、celebration ではない。
- failing test を standalone commit として commit し、Red evidence（Red 証跡）を git history に残す
  （FR-L1-02 traceability requirement）。

### 2. Green — pass する最小 source を書く

- new test(s) を pass させるために必要な implementation だけを追加する。
  untested surface area（未検証 surface）を追加しない。
- `bun run test` を再実行し、既存 tests がまだ pass し、new test が Green になったことを確認する。
- `bun run typecheck` と `bun run lint` を実行する。new violations は許可しない。
- `helix doctor` を実行する。governance は clean を維持する。

### 3. Refactor — tests Green のまま structure を改善する

- source と tests を rename、extract、reorganise する。behaviour changes（振る舞い変更）はしない。
- 各 structural change（構造変更）後に full suite
  （`bun run typecheck && bun run lint && bun run test && helix doctor`）を再実行する。
- test が 1 つでも Red になったら停止し、最後の change を revert する。

## Trace freeze checklist（trace 凍結確認 / review gate 前）

- [ ] 各 new test file が `docs/test-design/` の L6 unit-test design entry に map されている。
- [ ] PLAN `review_evidence` が failing-commit SHA への reference を含む。
- [ ] `bun run test` が 0 で終了し、PLAN-linked rationale の無い `.skip` または `.todo` が残っていない。
- [ ] `bun run typecheck` exits 0.
- [ ] `bun run lint` が exit 0（Biome check: format + lint。`biome lint` 単体ではない）。
- [ ] `helix doctor` exits 0.
- [ ] `helix review --uncommitted` が L7 の blocking findings を出さない。

## Oracle strength rules（oracle 強度規則）

- deterministic（決定的）な箇所では exact values または structural equality を assert する。
  complex objects に対する `toBeTruthy()` は避ける。non-null なら何でも pass する。
- mock は process boundaries（I/O、network、DB）だけに使う。unit under test を mock しない。
- integration paths（`tests/integration/`）は mocked replacements ではなく real harness state
  （`.helix/`、`harness.db`）に hit しなければならない。
  過去の incident では mock/real divergence が broken migration path を隠した。

## Anti-patterns（避けるパターン）

- placeholder として `it.todo` を書き、source を先に implement して後から test を埋める。
  cycle order を反転させ、Red evidence を失う。
- `bun run test` ではなく `bun test` を実行する。
  native runner には 5-second sync timeout があり、real failures を反映せず async tests を flaky にすることがある。
- `helix doctor` green を test design correctness の evidence として扱う。
  doctor は構造 governance を確認するが、oracle quality（oracle 品質）や cycle order は確認しない。
