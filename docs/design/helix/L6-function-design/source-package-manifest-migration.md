---
title: "Source Package Manifest Migration"
layer: L6
status: draft
parent_plan: docs/plans/PLAN-RECOVERY-68-source-package-manifest-migration.md
pair_artifact: docs/test-design/helix/L8-source-package-manifest-migration-unit-test-design.md
---

# Source Package Manifest移行

current identityは`source_family_id`、履歴再現は`legacy archive SHA + entry digest + Git blob`、意味authorityは
現行requirements／design／testとする。archive parserは明示filenameを受けるcompatibility inspectionに限定し、
archive欠落をcurrent runtime failureにしない。Universal Workflow 14件とHybrid採用21件を個別digestへ固定する。

`deep-research-report.md`はraw authorityにせず、検証可能なcapability候補と責務境界だけをresearch dispositionへ残す。
