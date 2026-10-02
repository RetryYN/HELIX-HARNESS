# HIL-NFR-07 原文条件の現行対応確認

## 対象と結果

比較先はmain `4d1c8db1a670224e83e8bc20834a717cf4289de2`。この記録は、旧HIL-NFR-07の原文条件が現行のどこへ移されたかを、固定した旧source・現行L2/L11・PO判断・仮登録と照合したもの。原source、以前の監査、採択済み本文は変更していない。

旧sourceは`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、旧L1 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:187`とRequirement IR `requirements.json#/HIL-NFR-07/statement`。原文は、追加機能数だけに依存せず複雑さ・公開面・運用負債を測定し、authoritative oracleへの寄与とminimum-necessary proofがない拡張を拒否する。IR statement digestは`e3df2d68697433af977cfca1e4f63d83f2f9f9b7fa305e66734cd046fbad2058`、IR object digestは別値`4b11c5f8c85597e51373236dc05ec9063d60b768d85bdeef0253f092b7995dc9`である。

原文三条件の現在の行き先は、2026-09-29のPO決定で固定revisionが採択された`HARNESS-L2-035`とpaired L11追補である。L2 `product-requirements.md:935–939`、L11 `product-acceptance.md:678–684`が、測定項目と前後比較、oracle寄与・代替・最小必要性、欠測・旧revision・相殺・根拠のない閾値の拒否をそれぞれ明記する。実値や共通thresholdが未指定という事実を、固定数値要求の欠落とは扱わない。旧原文にその値はない。追加候補やMPR rowは不要で、新規予約もしない。

## 条件ごとの対応

| 旧原文条件 | 現行本文・oracleの行き先 | 判定 |
|---|---|---|
| 機能追加数だけでscopeの最小性を判断しない | L2-035追補935行がAPI/CLI/schema/設定/依存/運用義務を挙げ、L11-035追補683行が追加機能数だけで必要性を主張する反例を拒否する。 | 保持。機能数を唯一の指標としない。 |
| complexity、public surface、運用負債を測る | L2-035追補935行が各観点の変更前後の対象・方法・条件・結果を識別し、測定予算が不明ならunknownとする。採択L11追補682行の正常条件は三観点すべてを同じscope/revisionで照合する。683行は複雑さまたは運用負債の欠測・旧revision流用・相殺を個別反例にする。公開面の測定欠測だけを単独で示す反例はないが、三観点すべてを満たす正常条件から欠測時に受入条件を満たさないことは導ける。 | 採択要求として保持。数値式、単位、共通閾値は旧原文にないため新設していない。 |
| authoritative oracleへの寄与とminimum-necessary proofのない拡張を拒否する | 元L2-035 722–726行は上流根拠、受入寄与、必要性、代替、予算とauthorityを求め、循環・存在しないroot・対象revision違い・不明sourceを不足へ戻す。追補937行はscope必要性の主張に三観点の測定とoracle寄与・代替・minimum-necessary proofを併記し、欠測ならscope判定を未完とする。元L11-035 489行と追補682–684行は受入寄与なし、最小性proofなし、欠測、stale値の個別反例を不成立/unknownへ返す。 | 2026-09-29に固定revisionが採択され、この拒否条件を要求として保持。実行・受入完了までは主張しない。 |

## 旧補助sourceと現行責務

旧`HR-FR-HIL-05`はHIL-NFR-07を対象要件に列挙し、authority root・最小性・approval・evidenceによるIssue Gateを述べる。`HAC-HIL-05a`はreceiptとacyclic authorityの正常境界、`05b`はAI終端/cycle/欠落の拒否、`05c`はhigh-impact actionのsnapshot-bound approval境界を示す。`HAT-HIL-05`はScope/Closure scenarioと不要拡張・欠落receiptの負境界を持つが、`designed_not_implemented`である。これらの要約はNFR07の三測定観点の完全oracleとはみなさず、現行035追補の補助contextとした。

旧L5 `issue-scope-authority-gates.md:78,137–147`はScopeMinimalityEvaluatorにoracle寄与、minimum necessary、代替、budgetとcomplexity/public surface/運用負債を配置し、diffをfile数以外のchange atomへ正規化する。旧L6 `issue-scope-authority-gates.md:92–95`はoracle寄与、必要性、budget集計を分けて記述する。これは旧設計の意味contextであり、旧runtime/API/数値budgetを現行へ移す根拠にはしない。

HARNESS-L2-034は選ばれた要求の計測契約を扱い、採択済み035追補は必要に応じてその対象・版・適用条件へ結ぶ。HARNESS-L2-002/003のDesign Refactor差分のBackflowは適用scope内の既存routeであり、NFR07の三観点を直接置き換えない。HELIX-OS L2/L11は記録・ticket/authority境界を持つが、NFR07の複雑さ・公開面・運用負債測定と最小必要性判定の意味ownerへ変更しない。OS-L2-035は別identityである。

## 採否と過去監査の訂正

2026-09-28のHARNESS PO決定は010〜033を採択し、035については未判断だった。その後の2026-09-29決定`HDEC-REQUIREMENTS-57-2026-09-29`は、`MPR-RC-HARNESS-L2-035-002`のL2 digest `4e37d81e…`、L11基本節digest `65328061…`、追加受入節digest `5cd7416b…`を対象として、HARNESS-L2-035を明示採択した。決定記録の対象revisionは現在の各節digestと一致する。管理登録が`registered_proposal`／`authority_effect:none`のままでも、採否はこのexact decisionから読む。2026-09-30 live26決定は別の26候補を対象にし、HARNESS-035を再処置していない。同じ57件決定は別identityのHELIXOS-L2-035も採択しているが、これはHELIX-OSの別要求であり、本監査のHARNESS-L2-035とは混同しない。採択は実行、受入完了、formal successor割当てを意味しない。

`legacy-ir-quality-source-recheck-2026-09-28.md:69`の「NFR demands numerical ... metric」および`legacy-ir108-disposition-summary-2026-09-28.md:46`の「定量複雑度指標」という記述は、原文の「測る」から数値metric要求を推定している。本再確認ではその推定を採らない。原文は観測対象の測定を求めるが、計算式、数値閾値、特定probeを指定していない。前記歴史監査はsnapshotのまま残し、この新しい記録を訂正後のsource-current対応証拠とする。

旧HAT/runtime、CI、CLIは実行していない。現行L11は採択済み要求の受入条件だが未実行であり、本記録は実装、受入完了、formal successor、要求stage closureを主張しない。旧Issue #290等のIR `pending_resolution`文字列は歴史metadataであり、候補レビュー開始条件として再解釈しない。

## 採否・受入oracleの読み方

2026-09-29決定の対象revisionはHARNESS-L2-035のL2 semantic digestとpaired L11基本節、さらに追補受入節を個別にpinし、現在のsection digestと一致する。registerの`registered_proposal`は採否表示ではなく、決定記録の採択を覆さない。追補本文に「未採択候補」とあるのは起草時の本文metadataであり、後日のPO決定が採択した対象revisionを変更しない。

L11追補678–684行は正常fixtureで複雑さ・公開面・運用負債の三測定をすべて要求するため、公開面だけ欠測する入力も正常条件を満たさない。一方、否定fixtureで公開面測定の欠測のみを独立表示してはいない。ここでは例示粒度の差として記録し、採択済みL2の三観点義務から受入失敗を導けるため別候補や意味変更は起こさない。

## Revision pins

- 比較base: `4d1c8db1a670224e83e8bc20834a717cf4289de2`。
- 旧L1 source full SHA-256: `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`。L187のLF除外SHA-256: `0bf32cc3753f24c90def870e54353e6b7a968d01bf0117d5983d6eb648c24b24`。
- 現行L2/L11全file SHA-256、035節と追補各digest、2026-09-29採択decision SHA-256、source ledger/receipt SHA-256は対応JSONで固定する。
