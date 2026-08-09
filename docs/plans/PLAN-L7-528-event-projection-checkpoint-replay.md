---
plan_id: PLAN-L7-528-event-projection-checkpoint-replay
title: "PLAN-L7-528 (add-impl): orchestration event projectionとcheckpoint replayの機能設計と実装"
kind: add-impl
layer: L7
drive: agent
status: draft
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals: ["po_directive:Issue #215 event projectionとcheckpoint replayをMIC要件へexact traceして実装する"]
created: 2026-08-09
updated: 2026-08-09
owner: Claude / TL
github_issue_id: 215
engineering_discipline_required: true
behavior_contract_id: MIC-FR-001
responsibility_owner: event-projection-checkpoint-replay
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: pure_function
contract_preconditions: "PLAN-L5-98のL5/L8 pairがconfirm済みであり、判定関数8種とEVENT_* failure code 19種（union member 18種）が凍結されている。判定順序はL5 §2.1-§2.3／§2.5-§2.8の番号順を凍結対象とし、§2.4だけは本PLANがerrataのcarrierとしてevaluation order（seal→起点→machine）をL5本文へ明記して確定させる（番号順ではEVENT_TRANSITION_AFTER_SEALが到達不能になりcontract_postconditionsと衝突するため）"
contract_postconditions: "envelope受理／因果順序／冪等ingest／lifecycle遷移／projection drift／checkpoint scope選択／checkpoint replay／Recovery routingのpure judgementが実装され、EVENT_* codeがexecutable oracleで到達可能になる"
contract_invariants: "正規化とsha256算出はsrc/runtime/digest.tsのcanonicalJson／sha256Digestを使い第二の算出系を作らない、createL3G3LogicalDbReceiptを呼び出さない、scope未指定時に全体スコープへ暗黙フォールバックしない、#213／#214のlease・terminal・accounting authorityを再実装しない、DB／network／workflow変更0"
contract_failures: "U-EPR-001..102がevent片肺・exact set欠落とunknown field相殺・append-only違反・duplicate side effect・causal inversion・illegal transition・projection drift・orphan lane・checkpoint／HEAD／parent欠落・全体スコープdigest流用・non-idempotent replay・無制限retryのmutantをRedにする"
tdd_red_required: false
mutation_oracle_required: true
tdd_note: "classic Red-first cycle は踏んでいない（実装 → oracle の順で書いた）ため tdd_red_required=false とし、falsification 証跡は mutation_oracle_required=true 側の tracked runner に一本化する。red_at/green_at を実在しない Red 実行として宣言しない"
mutation_oracle_evidence: "output_digest sha256:18996c3b9d860a1f93e972449a4bc917ff7507dfb32c2daec683510d4b47aa98（2026-08-09T11:23:45Z 実行）。tracked runner `tests/tools/event-projection-mutation/run-mutation.ts` が source mutant 60 体を実生成して tests/event-projection-checkpoint-replay.test.ts を実行し、60/60 killed・survived 0・pattern_missing 0 で exit 0。初回 55 体では survived 4・pattern_missing 2 だった。生存のうち deep-freeze-shallowed は、本 module が返す値が平坦な envelope と string 配列だけでネスト object を返す経路が無いため到達不能分岐と判明し、mutant を削らずコード側の再帰凍結を削除して frozenClone を Object.freeze(structuredClone(value)) に置き換えた。残る 3 体（transition-correlation-filter-removed／scope-exact-set-check-removed／replay-boundary-last-endpoint-ignored）は oracle 不足であり U-EPR-098..100 を追加して解消した。pattern_missing 2 件は from パターンが実ソースと乖離していたため実在するパターンへ修正した。その後 biome format で対象ソースの改行位置が変わり pattern_missing が再発したため、runner に MISSING 名の出力を追加して特定し（transition-origin-rule-removed／scope-slice-widened-to-whole-log）、整形後ソースへ from を再同期した。mutant 集合と結果は不変であり output_digest は再同期前後で同一である。最後に独立レビューが判定順序の逆転 2 件を実行で実証したため、`evaluateProjectionDrift` を L5 §2.5 の番号順（identity → state → lane）へ是正し、`evaluateLifecycleTransition` は seal 先着を維持したうえで到達可能性の根拠をソースコメントへ明記した。順序だけを入れ替える mutant `drift-order-lane-first` / `transition-order-machine-first` と oracle U-EPR-101 / U-EPR-102 を追加し 58→60 体とした"
complexity_effect: net_negative
complexity_justification: "pure judgementの単一moduleへ集約し、digestプリミティブと#213／#214のreceipt・lease・accounting authorityを再利用して重複判定を作らない"
removal_trigger: "not_applicable"
parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md
pair_artifact: docs/test-design/helix/L8-event-projection-checkpoint-replay-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-001, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-002, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-003, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-004, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-005, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-006, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-007, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-008, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-009, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-010, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-011, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-012, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-013, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-014, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-015, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-016, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-017, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-018, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-019, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-020, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-021, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-022, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-023, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-024, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-025, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-026, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-027, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-028, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-029, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-030, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-031, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-032, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-033, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-034, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-035, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-036, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-037, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-038, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-039, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-040, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-041, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-042, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-043, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-044, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-045, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-046, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-047, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-048, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-049, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-050, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-051, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-052, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-053, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-054, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-055, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-056, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-057, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-058, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-059, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-060, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-061, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-062, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-063, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-064, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-065, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-066, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-067, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-068, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-069, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-070, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-071, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-072, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-073, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-074, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-075, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-076, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-077, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-078, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-079, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-080, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-081, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-082, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-083, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-084, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-085, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-086, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-087, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-088, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-089, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-090, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-091, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-092, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-093, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-094, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-095, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-096, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-097, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-098, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-099, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-100, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-101, test_path: tests/event-projection-checkpoint-replay.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, oracle_id: U-EPR-102, test_path: tests/event-projection-checkpoint-replay.test.ts }
generates:
  - { artifact_path: docs/design/helix/L6-function-design/event-projection-checkpoint-replay.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L6-event-projection-checkpoint-replay-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/event-projection-checkpoint-replay.ts, artifact_type: source_module }
  - { artifact_path: tests/event-projection-checkpoint-replay.test.ts, artifact_type: test_code }
  - { artifact_path: tests/tools/event-projection-mutation/run-mutation.ts, artifact_type: script }
agent_slots:
  - { role: aim, slot_label: "AIM — 判定関数8種のpure実装" }
  - { role: qa, slot_label: "QA — U-EPR-001..102のexecutable oracleとmutation runner" }
  - { role: tl, slot_label: "TL — digest責務分割と#213／#214資産の境界監査" }
review_evidence: []
dependencies:
  parent: docs/plans/PLAN-L5-98-event-projection-checkpoint-replay.md
  requires:
    - docs/plans/PLAN-L5-98-event-projection-checkpoint-replay.md
  blocks:
    - issue:215
---

# orchestration event projectionとcheckpoint replayの機能設計と実装（L6/L7）

## 目的

PLAN-L5-98 で凍結した判定関数契約を、`src/runtime/event-projection-checkpoint-replay.ts` の
pure judgement として実装し、U-EPR-001..102 の executable oracle と mutation runner で
分岐網羅を機械検証する。

## 範囲

- 判定関数 8 種の実装と `EVENT_*` failure code の到達性。
- U-EPR-001..102 の executable oracle（静的タイトルの `it()` と 1:1）。
- source mutant を実生成する tracked mutation runner。

## 範囲外

- DB projection、CLI surface、GitHub Projects API 呼び出しの追加。
- #213／#214 の receipt・lease・accounting 判定の再実装。

## §工程表 schedule

| Step | 作業内容 | 並列/直列 | 直列理由 |
|------|------|-----------|----------|
| 1 | 判定関数 8 種の実装 | [直列] | downstream_dependency (oracle は実装の export に依存) |
| 2 | U-EPR-001..102 の executable oracle 実装 | [直列] | downstream_dependency (Step1 の判定順序に 1:1 対応させる) |
| 3 | mutation runner 実装と survived 0 までの解消 | [直列] | shared_state (生存 mutant は oracle 追加か分岐削除で解消する) |
| 4 | review（独立 AI-B）と freeze 準備 | [直列] | shared_state (全成果物完成後の全体整合レビュー) |
