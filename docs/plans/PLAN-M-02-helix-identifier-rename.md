---
plan_id: PLAN-M-02-helix-identifier-rename
title: "PLAN-M-02 (migration): 機械識別子 helix → helix atomic 改名 (L1 完了境界 trigger)"
kind: design
layer: L14
drive: fullstack
status: draft
created: 2026-06-28
updated: 2026-06-28
owner: PO (人間 / RetryYN)
master_hub: true   # CLI/dir/marker/hook/docs を 1 工程で揃える atomic migration 駆動 hub
agent_slots:
  - role: tl
    slot_label: "TL — 機械識別子改名の blast-radius 統制・全 gate green 境界条件の検証"
  - role: po
    slot_label: "PO — cutover 承認 (不可逆: state dir 移行を含む)"
generates:
  - artifact_path: docs/plans/PLAN-M-02-helix-identifier-rename.md
    artifact_type: markdown_doc
dependencies:
  parent: PLAN-L1-06-helix-solo-conversion
  blocks: []
  references:
    - docs/plans/PLAN-L1-06-helix-solo-conversion.md
    - docs/adr/ADR-001-helix-harness-redesign-and-language.md
    - CLAUDE.md
    - AGENTS.md
    - .claude/CLAUDE.md
---

# PLAN-M-02 (migration): 機械識別子 helix → helix atomic 改名

## §0 本 PLAN の役割 / trigger 条件

CLAUDE.md「リネーム方針（段階）」の後半を実体化する追跡台帳。**製品名・prose は HELIX へ継続移行**するが、
**機械識別子（CLI `helix`、状態 dir `.helix/`、`area=helix`、rule-drift adapter marker）は相互ロック**して
いるため、部分改名は `rule-drift` 赤化・hook/state/DB 破断を招く。よって **1 工程で atomic に改名**する。

**trigger（着手前提）= `PLAN-L1-06-helix-solo-conversion` の G-REQ.L1 re-freeze が confirmed**。それ以前は着手しない
（機能作業と大改名を混ぜない）。本 PLAN は draft として **status/forward-convergence に常時可視**であり、
harness メモリ `rename-timing-decision` が SessionStart で surface する。これにより「口頭の later」ではなく
**機械追跡される未了作業**として残り、L1 境界で必ず拾われる（no-ask-and-defer の機械的担保）。

## §1 blast radius (2026-06-28 実測 baseline)

| 対象 | 量 |
|------|----|
| `helix`（src/） | 55 files / 222 hits |
| `helix`（tests/） | 56 files |
| `helix`（docs/） | 451 files |
| `.helix/` 物理 dir | src 37 hits ＋ 実 dir（harness.db・memory・state・logs 保持） |
| `area=helix` marker | 34 hits |
| rule-drift adapter marker | 各 adapter 規則: CLAUDE.md 36 / AGENTS.md 30 / .claude/CLAUDE.md 21 |
| hook 設定 | `.claude/settings.json`・`.codex/hooks.json`（`helix`/`src/cli.ts` 呼出） |
| package.json | `name`/`bin` = `helix` |

> 着手時に Step 1 で再計測し baseline を更新（差分 = 取りこぼし検知）。

## §工程表 (Step + 進捗)

### Step 1: [直列] blast-radius 再計測 + 改名表凍結
> 直列理由: downstream_dependency — 全置換の基準集合を固定してからでないと取りこぼしを検知できない。
全 `helix`/`.helix/`/`area=helix`/marker サイトを列挙し、機械識別子↔新名の対応表を凍結（製品名 prose は対象外と明示）。
- 進捗: ☑ partial — `src/lint/identifier-rename.ts` + `helix rename audit` で `helix` / `.helix` /
  `area=helix` blast radius を JSON 出力できる。cutover/action-binding approval が無い場合は
  `blocked_pending_cutover_approval` とし、`.helix -> .helix` apply 可能とは扱わない。`helix rename plan`
  は Step 1 の non-destructive cutover packet として dry-run / rollback / monitoring / approval gate を出すが、
  approval record が concrete でも plan-only であり apply command は提供しない。
- 進捗: ☑ partial — 2026-07-01 continuation: `helix rename plan --json` は `stateBackupManifest`、
  `freezePolicy`、`provenanceRequirements` も出力する。これにより Step 7 の PO 承認前に、backup/restore 対象、
  frozen HEAD・quiet window・単独実行・再承認 trigger、blast-radius/state-backup/audit/window evidence を
  明示的に審査できる。ただしこれは runbook/approval material であり、cutover apply は引き続き未承認。
- 進捗: ☑ partial — 2026-07-01 continuation: rename audit は token/file 数だけでなく `hitsByCategory` として
  source/test/runtime-state/adapter-config/consumer-template/plan/design/governance/distribution surface 別の残渣を
  出し、rename plan は `cutoverCategoryChecklist` でカテゴリ別 action を返す。これにより cutover 承認前に
  「旧識別子がどの面に残るか」を審査できるが、apply は引き続き未承認。
- 進捗: ☑ partial — 2026-07-01 continuation: `helix rename plan --json` は `cutoverSnapshot` を出し、
  各 digest（blast-radius、approval scope、backup/provenance/monitoring evidence、freeze-policy）と
  reapproval triggers を束ねた `snapshotId` を返す。これは approval material の stale 判定用 binding ID であり、
  cutover apply 権限ではない。PLAN 本文上の snapshot 値は最後に記録した review binding であり、commit 後の
  current 値ではないため、承認直前に必ず `helix rename plan --json` を再実行して current
  `cutoverSnapshot.snapshotId` へ再バインドする。

### Step 2: [直列] src/ + tests/ 識別子 codemod (behavior 不変)
> 直列理由: downstream_dependency — Step 1 の対応表に従って一括置換するため。
CLI 名・内部参照を helix へ。挙動不変を full vitest で担保。`area=helix` 列挙値も同時更新。
- 進捗: ⬜

### Step 3: [直列] state dir .helix/ → .helix/ 移行 (不可逆)
> 直列理由: downstream_dependency — コード参照(Step 2)更新後でないと移行中に harness.db パスが割れる。
dir move + harness.db パス + projection-writer + `.gitignore` + loop/jobs/memory store パスを atomic 更新。移行手順は冪等に。
- 進捗: ⬜

### Step 4: [直列] adapter marker + hook 同時更新 (rule-drift green 維持)
> 直列理由: downstream_dependency — Claude/Codex 両 adapter marker を同コミットで揃えないと rule-drift が赤化する。
`.claude/settings.json`・`.codex/hooks.json`・CLAUDE.md/AGENTS.md/.claude の rule-drift marker を一括改名。
- 進捗: ⬜

### Step 5: [直列] docs/prose sweep + governance doc 改名
> 直列理由: downstream_dependency — 機械側確定後に doc 表記・governance ファイル名を揃えるため。
451 docs の機械識別子表記と legacy harness governance filename を HELIX 名へ。SSoT 参照リンク整合。
- 進捗: ⬜

### Step 6: [直列] review (全 gate green = 境界条件)
> 直列理由: downstream_dependency — Step 1–5 の atomic 性を定量検証してから cutover するため。
`helix→helix doctor` green（**rule-drift 含む**）/ full vitest / **compiled dist smoke**（rootpath-gotcha 再発防止）/ cross-agent review。
- 進捗: ⬜

### Step 7: [直列] cutover commit + PO サインオフ
> 直列理由: irreversible_operation — state dir 移行を含む不可逆 cutover の確定は PO 承認後。
1 コミット境界で origin と整合 push、PO 承認 → status=confirmed、audit A-NNN 記録。
- 進捗: ⬜

cutover_decision_record:
- allowed_outcome: `approve_cutover` / `reject_or_defer` / `request_runbook_changes`
- decision_owner: PO (人間 / RetryYN)。TL は blast-radius、dry-run、rollback、alias policy の技術判定を提出する。
- cutover_snapshot_id: 最後に記録した review snapshot は `sha256:7c22965fb5c0c12ef837a5dd433891f0be7bc008451d26499f92bea12d335e18`。これは承認ではない。将来の cutover 承認では、frozen HEAD で `helix rename plan --json` を再実行し、その時点の current `cutoverSnapshot.snapshotId` を bind する。snapshot が変わった場合、cutover/action-binding approval evidence は stale になる。
- trigger_condition: `PLAN-L1-06-helix-solo-conversion` の G-REQ.L1 re-freeze が confirmed、かつ Step 1〜6 の atomic rename 検証が green。
- blast_radius_baseline: Step 1 の再計測結果 (`helix` / `.helix/` / `area=helix` / rule-drift markers / hooks / package bin / docs links) を audit に固定する。
- dry_run_plan: codemod + state path migration rehearsal + `bun run test` + `bun run src/cli.ts db rebuild && bun run src/cli.ts doctor` + compiled dist smoke を non-destructive branch で実行する。
- rollback_plan: cutover commit 前 tag/branch、state dir backup、旧 `helix` alias/shim の暫定復旧、hooks/config restore、doctor failure 時の revert route を記録する。
- state_backup_plan: `.helix/harness.db`、memory/state/logs/handover、provider handover pointer、repo-local hook config を backup/restore 対象にする。
- execution_window_or_freeze_policy: cutover 候補 policy は frozen HEAD、quiet window、single-run/concurrency policy、branch/prose freeze boundary、HEAD/scope/evidence drift 時の re-approval trigger を必須にする。
- approval_scope: CLI/bin rename、state dir move、adapter marker/hook rename、docs/governance link rename、distribution surface の範囲に限定する。secret/auth/infra は対象外。
- audit_record: apply commands、git hash、backup location、approver、doctor/full test/dist smoke 結果、rollback decision を `.helix/audit/A-NNN-*` に記録する。
- post_cutover_monitoring: quiet window 中に `helix doctor`、旧 alias smoke、status/completion packet、harness.db rebuild、feedback backlog を確認する。
- legacy_alias_policy: `helix` alias/shim は Step 6 review で keep/remove を決め、残す場合は removal PLAN と sunset 条件を持つ。
- source_ledger_freshness: fresh; cutover 判断に使う前に、2026-07-03 に docs/process/forward/L08-L14-verification-phase.md の cutover source ledger を確認済み。
- source_status_delta: none; NIST SSDF / GitHub approvals and concurrency / Google SRE release/canary guidance / Microsoft safe deployment/testing / OWASP LLM06 / SLSA の source status change は、それ単体では rename apply を承認しない。
- adoption_decision_delta: none; `.helix -> .helix` は concrete な cutover approval evidence が揃うまで approval-gated かつ plan-only のままにする。
- workflow_route_impact: draft 中は none。将来の承認は L14 cutover decision、action-binding approval、post-cutover monitoring を通す。

action_binding_approval_record:
<!-- action binding 承認記録 -->
- allowed_outcome: `approve_action_binding` / `deny_action` / `request_scope_reduction`
- approval_policy_or_named_approver: CLI/bin rename、state dir move、hook/adapter marker rename、distribution surface cutover の apply 前に、PO action-binding approval を必須にする。
- approval_scope: CLI/bin rename、`.helix` state dir migration、adapter marker/hook rename、docs/governance link rename、distribution surface のみに限定する。secret/auth/infra 変更は明示的に範囲外。
- approved_actor: この draft PLAN は actor を承認しない。cutover approval は apply 前に human operator または automation identity を明記する。
- approved_tool: この draft PLAN は migration tool を承認しない。cutover approval は各 apply step で使う codemod/CLI/script/workflow を明記する。
- approved_target: この draft PLAN は不可逆 target を承認しない。cutover approval は CLI/bin identifiers、state paths、hook/adapter markers、docs/governance paths、distribution surface を明記する。
- approved_params: この draft PLAN は apply params を承認しない。cutover approval は command args、codemod options、state move mapping、params hash または summary を記録する。
- review_approval_evidence: 承認前に Step 1 blast-radius baseline、dry-run plan、rollback/state backup plan、compiled dist smoke、full test、db rebuild、doctor、legacy alias policy を review する。
- reviewed_snapshot_binding: Cutover approval は `helix rename plan --json` の current `cutoverSnapshot.snapshotId` を引用する。snapshot が変わった場合、旧 approval evidence は stale であり `.helix` state migration や identifier cutover を許可しない。
- expires_at_or_trigger: trigger-bound。Step 1〜6 の evidence、branch/head、scope が変わるか、quiet-window/rollback plan が改訂された場合、approval は失効する。
- audit_record: この draft PLAN は不可逆 cutover を承認・実行しない。apply 時は approver、git hash、backup location、commands、results、rollback decision、monitoring outcome を記録する。

## §3.1 実装計画 (各 Step をどう埋めるか)

| Step | 対象 | 方法 |
|------|------|------|
| 1 | 全機械識別子サイト | 再 grep 計測 → 対応表凍結（prose 除外を明示） |
| 1a | blast-radius audit CLI | `auditIdentifierRenameBlastRadius` + `helix rename audit --json` で旧 token 残渣、category 別 hit、approval 不足を機械出力 |
| 1b | non-destructive cutover packet | `helix rename plan --json` で rename map、category 別 cutover checklist、sourceLedgerFreshness、no-write cutoverRunbook、dry-run、rollback、monitoring、restore drill 付き state backup manifest、freeze policy、cutoverSnapshot、provenance requirements、approval gate を出す。verification matrix は current `helix` dist smoke、renamed `helix` dist smoke、legacy alias smoke を分け、各 row に sourceCheckedAt / latestOfficialStatus / sourceStatusDelta / adoptionDecision / adoptionDecisionDelta / workflowRouteImpact を持たせる。Google SRE canarying と Microsoft safe deployment/testing は staged exposure、health comparison、rollback trigger、pre-release security/regression/load evidence を承認前 review 材料に束ねる。apply は提供しない |
| 2 | src/ tests/ | codemod + full vitest で behavior 不変担保 |
| 3 | `.helix/` 実 dir + コード | atomic dir move + harness.db/projection/store パス更新（冪等手順） |
| 4 | hooks + marker | 両 adapter 同コミット改名（rule-drift green 維持） |
| 5 | docs 451 + governance 名 | 表記 sweep + ファイル改名 + リンク整合 |
| 6 | lint/doctor/dist/review | 全 gate green（rule-drift・dist smoke 必須）を境界条件化 |
| 7 | cutover | 不可逆確定 → PO サインオフ + audit |

## §4 DoD（完了定義）

- [ ] trigger 充足: PLAN-L1-06 G-REQ.L1 re-freeze が confirmed であることを着手前に確認。
- [ ] CLI `helix`・状態 dir `.helix/`・`area=helix`・marker が全面改名され旧名残渣 0（Step 1 再計測で検証）。
- [ ] `rule-drift` green（両 adapter marker 一致）・full vitest green・compiled dist doctor green。
- [ ] state dir 移行が冪等・不可逆境界で PO 承認済、audit A-NNN 記録。
- [ ] 製品名/prose の HELIX 表記と機械識別子が完全一致（二重名称解消）。
- [ ] 承認前 packet に backup/restore manifest、frozen HEAD + quiet window + single-run policy、
      再承認 trigger、blast-radius/state-backup/audit/window provenance が含まれる。

## §5 carry / 次工程への引き継ぎ

- 改名後、外部公開面（README・bin 配布名）の周知は後続で扱う。
- 旧名 alias（`helix` → `helix` shim）の要否は Step 6 review で判断（後方互換の一時 shim か即時切替か）。
