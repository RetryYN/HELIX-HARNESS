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
- 外部基準の参照元: NIST SSDF SP 800-218 (<https://csrc.nist.gov/pubs/sp/800/218/final>、Rev. 1 IPD は <https://csrc.nist.gov/pubs/sp/800/218/r1/ipd> で追跡) / Scrum Guide 2020 (<https://scrumguides.org/scrum-guide.html>) / ISTQB Glossary (<https://glossary.istqb.org/>) / OWASP LLM06:2025 Excessive Agency (<https://genai.owasp.org/llmrisk/llm062025-excessive-agency/>) / NASA Systems Engineering Handbook Appendix (<https://www.nasa.gov/reference/system-engineering-handbook-appendix/>) / W3C WCAG 2.2 (<https://www.w3.org/TR/WCAG22/>) / Playwright Test (<https://playwright.dev/docs/intro>、visual comparisons は <https://playwright.dev/docs/test-snapshots>、accessibility testing は <https://playwright.dev/docs/accessibility-testing>) / GitHub Environments required reviewers (<https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments>) / VS Code Webview Security (<https://code.visualstudio.com/api/extension-guides/webview#security>) / Google SRE Release Engineering (<https://sre.google/sre-book/release-engineering/>)

### Verification source ledger (checked 2026-07-02)

| source | official URL | adopted version/date | latest official status | adoption decision | verification use | gate impact |
|--------|--------------|----------------------|------------------------|-------------------|------------------|-------------|
| NIST SSDF SP 800-218 | <https://csrc.nist.gov/pubs/sp/800/218/final> / <https://csrc.nist.gov/pubs/sp/800/218/r1/ipd> | final publication 1.1 (2022-02-04) | Rev. 1 initial public draft v1.2 (2025-12-17) | adopt-final-1.1; track-draft-do-not-adopt-until-final | 実行コード・環境・結果・欠陥 routing が追跡できる security/release evidence を要求する | G8 / G9 / G12 / G13 / G14 |
| Scrum Guide 2020 | <https://scrumguides.org/scrum-guide.html> | November 2020 guide | current official Scrum Guide page | adopt-current-guide | Sprint Review / inspect-adapt は完了宣言ではなく、PO/S4/Forward gate 判定への入力として扱う | S3 / S4 / G11 / G12 |
| ISTQB Glossary | <https://glossary.istqb.org/> | live official glossary | live official glossary | adopt-live-terms-with-ledger-date | test basis / test condition / execution evidence / defect routing の用語を右腕 gate vocabulary に固定する | G8-G14 |
| OWASP LLM06:2025 Excessive Agency | <https://genai.owasp.org/llmrisk/llm062025-excessive-agency/> | 2025 LLM risk entry | 2025 official LLM risk entry | adopt-2025-entry | agentic workflow の過剰自律を防ぎ、人間承認・権限境界・不可逆操作を completion blocker として扱う | G11 / G12 / G13 / G14 |
| NASA Systems Engineering Handbook Appendix | <https://www.nasa.gov/reference/system-engineering-handbook-appendix/> | appendix updated 2019-05-08 | live NASA handbook appendix | adopt-vv-matrix-structure | V&V plan、requirements verification matrix、validation requirements matrix を L8-L14 evidence profile と L14→L0 feedback record の構造根拠にする | G8-G14 |
| W3C WCAG 2.2 | <https://www.w3.org/TR/WCAG22/> | W3C Recommendation 2024-12-12 | latest published WCAG 2.2 Recommendation | adopt-current-recommendation-for-accessibility-evidence | G10/G11 の accessibility finding は WCAG 2.2 success criteria / conformance basis に紐づけ、スクリーンショットだけの UX pass を拒否する | G10 / G11 |
| Playwright Test | <https://playwright.dev/docs/intro> / <https://playwright.dev/docs/test-snapshots> / <https://playwright.dev/docs/accessibility-testing> | live Playwright docs | live official Playwright docs | adopt-live-docs-for-browser-evidence-shape | render smoke、visual comparison、accessibility scan attachment を browser evidence として扱う。ただし automated a11y だけでは G10/G11 pass にせず manual/inclusive review route を残す | G10 / G11 |
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

Source ledger 意味レビュー証跡:

- `source_ledger_freshness`: checked 2026-07-02、90 日鮮度 window 内。NIST SSDF SP 800-218 / Scrum Guide 2020 / ISTQB Glossary / OWASP LLM06:2025 Excessive Agency / NASA Systems Engineering Handbook Appendix / W3C WCAG 2.2 / Playwright Test / GitHub Environments required reviewers / VS Code Webview Security / Google SRE Release Engineering を公式 URL で再確認。
- `source_status_delta`: 2026-07-02 none。NIST SSDF SP 800-218 final 1.1 と Rev. 1 IPD v1.2、Scrum Guide 2020、ISTQB Glossary、OWASP LLM06:2025 Excessive Agency、NASA Systems Engineering Handbook Appendix、W3C WCAG 2.2、Playwright Test、GitHub Environments required reviewers、VS Code Webview Security、Google SRE Release Engineering の status/version/date は表の採用・追跡判断どおり。
- `adoption_decision_delta`: 2026-07-02 none。NIST SSDF SP 800-218 / Scrum Guide 2020 / ISTQB Glossary / OWASP LLM06:2025 Excessive Agency / NASA Systems Engineering Handbook Appendix / W3C WCAG 2.2 / Playwright Test / GitHub Environments required reviewers / VS Code Webview Security / Google SRE Release Engineering の右腕 evidence 用 adoption decision に変更なし。
- `workflow_route_impact`: 2026-07-02 none。NIST SSDF SP 800-218 / Scrum Guide 2020 / ISTQB Glossary / OWASP LLM06:2025 Excessive Agency / NASA Systems Engineering Handbook Appendix / W3C WCAG 2.2 / Playwright Test / GitHub Environments required reviewers / VS Code Webview Security / Google SRE Release Engineering の再確認により G8-G14 / S4 / action-binding / cutover / completion の route 変更なし。

> **正規式モデル: 右腕 = データ実在性エスカレーション (PLAN-RECOVERY-02、2026-06-04 PO 確定、非破壊)**: 右腕は使うデータ・環境の実在性が段階的に上がる検証の上昇。**合成/テストデータ (L8 結合 ⇔ L5 / L9 総合 ⇔ L4)** → **本番実データ (L10 実データ検証 ⇔ L2 画面 / L12 本番受入 ⇔ L3 要件)** → **L14 運用 (実データ×時間 ⇔ L1 要求)** → **L0 価値検証 (実成果)**。各層の検証本質 = L8 結合 / L9 総合 / L10 実データ検証 (画面を本番実データで) / L12 本番受入 (要件を本番で満たすか) / L14 運用。**L14 の「次サイクル L0 企画へ feedback」が L0 企画の価値検証ペア**を成し V の頂点を閉じる (従来 L0 はペア無しだった穴埋め)。番号・既存ペアは据え置き (overview §4 / concept §2.3 正規式表)。

### 右腕 evidence profile (G8-G14)

| gate | 左腕 test basis | 右腕 test condition | 必須 evidence | gate 消費形態 |
|------|----------------|---------------------|---------------|---------------|
| G8 | L5 D-API / D-DB / D-CONTRACT | module / state / adapter / asset / DB 境界が結合して動く | `g8-integration-evidence-v1` manifest、selected IT IDs、command exit 0、coverage row、stale defer 0 | `g8-integration-workflow` hard gate |
| G9 | L4 architecture / ADR / system contract | system behavior が feature pack / roadmap span 単位で成立する | ST-* row、system command evidence、roadmap span coverage、regression finding routing | G9 child PLAN で manifest 化するまで `right-arm-gate-planning` が route を保持 |
| G10 | L2 screen / mock / UX requirement | 本番相当データで画面・会話 UI が成立する | screenshot / render smoke / accessibility finding / WCAG 2.2 success-criteria mapping / Playwright trace or report / real-data fixture provenance | G10 child PLAN で profile 化。現時点は `screen-impl-pair-freeze` と frontend coverage が前段証跡 |
| G11 | L1 business requirement + L3 FR/AC | UAT feedback が要求・要件に照合済み | UAT decision record、accepted/rejected feedback、manual accessibility or inclusive-user review route、add-design/backprop route | human/PO evidence 必須。未処理 feedback は Forward 完了不可 |
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
さらに `approvalVerificationCommandMatrix[]` を持ち、approval packet baseline、sibling decision packet、
least-privilege binding、snapshot binding、security boundary、targeted regression、static gates を検証し、
full regression、completion frontier を承認前の検証 phase として列挙する。各 row は command / expected /
evidence / source / sourceUrl / sourceCheckedAt / latestOfficialStatus / sourceStatusDelta /
adoptionDecision / adoptionDecisionDelta / workflowRouteImpact を持つ。これは GitHub Environments
required reviewers / prevent self-review、NIST least privilege、VS Code Workspace Trust、OWASP WSTG、
OWASP LLM06:2025 Excessive Agency の過剰自律防止を HELIX の実行許可境界へ写像するための
plan-only evidence であり、承認・apply surface ではない。
`approvalVerificationCommandMatrix[]` の command は実行可能な承認済み CLI/test surface に限定する。
`review ...` / `verify ...` の自然文手順、未実装 command、placeholder は承認前 evidence として扱わず
fail-close する。S4 / version-up sibling packet は `--plan <PLAN_ID>` 付き command、rename は singleton
`rename plan` として出し、複数 pending PLAN の対象を PO が推測する状態に戻さない。
`approve_action_binding` に進む場合でも、PLAN 本文へ named approver、approved_actor、
approved_tool、approved_target、approved_params、reviewed snapshot binding、expiry/trigger、audit evidence を concrete に記録するまで、
高影響 action を実行してはならない。

Packet generation and record validation are separate. A `confirmed` /
`completed` / historical `accepted` PLAN does not need a new pending approval
packet, but if the PLAN text carries a high-impact action-binding boundary then
`action_binding_approval_record` is still validated. Moving a PLAN to terminal
status must not hide a missing approval record. `archived` closes rejected or
historical work; schema-invalid words such as `merged`, `rejected`, or
`superseded` are not PLAN `status` values and must not be treated as terminal.

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
| `reviewed_snapshot_binding` | 常時必須 | version-up では current `ut-tdd version-up activation-packet --json` の `activationSnapshot.snapshotId`、rename/cutover では `cutoverSnapshot.snapshotId`、それ以外では snapshot 対象外の根拠。field 名だけ、または現在 packet と一致しない sha256 は承認根拠にしない。関連 packet の snapshotId が変わった場合は旧承認 evidence を流用しない |
| `expires_at_or_trigger` | 常時必須 | 承認が失効する日時、または trigger-bound な再承認条件 |
| `audit_record` | action 実行前後で必須 | 実施時刻、command/action、approver、result、incident/backlog route |

### L14 irreversible cutover decision record

L14 で state dir 移行、CLI/marker 改名、本番/配布 surface 変更などの不可逆 cutover を扱う PLAN は、
単なる「PO signoff」ではなく `cutover_decision_record` を持つ。これは L14 実行許可ではなく、
許可・延期・runbook 修正要求を判断するための evidence schema である。

Cutover packet generation may omit already terminal PLANs, but cutover record
validation still applies to terminal L14 cutover PLANs. A `confirmed` /
`completed` / historical `accepted` status without `cutover_decision_record`
remains a workflow violation; only `archived` closes rejected/historical cutover
work without keeping it in the active readiness queue.

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

Cutover source ledger (checked 2026-07-02):

| source | official URL | adopted version/date | latest official status | adoption decision | cutover use | required field impact |
|---|---|---|---|---|---|---|
| NIST SSDF SP 800-218 | <https://csrc.nist.gov/pubs/sp/800/218/final> / <https://csrc.nist.gov/pubs/sp/800/218/r1/ipd> | final publication 1.1 (2022-02-04) | Rev. 1 initial public draft v1.2 (2025-12-17) | adopt-final-1.1; track-draft-do-not-adopt-until-final | release integrity / archive / protection traceability | `audit_record`, `state_backup_plan`, `blast_radius_baseline` |
| GitHub Environments required reviewers | <https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments> | live GitHub Actions environments docs | live official GitHub docs; required reviewers and prevent self-review remain available protection rules | adopt-live-docs-for-approval-shape | action-binding deployment approval pattern | `decision_owner`, `allowed_outcome`, `approval_policy_or_named_approver`, `approval_scope`, `approved_actor`, `approved_tool`, `approved_target`, `approved_params`, `review_approval_evidence`, `expires_at_or_trigger` |
| GitHub Actions concurrency | <https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency> | live GitHub Actions concurrency docs | live official GitHub docs; workflow/job `concurrency` remains the single-run control surface | adopt-live-docs-for-single-cutover-window | cutover apply must not run concurrently or outside the approved frozen window | `execution_window_or_freeze_policy` |
| Google SRE Release Engineering | <https://sre.google/sre-book/release-engineering/> | SRE book release engineering chapter | live official Google SRE book | adopt-operational-guidance | rollback and release process as operational controls | `dry_run_plan`, `rollback_plan`, `post_cutover_monitoring` |
| OWASP LLM06:2025 Excessive Agency | <https://genai.owasp.org/llmrisk/llm062025-excessive-agency/> | 2025 LLM risk entry | 2025 official LLM risk entry | adopt-2025-entry | irreversible agentic actions require constrained authority and human oversight | `approval_scope`, `legacy_alias_policy`, `audit_record` |
| SLSA Provenance | <https://slsa.dev/spec/v1.2/provenance> | SLSA Provenance v1.2 | current SLSA provenance specification | adopt-v1.2-for-cutover-artifact-provenance | cutover artifact, command, builder, and material provenance must be reproducible from audit evidence | `audit_record`, `blast_radius_baseline`, `state_backup_plan` |

Cutover ledger freshness follows the same 90-day policy as the verification source ledger. Stale official-source decisions cannot authorize irreversible L14 cutover or action-binding approval records.
Cutover source ledger meaning review uses the same `source_status_delta` / `adoption_decision_delta` /
`workflow_route_impact` evidence. Date-only refresh cannot approve an irreversible rename, state move, alias policy,
or action-binding approval; any source change that affects approval scope, concurrency, rollback, provenance, backup,
or monitoring routes the cutover PLAN back to `request_runbook_changes` before apply.

`ut-tdd rename plan --json` must also emit `sourceLedgerFreshness`, `cutoverRunbook[]`, `stateBackupManifest[]`,
`verificationCommandMatrix[]`, and `cutoverSnapshot`. `sourceLedgerFreshness` exposes the Cutover source ledger checked
date, 90-day freshness result, row count, and required source omissions; stale or incomplete official-source basis routes
the cutover back to `request_runbook_changes`. `cutoverRunbook[]` is an approval-review runbook with phase,
command, `writePolicy`, evidence path, pass criteria, rollback check, and source citation. No-write rows must not hide
local artifact writes or state rebuilds; DB rebuild and compiled binary rehearsal requirements must be explicit state/artifact
or packet-only rows. `stateBackupManifest[]` must include backup
target pattern, checksum requirement, restore drill requirement, and restore evidence path for harness.db, memory, state,
logs, handover, provider handover pointer, approval policy, and repo-local hook configs.

`verificationCommandMatrix[]` は、現行 `ut-tdd` dist smoke、改名後 `helix` dist smoke、legacy alias smoke を
1 つの compiled smoke row に隠さず分離する。各 row は command / expected / evidence / source /
sourceUrl / sourceCheckedAt / latestOfficialStatus / sourceStatusDelta / adoptionDecision / adoptionDecisionDelta /
workflowRouteImpact を持ち、L14 review が source 名や URL だけの evidence に退行しないようにする。
GitHub Actions concurrency、Google SRE release engineering、SLSA provenance、OWASP LLM06 の公式 source は、
この matrix metadata 用に 2026-07-02 に再確認済みであり、ledger heading は source-ledger freshness の
anchor として残す。`cutoverSnapshot.snapshotId` は current blast-radius digest、approval scope digest、
source-ledger/runbook/backup/provenance/monitoring evidence digest、freeze-policy reapproval trigger を束ねる。
この snapshot は apply を許可しない。PO/TL が approval evidence と current rename packet を比較し、HEAD、
hit set、source ledger、scope、dry-run、backup、rollback、provenance、monitoring、dist smoke、quiet-window
evidence が変わった stale approval を拒否するための binding である。

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

**verification profile 接続ルール**:

G10 はスクリーンショットや手作業メモだけで pass しない。`verification-profile` catalog は
`recommendedGates` / `recommendedDrives` を持ち、`fe` / `fullstack` / `agent` では G10 対応 browser profile
(`vitest-browser-playwright` / `playwright-mcp`) が存在することを doctor hard gate で検査する。非 browser
profile が G10 を名乗っても、drive 別 L10 browser evidence の充足根拠にはしない。`be` / `db` は
UI を持つ場合のみ L10 が必要だが、UI ありと判定された slice では同じ G10 browser profile に接続する。G8/G9 は
Testcontainers / MSW / MCP Inspector 等の結合・システム profile、G12-G14 は doctor / GitHub read-only
context 等の受入・release・post-deploy profile に接続する。

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
