# INTELLIGENCE Stage 3 review02 補正記録

対象本文revision `4c8b91c70946d87c30fe1ea8a982a454c0374793`（body commit `4c8b91c70946d87c30fe1ea8a982a454c0374793`）。この追補は作成側の応答と証拠を記録する。旧監査・旧補正・review01記録は変更しない。34 finding（Major 20 / Minor 14）の本文対応は同名JSONの `finding_dispositions`、formal comment 5993944929の全体SHA/byte数、固定親/旧sourceのbytesは `source_pins` に記録した。これは独立review、PO承認、finding closure、実装・実行・mergeを意味しない。

固定L2/L11は `633bf12ea8f948db8ba3d6600179c4a9507377a7`、PO採択basisも `633bf12ea8f948db8ba3d6600179c4a9507377a7`、承認済みmain本文prefixは `29e814a92af2aa52afcbcdd60549b32a2448513a`。6本文すべてについてmainの全blobを先頭bytesとして保持しているかを `six_canonical_documents` に記録した。旧AAFDはHEADから到達可能な `064280b5c1c5c98f949e6e3be5ef87cbe4a4b658` を使い、R-06 `55–67`、R-07 `73–92`、受入 `20–21, 23–26, 43, 46` の非空spanを新規にpinした。

旧review01補正にはStage3追補行を含む物理行範囲外/空spanがあり、旧followupに到達不能 `64e37a6c` locatorがある。過去bytesは保存し、新記録でそのsource指定だけを訂正した。AAFD受入20–27は078以外のatomも含むため、新pinでは分割している。

## 所見ごとの対応

- **M1** — FV table separator restored: CASE-R2607-073-route-* rows joined to the six-column CASE table; table-width static check required.
- **M2** — FR parent crosswalk now declares exact, parent-specific L11 ranges from fixed 633 source; do not treat neighbouring parent rows as the source span.
- **M3** — Fixed L2 common pack contract remains an unconditional dependency for parents 001–005 and 014–020; exchange/update conditions and individual missing/stale/mismatch cases are explicit. Fixed conditional use at 006/010 remains conditional. No Stage2 candidate is authority.
- **M4** — AC-006-04 plus separate normal/negative fixtures cover confidence/assumption presence-only and undecided precision threshold recorded without pass qualification.
- **M5** — CASE-003 source-conflicting Situation Model is checked against authoritative source; source value wins, model is not promoted.
- **M6** — 005 BRAIN knowledge is an unconditional fixed-parent input; missing knowledge is a distinct failure/return case.
- **M7** — 011 comparison insufficiency returns to INTELLIGENCE judgment for additional same-condition results; missing source record returns to its source owner.
- **M8** — 008 defines the full review target set; clean-artifact false-positive and held-out new defect classification have distinct oracles.
- **M9** — 011 separates evaluation-condition revision from protocol/hardware/cache/intervention and price evidence; difference hiding, dropped misses/FP, scope and priced-cost normal cases are explicit.
- **M10** — 009 held-out mismatch uses a distinct mismatch class and checks finding/provenance rather than repeating the same mutation.
- **M11** — 014 has a standalone unauthorized-execution-outside-OS-assignment negative case; OS assignment remains the fixed return boundary.
- **M12** — 016 retains untrusted external command/repairer/input as distinct negative cases and does not infer broad write authority.
- **M13** — 019 includes an applicable exception that still applies, separately from inapplicable/unknown cases.
- **M14** — 078 old AAFD source pins use reachable commit 064280b5; R-06 is 55–67, R-07 is 73–92 including R-12, and CAC0 acceptance is 20–21,23–26,43,46.
- **M15** — 073 references only the selected old atom; CAC0 line 18 is marked reference-only rather than importing 078 acceptance atoms.
- **M16** — AC-072-02 is traced to a CASE; registration-part confusion is distinct, and AC-072-10 links X-072-01..04.
- **M17** — 073 uses free text as the sole input and rejects identity/revision, CI result, and review/merge admission changes without inventing a new owner route.
- **M18** — 067 cases independently cover no-HARNESS vs no-HELIX, unknown oracle owner, human-time cost, LABO052 same receipt, engine/assignment switch, insufficient price/model/benchmark evidence, and undefined priority.
- **M19** — 072 re-evaluation after changed source revision/digest creates a new candidate revision; shadow pending remains unfinished and is not review/active.
- **M20** — 078 retry/order, dimension mix, DB replay, and stale projection cases trace to the AC that owns each condition; stale projection is distinct from stale directive.
- **m1** — 001 domain candidate, 003 order/missing and owner return, and 005 risk-condition expectation now correspond to the fixed parent clauses.
- **m2** — 006 case does not independently decide LABO delivery; it refers delivery success to fixed L2-040.
- **m3** — Duplicate CASEs identified in the formal are removed or merged into one oracle; final CASE IDs are unique (recompute).
- **m4** — Return targets in 007/012/014/016/067/072 are limited to source-supported owners; absent destination remains unknown/held rather than a new route.
- **m5** — 014–020 negative cases state the mutated input and the disallowed result rather than generic unchanged-field prose.
- **m6** — 015 old-source wording is narrowed to the read UIL near-miss span; BBG/BBR are not cited as containing unsupported concepts. NFR-015 does not import 016 candidate/actual as a new parent duty.
- **m7** — 016 names Worker result as the evidence for repaired seeded counterexample and includes another normal case.
- **m8** — 011 distinguishes exclusion of rescue/rework/intervention from rejecting those events.
- **m9** — 007/008 negatives align each input mutation with its own expected failure; target HEAD missing does not test unrelated different-HEAD acceptance.
- **m10** — 073 separates CI gate creation from changing existing review/merge admission; both have distinct cases.
- **m11** — NFR AC references are fully qualified and supplemental AC-067-04/072-11/073-04/078-11 are traced.
- **m12** — AC-072-10 CASE list now includes X-072-01..04.
- **m13** — Corrected AAFD source commit is reachable 064280b5 with non-empty physical spans; prior 64e37 record is preserved and explicitly superseded as a locator.
- **m14** — This record does not inherit review01 “addressed” statuses as proof. Each review02 response is inventoried here; all closure/admission remains pending root verification and later independent review.

## 検証と限界

6文書の全SHA、行数、main prefix byte数/SHA、変更行raw LF SHA、固定親と旧sourceのfull SHA/bytes/行数/非空span SHAをJSONへ固定した。実行結果: `validate` 147 bindings / 0 fail、`stale=0`、`residuals=0`、`govcheck` 7622 atoms / 57 requirements / 58 files、`git diff --check` clean。21 source text/identity pinsは指定revisionの全SHA・物理行数・literal・非空raw-LF span一致。6 main prefix、177 current line pins、FV table幅、129 AC参照、862 unique CASE IDを再計算して一致を確認した。review所見の意味検収はrootが行い、別の独立reviewは未実施。対象外の旧asset/source全件再監査も行っていない。
