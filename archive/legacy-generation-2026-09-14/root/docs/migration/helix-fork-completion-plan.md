# HELIX から HELIX への fork 完了 plan

## 0. 目的

社内 agent 基盤を HELIX-HARNESS へ統合し、`vendor/helix-source/` snapshot を historical source のみとして扱える状態にする。最終的には snapshot を削除できるよう、snapshot 内でまだ再利用可能な要素（skills、subagents、slash commands、hooks、CLI tools）を棚卸しし、残りの fork 作業順序を定める。

この文書は planning artifact である。stream ごとの `PLAN-*` ticket は、この gap list とは別に Codex が作成する。

inventory は 3 系統の repository survey を突き合わせ、`helix-source-inventory.md`、`helix-porting-map.md`、`v2-import-ledger.md`、`internal-asset-inventory.md` と照合して作成した。その後、load-bearing claim は working tree で再確認した（`.claude/commands` が無いこと、roll-up pack が無いこと、agent に HELIX reference leak が無いこと）。

## 1. coverage summary（2026-06-17 検証）

| stream | source total | HELIX への反映済み | 再利用可能 / pending | obsolete（HELIX-specific） |
|---|---:|---:|---:|---:|
| skills（`skills/**/SKILL.md`） | 107 件 | curated 57 件 | 32 件（migrate-now 20 + defer 12） | 18 件 |
| subagents（`.claude/agents`） | 19 | transplanted 17 | 新規 0（body-polish 5） | 2（`pmo-helix-*`） |
| slash commands（`.claude/commands`） | 10 件 | 0 件（dir absent） | 10 件 | 0 件 |
| hooks（`.claude/hooks`） | active 13 件 | TS replacement 4 件 | 5 件（transplant/redesign） | 3 件 |
| CLI capabilities（`cli/helix-*`） | 28 | re-implemented 17 | 9 | 2 |
| verify harness（`verify/`） | 5 groups | unit-smoke covered 済み | E2E flow gap あり | - |

repository runtime は `vendor/helix-source/` に load-bearing dependency を持たない。`src/**` と `tests/**` は snapshot を参照していない。機能面の削除は安全であり、hard coupling は tracked-canonical SSoT（`repository-structure.md`）だけである。

## 1.5 migration criterion（PO directive 2026-06-17）の基準

curation/transplant は requirements-driven であり、HELIX-driven ではない。HELIX asset が scope に入るのは、既存 HELIX requirement（`FR-L1-*` / `BR-*`）、drive model（`be` / `fe` / `fullstack` / `db` / `agent`）、または mode に対応する場合だけである。source of truth は HELIX の requirement/design であり、HELIX は loose reference に限る。

- capability が HELIX の requirements / drive models に無い場合は import しない。要求されていない HELIX behavior は trace できない scope creep であり、degrade risk にしかならない。
- HELIX が Scrum / Incident / Recovery / Reverse mode などを独自 design としてすでに所有している場合、HELIX skill version は import しない。別 design を混ぜると HELIX 側を degrade する。必要なら HELIX mode/requirement から HELIX skill を author する。

net effect: skill curation 自体は requirement（`FR-L1-47` skill-pack 正本 + `FR-L1-12` injection）である。この criterion は、どの pack を対象にするかを drive/mode/FR-mapped のみに制限し、HELIX-shaped import を禁止する。§2 は「どの HELIX skills を port するか」ではなく、「どの HELIX requirement / drive area に pack が不足しており、HELIX design から author するか」と読む。§2.1 items は drive/mode/FR への trace がある場合だけ残し、disciplined curation step で pack ごとの trace を再確認し、trace できないものは落とす。

## 2. skills migration の完了

### 2.1 migrate-now（20）: HELIX-relevant だが未 curated

以下の vendor skills は `docs/skills/*.md` へ curate する。ADR-001 と concept_v3.1 の skill pack 方針に従い、verbatim copy ではなく HELIX pack として再 author する。

- `advanced/ai-integration`: LLM integration / RAG / agent routing の支援（orchestration core）
- `advanced/migration`: ETL / data-integrity / Strangler-Fig の移行支援（TS cutover）
- `agent-skills/browser-testing-with-devtools`: real-browser test の実行支援（central UI / L10）
- `agent-skills/ci-cd-and-automation`: `harness-check` CI gate design
- `agent-skills/deprecation-and-migration`: active HELIX から TS への cutover
- `agent-skills/technical-writing`: V-model design docs / ADR quality baseline の維持
- `agent-skills/using-agent-skills`: skill discovery/trigger protocol（`SKILL_MAP` は index-only）
- `automation/observability`: `FR-38` telemetry / harness.db observability
- `common/coding`: foundational implementation quality baseline の共通化
- `design-tools/diagram`: ADR/architecture/data docs 向け Mermaid/D2 図表支援
- `tools/ai-search`: Haiku research-delegation pattern の支援（`pmo-haiku`）
- `tools/web-search`: WebSearch/WebFetch primary-source protocol の明文化
- `workflow/deploy`: CI deploy / rollback discipline
- `workflow/dev-policy`: DoD / dev-rules（`gate-design.md` へ map）
- `workflow/runbook`: recovery/incident runbook discipline の整備
- `workflow/schedule-wbs`: PLAN schedule-steps / WBS generation の支援
- re-confirm: `agent-skills/frontend-ui-engineering`、`agent-skills/mock-driven-development`、`automation/job-queue`、`automation/lock` は migrate-now/defer の境界にまたがるため §2.2 を参照する。

### 2.2 defer（12）: relevant だが Phase-B / later-wave

FE/UI packs（`project/fe-*`、`project/ui`、`design-tools/web-system`、`agent-skills/frontend-ui-engineering`、`agent-skills/mock-driven-development`、`agent-skills/performance-optimization`）は central UI Phase B（ADR-005、backend-first）まで gate する。

Ops packs（`workflow/observability-sre`、`agent-skills/shipping-and-launch`、`automation/job-queue`、`automation/lock`、`advanced/external-api`、`advanced/legacy`）は W12/W17 まで gate する。該当 wave が activate した時点で curate する。

### 2.3 out-of-scope（18）: migrate しない

HELIX personal-project / web-product specific なため、次は migrate しない。

`advanced/i18n`、`advanced/innovation-mgr`、`advanced/marketing-innovation`、`advanced/tech-innovation`、`automation/flow-optimize`、`automation/init-setup`、`automation/scheduler`、`automation/site-mapping`、`common/design`、`common/infrastructure`、`common/performance`、`common/visual-design`、`design-tools/{character,graphic,pptx}`、`tools/ide-tools`、`workflow/{compliance,dev-setup}`、`writing/{explain,japanese,presentation,social}`。

**Resolved（PO 2026-06-17）: import しない。** `agent-skills/helix-scrum`、`workflow/incident`、`workflow/postmortem` は mode-duplicate である。HELIX は Scrum（`FR-L1-23`）、Incident（`FR-L1-16`）、Recovery（`FR-L1-10`）を `docs/process/modes/{scrum,incident,recovery}.md` の drive-model design としてすでに所有している。HELIX versions を import すると divergent design になり degrade する。これらの surface に skill pack が必要な場合は、§1.5 に従い HELIX mode/FR から author し、HELIX は loose reference に限る。

### 2.4 doc-drift fix（skills）の是正

`helix-porting-map.md` W10 rows は roll-up pack target（`test-pack.md` / `design-pack.md` / `implementation-pack.md` / `operations-pack.md` / `security-pack.md`）を挙げているが、これは individual-file curation に supersede されており、実ファイルは存在しない。W10 を更新し、individual-file approach を記録し、not-curated rows を §2.1 gap として flag する。

### 2.5 substance pass（coverage は substance ではない）

57 の curated pack は name/capability match のみ確認済みで、curation depth は未検証である。各 curated pack を vendor source と照合し、name-stub ではなく procedure が実際に adapted されていることを確認する substance-review pass を追加する。これは coverage-not-substance risk の記録と整合する。

## 3. subagents polish と retire

- **Transplanted（17）:** すべて HELIX-reference-clean（HELIX / ai-dev-kit mention 0 を検証済み）。portability action は不要。
- **Body polish（低優先、leak ではない）:** `pmo-project-scout`、`pmo-sonnet`、`pmo-tech-docs`、`pmo-tech-fork`、`pmo-tech-news` は、`pmo-project-explorer` / `pmo-haiku` のような HELIX-specific output contract / memory section をまだ持たず、元の日本語 prose を保持している。optional consistency upgrade であり、HELIX path leak ではない。survey 中に過大評価された "HELIX text" finding を是正する。
- **Retire（2）:** `pmo-helix-explorer`、`pmo-helix-scout` は vendor snapshot 内にのみ存在し、`~/ai-dev-kit-vscode/` を対象にしている。transplant candidate ではなく、HELIX route も無い。snapshot 削除時に消えるため action は不要。

## 4. slash commands: net-new stream（最も leverage が高い）

HELIX には `.claude/commands/` が存在せず、vendor command 10 件のうち transplanted は 0 件である。directory を作成し、HELIX names を HELIX へ adapt し、allowlisted agents を参照する形で transplant する。

| priority | command | 理由 |
|---|---|---|
| P0 | `ship` | fan-out orchestrator。`code-reviewer` / `security-audit` / `qa-test` を呼び、go/no-go を synthesize する。HELIX review gate を直接実装し、現状は代替が無い。 |
| P0 | `sdd-review` / `sdd-plan` | 5-axis review と verifiable-task breakdown。plan-per-requirement と review-tier discipline を強化する。 |
| P1 | `spec` / `test` / `build` | spec-first から TDD、incremental impl へつなぎ、strict-verification pillar を支える。 |
| P1 | `code-simplify` | language-agnostic refactor entry point として扱う。 |
| P2 | `innovation-{tech,marketing,synthesize}` | allowlisted `pdm-*` agents を invoke する。 |

## 5. hooks: substance / absence-blindness guard の transplant

- **Covered（4）:** agent-guard、post-tool-use、stop、session-start は `.claude/hooks` と `src/cli.ts hook ...` の TS 実装で置換済み。action は不要。
- **Transplant / redesign（5）:**
  - `posttooluse-plan-auto-register` + `posttooluse-helix-job-enqueue`: PLAN edit から `harness.db` projection trigger へ再実装する。projection-writer は存在するが PostToolUse wiring は未実装。記録済み descent-absence-blindness gap を close する。
  - `pretooluse-design-doc-web-search-guard` + revert companion: TS rewrite し、design doc 前の research を enforce する（substance gate）。
  - `pretooluse-opus-repo-block`: PM/Opus による direct repo code edit を guard する。"implement via Codex, not Opus" directive と整合する。Opus direct-edit が再発した場合に transplant する。
- **Not needed（PO 2026-06-17）:** `sessionstart-history-injection` / `userpromptsubmit-context-bundle` は transplant しない。session continuity は HELIX requirement と own design で満たしている。handover `CURRENT.json`（`FR-L1-42`）、session-log digest（`FR-L1-07`）、layer-context injection（`FR-L1-12`）、memory system が該当する。parallel HELIX per-prompt injection mechanism は duplicate/degrade であり context を肥大化させるため、distinct requirement が無い。
- **Obsolete（3）:** `pretooluse-askuserquestion`（HELIX は AskUserQuestion を禁止）、`pretooluse-codex-slot-check`（helix.db slots）、HTTP-API job slots。drop する。

## 6. CLI tools / TS re-implementation: pending capabilities 9 件

HELIX CLI capabilities 28 件のうち 17 件は `helix` command として実装済み。以下は concept として reusable だが TS 実装が無い。参照先 HELIX libs の logic を reference として扱う。

| priority | capability | target | HELIX reference 参照 |
|---|---|---|---|
| P0 | task classify / effort | `helix task classify` / `estimate`、`src/task/` | `task_type_inference.py`、`effort_classifier.py`、`task_dispatcher.py` |
| P0 | Scrum / Reverse runtime cmds | `helix scrum`、`helix reverse`（現状 lint のみ） | `scrum_local.py`、`reverse_local.py`、`scrum_to_reverse_routing.py` |
| P1 | E2E CLI integration harness | temp-dir full-flow tests の整備（verify/ `h101` / `h401` class） | `verify/h1xx`、`verify/h401` |
| P1 | audit CLI | `helix audit` inventory/hash | `audit_validator.py`、`audit_inventory.py`、`audit_hash.py` |
| P1 | LLM / research guard / redaction | `helix guard` family の整備 | `llm_guard.py`、`research_guard.py`、`redaction.py`、`context_guard.py` |
| P2 | escalation / debt CLI | `helix escalation`（DB tables は存在、CLI 無し） | `escalation_engine.py`、`deferred_findings.py` |
| defer | dashboard / metrics render | `helix metrics` 拡張 | `helix-dashboard`、`helix-observe` |
| defer | learning engine / shadow replay | 未定（W14） | `helix-learn`、`helix-recipe`、`helix-retro` |
| defer | lock / job-queue / scheduler | 未定（W17、solo/standalone では不要） | `helix-lock`、`helix-job`、`helix-scheduler` |

obsolete で HELIX need が無いものは HTTP API bridge、HELIX statusline / mode-state-machine / PR automation である。HELIX は `helix status` と `gh` を使う。

## 7. phasing

- **Phase 1（fork-now）:** §2.1 skills 20 件、§4 P0/P1 commands、§5 plan-auto-register + design-doc guards、§6 P0（task-classify、scrum/reverse）。highest-value gaps と記録済み absence-blindness/substance gaps を close する。
- **Phase 2（wave-gated）:** §2.2 defer skills、§4 P2 commands、§6 P1/P2（audit、guard family、escalation、E2E harness）を W9/W12/W13/W17 activation に合わせて実施する。
- **Never:** §2.3 out-of-scope skills、§3 retired agents、§5/§6 obsolete items は実施しない。

## 8. vendor-removal readiness gate の基準

special な "import complete" declaration は不要である。snapshot は HELIX 再構築中の read-only reference にすぎず、runtime は使っていない。snapshot は、以下の requirement-backed work が終わった時点で削除する。

1. §1.5-scoped（drive/mode/FR-mapped）の skill packs が curated 済みで、§2.5 substance pass が green。
2. HELIX libs を reference に使う §6 pending TS re-implementations が landed、または明示的に defer/never へ re-scope 済み。
3. `repository-structure.md` を更新し、tracked list と structure tree から `vendor/helix-source/` を削除し、`tracked-canonical` lint を green に保つ。
4. 約 20 件の historical doc references（migration/archive/audit）は acknowledged dangling history として残すか、更新する。

それまでは snapshot を保持する。snapshot は (1) と (2) の reference source である。完了後は dead weight として 1 commit で削除する。これが "vendor removal" question の全体であり、requirement-backed migration の完了以外に別 gate は無い。

## 9. decisions（PO 2026-06-17）

- **Mode-duplicate skills（helix-scrum / incident / postmortem）: import しない。** §2.3 の通り、HELIX がこれらの modes を所有しており、HELIX versions の import は degrade になる。
- **Context auto-injection hooks: transplant しない。** §5 の通り、handover + session-log + memory が session-continuity requirement を満たしており、parallel mechanism は duplicate/degrade で context を肥大化させる。
- **Vendor removal:** declaration step は不要。§8 (1) と (2) の requirement-backed migration が終わった時点で削除する。それまでは保持する。

## 10. next step の作業

Codex は Phase-1 stream ごとに `PLAN-*` ticket を作成する。対象は skills curate batch、`.claude/commands` transplant、hook re-implementation、task-classify + scrum/reverse TS modules である。それぞれ V-model pair と review evidence を持たせる。

この文書は driving gap list であり、それ自体は PLAN ticket ではない。

## 11. execution status（2026-06-17、PO directed Opus to execute、Codex at limit）の記録

vendor-removal gate（§8）はこの session で満たされ、snapshot は削除済みである。

- **§8(1) skill curation + substance: DONE。** `PLAN-L7-70`（confirmed）。54 packs、すべて HELIX substance、generic stubs 0。`§2.1` migrate-now は curated 済み。`§1.5` prune として non-mapped / HELIX-shaped packs 4 件（`ai-coding`、`quality-lv5`、`source-driven-development`、obsolete `SKILL_MAP-draft`）を除外した。`SKILL_MAP` は real catalog index として rewrite 済み。既存 search-index の false-positive secret guard も合わせて修正済み。
- **§4 slash commands: DONE。** `PLAN-L7-71`。`.claude/commands/` を作成し、P0/P1（`ship`、`sdd-review`、`sdd-plan`、`spec`、`test`、`build`、`code-simplify`）を実装した。§4 P2 `innovation-*` は deferred（`pdm-*` を invoke）。
- **§6 P0 task classify: DONE。** `PLAN-L7-72`。`src/task/classify.ts` と `helix task classify` CLI を実装し、既存 `scoreTaskComplexity`（`FR-L1-39`）/ `classifyDrive`（`FR-L1-41`）/ `inferTaskDifficulty` contracts の上に構成した。module は architecture §3.1 へ backfill 済み。
- **§8(2) re-scope（explicit defer/never、§8(2) で許可）:**
  - `§6 P0` scrum / reverse runtime commands（`helix scrum` / `helix reverse`）: DEFER。large mode state machines であり、lint surfaces（`scrum-reverse`、`plan lint`、`vmodel lint`）は既存。skill packs は `docs/process/modes/` から author 済み。後続 Phase-1 wave で land する。
  - `§6 P0/P1` `helix task estimate`、audit CLI、guard family、escalation CLI、E2E harness: DEFER とする（W9/W12/W13/W17 wave-gated）。
  - `§5` hooks（plan-auto-register projection trigger、design-doc web-search guard）: DEFER as Phase-1 follow-up。vendor-removal blocker ではない。PO-resolved の do-not-transplant hooks（§5/§9）は drop のまま。
  - `§2.2` defer skills（FE/UI + ops packs）: DEFER。central UI Phase B / W12 activation まで待つ。
- **§8(3) `repository-structure.md`: updated。** tracked list と structure tree から `vendor/helix-source/` を削除済み。
- **§8(4) doc references: acknowledged dangling history として残す。** 約 31 件の tracked docs（archive / migration / handover / Discovery PLAN `references:`）が snapshot に言及しているが、runtime/gate dependency ではない。`src/**` / `tests/**` reference は無く、PLAN `requires` / `parent` / `parent_design` でもない。§8(4) に従い historical record として残す。
