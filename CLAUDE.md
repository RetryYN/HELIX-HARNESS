# HELIX 新世代共有context

本repositoryの現行contextは[新世代作業入口](docs/governance/new-generation-start-here.md)から取得する。
旧世代のClaude設定、role、command、hook、runtime方針は
`archive/legacy-generation-2026-09-14/root/.claude/`および同階層の旧`CLAUDE.md`に隔離されている。
これらをsession instruction、review通路、実行fallbackとして使用しない。

HELIXの機能を最適化、拡張、再編するときは、独自実装を起点にしない。先に旧資産明細台帳で対応資産を特定し、
旧HELIXのsource、判断史、failure、consumerを読み、保持する契約と現行で変更する差分を記録する。同じ役割の仕組みが
存在する場合は、[旧資産の完全一致再利用統制](docs/governance/legacy-asset-reuse-control.md)に従って再利用または意味の再導出を行い、
承認された差分だけを実装する。対応資産が見つからない場合も検索範囲と結果を残してから新規案へ進む。
この参照義務はarchive内資産の実行、無判断なcopy、旧CI・旧testのoracle化を許可しない。

現在は上流再構築中であり、新世代CIとAI context生成器は未構築である。Conceptから対象別layerへ順に降ろし、
GitHubは共有・review・証拠projectionとして扱う。reviewer指定はCLI、API、IDE、GitHub等の通路許可を含まない。
