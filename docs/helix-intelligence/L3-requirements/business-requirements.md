# HELIX-INTELLIGENCE L3 業務要件（Stage 2a）

状態: PO L3承認前の起草候補。機構固有の業務要件のみを固定採択L2の意味から整理し、実装済み・業務成果成立とは扱わない。

旧HELIXの3 sub-doc分離（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16-28`、LEGACY-ASSET-9A772391C7FB1298D45F）と業務詳細を機能詳細から分けた形（`business-detail.md:21-39,84-104`、LEGACY-ASSET-A6E2C7F0565E5F804F06）を起点にする。再導出するのは、業務目的・評価owner・責任境界を明示し機能要件と重複しない形式である。旧HARNESSのLearning Engine、PLAN単位評価、旧KPI/score/自動適用や承認動作はINTELLIGENCEへ移さない。

## BR-INT-010 — 根拠付きtask別配置提案

固定親 `HELIXINTELLIGENCE-L2-010`（version target 1.0）の業務上の成果は、task属性と適用scope内の実績に基づく配置候補を作り、根拠・除外・未評価を明らかにすること。実assignment・進行はOS、観測実績/HELIX-Bench評価はLABO、候補判断はINTELLIGENCEの責務として分ける。候補が無い、または根拠が不足するときは、確定配置を作らず親のL2で指定したownerへ戻す。

Acceptance/evidenceは `functional-requirements.md` のFR-INT-010およびAC-INT-010-01〜07、`../L10-verification/functional-verification.md` のCASE-INT-010-01, CASE-INT-010-05, CASE-INT-010-06, CASE-INT-010-02a〜02h, CASE-INT-010-03a〜03b, CASE-INT-010-04a〜04kを正本とする。ここでは新しいbusiness owner、成功KPI、配置決定、候補選択gateを追加しない。

## BR-INT-066 — 人代行時もproposalとassignmentを分離

固定親 `HELIXINTELLIGENCE-L2-066`（version target 1.0）の業務上の成果は、INT runtimeが使えない経路でも人の暫定案を既存L2-010 proposal contractに沿って入力・受領可能にし、originと根拠の状態を保つこと。人手案がINTの生成物や評価実績と誤認されず、OSの受領・別個のassignment判断と、LABOの評価責務を侵さないことを示す。

Acceptance/evidenceは `functional-requirements.md` のFR-INT-066およびAC-INT-066-01〜08、`../L10-verification/functional-verification.md` のCASE-INT-066-01、CASE-INT-066-02、CASE-INT-066-03a、CASE-INT-066-03b、CASE-INT-066-04a、CASE-INT-066-04b、CASE-INT-066-04c、CASE-INT-066-04d、CASE-INT-066-05a〜05t、CASE-INT-066-06a〜06f、CASE-INT-066-07、CASE-INT-066-08a、CASE-INT-066-08bを正本とする。人代行入力はINT実装稼働の前提ではなく、新規のmanual approval段階も追加しない。

## 旧sourceとの差分

旧README上のfunctional/business/NFR三分割を完全一致再利用せず、現行固定L2にbusiness独立条件がある場合だけこの文書に記録する。旧business-detailの他機構固有内容・旧自動更新案は置換・除外した。版、owner、scopeの上流意味は固定L2/L11を保持する。
