---
status: confirmed
layer: L6
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
---

# DDD/TDD ルール SSoT

この文書は、HELIX-HARNESS における engineering discipline の requirements-level SSoT である。
目的はコードを書くことではなく、要求された振る舞いを最小の仕組みで持続可能に実現することである。
`docs/governance/coding-rules.md` を補完し、no-code-first、object-oriented DDD の選択、
Design by Contract (DbC)、TDD evidence、test oracle strength、net complexity を一つの契約として制約する。

## 思想

1. **no-code-first**: `no_change → delete → configure → reuse → modify → add_code` の順に検討する。
   コード追加は既定解ではなく、先行する選択肢で契約を満たせない証拠がある場合の最終手段である。
2. **object-oriented DDD は手段**: Entity、Aggregate、Value Object、Domain Service、Policy、Port、
   Adapterを責務と不変条件が必要とする場合だけ採用する。状態・identity・lifecycleを持たない変換は
   `pure_function`、domain modelを要しない変更は`none`を正規判断とする。「全てをclass化」は違反である。
3. **契約先行**: public behavior、precondition、postcondition、invariant、failure semantics、owner、
   write authorityを実装前に固定する。内部構造は契約を守る限り交換可能にする。
4. **TDDは検証契約**: Redは「testを書いた時刻」ではなく、意図した欠陥を実際に検出する証拠である。
   Greenは最小実装、Refactorは同じoracleがgreenのまま構造を単純化した証拠で閉じる。
5. **net complexityを管理**: code、state、dependency、CI、運用分岐の追加と削除を差し引く。
   正味増加は理由と将来の削除条件を持たなければならない。再発欠陥や既存検出gapの証拠がない
   detector/gate追加、将来用途だけの抽象化、1実装しかない投機的interfaceは禁止する。
6. **原子的に変更する**: 1 sliceは`1 behavior contract + 1 responsibility owner`とし、
   独立merge可能なbehaviorや複数ownerを一つのPRへ混載しない。原子性は行数ではなく、
   単独でRed/Green、review、rollback、mergeできる意味境界で判定する。
7. **極小refactorで旧を削る**: characterization → contract導入 → old/new dual-green →
   consumerを1つずつ移行 → consumer=0確認 → legacy削除の順を守る。契約追加と旧削除を同じsliceで行わず、
   各段階を可逆にする。外部behaviorが変わる場合はrefactorを止め、適切な開発経路へrouteする。

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
    intent: L9 IT-* 行は Given/When/Then 粒度を持たなければならない。
  - id: unit-oracle-substance
    enforcement: hard
    owner: src/lint/ddd-tdd-rules.ts
    intent: L8 unit test-design の U-*-NNN 行は、link/citation だけでなく実質的な expected behavior (non-skeleton) を記述しなければならない (IMP-083 residual)。
  - id: mutation-oracle
    enforcement: hard
    owner: src/lint/ddd-tdd-rules.ts
    intent: confirmed TDD PLAN は、seeded defect を test が fail / kill できることを示す具体的な mutation_oracle_evidence を記録しなければならない。所在は tests/*.test.ts、docs/test-design、.helix/audit、vitest、または既存 PLAN/test-design から test path へ解決できる oracle_id のいずれかで示し、未解決 ID は受理しない。
  - id: engineering-discipline-contract
    enforcement: hard
    owner: src/lint/ddd-tdd-rules.ts
    intent: 2026-07-25以降のL3-L7 PLANはno-code判断、DDD modeling、DbC、TDD、net complexityを機械可読に記録しなければならない。
  - id: atomic-change-contract
    enforcement: hard
    owner: src/lint/ddd-tdd-rules.ts
    intent: 新規L3-L7 PLANはexact behavior contractと責務ownerを持つ原子sliceとし、極小refactorの段階とlegacy退役状態を明示しなければならない。
```

`mutation_oracle_evidence` の locator は、反例の所在を一意に辿れる既存の証跡でなければならない。
`tests/*.test.ts`、`docs/test-design/...`、`.helix/audit/...`、`vitest` の明示 locatorに加え、
PLAN の `verification_bindings` / `generates` または test-design 表に存在し、test path／設計文書へ
解決できる `oracle_id` を使用できる。oracle ID の解決表は起動時に既存文書から導出する inventory
であり、新しい意味authorityではない。L7/L8 test-design間でoracle定義を移設する場合は、移設前後の
pathを同一の原子scopeへ含め、移設後も全oracle IDが解決されることを検証する。未解決の oracle ID、
placeholder、kill／fail／red の実測を伴わない記述は引き続き fail-close する。

## PLAN Engineering Discipline Contract / PLAN工学規律契約

2026-07-25以降に作るL3〜L7 PLANは、frontmatterへ次を記録する。`none`や`no_change`も、
理由を考えた結果として受理するための正規値であり、不要な実装を強制しない。

```yaml
engineering_discipline_required: true
behavior_contract_id: "FR/AC/oracleまたは局所behavior contractのexact ID"
responsibility_owner: "Aggregate/Domain Service/Value Object/Policy/Port/Adapter/Application boundaryのexact owner"
change_slice: atomic
refactor_step: not_applicable # not_applicable|characterize|introduce_contract|dual_green|migrate_one_consumer|verify_consumer_zero|remove_legacy
legacy_retirement_state: not_applicable # not_applicable|retained|dual_green|consumer_migration|consumer_zero|removed
no_code_decision: no_change # no_change|delete|configure|reuse|modify|add_code
ddd_modeling_decision: none # none|entity|aggregate|value_object|domain_service|policy|port|adapter|pure_function|mixed
contract_preconditions: "呼出し前に成立すべき条件、または none + 理由"
contract_postconditions: "成功後に観測可能な条件"
contract_invariants: "処理前後を通じて維持する条件、または none + 理由"
contract_failures: "失敗型、atomicity、rollback、外部副作用"
tdd_red_required: false
complexity_effect: net_neutral # net_negative|net_neutral|justified_positive
```

`no_code_decision: add_code`または`complexity_effect: justified_positive`では、さらに
`complexity_justification`と`removal_trigger`を必須とする。`removal_trigger`は暫定分岐、
adapter、feature flag、重複実装、追加CIをいつ削除または統合するかを検証可能に記す。
`refactor_step: remove_legacy`は`legacy_retirement_state: consumer_zero`の場合だけ受理する。

## 原子的PR・契約・極小リファクタリング基準

- PRはPLANの`behavior_contract_id`と`responsibility_owner`を一組だけ実装する。複数behaviorが必要なら
  dependency順に別sliceへ分ける。
- contract変更、実装、consumer移行、legacy削除はそれぞれ独立PRにできる粒度を保つ。
- CIはPRでtargeted oracleとcritical gateを実行し、省略分をpost-merge fullとnightlyで回収する。
  targeted greenをfull greenと偽らず、unknown impactはfullへfail-closeする。
- refactorは公開behaviorを変えない。新behavior、schema、migration、failure semanticsの変更を検出したら
  Add-feature、Retrofit、Recovery、Reverseの該当経路へ戻す。
- 各PRは「何を増やしたか」だけでなく「何を削れる状態に近づけたか」を記録する。

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

- G3: FR/NFR/ACとL10 oracleに加え、no-code-firstの採否、変更対象の責務owner、
  許容するcomplexity budgetをdiscipline baselineとしてfreezeする。
- L4/L9: bounded context、Aggregate/Port/Adapter境界とsystem/integration oracleを対で固定する。
  object modelが不要なら`none`または`pure_function`と理由を残す。
- L5/L8: precondition、postcondition、invariant、failure/rollback、edge caseと単体・結合oracleを対で固定する。
- Forward L6: L7 implementation が始まる前に、domain boundary、invariant、rule ID を定義または更新する。
- L6/L7: Red → 最小Green → behavior-preserving Refactorの順で閉じ、契約外コードを追加しない。
- Add-feature `add-design`: domain boundary、invariant、workflow evidence、または test granularity を変更するすべての feature は、この SSoT を更新するか、影響なしを明示しなければならない。
- L7 Red: TDD を要求する `add-impl` plan は、review evidence を freeze-ready と扱う前に Red-first evidence と mutation oracle evidence を記録しなければならない。
- L9 integration: すべての IT-* 行は Given/When/Then を使わなければならない。placeholder integration 行は carry のみであり、confirmable として数えてはならない。
- Quantitative vs qualitative split: mechanical check (`vitest`、`doctor`、lint) は qualitative review より先に実行しなければならない。critical DDD/TDD point は quantitative evidence と agent/human review evidence の両方を持たなければならない。
- Doctor/CI: `checkDddTddRules` は `helix doctor` と、doctor command 経由の shared harness check pipeline で実行される。

## Machine Check Contract / 機械検査契約

`src/lint/ddd-tdd-rules.ts` は、この文書、workflow docs、`src/**/*.ts`、`tests/**/*.ts`、PLAN docs、L8/L9 test-design docs を load する。rule drift、workflow anchor drift、boundary drift、invariant oracle gap、Red-first evidence 欠落、mutation oracle evidence 欠落、weak test oracle、GWT integration granularity欠落に加え、新規L3〜L7 PLANのengineering discipline contract欠落をdeterministic violationとして返す。

## Baseline Debt / ベースライン debt

Active な DDD/TDD baseline debt は登録されていない。Analyzer は将来の staged hardening のために exact `path:line rule` baseline key を support するが、現在の repo guard は suppression なしで clean である。
