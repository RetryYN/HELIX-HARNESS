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
contract_failures: "自己発行S4／Claude comment未検証／期限切れ、偽failure、別HEAD、dirty implementation、高risk、dry-run実行、process再起動またはgeneration変更による再試行、二重lease、実行前後のHEAD／CI／DB drift、非canonical receipt、tool activity、strict JSON違反をfail-closeする"
tdd_red_required: true
red_at: "2026-08-04T09:47:00Z"
green_at: "2026-08-04T10:03:00Z"
mutation_oracle_evidence: "tests/independent-review-fallback.test.ts::U-IRF-001..008Bがfailure seal、HEAD、risk、lease、ACP protocol、認証failure分類、terminal response前process終了、permission/tool拒否、output exact schema、receipt binding除去でRedになる。追加oracleのmutation実測は3ラウンドに分かれる。(1) Kimi 1回目とFable指摘の修復ラウンド: U-IRF-003A/004D/004E/007Aに対しrisk導出の除去（自己申告のみへ退行）、S4有効期間上限の除去、HEAD単位attempt slot予約の除去、v3 receiptのlease実行窓束縛の除去を実行し、3 mutationで各1件Red、復元後18/18 green。(2) Kimi K3の修復ラウンド: U-IRF-003B/007Bに対しdiff header取りこぼしの黙殺への退行とvalidate側typeof検証の除去を実行し、2 mutationで各1件Red、復元後20/20 green。(3) Kimi K3最終ラウンド: build側typeof／空文字検査の除去で1件Red、復元後20/20 green。テスト総数はラウンド(2)で18から20へ増え、ラウンド(3)はU-IRF-007Bへ負ケースを追加したため20のまま"
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
  - { artifact_path: src/schema/index.ts, artifact_type: source_module }
  - { artifact_path: src/lint/review-evidence.ts, artifact_type: source_module }
  - { artifact_path: tests/review-evidence.test.ts, artifact_type: test_code }
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
    verdict: block
    scope: "HEAD 763baed0bffda7c7d2fe99e349a135dce79a3b33の旧境界に対する事前確認。後続security監査で手製v3 receipt、自己発行S4、dry-run再試行、dirty source実行を検出したため失効し、verdictをapproveからblockへ訂正した（機械可読verdictと散文の失効宣言が矛盾していたため、Claude収束reviewのB1として是正）。canonical reviewer receiptおよびmerge authorityの代替ではない。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/391#issuecomment-5181739458"
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
  - reviewer: "Kimi Code CLI (independent provider cross-review)"
    review_kind: cross_agent
    reviewed_at: "2026-08-05T13:05:00Z"
    tests_green_at: "2026-08-05T13:00:00Z"
    verdict: block
    worker_model: claude-opus-5
    reviewer_model: kimi-code/k3-256k
    scope: "PR #391 HEAD 08bbb7f48365e58049cf0c8642a971c15fe948b6のexact diffを、本PRのsandboxプリミティブ（bubblewrap隔離、ACP tool拒否、strict JSON契約）経由でKimiへ渡した独立クロスレビュー。verdict=block / 4 findings（risk自己申告、lease TOCTOU、S4有効期間無上限、lease時系列未拘束）。output_digest sha256:0af0955554abb251a06669b5cb037d8b3f3a888018a6dc367b6ed79cc8fd1dc6、policy_digest sha256:9eba246bb88e45888d5adbec98ab030d5fe0742dfe01fbb43b2ff2712c8f760b、session session_ad666de9-0457-44f5-8919-b506724ba684。S4 admissionもv3 receiptも発行しておらず、advisory入力としてのみ使用した。全findingはClaudeがコードに当てて実在を再確認し、lease TOCTOUの成立条件のみ並行実行時に限ると訂正した。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --configLoader runner --project fast tests/independent-review-fallback.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-05T13:00:00Z"
        evidence_path: tests/independent-review-fallback.test.ts
        output_digest: "sha256:97e08cb2865f8b1adbc698818707bfc144e62527352ce3a7904798f70f006f06"
  - reviewer: "Kimi Code CLI K3 (independent provider, remediation diff review)"
    review_kind: cross_agent
    reviewed_at: "2026-08-06T01:12:00Z"
    tests_green_at: "2026-08-06T01:10:00Z"
    verdict: block
    worker_model: claude-opus-5
    reviewer_model: kimi-code/k3-256k
    scope: "Fableがundraft条件に挙げた「修復差分そのものへの非Claude検証」。修復差分 08bbb7f4..90dfbeeb（65KB）のみを、本PRのsandboxプリミティブ（bubblewrap隔離、ACP client fs/terminal無効、MCP空集合、permission/tool activity拒否、strict JSON再検証）経由でKimi K3へ渡した。verdict=block / 2 findings（いずれもMedium）: K1=declared_author_runtimeの型検証欠落、K2=diff header fail-close分岐のoracle欠落。両件ともClaudeがコードに当てて実在を確認し、commit 867238dcで修復した。S4 admissionもv3 receiptも発行していない（advisory入力のみ）。output_digest sha256:235e9f8f6d5bbacb94f5b2acc43aaa68f97954e03dc4a446e56f939366511b69、findings_digest sha256:9c89836ec2bf56fe0d69e2a30640db914ee18f1781ac1807d4a601b0ae4b64c2、policy_digest sha256:9eba246bb88e45888d5adbec98ab030d5fe0742dfe01fbb43b2ff2712c8f760b、session session_081f9f14-e635-4ff9-8066-a0fc9d29aef6。requested modelはACP transcriptで一致強制されるためK2.7等へのsilent downgradeは起きない。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --configLoader runner --project fast tests/independent-review-fallback.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-06T01:10:00Z"
        evidence_path: tests/independent-review-fallback.test.ts
        output_digest: "sha256:ffb4741ecb92dc0ffc598a12368777acc717d5e7632e90b03530af808858e6a1"
  - reviewer: "Kimi Code CLI K3 (independent provider, final HEAD review)"
    review_kind: cross_agent
    reviewed_at: "2026-08-06T18:05:00Z"
    tests_green_at: "2026-08-06T18:03:00Z"
    verdict: block
    worker_model: claude-opus-5
    reviewer_model: kimi-code/k3-256k
    scope: "HEAD c4528f11の最終差分 90dfbeeb..c4528f11 を、本PRのsandboxプリミティブ経由でKimi K3へ渡した独立クロスレビュー。verdict=block / 3 findings: High=review_evidence digestの遡及書換え（HELIX-IRF-EVIDENCE-REWRITE）、Medium=frontmatter mutation_oracle_evidenceと本文の不整合（HELIX-IRF-EVIDENCE-DIVERGED）、Medium=U-IRF-007Bのtest設計がbuild側typeof検査を実装より広く主張（HELIX-IRF-DOC-IMPL-GAP）。3件ともClaudeが実在を確認し、digest復元・frontmatter再記載・build側型検査追加とbuild負ケース追加で修復した。output_digest sha256:b782ac2855ec2ea2822aebb015172dbe3924596b35a3171d317a90c8ee9a6253、findings_digest sha256:ad9b28f18291526852dc851ab62f15eb90e484a9215953573acc76c4235dd8f2、policy_digest sha256:9eba246bb88e45888d5adbec98ab030d5fe0742dfe01fbb43b2ff2712c8f760b、session session_0006bf6c-8c2b-431b-a3bb-e2f8b9c948b3。S4 admissionもv3 receiptも発行していない（advisory入力のみ）。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --configLoader runner --project fast tests/independent-review-fallback.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-06T18:03:00Z"
        evidence_path: tests/independent-review-fallback.test.ts
        output_digest: "sha256:d9c0a54aed7527245fc3efa70dcd9aad5620e713ea63d1cacbb28c1403b79878"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-08-06T18:03:00Z"
        evidence_path: tsconfig.json
        output_digest: "sha256:290e679c492d7c229373061b313ab332394da783b08c9eff85bbb81275f96afc"
      - kind: lint
        command: "npx --no-install biome check src/runtime/independent-review-fallback.ts tests/independent-review-fallback.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-06T18:03:00Z"
        evidence_path: src/runtime/independent-review-fallback.ts
        output_digest: "sha256:261f9fcbfbf9fe5bfed0f60625962bd9876d7447b608474281d275a9dfbb405c"
  - reviewer: "Fable advisor (最上位セカンドオピニオン、advisory-only)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-05T14:40:00Z"
    tests_green_at: "2026-08-05T14:20:00Z"
    verdict: approve_after_fixes
    worker_model: claude-opus-5
    reviewer_model: claude-fable-5
    scope: "HEAD d78ce3c8に対する5軸レビュー。PLAN記載と同一commandで18/18 greenを独立再現し、advisory-onlyがevaluateProviderNeutralReviewMergeの構造的恒偽で機械担保されていること、merge時点ではS4 admission未発行のため機能が休眠であることを確認。条件付き賛成として、H1（diff --git header取りこぼしの黙殺による過小分類）とH2（author_runtimeの無検証ハードコード）の修正をundraft条件に挙げた。両件は本PLAN同一PRで修正済み（U-IRF-003A拡張・U-IRF-007B）。残リスクとしてkimi binaryのsupply-chain pin不在、packet経由のprompt injectionによるfalse approve（advisory-onlyでbound）、S4 benchmark evidenceが実行検証でなくattestationである点を記録。真の不可逆境界はmergeではなく初回S4 admission発行であり、そこで再評価する。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --configLoader runner --project fast tests/independent-review-fallback.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-05T14:20:00Z"
        evidence_path: tests/independent-review-fallback.test.ts
        output_digest: "sha256:4606940c957ab703f346fda11d021a55ea5257af5870ca751101a4ad588d3e06"
  - reviewer: "Claude Code exact-HEAD convergence review (remediation author)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-05T14:25:00Z"
    tests_green_at: "2026-08-05T14:20:00Z"
    verdict: approve_after_fixes
    worker_model: claude-opus-5
    reviewer_model: claude-opus-5
    scope: "Codexが週次上限で停止したためPO指示によりClaudeがB1〜B5の修復を実装し、同一HEADで検証した。本entryはcross-runtime独立reviewではない（実装者と検証者が同一runtime・同一model）。独立入力はKimiクロスレビュー（別entry、verdict=block）とFable advisorの助言であり、いずれもmerge authorityではない。追加oracle U-IRF-003A/004D/004E/007Aは、S4有効期間上限・lease attempt slot・v3 receiptのlease実行窓束縛をそれぞれ除去する3 mutationで各1件Redになることを実測し、復元後18/18 greenを確認した。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --configLoader runner --project fast tests/independent-review-fallback.test.ts tests/digest.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-05T14:20:00Z"
        evidence_path: tests/independent-review-fallback.test.ts
        output_digest: "sha256:4606940c957ab703f346fda11d021a55ea5257af5870ca751101a4ad588d3e06"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-08-05T14:20:00Z"
        evidence_path: tsconfig.json
        output_digest: "sha256:290e679c492d7c229373061b313ab332394da783b08c9eff85bbb81275f96afc"
      - kind: lint
        command: "npx --no-install biome check src/runtime/independent-review-fallback.ts src/cli/commands/review-fallback.ts tests/independent-review-fallback.test.ts config/digest-canonicalization-inventory.json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-05T14:20:00Z"
        evidence_path: src/runtime/independent-review-fallback.ts
        output_digest: "sha256:b633ae16d46bb7017d98101992fc9916bbefa0a2be783d2e9fb49b7fea01423d"
---

# 独立レビュー・フォールバックRecovery

Claude Codeを正規reviewerとする。quota、unavailable、claim timeoutを同一HEADの封印済みfailureとして確認した場合だけ、低・中riskのPR収束reviewをKimiへ切り替える。次generationではfailure evidenceを継承せずClaudeを再び主系にする。

Kimiへrepository、`.helix`、DB、project credentialをmountしない。raw `kimi -p`を禁止し、ACP client capabilityのfilesystem／terminalをfalse、MCPを空集合に固定する。permission／reverse RPC／tool updateをfail-closeし、bounded packetのstrict JSONをNode側で再検証する。provider transport credentialはscratchへcopyし、host auth stateをworkerから直接変更させない。

本PR自身をKimiで自己admissionしない。PLANの技術確認にはexact-HEAD intra-runtime reviewを記録できるが、Claude復旧後のcanonical独立reviewが得られるまでPRを`draft`とし、merge authorityへ接続しない。

公開経路は`helix github pr-review-fallback`とする。Claude失敗理由や任意packetの手入力は受けず、GitHub current HEADからbounded packetを生成し、command自身のbounded probeでquota／unavailable／timeoutを封印する。起動前にcanonical Claude v2 receiptへ束縛した期限付きS4 admission、clean worktree、current HEADのgreen CI／DBを要求する。dry-runはKimiを起動しない。生成したv3 receiptはcanonical runtime pathとadmission provenanceを再検証してもadvisoryに限定し、署名付きprovider attestationが無い状態で既存`pr-merge-reviewed`のmerge authorityに昇格しない。

S4発行面は`helix github pr-review-fallback-admission`とし、実ファイルの同一implementation HEAD、5 benchmark case／4 negative mutation exact set、期待結果、canonical Claude v2 receipt、有効期限を検証して封印する。Claude receiptはGitHub commentを再取得し、v2 marker、PR、HEAD、CI、DB、最終receipt digestを照合する。文字列だけのClaude指定、自己整合JSONだけのreceipt、PO自己bootstrap、Kimi自己admission、HEAD不一致、comment改変、digest省略を拒否する。receipt発行だけではKimiを実行せず、fallback commandが後段で期限とexact task/riskを再検証する。

## Claude収束reviewによる境界修復（2026-08-05）

Codexが週次上限で停止したため、PO指示によりClaudeが収束まで担当した。Claude exact-HEAD review
（PR #391 HEAD `08bbb7f4`）とKimiによる独立クロスレビューで検出した5件を修復した。

- **B1**: `review_evidence`のTera entryが、散文で「失効」と述べながら機械可読な`verdict`はapproveのままで、
  gateからは有効なapproveとして読めていた。verdictをblockへ訂正し、失効理由をentry内に明記した。
- **B2**: `--risk`が呼び出し側の自己申告のみで、`--risk low`を渡せばsecurity／credential／PII／release系のPRでも
  fallback経路に乗り、exact diffがthird-party providerへegressし得た。`deriveReviewRiskClass` /
  `admitDeclaredReviewRisk`を追加し、実diffのpath集合からrisk classを導出して過小申告と非admitted riskを
  fail-closeする。L6設計が既に掲げていた「high／critical taskはadmitしない」をrouterで強制する。
- **B3**: S4 admissionの有効期間に上限が無く、発行側が任意の遠い`expires_at`を置けた。24時間の上限を
  buildとvalidateの双方で強制する。
- **B4**: leaseの`expires_at`が発行後に一切参照されず、receiptにも時系列拘束が無かった。
  `lease_issued_at` / `lease_expires_at`をv3 payloadへ載せ、
  `observed_at ≤ lease.issued_at ≤ reviewed_at ≤ lease.expires_at`を強制して再検証可能にした。
- **B5**: lease一意性が`.json`走査に依存し、generationがファイル名digestへ入るため並行実行でTOCTOUがあった。
  HEAD単位のattempt slotを`O_EXCL`で先に確保する。

B2の導出規則により、**本PR自身の変更path（`src/lint/`配下、`review`／`admission`／`merge`を含むpath）は
highへ分類される**。すなわち本fallback経路は本PR自身をreviewできない。これはL6 §3 Bootstrapの
「本設計を含むPR自身のKimi判定をadmission根拠にしない」と機械的に整合する。

Kimi（`kimi-code/k3-256k`）へは、本PRのsandboxプリミティブをそのまま使い、bubblewrap隔離・ACP tool拒否・
strict JSON契約の下でexact diffを渡してクロスレビューさせた。S4 admissionは発行しておらず、
v3 receiptも発行していない（advisory入力としてのみ使用）。

### Fable advisorの指摘による追加修復

- **H1**: `diff --git`行の取りこぼしを黙って読み飛ばしていた。gitは`core.quotePath`既定で空白・非ASCII pathを
  quoteするため、該当fileがrisk導出から漏れて過小分類になり得た。header行を1行でも解釈できなければ
  `REVIEW_FALLBACK_RISK_UNCLASSIFIABLE`でfail-closeする。
- **H2**: v3 receiptの`author_runtime`が`"codex"`固定で、実authorを何も検証せずreceiptへ刻んでいた。
  `declared_author_runtime`へ改名して自己申告であることをfield名で明示し、強制するのは
  reviewer_runtimeとの相異（独立性）と非空のみとした。
- **H3**: `.claude/`配下と`CLAUDE.md`／`AGENTS.md`はruntime authority surfaceだがlow/mediumへ落ちていた。
  prefixとexactでhighへ分類する。

Fableの残り指摘（kimi binaryのsupply-chain pin不在、prompt injectionによるfalse approve、
S4 benchmark evidenceがattestationである点）はいずれもadvisory-onlyでboundされており、
初回S4 admission発行時に再評価する残リスクとして記録する。

### Kimi再走の状況

修復後HEADに対するKimi advisory再走は`KIMI_REVIEW_AUTH_SURFACE_UNRESOLVED`で2回とも失敗した
（同日先行の`08bbb7f4`に対する実行は成功しており、provider側のauth期限切れと判断）。
したがって修復差分そのものに対する非Claude検証は未取得であり、この点はPRコメントに明記する。

### cross_agent provider 認識の拡張

`modelProviderFromId`はclaudeとcodexしか認識せず、Kimiを`unknown`として`cross_agent`を拒否していた。
本PLANはKimiを独立review providerとして admit するものであり、cross_agentの本質は
「別provider・別model family」であってclaude/codexの2択に固定する理由が無いため、
`kimi`／`moonshot`プレフィックスを第三のproviderとして認識させる。
これによりKimi cross-review entryがIMP-076 gateを正しく通る。

### Kimi K3 独立検証による追加修復

Fableがundraft条件に挙げた「修復差分そのものへの非Claude検証」を、修復差分（`08bbb7f4..90dfbeeb`）を
Kimi Code CLI（`kimi-code/k3-256k`）へ渡して取得した。Medium 2件を検出し、いずれもClaudeがコードに
当てて実在を確認したうえで`867238dc`で修復した。

- **K1**: H2の修復で型検証が失われた。`declared_author_runtime`が非文字列（例: 数値42）の場合、
  `.length`がundefinedとなり`=== 0`もreviewer_runtimeとの相異判定も素通りし、永続receiptが
  validateを通過し得た。旧`!== "codex"`は非文字列を暗黙に拒否していた。`typeof !== "string"`を明示。
- **K2**: H1の修復（diff header取りこぼしのfail-close）にoracleが無く、regexを素の読み飛ばしへ
  退行させるmutationでも全テストがgreenのままだった。解析ロジックを`parseChangedPathsFromDiff`
  として純関数へ切り出し、U-IRF-003Bで直接pinした。

2件のmutation（型検証除去、header取りこぼしの黙殺へ退行）でそれぞれ1件Redになることを実測し、
復元後20/20 greenを確認した。

### provider認証失効の原因訂正（2026-08-06）

Kimiの`Authentication required`再発について、当初「sandboxのcredential scratch copyがrefresh token
ローテーションを取りこぼし、host tokenを無効化した」と推定し設計へ記載したが、これを取り下げる。

host `credentials/kimi-code.json`を検査したところ、内容は「無効化された旧token」ではなく
`access_token`／`refresh_token`が空文字、`expires_at`／`expires_in`が0であった。mtimeは
harnessがTTY非対応環境で起動して途中で打ち切った`kimi login`の時刻と一致する。すなわち現在の
未認証状態は、中断されたdevice-code flowがcredentialを空で書き戻したことによる。

- **確定**: TTY無しで`kimi login`を起動して中断するとcredentialが空になる。以後harnessから
  `kimi login`を起動しない。host所有者がTTY上で中断せず実行する。
- **未解明**: 中断loginより前（credentialがloginから無変更だった時点）に発生した失効。
  ローテーション取りこぼし説は可能性として残るが立証されていない。
- **設計**: scratch copyがrotation後のtokenを捨てる構造自体は実在するため、理論上の限界として
  記載を残す。実在判定はsandbox実行前後のstaged／host digest比較で行い、実在した場合のみ
  Node境界で書き戻す（既存path・regular file・size上限・JSON妥当性を満たす場合に限定し、
  before/after digestをaudit evidenceへ残す）。初回S4 admission発行前に完了させる。

### review_evidence digestの遡及書換えの訂正（2026-08-06）

Kimi K3の最終ラウンド（HEAD `c4528f11`）がHighとして指摘し、実在を確認した。commit `bc7318ea`で
2026-08-05T14:25:00Z／14:40:00Zのreview entryの`output_digest`を、当時の実測値
（`sha256:4606940c…`／`sha256:b633ae16…`）から、その後のtest追加を含む新しいrunの値
（`sha256:ffb4741e…`／`sha256:0917a1b8…`）へ書き換えていた。過去entryが当時存在し得なかった
digestを持つことになり、evidence recordが実測を反映しなくなっていた。当該digestを実測当時の値へ
復元した。

`green-command-digest` gateはこの書換えを強制していない。同gateは「64桁の過去digestが後続編集後の
`evidence_path`実hashと異なること自体は、過去review evidenceの書き換えを強制しないためhard failureに
しない」と明示している。書換えはgate要求ではなく編集判断の誤りであった。

構造的な誘因として、`evidence_path`がrun logではなくmutableなsource file
（例: `tests/independent-review-fallback.test.ts`）を指しており、`output_digest`がrun出力ではなく
file digestになっている点がある。fileが変わるたび全過去entryのdigestがstaleになり、refreshへの
圧力が生まれる。run単位のimmutable evidence fileへ移す是正はPLAN範囲外のため、Issueとして分離する。

### Kimi K3最終ラウンド（HEAD `c4528f11`、2026-08-06）

差分`90dfbeeb..c4528f11`をsandbox経由でKimi K3へ渡し、verdict=block / 3 findingsを得た。3件とも
実在を確認して修復した。

- **High（HELIX-IRF-EVIDENCE-REWRITE）**: 上記のdigest遡及書換え。実測値へ復元した。
- **Medium（HELIX-IRF-EVIDENCE-DIVERGED）**: frontmatter `mutation_oracle_evidence`が
  「3 mutation／18-18 green」のままで、本文の「2 mutation／20-20 green」と食い違っていた。
  3ラウンド分の実測をラウンドごとに分けて記載し直した。
- **Medium（HELIX-IRF-DOC-IMPL-GAP）**: U-IRF-007Bのtest設計は非文字列をbuild／validate双方で
  拒否すると主張していたが、`typeof`検査はvalidateにしか無かった。`buildProviderNeutralReviewReceipt`
  へ型・空文字検査を追加し、U-IRF-007Bへbuild側の負ケースを追加した。除去mutationで1件Red、
  復元後20/20 greenを実測した。

### credential rotation計測の第1回結果（2026-08-06）

最終ラウンドのKimi実行に計測を同梱した（secret値は記録せず digest／mtime／sizeのみ）。

- host credential: 実行前後でdigest・mtimeとも不変（`4037f8be…`、size 1502）
- 実行時間: 108秒。`kimi login`直後で`expires_in`は900秒
- staged copyのpolling: **観測0件**。pollerが`<scratch>/credentials/`を見ていたが、実装は
  `<scratch>/provider-auth/credentials/`へstageしており、path誤りで捕捉できていない

したがってrotation取りこぼしの実在は**まだ判定できていない**。実行時間がtoken有効期間より短く
refresh自体が発生しなかった可能性も残る。判定はpath修正とtoken期限付近まで伸ばした実行で
やり直す。この判定は初回S4 admission発行の前提であり、本PLANのmerge条件ではない。
