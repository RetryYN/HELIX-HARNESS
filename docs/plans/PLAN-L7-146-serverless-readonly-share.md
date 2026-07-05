---
plan_id: PLAN-L7-146-serverless-readonly-share
title: "PLAN-L7-146 (impl): 中央UI を無料 serverless(Cloudflare) で read-only 共有 — L2 画面設計から降ろした 15 画面を全 project 横断で多人数閲覧。AI 編集なし・S5=b 維持・$0"
kind: impl
layer: L7
drive: fullstack
status: archived
decision_recorded_at: 2026-07-06
decision_owner: PO (人間)
created: 2026-06-24
updated: 2026-07-06
owner: PM (Opus) / PO (人間) / Codex
parent_design: docs/design/harness/L2-screen/screen-list.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
related_br: docs/design/harness/L1-requirements/business-requirements.md
agent_slots:
  - role: se
    slot_label: "SE — Cloudflare Pages/Workers/D1 free deploy + GitHub webhook projection sync (read-only)"
  - role: tl
    slot_label: "TL — read-only/S5=b 不変・free-tier guardrail・外部infra/auth/secret escalation 境界レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-146-serverless-readonly-share.md
    artifact_type: markdown_doc
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L2-03-ui-element.md
  references:
    - docs/plans/PLAN-L7-141-web-dashboard-component-derived.md
    - docs/adr/ADR-005-distribution-model-and-central-ui.md
---

# PLAN-L7-146 (impl): 中央UI 無料 serverless read-only 共有

## 優先度: version-up parked / future serverless delivery (PO 2026-06-26, Codex 2026-06-30)

PO 決定 (2026-06-26): **中央UI (画面) は後回し**。先に **配布 (clean distribution channel) を別PCで使える状態に
する** ことを優先する (PO「UI は後回しで配布できるようにしたい」「UI は後程でいい」)。

- 本 PLAN は 2026-07-06 PO 指示「completion-decision-packet を 0 件まで潰す」により **archived** とする。serverless 共有配信は現行 HELIX completion scope から除外し、Cloudflare/GitHub/HMAC/access-control activation は実行しない。
- 配布の active track = [[PLAN-L7-157-distribution-clean-pull]] (R2: 中央UI/画面 = L7-141/146 は配布物に
  **同梱しない** = 画面なしで配布。本 deferral と整合)。ただし中央UI 本体の first component-derived slice
  ([[PLAN-L7-141-web-dashboard-component-derived]]) は 2026-06-30 に着地済みであり、本 PLAN の未了範囲は
  serverless 共有配信層だけに限定される。
- 再開条件: 配布チャネルが PO 承認・着地し、外部 Cloudflare 配信 / HMAC secret / webhook / 閲覧アクセス制御へ進む action-binding approval が出た後、本 PLAN を再開する。
- 非終端 parked ではなく closed archive として扱う。将来再開する場合は新規 version-up / add-feature PLAN で再起票し、この archive record を上書きしない。
- `helix route eval --signal version_deferral --format json` は `mode=version-up` を返す。駆動モデル上も、本 PLAN は active L7 frontier ではなく version-up parked として扱う。
- activation 信号（例: `version_deferral Cloudflare HMAC webhook access control external infrastructure activation`）は mode=`version-up` のまま `escalation_boundaries[]` を返し、approval policy/approval が無ければ exit 1 になる。将来版保全と外部配信適用を混同しない。
- `helix version-up activation-packet --plan PLAN-L7-146-serverless-readonly-share --json` は activation / parked review / action-binding approval を
  `version-up-activation-packet.v1` として出すが、`planOnly=true` / `mustNotApply=true` / `applyCommandAvailable=false` /
  `activationAllowed=false` の非破壊 surface であり、Cloudflare/GitHub/HMAC/access-control/secret activation は実行しない。
  2026-07-01 continuation: packet は `externalRehearsalPlan` / `costGuardrails` / `provenanceRequirements` も出し、
  Cloudflare free-tier、GitHub HMAC、Cloudflare Access、secret/PII 非投影、no-prod-write、rollback、approval/audit
  evidence を PO/TL が承認前に審査できるようにする。
  2026-07-03 continuation: `activationVerificationCommandMatrix` の `version-dry-run` は `future` のままでも
  `helix version-up dry-run --current v0.1.0 --target future --json` を出し、`semverChange=invalid` / `ok=false` /
  `blockedReasons` を no-write evidence として残す。activation packet baseline へ差し替えて dry-run surface を省略しない。

activation_decision_record:
- allowed_outcome: `activate_future_version` / `reject_or_archive` / `keep_parked_with_review_date`
- decision_outcome: `reject_or_archive`。現行 completion scope では activate しない。
- target_version_or_release_trigger: 配布チャネル (`PLAN-L7-157`) の release/tag 着地、または PO が serverless read-only share を次版 scope に戻す明示 request。
- activation_snapshot_id: `helix version-up activation-packet --plan PLAN-L7-146-serverless-readonly-share --json` の current `activationSnapshot.snapshotId`。この snapshot が変わった場合、approval evidence は stale とみなす。
- activation_route: `activate_future_version` の場合は add-feature route で具体対象 `PLAN-L7-146-serverless-readonly-share -> L2/L3/L4/L6/L7` に再降下し、Cloudflare/GitHub webhook activation を Forward 実装 PLAN として扱う。外部 activation だけで terminal にしない。
- review_by: PO + TL が配布チャネル着地後に再確認日を設定する。継続 park の場合は次回日付と owner を本文へ追記する。
- approval_scope: Cloudflare Pages/Workers/D1/KV、GitHub webhook HMAC、閲覧 access control、secret 管理、外部 infrastructure activation。
- dry_run_plan: read-only SPA 配信、HMAC 検証、secret/PII 非投影、prod write なし、30 秒 polling/reconcile を staging または dry-run projection で確認する。
- rollback_plan: `version_target: future` を維持し、Cloudflare/webhook/access-control binding を無効化、projection を git/GitHub 正本から再構築可能な状態へ戻す。
- source_ledger_freshness: fresh; Version-up source ledger checked 2026-07-03 in docs/process/modes/version-up.md を activation packet 利用前に確認済み。
- source_status_delta: changed; 2026-07-03 の official-source refresh は GitHub Actions secure-use / pull_request_target / GITHUB_TOKEN guidance を維持し、activation を承認せずに SLSA Provenance v1.2 を activation artifact provenance evidence として追加する。
- adoption_decision_delta: changed; adopt-live-docs-for-activation-workflow-hardening は active のまま、adopt-v1.2-for-activation-artifact-provenance は activation を parked かつ plan-only に保ったまま、activation_provenance_requirements / dry_run_evidence / audit_record に provenance review を追加する。
- workflow_route_impact: parked 中の影響は無し。activation 時は version-up の add-feature 具体対象 `PLAN-L7-146-serverless-readonly-share -> L2/L3/L4/L6/L7` へ接続するか、reject/archive へ進む。
- archive_route: rejected-current-scope。将来再開する場合は新規 add-feature / version-up PLAN として再起票する。

parked_review_record:
- review_owner: PO (人間) + TL。activation 可否は PO、technical readiness は TL が判定する。
- review_trigger: `PLAN-L7-157-distribution-clean-pull` の配布チャネル着地、または PO が serverless read-only 共有を次版候補に戻す request を出した時点。
- review_by_policy: trigger-bound。trigger 発生後、activation branch を切る前に必ず review し、trigger が無い場合も次回 L14 completion audit で stale 判定する。
- stale_action: trigger 後に action-binding approval / dry-run / rollback / access-control 方針が揃わなければ `keep_parked_with_review_date`、不要判断なら `reject_or_archive`。
- activation_dependency: PLAN-L7-141 confirmed read-only UI、PLAN-L7-157 配布チャネル、ADR-005 D2、Cloudflare/GitHub webhook approval scope。
- decision_packet_route: `helix status --json` の `completionDecisionPacket` に version_up_activation として残し、L14 全件達成 claim を block する。

```yaml
action_binding_approval_record:
- allowed_outcome: `approve_action_binding` / `deny_action` / `request_scope_reduction`
- approval_policy_or_named_approver: Cloudflare/GitHub webhook/HMAC/access-control/secret activation の前に PO action-binding approval が必須。現状態は parked であり approved ではない。
- approval_scope: Cloudflare Pages/Workers/D1/KV、GitHub webhook HMAC、read-only share access control、secret binding、external infrastructure activation のみに限定する。
- approved_actor: `version_target: future` の間は actor 未承認。activation 時は PO 承認済みの human operator または CI/deploy identity を明記する。
- approved_tool: parked 中は deploy/config tool 未承認。activation 前に Cloudflare/GitHub CLI、workflow、または action wrapper を明記する。
- approved_target: parked 中は external target 未承認。activation 時に Cloudflare project/resources、GitHub webhook/repo、access-control target、secret binding target を明記する。
- approved_params: parked 中は activation params 未承認。activation 時に review 済み command args / config diff / env binding names / params hash または summary を記録する。
- review_approval_evidence: activation 前に `activation_decision_record`、`parked_review_record`、dry-run result、rollback plan、ADR-005 D2、no-secret/no-prod-write evidence を review する。
- reviewed_snapshot_binding: Activation approval は `helix version-up activation-packet --json` の current `activationSnapshot.snapshotId` を引用する。この snapshot が変わった場合、旧 approval evidence は stale となり、external Cloudflare/GitHub/HMAC/access-control work を activate できない。
- expires_at_or_trigger: Trigger-bound。activation 前に distribution channel scope、access-control design、secret handling、Cloudflare/GitHub target が変わった場合は approval が失効する。
- audit_record: `version_target: future` の間、external activation は not approved / 未承認であり実行もしない。activation 時は approver、action scope、commands、result、incident/backlog/rollback route を記録する。
```

external_rehearsal_plan:
- official_source_basis: before activation に Cloudflare Pages/Workers/D1/KV official limits、Cloudflare Access policies、GitHub webhook HMAC SHA-256 validation docs を refresh する。
- free_tier_budget_check: before activation に SPA artifact size/file count、Workers request budget、D1 storage/query budget、Workers KV storage/read/write budget が $0 constraints に must fit であることを確認する。
- webhook_signature_check: before any production webhook enablement に、dry-run/staging で GitHub webhook delivery が `X-Hub-Signature-256` HMAC を must validate であることを確認する。
- access_control_check: before activation / public sharing に Cloudflare Access または同等の read-only viewer policy で dashboard route を保護する。
- no_secret_pii_check: projection rehearsal で secret/PII/raw transcript が Pages/Workers/D1/KV payloads から除外されることを must prove で確認する。
- no_prod_write_check: rehearsal は staging または non-production projection を使い、before activation に production Cloudflare/GitHub resources を mutate しないことを確認する。
- rollback_rehearsal: before activation に webhook/access bindings を無効化し、data loss なしで git/GitHub source から projection を再構築できることを確認する。

cost_guardrails:
- pages_limit: Cloudflare Pages official limits に static SPA artifact と deploy cadence が must fit であることを確認する。
- workers_limit: Workers Free request budget に想定 viewer と polling load の read API / Pages Functions usage が must fit であることを確認する。
- d1_limit: D1 free storage/query budget に read-only projection と rebuild/reconcile cadence が must fit であることを確認する。
- kv_limit: Workers KV free storage/read/write budget に projection cache と freshness needs が must fit であることを確認する。
- exceed_action: before activation に free-tier または access-control constraint が 1 つでも fail した場合は `keep_parked_with_review_date` または `request_scope_reduction` を選び、paid infrastructure を silent に activate しない。

activation_provenance_requirements:
- source_ledger: before activation review に Version-up source ledger と Cloudflare/GitHub official docs を確認する。
- dry_run_evidence: free-tier budget、webhook HMAC、access-control、no-secret/PII、no-prod-write、rollback rehearsal output are recorded として残す。
- approval_evidence: before activation に `activation_decision_record`、`parked_review_record`、`action_binding_approval_record` をまとめて review する。
- audit_record: approver、actor、tool、target、params hash/summary、command output、result、incident/backlog/rollback route are recorded として残す。

## 0. なぜ (PO 決定 2026-06-24「無料で、AI 編集なしでいけない？」→「OK それでいこう」)

中央UI を **AI 編集なし = read-only の共有ダッシュボードに絞り、Cloudflare 無料枠で $0** 配信する。
これは確定原則 **S5=b**(UI は副作用 API を持たない)/ **S-01**(AI は CLI 経由のみ)/ **CC2**(人間主導)/
**ADR-005 D2**(UI から CLI 直接発動しない)を**一切変えない**。ただし Cloudflare 配信、GitHub webhook HMAC、閲覧 access control、secret は
HNFR-P8 / XR-2 の外部 API・infra / secret / auth 境界であり、実適用には action-binding approval が必要。
PO 元来の狙い「全員で進捗・設計書を共有して見る」(ADR-005 D2 中央・全 project 横断)をフルに満たす。

## 1. L2 起点の descent (PO「L2 からな」、段階順を飛ばさない)

本 PLAN は新規発明でなく、**既に L2 で確定した画面設計を起点に descent** する ([[feedback_central_ui_kouteihyou_mission_not_coverage]])。

- **L2 (起点・G2 freeze 済)**: [screen-list](../design/harness/L2-screen/screen-list.md) 15 画面 / [screen-flow](../design/harness/L2-screen/screen-flow.md) / [ui-element](../design/harness/L2-screen/ui-element.md) §2 部品 / [wireframe](../design/harness/L2-screen/wireframe.md)。read-only + CLI コピーのみ (S5=b)、ID↔URL 1:1、30 秒ポーリング (S2=b)。
- **L4 FE 設計標準 (ui-standard ✓ 2026-06-24、PLAN-L4-14)**: [ui-standard](../design/harness/L4-basic-design/ui-standard.md) + [tokens.yaml](../design/harness/L4-basic-design/tokens.yaml)。component-derived 再利用 FE 設計標準 (部品/色)。`data`=DB 設計標準の FE 対応物 (document-system-map §1b)。
- **src/web 実装**: [PLAN-L7-141](./PLAN-L7-141-web-dashboard-component-derived.md)(component-derived 15 画面、read-only)。本 PLAN の `requires`。
- **L10 UX 磨き (impl 後)**: 実装済 UI を磨き WCAG 検証 (L2 の右腕ペア)。配信・実装の前提ではない。
- **本 PLAN (L7-146)**: その read-only UI を **無料 serverless で配信し全 project 横断・多人数で共有**する delivery 層 (ADR-005 D2 Phase B server sync を無料・read-only に具体化)。

> descent 順 (PLAN-L4-14 §3.3): `L2 画面設計(✓) → L4 FE 設計標準 ui-standard(✓) → L6 機能設計 → read-only src/web 実装(L7-141) → 無料 serverless 配信/共有(本 PLAN) → L10 UX 磨き(impl後)`。
> L2/L4 設計標準を飛ばして配信や実装に着手しない (L7-102 table-dumper 失敗の再発防止)。

## 2. スコープ

### IN (本 PLAN の対象)
- **配信**: Cloudflare **Pages**(静的 SPA、無料無制限) + **Workers Free**(API/read、10 万 req/日) で read-only UI をホスト。
- **projection 同期**: GitHub push → **webhook (HMAC 署名検証)** → Worker → projection を **D1/KV 無料枠**へ書込 (ADR-005 D2 Follow-up: 正本=各 project の git、中央は非正本 projection)。
- **共有/イベント同期**: 全 project 横断で全員が同一 projection を閲覧。鮮度同期は **30 秒ポーリング (S2=b)** + 定期 reconcile (cron full rebuild、取りこぼし安全網、ADR-005 D2 Follow-up)。WebSocket/Durable Objects は使わない(無料維持)。
- **閲覧アクセス制御**: ダッシュボード閲覧の最小認証 (例: Cloudflare Access、ADR-005 D2 Follow-up「ダッシュボード閲覧アクセス制御」)。
- **secret/PII 非投影**: projection に secret/PII/raw transcript を載せない (physical-data 既定を outward-facing で厳守、SECRET_PATTERN fail-close)。

### OUT (本 PLAN では作らない = 別 PLAN・別決定)
- **AI 編集 / フロント送信 / 副作用 API**: read-only を破る (S5=b 反転)。やらない。将来やるなら要件改定 + 承認ゲート + escalation の別 PLAN。
- **編集ジョブ用 serverless コンテナ (Containers/Sandbox)** と provider API 課金: AI 編集が無いので不要。
- **リアルタイム push (WebSocket/DO)**: 無料維持のため不採用 (必要時は $5 Paid の別 PLAN)。
- **src/web の 15 画面実装そのもの**: L7-141 の所掌 (本 PLAN は配信層)。

## 3. 受入条件

- 全 project 横断の **read-only ダッシュボードが多人数で共有**でき、各人が同一 projection を見る (ADR-005 D2)。
- **GitHub push → webhook(HMAC 検証) → projection 更新 → ≤ 30 秒ポーリング + 定期 reconcile** で鮮度が保たれる (S2=b / ADR-005 D2 Follow-up)。
- **read-only 不変**: UI に副作用 API・編集・CLI 直接実行が無い (S5=b / S-01 / CC2 / ADR-005 D2)。CLI 文字列コピーのみ。
- **コスト $0**: Cloudflare 無料枠 (Pages 無料 / Workers Free 10 万 req/日 / D1・KV 無料枠) 内で稼働。Paid($5)・provider API 課金を要しない。超過閾値を doc 化。
- secret/PII/raw transcript が projection に載らない (fail-close)。
- doctor / lint / vitest / plan lint green。review evidence を confirmed 前に記録。

## 4. スケジュール

- mode: serial。
- Step 0 ✓: L2 画面設計 (G2 freeze) + L4 FE 設計標準 ui-standard (2026-06-24、PLAN-L4-14) の descent 確認 = 起点 (本 PLAN の前提、再設計しない)。
- Step 1 ✓: read-only src/web の component-derived 実装到達確認 ([PLAN-L7-141](./PLAN-L7-141-web-dashboard-component-derived.md))。2026-06-30 に first slice 着地済み。
- Step 2: Cloudflare Pages(静的 SPA) + Workers Free(read API) の最小配信骨格。`workers.dev` で公開、独自ドメインは任意。
- Step 3: GitHub webhook(HMAC) → Worker → D1/KV projection 同期 + 定期 reconcile cron。secret 非投影を fail-close で配線。
- Step 4: 閲覧アクセス制御 (Cloudflare Access 等) + 30 秒ポーリングの多人数共有導通。
- Step 5: 検証 (multi-user read-only / 鮮度 ≤30s / free-tier 内 / S5=b 不変) → review → confirmed。

## 5. 壊さない / 再発させない

- **read-only 不変条件を保持**: S5=b / S-01 / CC2 / ADR-005 D2 を変えない。本 PLAN は配信層のみで、UI に書込/実行 API を一切足さない。足すなら別 PLAN + 要件改定 + escalation。
- **L2/L4 設計標準を飛ばさない**: 配信は `L2→L4 ui-standard→L6→実装 (L7-141)` の descent の下流。段階順違反 (L7-102) を再発させない。L10 (UX 磨き) は impl 後。
- **正本は git/GitHub**: 中央の D1/KV projection は非正本 (再構築可能)。生成物を正本化しない。
- **無料枠を超えたら明示**: 超過時 (req/日・DO/WebSocket・編集ジョブ追加) は $5 Paid または別 PLAN へ昇格を doc 化。silent に課金面へ踏み込まない。

## 6. レビュー / 次工程

- review evidence (cross_agent / intra_runtime_subagent) を confirmed 前に記録 (PLAN claim 規律: $0・read-only 不変は free-tier 単価と S5=b 引用で substantiate)。
- 次: 人間承認後、本 PLAN で serverless 共有配信を activation する。AI 編集/フロント送信が要件化されたら、本 read-only 共有を土台に承認ゲート付きの別 PLAN へ ([[project_central_ui_editable_front_direction]])。
