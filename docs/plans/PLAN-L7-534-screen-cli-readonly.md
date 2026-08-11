---
plan_id: PLAN-L7-534-screen-cli-readonly
title: "PLAN-L7-534 (add-impl): 読み取り CLI が harness.db を作らないようにする"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-09 デザインハーネスを進めること（#175 の申し送り消化）"
created: 2026-08-10
updated: 2026-08-10
owner: Claude / TL
github_issue_id: 175
engineering_discipline_required: true
behavior_contract_id: U-SAPCLI-002
responsibility_owner: screen-applicability
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: removed
no_code_decision: modify
ddd_modeling_decision: adapter
contract_preconditions: "helix screen status / gates と helix registry status / operations は『読み取り専用』と説明されているが、実装は openHarnessDb（read-write）で開き ensure*Tables を呼んでいた。実測で、harness.db が無い temp repository に対して screen status を 1 回走らせるだけで .helix/harness.db と screen 系 10 table が新規作成されることを確認した"
contract_postconditions: "4 コマンドとも read-only（openHarnessDbReadOnly + PRAGMA query_only）で開き、absent / uninitialized / ready の三状態を区別する。absent と uninitialized ではファイルも table も作らず initialized=false の空 status を exit 0 で返す。破損 DB は schema_version つき JSON error + 非 0 exit へ正規化し stdout は空にする"
contract_invariants: "初期化済み repository での出力内容は従来と同じ（JSON に initialized field が増えるだけ）。write 経路（store / commit）は変更しない"
contract_failures: "read 経路での DB ファイル作成・table 作成・read-write open を U-SAPCLI-002 が fail-close する。破損 DB を空状態として飲み込む経路も非 0 exit と stdout 空の両方で塞ぐ"
tdd_red_required: true
red_at: "2026-08-09T15:38:04Z"
green_at: "2026-08-09T15:42:47Z"
mutation_oracle_evidence: "tests/screen-cli-readonly.test.ts に対する mutation 実測（vitest run --project fast）で 2/2 killed。(1) 二段構成を元の openHarnessDb + ensureScreenApplicabilityTables へ戻す = killed、(2) initialized を常に true にする = **初回 survive**。DB 不在ケースしか見ていなかったためで、『DB はあるが対象 table が無い』中段ケース（sqlite_master を直接確認）を追加して killed にした。restore 後 exit 0"
complexity_effect: net_neutral
complexity_justification: "共通 helper 1 個（三状態を返す）を足し、4 つの呼び出し側から ensure*Tables 呼び出しを外した。分岐は増えるが read/write の責務が分離される"
removal_trigger: "harness.db の open 層自体が read/write 意図を型で強制するようになり、CLI 側の三状態判定が不要になった時"
parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md
pair_artifact: docs/test-design/helix/L8-screen-applicability-prototype-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md, oracle_id: U-SAPCLI-002, test_path: tests/screen-cli-readonly.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — 申し送りのうち実害を実測で確定させる" }
  - { role: se, slot_label: "SE — 二段構成 open の共通 helper" }
  - { role: qa, slot_label: "QA — 実 CLI spawn による副作用観測" }
  - { role: tl, slot_label: "TL — registry へのスコープ拡大の是非" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-534-screen-cli-readonly.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/screen-applicability-prototype.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-screen-applicability-prototype-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/screen-cli-readonly.test.ts, artifact_type: test_code }
  - { artifact_path: src/cli.ts, artifact_type: cli_extension }
  - { artifact_path: src/design/screen-applicability-sqlite-store.ts, artifact_type: source_module }
  - { artifact_path: src/design/design-registry-sqlite-store.ts, artifact_type: source_module }
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-09T16:01:00Z"
    tests_green_at: "2026-08-09T15:57:58Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: claude-sonnet-5
    scope: "2 ラウンド。round1 **request_changes**（Critical 0 / Important 1 / Minor 2）。Important は `ensureScreenApplicabilityTables` / `ensureDesignRegistryTables` が未使用 import として残置していた点（4 コマンドから呼び出しを外した結果。biome では warning 止まりで CI は落ちないが、dead path を残さないという実装規則に抵触）。import 2 件を削除し `src/cli.ts` の digest 変化に伴い worker-wrapper-admission.md の source_digest 3 件を再 attest した。round2 approve（新規 Critical 0 / Important 0 / Minor 2）。**観点 1（read-only 化で壊れる経路）**: reviewer は src 全体で ensure*Tables の production 呼び出しが 0 件になったこと、実 table 作成は rebuildHarnessDb / projection-writer 経路が担うこと、docs と scripts に『status を叩くと DB が bootstrap される』前提の記述が無いことを grep で確認した（網羅ではなく grep ベースと明記）。**観点 5（digest 再 attest）**: ファイル単位の pin であり sha256sum と一致、設計判断の内容を書き換えたものではない機械的整合維持として正当と判定。round2 の Minor: (1) round1 応答で『work-guard が rm を block した』と説明したが、settings.json 上 work-guard は Edit/Write/MultiEdit 用である——実際に観測されたのは Bash の PreToolUse hook が `[helix-work-guard]` を名乗って block した出力であり、hook 実装の内部委譲による。判断（削除しない）は妥当とされた。なお当該 harness.db は本セッション開始時点の git status に既に存在した untracked 0 byte ファイルであり、他ランタイム由来の可能性があるため削除せず stage もしない。(2) registry 側の設計 doc（design-registry.md）には本是正の言及が無く、将来 PLAN での追記を推奨——本 PLAN の generates 外のため据え置く。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/screen-cli-readonly.test.ts tests/screen-cli.test.ts tests/screen-rule-reentry.test.ts tests/screen-generated-identity.test.ts tests/design-language.test.ts tests/design-coverage.test.ts tests/review-evidence.test.ts tests/ddd-tdd-rules.test.ts tests/ci-governance-self-heal.test.ts tests/impl-plan-trace.test.ts tests/l12-hybrid-recognition.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-09T15:57:58Z", evidence_path: tests/screen-cli-readonly.test.ts, output_digest: "sha256:abceefb91f3817f670663980b32b4efe0517097675a675582741d252d2251661", result: "11 files / 124 tests green、skip 0" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T15:57:58Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0（出力なし）" }
      - { kind: lint, command: "npx --no-install biome check src tests", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T15:57:58Z", evidence_path: biome.json, output_digest: "sha256:2e0a8960ae1f112e32476f7f98065ea14e760408ecbc3fb1f16ef666db346644", result: "exit 0（error 0。warning は本 diff 外由来の既存 debt で純増 0）" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-09T16:01:00Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-09T16:01:00Z"
    evidence_digest: "sha256:6b84cd5b10b6556acd6689a48a6e1c011145f4b76030fec0915ab896dda264ed"
  entries: []
dependencies:
  parent: docs/plans/PLAN-L7-515-screen-applicability-cli.md
  requires:
    - docs/plans/PLAN-L7-533-screen-rule-digest-reentry.md
  references:
    - docs/plans/PLAN-L7-519-design-registry-cli.md
  blocks: []
---

# PLAN-L7-534: 読み取り CLI が harness.db を作らないようにする

## §1 実測で確定させた事象

`helix screen status` / `helix screen gates` は「読み取り専用」と説明されているが、実装は
`openHarnessDb`（read-write）で開き `ensureScreenApplicabilityTables` を呼んでいた。

harness.db を持たない temp repository で `helix screen status --json` を 1 回走らせた結果、
`.helix/harness.db` が新規作成された（実測）。中には screen 系 10 table が入る。

実害は 2 点ある。

1. **未初期化と空状態が区別できなくなる**。読んだだけで初期化済みへ変わるため、
   呼び出し側は「gate 0 件で健全」と誤解しうる。
2. **read 経路が共有 DB を read-write で開き schema を変える**。並行 write との競合面が増える。

## §2 スコープを registry まで広げた理由

`helix registry status` / `helix registry operations`（PLAN-L7-519、Issue #177）は
**同一パターンの同一欠陥**を持っていた（`openHarnessDb` + `ensureDesignRegistryTables`）。

契約が同じで是正も同じ helper 1 個で足りるため、片方だけ直すと同じ欠陥が残り、後続で
同じ oracle をもう一度書くことになる。よって本 PLAN で両方を同時に是正し、oracle も
4 コマンドを同一ケースで観測する。#177 の requirement 判断（PO disposition 待ち）には触れていない
——変えたのは read 経路の副作用だけである。

## §3 工程表

### Step 1: 実 CLI spawn による red oracle [直列]

根拠: downstream_dependency（helper 単体では「ファイルを作るか」を観測できないため、
観測手段の確定が実装より先に要る）。

### Step 2: 二段構成 helper と 4 コマンドの配線 → green [直列]

根拠: file_conflict（`src/cli.ts` への集中編集）。

### Step 3: 設計 §3.3 と L8 §9 の記述 [直列]

根拠: downstream_dependency（実装済み挙動を設計正本へ反映する）。

### Step 4: review Step（別 runtime 判定。Codex 使用中は intra_runtime_subagent = code-reviewer を規定代替とする） [直列]

根拠: downstream_dependency（実装と設計記述が揃ってからでないと判定できない）。

## §3.1 実装計画

- `src/cli.ts`: `openReadOnlyHarnessDbIfInitialized(isInitialized)` を追加し、absent /
  uninitialized / ready の三状態を返す。screen 2 コマンドと registry 2 コマンドから
  `ensure*Tables` 呼び出しを外し、JSON 応答へ `initialized` を追加する。
- `src/design/screen-applicability-sqlite-store.ts`: `screenTablesInitialized` と
  `emptyScreenStatus` を追加する。
- `src/design/design-registry-sqlite-store.ts`: 同等の 2 関数を追加する。
- `tests/screen-cli-readonly.test.ts`: U-SAPCLI-002 を新設する（実 CLI spawn）。

## §4 本 PLAN の非対象

- **write 経路**: store / commit 側の `ensure*Tables` はそのまま。初期化の責務は write 側にある。
- `WALKTHROUGH_ITERATION_LIMIT` の policy 化（実害が出ておらず port / store の設計判断を伴う）。
  #175 の申し送りで唯一残る項目になる。
- CI の `skill suggest` timeout flake（#93 側で Codex が担当）。
- **他の読み取り CLI**: 同じ `openHarnessDb` + `ensure*Tables` パターンが他 command にも
  残っていないかの全面 sweep は行っていない。本 PLAN は #175 と、その直近に同型欠陥があった
  registry までを範囲とする。全面 sweep は follow-up とする。
