# WR265 CONNECT004 L8 retry/deduplication/conflict slim

This scaffold records a static normalization of `docs/helix-connect/L8-unit-verification/retry-deduplication-conflict.json` for DT-VT-105. The formal candidate retains the 69 existing case IDs in their prior order. Each row keeps its own counterexample, expected outcome difference, L10 oracle identity, and pointer to the corresponding L9 `expected_material`.

## Scope and meaning

L8 keeps only the U-ID rows and one shared boundary. The three existing L5 function meanings remain referenced through the existing `design_ref`: same-retry effect assessment (F01), digest-conflict assessment (F02), and retry-stop assessment against the existing policy/history (F03). Their calculation programs, branch tables, failure rules, and return details are not copied into L8. Row expectations retain the specific stop area, field, result, owner, digest action/effect increment, or retry budget/action as applicable.

All rows remain unexecuted. Fixture-derived L9 expectations do not establish a real retry, receiver effect, receipt, policy, approval, pass, or product test. The retained L9 oracle pointer does not include the raw packet pointer; a future L9 slim migration must migrate consumers that still use raw packet pointers.

The change follows the local L8 table precedent in `direction-order-feedback-relations.json` and the L5/L8 source and oracle separation in DT-VT-105. Legacy references remain reference-only: `LEGACY-ASSET-C3DE79BA9451172F3E43` and `LEGACY-ASSET-DD66C1B6B7BE234B37E6` preserve same-key/same-digest deduplication, different-digest conflict stop, operation identity, retry policy, and fault recovery boundaries. Legacy cursor codec, database, runtime, and execution paths are not carried forward.

## Validation

`validate_uid_table.py` is read-only by default. It checks fixed-base case IDs/order, all 69 row summaries against the retained L9 oracle pointers, L5 function presence and owner mapping including its explicit conditional owner rule, required `removed_materials` shape, and absence of copied fixture/full-return/hash material. It does not execute an L5 algorithm or product test.

To write a new immutable run record, pass a new output path explicitly:

```sh
python3 -B scaffold/research/wr265-connect-retry-l8-slim-20261101/validate_uid_table.py --record scaffold/research/wr265-connect-retry-l8-slim-20261101/evidence/records/NEW-UNUSED-ID/verification-summary.json
```

The output is created exclusively; an existing path is rejected. `verification-summary.json` is the one current evidence record. `evidence-history.json` is the single fixed historical source record and provides commit, git blob, SHA-256, and exact restoration command for the pre-edit file. Do not use the historical file as an execution input or expected-value fallback.

Run `scfctl validate`, `scfctl stale`, and `design_verification_checker.py check-child` against the latest `origin/main` merge overlay. Preserve each actual status; `not_evaluated` is not a pass. These checks remain static scaffold evidence and do not imply approval or formal L8 completion.
