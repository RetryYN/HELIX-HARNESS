---
plan_id: PLAN-L5-104-python-runtime-toolchain-freeze
title: "PLAN-L5-104 (add-design): Python semantic core runtime toolchainを凍結する"
kind: add-design
layer: L5
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: VERSION_UP
entry_signals:
  - "po_directive:Issue #1734のclassifyVerificationVerb canaryに先行してIssue #242のPython exact runtime authorityを確定する"
created: 2026-09-12
updated: 2026-09-12
owner: Codex / TL
github_issue_id: 242
behavior_contract_id: PYTHON-RUNTIME-TOOLCHAIN-FREEZE-001
responsibility_owner: python-semantic-runtime
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "ADR-009/010、PLAN-L3-50、PLAN-L6-1734、PLAN-L6-108とPython公式3.14.7 release authorityを入力とする"
contract_postconditions: "CPython exact patch、build mode、provenance、artifact digest、signature、manifest/lock、SBOM、offline install、Linux/Windows取得経路、rollback identityがL5↔L8で一意になる"
contract_invariants: "Pythonはsemantic coreに限定し、Nodeだけがtransaction writerである。free-threadedとJITを暗黙defaultにせず、未検証runtimeをcanaryへ接続しない"
contract_failures: "version drift、provenance/signature/digest欠落、unlocked dependency、SBOM欠落、offline不一致、OS別identity fork、experimental mode暗黙有効化をfail-closeする"
tdd_red_required: true
mutation_oracle_required: true
red_at: "2026-09-12T02:35:32Z"
green_at: "2026-09-12T02:35:53Z"
mutation_oracle_evidence: "tests/python-runtime-toolchain-freeze.test.ts::U-PYRT-001 failed before src/runtime/python-runtime-toolchain-freeze.ts existed (module-not-found, exit 1), then passed 1/1 after the resolver was implemented (exit 0)"
complexity_effect: net_negative
complexity_justification: "runtime選択をworkerごとの暗黙設定にせず、一つのversioned authority receiptへ収束する"
removal_trigger: "後継Python runtime authorityへreceipt付きmigrationし3.14.7 consumerが0になった時"
parent_design: docs/design/helix/L5-detail/python-runtime-toolchain-freeze.md
pair_artifact: docs/test-design/helix/L8-python-runtime-toolchain-freeze-integration-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/python-runtime-toolchain-freeze.md, oracle_id: U-PYRT-001, test_path: tests/python-runtime-toolchain-freeze.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — runtime identity、provenance、lock境界" }
  - { role: qa, slot_label: "QA — signature、offline、SBOM、OS parity反例" }
  - { role: tl, slot_label: "TL — experimental modeとactivation境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L5-104-python-runtime-toolchain-freeze.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/python-runtime-toolchain-freeze.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-python-runtime-toolchain-freeze-integration-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/python-runtime-toolchain-freeze.ts, artifact_type: source_module }
  - { artifact_path: tests/python-runtime-toolchain-freeze.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/design/helix/L5-detail/python-worker-runtime.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: docs/plans/PLAN-L6-1734-python-semantic-foundation-canary-boundary.md
  requires:
    - docs/plans/PLAN-L6-1734-python-semantic-foundation-canary-boundary.md
    - docs/plans/PLAN-L6-108-python-semantic-canary-pair-freeze.md
  blocks:
    - issue:1734-python-runtime-canary
review_evidence: []
---

# Python runtime toolchainのL5↔L8 freeze

## §工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | CPython 3.14.7通常buildのsource／binary identityを固定 | version文字列だけでなく取得元、artifact digest、署名検証手順が一意 |
| 2 | manifest／lock／SBOM／offline installを固定 | unlocked解決、未収録component、network fallbackを拒否できる |
| 3 | Linux canonicalとWindows compatibilityの取得経路を固定 | 同一semantic fixtureでruntime identity forkが0 |
| 4 | free-threaded／JITとrollbackを固定 | 両modeはdefault無効、採用は別計測PLAN、3.14.7通常buildへ一操作で戻せる |
| 5 | L8 negative oracleと独立reviewを閉じる | mutation全件kill、blocker 0のexact-HEAD receipt |

runtime source、worker起動、canary activation、distribution publishは後続PLANへ分離する。

## §実測済み候補境界

2026-09-12にPython 3.14.7公式release surfaceからLinux source tarballとWindows x64 installer、各
Sigstore bundle、SPDX 2.3 SBOMを取得した。release page掲載SHA-256と実bytesが一致し、`uvx sigstore verify identity
--offline`で`hugo@python.org`／`https://github.com/login/oauth`を束縛して両artifactがOKとなった。
artifact digestのexact setはL5設計へ記録した。lock producer候補はattestation検証済み`uv 0.12.0`、正本形式は
`pyproject.toml`＋`uv.lock`、PEP 751 `pylock.toml`は一方向監査projectionとした。3.14.7不在環境での
offline lockがexit 2となり旧interpreterへfallbackしないことも実測した。source build、実lock生成、offline sync、
rollback rehearsalは未実証なので、本PLANはdraftを維持する。
