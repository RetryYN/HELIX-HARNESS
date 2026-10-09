# FT-GOV-TDDORDER-001

作業種別: 要求・受入の曖昧さ照合

作業内容: Conceptとエージェント原則に対する要求確認で残った、HARNESS-L2-003・015のTDD順序の曖昧さを照合する。原則3の「実装前にtest／oracleへ表す」と要求の「設計の契約→実装→Red→Green」、015の「凍結済みの設計と対の検証」を合わせて読み、test／oracleの定義・凍結、初期実装、意図した欠陥を検出するRed、Greenの最小実装の関係を確認する。既存の対の検証の凍結・traceとL11でtest／oracleの後付けを拒否できるかを確認し、必要ならL2／L11の表現・負例を揃える修正案を作る。

確認事項: 現時点でTDD原則違反とは確定していない。9/26 PO提示原文にも実装→Redの順序があるため、AIの転記ミスと決めつけない。曖昧さが解けず要求意味の判断が必要なら、対象revisionと選択肢を明示して既存authority手続へ戻す。要求採否、意味変更、版変更、L3再開・実装許可をこの作業指示から生成しない。

終了条件: 実装前のtest／oracle定義とRed／Greenの関係が根拠付きで説明でき、後付け検証の扱いを対L11の条件へ辿れる。変更不要なら根拠を記録し、修正が必要なら対象L2／L11・意味差分・必要な判断を記録する。Issueのcloseを要求承認や受入成立にしない。

照合する正本（固定main `5f8d7f1251f15fe4a91314e26c20bf9b4856a9d5`）:

- [エージェント原則3](https://github.com/RetryYN/HELIX-HARNESS/blob/5f8d7f1251f15fe4a91314e26c20bf9b4856a9d5/docs/concept/helix-principles.md#L45)。
- [HARNESS-L2-003](https://github.com/RetryYN/HELIX-HARNESS/blob/5f8d7f1251f15fe4a91314e26c20bf9b4856a9d5/docs/helix-harness/L2-requirements/product-requirements.md#L111)、[HARNESS-L2-015](https://github.com/RetryYN/HELIX-HARNESS/blob/5f8d7f1251f15fe4a91314e26c20bf9b4856a9d5/docs/helix-harness/L2-requirements/product-requirements.md#L389)と[対L11](https://github.com/RetryYN/HELIX-HARNESS/blob/5f8d7f1251f15fe4a91314e26c20bf9b4856a9d5/docs/helix-harness/L11-acceptance/product-acceptance.md#L210)。
- [9/26 PO提示原文](https://github.com/RetryYN/HELIX-HARNESS/blob/5f8d7f1251f15fe4a91314e26c20bf9b4856a9d5/docs/helix-harness/sources/v-model-forward-reverse-po-original-2026-09-26.md#L165)。

旧source: [ddd-tdd-rules.md:23–24](https://github.com/RetryYN/HELIX-HARNESS/blob/5f8d7f1251f15fe4a91314e26c20bf9b4856a9d5/archive/legacy-generation-2026-09-14/root/docs/governance/ddd-tdd-rules.md#L23)。Redはtestを書いた時刻ではなく意図した欠陥を検出する証拠、Greenは最小実装という意味を保持して照合する。旧runtime・test・CIは実行しない。旧規律を新しいgateへ写さない。

発行根拠: 2026-10-10のユーザー指示「イシューにしてくれ」。直前の確認結果に対するIssue化の指示であり、曖昧な要求意味の確定指示ではない。
