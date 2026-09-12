---
title: "HELIX L8 結合テスト設計 — Python runtime toolchain freeze"
layer: L8
executed_at_layer: L5
artifact_type: test_design
status: draft
created: 2026-09-12
updated: 2026-09-12
owner: QA / TL
plan: PLAN-L5-104-python-runtime-toolchain-freeze
design_slice: PYTHON-RUNTIME-TOOLCHAIN-FREEZE-001
pair_artifact: docs/design/helix/L5-detail/python-runtime-toolchain-freeze.md
requirements: [HR-FR-HIL-12, HIL-TR-06]
---

# HELIX L8 結合テスト設計 — Python runtime toolchain freeze

## §0 oracle

| ID | L5 pointer | 入力／mutation | 期待結果 |
|---|---|---|---|
| `IT-PYRT-001` | §1、§2 | CPython 3.14.7通常buildの正規Linux artifactと完全receipt | exact runtimeを一件解決しNode再検証green |
| `IT-PYRT-002` | §1、§3 | 3.14.6、3.14.8、PyPy、unknown build flag、OS/arch差替え | `HIL_PYTHON_RUNTIME_IDENTITY_INVALID`、spawn 0 |
| `IT-PYRT-003` | §1、§3 | source URL、署名、provenance、SHA-256を個別削除・改変 | `HIL_PYTHON_RUNTIME_PROVENANCE_INVALID` |
| `IT-PYRT-004` | §1、§3 | lock欠落、tool version差、transitive追加・削除、digest据置き改変 | `HIL_PYTHON_RUNTIME_LOCK_DRIFT` |
| `IT-PYRT-005` | §1、§2、§3 | network無効のclean environmentとnetwork fallback mutation | 正規bundleだけgreen。fallbackは`HIL_PYTHON_RUNTIME_OFFLINE_MISMATCH` |
| `IT-PYRT-006` | §1、§3 | installed setとSBOMの欠落・重複・余剰を個別投入 | `HIL_PYTHON_RUNTIME_SBOM_MISMATCH` |
| `IT-PYRT-007` | §0、§3 | free-threadedまたはJITをreceipt変更なしで有効化 | `HIL_PYTHON_RUNTIME_EXPERIMENTAL_MODE_UNAPPROVED`、spawn 0 |
| `IT-PYRT-008` | §1、§3 | Windows artifactのplatform混同、Linux artifact digest流用 | OS別exact identity不一致として拒否 |
| `IT-PYRT-009` | §1、§3 | rollback artifact／digest／rehearsal receiptを個別欠落 | `HIL_PYTHON_RUNTIME_ROLLBACK_UNAVAILABLE`、activation 0 |

## §1 合否

全9 oracleと各mutationを実artifactまたはcontent-addressed fixtureで実行する。version文字列だけ、online install、
system Python、代表dependencyだけのSBOM、自己署名だけの確認、未実行rollbackをgreen evidenceにしない。
Linux canonicalとWindows compatibilityは同じsemantic fixtureを実行するが、artifact digestの同一性は要求せず、
authority documentからのexact joinとresult schema/digestの一致を要求する。
