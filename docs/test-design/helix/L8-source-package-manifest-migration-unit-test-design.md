---
title: "Source Package Manifest Migration Unit Test Design"
layer: L8
status: draft
parent_design: docs/design/helix/L6-function-design/source-package-manifest-migration.md
pair_artifact: docs/design/helix/L6-function-design/source-package-manifest-migration.md
---

# 受入oracle

- U-SRCMAN-001: 2 manifestのfamily ID、archive digest、entry countをexact照合する。
- U-SRCMAN-002: repository rootに対象ZIPとraw researchが存在しない。
- U-SRCMAN-003: current source identityがlegacy archive filenameではない。
- U-SRCMAN-004: research dispositionがnon-authoritativeで#1033へ接続される。
