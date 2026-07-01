<!-- UT-TDD:managed:start -->
# HELIX アダプター

この project は local orchestration surface として HELIX command を使う。PLAN-M-02 で atomic identifier migration が行われるまでは、CLI 名は `ut-tdd` のまま扱う。

- Status: `ut-tdd status`
- Doctor: `ut-tdd doctor --profile consumer`
- Handover: `ut-tdd handover`
- Codex delegation: `ut-tdd codex --role <role> --task "..."`
- Claude delegation: `ut-tdd claude --role <role> --task "..."`
- Team run: `ut-tdd team run --definition .ut-tdd/teams/<team>.yaml`

この managed block の外側にある project-owned instruction は consumer 側の所有物として扱い、勝手に上書きしない。
<!-- UT-TDD:managed:end -->
