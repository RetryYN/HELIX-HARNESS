---
schema_version: skill.v1
name: testing
skill_type: testing
applies_to:
  layers:
    - L6
    - L7
    - L8
    - L9
    - L10
  drive_models:
    - Forward
    - Add-feature
    - Reverse
    - Retrofit
---

# testing（テスト）

HELIX の V-model 各レベルをまたぐテスト戦略、fixture 設計、Vitest の実行パターンを扱う。
この skill はテストスイート構造の「何をどう検証するか」を扱う。「いつ書くか」
（Red-Green 順序、L6 pairing、trace-freeze）は test-driven-development skill を参照する。

## この skill を load する場面

- pair-freeze 前に PLAN の test coverage（テスト被覆）を設計または audit するとき。
- suite に新しい test level (unit / integration / system) を追加するとき。
- 単純な assertion error ではない `bun run test` failure を調査するとき。
- Retrofit または Reverse PLAN で、design docs の back-fill 前に existing code の
  baseline coverage を確立する必要があるとき。

## HELIX のテスト levels

| Level | V-model layer | Location | Scope（対象範囲） |
|-------|---------------|----------|-------|
| Unit | L7（L6 と pair） | `tests/` | 単一 module、I/O なし |
| Integration | L8 | `tests/integration/` | 複数 modules、real `.helix/` state |
| System / CLI | L9 | `tests/system/` | End-to-end の `helix` command invocation |
| Acceptance | L11-L12 | `docs/test-design/acceptance/` | requirements に対する scenarios |

各 level には、L5/L6 または L8/L9 design document と対応する design doc が
`docs/test-design/` にある。Level design docs は tests を書く前に存在していなければならない
(FR-L1-02 test-first は unit だけでなく全 level に適用される)。

## Vitest patterns（実行パターン）

**suite を実行:**

```
bun run test           # Vitest — CI canonical runner
bun run test --watch   # local feedback loop
```

`bun test` を CI substitute として使わない。5 秒の sync timeout により、async Vitest
suites で false failure が発生する。

**PLAN 向け scoped run:**

```
bun run test tests/<module>.test.ts
```

**Coverage（gate を追加するとき）:**

Coverage thresholds は `vitest.config.ts` にある。new tests の substance を確認せずに
thresholds を上げない (coverage count は oracle quality と同じではない)。

## Fixture discipline（fixture 規律）

- harness state 用の fixtures は `tests/fixtures/` 配下に置く。production `.helix/`
  state を test fixture として再利用しない。test runs は live runtime なしで再現可能でなければならない。
- `harness.db` を読む integration tests は、自前の in-memory または temp-file DB instance を
  set up / tear down する。
- 外部 process calls（`helix` CLI の spawn）は、制御された `CLAUDE_PROJECT_DIR` を注入する
  helper で wrap し、hook paths が deterministic に解決されるようにする。

## Coverage と substance

green の coverage percentage は、test oracles が意味のある検証であることを証明しない。
tests 追加後に確認する: この test は誤った return value を捕捉できるか。
`.helix/` への missing write を捕捉できるか。できないなら、coverage が有用だと判断する前に
assertion を強める。

**オラクルの出所**: 期待値が自明でないテストは、期待値の出所（spec の数式・独立した手計算・
別実装・過去の確定データ）を先に確定する。実装の出力をそのまま期待値に貼るのは、実装のバグごと
固定化する同語反復である。何を疑いどこを見るか（壊れ方の視点カタログ・深さ配分・止めどき）は
`test-thinking` を読む。

## L8 integration test checklist（確認項目）

- [ ] Test は real `.helix/` state (temp dir、seeded fixture、または test helper 経由の actual
  harness.db) に触れる。
- [ ] Test は console output だけでなく output artefacts (file written、DB row inserted、exit code) を
  assert する。
- [ ] Teardown はすべての temp state を削除し、後続 run を clean にする。
- [ ] `docs/test-design/` の design doc がこの test file を参照する。

## Retrofit / Reverse coverage baseline（基準線）

Retrofit または Reverse PLAN の下で既存コードへテストを後付けするとき:

1. `bun run test` を実行し、現在の pass/fail 状態を記録する。
2. `helix graph` または手動レビューで、被覆すべきコードパスを特定する。
3. 設計変更より前に characterisation test（現在の振る舞いを oracle として記述するテスト）を書く。
   これが regression fence になる。
4. characterisation test と pair する L6 unit-test design doc を `docs/test-design/` へ後付けする。
5. その後にだけ設計変更または Forward 合流へ進む。
