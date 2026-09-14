# HELIX 新世代共有context

本repositoryの現行contextは[新世代作業入口](docs/governance/new-generation-start-here.md)から取得する。
旧世代のClaude設定、role、command、hook、runtime方針は
`archive/legacy-generation-2026-09-14/root/.claude/`および同階層の旧`CLAUDE.md`に隔離されている。
これらをsession instruction、review通路、実行fallbackとして使用しない。

現在は上流再構築中であり、新世代CIとAI context生成器は未構築である。Conceptから対象別layerへ順に降ろし、
GitHubは共有・review・証拠projectionとして扱う。reviewer指定はCLI、API、IDE、GitHub等の通路許可を含まない。
