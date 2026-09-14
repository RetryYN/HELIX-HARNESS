# HELIX インフラ・運用品質：要求導出と設計接続 v0.1

状態：要求候補・未承認。作成日：2026-09-11（Asia/Tokyo）。参照main：`998513e316f878986a3715062c5e6503d109aa1d`。

## 0. 結論と既存機構の境界

要求の核は「定義を増やす」だけでなく、**定義の適用条件から要求候補を導き、承認後に必要な設計と検証へ接続し、運用結果を上流へ戻すこと**である。

既存mainの§4.3には、requirement/NFRからverification_measurement_contractを生成する要求がある。[S01] `src/requirements/nfr-registry.ts`には品質分類・authority role・NfrEntryV1の型が存在し、`config/nfr-registry.json`にも設定が存在する。[S02][S03] したがって「NFR taxonomyやregistryがない」という前提には立たず、対象領域のprofile・導出規則・設計義務・接続の差分を要求化する。

#219/#220/#221は取得時にclosed、#290/#1033/#1318/#222/#223/#1160はopenだった。[S04–S12] この状態は実装・統合・実運用の完全性を証明しない。本案は、既存責務を拡張する**提案**であり、未実装箇所を網羅的に断定する監査報告ではない。

本書のNIO-CAND識別子、追加field案、工程分割は本提案内のもの。現行HELIX schemaへの適合、canonical ID、正式owner、承認済み状態を主張しない。Issue/PRの変更、リポジトリへの書き込み、テスト実行、本番操作は行っていない。

## 1. 全体の接続

```text
公開事故・OSS再現・制御実験・実運用
    → #1318 Knowledge Rule候補 → #1035 規則昇格
                                      ↓
L1/L2 要求・暫定責務graph + 定義/規則
    → #1318 System TDD / #186 derived compiler
    → #282 Requirement Discovery
    → 人間の意味判断・既存承認
    → L3 Requirement IR / NFR registry #219
    → #290 Design Portfolio Planner
    → #1033 System Synthesis（既存graph/部分合成）
    → L4/L5 設計・検証/測定契約
    → L6/L7 実装/TDD → L8–L11 検証/受入
    → #220/#221 計測 + #222 events/logging
    → #223 finding分類 + #1160 運用/診断/保守
    → 修正/再配備/再観測
          └─ 意味変更 → #1169 → 要求再定義・再freeze
```

これは新しいengineの提案ではなく、既存owner間のデータと証拠の接続案である。[S01][S07–S12] L4/L5で新しい環境・依存制約が分かった場合も、最後の再入経路を使う。上流一回だけの判定にしない。

## 2. 接続先と受け渡し

| 段階 | 既存接続先 | 入力 → 出力 | 維持する境界 |
|---|---|---|---|
| 定義 | #219 NFR registry | 品質分類・対象環境・要求 → インフラ/運用profileと適用条件 | NFR taxonomy/validatorを再実装しない |
| 知識取り込み | #1318 Responsibility Knowledge Rule / #1035 promotion | 公開事故/OSS再現/制御実験/運用証拠 → 出所・反例付き規則候補 | 公開報告と実測、候補とvalidatedを混同しない |
| 要求導出 | #282 Discovery / #186 derived compiler / #1318 System TDD | L1/L2要求・暫定責務graph・規則 → FR/NFR/観測/復旧の要求候補と未決質問 | L3承認前にcanonical requirementや数値目標を確定しない |
| 設計選定/具体化 | #290 Portfolio Planner / #1033 System Synthesis | 凍結済みRequirement IR → template/obligation exact set、L4/L5 Design Instance、V-pair | 独立plannerや文書を意味正本として増設しない |
| 検証/計測 | #220 evaluator / #221 probes/history | 測定契約、負荷、環境、故障scenario → 限定実験結果・鮮度/代表性/閾値判定 | 設計時oracleと実測結果を区別 |
| 運用観測 | #222 events/logging / #1160 Operations | 実serviceとenvironment/deployment → correlated observation / health | raw telemetryを意味正本にしない |
| 障害対応/上流還流 | #223 routing / #1160 diagnosis / #1169 Re-entry | 観測された影響、policy、診断evidence → incident/対応作業/要件再定義/再deployment義務 | 観測だけで要件や本番実行権限を変更しない |

各行は既存責務を参照した接続提案。根拠はJSONのconnections[].sourcesと末尾のsource一覧を参照。

## 3. 要求候補と受入条件

### NIO-CAND-01　インフラ・運用の定義を既存モデルへ接続する

HELIXは、品質特性・運用対象・障害条件・観測・インシデントを別の型付き概念として定義し、既存NFR registryと運用契約へ版管理付きで接続できなければならない。

接続先：NFR registry #219 / Requirement IR / Operations #1160。根拠：[S01][S02][S04][S12]

入力：既存NfrCharacteristic／NfrEntryV1、対象製品の業務・データ・依存・実行環境、承認済み要求と運用policy。

出力：用語・単位・状態・適用条件の定義、既存schemaとの差分とmigration方針、品質特性↔対象資源↔障害モードの対応。

- 対象はHELIX自身とHELIXで開発する製品。対象system/service、環境、資源、責務ownerを別IDで持ち、HELIXのCI障害と製品の本番障害を混同しない。
- 品質分類は既存NfrCharacteristicを再利用する。compute、network/DNS/TLS、storage/DB、queue、外部依存、権限、capacity、backup/restore、deployment、costは品質分類と別の適用領域として扱う。
- 用語は定義ID、revision、意味、適用条件、単位、source、owner、再評価条件を持つ。正常/劣化/停止等のservice状態、観測不能等のevidence状態、incident lifecycleを一つのenumへ混ぜない。
- 品質目標=NFR、通知・復旧等の動作=FR、採用クラウド・冗長化方式等=設計判断として分離する。すべてをNFRやSLOへ押し込まない。

受入条件：

- **AC-01a** 正常系：同一品質特性をDBとqueueに適用しても、対象・指標・ownerを独立に追跡できる。 破壊/拒否系：資源名を品質特性へ混入、単位不明、owner不明、未知の定義参照をcurrentとして受理したら失敗。

- **AC-01b** 正常系：収集不能の場合はserviceの実状態と観測不能を別表示する。 破壊/拒否系：ログ0件だけで正常と判定したら失敗。

### NIO-CAND-02　公開事故知識と実測から適用可能な規則候補を作る

HELIXは、公開障害報告・OSSの再現/修正/回帰試験・制御実験・自システムの観測を、出所と適用範囲を保持した障害知識候補として取り込めなければならない。

接続先：Responsibility Knowledge Rule #1318 / pattern promotion #1035。根拠：[S09][S15]

入力：公開postmortem、Issue/PR/commit/testの証拠、合成試験と実運用のepisode。

出力：既存Responsibility Knowledge Ruleへの候補、sourceと反例を伴う適用条件・障害連鎖・導出義務。

- 事前条件、trigger、観測信号、故障モード、影響、対処、再発防止、反例を分け、本文にない時系列や数値を補完しない。相関を因果の確定証拠にしない。
- evidence_originはpublic_report / repository_reproduction / synthetic_fault / runtime_observation等を区別し、未記載を0や正常へ変換しない。source/version/取得日/利用条件を記録し、公開情報を無条件に学習利用可能とは扱わない。
- 抽出・候補化は#1318、複数episode・反例・検証を経た共通規則への昇格は既存#1035へ渡す。LLM抽出だけでvalidatedやcanonicalにしない。
- 初期seedは、接続枯渇、再試行増幅、再配送の重複副作用、disk full/復元不能、設定/version混在、資格情報期限切れ、tenant文脈欠落、観測断を対象とする提案。最終集合は適用範囲と既存規則の重複監査後に確定する。

受入条件：

- **AC-02a** 正常系：同じ事故の転載をsource lineageで関連付け、原報告と再現検証を区別する。 破壊/拒否系：記事の推測を実測値、単一事故を全案件共通の確定規則に昇格したら失敗。

- **AC-02b** 正常系：未知条件・適用外例を保持し、規則を無効化/再検証できる。 破壊/拒否系：障害報告件数を分母不明の発生確率に変換したら失敗。

### NIO-CAND-03　要求から運用上の義務と未決事項を導出する

HELIXは、業務要求・利用状況・データ重要度・外部副作用・依存・制約から、適用規則に基づくFR/NFR/Invariant/Observability/Recoveryの要求候補と未決事項を導出できなければならない。

接続先：Requirement Discovery #282 / Universal Workflow／derived requirement compiler #186 / Responsibility System TDD #1318。根拠：[S01][S09][S12]

入力：L1/L2の要求候補と暫定責務graph、NIO-CAND-01の定義、NIO-CAND-02の規則候補/採用規則。

出力：Derived Obligation→Requirement Discovery Candidate、導出根拠・前提・反例・未決質問、accepted/rejected/deferred等の採否と独立したevidence状態。

- 入力要求ID/revision、適用規則ID/version、前提、反例、導出結果を結ぶ。自然言語解釈は候補とし、正規化された同一入力・同一規則からは同一の適用/義務集合を得る。未対応の入力はunknownとして残す。
- 要求→性質の抽出→適用規則→故障シナリオ→必要な品質/動作→受入候補の順に導出する。名称やkeyword一致だけでクラウド方式・閾値・severityを確定しない。
- 停止許容時間、許容データ損失、応答時間、利用規模、予算、保持期間、当番/通知範囲の未合意値は質問または仮説として返す。RTO/RPO等をAIが既定値で埋めない。
- L2では暫定構造で探索する。L4/L5で確定した依存・環境により新しい義務が出た場合も再評価し、要求/AC/権限/予算の意味変更は#1169へ戻す。
- 矛盾した目標や予算内で実現不能な組合せは、衝突対象・代替案・必要な人間判断を返す。安全条件を加重平均で相殺しない。

受入条件：

- **AC-03a** 正常系：「受付済み処理を失わず、再送でも二重実行しない」から回復性・重複防止・照合・未完了観測の義務候補を根拠付きで導出する。 破壊/拒否系：停止時間や損失許容量が不明なのに数値目標を確定したら失敗。

- **AC-03b** 正常系：前提/規則revision変更で再評価対象と影響先を返す。 破壊/拒否系：適用規則1件を削除しても必要義務集合の欠落を検出できなければ失敗。

### NIO-CAND-04　承認済み要求をL4/L5の設計義務へ変換する

HELIXは、承認済みRequirement IRから、インフラ・観測・障害対応の必要設計templateと義務集合を選定し、L4/L5 Design Instanceと対応する検証へ追跡可能に落とせなければならない。

接続先：Design Portfolio Planner #290 / System Synthesis #1033 / #1036 / #1039。根拠：[S01][S07][S08]

入力：凍結済みFR/NFR/AC、適用環境と責務graph、既存template registry。

出力：design_template_ids / design_obligation_ids / required_design_artifact_kinds、L4 architecture/境界/依存/障害影響の設計、L5契約/設定/計測/復旧/試験の設計。

- L4では配置・依存・failure domain・通信/権限境界・容量前提・データ保護・deployment/rollback方針を定義する。複数regionや特定クラウドを無条件に要求しない。
- L5ではtimeout、retry上限、backpressure、冪等性、接続/資源上限、backup/restore、migration/rollback、ログschema、計測式、alert/incident判定、runbookを具体化する。
- 各義務にrequirement/revision、owner、artifact/section、verification、環境、未決事項を結び、多対多の正当な共有を許す。文書タイトルや章の存在だけで充足にしない。
- SLO/安全性/予算を満たす設計候補の比較と採否理由を記録する。バックアップ方式があることと、要求時間内に復元できる証拠を区別する。
- 既存#290のtemplate applicabilityと#1033の接続graph/部分合成を拡張し、独立Portfolio Plannerや新しい意味正本を作らない。依存未完成なら必要interfaceと残義務を明示し、利用済みと偽装しない。

受入条件：

- **AC-04a** 正常系：回復性要求から復旧設計、復元試験、運用手順まで往復追跡できる。 破壊/拒否系：冗長化やbackupの名称だけで回復性を充足したら失敗。

- **AC-04b** 正常系：L4↔L9、L5↔L8の対応を生成し、設計差分により再試験対象が変わる。 破壊/拒否系：必須設計義務1件欠落、孤児artifact、古い要求revisionを合格として扱ったら失敗。

### NIO-CAND-05　何をどう測るかと観測不能時の扱いを契約化する

HELIXは、要求と故障シナリオごとに、必要な観測信号・測定方法・判定・保持/機密条件を設計し、観測器自体の故障も検知可能にしなければならない。

接続先：Measurement #220 / #221 / operation event/logging #222 / Operations #1160。根拠：[S01][S05][S06][S10][S16]

入力：FR/NFR/ACと設計義務、対象workload/環境/data、観測・保持・権限policy。

出力：既存verification_measurement_contractの具体profile、構造化ログ/metric/traceの相関仕様、観測欠落・鮮度・代表性の評価と対象別残義務。

- 業務成功率・処理期限・データ整合性等の利用者影響と、CPU/RAM/I/O、DB接続、queue age等の原因診断用指標を区別する。すべてのmetricをSLI/SLOにしない。
- 指標ID、単位、分子/分母、集計粒度、window、最低標本条件、workload/data/環境、baseline、target、probe/oracle、owner、HEAD/版/digest、再測定triggerを記録する。統計率だけでなくbool/invariant等の検証方式も区別する。
- logical operationとretry attemptを区別する。欠落/重複/遅延/順序逆転、時刻ずれ、sampling、低traffic、再集計条件を定義し、観測データから読めない値を捏造しない。
- event/service/environment/deployment/traceまたはcorrelation IDを接続する。生ログを意味正本にせず参照付きartifactへ分離する。高cardinality IDを無制限にmetric labelへ載せない。
- secret/PIIの非収集・redaction・閲覧権限・保持/削除・計測overheadを設計する。collector停止や欠測はunknown/degradedとして示し、0/正常へ変換しない。監査上必須の証跡と診断用sampleは保持義務を分ける。

受入条件：

- **AC-05a** 正常系：同一入力と測定契約で判定を再現し、実環境とsyntheticを別集合として評価する。 破壊/拒否系：別HEAD/環境、stale、欠測、非代表sampleを充足証拠へ採用したら失敗。

- **AC-05b** 正常系：collectorを止める試験で観測不能を検知し、policyに従う通知/制限を返す。 破壊/拒否系：観測器停止を「エラー0件」へ変換、secretをartifactへ出力したら失敗。

### NIO-CAND-06　異常・インシデント・復旧判断の境界を定義する

HELIXは、観測・異常候補・通知・インシデント宣言・緩和・復旧・原因修正を区別し、承認済みpolicyと実際の影響から既存routeおよび対応義務を導出しなければならない。

接続先：finding routing #223 / Operations #1160 / 既存Security Broker／実行認可。根拠：[S11][S12][S14][S15]

入力：評価済みNFR/measurement/security finding、環境と業務/データ/権限への影響、incident/通知/runbook policy。

出力：分類理由・evidence・severity・対応先、対象/期限/owner/復旧条件を持つincidentと関連作業、緩和・復旧・恒久是正の別receipt。

- error log 1件、CPU高騰、SLO違反のいずれも全案件共通のincident条件としない。利用者/業務影響、損失リスク、継続時間、範囲、緊急性、安全性を組み合わせ、hard invariantは別経路で評価する。
- data破壊・権限逸脱等の重大リスクでは、SLO window完了や根因確定まで対応を待たない。疑いと確定の証拠状態を別に記録し、緊急対応の閾値は承認済みpolicyに従う。
- 同一findingの現時点の主routeは#223で一意に解決し、並行する復旧・恒久修正等の関連作業は別IDで持つ。診断未完を推測分類せず、保留/調査を明示する。
- severityと通知緊急度を分離する。連絡先/当番、ack期限、fallback/escalation、dedupe、抑制/解除、保守時間帯、復旧確認windowを定義する。
- 自動緩和は既存の認可済み範囲・対象・実行条件・回数/時間/費用上限を満たすrunbook内のみ。診断・仮説生成・実行認可を混同せず、本要求を本番操作の許可にしない。
- rollback成功、影響緩和、service復旧、incident終結、恒久修正完了を一括でcompleteにしない。各終端条件と未完了の後続作業を残す。

受入条件：

- **AC-06a** 正常系：利用影響のない単発retry、業務停止、データ破壊疑い、テスト中faultを区別する。 破壊/拒否系：開発test failureを製品incidentへ誤帰責、重大な損失リスクをSLO正常で相殺したら失敗。

- **AC-06b** 正常系：通知未達/ackなしで代替連絡へ進み、復旧後も原因是正の残義務を表示する。 破壊/拒否系：通知送信だけで対応完了、rollbackだけで恒久是正完了、認可外auto-fixを許したら失敗。

### NIO-CAND-07　既知の故障シナリオを安全に再現して検証する

HELIXは、適用対象の故障シナリオを既存probe基盤で限定実行し、正常時・故障時・復旧時の観測と業務結果を同一episodeへ結び付けて検証できなければならない。

接続先：bounded probe/history #221 / V-pair／CI #1033 / Operations #1160。根拠：[S01][S06][S08][S12]

入力：承認されたscenarioと検証義務、正常時baseline、対象環境/負荷/資源/時間/費用/権限の制限。

出力：fault/recoveryの再現recipeと結果、検知時間・復旧結果・安全条件の証拠、coverageとunknown/deferredの残義務。

- 代表profileはHELIXのworker/CI、API＋DB、非同期queue処理を初期候補とする。外部全providerや異質な本番案件の完全検証をcore着手の前提にしない。
- 試験前に対象/範囲/停止条件/cleanup/rollback/計測overheadを固定する。初期は隔離環境で行い、本番や共有hostで無認可の負荷/破壊試験を行わない。
- 負荷、依存障害、再起動、競合、timeout、再配送、復元、telemetry停止を適用可能性とriskで選定する。相互作用は重要な組合せを指定し、全直積を走査したと主張しない。
- 実測値・期待値・推定値、成功・失敗・未測定、合成・実環境を区別する。正常時baselineとfault注入を対応付け、検知されなかった故障も記録する。
- 注入時刻は評価用の正解ラベルとして保持するが、検知器の入力に混入させない。検知器自身を検証し、単なるfault実行成功を検知成功と数えない。

受入条件：

- **AC-07a** 正常系：故障発生、必要な信号の記録、所定の検知/route、復旧後の業務結果を独立に確認する。 破壊/拒否系：試験0件、oracle欠落、注入時刻の漏洩、未実行を成功扱いしたら失敗。

- **AC-07b** 正常系：停止条件への到達で対象試験を終了し、必要な後処理と未完了を記録する。 破壊/拒否系：無制限retry/負荷、無関係process kill、権限拡張で試験を継続したら失敗。

### NIO-CAND-08　要求・設計・実行・運用の変更を双方向に追跡する

HELIXは、要求・規則・設計・環境・測定・incident・修正の履歴を版付きで接続し、変更時に影響先の再評価と上流への還流を行えなければならない。

接続先：Requirement IR／System Synthesis #1033 / #1036 / Operations #1160→Requirement Re-entry #1169 / pattern promotion #1035。根拠：[S01][S08][S09][S12]

入力：requirement/design/environment/rule/policy revision変更、運用episode・incident・保守結果。

出力：影響を受けた設計/テスト/metric/alertの集合、必要なre-entryと再freeze/再計測義務、実績と予測を混同しない履歴。

- traceはRequirement↔Derived Obligation↔Design↔Test/Probe↔Observation↔Incident↔Fix/Redesignを多対多で結ぶ。関係type、revision/digest、ownerを持ち、相関linkを因果確定linkへ変換しない。
- 原因が実装/設定なら該当既存route、定義/AC/権限の変更なら#1169経由で上流へ戻す。L4/L5で発見した新しい依存条件も同じ経路を使う。
- 古い測定を後から新しいpolicyで生成されたことにしない。新policyでの再判定は別評価recordとし、元の観測/判定/実行を保存する。
- 観測結果だけで要求本文やseverity policyを自動変更しない。規則改善は#1035の昇格へ渡し、未承認の共通ruleや新たな実行権限を作らない。
- 将来の予測器向けに、観測期間、正常/異常、未観測、検知、介入、復旧、環境revisionを保持する。介入で回避できた事象を「予測の誤り」と即断しない。ML学習や確率推定は本要求の実装scopeに含めない。

受入条件：

- **AC-08a** 正常系：要求の品質目標変更で関係する設計・試験・測定・判定policyだけを再評価対象にする。 破壊/拒否系：stale evidenceの流用、根拠のないtrace edge生成、観測からの要求直接上書きは失敗。

- **AC-08b** 正常系：観測から修正/再deployment/再観測まで追跡でき、DB projectionを再構築できる。 破壊/拒否系：DBだけに意味正本を保存、過去観測をin-place改変、履歴の出所を失ったら失敗。

### NIO-CAND-09　定義済み・設計済み・実証済みを分けて段階判定する

HELIXは、適用定義・導出義務・設計・検証・運用証拠の充足を工程ごとに判定し、既知範囲の未検証領域を隠さず表示しなければならない。

接続先：既存freeze／doctor／CI／release admission / Design Portfolio #290 / Measurement #220 / #221 / Operations #1160。根拠：[S01][S05][S06][S07][S12]

入力：対象scopeに必要な義務集合、各工程の証拠と未決事項、既存approvalとrelease profile。

出力：各要求のdefined/designed/verified/operational evidenceの区別、missing/stale/conflict/deferredの理由とowner、適用範囲を明示した段階完了判定。

- L3 freezeでは要求意味・受入基準・数値の未決判断を解消し、後工程の実測義務はowner/stage/期限付きで残す。本番実測を設計開始の前提にしない。
- L4↔L9、L5↔L8、L6↔L7、L3↔L10、L2↔L11、L1↔L12を現行定義どおり使用する。旧PLANのL6設計/L7実装という表記を新規工程割当に持ち込まない。
- 完了をcatalog completeness / derivation coverage / design coverage / verification coverage / operation evidenceの別状態で評価する。Issue closed、文書数、code存在だけでは実運用済みとしない。
- 不足時に止める対象は該当requirement/slice/release/high-impact actionに限定する。観測欠落を理由に無関係な全サービスを停止しない。重大な安全前提が未確認の操作は既存境界でfail-closeする。
- coverageの分母は対象scope、registry/rule version、適用scenario/obligationの集合とし、根拠付きN/A、deferred、unknownを別計上する。100%表示は宣言した集合内だけの充足であり、未知の設計漏れゼロの保証ではない。

受入条件：

- **AC-09a** 正常系：definition/設計が完了しても本番未観測の義務を残し、実運用済みと表示しない。 破壊/拒否系：source未確認、N/A無根拠、synthetic成功で本番ready、required obligationの欠落を別greenで相殺したら失敗。

- **AC-09b** 正常系：対象外の無関係sliceを止めず、影響対象だけへblock理由・回復条件を返す。 破壊/拒否系：必須runtime未接続をmockだけで統合完了、または無関係な全capability完成を常にhard dependencyにしたら失敗。

## 4. 最小の論理契約――既存schemaへ割り当てる項目案

以下は新規schemaの確定ではなく、既存ownerへ割り当てるための項目案である。既存fieldが同じ意味を所有する場合は参照し、二重保持しない。

| 契約 | 必要な意味 | 主な既存接続先 |
|---|---|---|
| 定義・適用profile | definition_id/revision、品質特性参照、対象資源、適用predicate、単位、owner、source | #219 / #1160 |
| 導出規則 | rule/version、前提・反例、適用mutation、consequence、義務kind、根拠、再検証条件 | #1318 / #1035 |
| 要求導出receipt | 入力要求revision、rule/version、前提、結果候補、unknown、採否、判断根拠 | #282 / #186 / #1318 |
| 設計義務binding | requirement/revision、template/version、obligation、L4/L5 artifact/section、owner、V-pair、未決 | #290 / #1033 |
| 計測契約 | metric/単位/母集団/window、workload/data/環境、target/baseline、oracle、証拠・鮮度 | #220 / #221 |
| incident policy | 観測・影響条件、severity、通知/ack、route、runbook、認可、緩和/復旧/終結条件 | #223 / #1160 |
| trace・実績 | 上下流ID/revision、実環境、観測期間、介入、結果、再評価対象 | #1033 / #1160 |

候補の採否、値が実測か推定か、設計/検証/運用の成熟度は別属性にする。例えばrejectedはevidence不足と同義ではなく、unknownは数値0と同義ではない。

## 5. 一つの要求を端まで通す例

以下は設計例であり、現在HELIXが自動実行できることの証明ではない。

**業務要求例**：「受付済みの処理を障害で失わず、再送されても二重実行しない。」

1. **前提確認**：受付の確定点、重複の識別単位、許容停止時間、損失許容量、外部処理の照会/冪等性能力、キャンセル後の扱いを要求候補として確認する。「失わない」の対象障害範囲が未定なら無条件の保証にしない。
2. **System TDD**：受付後停止、外部処理完了後の応答消失、再配送、順序逆転、依存停止を暫定責務graphへ適用する。
3. **導出要求候補**：受付状態の回復、重複副作用の防止、処理結果の照合、未完了/期限超過の観測、上限付きretry、失敗の利用者通知。数値目標は未合意ならunknown。
4. **L4設計**：処理/状態保存/外部副作用の責務境界、受付確定点、transaction境界、failure domain、復旧方針。
5. **L5設計**：durable state、idempotency key、結果照合、outbox等の方式候補を比較し、適合する方式を選定。外部APIの能力不足で二重実行ゼロを証明できない場合は、照合/手動解決/業務変更の判断へ戻す。方式名だけでexactly-onceを保証しない。
6. **観測**：logical operation単位の受付/完了/失敗、未完了age、再試行回数、重複副作用、相関欠落を記録。queue数だけで業務成功を判断しない。
7. **incident policy**：単発retryで影響が吸収された場合、処理期限を超過した場合、重複副作用の疑いが出た場合を別評価する。後二者の対応は承認済み影響/安全policyで定める。
8. **検証**：副作用完了直後の応答消失と再配送を注入し、実際の副作用数、整合状態、検知/通知、復旧結果を独立に確認する。
9. **還流**：要件内での実装誤りなら修正へ。外部仕様により元の保証が不可能なら#1169で要求/受入基準を再検討する。

## 6. 段階導入と依存

最初に、現行正本/schema/consumerで同一責務を持つものを確認し、既存拡張・新規profile・新規adapter・設計差分・運用証拠不足へ分類する。本案をそのまま新capability一覧にしない。

| 順序 | 成果 | 前提 |
|---|---|---|
| A | L1/L2要求候補、L3/L10受入の対定義、ID/owner/schema差分の確定 | 既存責務・重複確認 |
| B | 定義/適用profileと出所付き規則候補 | Aの既存承認・正本反映 |
| C | Discovery/System TDDへの導出接続 | Bの版付きcontract |
| D | #290のtemplate/obligation→L4/L5/V-pair | Cの凍結済み対象要求、必要な既存interface |
| E | #220/#221/#222/#223/#1160への測定/運用接続 | Dの設計・試験契約 |
| F | 代表profileのE2E、main read-after、運用観測・還流 | Eの実consumer |

HELIX worker/CI、API＋DB、非同期queueの3種類を代表profileの候補とする。これはまず境界の異なる検証対象を設ける提案であり、「3種類通れば全案件に一般化できる」という基準ではない。

既存capability全体の完了をすべてのsliceのhard dependencyにしない。直接consumeするcontract/interface/必要証拠へ依存を限定する。一方、未接続をfixtureだけでINTEGRATED/OPERATIONALへ上げない。core検証、実環境接続、継続運用、案件横断の規則検証を別の完了段階として残す。

## 7. 外部知識の使い方と保証範囲

Google SREのSLI/SLOとalert設計は、利用者影響に基づく計測・通知policyの参考にする。低trafficやerror-budget消費を考慮し、掲載された閾値を全案件へそのままコピーしない。[S13][S14] 事前の連絡・役割・記録と、緩和/復旧/原因修正を分ける考え方はincident responseの参考にする。[S15] OpenTelemetryの信号モデルは相関可能な観測設計の参考とし、特定の保存基盤の強制ではない。[S16]

これらから作る規則や本案の設計義務は、既知範囲での検証を助けるものであり、未知の設計漏れゼロ・全障害の予測・実運用での発生確率を保証しない。公開事故報告だけでは正常期間の分母を得られず、制御実験も本番分布そのものではない。予測モデルは正常/異常/欠測/介入/環境変化を区別した実績を用いる後続scopeとする。

## 8. 確認範囲と根拠

調査は指定mainの文書・型・設定の該当範囲、および列挙Issueの取得時本文に基づく。全code/全consumer/全Issueの重複探索やテスト再実行は行っていない。Issue本文にあるlegacy layer/route表記は新規工程の正本にせず、現行governanceのL1–L12とtyped identityを優先する。[S01]

- [S01] HELIX 要件定義書 v1.3 — 正規layer／§4.3 検証・計測基盤
  URL: `https://github.com/RetryYN/HELIX-HARNESS/blob/998513e316f878986a3715062c5e6503d109aa1d/docs/governance/helix-harness-requirements_v1.3.md`
  確認内容: L1–L12、正規V-pair、requirement/NFRからverification_measurement_contractを生成する既存要求。取得応答で読めた範囲を使用。
- [S02] NFR registry型定義
  URL: `https://github.com/RetryYN/HELIX-HARNESS/blob/998513e316f878986a3715062c5e6503d109aa1d/src/requirements/nfr-registry.ts`
  確認内容: 品質分類、authority role、NfrEntryV1、測定文脈、unknown/measuredの型を確認。全実装の動作検証ではない。
- [S03] NFR registry設定
  URL: `https://github.com/RetryYN/HELIX-HARNESS/blob/998513e316f878986a3715062c5e6503d109aa1d/config/nfr-registry.json`
  確認内容: 既存entryとbaseline/target等のunknown表現を確認。全entryの棚卸しではない。
- [S04] #219 NFR typed registry／quality taxonomy
  URL: `https://github.com/RetryYN/HELIX-HARNESS/issues/219`
  確認内容: 取得時state_reason=completed。現行全利用先の稼働保証とは区別。
- [S05] #220 measurement freshness／threshold evaluator
  URL: `https://github.com/RetryYN/HELIX-HARNESS/issues/220`
  確認内容: 測定文脈・鮮度・代表性・閾値評価の既存責務。
- [S06] #221 bounded probe／metric history
  URL: `https://github.com/RetryYN/HELIX-HARNESS/issues/221`
  確認内容: fault/race/soak等のbounded実行と時系列historyの既存責務。
- [S07] #290 Design Template JSON authority／Portfolio Planner
  URL: `https://github.com/RetryYN/HELIX-HARNESS/issues/290`
  確認内容: 要求からtemplate exact set、Design Instance、V-pairを導く定義を確認。完成を主張しない。
- [S08] #1033 System Synthesis
  URL: `https://github.com/RetryYN/HELIX-HARNESS/issues/1033`
  確認内容: #1036 graph／#1039 partial synthesis等への既存責務分割。whole-system plannerはFUTURE。
- [S09] #1318 Responsibility System TDD
  URL: `https://github.com/RetryYN/HELIX-HARNESS/issues/1318`
  確認内容: pre-L3仮説graph、mutation、Derived Obligation、Discovery、#1035 rule promotionへの定義を確認。完成を主張しない。
- [S10] #222 operation event／logging
  URL: `https://github.com/RetryYN/HELIX-HARNESS/issues/222`
  確認内容: provider-neutral event、相関、保持・redactionの既存責務。
- [S11] #223 alert／finding routing
  URL: `https://github.com/RetryYN/HELIX-HARNESS/issues/223`
  確認内容: security/NFR/measurement findingの環境・影響に応じた既存routeへの分類。
- [S12] #1160 Product Lifecycle Operations
  URL: `https://github.com/RetryYN/HELIX-HARNESS/issues/1160`
  確認内容: 運用、診断、保守、#1169 Requirement Re-entry、再deploymentまでの既存責務。
- [S13] Google SRE Workbook: Implementing SLOs
  URL: `https://sre.google/workbook/implementing-slos/`
  確認内容: 利用者視点のSLI/SLOと利害関係者との合意の参考。
- [S14] Google SRE Workbook: Alerting on SLOs
  URL: `https://sre.google/workbook/alerting-on-slos/`
  確認内容: error-budget burn、複数window、低トラフィック、通知精度・検出時間の参考。値を全案件へ転記しない。
- [S15] Google SRE Workbook: Incident Response
  URL: `https://sre.google/workbook/incident-response/`
  確認内容: 事前の役割・記録・連絡、影響緩和と原因分析の区別、訓練の参考。
- [S16] OpenTelemetry: Signals
  URL: `https://opentelemetry.io/docs/concepts/signals/`
  確認内容: logs/metrics/traces等の信号モデルの参考。採用provider・保存先の決定ではない。
