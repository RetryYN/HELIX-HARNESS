# HELIX 新世代共有context

@AGENTS.md

本repositoryの現行contextは[新世代作業入口](docs/governance/new-generation-start-here.md)から取得する。
本repositoryは旧HELIXの再構築であり、新構築ではない。旧世代のClaude設定、role、command、hook、runtime方針は
`archive/legacy-generation-2026-09-14/root/.claude/`および同階層の旧`CLAUDE.md`に隔離されている。
これらは実行せず、実行fallbackにもしないが、規則、運用、工程、役割分担、承認手続き、要求、設計を決めるときは
必ず先に読み、起点にする。旧HELIXに根拠のない規則や手続きを推測で新設しない。旧HELIXと異なる内容にする場合は、
旧source、保持点、変更点、理由を記録して人の判断を経る。詳細は[AGENTS.md](AGENTS.md)「再構築の原則」に従う。

現在は上流再構築中であり、新世代CIとAI context生成器は未構築である。Conceptから対象別layerへ順に降ろし、
GitHubは共有・review・証拠projectionとして扱う。通常のGitHub作業では作成側がpushとDraft PR作成、独立review結果の確認後にReady化し、
独立review側がexact HEADのreview・明示merge・read-afterを担う（[AGENTS.md](AGENTS.md)、
[GitHub上流運用モデル](docs/governance/github-upstream-operating-model.md)）。旧CLI・旧hook・旧runtimeは起動しない。
