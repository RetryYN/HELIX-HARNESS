# 上流 UT-TDD_AGENT-HARNESS 突合 audit (2026-07-04)

この audit は、PO 指示（`/goal` 2026-07-04）に基づき
`https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS`（以下「上流」）の全項目を
本リポジトリ HELIX-HARNESS（以下「LOCAL」）と capability 単位で突合し、優れた項目を
**HELIX 式（TS/Bun 再実装・harden・harness 仕組みへ従属・no bulk import）** で取り込むための
採否台帳を確定するものである。inventory-existing-first / verify-don't-blindly-adopt に従い、
ファイル名一致ではなく capability レベルで判定した。

## 1. 両リポジトリの関係

- **上流** `unison-ai-product/UT-TDD_AGENT-HARNESS`（public、MIT、TS 100%、612 commits）は
  UT-TDD Agent Harness の team baseline。**main は 2026-06-29 で凍結**。
- ただし draft **PR #2 `work/l10-l14-local-close`（tip 2026-07-03、main より +219 commit /
  633 ファイル変更）** が活発に進行しており、L10–L14 gate close・doctor モジュール分割・
  PLAN L7-202〜L7-362 等の並行作業を含む。
- **LOCAL** `RetryYN/HELIX-HARNESS` は同一 harness を土台に **HELIX 10 本柱 charter** を積んだ
  進化版で、独自の L7 PLAN 系列・lint 90 モジュール・gate G1–G14 を持つ（本日 07-04 まで進行中）。
- 両者は **同祖の並行 fork**。PLAN 番号は独立に分岐しており（例: LOCAL の PLAN-L7-177 は
  orchestration-runtime-bridge、上流の L7-177 は adapter-error-policy）、**番号一致で同一内容と
  みなすのは不可**。

結論の総論: **仕組み・設計密度・lint 網羅・gate 天井（G14）・charter のいずれも LOCAL が先行**。
上流に固有で LOCAL に無い「優れた項目」は限定的で、その多くは **LOCAL が既に設計済みだが実装未了の
carry**（＝取り込み＝自リポジトリの未完項目を閉じる作業）に該当する。

## 2. 突合方法

4 スコープを read-only の並列調査（pmo-project-explorer）で突合し、台帳を作成した。

1. lint / gate enforcement（G9 / G10 / L14 / D-CONTRACT DSL）
2. root config & adapter surface（CLAUDE/AGENTS/README/.claude/.codex/templates/CI）
3. src 実ロジック（telemetry provenance / distribution / model-override / github-ops 他、上流 L7-188〜201）
4. 上流 PR ブランチの純新規 src モジュール約 35 件の capability トリアージ

## 3. スコープ別サマリー

### 3.1 config & adapter — LOCAL 先行（取り込み無し）

- 上流の `ut-tdd-tl.md` / `ut-tdd-status.md` / `ut-tdd-test.md` は LOCAL に
  `helix-tl.md` / `helix-status.md` / `helix-test.md` として改名済み・内容拡張済み。ALREADY-HAVE。
- `.codex/hooks.json` / `.claude/settings.json` / `agent-guard.ts` は LOCAL のみ `git-command-guard` と
  empty-stdin fail-close 強化を持つ。LOCAL 優位。
- tsconfig / biome / editorconfig / gitattributes / CI（`harness-check.yml`）はバイト一致。
- **任意候補（優先度低）**: 上流の `package.json` に `test:fast` / `test:db` / `test:cli` の細粒度
  vitest レーンあり（開発フィードバック高速化。機能影響なし）。

### 3.2 lint / gate — 4 件が「設計済み・実装未了 carry」＝ 取り込み適合

| capability | LOCAL 判定 | 位置づけ |
|---|---|---|
| G9 system-workflow gate | GENUINELY-MISSING（自己追跡 carry） | `docs/process/gates.md` §1 が G9-G14 を「evidence profile 定義済・子 PLAN 実装待ち」と明記。`src/lint/right-arm-gate-planning.ts`＋IMP-052 が gap を fail-close 追跡中。master = `PLAN-L9-00`。|
| G10 UX-workflow gate | GENUINELY-MISSING（同上） | master = `PLAN-L10-00`。UX 判断は `advisor-fable` evidence と紐付け可能。|
| L14 close-system-foundation audit | GENUINELY-MISSING（部分散在） | engine（表 parser＋evidence-path 実在＋境界語彙強制）は低リスク再利用可。ただし **17 項目 checklist は上流固有で verbatim コピー不可**。HELIX 10 本柱に対して再設計要（pmo-sonnet 判断 gate）。|
| D-CONTRACT DSL（mode-routing.yaml / gate-checks.yaml の zod validate） | PARTIAL（設計済・実装 carry） | LOCAL `if-detail.md §5/§8` が同一 schema を設計し「D-CONTRACT DSL 実装 = L7」を carry と明記。IMP-073 も参照。拡張先 `src/workflow/routing-contracts.ts` と `recommendedCommandV1Schema` は実装済。**最短・最低リスクの取り込み候補**。|

共通の注意: 上流の enum / ID 語彙（D-CONTRACT 11 mode、ST-* 5 family、UXV-* 5 family、L14 17 項目）は
fork 独立進化のため **LOCAL の現行 `docs/process/modes/` / `L9-system-test-design.md` / `visual-design.md` に
接地して再導出**する（verbatim 流用禁止）。

### 3.3 src PR ブランチ triage — refactor と already-have が大半

- **REFACTOR-ONLY（取り込み不要）**: 上流 `src/doctor/*` 21 サブモジュール＋`src/cli/*` 3 件は、
  LOCAL の monolithic `src/doctor/index.ts`（3321 行）/ `src/cli.ts` が同一 `../lint/*` 関数を既に配線済み。
  分割は構造的リファクタで新規 capability ではない。
- **ALREADY-HAVE**: `secret.ts`（LOCAL `state-db/index.ts` に同一 `SECRET_PATTERN`）、
  `setup/branch-protection.ts`（承認ゲート設計を LOCAL `setup/index.ts` が保持）、
  `schema/mode-catalog.ts` / `route-map.ts`（LOCAL `routing-contracts.ts` `ROUTE_SIGNAL_MAP`＋`docs/process/modes/`）、
  `team/advisor-policy.ts`（LOCAL `team/model-effort.ts`＋`task/tier-router.ts`＋advisor-fable）。
- **GENUINELY-MISSING（取り込み候補、後述）**: `context/doc-router.ts`、`skill-engine/scaffold.ts`、
  `setup/update-check.ts`、`github/ops-guard.ts`。
- **provisional（要確認）**: `lint/{github-ci-policy,personal-path,toolchain-pin}.ts`、
  `state-db/{runtime-projections,skill-projections}.ts` は best-effort 判定。採用前に確認 grep 要。

### 3.4 src 実ロジック（telemetry provenance 他）

- **telemetry provenance（上流 confirmed: L7-193/199/200/201）** = 実 gap。
  LOCAL の `test_runs` / `guardrail_decisions` / `skill_invocations` は projection-only（session-log 由来の
  runtime-hook provenance を自動生成しない）で、doctor は `model_runs` runtime overlay を自動更新しない
  （primitive `loadRuntimeSessionUsage`/`projectTokenUsage` は存在するが doctor 未配線）。
  ただし LOCAL は既に `src/runtime/upstream-adoption.ts` `classifyTelemetryProvenance` と
  `runtime_verification_events`（superset 設計）を持ち **未配線**。→ 上流 diff の bulk import ではなく、
  LOCAL 既存 session-log parser で 4 派生を配線する小 PLAN が HELIX 式。
- **team prompt provider routing（上流 commit 00a0cd7）** = trivial・確認済。
  LOCAL `TeamModelSelection` は `provider` を持つが `src/team/run.ts buildMemberPrompt()` が emit しない
  （1 行追加で解消）。
- **distribution asset projection（L7-190）** = ALREADY-HAVE。
- **上流 park 済み draft（L7-189/191/195/196/197/198）** = 上流自身が未実装（draft / version_target: future）。
  移植すべき src なし。**idea のみ**を HELIX 独自 PLAN として起こす対象（特に L7-189 cross-runtime shared memory は
  HELIX hybrid 設計に直結、L7-195 は下記セキュリティ確認）。

## 4. セキュリティ確認（LOCAL 直接検証、2026-07-04）

上流 L7-195（Security-HIGH、上流自身は park）の観点を LOCAL で直接検証した。

- `src/schema/team.ts:40` `modelOverrideSchema` は **prefix-only** `/^(gpt-|claude-|codex-)/`＋family alias で、
  prefix 以降の任意文字を許容。
- `src/runtime/adapter.ts:239` は **`shell: true`**（コメント L45「shell:true の cmd.exe 文字列へ畳む」）。
- → model override 文字列が sanitize されずに shell:true 起動へ到達する data-flow があれば **injection 面**。
  上流が HIGH 分類した懸念が **LOCAL にも構造的に存在**する可能性。

**扱い**: これは安全境界（コマンド実行）に関わるため、CLAUDE.md のエスカレーション規則に従い
**PO へ escalate（要 security-audit）**。data-flow の実到達性を確定させ、model override を allowlist /
strict pattern 化し、shell:true を排するか引数を厳格 escape する対応を、確認後に別 PLAN で行う。
本 audit 時点では **修正未実施**（推測で潰さない）。

その他確認:
- `AGENT_TOOL_NAME = "Agent"`（`src/runtime/agent-guard-policy.ts:25`、単数）。consumer 標準 Claude Code が
  emit する `"Task"` を拾わない portability gap（本 dogfood repo は `"Agent"` 運用のため自リポでは無害）。
- CODEOWNERS は LOCAL `src/cli.ts:4759` が `teamCount>0 && teamCount<3` を明示 error 化しており、
  上流が指摘した「0-team 素通り」バグは該当が薄い（LOCAL 側で別途ガード済）。

## 5. 採否台帳（優先度順）

### Tier 1 — HELIX 自身の carry を閉じる（取り込み適合・最優先）

1. **D-CONTRACT DSL**（`routing-contracts.ts` に `validateDContractDsl`＋2 zod schema を追加、
   `recommendedCommandV1Schema` 再利用、mode-routing.yaml / gate-checks.yaml を LOCAL の modes・G1-G14 へ接地）。
   低リスク・決定論・escalation 不要。`if-detail.md §8` / IMP-073 carry を閉じる。
2. **G9 system-workflow gate**（`PLAN-L7-130`/`PLAN-L9-00` 配下の子 PLAN。verification-profile 経由で配線。
   evidence schema を LOCAL の L9 test-design に接地）。
3. **G10 UX-workflow gate**（`PLAN-L10-00` 配下。G9 と共有 helper `gN-evidence-manifest` を切り出し重複排除。
   UXV item は advisor-fable evidence と紐付け）。
4. **L14 close-audit engine**（parser/evidence-check は再利用、**checklist は HELIX charter へ再設計**＝
   pmo-sonnet 判断 gate を先に通す）。

### Tier 2 — 新規 capability（HELIX 適合・fresh TS）

5. **context/doc-router.ts**（canonical doc の section-index 動的注入）。**high value**：CLAUDE.md が自称する
   pillar 4「動的コンテキスト/スキル注入」に直結、fail-open、安全境界に非接触。強い候補。
6. **skill-engine/scaffold.ts**（skill authoring generator。LOCAL は recommend のみで scaffold 無し。
   `skill-assignment.ts` の VALID_* 定数を再利用でき配線安価）。
7. **telemetry provenance 配線**（`classifyTelemetryProvenance`＋session-log parser で test_runs/
   guardrail_decisions/skill_invocations の runtime-hook 派生＋doctor の model_runs overlay を配線）。
8. **team prompt provider routing**（`buildMemberPrompt()` に `provider:` 1 行）。trivial。
9. **setup/update-check.ts**（advisory な自己バージョン鮮度チェック。配布 surface に触れるため軽 escalation）。

### Tier 3 — 要確認 / セキュリティ follow-up（blind-adopt しない）

- **model-override injection（§4）** — PO escalate 済み。security-audit で data-flow 確定後に別 PLAN。
- `lint/{github-ci-policy, personal-path, toolchain-pin}.ts` — 採用前に LOCAL 等価物の確認 grep。
- Agent/Task matcher portability — consumer 配布時の gap。distribution PLAN で扱う。
- `state-db/{runtime-projections, skill-projections}.ts` — `projection-writer.ts` との直接 diff で refactor/gap 判定。

### Tier 4 — 取り込まない

- 上流 `doctor/*`・`cli/*` の分割（refactor-only、LOCAL monolith が capability 保持）。
- config/adapter（LOCAL 先行）。distribution asset projection（already-have）。
- 上流 park 済み draft のうち src の無いもの（idea のみ、HELIX 独自 PLAN で起こす）。
- schema/mode-catalog・route-map・secret・branch-protection・advisor-policy（already-have）。

## 6. 実施上の制約（重要）

本 audit 時点で **作業ツリーに約 542 ファイル・±12k 行の未コミット変更**（docs 日本語化＋src/tests の
実ロジック変更）が存在し、ブランチ `codex/helix-l3-pillar-descent` 上で **Codex が大規模 in-flight 作業を継続中**。
hybrid 規則（foreign 未コミット変更＝相手ランタイムの正規作業、触れない・退行させない、基準点は HEAD）に従い、
**Tier 1/2 のコード実装は foreign 作業の着地後に、PLAN 経由で追って行う**。本 audit は additive な新規
governance 文書として、取り込み判断の正本かつ後続 PLAN の seed とする。

## 7. 次アクション

1. 本 audit を IMP backlog / roadmap の seed とし、Tier 1 から PLAN 起票（D-CONTRACT DSL を先頭）。
2. §4 の model-override injection を security-audit へ回す（PO escalation 済み）。
3. L14 checklist 再設計を pmo-sonnet 判断 gate に載せる。
4. Codex in-flight 作業の着地を確認後、Tier 1/2 を harness workflow（plan→pair-freeze→implement→
   trace-freeze→review→accept）で実装する。
</content>
</invoke>
