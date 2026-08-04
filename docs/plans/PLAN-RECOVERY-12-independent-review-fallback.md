---
plan_id: PLAN-RECOVERY-12-independent-review-fallback
title: "PLAN-RECOVERY-12: independent review provider fallback"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals: ["po_directive:Claude quota時にKimiへ安全に切り替える"]
created: 2026-08-04
updated: 2026-08-05
owner: Codex / TL
github_issue_id: 390
engineering_discipline_required: true
behavior_contract_id: KIMI-REVIEW-FALLBACK-001
responsibility_owner: independent-review-fallback-router
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "canonical Claude v2 receiptに束縛したS4 admission、clean implementation tree、Claude failure evidence、current candidate HEAD、green CI、admitted task/risk classが一致する"
contract_postconditions: "Kimiは永続lease取得後にbounded packetだけをACP拒否型隔離でreviewし、canonical admission provenance付きadvisory receiptを返す。署名付き外部attestationが無いv3はmerge authorityにしない"
contract_invariants: "Claude主系、同一generation一lease、同一HEADのKimi attempt最大1回、次generationはClaudeへ復帰、Kimi自己admission禁止"
contract_failures: "自己発行S4／期限切れ、偽failure、別HEAD、dirty implementation、高risk、dry-run実行、process再起動またはgeneration変更による再試行、二重lease、実行前後のHEAD／CI／DB drift、非canonical receipt、tool activity、strict JSON違反をfail-closeする"
tdd_red_required: true
red_at: "2026-08-04T09:47:00Z"
green_at: "2026-08-04T10:03:00Z"
mutation_oracle_evidence: "tests/independent-review-fallback.test.ts::U-IRF-001..008Bがfailure seal、HEAD、risk、lease、ACP protocol、認証failure分類、terminal response前process終了、permission/tool拒否、output exact schema、receipt binding除去でRedになる"
complexity_effect: justified_positive
complexity_justification: "Claude待機による停止をprovider-neutralな一経路へ集約し、手動loopとprovider別merge分岐を減らす"
removal_trigger: "共通worker schedulerが同一fallback selection/lease/receipt契約を所有した時にrouterを統合する"
parent_design: docs/design/helix/L6-function-design/independent-review-fallback.md
pair_artifact: docs/test-design/helix/L8-independent-review-fallback-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — provider切替とlease実装" }
  - { role: qa, slot_label: "QA — 隔離、strict output、receipt検証" }
  - { role: tl, slot_label: "TL — bootstrap境界とFeature復帰監査" }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/independent-review-fallback.md, oracle_id: U-IRF-001, test_path: tests/independent-review-fallback.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/independent-review-fallback.md, oracle_id: U-IRF-008, test_path: tests/independent-review-fallback.test.ts }
generates:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/independent-review-fallback.md, artifact_type: design_doc }
  - { artifact_path: src/runtime/independent-review-fallback.ts, artifact_type: source_module }
  - { artifact_path: src/cli/commands/review-fallback.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/independent-review-fallback.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-506-worker-lifecycle-receipt.md
  blocks:
    - issue:390
review_evidence:
  - reviewer: Tera exact-HEAD review
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-05T01:18:15+09:00"
    tests_green_at: "2026-08-05T01:18:00+09:00"
    verdict: approve
    scope: "HEAD 763baed0bffda7c7d2fe99e349a135dce79a3b33の旧境界に対する事前確認。後続security監査で手製v3 receipt、自己発行S4、dry-run再試行、dirty source実行を検出したため失効。canonical reviewer receiptおよびmerge authorityの代替ではない。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/391#issuecomment-5181739458"
    worker_model: gpt-5.6-sol
    reviewer_model: gpt-5.6-terra
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/digest.test.ts tests/independent-review-fallback.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-05T01:18:00+09:00"
        evidence_path: tests/independent-review-fallback.test.ts
        output_digest: "sha256:bc30ec86acc341f72cc43703c4878966f98279a4e777f525fef91eb2867359a4"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-08-05T01:18:00+09:00"
        evidence_path: tsconfig.json
        output_digest: "sha256:290e679c492d7c229373061b313ab332394da783b08c9eff85bbb81275f96afc"
      - kind: lint
        command: "npx --no-install biome check config/digest-canonicalization-inventory.json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-05T01:18:00+09:00"
        evidence_path: config/digest-canonicalization-inventory.json
        output_digest: "sha256:9271217417e8175abeb21fe08a739c4e0d048bbfeb2bfe4f9cb8c66462a4160a"
---

# 独立レビュー・フォールバックRecovery

Claude Codeを正規reviewerとする。quota、unavailable、claim timeoutを同一HEADの封印済みfailureとして確認した場合だけ、低・中riskのPR収束reviewをKimiへ切り替える。次generationではfailure evidenceを継承せずClaudeを再び主系にする。

Kimiへrepository、`.helix`、DB、project credentialをmountしない。raw `kimi -p`を禁止し、ACP client capabilityのfilesystem／terminalをfalse、MCPを空集合に固定する。permission／reverse RPC／tool updateをfail-closeし、bounded packetのstrict JSONをNode側で再検証する。provider transport credentialはscratchへcopyし、host auth stateをworkerから直接変更させない。

本PR自身をKimiで自己admissionしない。PLANの技術確認にはexact-HEAD intra-runtime reviewを記録できるが、Claude復旧後のcanonical独立reviewが得られるまでPRを`draft`とし、merge authorityへ接続しない。

公開経路は`helix github pr-review-fallback`とする。Claude失敗理由や任意packetの手入力は受けず、GitHub current HEADからbounded packetを生成し、command自身のbounded probeでquota／unavailable／timeoutを封印する。起動前にcanonical Claude v2 receiptへ束縛した期限付きS4 admission、clean worktree、current HEADのgreen CI／DBを要求する。dry-runはKimiを起動しない。生成したv3 receiptはcanonical runtime pathとadmission provenanceを再検証してもadvisoryに限定し、署名付きprovider attestationが無い状態で既存`pr-merge-reviewed`のmerge authorityに昇格しない。

S4発行面は`helix github pr-review-fallback-admission`とし、実ファイルの同一implementation HEAD、5 benchmark case／4 negative mutation exact set、期待結果、canonical Claude v2 receipt、有効期限を検証して封印する。文字列だけのClaude指定、PO自己bootstrap、Kimi自己admission、HEAD不一致、digest省略を拒否する。receipt発行だけではKimiを実行せず、fallback commandが後段で期限とexact task/riskを再検証する。
