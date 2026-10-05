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


## Stage 4 — business pair参照

独立business resultを要求する固定親がないためBusiness CASEは追加しない。各機能CASEが確認する固定L11のowner・scope・source revision・unknown/returnを業務境界の観測として参照する。

| 固定親 | 内容oracle | 検証参照 |
|---|---|---|
| `HELIXINTELLIGENCE-L2-017` | L11 R2187-01該当行とL2 owner/return | `CASE-INT-017-01`, `CASE-INT-017-02a`〜`-02f`, `CASE-INT-017-03`, `CASE-INT-017-04`, `CASE-INT-017-05a`〜`-05k` |
| `HELIXINTELLIGENCE-L2-030` | L11 R2187-01該当行とL2 owner/return | `CASE-INT-030-01`, `CASE-INT-030-02a`〜`-02f`, `CASE-INT-030-03`, `CASE-INT-030-04`, `CASE-INT-030-05a`〜`-05k` |
| `HELIXINTELLIGENCE-L2-031` | L11 R2187-01該当行とL2 owner/return | `CASE-INT-031-01`, `CASE-INT-031-02a`〜`-02f`, `CASE-INT-031-03`, `CASE-INT-031-04`, `CASE-INT-031-05a`〜`-05k` |
| `HELIXINTELLIGENCE-L2-032` | L11 R2187-01該当行とL2 owner/return | `CASE-INT-032-01`, `CASE-INT-032-02a`〜`-02f`, `CASE-INT-032-03`, `CASE-INT-032-04`, `CASE-INT-032-05a`〜`-05k` |
| `HELIXINTELLIGENCE-L2-033` | L11 R2187-01該当行とL2 owner/return | `CASE-INT-033-01`, `CASE-INT-033-02a`〜`-02f`, `CASE-INT-033-03`, `CASE-INT-033-04`, `CASE-INT-033-05a`〜`-05k` |
| `HELIXINTELLIGENCE-L2-034` | L11 R2187-01該当行とL2 owner/return | `CASE-INT-034-01`, `CASE-INT-034-02a`〜`-02f`, `CASE-INT-034-03`, `CASE-INT-034-04`, `CASE-INT-034-05a`〜`-05k` |
| `HELIXINTELLIGENCE-L2-035` | L11 R2187-01該当行とL2 owner/return | `CASE-INT-035-01`, `CASE-INT-035-02a`〜`-02f`, `CASE-INT-035-03`, `CASE-INT-035-04`, `CASE-INT-035-05a`〜`-05k` |
| `HELIXINTELLIGENCE-L2-036` | L11 R2187-01該当行とL2 owner/return | `CASE-INT-036-01`, `CASE-INT-036-02a`〜`-02f`, `CASE-INT-036-03`, `CASE-INT-036-04`, `CASE-INT-036-05a`〜`-05k` |
| `HELIXINTELLIGENCE-L2-037` | L11 R2187-01該当行とL2 owner/return | `CASE-INT-037-01`, `CASE-INT-037-02a`〜`-02f`, `CASE-INT-037-03`, `CASE-INT-037-04`, `CASE-INT-037-05a`〜`-05k` |
| `HELIXINTELLIGENCE-L2-038` | L11 R2187-01該当行とL2 owner/return | `CASE-INT-038-01`, `CASE-INT-038-02a`〜`-02f`, `CASE-INT-038-03`, `CASE-INT-038-04`, `CASE-INT-038-05a`〜`-05k` |
| `HELIXINTELLIGENCE-L2-039` | L11 R2187-01該当行とL2 owner/return | `CASE-INT-039-01`, `CASE-INT-039-02a`〜`-02f`, `CASE-INT-039-03`, `CASE-INT-039-04`, `CASE-INT-039-05a`〜`-05k` |
| `HELIXINTELLIGENCE-L2-040` | L11 R2187-01該当行とL2 owner/return | `CASE-INT-040-01`, `CASE-INT-040-02a`〜`-02f`, `CASE-INT-040-03`, `CASE-INT-040-04`, `CASE-INT-040-05a`〜`-05k` |
| `HELIXINTELLIGENCE-L2-041` | L11 R2187-01該当行とL2 owner/return | `CASE-INT-041-01`, `CASE-INT-041-02a`〜`-02f`, `CASE-INT-041-03`, `CASE-INT-041-04`, `CASE-INT-041-05a`〜`-05k` |
| `HELIXINTELLIGENCE-L2-044` | L11 R2187-01該当行とL2 owner/return | `CASE-INT-044-01`, `CASE-INT-044-02a`〜`-02f`, `CASE-INT-044-03`, `CASE-INT-044-04`, `CASE-INT-044-05a`〜`-05k` |
| `HELIXINTELLIGENCE-L2-045` | L11 R2187-01該当行とL2 owner/return | `CASE-INT-045-01`, `CASE-INT-045-02a`〜`-02f`, `CASE-INT-045-03`, `CASE-INT-045-04`, `CASE-INT-045-05a`〜`-05k` |
