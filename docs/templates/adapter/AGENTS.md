<!-- HELIX:managed:start -->
# HELIX アダプター

この project は local orchestration surface として HELIX command を使う。PLAN-M-02 で atomic identifier migration が行われるまでは、CLI 名は `helix` のまま扱う。

PO への進捗報告・調査結論・確認依頼など chat 出力は日本語を既定とする。docs / handover / adapter prose も日本語を基本とし、CLI 名・識別子・技術用語は原語のまま扱ってよい。

- 状態確認: `helix status`
- 完了判定 packet 確認: `helix completion decision-packet --json`
- 完了 review bundle 確認: `helix completion review-bundle --json` (exact digest と semantic digest を確認)
- 診断: `helix doctor --profile consumer`
- Codex 委譲: `helix codex --role <role> --task "..."`
- Claude 委譲: `helix claude --role <role> --task "..."`
- 更新／rollback／uninstall確認: `helix lifecycle rehearsal --operation <upgrade|rollback|uninstall> --json`

Lite profileに含まれないteam／resident lane／provider fallback／rename／publish commandを推測して実行しない。

この managed block の外側にある project-owned instruction は consumer 側の所有物として扱い、勝手に上書きしない。
<!-- HELIX:managed:end -->
