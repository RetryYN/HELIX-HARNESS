# HELIX全フェーズ Capability Inventory

status: initial_inventory
authority_effect: inventory_and_work_projection_only
inventory: `docs/governance/phase-capability-inventory.json`

## 目的

新規要求・設計・Scaffold・実装の前に、対象能力について現行・Scaffold・旧HELIX・候補・欠落を照会する。旧HELIXは実行せず、意味・到達層・実装状況・consumerを調べる参照に限定する。

本台帳の製品分類は要求採否、successor確定、設計freeze、実装許可を生成しない。各taskはGitHub Issueへ作業projectionし、代表assetから全consumer closureへ調査を広げる。

## 判定規則

- `legacy.exists`は代表assetが台帳に存在することを示す。現在利用可能であることを示さない。
- `maximum_layer_evidenced`は代表証拠で確認した旧到達層であり、その層の全条件成立や品質を示さない。
- `transition_assessment`は旧能力と現行状態の差を示す。`degraded`は現行正式能力が旧実装より浅い状態で、旧実装を復活させる判断ではない。
- `new_build_allowed`は全件`false`。旧asset、current candidate、Scaffold、consumer、要求差分の調査が完了し、既存能力で満たせない差分が記録されるまで新規実装しない。

## 初期分類

| Task | フェーズ | 製品 | 現行 | 旧HELIX到達 | 移行状態 |
|---|---|---|---|---|---|
| `PHCAP-01` | Concept／L1企画 | HELIX-HARNESS<br>HELIX-OS<br>HELIX-Web<br>HELIX-Web-OS | `approved_current` | `documented_and_governed` / L0, L1 | `rederived_current` |
| `PHCAP-02` | 要求収集・原登録 | HELIX-OS | `candidate_with_partial_current_registry` | `implemented_with_tests` / L6, L7 implementation/test | `degraded_to_candidate_and_static_registry` |
| `PHCAP-03` | 要求分類 | HELIX-HARNESS<br>HELIX-OS | `candidate` | `implemented_partial` / L4, L5, L6, L7 implementation | `degraded_to_candidate` |
| `PHCAP-04` | 要求採否／L2 | HELIX-HARNESS<br>HELIX-OS<br>HELIX-Web<br>HELIX-Web-OS | `draft_containers` | `documented_with_runtime_support` / L1, L3 | `degraded_to_unapproved_routing_containers` |
| `PHCAP-05` | L11受入 | HELIX-HARNESS<br>HELIX-OS<br>HELIX-Web<br>HELIX-Web-OS | `draft` | `documented_and_tested_partial` / L11, L12 | `degraded_to_draft` |
| `PHCAP-06` | Design／L3 | HELIX-HARNESS<br>HELIX-OS<br>HELIX-Web<br>HELIX-Web-OS | `candidate_only` | `documented_with_implementation_assets` / L3, L4, L5, L6 | `degraded_to_candidate` |
| `PHCAP-07` | Verification／L10 | HELIX-HARNESS<br>HELIX-OS<br>HELIX-Web<br>HELIX-Web-OS | `candidate_only` | `documented_and_tested` / L8, L9, L10 contract, L11, L12 | `not_reimplemented_formally` |
| `PHCAP-08` | WBS | HELIX-HARNESS<br>HELIX-OS | `approved_requirement_not_applied` | `equivalent_capabilities_found_no_explicit_wbs_asset` / L3, L7 implementation | `semantic_equivalence_unresolved` |
| `PHCAP-09` | Ticket生成 | HELIX-HARNESS<br>HELIX-OS | `candidate` | `documented_candidate` / candidate requirements, acceptance, L3 plan | `degraded_to_rederived_candidate` |
| `PHCAP-10` | Worker実行 | HELIX-OS | `draft_requirement_and_bootstrap_decision` | `implemented_with_tests` / L4, L5, L6, L7 implementation/test | `degraded_to_requirement_and_limited_bootstrap` |
| `PHCAP-11` | CI／Test | HELIX-HARNESS<br>HELIX-OS | `candidate_local_checks_only` | `implemented_with_workflows_and_tests` / L3, L4, L6, L7 implementation/test | `degraded_to_candidate_and_scaffold_local_checks` |
| `PHCAP-12` | Review convergence | HELIX-HARNESS<br>HELIX-OS | `scaffold_operating` | `implemented_with_tests` / L4, L5, L6, L7 implementation/test | `degraded_to_operating_contract_and_gui_scaffold` |
| `PHCAP-13` | Merge admission | HELIX-HARNESS<br>HELIX-OS | `operating_contract_only` | `implemented_with_system_test` / L3, L10 system test, L7 implementation | `degraded_to_manual_operating_contract` |
| `PHCAP-14` | Release | HELIX-HARNESS<br>HELIX-OS<br>HELIX-Web<br>HELIX-Web-OS | `requirement_candidate` | `implemented_partial_with_tests` / L3, L10 system test, L7 implementation | `degraded_to_candidate` |
| `PHCAP-15` | Deploy | HELIX-Web-OS<br>HELIX-OS | `draft_requirement` | `documented_partial` / L13 post-deploy, L7 plan | `degraded_to_draft` |
| `PHCAP-16` | 運用・監視 | HELIX-OS<br>HELIX-Web-OS | `draft_requirement` | `implemented_partial_with_tests` / L3, L6, L7 implementation/test | `degraded_to_draft_and_crosswalk` |
| `PHCAP-17` | Incident | HELIX-HARNESS<br>HELIX-OS<br>HELIX-Web-OS | `thin_candidate` | `documented_thin` / process, L7 plan | `degraded_and_incomplete` |
| `PHCAP-18` | Refactor | HELIX-HARNESS<br>HELIX-OS<br>HELIX-Web<br>HELIX-Web-OS | `requirement_candidate` | `implemented_with_tests` / candidate requirements, L5, L6, L7 implementation/test | `degraded_to_candidate` |
| `PHCAP-19` | Learning／改善 | HELIX-OS<br>HELIX-HARNESS<br>HELIX-Web<br>HELIX-Web-OS | `draft_requirement` | `implemented_with_acceptance_assets` / L3, L5, L6, L11 acceptance, L7 implementation | `degraded_to_draft` |
| `PHCAP-20` | Memory／継続再構成 | HELIX-OS | `draft_requirement` | `implemented_with_tests` / L3, L5, L6, L7 implementation/test | `degraded_to_draft` |

## 共通完了条件

各Issueは次を満たすまで完了にしない。

1. 代表assetだけでなく、legacy asset ledger上の関連assetとconsumer closureを列挙する。
2. 要求、設計、実装、test、運用証拠を分け、旧statusと実体の不一致を記録する。
3. 現行の正式・draft・candidate・Scaffold・missingを区別する。
4. 四製品のうち該当productと、複数製品ならunit／connection／compositeの分割点を記録する。
5. 未実装、縮退、重複、欠落、意味差分を記録し、旧assetの直接実行・copyを行わない。
6. 既存能力で承認済み要求を満たせない差分が確定するまで`new_build_allowed: false`を維持する。

## 初期集計

- フェーズ: 20
- 現行で承認済みの対象別上流: Concept／四製品L1
- 現行で正式L3／L10まで成立したフェーズ: 0
- Scaffoldが実運転中: Review convergenceの`SCF-B-0003`
- 旧実装・testまで代表証拠を確認: 要求登録、Worker、CI、Review、Merge、Refactor、Learning、Memoryほか
- 旧同名WBS asset: 0。等価候補のPLAN／roadmap／current-location／state DBを要意味比較

## 境界

Issue作成やcloseから要求採否、旧assetの再利用許可、L2/L11承認、L3/L10 freeze、実装開始を生成しない。旧CI・旧runtime・旧hook・旧testは実行しない。
