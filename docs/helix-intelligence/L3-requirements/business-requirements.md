# HELIX-INTELLIGENCE L3 業務要件

> **本書の範囲（2026-10-07追記）**：題名にあった「Stage 2a」は、本書で最初に起草した節の範囲である。本書には、その後のStageの節（Stage 2c、Stage 3、Stage 4、Stage 5）が追補されている。各節の対象親、対象revision、判断状態は[L3／L10 PO事後確認一覧](../../governance/l3-l10-po-post-confirmation.md)と各判断記録を正とする。冒頭の状態の記述は、最初の節を起草した時点のものとして読む。本追記は範囲の表示だけを直し、要件・検証の意味、ID、承認状態を変えない。

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


## Stage 4 — 業務上の独立成果なし

固定親HELIXINTELLIGENCE-L2-017/030–041/044/045は接続・source handoff・境界保持・candidateを定め、独立業務成果やKPIを定めない。従って新BR、業務owner、business pass gateは追加しない。確認はfunctional ACと固定L11 R2187-01の当該行を参照する。

| 固定親 | business outcome | 検証参照 |
|---|---|---|
| `HELIXINTELLIGENCE-L2-017` | 固定L2に独立business outcomeなし | `CASE-INT-017-01`, `CASE-INT-017-01a`, `CASE-INT-017-02a`, `CASE-INT-017-02b`, `CASE-INT-017-02c`, `CASE-INT-017-02d`, `CASE-INT-017-02e`, `CASE-INT-017-02f`, `CASE-INT-017-02g`, `CASE-INT-017-02h`, `CASE-INT-017-02i`, `CASE-INT-017-02j`, `CASE-INT-017-02k`, `CASE-INT-017-02l`, `CASE-INT-017-02m`, `CASE-INT-017-02n`, `CASE-INT-017-02o`, `CASE-INT-017-03`, `CASE-INT-017-03a`, `CASE-INT-017-04a`, `CASE-INT-017-04b`, `CASE-INT-017-04c`, `CASE-INT-017-04d`, `CASE-INT-017-04e`, `CASE-INT-017-05a`, `CASE-INT-017-05b`, `CASE-INT-017-05c`, `CASE-INT-017-05d`, `CASE-INT-017-05e`, `CASE-INT-017-05f`, `CASE-INT-017-05g`, `CASE-INT-017-05h`, `CASE-INT-017-05i`, `CASE-INT-017-05j`, `CASE-INT-017-05k`, `CASE-INT-017-05l`, `CASE-INT-017-05m`, `CASE-INT-017-05n`, `CASE-INT-017-05o`, `CASE-INT-017-05p`, `CASE-INT-017-05q` |
| `HELIXINTELLIGENCE-L2-030` | 固定L2に独立business outcomeなし | `CASE-INT-030-01`, `CASE-INT-030-02a`, `CASE-INT-030-02b`, `CASE-INT-030-02c`, `CASE-INT-030-02d`, `CASE-INT-030-02e`, `CASE-INT-030-02f`, `CASE-INT-030-02g`, `CASE-INT-030-02h`, `CASE-INT-030-03`, `CASE-INT-030-04a`, `CASE-INT-030-04b`, `CASE-INT-030-04c`, `CASE-INT-030-04d`, `CASE-INT-030-04e`, `CASE-INT-030-04f`, `CASE-INT-030-05a`, `CASE-INT-030-05b`, `CASE-INT-030-05c`, `CASE-INT-030-05d`, `CASE-INT-030-05e`, `CASE-INT-030-05f`, `CASE-INT-030-05g`, `CASE-INT-030-05h`, `CASE-INT-030-05i`, `CASE-INT-030-05j`, `CASE-INT-030-05k`, `CASE-INT-030-05l`, `CASE-INT-030-05m`, `CASE-INT-030-05n`, `CASE-INT-030-05o`, `CASE-INT-030-05p`, `CASE-INT-030-05q` |
| `HELIXINTELLIGENCE-L2-031` | 固定L2に独立business outcomeなし | `CASE-INT-031-01`, `CASE-INT-031-02a`, `CASE-INT-031-02b`, `CASE-INT-031-02c`, `CASE-INT-031-02d`, `CASE-INT-031-02e`, `CASE-INT-031-02f`, `CASE-INT-031-02g`, `CASE-INT-031-02n`, `CASE-INT-031-03`, `CASE-INT-031-04a`, `CASE-INT-031-04b`, `CASE-INT-031-04c`, `CASE-INT-031-04d`, `CASE-INT-031-04e`, `CASE-INT-031-05a`, `CASE-INT-031-05b`, `CASE-INT-031-05c`, `CASE-INT-031-05d`, `CASE-INT-031-05e`, `CASE-INT-031-05f`, `CASE-INT-031-05g`, `CASE-INT-031-05h`, `CASE-INT-031-05i`, `CASE-INT-031-05j`, `CASE-INT-031-05k`, `CASE-INT-031-05l`, `CASE-INT-031-05m`, `CASE-INT-031-05n`, `CASE-INT-031-05o`, `CASE-INT-031-05p`, `CASE-INT-031-05q` |
| `HELIXINTELLIGENCE-L2-032` | 固定L2に独立business outcomeなし | `CASE-INT-032-01`, `CASE-INT-032-02a`, `CASE-INT-032-02h`, `CASE-INT-032-02b`, `CASE-INT-032-02c`, `CASE-INT-032-02d`, `CASE-INT-032-02e`, `CASE-INT-032-02f`, `CASE-INT-032-02g`, `CASE-INT-032-02i`, `CASE-INT-032-02j`, `CASE-INT-032-02k`, `CASE-INT-032-02l`, `CASE-INT-032-02m`, `CASE-INT-032-03`, `CASE-INT-032-04a`, `CASE-INT-032-04f`, `CASE-INT-032-04b`, `CASE-INT-032-04c`, `CASE-INT-032-04d`, `CASE-INT-032-04e`, `CASE-INT-032-04g`, `CASE-INT-032-04h`, `CASE-INT-032-04i`, `CASE-INT-032-04j`, `CASE-INT-032-04k`, `CASE-INT-032-04l`, `CASE-INT-032-05a`, `CASE-INT-032-05b`, `CASE-INT-032-05c`, `CASE-INT-032-05d`, `CASE-INT-032-05e`, `CASE-INT-032-05f`, `CASE-INT-032-05g`, `CASE-INT-032-05h`, `CASE-INT-032-05i`, `CASE-INT-032-05j`, `CASE-INT-032-05k`, `CASE-INT-032-05l`, `CASE-INT-032-05m`, `CASE-INT-032-05n`, `CASE-INT-032-05o`, `CASE-INT-032-05p`, `CASE-INT-032-05q` |
| `HELIXINTELLIGENCE-L2-033` | 固定L2に独立business outcomeなし | `CASE-INT-033-01`, `CASE-INT-033-02a`, `CASE-INT-033-02b`, `CASE-INT-033-02c`, `CASE-INT-033-02i`, `CASE-INT-033-02d`, `CASE-INT-033-02e`, `CASE-INT-033-02f`, `CASE-INT-033-02g`, `CASE-INT-033-02h`, `CASE-INT-033-03`, `CASE-INT-033-03a`, `CASE-INT-033-04a`, `CASE-INT-033-04b`, `CASE-INT-033-04c`, `CASE-INT-033-04d`, `CASE-INT-033-04e`, `CASE-INT-033-05a`, `CASE-INT-033-05b`, `CASE-INT-033-05c`, `CASE-INT-033-05d`, `CASE-INT-033-05e`, `CASE-INT-033-05f`, `CASE-INT-033-05g`, `CASE-INT-033-05h`, `CASE-INT-033-05i`, `CASE-INT-033-05j`, `CASE-INT-033-05k`, `CASE-INT-033-05l`, `CASE-INT-033-05m`, `CASE-INT-033-05n`, `CASE-INT-033-05o`, `CASE-INT-033-05p`, `CASE-INT-033-05q` |
| `HELIXINTELLIGENCE-L2-034` | 固定L2に独立business outcomeなし | `CASE-INT-034-01`, `CASE-INT-034-02a`, `CASE-INT-034-02b`, `CASE-INT-034-02c`, `CASE-INT-034-02d`, `CASE-INT-034-02e`, `CASE-INT-034-02f`, `CASE-INT-034-02g`, `CASE-INT-034-02h`, `CASE-INT-034-02i`, `CASE-INT-034-02j`, `CASE-INT-034-02l`, `CASE-INT-034-02m`, `CASE-INT-034-02n`, `CASE-INT-034-03`, `CASE-INT-034-04a`, `CASE-INT-034-04b`, `CASE-INT-034-04c`, `CASE-INT-034-04d`, `CASE-INT-034-04e`, `CASE-INT-034-04f`, `CASE-INT-034-05a`, `CASE-INT-034-05b`, `CASE-INT-034-05c`, `CASE-INT-034-05d`, `CASE-INT-034-05e`, `CASE-INT-034-05f`, `CASE-INT-034-05g`, `CASE-INT-034-05h`, `CASE-INT-034-05i`, `CASE-INT-034-05j`, `CASE-INT-034-05k`, `CASE-INT-034-05l`, `CASE-INT-034-05m`, `CASE-INT-034-05n`, `CASE-INT-034-05o`, `CASE-INT-034-05p`, `CASE-INT-034-05q` |
| `HELIXINTELLIGENCE-L2-035` | 固定L2に独立business outcomeなし | `CASE-INT-035-01`, `CASE-INT-035-02a`, `CASE-INT-035-02i`, `CASE-INT-035-02b`, `CASE-INT-035-02j`, `CASE-INT-035-02c`, `CASE-INT-035-02d`, `CASE-INT-035-02e`, `CASE-INT-035-02f`, `CASE-INT-035-02g`, `CASE-INT-035-02h`, `CASE-INT-035-02k`, `CASE-INT-035-02l`, `CASE-INT-035-02m`, `CASE-INT-035-03`, `CASE-INT-035-04a`, `CASE-INT-035-04g`, `CASE-INT-035-04f`, `CASE-INT-035-04b`, `CASE-INT-035-04c`, `CASE-INT-035-04d`, `CASE-INT-035-04e`, `CASE-INT-035-05a`, `CASE-INT-035-05b`, `CASE-INT-035-05c`, `CASE-INT-035-05d`, `CASE-INT-035-05e`, `CASE-INT-035-05f`, `CASE-INT-035-05g`, `CASE-INT-035-05h`, `CASE-INT-035-05i`, `CASE-INT-035-05j`, `CASE-INT-035-05k`, `CASE-INT-035-05l`, `CASE-INT-035-05m`, `CASE-INT-035-05n`, `CASE-INT-035-05o`, `CASE-INT-035-05p`, `CASE-INT-035-05q` |
| `HELIXINTELLIGENCE-L2-036` | 固定L2に独立business outcomeなし | `CASE-INT-036-01`, `CASE-INT-036-02a`, `CASE-INT-036-02b`, `CASE-INT-036-02c`, `CASE-INT-036-02d`, `CASE-INT-036-02e`, `CASE-INT-036-02f`, `CASE-INT-036-02g`, `CASE-INT-036-02h`, `CASE-INT-036-02i`, `CASE-INT-036-02k`, `CASE-INT-036-02l`, `CASE-INT-036-02n`, `CASE-INT-036-02o`, `CASE-INT-036-03`, `CASE-INT-036-03a`, `CASE-INT-036-03b`, `CASE-INT-036-04a`, `CASE-INT-036-04b`, `CASE-INT-036-04c`, `CASE-INT-036-04h`, `CASE-INT-036-04f`, `CASE-INT-036-04g`, `CASE-INT-036-04d`, `CASE-INT-036-04e`, `CASE-INT-036-04i`, `CASE-INT-036-04j`, `CASE-INT-036-04k`, `CASE-INT-036-05a`, `CASE-INT-036-05b`, `CASE-INT-036-05c`, `CASE-INT-036-05d`, `CASE-INT-036-05e`, `CASE-INT-036-05f`, `CASE-INT-036-05g`, `CASE-INT-036-05h`, `CASE-INT-036-05i`, `CASE-INT-036-05j`, `CASE-INT-036-05k`, `CASE-INT-036-05l`, `CASE-INT-036-05m`, `CASE-INT-036-05n`, `CASE-INT-036-05o`, `CASE-INT-036-05p`, `CASE-INT-036-05q` |
| `HELIXINTELLIGENCE-L2-037` | 固定L2に独立business outcomeなし | `CASE-INT-037-01`, `CASE-INT-037-02a`, `CASE-INT-037-02b`, `CASE-INT-037-02c`, `CASE-INT-037-02d`, `CASE-INT-037-02e`, `CASE-INT-037-02f`, `CASE-INT-037-02g`, `CASE-INT-037-02h`, `CASE-INT-037-02i`, `CASE-INT-037-02j`, `CASE-INT-037-03`, `CASE-INT-037-04a`, `CASE-INT-037-04b`, `CASE-INT-037-04c`, `CASE-INT-037-04d`, `CASE-INT-037-04e`, `CASE-INT-037-04f`, `CASE-INT-037-04g`, `CASE-INT-037-04h`, `CASE-INT-037-05a`, `CASE-INT-037-05b`, `CASE-INT-037-05c`, `CASE-INT-037-05d`, `CASE-INT-037-05e`, `CASE-INT-037-05f`, `CASE-INT-037-05g`, `CASE-INT-037-05h`, `CASE-INT-037-05i`, `CASE-INT-037-05j`, `CASE-INT-037-05k`, `CASE-INT-037-05l`, `CASE-INT-037-05m`, `CASE-INT-037-05n`, `CASE-INT-037-05o`, `CASE-INT-037-05p`, `CASE-INT-037-05q` |
| `HELIXINTELLIGENCE-L2-038` | 固定L2に独立business outcomeなし | `CASE-INT-038-01`, `CASE-INT-038-02a`, `CASE-INT-038-02b`, `CASE-INT-038-02c`, `CASE-INT-038-02d`, `CASE-INT-038-02e`, `CASE-INT-038-02f`, `CASE-INT-038-02g`, `CASE-INT-038-02h`, `CASE-INT-038-02i`, `CASE-INT-038-02j`, `CASE-INT-038-02k`, `CASE-INT-038-02l`, `CASE-INT-038-03`, `CASE-INT-038-04a`, `CASE-INT-038-04b`, `CASE-INT-038-04c`, `CASE-INT-038-04d`, `CASE-INT-038-04e`, `CASE-INT-038-04f`, `CASE-INT-038-05a`, `CASE-INT-038-05b`, `CASE-INT-038-05c`, `CASE-INT-038-05d`, `CASE-INT-038-05e`, `CASE-INT-038-05f`, `CASE-INT-038-05g`, `CASE-INT-038-05h`, `CASE-INT-038-05i`, `CASE-INT-038-05j`, `CASE-INT-038-05k`, `CASE-INT-038-05l`, `CASE-INT-038-05m`, `CASE-INT-038-05n`, `CASE-INT-038-05o`, `CASE-INT-038-05p`, `CASE-INT-038-05q` |
| `HELIXINTELLIGENCE-L2-039` | 固定L2に独立business outcomeなし | `CASE-INT-039-01`, `CASE-INT-039-02a`, `CASE-INT-039-02b`, `CASE-INT-039-02c`, `CASE-INT-039-02d`, `CASE-INT-039-02e`, `CASE-INT-039-02f`, `CASE-INT-039-02g`, `CASE-INT-039-02h`, `CASE-INT-039-02i`, `CASE-INT-039-03`, `CASE-INT-039-03a`, `CASE-INT-039-03b`, `CASE-INT-039-04a`, `CASE-INT-039-04b`, `CASE-INT-039-04c`, `CASE-INT-039-04d`, `CASE-INT-039-04e`, `CASE-INT-039-05a`, `CASE-INT-039-05b`, `CASE-INT-039-05c`, `CASE-INT-039-05d`, `CASE-INT-039-05e`, `CASE-INT-039-05f`, `CASE-INT-039-05g`, `CASE-INT-039-05h`, `CASE-INT-039-05i`, `CASE-INT-039-05j`, `CASE-INT-039-05k`, `CASE-INT-039-05l`, `CASE-INT-039-05m`, `CASE-INT-039-05n`, `CASE-INT-039-05o`, `CASE-INT-039-05p`, `CASE-INT-039-05q` |
| `HELIXINTELLIGENCE-L2-040` | 固定L2に独立business outcomeなし | `CASE-INT-040-01`, `CASE-INT-040-01a`, `CASE-INT-040-01b`, `CASE-INT-040-01c`, `CASE-INT-040-01d`, `CASE-INT-040-01e`, `CASE-INT-040-02a`, `CASE-INT-040-02i`, `CASE-INT-040-02b`, `CASE-INT-040-02c`, `CASE-INT-040-02d`, `CASE-INT-040-02e`, `CASE-INT-040-02f`, `CASE-INT-040-02g`, `CASE-INT-040-02h`, `CASE-INT-040-02j`, `CASE-INT-040-02k`, `CASE-INT-040-02l`, `CASE-INT-040-03`, `CASE-INT-040-03a`, `CASE-INT-040-04a`, `CASE-INT-040-04f`, `CASE-INT-040-04b`, `CASE-INT-040-04c`, `CASE-INT-040-04d`, `CASE-INT-040-04e`, `CASE-INT-040-04g`, `CASE-INT-040-05a`, `CASE-INT-040-05b`, `CASE-INT-040-05c`, `CASE-INT-040-05d`, `CASE-INT-040-05e`, `CASE-INT-040-05f`, `CASE-INT-040-05g`, `CASE-INT-040-05h`, `CASE-INT-040-05i`, `CASE-INT-040-05j`, `CASE-INT-040-05k`, `CASE-INT-040-05l`, `CASE-INT-040-05m`, `CASE-INT-040-05n`, `CASE-INT-040-05o`, `CASE-INT-040-05p`, `CASE-INT-040-05q` |
| `HELIXINTELLIGENCE-L2-041` | 固定L2に独立business outcomeなし | `CASE-INT-041-01`, `CASE-INT-041-02a`, `CASE-INT-041-02b`, `CASE-INT-041-02c`, `CASE-INT-041-02d`, `CASE-INT-041-02e`, `CASE-INT-041-02f`, `CASE-INT-041-02g`, `CASE-INT-041-02h`, `CASE-INT-041-02i`, `CASE-INT-041-03`, `CASE-INT-041-03a`, `CASE-INT-041-03b`, `CASE-INT-041-04a`, `CASE-INT-041-04b`, `CASE-INT-041-04c`, `CASE-INT-041-04d`, `CASE-INT-041-04e`, `CASE-INT-041-05a`, `CASE-INT-041-05b`, `CASE-INT-041-05c`, `CASE-INT-041-05d`, `CASE-INT-041-05e`, `CASE-INT-041-05f`, `CASE-INT-041-05g`, `CASE-INT-041-05h`, `CASE-INT-041-05i`, `CASE-INT-041-05j`, `CASE-INT-041-05k`, `CASE-INT-041-05l`, `CASE-INT-041-05m`, `CASE-INT-041-05n`, `CASE-INT-041-05o`, `CASE-INT-041-05p`, `CASE-INT-041-05q` |
| `HELIXINTELLIGENCE-L2-044` | 固定L2に独立business outcomeなし | `CASE-INT-044-01`, `CASE-INT-044-02a`, `CASE-INT-044-02i`, `CASE-INT-044-02b`, `CASE-INT-044-02c`, `CASE-INT-044-02d`, `CASE-INT-044-02e`, `CASE-INT-044-02f`, `CASE-INT-044-02g`, `CASE-INT-044-02h`, `CASE-INT-044-02j`, `CASE-INT-044-03`, `CASE-INT-044-04a`, `CASE-INT-044-04f`, `CASE-INT-044-04g`, `CASE-INT-044-04b`, `CASE-INT-044-04c`, `CASE-INT-044-04d`, `CASE-INT-044-04e`, `CASE-INT-044-04h`, `CASE-INT-044-05a`, `CASE-INT-044-05b`, `CASE-INT-044-05c`, `CASE-INT-044-05d`, `CASE-INT-044-05e`, `CASE-INT-044-05f`, `CASE-INT-044-05g`, `CASE-INT-044-05h`, `CASE-INT-044-05i`, `CASE-INT-044-05j`, `CASE-INT-044-05k`, `CASE-INT-044-05l`, `CASE-INT-044-05m`, `CASE-INT-044-05n`, `CASE-INT-044-05o`, `CASE-INT-044-05p`, `CASE-INT-044-05q` |
| `HELIXINTELLIGENCE-L2-045` | 固定L2に独立business outcomeなし | `CASE-INT-045-01`, `CASE-INT-045-02a`, `CASE-INT-045-02b`, `CASE-INT-045-02c`, `CASE-INT-045-02d`, `CASE-INT-045-02e`, `CASE-INT-045-02f`, `CASE-INT-045-02g`, `CASE-INT-045-02h`, `CASE-INT-045-02i`, `CASE-INT-045-02j`, `CASE-INT-045-02k`, `CASE-INT-045-02l`, `CASE-INT-045-02m`, `CASE-INT-045-03`, `CASE-INT-045-04a`, `CASE-INT-045-04b`, `CASE-INT-045-04c`, `CASE-INT-045-04f`, `CASE-INT-045-04g`, `CASE-INT-045-04d`, `CASE-INT-045-04e`, `CASE-INT-045-05a`, `CASE-INT-045-05b`, `CASE-INT-045-05c`, `CASE-INT-045-05d`, `CASE-INT-045-05e`, `CASE-INT-045-05f`, `CASE-INT-045-05g`, `CASE-INT-045-05h`, `CASE-INT-045-05i`, `CASE-INT-045-05j`, `CASE-INT-045-05k`, `CASE-INT-045-05l`, `CASE-INT-045-05m`, `CASE-INT-045-05n`, `CASE-INT-045-05o`, `CASE-INT-045-05p`, `CASE-INT-045-05q` |

本表とbusiness-verificationのCASE列は機能oracleの参照一覧であり、NFR coverage分母ではない。NFR-INT-045-01ではtarget identity欠落02a・unknown04aと、未見identityをunroutedのまま保つCASE-INT-045-03を分母外のunrouted反例として別記録する。target identity既知でowner不明の04bと直接routeの02kは分母に含め、NFR適用required fieldをfixtureごとに数える。

## Stage 3 — 採択22親の業務境界

固定L2に独立した業務成果基準がないため、このStage 3範囲で新たなbusiness requirement/KPI/事業ownerを導出しない。各親の機能条件はfunctional L3へ参照し、機能成立を事業価値達成・利用者受入と読み替えない。

| 親L2 | 扱い | 機能参照 | 境界 |
|---|---|---|---|
| `HELIXINTELLIGENCE-L2-001` | 独立business criterionを追加しない。 | `FR-INTELLIGENCE-L3-001-01` のAC | owner/利用者のbusiness判断をINTELLIGENCEが代替しない。 |
| `HELIXINTELLIGENCE-L2-002` | 独立business criterionを追加しない。 | `FR-INTELLIGENCE-L3-002-01` のAC | owner/利用者のbusiness判断をINTELLIGENCEが代替しない。 |
| `HELIXINTELLIGENCE-L2-003` | 独立business criterionを追加しない。 | `FR-INTELLIGENCE-L3-003-01` のAC | owner/利用者のbusiness判断をINTELLIGENCEが代替しない。 |
| `HELIXINTELLIGENCE-L2-004` | 独立business criterionを追加しない。 | `FR-INTELLIGENCE-L3-004-01` のAC | owner/利用者のbusiness判断をINTELLIGENCEが代替しない。 |
| `HELIXINTELLIGENCE-L2-005` | 独立business criterionを追加しない。 | `FR-INTELLIGENCE-L3-005-01` のAC | owner/利用者のbusiness判断をINTELLIGENCEが代替しない。 |
| `HELIXINTELLIGENCE-L2-006` | 独立business criterionを追加しない。 | `FR-INTELLIGENCE-L3-006-01` のAC | owner/利用者のbusiness判断をINTELLIGENCEが代替しない。 |
| `HELIXINTELLIGENCE-L2-007` | 独立business criterionを追加しない。 | `FR-INTELLIGENCE-L3-007-01` のAC | owner/利用者のbusiness判断をINTELLIGENCEが代替しない。 |
| `HELIXINTELLIGENCE-L2-008` | 独立business criterionを追加しない。 | `FR-INTELLIGENCE-L3-008-01` のAC | owner/利用者のbusiness判断をINTELLIGENCEが代替しない。 |
| `HELIXINTELLIGENCE-L2-009` | 独立business criterionを追加しない。 | `FR-INTELLIGENCE-L3-009-01` のAC | owner/利用者のbusiness判断をINTELLIGENCEが代替しない。 |
| `HELIXINTELLIGENCE-L2-011` | 独立business criterionを追加しない。 | `FR-INTELLIGENCE-L3-011-01` のAC | owner/利用者のbusiness判断をINTELLIGENCEが代替しない。 |
| `HELIXINTELLIGENCE-L2-012` | 独立business criterionを追加しない。 | `FR-INTELLIGENCE-L3-012-01` のAC | owner/利用者のbusiness判断をINTELLIGENCEが代替しない。 |
| `HELIXINTELLIGENCE-L2-013` | 独立business criterionを追加しない。 | `FR-INTELLIGENCE-L3-013-01` のAC | owner/利用者のbusiness判断をINTELLIGENCEが代替しない。 |
| `HELIXINTELLIGENCE-L2-014` | 独立business criterionを追加しない。 | `FR-INTELLIGENCE-L3-014-01` のAC | owner/利用者のbusiness判断をINTELLIGENCEが代替しない。 |
| `HELIXINTELLIGENCE-L2-015` | 独立business criterionを追加しない。 | `FR-INTELLIGENCE-L3-015-01` のAC | owner/利用者のbusiness判断をINTELLIGENCEが代替しない。 |
| `HELIXINTELLIGENCE-L2-016` | 独立business criterionを追加しない。 | `FR-INTELLIGENCE-L3-016-01` のAC | owner/利用者のbusiness判断をINTELLIGENCEが代替しない。 |
| `HELIXINTELLIGENCE-L2-018` | 独立business criterionを追加しない。 | `FR-INTELLIGENCE-L3-018-01` のAC | owner/利用者のbusiness判断をINTELLIGENCEが代替しない。 |
| `HELIXINTELLIGENCE-L2-019` | 独立business criterionを追加しない。 | `FR-INTELLIGENCE-L3-019-01` のAC | owner/利用者のbusiness判断をINTELLIGENCEが代替しない。 |
| `HELIXINTELLIGENCE-L2-020` | 独立business criterionを追加しない。 | `FR-INTELLIGENCE-L3-020-01` のAC | owner/利用者のbusiness判断をINTELLIGENCEが代替しない。 |
| `HELIXINTELLIGENCE-L2-067` | 独立business criterionを追加しない。 | `FR-INTELLIGENCE-L3-067-01` のAC | owner/利用者のbusiness判断をINTELLIGENCEが代替しない。 |
| `HELIXINTELLIGENCE-L2-072` | 独立business criterionを追加しない。 | `FR-INTELLIGENCE-L3-072-01` のAC | owner/利用者のbusiness判断をINTELLIGENCEが代替しない。 |
| `HELIXINTELLIGENCE-L2-073` | 独立business criterionを追加しない。 | `FR-INTELLIGENCE-L3-073-01` のAC | owner/利用者のbusiness判断をINTELLIGENCEが代替しない。 |
| `HELIXINTELLIGENCE-L2-078` | 独立business criterionを追加しない。 | `FR-INTELLIGENCE-L3-078-01` のAC | owner/利用者のbusiness判断をINTELLIGENCEが代替しない。 |

review08追補の005/016/067/072各機能fixtureは対応ACへtraceする。独立business基準や業務成果の承認は追加せず、比較成立・候補成立・修復結果照合からownerの業務判断を生成しない。
## Stage 5 — business outcome範囲（INTELLIGENCE 9親）

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

補完された個別fixtureも上表の同じfunctional traceへ属し、独立BR・business CASE・KPIを追加しない。

LABO評価、OS assignment/acceptance、source owner判断、consumer受領をbusiness outcomeへ先取りしない。技術oracle、提案数、試験pass、候補採択から業務成果を生成しない。
