# HELIX-INTELLIGENCE L3 業務要件（Stage 2c）

状態: PO L3承認前の起草候補。機構固有の業務要件のみを固定採択L2の意味から整理し、実装済み・業務成果成立とは扱わない。

旧HELIXの3 sub-doc分離（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:16-28`、LEGACY-ASSET-9A772391C7FB1298D45F）と業務詳細を機能詳細から分けた形（`business-detail.md:21-39,84-104`、LEGACY-ASSET-A6E2C7F0565E5F804F06）を起点にする。再導出するのは、業務目的・評価owner・責任境界を明示し機能要件と重複しない形式である。旧HARNESSのLearning Engine、PLAN単位評価、旧KPI/score/自動適用や承認動作はINTELLIGENCEへ移さない。

対象は採択済み `HELIXINTELLIGENCE-L2-068` と `HELIXINTELLIGENCE-L2-075`。Stage 2aの010/066草稿は含めない。項目別sourceと再導出は時点監査へ記録する。

## Stage 2c — L2-068の業務要件範囲

固定親 `HELIXINTELLIGENCE-L2-068` は独立した業務outcome ownerやbusiness metricを定めないため、この親のBRは起草せず、business acceptance CASEも追加しない。Stage 2cの機能受入・検証の正本は `FR-INT-068` の `AC-INT-068-01`〜`AC-INT-068-06` と、functional L10の `CASE-INT-068-01`〜`CASE-INT-068-10` とする。別のStage 2a草稿のBR-INT-010/066は本書に収載せず、各固定親の範囲に留まり、このscopeのowner・KPI・gateを生成しない。


## Stage 2c — L2-075の業務範囲

固定親 `HELIXINTELLIGENCE-L2-075` はproposal identityとqualification handoffの機能条件を持つが、独立business outcome・business owner・business metricを追加で定めない。そのためBR-INT-075およびbusiness CASEは起草せず、受入/evidenceは `FR-INT-075` の `AC-INT-075-01`〜`AC-INT-075-06` とfunctional L10の `CASE-INT-075-01`〜`CASE-INT-075-09` を参照する。別のStage 2a草稿のBR-INT-010/066とL2-068の業務範囲を075へ広げない。
