# Governance 文書

このディレクトリは HELIX-HARNESS の現行 governance 正本だけを置く。
本 README は governance 配下の案内 index であり、gate、証跡、完了条件の判定 surface ではない。

## 現行正本

Claude Code / Codex / human reviewer は、通常タスクでは次の順に読む。

1. `helix-harness-requirements_v1.3.md`（現行L1〜L12 Vモデル＋Scrum正本）
2. `helix-harness-concept_v3.1.md`（concept。旧工程表記はcompatibility説明）
3. `helix-harness-requirements_v1.2.md`（legacy L0〜L14 compatibility reference）
4. `helix-harness-extraction-plan_v0.1.md`
5. `../adr/ADR-001-helix-harness-redesign-and-language.md` (再設計方針 + 決定史)
6. `../adr/ADR-009-node-python-linux-runtime.md` (target runtime authority。terminal cutover前のactive executionは既存経路)
7. `../adr/ADR-010-python-semantic-core-node-commit-boundary.md` (Python意味コアとNode単一commit境界)
8. `repository-structure.md` (リポジトリ構成ルールの正本)

> **ADR-001/009/010連動**: sourceはbehavior atom単位で採否し、旧runtimeの一括復活とbulk code-portを禁止する。
> Pythonは要件抽出・typed spec・trace・検出・impact・review・文書生成の恒久意味コア、TypeScript/Nodeは
> harness.db・Git/GitHub副作用の単一commit境界とする。動作済みPython意味コアのTS一括書き直しも禁止する。
> `../migration/helix-porting-map.md`等はsource capability inventory／再設計思想の参考であり、旧runtimeのport計画として使わない。

> **ADR-010 layered authority**: Python意味契約とNode実行契約は同格であり、NodeがPythonの意味判断を再実装しない。
> PythonへDB path・credential・repository・`.helix/`を渡さず、Nodeだけがtransactional side effectをcommitする。
> Migration docsとsource snapshotsはatomization／regressionのsource materialであり、旧runtime自体をexecution routeにしない。

## Reference Only（参考のみ）

次の文書は背景・上位チーム運用の参考であり、HELIX の受入条件や実装導線の正本ではない。

- `ai-dev-team-concept_v1.1.md`
- `ai-dev-team-operations_v1.1.md`

## Archived Or Vendor Material（archive / vendor 資料）

旧版、参照 snapshot、個人 legacy source 原稿は正本として使わない。

- 旧版は `../archive/` に置く。
- source reference snapshot と legacy local state は直接編集しない。
- 旧 runtime command は HELIX の実行導線として記述しない。現行導線は `helix` command とする。

Claude Code / Codex が読む入口は本 README と repo root の `CLAUDE.md` とし、archive / vendor / local runtime state を正本にしない。
ただし受入判定、freeze、evidence、completion は該当する PLAN、設計、テスト設計、governance 正本、実装、検証ログで判断し、
README 単体を gate 根拠にしない。
