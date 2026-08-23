---
title: "distribution Lite profile-bound package単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-23
updated: 2026-08-23
owner: QA / TL
plan: docs/plans/PLAN-L7-656-distribution-lite-profile-bound-package.md
pair_artifact: docs/design/helix/L6-function-design/distribution-lite-profile-bound-package.md
---

# distribution Lite profile-bound package単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DISTPKG-001 | profile admission | profile未指定／unknownではFull packageへfallbackせずwrite 0 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-002 | projection／closure gate | いずれかがredならarchive作成前にtyped failure | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-003 | manifest identity | HEAD、requirements、profile、package、artifact set、DevOS identityをexact束縛 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-011 | prebuilt identity | prebuilt path／digestと生成bytesの不一致を拒否 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-011b | generated provenance | identity無しgenerated artifactの混入を拒否 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-004 | deterministic build | 独立2 buildのtarball／manifest／checksum bytes digestが一致 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-005 | mutation | 1 path追加と1 byte変更でそれぞれdigest不一致 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-005b | source HEAD binding | tracked sourceの未commit mutationを古いHEADとして包装せず`source_head_dirty`で拒否 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-005c | source HEAD binding | untracked sourceをclean HEADとして包装せず`source_head_dirty`で拒否 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-005d | hidden index state | `assume-unchanged`／`skip-worktree`で隠したtracked mutationを拒否 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-006 | shared builder | Full commandとLite commandが同じarchive coreを呼ぶ | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-007 | current profile | current `consumer_core_v1`の独立2 buildを同一identityへ束縛 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-012 | prebuilt install | fresh package install後の`node_modules/.bin/helix --version`をbuild-sourceなしで起動 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-013 | compiler lazy load | package command追加後も非compiler CLI経路でTypeScript実体をloadしない | `tests/typescript-lazy.test.ts` |
| U-DISTPKG-008 | G3 freeze | L6/L8 pairとcatalog digestを同一transactionへ束縛 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-009 | physical source identity | symlink sourceでrepo外bytesを混入させずarchive write 0 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-009b | symlink source identity | source root内を指すsymlinkもartifact sourceとして拒否 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-009c | missing source root | 例外化せずarchive write前にtyped拒否 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-009d | portable path／stem identity | Windows absolute、logical traversal、出力stem逸脱をwrite前に拒否 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-009e | manifest authority | extension／digest aliasによるidentity field上書きを拒否 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-009f | source root identity | source root自体がsymlinkならwrite前に拒否 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-009g | output identity | output directory symlinkによる物理出力先変更をwrite前に拒否 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-009h | exact file set | directory指定による未列挙descendantの再帰収録を拒否 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-009i | runtime identity shape | 余剰identity keyによるmanifest schema上書きを拒否 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-009j | Requirement IR identity | canonical manifest／shard digest driftをpackage前に拒否 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-010 | current CLI integration | `package-profile`実CLIがcurrent profileからtarball／manifest／checksumを生成 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-009k | nested runtime identity | requirements／profileの余剰keyを拒否しblocked receiptへ再投影しない | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-009l | final output physical identity | 既存symlink／hardlink出力を外部bytes変更前に拒否 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-009m | Full package source／requirements identity | Full経路もcanonical shard/rootとclean source HEAD resolverを共有し直接読取へ戻さない | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-009n | dangling output identity | dangling directory／final symlinkを例外化せずtyped拒否 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-009o | source hardlink identity | repo外inodeを共有するsource hardlinkをarchive混入前に拒否 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-009p | repository identity | source repositoryの未知値と旧distribution repositoryのcurrent再出力を拒否 | `tests/distribution-lite-profile-package.test.ts` |
| U-DISTPKG-009q | source remote authority | source `origin`がHELIX-HARNESSでないrepositoryを拒否 | `tests/distribution-lite-profile-package.test.ts` |

fixtureだけでなくcurrent `consumer_core_v1` projection／closureを入力したCLI integrationを同PRで検証する。
