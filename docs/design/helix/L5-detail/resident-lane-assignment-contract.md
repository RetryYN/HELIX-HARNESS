---
canonical_vmodel: L1-L12
canonical_layer: L5
canonical_pair: L8
title: "Resident Lane Assignment契約 詳細設計"
layer: L5
kind: add-design
status: draft
created: 2026-09-12
updated: 2026-09-12
owner: Codex / TL
plan: PLAN-L7-860-resident-lane-assignment-kernel
parent_design: docs/design/helix/L4-basic-design/resident-lane-assignment-boundary.md
pair_artifact: docs/test-design/helix/L8-resident-lane-assignment-unit-test-design.md
---

# Resident Lane Assignment契約 詳細設計

## Value object

`ResidentLaneAssignmentV1`はL3のpacketへ`candidate_head`と`lease_id`を明示追加し、次を必須とする。

- schema version、assignment ID、repository
- `issue:<owner>/<repo>#<number>`または`plan:<PLAN-ID>`の`scope_ref`
- scope body/acceptance digest
- dedicated branch、base SHA、candidate HEAD
- assigned lane/role、lease ID、正整数fence
- created/expires RFC3339 timestamp

unknown field、protected branch、不正なlease windowはfail-closeする。入力欠落をcwd、env、provider session、mainから補完しない。

## Pure decisions

- `projectResidentLaneAssignments`: duplicate byte identityを吸収し、active exact setを決定順で返す。期限切れ、branch二重writer、scope二branchをtyped failureにする。
- `evaluateAssignmentReviewReturn`: original lane、branch、candidate HEAD、fenceの順で照合する。
- `evaluateAssignmentTakeover`: previous lease終端、handover receipt、remote HEAD、`old fence + 1`を検証し、同branchの新assignment revisionを返す。

## Failure taxonomy

入力不正、lease expiry、duplicate writer、scope branch conflict、foreign writer/branch、stale candidate HEAD/fence、
previous lease active、handover receipt欠落を別codeにする。複数異常は決定順の重複なし配列とし、表示文へ潰さない。
