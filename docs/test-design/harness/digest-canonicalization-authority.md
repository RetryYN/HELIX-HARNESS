---
layer: L8
sub_doc: unit-test-design
status: confirmed
pair_artifact: docs/design/harness/L6-function-design/digest-canonicalization-authority.md
plan: docs/plans/PLAN-L6-76-digest-canonicalization-authority.md
---

# Digest canonicalization verification design

| ID | oracle | test citation |
|---|---|---|
| U-DIGEST-001 | stringとbytesの既知SHA-256 vectorが`sha256:`付きで一致する | `tests/digest.test.ts` |
| U-DIGEST-002 | object key順序だけを正規化し、配列順序を変えない | `tests/digest.test.ts` |
| U-DIGEST-003 | 非JSON値をfail-closeする | `tests/digest.test.ts` |
| IT-DIGEST-001 | 移行4 consumerの公開API digestがhardcoded oracleとbyte-for-byte一致する | `tests/digest-consumer-compatibility.test.ts` |
| ST-DIGEST-001 | production hitがtyped variantまたは非移行理由を持つ | `tests/digest.test.ts` |
| ST-DIGEST-002 | handover resurrectionの純lint境界を維持する | `tests/digest.test.ts` |
