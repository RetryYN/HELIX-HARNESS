---
plan_id: PLAN-L7-410-docs-secret-scan-gate
title: "PLAN-L7-410 (troubleshoot): docs / runtime state 面の secret-scan gate — 「secrets を書かない」安全境界の docs 面 enforcement 欠落を fail-close"
kind: troubleshoot
layer: L7
drive: be
status: confirmed
route_mode: incident
entry_signals:
  - "po_directive:2026-07-11「OKそれで」— 非衝突レーン提案（secret-scan lint を次に着手）への進行承認。CLAUDE.md 安全境界「rules、docs、examples、audit evidence に API keys、secrets、PII、credentials を書かない」が DB/audit 面（SECRET_PATTERN、PLAN-L7-52 I-1）でのみ機械強制され、docs / .helix runtime state 面に scanner が無い欠落を、上流 UT-TDD PR#25（src/lint/secret-scan.ts、採用台帳 2026-07-11 §3.2「高」）の概念採取で是正"
created: 2026-07-11
updated: 2026-07-11
backprop_decision: not_required
backprop_decision_reason: "宣言済み安全境界の enforcement 欠落修正（読み取り専用 scanner の追加 + doctor 配線）。SECRET_PATTERN の単一正本地位（src/state-db、PLAN-L7-52）と既存 DB/audit 面ガードは不変。上位 contract を変えない。"
owner: Claude (Fable)
parent_design: docs/plans/PLAN-L7-52-l7-completion-audit-closure.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: aim
    slot_label: "AIM — docs 面 secret 露出の incident 判定（宣言済み境界の enforcement 欠落）と誤検知許容度の意思決定"
  - role: se
    slot_label: "SE — analyzeSecretScan 純関数 + loader 分離 + doctor 配線 + 決定論 oracle"
  - role: tl
    slot_label: "TL — SECRET_PATTERN 正本再利用・allow marker 境界・実 repo false positive 0 のレビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-410-docs-secret-scan-gate.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/secret-scan.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/secret-scan.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-52-l7-completion-audit-closure.md
  references:
    - docs/governance/handover-retirement-memory-audit-2026-07-11.md
    - CLAUDE.md
review_evidence:
  - reviewer: code-reviewer (claude-sonnet-5)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T04:12:30+09:00"
    tests_green_at: "2026-07-11T04:10:36+09:00"
    verdict: approve_after_fixes
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "5 軸レビュー verdict=approve_after_fixes。Critical なし。Important 2 件を是正済み: (1) ALLOW_LINE_PATTERN の一般語（example/fake/sha256:）を除外し、意図的注記の明示的合図語（dummy/placeholder/redacted/fixture/not-a-secret）のみに限定（説明文と実 secret の同一行同居の見逃しを縮小、残存 false-negative は §2 に既知トレードオフとして記録）、(2) violation message に誤検知時の運用ガイド（allow marker 追記手順）と実 secret 時の revoke 指示を追加。Minor 2 件: generates への source/test 登録（confirm 時に実施済み）、adapter 設定ファイルへの走査拡張余地（§2 に将来 PLAN として記録）。是正後 U-SSCAN-001..004 再 green（004 = 実 repo regression、narrowed allow で violations=0 を再実測）。SECRET_PATTERN 単一正本の再利用・lint 共通様式・ADR-001 整合はレビューで確認済み。"
    green_commands:
      - kind: unit_test
        command: "bunx vitest run tests/secret-scan.test.ts --project fast"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T04:10:36+09:00"
        evidence_path: tests/secret-scan.test.ts
        output_digest: "sha256:cbc47cc18a6c69cc2fca36b02338a2b2623eba032b0a5b55f0ba97d86c88379c"
---

# PLAN-L7-410 (troubleshoot): docs / runtime state 面の secret-scan gate

## 0. defect（実測 2026-07-11）

- CLAUDE.md 安全境界は「rules、docs、examples、audit evidence に API keys、secrets、PII、
  credentials を書かない」と宣言するが、機械強制は DB / audit 面に限られる:
  `SECRET_PATTERN`（`src/state-db/index.ts`、PLAN-L7-52 I-1 で単一正本化）を projection-writer、
  guardrail ledger、search index、`src/audit/quality.ts` が共有するのみ。
- **docs/ 配下と `.helix/` runtime state（audit / logs / memory）の Markdown/JSON/YAML には
  scanner が存在しない**。secrets を書いても doctor は green のまま通過する（enforcement 欠落）。
- 上流 UT-TDD PR#25（merge 59e81150、`src/lint/secret-scan.ts`、採用台帳 §3.2 価値「高」）が
  同型欠落を docs secret scan gate で解決済み。ADR-001 に従い概念のみ採取して TS/Bun で
  local へ再構成する（read-only 参照、code copy ではなく local SECRET_PATTERN 正本と
  lint 共通様式〔純関数 + loader 分離〕に合わせて再実装）。

## 1. 是正内容

1. `src/lint/secret-scan.ts` 新設（lint 共通様式: 純関数 `analyzeSecretScan` + I/O loader
   `loadSecretScanArtifacts` + `secretScanMessages` を分離）。
   - パターン: local `SECRET_PATTERN`（narrow token 正本、再定義しない）に加え、
     aws-access-key / github-token（広域 prefix）/ private-key-block / authorization-bearer /
     secret-assignment の広域 marker を lint 側で追加。
   - allow marker: `dummy` / `placeholder` / `redacted` / `fixture` / `not-a-secret` の
     明示的合図語を含む行は除外（設計 doc の redacted 例示を許容し self-trigger を防ぐ。
     `example` / `fake` 等の一般語は review 所見により不採用 — 説明文と実 secret の
     同一行同居を見逃すため）。
2. 走査対象: `docs/`（.md/.json/.yaml/.yml）、`.helix/` 配下の audit / logs / memory /
   handover（.md/.json/.jsonl）、ルート文書（README.md / CLAUDE.md / AGENTS.md /
   .claude/CLAUDE.md）。runtime state は generated だが audit evidence として
   track され得るため対象に含める。
3. doctor 配線: `checkSecretScan` を `src/doctor/index.ts` へ追加し、hard gate（ok 連鎖 +
   messages）へ組み込む。lint-wiring meta-gate が到達可能性を fail-close で検査する
   （DEFERRED 登録はしない = 配線必須）。
4. 検証判定（tests/secret-scan.test.ts、U-SSCAN oracle）:
   - U-SSCAN-001: 実 secret 様 token（narrow/aws/github/private-key/bearer/assignment 各 marker）を
     含む artifact が violation として path/line/marker 付きで報告される。
   - U-SSCAN-002: allow marker 行（redacted 例示等）と語中部分一致（`task-`/`risk-` 等、
     SECRET_PATTERN の語境界仕様）は violation にならない。
   - U-SSCAN-003: clean artifact 集合は ok=true、messages は OK 1 行。
   - U-SSCAN-004: 実 repo regression — `loadSecretScanArtifacts(repoRoot)` を実走して
     violations=0（false positive 0 の機械的裏付け。prose claim ではなく gate run）。

## 2. 対象外

- `SECRET_PATTERN` 本体の変更（PLAN-L7-52 の単一正本を再利用、二重定義しない）。
- src/ コード面の secret 検査（Biome / review 経路の責務。本 gate は docs / runtime state 面）。
- PII / license 検査（secret token 検出と誤検知特性が異なるため別 PLAN で扱う）。
- 上流の `.ut-tdd/` path 前提（local は `.helix/`。識別子 rename 凍結〔PLAN-M-02〕に従い
  `.helix` のまま配線）。
- 行単位 allow marker の残存 false-negative（allow 合図語と実 secret が同一行に同居する
  ケース）は既知のトレードオフとして受容する（review 所見 2026-07-11。合図語は意図的
  注記に限定した明示語のみで、一般語より発生確率が十分低い）。
- adapter 設定ファイル（例: Codex 側 config）への走査拡張は将来 PLAN の余地として残す
  （本 gate は repo 内 docs / runtime state 面に限定）。

## 3. スケジュール（schedule steps）

- step 1 (mode: serial): test-first（Red）— U-SSCAN-001..004 を tests/secret-scan.test.ts へ追加。
- step 2 (mode: serial): 実装（Green）— src/lint/secret-scan.ts + doctor 配線 →
  typecheck / Biome / targeted test green + `helix doctor` の secret-scan gate green（実 repo 0 件）。
- step 3 (mode: serial): レビュー（intra_runtime_subagent 以上）→ review_evidence 記録 →
  confirm（generates へ source/test を登録）。L8 test-design への U-SSCAN oracle route 追記は
  pair file の foreign 変更解消後に同期する。

## 4. 受入条件

- U-SSCAN-001..004 green（004 は実 repo regression で violations=0 を機械検証）。
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-410-docs-secret-scan-gate.md` green。
- lint-wiring meta-gate green（secret-scan が RUNTIME_ENTRYPOINTS から到達可能）。
- 既存 doctor gate 全体の非退行（doctor 実行で secret-scan 以外の結果が不変）。
