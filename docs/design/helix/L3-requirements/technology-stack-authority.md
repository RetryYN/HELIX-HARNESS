---
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
title: "HELIX technology stack authority"
layer: L3
kind: add-design
status: draft
created: 2026-07-29
updated: 2026-07-29
owner: PM / TL / PO承認必須
plan: PLAN-L3-50-technology-stack-authority
parent_design: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/technology-stack-authority-acceptance.md
next_pair_freeze: L10
---

# HELIX technology stack authority

## §0 authority

HELIXは、言語やtoolを流行または期待性能だけで追加せず、責務、version policy、互換境界、
移行、rollback、未解決項目をL3/L10 pairへ束縛する。

- behavior contractは`TECH-STACK-FR-001`だけとする。
- Python意味コアとTypeScript／Node実行境界は同格の層別authorityとし、ADR-009／ADR-010へ従う。
- Rust／Goは任意のbounded component候補であり、current mandatory runtimeではない。
- Bunはcurrent、fallback、rollbackのいずれにもauthorityを持たない。
- version更新、runtime追加、CI job、detector実装はL4以降へ送り、本pairでは行わない。

## §1 振る舞い契約

### TECH-STACK-FR-001 technology stack採用境界

HELIXは、current stackとtarget stackを責務別に識別し、version drift、unsupported toolchain、
unclassified dependency、Bun再activation、測定なしのruntime追加を拒否できなければならない。

#### TECH-STACK-R-01 stack disposition exact set

```yaml
technology_stack_dispositions:
  typescript_node: required_transactional_boundary
  python: required_semantic_core
  rust: optional_measured_component
  go: optional_measured_component
  bun: forbidden_active_surface
```

各entryは次のexact field setを持つ。

```yaml
required_stack_fields:
  - runtime_id
  - responsibility
  - authority_layer
  - version_policy
  - current_version
  - target_version
  - support_window
  - adoption_evidence
  - compatibility_boundary
  - migration_state
  - rollback_target
  - forbidden_surface
  - owner
  - unresolved_items
```

#### TECH-STACK-R-02 TypeScript／Node境界

- transactional control plane、CLI、hook、Git/GitHub、DB commitはTypeScript strict＋Node.js LTSが担う。
- production基線はNode.js 24 LTSとし、Current releaseを自動採用しない。
- TypeScript 7 native compilerをtargetとするが、現行5.6からの移行完了を先に主張しない。
- TypeScript 6 APIを必要とするtoolingをinventoryし、公式side-by-side経路をowner、期限、
  removal trigger付きで隔離する。TypeScript 6と7を恒久的な二重authorityにしない。
- TypeScript 7 CLI、tsconfig、Biome、Vitest、tsx、compiler API consumer、Windows／Linuxを
  dual-greenにしてからcurrent authorityを切り替える。

#### TECH-STACK-R-03 Python境界

- Pythonは要件抽出、typed spec、trace、検出、impact、review、文書生成のsemantic coreを担う。
- target feature lineはPython 3.14とする。exact patch、interpreter provenance、lock、
  wheel／sdist、free-threaded／JIT採否はL5 pair-freezeで固定する。
- DB path、credential、repository、`.helix/`、Git/GitHub write authorityを渡さない。
- strict JSONL、versioned schema、bounded resource、network default denyを必須とし、
  Nodeが再検証して単一transaction commitする。

#### TECH-STACK-R-04 Rust／Go採用境界

Rust／Goをcurrent mandatory runtimeへ自動追加しない。採用候補はbounded component単位とし、
次をすべて要求する。

```yaml
native_adoption_evidence:
  - same_fixture_benchmark
  - measured_p95_improvement
  - existing_owner_cannot_meet_contract
  - responsibility_owner
  - ipc_or_ffi_schema
  - failure_isolation
  - supply_chain_and_license
  - sbom_and_artifact_digest
  - multi_os_distribution
  - rollback_target
  - removal_trigger
```

Rustはmemory safety、single binary、startup、CPU／memory、cross-platform artifactで、
Goはconcurrency、single binary、cross-platform tooling、long-running serviceで、
既存Node／Python ownerより実測優位な場合だけL4へ降下できる。
TypeScript 7 compilerがGo実装であることは、HELIXへGo runtimeを追加する根拠にならない。

#### TECH-STACK-R-05 Bun terminal retirement

active dependency、lock、loader、CLI、hook、CI、setup、generation、fallback、rollback、
distribution、current exampleのBunを0にする。historical evidenceは到達不能性、理由、digest、
reviewを持つallowlistだけを許し、再entry条件を持たせない。

current skill／templateが`bun run`、`bun test`、`bun audit`またはTypeScript／Bun前提を生成する場合は
current authority違反としてfail-closeし、#253でNode／npm／Pythonの正規経路へ退役させる。

#### TECH-STACK-R-06 fast gate

- PR preflightはimpact-selected test、TypeScript 7 native typecheck、Biome、局所schema／authority検査を優先する。
- full regression、DB convergence、multi-OS、historical compatibilityはcandidate固定後または
  merge後／nightlyへ置き、同じcandidateを非blockerで再実行しない。
- gate追加より、既存gate統合、重複実行削除、入力scope縮小を先に評価する。
- Rust／Go detectorは、異なる2件以上の再発、既存gateで検出不能、実測p95改善、
  complexity justification、既存owner統合不能、removal triggerが揃う場合だけ許可する。

## §2 unresolved register

G3時点で次を未解決のまま隠さず、L4／L5へ降ろす。

- TypeScript 7と現行toolingのprogrammatic API compatibility exact inventory。
- Node.js 24 exact patchと`node:sqlite`のstability receipt。
- Python 3.14 exact patch、lock形式、free-threaded／JIT採否。
- preflight／full admissionの実測p95 baselineとcapacity別budget。
- Rust／Goを必要とするbounded componentの有無。証拠がなければ`none`とする。

## §3 非対象

- `package.json`、lock、CI、runtime、skill commandの更新。
- TypeScript 7、Python 3.14、Rust、Goの導入。
- 新detector、runner、job、schemaの実装。
- historical evidenceの書換え。
