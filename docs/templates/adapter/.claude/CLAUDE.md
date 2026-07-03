<!-- UT-TDD:managed:start -->
# Claude runtime アダプター

Claude Code session の HELIX lifecycle work は、現行 `ut-tdd` CLI 経由で扱う。
consumer-owned Claude instruction は、この managed block の外側へ追加できる。
PLAN-M-02 で atomic identifier migration が行われるまでは、CLI 名は `ut-tdd`、state dir は `.ut-tdd` のまま扱う。

PO への進捗報告・調査結論・確認依頼など chat 出力は日本語を既定とする。docs / handover / adapter prose も日本語を基本とし、CLI 名・識別子・技術用語は原語のまま扱ってよい。

- Session evidence: `ut-tdd status`、`ut-tdd completion decision-packet --json`、`ut-tdd completion review-bundle --json` (exact digest と semantic digest を確認)、`ut-tdd version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json`、`ut-tdd rename plan --json`、`ut-tdd handover`
- Health check: `ut-tdd doctor --profile consumer`
- Review separation: 可能な場合は別 runtime / model family を使う

<!-- UT-TDD:managed:end -->
