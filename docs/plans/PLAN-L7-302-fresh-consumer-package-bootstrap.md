---
plan_id: PLAN-L7-302-fresh-consumer-package-bootstrap
title: "PLAN-L7-302: fresh consumer の package bootstrap と adapter prose ratchet"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-04
updated: 2026-07-04
backprop_decision: not_required
backprop_decision_reason: "HELIX project setup / consumer distribution surface の fail-close 強化。D-API/D-DB、認証/secret、外部 API apply、不可逆 migration、PLAN-M-02 cutover 実行は変更しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/setup-solo-team.md
pair_artifact: tests/setup.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: qa
    slot_label: "Rawls - fresh VSCode consumer setup 監査"
  - role: qa
    slot_label: "Newton - PLAN-M-02 / L14 autonomy boundary 監査"
  - role: tl
    slot_label: "TL - package bootstrap 実装"
generates:
  - artifact_path: docs/plans/PLAN-L7-302-fresh-consumer-package-bootstrap.md
    artifact_type: markdown_doc
  - artifact_path: AGENTS.md
    artifact_type: markdown_doc
  - artifact_path: CLAUDE.md
    artifact_type: markdown_doc
  - artifact_path: .claude/CLAUDE.md
    artifact_type: markdown_doc
  - artifact_path: package.json
    artifact_type: config
  - artifact_path: bun.lock
    artifact_type: config
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: src/setup/templates.ts
    artifact_type: source_module
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: tests/distribution-acceptance.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L6-function-design/setup-solo-team.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/design/harness/L6-function-design/setup-solo-team.md
  requires:
    - docs/design/harness/L6-function-design/setup-solo-team.md
    - docs/design/helix/L6-function-design/pillar-function-design.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-04T00:58:33+09:00"
    tests_green_at: "2026-07-04T00:58:33+09:00"
    verdict: approve
    scope: "Subagent 監査で、空の VS Code consumer repo に `helix setup project` を実行しても package.json / Bun lockfile が生成されず、生成済み VSCode tasks と CI が runnable にならない gap を確認した。本 PLAN は fresh/brownfield package bootstrap、consumer 側 runtime dependency 補完、root adapter prose の日本語 ratchet を閉じる。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/setup.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-04T00:58:33+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:340145eb16246dc70ac3e0d8bcd3946ddd18865a73c44262f5c77e5a036d9c2e"
      - kind: integration_test
        command: "bun test tests/distribution-acceptance.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-04T00:58:33+09:00"
        evidence_path: tests/distribution-acceptance.test.ts
        output_digest: "sha256:ad32e183c4b556ac8d052a774726dd721fcd84e191117b0712ce21b65cd5fd3c"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-04T00:58:33+09:00"
        evidence_path: package.json
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun test tests/design-language.test.ts tests/rule-drift.test.ts --timeout 300000"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-04T00:58:33+09:00"
        evidence_path: tests/design-language.test.ts
        output_digest: "sha256:7b857a8b67234920069a2085a9b782c1cd4775fbad167d70a644539506a62e2b"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-04T00:58:33+09:00"
        evidence_path: docs/plans/PLAN-L7-302-fresh-consumer-package-bootstrap.md
        output_digest: "sha256:7c4648c0434efaa75f95df1c8fe1c08d63838d13547796ca89d4f0ce54b50dff"
---

# PLAN-L7-302: fresh consumer の package bootstrap と adapter prose ratchet

## 目的

`helix setup project` を空の VS Code project に適用した直後、生成された VSCode task / CI command が `bun run helix ...` として実行可能になる状態まで閉じる。

## 問題

- setup は adapter / `.vscode` / `.helix` baseline を生成するが、fresh repo の `package.json` と `bun.lock` を生成していなかった。
- brownfield repo で `package.json` に `helix` dependency や必須 script を merge しても、lockfile を再生成しないため `bun install --frozen-lockfile` が落ち得た。
- 配布済み Pack tag は CLI runtime が import する `typescript` を transitive runtime dependency として解決できない。consumer 側 setup package surface に `typescript` を明示しないと既存 tag の `helix` 実行が壊れ得る。
- root adapter docs に英語 prose が残り、docs 日本語原則と design-language ratchet に対して不要な debt を残していた。

## Source 確認 (参照元確認)

- Bun 公式 docs: `bun install --frozen-lockfile` は lockfile を更新せず、`package.json` と lockfile の不一致を error にする。CI では lockfile commit が前提。
- Bun lockfile docs: Bun v1.2 以降の既定 (default) は text `bun.lock`。旧 project は `bun.lockb` を持ち得る。
- Bun runtime / script docs: `bun run <script>` は `package.json.scripts` を package-local command surface として解決する。
- VS Code 公式 docs: workspace tasks は `.vscode/tasks.json` の手動 shell task として定義できる。Workspace Trust は自動実行境界を持つため、setup は task 自動実行を有効化しない。
- OWASP WSTG stable docs: security review source は stable guide を参照し、setup package bootstrap は auth/secret/PII/remote apply を変更しない。

## 受入条件

- fresh consumer setup は `package.json`、`bun.lock`、`.vscode/tasks.json` を生成し、`consumerReadiness.ok=true` / `postSetupWorkflow.nextRoute=ready` を返す。
- generated `package.json` は `scripts.helix` / `typecheck` / `test`、`devDependencies.helix`、`devDependencies.typescript` を持つ。
- brownfield setup が package surface を merge した場合、`bun install --lockfile-only` を実行して lockfile を更新する。
- local package manifest は runtime import に必要な `typescript` を `dependencies` に置く。
- clean distribution acceptance は fresh consumer repo で setup / package / lockfile / local clean artifact link 後の command smoke を通す。
- root adapter docs の触った prose は日本語-first に寄せ、`helix` / `.helix` / adapter rule markers の機械識別子は維持する。

## 検証

- `bun test tests/setup.test.ts --timeout 300000`
- `bun test tests/distribution-acceptance.test.ts --timeout 300000`
- `bun run typecheck`
- `bun test tests/design-language.test.ts tests/rule-drift.test.ts --timeout 300000`
- `bun run src/cli.ts plan lint --gate governance`
- `bun run src/cli.ts doctor`
