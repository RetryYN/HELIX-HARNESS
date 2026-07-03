<!-- UT-TDD:managed:start -->
# HELIX アダプター

この project は local orchestration surface として HELIX command を使う。PLAN-M-02 で atomic identifier migration が行われるまでは、CLI 名は `ut-tdd` のまま扱う。

PO への進捗報告・調査結論・確認依頼など chat 出力は日本語を既定とする。docs / handover / adapter prose も日本語を基本とし、CLI 名・識別子・技術用語は原語のまま扱ってよい。

- 状態確認: `ut-tdd status`
- 完了判定 packet 確認: `ut-tdd completion decision-packet --json`
- 完了 review bundle 確認: `ut-tdd completion review-bundle --json` (exact digest と semantic digest を確認)
- Version-up dry-run: `ut-tdd version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json`
- 診断: `ut-tdd doctor --profile consumer`
- rename packet 確認: `ut-tdd rename plan --json`
- 引き継ぎ: `ut-tdd handover`
- Codex 委譲: `ut-tdd codex --role <role> --task "..."`
- Claude 委譲: `ut-tdd claude --role <role> --task "..."`
- チーム dry-run: `ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json`

この managed block の外側にある project-owned instruction は consumer 側の所有物として扱い、勝手に上書きしない。
<!-- UT-TDD:managed:end -->
