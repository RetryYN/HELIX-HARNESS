# WR251 naming L8 ownership cap removal

status: scaffold (temporary audit evidence)
authority_effect: none

## Scope

At fixed base `f1cc56731e8862589eada60892d21e4c12d2c0df`, the L8 naming correspondence document had 158 U-ID rows plus duplicated fixtures, complete returns, source-derived hashes, and private verification/support material. This work reduces each formal row to `id`, `subject`, `counterexample`, `expected_result`, `oracle_id`, and `test_citation`, retaining the concrete row meaning.

`u-id-meaning-mapping.json` maps each U-ID to its pre-edit pointer, concrete target IDs, baseline-relative input and expected-result changes, matching L3 requirement and L10 oracle, removed keys/hashes, and citation status. It also lists removed auxiliary nodes, fixed input revisions, legacy/failure basis, and consumer/pin search. The removed-material provenance in the formal L8 file points to this report and the exact pre-edit commit/path.

## Meaning and boundary

The cases are comparisons against existing source rows, not executions. F01 keeps distinct same-name objects and role/consumer scope; F02 keeps object/symbol/oracle edge identity; F03 keeps the concrete conditions, owner/consumers, unchanged behavior signature, and rollback-preserved object/oracle; F04 keeps finding, owner, exception scope/expiry, and date; B01 keeps the decision/CI proposal boundary, protected requirement, mechanism role, and adopted body. Case-specific JSON changes retain missing/null/conflict values. The baseline-relative mapping avoids repeating complete fixtures or returns.

No naming-specific L7 test or test citation was found at the fixed base. `test_citation` remains `null`; no citation is invented. Test/oracle identity is not fabricated from source pointers. The L5 formal consumer pairs with L8 by document ID but has no path/pin to removed support nodes. The L8 upstream source pins remain unchanged.

L4, L5, and L9 formal documents are preserved. No L4/L5 algorithm, old CLI/hook/runtime/test/CI, or product operation was run. These records do not create authority, approval, design completion, acceptance, or an actual rename.

## Verification

`verification-summary.json` records baseline and candidate `check-child` reports, including pair/cap/pin counts and any not-evaluated or failing states; it is static scaffold evidence. It also records `scfctl validate`, `scfctl stale`, diff checks, and the remaining limits.
