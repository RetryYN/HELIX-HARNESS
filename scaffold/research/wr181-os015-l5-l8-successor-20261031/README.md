# WR181 OS015 L5/L8 successor candidate

## Scope

- Pair: HELIX-OS OS015 L5/L8, `design_verification` scaffold candidate.
- Source main: `e3a16010cce138001d33df19afef92e3fa049d81` (latest main after #3940; #3939 merge/read-after included).
- L5 commit: `66887c3ea359bf042fb074b3559e16f46ce6eb88`.
- L5/L8 documents remain provisional; this evidence does not create authority, implementation readiness, or freeze.

## Projection

The merged L4 has 47 classes. L5 now has the same 47 IDs: six standalone singleton rules are removed, and the two new composite classes are added. L8 now has 47 class rows and 585 unit cases, including C0584/C0585. All 583 existing L8 case rows are unchanged. The existing 572 class links remain unchanged, including the 112 residual links from the prior projection and the earlier 29 links.

The six removed L5 singleton IDs are `OS015-NEG-first_classification_prior_present`, `OS015-NEG-first_classification_prior_unresolved`, `OS015-NEG-original_event_mutated`, `OS015-NEG-source_conflict-original_event`, `OS015-NEG-source_unresolved-original_event`, and `OS015-NEG-unresolved_promoted_to_current`.

The two added classes and manually projected L8 expectations are:

| Case | Ordered findings | Overall condition | Axis/state |
|---|---|---|---|
| C0584 | `original_event_mutated`, `source_unresolved`, `unresolved_promoted_to_current` | `management_material_violation` | `original_event` / `violation` |
| C0585 | `authority_state_unresolved`, `unresolved_promoted_to_current` | `management_material_violation` | `authority` / `violation` |

For both cases, source input is L7 `/connection_materials/OS015/case/fixture_inputs/inspect`. The explicit replacement recipe and canonical expanded-input SHA-256 are recorded in [`source-projection-evidence.json`](source-projection-evidence.json). Those hashes are kept in scaffold evidence because the L8 ownership-boundary check rejects `expanded_input_sha256` fields in L8. The expected findings and state were derived by manual comparison of the L7 input changes with the fixed L4 contract/class rows and L5 `composite_class_formation` plus surviving existing-rule owner joins. The L4 embedded algorithm was not executed. L7 `expected_proposal` and L9 expected values were not used to derive the expectation; after derivation, the two L8 expected projections were compared with L9 as a consistency check.

L5 and L8 `source_pair_pins` target exact L4/L9 path bytes from source main `e3a16010`. L8 `candidate_l5_bytes` points to the L5 commit above. L8 class pointers to L4/L5 were remapped by class ID after checking their targets.

## Static checks

`validate_successor.py` checks class identity and fields, rule ownership, JSON pointers, L7 fixture/replacement hashes, all 583 old case rows, 572 existing links, the 112 residual manifest assignments, the earlier 29 assignments, and candidate/source pins. It does not load L9 expected material.

The existing `design_verification_checker.py check-child` is used as a static document measurement. The `check-freeze` output is reported separately; its existing freeze record may remain mechanically unmatched and is not edited here. `scfctl validate`, `scfctl stale`, and `git diff --check` are also recorded in `verification-summary.json`.

The latest-main trial is based on `e3a16010`. Its only change since #3939 is `docs/helix-os/L8-unit-verification/ticket-workflow-derivation.json`, with no overlap against this pair or its binding. `SCF-B-0178` validates; stale reports four predecessor bindings (`0170`, `0175`–`0177`) still pin the prior L5/L8 bytes. Those historical bindings are not rewritten in this pair.

Reproduction:

```sh
python3 scaffold/research/wr181-os015-l5-l8-successor-20261031/build_successor.py l5
python3 scaffold/research/wr181-os015-l5-l8-successor-20261031/build_successor.py l8
python3 scaffold/research/wr181-os015-l5-l8-successor-20261031/validate_successor.py
python3 scaffold/tools/design_verification_checker.py check-child --root . --l4 docs/helix-os/L4-basic-design/management-authority-source-record.json --l5 docs/helix-os/L5-detail-design/management-authority-source-record.json --l8 docs/helix-os/L8-unit-verification/management-authority-source-record.json --l9 docs/helix-os/L9-integration-verification/management-authority-source-record.json
python3 scaffold/tools/design_verification_checker.py check-freeze --root . --worktree docs/governance/audits/tdd/os007-os015-function-pair-freeze-2026-10-28.json
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
git diff --check
```

No L4 algorithm, old HELIX runtime/CLI/hook/test/CI, product runtime, test, or CI is invoked.
