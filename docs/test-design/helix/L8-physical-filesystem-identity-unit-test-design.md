---
title: "physical filesystem identity単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-19
updated: 2026-08-19
owner: Codex / QA
authority: docs/design/helix/L3-requirements/security-capability-broker-authority.md
plan: docs/plans/PLAN-L7-601-physical-filesystem-identity.md
pair_artifact: docs/design/helix/L6-function-design/physical-filesystem-identity.md
---

# physical filesystem identity単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-PHYSID-001 | exact literal | regular fileをphysical identityへ束縛し、receiptへ絶対pathや内容を出さない | `tests/physical-filesystem-identity.test.ts` |
| U-PHYSID-002 | symlink／junction | ancestor／final linkを`PHYSICAL_TARGET_SYMLINK_OR_JUNCTION`で拒否する | `tests/physical-filesystem-identity.test.ts` |
| U-PHYSID-003 | target set | absolute、traversal、glob、duplicate、件数不一致をfail-closeする | `tests/physical-filesystem-identity.test.ts` |
| U-PHYSID-004 | hardlink | 同一実体へ別名到達できるregular fileを曖昧targetとして拒否する | `tests/physical-filesystem-identity.test.ts` |
| U-PHYSID-005 | TOCTOU | 判定後のreplaceをidentity digest driftとして再検証時に拒否する | `tests/physical-filesystem-identity.test.ts` |
| U-PHYSID-006 | deterministic digest | target入力順を変えてもexact member digestが一致する | `tests/physical-filesystem-identity.test.ts` |

実装テストは、成功候補と各failure codeを一対一で検証する。mount情報を取得できない環境をskipで
greenにせず、実行環境の限界を`PHYSICAL_TARGET_MOUNT_UNVERIFIED`またはplatform unsupportedとして
明示する。
