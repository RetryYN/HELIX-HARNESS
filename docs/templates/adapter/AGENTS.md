<!-- UT-TDD:managed:start -->
# HELIX Adapter

This project uses HELIX commands as the local orchestration surface. The CLI is still `ut-tdd` until PLAN-M-02 performs the atomic identifier migration.

- Status: `ut-tdd status`
- Doctor: `ut-tdd doctor`
- Handover: `ut-tdd handover`
- Codex delegation: `ut-tdd codex --role <role> --task "..."`
- Claude delegation: `ut-tdd claude --role <role> --task "..."`
- Team run: `ut-tdd team run --definition .ut-tdd/teams/<team>.yaml`

Project-owned instructions outside this managed block remain consumer-owned.
<!-- UT-TDD:managed:end -->
