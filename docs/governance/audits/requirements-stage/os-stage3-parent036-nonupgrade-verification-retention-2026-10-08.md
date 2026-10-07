# HELIX-OS Stage 3 parent036 non-upgrade verification retention correction audit (2026-10-08)

## Scope and fixed authority

This immutable point-in-time audit records a narrow internal-consistency correction for adopted parent `HELIXOS-L2-036`, Stage 3, `version_target: 1.0`, in a worktree based on exact main `9229f59edc36b8396ea99bde5f6f903b35c1ccdf`. It does not change the fixed parent, owner, scope, applicability, version, or the upgrade-specific preflight ordering condition. It does not add a new gate, authority, actor, verification policy, numeric threshold, or operational permission.

The previous Stage 3 delegated decision at this base is still an earlier content snapshot: its reviewed revision is `f3e5f40a55be02ad7a92668dced4e32619a75ae0` (record bytes SHA-256 `48f590122e1c9237e9f1e787c97edb53217cf85a91f703b1d16ad1fb26f816a6`). This correction creates a different six-document revision; the prior decision does not silently cover the modified bytes. This audit is evidence of a proposed correction, not an L3 approval or condition-3 result. No independent review, post-record pin check, PO post-confirmation, or fixture execution is claimed.

## Fixed parent and old-source evidence

The adopted fixed L2/L11 source is commit `633bf12ea8f948db8ba3d6600179c4a9507377a7`. Raw full-file and line-inclusive span hashes were recalculated from Git bytes:

| Source | Locator | Full bytes / SHA-256 | Raw span bytes / SHA-256 |
|---|---|---|---|
| L2-036 | `docs/helix-os/L2-requirements/governance-requirements.md:1033–1064` | 447207 / `c530b01dbf396481f3ea0124f9a603d2a8ddfb813c9ab1e88db316262342949a` | 8683 / `1db82b6f6f2877d1938fa5082e91f781692c56fc59d726350a9ef6f2296d2921` |
| L11-036 | `docs/helix-os/L11-acceptance/governance-acceptance.md:624–636` | 331746 / `40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997` | 2447 / `25b0a97de4e4b36a4c3925664ff383455b94bfd3f3dfef1deea7bd78193bf0d1` |

The relevant fixed L11 boundary at `governance-acceptance.md:634` says non-upgrade Retrofit is outside the old upgrade ordering condition while existing HARNESS verification duties and other read-only verify policy remain. Fixed L2:1039/1045/1047/1061 distinguishes the universal upgrade preflight condition from the old `RETROFIT_STANDARD_SAFE` read-only doctor verify policy and disallows extending it into general apply authority or defining checker meaning in OS.

| Old asset and read locator | Full source SHA-256 | Raw span SHA-256 |
|---|---|---|
| `LEGACY-ASSET-02319C2481B9E01698D5` `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:624–624` | `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406` | `2014a23fd29156eb5ae7111e25d47a9093d1c3ffda2099f10e6068e3c3f7a2f4` |
| `LEGACY-ASSET-31D606AEA5C40091CD49` `archive/legacy-generation-2026-09-14/root/docs/process/modes/retrofit.md:30–39` | `b7b053d867fd5f59c9256d1d60e4685d64c10ef50ff1f9de665dcf506d13c049` | `50ec63e82ac50ed586b04743e9fcce9a7cddbbcecb0e2448c7d3008257fc1b49` |
| `LEGACY-ASSET-31D606AEA5C40091` `archive/legacy-generation-2026-09-14/root/docs/process/modes/retrofit.md:84–87` | `b7b053d867fd5f59c9256d1d60e4685d64c10ef50ff1f9de665dcf506d13c049` | `11db512a99c0acc98be0d0192ed8ea1c0fd43455761eacb99a0b00e26b711d70` |
| `LEGACY-ASSET-75776FE016E550F5355F` `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-concept_v3.1.md:445–445` | `b6cecb7bec29d85b36e299f8a594821c1d778328506fe2c056ca330ef76d968c` | `12bcc89ee75f44699b25a70f4a9fb5d603b723c39c39a4b5a948dec6ec41e738` |
| `LEGACY-ASSET-75776FE016E550F5355F` `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-concept_v3.1.md:470–471` | `b6cecb7bec29d85b36e299f8a594821c1d778328506fe2c056ca330ef76d968c` | `bc152988b871939fad32575aa8f630491e7846f7fb25eecbccd9debe5355cc3a` |
| `LEGACY-ASSET-27224BBE5714E3442753` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/workflow-execution-policy-registry.v1.json:141–155` | `eeb30c1bb51f74798563b31b0802b301fb687d2e750c517061588969a7ff344f` | `763988cce3576f9421ebf7ce87f0f9a83fcff44c2cc2a1c9abcc898969740b3f` |

The source meanings were read directly from the archive: v1.3 requirements line 624 requires preflight for upgrade; old Retrofit process lines 30/36–39/86 places high-risk preflight in impact assessment and stops migration planning on failure; old Concept lines 445/470–471 describes the upgrade/high-risk preflight distinction; the old policy registry lines 141–155 defines `RETROFIT_STANDARD_SAFE` as a `HELIX_DOCTOR` verify-stage, read-only policy, not apply authority. The existing HELIX-OS L2/L11 keeps the all-upgrade condition and read-only boundary. This correction retains those meanings, re-derives the explicit non-upgrade retention oracle from fixed L11, and replaces only the omission in the current L3/L10 trace. Old tool, CLI, workflow, runtime, and tests were not executed.

## Change recorded

- `FR-OS-L3-036 AC-03` now says that non-upgrade Retrofit does not inherit the upgrade-only preflight ordering condition, while all selected/applicable existing HARNESS verification duties and other read-only verify policies remain. Exclusion from one ordering condition is not a reason to omit them.
- `CASE-OS-L10-036-07` is a normal non-upgrade contrast: it provides the operation's selected/applicable existing duties and read-only policies, expects them retained, and expects no new upgrade-specific preflight ordering.
- `CASE-OS-L10-036-08a` independently omits one selected HARNESS duty while preserving other fields; it must remain unfinished and return the missing verification duty/oracle to HARNESS-L2-005 owner.
- `CASE-OS-L10-036-08b` independently suppresses one selected read-only policy while preserving other fields; it must not report success or generate preflight/apply authority, and returns the missing policy to its existing source/policy owner.
- The existing NFR upgrade coverage population remains all Retrofit upgrades. Non-upgrade retention cases are reported separately, not included in the upgrade preflight denominator; the two single-mutation omissions are expected to be 0 under the fixed L11 oracle. No new numerical threshold is introduced. L10 business and NFR summaries trace the same boundary.

The prior NFR value of 100% is only the existing all-upgrade coverage candidate and is unchanged. No new fixed policy applicability rule is inferred from the old registry: fixture inputs include only policies that are already selected/applicable for that operation.

## Six-document byte comparison

The before values are exact `9229f59` Git bytes. After values are the current worktree bytes for the proposed correction; the two documents not edited remain byte-identical.

| Document | Before bytes / SHA-256 | Proposed after bytes / SHA-256 |
|---|---|---|
| L3-BR `docs/helix-os/L3-requirements/business-requirements.md` | 20354 / `cbe1866df47503b17e8a11b786dee8da58cd8a2a0a99778b64bd4a669b2fa702` | 20354 / `cbe1866df47503b17e8a11b786dee8da58cd8a2a0a99778b64bd4a669b2fa702` |
| L3-FR `docs/helix-os/L3-requirements/functional-requirements.md` | 201537 / `95a6f1c5bdd1015d8849829de88fd99e62c842784135e4ebdbd5b4140d843544` | 201770 / `ccec2331526dc45ad6d6eb90ada45499be65f0289640a2fb1695c798cc2ae844` |
| L3-NFR `docs/helix-os/L3-requirements/nfr-grade.md` | 32737 / `ec63ecd54db5258ff14714624c3df6bcfd3c1c189ac9a08a29271c06231e3066` | 33273 / `481766945e85e295c93c1b0edd5d1dffdb5b29c3c94cd74150e3080722b6c269` |
| L10-BV `docs/helix-os/L10-verification/business-verification.md` | 17702 / `5a75c21ce10b33fc8441adda71253870fd20a8687c18e7939cfe8b25f9d393c8` | 17774 / `f785e13aa9a1ef8494154f03e20d0582418916281c51a6b729d385d5b66ef051` |
| L10-FV `docs/helix-os/L10-verification/functional-verification.md` | 240108 / `8a99792f723abb96034274c72424902fba51df515e2a99f637823427aa03821c` | 241379 / `463be80d9cbad87b30350f7e7032d927f184b13f510bfa06d9e4c7a91459ff4f` |
| L10-NFRV `docs/helix-os/L10-verification/nfr-verification.md` | 29480 / `3019648b66a351418945033646bf82c84d0c7ef771edee49378cef2be266e256` | 29719 / `787a430bad71df2b019b8c3ecd476292f54753af9529d845611d0074e5d7bf9e` |

Only FR, NFR, L10 business summary, L10 functional CASEs, and L10 NFR measurement text changed. L3 business requirements remain unchanged because parent036 has no independent business outcome and the existing business row remains a projection of the functional result. L10 business summary was updated to reflect that existing boundary without creating a new outcome.

## Static verification and limits

`git diff --check` passes. Static checks confirm the three new CASE IDs are unique; all three target `AC-OS-L3-036-03`; the FR AC is present; both the L3 NFR and L10 NFR reference CASE-036-07/08a/08b; and all six canonical-document before/after hashes are recorded. No old test, CI, runtime, CLI, or hook ran.

This is a parent036-only correction. Other Stage 3 parents, other OS stages, other mechanisms, all old consumers, and runtime behavior are not re-audited here. The full six-body revision requires a fresh independent delegated review and its own condition-3 comparison before approval/effect. The PO post-confirmation remains unrecorded.
