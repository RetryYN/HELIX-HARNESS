---
layer: L8
sub_doc: unit-test-design
status: confirmed
pair_artifact: docs/design/harness/L6-function-design/historical-vpair-migration-authority.md
plan: docs/plans/PLAN-L6-75-historical-vpair-migration-authority.md
---

# historical Vペア migration authority テスト・検証設計

## 1. 検証方針

fixture Git repository、施行日前後のcommit、versioned baseline、current review scopeを使う。
件数はfixtureとdynamic censusから導出し、production観測値をassertion定数にしない。production観測値は
監査レポートとして比較し、保存則と分類根拠を検証する。

## 2. 単体oracle

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-HVMA-001 | cutoff SSoT | `L8_PAIR_ENFORCEMENT_DATE`を共有し、pinned cutoff treeにpath/identityがあればhistorical側、無ければpost違反になる | `tests/historical-vpair-migration-authority.test.ts` |
| U-HVMA-002 | Git provenance | cutoff後に追加したPLANのauthor/committer/frontmatter `created`を2026-07-07へbackdateしてもpost違反を維持し、orphan/unrelated cutoff commitも拒否する | `tests/historical-vpair-migration-authority.test.ts` |
| U-HVMA-003 | baseline pin | strict schema、tracked bytes、repo/cutoff commit/tree、initial census、previous/full-set digest、row fingerprint/path/blob/semantic digestの一つでも不一致ならpinned backlogにしない | `tests/historical-vpair-migration-authority.test.ts` |
| U-HVMA-004 | post baseline | 施行後PLANがbaselineに収載されてもpost違反を維持する | `tests/historical-vpair-migration-authority.test.ts` |
| U-HVMA-005 | design非authority | confirmed L6 designだけではbinding/eligibleを生成しない | `tests/historical-vpair-migration-authority.test.ts` |
| U-HVMA-006 | no inference | prose、類似名、green command、共通testからoracle/gate/capabilityを推測しない | `tests/historical-vpair-migration-authority.test.ts` |
| U-HVMA-007 | admission・保存則・tag | source全decisionをadmitted/rejectedへexactly-once分け、admitted primaryは排他的、assisted tagは非排他的で総数を変えない | `tests/historical-vpair-migration-authority.test.ts` |
| U-HVMA-008 | dynamic census | non-impl、別classification、bindingあり、path/ID不一致をtyped rejectionへ保持し、追加・削除・順序driftをscope digestとexact setで検出する | `tests/historical-vpair-migration-authority.test.ts` |
| U-HVMA-009 | append-only review | duplicate verdict、同一identity、stale、chain/digest改ざんを拒否する | `tests/historical-vpair-migration-authority.test.ts` |
| U-HVMA-010 | promotion禁止 | outputをregistry/closure applyへ渡せず、status/approval/registry bytesが不変である | `tests/historical-vpair-migration-authority.test.ts` |
| U-HVMA-011 | Git adversarial provenance | cutoff後NEW pathの三重backdate、target pathを持つnon-ancestor orphan、manifest/chain全再seal、CAS/recovery攻撃を実Git・実processで拒否する | `tests/historical-vpair-migration-adversarial.test.ts` |
| U-HVMA-012 | production read-only | real child CLIでauthority/run/review/full chainを通し、registry、persistent DB、WAL/SHM、全table件数、closure projectionが不変である | `tests/closure-authority-backfill-production-route.test.ts` |

## 3. integration・verification

| V-ID | 手順 | 期待 |
|---|---|---|
| IT-HVMA-001 | pinned cutoff commit/tree、施行日前後、baseline収載/未収載、assisted材料あり/なしを含むGit fixtureを分類する | source admission、primary class保存則、overlap tagが一致する |
| IT-HVMA-002 | current review-bundleを100件以下のwindowで全走査する（`tests/closure-authority-backfill-production-route.test.ts` `[PLAN-L7-437-historical-vpair-migration-authority/IT-HVMA-002]`） | dynamic totalとexact set/orderが一致し、cutoff treeのpath/identity実在性で分類し、観測値をhardcodeしない |
| ST-HVMA-001 | doctor/governance gateでpost-date baseline、semantic drift、promotion attemptを注入する | fail-closeし、registry/closure stateは不変 |

## 4. 完了証拠

- targeted unit/integration、PLAN lint、TypeScript、Biome、full fast suiteをgreenにする。
- independent reviewはproduction census counts、overlap、Git provenance digestを再計算する。
- human/action-binding対象を自動approveしないことをnegative oracleで示す。
