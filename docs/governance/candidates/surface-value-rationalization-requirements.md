---
title: "Skill／Agent／Command Surface価値・置換・authority整理要件候補"
layer: L3
status: draft_candidate
authority_status: proposed_pending_l3_confirmation
related_issue: 1382
plan_id: PLAN-L3-1382-surface-value-rationalization
parent_requirements: docs/governance/candidates/surface-value-rationalization-requests.md
pair_artifact: docs/governance/candidates/surface-value-rationalization-acceptance.md
---

# Skill／Agent／Command Surface価値・置換・authority整理要件候補

## 分類のexact set

各責務単位のsurfaceは次のうちexactly-oneへ分類する。複合surfaceは責務を分割してから分類する。

1. `KNOWLEDGE_ASSET`: repository、domain、provider、failure corpus等の検索可能な知識
2. `JUDGMENT_PACK`: 疑う観点、比較、停止条件、blocker基準
3. `MACHINE_POLICY`: branch、pair、HEAD、approval、budget等の機械強制規則
4. `PROVIDER_NATIVE_TECHNIQUE`: provider-native subagent／teamへ委譲可能な実行技法
5. `GENERIC_PROCEDURE`: provider／modelが既知でもHELIX固有差分を測る必要がある一般手順
6. `COMPATIBILITY_SURFACE`: 旧consumer／replayの一方向入力だけを担うsurface
7. `OS_CONTROL_SURFACE`: assignment、lease、fence、evidence、admission、recovery等HELIXが保持する外角責務

## 機能要件候補

| ID | 要件候補 |
|---|---|
| `SVR-R-01` | tracked command／agent／skill／rule／knowledgeをstable `surface_id`、`surface_type`、owner、current consumer、source HEAD、evidence windowへ束縛し、#1372のinventory／consumer graphを再利用する。 |
| `SVR-R-02` | 各責務単位を分類exact setの一つへ割り当てる。複合責務は分割し、同一surfaceの推測による多重分類と未分類を拒否する。 |
| `SVR-R-03` | `SurfaceValueAssessmentV1`はinvocation count、active days、consumer countと、output consumed rate、accepted change rate、defect detection rate、rework reductionを別fieldで保持する。 |
| `SVR-R-04` | context bytes／tokens、latency、maintenance changes、drift findings、測定方法、provider／model／設定、confidence、unknown fieldsを同じevidence windowへ束縛する。 |
| `SVR-R-05` | provider-native、machine policy、knowledge retrievalの各replacement、state authority、admission dependency、successor contractを別々に証明し、名称類似やmodel能力の主観を代替証拠にしない。 |
| `SVR-R-06` | dispositionは`KEEP`、`KNOWLEDGE_ASSET`、`JUDGMENT_PACK`、`MOVE_TO_POLICY`、`MOVE_TO_PROVIDER_NATIVE`、`COMPATIBILITY_ONLY`、`MERGE`、`REMOVE`のexact setとし、分類と処置を混同しない。 |
| `SVR-R-07` | 効果evidence不在は`unknown`とし、低価値、REMOVE、consumer 0へ推測変換しない。利用回数だけでKEEP／REMOVEを決めない。 |
| `SVR-R-08` | provider-native内部reviewと独立review laneとHELIX merge admissionを別authorityとして維持する。provider内subagent数や思考手順はlane内部責務だが、assignment、scope、branch、lease、budget、evidence、stop、merge authorityはHELIXが保持する。 |
| `SVR-R-09` | `helix codex`／`helix claude`はfallback、recovery、benchmark、task-level worker用途の実測前に削除しない。team／pair／loopのprimitiveは後継へ移管し、successor E2E、consumer migration、rollback成立後にのみdirect engine退役候補へ送る。 |
| `SVR-R-10` | `MACHINE_POLICY`をprose skillだけで強制しない。受領先の機械Policy／Guardが同一意味を実証するまでは旧保護を維持し、移管後は通常Skill注入から外す。 |
| `SVR-R-11` | compatibility／historical surfaceをcurrent setup、template、推薦、通常outputへ再生成しない。historical evidenceとread-only replayは改変せず保持できる。 |
| `SVR-R-12` | 処置候補は#863 ledger、#865 retirement gate、#1594 Skill移行へtyped joinし、canonical promotionとmain read-after後に#397へsource path、revision、digest、approval、owner、AC／oracle、downstreamを渡す。Issue proseから直接IRへ収載しない。 |

## 優先監査順

1. team／pair／old loopの直接実行authority
2. generic specialist agentsとsource／template二重投影
3. generic procedural skills
4. 重複skill family
5. startup injection／rule

順序は削除許可ではない。各対象は独立したconsumer、replacement、rollback証拠で処置する。

## 非機能要件候補

- `SVR-NFR-01 Fail-close`: unknown、曖昧分類、stale HEAD、欠落consumer、未証明successorを推測で補わない。
- `SVR-NFR-02 Authority-first`: runtime変更よりsource authorityとIR admissionを先行させる。
- `SVR-NFR-03 Atomicity`: 一つの処置／successor familyを原子sliceとし、全surface完了を局所移行の前提にしない。
- `SVR-NFR-04 Evidence preservation`: historical evidenceを改変せず、評価値のsource windowを再現可能にする。
