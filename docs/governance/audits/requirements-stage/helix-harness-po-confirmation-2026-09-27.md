# HARNESS 要求段階 PO 確認パケット（判断受領済み）

**現在の状態（2026-09-28）**：PO判断を受領し、[判断記録](../../decisions/helix-harness-requirements-po-decision-2026-09-28.md)へ全文・対象SHA・全24候補の採用を記録した。以下の質問・候補状態の説明は判断前の提示内容として残す。現在の採否と個別選択は判断記録を参照する。

## PO向け：この要求で何を作るか

HARNESS 1.0は、開発の7サービスを単独でも組み合わせても使える形にする要求案である。各サービスは、何を受け取り、何を返し、何を確かめれば成立するかを持つ。以下は採用時に実現する能力の要約であり、実装済みという報告ではない。詳細な条件・例外・受入は後掲の固定したL2/L11本文が正本である。

### 7サービスと、それらを支える処理

| 対象 | 1.0で提供する能力と成立の境界 | 主な要求ID |
|---|---|---|
| ① 画面プロト／PoC | 要求や不確かな点を受け、画面の試作や成立性を確かめる材料を作る。他の6サービスを完成させなくても利用でき、試作を正式な実装の合格に置き換えない。 | 012 |
| ② 要件定義 | 企画・要求・試作で合意したことを、根拠と対応が分かる要件へ具体化する。要求形成では、判断を変える質問を優先し、未決や反例を残して収束の理由を示す。 | 013、既存008、024 |
| ③ 設計 | 要求から、構造・処理・データ・画面などの相互参照する具体設計と、その正しさを確かめる条件を組み立てる。BRAINの知識は候補として使い、製品固有の意味や設計の採否は引き取らせない。 | 014、025/026 |
| ④ 開発 | 対の設計に沿ってコード等を作り、定めた検証で内容を確かめる。文書やコードの存在、CI成功だけで品質や実用上の効果を合格にしない。 | 015、022 |
| ⑤ リファクタリング | 既存の意味を保つ範囲で構造を改善する。外から加えた編集も観測し、保存設計との差分と影響を示す。意味を変える必要があれば上流へ戻す。 | 016、027〜029 |
| ⑥ リリース | 提供範囲・版・必要な証拠をそろえ、対象を提供する工程を成立させる。実際の配布・更新・復旧の運転はOS側に残し、この要求の採用を配布許可とはしない。 | 017、020 |
| ⑦ 運用保守 | 運用の記録・障害・改善の材料を扱い、変更と再検証へつなぐ。資源の実状態はINFRA、作業状態はOS、効果評価はLABOが持つ。 | 018、031等の共有能力 |
| 共通部品 | 既存物を読む入口と、構造・振舞いの抽出、保存設計との比較、障害入力の縮小・再現候補を共有する。読めなかった意味や再現未確認を成功に丸めず、外部編集を消さない。 | 019、027/028/031の所属候補 |
| CORE・共通契約 | 呼出し口、版、入力、必要な依存、検証義務を統一し、サービス間の引継ぎと組合せ固有の受入を支える。テストの候補生成と実行結果を分け、実行はOSまたは利用者CIに任せる。 | 010/011、020〜023、029/030/032/033の所属候補 |

IDの省略表記はすべて `HARNESS-L2-` を指す。7サービスの単独成立と、統合したHARNESSの成立（021）は別の受入である。

### 前回の企画確認から具体化・強化したこと

前回のPO判断は旧L1の内容採用と1.0土台の追記指示であり、以下の現在の要求集合を一括採用した記録ではない。

| 追加・強化した候補 | 今回の本文で読めること |
|---|---|
| 機能単位と7サービス：010〜022 | 一つの能力、能力間の接続、複数能力を束ねた構成体を分け、入力・出力・版・依存・受入を明示した。 |
| 依存選別・要求形成：023/024（G10/G11） | 常時必要なものと、特定操作・選択入力元に応じて必要なものを分けた。要求形成には質問の優先と収束根拠を加えた。 |
| 内容の品質・効果：014〜016/022（G12/G20） | 設計やコードの存在確認を越え、内容を対の基準と照合する。品質、総費用、時間、人の介入を区別し、悪化や欠測を平均や成功件数で隠さない。 |
| 設計の組立て：025/026（G15） | 要求から具体設計を組み立て、設計間の矛盾と対の判定条件を追えるようにした。 |
| 既存物との往復：027〜029（G16） | 実物の観測、保存設計との差分、限定したコード・データ改修案を分けた。案を作っただけで実変更や採用を行わない。 |
| テスト・再現・回帰：030〜033（G18） | ケース・データ・代替物の生成、障害入力の縮小、実行への受渡し、回帰成立の証拠を分けた。通常のケース生成に障害再現を一律要求しない。 |
| 機構内監査・横断照合 | 027〜033の所属候補をL2とL11に対で補った。HARNESSの検証基準とOSの実行、BRAINの知識、CONNECTの通信を分け、後から得る実行結果を作成開始の前提にしないことを照合した。 |

### 今回判断することと推奨の影響

1. 現在のL1企画を、この本文revisionで確定するか。
2. L2と対のL11の要求一式に合意し、登録された24候補（010〜033）を採用・保留・不採用のいずれにするか。既存001〜009の意味と未完の旧source引継ぎは別に保持する。
3. 所属が未確定の3件は、**029＝CORE、031＝共通部品、032＝CORE**を推奨する。これを選ぶと、複数成果の意味・影響追跡と実行依頼への意味対応はCORE、複数サービスで使う再現処理は共通部品が持つ。開発時の失敗も運用障害も対象に残し、CONNECTへ業務判断を、HARNESSへ実行主体を移さない。具体的な代替案と影響IDは後述する。

採用してもL3要件の承認・実装開始・初期の段階版（v0.1）への収載・配布許可は生まれない。ここで確定するのは要求の意味と対象revisionである。

## 対象revisionと読み口

固定main commit: f6dad2a33e24f000b87d7f09b8d40288257e74cc. 対象本文・MPRはd308f4080da298172001ef97e9c4b5f66d32ed7dとも同一。以下は固定commitの文書読み口であり、本文は複製しない。

- [docs/concept/helix-concept.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/concept/helix-concept.md) — SHA-256 06e210c312fc6a5f18c1fc29248e55ebe9c2eee0c177006e32d7b421af8baa78; blob e57b94e76049037172b7a6ce3e6376f47591ca17.
- [docs/helix-harness/L1-planning/product-intent.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-harness/L1-planning/product-intent.md) — SHA-256 238ae0590f43c10c0a59a0cea4a9907328752a81388891e1a115d4278db00e1f; blob 7d49551dac8da0ad15151090d971ce72807ce353.
- [docs/helix-harness/L2-requirements/product-requirements.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-harness/L2-requirements/product-requirements.md) — SHA-256 aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a; blob e09de04601039d8593768eb3f3342d3416d03b8b.
- [docs/helix-harness/L11-acceptance/product-acceptance.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-harness/L11-acceptance/product-acceptance.md) — SHA-256 09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4; blob f827c6bd955bbeb91deba5b7dced93e512e5da9e.
- [docs/governance/management-provisional-requirement-register.jsonl](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/management-provisional-requirement-register.jsonl) — SHA-256 71df2d06aaa144eecca2047aeb0fe1930dc8f4e82326e18bbed6975a93b3a808; blob 32a93b6195bf3e103b7a57f6493ea2415509e7f3.

- Concept: docs/concept/helix-concept.md の機構境界と1.0土台を照合。
- L1: product-intent.md:15-27,35-54。draft / draft_candidate。旧L1に対する2026-09-24判断は現行SHAを採択していない。
- L2: product-requirements.md:35-58,340-525,526-687。全IDとregistration対応を下表に示す。項目固有version_targetは023–033に記載、001–022には個別印がない。
- L11: product-acceptance.md:445-461 に027–033の責務・受入境界。全受入対応は固定本文を参照。
- 下表の候補登録行はregistered_proposal / authority_effect:none。coverage receiptは範囲coverageを示し、PO採択receiptではない。判断欄は空欄。

## L2全IDとregistration対応

登録なしの001–009は現行L2の既存IDとして維持する。未登録を不採択・欠陥・退役と推定しない。機構内監査では旧source successor/routingとして保持対象に区別されており、新たな候補質問にしない。

| L2 ID | 最新register ID | kind / register state | version_target | coverage receipt / SHA-256 |
|---|---|---|---|---|
| HARNESS-L2-001 | 登録なし | 本文ID。kind未宣言 | 個別version_target印なし | MPR receiptなし |
| HARNESS-L2-002 | 登録なし | 本文ID。kind未宣言 | 個別version_target印なし | MPR receiptなし |
| HARNESS-L2-003 | 登録なし | 本文ID。kind未宣言 | 個別version_target印なし | MPR receiptなし |
| HARNESS-L2-004 | 登録なし | 本文ID。kind未宣言 | 個別version_target印なし | MPR receiptなし |
| HARNESS-L2-005 | 登録なし | 本文ID。kind未宣言 | 個別version_target印なし | MPR receiptなし |
| HARNESS-L2-006 | 登録なし | 本文ID。kind未宣言 | 個別version_target印なし | MPR receiptなし |
| HARNESS-L2-007 | 登録なし | 本文ID。kind未宣言 | 個別version_target印なし | MPR receiptなし |
| HARNESS-L2-008 | 登録なし | 本文ID。kind未宣言 | 個別version_target印なし | MPR receiptなし |
| HARNESS-L2-009 | 登録なし | 本文ID。kind未宣言 | 個別version_target印なし | MPR receiptなし |
| HARNESS-L2-010 | MPR-RC-HARNESS-L2-010-001 | unit / registered_proposal; authority_effect=none | 個別version_target印なし | [docs/governance/audits/requirement-registration/harness-l2-010-022-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/harness-l2-010-022-coverage-receipt-2026-09-27.json) / 1d602a8e28f6cbbc82de950f8fc4b440efd197884514702bcd535f390b21651b |
| HARNESS-L2-011 | MPR-RC-HARNESS-L2-011-001 | unit / registered_proposal; authority_effect=none | 個別version_target印なし | [docs/governance/audits/requirement-registration/harness-l2-010-022-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/harness-l2-010-022-coverage-receipt-2026-09-27.json) / 1d602a8e28f6cbbc82de950f8fc4b440efd197884514702bcd535f390b21651b |
| HARNESS-L2-012 | MPR-RC-HARNESS-L2-012-001 | unit / registered_proposal; authority_effect=none | 個別version_target印なし | [docs/governance/audits/requirement-registration/harness-l2-010-022-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/harness-l2-010-022-coverage-receipt-2026-09-27.json) / 1d602a8e28f6cbbc82de950f8fc4b440efd197884514702bcd535f390b21651b |
| HARNESS-L2-013 | MPR-RC-HARNESS-L2-013-001 | unit / registered_proposal; authority_effect=none | 個別version_target印なし | [docs/governance/audits/requirement-registration/harness-l2-010-022-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/harness-l2-010-022-coverage-receipt-2026-09-27.json) / 1d602a8e28f6cbbc82de950f8fc4b440efd197884514702bcd535f390b21651b |
| HARNESS-L2-014 | MPR-RC-HARNESS-L2-014-003 | unit / registered_proposal; authority_effect=none | 個別version_target印なし | [docs/governance/audits/requirement-registration/harness-content-quality-coverage-receipt-2026-09-27-r2.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/harness-content-quality-coverage-receipt-2026-09-27-r2.json) / 2d9042062172162cc4f87de523c28ca12376f3d070c239effbdaf4fb85597345 |
| HARNESS-L2-015 | MPR-RC-HARNESS-L2-015-004 | unit / registered_proposal; authority_effect=none | 個別version_target印なし | [docs/governance/audits/requirement-registration/harness-effect-acceptance-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/harness-effect-acceptance-coverage-receipt-2026-09-27.json) / d67f3379cfc5c6884a7aa82497473267caf5f4bed309c3b84c4307ced927edb5 |
| HARNESS-L2-016 | MPR-RC-HARNESS-L2-016-004 | unit / registered_proposal; authority_effect=none | 個別version_target印なし | [docs/governance/audits/requirement-registration/harness-effect-acceptance-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/harness-effect-acceptance-coverage-receipt-2026-09-27.json) / d67f3379cfc5c6884a7aa82497473267caf5f4bed309c3b84c4307ced927edb5 |
| HARNESS-L2-017 | MPR-RC-HARNESS-L2-017-001 | unit / registered_proposal; authority_effect=none | 個別version_target印なし | [docs/governance/audits/requirement-registration/harness-l2-010-022-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/harness-l2-010-022-coverage-receipt-2026-09-27.json) / 1d602a8e28f6cbbc82de950f8fc4b440efd197884514702bcd535f390b21651b |
| HARNESS-L2-018 | MPR-RC-HARNESS-L2-018-001 | unit / registered_proposal; authority_effect=none | 個別version_target印なし | [docs/governance/audits/requirement-registration/harness-l2-010-022-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/harness-l2-010-022-coverage-receipt-2026-09-27.json) / 1d602a8e28f6cbbc82de950f8fc4b440efd197884514702bcd535f390b21651b |
| HARNESS-L2-019 | MPR-RC-HARNESS-L2-019-001 | unit / registered_proposal; authority_effect=none | 個別version_target印なし | [docs/governance/audits/requirement-registration/harness-l2-010-022-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/harness-l2-010-022-coverage-receipt-2026-09-27.json) / 1d602a8e28f6cbbc82de950f8fc4b440efd197884514702bcd535f390b21651b |
| HARNESS-L2-020 | MPR-RC-HARNESS-L2-020-001 | connection / registered_proposal; authority_effect=none | 個別version_target印なし | [docs/governance/audits/requirement-registration/harness-l2-010-022-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/harness-l2-010-022-coverage-receipt-2026-09-27.json) / 1d602a8e28f6cbbc82de950f8fc4b440efd197884514702bcd535f390b21651b |
| HARNESS-L2-021 | MPR-RC-HARNESS-L2-021-001 | composite / registered_proposal; authority_effect=none | 個別version_target印なし | [docs/governance/audits/requirement-registration/harness-l2-010-022-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/harness-l2-010-022-coverage-receipt-2026-09-27.json) / 1d602a8e28f6cbbc82de950f8fc4b440efd197884514702bcd535f390b21651b |
| HARNESS-L2-022 | MPR-RC-HARNESS-L2-022-004 | unit / registered_proposal; authority_effect=none | 個別version_target印なし | [docs/governance/audits/requirement-registration/harness-effect-acceptance-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/harness-effect-acceptance-coverage-receipt-2026-09-27.json) / d67f3379cfc5c6884a7aa82497473267caf5f4bed309c3b84c4307ced927edb5 |
| HARNESS-L2-023 | MPR-RC-HARNESS-L2-023-002 | unit / registered_proposal; authority_effect=none | 1.0 | [docs/governance/audits/requirement-registration/helix-harness-dependency-conditions-coverage-receipt-2026-09-27-r2.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helix-harness-dependency-conditions-coverage-receipt-2026-09-27-r2.json) / f09051ffdcd115792827a111aeb433b8ae258298b0a3c38e8fe39a9bbb4d7ee4 |
| HARNESS-L2-024 | MPR-RC-HARNESS-L2-024-001 | unit / registered_proposal; authority_effect=none | 1.0 | [docs/governance/audits/requirement-registration/harness-convergence-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/harness-convergence-coverage-receipt-2026-09-27.json) / b3ff17f9e58c735f08a5431cf51457b5f32187d4edcce3c32ab141cae7db35c6 |
| HARNESS-L2-025 | MPR-RC-HARNESS-L2-025-002 | composite / registered_proposal; authority_effect=none | 1.0 | [docs/governance/audits/requirement-registration/helix-harness-design-composition-coverage-receipt-2026-09-27-r2.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helix-harness-design-composition-coverage-receipt-2026-09-27-r2.json) / 9bec4244981a8852a501d5578becd2d796cd7fd44ef8c1f7717d2922a6e437ec |
| HARNESS-L2-026 | MPR-RC-HARNESS-L2-026-002 | unit / registered_proposal; authority_effect=none | 1.0 | [docs/governance/audits/requirement-registration/helix-harness-design-composition-coverage-receipt-2026-09-27-r2.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helix-harness-design-composition-coverage-receipt-2026-09-27-r2.json) / 9bec4244981a8852a501d5578becd2d796cd7fd44ef8c1f7717d2922a6e437ec |
| HARNESS-L2-027 | MPR-RC-HARNESS-L2-027-003 | unit / registered_proposal; authority_effect=none | 1.0 | [docs/governance/audits/requirement-registration/helix-harness-stage-review-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helix-harness-stage-review-coverage-receipt-2026-09-27.json) / c6c3b2863eaf026ac61c4e272acc197c6021c24e74b4899a23631c74b67b8860 |
| HARNESS-L2-028 | MPR-RC-HARNESS-L2-028-003 | connection / registered_proposal; authority_effect=none | 1.0 | [docs/governance/audits/requirement-registration/helix-harness-stage-review-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helix-harness-stage-review-coverage-receipt-2026-09-27.json) / c6c3b2863eaf026ac61c4e272acc197c6021c24e74b4899a23631c74b67b8860 |
| HARNESS-L2-029 | MPR-RC-HARNESS-L2-029-003 | composite / registered_proposal; authority_effect=none | 1.0 | [docs/governance/audits/requirement-registration/helix-harness-stage-review-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helix-harness-stage-review-coverage-receipt-2026-09-27.json) / c6c3b2863eaf026ac61c4e272acc197c6021c24e74b4899a23631c74b67b8860 |
| HARNESS-L2-030 | MPR-RC-HARNESS-L2-030-002 | unit / registered_proposal; authority_effect=none | 1.0 | [docs/governance/audits/requirement-registration/helix-harness-stage-review-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helix-harness-stage-review-coverage-receipt-2026-09-27.json) / c6c3b2863eaf026ac61c4e272acc197c6021c24e74b4899a23631c74b67b8860 |
| HARNESS-L2-031 | MPR-RC-HARNESS-L2-031-002 | unit / registered_proposal; authority_effect=none | 1.0 | [docs/governance/audits/requirement-registration/helix-harness-stage-review-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helix-harness-stage-review-coverage-receipt-2026-09-27.json) / c6c3b2863eaf026ac61c4e272acc197c6021c24e74b4899a23631c74b67b8860 |
| HARNESS-L2-032 | MPR-RC-HARNESS-L2-032-002 | connection / registered_proposal; authority_effect=none | 1.0 | [docs/governance/audits/requirement-registration/helix-harness-stage-review-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helix-harness-stage-review-coverage-receipt-2026-09-27.json) / c6c3b2863eaf026ac61c4e272acc197c6021c24e74b4899a23631c74b67b8860 |
| HARNESS-L2-033 | MPR-RC-HARNESS-L2-033-002 | composite / registered_proposal; authority_effect=none | 1.0 | [docs/governance/audits/requirement-registration/helix-harness-stage-review-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helix-harness-stage-review-coverage-receipt-2026-09-27.json) / c6c3b2863eaf026ac61c4e272acc197c6021c24e74b4899a23631c74b67b8860 |

## 既決事項と今回の残判断

既決事項は再質問しない。docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:35 は旧HARNESS L1 SHA ece3e...の内容を採用し1.0土台追加を指示した。現行L1 SHAの採択ではない。旧sourceとの保持/変更は対象本文と docs/governance/audits/requirements-stage/helix-harness-internal-audit-2026-09-27.md を参照する。

個別の所属判断が残るのは029/031/032の3件である。[機構内解消記録](helix-harness-internal-resolution-2026-09-27.md)の選択肢をそのまま提示する。現行候補の所属はL2本文の561/575/589/609/629/649/669行、対の受入はL11の445–461行にある。

原文は `docs/helix-harness/sources/capability-reinforcement-po-original-2026-09-27.md:24-30,36-42`（SHA-256 `ab8bb6ae8cd418053d6baaafccaa80ee8ef2e715caab1576e5a00c306e97d1f8`）。第2項が既存物の読取り・保存設計との差分・外部編集保持・限定改修案、第4項がcase/data/double/reproduction/regressionの作成を求める。ConceptのCORE・共通部品の分界と併読する。

| 対象 | 原文・根拠 | 選択肢と推奨 | 影響 |
|---|---|---|---|
| 029 | PO第2項の設計差分・code修正案・data移行案とConceptのCORE横断意味/trace | 推奨CORE：複数成果の意味/影響traceを束ねる責務に一致。代替は共通部品が束ね処理、COREが意味/trace契約を所有。各成果のauthorityはどちらも元サービスに残す。 | 029の主ownerと027/028→029の接続。提供能力や利用先を減らさない。 |
| 031 | PO第4項のlog/input→最小再現→回帰候補、Conceptの共通部品とCORE test機構 | 推奨共通部品：複数入力経路から使う再現処理。代替CORE：横断test処理へ集約。どちらも開発failureと運用incidentを保持し、運用専用への縮小は提示しない。 | 031と032/033のowner境界。oracleの意味と隔離executorは変更しない。 |
| 032 | PO第4項の生成caseをCIで使用、ConceptのCORE test/CIとCONNECT通信 | 推奨CORE：artifact/oracle/revisionとexecutor packetの対応責務。代替共通部品：変換・接続packを部品へ、意味/trace契約をCOREへ。CONNECTへの業務意味移管は両案とも行わない。 | 032と030/031→032→OS-020/利用者CI。実行責務・後続receiptの時系列は保持。 |


027/028/030/033は導出した候補分類として要求一式で確認し、個別の追加質問を設けない。001–009のrouting/source保持を新しい候補の採否に混ぜない。現在の24候補010–033は総合検証の1.0対象集合であり、初期13候補010–022の節に個別version_target印がないことから版未定へ戻さない。HARNESSの7サービスを1.0で扱う既決範囲も維持する。

## 判断前の回答欄（2026-09-28回答済み）

以下は判断前の提示欄を履歴として残す。受領した回答・対象revision・全候補採用・所属確定は冒頭リンクの判断記録を正本とする。

| 判断対象 | 対象revision / ID集合 | 採用・保留・不採用 | PO記録 / 日付 |
|---|---|---|---|
| HARNESS L1 | 上記L1 SHA |  |  |
| HARNESS L2本文の一式 | HARNESS-L2-001..033、version区分は上表 |  |  |
| 登録candidate disposition | HARNESS-L2-010..033の24件。各IDに採用・保留・不採用を付すか、明示集合に対する同一判断を記録 |  |  |
| 所属の残判断 | HARNESS-L2-029/031/032だけ。027/028/030/033は要求一式確認時に確認し個別照会なし |  |  |
| HARNESS L11 | 上記L11 SHA、L2受入対応 |  |  |

- 対象commit/SHA:
- L1判断:
- L2対象集合と判断:
- 029/031/032責務配置: 上表の推奨案 / 指定した代替案 / 保留:
- L11対象revision確認:
- 根拠または変更指示:

## 確認PRの前提と受領後の扱い

機構内の監査・解消16 PR、横断監査 #2195 と解消 #2196、総合検証 #2197 はmerge/read-after済み。[総合検証](integrated-verification-2026-09-27.md)から根拠へ辿れる。本資料は要求本文の固定revisionへの読み口であり、本文やsource atomの被覆を置き換えない。

[PO指示の手順4](../../sources/requirements-stage-po-handoff-original-2026-09-27.md)に従い、POのL1対象revision確定・L2合意（または差戻し）を同じPRの判断記録へ入れるまでDraftを維持し、mergeしない。独立reviewは資料の正確さを照合するもので、PO判断を代行しない。提示したrevisionと集合に対する「一式でよい」という一括回答も、その範囲の判断として記録できる。IDの再列挙は求めない。部分回答・意味変更指示は対象だけを反映し、未判断部分を残す。

旧自律境界（LEGACY-ASSET-6EBDB617A8104A7756D0、`archive/legacy-generation-2026-09-14/root/CLAUDE.md:82-85`、SHA-256 `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`）の、人が企画・要求の意味を持ちAIが要件以下を起草する分担を保持する。旧層番号・旧runtime・旧merge方式は移植しない。現行のL1/L2対象revision判断と、L3要件承認を分ける。

判断前はPO判断未受領だった。受領後は実際の回答・対象revision・候補処置を記録し、本文変更があれば対のL11、register訂正revision、receipt、研究pinとbindingを追随させてexact HEADを再reviewする。候補の処置から旧sourceのretireや未完atomの被覆完了、L3承認、実装・release許可を生成しない。
