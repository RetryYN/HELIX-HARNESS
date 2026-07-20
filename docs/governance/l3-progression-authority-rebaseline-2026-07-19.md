# L3進行authority再ベースライン（2026-07-19）

- status: current-authority
- scope: L3要件定義へ入る前に正規化する58文書
- V-model: L1-L12 canonical
- runtime: Python semantic core + TypeScript/Node transactional boundaryを正とする
- supersedes: 対象文書内のL0-L14、旧pair、Bun target、Python proposal-onlyという進行authority

## 1. L3へ入力できる判断

1. L0 charterは層外anchorで、canonical L1企画へprojectionする。
2. 物理L1 requirementsと物理L2 screen/prototypeはcanonical L2要求定義へprojectionし、L11受入テストとpairにする。
3. L3 FR/ACはcanonical L3のままとし、L10総合テストとpairにする。
4. L4以降はL4↔L9、L5↔L8、L6↔L7だけを使う。L13/L14/G13/G14はcompatibility receiptであり完了条件にしない。
5. target/current runtimeはPython semantic core + TypeScript/Node transactional boundary。Bunはhistorical evidenceとnegative detector vocabularyにだけ隔離し、active、fallback、rollbackのauthorityへ再昇格させない。
6. Python semantic coreは恒久面でありproposal-only workerへ縮退させない。DB/Git/GitHub writeはNode単一transaction境界に限定する。
7. 対象文書のdomain requirement、AC、業務語彙は入力に使えるが、旧layer/runtime/gate字段は本書で正規化してから使う。
8. `HELIX:L3-PROGRESSION-AUTHORITY:v1` markerがない対象、markerのdigest不一致、canonical metadata欠落はL3 freezeをfail-closeする。

## 2. 物理path互換規則

| 既存物理表現 | canonical解釈 | pair |
|---|---|---|
| L0 charter / PLAN-L0 | 層外anchorからL1企画へprojection | L1↔L12 |
| L1 requirements / PLAN-L1 | L2要求定義のlegacy physical path | L2↔L11 |
| L2 screen / PLAN-L2 | L2 prototypeのlegacy physical path | L2↔L11 |
| L3 requirements / PLAN-L3 | L3要件定義 | L3↔L10 |

物理pathのatomic renameは別cutoverで行う。ここでは意味authorityだけを先に切り替え、legacy path名を層判断に使わない。

## 3. blocker manifest（58件）

- `docs/adr/ADR-001-helix-harness-redesign-and-language.md`
- `docs/design/design-catalog.yaml`
- `docs/design/harness/L1-requirements/business-requirements.md`
- `docs/design/harness/L1-requirements/functional-requirements.md`
- `docs/design/harness/L1-requirements/nfr.md`
- `docs/design/harness/L1-requirements/screen-requirements.md`
- `docs/design/harness/L1-requirements/technical-requirements.md`
- `docs/design/harness/L2-screen/README.md`
- `docs/design/harness/L2-screen/business-flow.md`
- `docs/design/harness/L2-screen/screen-detail.md`
- `docs/design/harness/L2-screen/screen-flow.md`
- `docs/design/harness/L2-screen/screen-list.md`
- `docs/design/harness/L2-screen/ui-element.md`
- `docs/design/harness/L2-screen/wireframe.md`
- `docs/design/harness/L3-functional/README.md`
- `docs/design/harness/L3-functional/business-detail.md`
- `docs/design/harness/L3-functional/functional-requirements.md`
- `docs/design/harness/L3-functional/nfr-grade.md`
- `docs/design/harness/L3-functional/roadmap.md`
- `docs/design/helix/L0-charter/helix-charter_v0.1.md`
- `docs/design/helix/L1-requirements/hybrid-rebaseline-v0.5.0-remediation-delta.md`
- `docs/design/helix/L1-requirements/pillar-requirements.md`
- `docs/design/helix/L3-requirements/pillar-functional-requirements.md`
- `docs/design/helix/L3-requirements/vmodel-docgen-fit.md`
- `docs/governance/coding-rules.md`
- `docs/governance/document-system-map.md`
- `docs/governance/gate-design.md`
- `docs/governance/helix-harness-concept_v3.1.md`
- `docs/governance/helix-harness-extraction-plan_v0.1.md`
- `docs/governance/helix-harness-requirements_v1.2.md`
- `docs/governance/repository-structure.md`
- `docs/plans/PLAN-L0-01-helix-charter.md`
- `docs/plans/PLAN-L1-01-business-requirements.md`
- `docs/plans/PLAN-L1-02-functional-requirements.md`
- `docs/plans/PLAN-L1-03-screen-requirements.md`
- `docs/plans/PLAN-L1-04-technical-requirements.md`
- `docs/plans/PLAN-L1-05-nfr.md`
- `docs/plans/PLAN-L1-06-helix-solo-conversion.md`
- `docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md`
- `docs/plans/PLAN-L2-00-master.md`
- `docs/plans/PLAN-L2-01-screen-list.md`
- `docs/plans/PLAN-L2-04-wireframe.md`
- `docs/plans/PLAN-L3-00-master.md`
- `docs/plans/PLAN-L3-01-functional-detail.md`
- `docs/plans/PLAN-L3-02-business-detail.md`
- `docs/plans/PLAN-L3-03-nfr-grade.md`
- `docs/plans/PLAN-L3-05-harness-telemetry-closure.md`
- `docs/plans/PLAN-L3-06-helix-pillar-descent.md`
- `docs/plans/PLAN-L3-07-requirements-binding-enforcement.md`
- `docs/plans/PLAN-L3-08-message-catalog-externalization.md`
- `docs/plans/PLAN-L3-09-requirements-omission-guards.md`
- `docs/plans/PLAN-L3-10-message-catalog-externalization.md`
- `docs/plans/PLAN-L3-11-requirements-omission-guards.md`
- `docs/plans/PLAN-L3-13-vmodel-docgen-fit.md`
- `docs/process/README.md`
- `docs/process/forward/L00-L06-design-phase.md`
- `docs/process/forward/overview.md`
- `docs/process/gates.md`

## 4. 完了条件

- 58件すべてがmarkerと本書への参照を持つ。
- frontmatterを持つL0-L3 artifactは`canonical_layer`、`canonical_pair`、`legacy_physical_layer`を持つ。
- L3進行時のscannerが58件をunbound blockerとして返さない。
- L12 authority tests、recognition-risk tests、typecheckがgreen。
