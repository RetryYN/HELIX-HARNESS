# Release Module／Bundle段階導入roadmap

## authority

L3正本は`docs/design/helix/L3-requirements/release-module-bundle-composition-requirements.md`、L10 pairは
`docs/test-design/helix/release-module-bundle-composition-acceptance.md`である。本書は実装順projectionであり意味正本ではない。

## Issue依存グラフ

| 順序 | Issue | 責務 | 前提 |
|---:|---:|---|---|
| 1 | #1074 | RLS-01 棚卸し／authority map | #1073 |
| 2 | #1075 | RLS-02 schema／lifecycle | #1074 |
| 3 | #1076 | RLS-03 path ownership | #1075 |
| 4 | #1077 | RLS-04 dependency／compatibility | #1076 |
| 5 | #1078 | RLS-05 Bundle resolver | #1077 |
| 6 | #1079 | RLS-06 deterministic builder | #1078 |
| 7 | #1080 | RLS-07 static verification | #1079 |
| 8 | #1081 | RLS-08 DevOS promotion | #1080 |
| 9 | #1082 | RLS-09 clean consumer／rollback検証 | #1081 |
| 10 | #1083 | RLS-10 旧Liteとのparity検証 | #1082 |
| 11 | #1084 | RLS-11 CI composition | #1083 |
| 12 | #1085 | RLS-12 channel／SemVer／wave管理 | #1084 |
| 13 | #1086 | RLS-13 feedback／retirement | #1085 |

依存は意味成立の正規順である。実装はownership確定後に、相互にfile ownershipが重ならないstatic verifier、consumer runner、
CI planner等を並行化できる。新規module repositoryや別builderを先行作成しない。

## release wave計画

1. Wave 0: 全Module shadow、ownership／cycle／reproducibility測定。公開しない。
2. Wave 1: `helix-core`、`helix-verification`、`helix-github-ops` RC。
3. Wave 2: `helix-workflow`、`helix-ci`、`helix-reverse-recovery`。
4. Wave 3: frozen baselineとのparity後に`helix-lite` RC。
5. Wave 4: #292／#1017／#176／#290後にRequirements／Design Preview。
6. Wave 5: System Synthesisと3実案件dogfood後にRefactoring Preview。
7. Wave 6: Resident Lane、security、72時間soak後にRuntime／Autonomous／Full。

各waveのrequirements正本化とlocal shadow buildはremote publish許可ではない。tag、release、cutoverは現行release policyと
credential target authorityへ従う。
