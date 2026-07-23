---
title: "GitHub原子的開発・CI・リファクタリング システムテスト設計"
layer: L10
artifact_type: test_design
status: draft
created: 2026-07-23
updated: 2026-07-24
owner: QA
pair_artifact: docs/design/helix/L3-requirements/github-atomic-development-requirements.md
---

# GitHub原子的開発・CI・リファクタリング システムテスト設計

- pair: `docs/design/helix/L3-requirements/github-atomic-development-requirements.md`
- status: draft
- 実行層: L10

## テスト束

| Test ID | 対応AC | 入力 | 期待結果 |
|---|---|---|---|
| GH-T-035 | GH-AC-035 | 新規、既存改修、複数aggregate、独立behavior、複数legacy owner、行数だけ小さいPRを投入する | exactly-one behavior contractと責務ownerを持つsliceだけを受理し、見かけ上小さい混載PRを拒否する |
| GH-T-036 | GH-AC-036 | known impact、unknown edge、security/schema/migration、selector変更、targeted省略集合、post-merge receipt、nightly補完、二重receipt、p95予算超過を投入する | targeted/critical/fullを決定し、high-riskをfullへfail-closeし、各省略itemの最初のterminal receipt欠落と二重計上をblockし、nightlyで未回収だけを補完し、correctnessを保ったまま予算超過をPerformance Recoveryへ送る |
| GH-T-037 | GH-AC-037 | characterization、dual-green、consumer移行、consumer=0、rollbackを個別に欠落させたlegacy削除taskを投入する | 順序を保つ1 owner/pathだけをreadyにし、先行evidence欠落または契約追加との同時削除を拒否する |
| GH-T-038 | GH-AC-038 | GitHub Issue/PR、PLAN工程、workflow schedule、DB next actionのHEAD、contract、owner、dependencyを個別にずらす | 同一frontierだけを受理し、prose順・手動選択・不一致をRecoveryへrouteする |
| GH-T-039 | GH-AC-039 | 2 writer、read-only reviewer push、poll観測だけの実行、15分poll/heartbeat欠落、45分TTL、releaseなしtakeover、期限切れlease、旧HEAD token、dirty別worktree、旧writer takeover残存、正規handoffを投入する | 競合writeと観測だけの開始、stale横取りを拒否し、active時15分/idle時30〜60分poll、15分heartbeat、旧active leaseをconsume/supersedeしたstale-recovery receiptまたは同一HEAD release/acquire済みexactly-one writerだけを受理する |

## 証跡要件

各fixtureはsource/base HEAD、behavior contract ID、responsibility owner、dependency frontier digest、selected profile、
selected/skipped test・gate digest、post-merge一次回収receipt、nightly補完receipt、item→terminal receiptのexact link、
consumer graph、rollback receipt、GitHub/PLAN/workflow/DB projection digestを持つ。
PR green表示、少ない差分行、test件数一致、memory通知の存在だけを原子性、full回収、behavior不変、次タスク収束または
write ownershipの証拠にしない。
