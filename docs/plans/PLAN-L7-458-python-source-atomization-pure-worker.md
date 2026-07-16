---
plan_id: PLAN-L7-458-python-source-atomization-pure-worker
title: "PLAN-L7-458 (impl): Python source atomization pure worker"
kind: impl
layer: L7
drive: agent
status: confirmed
route_mode: forward
entry_signals: ["po_directive:2026-07-16 Python proposal-only worker first slice"]
created: 2026-07-16
updated: 2026-07-16
owner: Codex / TL
review_evidence:
  - reviewer: codex-independent-worker-review
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-16"
    tests_green_at: "2026-07-16"
    verdict: pass
    scope: "strict JSONL、Node独立再検証、authority field拒否、Python audit hookによる外部I/O default denyを確認。generic broker・DB commit・publishは非対象のまま。"
    worker_model: codex-gpt-5
    reviewer_model: codex-gpt-5-independent
irreversible_impact: none
backprop_decision: not_required
backprop_decision_reason: "既存L5/L6のclosed capabilityとproposal-only境界を変更せず、限定L8検証契約へ具体化する。"
parent_design: docs/design/helix/L6-function-design/python-source-atomization-pure-worker.md
pair_artifact: docs/test-design/helix/L8-python-source-atomization-contracts.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/python-source-atomization-pure-worker.md, oracle_id: U-PYATOM-001, test_path: tests/source-atomization-scrum-worker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/python-source-atomization-pure-worker.md, oracle_id: U-PYATOM-002, test_path: tests/source-atomization-scrum-worker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/python-source-atomization-pure-worker.md, oracle_id: U-PYATOM-003, test_path: tests/source-atomization-scrum-worker.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/python-source-atomization-pure-worker.md, oracle_id: U-PYATOM-004, test_path: tests/source-atomization-scrum-worker.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-458-python-source-atomization-pure-worker.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/python-source-atomization-pure-worker.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-python-source-atomization-contracts.md, artifact_type: test_design }
  - { artifact_path: src/runtime/source-atomization-scrum-worker.ts, artifact_type: source_module }
  - { artifact_path: workers/python/source_atomization_scrum_mode_v1/worker.py, artifact_type: source_module }
  - { artifact_path: tests/source-atomization-scrum-worker.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md
  requires:
    - docs/adr/ADR-009-node-python-linux-runtime.md
    - docs/design/helix/L5-detail/python-worker-runtime.md
    - docs/design/helix/L6-function-design/python-worker-runtime.md
    - docs/test-design/helix/L6-python-worker-runtime-unit-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — pure Python atomization worker" }
  - { role: qa, slot_label: "QA — strict JSONL / authority boundary" }
---

# PLAN-L7-458: Python source atomization pure worker

## 実装境界

closed capability `source_atomization.scrum_mode.v1` のinline Markdown原子化だけを実装する。
Pythonはproposal-onlyであり、Nodeが全atomとdigestを独立再検証する。DB、repository、`.helix`、credential、
filesystem、network、child processのauthorityをPythonへ与えない。

## 非対象

generic broker、descriptor registry、lease/fence、DB staging/commit、terminal receipt、artifact publish、
active pointer、外部service接続は後続sliceとする。

## 完了条件

`U-PYATOM-001..004`がgreenで、strict canonical JSONL、authority field拒否、Node独立oracle、Python外部I/O
default denyを証明する。これをPython runtime全体またはRuntime Acceptanceのterminal完了へ読み替えない。
