# Commitlint push admission unit test design

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-GITGUARD-016 | 不正subject | 実bare remoteに対する小文字`merge:`をpush前に拒否する。 | `tests/git-command-guard.test.ts` |
| U-GITGUARD-017 | 合法subject | Conventional subjectとGit既定`Merge `subjectを許可する。 | `tests/git-command-guard.test.ts` |
| U-GITGUARD-018 | shell/cwd | `git -C`とnested shellからpushの実効cwd・引数を保持する。 | `tests/git-command-guard.test.ts` |
| U-GITGUARD-019 | identity fail-close | 複数refspecを推測で通さず、commitを送らないremote deleteは対象外にする。 | `tests/git-command-guard.test.ts` |

検出呼出しを外すmutationではU-GITGUARD-016が失敗し、CI側commitlintの変更ではgreen化できないことを確認する。
