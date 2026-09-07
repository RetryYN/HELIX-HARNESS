---
plan_id: PLAN-RECOVERY-1649-three-lane-ir-admission
title: "承認済み三社レーンのRequirement IR登録"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
owner: Codex / TL
created: 2026-09-08
updated: 2026-09-08
github_issue_id: 1649
behavior_contract_id: THREE-LANE-CLOUD-CAPACITY-ORCHESTRATION-001
responsibility_owner: requirement-json-delta-admission
engineering_discipline_required: true
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: retained
no_code_decision: configure
ddd_modeling_decision: aggregate
contract_preconditions: "PLAN-L3-78の承認済みsourceと#397 generic admission、#1647の27 AC表を照合する"
contract_postconditions: "元の8 Feature grouping、25 supporting requirement、27 ACを既存IRへ登録し、二相承認後だけfrozenへ進める"
contract_invariants: "baseline 153/24/72/24と既存6 refinementの意味不変、独立schema/DBなし、specifiedを実行許可にしない"
contract_failures: "source、ID、trace、owner、approval、manifest/view/DBの欠落・重複・不一致を拒否する"
tdd_red_required: true
complexity_effect: net_neutral
complexity_justification: "既存typed projectionとloaderを再利用するデータ登録であり、三社専用parserや別authorityを追加しない"
removal_trigger: "同一ID/revisionが後継canonical形式へ移管されconsumerとrollback検証が成立した時"
entry_signals: [regression_dev]
parent_design: docs/design/helix/L5-detail/requirement-refinement-authority.md
pair_artifact: docs/test-design/helix/L8-requirement-refinement-authority-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/requirement-refinement-authority.md, oracle_id: U-TLIR-MAT-001, test_path: tests/three-lane-ir-admission.test.ts }
  - { parent_design: docs/design/helix/L5-detail/requirement-refinement-authority.md, oracle_id: U-TLIR-MAT-002, test_path: tests/three-lane-ir-admission.test.ts }
  - { parent_design: docs/design/helix/L5-detail/requirement-refinement-authority.md, oracle_id: U-TLIR-MAT-003, test_path: tests/three-lane-ir-admission.test.ts }
  - { parent_design: docs/design/helix/L5-detail/requirement-refinement-authority.md, oracle_id: U-TLIR-MAT-004, test_path: tests/three-lane-ir-admission.test.ts }
  - { parent_design: docs/design/helix/L5-detail/requirement-refinement-authority.md, oracle_id: U-TLIR-MAT-005, test_path: tests/three-lane-ir-admission.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires:
    - docs/plans/PLAN-L3-78-three-lane-cloud-governance-authority.md
  references: ["issue:397", "issue:1358", "issue:1293", "issue:1637", "issue:1645"]
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1649-three-lane-ir-admission.md, artifact_type: markdown_doc }
  - { artifact_path: tests/three-lane-ir-admission.test.ts, artifact_type: test_code }
  - { artifact_path: .helix/evidence/review-1649/vitest-targeted.log, artifact_type: other }
  - { artifact_path: .helix/evidence/review-1649/tsc.log, artifact_type: other }
modifies:
  - { artifact_path: docs/test-design/helix/L8-requirement-refinement-authority-unit-test-design.md, artifact_type: markdown_doc }
  - { artifact_path: tests/requirement-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-ir-shadow.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-generated-view.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-generated-view-db.test.ts, artifact_type: test_code }
  - { artifact_path: requirements-ir/refinement_contracts.json, artifact_type: json_config }
  - { artifact_path: requirements-ir/manifest.json, artifact_type: json_config }
  - { artifact_path: docs/generated/requirements/requirement-definition.generated.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: aim, slot_label: "AIM — 要求承認とIR・実行admissionを分離" }
  - { role: se, slot_label: "SE — 既存JSON rootへsourceとtraceを登録" }
  - { role: qa, slot_label: "QA — 8/25/27の独立集合とdrift反例を検証" }
  - { role: tl, slot_label: "TL — 既存ownerとPhase Aの限定解放境界を照合" }
review_evidence: []
---

# 三社レーンIR登録

## 収束範囲

#397の三社レーン一系列だけを所有する。元sourceの8 Feature契約を8 umbrella recordとして保持し、
3L-FR-001（lane identity）を全25要件の包括契約へ読み替えない。
新しいFRを作らず、各見出し下のRと対応ACを元IDのまま収載する。
typed projectionは既存のmarkdown_requirement_bullet_v1 / markdown_acceptance_table_v2を使う。

実装される実行制御のprimary ownerは既存HR-FR-HIL-08（単一lease・独立verify・lifecycle）へ接続する。
判断packの境界はHIL-21、実task/model/cost比較はHIL-22、durable budget/causalityはHIL-02へ関連付ける。
baselineの古いteam表現を理由に、三社sourceが禁止する旧direct engineを再活性化しない。

## ACの検収責務

親#1358はcontract全体の独立受入、子は実装成果の担当であり、親closeを子着手の前提にはしない。
以下はsourceの実装owner表からの技術的な割当で、要求意味や人間承認の追加ではない。独立reviewで照合する。

| Feature | 親受入 #1358 | 実装成果のAC担当 |
|---|---|---|
| 3L-FR-001 | AC001: lane exact set | #861: AC002、#1293: AC003 |
| 3L-FR-002 | AC004: control authority | #1293: AC005/006 |
| 3L-FR-003 | AC007: pool境界 | #1359: AC008/009/010 |
| 3L-FR-004 | AC011: dispatch理由 | #1359: AC012 |
| 3L-FR-005 | AC013: policy bundle | #1293: AC014/026、#862: AC015、#860: AC025/027 |
| 3L-FR-006 | AC016: deterministic authority | #1360: AC017/018 |
| 3L-FR-007 | AC019: qualification class | #1361: AC020/021/022 |
| 3L-FR-008 | AC024: cycle末受入 | #1362: AC023 |

AC番号は全て3L-AC-接頭辞と3桁で扱う。各recordのdownstream_issue_idsは実装担当のexact setに限る。
Phase Aは必要な既存排他・予算・起動前後照合を満たして#1293で進める。Phase Bの#860全体完成や
全Bench・7日/cycle完了を最初の限定実案件の着手条件へ逆流させない。

AC025のPhase A実装・実consumer検証は#1293が担う。#860はAssignment／leaseのPhase B後継を
所有し、IRの#860割当はその最終実装責務を表す。Phase Aでは#1293が既存排他の実効性を検証し、
単一writerが成立しない対象への委譲を拒否する。#860のopen状態のみでPhase A全体を停止せず、
Phase Aでの検証成功を#860全体やAC027の後継lease／fence完成へ読み替えない。

## 承認と原文

L1/L3/L10の要求承認はL3-PO-1358-002（Issue #1358 comment 5557485431）。
IRの二相material commitと承認時source commitは別物であり、後者のhashを差し替えない。
PR #1647はAC行bytes不変の表整形だけで、main read-after前のsourceをfrozen実行authorityとして配布しない。
最初のspecified materialはapproval=nullの構造化候補で、既存の人間承認を失効させる意味ではない。
materialへの意味・owner・source照合と独立review後、同じrevisionのtyped approvalを束縛してfrozenへ進める。

## 工程表

1. R0: current source・既存IR・Issue owner・原承認を照合する。
2. R1/R2: 8/25/27の集合、Feature grouping、source drift・trace・owner・approval反例でRedを採取する。
3. R3: 既存manifest/shard/view/DBへspecified materialを同時反映し、baseline不変を確認する。
4. 二相admission: material HEADと既存承認を照合しfrozen recordを検証する。
5. R4: exact HEAD CI・独立review・main read-afterを閉じ、実装可能な対象だけを引き渡す。

## 未完了

現時点では取込中。IR frozen、独立review、CI、runtime dispatch、consumer実証、費用改善を完了としない。
既存6 refinementや他系列のapproval、runtime、後続研究を本sliceへ混載しない。

## material段階の実測

- Node 24.15.0 / Vitest 4.1.11で、取込前の新規4ケースが全て失敗するRedを確認した。
- 取込後、三社集合・既存refinement・authority・generated view・shadow・DBの6ファイル49テストが成功した。
  既存4ケースの追加集合への追従も含み、基準分母を緩和していない。
- oracle名を正規構文へ揃えた後も、三社集合と既存refinementの23テスト、typecheck、変更5 testのBiomeが成功した。
- 基準4 shardはbase HEADとbytes一致、既存6 refinementは全field一致。
- 既存generatorでviewを生成し、既存db rebuildはfindingsなし、requirement_ir 464行へ投影した。
  outstandingは新PLANのみを追加した94件であり、94件の実装残という意味ではない。
- scoped PLAN lintのV-pair binding欠落とoracle名の構文不一致を是正し、findings=0を確認した。

これは作成側の実測記録であり、独立review receiptやIR凍結の代用ではない。
新規testを含むcandidate HEADのpost-merge-status判定とPLANの技術検収は、main/CIへの投入前に閉じる。
未commit状態に対する同gateの成功を、commit後の候補HEADの成功とは数えない。

## pre-PR技術レビューへの追従

`b2071aaf`に対する独立session `9867601a-a3ad-4369-980c-11757d63a7de`のレビューは
#1649上でapprove／blockers 0だった。I-1へPhase AのAC025実装担当を上記のとおり明記し、
I-2へU-TLIR-MAT-001のFeatureごとのAC exact setを追加する。IR本文・owner・元承認は変更しない。
変更後HEADは同レビューの対象外であり、再確認とPLAN検収を残す。

M-1のbullet projection由来のbacktick表記、M-2のsourceに入力／操作列が無い点は残義務として保持する。
前者を本データ登録で独自parserにより上書きせず、後者へ未承認の受入意味を追加しない。

## 二相凍結の形式化

I-1/I-2は独立追認comment 5575770266（対象`fa52dc523`、2026-09-07T21:25:21Z）で閉じた。
source修復#1647もmain `e674ffb56d27ee4880b74636e55d6d7b65476b05`へ統合し、正規mergeのread-afterが成立した。
この2点を前提に、既存8 recordだけの凍結差分を作成する。変更後の独立検収は別途必要である。

- `candidate_head`はapprovalなしspecified material `b2071aaf54764fa3631a98b635970788a310b7d2`。
  後発の`fa52dc523`はPLAN/testのみの修正で、8 subject digest、source、ownerは同一である。
- `decision_source`と`approved_at`は元のL3-PO-1358-002のURLと2026-09-06T06:34:19Zを保持する。
  この時刻は元文書の人間承認時刻であり、後発IR materialがその時点で存在したという主張ではない。
  AIが行うのは承認済み意味の派生束縛で、新しい人間の承認・権限を創作しない。
  `approved_revision: 1`はIR recordの版で、元文書の承認版`0.4.0-candidate`を書き換えない。
- 承認時commit `69679771d456eb1600f399bc83f3121a2bc27b01`の25 R行／27 AC行と、
  canonical sourceの同じ行はbytes・順序一致。元承認の本文digestとcurrent source raw digestは
  対象が異なるため両方を保持し、片方で上書きしない。
  本文全体の非空行照合でも、差分は候補→canonicalの状態表示と工程上の未完了境界だけで、
  requirement側69行、acceptance側31行を維持している。
- downstream owner 9 Issueは2026-09-07T21:36:55ZにGitHubから取得し、全件OPENを確認した。
  各recordのsnapshotはそのrecordのowner exact set／順序だけを持つ。最終admission時に再照合する。
- `source_set_digest`／`subject_digest`／`decision_digest`／snapshot digestは既存関数で算出する。
  manifestとgenerated viewも既存root計算／renderを使い、baseline 4 shardと他の6 refinementは不変。

二相凍結を要求するU-TLIR-MAT-002/005が、specified状態でRedになることを実測した。
この凍結差分は要求データの登録であり、Cursor cloud起動・credential・課金・公開や、
Phase B全体の実装完了を許可しない。PLAN技術検収、fresh CI、独立review、main read-afterまで
本sliceの完了主張を禁止する。

既存authority負例fixtureはGit HEADを持たず、初めてfrozen recordが入るとrev-parseで途中終了した。
独立した空Git fixtureを用意して本来の検査へ到達させた。意味読取違反、互換digest、生成view改竄、
ID衝突などの既存failure message期待値を維持し、例外を成功へ読み替えていない。
U-TLIR-MAT-005は変異後もdecision/snapshot/record digestを再計算し、単純digest不一致だけでなく
HEAD、revision、source集合、owner、PLAN状態の境界が効くことを確認する。

## 凍結差分の作成側検証

mainをmerge-only同期した`59aa77464116c3622772885608fcafeaed4e691e`と本意図差分で採取した。
独立レビューではこの後commitされた全差分を再取得して照合する。出力に説明文は追記しない。

| 種別 | 実行 | exit | UTC完了時刻 | raw output / SHA-256 |
|---|---|---|---|---|
| unit_test | Node 24.15.0のVitestでthree-lane-ir-admission、requirement-refinement-authority、requirement-authority、requirement-ir-shadow、requirement-generated-view、requirement-generated-view-dbの6ファイル | 0（50 tests） | 2026-09-07T21:45:01Z | `.helix/evidence/review-1649/vitest-targeted.log` / `002e157d76f666a24a35f59de58ae56b9a8602bb581b2bc20f74f83ee5c28254` |
| typecheck | `tsc --noEmit -p . --extendedDiagnostics` | 0 | 2026-09-07T21:44:08Z | `.helix/evidence/review-1649/tsc.log` / `e52bad2737257e00300a2f284bc20355cc25078492b9a369bc40684b6eff5d95` |

PLAN lint、変更testのBiome、diff checkも成功。既存db rebuildはprojection ok／81670行、
うちRequirement IRは前述の464行を維持する。snapshotは95件でcommitted/live一致。
IR root digestは`sha256:4ac2491f8390a1fe6e1c7438b67a464b6eb95644150fcf9c37a5d410e6bb58b9`。
この作成側の実測だけでreview_evidenceを創作したり、PLAN confirmed／CI成功／merge完了を主張しない。
