# HELIX-INTELLIGENCE L3 業務要件（Stage 2a）

状態: PO L3承認前の起草候補。機構固有の業務要件のみを固定採択L2の意味から整理し、実装済み・業務成果成立とは扱わない。

旧HELIXの3 sub-doc分離（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16-28`、LEGACY-ASSET-9A772391C7FB1298D45F）と業務詳細を機能詳細から分けた形（`business-detail.md:21-39,84-104`、LEGACY-ASSET-A6E2C7F0565E5F804F06）を起点にする。再導出するのは、業務目的・評価owner・責任境界を明示し機能要件と重複しない形式である。旧HARNESSのLearning Engine、PLAN単位評価、旧KPI/score/自動適用や承認動作はINTELLIGENCEへ移さない。

## BR-INT-010 — 根拠付きtask別配置提案

固定親 `HELIXINTELLIGENCE-L2-010`（version target 1.0）の業務上の成果は、task属性と適用scope内の実績に基づく配置候補を作り、根拠・除外・未評価を明らかにすること。実assignment・進行はOS、観測実績/HELIX-Bench評価はLABO、候補判断はINTELLIGENCEの責務として分ける。候補が無い、または根拠が不足するときは、確定配置を作らず親のL2で指定したownerへ戻す。

Acceptance/evidenceは `functional-requirements.md` のFR-INT-010およびAC-INT-010-01〜07、`../L10-verification/functional-verification.md` のCASE-INT-010-01, CASE-INT-010-05, CASE-INT-010-06, CASE-INT-010-02a〜02j, CASE-INT-010-03a〜03b, CASE-INT-010-04a〜04kを正本とする。ここでは新しいbusiness owner、成功KPI、配置決定、候補選択gateを追加しない。proposal自体からOS assignmentや実行許可を生成しない。

## BR-INT-066 — 人代行時もproposalとassignmentを分離

固定親 `HELIXINTELLIGENCE-L2-066`（version target 1.0）の業務上の成果は、INT runtimeが使えない経路でも人の暫定案を既存L2-010 proposal contractに沿って入力・受領可能にし、originと根拠の状態を保つこと。人手案がINTの生成物や評価実績と誤認されず、OSの受領・別個のassignment判断と、LABOの評価責務を侵さないことを示す。

Acceptance/evidenceは `functional-requirements.md` のFR-INT-066およびAC-INT-066-01〜08、`../L10-verification/functional-verification.md` のCASE-INT-066-01、CASE-INT-066-02、CASE-INT-066-03a、CASE-INT-066-03b、CASE-INT-066-03c、CASE-INT-066-04a、CASE-INT-066-04b、CASE-INT-066-04c、CASE-INT-066-04d、CASE-INT-066-05a〜05t、CASE-INT-066-06a〜06f、CASE-INT-066-07、CASE-INT-066-08a、CASE-INT-066-08bを正本とする。人代行入力はINT実装稼働の前提ではなく、新規のmanual approval段階も追加しない。

## 旧sourceとの差分

旧README上のfunctional/business/NFR三分割を完全一致再利用せず、現行固定L2にbusiness独立条件がある場合だけこの文書に記録する。旧business-detailの他機構固有内容・旧自動更新案は置換・除外した。版、owner、scopeの上流意味は固定L2/L11を保持する。


## Stage 2c — 068/075の起草範囲とsource

状態: 以下のStage 2c追補はL3未承認の起草候補・未実行の検証設計である。上のStage 2a本文とその承認範囲を変更しない。対象は採択済みHELIXINTELLIGENCE-L2-068/075に限る。旧source起点・項目別の再導出/置換は各項目と時点監査に記録する。

状態: L3未承認（委任承認前）の起草候補。機構固有の業務要件のみを固定採択L2の意味から整理し、実装済み・業務成果成立とは扱わない。

旧HELIXの3 sub-doc分離（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16-28`、LEGACY-ASSET-9A772391C7FB1298D45F）と業務詳細を機能詳細から分けた形（`business-detail.md:21-39,84-104`、LEGACY-ASSET-A6E2C7F0565E5F804F06）を起点にする。再導出するのは、業務目的・評価owner・責任境界を明示し機能要件と重複しない形式である。旧HARNESSのLearning Engine、PLAN単位評価、旧KPI/score/自動適用や承認動作はINTELLIGENCEへ移さない。

対象は採択済み `HELIXINTELLIGENCE-L2-068` と `HELIXINTELLIGENCE-L2-075`。この追補は承認済みStage 2aの010/066範囲を変更しない。項目別sourceと再導出は時点監査へ記録する。


## Stage 2c — L2-068の業務要件範囲

固定親 `HELIXINTELLIGENCE-L2-068` は独立した業務outcome ownerやbusiness metricを定めないため、この親のBRは起草せず、business acceptance CASEも追加しない。Stage 2cの機能受入・検証の正本は `FR-INT-068` の `AC-INT-068-01`〜`AC-INT-068-06` と、functional L10の `CASE-INT-068-01`〜`CASE-INT-068-11` とする。承認済みStage 2aのBR-INT-010/066は各固定親の範囲に留まり、このStage 2c scopeのowner・KPI・gateを生成しない。


## Stage 2c — L2-075の業務範囲

固定親 `HELIXINTELLIGENCE-L2-075` はproposal identityとqualification handoffの機能条件を持つが、独立business outcome・business owner・business metricを追加で定めない。そのためBR-INT-075およびbusiness CASEは起草せず、受入/evidenceは `FR-INT-075` の `AC-INT-075-01`〜`AC-INT-075-06` とfunctional L10の `CASE-INT-075-01`〜`CASE-INT-075-09` を参照する。承認済みStage 2aのBR-INT-010/066とL2-068の業務範囲を075へ広げない。


## Stage 5 — business outcome scope (INTELLIGENCE 9親)

状態: L3未承認の起草候補。旧L3のbusiness-detail分離形を起点とし、固定L2/L11が独立のbusiness outcome owner/metricを置く場合だけBR化する。今回の9親はfunction/acceptance/evidence ownershipを定めるが、独立事業KPIや成果閾値を定めないため新しいBR・business metric・Business CASEを追加しない。

| 固定親 | 機能上の対象 | BR/business CASE | 正本trace |
|---|---|---|---|
| `HELIXINTELLIGENCE-L2-060` | 依存/停止条件付きplan candidateからOS ticketへ | 独立BRなし | `FR-INT-060` / `AC-INT-060-*` / `CASE-INT-060-*` |
| `HELIXINTELLIGENCE-L2-061` | LABO evidence→INT placement proposal→OS assignment | 独立BRなし | `FR-INT-061` / `AC-INT-061-*` / `CASE-INT-061-*` |
| `HELIXINTELLIGENCE-L2-062` | repairの四段階別evidenceとOS acceptance input | 独立BRなし | `FR-INT-062` / `AC-INT-062-*` / `CASE-INT-062-*` |
| `HELIXINTELLIGENCE-L2-063` | LABO/BRAIN/INTELLIGENCE/OS/HARNESS別ownerを維持したloop | 独立BRなし | `FR-INT-063` / `AC-INT-063-*` / `CASE-INT-063-*` |
| `HELIXINTELLIGENCE-L2-069` | source-bound finite model calculation | fixture算術は技術oracleで、business KPIではない | `FR-INT-069` / `AC-INT-069-*` / `CASE-INT-069-*` |
| `HELIXINTELLIGENCE-L2-070` | CORE→INT→LABO receipt stages | 独立BRなし | `FR-INT-070` / `AC-INT-070-*` / `CASE-INT-070-*` |
| `HELIXINTELLIGENCE-L2-071` | scenario comparison and downstream evidence receipt | fixed fixture oracle only | `FR-INT-071` / `AC-INT-071-*` / `CASE-INT-071-*` |
| `HELIXINTELLIGENCE-L2-074` | LABO-evaluated feedback used in later proposal | 独立BRなし | `FR-INT-074` / `AC-INT-074-*` / `CASE-INT-074-*` |
| `HELIXINTELLIGENCE-L2-077` | selected qualified delta evidence, non-authoritative candidate | 独立BRなし | `FR-INT-077` / `AC-INT-077-*` / `CASE-INT-077-*` |

LABO評価、OS assignment/acceptance、source owner判断、consumer受領をbusiness outcomeへ先取りしない。技術oracle、提案数、試験pass、候補採択から業務成果を生成しない。
