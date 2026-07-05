---
title: "HELIX L3 非機能グレード projection"
layer: L3
kind: add-design
status: placeholder
created: 2026-07-06
updated: 2026-07-06
owner: TL (Codex)
plan: PLAN-L3-07-requirements-binding-enforcement
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
related_l1: docs/design/helix/L1-requirements/pillar-requirements.md
related_l3: docs/design/helix/L3-requirements/pillar-functional-requirements.md
pair_artifact: docs/test-design/helix/L3-pillar-acceptance-test-design.md
next_pair_freeze: L12
---

# HELIX L3 非機能グレード projection

## §0 位置づけ

本書は `PLAN-L3-07` Step 3 の HELIX 版 NFR グレード表である。既存の
`pillar-functional-requirements.md`、`pillar-requirements.md`、L6 function design に散在していた
数値閾値を一覧化し、L12 受入観測と後続 L7 実装で参照しやすくする。

本書は新しい閾値を発明しない。閾値変更が必要な場合は、該当する L1/L3 正本へ back-merge し、
その後に本 projection を更新する。

## §1 グレード分類

| 分類 | 対象 | 初期グレード | 判定方針 |
|------|------|--------------|----------|
| 実装精度 | HR-NFR-P3 系 | Grade 3 | green command、review evidence、trace、runtime evidence が揃うまで完了 claim を許可しない |
| context 効率 | HR-NFR-P5 系 | Grade 2 | budget を超えた検証・handover・context 注入を continuation / blocker / improvement へ変換する |
| GitHub / 配布 | HR-FR-P6 系 | Grade 3 | 通常 PR 操作と高影響 apply を分離し、branch protection / rename / release は approval 境界に置く |
| memory / glossary | HR-FR-P7 系 | Grade 2 | 共有 memory と Glossary SSoT を per-agent silo から分離し、drift を検出する |
| security / approval | HR-NFR-P8 系 | Grade 3 | 外部 API、secret、infra、不可逆操作は action-binding approval なしに apply しない |
| adapter 一貫性 | HR-NFR-AC 系 | Grade 3 | Claude / Codex / hosted API の surface 差分を明示し、hook 非強制面を covered と誤認しない |

## §2 数値閾値一覧

| ID | 閾値 | 正本 | 測定 / 使用箇所 | 超過時の扱い |
|----|------|------|-----------------|--------------|
| HNFR-G-P5-01 | 直近 12 件 / 240 字 | `pillar-requirements.md` HBR-P7 | bounded recall / SessionStart memory surface | 追加読み込みではなく要約・handover・明示検索へ送る |
| HNFR-G-P5-02 | fast <= 120s | `pillar-functional-requirements.md` HR-NFR-P5-03 / HAC-N5-03a | fast verification profile | improvement または blocker に分類し、silent retry しない |
| HNFR-G-P5-03 | default <= 600s | `pillar-functional-requirements.md` HR-NFR-P5-03 / HAC-N5-03a | default verification profile | continuation / blocker / improvement task へ変換する |
| HNFR-G-P5-04 | full <= 1800s | `pillar-functional-requirements.md` HR-NFR-P5-03 / HAC-N5-03b | full verification profile / 高負荷検証 | 通常 loop へ無条件に戻さず、実行理由と evidence を残す |
| HNFR-G-P6-01 | CI auto-fix confidence >= 0.75 | `pillar-requirements.md` P3 / `pillar-functional-requirements.md` HR-FR-P6-05 | CI auto-fix repush gate | 閾値未満なら repush せず Issue / escalation に止める |
| HNFR-G-P6-02 | iteration cap 内 | `pillar-functional-requirements.md` HR-FR-P6-05 / HAC-P6-05b | CI auto-fix / release automation | cap 超過時は再試行を止め、Issue / escalation へ送る |
| HNFR-G-P8-01 | approval snapshot は current `sha256:` snapshotId 必須 | `pillar-functional-requirements.md` HR-NFR-P8-01 / HAT-N8-01 | version-up activation / rename cutover / action-binding approval | field 名だけの承認を pending とし、古い snapshot を流用しない |
| HNFR-G-AC-01 | hosted API 編集前 preflight 必須 | `pillar-functional-requirements.md` HR-NFR-AC-02 | hosted API / developer tool surface | preflight 無しの編集は evidence 不足として差し戻す |

## §3 受入観測への接続

| 閾値 | L12 acceptance | 期待する証跡 |
|------|----------------|--------------|
| HNFR-G-P5-01 | HAT-P7-01 / HAT-N5-01 | memory surface の件数、文字数、source path、handover 参照 |
| HNFR-G-P5-02..04 | HAT-N5-03 | verification profile、timeout、p95 duration budget、実測 duration、worker 数 |
| HNFR-G-P6-01..02 | HAT-P6-02 / HAT-P6-05 | confidence、iteration count、worker / reviewer 分離、escalation route |
| HNFR-G-P8-01 | HAT-N8-01 / HAT-P6-04 | activationSnapshot / cutoverSnapshot の `sha256:` binding、expiry、audit、rollback evidence |
| HNFR-G-AC-01 | HAT-NAC-02 | repo hook 非強制 surface の明示、git/status preflight、target paths |

## §4 変更ルール

1. 閾値を変更する場合は、L1 または L3 の正本要求を先に更新する。
2. 本書だけを更新して runtime 挙動が変わったとは扱わない。
3. security / approval / cutover に関わる閾値は action-binding approval と snapshot binding を維持する。
4. verification profile の timeout や p95 budget は、実測 duration と改善候補へ接続する。

## §5 現在の状態

- 本書は `PLAN-L3-07` Step 3 の placeholder projection であり、confirmed 正本ではない。
- `PLAN-L3-07` terminal 化には、Step 2 後半、Step 6、review evidence、green command の追加確認が必要である。
- 本書の追加は `completionClaimAllowed=false` の境界を変えない。
