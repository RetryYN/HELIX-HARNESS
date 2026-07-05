<!-- HELIX:managed:start -->
# HELIX 共有コンテキスト

harness state と delegation には repository-local HELIX command を使う。PLAN-M-02 までは現行 command 名を `helix` とする。

PO への進捗報告・調査結論・確認依頼など chat 出力は日本語を既定とする。docs / handover / adapter prose も日本語を基本とし、CLI 名・識別子・技術用語は原語のまま扱ってよい。

- `helix status` は local runtime mode を報告する。
- `helix completion decision-packet --json` は completionClaimAllowed=false と未完了 blocker queue を確認する。
- `helix completion review-bundle --json` は S4 / version-up / rename / action-binding の scoped review packet、exact digest、semantic digest を確認する。
- `helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json` は distribution tag 更新を plan-only / no-write 証跡として確認する。
- `helix doctor --profile consumer` は consumer repo 向け health check を実行する。
- `helix rename plan --json` は PLAN-M-02 承認前の blocked packet を確認する。
- `helix handover` は cross-runtime handover state を読み書きする。
- `helix codex --role <role> --task "..."` は Codex へ委譲する。
- `helix claude --role <role> --task "..."` は Claude へ委譲する。

adapter doc に secret、token、machine-local absolute path を書かない。
<!-- HELIX:managed:end -->
