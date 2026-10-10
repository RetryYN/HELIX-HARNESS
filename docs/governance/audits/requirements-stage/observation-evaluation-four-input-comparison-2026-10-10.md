# 観測・Skill・model・PoC評価の4入力比較

基準main `69082b817bca91b0c9f931f0d12647b78301ce6a`、authority_effect: none。[observation-evaluation-four-input-comparison-2026-10-10.json](observation-evaluation-four-input-comparison-2026-10-10.json)、SHA-256 `f754fc306d272feaee6038e05a85821676dbe27e54253a6c630af34dd367a12a`。

33名指し入力のうちFR20/36/38/43の4入力を条件候補へ比較。関連consumerは限定区間。旧要求の正式atom化/再配置・全source閉包・runtime受入は未成立。

## 条件別比較

| atom | 原文条件 | 分類候補 | 比較・未解決 | 根拠 |
|---|---|---|---|---|
| METRIC-20-A01 | 5 hook で AI 実行を全量ログ化 | split | 旧5hook全量の母集団と現行許可scopeを区別。原運転記録はOS、許可観測LABO。5hook個別consumer閉包は未完。 | C08,N01,N04 |
| METRIC-20-A02 | 発火 / トラブル / 精度 / 予算のメトリクス集約 | LABO候補 | 4観点を残し、評価方法と運転原記録を分ける。予算原本と分析結果を同一authorityにしない。 | C01,N04,N05 |
| METRIC-20-A03 | AI 実行イベント全種 | connection | 全種という元のpopulationを保持。成功だけ選ぶ、欠測/未許可を観測済みにする読みは不可。 | N01,N04 |
| METRIC-20-A04 | invocation_log / action_logs / gate_runs / accuracy_score / budget_events | OS保持 | 5出力sourceを列挙したまま保全し、raw log/運転stateをLABOへ移管しない。 | C07,C08,N01 |
| METRIC-20-A05 | dashboard メトリクス | unresolved | 計測scope/原証拠と表示consumerの結合は未完。表示の存在で効果を証明しない。 | C01,N05 |
| METRIC-20-A06 | スキル使用パラメータ + モデルパラメータ + トラブル計測 + トークン/利用コスト の 4 軸 | split | 拡張4軸を保持。計測と比較評価/配置案を分け、token量を費用実額と同一視しない。 | C01,C08,N05 |
| METRIC-20-A07 | L3 で AC 詳細化、F7=b に従い L1 はスコープ宣言のみ | unresolved | 旧L1の宣言と旧下流詳細を区別。旧L3を現行L3へ自動承継しない。 | C01,C07 |
| METRIC-20-A08 | P1 | unresolved | P1/Phase A記録・Phase B拡張の旧区別は保持。現行versionを今回指定しない。 | C08 |
| METRIC-20-A09 | HM-05 / HM-08 | unresolved | 表示consumerの全境界/受入は別途残る。 | C04 |
| METRIC-36-A01 | per-skill rating / adoption / success / unused flag | LABO候補 | 4値を別指標に保つ。ratingは成功採用PLAN/採用PLAN、採用率と同じ式ではない。 | C04,C05,C09 |
| METRIC-36-A02 | skill_invocations + plan_registry | split | 事実は原source、評価projectionは別。未join/重複時の分母を明示する。 | C05,C13,N01,N04 |
| METRIC-36-A03 | skill_invocations.accepted=1 件、plan_registry.status、asOf timestamp | connection | accepted=1、成功状態confirmed/completed、asOfをconsumerで保持。distinct PLANと発火回数は別。 | C05,C09,C13 |
| METRIC-36-A04 | skill_evaluations projection | LABO候補 | 旧projection実装方式を現行schemaへ継承しない。 | C05,C13 |
| METRIC-36-A05 | skill_rating 0.0-1.0、adoption_count、success_count、unused_flag | LABO候補 | 範囲0..1と各count/flagを保持。単一scoreで事実/未使用を相殺しない。 | C05,C09 |
| METRIC-36-A06 | cold-start = 0 行 | unresolved | 0行は0点/劣性能ではない。既存行のあるDBで0入力に戻る時の失効は直接関数では確認できない。 | C09,C13 |
| METRIC-36-A07 | unused = 30 日以内発火なし | LABO候補 | 30日asOf窓を保持。acceptedのみのadoptionとrecent全発火の窓は別。 | C05,C13 |
| METRIC-36-A08 | 削除は人手のみ | unresolved | unused flagで削除しない。通常改修の毎回人間承認へ広げない。 | C04,C05 |
| METRIC-36-A09 | P2 | unresolved | 旧P2を保持し、現行versionへ機械写像しない。 | C04 |
| METRIC-36-A10 | HM-05 | unresolved | 旧L1 HM05と旧L3 HM08 consumer差を保持。表示traceを勝手に訂正しない。 | C04 |
| METRIC-38-A01 | per-model success rate | LABO候補 | modelごとの成功run/全run。Skillのdistinct採用PLAN分母とは違う。 | C05,C10,C12 |
| METRIC-38-A02 | model_runs + plan_registry | split | 元run/PLAN statusはsourceへ残る。join不成立は成功にしない。 | C05,C12,N01,N04 |
| METRIC-38-A03 | model_runs (run_id, runtime, model, role, drive, plan_id, started_at, completed_at, evidence_path) | connection | 9原fieldを保持。名称だけのmodel比較をせず、source/revision/scopeを別に照合する。 | C05,N04 |
| METRIC-38-A04 | plan_registry.status | OS保持 | status sourceと評価の成功定義を区分。projectionからPLAN完了を生成しない。 | C05,C10,N01 |
| METRIC-38-A05 | .helix/config/model-opt-in.yaml (enabled:true で有効化) | unresolved | 旧config pathと旧L3のevaluation pathの差を保全。値true/false/欠落の許可を勝手に統合しない。 | C03,C05,C10,C12 |
| METRIC-38-A06 | runtime session telemetry | connection | file-scan/telemetryという旧供給方式は現行実行経路として復活させない。 | C05,C12,N04 |
| METRIC-38-A07 | model PK、success_rate REAL 0.0-1.0、run_count INTEGER、success_count INTEGER、token/cost efficiency、evaluated_at TEXT | LABO候補 | 旧PK/型/範囲/費用/評価時刻を保全。正式schemaや実装採用ではない。 | C05,C12 |
| METRIC-38-A08 | opt-in 無効 = 0 行 | unresolved | 初回空DBの旧test宣言と既存評価行DBの直接returnを区別。既存行の非表示/失効consumerは未照合。 | C10,C12 |
| METRIC-38-A09 | cold-start = 0 行 | unresolved | 有効でもrunなしは未観測、成功率0とは別。直接関数は既存行削除なし。 | C10,C12 |
| METRIC-38-A10 | 未掲載 pricing は null のまま捏造しない | unresolved | nullは無料ではない。SUMが既知costだけ集計する混在時の不完全総額を要照合。 | C05,C12 |
| METRIC-38-A11 | P2 | unresolved | 旧優先度を保持。 | C04 |
| METRIC-38-A12 | HM-08 | unresolved | model評価表示と推薦更新consumerは別義務。 | C04 |
| METRIC-43-A01 | confirmed / rejected / pivot 件数から成功率 | LABO候補 | 成功分子はconfirmedのみ、pivotは分母に入る非成功。 | C04,C05,C11,C14 |
| METRIC-43-A02 | plan_registry (kind=poc, decision_outcome∈{confirmed,rejected,pivot}) | connection | kind=pocと3outcomeを保持。PLAN status成功とdecision_outcome成功は別。 | C05,C11,C14 |
| METRIC-43-A03 | poc_evaluations projection | LABO候補 | 旧固定summary rowは現行schemaに継承しない。 | C05,C14 |
| METRIC-43-A04 | poc_success_rate 0.0-1.0、confirmed_count、rejected_count、pivot_count、total_count | LABO候補 | 範囲/countを保持。6/3/1なら0.6の旧oracle例を保全。 | C05,C11 |
| METRIC-43-A05 | cold-start = 0 行 | unresolved | 0行と「蓄積中」/KPIゼロ起算の旧表示の層を区別。既存行DBの失効も未確認。 | C04,C11,C14 |
| METRIC-43-A06 | 決定未記録 PoC は分母除外 | LABO候補 | 未判断をpivot/成功へ補完しない。unknown outcomeは別途未解決に残す。 | C05,C11,C14 |
| METRIC-43-A07 | P2 | unresolved | 旧優先度を保持。 | C04 |
| METRIC-43-A08 | HM-08 | unresolved | 成功率表示/原因分析提案の別consumerへ戻す。 | C04 |

## 原要求とconsumerの差

- MF01: 成功という同語でもPLAN completed/全起票、Skill成功distinct採用PLAN/採用PLAN、model成功run/全run、PoC confirmed/判断済3outcomeは別分母。D04回帰検出率・D06 bypass・D09継続成功との関連を同じ指標として統合しない。（C01,C05,C09,C10,C11,C15）
- MF02: opt-in pathは旧L3 §2/§6でevaluation、旧§7/L1/API/test/codeでconfig。差分が残る。直接APIは無効・parse失敗・0runでreturnし、既存model_evaluationsを消去/失効しない。fresh DBの0行testだけでは既存行DBの要求を証明しない。wrapper/rebuild/表示consumerの全照合なしに全runtimeのbugを断定しない。（C03,C05,C10,C12）
- MF03: Skill adoption/successはaccepted=1のdistinct PLAN。一方unusedのrecent窓はaccepted条件なしで全発火を数え、cutoffは>=。旧L3「30日採用0件」とAPI/実装「30日発火なし」の差を保持。（C04,C09,C13）
- MF04: PoC3outcome集合、pivot分母・非成功、未決定除外、固定summary IDを保全。L3のデータ蓄積中/KPIゼロ起算は0行/率0の区別なしに評価済みとしない。直接APIの0input returnも既存rowの失効とは別。（C04,C05,C11,C14）
- MF05: 未知pricing nullは無料0ではない。実装SUM(cost_usd)はmixed known/nullで既知分だけの合計になる。total_cost/cost_per_successを全run完全総費用と呼べるかは別consumerで確認が必要。token/output per successも入力/出力token量・金額と別。（C05,C12）
- MF06: 旧観測Phase A/学習Phase B、sprint末/手動、日1回上限とforce続行警告を保持。現行1.0判定や固定日次義務をこの照合から新設しない。（C02,C08）
- MF07: 各projection→learning/recommendation/recipeの入力と、LABO評価→INT配置候補→OS割当は別接続。scoreだけでmodel/Worker適格化・割当・配備を生成しない。（C06,N05,C16,C17）

## 限定参照

| 根拠 | path | 行 | 確認対象 |
|---|---|---|---|
| N01 | `docs/helix-os/L2-requirements/governance-requirements.md` | 58–60 | OS005登録/振分け、007原証拠/ログ |
| N03 | `docs/helix-os/L11-acceptance/governance-acceptance.md` | 39–41 | 未計測/誤推薦/旧版、同意/data class/retention/scope不足の拒否 |
| N04 | `docs/helix-labo/L2-requirements/labo-requirements.md` | 71–79 | LABO001許可観測、sourceauthority非移管、欠測保留 |
| N05 | `docs/helix-labo/L2-requirements/labo-requirements.md` | 110–125 | LABO006実験/007system化候補、Worker割当はOS |
| N06 | `docs/helix-labo/L2-requirements/labo-requirements.md` | 132–149 | LABO009一般化/010Feedback、登録はOS/変更targetowner |
| N07 | `docs/helix-labo/L2-requirements/labo-requirements.md` | 234–238 | LABO029CI/test受取、stale/未実行非pass |
| N08 | `docs/helix-labo/L2-requirements/labo-requirements.md` | 296–307 | LABO050内部循環と051外部2.0別 |
| N12 | `docs/helix-labo/L11-acceptance/labo-acceptance.md` | 45–54 | LABO001/006/007/009/010の反例 |
| N13 | `docs/helix-labo/L11-acceptance/labo-acceptance.md` | 80–80 | LABO029許可/対象版/stale拒否 |
| N14 | `docs/helix-labo/L11-acceptance/labo-acceptance.md` | 100–100 | LABO050登録/CI成功だけでは改善完了しない |
| M20 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md` | 51–51 | 名指し入力の全L1原row |
| M36 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md` | 67–67 | 名指し入力の全L1原row |
| M38 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md` | 69–69 | 名指し入力の全L1原row |
| M43 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md` | 74–74 | 名指し入力の全L1原row |
| C01 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md` | 27–64 | 評価単位と5指標/各分母/欠測警告/opt-in。KPIへの接続は同じ指標という意味ではない |
| C02 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md` | 66–81 | sprint末/手動/日1回/force警告とaudit |
| C03 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md` | 172–177 | model opt-in旧evaluation pathとPII redaction |
| C04 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md` | 179–231 | 36/38/43 consumerのcount/0.6例/pivot/ゼロ時表示 |
| C05 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/function-spec.md` | 276–278 | 3評価APIの入出力/成功状態/分母/unknown pricing |
| C06 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/function-spec.md` | 577–579 | 各評価からlearning/recommendation/recipeへ正規化する別consumer |
| C07 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/fr-unit-coverage.md` | 56–56 | 20はsession-log/projectionからexecution/budget/metricsを保持 |
| C08 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L4-basic-design/function.md` | 334–343 | Phase A観測とPhase B学習別、guardはLearning非依存 |
| C09 | `archive/legacy-generation-2026-09-14/root/tests/skill-evaluation.test.ts` | 1–13 | 旧testのoracle宣言。実行証拠にはしない |
| C10 | `archive/legacy-generation-2026-09-14/root/tests/model-evaluation.test.ts` | 1–13 | 旧testのopt-in/default disabled/cold-start宣言。既存row失効の全証拠ではない |
| C11 | `archive/legacy-generation-2026-09-14/root/tests/poc-evaluation.test.ts` | 1–13 | 旧testのPoC分母/pivot/0rows宣言。実行しない |
| C12 | `archive/legacy-generation-2026-09-14/root/src/state-db/projection-writer.ts` | 4640–4720 | 直接model関数: opt-inなし/false/parse失敗/0runはreturn、mixed costのSUM(null) |
| C13 | `archive/legacy-generation-2026-09-14/root/src/state-db/projection-writer.ts` | 4474–4522 | 直接skill関数: distinct accepted plans/30日>=cutoff、0inputはreturn |
| C14 | `archive/legacy-generation-2026-09-14/root/src/state-db/projection-writer.ts` | 4565–4610 | 直接PoC関数:3 outcome/summary固定ID、0inputはreturn |
| C15 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md` | 192–204 | D01-D09各式/閾値。今回の4 inputのsuccess率とKPIを混同しない |
| C16 | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` | 102–113 | INT010配置候補/011同条件比較、割当はOS/未評価維持 |
| C17 | `docs/helix-labo/L2-requirements/labo-requirements.md` | 151–154 | LABO055作業種別/model classの水準。選定/割当をしない |

## 残作業

- 33入力のうちFR19と今回4入力の比較を記録したが、28入力の比較と各入力の全consumer閉包が残る。
- 4入力の全正式source atom被覆receipt/successor/旧status変更は未成立。
- 旧5hook個別意味・4axis詳細、actual pricing/telemetry供給、rebuild/consumer既存row表示/失効、同意撤回時の扱いを更に照合する。
- OS005/007/012/013全atom、双方停止、再送/重複/欠測/取消、物理repo/server判断条件、全data ownership、判断packetは未完。

raw row/carry record・未注釈contextを保持。文字保全は意味被覆receiptではない。candidate successorは全件空。canonical/MPR/holding/Binding/Issue本文は無変更、#2089と#1861はOPENを維持する。旧runtime/test/CIは実行しない。
