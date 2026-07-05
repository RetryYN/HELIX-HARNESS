---
title: "HELIX L3 要件案 — retention / purge / compaction 方針"
layer: L3
kind: add-design
status: placeholder
created: 2026-07-06
updated: 2026-07-06
owner: TL (Codex) / PO approval required for L1 back-merge
plan: PLAN-L3-07-requirements-binding-enforcement
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
related_l1: docs/design/helix/L1-requirements/pillar-requirements.md
related_l3: docs/design/helix/L3-requirements/pillar-functional-requirements.md
pair_artifact: docs/test-design/helix/L3-retention-purge-acceptance-test-design.md
next_pair_freeze: L12
---

# HELIX L3 要件案 — retention / purge / compaction 方針

## §0 位置づけ

本書は `PLAN-L3-07` Step 4 の L3 要件案である。PO 決定済み方針
（期限付き物理削除は採用しない、append-only を維持し、supersede 済み entry の compaction、
archive 移動、projection rebuild で運用劣化を防ぐ）を、下流実装が検査できる形へ降下する。

本書は L1 confirmed 正本を直接変更しない。L1 へ back-merge する場合は、`HBR-P7`、
`HNFR-P5`、`HBR-P9` の追補候補として PO が起草・承認する。

## §1 対象データ

| 分類 | 例 | retention 方針 |
|------|----|----------------|
| source event | `.helix/memory/*.jsonl`、handover、runtime verification log、review evidence | append-only を維持し、通常運用では物理削除しない |
| state snapshot | `.helix/state/**/*.json`、loop state、setup state | 最新 state は上書き可能だが、判断・証跡・承認に関わる source event は消さない |
| projection | `harness.db` の projection table、relation graph、quality signal | 再構築可能な派生物として扱い、stale なら rebuild を要求する |
| archive | superseded entry の raw body、compaction manifest、old projection artifact | exact raw bytes または復元可能な digest trail を保持し、通常 source と分離する |

## §2 要件案

| ID | 親候補 | 要件案 | 主な受入 |
|----|--------|--------|----------|
| HR-FR-P7-RP-01 | HBR-P7 | memory / handover / runtime evidence の source event は append-only を既定とし、supersede は旧 entry を削除せず関係を追記する | HAC-RP-01a / HAC-RP-01b |
| HR-FR-P7-RP-02 | HBR-P7 / HNFR-P5 | superseded entry が運用負荷になる場合、active store では body を折り畳み、raw body は archive manifest に移す。manifest は source id、supersedes chain、content hash、移動理由、復元手順を持つ | HAC-RP-02a / HAC-RP-02b |
| HR-FR-P9-RP-03 | HBR-P9 | compaction / archive 実行後は projection rebuild を必須にし、DB projection が archive manifest と一致しない状態では完了 claim を拒否する | HAC-RP-03a / HAC-RP-03b |
| HR-NFR-P8-RP-04 | HNFR-P8 | source event の不可逆削除、archive manifest の破壊、証跡 hash の書き換えは destructive data operation として action-binding approval 無しに実行しない | HAC-RP-04a / HAC-RP-04b |

## §3 不変条件

1. 期限到達だけを理由に source event を物理削除しない。
2. `superseded` は「active surface から外す」状態であり、「証跡を消す」状態ではない。
3. compaction は active store の可読性・性能改善であり、監査証跡を失わせない。
4. archive は source event と同じ trust boundary に置き、secret / PII を新たに複製しない。
5. projection は派生物なので rebuild 可能でなければならない。projection だけに存在する情報を完了根拠にしない。
6. destructive purge が必要な例外事案は、対象、理由、rollback 可否、approval snapshot、実行後検証を action-binding approval に束ねる。

## §4 L1 back-merge 候補

PO が L1 正本へ追記する場合の候補文は以下に留める。

| 追記先候補 | 候補内容 |
|------------|----------|
| `HBR-P7` | 共有 memory / handover / runtime evidence は append-only source event として扱い、supersede は削除ではなく関係追記にする |
| `HNFR-P5` | 長期運用時の context / memory 劣化は、期限付き削除ではなく reversible compaction と archive manifest で抑える |
| `HBR-P9` | compaction / archive 後は projection rebuild と source/archive 一致検査が完了 claim の前提になる |

## §5 後続実装境界

- L7 実装が必要な候補: archive manifest schema、compaction dry-run、projection rebuild stale check、doctor gate。
- すぐに実装しないこと: source event の自動物理削除、期限付き purge daemon、approval 無しの archive pruning。
- PLAN-M-02 の identifier cutover とは独立である。`.helix` state path の移動や CLI 名変更を本書で許可しない。
