<!-- UT-TDD:managed:start -->
# Claude runtime アダプター

Claude Code session の HELIX lifecycle work は、現行 `ut-tdd` CLI 経由で扱う。
consumer-owned Claude instruction は、この managed block の外側へ追加できる。

- Session evidence: `ut-tdd status` と `ut-tdd handover`
- Health check: `ut-tdd doctor --profile consumer`
- Review separation: 可能な場合は別 runtime / model family を使う

<!-- UT-TDD:managed:end -->
