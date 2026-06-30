> **正本化** (PLAN-DISCOVERY-09 S4 ADOPT、2026-06-26)。docs/process は forward/modes/gates の運用正本。規範変更は concept/requirements (上位正本) 先行 → 本 dir へ反映する。

# version-up 駆動モデル

出典: concept v3.1 §2.5 (9-mode 後の追加 mode) / requirements v1.2 §6.8.8.1 (forward-convergence) / §7.8.1 (`version_deferral` signal) / PLAN-DISCOVERY-09

---

## 1. 概要

version-up は、確立済/計画済の capability を **将来の製品バージョンへ保全 (preserve)** する mode。**いまは Forward freeze / 配布スコープに入れない**が、**archived (破棄) ではなく将来版で Forward へ入れる**ことを **明示・機械追跡**する。

「deferred-but-committed-future」= **archived (破棄) でも plain draft (WIP) でも Add-feature (今追加) でも Retrofit (依存 upgrade) でもない第 4 の状態**。第一ケースは中央UI 系 (PLAN-L7-141 / PLAN-L7-146) を「画面なし配布 (PLAN-L7-157 R2)」の下で将来版へ保全することだった。

現在状態 (2026-06-30): PLAN-L7-141 は component-derived read-only UI slice として activation 済みのため `version_target` を外して `status=confirmed`。PLAN-L7-146 は外部 serverless 配信・HMAC secret・閲覧アクセス制御を含むため、引き続き `version_target: future` の version-up parked として保全する。

## 2. 入口条件

- signal = `version_deferral` (PO 決定: ある capability を将来版へ保全。今スコープ外だが破棄しない)。
- 既存の active draft (WIP) との違い = **明示の意図** (将来版で必ず入れる)。archived との違い = **保全** (消さない)。
- `version_deferral` 単体は保全なので承認不要。ただし activation 信号が外部 API・infra、HMAC/webhook、閲覧 access control、secret、認証/認可、schema migration などを含む場合、route eval は mode=`version-up` のまま `escalation_boundaries[]` に検出した境界を返し、action-binding approval なしでは exit 1 にする。

## 3. 機械表現 (新 kind を作らない)

- 保全中の PLAN は **既存 kind を維持** (例: impl) + `status=draft` + frontmatter **`version_target: <label>`**。
- `version_target` は **status=draft でのみ有効** (landed=confirmed/completed には付与禁止 = schema fail-close)。label は version-up ledger (`src/lint/forward-convergence.ts` `VERSION_UP_ALLOWED_TARGETS`) に照合する。
- `ut-tdd status` の outstanding は **active draft と version-up parked を分離**表示 (将来版保全を WIP と混同しない / green に埋めない)。
- forward-convergence (要件定義書 §6.8.8.1) は `version_target` 付き draft を **正当な deferred 種別**として扱い、unconverged-landed (違反) にしない。

## 4. Forward 合流点

- **将来版 activation 時に add-feature (L2/L3 → L7) で Forward へ合流**する。それまでは parked (保全)。
- activation PLAN は parked PLAN への requires/reference を持つ (合流 trace)。activation 後は `version_target` を外す。
- activation が外部配信・外部 API・infra・secret・認証/認可を伴う場合は、Forward 合流前に dry-run plan、rollback、approval scope を作り、承認後にのみ実適用する。これは version-up の例外ではなく HNFR-P8 / XR-2 の hard boundary。
- parked PLAN は `activation_decision_record` を持つ。record は `allowed_outcome`、`review_by`、`approval_scope`、`dry_run_plan`、`rollback_plan` を明示し、活性化・却下・継続 park のいずれでも根拠を残す。

### 4.1 activation decision record

version-up parked PLAN は、将来版へ保全している間も「次に何を決めれば進めてよいか」を失わないため、
以下の decision record を本文に持つ。

| field | 必須条件 | 意味 |
|---|---|---|
| `activation_decision_record` | 常時必須 | 将来版 activation の判断単位。これが無い parked PLAN は plain draft と区別できない |
| `allowed_outcome` | 常時必須 | `activate_future_version` / `reject_or_archive` / `keep_parked_with_review_date` のいずれか |
| `review_by` | `keep_parked_with_review_date` 選択時必須 | 継続 park を放置にしないための再確認日と owner |
| `approval_scope` | 外部 API・infra・secret・認証/認可を含む activation で必須 | 承認対象の範囲。Cloudflare / HMAC / webhook / access control 等を明示する |
| `dry_run_plan` | 外部 boundary を含む activation で必須 | 実適用前に read-only / no-secret / no-prod-write を検証する手順 |
| `rollback_plan` | 外部 boundary を含む activation で必須 | activation 失敗時に parked 状態へ戻す手順 |

`activation_decision_record` が `activate_future_version` へ進む場合、当該 PLAN は add-feature route に接続し、
activation 後に `version_target` を外す。`reject_or_archive` の場合は破棄理由を記録して archived 化する。
`keep_parked_with_review_date` の場合は `review_by` を更新し、completion readiness は引き続き blocked とする。

## 5. 要求・機能一覧との意味対応

version-up の機能一覧は、単に `version_target` を受理することではない。L0/P1 の「今版に入れない作業を失わない」
要求を、L3 受入条件、mode catalog、PLAN 実体、doctor gate へつなげて初めて成立する。

| 層 / 正本 | version-up で満たす意味 |
|---|---|
| L0 charter P1 | `version_target` による deferred-but-committed な繰り越しで、今版に入れない作業を失わない |
| L3 `HR-FR-P1-02` / `HAC-P1-02a` | 今版対象外 requirement は `version_target` と理由が無ければ fail-close |
| `docs/process/modes/README.md` | `version_deferral` signal を `version-up` に route し、将来版活性化時は add-feature で Forward 合流する |
| 本 mode doc | parked と active draft / archived / Add-feature / Retrofit を分離し、activation 境界を定義する |
| parked PLAN | `status=draft` + `version_target` + `version-up parked` + `mode=version-up` + activation 条件を持つ |
| doctor gate | `version-up-readiness` が L0/L3/L4/mode catalog/PLAN 実体の意味対応を検査する |

現在の機能セットは次の 5 点である。

1. **保全 marker**: `version_target` は status=draft の PLAN にだけ許可する。
2. **未了の弁別**: `ut-tdd status` は active draft と version-up parked を分離する。
3. **Forward 収束**: forward-convergence は version-up parked を未集約 landed 違反にしないが、完了扱いにも埋めない。
4. **activation**: 将来版で再開するときは add-feature で L2/L3 → L7 へ Forward 合流する。
5. **安全境界**: 外部 API・infra・secret・認証/認可等を含む activation は `escalation_boundaries[]` と action-binding approval が無ければ exit 1。

## 6. 他 mode との非重複

| mode | version-up との違い |
|------|---------------------|
| Add-feature | 「いま」追加。version-up は「将来版で」追加 (時間軸) |
| Retrofit | 依存・基盤の upgrade。製品機能の version 繰延ではない |
| archived | 破棄。version-up は将来必ず Forward へ入れる保全 |
| plain draft | 単なる WIP。version-up は明示マーカー付きの意図的将来保全 |

## 7. このドキュメントの位置付け

本 mode 定義は PLAN-DISCOVERY-09 S4 ADOPT で正本化。gate の機械検証条件は forward-convergence (要件定義書 §6.8.8.1)、frontmatter 制約は schema (`version_target` は status=draft 限定)。
