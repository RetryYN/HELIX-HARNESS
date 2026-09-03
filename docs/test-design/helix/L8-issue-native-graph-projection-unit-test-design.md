# Issue native graph projection 単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-IHIER-018 | `auditIssueNativeGraphProjection` | bodyにだけ存在するparent／child／dependencyとnative-only dependencyを個別findingへ分解する | `tests/issue-hierarchy.test.ts` |
| U-IHIER-019 | `auditIssueNativeGraphProjection` | pagination不完了、stable node ID欠落、body-governed Issue欠落を推測せず拒否する | `tests/issue-hierarchy.test.ts` |
| U-IHIER-020 | `auditIssueNativeGraphProjection` | exact graphは入力順と重複edgeによらずgreenかつ同一digestになる | `tests/issue-hierarchy.test.ts` |

## Mutation

pagination完了検査を除去するとU-IHIER-019がRedになること、dependency missing比較を除去すると
U-IHIER-018がRedになることを確認する。
