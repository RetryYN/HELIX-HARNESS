# LABO first-pass・repair-round・Attempt count 計測条件の局所監査

status: bounded_audit_evidence
authority_effect: none
snapshot_commit: `859bebd2ef1ee7079800793a7f0d9c1b88c123d5`
scope: `LEGACY-CAND-LINE-001656` の3文にある12種類の列挙telemetryと2つの横断条件、計14条件atom

## 目的と境界

本記録は、LABO計測条件を first-eligible boundary、同一Attempt内 repair-round visibility、総Attempt count、他の補助telemetry、および既存12指標との定義境界まで一機能単位として照合する。#2271と#2273により選択された3 subatomの局所crosswalkに加え、未選択の条件を明示する。各候補の採否、意味変更・retire、実験・資格試験・実装・受入実行は決定しない。

旧source行の3文について列挙された条件を分母へ入れる。ただし「など」は具体的な追加指標を識別しない開放列挙であり、新しい指標数へ換算せず未確定tailとして残す。隣接行、旧candidate全文の閉鎖は主張しない。未採択候補と未選択条件は `MPR-SH-CANDIDATE-003` に保全されたままである。

## 旧sourceと固定bytes

- 資産：`LEGACY-ASSET-3A15E5645D2D2A59DFF5`
- source：`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:399`
- file SHA-256：`f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`
- source line identity：`LEGACY-CAND-LINE-001656`。line SHA-256：`58be97d309362b845682602ae352b1954ed433fbc4b6552791f89be07d70db4f`
- source authority：`historical_candidate`。現行への候補状態は `registered_proposal` / `authority_effect: none`。

第1文は12種類の列挙telemetry、第2文は既存12指標のsilent rename禁止、第3文はfirst-passの初回境界とAttempt/repair回数の併記を述べる。第3文のfirst-eligible、repair rounds、Attempt countは第1文と重複する意味条件として一度だけ数え、併記義務だけを別atomにする。既存source-lines receiptは第3文から選んだ3 subatomだけを扱う。

## 条件単位の実効crosswalk

詳細な14行の機械可読crosswalkは[LABO計測の実効crosswalk](labo-firstpass-attempt-repair-effective-crosswalk-2026-09-28.jsonl)。各receiptの境界とdigestを独立に参照し、既存receiptは変更していない。第1文にある12種類はfirst-pass、Attempt、repair、queue/active/review/Humanの4時間、escaped defects、rollback/Recovery、coverage、observer overhead、evidence freshnessである。

| 選択subatom | 現行対応 | 条件の処置 | authority / 未処分 |
|---|---|---|---|
| S3A first-eligible boundary | HELIXLABO-L2/L11-067 | 新候補として対応。最初のeligible candidateとそのoracle結果を、task Attemptの初回結果と分けて観測する | 067採否と定義整合判断が未決 |
| S3B repair-round visibility | HELIXLABO-L2/L11-067 | 新候補として対応。同一Attempt内の修復roundを順序付きeventで観測し、Attempt countへ合算しない | 067採否が未決 |
| S3C total Attempt count | HELIXLABO-L2/L11-068 | 新候補として対応。scope内のdistinct OS Attempt identityを数え、記録完全性を証明できなければunknown | 068採否が未決 |

| 追加条件atom | 現行との照合 | 分類と不足 |
|---|---|---|
| queue待ち時間 | 採択済み059 `labo-requirements.md:424` は完了wall-clockと待ち時間規則を保持 | queue時間を独立に出す契約は未確認。新候補要 |
| active時間 | 同059のwall-clock条件 | active時間の独立出力は未確認。新候補要 |
| review待ち時間 | 同059 `:423-424` はreview費用と待ち時間規則を保持 | review待ち時間の独立出力は未確認。新候補要 |
| Human待ち時間 | 同059 `:424` は人介入量と待ち時間規則を保持 | Human待ち時間の独立出力は未確認。新候補要 |
| escaped defects | 採択済み006 `:34` は品質・見逃し評価を扱う | escaped defectの独立telemetry定義・出力は未確認。新候補要 |
| rollback/Recovery | 採択済み059 `:423` はrollback/recovery費用を総費用へ算入 | 発生・結果の独立telemetryは未確認。新候補要 |
| coverage | 旧9.1 `execution-ticket-requirements.md:382-395` には既存12指標の個別coverageがある | 9.2の単語だけでは分母・対象・oracleが不明。既存Design Trace Completeness等と同一視せず意味未確定 |
| observer overhead | 採択済み059 `:423` の総費用と関係する | 観測自体の追加負荷を分離したtelemetryは未確認。新候補要 |
| evidence freshness | 採択済み001 `:73` はsource identity/revision/provenanceを保持 | 鮮度の計測値・適用時刻・閾値のtelemetryは未確認。新候補要 |
| 既存12指標のsilent rename禁止 | 採択済み059 `:424` は異なる測定定義/receiptの黙示比較を禁止 | 旧9.1の12指標と追加telemetryのidentity/version対応は未確定。既存指標の意味変更を推定しない |
| 初回eligible結果とAttempt/repair回数の併記 | 067/068は別々に候補化され、065はtask Attempt粒度 | 同一scorecard・提示単位での併記は保証されない。新候補要 |

採択済み059・006・001は上表の一部の比較・観測基盤を保持するが、各旧atomが求める個別telemetryの出力保証と同値ではない。既存12指標の各定義は旧9.1に列挙されるため、9.2の`coverage`や`first-pass`を旧指標へ黙って置換しない。「など」は列挙外の具体指標を特定できないため、分母14とは別に未確定tailとしてsource holdingへ残す。

採択済みHELIXLABO-L2/L11-059は品質gate、同条件比較、費用・時間・人介入およびretry/rework等を含む比較の**基準**として再利用できる。ただし059は比較の原則を満たすのであって、S3A/S3B/S3Cの個別測定条件を既に満たした、または3 subatomを移管済みという意味ではない。059が保持する待ち・rollback費用等も、旧9.2の個別telemetry出力と同値とは数えない。

未採択HELIXLABO-L2/L11-065の `first_pass` は初回Attemptの受入oracle結果、`retry_count` はその後の再試行数である。これらはtask Attempt粒度の指標であり、S3Aのcandidate粒度、S3BのAttempt内round、S3Cのdistinct Attempt identity countを代替しない。067は065の採択に依存せず、068も065/067から換算しない。

旧sourceは計測条件の候補記述であり、廃止対象となる特定の旧runtime/schema/methodを指定していない。この選択3 subatomについてPO retirement対象として特定できた旧方式は0件。根拠なしに旧方式の廃止を提案せず、より広い旧方式・consumerのretire判断も本監査範囲外とする。

## PO選択肢と未決判断

HELIXLABO-L2/L11-067の採否選択肢A/B/Cと、first-pass定義整合のD1/D2/D3は別軸であり、いずれも未選択である。

| 軸 | 選択肢 | 現在の状態 |
|---|---|---|
| 067採否 | A：067 exact L2/L11 revisionを採択。B：候補とsource holdingを保留。C：対象subatom/revision・理由・consumer影響を特定して意味変更またはretire | 未選択。推奨Aは判断ではない |
| 定義整合 | D1：065の初回Attempt `first_pass` と067の旧source準拠 `first_eligible_candidate_result` を別指標として並立。D2：065を旧first-eligible定義へ寄せる別revisionを起草しPO判断。D3：旧first-eligible定義を対象revision・理由・影響付きでretire | 未選択。推奨D1は判断ではない |

**AとD3は同時選択できない。** Aは旧first-eligible定義を保持する067 exact revisionの採択であり、D3は同じ定義のretireだからである。A採択後にretireを選ぶ場合は067の別revision、または別のretire decisionが必要になる。D1は候補採否を決めず、source meaningや候補本文も変更しない。

068には別途、候補自身のA/B/C採否選択肢がある。この記録はその選択も行わない。067/068候補の存在、merge、registerはPO採択や実行許可を生成しない。

## 分母付き件数と残差

| 集計母集団 | 分母 | 採択済みだけで個別条件まで充足 | 既存候補へ局所対応 | 新候補要 | 意味未確定 |
|---|---:|---:|---:|---:|---:|
| 旧行399の列挙12種類＋横断2条件 | 14 | 0 | 3（067へ2、068へ1） | 9 | 2 |

新候補要9件は4種の待ち時間、escaped defects、rollback/Recovery、observer overhead、evidence freshness、同一提示単位への併記である。意味未確定2件は`coverage`の対象/分母/検証oracleと、既存12指標と追加telemetryのidentity/version対応である。ここを確定するには旧9.1の各定義・consumerと現行指標を対に照合し、必要な追加出力と意味変更を分ける。現在は新候補identityを採番せず、source holdingで保全する。

#2271 receiptの067入力は2 atom・`no_loss`・unaccounted 0、#2273 receiptの068入力は1 atom・`no_loss`・unaccounted 0である。この局所3件以外の11件は当該receiptの対象外である。候補入力の局所処置が揃ったことは、候補採択・意味後継・受入実行の完了ではない。

旧行の明示条件14件は分類したが、「など」の列挙外tail、隣接行と旧candidate全体は分母に含めていない。旧source line全体または旧candidate全体の意味closureを「0件残」とはしない。

## 固定した根拠と検証対象

- 067 source-lines：[`labo-firstpass-attempt-repair-source-lines-2026-09-28.jsonl`](../requirement-registration/labo-firstpass-attempt-repair-source-lines-2026-09-28.jsonl)
- 067 coverage receipt：[`labo-firstpass-attempt-repair-coverage-receipt-2026-09-28.json`](../requirement-registration/labo-firstpass-attempt-repair-coverage-receipt-2026-09-28.json)
- 068 source-lines：[`labo-attempt-count-source-lines-2026-09-28.jsonl`](../requirement-registration/labo-attempt-count-source-lines-2026-09-28.jsonl)
- 068 coverage receipt：[`labo-attempt-count-coverage-receipt-2026-09-28.json`](../requirement-registration/labo-attempt-count-coverage-receipt-2026-09-28.json)
- PO packet：[`post-confirmation-25-po-decision-packet-2026-09-28.json`](post-confirmation-25-po-decision-packet-2026-09-28.json)。067項目のA/B/CとD1/D2/D3を照合した。
- 現行候補と採択境界：[HELIX-LABO PO判断記録](../../decisions/helix-labo-requirements-po-decision-2026-09-28.md)、[LABO L2](../../../helix-labo/L2-requirements/labo-requirements.md)、[LABO L11](../../../helix-labo/L11-acceptance/labo-acceptance.md)。059の採択済み本文と065/067/068の候補本文を区別した。

静的read-afterでは、旧source file/line digest、明示14条件の原文span、067の候補・L11・2 atom digest、068の候補・L11・1 atom digest、各source receiptの対応を照合する。archive内runtime、CLI、hook、test、CIは実行しない。
