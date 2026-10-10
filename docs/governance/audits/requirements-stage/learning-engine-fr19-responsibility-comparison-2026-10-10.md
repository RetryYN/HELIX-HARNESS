# 旧FR-L1-19 Learning Engineの責務比較

基準main `1daf2b74b78ae89b4549d262fb71264cdd391bf8`、authority_effect: none。JSONは[learning-engine-fr19-responsibility-comparison-2026-10-10.json](learning-engine-fr19-responsibility-comparison-2026-10-10.json)、SHA-256 `bf711fea488436d9bc6a9040b19ffa91803017b9257914f38654865b2a5aac27`。

FR-L1-19の全L1 rowを24候補atomへ比較。関連consumer14区間は限定照合であり、全source閉包/旧HIL系列全量比較/正式atomization queue消込ではない。

## 24条件と未解決の辺

| atom | 保持する原文条件 | 分類候補 | 現行との比較／未解決 | 根拠 |
|---|---|---|---|---|
| FR19-A01 | 成功実行 recipe 蓄積 | split | 原event保全OS、事例/評価LABO、汎用知識候補BRAINを分ける。recipe identity/採用条件の全対応は未証明。 | N01,N04,N06,N11 |
| FR19-A02 | 頻出トラブル予防ルール化 | LABO候補 | LABOはsystem/operation候補と効果を評価し、規則を自己適用しない。旧予防ruleの各target/fixtureは未対応。 | N05,N06,N08 |
| FR19-A03 | スキル推薦改善 | split | 推薦の長期効果LABOと現状への候補判断INTを区分。既存Skillへの更新方式/義務は未移管。 | N05,N06,N10 |
| FR19-A04 | L 単位注入更新 | unresolved | 工程L別注入の正本/consumer/更新規則を現行generic候補へ丸めない。HARNESS工程義務とSkill供給の対応が必要。 | N01,N06,N11 |
| FR19-A05 | feedback_hook 5 軸 | connection | 旧hook5軸の個別定義とsource接続は未閉包。OS原記録とLABO許可観測を分け、旧hookを起動しない。 | O02,N01,N04 |
| FR19-A06 | skill 発火ログ | OS保持 | 発火事実のwriter/sourceは運転側。LABO観測へ渡す許可/版/receiptを別に確認する。 | N01,N04 |
| FR19-A07 | recovery-log | OS保持 | 復旧/未完義務の原記録はOS、分析用写像はLABO。復旧責任を移さない。 | N01,N04 |
| FR19-A08 | interrupt 履歴 | OS保持 | 割込の原事実とcontinuationをOSに残す。評価用のepisode化で原事実を上書きしない。 | N01,N04 |
| FR19-A09 | detector 結果 | connection | 検出結果/対象revision/未実行をsource側で保持し、許可観測として渡す。結果だけでrule変更/acceptanceなし。 | N01,N04,N07 |
| FR19-A10 | recipe (pattern_key 付き) | unresolved | pattern_keyの同一性/重複/recipe storeへのexact bindingを一般provenance契約だけで充足したことにしない。 | N04,N06,N09 |
| FR19-A11 | 予防ルール | LABO候補 | 出力cellの予防ルールを入力目的とは別参照で保持。candidate→target変更→再評価の未成立辺を残す。 | N05,N06 |
| FR19-A12 | 推薦精度改善 | LABO候補 | 実験scope/oracle/baselineと変更後再観測が必要。推薦件数/登録数を効果にしない。 | N05,N08,N14 |
| FR19-A13 | スキル破棄・改修自動化を含む | split | 廃止candidate、通常改修、削除という異なる作用を分ける。通常AI自律の保持と不可逆削除の人間境界を混同しない。 | O04,N05,N06,N08 |
| FR19-A14 | skill_rating 閾値以下を廃止候補としてフラグ | LABO候補 | 閾値以下は廃止候補flagであり削除ではない。関連受入30日<0.5をO04に保全し、現行閾値として採用しない。 | O04,N05,N06 |
| FR19-A15 | 削除は人間確認必須 (F6=a、CLAUDE.md destructive 禁止事項) | unresolved | 原削除境界を保持。LABO評価/OS登録/INT推薦だけでは削除を成立させない。通常更新に毎回承認を拡張しない。 | O04,N06 |
| FR19-A16 | ログ型失敗/成功蓄積 (event-sourced recipe log) を recipe store 実装方式として明記 | split | 成功/失敗を両方残す意味と旧実装方式を分ける。event-sourced保存方式を無断継承/retireしない。 | O13,N01,N04,N08 |
| FR19-A17 | 「失敗を仕組みに変換」原則 (L0 §1.4) | LABO候補 | system化だけを最大化せずoperation候補を残す。旧原則の意味を本照合から変更しない。 | N05,N09 |
| FR19-A18 | GitHub PR / GHA / job summary から失敗 event を pull | connection | 自身の許可運転観測と外部source2.0を区別。GitHubという語だけで全入力を2.0へ延期しない。pull/collectorの専用契約は未特定。 | N01,N07,N08 |
| FR19-A19 | 失敗種別の集計・同種反復検出 | LABO候補 | source付きepisode/反復を比較し、相関だけで因果確定しない。旧種別/反復窓の全consumer対応は未証明。 | N04,N05,N06 |
| FR19-A20 | 再発防止 PLAN 自動提案へ接続する | split | LABOFeedback候補→OS登録/routing/ticket→target変更を分ける。旧自動提案を即時PLANedit/approveと読まない。 | O07,N01,N06,N08 |
| FR19-A21 | 本人/AI roster 共有 audit。failure_log local とは分離 L0 §8.5 | connection | 共有auditとlocal failure_logの別source/consumerを保持。原記録同一化/全ログ投入は禁止と断定追加せず、具体scopeを未判断に残す。 | N01,N04 |
| FR19-A22 | escalation L0-L3 §8.3 の入力経路 | unresolved | 旧L0-L3から現行層番号への機械写像をしない。論点/判断先/失敗時戻し先の個別比較が残る。 | N01,N06 |
| FR19-A23 | P1 | unresolved | P1とPhase B carryを保持。現行1.0/2.0/3.0をこの照合で指定しない。 | O03 |
| FR19-A24 | HM-08 / GD-01 | unresolved | HM08の30秒poll/状態/未実装とGD01の静的/PhaseB半自動を別に残す。評価projection実装を画面/engine全実装にしない。 | O10,O11,O12 |

## consumerと旧判断の確認

- F01: FR36/38/43 projection実装の主張とFR19 Phase B carryが並存。全Learning Engine完成へ昇格しない。（O03,O05,O12）
- F02: 通常改善自動適用可/人間residueと旧TL説明の「半自動=提案+人間承認」に緊張がある。本文別原文を保持し、人間の上流意味の変更/新毎回承認を作らない。（O04）
- F03: G14 AND 直近sprint D07>=50%（最終目標>=70%）とPII redaction/model opt-inを保持。現行着手許可にしない。（O05,O13）
- F04: U-FR-L1-19はprojection/feedback consumerでありrecipe/注入/自動改善全体の受入範囲とは確認できない。旧greenは実行/代用しない。（O07,O08,O09）
- F05: HIL promotionのfixture/shadow/effect/rollbackやRCLS候補は関連sourceであり、名称類似だけでFR19と同一identity/被覆完了にしない。HIL10入力の比較は別途残る。（O14,N09,N15）
- F06: 自身のPR/GHA失敗観測1.0の接続候補と外部Issue/PR知識取得2.0をsource用途で区分。全GitHub入力を外部知識へ丸めない。（N07,N08）

## 原文・参照区間

| 根拠 | path | 行 | 確認対象 |
|---|---|---|---|
| O01 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md` | 50–50 | FR-L1-19の全table row |
| O02 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md` | 112–112 | 5軸feedback_hookの旧runtime参照。実行しない |
| O03 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md` | 732–739 | P1・Phase B carry、telemetry整備後本実装 |
| O04 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md` | 84–104 | 通常改善のAI自律と高影響人間residue、削除はPO専属。旧内部文言の緊張も保全 |
| O05 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md` | 147–177 | projection slice実装記録とHM08/改善loop carry、G14 AND 直近sprint D07>=50%、PII/opt-in |
| O06 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L4-basic-design/function.md` | 334–343 | guardはLearning非依存、Phase A記録とPhase B学習を分ける |
| O07 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/function-spec.md` | 244–244 | feedback eventはPLANをedit/approveしない |
| O08 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/fr-unit-coverage.md` | 55–55 | learning input集約のU-FR-L1-19参照であり全engineの受入ではない |
| O09 | `archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L7-unit-test-design.md` | 790–802 | projection oracle familyのconsumer。旧greenは現行受入にしない |
| O10 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md` | 221–230 | HM08データ/操作/30秒poll/状態/未実装 |
| O11 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md` | 246–266 | GD01カテゴリ/操作/静的とPhase B半自動更新 |
| O12 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md` | 279–282 | BR21の36/38/43実装をFR19全体へ広げない |
| O13 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/technical-requirements.md` | 93–94 | recipe_store/accuracy_score、Phase B AND条件のconsumer |
| O14 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/memory-learning-promotion.md` | 34–65 | 別HIL系列のpure boundary/fixture/shadow/effect/rollback/authority。FR19との同一性は未確定 |
| N01 | `docs/helix-os/L2-requirements/governance-requirements.md` | 58–60 | OS005登録/振分け、007原証拠/ログ |
| N02 | `docs/helix-os/L2-requirements/governance-requirements.md` | 65–66 | OS012/013移管案内と原記録OS007残存 |
| N03 | `docs/helix-os/L11-acceptance/governance-acceptance.md` | 39–41 | 未計測/誤推薦/旧版、同意/data class/retention/scope不足の拒否 |
| N04 | `docs/helix-labo/L2-requirements/labo-requirements.md` | 71–79 | LABO001許可観測、sourceauthority非移管、欠測保留 |
| N05 | `docs/helix-labo/L2-requirements/labo-requirements.md` | 110–125 | LABO006実験/007system化候補、Worker割当はOS |
| N06 | `docs/helix-labo/L2-requirements/labo-requirements.md` | 132–149 | LABO009一般化/010Feedback、登録はOS/変更targetowner |
| N07 | `docs/helix-labo/L2-requirements/labo-requirements.md` | 234–238 | LABO029CI/test受取、stale/未実行非pass |
| N08 | `docs/helix-labo/L2-requirements/labo-requirements.md` | 296–307 | LABO050内部循環と051外部2.0別 |
| N09 | `docs/helix-labo/L2-requirements/labo-requirements.md` | 343–352 | RCLS等はcandidate状態を保持、重複新学習機構を作らない |
| N10 | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` | 145–165 | 現在判断と長期効果/BRAIN/製品meaning/3.0学習の境界 |
| N11 | `docs/helix-brain/L2-requirements/brain-requirements.md` | 150–160 | BRAIN知識promotionはLABO評価/OS登録/独立検証/採否別 |
| N12 | `docs/helix-labo/L11-acceptance/labo-acceptance.md` | 45–54 | LABO001/006/007/009/010の反例 |
| N13 | `docs/helix-labo/L11-acceptance/labo-acceptance.md` | 80–80 | LABO029許可/対象版/stale拒否 |
| N14 | `docs/helix-labo/L11-acceptance/labo-acceptance.md` | 100–100 | LABO050登録/CI成功だけでは改善完了しない |
| N15 | `docs/helix-labo/candidates/improvement-research-requirements.md` | 36–65 | RCLS候補6件と受入、候補状態 |

## 残作業

- 残る32名指し入力と現OS005/007/012/013全atom比較。今回の個別FR19照合を33入力完了にしない。
- 旧feedback5軸の個別定義、failure_log/共有audit、L0§8.3/8.5のsource全文と実consumer閉包。
- 後段HIL source・全test/code consumer・consumerからconsumerの辺は今回閉包していない。
- OS/LABO双方停止、再送/重複/欠測/取消全受入、物理repo/server判断条件、全dataのretention/write/adoption表。
- 採用対象revisionとの差分確認を原source atomごとの正式被覆/判断packetへ進める。候補関係をsuccessorへ自動変換しない。

文字保全のlost=0は原文保全の検査だけで、意味移管・全consumer被覆の証拠ではない。旧carry recordは不変。候補atomのsuccessorは全件空。canonical・MPR・holding・Binding・Issue本文は変更せず、#2089はOPENを保持する。
