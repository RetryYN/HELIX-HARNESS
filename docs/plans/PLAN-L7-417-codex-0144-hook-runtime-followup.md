---
plan_id: PLAN-L7-417-codex-0144-hook-runtime-followup
title: "PLAN-L7-417: Codex 0.144 hook 追随の残債 — hook-quiet 出力・consumer template 追随・session start 遅延診断"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
route_mode: incident
entry_signals:
  - "po_directive:2026-07-11 /goal 環境正常化の残債。commit cb4085f5 (Codex 0.144 追随) の follow-up を PO が「プッシュして進めて」で承認。"
created: 2026-07-11
updated: 2026-07-11
owner: Claude
backprop_decision: not_required
backprop_decision_reason: "cb4085f5 と同じ developer-local runtime guard parity の残債処理。hook 出力規約 (Codex 0.144 が Stop/SubagentStop の非 JSON stdout を Failed 扱い) への CLI 側追随と consumer template の可搬化で、product 要求や runtime 利用者挙動の意味変更を行わない。"
agent_slots:
  - role: tl
    slot_label: "TL — hook-quiet 出力契約と consumer template 可搬性 (bash -c 排除) の設計判断"
  - role: aim
    slot_label: "AIM — troubleshoot 分類 + cb4085f5 コミットメッセージ errata (probe 仮説誤り) の訂正記録レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-417-codex-0144-hook-runtime-followup.md
    artifact_type: markdown_doc
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: .codex/hooks.json
    artifact_type: json_config
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: src/setup/templates.ts
    artifact_type: source_module
  - artifact_path: src/setup/template-markers.ts
    artifact_type: source_module
  - artifact_path: src/lint/codex-hook-adapter.ts
    artifact_type: source_module
  - artifact_path: src/lint/codex-hook-adapter-policy.ts
    artifact_type: source_module
  - artifact_path: docs/templates/adapter/.codex/hooks.json
    artifact_type: json_config
  - artifact_path: docs/governance/helix-objective-evidence-audit.md
    artifact_type: markdown_doc
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: tests/codex-hook-adapter.test.ts
    artifact_type: test_code
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires:
    - PLAN-L7-139-codex-hook-adapter
review_evidence:
  - reviewer: codex-cross-runtime
    review_kind: cross_agent
    reviewed_at: "2026-07-11T07:05:00+09:00"
    tests_green_at: "2026-07-11T07:05:00+09:00"
    verdict: fail
    scope: "1回目 (helix codex --role tl --execute): Important 2件 — (1) --quiet が codex-hook-adapter の必須契約でなく退行を doctor が検出できない、(2) SessionStart 90s が manifest hash 以外で拘束されない。Minor 1件 — generates と実変更範囲の不一致。全件を requiredTokens / minTimeoutSec / minTimeout 契約化と U-CXHOOK-016/017 追加、generates 追記で是正した。reviewer の off-task 編集 (docs/test-design/harness/L9-integration-test-design.md) は review-guard が検知し、本 PLAN の commit から除外して PLAN-L7-416 オーナー runtime の裁定に委ねた。"
    worker_model: claude-fable-5
    reviewer_model: gpt-5.6-terra
    green_commands:
      - kind: unit_test
        command: "bunx vitest run --project fast tests/codex-hook-adapter.test.ts tests/setup.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: tests/codex-hook-adapter.test.ts
        output_digest: "sha256:75544550534a4e42612ef821af89eac302210d4a839bf870f623739607aade57"
  - reviewer: codex-independent-reviewer
    review_kind: cross_agent
    reviewed_at: "2026-07-11T15:21:57Z"
    tests_green_at: "2026-07-11T15:20:54Z"
    verdict: pass
    scope: "PLAN-L7-417の是正後契約を現HEADで独立再レビューした。Stop/SubagentStopの--quiet必須、bash -c撤去、repo/consumer template/setup同期、codex-hook-adapter requiredTokens、SessionStart minTimeout>=90のfail-closeを、codex-hook-adapter/setup/cli-surfaceの実装とtargeted regressionで再確認した。summary/goal evidence surfaceにも退行なし。実機SubagentStop未観測とSessionStart遅延根因未解決はPLAN記載済みresidualであり、現sliceのacceptを妨げない。"
    worker_model: claude-fable-5
    reviewer_model: gpt-5.6
    green_commands:
      - kind: unit_test
        command: "bunx vitest run --project fast tests/codex-hook-adapter.test.ts tests/setup.test.ts tests/cli-surface.test.ts tests/summary-surface-audit.test.ts tests/goal-evidence-audit.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T15:20:54Z"
        evidence_path: tests/codex-hook-adapter.test.ts
        output_digest: "sha256:dc8c811a01c52bca92964b6803390b032789494114ce7894d288fe773de08dc9"
---

# PLAN-L7-417: Codex 0.144 hook 追随の残債

## 背景

commit `cb4085f5` (2026-07-11) で Codex CLI 0.124→0.144 大型アップデートへの hook 追随
(matcher canonical 名、`$comment`→`description`、SubagentStop 配線、hook trust 登録) を実施した。
本 PLAN はその残債 3 件を扱う。

## Slice A: hook-quiet 出力（`--quiet`）と bash -c 撤去

Codex 0.144 は Stop / SubagentStop hook の **非 JSON stdout を Failed 扱い**する
(SessionStart の stdout は context 注入として許容)。cb4085f5 では repo `.codex/hooks.json` の
Stop を `bash -c '... >/dev/null 2>&1'` で暫定回避したが、これは:

1. native Windows first-class 方針 (`.claude/CLAUDE.md` Guard 規則) と衝突する (bash 前提)。
2. consumer 配布 template (`helix session summary` 直呼び) に未反映で、consumer 環境の
   Codex 0.144 では Stop / SubagentStop hook が常に Failed になる。

対応: `helix session summary` / `helix hook subagent-stop` に `--quiet` option を追加し
(stdout の人間向け prose を抑止、stderr は許容)、repo hooks / consumer template / setup 契約
(`CONSUMER_CODEX_REQUIRED_HOOKS` は command 完全一致比較) を `--quiet` 付き command へ同期する。
bash -c ラッパは撤去する。

## Slice B: SessionStart hook 遅延の根因確定（診断・未解決）

### 実測 (2026-07-11、codex exec sandbox 内 hook)

| 条件 | 所要 |
|---|---|
| `bun src/cli.ts session start </dev/null` (session_id=helix-cli) | 1.8s |
| 同 payload をリポジトリ外の通常 shell で実行 | 1.6s |
| hook stdin 継承 (実 codex payload) | 19.9s〜21.8s |
| payload をファイルから stdin 供給 (EOF 保証) | **43.6s** |

- stdin の EOF 遅延ではない (`cat` は 0.003s で EOF 受領、ファイル供給でも遅い)。
- **実 codex session_id / transcript_path を含む payload を渡した時だけ** sandbox 内で
  20〜44s に劣化する。devnull (session_id=helix-cli) は速い。
- 暫定対策: `.codex/hooks.json` SessionStart timeout を 90s に設定 (観測最大 43.6s + 余裕)。
- 恒久対策は根因確定後に別 slice で実装する (候補: session_id 依存の side effect
  — `scanDanglingStops` / `surfaceTakeoverFeedbackToStdout` / feedback surface の DB query —
  を sandbox 環境でプロファイルして特定する)。

### errata: cb4085f5 コミットメッセージの誤診断の訂正

cb4085f5 の commit message は遅延根因を「sandbox 内 provider probe (`codex --version` /
`claude --version` spawn)」と記載したが、これは**未検証の仮説であり上記実測で棄却**された
(probe 仮説では devnull と payload 供給の差を説明できない)。push 済み履歴のため commit message
自体は書き換えず、本 PLAN を正誤記録とする (PLAN claim discipline、PLAN-L7-89)。

## Slice C: hook trust の運用制約（記録済み・実装なし）

`.codex/hooks.json` を編集するたび trusted_hash が失効し hooks が silent skip される
(harness memory `codex-0144-hook-trust-gating` に記録済み)。編集後の再 trust
(TUI startup review または app-server `config/batchWrite` hooks.state upsert) を運用手順とする。
機械化 (doctor gate で trust 状態を検査する等) は必要になった時点で別 PLAN。

## AC

- [x] `helix session summary --quiet` / `helix hook subagent-stop --quiet` が stdout を出さない
      (U-HOOKQUIET-001/002、既定動作は従来どおり)。
- [x] repo `.codex/hooks.json` から bash -c ラッパが消え、実機 codex exec で
      SessionStart/PreToolUse/PostToolUse/Stop が Completed (2026-07-11 再 trust 後に実測。
      SubagentStop は subagent 発火面が無く未観測、hook 配線と lint 契約で担保)。
- [x] consumer template / `CONSUMER_CODEX_REQUIRED_HOOKS` / manifest hash pin が同期。
- [x] `--quiet` 欠落と SessionStart timeout<90s の退行を `codex-hook-adapter` gate が fail-close
      する (U-CXHOOK-016/017、cross-review Important 対応: requiredTokens / minTimeoutSec を
      policy 契約化、consumer 契約は minTimeout で timeout 実値を検査)。
- [x] Slice B の実測表が本 PLAN に記録され、cb4085f5 の probe 仮説 errata が明記されている。
