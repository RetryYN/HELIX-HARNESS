# HARNESS-043 review01 post-body audit candidate

Status: `post-body integrity/source-pin audit candidate only; not independent review, not approval, not fixture execution`

## Target and actual changes

- Worktree HEAD `44962549199a781ceeaf2b32a558d33f06e907b4`; parent `72a16dc16db37c21cef20c9ce918d402a4f298fb`; review base `3c3c512c09320c0494904602b23e544a81206eed`; merge-base `3c3c512c09320c0494904602b23e544a81206eed`.
- Only these two paths changed: `docs/helix-harness/L3-requirements/functional-requirements.md` and `docs/helix-harness/L10-verification/functional-verification.md`. Existing `docs/governance/audits` files did not change; worktree is clean.
- M1 removes L2-005 as a mandatory profile source/route while preserving risk additions only when the selected scope's risk analysis identifies uncovered area. M2's three single-cause cases route only to the cause-specific existing owner.
- Root's final `CASE-HARNESS-L10-043-r10-risk-oracle-to-004` row contains the mutation only in the mutation column; its oracle no longer repeats the mutation sentence.
- FR exact replacements from the correction candidate occur once in the post-body FR. All correction-candidate FV rows occur once except the above R10 row, which has the corrected post-body oracle recorded in JSON.

## Six document pins at the post-body HEAD

| Document | Prefix equals base | Suffix SHA-256 | Full SHA-256 |
|---|---:|---|---|
| `docs/helix-harness/L3-requirements/functional-requirements.md` | yes | `0255de529bc1b5995f7fe7f1c62d3e0ba38c5fbfba9d4a20247d4625c25a746f` | `f5c5cc3dd27d66774a3a790048ae78c41e1e85ede70a7c03f713f599f2822ea5` |
| `docs/helix-harness/L3-requirements/business-requirements.md` | yes | `8d806b285b554f895d1e3b8125b92e398db31ca5bcab68296d866a06c07e9129` | `76d0608a75c0b92dfa4802d3903e1057f83cde6308a47e79255d840b3a92592d` |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | yes | `be99bed2c7755145b8a0f1ae8703e398f42926d5c39721857ca780954022cdf3` | `ecebd6f33a2c9a7c50079bd6f0018124c1ea3bb0f536ace87a4a7ba3a3e5c061` |
| `docs/helix-harness/L10-verification/functional-verification.md` | yes | `d01761a79e50e5525cee84f916420b1fde254f0c62e5989d7724c26bfb6e55bf` | `9848f6916613f3f6be4b8ef522497b9c513108519c4eaaf222ea0b187a4e12d7` |
| `docs/helix-harness/L10-verification/business-verification.md` | yes | `233f15d3911b5fe44c4b6041f9ed348e08d2cd6814fd27dcfd4c1cb12c0a1c9f` | `51a4cbd6825a72cafbbdf50a487445bb3373e6c2d8199094f645d139a8e2355f` |
| `docs/helix-harness/L10-verification/nfr-verification.md` | yes | `047c937dc87c01fb22b44ce900e932a0e47d43e02609695d90eb6b55df576281` | `6e5b9afef8ed3f5be83f8dd3a77e58fe0a19209c54d104fcb4222b885a56a14d` |

All six prefixes match the exact base file bytes. Four suffixes match the pre-correction candidate byte-for-byte; FR and FV have the intended Root corrections.

## IDs and source pins

- FV contains 43 unique six-column IDs, identical to the expected 43-ID inventory. All 28 historical IDs are present; their physical raw-LF pins match 28/28.
- Fixed PO/source/support pins match 25/25.
- The exact formal review01 comment `6022949036` and its R1–R8 raw section are preserved in the companion JSON with verified SHA-256. Fixed adopted L2/L11 spans, PO row, old source/consumer pins, and raw literals are retained there.

## Verification and limits

- `git diff --check` parent..HEAD: exit 0. Root reports govcheck PASS; that check was not rerun by this Worker.
- Fixtures remain unexecuted. This audit is not an independent review, Fable judgment, L3 approval, or completeness proof.
- No canonical file was changed by this Worker.
