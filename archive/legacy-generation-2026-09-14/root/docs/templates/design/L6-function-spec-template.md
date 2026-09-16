---
template_id: L6-function-spec-template
layer: L6
kind: design
status: template
---

# L6 function spec template（機能仕様テンプレート）

> この template は L6 function spec を書くための雛形である。PLAN の §6 用語更新 / §7 FR 更新とは別物であり、
> 本 template から生成する設計 doc は、対応 PLAN の `generates` と review evidence に接続する。

## 1. 対象 function

| 項目 | 内容 |
|---|---|
| function_id | `U-...` または module-local function ID |
| 対応 FR / AC | `FR-L1-*`、`AC-*`、または該当なし |
| 入力 | 型、schema、precondition |
| 出力 | 型、schema、postcondition |
| 副作用 | DB / file / network / runtime state の有無 |
| owner | se / tl / qa |

## 2. 契約

### 2.1 precondition

- 呼び出し前に満たす条件を書く。
- auth、secret、PII、外部 API、本番 write が関係する場合は escalation boundary を明記する。

### 2.2 postcondition

- 正常終了後に保証する状態を書く。
- generated artifact、DB row、evidence file、stdout/stderr などの観測点を具体化する。

### 2.3 invariant

- 実行中に破ってはいけない不変条件を書く。
- 例: plan-only packet は apply 権限を持たない、runtime state rename は approval 前に実行しない。

## 3. error handling（エラー処理）

| error | 分類 | 期待動作 | test |
|---|---|---|---|
| validation error | expected | exit 1 または structured violation | `U-...` |
| missing evidence | expected | 必須証跡が無ければ fail-close | `U-...` |
| provider/runtime failure | expected | provider error として分類 | `U-...` |
| unexpected exception | unexpected | sanitized message を返し、secret を出さない | `U-...` |

## 4. trace

| source | 対応 |
|---|---|
| L1 / L3 | 要求、受入条件、または該当なし |
| L4 | architecture / UI / data / workflow の境界 |
| L5 | IF / DB / module decomposition |
| L6 test-design | unit oracle / edge case / GWT の対応 |
| L7 implementation | source module / test file の対応 |

## 5. test oracle（テスト oracle）

| oracle ID | 観点 | Red 条件 | Green 条件 |
|---|---|---|---|
| U-... | 正常系 | 期待 output が無い | 期待 output と evidence が一致 |
| U-... | 異常系 | violation を見逃す | structured violation と exit code が一致 |

## 6. review checklist（レビュー checklist）

- [ ] precondition / postcondition / invariant が具体的である。
- [ ] evidence path が repo-relative で実在する。
- [ ] secret / PII / credential を出力や docs に含めない。
- [ ] L6 test-design と L7 test が双方向に trace されている。
- [ ] plan-only / approval-required / irreversible action の境界を誤って green にしない。
