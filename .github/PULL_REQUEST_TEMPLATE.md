## 概要

## 関連 PLAN / Issue
Closes #

## 原子契約scope

記入規則: 6項目は1行1項目の`Field: value`形式で、値は同じ行に置く。複数値はカンマで区切り、値をbacktickで囲まない。
`Required companion paths`は不要なら`none`、`Scope expansion`は通常`none`とする。CIの受理範囲はこの表記規則を含めて厳密に検査する。

Behavior contract: <!-- 1件だけ。例 GH-AC-040 -->
Responsibility owner: <!-- kebab-caseで1責務 -->
Allowed path families: <!-- exact pathまたはdirectory prefixをcomma区切り。prefixの責務粒度はAI-Bが確認 -->
Expected changed paths: <!-- base..head diffに含める全exact pathをcomma区切り。追加時は一覧とScope expansionを更新 -->
Required companion paths: <!-- diffに含むPLAN/testのexact path。不要ならnone -->
Scope expansion: none <!-- または approved receipt=https://github.com/OWNER/REPO/pull/N#issuecomment-N reason=12文字以上 -->

## V-model artifact (該当に ✓)
- [ ] ① 設計 (docs/design/)
- [ ] ② 実装 (src/)
- [ ] ③ テスト設計 (docs/test-design/)
- [ ] ④ テストコード (tests/)

## 検証
- [ ] typecheck pass
- [ ] 全回帰 pass
- [ ] review 前置 通過 (frontier-reviewer / intra_runtime_subagent)
