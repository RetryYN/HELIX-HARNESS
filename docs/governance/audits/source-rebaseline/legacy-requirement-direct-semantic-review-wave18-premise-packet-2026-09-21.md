# Wave18 旧HELIX要求直接semantic review premise packet（schema10 research-premise candidate）

## 状態と境界

- batch: `LEGACY-SEMANTIC-WAVE18-2026-09-21`
- 独立worktree: `/home/tenni/.helix-worktrees/legacy-semantic-review-wave18`
- base revision: `6dad906ed9a52c9e49611931645db2f298c6bf6a`
- Wave16 stacked prior: `74bfd04f7aa2384e1e30856ec6c29282b764e8c5`（current tree ledger/metaを固定SHAで照合）
- Wave17 stacked HEAD: `cd88a4e24bc95613548edc17076b9a1d3dceb538`（PR #1931、Wave16 `74bfd04f7...`上）。Wave18のprior meta／verifierは現行treeのledger/metaを固定SHA mapで参照し、git object単独には依存しない。
- scope: 4 product units / 9 atom inventory / 12 asset evidence edges; cumulative 54/218 units and 161 asset edges; 164 units remaining
- authority effect: `none`
- consumer closure: `pending`
- legacy execution: `not_run`
- new build: `false`

これはBR17-OS、BR18-OS、BR19-HARNESS、BR19-OSの意味境界と旧資産候補を独立検収するための下書きです。採否、実装成立、consumer closure、完了は確定しません。旧archiveは静的read-only参照だけに使い、旧runtime、test、hook、CI、adapterは実行していません。

JSONLのexcerpt digestは、対象ファイルの指定inclusive行を改行結合したUTF-8（末尾改行なし）へSHA-256を適用した値です。

## 要求sourceの固定

要求sourceはcatalog候補のpath一致だけでなく、Requirement IRの要求ID、semantic digest、原文markdown行を同時に固定します。共通IR assetはWave17と同様に要求sourceとして再利用しますが、実装・oracle・authorityには昇格させません。

- asset: `LEGACY-ASSET-A60CF91DD2AF6693E6F9`
- path: `requirements-ir/requirements.json`
- source SHA-256: `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`
- legacy raw source file: `docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md`
- raw source file SHA-256: `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`

| requirement | IR source span | raw source span | statement semantic digest | primary contract |
|---|---:|---:|---|---|
| HIL-BR-17 | `requirements.json:690-731` | `infinity-loop-platform-requirements.md:69` | `sha256:e55bdf0ac2daabc541038f11887fd2099993870993dc131097955ca9f817c1a1` | HR-FR-HIL-03 / HIA-BR-017 |
| HIL-BR-18 | `requirements.json:733-774` | `infinity-loop-platform-requirements.md:70` | `sha256:e13f07c964cce52474bd87f8b2dc688e0c80e5c142260b32e2086886be523db8` | HR-FR-HIL-08 / HIA-BR-018 |
| HIL-BR-19 | `requirements.json:776-817` | `infinity-loop-platform-requirements.md:71` | `sha256:95d7e1242d77cdba8ed1447e36382caf4e23413b6d5a3d40241feffa5a6521d1` | HR-FR-HIL-13 / HIA-BR-019 |

## unitとatom境界

| unit | product scope | phase candidates | atoms | shared boundary | routing state |
|---|---|---|---:|---|---|
| `IRUNIT-HIL-BR-17-HELIX-OS` | HELIX-OS | PHCAP-09 / 12 / 18 / 20 | 5 | A01-A04 shared with BR17-HARNESS、A05 OS downstream | split_required、human review pending |
| `IRUNIT-HIL-BR-18-HELIX-OS` | HELIX-OS | PHCAP-10 | 1 | product-exclusive | single_product candidate、meaning change pending |
| `IRUNIT-HIL-BR-19-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-11 / 14 | 1 | A01 shared with BR19-OS | split_required |
| `IRUNIT-HIL-BR-19-HELIX-OS` | HELIX-OS | PHCAP-11 / 14 | 2 | A02 shared with BR19-HARNESS、A01 OS-specific | split_required、`unresolved_target` |

BR17-OSのatomは、mechanical disposition、successor scope、finding drop prohibition、successor reentry prohibition、Issue／Universal Reverse／memory要約／Codex ready queueへのcausality chainです。A02は原文どおり `独立責務・別設計・lifecycle・性能改善だけを` とし、`successor_issue`を「後続候補」へ弱めません。原文の接続語 `` `successor_issue`として `` はA02からA05へのconnection recordとして保持しますが、upstream decompositionのsource_text_spansにはないため、lossless atomizationとsuccessor identityは未確認のholdです。BR17-HARNESSはWave5で既レビューのため、Wave18ではOS側だけを対象にし、shared atomは二重計上しません。

BR18-OSは、生成、lease、実行、checkpoint、検証、解放、quarantine、retireまでのinstance lifecycleを一つのatomとして保持します。旧文書のHARNESS owner表現をOSへ再配置する候補ですが、意味変更は未承認です。

BR19は、HARNESS側の全active surface完了条件、OS側の「Nodeでも一部動く状態ではない」条件と全active surface完了条件へ分けます。BR19は`legacy-ir-target-routing-queue.jsonl`で`unresolved_target`、`IR-ROUTE-Q1`、`runtime_or_technology_constraint_product_contract_vs_internal_implementation`が残っているため、HARNESS/OSの2 unitは候補境界として保持し、target確定とは扱いません。

## selected asset evidence（catalog exact）

要求asset以外の候補はWave1〜16のnonrequirement assetと重複せず、Wave17 current-treeで選ばれたC3DE/E999/CA0/11770/F151とも重複しません。全候補はhistoricalかつ未採否で、現行pathへcopy／verbatim reuseしていません。

| unit / role | asset ID | path | source SHA-256 | static semantic reading |
|---|---|---|---|---|
| BR17-OS / design | `LEGACY-ASSET-1BE290A45D9095E0F803` | `docs/design/helix/L5-detail/github-pr-audit-promotion.md` | `bbb2f1662d44196d399066da8c4f29ba2dfdea4815a9d4a58f3f898925800eb2` | FindingDispositionGate、FindingPromotionPipeline、4 target atomic promotionのdraft設計 |
| BR17-OS / implementation | `LEGACY-ASSET-7188688E58AC57AF27CC` | `src/lint/issue-closure-graph.ts` | `8df2a17348debb329917eeacfbd2feb883a862fc553ab9cf23c5706b93215033` | successor issueの欠落・unresolved検査のみ。promotion authorityではない |
| BR18-OS / design | `LEGACY-ASSET-D4E9C31E6AE7D18CA11D` | `docs/design/helix/L6-function-design/harness-agent-lifecycle.md` | `7c3fbb7c6f0ea8dcbdb8cdb7e06143331455f48c59263f29f970ae5c79a9e275` | instance lifecycle、lease、checkpoint、verify、quarantine、retireの設計候補 |
| BR18-OS / implementation | `LEGACY-ASSET-1C71A99A33A288FF901D` | `src/runtime/agent-slots.ts` | `1151a2ddb6b57581759a82bbaf799a722047070d0fa76d422a49bb46628b2168` | fire／release／stale slotのみ。fail-openで正本lifecycleではない |
| BR19-H/OS / design | `LEGACY-ASSET-F54C515C9BB8965C1F4A` | `docs/design/helix/L6-function-design/node-runtime-cutover.md` | `50e5f918079220551310bb8aaf8431e640a91ce13fd83ccb1de480ba1b9b88c1` | Node LTS、Bun surface inventory、active／quarantine／stale gate。両product boundaryで静的照合 |
| BR19-H / implementation | `LEGACY-ASSET-F38F4C78F60DF814428A` | `src/setup/distribution-lite-consumer-lifecycle.ts` | `5423f32bcd4fbad71f2d5a0537e422d197849a9975062cd5bbf40bcd85fc9839` | distribution pin／rollback／consumer snapshotのみ。Bun除去完了ではない |
| BR19-OS / implementation | `LEGACY-ASSET-4AB89A46AE3C74CD5584` | `src/doctor/node-engine-runtime.ts` | `d68880ae0ed2574d9cb7902424b277131c8bf5760da66c116270384a2018d1df` | Node engines range／hard gateのみ。全active Bun surface inventoryではない |

## evidence／counterevidence

| unit | requirement | design | implementation | static evidence | counterevidence |
|---|---|---|---|---|---|
| BR17-OS | exact contract confirmed | Gate、Promotion、4 target設計候補 | successor closure graphの隣接検査のみ | disposition分類、current_pr_fix、successor_issue、causality targetの設計語彙 | atomic promotion receipt、4 target commit、consumer closure、current-head deliveryは未確認 |
| BR18-OS | exact contract confirmed | lifecycle API、lease、fence、checkpoint、verify、release、quarantine、retire候補 | fire/release/stale slotの部分挙動 | lifecycleの設計境界と旧slot記録 | fail-open、SubagentStop相関近似、lease fence・durable checkpoint・独立verify・retire正本なし |
| BR19-HARNESS | exact contract confirmed | Node/Bun cutover、全surface、active/quarantine/stale gate候補 | distribution pin／rollback／consumer snapshot | 配布consumerのpinとrollback保全 | Bun inventory、active 0、quarantine 0、全配布surface完走receiptなし |
| BR19-OS | exact contract confirmed | Node LTS、Bun detector、surface inventory、cutover gate候補 | Node engines range／hard gateの部分挙動 | Node runtime範囲検査 | Bun API/command/lock/CI/distribution全体の走査なし、clean Linux完走・active Bun 0なし |

BR17〜19のarchive coverage ledgerは`draft-defined / not-implemented`を記録しています。BR19はsystem test designに部分実装扱いの記録もあるため、Node engine／distributionをpartial adjacent evidenceとして残し、完了とは扱いません。旧設計・旧実装・test design・過去workflowの存在から実装成立を逆生成しません。

## phase／legacy implementation state draft

| unit | phase | current status | legacy capability status | transition assessment | draft gap |
|---|---|---|---|---|---|
| BR17-OS | PHCAP-09 | candidate | documented_candidate | degraded_to_rederived_candidate | ticket contract／issuer／GitHub projectionの分離未成立 |
| BR17-OS | PHCAP-12 | scaffold_operating | implemented_with_tests | degraded_to_operating_contract_and_gui_scaffold | 正式配送、receipt schema、再開、provider境界未成立 |
| BR17-OS | PHCAP-18 | requirement_candidate | implemented_with_tests | degraded_to_candidate | refactor routeと製品別backflow未成立 |
| BR17-OS | PHCAP-20 | draft_requirement | implemented_with_tests | degraded_to_draft | memory正本state、会話寿命、復旧、consumer分割未成立 |
| BR18-OS | PHCAP-10 | draft_requirement_and_bootstrap_decision | implemented_with_tests | degraded_to_requirement_and_limited_bootstrap | 正式L2/L11、L3/L10、worker runtime未成立。bootstrapはexecutorやoperation changeを成立させない |
| BR19-HARNESS | PHCAP-11 | candidate | implemented_with_workflow_and_test_design | degraded_to_candidate | 新世代CI、CI固有binding、profile、現行oracle未構築 |
| BR19-HARNESS | PHCAP-14 | requirement_candidate | implemented_partial_with_test_design | degraded_to_candidate | 製品別release責務、artifact、promotion、rollback未成立 |
| BR19-OS | PHCAP-11 | candidate | implemented_with_workflow_and_test_design | degraded_to_candidate | 新世代CI、CI固有binding、profile、現行oracle未構築 |
| BR19-OS | PHCAP-14 | requirement_candidate | implemented_partial_with_test_design | degraded_to_candidate | 製品別release責務、artifact、promotion、rollback未成立 |

phase capabilityは候補crosswalkであり、直接phase採否を確定しません。全行で`new_build_allowed=false`を維持します。

## unresolved holdと次の検収境界

- Wave17は`cd88a4e24bc95613548edc17076b9a1d3dceb538`のcurrent-tree ledger/metaを固定SHA mapで累計unit／edgeとprior metaへ接続する。PRのmerge admissionや完了は生成しない。
- BR17-OSはBR17-HARNESSとのshared atom symmetry、OS downstream causality chain、PHCAP-09/12/18/20のdirect phase reviewが未完了です。
- BR18-OSはOS routing候補と旧HARNESS owner表現のmeaning changeが未決です。
- BR19-HARNESS/OSはproduct splitとIR-ROUTE-Q1が未解決です。`candidate_product_targets`をauthorityへ昇格しません。
- source atomization、successor assignment、consumer closure、exact HEAD independent reviewは未完了です。
- 旧asset候補を現行pathへcopyせず、旧runtime／test／hook／CI／adapterも実行しません。

JSONL research-premise candidate: `docs/governance/legacy-requirement-direct-semantic-review-wave18.jsonl`。schema10 meta、method、status、review-response、verifierを同じ固定入力関係で作成した。このpacketからmerge、採否、実装完了は生成しない。
