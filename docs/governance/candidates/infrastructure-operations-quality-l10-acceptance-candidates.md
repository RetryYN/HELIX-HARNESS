# インフラ・運用品質 L10受入候補

状態: candidate / unapproved。source: #1728。

| ID | 反例・受入候補 |
|---|---|
| NIO-L10-01 | 根拠のないSLO数値・閾値・保持期間を生成した場合はRED。unknownを明示すれば通過候補。 |
| NIO-L10-02 | collector停止、欠測、stale evidenceをhealthyへ写像した場合はRED。typed degraded/unknown/failureへ分離する。 |
| NIO-L10-03 | synthetic/canary成功だけでproduction運用成立を主張した場合はRED。環境identity別の証拠を要求する。 |
| NIO-L10-04 | backup名・snapshot存在だけでrestore成功を主張した場合はRED。隔離restoreとintegrity検証を要求する。 |
| NIO-L10-05 | rollback成功だけで恒久修復・再発防止完了を主張した場合はRED。原因・修復・再検証を別状態にする。 |
| NIO-L10-06 | secret/PIIをlog、example、evidenceへ平文出力した場合はRED。redactionとnegative scanを要求する。 |
| NIO-L10-07 | 未承認scopeへ自動修復、公開、課金、production writeを広げた場合はRED。runtime admissionで拒否する。 |
| NIO-L10-08 | requirement→design→implementation→verification→operation→re-entryの必須edgeが欠ける場合はRED。 |
| NIO-L10-09 | closed Issueや文書存在だけで統合能力をcompleteへ昇格した場合はRED。実consumer evidenceを要求する。 |

これらは候補oracleであり、canonical promotion時に対象requirement revision、test path、実行環境、証拠schemaへ束縛する。
