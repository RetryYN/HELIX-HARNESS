# HELIX-INTELLIGENCE L10 業務総合検証（Stage 2a）

状態: 対のL3業務要件を検証する設計候補。業務結果を実測済みとは扱わない。業務要件の正本はL3 `business-requirements.md`であり、本書はそのACとfunctional CASEへのtraceをまとめる。

旧HELIXの受入test設計のpair trace（LEGACY-ASSET-44DD86E3DEC09E65EF51, `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:32-90,91-216`）およびwrong actor/scope/stale receipt mutationの設計（LEGACY-ASSET-437A6A68F9A9E0AE1B9E, `resident-lane-orchestration-acceptance.md:17-55`）を形式起点にする。旧Issue/PLAN authority、lane/lease機構、件数、test runtimeは再利用しない。

## BR-INT-010 — 根拠付きtask別配置提案

| 対象 | 業務oracle | 対応L3/functional L10 |
|---|---|---|
| 候補の根拠 | task属性・Worker capability・同scopeのLABO観測/Bench evidenceが提案理由と一致し、未評価は未評価 | `BR-INT-010`; `FR-INT-010`; `CASE-INT-010-01`, `CASE-INT-010-05`, `CASE-INT-010-06`, `CASE-INT-010-02a`, `CASE-INT-010-02b`, `CASE-INT-010-02c`, `CASE-INT-010-02d`, `CASE-INT-010-02e`, `CASE-INT-010-02f`, `CASE-INT-010-02g`, `CASE-INT-010-02h`, `CASE-INT-010-02i`, `CASE-INT-010-02j`, `CASE-INT-010-03a`, `CASE-INT-010-03b`, `CASE-INT-010-04a`, `CASE-INT-010-04b`, `CASE-INT-010-04c`, `CASE-INT-010-04d`, `CASE-INT-010-04e`, `CASE-INT-010-04f`, `CASE-INT-010-04g`, `CASE-INT-010-04h`, `CASE-INT-010-04i`, `CASE-INT-010-04j`, `CASE-INT-010-04k` |
| 責務 | INT proposal、LABO evaluation、OS assignment/progressが分離され、proposalから実行許可を生成しない | `AC-INT-010-01`, `AC-INT-010-02`, `AC-INT-010-03`, `AC-INT-010-04`, `AC-INT-010-05`, `AC-INT-010-06`, `AC-INT-010-07`; `CASE-INT-010-02a`〜`CASE-INT-010-02j`, `CASE-INT-010-03a`〜`CASE-INT-010-03b`, `CASE-INT-010-04a`〜`CASE-INT-010-04k`, `CASE-INT-010-05`, `CASE-INT-010-06` |
| 不足/不一致 | task属性不足はOS、Bench/evidence適用scope不足はLABOへ返し案を未確定にする | `AC-INT-010-04`; `CASE-INT-010-04a`〜`CASE-INT-010-04k`, `CASE-INT-010-03a`, `CASE-INT-010-03b` |

合格材料はtask別proposalとそのsource/evidence/scope trace、unknown/未評価表示、owner returnの記録である。price/model/benchmark単独順位はpositive業務成果に数えない。

## BR-INT-066 — 人代行時もproposalとassignmentを分離

| 対象 | 業務oracle | 対応L3/functional L10 |
|---|---|---|
| runtimeあり | LABO-055/054同scope評価→INT proposal→OS別途審査/assignmentの通常経路を示す | `AC-INT-066-01`; `CASE-INT-066-01` |
| runtimeなし | 人が固定L2-010 schemaでproposalを供給し、originとreceiptを保つ | `AC-INT-066-02`; `CASE-INT-066-02` |
| authority境界 | human proposalはINT output/evaluation/assignment/permissionにならず、OSが受領とassignmentを分ける | `AC-INT-066-03、AC-INT-066-04、AC-INT-066-05、AC-INT-066-06、AC-INT-066-07、AC-INT-066-08`; `CASE-INT-066-03a、CASE-INT-066-03b、CASE-INT-066-03c、CASE-INT-066-04a、CASE-INT-066-04b、CASE-INT-066-04c、CASE-INT-066-04d、CASE-INT-066-05a〜05t、CASE-INT-066-06a〜06f、CASE-INT-066-07、CASE-INT-066-08a、CASE-INT-066-08b` |

このbusiness pairは2つの正常経路を一つへまとめない。receipt・scope・source/evidence/schema version欠落時はL3固定ownerへ戻す。人向け承認段階、manual approval、OS/LABO/INTELLIGENCEの新ownerを追加しない。


## Stage 2c — 068/075の起草範囲とsource

状態: 以下のStage 2c追補はL3未承認の起草候補・未実行の検証設計である。上のStage 2a本文とその承認範囲を変更しない。対象は採択済みHELIXINTELLIGENCE-L2-068/075に限る。旧source起点・項目別の再導出/置換は各項目と時点監査に記録する。

状態: 対のL3業務要件を検証する設計候補。業務結果を実測済みとは扱わない。業務要件の正本はL3 `business-requirements.md`であり、本書はそのACとfunctional CASEへのtraceをまとめる。

旧HELIXの受入test設計のpair trace（LEGACY-ASSET-44DD86E3DEC09E65EF51, `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:32-90,91-216`）およびwrong actor/scope/stale receipt mutationの設計（LEGACY-ASSET-437A6A68F9A9E0AE1B9E, `resident-lane-orchestration-acceptance.md:17-55`）を形式起点にする。旧Issue/PLAN authority、lane/lease機構、件数、test runtimeは再利用しない。

対象は採択済み `HELIXINTELLIGENCE-L2-068` と `HELIXINTELLIGENCE-L2-075`。この追補は承認済みStage 2aの010/066範囲を変更しない。項目別sourceと再導出は時点監査へ記録する。


## Stage 2c — L2-068の業務検証範囲

固定親 `HELIXINTELLIGENCE-L2-068` に独立business outcomeがないため、Stage 2cのbusiness CASEは設けない。受入/evidenceはL3 `FR-INT-068` / `AC-INT-068-01`〜`AC-INT-068-06` およびfunctional L10 `CASE-INT-068-01`〜`CASE-INT-068-11` を参照する。承認済みStage 2aのBR-INT-010/066のoracleをL2-068へ拡張せず、新しいbusiness owner・KPI・受入gateを追加しない。


## Stage 2c — L2-075の業務検証範囲

固定親 `HELIXINTELLIGENCE-L2-075` は独立business outcomeを要求しないため、BR-INT-075/Business CASEは追加しない。Stage 2c evidenceは `FR-INT-075` の `AC-INT-075-01`〜`AC-INT-075-06` およびfunctional CASE `CASE-INT-075-01`〜`CASE-INT-075-09` を参照する。qualification owner、business KPI、新しいgateは作らない。

## Stage 3 — 独立business criterionの有無を照合

対象は採択された22親のみ。独立業務oracleは追加せず、対応する機能AC参照がbusiness outcomeとして誤表示されないことを確認する。

| case ID | 親L2 | L3 AC参照 | 入力 / 照合 | 合格oracle | 不合格条件 |
|---|---|---|---|---|---|
| `CASE-INTELLIGENCE-L10-BIZ-001-01` | `HELIXINTELLIGENCE-L2-001` | `AC-INTELLIGENCE-L3-001-01` | 対象親の機能fixtureと責務境界を照合する。 | 機能判断は対応functional CASEで評価し、業務承認・事業成果は生成しない。 | 機能結果からowner/利用者判断、事業達成または独立business基準を推定したら不合格。 |
| `CASE-INTELLIGENCE-L10-BIZ-002-01` | `HELIXINTELLIGENCE-L2-002` | `AC-INTELLIGENCE-L3-002-01` | 対象親の機能fixtureと責務境界を照合する。 | 機能判断は対応functional CASEで評価し、業務承認・事業成果は生成しない。 | 機能結果からowner/利用者判断、事業達成または独立business基準を推定したら不合格。 |
| `CASE-INTELLIGENCE-L10-BIZ-003-01` | `HELIXINTELLIGENCE-L2-003` | `AC-INTELLIGENCE-L3-003-01` | 対象親の機能fixtureと責務境界を照合する。 | 機能判断は対応functional CASEで評価し、業務承認・事業成果は生成しない。 | 機能結果からowner/利用者判断、事業達成または独立business基準を推定したら不合格。 |
| `CASE-INTELLIGENCE-L10-BIZ-004-01` | `HELIXINTELLIGENCE-L2-004` | `AC-INTELLIGENCE-L3-004-01` | 対象親の機能fixtureと責務境界を照合する。 | 機能判断は対応functional CASEで評価し、業務承認・事業成果は生成しない。 | 機能結果からowner/利用者判断、事業達成または独立business基準を推定したら不合格。 |
| `CASE-INTELLIGENCE-L10-BIZ-005-01` | `HELIXINTELLIGENCE-L2-005` | `AC-INTELLIGENCE-L3-005-01` | 対象親の機能fixtureと責務境界を照合する。 | 機能判断は対応functional CASEで評価し、業務承認・事業成果は生成しない。 | 機能結果からowner/利用者判断、事業達成または独立business基準を推定したら不合格。 |
| `CASE-INTELLIGENCE-L10-BIZ-006-01` | `HELIXINTELLIGENCE-L2-006` | `AC-INTELLIGENCE-L3-006-01` | 対象親の機能fixtureと責務境界を照合する。 | 機能判断は対応functional CASEで評価し、業務承認・事業成果は生成しない。 | 機能結果からowner/利用者判断、事業達成または独立business基準を推定したら不合格。 |
| `CASE-INTELLIGENCE-L10-BIZ-007-01` | `HELIXINTELLIGENCE-L2-007` | `AC-INTELLIGENCE-L3-007-01` | 対象親の機能fixtureと責務境界を照合する。 | 機能判断は対応functional CASEで評価し、業務承認・事業成果は生成しない。 | 機能結果からowner/利用者判断、事業達成または独立business基準を推定したら不合格。 |
| `CASE-INTELLIGENCE-L10-BIZ-008-01` | `HELIXINTELLIGENCE-L2-008` | `AC-INTELLIGENCE-L3-008-01` | 対象親の機能fixtureと責務境界を照合する。 | 機能判断は対応functional CASEで評価し、業務承認・事業成果は生成しない。 | 機能結果からowner/利用者判断、事業達成または独立business基準を推定したら不合格。 |
| `CASE-INTELLIGENCE-L10-BIZ-009-01` | `HELIXINTELLIGENCE-L2-009` | `AC-INTELLIGENCE-L3-009-01` | 対象親の機能fixtureと責務境界を照合する。 | 機能判断は対応functional CASEで評価し、業務承認・事業成果は生成しない。 | 機能結果からowner/利用者判断、事業達成または独立business基準を推定したら不合格。 |
| `CASE-INTELLIGENCE-L10-BIZ-011-01` | `HELIXINTELLIGENCE-L2-011` | `AC-INTELLIGENCE-L3-011-01` | 対象親の機能fixtureと責務境界を照合する。 | 機能判断は対応functional CASEで評価し、業務承認・事業成果は生成しない。 | 機能結果からowner/利用者判断、事業達成または独立business基準を推定したら不合格。 |
| `CASE-INTELLIGENCE-L10-BIZ-012-01` | `HELIXINTELLIGENCE-L2-012` | `AC-INTELLIGENCE-L3-012-01` | 対象親の機能fixtureと責務境界を照合する。 | 機能判断は対応functional CASEで評価し、業務承認・事業成果は生成しない。 | 機能結果からowner/利用者判断、事業達成または独立business基準を推定したら不合格。 |
| `CASE-INTELLIGENCE-L10-BIZ-013-01` | `HELIXINTELLIGENCE-L2-013` | `AC-INTELLIGENCE-L3-013-01` | 対象親の機能fixtureと責務境界を照合する。 | 機能判断は対応functional CASEで評価し、業務承認・事業成果は生成しない。 | 機能結果からowner/利用者判断、事業達成または独立business基準を推定したら不合格。 |
| `CASE-INTELLIGENCE-L10-BIZ-014-01` | `HELIXINTELLIGENCE-L2-014` | `AC-INTELLIGENCE-L3-014-01` | 対象親の機能fixtureと責務境界を照合する。 | 機能判断は対応functional CASEで評価し、業務承認・事業成果は生成しない。 | 機能結果からowner/利用者判断、事業達成または独立business基準を推定したら不合格。 |
| `CASE-INTELLIGENCE-L10-BIZ-015-01` | `HELIXINTELLIGENCE-L2-015` | `AC-INTELLIGENCE-L3-015-01` | 対象親の機能fixtureと責務境界を照合する。 | 機能判断は対応functional CASEで評価し、業務承認・事業成果は生成しない。 | 機能結果からowner/利用者判断、事業達成または独立business基準を推定したら不合格。 |
| `CASE-INTELLIGENCE-L10-BIZ-016-01` | `HELIXINTELLIGENCE-L2-016` | `AC-INTELLIGENCE-L3-016-01` | 対象親の機能fixtureと責務境界を照合する。 | 機能判断は対応functional CASEで評価し、業務承認・事業成果は生成しない。 | 機能結果からowner/利用者判断、事業達成または独立business基準を推定したら不合格。 |
| `CASE-INTELLIGENCE-L10-BIZ-018-01` | `HELIXINTELLIGENCE-L2-018` | `AC-INTELLIGENCE-L3-018-01` | 対象親の機能fixtureと責務境界を照合する。 | 機能判断は対応functional CASEで評価し、業務承認・事業成果は生成しない。 | 機能結果からowner/利用者判断、事業達成または独立business基準を推定したら不合格。 |
| `CASE-INTELLIGENCE-L10-BIZ-019-01` | `HELIXINTELLIGENCE-L2-019` | `AC-INTELLIGENCE-L3-019-01` | 対象親の機能fixtureと責務境界を照合する。 | 機能判断は対応functional CASEで評価し、業務承認・事業成果は生成しない。 | 機能結果からowner/利用者判断、事業達成または独立business基準を推定したら不合格。 |
| `CASE-INTELLIGENCE-L10-BIZ-020-01` | `HELIXINTELLIGENCE-L2-020` | `AC-INTELLIGENCE-L3-020-01` | 対象親の機能fixtureと責務境界を照合する。 | 機能判断は対応functional CASEで評価し、業務承認・事業成果は生成しない。 | 機能結果からowner/利用者判断、事業達成または独立business基準を推定したら不合格。 |
| `CASE-INTELLIGENCE-L10-BIZ-067-01` | `HELIXINTELLIGENCE-L2-067` | `AC-INTELLIGENCE-L3-067-01` | 対象親の機能fixtureと責務境界を照合する。 | 機能判断は対応functional CASEで評価し、業務承認・事業成果は生成しない。 | 機能結果からowner/利用者判断、事業達成または独立business基準を推定したら不合格。 |
| `CASE-INTELLIGENCE-L10-BIZ-072-01` | `HELIXINTELLIGENCE-L2-072` | `AC-INTELLIGENCE-L3-072-01` | 対象親の機能fixtureと責務境界を照合する。 | 機能判断は対応functional CASEで評価し、業務承認・事業成果は生成しない。 | 機能結果からowner/利用者判断、事業達成または独立business基準を推定したら不合格。 |
| `CASE-INTELLIGENCE-L10-BIZ-073-01` | `HELIXINTELLIGENCE-L2-073` | `AC-INTELLIGENCE-L3-073-01` | 対象親の機能fixtureと責務境界を照合する。 | 機能判断は対応functional CASEで評価し、業務承認・事業成果は生成しない。 | 機能結果からowner/利用者判断、事業達成または独立business基準を推定したら不合格。 |
| `CASE-INTELLIGENCE-L10-BIZ-078-01` | `HELIXINTELLIGENCE-L2-078` | `AC-INTELLIGENCE-L3-078-01` | 対象親の機能fixtureと責務境界を照合する。 | 機能判断は対応functional CASEで評価し、業務承認・事業成果は生成しない。 | 機能結果からowner/利用者判断、事業達成または独立business基準を推定したら不合格。 |

review08追補の005/016/067/072各機能fixtureは対応ACへtraceする。独立business基準や業務成果の承認は追加せず、比較成立・候補成立・修復結果照合からownerの業務判断を生成しない。
