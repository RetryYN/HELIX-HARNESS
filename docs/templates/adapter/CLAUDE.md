<!-- UT-TDD:managed:start -->
# HELIX 共有コンテキスト

harness state と delegation には repository-local HELIX command を使う。PLAN-M-02 までは現行 command 名を `ut-tdd` とする。

PO への進捗報告・調査結論・確認依頼など chat 出力は日本語を既定とする。docs / handover / adapter prose も日本語を基本とし、CLI 名・識別子・技術用語は原語のまま扱ってよい。

- `ut-tdd status` は local runtime mode を報告する。
- `ut-tdd doctor --profile consumer` は consumer repo 向け health check を実行する。
- `ut-tdd handover` は cross-runtime handover state を読み書きする。
- `ut-tdd codex --role <role> --task "..."` は Codex へ委譲する。
- `ut-tdd claude --role <role> --task "..."` は Claude へ委譲する。

adapter doc に secret、token、machine-local absolute path を書かない。
<!-- UT-TDD:managed:end -->
