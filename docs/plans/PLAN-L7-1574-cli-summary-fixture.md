---
plan_id: PLAN-L7-1574-cli-summary-fixture
title: "CLI summary検証の同一シナリオ準備を共有する"
kind: refactor
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
backprop_decision: not_required
backprop_decision_reason: "要求・runtime挙動・受入義務は変更しない。同一入力のCLI準備共有を既存L8へ記載し、既存3種review tierとdeadline契約に試験を整合させる。上流意味変更を検出した場合は本判定を撤回しReverseへ戻す。"
created: 2026-09-06
updated: 2026-09-06
owner: Codex / TL
github_issue_id: 1575
responsibility_owner: cli-surface-verification
behavior_contract_id: CURRENT-LOCATION-SUMMARY-TYPED-OUTPUT-001
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: none
contract_preconditions: "既存L6/L8 summary契約とU-CLSO-001..006を維持し、同一repository入力の逐次scenarioを使用する"
contract_postconditions: "text/JSON/summaryを各一回実起動し、全出力assertionと独立した欠落authority fixtureを検証する"
contract_invariants: "runtime挙動、default DB再構築、freshness、各oracle ID、独立review要件を変更しない"
contract_failures: "旧text、schema退行、欠落authorityの誤変換、review tierの不一致を検出する"
tdd_red_required: true
tdd_red_evidence: "変更前f880d297でもstatusのintra-runtime checklistをcross_agent扱いする既存oracleが1 failedとなることを再現した"
tdd_green_evidence: "07:01:10 JST開始のtests/cli-surface.test.ts全95件が199.22秒で成功。時刻は実行開始であり完了時刻ではない"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/cli-surface.test.ts U-CLSO-005/006: 旧textとschema v1を同時注入し各assertionがRED、復元後6件green。単一変異ごとの独立実験ではない"
complexity_effect: net_negative
complexity_justification: "既存7回のCLI起動を3回へ集約し、process間cacheや新runtimeを導入しない"
removal_trigger: "同一scenarioの出力契約が変更され共有不能となった場合、入力ごとのfixtureへ分離する"
entry_signals: [structural]
agent_slots:
  - { role: aim, slot_label: "AIM — 検証責務を保持" }
  - { role: tl, slot_label: "TL — 入力と寿命を限定" }
  - { role: se, slot_label: "SE — 重複準備を削減" }
  - { role: qa, slot_label: "QA — 反例と実測を比較" }
parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md
pair_artifact: docs/test-design/helix/L8-current-location-summary-typed-output-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-JRSTAT-001, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, oracle_id: U-CLSO-001, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, oracle_id: U-CLSO-002, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, oracle_id: U-CLSO-003, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, oracle_id: U-CLSO-004, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, oracle_id: U-CLSO-005, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, oracle_id: U-CLSO-006, test_path: tests/cli-surface.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REFACTOR
dependencies:
  requires: []
  references: ["issue:93", "issue:1575", PLAN-L7-672-current-location-summary-typed-output]
generates:
  - { artifact_path: docs/test-design/helix/L8-status-review-tier-projection.md, artifact_type: test_design }
  - { artifact_path: docs/plans/PLAN-L7-1574-cli-summary-fixture.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-surface-deadline-contract.test.ts, artifact_type: test_code }
  - { artifact_path: docs/test-design/helix/L8-current-location-summary-typed-output-unit-test-design.md, artifact_type: test_design }
review_evidence: []
---

# CLI検証の重複準備削減候補

外部挙動と検証義務を維持する構造改善として、registryのREFACTORへ束縛する。
初回CI run33994899695で検出されたbranchとPLANのkind不一致を是正した。
旧候補ID PLAN-RECOVERY-1574-cli-summary-fixtureは採番時の誤分類であり、実行identityには使わない。

現在はローカル実験段階。採番・独立レビュー・CI・main接合を経るまでは完成としない。
基準f880d297のU-CLSO-001〜006は6成功、112.80秒。実行条件はIssue #93へ記録した。

同一scenarioのtext/json/summaryをbeforeAllで各一度実起動し、5つの出力oracleへ渡す。
各assertionとID、欠落authorityの独立fixture、実際のdefault DB再構築を保持する。
fixtureは当該describeの実行寿命だけとし、process間・次回実行へのcacheを作らない。
runtimeのfreshness・default経路・必要な検証義務は変更しない。
schemaとtextを退行させた変異が失敗し、復元後に成功することを別途確認する。
局所実測だけでCI全体の高速化完了とは扱わない。

## 局所検証記録

### 独立レビューI-1の是正

beforeAllから終了statusのassertを除き、各oracleの既存status検査へ委ねる。
2026-09-06 08:58:23開始、修正後U-CLSO-001〜006は6成功、50.50秒。
08:59:54の一時変異では共有出力をstatus=1・診断文字列付きへ置換し、
対象001/003/004/005/006が各々assertionで失敗した（5 failed、対象skip 0）。
90 skippedは名前フィルタで選択していない別caseである。実CLI起動の成功証拠ではなく、
準備失敗が各caseへ伝播することの試験。変異は実行後に撤去した。
I-2はU-JRSTAT-001を採番し、既存L6 judgmentReviewPlanForModeと専用L8へ束縛した。
2026-09-06 09:03:46開始、U-JRSTAT-001は1成功、1.22秒。全1188 PLANのgovernance検査と
対象PLAN lintもexit 0。94 skippedは対象外のcaseである。
I-3は単一runtime変異を別実行した。09:05:19開始、`workflow_route_status`だけを削除すると
U-CLSO-001/004が2失敗（48.82秒）。復元後、`source_clock`だけを非nullへ変えると
09:06:14開始のU-CLSO-002が1失敗（0.89秒）。各実行の他caseは名前フィルタによるskipである。
変異を撤去し、`src/cli.ts`がHEADと一致することをhashで再確認後、正常6caseを再実行する。
両hashは `247708de...ab8cf8` で一致し、09:10:06開始の正常系は6成功、48.59秒。
I-2の束縛はレビュー方式を全て実行した証拠ではない。

2026-09-06 06:48:03 JST、候補で6成功、48.43秒。型検査exit 0、governance1188件OK。
06:49:48 JST、schema v1と旧drive-reverse-scopeを同時に注入した実験では、
U-CLSO-005が旧text、006がschema不一致をそれぞれassertionで検出し2失敗（exit 1）。
これは二つの変異を同時注入した試験であり、単一変異ごとの独立実験とは数えない。
src/cli.tsを元に戻し、git diffで変更なしを確認後、06:50:52 JSTに6成功、48.40秒。
baseline112.80秒とはworktree・PLAN件数・並走負荷が異なる単発比較で、CI p95ではない。

## 全CLI回帰で検出した既存oracleの欠落

全95件は94成功・1失敗、196.70秒。status試験がhuman以外を全てcross_agentと扱い、
intra_runtime_subagentの既存checklist契約を受理しなかった。変更前f880d297でも同じ失敗を
単独再現した（06:59:29 JST、exit 1）。review-tier.tsの既存3分岐に合わせてoracleを分離し、
intra-runtimeでは4つのchecklist evidence全文をexact検査する。runtimeや承認条件は変更しない。

07:01:10 JST開始の修正後CLI全回帰は95成功、199.22秒、exit 0。
07:04:21 JSTのgate-review-tier回帰も20成功。text側は確認済みJSONの必要evidence全件と
ID全件を検査し、いずれか一語だけ存在すれば通る正規表現へ緩和しない。

## deadline契約との接合

CI run33996083627 attempt2は、既存deadline試験の定数出現数exact 3が
新beforeAllの参照追加により4となって失敗した。数を4へ緩める対案では対象caseの
timeout欠落を別の参照で相殺できるため、ASTで既存2つのitの第3引数へ直接束縛する。
各caseのtimeoutを個別に退行させた文字列fixtureで検出対象を検証する。
childの45秒上限とwrapperの正の余裕は維持し、runtimeの期限を変更しない。
