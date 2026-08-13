---
plan_id: PLAN-REVERSE-493-state-db-schema-ddl-authority-backfill
title: "PLAN-REVERSE-493: state DB schema DDL authorityの設計backfill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: design
route_mode: reverse
forward_routing: gap-only
promotion_strategy: reuse-as-is
drive: agent
status: confirmed
created: 2026-08-13
updated: 2026-08-13
owner: Codex / TL
github_issue_id: 644
behavior_contract_id: STATE-DB-SCHEMA-DDL-AUTHORITY-001
responsibility_owner: state-db-schema-authority
change_slice: atomic
pair_artifact: docs/test-design/helix/L8-state-db-schema-ddl-authority-unit-test-design.md
entry_signals:
  - "po_directive:2026-08-13 PR #645でmergeしたschema DDL authorityをReverse R0から上位設計へ照合する"
backprop_scope:
  - layer: L3-requirements
    decision: preserve
    evidence_path: docs/governance/helix-harness-requirements_v1.3.md
    reason: "schema DDLのdeterminismとmigration後schema照合は既存state DB責務の検証強化であり、新しいproduct requirementを追加しない。"
  - layer: L4-basic-design
    decision: preserve
    evidence_path: docs/design/helix/L4-basic-design/event-projection-checkpoint-replay.md
    reason: "state DB component境界、transaction owner、migration責務を変更せず、read-only authority比較だけを追加した。"
  - layer: L5-detailed-design
    decision: preserve
    evidence_path: docs/design/helix/L5-detail/state-db-schema-ddl-authority.md
    reason: "pinned digest、sqlite_schema exact set、missing／extra／changed分類がmerged implementationと一致する。"
  - layer: L6-function-design
    decision: preserve
    evidence_path: docs/design/helix/L6-function-design/state-db-schema-ddl-authority.md
    reason: "schemaDdlDigest、readSqliteSchemaObjects、compareSchemaAuthorityのread-only契約が実装exportと一致する。"
  - layer: verification-design
    decision: preserve
    evidence_path: docs/test-design/helix/L8-state-db-schema-ddl-authority-unit-test-design.md
    reason: "U-SDDA-001..005がgolden digestとSQLite object driftの正負oracleを実テストへ束縛する。"
agent_slots:
  - { role: se, slot_label: "SE — R0/R2 implementation／design trace採取" }
  - { role: qa, slot_label: "QA — R1 mutation oracleとmigration round-trip反証" }
  - { role: tl, slot_label: "TL — R3意図照合とR4 Forward再入判定" }
  - { role: po, slot_label: "PO — R3で記録済みIssue意図とscope境界のauthority" }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-493-state-db-schema-ddl-authority-backfill.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-551-state-db-schema-ddl-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/helix-harness-requirements_v1.3.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/event-projection-checkpoint-replay.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/state-db-schema-ddl-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/state-db-schema-ddl-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-state-db-schema-ddl-authority-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L7-551-state-db-schema-ddl-authority.md
  requires:
    - docs/plans/PLAN-L7-551-state-db-schema-ddl-authority.md
  references:
    - docs/plans/PLAN-L7-551-state-db-schema-ddl-authority.md
    - docs/design/helix/L5-detail/state-db-schema-ddl-authority.md
    - docs/design/helix/L6-function-design/state-db-schema-ddl-authority.md
    - docs/test-design/helix/L8-state-db-schema-ddl-authority-unit-test-design.md
    - src/state-db/schema-authority.ts
    - tests/state-db-schema-authority.test.ts
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-13T13:34:25Z"
    tests_green_at: "2026-08-13T13:33:51Z"
    verdict: approve
    worker_model: codex:gpt-5.6-luna
    reviewer_model: claude:claude-opus-5
    scope: "PR #651 stage-1 HEAD 824e5b8bdef9a9f1e65c9fa71eba4d4ac104cdc3のR4 gap-only routing、R0〜R3 trace、PLAN-L7-551 parent／requires、preserve境界を独立reviewしblocker 0。Actions run 31704228930 success、DB projection／replayとcheckpoint／replay一致、converged=true。canonical receipt: pull/651#issuecomment-5281136707、digest sha256:5f7f4367ece1ac4ec256881ff791debc032436a947d46b78eff39d396a0fe760。"
    green_commands:
      - { kind: smoke, command: "gh run view 31704228930 --json databaseId,status,conclusion,headSha,event", runner: ci, scope: full, exit_code: 0, completed_at: "2026-08-13T13:33:51Z", evidence_path: tests/backfill-pairing.test.ts, output_digest: "sha256:5f7f4367ece1ac4ec256881ff791debc032436a947d46b78eff39d396a0fe760", result: "completed / success / HEAD 824e5b8bdef9a9f1e65c9fa71eba4d4ac104cdc3" }
---

# PLAN-REVERSE-493: state DB schema DDL authorityの設計backfill

## R0 現状採取

PR #645のmerge commit `d2dd5d53f67a90a3c6b8657328240b45e9ddbce9`を基準に、
`schemaDdlDigest`、`readSqliteSchemaObjects`、`compareSchemaAuthority`、pinned digest、
fresh migration後の`sqlite_schema`照合、U-SDDA-001..005を採取する。
schema migration追加、DB write path変更、PLAN-L7-448 #6 parser／#19 fixture lifecycleは観測範囲へ含めない。

## R1 観測テスト設計

- canonical DDL bytesはrepository-owned pinned digestと一致する。
- fresh migration後のtable／index／trigger exact setは同じauthorityへ収束する。
- missing／extra／changed objectは個別の反例としてfail-closeする。
- schema／migration機能、transaction boundary、DB write ownerは変更されていない。

R1の実測では `tests/state-db-schema-authority.test.ts` のU-SDDA-001..005を直接実行し、
canonical DDL digest `sha256:352d16168ff2629248b69d0ce3a0e574965cee07250649071b8d8c6474209b85` と
fresh migration後のSQLite object digest
`sha256:7f97842c671c17ab29eb61e453a0632f315f8a09f86394aef57b3909d03ac12a` を照合した。
`SELECT 1`追加、object欠落、余剰table追加、SQL本文mutationはそれぞれ独立した反例として
期待digest不一致または`missing`／`extra`／`changed`へ分類される。加えて
`tests/state-db.test.ts` U-SDDA-006と`tests/l3-g3-freeze-packet-v2.test.ts` U-SDDA-007を同じ
targeted runへ含め、既存migration生成とL3 freeze registrationの接続を確認した。

このR1は観測oracleの成立だけを記録する。R2のAs-Is設計判定、R3のIssue意図照合、R4の
Forward再入と`PLAN-L7-551`双方向linkは未成立として維持する。

## R2 As-Is設計

実装は既存state DB schemaの意味を変えず、自己比較oracleを独立authorityへ置換している。
新しいmigration、table、index、trigger、永続化ownerを追加していないため、L3／L4の再設計ではなく
既存L5／L6設計を`reuse-as-is`で照合する。

R2ではPR #645の16 changed pathsをmerge diffから再採取した。runtime変更は
`src/state-db/schema-authority.ts`だけで、`src/state-db/migration.ts`、`src/schema/harness-db.ts`、
transaction commit boundary、DB writerには差分がない。実装exportはL6の3関数
`schemaDdlDigest`／`readSqliteSchemaObjects`／`compareSchemaAuthority`と一致し、SQLite queryは
`sqlite_schema`への`SELECT`だけである。L5が定義するcanonical DDL digest、非内部object exact set、
name／type／normalized SQL比較、欠落／余剰／変更の分類も実装分岐と一致する。

したがってL5／L6の`preserve`と`promotion_strategy: reuse-as-is`をR2判定とする。L5／L6文書は
現時点でdraftのため、この判定だけで設計承認やForward完了へ昇格させない。R3のIssue意図照合と
R4の双方向linkも未成立として維持する。

## R3 意図照合

Issue #644の意図はDDL driftの独立検出であり、schema自体の機能追加ではない。
mutation killとcurrent-head CIが成立しても、parser #6とfixture lifecycle #19の完了は主張しない。

R3ではIssue #644のOPEN本文と2件のscope expansion commentをGitHubから再取得した。本文の
原子的scopeはpinned golden digest、canonical DDL bytes、migration後`sqlite_schema`の双方向照合、
self-comparisonを除去したnegative mutation oracleであり、R0〜R2で採取した実装・反証・As-Is設計と
一致する。companion scopeはcatalog reviewed digest同期とdigest governance／V-pair metadata補正に
限定され、どちらのcommentもproduct behavior expansionを認めていない。

非対象は本文と後続commentの双方でMarkdown table reader（PLAN-L7-448 #6）、shared temp fixture
lifecycle（#19）、DB schema機能追加／migration変更のまま維持されている。従って実装はIssue意図を
過不足なく満たし、別責務を誤って閉じない。Issue #644自体はterminal closure graphにより、R4の
Forward link・独立review・merge read-afterが揃うまでOPENを維持する。

## R4 Forward再入

R1〜R3の反証と意図照合を完了したため、`forward_routing: gap-only`として
`PLAN-L7-551`と本Reverseを双方向linkする。全backprop scopeは`preserve`で、新規設計gap、schema機能、
migration、writer責務をForwardへ追加しない。独立reviewとcurrent-head CIが成立するまでは本PLANを
draftで維持し、成立後の確認commitでのみconfirmedへ遷移する。
