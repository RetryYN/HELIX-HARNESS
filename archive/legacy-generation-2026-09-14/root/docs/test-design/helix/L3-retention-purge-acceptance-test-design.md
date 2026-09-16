---
title: "HELIX L3 受入テスト設計 — retention / purge / compaction"
layer: L3
executed_at_layer: L12
artifact_type: test_design
status: placeholder
created: 2026-07-06
updated: 2026-07-06
owner: TL (Codex) / L1 back-merge は PO承認必須
plan: PLAN-L3-07-requirements-binding-enforcement
pair_artifact: docs/design/helix/L3-requirements/retention-purge-policy.md
related_l3: docs/design/helix/L3-requirements/retention-purge-policy.md
next_pair_freeze: L3
---

# HELIX L3 受入テスト設計 — retention / purge / compaction

## §0 位置づけ

本書は `retention-purge-policy.md` の L12 受入テスト設計である。L1 正本への back-merge は
PO 承認待ちのため、本書は placeholder の pair artifact として扱う。

## §1 受入観測

| HAT-ID | 対応 L3 | 対応 AC | 受入観測 | 機械検証候補 |
|--------|---------|---------|----------|--------------|
| HAT-RP-01 | HR-FR-P7-RP-01 | HAC-RP-01a/b | 同一 key の memory / handover 更新が旧 entry を削除せず、supersedes relation として追記される | memory-store tests / handover tests |
| HAT-RP-02 | HR-FR-P7-RP-02 | HAC-RP-02a/b | superseded entry の active body を折り畳む場合、archive manifest が source id、hash、supersedes chain、復元手順を保持する | compaction dry-run tests / archive manifest lint |
| HAT-RP-03 | HR-FR-P9-RP-03 | HAC-RP-03a/b | compaction / archive 後に projection rebuild が走り、DB projection と archive manifest が一致しない場合は完了 claim を拒否する | projection rebuild tests / doctor gate |
| HAT-RP-04 | HR-NFR-P8-RP-04 | HAC-RP-04a/b | source event の物理削除、archive manifest 破壊、hash 書き換えは action-binding approval 無しに deny される | action-binding approval tests / purge guard tests |

## §2 受入条件

| AC-ID | 条件 | 操作 | 期待 |
|-------|------|------|------|
| HAC-RP-01a | 既存 entry と同じ semantic key を書く | memory / handover update | 旧 entry は残り、新 entry が `supersedes` を持つ |
| HAC-RP-01b | `list` / surface を実行 | active entry を取得 | superseded entry は通常 surface から外れるが、監査 query から辿れる |
| HAC-RP-02a | superseded entry が compaction 対象 | compaction dry-run | active store の変更案と archive manifest 案だけを出し、実 apply しない |
| HAC-RP-02b | compaction を apply | archive manifest を検査 | raw body の hash、source id、supersedes chain、復元手順が揃う |
| HAC-RP-03a | archive manifest と projection が一致しない | doctor / completion check | stale projection として rebuild を要求する |
| HAC-RP-03b | rebuild 後 | completion check | source/archive/projection の digest が一致し、完了 claim の前提を満たす |
| HAC-RP-04a | approval 無しで source event を削除 | purge guard | destructive data operation として deny する |
| HAC-RP-04b | approval 付きで例外 purge を実行 | action-binding approval を検査 | actor、target、params、snapshot、expiry、rollback 可否、実行後検証が一致する場合だけ許可する |

## §3 trace 対応

| L3 要件案 | L12 | 備考 |
|-----------|-----|------|
| HR-FR-P7-RP-01 | HAT-RP-01 | append-only / supersede の基本不変条件 |
| HR-FR-P7-RP-02 | HAT-RP-02 | 復元可能な compaction / archive manifest |
| HR-FR-P9-RP-03 | HAT-RP-03 | projection rebuild / completion claim 拒否 |
| HR-NFR-P8-RP-04 | HAT-RP-04 | destructive purge approval 境界 |

## §4 後続 gate 候補

- `retention-archive-manifest`: archive manifest の必須 field と hash 整合を検査する。
- `projection-after-compaction`: compaction / archive 後の stale projection を fail-close する。
- `purge-approval-boundary`: source event 削除系 command を action-binding approval に束ねる。
