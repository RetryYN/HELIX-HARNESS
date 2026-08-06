---
plan_id: PLAN-RECOVERY-38-wbb-judge-context-capability
title: "PLAN-RECOVERY-38 (recovery): blind judge context capability chainの起点をpacket capability一本へ固定する"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-07 GitHub issue #378（sealWorkerBlindJudgeContextがpacket capabilityではなくpacket形状のplain objectを受けるexport signatureであり、packet内容を知る側がbuildWorkerBlindJudgeContextを経由せず同一capabilityを独自にsealできる）の修復スライス"
created: 2026-08-07
updated: 2026-08-07
owner: Claude / TL
github_issue_id: 378
engineering_discipline_required: true
behavior_contract_id: WBB-JUDGE-CONTEXT-CAPABILITY-001
responsibility_owner: worker-isolation-broker
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: port
contract_preconditions: "sealWorkerBlindJudgeContextはpacket形状のplain object（schema_version／各digest／author_claim_count／private_context_count／packet_digest）を引数に取ってexportされている。self-digest検証（sha256Digest(canonicalJson(payload)) !== packetDigestならnull）があるため任意packetの偽造はできないが、packet内容を知る側はbuildWorkerBlindJudgeContextを経由せず同一のWorkerBlindJudgeContextCapabilityをsealできる。packet capabilityとseal台帳（packetSeals WeakMap）はworker-blind-benchmarkが所有し、broker側からは到達できないため、型でcapability chainの起点を1つに固定できていない"
contract_postconditions: "sealWorkerBlindJudgeContextの引数はpacket capability（object identity）となり、packet本体はworker-blind-benchmarkが一度だけ取り付けるresolver越しにseal台帳から引かれる。packet形状のplain objectやpacket capabilityのshallow copyを渡してもresolverが台帳を引けずnullを返すため、judge context capabilityの起点はbuildWorkerBlindJudgeContext（=packet capability）一本になる"
contract_invariants: "封印されるWorkerBlindJudgeContextCapabilityの形（kind／packet_digest／task_digest）とtaskのcanonicalization（canonicalJson(packet)）は不変。self-digest検証とauthor_claim_count／private_context_countのfail-closeも従来どおり残す。prepareWorkerIsolationLaunchのblindJudge検査列（blindJudgeContextCapabilities.has＋task_digest一致）は変更しない"
contract_failures: "packet形状のplain objectからjudge contextが封印される、packet capabilityのshallow copyが受理される、resolverが後から差し替えられる、正規経路（buildWorkerBlindJudgeContext）が封印できなくなる場合にfail-closeまたはredになる"
tdd_red_required: true
red_at: "2026-08-06T19:02:58Z"
green_at: "2026-08-06T19:04:22Z"
mutation_oracle_evidence: "oracle=U-WBB-003 (tests/worker-isolation-broker.test.ts)。sealWorkerBlindJudgeContextのresolver解決を`blindPacketResolver?.(packetCapability) ?? packetCapability`（＝旧plain object signatureへのrevert相当）へ書き換えるmutationを適用したところ、`expect(sealWorkerBlindJudgeContext({ ...packet.packet })).toBeNull()`がAssertionErrorでkillされRedになることを実測（2026-08-06T19:02:58Z）。mutation revert後は3 fileで52 passed/1 skippedがgreen（2026-08-06T19:04:22Z）"
complexity_effect: justified_positive
complexity_justification: "module境界を跨ぐcapability chainを型で閉じるため、broker側にone-shot resolver port（installWorkerBlindPacketResolver）を1本追加する。packet capabilityとseal台帳はworker-blind-benchmarkが所有しbroker側から到達できないため、resolverを介さずにbroker単独で起点を固定することはできない。one-shot（既にinstall済みなら無視）にすることで、初期化後の差し替えによるchain奪取を封じる"
removal_trigger: "packet capabilityのseal台帳がbrokerへ統合され、broker単独でpacket capability→packet本体を解決できるようになった時（resolver portは不要になる）"
parent_design: docs/design/helix/L4-basic-design/worker-blind-benchmark.md
pair_artifact: tests/worker-isolation-broker.test.ts
verification_bindings:
  - { parent_design: docs/design/helix/L4-basic-design/worker-blind-benchmark.md, oracle_id: U-WBB-003, test_path: tests/worker-isolation-broker.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — issue #378のcapability chain二起点の確認とmodule所有境界の特定" }
  - { role: se, slot_label: "SE — one-shot resolver portの導入とsealer signatureのcapability化" }
  - { role: qa, slot_label: "QA — U-WBB-003へのplain object拒否oracle追加と旧signature revert mutationのkill実測" }
  - { role: tl, slot_label: "TL — 封印形・task canonicalization・launch検査列の非変更確認とdesign digest追随" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-38-wbb-judge-context-capability.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/worker-isolation-broker.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/worker-blind-benchmark.ts, artifact_type: source_module }
  - { artifact_path: tests/worker-isolation-broker.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-blind-benchmark.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-context-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-independent-review.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-isolation-broker.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-lifecycle-receipt.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-risk-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/worker-blind-benchmark.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/worker-context-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/worker-independent-review.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/worker-isolation-broker.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/worker-lifecycle-receipt.md, artifact_type: design_doc }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
dependencies:
  parent: docs/plans/PLAN-L7-504-worker-blind-benchmark.md
  requires:
    - docs/plans/PLAN-L7-504-worker-blind-benchmark.md
    - docs/plans/PLAN-RECOVERY-35-wbb-selected-candidate-dead-path.md
review_evidence:
  - reviewer: "Claude primary runtime (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-06T19:06:31Z"
    tests_green_at: "2026-08-06T19:06:31Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: claude-opus-5
    scope: "単一runtimeのため規定代替のintra_runtime_subagentとして、material変更（src/runtime/worker-isolation-broker.ts のsealer signature＋resolver port、src/runtime/worker-blind-benchmark.ts のresolver取り付けと呼び出し変更、tests/worker-isolation-broker.test.ts のU-WBB-003拡張、design digest citation 11件、新規PLAN文書）をadversarial reviewしverdict approve。(1) 起点が1本になったこと: sealWorkerBlindJudgeContextはblindPacketResolver経由でしかpacketへ到達せず、resolverはpacketSeals WeakMapのlookupなので、packet形状のplain objectもpacket capabilityのshallow copyもnullを返す。両方をoracleで固定した。(2) resolverの奪取不可: installWorkerBlindPacketResolverは既installなら無視するone-shotで、worker-blind-benchmarkのmodule初期化時に取り付けられる。brokerがworker-blind-benchmarkより先に単独loadされた場合はresolver未installでsealerがnullを返すfail-close側に倒れる。(3) behavior非変更: 正規経路buildWorkerBlindJudgeContextは同じcapability/taskを返し、既存29件（broker+benchmark）がgreen。封印形・canonicalJson(packet)によるtask・prepareWorkerIsolationLaunchのblindJudge検査列は無改変。(4) mutation kill実測: resolver解決を旧signature相当へ戻すmutationでU-WBB-003がRedになることを確認済み。(5) 波及gateの実測: design-reality-binding は broker/benchmark両source変更に追随して11 design docのcitationを更新し`OK (checked=22)`へ復帰。digest-inventoryはsha256Digest呼出行の移動で stale 化したためscanDigestInventoryで再生成し`OK (hits=249)`。l12-hybrid-recognitionはcitation更新でworker-lifecycle-receipt.mdのreviewed digestが無効化されたため、signal集合がbit同一（python_worker_boundary 3件）であることを突合してから再attestし`OK`へ復帰。doctorの残failing-checksはpristine origin/mainのbaselineと完全一致する4件のみ。merge admissionはGitHub Actions required checkの同一HEAD full CIを外部receiptとする。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/worker-isolation-broker.test.ts tests/worker-blind-benchmark.test.ts tests/design-reality-binding.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-06T19:04:22Z", evidence_path: tests/worker-isolation-broker.test.ts, output_digest: "sha256:369bd45a54aac466c10bdd58eeff1b5ece1d8dba03f287a735e6bc9b1b6c3b37", result: "3 files / 52 tests passed, 1 skipped" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-06T19:06:28Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
      - { kind: lint, command: "npx --no-install biome check src tests", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-06T19:06:28Z", evidence_path: biome.json, output_digest: "sha256:9c76b00f513217a9710fef9811f81d91aee96210cb77cd4b2ba9d1416916fea6", result: "0 error" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint --gate governance", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-06T19:06:31Z", evidence_path: docs/plans/PLAN-RECOVERY-38-wbb-judge-context-capability.md, output_digest: "sha256:ebb4c6629b870281b7849d0f0710a5334cf97788d270b8be9c56887b151426b3", result: "plan-governance OK" }
---

# PLAN-RECOVERY-38: blind judge context capability chain の起点を packet capability 一本へ固定する

## 根本原因

`src/runtime/worker-isolation-broker.ts` の `sealWorkerBlindJudgeContext` は、packet capability では
なく **packet 形状の plain object** を引数に取る形で export されていた（issue #378）。
self-digest 検証（`sha256Digest(canonicalJson(payload)) !== packetDigest` なら null）があるため
任意 packet の偽造はできないが、judge には packet 内容がそのまま task として渡される設計
（`task = canonicalJson(packet)`）のため、**内容を知る側は `buildWorkerBlindJudgeContext` を経由せず
同一の `WorkerBlindJudgeContextCapability` を独自に seal できた**。

意図された唯一の入口は `worker-blind-benchmark.ts` の `buildWorkerBlindJudgeContext`
（`packetSeals` から取り出した sealed packet だけを渡す）である。broker 側が plain object を
受ける限り capability chain の起点が 2 つ存在し、「packet capability からしか judge context を
作れない」という不変条件が型で保証されていなかった。

## なぜ単純な非 export 化では閉じないか

issue の対応案 1（broker 内部専用へ）は成立しない。`sealWorkerBlindJudgeContext` は
`worker-blind-benchmark.ts` から呼ばれるため export が必要である。
対応案 2（`WorkerBlindPacketCapability` を要求し packet 本体は capability から引く）を採るには、
broker が packet capability → packet 本体を解決できなければならないが、
**packet capability と seal 台帳（`packetSeals` WeakMap）は `worker-blind-benchmark` が所有**しており
broker からは到達できない。封印済み capability の検証台帳
（`blindJudgeContextCapabilities`）は逆に broker が所有し `prepareWorkerIsolationLaunch` が使うため、
sealer を benchmark 側へ丸ごと移すこともできない。

## 修復

module 境界を跨ぐ **one-shot resolver port** を導入し、対応案 2 を成立させる。

- broker に `installWorkerBlindPacketResolver(resolver)` を追加する。既に install 済みなら**無視**する
  one-shot で、初期化後の差し替えによる chain 奪取を封じる。
- `sealWorkerBlindJudgeContext` の引数を **packet capability（object identity）** に変え、
  packet 本体は resolver 越しに seal 台帳から引く。resolver が解決できなければ `null`（fail-close）。
- `worker-blind-benchmark` は module 初期化時に `packetSeals.get(...)` を resolver として取り付け、
  `buildWorkerBlindJudgeContext` は packet 本体ではなく **packet capability** を broker へ渡す。

self-digest 検証と `author_claim_count` / `private_context_count` の fail-close はそのまま残す。

## 検証

- red 実測: resolver 解決を `blindPacketResolver?.(packetCapability) ?? packetCapability`
  （＝旧 plain object signature への revert 相当）へ書き換える mutation を適用すると、
  `U-WBB-003` の `expect(sealWorkerBlindJudgeContext({ ...packet.packet })).toBeNull()` が
  AssertionError で Red（2026-08-06T19:02:58Z）。
- green 実測: mutation revert 後に broker / benchmark / design-reality-binding の 3 file で
  52 passed / 1 skipped（2026-08-06T19:04:22Z）。
- oracle は「plain object 拒否」「capability shallow copy 拒否」「正規 capability は受理」
  「`buildWorkerBlindJudgeContext` は ok」の 4 点を固定し、片側だけのトートロジーにしていない。
- `design-reality-binding` は broker / benchmark 両 source の変更に追随して 11 design doc の
  `source_digest` citation を更新し `OK (checked=22)` へ復帰することを実測した。
- `digest-inventory` は `sha256Digest` 呼出行の移動で stale 化したため `scanDigestInventory` で
  再生成し `OK (hits=249)` を実測した（行数は不変で、行番号のみ移動）。
- `l12-hybrid-recognition` は citation 更新で
  `docs/design/helix/L4-basic-design/worker-lifecycle-receipt.md` の reviewed digest が無効化されたため、
  編集前後の signal 集合が **bit 同一**（`python_worker_boundary` 3 件）であることを
  `detectL12HybridRecognitionSignals` で突合してから digest を再 attest し `OK` へ復帰した。
- `doctor` の残 failing-checks は `codexHookTrust` / `teamReviewReceipts` /
  `memoryHandoverIsolation` / `greenCommandDigest` の 4 件で、pristine `origin/main` の
  worktree で計測した baseline と**完全一致**する（いずれも local 環境依存の既存 debt）。

## 非対象

- `WorkerBlindJudgeContextCapability` の形・`task` の canonicalization・
  `prepareWorkerIsolationLaunch` の blindJudge 検査列の変更
- `packetSeals` 台帳そのものの broker への統合（`removal_trigger` に記録した将来テーマ）
- issue #379（`selected_candidate_id` dead path）— 本 branch はその修復スライスの上に積んでおり、
  同一 module を触るが behavior contract が別である。
