# Governance 文書

このディレクトリは HELIX-HARNESS の現行governance正本、承認済み次期候補、referenceを状態別に置く。
本 README は governance 配下の案内 index であり、gate、証跡、完了条件の判定 surface ではない。

## 現行判断入口

要求対象の整理では[HARNESS・HELIX-OS・個別プロダクトの責務決定](product-governance-boundary-2026-09-14.md)を確認する。
旧Conceptにある対象混在の記述を、この決定より優先しない。個別要求の合意・正本昇格とは区別する。

Claude Code / Codex / human reviewer は、通常タスクでは次の順に読む。

1. `l12-canonical-vmodel-direction-directive_v0.1.md` (current V-model layer authority)
2. `l3-progression-authority-rebaseline-2026-07-19.md` (L3進行blocker 58件のprojection authority)
3. `candidates/helix-concept-v4.0.md`（PO承認済みの次期Concept。canonical promotion完了前はruntime正本ではない）
4. `helix-harness-requirements_v1.3.md`（要件正本。`helix-harness-requirements_v1.2.md` は compatibility reference へ降格、PO 承認 2026-07-20 / PLAN-L3-15）
5. `helix-harness-extraction-plan_v0.1.md`
6. `../adr/ADR-001-helix-harness-redesign-and-language.md` (再設計方針 + 決定史)
7. `../adr/ADR-009-node-python-linux-runtime.md` (current/target runtime authority。Bun active/fallback/rollback authorityは廃止)
8. `../adr/ADR-010-python-semantic-core-node-commit-boundary.md` (Python/Node層別authority)
9. `repository-structure.md` (リポジトリ構成ルールの正本)
10. `management-scrum-product-forward.md`（管理見落としのScrum収束とproduct Forwardの入口分離）

`helix-harness-concept_v3.1.md` は旧Conceptのcompatibility sourceである。通常のCore Read正本からは外し、
既存契約の移管・差分照合時だけ参照する。v4候補、requirements v1.3、L1-L12 directiveに反する旧定義を
currentへ再出力しない。v4のruntime正本化と候補directoryからの昇格は、PLAN-L3-84のcanonical promotion、
全consumer移行、独立検証が完了した時点で行う。

> **V-model layer authority**: current canonicalはL1-L12であり、正規pairは
> `L1↔L12` / `L2↔L11` / `L3↔L10` / `L4↔L9` / `L5↔L8` / `L6↔L7`である。
> L0 charterは層外authority anchorとする。L0-L14の既存記述・ID・物理pathはcompatibility projectionまたは
> historical sourceであり、新規成果物やCI判定の正本ではない。concept/requirements内の未移行記述より本directiveを優先する。

> **ADR-001/009/010連動**: transactional control planeはTypeScript/Nodeでclean rebuildし、semantic coreはPythonを恒久実装面とする。
> sourceはbehavior atom単位で採否し、旧runtime／bulk code-portは禁止する。Pythonをproposal-onlyへ限定した旧記述はsupersededである。
> `../migration/helix-porting-map.md`等はsource capability inventory／再設計思想の参考であり、旧runtimeのport計画として使わない。

> **ADR-009/010 boundary**: implementationはHELIX-owned TypeScript/Node transactional boundaryとPython semantic coreを同格のlayered authorityとして構成する。
> Migration docsとsource snapshotsはatomization／regressionのsource materialであり、旧runtime自体をexecution routeにしない。

要求の確認は[L2要求の読取り入口](../design/helix/L2-requirements/README.md)から、要求本文・正本JSON・
合意状態・L3／L11への対応を辿る。GitHub Issue／PR／Projectsは要求の意味正本ではない。
文書名や物理directoryの旧L1表記だけで要求をL1企画に分類しない。
[要求文書監査記録](l2-requirements-source-audit-2026-09-14.md)には、確認範囲・訂正・未解決事項を記録する。
この案内と監査記録は、新しい要求正本や承認・受入証跡ではない。

## Reference Only（参考のみ）

次の文書は背景・上位チーム運用の参考であり、HELIX の受入条件や実装導線の正本ではない。

- `ai-dev-team-concept_v1.1.md`
- `ai-dev-team-operations_v1.1.md`
- `audit-framework.md`（旧feature単位gate／native auto-merge案。現行の原子的PR、read-only AI-B、
  明示merge契約と衝突する箇所は採用しない）
- `helix-harness-concept_v3.1.md`（旧Concept。移管・差分照合用compatibility source）

## Archived Or Vendor Material（archive / vendor 資料）

旧版、参照 snapshot、個人 legacy source 原稿は正本として使わない。

- 旧版は `../archive/` に置く。
- source reference snapshot と legacy local state は直接編集しない。
- 旧 runtime command は HELIX の実行導線として記述しない。現行導線は `helix` command とする。

Claude Code / Codex が読む入口は本 README と repo root の `CLAUDE.md` とし、archive / vendor / local runtime state を正本にしない。
ただし受入判定、freeze、evidence、completion は該当する PLAN、設計、テスト設計、governance 正本、実装、検証ログで判断し、
README 単体を gate 根拠にしない。

## 設計文書の判定境界

`docs/design/harness/` は current canonical ではない。移行中の compatibility / debt surface であり、
新規の要件、設計、trace、gate、fixture、CI 期待値の判断正本として使わない。
current 判断は `docs/design/helix/` と本ディレクトリの governance 正本（現行正本順、
`l12-canonical-vmodel-direction-directive_v0.1.md`、ADR-009/010）に従う。
`docs/design/harness/` に残る旧 runtime 記述は後続 slice で Node.js 24 + npm/npx へ置換するか、
historical / 廃止として隔離する。本 README の境界明示は lint 実装や mutation 証跡の代替ではない。
