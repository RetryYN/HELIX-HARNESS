# HIL-BR-15 Product Data consumer fanout audit

## Scope and authority

This is a source-condition audit and a corrective revision of the existing `HELIXOS-L2-112` candidate. It does not create the reserved identity 123 or add a source atom: the fanout words belong to the already selected `HIL-BR-15` atom in the four-atom 112 input. The 2026-09-28 HELIX-OS decision fixes/adopts the exact parent L1 only; it does not adopt L2/L11-112. Candidate metadata, this audit, receipt, and MPR registration have `authority_effect: none`.

The fixed source is old L1 `infinity-loop-platform-requirements.md:67` (SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`, line SHA-256 `880385839788ea49f14544ee9dd0f1ed5037bc84b1707a9ba55f4fa6a267c2f5`) and `requirements.json#/HIL-BR-15/statement` (file SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`, statement semantic digest `sha256:5f5450b0a801f1f4c6650a0b4ddb87d5eee23400f2126332ed0038ed06f01115`). It requires a provenance/freshness/schema/authority-bearing canonical Product Data projection to supply six named functions: design decisions, coverage, impact, Issue routing, docgen, and detector. The exact source line and one-atom relationship are recorded in [the supplemental source-condition ledger](../requirement-registration/hil11-br15-consumer-fanout-source-lines-2026-10-02.jsonl).

Supporting source was read, not executed: `HR-FR-HIL-11`; `HAC-HIL-11a/b/c`; `HAT-HIL-11` (`designed_not_implemented`); old L5 `product-data-connector.md:33-57,86-109,193-238`; and old L6 `product-data-connector.md:27-57`. The HACs supply positive full/incremental lineage, negative drift/regression/PII no-current-advance, and stale/tombstone boundary oracles. L5/L6 describe consumer-facing projection and failure boundaries. They do not establish current execution or successor authority.

## Current condition-by-condition comparison

| HIL-BR-15 condition | Current exact destination before this correction | Result |
|---|---|---|
| Versioned Product Data read source, canonical projection with provenance/freshness/schema/authority | OS L2-112 `governance-requirements.md` section, especially “source registry and source key”, “projection”, “tombstone/freshness/schema”, and “data-use/redaction”; paired L11-112 normal/negative/boundary oracle. General adopted OS 015/016/007/009 and CONNECT conditions provide adjacent identity/provenance/transport only. | Candidate source/projection conditions exist; they are not adopted and do not supply the BR15 consumer fanout oracle. |
| Design decisions | L2-112 generic selected `requirement/design/Issue等` identity/revision mapping; L11-112 says only explicitly selected refs count. No design-decision role-specific coverage fixture. | Partial generic mapping only. |
| Coverage | No role-specific current L2/L11-112 consumer identity/revision edge or missing-coverage failure fixture. | Residual. |
| Impact | No role-specific current L2/L11-112 consumer identity/revision edge or missing-impact failure fixture. | Residual. |
| Issue routing | Generic Issue consumer mapping exists, but routing as a separately tracked fanout role and its missing/wrong-revision oracle are not stated. | Partial generic Issue mapping only. |
| Docgen | No role-specific current L2/L11-112 destination or oracle. | Residual. |
| Detector | No role-specific current L2/L11-112 destination or oracle. | Residual. |
| Projection to all named roles / complete fanout claim | L11-112 explicitly limits input to selected consumer refs and says the old BR15 list is not adopted as the consumer set. It has no per-role completeness oracle. | Existing scope is intentionally selected-only. The omitted role list cannot silently be considered covered or nonapplicable. |

The correction adds an explicit role-by-role accounting condition and static positive/negative fixtures while retaining the current selected-scope boundary. It does not decide that every source must use all six consumers, assign actual consumers or owners, choose product scope/schema/mapping semantics, or transfer product business meaning to OS. A source not selected is unobserved; a selected consumer without its own identity/revision, owner-declared mapping, and source lineage fails or remains unknown. A complete fanout claim requires all six role dispositions to be explicit; unresolved roles remain partial/unknown. The source owner and consumer owners continue to own source and business semantics.

Adjacent adopted pairs were read as boundaries, not substitutes: OS-015/016/007/009 cover generic identity/provenance/event/projection/durable reconstruction; HARNESS-019/027/038 and CONNECT transport do not define Product Data consumer role mapping; SECURITY retains authority/data-use. The existing 112 candidate remains `version_target: 2.0 candidate`; no first-version advancement is made.

## Upstream meaning choices

The source itself names the six roles. It does not resolve whether every selected source must target all six, which roles apply to a given selected source, or who owns each consumer. The candidate records rather than resolves this upstream scope choice:

- **A — all six for every selected source:** treat each of the six named roles as mandatory for every selected Product Data source. This gives the strongest fixed fanout but chooses a broader applicability rule not specified by a source-specific owner selection.
- **B — owner-declared applicability per selected source (recommended):** retain all six named roles as independently accounted dimensions; for each selected source, the relevant source/consumer owners explicitly select role applicability and identity/revision. Missing selected-role mappings fail; unresolved roles block a complete fanout claim. This preserves BR15’s named fanout without inventing owners, source set, or applicability.
- **C — selected refs only, no fanout completeness claim:** retain current limited 112 mapping behavior and leave the six roles as historical source references without requiring per-role accounting. This leaves the BR15 supply condition unrepresented in the candidate oracle.

Recommendation B. The candidate text implements B as an unresolved proposal, not as an approved meaning change. The decision affects HIL-BR-15's applicability and completeness claim, with related HIL-FR-23 source registration, HIL-FR-24 mapping, and HIL-NFR-17 access/data-use boundaries remaining as already recorded in 112. The candidate’s `version_target: 2.0` and other source conditions are unchanged.

## Static fixtures and limits

L11-112 now names all six role classes in a normal fixture and requires separate consumer identity/revision, owner-declared scope/mapping, and source lineage. Six single-role omission cases, wrong consumer revision, missing/unknown owner or scope, missing mapping/lineage, and unselected-source cases independently produce failed/unknown/partial results. One role edge cannot discharge another; a document reference cannot substitute for a selected source projection. Fixtures use synthetic identities as examples only and do not select actual consumers or owners.

No runtime, external source, old HAT, old test, CI, or CLI was run. These are candidate acceptance conditions; they do not assert actual fanout execution, adopted status, formal successor binding, owner transfer, or requirement-stage closure.

## Revision pins

- Base read: `26ce66202f7a57230093701fc90abb2f9f1c355f`.
- Parent L1: decision-fixed commit `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, exact SHA-256 `2bb62571308aa1fde0351ca7242e961ddd25b9c4722196c7bb255cf3ad1cfe0e`; the bytes match at the base.
- Current candidate section digests, full-file pins, supplemental ledger pin, and MPR revision are recorded in the paired receipt and append-only register revision `MPR-RC-HELIXOS-L2-112-002`.
- Prior receipt `...-001`, MPR revision `...-001`, original source-lines ledger, fixed-source hashes, and historical audits are preserved as their point-in-time records.
