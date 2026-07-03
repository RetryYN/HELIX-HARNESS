<!-- UT-TDD:managed:start -->
# HELIX アダプター

この project は local orchestration surface として HELIX command を使う。PLAN-M-02 で atomic identifier migration が行われるまでは、CLI 名は `ut-tdd` のまま扱う。

PO への進捗報告・調査結論・確認依頼など chat 出力は日本語を既定とする。docs / handover / adapter prose も日本語を基本とし、CLI 名・識別子・技術用語は原語のまま扱ってよい。

- Status: `ut-tdd status`
- Completion packet: `ut-tdd completion decision-packet --json`
- Version-up dry-run: `ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --release-remote https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git --json`
- Doctor: `ut-tdd doctor --profile consumer`
- Rename packet: `ut-tdd rename plan --json`
- Handover: `ut-tdd handover`
- Codex delegation: `ut-tdd codex --role <role> --task "..."`
- Claude delegation: `ut-tdd claude --role <role> --task "..."`
- Team run dry-run: `ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json`

この managed block の外側にある project-owned instruction は consumer 側の所有物として扱い、勝手に上書きしない。
<!-- UT-TDD:managed:end -->
