---
plan_id: PLAN-L7-528-design-registry-authority-transition
title: "PLAN-L7-528 (add-impl): Design Registry authority 遷移の永続化（U-DRG-010 / U-DRG-011）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#177 Design Registryを進める（slice5 = slice4 の申し送り第1項）"
created: 2026-08-08
updated: 2026-08-08
owner: Claude / TL
github_issue_id: 177
engineering_discipline_required: true
behavior_contract_id: U-DRG-010
responsibility_owner: design-registry
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "slice2 の取引系（buildRegistryCommit / commitRegistry / markStaleLineage）と slice3 の SqliteDesignRegistryStore が genesis commit 経路として着地済みであること。L5 §2 が『revision 更新の write 経路は後続スライスで別途設計する』として明示的に留保した範囲を本スライスで閉じる"
contract_postconditions: "buildAuthorityTransition が genesis 済み entity の revision bump（version 行 1:1 採番）と lineage 由来の stale 遷移（revision 据え置き）を決定的 bundle として組み、applyAuthorityTransition が digest 再導出による内容再検証を通過した bundle だけを store の UPDATE 経路へ委譲する。SQLite store は apply 順 version→node→edge→head の単一 transaction で行 CAS 更新し、head を lock 内 CAS で前進させる"
contract_invariants: "失敗経路の行増分は 0（head CAS 不一致・二重 operation・bundle 改変・行 CAS 不一致・BEGIN 失敗・apply fault・lock 内 head CAS 競合）。entity identity（kind/atom_role/service_role）は revision を跨いで不変。`retired` は終端であり離脱を fail-close する（`stale`→`canonical` の再検証復帰は意図的に許可し、この非対称を正本 doc に明記する）。変化 0 の空遷移は head を前進させず `DRG_STALE_INPUT`。revision の永続表現は十進正準（TEXT affinity 列への number 直 bind が生む `'1.0'` 分裂を作らない）"
contract_failures: "未知 entity/edge=DRG_ID_INVALID、revision 逸脱・identity すり替え・retired 離脱=DRG_REVISION_MISMATCH、digest 改変・空遷移=DRG_STALE_INPUT、head/行 CAS と二重 operation=DRG_CAS_CONFLICT"
tdd_red_required: true
red_at: "2026-08-08T14:27:05Z"
green_at: "2026-08-08T14:32:46Z"
mutation_oracle_evidence: "tests/design-registry-authority-transition.test.ts が L8テスト設計スライス5表の反例を機械検査する。digest 再導出・revision 導出・identity 不変・retired 終端・空遷移拒否・行 CAS（node/edge 各 changes!==1 判定、identity 列 WHERE、edge revision WHERE）・ROLLBACK・revision 正準化のいずれを外す mutation も該当 fixture が red で kill する。行 CAS 系は新規 seed 済み DB で 1 要因ずつ分離した反例により kill を実測済み（node_row_cas / edge_row_cas / identity WHERE / edge revision WHERE の 4 mutation すべて exit 非 0 を確認）"
complexity_effect: justified_positive
complexity_justification: "#177 の第5スライス。pure builder 1本・apply 1本・store メソッド 2実装（in-memory / SQLite）と oracle test 1本のみを追加し、既存 commit 経路の意味論（digest 再導出・CAS・増分 0）をそのまま UPDATE 経路へ延長する"
removal_trigger: "authority 遷移が後継の registry write 設計へ置換された時"
parent_design: docs/design/helix/L6-function-design/design-registry.md
pair_artifact: docs/test-design/helix/L8-design-registry-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRG-010, test_path: tests/design-registry-authority-transition.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRG-010b, test_path: tests/design-registry-authority-transition.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRG-011, test_path: tests/design-registry-authority-transition.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #177 slice分割（authority 遷移の永続化を第5スライスに）" }
  - { role: se, slot_label: "SE — buildAuthorityTransition / applyAuthorityTransition と両 store 実装" }
  - { role: qa, slot_label: "QA — U-DRG-010 / U-DRG-011 oracle" }
  - { role: tl, slot_label: "TL — 行 CAS 境界と authority lattice の非対称の妥当性" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-528-design-registry-authority-transition.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/design-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/design-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-design-registry-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/design/design-registry-transaction.ts, artifact_type: source_module }
  - { artifact_path: src/design/design-registry-sqlite-store.ts, artifact_type: source_module }
  - { artifact_path: tests/design-registry-authority-transition.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md
  requires:
    - docs/plans/PLAN-L7-519-design-registry-cli.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-09T00:10:00Z"
    tests_green_at: "2026-08-09T00:10:00Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして、Claude code-reviewer（claude-sonnet-5, read-only）が2ラウンドでレビューした。1回目request changes（Critical 1件・Important 2件・Minor 2件、いずれもprobe実証）。Critical=行CAS分岐（node_row_cas / edge_row_cas）が現行oracleで一度も実行されず、`changed.changes !== 1`を無力化しても3/3 greenのままでPLANのmutation claimが虚偽だった（原因: version_idのUNIQUE制約違反が先に発火し行CAS分岐へ到達していない。v8 coverageでも当該throw行がuncoveredと独立確認）。Important 2件=完全適応的攻撃者（digest・write_set・operation_digestまで再計算）を模したprobeで、edge.revisionとnode.kindを改変したbundleがcommitまで到達し、列とpayload/semantic_digestが食い違う行を生成できることを実証。是正: (1) 行CAS反例を新規seed済みDBで1要因ずつ分離した4反例へ作り替え（同一DB上の連続実行では先行遷移が動かしたauthority/revisionが別要因のCAS不一致を生み、node側とedge側が互いを覆い隠してkillが成立しないことを実装側でも実測。reviewer推定のversion衝突回避だけでは不十分だった）、(2) bundle側にfrom_kind/from_atom_role/from_service_role/edge from_revisionを追加しwrite_set digestと自己整合性検査へ算入、(3) DB側WHEREへ不変であるべき列（node identity 3列はnullable対応の`IS`比較、edge revision）を追加し「bundleだけを見るapply層はidentityごと整合的に作り直した改変を判別できないためDB実態との照合を最終防衛線とする」役割分担をL5 §2 / L6 §1 / PLANへ明記、(4) canonical→retired直行oracleとedge append faultを追加。2回目approve（Critical/Important/Minor全て0）。reviewerは4 mutation（node_row_cas無力化・edge_row_cas無力化・node identity列WHERE除去・edge revision WHERE除去）を自ら追試し、いずれもexit≠0かつ意図した反例1つだけが単独で落ちる（相互マスキング解消）ことを確認した。未実証として残るのは`injectAppendFault: design_registry_edges`の専用mutation-kill追試のみ（他fault と同一パターンの追加、全体green）。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/design-registry-authority-transition.test.ts tests/design-registry-commit.test.ts tests/design-registry-stale.test.ts tests/design-registry-store-sqlite.test.ts tests/design-registry-cli.test.ts tests/state-db.test.ts tests/digest.test.ts tests/coding-rules.test.ts tests/design-language.test.ts tests/vmodel-pair.test.ts tests/design-coverage.test.ts tests/ddd-tdd-rules.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-09T00:10:00Z", evidence_path: tests/design-registry-authority-transition.test.ts, output_digest: "sha256:add74918f2dcc559d31fd913d406ab3289fbfa18de1dbb9e7c1566ea24aaf6e6", result: "review是正後worktree: 12 files / 144 tests green（U-DRG-010 / 010b / 011 と registry 既存 4 suite・digest inventory・coding-rules・design-language・vmodel-pair を含む）" }
      - { kind: lint, command: "npx biome check src tests", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T00:10:00Z", evidence_path: biome.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0（error 0、純増 0）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T00:10:00Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-09T00:10:00Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-09T00:10:00Z"
    evidence_digest: "sha256:801e7e86874aca2e6faf97375dd040358c178b143161297ce37befd1ac02ea41"
  entries: []
---

# PLAN-L7-528: Design Registry authority 遷移の永続化

## 目的（Issue #177 第5スライス）

slice3 の SQLite store は entity ごとの genesis commit だけを許容し、L5 §2 は
「revision 更新の write 経路（UPDATE + versions 追記 + stale 遷移）は後続スライスで別途設計する
（正当な revision-bump も現 store では fail-close される、これは意図した暫定 scope）」として
明示的に留保していた。slice4 の申し送り第1項「authority 遷移の永続化」はこの留保の解消であり、
本スライスで閉じる。

`markStaleLineage`（slice2）は pure 関数として stale lineage を算出できるが、その結果を
registry へ適用する write 経路が無く、算出した stale マークは永続化されずに失われていた。
本スライスは lineage を **適用可能な遷移** として受け取り、行 CAS つきで永続化する。

## §3 工程表

### Step 1: 留保範囲の確定と red oracle 作成 [直列]

根拠: downstream_dependency（遷移 bundle の schema 確定が実装の前提）。

### Step 2: pure builder + apply + 両 store 実装 → green [直列]

根拠: file_conflict（RegistryStoreV1 の interface 拡張が両 store 実装へ同時に波及する）。

### Step 3: review Step（別runtime判定。Codex usage limit中は intra_runtime_subagent = code-reviewer を規定代替とする） [直列]

根拠: downstream_dependency（前段実装の完成に依存するレビュー）。

### Step 4: confirm → db rebuild → commit → PR → CI → merge → Issue #177 evidence [直列]

根拠: shared_state（outstanding snapshot / harness.db projection の単一owner収束）。

## §3.1 実装計画

情報源: slice2 の `commitRegistry`（digest 再導出・CAS・増分 0 の規律）と slice3 の
`SqliteDesignRegistryStore`（BEGIN IMMEDIATE + lock 内 head CAS）。遷移経路はこの規律を
そのまま延長し、genesis の PK 制約に相当する二重書込防御として **行 CAS**
（`WHERE entity_id = ? AND revision = ? AND authority = ?`）を置く。さらに WHERE には
**遷移では不変であるべき列**（node の kind / atom_role / service_role、edge の revision）も含める。
bundle 内部の自己整合性検査は identity ごと整合的に作り直された改変を判別できない（digest も
write-set も再計算できる）ため、DB 実態との照合を最終防衛線とする。

### 設計判断（レビュー対象）

- **authority lattice の非対称**: `retired` は終端として離脱を拒否するが、`stale` → `canonical` は
  再検証経路として許可する。`stale` は「要再検証」であって恒久的な失効ではないため。
  この非対称は L5 §2 / L6 §1 / 本 PLAN に明記する。
- **next_nodes と lineage の重複**: 同一 entity を双方が指す場合は明示指定である next_nodes
  （revision bump）を優先し、lineage 側の stale マークは残余 entity にだけ適用する。
- **revision の永続表現**: `revision` 列は TEXT affinity であり、JS number の直 bind は
  SQLite が REAL 経由で `'1.0'` として保存する。`'1'` と `'1.0'` は等値比較で一致しないため
  行 CAS が保存側と比較側の表現差で静かに外れうる。書込・比較の双方を十進正準表現へ揃える。
  この是正は slice3 の genesis INSERT 経路にも適用する（registry table は現時点で
  live row 0 件であり、`helix registry status --json` の全 count = 0 を確認済み）。

## 後続スライス（本PLAN非対象）

- `screens` / `screen_trace` を正本供給源とする SCR intake（台帳の複製新設の禁止）
- public command（permission 不要）の RegistryPolicyV1 例外判断
