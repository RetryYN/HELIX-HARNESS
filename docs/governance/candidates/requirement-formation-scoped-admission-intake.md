# 要求形成・影響限定Admission：取込台帳

- 状態：要求候補受付。#1556 / PLAN-L3-90。新policy未承認・runtime未実装。
- 照合基準main：56225a2ceff228813e8c9b4184d3eb6104584fdb。
- 原稿の監査結果は提案者の報告。#1169の一律human条件と#217の六outcomeはGitHub本文で確認。
- source保存欄はhistorical input-only。候補正本はrequests/requirements/acceptance/recognitionの4文書。
- 原稿の「判断」は意味選択・技術評価・承認・実行認可へ分離。既存machine field名は変えない。
- RF/RC/GHを別責務とし、新しい並列制御系や承認engineを追加しない。

## 全項目移管表

| 原稿1 | 原稿2 | 統合先 |
|---|---|---|
| 目的・§1 | 目的・§1/2 | RFA-BR-01..03、requests |
| A-1 | RF-01 | RFA-RF-01 |
| A-2 | RF-02 | RFA-RF-02 |
| A-3/A-4 | RF-03 | RFA-RF-03、RFA-AC-03/04 |
| A-5 | RF-04 | RFA-RF-04、RFA-AC-05/06 |
| B-1/B-2 | RC-01/02 | RFA-RC-01/02 |
| B-3/B-4 | RC-03 | RFA-RC-03、RFA-AC-08/09 |
| B-5 | RC-04 | RFA-RC-04、RFA-AC-10/11 |
| B-6 | RC-05 | RFA-RC-05、RFA-AC-12..14 |
| C-1 | GH-01 | RFA-GH-01 |
| C-2/C-4 | GH-02 | RFA-GH-02 |
| C-3 | GH-03 | RFA-GH-03 |
| §6 owner表 | §1 owner表 | requirements導入節、#1556 |
| §7受入1..6 | §6受入1..7 | RFA-AC-01..18、RFA-OP-01..03 |
| 導入順・評価・非対象 | 導入順・評価・非対象 | requests、requirements導入、recognition |
| S1..S13参照 | 確認元 | 下記原文保全。現在状態は参照時再検査する |

## 収束と後続義務

このsliceは候補分解・全項目trace・原文Git保全・独立レビュー・CI・main read-afterまで。
承認を原稿追加依頼から発明しない。canonical改版→#397 IR→RF/RC/GH個別runtime→E2E/L12は未完了義務。
#282/185/186/396の既存完了は撤回せず後続差分にする。
元2ファイルは保全と比較検証後に削除する。候補保存を実働完成としない。

## 原文保全（歴史的入力・非authority）

### 取込検証（2026-09-05、作成側）

- 原稿2件の全文が以下の保全欄と一致することをNode assertで確認した。
- 要件ID12件の一意性、全IDが受入へ参照されること、AC18行を検査して成功。
- PLAN lint（番号重複・typed entry routing・V-pairを含む）成功。既存advisoryは増加なし。
- 正規の `helix db rebuild` 成功、outstandingは新draft 1件を追加した71件。
- 独立review・CI・main統合は未実施。これらをローカル取込検証で代替しない。

### 入力1: HELIX_REQUIREMENT_FORMATION_AND_SCOPED_ADMISSION_v0.1.md

````markdown
# HELIX 新要求・既存課題接続案 v0.1

主題：根拠付き要求形成と、変更差分別の判断委任・再確定

- 状態：要求提案。新しい承認ポリシーの発効・実装許可ではない。
- 照合基準：2026-09-05、HELIX-HARNESS main `56225a2ceff228813e8c9b4184d3eb6104584fdb`。Issueは確認時点の公開記録。
- 対象：HELIX本体の要求形成、Authoring Admission、Requirement Re-entry、IR、GitHub実行境界。
- 非対象：HELIXWeb、利用者データ集約基盤、新しい独立Research／Approval Engine、別DB・scheduler・routeの増設、全体plannerの保留解除、外部公開・課金・破壊操作の包括許可。
- この文書のためにGitHubのIssue・PR・コード・設定は変更していない。停止経路の実行再現やテスト実行は未実施。

## 1. 目的と観測された課題

利用者から、WP-THEMEでは外部の豊富な事例が設計へ十分取り込まれず、WP-HARNESSでは目的と異なる方向へ作業が進み、監視負担が高いとの報告がある。また、新要求ごとの要件再承認は、技術的な判断まで人間へ戻すため確認価値が低下している。これらは利用者報告であり、個々の実行原因が確定した扱いにはしない。

要求を決める材料は厚くし、人間に返す判断は意味・価値・許可境界へ絞る。調査不足の自動化と、技術的な版確定のたびに人間を呼ぶ運用を、同時に是正する。

## 2. 既存規定との接点

正本 `requirements-ir/system_contracts.json` の `HR-FR-HIL-19` は、意味差分・authority・pair・impactを検査した自動Admissionを規定し、過剰確認もfailureに含む。#192／#217も可逆policy内変更を人間待ちにしない方針を持つ。[S1][S2]

一方、#1169は `human_decision_required` と `refreeze_required` を別fieldで持ち、状態遷移では人間判断をauthority境界に限定するが、受入ではRequirement変更時のhuman decisionとL3再freezeを省略不可としている。通常AuthoringとRequirement変更が重なる場合の優先・適用境界を明文化する必要がある。これをそのままruntime不具合の証明とは扱わない。[S3]

#282／#185／#186／#396はclosed済みの先行責務である。今回の意味拡張で過去の完了を撤回せず、実装・契約を再利用するversion-up後続へ分離する。[S4][S5][S6][S7]

## 3. 新要求A：根拠付き要求形成

企画 → 前提整理リサーチ → 要求候補化 →〔要求探索リサーチ／必要なPoC・画面・動画プロト〕の並行反復 → 比較・選択・検証 → L3/L10差分 → 適切な判断主体による採否 → 正本化・IR admission、とする。順番を一方向に固定せず、新発見は候補と前提へ戻す。

A-1. 企画の目的・期待結果・非対象・制約・人間の好みと、AIの解釈を分離する。既存資産、確認済み事実、仮説、未知、古い情報、矛盾から、今回の判断に必要な調査義務を導出する。既存research skill、interview／unresolved、Requirement Translatorを再利用する。[S4][S5][S8]

A-2. 前提整理は「何を判断する仕事か」、探索調査は「どんな実現方法・要求候補があり得るか」を扱う。公式仕様、実コード、実物の操作・表示、既存事例を論点に応じて取得し、出典・版・取得時刻・適用条件・限界を束縛する。検索結果の件数、URLの存在、AIの自己評価だけで充足としない。

A-3. 調査結果は候補ごとの採用／適応／保留／棄却理由、元の目的への寄与、比較対象、検証方法へ接続する。表面的な要約で終了せず、WPテーマなら「どの部品の何を参考にし、現行との差を何で確かめるか」まで示す。外部事例の存在は利用者の採用意思や効果の証明ではない。

A-4. #1292の同一hypothesis revisionに調査、PoC、プロト、反応を接続する。実現可能性、見た目・言葉の好み、用途適合を分ける。静止画で動きを検証済みにしない。原発言・要約・AI解釈を分離し、反応から要求確定を捏造しない。[S9]

A-5. 調査・試作は事前に許可された対象・権限・時間・資源予算で進める。重要な未知だけを該当判断のblockerにし、関連しない仕事は止めない。既存証拠を適用条件・鮮度の範囲で再利用する。予算切れは証拠不足として残し、「不存在」「解決不能」「調査完了」へ変換しない。

## 4. 新要求B：判断委任と影響限定の再確定

B-1. 次の三つを別判断にする。

- 人間の意味・価値の採否：何を欲しいとするか、何を許容するか。
- 技術的な正本化：revision、意味差分、trace、L3/L10、必要な検証とIRの確定。
- 実行の許可：どの対象へ、誰が、どの権限・予算で作用できるか。

人間の再承認を省けることは、技術検証・版管理・実行許可を省けることではない。

B-2. 人間があらかじめ委任する目的、許可する技術判断、保護する意味・不変条件、品質・資源上限、適用scope、期限／撤回条件を既存policyへ束縛する。policy内の技術的派生要求・整合修復は、新しいL3差分を含んでも、根拠・独立検証・影響評価を満たせば自動Admission可能とする。可逆であるだけでは十分条件としない。

B-3. 未委任の趣向・ビジュアル・動画演出・言葉・体験、目的・業務上の価値・非対象・許容損失の変更は、関係する候補と差分だけを人間へ返す。視覚領域でも承認済み規則内の機械的修復は再承認不要にできる。非視覚でも予算超過、秘密情報の外部送信、公開、不可逆操作など既存許可境界の越境は人間判断を残す。

B-4. #217の既存outcomeを再利用する。推定モデルやキーワードだけで無承認採用へ振り分けず、根拠不足は追加調査／repair、権限不足は人間判断、明示的違反はrejectへ分ける。提案者が自分の委任範囲を拡大することや、検証条件を弱めて通過することを禁止する。[S2]

B-5. 承認は文書全体や移動するmain HEADではなく、対象意味差分・制約・scopeへ束縛する。同一の明示指示ですでに決まった意味を再度尋ねず、未決の派生選択だけを提示する。機械決定はpolicyに基づくdecisionとして記録し、PO発言・人間承認を偽装しない。旧承認digestを意味変更後へ無条件流用しない。

B-6. #1169の再compile・再freeze・人間判断を独立判定する。影響closureに含まれる要求／設計／検証／Assignmentだけをstaleにし、無関係な仕事を停止しない。共有不変条件の影響範囲が不明なら、勝手に局所扱いせず調査・隔離する。意味不変の表記・projection更新で要求revisionを不要に増やさない。変更されたコードのCI・独立reviewは対象HEADで取り直す。[S3][S10]

## 5. GitHub・実行境界の接続

C-1. Issueのroot／capability／task／findingと、候補の成熟度・判断authority・実行profileを別軸にする。既存strict schemaへ未定義fieldを直足しせず、改版した正規契約からGitHubへ投影する。Issue作成・文書merge・CI greenだけで候補を実装許可へ昇格しない。[S10][S11]

C-2. dispatch入口、変更実行入口、PR admissionが同じsource revision、調査義務の判定、採否decision、許可profile、影響scopeを照合する。READY leafに加えて、当該仕事の目的と許可が成立していることを確認する。PRのpath規律だけで意味逸脱を合格させない。

C-3. 要件未確定でも、明示的に許可された調査・PoC・プロト仕事は発行できる。通常実装とは権限を分離し、候補文書の保存は候補の採用ではない。Ticket未移行scopeは現行Issue／PLAN＋Assignmentの正規経路を使い、Ticket全体の完成を新しい停止条件にしない。

C-4. 人間待ちは対象変更だけに付け、判断理由・選択肢・推奨・影響・残る未知を短いpacketで提示する。GitHub側のrequired checks／独立reviewは維持し、人間再承認削減をbranch保護の解除で実現しない。[S10][S12]

## 6. 既存ownerへの接続と原子的な実装単位

| 実装単位 | 接続先 | 増やす責務／変更点 |
|---|---|---|
| RF：前提・要求形成 | #282／#185／#186のversion-up後続、既存research skill | 調査義務、根拠→候補→採否→検証のtrace。別要求エンジンを作らない |
| PT：実物による確認 | #1292 | 調査との同版合流、人間の反応、要求検証への還流 |
| DA：判断委任 | #192／#217 | 委任policyと保護する意味、再承認要否、過剰escalation防止 |
| RI：差分再確定 | #1169、#218、#396の後続、#397 | human／recompile／refreeze分離、局所stale、atomic IR admission |
| GH：意味付き実行許可 | #592系GitHub規律、既存dispatch／work-guard／PR admission | Issue階層と別軸で、許可された仕事だけを実行・mergeする |

上表は提案する責務配分であり、新Issueの採番・起票・既存Issueの変更は未実施。#397は採用された意味のIR収載ownerであり、新要求の意味決定ownerにはしない。新しい意味は要求・L3/L10・policyへ先に反映し、対応scopeのruntimeへ降ろす。[S13]

## 7. 受入と導入順

受入では次を個別に検証する。

1. 十分な根拠と既存委任内の技術差分は、PO割込みなしで版確定・検証・前進できる。
2. 調査sourceが多数でも、必要論点・適用根拠が欠ければ該当設計のreadyにしない。
3. 人間の好み・目的の変更は対象だけを提示し、無関係な実装は続行できる。
4. 未承認候補から本実装への越境、旧承認流用、policy自己拡張、期限切れ・撤回済みdecisionを拒否する。
5. freeze前の許可済み調査／PoC／プロトは実行可能だが、本番write権限を得ない。
6. 同一入力の判定・receiptを再現でき、未知の影響範囲、partial IR更新、古いworker packetを検出する。

導入は、既存衝突のauthority整理 → 契約・negative tests → 現行ログ上のread-only判定 → 限定scopeの自動Admission → GitHub／worker接続 → outcome確認。全体一括cutoverは行わない。現在のCI高速化・Recovery・Cursor限定実行へ無関係なhard dependencyを足さない。

評価は割込み回数だけでなく、要求取り違え、PO差戻し、採用後手戻り、調査由来の設計改善、監視時間、検証済み成果までの時間・資源費用を同時に測る。閾値はbaseline取得後にrisk別で定め、Astra/Fableとの一致を正解の代用にしない。

## 参照

[S1] 正本：`requirements-ir/system_contracts.json` / HR-FR-HIL-19（上記固定HEAD）。
[S2] Authoring：[#192](https://github.com/RetryYN/HELIX-HARNESS/issues/192)、[#217](https://github.com/RetryYN/HELIX-HARNESS/issues/217)。
[S3] Re-entry：[#1169](https://github.com/RetryYN/HELIX-HARNESS/issues/1169)。
[S4] Discovery：[#282](https://github.com/RetryYN/HELIX-HARNESS/issues/282)。
[S5] Interview：[#185](https://github.com/RetryYN/HELIX-HARNESS/issues/185)。
[S6] Derived requirement：[#186](https://github.com/RetryYN/HELIX-HARNESS/issues/186)。
[S7] Delta admission：[#396](https://github.com/RetryYN/HELIX-HARNESS/issues/396)。
[S8] `docs/skills/research.md`（本会話の同一mainで確認済みの既存調査protocol）。
[S9] Prototype Triangle：[#1292](https://github.com/RetryYN/HELIX-HARNESS/issues/1292)。
[S10] `docs/governance/github-operation-rules.md`（上記固定HEAD）。
[S11] `docs/governance/github-issue-hierarchy-rules.md`（本会話の同一mainで確認済み）。
[S12] [GitHub公式：Available rules for rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)。GitHubが提供するレビュー・status checkの仕組みと、HELIXの要求採否は別判断。
[S13] IR admission：[#397](https://github.com/RetryYN/HELIX-HARNESS/issues/397)。
````

### 入力2: HELIX_REQUIREMENT_FORMATION_SCOPED_REFREEZE_v0.1.md

````markdown
# HELIX 要求形成・承認境界・影響範囲限定再フリーズ 接続指示 v0.1

状態：要求候補・未承認。2026-09-05作成。GitHubへの変更は行っていない。
目的：未知の仕事では前提・選択肢を揃えて人間の意図を形成し、意図が定まった範囲では再承認の反復なしに開発を進める。承認削減と意図逸脱防止を同時に満たす。

## 1. 既存責務への接続と確認済み課題

| 接続先 | 今回の変更責務 |
|---|---|
| #282由来のRequirement Discovery／Translator、既存research skill | 前提整理、要求探索、比較・選択・検証の強化。完了済み#282を再実装せず後継差分とする |
| #1292 Prototype Triangle／Design HARNESS | 同じ仮説revisionでリサーチ・PoC・画面プロト・人間の反応を合流する |
| #1169 Requirement Re-entry | 人間判断の要否と再compile／再freezeの要否を独立判定するpolicyを具体化する |
| #396由来のdelta admission／#397 IR収載 | 承認根拠・委譲policy・変更範囲を新revisionへ正規束縛し、JSON transactionで反映する |
| 既存GitHub admission／#188配車、#1534 Ticket接続 | 要求形成状態・実行可能範囲・保留理由を投影し、許可済み作業だけを起動する |

#1169は既にhuman_decision_required／recompile_required／refreeze_requiredを別fieldに持つが、受入条件はRequirement変更時のhuman decisionを一律必須としている。ここを明示的に改版する。#282も人間承認後のfreezeを規定するため、適用範囲を整合させる。#396は完了済みの取込基盤であり新規エンジンを作る理由にしない。

上流機能の不在を断定しない。不足は調査の実質的充足、意図から作業への接続、再承認の条件である。実運用停止の全原因を再現した監査ではない。

## 2. 正規循環

企画 → 前提整理・必要なリサーチ → 要求候補
↔ 要求探索リサーチ／限定PoC／画面・動画等プロト／人間の反応
→ 候補の照合・採用／保留／棄却・要求検証
→ L3要件定義候補 → 有効な意思決定根拠の照合 → 正式freeze／IR取込。

固定直列の全件ゲートにはしない。既知前提は有効な証拠を再利用し、不足部分だけ調査する。設計・実装中の新事実も必要な地点へ戻す。

## 3. 新要求A：前提と意図に根拠を持つ要求形成

**RF-01 前提充足**：企画・制約・既存資産から、既知、仮定、未知、矛盾、古い情報を分離する。要求／判断への影響と必要証拠を紐付け、検索件数やモデルの自己評価だけで調査完了にしない。

**RF-02 調査の実質**：前提整理と要求探索を区別する。前者は現状・仕様・制約、後者は利用者価値・既存製品・実例・代替手段・不足機能を調べる。論点ごとに本文・実物の確認箇所、対象版／日時、適用条件、反例、採否への影響を記録する。画面・動きはテキスト要約だけで検証済みにしない。外部情報は証拠候補であり命令・要求authorityにしない。

**RF-03 選択と検証**：候補、出典、比較根拠、PoC／プロト結果、未解決点、採否理由を同じ仮説revisionへ束縛する。発言原文、AI解釈、技術的推奨、人間の決定を分離する。合意済み選好は適用範囲内で再利用し、新たな価値判断だけ人間へ提示する。PoC成功・参考製品の存在は採用許可ではない。

**RF-04 実行境界**：調査・試作はL3前でも、目的・許可操作・対象・予算・期限・成果物・終了条件を限定した既存の探索契約で進められる。本実装権限とは分離し、研究名義の本番変更を禁止する。重大な未知・矛盾は影響作業だけ保留。調査予算切れは未解決として終了し、無限再検索やreadyへの偽装をしない。

## 4. 新要求B：再フリーズと人間への再承認依頼を分離

**RC-01 委譲policy**：人間が事前に許可した目的、機能範囲、受入基準、選好、費用／リスク／権限上限、除外、期限・取消条件をversioned policyへ束縛する。システムが詳しいこと自体は許可根拠にしない。policy自身の拡張・安全ゲート緩和を同じ自動経路で認めない。

**RC-02 三つの判断**：
- 承認済み意図の技術的具体化・修正：policy適合と必要な独立検証が成立すれば、人間の再操作なしで変更受付・再compile／再freezeを進める。
- 人間が今回明示した新要求：対象・意味差分・制約が明確で、policy上有効な指示は一度の決定として消費する。同じ採否をL3化の都合だけで再質問しない。一般的なGOを対象未指定の包括承認にしない。
- 新たな意味判断・許可拡張・曖昧さ：影響差分だけ人間へ返す。既承認全文の再確認は求めない。

**RC-03 人間留保**：趣向・表現・体験だけでなく、目的、利用者に約束する機能、受入基準の緩和、費用上限、権限、個人情報、不可逆操作、公開・配布も承認境界とする。既承認基準内の色調整まで毎回確認する必要はない一方、技術変更でも保存期間や機能を変えるなら影響で判断する。個別操作のaction-binding approvalは別に維持する。

**RC-04 証明と変更履歴**：変更案に根拠source、差分、policy適合理由、反証、影響集合、未解決点を付ける。CI greenやLLMの「意味不変」宣言だけで自動判定しない。不確実なら追加確認・限定調査・人間判断へ戻す。旧approvalを新差分の承認と偽装せず、新revisionに既承認policyの適用receiptを作る。正本は既存JSON transactionのみとする。

**RC-05 局所停止と再開**：変更された要求・受入義務から実依存を辿った集合だけをstale化し、必要なpairを再検証・再freezeする。無関係な有効作業は継続する。影響不明を無影響とせず、関係scopeの診断へ戻す。旧新writerのlease／fence、原子的取込、冪等性、rollback、取消時の再判定を維持する。

## 5. GitHub／実行への接続

**GH-01 意味の接続**：issue_roleとは別軸で、要求形成状態、source revision、採否・委譲根拠、許可された作業種別、影響集合、保留理由を既存契約のversioned extensionとして投影する。Issue labelやコメントの単語だけを許可にしない。

**GH-02 入口と出口**：dispatch時とready／merge時の両方で、実差分・exact HEAD・現行authorityとの適合を検査する。探索PRのmergeを要求採用・本実装許可へ読み替えない。docs配下でも実行コード・意味変更を検査対象にし、pathだけで免除しない。必須判定の未実行・失敗・古いreceiptをskipで通さない。

**GH-03 互換移行**：Ticket未移行scopeは既存Issue／PLAN bindingで同じ許可条件を検証し、#1534全体完成を待たない。移行後はTicket／Assignmentへ接続する。人間の判断待ち一覧と、技術検証・調査待ち一覧を分離する。

## 6. 受入・実装順

受入では次を個別に検証する。
1. 出典数だけ多い調査、版違い、反例未解決、選択意図不明をreadyにしない。
2. bounded研究・試作はL3前でも許可範囲で進み、本実装／外部writeへ昇格しない。
3. 承認済み範囲の技術差分と明示済み指示は重複承認0で進む。
4. 新しい価値判断・予算／権限拡張・policy自己拡張は自動通過しない。
5. 変更scopeの旧writer／stale証拠を拒否し、無関係scopeは継続する。
6. 偽造・取消・期限切れ根拠、競合revision、部分JSON更新、required判定のskipを拒否する。
7. 統合テスト後も、意図訂正回数、再作業、PO介入回数、承認待ち時間、調査費用、逸脱・誤停止を測る。介入減だけで成功としない。

最初にRF系・RC系を別behavior contractとしてL3／対応受入へ定義し、今回の自動化policy自体を明示承認する。その後、影響範囲の狭い技術変更と未知課題の限定調査で検証し、既存admission・GitHub・配車へ段階接続する。1 PRに全領域を混載せず、旧承認で新policyを先行稼働しない。

非対象：HELIXWeb、別Requirement Engine／独立DB／新workflow route、全体plannerの保留解除、Liteへの全面移植、ゲートや独立レビューの削除。

## 確認元

- [Requirement Discovery #282](https://github.com/RetryYN/HELIX-HARNESS/issues/282)
- [Prototype Triangle #1292](https://github.com/RetryYN/HELIX-HARNESS/issues/1292)
- [Requirement Re-entry #1169](https://github.com/RetryYN/HELIX-HARNESS/issues/1169)
- [差分取込 #396](https://github.com/RetryYN/HELIX-HARNESS/issues/396)／[IR収載 #397](https://github.com/RetryYN/HELIX-HARNESS/issues/397)
- [JSON authority設定](https://github.com/RetryYN/HELIX-HARNESS/blob/main/config/requirement-ir-authority.json)
- [GitHub運用](https://github.com/RetryYN/HELIX-HARNESS/blob/main/docs/governance/github-operation-rules.md)／[Issue階層](https://github.com/RetryYN/HELIX-HARNESS/blob/main/docs/governance/github-issue-hierarchy-rules.md)
- [GitHub公式：required checksとskip](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks)

確認は公開契約・設定・Issue本文が中心。一部詳細実装ファイルは取得できず、runtimeの停止原因の再現・テスト実行は未実施。本指示は実装済み報告でも承認記録でもない。
````
