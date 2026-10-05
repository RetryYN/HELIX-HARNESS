# HELIX-INTELLIGENCE L10 業務総合検証（Stage 2a）

状態: 対のL3業務要件を検証する設計候補。業務結果を実測済みとは扱わない。業務要件の正本はL3 `business-requirements.md`であり、本書はそのACとfunctional CASEへのtraceをまとめる。

旧HELIXの受入test設計のpair trace（LEGACY-ASSET-44DD86E3DEC09E65EF51, `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:32-90,91-216`）およびwrong actor/scope/stale receipt mutationの設計（LEGACY-ASSET-437A6A68F9A9E0AE1B9E, `resident-lane-orchestration-acceptance.md:17-55`）を形式起点にする。旧Issue/PLAN authority、lane/lease機構、件数、test runtimeは再利用しない。

## BR-INT-010 — 根拠付きtask別配置提案

| 対象 | 業務oracle | 対応L3/functional L10 |
|---|---|---|
| 候補の根拠 | task属性・Worker capability・同scopeのLABO観測/Bench evidenceが提案理由と一致し、未評価は未評価 | `BR-INT-010`; `FR-INT-010`; `CASE-INT-010-01`, `CASE-INT-010-05`, `CASE-INT-010-06`, `CASE-INT-010-02a`, `CASE-INT-010-02b`, `CASE-INT-010-02c`, `CASE-INT-010-02d`, `CASE-INT-010-02e`, `CASE-INT-010-02f`, `CASE-INT-010-02g`, `CASE-INT-010-02h`, `CASE-INT-010-03a`, `CASE-INT-010-03b`, `CASE-INT-010-04a`, `CASE-INT-010-04b`, `CASE-INT-010-04c`, `CASE-INT-010-04d`, `CASE-INT-010-04e`, `CASE-INT-010-04f`, `CASE-INT-010-04g`, `CASE-INT-010-04h`, `CASE-INT-010-04i`, `CASE-INT-010-04j`, `CASE-INT-010-04k` |
| 責務 | INT proposal、LABO evaluation、OS assignment/progressが分離されている | `AC-INT-010-01`, `AC-INT-010-02`, `AC-INT-010-03`, `AC-INT-010-04`, `AC-INT-010-05`, `AC-INT-010-06`, `AC-INT-010-07`; `CASE-INT-010-02a`〜`CASE-INT-010-02h`, `CASE-INT-010-03a`〜`CASE-INT-010-03b`, `CASE-INT-010-04a`〜`CASE-INT-010-04k`, `CASE-INT-010-05`, `CASE-INT-010-06` |
| 不足/不一致 | task属性不足はOS、Bench/evidence適用scope不足はLABOへ返し案を未確定にする | `AC-INT-010-04`; `CASE-INT-010-04a`〜`CASE-INT-010-04k`, `CASE-INT-010-03a`, `CASE-INT-010-03b` |

合格材料はtask別proposalとそのsource/evidence/scope trace、unknown/未評価表示、owner returnの記録である。price/model/benchmark単独順位はpositive業務成果に数えない。

## BR-INT-066 — 人代行時もproposalとassignmentを分離

| 対象 | 業務oracle | 対応L3/functional L10 |
|---|---|---|
| runtimeあり | LABO-055/054同scope評価→INT proposal→OS別途審査/assignmentの通常経路を示す | `AC-INT-066-01`; `CASE-INT-066-01` |
| runtimeなし | 人が固定L2-010 schemaでproposalを供給し、originとreceiptを保つ | `AC-INT-066-02`; `CASE-INT-066-02` |
| authority境界 | human proposalはINT output/evaluation/assignment/permissionにならず、OSが受領とassignmentを分ける | `AC-INT-066-03、AC-INT-066-04、AC-INT-066-05、AC-INT-066-06、AC-INT-066-07、AC-INT-066-08`; `CASE-INT-066-03a、CASE-INT-066-03b、CASE-INT-066-03c、CASE-INT-066-04a、CASE-INT-066-04b、CASE-INT-066-04c、CASE-INT-066-04d、CASE-INT-066-05a〜05t、CASE-INT-066-06a〜06f、CASE-INT-066-07、CASE-INT-066-08a、CASE-INT-066-08b` |

このbusiness pairは2つの正常経路を一つへまとめない。receipt・scope・source/evidence/schema version欠落時はL3固定ownerへ戻す。人向け承認段階、manual approval、OS/LABO/INTELLIGENCEの新ownerを追加しない。
