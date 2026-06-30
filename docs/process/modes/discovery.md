> **正本化済** (PLAN-REVERSE-01 で DISCOVERY-04 dogfood 実績から正本化、2026-06-04)。docs/process は forward/modes/gates の運用正本。規範変更は concept/requirements (上位正本) 先行 → 本 dir へ反映する。

# Discovery 駆動モデル

出典: concept v3.1 §2.5 (9-mode ecosystem) / §2.6.1 signal→mode / requirements v1.2 §1.3 kind=poc / §1.5 workflow_phase S0-S4 / §1.8 role=aim / source process reference (discovery workflow)

---

## 1. 概要

Discovery は **要件・成功条件が未確定、または実現性が不透明な状態**を、仮説 → PoC → 検証 → 判定で潰す探索・検証モード。**確証が持てない「設計」**(仮実装→検証→確定) も Discovery で扱う (PLAN-DISCOVERY-01 §1.1)。Forward L0-L14 に入る前の不確実性を潰す前段であり、S4 `decision_outcome=confirmed` で昇格後に Reverse 昇華を経て正本化する。S3 verify pass は検証証跡の成立であって、terminal status ではない。

### frontmatter 早見表 (README 台帳より)

| 項目 | 値 |
|------|----|
| kind | `poc` |
| drive | 専門職継承 (be/fe/fullstack/db/agent、§1.6 V7。探索対象 work の専門職) |
| layer | `cross` |
| workflow_phase | `S0-S4` |
| owner | po + tl |
| 承認者 | — (formal サインオフ不要)。ただし S4 `decision_outcome` は **po** が記録 (PLAN-DISCOVERY-01) |
| Forward 合流点 | S4 `decision_outcome=confirmed` → L1 要求 / L3-L6 設計 (終点で Reverse 昇華) |

---

## 2. phase / フロー構成

| phase | 名称 | 主な作業 | 成果物 |
|-------|------|----------|--------|
| S0 | Backlog 構築 | 仮説を起票・優先付け (`priority_score` = impact×0.6 + uncertainty×0.4) | hypothesis backlog |
| S1 | Sprint Plan | 対象 hypothesis を sprint に選択、acceptance 条件を確定 | sprint plan PLAN (kind=poc) |
| S2 | PoC 実装 | `poc/*` ブランチ・使い捨て可。verify スクリプトを `verify/*.sh` 化 | poc コード / verify script |
| S3 | Verify | verify スクリプト実行、回帰スクリプトとして蓄積。S3 pass は `review_evidence` を持つ verified evidence で、PLAN は `status=draft` のまま outstanding に残す | verify 結果ログ / review evidence |
| S4 | Decide | `decision_outcome` を必須で記録 (confirmed / rejected / pivot)。ここで初めて terminal status / 昇格可否を決める | decision record |

### hypothesis status フロー

```
queued → [S1 plan] → testing → [S3 verify pass] → verified evidence / outstanding
                              → [S3 verify fail] → S4 rejected or pivot
verified evidence / outstanding → [S4 decide] → confirmed / rejected / pivot
```

S3 の `verified evidence / outstanding` は「技術的・検証的には揃ったが、PO/S4 判定が未記録」の状態である。`merged-plan-status` はこの状態を draft violation から除外してよいが、`ut-tdd status` は `po_decision_pending` として残す。

---

## 3. exit 条件

| outcome | 意味 | 次アクション |
|---------|------|-------------|
| `confirmed` | PoC 成立・実現性/設計成立 | Forward 昇格 (L1/L3-L6) + 終点で Reverse 昇華 |
| `rejected` | 仮説不成立 | 学びを記録し backlog 除外。reject 理由を decision record に保持 |
| `pivot` | 仮説修正 | 新仮説として次 sprint に再投入 |

fail-close: confirmed は verify script 成功と S4 `decision_outcome=confirmed` の両方が必須。S3 verify 成功だけで `confirmed` / `completed` にしない。S3 verify 失敗時は sprint を completed にせず、S4 で `rejected` または `pivot` を記録する。

### 3.1 S4 decision record

S3 verified evidence で止まる Discovery PLAN は、PO が何を決めれば S4 へ進めるかを失わないため、
本文に `s4_decision_record` を持つ。

| field | 必須条件 | 意味 |
|---|---|---|
| `s4_decision_record` | S3 pending PLAN で必須 | S4 decide の判断単位。これが無い verified PLAN は単なる draft と区別できない |
| `allowed_outcome` | S3 pending PLAN で必須 | `confirmed` / `rejected` / `pivot` のいずれか |
| `decision_owner` | S3 pending PLAN で必須 | S4 判断を記録する PO / 代理 owner |
| `decision_basis` | S3 pending PLAN で必須 | S3 verified evidence、review evidence、外部根拠、未解決リスクの要約 |
| `forward_route` | `confirmed` 候補がある場合必須 | L1 / L3-L6 / gap-only 等の Forward 合流候補 |
| `reverse_fullback_required` | `confirmed` 候補がある場合必須 | confirmed 後に Reverse fullback で正本化が必要か |

`s4_decision_record` は `decision_outcome` の代替ではない。S4 で PO が `decision_outcome` を記録した後に
terminal status / Forward merge / Reverse fullback へ進める。

---

## 4. Forward 合流点

- S4 `decision_outcome=confirmed` → **L1 要求定義** または **L3-L6 設計**へ昇格 (不確実性の内容に応じて routing)
- PoC をそのまま本実装にしない (PoC ≠ 本実装)
- verify スクリプトは **L6 機能設計の回帰検証**として残存
- **終点で Reverse 昇華** (R0-R4 fullback type) → docs 正本化 (PLAN-DISCOVERY-04 §3.1)

---

## 5. 必須 role / 承認者

| role | 根拠 | 担当 |
|------|------|------|
| `aim` | requirements §1.8 kind=poc 必須 | PoC 設計・verify スクリプト主担 |
| `po` | §1.8 owner | Backlog 優先付け・S4 decide 承認 |
| `tl` | §1.8 owner | 技術実現性判断・S1 plan 確定 |

---

## 6. 他 mode との連鎖 / 注意

| 接続 | 方向 | 説明 |
|------|------|------|
| Reverse | 前段 (組合せ) | 不明点が既存コード・設計に起因する場合は Reverse で事実収集してから PoC へ |
| Scrum | 隣接 | 作るものは概ね決定済だが要件を反復で固める場合は Scrum。Discovery は「そもそも作れるか/何を作るか未確定」が入口 |
| Add-feature / Incident | 前段 | 要件未確定なら Discovery が前段になりうる |
| Research | 前段 (切替) | Research (机上調査) で「作れるか不明」と判明した場合に Discovery へ切替・流入 (research.md §6 の reciprocal) |
| Reverse (昇華) | 後段 | Discovery 終点 → Reverse fullback で V-model 正本化 |

翻案注記: source process reference の旧 command route は UT-TDD CLI route へ置換済み。`poc/*` ブランチ運用は UT-TDD 独自ルール (CLAUDE.md §UT-TDD ワークフロー) に従う。

---

出典再掲: README.md 台帳 §2 / concept v3.1 §2.5-§2.6 / requirements v1.2 §1.3/§1.5/§1.8 / source process reference (discovery workflow)
