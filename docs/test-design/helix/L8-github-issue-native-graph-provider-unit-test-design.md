# GitHub Issue native graph provider 単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-IGNPROV-001 | `githubIssueNativeGraphQueryArgs` | repository／Issue値をqueryへ補間せずvariablesへ分離し、不正identityを拒否する | `tests/github-issue-native-graph-provider.test.ts` |
| U-IGNPROV-002 | `loadGitHubIssueNativeGraphSnapshot` | stable IDと4面graphを正規化し、`hasNextPage=true`をcompleteへ偽装しない | `tests/github-issue-native-graph-provider.test.ts` |
| U-IGNPROV-003 | `loadGitHubIssueNativeGraphSnapshot` | API非0、Issue欠落、identity不一致、malformed connectionをfail-closeする | `tests/github-issue-native-graph-provider.test.ts` |

## Mutation

connectionのcompleteを常時trueへ変更するとU-IGNPROV-002がRedになることを確認する。
