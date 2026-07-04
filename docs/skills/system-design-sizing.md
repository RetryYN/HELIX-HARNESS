---
schema_version: skill.v1
name: system-design-sizing
skill_type: design-contract
applies_to:
  layers:
    - L1
    - L3
    - L4
  drive_models:
    - Forward
    - Discovery
    - Scrum
    - Add-feature
---

# system design sizing（system design 見積もり）

HELIX における two-stage system design と capacity/complexity sizing
（FR-L1-28 two-stage agent design、W-model）。PLAN が new system component を scope する、
L4 で structural complexity を見積もる、または feature が single V-pass で足りるか
full W-model two-stage treatment が必要かを判断する場合に使う。

## この skill を読む条件

- L1 requirements PLAN が、対象 system を general system（single V）とするか、
  two-stage W-model を要する agent system とするか判断する必要がある。
- L3 functional design が、L4 detailed sizing 前に feature scope を bounded にする必要がある。
- L4 basic-design doc が、pair-freeze 前に明示的な sizing decision
  （module count、state surface、expected data volume）を記録する必要がある。
- Discovery Scrum S1 plan step が design stage entry point を定義する必要がある。

## Two-stage design（W-model）の trigger

target system が AI agent layer を含む場合、W-model（HELIX W）を適用する。
V-model を 2 回走らせる。

- **Phase 1 (general system V):** agents が関与しない前提で outer system を design/verify する
  （L0-L9 standard V）。Output は L9 system-test design。
- **Phase 2 (agent system V):** Phase 1 output を foundation として、agent orchestration、
  guardrails、merge surface（L10 agent-merge）を design する。

harness-internal development（outward-facing agent layer が無い場合）は single V が正しい。
harness self-development に W-model を適用しない。

## L4 sizing の checklist

L4 basic design では、次を含む sizing section を記録する。

- **Module count:** この PLAN が導入する new `src/` modules の数。
- **State surface:** この PLAN が harness.db tables、`.ut-tdd/` YAML keys、
  CLI state を追加するか。該当する場合は `db.md` skill を読む。
- **External dependencies:** この PLAN が process boundary
  （network、subprocess、`.ut-tdd/` を越える file I/O）を越えるか。各項目を列挙する。
- **Test complexity estimate:** L6 unit-test design が覆うべき distinct behaviour paths の数。
- **PLAN split decision:** sizing result が複数 PLAN boundary（異なる `layer` または `drive`）を示す場合、
  trace-freeze ではなく今 split する。

## Scope の rule

- 複数の V-model layer pair をまたぐ PLAN
  （例: 1 つの PLAN で L4 design + L7 implementation）は、
  PLAN `summary` field で grouping の理由を説明する。default は layer-pair crossing ごとに 1 PLAN。
- L4 時点で two-sprint estimate を超える complexity は、PLAN を split し、
  各 child を re-size する signal。split rationale は L4 doc に記録する。
- size は optimize する metric ではなく gate input。
  structurally complete な small PLAN は正しい。vague な large PLAN は governance violation。

## Discovery drive sizing（Discovery drive 見積もり）

Discovery drive の Scrum S1（plan）では、full L4 doc ではなく PLAN `summary` に
lightweight sizing memo を書く。memo は次を示す。
- 適用する V-model entry layer（L1/L3/L4）。
- Phase 2（W-model）が trigger されるか。
- S2 PoC が解くべき top-three unknowns。

S3 verify 前に、この memo を proper design doc へ promote する。

## Pair-freeze の checklist

- [ ] L4 doc が `## Sizing` section を持ち、module count、state surface、
      external dependencies、PLAN-split decision を含む。
- [ ] W-model applicability が記録されている
      （single V または two-stage、rationale 付き）。
- [ ] `ut-tdd plan lint` exits 0.
- [ ] `ut-tdd doctor` exits 0.
- [ ] sizing から生じた PLAN split が、pair-freeze 前に `requires` fields へ反映されている。
