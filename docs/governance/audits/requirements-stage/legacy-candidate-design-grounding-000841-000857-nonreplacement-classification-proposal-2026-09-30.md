# 旧Design Grounding 000841・000857 非並立条件の2行分類案（2026-09-30）

- audit id: `legacy-candidate-design-grounding-000841-000857-nonreplacement-classification-proposal-2026-09-30`
- base: `f89f71e0371440e9e10636499192c2311872b024`（#2368 merge後main）。#2367 merge commit `b438bf16a3e3e4f21cf4a9762ae59c7d7efccaf7`はimmutable inputとしてpin。
- authority effect: `none`。この文書は旧source 000841・000857の2行分類提案であり、要求採択、successor登録、coverage、受入、実装、closureを生成しない。
- 対象source asset: `LEGACY-ASSET-A422448C3CACBCA75D0C`。source、carry-forward ledger、archive manifest、#2353/#2356/#2360/#2361/#2363/#2366/#2367/#2368 exact pinsは同名JSONに記録した。

## 分類案

| Source ID | 旧source line | 現在の分類 | 提案 |
|---|---:|---|---|
| `LEGACY-CAND-LINE-000841` | 32 | #2353 baseline `explanation / not_condition` | `condition / product_requirement_atom / unknown` |
| `LEGACY-CAND-LINE-000857` | 56 | #2353 baseline `explanation / not_condition` | `condition / product_requirement_atom / unknown` |

000841は既存のScreen Applicability、Prototype・Walkthrough、Design Registry、UI Domain Pattern、Evidence Bindingを正本として再利用し、現在弱い3領域だけを強化すると指示する。これは解説だけでなく、既存機構を置換せず限定的に強化する製品・システム制約を定める。000857は等価責務を持つ別Engine、Registry、Prototype Gate、Research subsystemの並立を明示的に禁止する。両行を同じnonreplacement atomへまとめる分類案とする。両source行はhistorical candidateのまま、routeはunknownとして扱い、現行の採択やsuccessorを推定しない。

## #2367 atomとの接続

merge済み#2367のJSON（commit `b438bf16a3e3e4f21cf4a9762ae59c7d7efccaf7`）は、atom `DGH-intake.nonreplacement-integration-constraint`を、`000840`および`000850–856`の8 source IDsで定義する。000840は既存Design Harnessを作り直さない条件、000850は既存機構を接続先として使う導入、000851–856はその対象を列挙する。

本案は000841と000857を、同じ境界の再利用指示側および明示的禁止側としてatomへ加える。提案後のsource IDは`000840–000857`のうち、000842–000849を除く10行（000840、000841、000850–000857）。#2367のMD/JSONはimmutableな過去監査としてpinし、書き換えていない。対応する#2363の000542（別cancel authorityを作らず既存providerを再利用）と000546（named responsibilitiesを再実装しない）も、product atom/unknownを保持する非置換条件の類例である。

## 件数影響

#2361 merged cumulative recountのeffective product unknownは544件。#2363（−12）と#2366（−11）の別proposal後は521件、#2367の51行proposal（−14）後は507件、merged #2368の47行proposal（−21）後は486件。本案を追加するproposal-only算術は`486 + 2 = 488`件となる。全体算術は`544 − 12 − 11 − 14 − 21 + 2 = 488`。今回の2行だけを#2361 effective baselineへ適用した比較値は544→546である。explanation −2、condition/product atom +2、product route unknown +2。これらの数値は分類proposalの算術であり、handoff・successor・coverage・resolution・closureを表さない。#2368はmerge済みの分類proposal監査であり、採択authorityを作らない。

merged #2368の47行集合に000841・000857は含まれない。#2364は別のroute sampleで、この分類判定のauthority/count inputには使っていない。

## Source identity

対象source file SHA-256: `177def78bced15ffad9a5db7fc6ccf67a425d0d892be5892b085b8e1ed3c102c`

- `000841` line 32: line SHA-256（改行除外）`0c2279d2b25a0425095a2020912d997e88582a1b67ecfac2dfc044ee5013feb5`; physical line bytes SHA-256（改行込み）`c49910ddff2c15e8e2e9f4c0b7ee2b91528e4d5001abce9c07033ac46e13a009`
- `000857` line 56: line SHA-256（改行除外）`07d75a8d2acdb6f1a5f354dd87f376bac0499114ba5ddbb9532fe2bb07ab55e3`; physical line bytes SHA-256（改行込み）`e855306302133f887359f72c0da8667236963509e71c41c6f425731bcfa8d2b3`

## 検証範囲

source file/line/physical-line SHA、#2353 baseline分類、#2361 cumulative count、#2363/#2366/#2367/#2368のexact pinsとproposal arithmeticを照合する。旧runtime、CLI、test、CI、hookは実行しない。
