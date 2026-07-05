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
    - id: machine-surface-language
      severity: error
      scope: ["source", "test"]
      description: "Machine-facing CLI, doctor, lint, gate, JSON, env, status, and oracle surfaces must use stable ASCII English decision tokens."
```

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

## 人間向けメモ

- `bun run typecheck`、`bun run lint`、`npx vitest run`、`helix doctor` は、TypeScript core 変更に対する最小の verification set である。
- Test helper の arity は `max-source-params` の上限対象外である。tests は引き続き no-any、no suppression comments、naming rules に従う。
- Fail-open が許されるのは、catch block が explicit state を返すか記録する場合、または fail-open intent をその場で明記する場合に限る。silent catch blocks と rethrow-only catch blocks は例外ではない。
- Boundary rules は v2 では意図的に最小限である。`lint` は pure のまま、`runtime` は governance checks より下、`schema` は feature modules より下に置く。
- Exceptions は inline comments ではない。まず policy PLAN を追加し、その後この SSoT と lint tests を同時に更新する。
