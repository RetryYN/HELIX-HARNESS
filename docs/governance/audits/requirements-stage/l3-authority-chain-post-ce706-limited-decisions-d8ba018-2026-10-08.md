# ce706後の限定L3/L10委任decision chain（d8ba018時点）

この時点追補は、ce70628e snapshotと過去のdecision recordを変更せず、#2688/#2692/#2694/#2695/#2696の限定decision・正式condition3・main merge/read-afterを対応付ける。POの事後確認、L10の実行結果、274親の意味完了は作らない。

対象mainは `d8ba018d74b05846e0eb489ed608c2881c9937cd`。作業branch側でこのmainをmergeしたHEADは `39bee76fabeb1ee31e4658a954a9973af558d259`。

## 限定chain

| PR | scope | 固定decision record | Opus/Fable formal | 条件3 | merge / read-after |
|---|---|---|---|---|---|
| [#2688](https://github.com/RetryYN/HELIX-HARNESS/pull/2688) | HELIX-OS Stage 2c: HELIXOS-L2-028, HELIXOS-L2-029 | `docs/governance/decisions/helix-os-stage2c-parent028029-review04-l3-l10-delegated-decision-2026-10-08.md` (`beb3090a6c`) | formal 6046990637 | [comment 6047075617](https://github.com/RetryYN/HELIX-HARNESS/pull/2688#issuecomment-6047075617) 成立 | [comment 6047095096](https://github.com/RetryYN/HELIX-HARNESS/pull/2688#issuecomment-6047095096) → `dddab671b0` |
| [#2692](https://github.com/RetryYN/HELIX-HARNESS/pull/2692) | HELIX-OS Stage 5: HELIXOS-L2-025 | `docs/governance/decisions/helix-os-stage5-parent025-review02-l3-l10-delegated-decision-2026-10-08.md` (`0ee0f8bd80`) | formal 6047203907 | [comment 6047248398](https://github.com/RetryYN/HELIX-HARNESS/pull/2692#issuecomment-6047248398) 成立 | [comment 6047268248](https://github.com/RetryYN/HELIX-HARNESS/pull/2692#issuecomment-6047268248) → `6e26ee3929` |
| [#2694](https://github.com/RetryYN/HELIX-HARNESS/pull/2694) | HELIX-LABO Stage 5: HELIXLABO-L2-063 | `docs/governance/decisions/helix-labo-stage5-parent063-review02-l3-l10-delegated-decision-2026-10-08.md` (`dd0a6425a4`) | formal 6047400034 | [comment 6047432658](https://github.com/RetryYN/HELIX-HARNESS/pull/2694#issuecomment-6047432658) 成立 | [comment 6047464544](https://github.com/RetryYN/HELIX-HARNESS/pull/2694#issuecomment-6047464544) → `691afef75a` |
| [#2695](https://github.com/RetryYN/HELIX-HARNESS/pull/2695) | HELIX-OS Stage 3: HELIXOS-L2-036 | `docs/governance/decisions/helix-os-stage3-parent036-review01-return-routing-l3-l10-delegated-decision-2026-10-08.md` (`69e723851f`) | formal 6047392796 | [comment 6047419887](https://github.com/RetryYN/HELIX-HARNESS/pull/2695#issuecomment-6047419887) 成立 | [comment 6047445605](https://github.com/RetryYN/HELIX-HARNESS/pull/2695#issuecomment-6047445605) → `553227b0e6` |
| [#2696](https://github.com/RetryYN/HELIX-HARNESS/pull/2696) | HELIX-LABO Stage 5: HELIXLABO-L2-061 | `docs/governance/decisions/helix-labo-stage5-parent061-review01-l3-l10-delegated-decision-2026-10-08.md` (`60cfd0bd80`) | formal 6047576368 | [comment 6047643546](https://github.com/RetryYN/HELIX-HARNESS/pull/2696#issuecomment-6047643546) 成立 | [comment 6047658257](https://github.com/RetryYN/HELIX-HARNESS/pull/2696#issuecomment-6047658257) → `d8ba018d74` |

各decisionは表記した親と本文revisionに対する限定判断である。#2688は028/029、他は各1親。PR mergeやmainへの統合を、対象外の親へ広げない。OS036では旧#2680 review02 decision（HEAD `091624f…`、formal 6045205061）を新しい#2695 C3 chainに誤接続せず、今回の正式recordは `helix-os-stage3-parent036-review01-return-routing-...`（HEAD `69e72385…`、formal 6047392796）である。

各PRのcondition3 raw body SHA、formal review raw body SHA/bytes、decision/pin file SHA、merge comment SHA、merge ancestryはJSONに収録した。#2696についてはRoot post-merge proof `/tmp/root-pr2696-postmerge-proof.json`（1815 bytes、SHA-256 `df93486de39107f8671fc130ae126b7766cbac916ae404b488f8bd81971342ca`）も固定し、main tree `05cb5c6b6020b4f1b7277415cbed3e1773c2fe61`、16 paths、Root read-after PASSを記録した。残る4件はPRのClaude merge/read-after commentを根拠にし、Root独立read-afterとは記載しない。

## 現行48本文pin

d8ba018のcanonical L3/L10本文48ファイルのbytes/SHA-256をJSONへ全件記録した。これは対象mainのファイル状態を表す。限定decisionの範囲拡張、他のparentの承認、48本文一括承認を意味しない。

## 履歴と限界

- 以前の41-group snapshotは [`l3-authority-chain-41groups-ce70628.json`](l3-authority-chain-41groups-ce70628.json)、target `ce70628e53ff5f78c1321accf57429c740ea585d` のまま保持する。今回の追補はそこへ遡及しない。
- OS023 / SECURITY009・012で古いdecisionへ後続condition3を結び付けない訂正は [`l3-authority-chain-prior-decision-condition3-correction-2026-10-08.json`](l3-authority-chain-prior-decision-condition3-correction-2026-10-08.json)。そのSHA-256は `38966fb6180fac3032a1d4949c877b03f988874e221bae5111502171cb42f65a`。本追補でもcondition3 commentが引用するreview formalとreviewed HEADを個別に対応付けた。
- PO事後確認は未記録、L10実行は未実施。全274親の意味完了・全親承認・全48本文同時承認は主張しない。
- JSONには48本文それぞれの実測SHAを保持する。fixture・runtime・CIは実行していない.

JSON: `l3-authority-chain-post-ce706-limited-decisions-d8ba018-2026-10-08.json`
