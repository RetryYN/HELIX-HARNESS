# 要求整理のPO判断案

対象base: `5f8d7f1251f15fe4a91314e26c20bf9b4856a9d5`。候補本文: [差分JSON](requirements-resolution-packet.json)、SHA-256 `e7faed90737bb32f2af42e7c8c6cf4449c2377435350b000ee2e8e8a175f2753`。

Issue #2825・#2826・#2832の要求意味・版の整理案であり、要求の採択や意味変更をこのpacketから生成しない。JSONには対象path、変更前後の全文字列、適用箇所数、元file SHAを固定した。canonical L2/L11本文はまだ変更していない。

| 判断単位 | 提案 | 保持する点 |
|---|---|---|
| JSONAUTH（#2825） | OS053と対L11の正本をJSONへ訂正。生成Markdown/HTMLだけの編集ではcanonical更新にしない負例を加える | owner分離、原子的確定、部分current拒否、CAS、再送、rollback、receipt |
| TDDORDER（#2832） | test/oracleの実装前定義・凍結と、Redの欠陥検出、Greenの最小実装を明示し、後付け検証を拒否する | 015の凍結済み設計と対の検証の入力、Provisional、局所Refactorの意味保持、CIと受入の区別 |
| VERSIONJOIN（#2826） | HARNESS052とOS102を1.0に指定し、OS053とHARNESS059の同版接続を成立対象へ揃える | 9/29・9/30の既採択意味、各owner、11 field、同revision/digest、不確実状態の保留。その他25件の版未指定は保持 |

根拠: [エージェント原則3](../../concept/helix-principles.md)、[JSON正本のPO判断](../decisions/brain-helix-core-po-intent-2026-09-25.md)、[9/26 Vの谷の判断](../decisions/harness-v-valley-process-po-decisions-2026-09-26.md)、[9/29の11候補判断](../decisions/po-decision-2026-09-29-11candidates.md)、[9/30のセット採択](../decisions/po-decision-2026-09-30-live26.md)、[10/10の版判断](../decisions/discipline-requirements-into-1.0-po-decision-2026-10-10.md)。10/10はJSON矛盾を別の意味修正へ残し、052・102は版指定対象外としたため、今回の対象revisionに必要な判断を分ける。

旧sourceとの対応: JSONの構造的意味／生成view／説明Markdownの分離、実装前の契約・Redの欠陥検出／Green最小実装、versioned contract+digestの引継ぎを保持する。旧Markdown正本の運転表現をJSON正本へ訂正し、曖昧なTDD表現を実装前oracleと両立する表現へ改め、版未指定の接続相手2件に1.0印を付ける。旧runtime/test/CIを起動せず、固定sourceと採択範囲は保持する。

L3再開・実装・CI・配布・release・旧要求retireは対象外。採用した判断単位は別PRでL2/L11へ反映し、対象revisionの判断、管理層仮登録、無損失照合、独立reviewを結ぶ。
