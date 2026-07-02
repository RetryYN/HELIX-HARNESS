> **正本化** (PLAN-DISCOVERY-09 S4 ADOPT、2026-06-26)。docs/process は forward/modes/gates の運用正本。規範変更は concept/requirements (上位正本) 先行 → 本 dir へ反映する。

# version-up 駆動モデル

出典: concept v3.1 §2.5 (9-mode 後の追加 mode) / requirements v1.2 §6.8.8.1 (forward-convergence) / §7.8.1 (`version_deferral` signal) / PLAN-DISCOVERY-09

---

## 1. 概要

version-up は、確立済/計画済の capability を **将来の製品バージョンへ保全 (preserve)** する mode。**いまは Forward freeze / 配布スコープに入れない**が、**archived (破棄) ではなく将来版で Forward へ入れる**ことを **明示・機械追跡**する。

「deferred-but-committed-future」= **archived (破棄) でも plain draft (WIP) でも Add-feature (今追加) でも Retrofit (依存 upgrade) でもない第 4 の状態**。第一ケースは中央UI 系 (PLAN-L7-141 / PLAN-L7-146) を「画面なし配布 (PLAN-L7-157 R2)」の下で将来版へ保全することだった。

現在状態 (2026-07-01): PLAN-L7-141 は component-derived read-only UI slice として activation 済みのため `version_target` を外して `status=confirmed`。PLAN-L7-146 は外部 serverless 配信・HMAC secret・閲覧アクセス制御を含むため、引き続き `version_target: future` の version-up parked として保全する。

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
- parked PLAN は `activation_decision_record` を持つ。record は `allowed_outcome`、`target_version_or_release_trigger`、`activation_snapshot_id`、`activation_route`、`review_by`、`approval_scope`、`dry_run_plan`、`rollback_plan` を明示し、活性化・却下・継続 park のいずれでも根拠を残す。
- parked PLAN は `parked_review_record` も持つ。これは「将来版へ保全」を無期限 draft にしないための定期/trigger review 契約であり、activation 許可とは別物である。

### 4.1 activation decision record

version-up parked PLAN は、将来版へ保全している間も「次に何を決めれば進めてよいか」を失わないため、
以下の decision record を本文に持つ。

| field | 必須条件 | 意味 |
|---|---|---|
| `activation_decision_record` | 常時必須 | 将来版 activation の判断単位。これが無い parked PLAN は plain draft と区別できない |
| `allowed_outcome` | 常時必須 | parked / packet template の段階では `activate_future_version` / `reject_or_archive` / `keep_parked_with_review_date` の候補集合を列挙する。`activation_snapshot_id` が concrete `sha256:` になった承認材料では、候補集合ではなく選択済みの単一 outcome にする |
| `target_version_or_release_trigger` | 常時必須 | どの version / release / tag / trigger で再開するか。`future` のまま曖昧にしない |
| `activation_snapshot_id` | 常時必須 | `ut-tdd version-up activation-packet --json` の current `activationSnapshot.snapshotId`。snapshot が変わったら旧 approval evidence を流用しない |
| `activation_route` | `activate_future_version` 候補がある場合必須 | activation 後に add-feature / Forward のどの route へ入るか。外部 activation だけで完了扱いしない |
| `review_by` | `keep_parked_with_review_date` 選択時必須 | 継続 park を放置にしないための再確認日と owner |
| `approval_scope` | 外部 API・infra・secret・認証/認可を含む activation で必須 | 承認対象の範囲。Cloudflare / HMAC / webhook / access control 等を明示する |
| `dry_run_plan` | 外部 boundary を含む activation で必須 | 実適用前に read-only / no-secret / no-prod-write を検証する手順 |
| `rollback_plan` | 外部 boundary を含む activation で必須 | activation 失敗時に parked 状態へ戻す手順 |

`activation_decision_record` が `activate_future_version` へ進む場合、当該 PLAN は add-feature route に接続し、
activation 後に `version_target` を外す。`reject_or_archive` の場合は破棄理由を記録して archived 化する。
`keep_parked_with_review_date` の場合は `review_by` を更新し、completion readiness は引き続き blocked とする。

### 4.1.1 activation packet surface

`ut-tdd version-up activation-packet --json` は、parked PLAN の `activation_decision_record` /
`parked_review_record` / `action_binding_approval_record` を読み、将来版 activation の判断材料を
`version-up-activation-packet.v1` として出力する。

この surface は **plan-only** である。`planOnly=true`、`mustNotApply=true`、`applyCommandAvailable=false`、
`activationAllowed=false` を固定し、Cloudflare / HMAC / webhook / access control / secret / external などの
外部境界が残る限り blocked reason として表示する。packet は PO/TL の判断材料であり、activation 実行・外部 infra
変更・secret 設定・`version_target` 解除を行わない。
packet 自体は `generatedAt`、`sourceCommand=ut-tdd version-up activation-packet --json`、
`freshness` (`decision-packet-freshness.v1`) を持つ。これは下記の `sourceLedgerFreshness` とは別であり、
古い packet の転記や stale な判断材料を activation 判断に流用しないための生成物メタデータである。

外部 activation 候補では、packet は `external_rehearsal_plan` / `cost_guardrails` /
`activation_provenance_requirements` / `sourceLedgerFreshness` も出力する。これは Cloudflare Pages/Workers/D1/KV
の free-tier budget、GitHub webhook `X-Hub-Signature-256` HMAC 検証、Cloudflare Access policy、
secret/PII 非投影、no-prod-write、rollback rehearsal、source ledger freshness / approval / audit evidence を
承認前に審査するための設計材料であり、apply 権限ではない。source ledger が stale または必須 source 欠落の
場合、packet は blocked reason として返し、PO/TL が古い外部前提で activation 判断を進めないようにする。
GitHub Actions を activation/dry-run 経路に使う場合は、`GITHUB_TOKEN` 権限、workflow の least privilege、
`pull_request_target` の未信頼コード実行リスク、自動 PR 承認リスクを `external_rehearsal_plan` /
`dry_run_plan` / `activation_provenance_requirements` / `audit_record` に接続し、CI があるだけで安全と読み替えない。
セキュリティ検証は OWASP Web Security Testing Guide を source ledger に持ち、access-control、webhook
signature、secret/PII exclusion、read-only projection の rehearsal を `external_rehearsal_plan` /
`dry_run_plan` / `activation_provenance_requirements` へ接続する。
加えて packet は `activationReadinessChecks[]` を出す。外部 activation で `official_source_basis` /
`free_tier_budget_check` / `webhook_signature_check` / `access_control_check` / `no_secret_pii_check` /
`no_prod_write_check` / `rollback_rehearsal` / `source_ledger` / `dry_run_evidence` / `approval_evidence` /
`audit_record` が空、placeholder、または「before activation」型の未実証要求文だけの場合は
`pending_evidence` とし、`blockedReasons[]` に `activation rehearsal evidence pending: <check>` を追加する。
packet はさらに `activationReadinessSummary` を持ち、`presentChecks` / `pendingChecks` /
`pendingCheckNames` / `sourceLedgerFresh` を集計する。summary が `ready_for_activation_review` でも
`activationAllowed=false` は固定であり、明示の human/action-binding decision route なしに activation してはならない。
証跡 path、audit id、digest、実行ログ、result/exit code、report artifact などの concrete locator を伴わない
手順文・予定文・「recorded」宣言文は、実証済み evidence ではなく `pending_evidence` として扱う。
これは Google Cloud Deploy の deployment verification
(<https://cloud.google.com/deploy/docs/deployment-verification>)、canary
(<https://cloud.google.com/deploy/docs/deployment-strategies/canary>)、rollback-to-earlier-release
(<https://cloud.google.com/deploy/docs/rollbacks>) の公式運用と同じく、実適用前に
「検証済み・戻せる・段階適用できる」証拠を要求するための HELIX 版の gate である。

packet はさらに `reapprovalTriggers[]` を出す。activation packet、dry-run、approval evidence は snapshot ではなく
承認時点の HEAD / release trigger / scope / source ledger / rehearsal evidence に結びつくため、HEAD/scope/source/evidence drift
が起きた場合は承認済みとして流用しない。`head_sha_or_release_trigger_drift`、`approval_scope_or_params_drift`、
`source_ledger_or_external_limit_drift`、`rehearsal_or_rollback_evidence_drift` のいずれかに該当した場合は、
`ut-tdd version-up dry-run`、activation packet、DB rebuild、doctor、action-binding approval packet を再実行し、
必要なら `keep_parked_with_review_date` または `request_scope_reduction` へ戻す。
これは GitHub Actions concurrency、Google SRE release engineering、SLSA provenance の考え方に合わせ、
同時実行・古い根拠・再現不能な provenance で future activation を進めないための再承認 gate である。

packet は `activationSnapshot` も出す。`activationSnapshot.snapshotId` は plan id、HEAD SHA、version target、plan status、
release trigger、source ledger checked date、approval scope digest、rehearsal/provenance evidence digest、
および `reapprovalTriggers[]` を束ねた非 secret digest である。これは承認を代行しないが、PO/TL が後で
action-binding approval を記録する際に「どの release trigger / scope / evidence に対する判断だったか」を固定する
binding ID になる。snapshotId が変わった場合は、旧 approval evidence を activation に流用せず、
`ut-tdd version-up dry-run`、activation packet、doctor、action-binding approval packet を再実行する。

packet は `activationVerificationCommandMatrix[]` も出す。これは `activation-packet-baseline`、
`version-dry-run`、`external-rehearsal`、`security-testing`、`state-and-doctor` を検証 phase として持つ。
さらに `targeted-regression`、`static-gates`、`full-regression`、`approval-packet` の各 phase に対して
command / writePolicy / expected / evidence / source / sourceUrl / sourceCheckedAt / latestOfficialStatus / sourceStatusDelta /
adoptionDecision / adoptionDecisionDelta / workflowRouteImpact を持つ。公式 source row は 2026-07-02 に GitHub Actions secure use / GITHUB_TOKEN permissions /
pull_request_target guidance、GitHub Environments required reviewers とその public/private repo・plan availability、
OWASP WSTG stable/latest を確認し、
Google Cloud Deploy verification / canary / rollback は段階適用・検証・rollback の運用比較根拠として確認済みとする。
採用判断と route impact を packet に残すことで、activation readiness の判断材料を「あとで検証する」という自由文に戻さず、
どの command・runbook・report・audit record を承認前 evidence とするかを packet から追えるようにする。
matrix は apply 権限ではなく、`activationSnapshot.evidenceDigest` に含める承認前 review material である。
`writePolicy` は `no-write` / `state-write` / `local-artifact-write` を明示し、`state-and-doctor` の
`db rebuild` は `state-write` として扱う。`no-write` row に DB rebuild、build、file output などの
local state/artifact write が混入した場合は fail-close する。
`external-rehearsal` と `security-testing` は自然文 command ではなく、
`ut-tdd version-up rehearsal --plan <PLAN> --no-write --json` と
`ut-tdd version-up security-checklist --plan <PLAN> --no-write --json` の packet-only surface を指す。
両 command は `planOnly=true` / `mustNotApply=true` / `writePolicy=no-write` を返し、
Cloudflare / GitHub / HMAC / access-control / secret / external activation を実行しない。
doctor の `version-up-readiness` は matrix command と `writePolicy` が allowlist に一致しない場合 fail-close するため、
承認前 evidence が未実装 command、placeholder、または prose-only 手順へ戻らない。
`approval-packet` phase は `ut-tdd action-binding approval-packet --plan <PLAN> --json` を指し、
version-up activation の承認材料を別 PLAN の action-binding packet と取り違えない。`--plan` が欠落した
approval packet command は activation verification matrix の承認済み surface として扱わない。

### 4.1.2 version upgrade dry-run surface

`ut-tdd version-up dry-run --current <semver-or-tag> --target <semver-or-tag> --json` は、
tag bump / release pin 更新を実適用する前の plan-only surface である。`version-up-dry-run-plan.v1` は
`currentVersion` / `targetVersion`、`normalizedCurrent` / `normalizedTarget`、SemVer 差分
(`major` / `minor` / `patch` / `prerelease` / `same` / `downgrade` / `invalid`)、`releaseTrigger`、
`releaseTagRef`、`releaseTagExists`、`releaseTriggerResolved`、`migrationPlan`、`rollbackPlan`、
`idempotencyChecks`、`releaseGateChecks`、`sourceBasis` を返す。

この surface も **apply 権限を持たない**。`planOnly=true`、`mustNotApply=true`、
`applyCommandAvailable=false` を固定し、target が current 以下、current/target が SemVer として
解釈できない、または target release tag が解決できない場合は `ok=false` と `blockedReasons` を返す。
`releaseGateChecks.release_tag_exists` は `git rev-parse --verify refs/tags/v<target>` 相当の確認を示し、
tag 未解決の dry-run を release readiness と誤認させない。migration は `ut-tdd setup project --dry-run`
と activation packet / doctor を経由し、rollback は旧 tag/branch と `.ut-tdd` state backup / projection rebuild
を要求する。同じ dry-run を再実行しても file/state/remote side effect が無いことを idempotency evidence とする。
SemVer 判定は Semantic Versioning 2.0.0 に合わせ、空 prerelease identifier や numeric prerelease identifier の
leading zero (`1.0.1-01` 等) は invalid として `ok=false` にする。dry-run は release readiness ではなく
current/target compatibility と承認前証跡の plan-only packet であり、invalid target や未解決 release tag を
activation readiness と誤認させない。

### 4.2 parked review record

version-up parked PLAN は、activation 判断の前に `parked_review_record` を持つ。これは「いつ、誰が、何を見て、
park 継続・活性化・破棄を判断するか」を固定する review 契約である。

| field | 必須条件 | 意味 |
|---|---|---|
| `parked_review_record` | version-up parked PLAN で常時必須 | 保全中の再確認単位。無い場合は completion blocker |
| `review_owner` | 常時必須 | PO / TL / 代理 owner。曖昧な「後で見る」を禁止 |
| `review_trigger` | 常時必須 | release/tag、配布チャネル着地、PO request、期限到来など、review を発火する条件 |
| `review_by_policy` | 常時必須 | 絶対日付または trigger-bound policy。trigger-bound の場合は次回 L14 audit で stale 判定する |
| `stale_action` | 常時必須 | trigger 後に判断されない場合の扱い。keep parked / reject-or-archive / escalate のいずれか |
| `activation_dependency` | 常時必須 | activation 前に満たす PLAN / release / environment / approval の依存 |
| `decision_packet_route` | 常時必須 | `ut-tdd status --json` / completion decision packet で残 blocker として表示されること |

Version-up source ledger (checked 2026-07-02):

| source | official URL | adopted version/date | latest official status | adoption decision | version-up use | required field impact |
|---|---|---|---|---|---|---|
| Semantic Versioning 2.0.0 | <https://semver.org/> | 2.0.0 | current official specification page | adopt-2.0.0 | version target / compatibility intent を明示する | `version_target`, `target_version_or_release_trigger`, `review_trigger`, `activation_dependency` |
| GitHub Releases | <https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository> | live GitHub docs | live official GitHub docs | adopt-live-docs-for-release-trigger | release/tag を activation trigger として扱う | `target_version_or_release_trigger`, `review_trigger`, `review_by_policy` |
| GitHub Environments required reviewers | <https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments> | live GitHub Actions environments docs | live official GitHub docs with public/private repo and plan constraints | adopt-live-docs-for-approval-shape-with-availability-check | deployment/activation approval を action-binding にする。ただし repo visibility / account or org plan / prevent self-review / environment secrets availability を確認できない場合は GitHub Environments を承認境界とみなさない | `review_owner`, `approval_scope` |
| NIST SSDF SP 800-218 | <https://csrc.nist.gov/pubs/sp/800/218/final> / <https://csrc.nist.gov/pubs/sp/800/218/r1/ipd> | final publication 1.1 (2022-02-04) | Rev. 1 initial public draft v1.2 (2025-12-17) | adopt-final-1.1; track-draft-do-not-adopt-until-final | release evidence / archive / rollback traceability を要求する | `dry_run_plan`, `rollback_plan`, `stale_action` |
| semantic-release | <https://semantic-release.gitbook.io/semantic-release> | live official docs | live official docs | compare-only-until-release-ADR | commit message から version / changelog / publish まで自動化できる候補。PR-gate 親和性と rollback を ADR で評価する | `activation_dependency`, `dry_run_plan`, release automation ADR |
| Release Please | <https://github.com/googleapis/release-please> | live official repository docs | live official repository docs | compare-only-until-release-ADR | Conventional Commit から release PR / changelog / version bump を作る候補。publication は別機構として扱う | `review_trigger`, `activation_dependency`, release automation ADR |
| GitHub Rulesets | <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets> | live GitHub docs | live official GitHub docs | adopt-live-docs-for-gated-push-design | raw push deny / bypass actor / required checks plan を release activation guard として扱う | `approval_scope`, `activation_dependency` |
| GitHub Merge Queue | <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue> | live GitHub docs | live official GitHub docs | adopt-live-docs-for-merge-readiness | required checks を満たす PR だけを merge candidate にする release readiness guard として扱う | `activation_route`, `review_trigger`, `activation_dependency` |
| GitHub Actions secure use | <https://docs.github.com/en/actions/reference/security/secure-use> / <https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target> / <https://docs.github.com/actions/reference/authentication-in-a-workflow> | live GitHub Actions security docs | live official GitHub docs | adopt-live-docs-for-activation-workflow-hardening | activation / dry-run workflow の `GITHUB_TOKEN` 権限、`pull_request_target`、自動 PR 承認、未信頼コード checkout を承認前に検査する | `approval_scope`, `dry_run_plan`, `external_rehearsal_plan`, `activation_provenance_requirements`, `audit_record` |
| Cloudflare Pages limits | <https://developers.cloudflare.com/pages/platform/limits/> | live Cloudflare docs | live official Cloudflare docs | adopt-live-docs-for-static-hosting-budget | $0 static SPA budget を activation 前に確認する | `cost_guardrails`, `external_rehearsal_plan` |
| Cloudflare Workers limits | <https://developers.cloudflare.com/workers/platform/limits/> | live Cloudflare docs | live official Cloudflare docs | adopt-live-docs-for-worker-budget | read API / Pages Functions request budget を activation 前に確認する | `cost_guardrails`, `external_rehearsal_plan` |
| Cloudflare D1 limits | <https://developers.cloudflare.com/d1/platform/limits/> | live Cloudflare docs | live official Cloudflare docs | adopt-live-docs-for-projection-db-budget | projection DB budget を activation 前に確認する | `cost_guardrails`, `external_rehearsal_plan` |
| Cloudflare Workers KV limits | <https://developers.cloudflare.com/kv/platform/limits/> | live Cloudflare docs | live official Cloudflare docs | adopt-live-docs-for-projection-cache-budget | projection cache budget を activation 前に確認する | `cost_guardrails`, `external_rehearsal_plan` |
| Cloudflare Access policies | <https://developers.cloudflare.com/cloudflare-one/access-controls/policies/> | live Cloudflare docs | live official Cloudflare docs | adopt-live-docs-for-viewer-access-control | read-only dashboard access control を activation 前に rehearsal する | `external_rehearsal_plan`, `approval_scope` |
| GitHub webhook HMAC SHA-256 | <https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries> | live GitHub docs | live official GitHub docs | adopt-live-docs-for-webhook-signature | webhook authenticity を activation 前に dry-run 検証する | `external_rehearsal_plan`, `dry_run_plan` |
| OWASP Web Security Testing Guide | <https://owasp.org/www-project-web-security-testing-guide/> | live OWASP WSTG docs | live official OWASP docs | adopt-live-docs-for-security-testing-shape | access control / input / secret exposure surface の検証観点として使う | `external_rehearsal_plan`, `dry_run_plan`, `activation_provenance_requirements` |

Ledger freshness policy: `checked` が未来日、または現在日から 90 日超過の場合、その Version-up source ledger は stale とし、parked review / activation decision / completion packet の判断材料にしない。

Source ledger meaning review: `checked` 更新時は、各公式 source について `source_status_delta`、
`adoption_decision_delta`、`workflow_route_impact` を review evidence に残す。SemVer / GitHub / Cloudflare /
HMAC / Access の source 状態が activation trigger、approval scope、free-tier budget、rollback、または
external rehearsal の意味を変える場合、date-only refresh で済ませず、parked PLAN の
`activation_decision_record` / `parked_review_record` / `action_binding_approval_record` を再評価する。

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
| activation packet | `ut-tdd version-up activation-packet --json` が parked PLAN の activation / parked review / action-binding approval を plan-only packet として出す |

現在の機能セットは次の 5 点である。

1. **保全 marker**: `version_target` は status=draft の PLAN にだけ許可する。
2. **未了の弁別**: `ut-tdd status` は active draft と version-up parked を分離する。
3. **Forward 収束**: forward-convergence は version-up parked を未集約 landed 違反にしないが、完了扱いにも埋めない。
4. **activation**: 将来版で再開するときは `target_version_or_release_trigger` と `activation_route` を持ち、add-feature で L2/L3 → L7 へ Forward 合流する。
5. **安全境界**: 外部 API・infra・secret・認証/認可等を含む activation は `escalation_boundaries[]` と action-binding approval が無ければ exit 1。
6. **parked review**: `parked_review_record` が review owner / trigger / stale action を持ち、将来版保全を無期限 draft にしない。
7. **activation packet**: `version-up-activation-packet.v1` が allowed outcomes、blocked reasons、external boundaries、source ledger freshness、next workflow routes を出し、承認なしの apply surface を作らない。
8. **external rehearsal packet**: 外部 activation では `external_rehearsal_plan` / `cost_guardrails` /
   `activation_provenance_requirements` が free-tier、HMAC、Access、secret/PII、no-prod-write、rollback、
   approval/audit evidence を出し、$0 claim や外部安全境界を口頭説明だけにしない。
9. **activation readiness checks**: `activationReadinessChecks[]` が external rehearsal / provenance の各項目を
   `present` / `pending_evidence` に分類し、pending のままでは activation 判断を blocked reason に残す。
   証跡 locator のない要求文・手順文・予定文は `present` にしない。
9a. **activation readiness summary**: `activationReadinessSummary` が check 数、pending check 名、
   source ledger freshness、summary status を出し、activation material の完成度を prose parsing なしで確認できる。
10. **reapproval triggers**: `reapprovalTriggers[]` が HEAD/scope/source/evidence drift 時の再実行・再承認 route を示し、
    古い dry-run / approval / source ledger / rollback evidence を activation 根拠として流用しない。
11. **activation snapshot binding**: `activationSnapshot.snapshotId` が release trigger / source ledger / approval
    scope / rehearsal evidence digest を束ね、後続 approval が何を承認したかを機械的に固定する。
12. **activation verification command matrix**: `activationVerificationCommandMatrix[]` が activation packet、
    dry-run、external rehearsal、security testing、state/doctor、targeted regression、static gates を扱う。
    さらに full regression、approval packet の command / writePolicy / expected / evidence を出し、
    承認前 evidence を自由文だけにしない。`db rebuild` を含む state/doctor row は `state-write`、
    packet-only rehearsal/security row は `no-write` として区別し、no-write row への state/artifact write 混入を拒否する。
12a. **no-write rehearsal/security packet**: `external-rehearsal` / `security-testing` は
     `version-up rehearsal` / `version-up security-checklist` の no-write packet-only CLI で実行可能性を示し、
     doctor が matrix command availability を検査する。
12b. **release/environment availability gate**: `version-up dry-run` は `releaseTagExists` /
     `releaseTriggerResolved` を返し、target release tag 未解決なら `ok=false` にする。approval packet /
     security checklist は GitHub Environments required reviewers の repo visibility / account or org plan /
     prevent self-review / environment secrets availability を承認前 evidence とし、CI workflow や environment 名の
     存在だけで approval boundary とみなさない。

## 6. 他 mode との非重複

| mode | version-up との違い |
|------|---------------------|
| Add-feature | 「いま」追加。version-up は「将来版で」追加 (時間軸) |
| Retrofit | 依存・基盤の upgrade。製品機能の version 繰延ではない |
| archived | 破棄。version-up は将来必ず Forward へ入れる保全 |
| plain draft | 単なる WIP。version-up は明示マーカー付きの意図的将来保全 |

## 7. このドキュメントの位置付け

本 mode 定義は PLAN-DISCOVERY-09 S4 ADOPT で正本化。gate の機械検証条件は forward-convergence (要件定義書 §6.8.8.1)、frontmatter 制約は schema (`version_target` は status=draft 限定)。
