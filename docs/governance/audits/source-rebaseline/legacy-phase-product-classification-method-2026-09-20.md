---
title: "旧HELIX要求・assetのphase／製品分類方法"
status: research_method
authority_effect: none
source_revision: legacy-generation-2026-09-14
current_evidence_revision: c51125b3af523d4efcc46a328f5bc948b9f82c79
---

# 旧HELIX要求・assetのphase／製品分類方法

## 目的

旧Requirement IR 153件と旧asset 4,020件を、現行四製品と`PHCAP-01`〜`PHCAP-20`へ候補分類する。分類は要求採否、successor確定、旧asset再利用、実装許可を生成しない。旧archiveはread-onlyで調べ、runtime、CI、test、hook、adapterを実行しない。

## 二つの軸

- `artifact_evidence_kind`: requirement、design、implementation source、test source、test design、operation document、plan、runtime-state evidence、configuration等、asset自体の種類。
- `capability_phase`: assetが説明・実装・検査する能力のphase。test、design、planの置き場所だけからphaseを決めず、basename、本文見出し、frontmatterの`pair_artifact`／`parent_design`／`plan`、参照要求、consumerを使う。

例えばreview receiptのtest sourceは`artifact_evidence_kind: test_source`であり、能力は`PHCAP-12`である。`tests/`にあることだけを理由に`PHCAP-11`へ置かない。releaseのL10 test designは`test_design`かつ`PHCAP-14`であり、L10というartifact layerだけを理由に`PHCAP-07`へ置かない。`docs/plans/`にあることだけを理由にWBSへ置かない。

## 製品候補

製品候補は[製品責務境界](../../../concept/product-boundary.md)へ照らす。

- HELIX-HARNESS: V-model、工程語彙、層／pair、要求・設計・検証契約、進行・完了条件、外部提供するconsumer package。
- HELIX-OS: project管理・統制、Worker、CI、GitHub運転、log、state、memory、learning、改善、配布運転。
- HELIX-Web: Web利用者が受け取るdashboard、操作、サービス体験。
- HELIX-Web-OS: tenant、Connector、job、service state、evidence projection、配備・監視・復旧。

旧path中の`harness`や`helix`だけで現行ownerを確定しない。明示的な現行targetがない旧assetは`candidate_product_targets`として記録し、`unresolved`を残す。複数製品に跨る場合は`unit`、`connection`、`composite`が未分割であることを記録する。

製品候補には現行製品境界へ結びつく直接根拠を保存する。直接根拠を記録していないworking batch由来の候補はlow confidenceとし、候補があっても`product_candidate_requires_semantic_review`を残す。

## phase候補

| ID | 能力主体 |
|---|---|
| `PHCAP-01` | Concept／L1企画 |
| `PHCAP-02` | 要求の原event受付・原登録 |
| `PHCAP-03` | 要求意味の分類・refinement・translation |
| `PHCAP-04` | 要求採否・L2 authority |
| `PHCAP-05` | L11受入契約 |
| `PHCAP-06` | Design／L3以降の左腕設計とtemplate |
| `PHCAP-07` | Verification／L10等の右腕契約とoracle |
| `PHCAP-08` | WBS、work decomposition、location ledger |
| `PHCAP-09` | ticket contract／ticket graph生成 |
| `PHCAP-10` | Worker、agent、execution、lease、orchestration |
| `PHCAP-11` | CI synthesis、test execution、build／check運転 |
| `PHCAP-12` | review request、finding、receipt、review convergence |
| `PHCAP-13` | merge admission、merge、post-merge read-after |
| `PHCAP-14` | package、distribution、promotion、release、rollback |
| `PHCAP-15` | deployment、post-deploy verification |
| `PHCAP-16` | operation、monitoring、telemetry、service health |
| `PHCAP-17` | incident、recovery、postmortem |
| `PHCAP-18` | refactor、redesign、retrofit、performance improvement |
| `PHCAP-19` | learning、improvement candidate、promotion、feedback loop |
| `PHCAP-20` | memory、continuation、handover、compaction、retention |

複数phaseの義務を一assetが持つ場合は候補を複数記録し、`requires_semantic_split`を残す。共通設定、汎用tool、repository metadata、証拠不足のassetは無理に割り当てず`unresolved`とする。

inventoryの代表asset、phaseを明示するbasename、phase対応を示すfrontmatterは直接根拠として扱える。`layer`、`canonical_layer`、`legacy_physical_layer`、`paired_requirement_layer`、`canonical_layer_scheme`、`canonical_vmodel`、`canonical_pair`はartifact layer／pairの記述であり、それだけではcapability phaseのhigh confidence根拠にしない。本文や一般的なsubjectに`event`、`finding`、`operation`、`recovery`等が現れるだけでもhigh confidenceにしない。根拠が空の候補は保持しない。test design／verification planは検査artifactであることと検査対象capabilityを分け、対象capabilityが未確認ならphase候補をmedium以下に留める。

evidence tagは`inventory:representative_asset:<PHCAP-ID>`、`basename:<name>`、`frontmatter:<field>:<value>`、`frontmatter:<layer-field>=<layer>`、`path:<path>`、`heading:<ordinal>:<text>`、`subject:<term>`、`subject_path:<term>`、`body:<term>`のいずれかとする。`body`、`subject`、`path`、`heading`、artifact layer fieldだけの候補はmediumを上限とする。`doctor`を含むbasenameだけから`PHCAP-11`をhighにしない。

## 実装状況

静的存在と稼働状態を分離する。

| 状態 | 意味 |
|---|---|
| `document_present` | 文書assetのbytesがarchive manifestと一致 |
| `implementation_source_present_unexecuted` | 実装sourceが存在するが、実行・現行適合は未確認 |
| `test_source_present_unexecuted` | test sourceが存在するが、実行・pass・現行oracle適合は未確認 |
| `test_design_present_unexecuted` | test designが存在するが、test実装・実行・passは未確認 |
| `workflow_present_unexecuted` | workflowが存在するが、旧CIは未実行 |
| `runtime_state_evidence_present_unverified` | 旧runtime evidenceが存在するが、内容・再現性・現行適合は未確認 |
| `configuration_present_unexecuted` | 設定・scriptが存在するが、読み込み・実行は未確認 |
| `non_executable_source_snapshot` | 保存対象のread-only requirement source |

`implemented`、`tested`、`operational`、`verified`は、対応sourceの存在だけから生成しない。旧台帳の`implementation_status: unknown`を静的path分類で上書きしない。

## closure状態

- `classified_candidate`: `phase_classification_status`において能力phaseの直接根拠がある。製品候補の成立は表さず、`product_classification_status`とproduct evidenceを別に確認する。
- `multi_phase_candidate`: 複数phaseへ跨り、意味分割またはconsumer確認が必要。
- `unresolved`: 能力主体または製品候補を裏付ける証拠が足りない。
- `consumer_closure_pending`: `consumer_refs`が空、未検証、または全consumer集合との一致を証明していない。

4,020件の全IDを出力台帳へexact-setで含める。分類不能を欠落させず`unresolved`として数える。件数充足だけをsemantic closureと扱わない。

## 完了としない条件

次が一つでも残る限り全量closureを完了としない。

1. asset IDの欠落・重複。
2. 根拠のないphase／製品割当。
3. `consumer_closure_pending`。
4. 複数phase／複数製品の意味atom未分割。
5. Requirement IRのsuccessor未割当。
6. 現行要求への採否・L2／L11未判断。
