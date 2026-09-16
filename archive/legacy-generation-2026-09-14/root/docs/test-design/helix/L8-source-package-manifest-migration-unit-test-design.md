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
- U-SRCMAN-005: tracked source ZIPがrepositoryに存在せず、2 manifestがexact familyを保持する。
- U-SRCMAN-006: 2 manifestのarchive SHA、Git blob、entry count、entry-set digestをexact照合する。
- U-SRCMAN-007: v0.5.0 filenameとv0.5.1内部rootの不一致を明示し、versionを推測昇格しない。
