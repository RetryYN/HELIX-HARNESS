---
title: "multi-project配布packageと段階release L3要件"
layer: L3
artifact_type: design
status: draft
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
plan: docs/plans/PLAN-L3-54-distribution-package-release.md
pair_artifact: docs/test-design/helix/distribution-package-release-system-test-design.md
---

# multi-project配布packageと段階release L3要件

## 1. authority

要件正本は`docs/governance/helix-harness-requirements_v1.3.md` §4.6.1の`HR-FR-HYB-008`と
`HR-AC-HYB-008-01..09`である。本書はL3↔L10 pairと下位設計への入口を固定し、別要件を追加しない。

## 2. system境界

- 入力: development source HEAD、requirements digest、package version、include／exclude policy、consumer profile。
- 出力: immutable artifact、manifest、consumer smoke evidence、promotion／rollback plan、approval-bound remote action。
- authority: development repository。distribution repositoryやgenerated artifactを逆向き正本にしない。
- consumer: clean／既存／monorepo project。HELIX-HARNESS自身のdogfood stateをconsumerへ持ち込まない。
- transaction: local plan／build／dry-runは可逆、remote sync／tag／publish／promotion／cutoverはaction-binding approval対象。

## 3. 要件trace

| 要件 | system責務 | L10 oracle |
|---|---|---|
| `HR-AC-HYB-008-01` | manifest exact setとsource／requirements／artifact／version binding | `ST-DIST-001` |
| `HR-AC-HYB-008-02` | dogfood／state／secret／PII／absolute path除外 | `ST-DIST-002` |
| `HR-AC-HYB-008-03` | clean／既存／monorepoへの非破壊idempotent setup | `ST-DIST-003` |
| `HR-AC-HYB-008-04` | README／LICENSE／attribution／provenance／免責 | `ST-DIST-004` |
| `HR-AC-HYB-008-05` | clean Linux consumerでのfull smoke | `ST-DIST-005` |
| `HR-AC-HYB-008-06` | 同一Node artifactのWindows compatibility smoke | `ST-DIST-006` |
| `HR-AC-HYB-008-07` | canary→preview→stable同一artifact promotion | `ST-DIST-007` |
| `HR-AC-HYB-008-08` | consumer成果を保全するengine pin rollback | `ST-DIST-008` |
| `HR-AC-HYB-008-09` | remote actionのsnapshot-bound approval | `ST-DIST-009` |

## 4. 非目標

本L3 sliceではartifact builder、setup implementation、remote sync、tag、release、promotion、cutoverを実行しない。
旧HELIXのPython／Bash runtime、Bun、dogfood assetをbulk importしない。
