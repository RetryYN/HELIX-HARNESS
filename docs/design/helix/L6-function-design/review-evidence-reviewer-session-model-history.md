---
title: "review_evidence reviewer session × model 有効期間（履歴 registry）機能設計"
layer: L6
kind: recovery
status: draft
created: 2026-09-05
updated: 2026-09-05
owner: Claude / TL
plan: docs/plans/PLAN-RECOVERY-1543-reviewer-session-model-history.md
pair_artifact: docs/test-design/helix/L8-review-evidence-reviewer-session-model-history-unit-test-design.md
github_issue_id: 1543
behavior_contract_id: REVIEWER-SESSION-MODEL-HISTORY-001
responsibility_owner: review-evidence
---

# review_evidence reviewer session × model 有効期間（履歴 registry）機能設計

## 1. 責務と非責務

confirmed L6 `review-evidence-reviewer-identity.md`（PLAN-L7-648、Issue #923）§2 は
「同一 `reviewer_session_id` が異なる `reviewer_model` を名乗る記録は衝突」を不変条件とした。
本設計はその不変条件を **「session × model は tracked registry に宣言した有効期間の中で一貫している」**
へ置き換える。判定関数の主体（session × model の対）と、prose ではなく構造化フィールドで主体を
定める方針は変えない。

- 責務: 有効期間 registry の schema、fail-close な parse、`reviewed_at` 時点の model 解決、
  lint への配線、未登録 session の従来規則維持。
- 非責務: 実効 model の attestation（§4 で契約外と明記）、旧記録の書換（§5 遡及禁止を維持）、
  SessionStart での session 再発行（後続 slice）。

## 2. 是正する欠陥（Issue #1543 / PR #1550 で観測）

Codex の harness session `019febe1-…` は `.helix/logs/session/` 上で 2026-08-10 から同一 id で継続し
（session_start 995 回）、8 月の review 記録は `codex:gpt-5.6-sol`、2026-09-05 時点の
`~/.codex/config.toml` は `model = "gpt-6-astra"` であった。同一 session 内で model が切り替わった可能性（config の観測に基づく推論で、既存 session の実行 model 切替そのものは未検証）がある。切り替わっていれば、

- 真実（切替後の model）を記録すれば `reviewer_session_model_conflict` で赤、
- 旧記録に合わせて `gpt-5.6-sol` と書けば虚偽、

という二択になり、PR #1550 の PLAN confirm が停止した。Claude 側の commit trailer
（`Claude Fable 5.1`）と harness 記録（`claude:claude-opus-5`）の二重表記も同根で、いずれも
「session の寿命が model の寿命より長い」ことを contract が想定していなかった。

## 3. 関数設計

| 関数 | シグネチャ | 事前条件 | 事後条件 | 不変条件 | oracle |
|---|---|---|---|---|---|
| `parseReviewerSessionModelHistory` | (raw: unknown) => ReviewerSessionModelHistory | raw は JSON 値 | `schema_version` が `helix-reviewer-session-model-history.v1`、各 session の id が `REVIEWER_SESSION_ID_PATTERN` に適合し重複なし、`runtime` は許容集合 `REVIEWER_SESSION_MODEL_HISTORY_RUNTIMES`（`claude` / `codex` / `kimi`。`unknown` は `modelProviderFromId` の未知正規化と一致してしまうため登録不可）、`since` / `until` は秒と timezone を含む ISO 8601（`Date.parse` 単独では timezone 無しを local time で受理するため形式を先に固定）、`windows` は since 昇順・`until > since`・区間重複なし・open（`until: null`）は末尾のみ。違反は `reviewer_session_model_history_invalid:<locator>` で throw | 壊れた registry を silent 受理しない | U-RVIDENT-014 |
| `loadReviewerSessionModelHistory` | (repoRoot) => History \| null | — | `docs/governance/reviewer-session-model-history.json` が無ければ null（履歴なし）。あれば parse 結果。schema / 時系列違反は `ReviewerSessionModelHistoryError`（`reason` = 有限な locator 付き reason）で throw。doctor は typed error の `reason` だけを surface し、JSON.parse 等の未知例外は `stableCauseDigest` による `cause_kind` / `cause_digest` に変換して raw message・local path を露出しない（PLAN-L7-449 doctor failure contract） | 読込失敗を「履歴なし」へ黙って落とさない。未知例外の生 message を surface しない | U-RVIDENT-014 / 016、U-DUR-003 |
| `reviewerModelAt` | (entry, reviewedAt) => string \| null | entry は parse 済み | `since ≤ reviewed_at < until` を満たす window の `reviewer_model`。該当なしは null | 半開区間 | U-RVIDENT-012 / 013 |
| `analyzeReviewEvidence` | (plans, options?) => ReviewEvidenceResult | options.sessionModelHistory は parse 済みか null | registry に載る session は **model 数を問わず** 各 entry を `reviewed_at` の window と照合し、不一致・window 外を `reviewer_session_model_history_mismatch:<session>` として collect。registry の `runtime` と entry の `reviewer_model` の provider（`modelProviderFromId`）が食い違えば `reviewer_session_model_history_runtime_mismatch:<session>`。registry に無い session は従来の `reviewer_session_model_conflict`。`sessionModelHistoryError` が与えられたら registry path を plan_id にした違反を collect | 履歴は宣言した session だけを緩め、他 session を緩めない | U-RVIDENT-012 / 013 / 015 / 017 |

doctor の `review-evidence` check は `loadReviewerSessionModelHistory(repoRoot)` を try/catch で呼び、
失敗理由を `sessionModelHistoryError` として渡す。

## 4. registry の意味

`docs/governance/reviewer-session-model-history.json` は runtime 所有者の**申告**である。`basis` に
根拠と「attestation ではない」旨を必ず書く。window の追加は所有 runtime が自分の切替時刻と
申告 model を commit する（他 runtime が代筆しない）。実効 model を harness が観測する経路
（SessionStart 時の申告 model 記録と、切替時の session 再発行）は後続 slice とし、本設計は
その正本となる履歴の置き場所を先に用意する。

## 4a. supersession と admission の接合

`plan-supersession` は `supersedes` / `superseded_by` の双方向参照を同一 tree で要求する一方、
`github workflow-identity-admission` は変更された typed PLAN が 1 本でなければ
`workflow_identity_admission_multiple_plans` で拒否する。両立させるため、admission は
`superseded_by` だけを受け取る既存 PLAN（branch-kind と同じ `isSupersessionMetadataOnly` 判定）を
slice 所有者候補から外す。published base を読めない場合は例外を適用せず従来どおり拒否する（fail-close）。

## 5. fail-close 条件

- registry に無い session が異なる model を名乗る（従来どおり衝突）。
- registry に載る session の entry が、`reviewed_at` 時点の window と異なる model を名乗る、
  または window 外にある。
- registry の schema / 時系列が不整合（parse 失敗）。読込失敗を履歴なしとして通す。
- 履歴宣言が他 session の衝突判定を緩める。
- registry の runtime と異なる provider の model が同 session id を名乗る（runtime_mismatch）。
- registry の `runtime` に `unknown` や未登録 runtime を書き、未知 model との「unknown 同士の一致」で runtime 照合を通過する。
- timezone 無しの日時で window 境界が実行環境の local time に依存する。

検査 oracle は `U-RVIDENT-012` 〜 `U-RVIDENT-017` の 6 件と `U-GWIDADM-022` で固定する（既存 `U-RVIDENT-001` 〜 `010`
は不変、`011` は freeze 伝播）。
