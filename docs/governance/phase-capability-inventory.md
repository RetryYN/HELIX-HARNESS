# HELIX全フェーズ Capability Inventory

status: initial_inventory
authority_effect: inventory_and_work_projection_only
inventory: `docs/governance/phase-capability-inventory.json`
github_projection: [親#1888と20件のphase task](https://github.com/RetryYN/HELIX-HARNESS/issues/1888)
projection_receipt: `docs/governance/audits/source-rebaseline/github-phase-capability-inventory-projection-2026-09-20.md`

## 目的

新規要求・設計・Scaffold・実装の前に、対象能力について現行・Scaffold・旧HELIX・候補・欠落を照会する。旧HELIXは実行せず、意味・到達層・実装状況・consumerを調べる参照に限定する。

本台帳の製品分類は要求採否、successor確定、設計freeze、実装許可を生成しない。[premise packet](audits/source-rebaseline/phase-capability-inventory-premise-packet-2026-09-20.md)が一つの判断論点、証拠時点、known／assumption／unknown／conflict／stale、限界、反例、再調査条件を固定する。各taskはGitHub Issueへ作業projectionし、代表assetから全consumer closureへ調査を広げる。

## 判定規則

- `product_targets`は調査すべき候補scopeである。`current.evidence_products`だけがcurrent refで直接裏付けた製品であり、候補scopeに含むだけではその製品の要求・設計・実装は成立しない。
- current refはJSONの`current_evidence_snapshot`でmain `e784fa68702af4b7c57911b866b48fe7df094f88`のbytes digestへ束縛する。snapshot自体は各refのauthorityを変更しない。
- `legacy.exists`は代表assetが台帳に存在することを示す。現在利用可能であることを示さない。
- `maximum_layer_evidenced`は代表証拠のartifact layerで確認した旧到達層であり、その層の全条件成立や品質を示さない。runbookの適用先のようなcross-layer applicabilityは到達層へ数えない。
- `capability_status`は代表assetの種別と存在を示す。`test`／`acceptance`を含む語も旧testの実行、pass、confirmed status、現行oracle適合を示さない。
- `transition_assessment`は旧能力と現行状態の差を示す。`degraded`は現行正式能力が旧実装より浅い状態で、旧実装を復活させる判断ではない。
- `new_build_allowed`は全件`false`。これは調査、consumer closure、要求分類、要求判断準備、inventory更新を止めない。旧asset、current candidate、Scaffold、consumer、要求差分の調査が完了し、既存能力で満たせない差分が記録されるまで、新しいphase capabilityの設計artifact・実装用Scaffold・実装を起こさない。既存のBinding登録済みoperating Scaffoldは個別Bindingのscope内で保持し、source／evidence保持用Scaffoldは下記の条件を満たす場合に限り調査・inventory更新の一部として扱う。

### 新しいphase capability buildと既存Scaffoldの射程

ここで停止する`new_scaffold`は、新しいphase capabilityのcontract、runtime、adapter、CI、正式な設計・実装を追加するScaffoldである。新しいoperating Scaffoldの登録・追加はこの例外から許可しない。

すでにScaffold Bindingへ登録されたoperating Scaffoldは、個別Bindingのrole、obligations、connections、operationsの範囲で保持する。運用中であること、scriptやhandoffを持つこと、検査に合格することから、`new_build_allowed:true`、capability authority、要求採否、完了を生成しない。`SCF-B-0003`はこの既存Bindingのscopeに従う。

source／inventory／静的evidence／negative caseを保持するBinding登録済みScaffoldは、`inventory_research`または`inventory_update`の範囲で許可する。この保持束は再現可能な静的検査を行えても、`authority_effect:none`、`new_build_allowed:false`を維持し、capability contract、runtime、adapter、CI、正式な設計・実装・完了、要求採否、successor、ownerを生成しない。

## 初期分類

| Task | フェーズ | 候補scope製品 | 現行証拠製品 | 現行 | 旧HELIX到達 | 移行状態 |
|---|---|---|---|---|---|---|
| `PHCAP-01` | Concept／L1企画 | HELIX-HARNESS<br>HELIX-OS<br>HELIX-Web<br>HELIX-Web-OS | HELIX-HARNESS<br>HELIX-OS<br>HELIX-Web<br>HELIX-Web-OS | `approved_current` | `documented_and_governed` / L0, L1 | `rederived_current` |
| `PHCAP-02` | 要求収集・原登録 | HELIX-OS | HELIX-OS | `candidate_with_partial_current_registry` | `implemented_with_tests` / L6, L7 implementation/test | `degraded_to_candidate_and_static_registry` |
| `PHCAP-03` | 要求分類 | HELIX-HARNESS<br>HELIX-OS | HELIX-HARNESS<br>HELIX-OS | `candidate` | `implemented_partial` / L4, L5, L6, L7 implementation | `degraded_to_candidate` |
| `PHCAP-04` | 要求採否／L2 | HELIX-HARNESS<br>HELIX-OS<br>HELIX-Web<br>HELIX-Web-OS | HELIX-HARNESS<br>HELIX-OS<br>HELIX-Web<br>HELIX-Web-OS | `draft_containers` | `documented_with_runtime_support` / L1, L3 | `degraded_to_unapproved_routing_containers` |
| `PHCAP-05` | L11受入 | HELIX-HARNESS<br>HELIX-OS<br>HELIX-Web<br>HELIX-Web-OS | HELIX-HARNESS<br>HELIX-OS<br>HELIX-Web<br>HELIX-Web-OS | `draft` | `documented_with_test_design_partial` / L11, L12 | `degraded_to_draft` |
| `PHCAP-06` | Design／L3 | HELIX-HARNESS<br>HELIX-OS<br>HELIX-Web<br>HELIX-Web-OS | HELIX-HARNESS<br>HELIX-OS | `candidate_only` | `documented_with_implementation_assets` / L3, L4, L5, L6 | `degraded_to_candidate` |
| `PHCAP-07` | Verification／L10 | HELIX-HARNESS<br>HELIX-OS<br>HELIX-Web<br>HELIX-Web-OS | HELIX-HARNESS<br>HELIX-OS | `candidate_only` | `documented_with_test_design` / L8, L9, L10 contract, L11, L12 | `not_reimplemented_formally` |
| `PHCAP-08` | WBS | HELIX-HARNESS<br>HELIX-OS | HELIX-HARNESS<br>HELIX-OS | `approved_requirement_not_applied` | `equivalent_capabilities_found_no_explicit_wbs_asset` / L3, L7 implementation | `semantic_equivalence_unresolved` |
| `PHCAP-09` | Ticket生成 | HELIX-HARNESS<br>HELIX-OS | HELIX-HARNESS<br>HELIX-OS | `candidate` | `documented_candidate` / candidate requirements, acceptance, L3 plan | `degraded_to_rederived_candidate` |
| `PHCAP-10` | Worker実行 | HELIX-OS | HELIX-OS | `draft_requirement_and_bootstrap_decision` | `implemented_with_tests` / L4, L5, L6, L7 implementation/test | `degraded_to_requirement_and_limited_bootstrap` |
| `PHCAP-11` | CI／Test | HELIX-HARNESS<br>HELIX-OS | HELIX-HARNESS<br>HELIX-OS | `candidate` | `implemented_with_workflow_and_test_design` / L3, L4, L6, L7 implementation/workflow, L10 test design | `degraded_to_candidate` |
| `PHCAP-12` | Review convergence | HELIX-HARNESS<br>HELIX-OS | HELIX-HARNESS<br>HELIX-OS | `scaffold_operating` | `implemented_with_tests` / L4, L5, L6, L7 implementation/test, L9 test design | `degraded_to_operating_contract_and_gui_scaffold` |
| `PHCAP-13` | Merge admission | HELIX-HARNESS<br>HELIX-OS | HELIX-HARNESS<br>HELIX-OS | `operating_contract_only` | `implemented_with_draft_system_test_design` / L3, L7 implementation, L10 draft system test design | `degraded_to_manual_operating_contract` |
| `PHCAP-14` | Release | HELIX-HARNESS<br>HELIX-OS<br>HELIX-Web<br>HELIX-Web-OS | HELIX-HARNESS<br>HELIX-OS | `requirement_candidate` | `implemented_partial_with_test_design` / L3, L7 implementation, L10 system test design | `degraded_to_candidate` |
| `PHCAP-15` | Deploy | HELIX-Web-OS<br>HELIX-OS | HELIX-OS<br>HELIX-Web-OS | `draft_requirement` | `documented_partial` / L13 post-deploy, L13 plan | `degraded_to_draft` |
| `PHCAP-16` | 運用・監視 | HELIX-OS<br>HELIX-Web-OS | HELIX-OS<br>HELIX-Web-OS | `draft_requirement` | `implemented_partial_with_tests` / L3, L6, L7 implementation/test, L10 test design | `degraded_to_draft_and_crosswalk` |
| `PHCAP-17` | Incident | HELIX-HARNESS<br>HELIX-OS<br>HELIX-Web-OS | HELIX-OS<br>HELIX-Web-OS | `thin_candidate` | `documented_thin` / process, L7 plan | `degraded_and_incomplete` |
| `PHCAP-18` | Refactor | HELIX-HARNESS<br>HELIX-OS<br>HELIX-Web<br>HELIX-Web-OS | HELIX-HARNESS<br>HELIX-OS | `requirement_candidate` | `implemented_with_tests` / candidate requirements, L5, L6, L7 implementation/test | `degraded_to_candidate` |
| `PHCAP-19` | Learning／改善 | HELIX-OS<br>HELIX-HARNESS<br>HELIX-Web<br>HELIX-Web-OS | HELIX-OS | `draft_requirement` | `implemented_with_acceptance_design_assets` / L3, L5, L6, L7 implementation, L10 acceptance design | `degraded_to_draft` |
| `PHCAP-20` | Memory／継続再構成 | HELIX-OS | HELIX-OS | `draft_requirement` | `implemented_with_tests` / L3, L5, L6, L7 implementation/test | `degraded_to_draft` |

## 共通完了条件

各Issueは次を満たすまで完了にしない。

1. 代表assetだけでなく、legacy asset ledger上の関連assetとconsumer closureを列挙する。
2. 要求、設計、実装、test、運用証拠を分け、旧statusと実体の不一致を記録する。
3. 現行の正式・draft・candidate・Scaffold・missingを区別する。
4. 四製品のうち該当productと、複数製品ならunit／connection／compositeの分割点を記録する。
5. 未実装、縮退、重複、欠落、意味差分を記録し、旧assetの直接実行・copyを行わない。
6. 既存能力で承認済み要求を満たせない差分が確定するまで`new_build_allowed: false`を維持する。調査・consumer closure・要求分類・要求判断準備・inventory更新は継続し、新しいphase capabilityの設計artifact・実装用Scaffold・実装だけを停止する。既存Binding登録済みoperating Scaffoldは個別Bindingのscopeと`authority_effect:none`の範囲で保持し、新しいoperating Scaffoldの追加はこの規則から許可しない。source／evidence保持用Scaffoldは、`scaffold/`名前空間、Binding登録、`authority_effect:none`、`new_build_allowed:false`、capability contract／runtime／adapter／CIなしの条件を満たす場合に限り継続できる。

## 初期集計

- フェーズ: 20
- 現行で承認済みの対象別上流: Concept／四製品L1
- 現行で正式L3／L10まで成立したフェーズ: 0
- Binding登録済みoperating Scaffoldが運用中: Review convergenceの`SCF-B-0003`。個別Bindingのscope内で保持され、運用・handoff・検査合格は新しいcapability実装の許可や完了を示さない
- 旧実装・test sourceまで代表証拠を確認: 要求登録、Worker、Review、Refactor、Memoryほか。test designだけのphaseは実行済みと扱わない
- 旧同名WBS asset: 0。等価候補のPLAN／roadmap／current-location／state DBを要意味比較

## 境界

Issue作成やcloseから要求採否、旧assetの再利用許可、L2/L11承認、L3/L10 freeze、実装開始を生成しない。旧CI・旧runtime・旧hook・旧testは実行しない。
