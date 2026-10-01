# confirmed175 BR-01・BR-06・BR-08・D-01〜D-07 固定F6条件照合

- 比較base: `origin/main` `50686b6762788574cb471967e8c24846d3dd56ae`。
- 優先集合: `confirmed175-live-recount-2026-10-01.json` at `08156a3b71ad97065cef34357dc37f6953b9a7f8` の先頭10件を記載順に選択。
- 固定比較先: PO判断 `HDEC-HARNESS-REQUIREMENTS-2026-09-28` の `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 SHA-256 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、L11 SHA-256 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`。
- 読取専用、`authority_effect: none`。10件すべて`preserved_pending_rehome`、successor 0、source atom closure 0。採択、retire、意味変更、実装・受入、Step 5完了を主張しない。

## 照合範囲

照合先は固定revisionのHELIX-HARNESS L2/L11だけである。本文中の「固定F6で未一致」「残差」は、このHARNESS pairに対する結果を指す。HELIX-OS、HELIX-SECURITY、HELIX-INFRASTRUCTUREその他の機構の現行L2/L11は全探索していない。したがって、他機構での一致・不一致や未配置を結論せず、owner、配置先、候補・正式successorも推定しない。

## 入力との関係

live recountはBR-01を優先集合に残すが、同じorigin/mainに先行BR-01個票がある。本監査はその個票を読み、結論を照合した。BR-01 source conditionとF6 pairを再確認した。D-01〜D-07は旧KPI grouped auditを確認し、同監査が固定F6でのidentity別比較を0件としていたため、identity単位で原文条件・固定pairの近接条件・残差を分けた。

旧asset `LEGACY-ASSET-9F48ADEEB477DCA54039` のledger行330は`source_snapshot_preservation`、product target unresolved、source authority confirmed、target authority draft_candidate、carry `preserved_pending_rehome`、successorなし。旧source file SHA-256は `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61`。同名IDから統合・後継を推定しない。

## identity別の照合

### BR-01

- identity: `harness/L1-requirements/business-requirements.md::BR-01`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:41`
- SHA-256: file `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61` / line `eea2c595f0f92bc8fbacd8c06e912db0438567da39979ecba646ca12302786fc`
- 原文: | **BR-01** | 設計⇔実装⇔テストの整合を機械強制し、AI 委譲しても回帰が壊れず **1 案件を L0-L14 通しで回せる** | concept P1 / 成功① ③ |
- 条件atom: 設計・実装・テストの整合を機械強制する；AI委譲時も回帰を壊さない；1案件を旧L0–L14通しで扱える
- 固定F6の近接条件: 現行L1–L12の工程と正規V-pair、L2/L11とL3/L10、L2.5の非適用区別を保持する。L0は層外anchor。 (L2:52; L11:21) 工程状態とpair照合、変更影響から設計/testと再検証範囲を導き、oracle・expected failure・証拠・省略検査の回収を扱う。 (L2:54–56; L11:23–25) Version 1について複数対象と7サービスの成立条件を扱う。旧「1案件」と同じidentity別の受入oracleではない。 (L2:58; L11:27) 一対象の要求から運用保守への端から端traceを扱う。旧L0–L14の単一案件受入結果は示さない。 (L2:438–445; L11:216)
- 残差: 全projectで設計/実装/test traceが完全かを判定するBR-01専用oracleがない。 AI委譲後の回帰fixture、failure/output schema、閾値はない。 単一案件end-to-end受入結果はない。旧L0–L14は現行番号へ移さない。
- 失敗／negative oracle: 固定L11:21,23–25にはpair欠落、未合意/未検証進行、検証漏れ等の一般条件がある。BR-01専用fixture/oracleはなく、旧行にも数値閾値・個別failure caseはない。
- 結果: `partial_identity_condition_match`。successorなし、closureなし。

### BR-06

- identity: `harness/L1-requirements/business-requirements.md::BR-06`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:46`
- SHA-256: file `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61` / line `922b879b38c92d8b9a0e6ff3ccd2e0f6b0f2dd6470dd5b54c4180f5ba750b033`
- 原文: | **BR-06** | 複数プロダクト / 案件の工程表・進捗を **リアルタイムに横断可視化する専用 UI ダッシュボード**を提供する (実装アーキテクチャ = サーバー / DB 形式は §5 → L2/L4) | ダッシュボードヒアリング / 成功④ |
- 条件atom: 複数product/projectを横断；工程表・進捗をリアルタイム可視化；専用UI dashboard；server/DB形式は§5→L2/L4送り（技術固定でない）
- 固定F6の近接条件: 提供範囲・複数製品・統合traceという隣接条件はあるがdashboardではない。 (L2:57–58; L11:26–27) 要求変更から設計/test traceを導くが進捗のリアルタイム集約は定めない。 (L2:55; L11:24)
- 残差: 横断工程表、進捗一覧、専用UI dashboardなし。 更新間隔/freshness、表示対象、利用者oracleなし。 server/DBはsourceの未決技術選択であり移管条件にしない。
- 失敗／negative oracle: 固定F6 L2/L11にdashboard success/failureやstale-progress oracleなし。隣接L2条件から補わない。
- 結果: `adjacent_partial_match_dashboard_unmatched`。successorなし、closureなし。

### BR-08

- identity: `harness/L1-requirements/business-requirements.md::BR-08`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:48`
- SHA-256: file `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61` / line `45c182bcd3eb0eb9261eb2de58c12dca8c1a4e1de60f4d4c0263fa4ccc631c2f`
- 原文: | **BR-08** | **doc 品質の継続レビュー** — doc 品質専用の read-only reviewer (doc-reviewer、pmo-sonnet とは責務分離) を持ち、大規模 doc 改定・gate evidence 提出・pair freeze の前に必須召喚する | v2 BR-11 翻案 |
- 条件atom: doc品質の継続review；doc専任read-only reviewer；PMOとの責務分離；大規模doc改定・gate evidence・pair freeze前の必須召喚
- 固定F6の近接条件: 工程条件とPR前の検証義務・証拠・差戻し先の一般契約。専任reviewerや発動条件なし。 (L2:54,56; L11:23,25)
- 残差: doc専任reviewerとPMOからの独立性なし。 三発動場面の必須review、結果、品質oracleなし。
- 失敗／negative oracle: L11:23–25はdoc reviewer不在を拒否する条件ではない。固定pairにdoc-reviewer、文書品質reviewer、trigger前専用gateなし。
- 結果: `adjacent_partial_match_dedicated_review_unmatched`。successorなし、closureなし。

### D-01

- identity: `harness/L1-requirements/business-requirements.md::D-01`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:196`
- SHA-256: file `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61` / line `7a64579a7cf085b81d2d7306ea672943f0b222f144f61dac159502818d37ba31`
- 原文: | **D-01** | PLAN 起票数/sprint | sprint 期間中に起票された PLAN 件数 | ≥ 1 件/sprint | `.helix/plan_registry/` / `helix plan list` |
- 条件atom: PLAN 起票数/sprint；sprint 期間中に起票された PLAN 件数；threshold ≥ 1 件/sprint；source-declared consumer `.helix/plan_registry/` / `helix plan list`
- 固定F6の近接条件: ticket/change/riskに応じたverification obligation、oracle、evidence、省略条件と後続回収を定める一般契約。個別KPI式・閾値は列挙しない。 (L2:56, 118–123; L11:25, 46–52) 段階別oracle/evidenceとAccepted境界を定める一般契約。個別KPI式・閾値は列挙しない。 (L2:447–461; L11:217)
- 残差: 固定F6 pairにsprintごとのPLAN数KPIの母集団、起票event、期間、例外、owner、metric oracleがない。 旧target ≥1件/sprintの採否または変更判断なし。source identityはpreserved_pending_rehome、successorなし。
- 失敗／negative oracle: 固定L2/L11はsprintにPLANがない場合をfail/warn/非適用のどれにするか判定しない。
- 結果: `identity_specific_kpi_unmatched`。successorなし、closureなし。

### D-02

- identity: `harness/L1-requirements/business-requirements.md::D-02`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:197`
- SHA-256: file `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61` / line `bb5adc7a3bbb3bebf67cd03691f770b65e546c4f1d4849e394c0ef3c23d6f79a`
- 原文: | **D-02** | gate 通過率 | gate pass 件数 / gate 総実行件数 × 100 | ≥ 90 % | `.helix/gate_runs/` / `helix gate log` |
- 条件atom: gate 通過率；gate pass 件数 / gate 総実行件数 × 100；threshold ≥ 90 %；source-declared consumer `.helix/gate_runs/` / `helix gate log`
- 固定F6の近接条件: ticket/change/riskに応じたverification obligation、oracle、evidence、省略条件と後続回収を定める一般契約。個別KPI式・閾値は列挙しない。 (L2:56, 118–123; L11:25, 46–52) 段階別oracle/evidenceとAccepted境界を定める一般契約。個別KPI式・閾値は列挙しない。 (L2:447–461; L11:217)
- 残差: 固定F6 pairにgate種別・母集団・期間・取消/再実行・分母・event source・ownerの個別計測契約がない。 target ≥90%と評価結果を固定F6 pairに確認できない。source identityはpreserved_pending_rehome、successorなし。
- 失敗／negative oracle: HARNESS-L2-005/022の一般的なverification/oracle/evidence契約は、90%未達を判定するD-02固有の運用goal oracleではない。
- 結果: `identity_specific_kpi_unmatched`。successorなし、closureなし。

### D-03

- identity: `harness/L1-requirements/business-requirements.md::D-03`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:198`
- SHA-256: file `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61` / line `01eba392cbe0511496b5a0fd51b05f01387669f39a48dda4914cb875c389dd76`
- 原文: | **D-03** | V-model 順序遵守違反 | 前工程未完了で後工程着手した検知件数 | 0 件 | `helix doctor` / `helix plan lint` |
- 条件atom: V-model 順序遵守違反；前工程未完了で後工程着手した検知件数；threshold 0 件；source-declared consumer `helix doctor` / `helix plan lint`
- 固定F6の近接条件: ticket/change/riskに応じたverification obligation、oracle、evidence、省略条件と後続回収を定める一般契約。個別KPI式・閾値は列挙しない。 (L2:56, 118–123; L11:25, 46–52) 段階別oracle/evidenceとAccepted境界を定める一般契約。個別KPI式・閾値は列挙しない。 (L2:447–461; L11:217)
- 残差: 固定F6 pairは前工程未完了の後工程着手違反数固有の母集団・source event・期間・例外・閾値評価oracleを定めない。旧sourceに記されたtarget/式の保持・変更のdecisionも本監査では生成しない。 source identityはpreserved_pending_rehome、successorなし、closureなし。
- 失敗／negative oracle: 固定pairの一般的な工程、trace、verification条件はこのidentityのKPI式・閾値・failure判定を満たす根拠に数えない。
- 結果: `identity_specific_kpi_unmatched`。successorなし、closureなし。

### D-04

- identity: `harness/L1-requirements/business-requirements.md::D-04`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:199`
- SHA-256: file `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61` / line `b02f2f37342ef167a26a4cdfd213197641a026b642277e86964987278f6868bd`
- 原文: | **D-04** | 回帰検出率 | テストで検出した回帰件数 / 回帰発生総件数 × 100 | ≥ 80 % | CI gate / `helix trace` |
- 条件atom: 回帰検出率；テストで検出した回帰件数 / 回帰発生総件数 × 100；threshold ≥ 80 %；source-declared consumer CI gate / `helix trace`
- 固定F6の近接条件: ticket/change/riskに応じたverification obligation、oracle、evidence、省略条件と後続回収を定める一般契約。個別KPI式・閾値は列挙しない。 (L2:56, 118–123; L11:25, 46–52) 段階別oracle/evidenceとAccepted境界を定める一般契約。個別KPI式・閾値は列挙しない。 (L2:447–461; L11:217)
- 残差: 固定F6 pairはregression検出率固有の母集団・source event・期間・例外・閾値評価oracleを定めない。旧sourceに記されたtarget/式の保持・変更のdecisionも本監査では生成しない。 source identityはpreserved_pending_rehome、successorなし、closureなし。
- 失敗／negative oracle: 固定pairの一般的な工程、trace、verification条件はこのidentityのKPI式・閾値・failure判定を満たす根拠に数えない。
- 結果: `identity_specific_kpi_unmatched`。successorなし、closureなし。

### D-05

- identity: `harness/L1-requirements/business-requirements.md::D-05`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:200`
- SHA-256: file `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61` / line `2dbedc2052c3e3fece7feeae67e88906681f77f05e09f1ed9904734179c93500`
- 原文: | **D-05** | 4 artifact trace 整合率 | trace 整合 PLAN 件数 / 全 PLAN 件数 × 100 | ≥ 95 % | `helix trace check` / `.helix/artifact/trace/` |
- 条件atom: 4 artifact trace 整合率；trace 整合 PLAN 件数 / 全 PLAN 件数 × 100；threshold ≥ 95 %；source-declared consumer `helix trace check` / `.helix/artifact/trace/`
- 固定F6の近接条件: ticket/change/riskに応じたverification obligation、oracle、evidence、省略条件と後続回収を定める一般契約。個別KPI式・閾値は列挙しない。 (L2:56, 118–123; L11:25, 46–52) 段階別oracle/evidenceとAccepted境界を定める一般契約。個別KPI式・閾値は列挙しない。 (L2:447–461; L11:217)
- 残差: 固定F6 pairは4-artifact trace整合率固有の母集団・source event・期間・例外・閾値評価oracleを定めない。旧sourceに記されたtarget/式の保持・変更のdecisionも本監査では生成しない。 source identityはpreserved_pending_rehome、successorなし、closureなし。
- 失敗／negative oracle: 固定pairの一般的な工程、trace、verification条件はこのidentityのKPI式・閾値・failure判定を満たす根拠に数えない。
- 結果: `identity_specific_kpi_unmatched`。successorなし、closureなし。

### D-06

- identity: `harness/L1-requirements/business-requirements.md::D-06`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:201`
- SHA-256: file `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61` / line `af85a9b45b798a26c57653d44c86e10b12c636d2b52d39363d6cde22f2be6d16`
- 原文: | **D-06** | agent guard bypass 件数 | `HELIX_ALLOW_RAW_AGENT=1` 実行件数 (audit 記録) | 0 件 目標 (PO 承認時のみ許容) | `.helix/audit/` / agent-guard log |
- 条件atom: agent guard bypass 件数；`HELIX_ALLOW_RAW_AGENT=1` 実行件数 (audit 記録)；threshold 0 件 目標 (PO 承認時のみ許容)；source-declared consumer `.helix/audit/` / agent-guard log
- 固定F6の近接条件: ticket/change/riskに応じたverification obligation、oracle、evidence、省略条件と後続回収を定める一般契約。個別KPI式・閾値は列挙しない。 (L2:56, 118–123; L11:25, 46–52) 段階別oracle/evidenceとAccepted境界を定める一般契約。個別KPI式・閾値は列挙しない。 (L2:447–461; L11:217)
- 残差: 固定F6 pairはagent guard bypass件数固有の母集団・source event・期間・例外・閾値評価oracleを定めない。旧sourceに記されたtarget/式の保持・変更のdecisionも本監査では生成しない。 source identityはpreserved_pending_rehome、successorなし、closureなし。
- 失敗／negative oracle: 固定pairの一般的な工程、trace、verification条件はこのidentityのKPI式・閾値・failure判定を満たす根拠に数えない。
- 結果: `identity_specific_kpi_unmatched`。successorなし、closureなし。

### D-07

- identity: `harness/L1-requirements/business-requirements.md::D-07`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:202`
- SHA-256: file `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61` / line `459333adac014e170188f49bfd6365e770381db86413410078654a4a9560300d`
- 原文: | **D-07** | AI 委譲時間率 | AI 委譲タスク工数 / 総開発工数 × 100 | ≥ 70 % | PLAN `drive:` 集計 / `helix status` |
- 条件atom: AI 委譲時間率；AI 委譲タスク工数 / 総開発工数 × 100；threshold ≥ 70 %；source-declared consumer PLAN `drive:` 集計 / `helix status`
- 固定F6の近接条件: ticket/change/riskに応じたverification obligation、oracle、evidence、省略条件と後続回収を定める一般契約。個別KPI式・閾値は列挙しない。 (L2:56, 118–123; L11:25, 46–52) 段階別oracle/evidenceとAccepted境界を定める一般契約。個別KPI式・閾値は列挙しない。 (L2:447–461; L11:217)
- 残差: 固定F6 pairはAI委譲時間率固有の母集団・source event・期間・例外・閾値評価oracleを定めない。旧sourceに記されたtarget/式の保持・変更のdecisionも本監査では生成しない。 source identityはpreserved_pending_rehome、successorなし、closureなし。
- 失敗／negative oracle: 固定pairの一般的な工程、trace、verification条件はこのidentityのKPI式・閾値・failure判定を満たす根拠に数えない。
- 結果: `identity_specific_kpi_unmatched`。successorなし、closureなし。

## 検証範囲と限界

旧source line SHAはarchive bytesから再計算した。固定pair file SHAはF6 commitのblob bytesから計算し、行locatorも同じ固定blobを対象にした。比較は文書・ID・参照・責務境界に限定した。D-01〜D-07の旧式・threshold・consumer pathは原文保持情報であり、現行の実行先や採用KPIへ移していない。

旧CLI、workflow、hook、adapter、runtime、test、CI、実行可能archive codeは起動していない。静的確認ではJSON parse、優先順、source file/line SHA、F6 L2/L11 file SHA、git diff整合を確認する。
