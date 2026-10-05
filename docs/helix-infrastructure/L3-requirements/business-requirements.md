---
title: "HELIX-INFRASTRUCTURE Stage 1 business要件候補"
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
layer: L3
kind: requirement
status: draft_candidate
authority_status: draft_candidate
freeze_blocking: true
pair_artifact: docs/helix-infrastructure/L10-verification/business-verification.md
stage: 1
---

# HELIX-INFRASTRUCTURE Stage 1 business要件候補

固定親 `HELIXINFRASTRUCTURE-L2-001` と `HELIXINFRASTRUCTURE-L2-006` は資源状態の観測と限定recovery pathを定める。これらの親には独立したbusiness outcomeや業務成功oracleがないため、本書では別個のbusiness要件・受入条件を設けない。資源状態、owner境界、recovery結果の要件は[機能要件](functional-requirements.md)のFR/ACを正本とし、同じ条件をbusiness要件として重複させない。

本書は採択済みL2-001 (`MPR-RC-HELIXINFRASTRUCTURE-L2-001-003`) とL2-006 (`MPR-RC-HELIXINFRASTRUCTURE-L2-006-002`) のみを対象とする。L2全文SHA-256 `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、L11全文SHA-256 `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`、source revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2-005は006の採択済み入力依存であり、本書の未承認L3 candidateではない。

旧HELIXのbusiness文書を分けた構成は初回配置の起点として保持した（`LEGACY-ASSET-A6E2C7F0565E5F804F06`, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md` L21–39,84–104、全文SHA-256 `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d`）。保持するのは分離配置という形式だけで、旧BR分類、metric、owner、runtimeや承認動作を現行の独立business outcomeとして継承しない。固定親にない業務上の成功、障害severity、recovery完了、placement/cost採否を作らない。
