> **正本化済** (PLAN-REVERSE-01 で DISCOVERY-04 dogfood 実績から正本化、2026-06-04)。docs/process は forward/modes/gates の運用正本。規範変更は concept/requirements (上位正本) 先行 → 本 dir へ反映する。

# 右腕: L8-L14 検証フェーズ

出典: concept v3.1 §3.1 / §3.1.5 / §3.1.6 / requirements v1.2 §1.4 VALID_LAYERS / §2.2

---

## 総則

右腕の各工程は **左腕で凍結済みの ③ テスト設計** を ④ テストコードとして実施する。

- 右腕工程で **ペア未凍結のテスト設計を新規起票することは V-model 違反** (AP-7)。
- 検証工程で品質観点の不足が見つかった場合は、独立の **QA 追加テスト設計 doc** として正本化し、既存 ③ を書き換えない (concept v3.1 §3.4)。
- 検証失敗は左腕の適切な設計層へ差し戻す (§右腕差し戻しルール)。
- 右腕の pass claim は、左腕の test basis / test condition に対応する実行証跡を必要とする。NIST SSDF SP 800-218 の PW.8 系 practice と同じく、実行コード・環境・結果・欠陥 routing が追跡できない検証は acceptance evidence にしない。
- Sprint / PoC 由来の increment は、Scrum Guide 2020 の Sprint Review と同じく inspect/adapt の入力であって、PO/S4 判定または Forward 右腕 gate の acceptance evidence なしに完了扱いしない。
- LLM / agentic workflow の自律実行は、OWASP LLM06:2025 Excessive Agency のリスクモデルに従い、人間承認・権限境界・不可逆操作の gate evidence が無い限り completion evidence にしない。
- 外部基準の参照元: NIST SSDF SP 800-218 (<https://csrc.nist.gov/pubs/sp/800/218/final>、Rev. 1 IPD は <https://csrc.nist.gov/pubs/sp/800/218/r1/ipd> で追跡) / Scrum Guide 2020 (<https://scrumguides.org/scrum-guide.html>) / ISTQB Glossary (<https://glossary.istqb.org/>) / OWASP LLM06:2025 Excessive Agency (<https://genai.owasp.org/llmrisk/llm062025-excessive-agency/>) / GitHub Environments required reviewers (<https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments>) / VS Code Webview Security (<https://code.visualstudio.com/api/extension-guides/webview#security>) / Google SRE Release Engineering (<https://sre.google/sre-book/release-engineering/>)

### Verification source ledger (checked 2026-06-30)

| source | official URL | adopted version/date | latest official status | adoption decision | verification use | gate impact |
|--------|--------------|----------------------|------------------------|-------------------|------------------|-------------|
| NIST SSDF SP 800-218 | <https://csrc.nist.gov/pubs/sp/800/218/final> / <https://csrc.nist.gov/pubs/sp/800/218/r1/ipd> | final publication 1.1 (2022-02-04) | Rev. 1 initial public draft v1.2 (2025-12-17) | adopt-final-1.1; track-draft-do-not-adopt-until-final | 実行コード・環境・結果・欠陥 routing が追跡できる security/release evidence を要求する | G8 / G9 / G12 / G13 / G14 |
| Scrum Guide 2020 | <https://scrumguides.org/scrum-guide.html> | November 2020 guide | current official Scrum Guide page | adopt-current-guide | Sprint Review / inspect-adapt は完了宣言ではなく、PO/S4/Forward gate 判定への入力として扱う | S3 / S4 / G11 / G12 |
| ISTQB Glossary | <https://glossary.istqb.org/> | live official glossary | live official glossary | adopt-live-terms-with-ledger-date | test basis / test condition / execution evidence / defect routing の用語を右腕 gate vocabulary に固定する | G8-G14 |
| OWASP LLM06:2025 Excessive Agency | <https://genai.owasp.org/llmrisk/llm062025-excessive-agency/> | 2025 LLM risk entry | 2025 official LLM risk entry | adopt-2025-entry | agentic workflow の過剰自律を防ぎ、人間承認・権限境界・不可逆操作を completion blocker として扱う | G11 / G12 / G13 / G14 |
| GitHub Environments required reviewers | <https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments> | live GitHub Actions environments docs | live official GitHub docs | adopt-live-docs-for-approval-shape | deployment / release approval を action-binding な reviewer evidence として扱う | G12 / G13 / action-binding approval |
| VS Code Webview Security | <https://code.visualstudio.com/api/extension-guides/webview#security> | live VS Code API docs | live official VS Code docs | adopt-live-docs-for-webview-risk | Webview / dashboard / screenshot evidence で local resource・script・message 境界を検証対象にする | G10 / G11 |
| Google SRE Release Engineering | <https://sre.google/sre-book/release-engineering/> | SRE book release engineering chapter | live official Google SRE book | adopt-operational-guidance | rollback、release process、post-release monitoring を運用 control として扱う | G12 / G13 / G14 |

Ledger freshness policy: `checked` は公式 source を再確認した日付を表す。未来日、または現在日から 90 日超過の ledger は stale とし、G8-G14 / S4 / completion / cutover の判断材料にしない。

Source ledger meaning review: `checked` を更新する時は日付だけを直してはならない。date-only refresh は
gate evidence ではない。review evidence は
`source_status_delta` (公式 status/version/date に変化があるか)、`adoption_decision_delta`
(採用・追跡・比較のみの判断に変化があるか)、`workflow_route_impact` (G8-G14 / S4 / action-binding /
cutover / completion のどこへ差し戻すか) を記録する。公式 source が変わった、または row の adoption decision と
verification use が噛み合わなくなった場合は、ledger refresh ではなく対象 gate / mode / PLAN の設計差し戻しとして扱う。

> **正規式モデル: 右腕 = データ実在性エスカレーション (PLAN-RECOVERY-02、2026-06-04 PO 確定、非破壊)**: 右腕は使うデータ・環境の実在性が段階的に上がる検証の上昇。**合成/テストデータ (L8 結合 ⇔ L5 / L9 総合 ⇔ L4)** → **本番実データ (L10 実データ検証 ⇔ L2 画面 / L12 本番受入 ⇔ L3 要件)** → **L14 運用 (実データ×時間 ⇔ L1 要求)** → **L0 価値検証 (実成果)**。各層の検証本質 = L8 結合 / L9 総合 / L10 実データ検証 (画面を本番実データで) / L12 本番受入 (要件を本番で満たすか) / L14 運用。**L14 の「次サイクル L0 企画へ feedback」が L0 企画の価値検証ペア**を成し V の頂点を閉じる (従来 L0 はペア無しだった穴埋め)。番号・既存ペアは据え置き (overview §4 / concept §2.3 正規式表)。

### 右腕 evidence profile (G8-G14)

| gate | 左腕 test basis | 右腕 test condition | 必須 evidence | gate 消費形態 |
|------|----------------|---------------------|---------------|---------------|
| G8 | L5 D-API / D-DB / D-CONTRACT | module / state / adapter / asset / DB 境界が結合して動く | `g8-integration-evidence-v1` manifest、selected IT IDs、command exit 0、coverage row、stale defer 0 | `g8-integration-workflow` hard gate |
| G9 | L4 architecture / ADR / system contract | system behavior が feature pack / roadmap span 単位で成立する | ST-* row、system command evidence、roadmap span coverage、regression finding routing | G9 child PLAN で manifest 化するまで `right-arm-gate-planning` が route を保持 |
| G10 | L2 screen / mock / UX requirement | 本番相当データで画面・会話 UI が成立する | screenshot / render smoke / accessibility finding / real-data fixture provenance | G10 child PLAN で profile 化。現時点は `screen-impl-pair-freeze` と frontend coverage が前段証跡 |
| G11 | L1 business requirement + L3 FR/AC | UAT feedback が要求・要件に照合済み | UAT decision record、accepted/rejected feedback、add-design/backprop route | human/PO evidence 必須。未処理 feedback は Forward 完了不可 |
| G12 | L3 acceptance test design | release candidate が受入条件を満たす | acceptance command evidence、release approval、rollback/destructive check | PO signoff 必須。外部/本番影響は escalation 境界 |
| G13 | L12 deployment record | deployed/staging 環境 smoke が通る | smoke command evidence、monitoring quiet window、incident routing if failed | production write は人間承認なしに実行しない |
| G14 | L1 operational test design + L0 value hypothesis | 運用データ×時間で要求・価値が保たれる | operational metric snapshot、incident/backlog delta、L14→L0 feedback record | 価値検証 feedback。未記録なら「L14 達成」ではない |

### Action-binding approval decision record

G11-G14 または mode activation で本番・外部 API・infra・secret・認証/認可・destructive/state 変更などの
高影響 action を扱う PLAN は、prose の「承認済み」ではなく `action_binding_approval_record` を持つ。
これは承認を作業全体へ包括付与するものではなく、actor / tool / target / params / expiry を特定した
最小権限の実行許可である。

`ut-tdd action-binding approval-packet` はこの record を PO / named approver が精査するための
非破壊 planning surface であり、承認を記録・代行・適用しない。packet は
`action-binding-approval-packet.v1`、`planOnly=true`、`mustNotApprove=true`、
`approvalCommandAvailable=false`、`approvalAllowed=false` を固定し、outcome は
`approve_action_binding` / `deny_action` / `request_scope_reduction` の 3 つだけを示す。
packet は `approvalRecord` の raw field に加えて `approvalBindingChecks[]` を持ち、各 field を
`concrete` / `pending` / `invalid` のいずれかに分類する。`pending` または `invalid` が残る packet は
承認材料の不足を示すだけで、action 実行や承認記録には使えない。
`approve_action_binding` に進む場合でも、PLAN 本文へ named approver、approved_actor、
approved_tool、approved_target、approved_params、reviewed snapshot binding、expiry/trigger、audit evidence を concrete に記録するまで、
高影響 action を実行してはならない。

| field | 必須条件 | 意味 |
|---|---|---|
| `action_binding_approval_record` | high-impact action を含む PLAN で必須 | action-binding approval の判断単位。無い場合は completion blocker |
| `allowed_outcome` | 常時必須 | `approve_action_binding` / `deny_action` / `request_scope_reduction` のいずれか |
| `approval_policy_or_named_approver` | 常時必須 | `.ut-tdd/config/approval-policy.yaml` の policy ID、または承認した PO / named approver |
| `approval_scope` | 常時必須 | 承認対象の概要。範囲外 action は未承認として扱う |
| `approved_actor` | 常時必須 | 承認された実行主体。未承認の場合は「未承認であること」と将来の named actor 条件を記録する |
| `approved_tool` | 常時必須 | 承認された CLI / CI job / Webview action / 外部 tool。未記録 tool での実行は禁止 |
| `approved_target` | 常時必須 | 承認された repo / environment / service / state path / resource。target 外の実行は禁止 |
| `approved_params` | 常時必須 | 承認された command args / config diff / params hash or summary。params 変更時は再承認 |
| `review_approval_evidence` | 常時必須 | 承認前に確認した diff / dry-run / risk review / evidence path |
| `reviewed_snapshot_binding` | 常時必須 | version-up では `activationSnapshot.snapshotId`、rename/cutover では `cutoverSnapshot.snapshotId`、それ以外では snapshot 対象外の根拠。関連 packet の snapshotId が変わった場合は旧承認 evidence を流用しない |
| `expires_at_or_trigger` | 常時必須 | 承認が失効する日時、または trigger-bound な再承認条件 |
| `audit_record` | action 実行前後で必須 | 実施時刻、command/action、approver、result、incident/backlog route |

### L14 irreversible cutover decision record

L14 で state dir 移行、CLI/marker 改名、本番/配布 surface 変更などの不可逆 cutover を扱う PLAN は、
単なる「PO signoff」ではなく `cutover_decision_record` を持つ。これは L14 実行許可ではなく、
許可・延期・runbook 修正要求を判断するための evidence schema である。

| field | 必須条件 | 意味 |
|---|---|---|
| `cutover_decision_record` | 不可逆 cutover PLAN で必須 | L14 cutover の判断単位。無い場合は completion blocker |
| `allowed_outcome` | 不可逆 cutover PLAN で必須 | `approve_cutover` / `reject_or_defer` / `request_runbook_changes` |
| `decision_owner` | 不可逆 cutover PLAN で必須 | PO または action-binding approval の named owner |
| `cutover_snapshot_id` | 不可逆 cutover PLAN で必須 | `ut-tdd rename plan --json` の current `cutoverSnapshot.snapshotId`。snapshot が変わったら旧 cutover / approval evidence を流用しない |
| `trigger_condition` | 不可逆 cutover PLAN で必須 | 何が満たされたら cutover 判定へ進めるか |
| `blast_radius_baseline` | 不可逆 cutover PLAN で必須 | 影響識別子、state path、hook/adapter、docs/CI の再計測基準 |
| `dry_run_plan` | apply 前必須 | codemod、state move、dist smoke、doctor/review を非破壊で検証する手順 |
| `rollback_plan` | apply 前必須 | 失敗時の復帰点、alias/shim、branch/tag、state restore 条件 |
| `state_backup_plan` | state dir / DB を触る場合必須 | harness.db / memory / handover / logs の backup と restore 対象 |
| `execution_window_or_freeze_policy` | apply 前必須 | 実行 window、frozen HEAD、同時実行禁止、window 外・HEAD/scope drift 時の再承認条件 |
| `approval_scope` | 本番・配布・認証・secret・state 変更で必須 | 承認対象の具体範囲。範囲外の実適用は禁止 |
| `audit_record` | terminal status 前必須 | 実施時刻、commands、hash、approver、result、incident route |
| `post_cutover_monitoring` | terminal status 前必須 | quiet window、smoke、doctor、feedback/backlog 監視 |
| `legacy_alias_policy` | CLI/dir/marker rename で必須 | 旧名 alias/shim を残すか、いつ外すか |

Cutover source ledger (checked 2026-06-30):

| source | official URL | adopted version/date | latest official status | adoption decision | cutover use | required field impact |
|---|---|---|---|---|---|---|
| NIST SSDF SP 800-218 | <https://csrc.nist.gov/pubs/sp/800/218/final> / <https://csrc.nist.gov/pubs/sp/800/218/r1/ipd> | final publication 1.1 (2022-02-04) | Rev. 1 initial public draft v1.2 (2025-12-17) | adopt-final-1.1; track-draft-do-not-adopt-until-final | release integrity / archive / protection traceability | `audit_record`, `state_backup_plan`, `blast_radius_baseline` |
| GitHub Environments required reviewers | <https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments> | live GitHub Actions environments docs | live official GitHub docs | adopt-live-docs-for-approval-shape | action-binding deployment approval pattern | `decision_owner`, `allowed_outcome`, `approval_policy_or_named_approver`, `approval_scope`, `approved_actor`, `approved_tool`, `approved_target`, `approved_params`, `review_approval_evidence`, `expires_at_or_trigger` |
| GitHub Actions concurrency | <https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency> | live GitHub Actions concurrency docs | live official GitHub docs | adopt-live-docs-for-single-cutover-window | cutover apply must not run concurrently or outside the approved frozen window | `execution_window_or_freeze_policy` |
| Google SRE Release Engineering | <https://sre.google/sre-book/release-engineering/> | SRE book release engineering chapter | live official Google SRE book | adopt-operational-guidance | rollback and release process as operational controls | `dry_run_plan`, `rollback_plan`, `post_cutover_monitoring` |
| OWASP LLM06:2025 Excessive Agency | <https://genai.owasp.org/llmrisk/llm062025-excessive-agency/> | 2025 LLM risk entry | 2025 official LLM risk entry | adopt-2025-entry | irreversible agentic actions require constrained authority and human oversight | `approval_scope`, `legacy_alias_policy`, `audit_record` |
| SLSA Provenance | <https://slsa.dev/spec/v1.2/provenance> | SLSA Provenance v1.2 | current SLSA provenance specification | adopt-v1.2-for-cutover-artifact-provenance | cutover artifact, command, builder, and material provenance must be reproducible from audit evidence | `audit_record`, `blast_radius_baseline`, `state_backup_plan` |

Cutover ledger freshness follows the same 90-day policy as the verification source ledger. Stale official-source decisions cannot authorize irreversible L14 cutover or action-binding approval records.
Cutover source ledger meaning review uses the same `source_status_delta` / `adoption_decision_delta` /
`workflow_route_impact` evidence. Date-only refresh cannot approve an irreversible rename, state move, alias policy,
or action-binding approval; any source change that affects approval scope, concurrency, rollback, provenance, backup,
or monitoring routes the cutover PLAN back to `request_runbook_changes` before apply.

`ut-tdd rename plan --json` must also emit `cutoverSnapshot`. `cutoverSnapshot.snapshotId` binds the current blast-radius
digest, approval scope digest, backup/provenance/monitoring evidence digest, and freeze-policy reapproval triggers. This
snapshot does not authorize apply; it lets PO/TL compare the approval evidence with the current rename packet and reject
stale approvals when HEAD, hit set, scope, dry-run, backup, rollback, provenance, monitoring, or quiet-window evidence
changes.

Whole-program completion readiness: `ut-tdd status --json` の
`outstanding.completionReadiness.ok` が `false` の間は、G8-G14 個別証跡や
`doctor` green があっても「L14 全件達成」ではない。非終端 PLAN、open defer、
version-up parked、PO/S4 decision pending、人間承認待ち、不可逆 migration 待ちのいずれかが
残る場合、status は completion `blocked` を返し、必要な action/evidence を PLAN 単位で示す。

---

## 各層定義

### L8 結合テスト

| 項目 | 内容 |
|------|------|
| 名称 | 結合テスト (Integration Testing) |
| 目的 | L5 詳細設計で凍結した ③ 結合テスト設計を ④ テストコードとして実施し、モジュール間接続・API 契約・DB 整合を検証する |
| 主要成果物 ④ | 結合テスト実施結果 (`tests/integration/`) |
| V-pair (左腕) | **L5** 詳細設計 (D-API / D-DB / D-CONTRACT ⇔ 結合テスト設計) |
| 主要ゲート | **G8** 結合テスト品質 |
| 入口 | G7 exit 後 |
| 出口 | G8 通過 (結合テスト全件 pass) → L9 へ |
| 主要 role | `aim` / `qa` |
| 差し戻し先 (失敗時) | L5 詳細設計 または L7 実装 |

出典: requirements v1.2 §1.4 L8 / concept v3.1 §3.1.5

---

### L9 総合テスト

| 項目 | 内容 |
|------|------|
| 名称 | 総合テスト (System Testing) |
| 目的 | L4 基本設計で凍結した ③ 総合テスト設計を ④ テストコードとして実施し、システム全体の振る舞いを検証する |
| 主要成果物 ④ | 総合テスト実施結果 (`tests/system/`) |
| V-pair (左腕) | **L4** 基本設計 (アーキ/ADR ⇔ 総合テスト設計) |
| 主要ゲート | **G9** 総合テスト品質 |
| 入口 | G8 exit 後 |
| 出口 | G9 通過 (総合テスト全件 pass) → L10 へ |
| 主要 role | `qa` |
| 差し戻し先 (失敗時) | L4 基本設計 |

出典: requirements v1.2 §1.4 L9 / concept v3.1 §3.1.5

---

### L10 UX 磨き

| 項目 | 内容 |
|------|------|
| 名称 | UX 磨き (Frontend / UX Polish) |
| 目的 | L2 画面設計で凍結したワイヤーモックを本 UX (高品質表示) へ昇格させる。検証本質 = 実データ検証 (本番の実データで画面/表示が成立するか、正規式モデル) |
| 主要成果物 | 本番 UI 実装 / UX 確認記録 |
| V-pair (左腕) | **L2** 画面設計 (ワイヤーモック → 本 UX 昇格) |
| 主要ゲート | **G10** UX 確認 |
| 入口 | G9 exit 後 |
| 出口 | G10 通過 (UX 承認) → L11 へ |
| 主要 role | `uiux` / `fe` |

**drive 別 L10 要否 (requirements v1.2 §1.6)**:

| drive | L10 必要条件 |
|-------|-------------|
| fe | **常に必要** |
| fullstack | **常に必要** |
| agent | **常に必要** (会話 UI / デモ確認) |
| be | UI を持つ場合のみ |
| db | UI を持つ場合のみ |

出典: concept v3.1 §3.7 / requirements v1.2 §1.6

---

### L11 総合レビュー + UAT

| 項目 | 内容 |
|------|------|
| 名称 | 総合レビュー + ユーザー受入テスト (Comprehensive Review + UAT) |
| 目的 | L1 業務要求 + L3 要件 ↔ 実装・テスト結果の全体突合、UAT (ユーザー検証)、フィードバックの L1/L3 巻き取り |
| 主要成果物 | UAT 実施記録 / L1・L3 doc 更新 (巻き取り分) |
| V-pair (左腕) | L1 / L3 (全体突合の参照先) |
| 主要ゲート | **G11** UAT 承認 |
| 入口 | G10 exit 後 |
| 出口 | G11 通過 (UAT 全件承認 + フィードバック巻き取り確定) → L12 へ |
| 主要 role | `pm` + `po` 主体 (UAT は po 主体、巻き取り update は tl) |

注: L11 はスプリント管理より「要件と実装の全体整合確認」に重きを置く。フィードバック巻き取りは `add-design` として差分 PLAN を起票し、既存 ① 設計 doc を直接書き換えない (add-feature mode 準拠)。
出典: concept v3.1 §3.1.6

---

### L12 デプロイ + 受入

| 項目 | 内容 |
|------|------|
| 名称 | デプロイ + 受入 (Deployment + Acceptance) |
| 目的 | L3 要件定義で凍結した ③ 受入テスト設計を ④ テストコードとして実施し、リリース判定する |
| 主要成果物 ④ | 受入テスト実施結果 / デプロイ完了記録 |
| V-pair (左腕) | **L3** 要件定義 (FR+AC ⇔ 受入テスト設計) |
| 主要ゲート | **G12** リリース承認 |
| 入口 | G11 exit 後 |
| 出口 | G12 通過 (受入テスト全件 pass + リリース承認) → L13 へ |
| 主要 role | `pm` + `po` 必須 (リリース承認は po サインオフ) |

注: デプロイは Protected Branch / CODEOWNERS / GitHub Actions workflow 経由で行う (concept v3.1 §7)。本番影響・認証・認可を含む操作は人間サインオフ必須 (escalation 境界)。
出典: requirements v1.2 §1.4 L12 / concept v3.1 §2.4 (セキュリティ統合)

---

### L13 デプロイ後検証

| 項目 | 内容 |
|------|------|
| 名称 | デプロイ後検証 (Post-Deployment Verification) |
| 目的 | 本番 (または staging) 環境での smoke test / 運用立ち上げ確認 |
| 主要成果物 | smoke test 結果 / 実環境確認記録 |
| V-pair (左腕) | (直接のペアはなし、L12 の続き) |
| 主要ゲート | **G13** デプロイ後確認 |
| 入口 | G12 exit 後 |
| 出口 | G13 通過 (smoke test 全件 pass + 監視アラートなし) → L14 へ |
| 主要 role | 自動 CI + `pm` 確認 |

出典: requirements v1.2 §1.4 L13

---

### L14 運用検証 + 改善

| 項目 | 内容 |
|------|------|
| 名称 | 運用検証 + 改善 (Operations + Improvement) |
| 目的 | L1 要求定義で凍結した ③ 運用テスト設計を ④ として実施し、次サイクルへ feedback する |
| 主要成果物 ④ | 運用テスト実施結果 / 改善 backlog 更新 / 次サイクル L0 企画へ feedback |
| V-pair (左腕) | **L1** 要求定義 (業務要求 BR-*/NFR-* ⇔ 運用テスト設計) |
| 主要ゲート | **G14** 運用承認 + サイクル feedback |
| 入口 | G13 exit 後 |
| 出口 | G14 通過 → 次サイクル L0 企画へ feedback |
| 主要 role | `pm` + `po` |

注: Sentry / Uptime Robot / Dependabot アラートをチーム共有 audit へ記録し、個人 `failure_log.jsonl` はローカル advisory に留める。異常検知は escalation (L0-L3) へ繋ぐ (concept v3.1 §2.4)。
出典: requirements v1.2 §1.4 L14 / concept v3.1 §2.4

---

## 右腕差し戻しルール

検証工程で失敗した場合の差し戻し先を明示する (concept v3.1 §3.1.5):

| 失敗工程 | 差し戻し先 |
|---------|-----------|
| L8 結合テスト失敗 | L5 詳細設計 または L7 実装 |
| L9 総合テスト失敗 | L4 基本設計 |
| L10 UX 不承認 | L2 画面設計 (モック再確認) |
| L11 UAT フィードバック | **L3 要件**: `kind=add-design layer=L3` 差分起票 / **L1 業務要求**: `kind=design layer=L1` 新規 PLAN (add-design は L3-L6 限定のため L1 不可。schema fail-close、§1.3 / frontmatter.ts)。既存 doc は不可変 |
| L12 受入テスト失敗 | L3 要件定義 または L7 実装 |
| L13 デプロイ後検証 失敗 | smoke 全断・本番回帰 → `regression_prod` signal で **Incident mode** 起動 (incident.md §2、三者承認必須) / 軽微な設定ミス → L12 再デプロイ |
| L14 運用検証 失敗 | 運用テスト観点不足 → 次サイクル L1/L3 設計 feedback / 重大 NFR 逸脱 → Incident または L1 要求見直し |

差し戻し記録は PLAN の carry log に残す。右側工程で「ペア未凍結のテスト設計を後付け」することは V-model 違反 (AP-7)。

> **正本化済 (2026-06-02、REVERSE-01 R2-R4 → 2026-06-04 全体正本化)**: L10-L14 差し戻し (L13→Incident 橋渡し・L11 の L1/L3 分岐 含む) は **concept §3.1.5「右腕工程の差し戻しルール (L8-L14)」が正本**。本表はそのミラー。

---

## QA 追加テストの分離原則 (concept v3.1 §3.4)

L8/L9 で発見した品質不足観点は以下の手順で扱う:

1. 既存の ③ テスト設計 (L5/L6 で凍結済み) を **直接書き換えない**
2. 独立した **QA 追加テスト設計 doc** を `docs/test-design/` に正本化する
3. その追加テスト設計 doc に対応する ④ テストコードだけを `tests/` に追加する
4. 追加が大きい場合は `add-design` / `add-impl` (Add-feature mode) として差分 PLAN を起票する
