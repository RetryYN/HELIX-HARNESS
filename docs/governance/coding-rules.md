# HELIX コーディング規則

この文書は TypeScript/Bun core に対する coding-rule の SSoT である。
requirements reference: `docs/governance/helix-harness-requirements_v1.2.md` §7.6.1。
Executable gate: `src/lint/coding-rules.ts` を通じた `helix doctor`。

## Workflow Placement / ワークフロー上の位置づけ

coding-rule の文書化は、事後の CI メモではなく workflow の一工程である。

- Forward L6: G6/G7 handoff の前に、`docs/governance/coding-rules.md` が未変更で今も適用可能かを確認し、必要なら function design delta を反映して更新する。
- Add-feature: `add-design` PLAN が coding-rule への影響を記録し、`add-impl` は rule impact が `unchanged` であるか、この SSoT と対応する U-CODE tests に反映済みである場合にのみ開始する。
- Refactor / Retrofit / Recovery / Reverse fullback: implementation language、lint tool、naming、typing、error-handling style、generated-code boundary のいずれかを変更したら、implementation freeze の前にこの SSoT を更新する。
- Review: reviewer approval の前に `bun run typecheck`、`bun run lint`、`npx vitest run`、`helix doctor` が green でなければならない。

## 機械方針

以下の block は `loadCodingRulePolicy` により machine-read される。Rule IDs は lint implementation と一致していなければならない。

```yaml
coding_rules:
  version: 1
  applies_to:
    source:
      - "src/**/*.ts"
    tests:
      - "tests/**/*.ts"
  rules:
    - id: no-explicit-any
      severity: error
      scope: ["source", "test"]
      description: "Do not use explicit any; use unknown, generics, or concrete types."
    - id: no-suppression-comment
      severity: error
      scope: ["source", "test"]
      description: "Do not use TypeScript, ESLint, or Biome suppression comments."
    - id: file-name-kebab
      severity: error
      scope: ["source", "test"]
      description: "TypeScript files must be kebab-case, kebab-case .test.ts, or index.ts."
    - id: max-source-params
      severity: error
      scope: ["source"]
      description: "Source functions, methods, constructors, and arrows must have at most 3 params; use an input object otherwise."
    - id: structured-error-handling
      severity: error
      scope: ["source"]
      description: "Catch blocks must record, convert, return explicit failure state, or document fail-open intent; undocumented empty and rethrow-only catch blocks are prohibited."
    - id: module-boundary
      severity: error
      scope: ["source"]
      description: "Core modules must not import against the defined dependency direction; move shared logic to lower-level modules."
    - id: no-circular-dependency
      severity: error
      scope: ["source"]
      description: "Source files must not form relative import cycles; break cycles by extracting stable shared code to a lower-level module."
    - id: machine-surface-language
      severity: error
      scope: ["source", "test"]
      description: "Machine-facing CLI, doctor, lint, gate, JSON, env, status, and oracle surfaces must use stable ASCII English decision tokens."
```

### 複雑度 gate

Biome `complexity.noExcessiveCognitiveComplexity` は `recommended: true` だけでは発火しないため、
`biome.json` で明示的に `level: error` とする。現行 baseline 閾値は `maxAllowedComplexity: 187`
（2026-07-05 導入時点の既存最大値）とし、この値を超える新規複雑度を fail-close する。
既存高複雑度は grandfather として扱い、後続 PLAN で縮小する。

### 循環依存 baseline

`no-circular-dependency` は `src/**/*.ts` の相対 import graph を DFS し、新規循環を fail-close する。
Step 1 導入時点で実 repo に存在した 12 cycle は `GRANDFATHERED_CIRCULAR_DEPENDENCY_KEYS` に固定し、
grandfather として扱う。baseline は拡大せず、解消済み cycle は後続 PLAN で削除する。

## 機械向け表現

Machine-readable / machine-parsed な surface では、安定した ASCII English tokens を使う。
Human prose は Japanese でよいが、tools、agents、logs、tests が依拠する decision word は Japanese text や symbols に依存してはならない。

必須の ASCII decision tokens は次を含む。

- `OK`
- `violation`
- `warning`
- `skipped`
- `note`
- `error`
- `ready` / `not ready`

これは CLI output、`doctor` messages、lint/gate messages、JSON keys、environment variable names、rule IDs、oracle IDs、status words、そしてそれらの surface に対する test assertions に適用される。Japanese explanation を token の後ろに続けてもよいが、token 自体は ASCII のままでなければならない。

## 外部化基準（チューニング値の config 分離、PLAN-L3-07 Step 2）

「どの値を外部化すべきか」の判断基準を定める。目的は、要件確定後の**細かい調整をコード変更
（= 再降下・再レビュー）なしに行える**ようにすることと、マジックナンバー散在によるスパゲッティ化防止である。

次のいずれかに該当する値は、コード内リテラル直書きを禁止し外部化する。

1. **運用チューニング値**: PO / 非エンジニアが運用中に調整しうる数値・閾値
   （例: refactor candidate の行数閾値、gap-check 観点表のラウンド上限、confidence 閾値、timeout/budget 値）。
2. **反復リテラル**: 同一ファイル内で 3 回以上出現する意味のある文字列/数値リテラル
   （`externalize-literal` detector の検出対象と同根。detector 閾値は現行 12 文字以上 × 6 回だが、
   規約としては 3 回で外部化を検討する）。
3. **環境依存値**: 実行環境・配布先で変わりうる値（path、URL、モデル名、profile 名）。

外部化の段階（最低要件 → 目標）:

- **最低要件（現行）**: 実装 module 本体から **policy module へ分離**する
  （例: `src/state-db/refactor-candidate-policy.ts`）。ロジックと調整値を同居させない。
- **目標（PLAN-L3-07 Step 2 後半で実装）**: `.helix/config/*` の外部設定ファイルへ移し、
  schema 検証を `helix doctor` に接続する（schema 違反 config は doctor が fail する）。
- 外部化**しない**もの: 安全境界に関わる値（guard の fail-close 判定、allowlist、approval 対象一覧）は
  設定で緩められてはならないため、コード内 SSoT + テストで固定する。

`externalize-literal` / `externalize-policy` telemetry はこの基準の検出器である。warn が出た値は
本基準に照らして「外部化する / 意図的に固定する」のどちらかを明示して triage する（放置しない）。

## 人間向けメモ

- `bun run typecheck`、`bun run lint`、`npx vitest run`、`helix doctor` は、TypeScript core 変更に対する最小の verification set である。
- Test helper の arity は `max-source-params` の上限対象外である。tests は引き続き no-any、no suppression comments、naming rules に従う。
- Fail-open が許されるのは、catch block が explicit state を返すか記録する場合、または fail-open intent をその場で明記する場合に限る。silent catch blocks と rethrow-only catch blocks は例外ではない。
- Boundary rules は architecture §3.1 の全 top-level module を source-boundary matrix に登録する。未定義 module は `module-drift` violation とする。`lint` は pure のまま、`runtime` は governance checks より下、`schema` は feature modules より下に置く。
- Exceptions は inline comments ではない。まず policy PLAN を追加し、その後この SSoT と lint tests を同時に更新する。
