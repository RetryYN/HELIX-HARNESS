---
title: "DevOS distribution runtime identity機能設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-23
updated: 2026-08-23
owner: Codex / TL
plan: docs/plans/PLAN-L7-655-distribution-devos-runtime-identity.md
parent_design: docs/design/helix/L3-requirements/distribution-package-release-requirements.md
pair_artifact: docs/test-design/helix/L8-distribution-devos-runtime-identity-unit-test-design.md
---

# DevOS distribution runtime identity機能設計

requirements v1.3.13の正式配布先`RetryYN/HELIX-HARNESS-DevOS`を、runtime、CLI、setup、update-check、
doctor、generated consumer artifactへ一方向に投影する。current repository名とremote URLは
`src/setup/distribution-identity.ts`だけが所有し、各consumerは定数またはtyped receiptを参照する。

旧`RetryYN/HELIX-HARNESS-OS`はexact compatibility inputだけとして受理し、`source=legacy_compatibility`、
`converted_from`、warningをreceiptへ残す。canonical `repository`／`remote_url`へ旧identityを再出力しない。
owner欠落など曖昧な旧入力は推測せず`distribution_repository_identity_invalid`でfail-closeする。

明示された別owner/repositoryは`explicit_external`として保持する。これは正式配布先の変更ではなく、
既存のclean distribution target引数を保持するためのtyped authorityである。

setup templateとconsumer readinessは同じcommand bytesを要求するため、runtime defaultだけを先にmergeしない。
旧templateが混在した場合はconsumer readiness、doctor、doc consistencyのいずれかがredになる。

本sliceはlocal plan／package生成までを所有する。tag、publish、remote mutation、promotionは実行せず、
Issue #659のaction-binding approval境界へ残す。
