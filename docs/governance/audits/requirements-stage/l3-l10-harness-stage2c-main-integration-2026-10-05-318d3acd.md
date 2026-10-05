# HARNESS Stage 2c 最新main prefix統合・状態訂正記録

- 本文revision: `318d3acd135e177acc70885a8d1e5296450baf1f`
- 最新main: `91660f403d203dff92a50ac7f5484db6ab13f96d`
- 対象: HARNESS-L2-030/031/032のみ
- 6正本はmainの承認済みStage 1、Stage 2b（012–016）、Stage 2a（022）の本文をbyte単位でprefixに保持し、その後ろにStage 2c suffixを置く。022 suffixは承認済みprefixの一部として保持するが、Stage 2cの対象親にはせず、022の義務を030/031/032へ追加しない。
- 旧Stage 2c統合記録 `l3-l10-harness-stage2c-main-integration-2026-10-05-5eb928d.json` は変更していない。この新記録は当時の誤ったcurrent-state記述を訂正し、旧記録の過去時点の記述を保持する。
- Stage 2c 030/031/032は未承認候補であり、この記録はその承認・独立review・実装・実行・releaseを主張しない。
- 32固定source pinを指定Git objectから再取得し、full-file SHAと指定bounded raw-LF spanを照合。4つの過去監査・summaryもbyte-identical。6文書のcurrent line pinは678件、Stage 2c suffixは126行。
- C13の過去review comment #5981101754をread-only APIから取得。現在取得したbodyは32,524 UTF-8 bytes、SHA-256 `ec73191641cef5fc5135049f6243212dd2e3972291800b50bced366da87ab6d2`、末尾LFあり。これは履歴review本文のdigest補完であり、現行本文の独立reviewやfinding closureではない。
- 静的検証の値はJSON記録を参照。旧runtime、test、CI、Bunは起動していない。

6正本の全文SHA-256:

| 文書 | SHA-256 |
|---|---|
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `a21014f5796cf80caf63ff7824f3885d24b2d91c05f795bd92c13c8e1c93a091` |
| `docs/helix-harness/L3-requirements/business-requirements.md` | `ccb3f6ec5d7b3c51f629f8615977ef25319eae9426fc52d4dae0962fd3f41d5b` |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | `e183644257957f79da94bffd7fcf912b828e7cf3783ce56dd60df2ac609f6b65` |
| `docs/helix-harness/L10-verification/functional-verification.md` | `33baaf06739c4ca6cbb2987775ec7328b2a433ac74d23c69e1745017c61b2014` |
| `docs/helix-harness/L10-verification/business-verification.md` | `48d60b8752a8bc404cc7a3c0874f3322f93405fabaabe358067daa0945542acf` |
| `docs/helix-harness/L10-verification/nfr-verification.md` | `b9e844b83dbbdbac8f79b1cbc4f7df5d9fc32cfbe06a963cd1777d8ccced4c60` |

機械検証の詳細、全current line pin、固定source pin、継承記録とC13状態は同名JSONに固定する。
