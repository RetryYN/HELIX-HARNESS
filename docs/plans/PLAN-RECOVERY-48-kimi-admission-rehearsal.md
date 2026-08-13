---
plan_id: PLAN-RECOVERY-48-kimi-admission-rehearsal
title: "PLAN-RECOVERY-48 (recovery): Kimi独立レビューlaneのbootstrap admission通し稽古"
kind: recovery
layer: cross
drive: be
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-11 PO指示『クロスレビューkimi 3Kを活用すること』。Issue #390 / PLAN-RECOVERY-39 / PLAN-RECOVERY-40で実装・bench・lane closure束縛まで完了したが、Claudeによるlane実装review receiptからS4 admissionを発行し、実PRをKimiでreviewする通し稽古が未実施"
status: draft
created: 2026-08-11
updated: 2026-08-13
owner: Codex / TL
github_issue_id: 390
behavior_contract_id: KIMI-REVIEW-FALLBACK-001
responsibility_owner: independent-review-fallback-router
engineering_discipline_required: true
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: pure_function
backprop_decision: not_required
backprop_decision_reason: "既存のKIMI-REVIEW-FALLBACK-001を変更せず、PLAN-RECOVERY-40 §6に明記された未実施の運用チェーンを実測するため"
contract_preconditions: "Kimi laneのmaterial closure、bench 5件、negative mutation 7件、proposal-only・low/medium risk・24時間上限は実装済みだが、current closureをClaudeが独立reviewしたcanonical receiptとS4 admission receiptが存在せず、fallback commandの実運用証拠が0件"
contract_postconditions: "Claude bootstrap reviewで検出した未来issued_at、repo外cwdのgh diff、filesystem closure oracle欠落に加え、provider選択へ申告riskではなくCLI boundaryで機械導出済みrisk_classを渡す経路と、historical receiptをdecodeせずcurrent v3 digestだけをlookupする経路を先に是正する。修復後のcurrent HEAD上でClaudeがlane closure 7 pathsを再reviewしcanonical receiptをsealする。同一HEADで実Kimi bench 5/5・mutation 7/7を再実測し、closure digest一致を検証してS4 admissionを発行する。そのadmissionで別のlow/medium実PRをKimi K3-256kがread-only reviewし、provider-neutral receiptまで到達する"
contract_invariants: "Kimi自己admission、raw kimi起動、repository本体・.git・.helix・harness.db・credentialのmodel context露出、high/critical risk、write/Ready/merge権限を許可しない。Claude bootstrap receiptはlane実装reviewの実在GitHub commentへ束縛し、別PR・別HEAD・別CIのreceiptを流用しない"
contract_failures: "lane closure未review、receipt改変、CI非green、DB非収束、bench case欠落、mutation生存、closure drift、未来issued_at、admission期限切れ、risk上限超過、repo解決不能diff、tool activity、schema drift、stale HEADはすべてfail-closeする"
tdd_red_required: true
red_at: "2026-08-11T14:50:06Z"
green_at: "2026-08-11T14:55:05Z"
mutation_oracle_evidence: "Claude bootstrap review comment https://github.com/RetryYN/HELIX-HARNESS/pull/566#issuecomment-5254777564 が未来issued_at、実filesystem closure未到達、repo外cwd gh diffを検出。未来issued_at negative mutationをexact setへ追加し、U-IRF-004Dでnow<issued_atを拒否、U-IRF-012dでfixture filesystemの1 byte drift・ENOENT・provider material差し替えを実測した。repo外cwdはenv -u GH_REPOでexit 1、--repo明示でexit 0を実測。今回のI-2はU-IRF-003cでCLI boundaryのderived riskをprovider selectionへ渡す経路を検証し、declared highへの置換mutantを拒否した。I-3はU-IRF-013でhistorical v1/v2・壊れたv3を読み飛ばし、期待digestのcurrent v3だけを返す経路を検証した。修復後 targeted 3 files / 50 tests、tsc、Biome green。"
complexity_effect: net_neutral
parent_design: docs/design/helix/L6-function-design/independent-review-fallback.md
pair_artifact: docs/test-design/helix/L8-independent-review-fallback-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/independent-review-fallback.md, oracle_id: U-IRF-011a, test_path: tests/kimi-review-admission-bench.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/independent-review-fallback.md, oracle_id: U-IRF-012c, test_path: tests/kimi-review-admission-bench.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/independent-review-fallback.md, oracle_id: U-IRF-003c, test_path: tests/independent-review-fallback.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/independent-review-fallback.md, oracle_id: U-IRF-013, test_path: tests/independent-review-fallback.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — bootstrap chainと既存authorityの同一性確認" }
  - { role: se, slot_label: "SE — bench・admission・fallback commandの正規実行" }
  - { role: qa, slot_label: "QA — current closure、negative mutation、provider-neutral receiptの照合" }
  - { role: tl, slot_label: "TL — Claude/Kimi独立性とmerge非権限境界の判定" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-48-kimi-admission-rehearsal.md, artifact_type: markdown_doc }
  - { artifact_path: docs/research/kimi-admission-rehearsal-2026-08-11.md, artifact_type: markdown_doc }
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-RECOVERY-39-kimi-review-lane-admission-bench.md
    - docs/plans/PLAN-RECOVERY-40-kimi-admission-lane-closure-digest.md
  blocks:
    - issue:390
review_evidence: []
---

# PLAN-RECOVERY-48：Kimi admission通し稽古

## 目的

Issue #390の既存laneについて、実装済みであることと実運用可能であることを分離し、後者を実測する。
PLAN-RECOVERY-39はbenchを、PLAN-RECOVERY-40はlane closure digest束縛を完了したが、両PLANが
明示的に範囲外・残件としたbootstrap receiptからfallback receiptまでの連鎖はまだ0件である。

## 契約順序

1. Codex authoredの本PRで、Claude本人runtimeへcurrent HEADとlane closure 7 pathsの独立reviewを依頼する。
2. review findingをRed evidenceとして、未来issued_at、実filesystem closure oracle、repo外cwd diff、
   provider選択へ渡すrisk_classの申告値から機械導出値への切替を修復する。
3. 修復後current HEADをClaude本人runtimeが再reviewし、current-head CI terminal green後にcanonical review receiptを1通sealする。
4. 同じHEADで実Kimi benchを再実行し、5/5 pass・negative mutation 7/7 kill・closure digest一致を得る。
5. `github pr-review-fallback-admission`で24時間限定S4 admission receiptを発行する。
6. low/medium riskの別open PRを`github pr-review-fallback`へ渡し、Kimi K3-256kのread-only verdictと
   provider-neutral receiptを得る。KimiにはGitHub mutation、Ready、mergeを許可しない。
7. GitHub comment、local receipt、CI、DB convergence、closure digestをread-afterで照合し、研究記録へ残す。

## 完了条件

- [x] Claude bootstrap reviewがcurrent HEAD上のlane closure全7 pathsを実際に対象としている。
- [x] current-head CIがterminal successで、canonical Claude receiptが改変なく再取得できる。
- [x] bench case 5/5 pass、negative mutation 7/7 kill、開始前後closure digest一致。
- [x] S4 admission receiptが発行され、24時間・proposal-only・low/medium制約を保持する。
- [x] admitted Kimi K3-256kが別の実PRをreviewし、strict schemaのprovider-neutral receiptを発行する。
- [x] Kimiがwrite、tool activity、high risk、stale HEADでfail-closeする既存oracleを弱めていない。
- [ ] 本記録のcurrent HEADを別runtimeが独立technical reviewし、current-head CIをterminal greenにする。

完了証拠のexact digest、GitHub comment、CI run、provider sessionは
`docs/research/kimi-admission-rehearsal-2026-08-11.md` §「完了read-after」に集約する。
本更新時点では独立technical review前であるため、frontmatterの`status: draft`は維持する。
最後の未了項目である別runtime reviewとcurrent-head CI greenを得た後にだけ`confirmed`へ遷移する。

## 範囲外

- `admission ensure`の新規自動化。通し稽古が閉じた後に価値を判断する。
- 汎用`helix kimi`、network sandbox拡張、credential policy変更。
- KimiによるReady化、merge、Issue/PR mutation。
