# INTELLIGENCE Stage 4 review04 correction audit

- Formal comment: `6001683464` (Opus); exact markdown SHA-256 `8127c36a94a4d59961aeef04204f4e69e7b80249725af8be8930e800c893fba0`.
- Base `5acae384305b01d10e88eeb2e6406f847baf66df`; fixed L2/L11 `633bf12ea8f948db8ba3d6600179c4a9507377a7`; body `1b688087197da8e777e8a3399b1166389b0f9e3b`.
- Six document main-prefix checks: all exact. Current appended suffix: 1470 physical lines. CASE inventory: 597 Stage 4 definitions, unique.
- M15 correction: prior root record `aa59ac770afc695260a2b38f120f8e015ed9f0923c7e5a4a5342dd3c2371fe3e` is unchanged; its summary says 1451 while its suffix pin array has 1455 entries. Correct historical count is 1455. The contradictory latest-main stale claim is retained in the old record; this worker did not run scfctl stale. Current suffix count is 1470.

## Findings

- **M1** — addressed: FV 032-02c rejects Pattern application/no candidate and preserves BRAIN canonical; 02f rejects writes; fixed L2/L11 source pins attached.
- **M2** — addressed: CASE-INT-037-02j added; AC-037-02 and FR/NG/NV/BR/BV crosswalks updated.
- **M3** — addressed: CASE-INT-036-04k isolates known action with missing permission result; AC and five trace documents updated.
- **M4** — addressed: 036-02g remains actor-only; 02n action-only; 02o target-only; 03b contrasts unseen requested action with valid permission for a different action.
- **M1** — addressed: FR-030 AC-04 range now 04a–04f.
- **M2** — addressed: FR-032 and FV 032-01 owner wording now BRAIN knowledge owner.
- **M3** — addressed: FR-017 AC-03 spells four-stage authority-complete result and stage-only hold; AC-04 authority unknown route.
- **M4** — addressed: FR-017 separates BBR requirements 35–58 and request context 18–29; inherited full pin 1–29 retained.
- **M5** — addressed: FV-035-02e/f keep mapping/issuance with OS and return malformed candidate to INTELLIGENCE candidate owner; ticket is not generated.
- **M6** — addressed: FR-033/034/036 includes source asset IDs, paths, and cited lines.
- **M7** — addressed: FV 034-02i and 036-02l/04i owner text aligned to L3 responsibility wording.
- **M8** — addressed: FV/FR 037-04g says compatibility range undeclared or unknown.
- **M9** — addressed: FR-037 now names WCC and HAT-WCC IDs/path/lines; wrong actor/ticket result oracle is rederived from fixed L2/L11.
- **M10** — addressed: FV-039-02d rejects OS acceptance receipt generation and keeps OS authority.
- **M11** — addressed: FR-039 derives unselected connector negative from HARNESS-L2-010/011 plus selected CONNECT contract.
- **M12** — addressed: FV-045-02k fixes known target and routes through candidate to known Product Core owner; no owner query.
- **M13** — addressed: CASE-045-03 excluded explicitly from NFR denominator; direct-route 02k remains measured.
- **M14** — addressed: FV-045-02b/c/d/h/i/j specify known target and issue-specific candidate return; 02d corrects wrong-owner route.
- **M15** — addressed: New audit below corrects the reported 1451/1455 and stale contradiction; prior audit is immutable.
- **M16** — addressed: FR-040 explicitly scopes L11 231–251 to not-adopted L2-069/070/071 and preserves Stage4 parents 033/040 only.

## Source and static evidence

Fixed parent/L11 spans and recalculated BBR 18–29 source pin are in the JSON. The other legacy source pin set is inherited by hash from the immutable review03 correction audit. Six current documents, full CASE literals, input/oracle and AC mapping, and suffix line pins are recorded there.

## Unreviewed / limitations

- 共通pack 05a〜q fieldとHARNESS-L2-010/011本文の意味照合は未実施。
- 旧source cited span beyond inherited pinsの意味照合とpin外適合source網羅検索は未完。
- 旧10-05 CASE、全Worker followup pins、G0 addendum意味、register digestの全再計算は未実施。
- latest mainとmergeした統合木のscfctl stale確認はRoot検収範囲であり、このworkerでは未実行。

No old CLI, hook, runtime, test, CI, or Bun was executed. The tree-level `scfctl stale` check remains outside this worker verification.
