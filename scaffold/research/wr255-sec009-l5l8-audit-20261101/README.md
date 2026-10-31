# WR255 SEC009 L5/L8 pair audit

Status: scaffold evidence; authority effect: none.

This audit records the SEC009 L5/L8 V-pair after commit `ea8e3c2` and the follow-up U-ID table correction. It compares the current canonical class and case rows without executing a security algorithm, runtime, test, CI, or external operation. The report does not claim four-way verification.

## Reproduce

From the repository root, run:

```sh
python3 scaffold/research/wr255-sec009-l5l8-audit-20261101/validate_wr255_l5l8.py
```

The validator writes `verification-summary.json` and the full `check-child-report.json` beside itself. It independently checks all 32 class identities across L4/L5/L8/L9, stable L5 rule IDs, L4/L5 code and owner correspondence, and all 285 U-ID to L9 source-case mappings. It compares each negative U-ID's condition, expected result, and preserved result to its L4 class. It confirms all eight positive rows remain unclosed and all individual `oracle_id` and `test_citation` fields are null.

## U-ID table and shared source references

L8 `unit_cases` now uses a distinct sequential `SEC009-U0001`…`SEC009-U0285` ID in `id`; the original SEC009 source identity remains in `case_id` and `integration_case_ref`. The separate `unit_case_source_index` maps each U-ID once to its L9 source pointer and, for negative rows, the L4 class and L5 rule pointers. Each row has a short, unique counterexample stating its target and discrepancy, followed by the failure meaning of the referenced L4 class; it is not only a restatement of the source ID. Where a source ID marks a conflict but its nested L9 `given` omits the concrete values, the row says those values were not supplied. No value pair is invented. Rows also carry the contract-level `system_oracle_ref` and null individual oracle/test citation fields. Negative expected fields come from L4, not L9 `expected_proposal`.

The class table remains the shared source for axis, state, owner, and expected classification. Redundant per-row `source_pointers`, `expected_property`, and repeated class-axis/state projections were removed. The checker requires `condition`, `expected`, and `expected_preserved` on each L8 row and compares those values to L9 row values; these fields remain in place even where a class provides the same values. The current L9 index has no corresponding row-level values for these fields, so the four-way checker continues to report the mismatch.

The validator resolves every negative row's L9 nested pointer. Those 277 `given` objects contain only the common `evidence_limit` notice; they do not contain concrete identity values or conflict pairs. Each negative counterexample therefore names its target and missing/conflicting state from the source case marker, then the L4 class meaning. For conflict cases the text explicitly records that concrete values are absent. The expected objects and class pointers provide the L4-defined error semantics; no raw values are supplied or inferred.

## Positive-case evidence boundary

The canonical L9 nested source was read again for each of the eight positive IDs. Each `given` object contains only the same shared `evidence_limit` field. The source `when` statements describe contract-level phase/recipient processing, but do not add the missing case-specific input facts. L3 and L10 provide contract-level obligations/oracle statements, while L4 provides the contract, not a matching positive class row. The independent L4/L9 proposal also leaves these positives unresolved. Therefore L8 leaves `condition`, `expected`, and `expected_preserved` null. No values are inferred from L9 `expected_proposal`.

For each positive U-ID, the audit records the L3 business/functional source identities, L10 business case, L4 B01 contract, L9 nested pointer, and digest of that nested `given` object in `verification-summary.json`. `HELIXSECURITY-L10-009-B01` is a contract-level system oracle reference; the individual U-ID oracle is unobserved and remains null. No test citation was present in the request or supplied source mapping, so the table records null rather than inventing one.

## Measured child-check result

The current static checker run recorded:

- L4/L9 pair: pass.
- L5/L8 pair: pass.
- Four-way matched cases: 0.
- Four-way failures: 2,235. The full report and reason counts are in `check-child-report.json` and `verification-summary.json`.

The result remains incomplete because the L9 case rows do not contain the row-level expected/condition/preserved fields or compact observations required for comparison, and class-key alignment failures remain. This separate L4/L9 follow-up is not included in this L5/L8 pair audit.
