---
title: "review_evidence reviewer session × model 有効期間 L8単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-09-05
updated: 2026-09-05
owner: QA
plan: docs/plans/PLAN-RECOVERY-1543-reviewer-session-model-history.md
pair_artifact: docs/design/helix/L6-function-design/review-evidence-reviewer-session-model-history.md
---

# review_evidence reviewer session × model 有効期間 L8単体テスト設計

本 pair の oracle は既存 `tests/review-evidence.test.ts` の U-RVIDENT 系に追記する（同一 file で管理）。
fixture は in-memory の registry（`parseReviewerSessionModelHistory` の戻り値）と PLAN entry で、
実 repository の green 状態に依存しない。

| U-ID | 対象 | 反例と期待結果 | test citation |
| --- | --- | --- | --- |
| U-RVIDENT-012 | 有効期間による切替の許容 | registry に Sol（〜03:00Z）/ codex（03:00Z〜）の 2 window を宣言した session が、旧 window で Sol・新 window で codex を名乗っても違反 0。同じ入力で registry を渡さないと従来どおり `reviewer_session_model_conflict` になることも固定する（履歴宣言だけが解消手段） | `tests/review-evidence.test.ts` |
| U-RVIDENT-013 | history_mismatch の fail-close | 切替前に新 model を名乗る、切替後に旧 model を名乗る（旧記録への文字列合わせ）、どの window にも入らない、の 3 反例が `reviewer_session_model_history_mismatch:<session>` で red。model が 1 つでも registry 登録 session は照合される | `tests/review-evidence.test.ts` |
| U-RVIDENT-014 | registry parse の fail-close | schema_version 不一致、window の since が直前 until より前（重複）、末尾以外の open window、`until <= since`、session id 形式不正、session 重複、空 basis、`runtime: "unknown"`、未登録 runtime（`ollama`）、timezone 無し `since`、日付のみの `until` の 11 反例が `reviewer_session_model_history_invalid:<locator>` で throw。読込側の失敗理由は registry path を plan_id にした違反として surface | `tests/review-evidence.test.ts` |
| U-RVIDENT-015 | 他 session への非波及 | registry に無い session が別 model を名乗ると、履歴が別 session に存在しても従来の衝突が出る | `tests/review-evidence.test.ts` |
| U-RVIDENT-016 | 実 repo ガード | tracked registry が parse でき、`019febe1-…` を含み、現行 docs/plans の全 entry と矛盾しない（violation 0） | `tests/review-evidence.test.ts` |
| U-RVIDENT-017 | registry runtime と provider の整合 | runtime=codex を宣言した session で `claude:claude-opus-5` を名乗る entry が `reviewer_session_model_history_runtime_mismatch:<session>` で red（window 照合の mismatch とは別 reason）。provider 一致・window 内の対照は違反 0 | `tests/review-evidence.test.ts` |
| U-GWIDADM-022 | admission の supersession 例外 | `superseded_by` だけを受け取る既存 PLAN を typed PLAN として数えると successor 1 本の PR が `multiple_plans` で red。base を読めない場合や本文も変わっている場合に例外を適用すると red | `tests/github-workflow-identity-admission.test.ts` |

## mutation 実測記録

2026-09-05T06:07Z に修正版へ 3 変異を個別注入して red を実測し、復元後 5 passed を確認した。

| 変異 | red になった oracle |
|---|---|
| M1: registry 照合分岐（`if (declared)`）を無効化し従来規則へ戻す | U-RVIDENT-012 / 013 |
| M2: `reviewerModelAt` が `until` を無視して since 以降を全て該当扱い | U-RVIDENT-012 / 013 |
| M3: window の重複区間検証（`since < previousUntil`）を外す | U-RVIDENT-014 |
| M5: registry runtime と provider の照合を外す | U-RVIDENT-017 |
| M6: runtime 許容集合の検査を外す（`historyRuntime` を素通し） | U-RVIDENT-014 |
| M7: `HISTORY_ISO_PATTERN` 検査を外し `Date.parse` のみに戻す | U-RVIDENT-014 |

M6 / M7 は 2026-09-05T07:22:33Z〜34Z に個別注入して各 1 failed、復元後 1 passed を実測した。
| M4: admission の metadata-only 例外（`isSupersessionMetadataOnly` 判定）を無効化 | U-GWIDADM-022（06:40:09Z に 1 failed、復元後 1 passed） |

origin/main には `parseReviewerSessionModelHistory` 等が存在しないため、追加 oracle は main 版では
import 失敗で red になる（構造的 red）。実 repo ガード U-RVIDENT-016 は、registry に `019febe1-…` の
Sol window（open）だけを宣言した状態で現行 docs/plans と矛盾しないことを固定する。切替後の window は
Codex 所有者が申告時刻とともに追記する。
