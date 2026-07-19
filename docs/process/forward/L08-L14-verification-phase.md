<!-- HELIX:L3-PROGRESSION-AUTHORITY:v1 -->
> **現行authority（2026-07-19）**: 本文の判断基準はL1-L12 directiveとL3 progression authorityを正とする。ファイル名`L08-L14`はlegacy physical IDであり、旧G13/G14・L13/L14をcurrent gateとして使用しない。

# 右腕: L7-L12 検証フェーズ

一次根拠: `docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md` / `docs/governance/l3-progression-authority-rebaseline-2026-07-19.md`

---

## 総則

右腕の各工程は **左腕で凍結済みの ③ テスト設計** を ④ テストコードとして実施する。

## canonical pair・gate

| gate | canonical pair | 検証本質 | 旧physical evidenceの投影 |
|---|---|---|---|
| G7 | L6↔L7 | unit実装・TDD closure | 旧L7/L8 unit evidence |
| G8 | L5↔L8 | integration品質 | 旧L8/L9 integration evidence |
| G9 | L4↔L9 | system品質 | 旧L9 system evidence |
| G10 | L3↔L10 | 機能要件・UX受入 | 旧L10 UX + 旧L12 acceptance evidence |
| G11 | L2↔L11 | 要求・人間受入 | 旧L11 UAT evidence |
| G12 | L1↔L12 | 価値・運用品質 | 旧L12 release + L13 smoke + L14 operation/value evidence |

検証失敗は対応する左腕へ差し戻す。旧G13/G14 receiptはG12のevidence componentとしてのみ取り込み、独立gate passやwhole-program completionを主張しない。

- 右腕工程で **ペア未凍結のテスト設計を新規起票することは V-model 違反** (AP-7)。
- 検証工程で品質観点の不足が見つかった場合は、独立の **QA 追加テスト設計 doc** として正本化し、既存 ③ を書き換えない (concept v3.1 §3.4)。
- 検証失敗は左腕の適切な設計層へ差し戻す (§右腕差し戻しルール)。
- 右腕の pass claim は、左腕の test basis / test condition に対応する実行証跡を必要とする。NIST SSDF SP 800-218 の PW.8 系 practice と同じく、実行コード・環境・結果・欠陥 routing が追跡できない検証は acceptance evidence にしない。
- Sprint / PoC 由来の increment は、Scrum Guide 2020 の Sprint Review と同じく inspect/adapt の入力であって、PO/S4 判定または Forward 右腕 gate の acceptance evidence なしに完了扱いしない。
- LLM / agentic workflow の自律実行は、OWASP LLM06:2025 Excessive Agency のリスクモデルに従い、権限境界と不可逆操作の gate evidence が無い限り completion evidence にしない。人間承認は層外L0 anchorとL1-L3判断、不可逆cutover、本番・認証・secret・PII・license・destructive操作に限定する。
- 外部基準の参照元: NIST SSDF SP 800-218 (<https://csrc.nist.gov/pubs/sp/800/218/final>、Rev. 1 IPD は <https://csrc.nist.gov/pubs/sp/800/218/r1/ipd> で追跡) / Scrum Guide 2020 (<https://scrumguides.org/scrum-guide.html>) / ISTQB Glossary (<https://glossary.istqb.org/>) / OWASP LLM06:2025 Excessive Agency (<https://genai.owasp.org/llmrisk/llm062025-excessive-agency/>) / NASA Systems Engineering Handbook Appendix (<https://www.nasa.gov/reference/system-engineering-handbook-appendix/>) / W3C WCAG 2.2 (<https://www.w3.org/TR/WCAG22/>) / Playwright Test (<https://playwright.dev/docs/intro>、visual comparisons は <https://playwright.dev/docs/test-snapshots>、accessibility testing は <https://playwright.dev/docs/accessibility-testing>) / GitHub Environments required reviewers (<https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments>) / VS Code Webview Security (<https://code.visualstudio.com/api/extension-guides/webview#security>) / Google SRE Release Engineering (<https://sre.google/sre-book/release-engineering/>)

### Verification source ledger（checked 2026-07-03、検証台帳）

| source | 公式 URL | 採用 version/date | 最新公式 status | 採用判断 | 検証用途 | gate 影響 |
|---|---|---|---|---|---|---|
| NIST SSDF SP 800-218 | <https://csrc.nist.gov/pubs/sp/800/218/final> / <https://csrc.nist.gov/pubs/sp/800/218/r1/ipd> | final 1.1 (2022-02-04) | Rev. 1 initial public draft v1.2 | adopt-final-1.1; track-draft-do-not-adopt-until-final | security/release証跡 | G8 / G9 / G12 |
| Scrum Guide 2020 | <https://scrumguides.org/scrum-guide.html> | November 2020 | 現行公式page | adopt-current-guide | inspect/adapt | S3 / S4 / G11 / G12 |
| ISTQB Glossary | <https://glossary.istqb.org/> | live glossary | live official glossary | adopt-live-terms-with-ledger-date | test用語 | G8-G12 |
| OWASP LLM06:2025 Excessive Agency | <https://genai.owasp.org/llmrisk/llm062025-excessive-agency/> | 2025 entry | current 2025 entry | adopt-2025-entry | 人間承認・権限境界・不可逆操作 | G11 / G12 |
| NASA Systems Engineering Handbook Appendix | <https://www.nasa.gov/reference/system-engineering-handbook-appendix/> | updated 2019-05-08 | 現行appendix | adopt-vv-matrix-structure | V&V matrix | G8-G12 |
| W3C WCAG 2.2 | <https://www.w3.org/TR/WCAG22/> | Recommendation 2024-12-12 | 最新Recommendation | adopt-current-recommendation-for-accessibility-evidence | accessibility | G10 / G11 |
| Playwright Test | <https://playwright.dev/docs/intro> / <https://playwright.dev/docs/test-snapshots> / <https://playwright.dev/docs/accessibility-testing> | live docs | live official docs | adopt-live-docs-for-browser-evidence-shape | browser証跡 | G10 / G11 |
| GitHub Environments required reviewers | <https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments> | live docs | 現行公式docs | adopt-live-docs-for-approval-shape | action-binding approval | G12 / action-binding approval |
| VS Code Webview Security | <https://code.visualstudio.com/api/extension-guides/webview#security> | live docs | live official docs | adopt-live-docs-for-webview-risk | webview境界 | G10 / G11 |
| Google SRE Release Engineering | <https://sre.google/sre-book/release-engineering/> | release engineering chapter | live official book | adopt-operational-guidance | release運用 | G12 |

Ledgerの`checked`は公式sourceを再確認した日であり、90日を超えた場合はstaleとする。Source ledger meaning reviewではdate-only refreshをgate evidenceにせず、次の意味差分を記録する。

Source ledger 意味レビュー証跡:

- `source_ledger_freshness`: checked 2026-07-03、90日以内。NIST SSDF SP 800-218 / Scrum Guide 2020 / ISTQB Glossary / OWASP LLM06:2025 Excessive Agency / NASA Systems Engineering Handbook Appendix / W3C WCAG 2.2 / Playwright Test / GitHub Environments required reviewers / VS Code Webview Security / Google SRE Release Engineeringを公式URLで再確認。
- `source_status_delta`: 2026-07-03 none。NIST SSDF SP 800-218 / Scrum Guide 2020 / ISTQB Glossary / OWASP LLM06:2025 Excessive Agency / NASA Systems Engineering Handbook Appendix / W3C WCAG 2.2 / Playwright Test / GitHub Environments required reviewers / VS Code Webview Security / Google SRE Release Engineeringのstatus/version/dateに採用判断を変える差分なし。
- `adoption_decision_delta`: 2026-07-03 none。上記10 sourceのadoption decisionに変更なし。
- `workflow_route_impact`: 2026-07-03 none。上記10 sourceの再確認によりG8-G12 / S4 / version-up / action-binding / cutover / completionのroute変更なし。

### 右腕 evidence profile (G8-G12)

| gate | 左腕test basis | 右腕test condition | 必須evidence | gate消費形態 |
|---|---|---|---|---|
| G8 | L5 contract | 境界が結合する | `g8-integration-evidence-v1`、command exit 0 | hard gate |
| G9 | L4 system contract | system behavior成立 | ST-* row、system command evidence | system workflow |
| G10 | L3 FR/AC | 機能・UX・accessibility成立 | screenshot / render smoke / accessibility finding、WCAG 2.2 success-criteria mapping、Playwright trace or report | UX workflow |
| G11 | L2要求 | 人間受入とfeedback disposition | UAT decision record、manual accessibility or inclusive-user review route | 未処理feedbackを拒否 |
| G12 | L1事業要求 | 受入・配布・運用・価値を一体検証 | acceptance command evidence、smoke command evidence、operational metric snapshot、L12→L1/L0 feedback record | release/operation/value closure |

## compatibility evidenceの扱い

旧L8-L14 source ledger・G13/G14 profile・action-binding詳細はhistorical snapshotとして監査履歴からのみ参照する。本process正本にはactionable定義を置かず、旧receiptはG12 evidenceへ投影する。

<!-- Cutover source ledger (checked 2026-07-03) -->
### G12へ投影するcutover source ledger（互換証跡）

この台帳は不可逆cutoverの承認材料を再検証するためのsource evidenceであり、L13/L14またはG13/G14を
現行authorityとして復活させない。判断と実行許可はG12およびaction-binding approval境界で行う。
互換証跡schemaは`cutover_decision_record`を単位とし、`allowed_outcome`、`decision_owner`、
`cutover_snapshot_id`、`trigger_condition`、`blast_radius_baseline`、`dry_run_plan`、`rollback_plan`、
`state_backup_plan`、`execution_window_or_freeze_policy`、`approval_scope`、`audit_record`、
`post_cutover_monitoring`、`legacy_alias_policy`を保持する。これは旧層の再activationではなく、G12が
既存receiptを検証するためのfield vocabularyである。

| source | 公式 URL | 採用 version/date | 最新公式 status | 採用判断 | cutover use | required field impact |
|---|---|---|---|---|---|---|
| NIST SSDF SP 800-218 | <https://csrc.nist.gov/pubs/sp/800/218/final> / <https://csrc.nist.gov/pubs/sp/800/218/r1/ipd> | 最終版1.1（2022-02-04） | Rev. 1初期公開draft v1.2 | 最終版1.1を採用しdraftは追跡のみ | release完全性・archive・保護traceability | `audit_record`, `state_backup_plan`, `blast_radius_baseline` |
| GitHub Environments required reviewers | <https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments> | 現行docs | 現行公式docs | 承認形式の根拠として採用 | action-binding承認pattern | `decision_owner`, `allowed_outcome`, `approval_policy_or_named_approver`, `approval_scope`, `approved_actor`, `approved_tool`, `approved_target`, `approved_params`, `review_approval_evidence`, `expires_at_or_trigger` |
| GitHub Actions concurrency | <https://docs.github.com/actions/writing-workflows/choosing-what-your-workflow-does/control-the-concurrency-of-workflows-and-jobs> | live docs | live official docs | adopt-live-docs-for-single-cutover-window | frozen window外・並行applyの防止 | `execution_window_or_freeze_policy` |
| GitHub repository rename | <https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository> | live docs | live official docs | adopt-live-docs-for-repository-rename-redirect-review | repository/package/docs参照とremote更新の審査 | `blast_radius_baseline`, `rollback_plan`, `post_cutover_monitoring`, `legacy_alias_policy` |
| VS Code Tasks and Workspace Trust automatic task execution | <https://code.visualstudio.com/docs/debugtest/tasks> / <https://code.visualstudio.com/docs/editing/workspaces/workspace-trust> | live docs | live official docs | adopt-live-docs-for-consumer-task-execution-boundary | consumer task自動実行境界の審査 | `blast_radius_baseline`, `approval_scope`, `post_cutover_monitoring`, `legacy_alias_policy` |
| Google SRE Release Engineering | <https://sre.google/sre-book/release-engineering/> | release engineering章 | 現行公式book | 運用指針として採用 | rollback・release process | `dry_run_plan`, `rollback_plan`, `post_cutover_monitoring` |
| Google SRE Canarying Releases | <https://sre.google/workbook/canarying-releases/> | canarying章 | 現行公式workbook | 段階cutoverのrisk低減として採用 | 段階露出・health比較・rollback trigger | `dry_run_plan`, `post_cutover_monitoring`, `rollback_plan` |
| Microsoft Safe Deployment Practices | <https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/safe-deployments> | 現行guidance | 現行公式guidance | safe deploymentのrisk controlとして採用 | 段階露出・health model・blast-radius低減 | `execution_window_or_freeze_policy`, `post_cutover_monitoring`, `rollback_plan` |
| Microsoft Testing Strategy | <https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/testing> | live guidance | live official guidance | adopt-testing-strategy-for-cutover-evidence | state move前のsecurity/regression/load evidence | `dry_run_plan`, `audit_record`, `blast_radius_baseline` |
| OWASP LLM06:2025 Excessive Agency | <https://genai.owasp.org/llmrisk/llm062025-excessive-agency/> | 2025 entry | current 2025 entry | adopt-2025-entry | 不可逆agent actionの権限制約とhuman oversight | `approval_scope`, `legacy_alias_policy`, `audit_record` |
| SLSA Provenance | <https://slsa.dev/spec/v1.2/provenance> | v1.2 | 現行仕様 | cutover artifact provenanceにv1.2を採用 | artifact・command・builder・material provenance | `audit_record`, `blast_radius_baseline`, `state_backup_plan` |

<!-- Cutover source ledger meaning review -->
`source_status_delta`、`adoption_decision_delta`、`workflow_route_impact`を確認し、Date-only refreshは
承認根拠にしない。checked dateが90日を超えた場合はG12 cutover evidenceをstaleとしてfail-closeする。

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

### L10 機能要件・UX受入

| 項目 | 内容 |
|---|---|
| 目的 | L3 FR/ACをsystem behavior、実データ表示、accessibilityを含めて検証する |
| V-pair | **L3↔L10** |
| gate | **G10** |
| 出口 | G10 green → L11 |
| 差し戻し | L3機能要件または対応するL4-L6設計 |

### L11 要求・人間受入

| 項目 | 内容 |
|---|---|
| 目的 | L2要求とprototypeをUAT decision、feedback dispositionへ照合する |
| V-pair | **L2↔L11** |
| gate | **G11** |
| 出口 | UAT decisionとbackprop route確定 → L12 |
| 差し戻し | L2要求、必要ならL3 add-design |

### L12 価値・運用品質

| 項目 | 内容 |
|---|---|
| 目的 | L1事業要求に対しrelease、smoke、monitoring、operational metric、value feedbackを一体検証する |
| V-pair | **L1↔L12** |
| gate | **G12** |
| 必須evidence | acceptance command、release approval、rollback check、smoke、quiet window、operational metric、L1/層外L0へのfeedback |
| 出口 | G12 green。独立G13/G14 passは要求しない |
| 差し戻し | L1事業要求または対応する下位設計 |

本番・外部API・infra・secret・認証/認可・destructive操作はaction-binding approval境界を維持する。

## 右腕差し戻しルール

検証工程で失敗した場合の差し戻し先を明示する (concept v3.1 §3.1.5):

| 失敗工程 | 差し戻し先 |
|---------|-----------|
| L8 結合テスト失敗 | L5 詳細設計 または L7 実装 |
| L9 総合テスト失敗 | L4 基本設計 |
| L10 機能要件・UX受入失敗 | L3要件または対応するL4-L6設計 |
| L11 人間受入フィードバック | L2要求。system behavior変更時はL3 add-design |
| L12 価値・運用品質失敗 | L1事業要求へfeedback。本番回帰はIncident mode、軽微なrelease問題はG12 evidenceを再取得 |

差し戻し記録は PLAN の carry log に残す。右側工程で「ペア未凍結のテスト設計を後付け」することは V-model 違反 (AP-7)。

正本は本書のcanonical L7-L12表とL12 directiveである。旧L13/L14差し戻しはG12 evidence/Incident routeへ統合した。

---

## QA 追加テストの分離原則 (concept v3.1 §3.4)

L8/L9 で発見した品質不足観点は以下の手順で扱う:

1. 既存の ③ テスト設計 (L5/L6 で凍結済み) を **直接書き換えない**
2. 独立した **QA 追加テスト設計 doc** を `docs/test-design/` に正本化する
3. その追加テスト設計 doc に対応する ④ テストコードだけを `tests/` に追加する
4. 追加が大きい場合は `add-design` / `add-impl` (Add-feature mode) として差分 PLAN を起票する
