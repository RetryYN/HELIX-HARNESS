---
title: "REBASELINE v0.5.0 L1追突 受入テスト設計"
layer: L1
executed_at_layer: L12
artifact_type: test_design
status: draft
created: 2026-07-18
updated: 2026-07-18
owner: QA
pair_artifact: docs/design/helix/L1-requirements/hybrid-rebaseline-v0.5.0-intake.md
---

# REBASELINE v0.5.0 L1追突 受入テスト設計

| AC-ID | 対応要求 | 合格条件 |
|---|---|---|
| AC-V050-L1-01 | HBR-V050-01 | v0.5.0 deltaの全件に分類・根拠・owner・下流traceがあり、未分類が0件である |
| AC-V050-L1-02 | HBR-V050-02 | Full V、Production Scrum、Discovery/PoCがexactly oneで、曖昧時はFull Vへfail-closeする |
| AC-V050-L1-03 | HBR-V050-03 | runtime authorityがaccepted ADRへ一意に解決される |
| AC-V050-L1-04 | HBR-V050-04 | source integrityと意味整合が独立gateで検証される |
| AC-V050-L1-05 | HBR-V050-05 | capsule、sandbox、trace、freshnessの不足をpromptで迂回できない |
