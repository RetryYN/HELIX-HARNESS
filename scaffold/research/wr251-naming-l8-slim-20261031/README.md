# WR251 naming L8 ownership cap removal

status: scaffold (temporary audit evidence)
authority_effect: none

## Scope

At fixed base `f1cc56731e8862589eada60892d21e4c12d2c0df`, the L8 naming correspondence document had 158 U-ID rows plus duplicated fixtures, complete returns, source-derived hashes, and private verification/support material. Each formal row retains only its identifier, subject, concise counterexample, row-specific expected outcome, oracle ID, and test citation.

The initial committed `u-id-meaning-mapping.json` and check-child reports are preserved as time-specific evidence. PR #3998 R1 identified two corrections; the previous evidence is not rewritten. The additive `r1-correction-20261031.json` records the correction disposition, and `r1-row-delta-audit.json` records each row's fixed-source input/output differences and hashes of the final concise descriptions. These R1 records contain deltas, not complete fixtures, returns, or copied formal prose.

## L5 retained Q reference (R1 F1)

L5 has one formal pointer to `L8#/independent_context_values/retained_q_probe/value`. That node was removed from the current L8 candidate, so the L5 source now binds this pointer to the pre-removal fixed revision `f1cc56731e8862589eada60892d21e4c12d2c0df`. At that revision the pointer resolves to `retained_Q_probe`; its canonical value hash remains `f59c5e3cf545ec24b6b5c9ed14e483cd4ba126515971b95f181d3778fbec6160`. The earlier consumer audit's claim that no formal pointer existed was incorrect; the R1 record identifies L5 as the consumer. The L5 source pin in SCF-B-0211 reflects the fixed-revision reference update.

## Row meaning and common boundary (R1 F2)

Rows state only their own distinct inputs and result. F01 shows target-specific classifications; F02 only changed identity/edge/pair classifications; F03 only failed conditions or the concise all-supported candidate outcome; F04 only changed exception/continuation/return findings; B01 only changed authority-boundary results and owner returns. No row serializes a full return object or repeats all condition statuses.

The shared comparison boundary appears once in the document-level `operation_effect`: each supplied `unaffected_Q` remains unchanged; no row executes or establishes rename, DesignRefactor, CI, merge, authority/canonical decision, design completion, acceptance, or global stop.

The R1 row-delta audit recomputes all 158 input and expected-output differences against the fixed pre-removal revision. It preserves only changed values and structural removals in the scaffold record, and compares those differences to each concise formal row. It does not use a baseline-plus-patch recipe in the L8 document.

No naming-specific L7 test or test citation was found at the fixed base. `test_citation` remains `null`; no citation is invented. L4 and L9 remain unchanged; L5 only received the R1 source-revision binding correction. No L4/L5 algorithm, old CLI/hook/runtime/test/CI, or product operation was run. These records do not create authority, approval, design completion, acceptance, or an actual rename.

## Verification

The original `verification-summary.json` and full `evidence/check-child-before.json` / `check-child-after.json` are immutable snapshots. R1 adds a fresh check-child result and `scfctl validate` / `stale` results to its correction record after the current edits. Pair and negative_4way not-evaluated states remain visible.
