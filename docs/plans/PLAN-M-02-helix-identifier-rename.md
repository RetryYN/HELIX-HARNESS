---
plan_id: PLAN-M-02-helix-identifier-rename
title: "PLAN-M-02 (migration): 機械識別子 ut-tdd → helix atomic 改名 (L1 完了境界 trigger)"
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
    - docs/adr/ADR-001-ut-tdd-harness-redesign-and-language.md
    - CLAUDE.md
    - AGENTS.md
    - .claude/CLAUDE.md
---

# PLAN-M-02 (migration): 機械識別子 ut-tdd → helix atomic 改名

## §0 本 PLAN の役割 / trigger 条件

CLAUDE.md「リネーム方針（段階）」の後半を実体化する追跡台帳。**製品名・prose は HELIX へ継続移行**するが、
**機械識別子（CLI `ut-tdd`、状態 dir `.ut-tdd/`、`area=harness`、rule-drift adapter marker）は相互ロック**して
いるため、部分改名は `rule-drift` 赤化・hook/state/DB 破断を招く。よって **1 工程で atomic に改名**する。

**trigger（着手前提）= `PLAN-L1-06-helix-solo-conversion` の G-REQ.L1 re-freeze が confirmed**。それ以前は着手しない
（機能作業と大改名を混ぜない）。本 PLAN は draft として **status/forward-convergence に常時可視**であり、
harness メモリ `rename-timing-decision` が SessionStart で surface する。これにより「口頭の later」ではなく
**機械追跡される未了作業**として残り、L1 境界で必ず拾われる（no-ask-and-defer の機械的担保）。

## §1 blast radius (2026-06-28 実測 baseline)

| 対象 | 量 |
|------|----|
| `ut-tdd`（src/） | 55 files / 222 hits |
| `ut-tdd`（tests/） | 56 files |
| `ut-tdd`（docs/） | 451 files |
| `.ut-tdd/` 物理 dir | src 37 hits ＋ 実 dir（harness.db・memory・state・logs 保持） |
| `area=harness` marker | 34 hits |
| rule-drift adapter marker | CLAUDE.md 36 / AGENTS.md 30 / .claude/CLAUDE.md 21 |
| hook 設定 | `.claude/settings.json`・`.codex/hooks.json`（`ut-tdd`/`src/cli.ts` 呼出） |
| package.json | `name`/`bin` = `ut-tdd` |

> 着手時に Step 1 で再計測し baseline を更新（差分 = 取りこぼし検知）。

## §工程表 (Step + 進捗)

### Step 1: [直列] blast-radius 再計測 + 改名表凍結
> 直列理由: downstream_dependency — 全置換の基準集合を固定してからでないと取りこぼしを検知できない。
全 `ut-tdd`/`.ut-tdd/`/`area=harness`/marker サイトを列挙し、機械識別子↔新名の対応表を凍結（製品名 prose は対象外と明示）。
- 進捗: ☑ partial — `src/lint/identifier-rename.ts` + `ut-tdd rename audit` で `ut-tdd` / `.ut-tdd` /
  `area=harness` blast radius を JSON 出力できる。cutover/action-binding approval が無い場合は
  `blocked_pending_cutover_approval` とし、`.ut-tdd -> .helix` apply 可能とは扱わない。`ut-tdd rename plan`
  は Step 1 の non-destructive cutover packet として dry-run / rollback / monitoring / approval gate を出すが、
  approval record が concrete でも plan-only であり apply command は提供しない。
- 進捗: ☑ partial — 2026-07-01 continuation: `ut-tdd rename plan --json` は `stateBackupManifest`、
  `freezePolicy`、`provenanceRequirements` も出力する。これにより Step 7 の PO 承認前に、backup/restore 対象、
  frozen HEAD・quiet window・単独実行・再承認 trigger、blast-radius/state-backup/audit/window evidence を
  明示的に審査できる。ただしこれは runbook/approval material であり、cutover apply は引き続き未承認。
- 進捗: ☑ partial — 2026-07-01 continuation: rename audit は token/file 数だけでなく `hitsByCategory` として
  source/test/runtime-state/adapter-config/consumer-template/plan/design/governance/distribution surface 別の残渣を
  出し、rename plan は `cutoverCategoryChecklist` でカテゴリ別 action を返す。これにより cutover 承認前に
  「旧識別子がどの面に残るか」を審査できるが、apply は引き続き未承認。

### Step 2: [直列] src/ + tests/ 識別子 codemod (behavior 不変)
> 直列理由: downstream_dependency — Step 1 の対応表に従って一括置換するため。
CLI 名・内部参照を helix へ。挙動不変を full vitest で担保。`area=harness` 列挙値も同時更新。
- 進捗: ⬜

### Step 3: [直列] state dir .ut-tdd/ → .helix/ 移行 (不可逆)
> 直列理由: downstream_dependency — コード参照(Step 2)更新後でないと移行中に harness.db パスが割れる。
dir move + harness.db パス + projection-writer + `.gitignore` + loop/jobs/memory store パスを atomic 更新。移行手順は冪等に。
- 進捗: ⬜

### Step 4: [直列] adapter marker + hook 同時更新 (rule-drift green 維持)
> 直列理由: downstream_dependency — Claude/Codex 両 adapter marker を同コミットで揃えないと rule-drift が赤化する。
`.claude/settings.json`・`.codex/hooks.json`・CLAUDE.md/AGENTS.md/.claude の rule-drift marker を一括改名。
- 進捗: ⬜

### Step 5: [直列] docs/prose sweep + governance doc 改名
> 直列理由: downstream_dependency — 機械側確定後に doc 表記・governance ファイル名を揃えるため。
451 docs の機械識別子表記と `ut-tdd-agent-harness-*` 系ファイル名を helix へ。SSoT 参照リンク整合。
- 進捗: ⬜

### Step 6: [直列] review (全 gate green = 境界条件)
> 直列理由: downstream_dependency — Step 1–5 の atomic 性を定量検証してから cutover するため。
`ut-tdd→helix doctor` green（**rule-drift 含む**）/ full vitest / **compiled dist smoke**（rootpath-gotcha 再発防止）/ cross-agent review。
- 進捗: ⬜

### Step 7: [直列] cutover commit + PO サインオフ
> 直列理由: irreversible_operation — state dir 移行を含む不可逆 cutover の確定は PO 承認後。
1 コミット境界で origin と整合 push、PO 承認 → status=confirmed、audit A-NNN 記録。
- 進捗: ⬜

cutover_decision_record:
- allowed_outcome: `approve_cutover` / `reject_or_defer` / `request_runbook_changes`
- decision_owner: PO (人間 / RetryYN)。TL は blast-radius、dry-run、rollback、alias policy の技術判定を提出する。
- trigger_condition: `PLAN-L1-06-helix-solo-conversion` の G-REQ.L1 re-freeze が confirmed、かつ Step 1〜6 の atomic rename 検証が green。
- blast_radius_baseline: Step 1 の再計測結果 (`ut-tdd` / `.ut-tdd/` / `area=harness` / rule-drift markers / hooks / package bin / docs links) を audit に固定する。
- dry_run_plan: codemod + state path migration rehearsal + `bun run test` + `bun run src/cli.ts db rebuild && bun run src/cli.ts doctor` + compiled dist smoke を non-destructive branch で実行する。
- rollback_plan: cutover commit 前 tag/branch、state dir backup、旧 `ut-tdd` alias/shim の暫定復旧、hooks/config restore、doctor failure 時の revert route を記録する。
- state_backup_plan: `.ut-tdd/harness.db`、memory/state/logs/handover、provider handover pointer、repo-local hook config を backup/restore 対象にする。
- execution_window_or_freeze_policy: No apply window is approved by this draft PLAN. Future approval must name the frozen HEAD, quiet window, single-run/concurrency policy, branch/prose freeze boundary, and re-approval trigger for any HEAD/scope/evidence drift before apply.
- approval_scope: CLI/bin rename、state dir move、adapter marker/hook rename、docs/governance link rename、distribution surface の範囲に限定する。secret/auth/infra は対象外。
- audit_record: apply commands、git hash、backup location、approver、doctor/full test/dist smoke 結果、rollback decision を `.ut-tdd/audit/A-NNN-*` に記録する。
- post_cutover_monitoring: quiet window 中に `helix doctor`、旧 alias smoke、status/completion packet、harness.db rebuild、feedback backlog を確認する。
- legacy_alias_policy: `ut-tdd` alias/shim は Step 6 review で keep/remove を決め、残す場合は removal PLAN と sunset 条件を持つ。

action_binding_approval_record:
- allowed_outcome: `approve_action_binding` / `deny_action` / `request_scope_reduction`
- approval_policy_or_named_approver: PO action-binding approval is required before any CLI/bin rename, state dir move, hook/adapter marker rename, or distribution surface cutover is applied.
- approval_scope: CLI/bin rename, `.ut-tdd` state dir migration, adapter marker/hook rename, docs/governance link rename, and distribution surface only; secret/auth/infra changes are explicitly out of scope.
- approved_actor: No actor is approved by this draft PLAN; cutover approval must name the human operator or automation identity before apply.
- approved_tool: No migration tool is approved by this draft PLAN; cutover approval must name the codemod/CLI/script/workflow used for each apply step.
- approved_target: No irreversible target is approved by this draft PLAN; cutover approval must name the CLI/bin identifiers, state paths, hook/adapter markers, docs/governance paths, and distribution surface.
- approved_params: No apply params are approved by this draft PLAN; cutover approval must record command args, codemod options, state move mapping, and params hash or summary.
- review_approval_evidence: Step 1 blast-radius baseline, dry-run plan, rollback/state backup plan, compiled dist smoke, full test, db rebuild, doctor, and legacy alias policy must be reviewed before approval.
- expires_at_or_trigger: Trigger-bound; approval expires if Step 1-6 evidence changes, branch/head changes, scope expands, or the quiet-window/rollback plan is revised.
- audit_record: No irreversible cutover is approved or executed by this draft PLAN; apply must write approver, git hash, backup location, commands, results, rollback decision, and monitoring outcome.

## §3.1 実装計画 (各 Step をどう埋めるか)

| Step | 対象 | 方法 |
|------|------|------|
| 1 | 全機械識別子サイト | 再 grep 計測 → 対応表凍結（prose 除外を明示） |
| 1a | blast-radius audit CLI | `auditIdentifierRenameBlastRadius` + `ut-tdd rename audit --json` で旧 token 残渣、category 別 hit、approval 不足を機械出力 |
| 1b | non-destructive cutover packet | `ut-tdd rename plan --json` で rename map、category 別 cutover checklist、dry-run、rollback、monitoring、state backup manifest、freeze policy、provenance requirements、approval gate を出す。apply は提供しない |
| 2 | src/ tests/ | codemod + full vitest で behavior 不変担保 |
| 3 | `.ut-tdd/` 実 dir + コード | atomic dir move + harness.db/projection/store パス更新（冪等手順） |
| 4 | hooks + marker | 両 adapter 同コミット改名（rule-drift green 維持） |
| 5 | docs 451 + governance 名 | 表記 sweep + ファイル改名 + リンク整合 |
| 6 | lint/doctor/dist/review | 全 gate green（rule-drift・dist smoke 必須）を境界条件化 |
| 7 | cutover | 不可逆確定 → PO サインオフ + audit |

## §4 DoD (Definition of Done)

- [ ] trigger 充足: PLAN-L1-06 G-REQ.L1 re-freeze が confirmed であることを着手前に確認。
- [ ] CLI `helix`・状態 dir `.helix/`・`area=helix`・marker が全面改名され旧名残渣 0（Step 1 再計測で検証）。
- [ ] `rule-drift` green（両 adapter marker 一致）・full vitest green・compiled dist doctor green。
- [ ] state dir 移行が冪等・不可逆境界で PO 承認済、audit A-NNN 記録。
- [ ] 製品名/prose の HELIX 表記と機械識別子が完全一致（二重名称解消）。
- [ ] 承認前 packet に backup/restore manifest、frozen HEAD + quiet window + single-run policy、
      再承認 trigger、blast-radius/state-backup/audit/window provenance が含まれる。

## §5 carry / 次工程への引き継ぎ

- 改名後、外部公開面（README・bin 配布名）の周知は後続で扱う。
- 旧名 alias（`ut-tdd` → `helix` shim）の要否は Step 6 review で判断（後方互換の一時 shim か即時切替か）。
