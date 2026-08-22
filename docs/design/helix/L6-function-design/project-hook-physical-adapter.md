---
title: "project hook physical identity adapter 機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-08-22
updated: 2026-08-22
owner: Codex / TL
plan: docs/plans/PLAN-L7-652-project-hook-physical-adapter.md
parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md
pair_artifact: docs/test-design/helix/L8-project-hook-physical-adapter-unit-test-design.md
---

# project hook physical identity adapter 機能設計

`captureProjectHookAuthorityInput`はexecution、loader、session、current authority rootを明示入力として受ける。
各rootをnative realpathへ解決し、`git rev-parse --git-common-dir`のphysical pathとdevice／inodeをcaptureする。
execution rootの`git rev-parse HEAD`を観測HEADとし、candidate／current authority HEADはcontrol plane入力を保持する。

`.codex/hooks.json`、`src/runtime/agent-guard.ts`、`src/runtime/codex-native-worker-policy.ts`はexecution rootと
current authority rootから別々にread/hashし、一方を他方へ上書きしない。Git commandは`rev-parse`だけ、filesystemはread-onlyで、
write、checkout、reset、dependency installを行わない。

Node statでphysical identityを保証できるLinux／macOSだけをcurrent providerとし、Windowsは
`UnsupportedPhysicalIdentityError(code=unsupported_physical_identity)`でfail-closeする。Windows file ID providerは後続sliceで実装する。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": ["unsupported_physical_identity"],
  "assets": [
    "src/runtime/project-hook-physical-adapter.ts",
    "tests/project-hook-physical-adapter.test.ts"
  ],
  "failure_reachability": [
    {
      "failure_code": "unsupported_physical_identity",
      "oracle_id": "U-CNWHOOKPHYS-003",
      "test_path": "tests/project-hook-physical-adapter.test.ts"
    }
  ]
}
```
