---
title: "HELIX L5 詳細設計 — Python runtime toolchain freeze"
layer: L5
kind: add-design
status: draft
created: 2026-09-12
updated: 2026-09-12
owner: Codex / TL
plan: PLAN-L5-104-python-runtime-toolchain-freeze
parent_design: docs/design/helix/L5-detail/python-worker-runtime.md
pair_artifact: docs/test-design/helix/L8-python-runtime-toolchain-freeze-integration-test-design.md
behavior_contract_id: PYTHON-RUNTIME-TOOLCHAIN-FREEZE-001
---

# Python runtime toolchain freeze 詳細設計

## 境界

本deltaは既存Python worker runtimeのprocess／protocol／transaction設計を変更せず、最初のsemantic coreを
再現可能に取得・検証・rollbackするtoolchain authorityだけを所有する。実装・activation・distributionは対象外である。

## freeze契約

- runtime identityはCPython 3.14.7通常build、free-threaded無効、JIT無効とする。
- Linux source tarballとWindows x64 installerは公式URL、SHA-256、Sigstore identity、OIDC issuer、SPDXを束縛する。
- lock producerはattestation検証済みuv 0.12.0、正本は`pyproject.toml`と`uv.lock`とする。
- installは`--frozen --offline --no-index --no-python-downloads`を全て要求し、system Pythonへfallbackしない。
- OS別artifactは分離するが、同一semantic fixtureとruntime identity contractを共有する。
- rollbackは3.14.7通常buildの既知identityへ戻し、旧runtimeやBun経路を再有効化しない。

## 未完了条件

source build、実lock生成、offline sync、Linux／Windows parity、rollback rehearsalのreceiptが揃うまで、
本設計、対応L8テスト設計、親PLANはdraftを維持する。
