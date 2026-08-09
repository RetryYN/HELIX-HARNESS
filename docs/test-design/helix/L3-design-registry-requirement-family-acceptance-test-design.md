---
title: "HELIX L3⇔L10 総合テスト設計 — Design Registry 要求 family authority"
layer: L3
executed_at_layer: L10
artifact_type: test_design
status: draft
created: 2026-08-09
updated: 2026-08-09
owner: TL (Claude)
plan: PLAN-L3-30-design-registry-requirement-family-authority
pair_artifact: docs/design/helix/L3-requirements/design-registry-requirement-family-authority.md
related_l3: docs/design/helix/L3-requirements/design-registry-requirement-family-authority.md
next_pair_freeze: L3
github_issue_id: 177
---

# HELIX L3⇔L10 総合テスト設計 — Design Registry 要求 family authority

## §0 位置づけ

本書は `design-registry-requirement-family-authority.md`（HR-FR-DHR-007〜012）の L10 総合テスト設計である（canonical pair は L3⇔L10）。
Issue #177 の残論点「`screen_trace` の requirement family 写像方針」に対応し、
その開通が Issue #209 の L9（SA-UDP-01〜03）のブロック解除条件になる。

**時間や件数の絶対値を受入観測にしない。** 観測するのは「実在しない要求へ edge を張らないこと」
「catalog の出所が受入時点のものであること」であり、台帳の行数ではない。

## §1 受入観測

| HAT-ID | 対応 L3 | 対応 AC | 受入観測 | 機械検証候補 |
|--------|---------|---------|----------|--------------|
| HAT-DRF-01 | HR-FR-DHR-007 | HR-AC-DHR-007 | 実 L1 正本から抽出した requirement catalog が BR / UX / FR-L1 の実在 ID を kind つきで含み、各 ID が `source_pointer` と `source_digest` を持つ。同一入力に対し catalog digest が決定的 | catalog builder unit test / digest 決定性テスト |
| HAT-DRF-02 | HR-FR-DHR-008 | HR-AC-DHR-008 | `buildScreenIntake` が catalog を引数で受け取り、module の import graph に `node:fs` / path 解決 / Markdown parser を含まない。catalog を差し替えると intake 結果が対応して変わる | import graph 検査 / intake unit test |
| HAT-DRF-03 | HR-FR-DHR-009 | HR-AC-DHR-009 | 実在 ID の trace だけが edge 化する。架空 ID（`BR-99`）、kind 不一致（`requirement_kind="ux"` × `requirement_id="BR-01"`）、catalog digest 不一致はいずれも edge 0 件かつ**理由別**の typed failure | intake unit test（反例 3 種） |
| HAT-DRF-04 | HR-FR-DHR-010 | HR-AC-DHR-010 | section 欠落・抽出 0 件・重複定義・`BR-9`（0 埋め欠落）・**本文中の単なる参照の過剰受理**（定義行ではない言及を catalog エントリとして拾う）は `requirement_family_unregistered` と**異なる code** で fail-close する。parser が空集合を返した場合に intake が成立しない | catalog parser unit test（健全性 5 反例） |
| HAT-DRF-05 | HR-FR-DHR-011 | HR-AC-DHR-011 | requirement 端点が registry graph に未投入の edge を含む intake は commit されない | graph validator test / transaction test |
| HAT-DRF-06 | HR-FR-DHR-012 | HR-AC-DHR-012 | 既存 family（`HIL-*` / `VDH-FR-*` / `HR-FR-DHR-*`）の現行挙動が不変。撤去 inventory に挙げた module が #257 有効時に残存すると lifecycle test が失敗する | 既存 family 回帰テスト / negative lifecycle test |

## §2 境界値

| 観測対象 | 値 |
|---|---|
| 連番下限 | `BR-01` / `FR-L1-01` / `UX-01` |
| 連番上限 | 各 family の現行最大番号 |
| 0 埋め欠落 | `BR-9`（拒否） |
| 桁超過 | `BR-001`（拒否） |
| 大文字小文字差 | `br-01`（拒否。screen_id と異なり要求 ID は畳まない） |
| 特殊定義形式 | `BR-21`（`| **ID** | BR-21 |` の縦表形式で定義される。抽出できること） |
| 定義でない言及 | 別要求の説明文中に現れる `FR-L1-05`（catalog へ拾わないこと） |

## §3 誤って green になる経路（明示的に塞ぐ）

本受入は「edge が増えたこと」を成功条件にしない。次の経路はいずれも失敗として観測する。

1. **catalog を空にして「不存在なので unmapped」と報告し、fail-close したように見せる** — HAT-DRF-04 が空集合を parser 健全性の失敗として区別する。
2. **family regex だけ広げて existence check を素通りさせる** — HAT-DRF-03 の架空 ID 反例が拒否する。
3. **古い catalog で作った intake receipt を再利用する** — HAT-DRF-03 の digest 不一致反例が拒否する。
4. **kind を偽装して別 family の ID を張る** — HAT-DRF-03 の kind 不一致反例が拒否する。
5. **catalog にはあるが graph に無い ID を端点にする** — HAT-DRF-05 が commit を拒否する。
6. **定義行ではない本文中の言及まで catalog へ拾い、架空 ID を「実在」にしてしまう** — HAT-DRF-04 の過剰受理反例が拒否する（存在検証は catalog が正しいことに依存するため、catalog 側の過剰受理は存在検証そのものを無効化する）。

## §4 非対象

- `HIL-*` の連番桁数不整合（別 slice。先行 decision で桁数を確定してから別 commit）
- BR / UX の ID 形式 lint 新設
- #257 が異なる ID model を採る場合の dual-green / 移行方針
