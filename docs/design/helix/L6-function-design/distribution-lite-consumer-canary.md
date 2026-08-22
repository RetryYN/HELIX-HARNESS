---
title: "HELIX L6 機能設計 — Lite clean consumer canary"
layer: L6
kind: add-design
status: draft
created: 2026-08-23
updated: 2026-08-23
owner: SE + QA + TL
plan: docs/plans/PLAN-L7-657-distribution-lite-consumer-canary.md
pair_artifact: docs/test-design/helix/L8-distribution-lite-consumer-canary-unit-test-design.md
related_l5: docs/design/helix/L3-requirements/distribution-package-release-requirements.md
github_issue_id: 948
behavior_contract_id: DISTRIBUTION-LITE-CONSUMER-CANARY-001
responsibility_owner: distribution-lite-consumer-canary
---

# HELIX L6 機能設計 — Lite clean consumer canary

## 目的

#947の同一profile-bound artifactをclean Linux consumerへinstallし、setup、status、consumer doctor、
minimal delegated workflow、generated CI、completion evidence、lifecycle rehearsalをfresh processで実測する。
同じNode artifactをWindows smokeへ渡し、platform別rebuildで成功を代替しない。

## package runtime

Full CLIを梱包せず、consumer command registryをentrypointとする単一Node bundleをbuild時に生成する。
bundleはprofile source artifact setから決定的に生成し、digestとfinal package artifact setをmanifestへ束縛する。
package.jsonはLite exact commandだけを公開し、Full HELIXのprivate／development scriptsを再出力しない。

## setup／ownership

setupはconsumer専用templateをpreflightし、既存bytesが異なる場合は全write 0で停止する。dry-run、apply、再applyの
receiptを返し、再applyはwrites 0とする。status、doctor、completion packet／bundleは同じmanaged stateを読む。
upgrade／rollback／uninstallは本sliceではplan-only rehearsalとし、consumer-owned filesとcompletion evidenceを保全する。

## hook境界

Lite hook configは共有pure guardを呼ぶ最小surfaceだけを生成する。work guard、destructive git guard、machine safety
guardを同じNode bundleへ含め、unsupported hookやresident lane commandをconfigへ出さない。

## E2E receipt

receiptはsource HEAD、requirements digest、profile digest、package／Node artifact digest、checksum、consumer command
結果を束縛する。artifact差替え、checksum drift、別HEAD、別profileはinstall前に拒否する。

## 非対象

tag、publish、remote cutover、canary→preview→stable昇格は#659のrelease transactionへ残す。
