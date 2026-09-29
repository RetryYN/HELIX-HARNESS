# 旧candidate 2系列のStage 5分類再評価

- audit id: `legacy-candidate4755-two-family-classification-reassessment-2026-09-29`
- 基準: merged #2361 exact `132a56f3f2cbb1d02ad3bc08bab4f23ef93369cc`。#2353/#2356/#2360 overlay後の該当2文書14行。#2361累積監査JSONのSHA-256は `e29aadd8c84dda8fcfca65010ffa62331b6631ffce3ac22ef5d174270bb92b20`。
- 関連入力: merged #2362 exact `847f7262d1248de2de5165d029a9175e027bda6c`の5行route提案を別pinで固定。対象14行とは別集合で、この4755行分類baselineを変えない。
- 除外: merged #2363 exact `e7f5f54c86e45c2904c129cd24c94d589bafb4bd`の16 ID（JSONに全IDを固定）。最終監査JSONのSHA-256は `12986b5f2f014120cd2a7e674cf999527d6f659e06779d89fdfc87c16fc93384`。
- authority effect: `none`。proposalは候補分類とatom境界のみを示す。採択、successor、coverage、受入、実装を示さない。

## 分類案

| source ID | 原文位置 | 現分類 | 提案 | atom境界・判断 |
|---|---|---|---|---|
| `LEGACY-CAND-LINE-000528` | `ci-event-concurrency-generation-requirements.md:31` | condition / product / unknown | product atom（維持） | CIG-R-02の段落（archive 30〜32行）。対象の31行は前行から続き、次行まで文が続く。 CI生成のcancel／terminal handoff挙動を定める技術条件であり、プロジェクト管理条件ではない。分類を維持し、routeはunknownのままとする。 |
| `LEGACY-CAND-LINE-000532` | `ci-event-concurrency-generation-requirements.md:38` | condition / product / unknown | product atom（維持） | CIG-R-03の38〜39行の文。2行を合わせてmain pushの条件付きsupersede規則を構成する。 CI生成の状態依存supersede挙動を定める製品・システム条件であり、プロジェクト管理条件ではない。分類を維持し、routeはunknownのままとする。 |
| `LEGACY-CAND-LINE-000533` | `ci-event-concurrency-generation-requirements.md:39` | condition / product / unknown | product atom（維持） | CIG-R-03の38〜39行の文。2行を合わせてmain pushの条件付きsupersede規則を構成する。 CI生成の状態依存supersede挙動を定める製品・システム条件であり、プロジェクト管理条件ではない。分類を維持し、routeはunknownのままとする。 |
| `LEGACY-CAND-LINE-000583` | `concept-vision-package-intake.md:47` | condition / product / unknown | management process condition | 「入力文書の補正対象」節にあるsource照合の補正項目（archive 47行）。 特定の受領資料のsource照合条件を示しており、外部製品の動作・受入条件ではない。 |
| `LEGACY-CAND-LINE-000584` | `concept-vision-package-intake.md:48` | condition / product / unknown | management process condition | 「入力文書の補正対象」節にある数値の扱いに関する補正項目（archive 48行）。 歴史的資料の数値を現行計測値と誤認しないための管理条件であり、外部製品の動作・受入条件ではない。 |
| `LEGACY-CAND-LINE-000586` | `concept-vision-package-intake.md:52` | condition / product / unknown | management process condition | 「完了条件と削除条件」節の独立したチェック項目（archive 52〜56行）。各項目を別条件として保持する。 入力、差分、source照合、または移行証拠の管理条件であり、特定作業の完了手順を定める。 |
| `LEGACY-CAND-LINE-000587` | `concept-vision-package-intake.md:53` | condition / product / unknown | management process condition | 「完了条件と削除条件」節の独立したチェック項目（archive 52〜56行）。各項目を別条件として保持する。 入力、差分、source照合、または移行証拠の管理条件であり、特定作業の完了手順を定める。 |
| `LEGACY-CAND-LINE-000588` | `concept-vision-package-intake.md:54` | condition / product / unknown | management process condition | 「完了条件と削除条件」節の独立したチェック項目（archive 52〜56行）。各項目を別条件として保持する。 入力、差分、source照合、または移行証拠の管理条件であり、特定作業の完了手順を定める。 |
| `LEGACY-CAND-LINE-000589` | `concept-vision-package-intake.md:55` | condition / product / unknown | management process condition | 「完了条件と削除条件」節の独立したチェック項目（archive 52〜56行）。各項目を別条件として保持する。 入力、差分、source照合、または移行証拠の管理条件であり、特定作業の完了手順を定める。 |
| `LEGACY-CAND-LINE-000590` | `concept-vision-package-intake.md:56` | condition / product / unknown | management process condition | 「完了条件と削除条件」節の独立したチェック項目（archive 52〜56行）。各項目を別条件として保持する。 入力、差分、source照合、または移行証拠の管理条件であり、特定作業の完了手順を定める。 |
| `LEGACY-CAND-LINE-000591` | `concept-vision-package-intake.md:57` | condition / product / unknown | explanation | 「完了条件と削除条件」節にある過去の保存・検証状況（archive 57行）。 過去に行った保存や照合の記録であり、新たな製品条件や現在の作業条件を示さない。 |
| `LEGACY-CAND-LINE-000592` | `concept-vision-package-intake.md:58` | condition / product / unknown | management process condition | 過去の作業状況を記した58行の前半は独立検収の追跡手順、後半は当時の状態記録。 特定作業の独立検収を追跡する管理条件であり、外部製品の動作条件ではない。 |
| `LEGACY-CAND-LINE-000593` | `concept-vision-package-intake.md:59` | condition / product / unknown | explanation | 「完了条件と削除条件」節にあるZIP削除と原文復元元の過去状態（archive 59行）。 過去のsource保存・可用性を記す状態記録であり、新たな製品条件や現在の作業条件を示さない。 |
| `LEGACY-CAND-LINE-000594` | `concept-vision-package-intake.md:60` | condition / product / unknown | management process condition | 過去のCIと言語修正を記す60行。末尾のbaseline維持を管理条件として切り出し、先行する検出・対応経緯は状態文脈とする。 外部原文の扱いと言語検査baselineの維持に関する管理条件であり、外部製品の動作条件ではない。 |

対象はCI concurrency 3行、Concept/Vision intake 11行。CI側3行はproduct atomとして維持し、intake側9行をmanagement process condition、2行をexplanationへ分類する。原文とfile/line digest、改行を含むphysical-line SHA-256、入力pin、#2363除外集合は同名JSONに記録した。

## 母集団への影響（分類算術とhandoff／closureを分離）

merged #2361の確定baselineではproduct route unknownは544件。merged #2363の最終監査はこのbaselineを使用し、分類差分−12により提案上532件とする。今回の#2366分類差分は、condition −2、explanation +2、management process condition +9、product requirement atom −11、product route unknown −11、management successor unresolved +9、not_condition +2。両提案を重ねた分類算術は544−12−11=521件となる。これは#2361と#2363のmerged proposalに今回のbounded proposalを加えた提案上の数であり、全量累積recountを新たに実施した値ではない。

unknown −11は9行をmanagement process condition、2行をexplanationへ再分類する集計差分である。これは11件のhandoff、successor assignment、coverage、resolution、closureを意味しない。9行の管理条件は未解決のまま残る。3行のproduct atomもunknownのまま保持する。authority effectはnoneであり、採択・successor・coverage・受入・実装を生成しない。

## 検証

14件のID一意性、#2363 merged proposalの16 IDとの非重複、台帳からの原文・line digest一致、旧archive file SHAとbytesの一致を静的確認した。#2361/#2362/#2363のmerged audit pinをJSONに記録した。分類差分はhandoff、successor assignment、coverage、resolution、acceptance、implementation、closureを示さない。旧runtime・CLI・test・hook・CIは実行していない。
