---
title: "Cursor Cloud第三者実行admission機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-09-13
owner: Codex / TL
plan: docs/plans/PLAN-L7-1690-cursor-cloud-independent-execution.md
pair_artifact: docs/test-design/helix/L7-cursor-cloud-independent-execution-unit-test-design.md
related_l5: docs/design/helix/L5-detail/cursor-cloud-independent-execution-contract.md
github_issue_id: 1293
behavior_contract_id: CURSOR-CLOUD-INDEPENDENT-EXECUTION-001
responsibility_owner: cursor-cloud-execution
---

# Cursor Cloud第三者実行admission機能設計

`admitCursorCloudAssignment`はuntrusted envelopeと外部read-after観測を受ける純粋関数である。
unknown field、Issue/PLAN択一違反、unsafe/overlap pathをschema failureにする。次にexpiry/deadline、
HELIX事前発行branch、current budget reservation、repository/assignment/owner/branch/base/generationの
exact一致を順に検査する。provider APIやDBへ書かず、accepted結果もdispatch許可そのものにしない。

failure順は`CURSOR_ASSIGNMENT_SCHEMA_INVALID`→`CURSOR_ASSIGNMENT_AUTHORITY_STALE`→
`CURSOR_BRANCH_NOT_PREISSUED`→`CURSOR_BUDGET_UNAVAILABLE`→
`CURSOR_PREDISPATCH_IDENTITY_MISMATCH`で固定する。

`admitCursorBranchOwnership`はrepository＋branchをresource keyとし、assignment/action/owner/generation、
正のfence token、active state、有限expiryを照合する。これは#860 ownerが取得したownership observationの
consumer検証であり、process-local lockや第二lease発行器ではない。

launch応答消失と409は同actionをblind retryせず、ownershipとbudgetを保持したread-afterへ戻す。
安全返却はprovider terminal、writer disabled、pending write 0、cost reconciled、同generationの全条件を要求する。
一条件でも欠ければ`CURSOR_SAFE_RELEASE_UNPROVEN`で隔離を維持する。runtime policy、remote output、review、
実provider E2Eは後続sliceの未解消義務である。

`admitCursorExternalObservation`はunknown fieldを拒否し、launch/collectionの2時点、外部reader identity、
assignment/action/owner/branch/base、candidate HEAD、requested/effective model、usage/cost、diff bytes、test receipt、
変更pathを一つの観測契約として照合する。cost/usage UNKNOWN、同時点だけの1 leg、scope外path、foreign baseを
受理しない。remote bytesの展開・実行やmain/DB writeは行わない。

runtime proofはscope、secret profile、network profile、budget reservation内cost、実効deadlineをすべて要求する。
独立reviewはassignment・branch・candidate HEADをexact照合し、reviewerとworkerの同一identityを拒否する。
changes requestedは同じassignment・同branchだけへ返す。Phase A/B移行はpredecessor終端、writer不能、
dual writer 0、fresh fenceを全て要求する。retryはattempt・時間・cost currentの全上限内だけ同actionへ許可し、
上限到達後は未解消を保持する。いずれの失敗もpeer lane停止へ伝播させない。
