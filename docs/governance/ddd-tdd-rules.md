---
status: confirmed
layer: L6
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
---

# DDD/TDD ルール SSoT

この文書は、HELIX-HARNESS における DDD / TDD strictness の requirements-level SSoT である。`docs/governance/coding-rules.md` を補完し、coding rules が TypeScript 実装形状を制約する一方で、この文書は domain boundary、invariant trace、TDD evidence、test oracle strength、integration-test granularity、mutation oracle evidence を制約する。

## ルール

```yaml
ddd_tdd_rules:
  - id: domain-boundary
    enforcement: hard
    owner: src/lint/ddd-tdd-rules.ts
    intent: source module は governance/domain boundary をまたいで上位 runtime または CLI module を import してはならない。
  - id: invariant-test-trace
    enforcement: hard
    owner: src/lint/ddd-tdd-rules.ts
    intent: 宣言されたすべての domain invariant は L7 U-* oracle を明示しなければならない。
  - id: red-first-evidence
    enforcement: hard
    owner: src/lint/ddd-tdd-rules.ts
    intent: tdd_red_required が付いた confirmed TDD PLAN は red_at と green_at を時系列順に記録しなければならない。
  - id: test-oracle-strength
    enforcement: hard
    owner: src/lint/ddd-tdd-rules.ts
    intent: test case は明示的な expect/assert oracle を含まなければならず、truthiness check だけに依存してはならない。
  - id: integration-gwt
    enforcement: hard
    owner: src/lint/ddd-tdd-rules.ts
    intent: L8 IT-* 行は Given/When/Then 粒度を持たなければならない。
  - id: unit-oracle-substance
    enforcement: hard
    owner: src/lint/ddd-tdd-rules.ts
    intent: L7 unit test-design の U-*-NNN 行は、link/citation だけでなく実質的な expected behavior (non-skeleton) を記述しなければならない (IMP-083 residual)。
  - id: mutation-oracle
    enforcement: hard
    owner: src/lint/ddd-tdd-rules.ts
    intent: confirmed TDD PLAN は、seeded defect を test が fail / kill できることを示す具体的な mutation_oracle_evidence を記録しなければならない。
```

## Domain Boundary Map / ドメイン境界マップ

| Source area | 許可される方向 | 禁止例 |
|---|---|---|
| `src/lint/**` | governance lint は docs/source text を読み、pure findings を返してよい | `src/runtime/**`、`src/doctor/**`、または CLI orchestration の import |
| `src/runtime/**` | runtime state/logging は下位 helper と schema を呼び出してよい | governance lint または V-model checker module の import |
| `src/schema/**` | schema は下位の contract package である | feature、runtime、lint、または CLI module の import |

Boundary check は意図的に保守的である。2 つの area 間で shared type が必要な場合は、上向きに import するのではなく下位 module へ移す。

## Invariants / 不変条件

- id: DDD-INV-001 oracle: U-DDDTDD-001 - Governance/domain module は acyclic を保ち、下位 contract は上位 runtime orchestration に依存しない。
- id: DDD-INV-002 oracle: U-DDDTDD-002 - Domain invariant declaration は、L7 test-design artifact が明示的な U-* oracle を持つ場合にのみ受理される。
- id: DDD-INV-003 oracle: U-DDDTDD-003 - TDD implementation evidence は Red-first である: TDD evidence を要求する confirmed plan では `red_at <= green_at` を満たす。
- id: DDD-INV-004 oracle: U-DDDTDD-004 - Unit test は assertion なしの実行や truthiness check だけでなく、具体的な oracle を露出する。
- id: DDD-INV-005 oracle: U-DDDTDD-005 - Integration test は Given/When/Then 粒度で confirm 可能である。
- id: DDD-INV-006 oracle: U-DDDTDD-011 - TDD PLAN の test oracle は、seeded defect を fail / kill する mutation oracle evidence によって検算可能である。

## Workflow Placement / ワークフロー上の位置づけ

- Forward L6: L7 implementation が始まる前に、domain boundary、invariant、rule ID を定義または更新する。
- Add-feature `add-design`: domain boundary、invariant、workflow evidence、または test granularity を変更するすべての feature は、この SSoT を更新するか、影響なしを明示しなければならない。
- L7 Red: TDD を要求する `add-impl` plan は、review evidence を freeze-ready と扱う前に Red-first evidence と mutation oracle evidence を記録しなければならない。
- L8 integration: すべての IT-* 行は Given/When/Then を使わなければならない。placeholder integration 行は carry のみであり、confirmable として数えてはならない。
- Quantitative vs qualitative split: mechanical check (`vitest`、`doctor`、lint) は qualitative review より先に実行しなければならない。critical DDD/TDD point は quantitative evidence と agent/human review evidence の両方を持たなければならない。
- Doctor/CI: `checkDddTddRules` は `helix doctor` と、doctor command 経由の shared harness check pipeline で実行される。

## Machine Check Contract / 機械検査契約

`src/lint/ddd-tdd-rules.ts` は、この文書、workflow docs、`src/**/*.ts`、`tests/**/*.ts`、PLAN docs、L7/L8 test-design docs を load する。rule drift、workflow anchor drift、boundary drift、invariant oracle gap、Red-first evidence 欠落、mutation oracle evidence 欠落、weak test oracle、GWT integration granularity 欠落に対して deterministic violation を返す。

## Baseline Debt / ベースライン debt

Active な DDD/TDD baseline debt は登録されていない。Analyzer は将来の staged hardening のために exact `path:line rule` baseline key を support するが、現在の repo guard は suppression なしで clean である。
