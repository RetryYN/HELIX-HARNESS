#!/usr/bin/env python3
"""Generate the Wave43 schema10 research-premise ledger.

The generator reads the preserved requirement decomposition and the legacy
catalog only.  It never imports or executes anything below the legacy
archive.  The selected source spans and asset IDs are deliberately explicit
so a later wave can extend ``UNIT_SPECS`` without changing the extraction
rules.
"""
from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ARCHIVE = ROOT / "archive/legacy-generation-2026-09-14/root"
OUT = Path(__file__).resolve().parent
BATCH = "LEGACY-SEMANTIC-WAVE43-2026-09-22"
BASE = "f805a12cc16d2c776107ae224349e8863c8b602f"
MAIN_MERGE_PARENTS = [
    "6396443e150d285b0b08edd43ea52a26f85dd434",
    "3a6e04bd2188700ba71682910a26bca5045c5997",
]
CATALOG_PATH = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
CROSSWALK_PATH = "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DECOMPOSITION_PATH = "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
REQ_RELATION_PATH = "docs/governance/legacy-ir-document-source-relation.jsonl"
DISPOSITION_PATH = "docs/governance/legacy-asset-disposition.jsonl"
DECISION_PATH = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER_PATH = "docs/governance/legacy-asset-copy-read-after.jsonl"
REQ_IR = ARCHIVE / "requirements-ir/requirements.json"
REQ_SHA = "80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688"
REQUIREMENT_ASSET = "LEGACY-ASSET-A60CF91DD2AF6693E6F9"
SUPPLEMENTAL_ASSET_IDS = ["LEGACY-ASSET-D94F2C0530850989B5F4", "LEGACY-ASSET-4C617862F5CC7658A26F", "LEGACY-ASSET-74D3C8036FE339074F7C", "LEGACY-ASSET-095374F9C8C82BCD8897"]

# Each entry is one product-unit source chain.  Asset selection is kept
# separate from meaning fields; the latter come from the decomposition record.
UNIT_SPECS = [
    {
        "unit": "IRUNIT-HIL-NFR-12-HELIX-OS",
        "query": {"anchors": ["source"], "match_mode": "archive_file_contains_all_utf8_anchors"},
        "design_asset": None,
        "implementation_asset": None,
        "missing_roles": ["design", "implementation_source"],
        "atom_prefix": "NFR12-OS",
        "composite_unresolved_count": 1,
        "evidence": {},
    },
    {
        "unit": "IRUNIT-HIL-NFR-13-HELIX-OS",
        "query": {"anchors": ["artifact", "digest"], "match_mode": "archive_file_contains_any_utf8_anchor"},
        "design_asset": "LEGACY-ASSET-24A3D981F1ED04404AA5",
        "implementation_asset": None,
        "missing_roles": ["implementation_source"],
        "atom_prefix": "NFR13-OS",
        "composite_unresolved_count": 1,
        "evidence": {
            "design": ("docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md", 1, 80, []),
        },
    },
    {
        "unit": "IRUNIT-HIL-NFR-15-HELIX-HARNESS",
        "query": {"anchors": ["CI", "ci", "artifact", "digest"], "match_mode": "archive_file_contains_any_utf8_anchor"},
        "design_asset": "LEGACY-ASSET-961CEACE51E1887AC197",
        "implementation_asset": "LEGACY-ASSET-F2BDED5ABF936633B12D",
        "missing_roles": [],
        "atom_prefix": "NFR15-HARNESS",
        "composite_unresolved_count": 1,
        "shared_with": ["IRUNIT-HIL-NFR-15-HELIX-OS"],
        "shared_fragments": ["commit/tree digestと直前段receiptへbind"],
        "evidence": {
            "design": ("docs/design/harness/L6-function-design/development-ci-bounded-time.md", 1, 33, []),
            "implementation_source": ("src/lint/l14-close-audit.ts", 1, 80, []),
        },
    },
    {
        "unit": "IRUNIT-HIL-NFR-15-HELIX-OS",
        "query": {"anchors": ["CI", "ci", "artifact", "digest"], "match_mode": "archive_file_contains_any_utf8_anchor"},
        "design_asset": "LEGACY-ASSET-210D6B145CA997AE3CFA",
        "implementation_asset": "LEGACY-ASSET-CB3417C6C933B5786878",
        "missing_roles": [],
        "atom_prefix": "NFR15-OS",
        "composite_unresolved_count": 1,
        "shared_with": ["IRUNIT-HIL-NFR-15-HELIX-HARNESS"],
        "shared_fragments": ["commit/tree digestと直前段receiptへbind"],
        "evidence": {
            "design": ("docs/design/helix/L6-function-design/github-ci-status-head-binding.md", 1, 53, []),
            "implementation_source": ("src/runtime/impact-ci.ts", 1, 80, []),
        },
    },
    {
        "unit": "IRUNIT-HIL-NFR-19-HELIX-HARNESS",
        "query": {"anchors": ["CI", "ci", "DIGEST", "artifact"], "match_mode": "archive_file_contains_any_utf8_anchor"},
        "design_asset": "LEGACY-ASSET-8DB8241A44EA54EF17A0",
        "implementation_asset": "LEGACY-ASSET-3D3C15358B61DC4D0324",
        "missing_roles": [],
        "atom_prefix": "NFR19-HARNESS",
        "composite_unresolved_count": 1,
        "shared_with": [],
        "evidence": {
            "design": ("docs/design/helix/L5-detail/impact-ci-recovery.md", 1, 80, []),
            "implementation_source": ("src/lint/l3-progression-reviewed-digests.ts", 1, 80, []),
        },
    },
]

ROLE_POLICY = {
    "requirement": {
        "artifact_evidence_kind": "requirement",
        "semantic_link_status": "confirmed",
        "semantic_relation": "same_requirement_id_exact_source_contract_not_implementation",
        "legacy_requirement_implementation_contribution": "contract_only_no_implementation_claim",
        "evidence_ref_count": 2,
        "unresolved": [
            "exact_head_independent_review_pending", "human_product_authority_decision_pending",
            "successor_assignment_unassigned", "product_boundary_human_decision_pending",
            "candidate_product_routing_requires_human_review", "source_atomization_review_pending",
            "unit_split_requires_independent_review", "consumer_closure_pending", "legacy_execution_not_run",
        ],
    },
    "design": {
        "artifact_evidence_kind": "design",
        "semantic_link_status": "unresolved",
        "semantic_relation": "design_contract_evidence",
        "legacy_requirement_implementation_contribution": "design_contract_only_no_implementation_claim",
        "evidence_ref_count": 1,
        "unresolved": [
            "exact_head_independent_review_pending", "human_product_authority_decision_pending",
            "successor_assignment_unassigned", "product_boundary_human_decision_pending",
            "candidate_product_routing_requires_human_review", "source_atomization_review_pending",
            "unit_split_requires_independent_review", "consumer_closure_pending", "legacy_execution_not_run",
        ],
    },
    "implementation_source": {
        "artifact_evidence_kind": "implementation_source",
        "semantic_link_status": "unresolved",
        "semantic_relation": "implementation_candidate_only",
        "legacy_requirement_implementation_contribution": "implementation_candidate_only",
        "evidence_ref_count": 1,
        "unresolved": [
            "exact_head_independent_review_pending", "human_product_authority_decision_pending",
            "successor_assignment_unassigned", "product_boundary_human_decision_pending",
            "candidate_product_routing_requires_human_review", "source_atomization_review_pending",
            "unit_split_requires_independent_review", "consumer_closure_pending", "legacy_execution_not_run",
        ],
    },
}
COUNTEREVIDENCE = [
    "Requirement／候補assetの静的snapshotであり実装・実行証拠ではない",
    "候補assetの存在は同一要求IDの実装成立・consumer closure・authorityを示さない",
    "source／phase／product candidateはresearch-premiseの静的候補であり、現行設計・実装へ昇格しない",
]
CONSUMERS = ["requirement-carry-forward-ledgers", "requirement-atomization-review"]
REVIEW_SCOPE = "Wave43 schema10 research-premise candidate: exact requirement source / product boundary / phase candidate / catalog asset role"
HOLD = "source_atomization_review_pending;product_boundary_pending_human_decision"


def read_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def prior_artifact(wave: int, suffix: str) -> tuple[str, Path]:
    """Return the checked-in path for a prior wave, including scaffold waves."""
    if wave in {37, 38, 39, 40, 41, 42}:
        rel = f"scaffold/legacy-semantic-review-wave{wave}/legacy-requirement-direct-semantic-review-wave{wave}.{suffix}"
    else:
        rel = f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.{suffix}"
    return rel, ROOT / rel


def digest(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def file_digest(path: Path) -> str:
    return digest(path.read_bytes())


def canonical(value: object) -> str:
    return digest(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())


def excerpt(path: Path, start: int, end: int) -> str:
    lines = path.read_text(errors="replace").splitlines()
    if not (1 <= start <= end <= len(lines)):
        raise ValueError(f"excerpt bounds {path}:{start}-{end}")
    return "\n".join(lines[start - 1 : end])


def archive_path(source_path: str) -> str:
    return f"archive/legacy-generation-2026-09-14/root/{source_path}"


def make_atom(atom_id: str, text: str, index: int) -> dict:
    return {
        "atom_id": atom_id,
        "boundary_review_state": "product_boundary_pending_human_decision",
        "kind": "source_semantic_atom",
        "shared_with_units": [],
        "source_fragments": [text],
        "source_span_indexes": [index],
        "text": text,
    }


def build_evidence_ref(role: str, source_path: str, start: int, end: int, ordinal: int, relation: str) -> dict:
    full = archive_path(source_path)
    body = excerpt(ROOT / full, start, end)
    return {
        "archive_path": full,
        "artifact_role": role,
        "evidence_ref_id": f"LEGACY-ASSET-WAVE43-{role}-{ordinal}",
        "excerpt_sha256": digest(body.encode()),
        "excerpt_status": "static_read_only",
        "line_start": start,
        "line_end": end,
        "source_requirement_relation": relation,
    }


def phase_projection(crosswalk: dict) -> list[dict]:
    return [
        {
            "phase_id": item["phase_id"],
            "current_status": item["current_status"],
            "legacy_capability_status": item["legacy_capability_status"],
            "transition_assessment": item["transition_assessment"],
            "gap": item["gap"],
            "catalog_asset_count": item["phase_candidate_asset_count"],
            "product_intersection_count": item["phase_and_product_candidate_asset_count"],
        }
        for item in crosswalk.get("phase_capability_evidence", [])
    ]


def candidate_ids_for_query(catalog: dict, query: dict) -> list[str]:
    ids = []
    for asset_id, asset in catalog.items():
        body = (ARCHIVE / asset["source_path"]).read_text(errors="replace")
        if (all(anchor in body for anchor in query["anchors"])
                if query.get("match_mode") == "archive_file_contains_all_utf8_anchors"
                else any(anchor in body for anchor in query["anchors"])):
            ids.append(asset_id)
    return sorted(ids)


def main() -> None:
    catalog = {row["asset_id"]: row for row in read_jsonl(ROOT / CATALOG_PATH)}
    crosswalk = {row["unit_candidate_id"]: row for row in read_jsonl(ROOT / CROSSWALK_PATH)}
    dispositions = read_jsonl(ROOT / DISPOSITION_PATH)
    decisions = read_jsonl(ROOT / DECISION_PATH)
    read_afters = read_jsonl(ROOT / READ_AFTER_PATH)
    decomposition = {}
    for parent in read_jsonl(ROOT / DECOMPOSITION_PATH):
        for candidate in parent.get("candidate_units", []):
            decomposition[candidate["unit_candidate_id"]] = (parent, candidate)
    relations = {row["requirement_id"]: row for row in read_jsonl(ROOT / REQ_RELATION_PATH)}

    rows: list[dict] = []
    bounded_receipts: dict[str, dict] = {}
    phase_rows: dict[str, list[dict]] = {}
    holds: list[dict] = []
    aggregates: list[dict] = []
    selected_units = [spec["unit"] for spec in UNIT_SPECS]

    for spec in UNIT_SPECS:
        unit = spec["unit"]
        parent, candidate = decomposition[unit]
        req_id = parent["source_requirement_id"]
        cross = crosswalk[unit]
        req_asset = catalog[REQUIREMENT_ASSET]
        design_asset = catalog[spec["design_asset"]] if spec.get("design_asset") else None
        impl_asset = catalog[spec["implementation_asset"]] if spec.get("implementation_asset") else None
        selected_assets = sorted([aid for aid in [REQUIREMENT_ASSET, spec.get("design_asset"), spec.get("implementation_asset")] if aid])
        candidate_ids = candidate_ids_for_query(catalog, spec["query"])
        if not set(selected_assets) <= set(candidate_ids):
            raise AssertionError(f"selected assets outside candidate query: {unit}")
        remaining = sorted(set(candidate_ids) - set(selected_assets))
        bounded_receipts[unit] = {
            "candidate_asset_count": len(candidate_ids),
            "candidate_asset_ids_sha256": canonical(candidate_ids),
            "catalog_record_count": len(catalog),
            "phase_pool_asset_count": cross["candidate_asset_pool"]["phase_and_product_candidate_asset_count"],
            "phase_pool_asset_ids_sha256": canonical(sorted(cross["candidate_asset_pool"]["phase_and_product_candidate_asset_ids"])),
            "query": spec["query"],
            "selected_asset_ids": selected_assets,
            "unreviewed_asset_count": len(remaining),
            "unreviewed_asset_ids_sha256": canonical(remaining),
        }
        phase_rows[unit] = phase_projection(cross)
        holds.append({"unit_candidate_id": unit, "status": spec.get("routing_boundary", "product_boundary_shared_atom_hold"), "shared_atom_ids": [], "composite_unresolved_count": spec["composite_unresolved_count"], "routing_hold": spec.get("routing_hold")})
        atom_specs = []
        for index, fragment in enumerate(candidate["source_text_spans"]):
            atom_id = f"{spec['atom_prefix']}-A{index + 1:02d}"
            atom_specs.append(make_atom(atom_id, fragment, index))
        if spec.get("shared_with"):
            shared_fragments = spec.get("shared_fragments", [])
            for atom in atom_specs:
                if any(fragment in atom["text"] for fragment in shared_fragments):
                    atom["shared_with_units"] = list(spec["shared_with"])
        atom_ids = [atom["atom_id"] for atom in atom_specs]

        asset_by_role = [("requirement", req_asset)]
        if design_asset is not None:
            asset_by_role.append(("design", design_asset))
        if impl_asset is not None:
            asset_by_role.append(("implementation_source", impl_asset))
        for role, asset in asset_by_role:
            policy = ROLE_POLICY[role]
            if role == "requirement":
                req_ranges = {"HIL-NFR-12": (4896, 4906), "HIL-NFR-13": (4939, 4949), "HIL-NFR-15": (5025, 5035), "HIL-NFR-19": (5197, 5207)}
                req_start, req_end = req_ranges[req_id]
                refs = [
                    build_evidence_ref("requirement", "requirements-ir/requirements.json", req_start, req_end, 1, policy["semantic_relation"]),
                    build_evidence_ref("requirement", "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md", int(relations[req_id]["preserved_source_pointer"].rsplit(":", 1)[1]), int(relations[req_id]["preserved_source_pointer"].rsplit(":", 1)[1]), 2, policy["semantic_relation"]),
                ]
                bindings = []
                source_sha = REQ_SHA
                evidence_state = "non_executable_source_snapshot"
            else:
                source_path, start, end, binding_specs = spec["evidence"][role]
                refs = [build_evidence_ref(role, source_path, start, end, 1, policy["semantic_relation"])]
                bindings = []
                for atom_id, anchors, required_terms, mapping in binding_specs:
                    bindings.append({
                        "anchor_evidence_terms": {anchor: terms for anchor, terms in mapping},
                        "atom_id": atom_id,
                        "evidence_ref_indexes": [0],
                        "match_mode": "controlled_term_set_partial",
                        "required_terms": required_terms,
                        "source_fragment_anchors": anchors,
                    })
                source_sha = asset["source_sha256"]
                evidence_state = "document_present" if role == "design" else "implementation_source_present_unexecuted"
            row = {
                "artifact_evidence_kind": policy["artifact_evidence_kind"],
                "asset_id": asset["asset_id"],
                "atomization_hold": HOLD,
                "authority_effect": "none",
                "batch_id": BATCH,
                "bounded_search_query": spec["query"],
                "candidate_membership_semantics": "bounded_global_search_candidate_only_not_semantic_evidence",
                "candidate_phase_targets": asset["candidate_phase_targets"],
                "candidate_product_targets": asset["candidate_product_targets"],
                "catalog_legacy_implementation_status": asset["legacy_implementation_status"],
                "classification_id": asset["classification_id"],
                "connection_records": ([{
                    "relation": "shared_source_span",
                    "shared_with_units": spec.get("shared_with", []),
                    "source_fragments": spec.get("shared_fragments", []),
                    "review_state": "product_boundary_pending_human_decision",
                }] if spec.get("shared_with") else ([spec["routing_hold"]] if spec.get("routing_hold") else [])),
                "consumer_closure_evidence": [],
                "consumer_closure_status": "pending",
                "counterevidence": copy.deepcopy(COUNTEREVIDENCE),
                "coverage": {"constraint": "product boundary／phase authority／consumer closure未確定", "failure": "未対応atom、partial evidence、またはmissing acceptance receipt", "normal": "exact source anchorを固定したstatic evidence only", "recovery": "not_evidenced"},
                "covered_requirement_atom_ids": atom_ids,
                "covered_requirement_atoms": copy.deepcopy(atom_specs),
                "current_requirement_implementation_status": "not_established",
                "evidence_atom_bindings": bindings,
                "evidence_binding_status": "requirement_source_exact" if role == "requirement" else ("literal_anchor_checked" if bindings else "semantic_relation_unresolved_no_literal_anchor"),
                "evidence_refs": refs,
                "legacy_asset_evidence_state": evidence_state,
                "legacy_execution_status": "not_run",
                "legacy_requirement_implementation_contribution": policy["legacy_requirement_implementation_contribution"],
                "new_build_allowed": False,
                "observed_consumer_refs": copy.deepcopy(CONSUMERS),
                "phase_authority_status": "candidate_unchanged",
                "phase_candidates": candidate["direct_phase_candidates"],
                "product_alignment_status": "candidate_boundary_pending_human_decision",
                "product_scope": [candidate["product_target"]],
                "reuse_exclusion_class": None,
                "review_id": f"LSRW43-EDGE-{len(rows) + 1:03d}",
                "review_scope": REVIEW_SCOPE,
                "role_kind": role,
                "routing_candidate": parent["routing_candidate"],
                "routing_state": "candidate_product_routing_requires_human_review",
                "schema_revision": 10,
                "selection_route": "bounded_global_search",
                "semantic_link_status": policy["semantic_link_status"],
                "semantic_relation": policy["semantic_relation"],
                "source_connective_fragments": list(spec.get("shared_fragments", [])),
                "source_path": asset["source_path"],
                "source_requirement_id": req_id,
                "source_requirement_legacy_markdown_span": relations[req_id]["preserved_source_pointer"],
                "source_requirement_pointer": parent["source_pointer"],
                "source_scope_fragments": [],
                "source_sha256": source_sha,
                "source_statement_semantic_digest": parent["source_statement_semantic_digest"],
                "source_statement_text": parent["statement_text"],
                "source_text_spans": candidate["source_text_spans"],
                "unit_candidate_id": unit,
                "unresolved": copy.deepcopy(policy["unresolved"]),
            }
            rows.append(row)
        aggregates.append({"unit_candidate_id": unit, "reviewed_edge_count": len(asset_by_role), "semantic_link_counts": {"confirmed": 1, "rejected": 0, "unresolved": len(asset_by_role) - 1}, "direct_confirmed_implementation_asset_ids": [], "phase_authority_status": "candidate_unchanged"})

    selected_asset_ids = sorted({row["asset_id"] for row in rows})
    asset_status_receipts = []
    for asset_id in selected_asset_ids:
        asset_dispositions = [row for row in dispositions if row.get("asset_id") == asset_id]
        asset_decisions = [row for row in decisions if row.get("asset_id") == asset_id]
        asset_read_afters = [row for row in read_afters if row.get("asset_id") == asset_id]
        asset_status_receipts.append({
            "asset_id": asset_id,
            "disposition_records": [
                {
                    "revision": row.get("revision"),
                    "disposition": row.get("disposition"),
                    "implementation_status": row.get("implementation_status"),
                    "authority_status": row.get("authority_status"),
                    "reuse_exclusion_class": row.get("reuse_exclusion_class"),
                    "decision_record_ref": row.get("decision_record_ref"),
                    "read_after_record_ref": row.get("read_after_record_ref"),
                    "consumer_refs": sorted(row.get("consumer_refs", [])),
                }
                for row in asset_dispositions
            ],
            "decision_ids": [
                {
                    "decision_id": row.get("decision_id"),
                    "decision_revision": row.get("decision_revision"),
                    "disposition": row.get("disposition"),
                    "consumer_refs": sorted(row.get("consumer_refs", [])),
                }
                for row in asset_decisions
            ],
            "copy_read_after_records": [
                {
                    "read_after_id": row.get("read_after_id"),
                    "digest_match": row.get("digest_match"),
                    "consumer_match": row.get("consumer_match"),
                    "failure": row.get("failure"),
                    "consumer_refs_observed": sorted(row.get("consumer_refs_observed", [])),
                }
                for row in asset_read_afters
            ],
            "historical_consumer_refs": sorted({
                ref
                for row in asset_dispositions + asset_decisions
                for ref in row.get("consumer_refs", [])
            } | {
                ref
                for row in asset_read_afters
                for ref in row.get("consumer_refs_observed", [])
            }),
            "failure_status": "historical_failure_field_preserved" if asset_read_afters else "no_selected_failure_record",
        })

    supplemental_asset_receipts = []
    for asset_id in SUPPLEMENTAL_ASSET_IDS:
        asset = catalog[asset_id]
        asset_dispositions = [row for row in dispositions if row.get("asset_id") == asset_id]
        asset_decisions = [row for row in decisions if row.get("asset_id") == asset_id]
        asset_read_afters = [row for row in read_afters if row.get("asset_id") == asset_id]
        supplemental_asset_receipts.append({
            "asset_id": asset_id,
            "selected_role_edge": False,
            "source_path": asset["source_path"],
            "source_sha256": asset["source_sha256"],
            "artifact_evidence_kind": asset["artifact_evidence_kind"],
            "classification_id": asset["classification_id"],
            "legacy_implementation_status": asset["legacy_implementation_status"],
            "legacy_execution_status": "not_run",
            "decision_count": len(asset_decisions),
            "read_after_count": len(asset_read_afters),
            "consumer_refs": sorted({ref for row in asset_dispositions + asset_decisions for ref in row.get("consumer_refs", [])} | {ref for row in asset_read_afters for ref in row.get("consumer_refs_observed", [])}),
            "current_implementation": "unknown_pending_direct_current_review",
            "degradation": "unknown_pending_direct_current_review",
        })

    missing_evidence_receipts = []
    for spec in UNIT_SPECS:
        if spec.get("missing_roles"):
            unit = spec["unit"]
            parent, candidate = decomposition[unit]
            cross = crosswalk[unit]
            pool = cross["candidate_asset_pool"]
            for role in spec["missing_roles"]:
                missing_evidence_receipts.append({
                    "unit_candidate_id": unit,
                    "role_kind": role,
                    "status": "missing_evidence_recorded",
                    "reason": ("crosswalk phase_and_product_candidate_asset_count is zero; no direct asset evidence was selected" if pool["phase_and_product_candidate_asset_count"] == 0 else "crosswalk candidate pool contains no implementation_source asset available for this role; no direct asset evidence was selected"),
                    "phase_candidates": candidate["direct_phase_candidates"],
                    "phase_pool_asset_count": pool["phase_and_product_candidate_asset_count"],
                    "candidate_product_targets": parent["candidate_product_targets"],
                    "current_implementation": "unknown",
                    "degradation": "unknown",
                    "consumer_closure": "pending",
                    "legacy_execution": "not_run",
                })

    ledger_path = OUT / "legacy-requirement-direct-semantic-review-wave43.jsonl"
    ledger_path.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in rows))

    inputs = {
        "archive/legacy-generation-2026-09-14/MANIFEST.sha256": file_digest(ROOT / "archive/legacy-generation-2026-09-14/MANIFEST.sha256"),
        CATALOG_PATH: file_digest(ROOT / CATALOG_PATH),
        CROSSWALK_PATH: file_digest(ROOT / CROSSWALK_PATH),
        DECOMPOSITION_PATH: file_digest(ROOT / DECOMPOSITION_PATH),
        REQ_RELATION_PATH: file_digest(ROOT / REQ_RELATION_PATH),
        DISPOSITION_PATH: file_digest(ROOT / DISPOSITION_PATH),
        DECISION_PATH: file_digest(ROOT / DECISION_PATH),
        READ_AFTER_PATH: file_digest(ROOT / READ_AFTER_PATH),
        "docs/governance/phase-capability-inventory.json": file_digest(ROOT / "docs/governance/phase-capability-inventory.json"),
        "docs/concept/product-boundary.md": file_digest(ROOT / "docs/concept/product-boundary.md"),
        "docs/helix-harness/L1-planning/product-intent.md": file_digest(ROOT / "docs/helix-harness/L1-planning/product-intent.md"),
        "docs/helix-os/L1-planning/system-intent.md": file_digest(ROOT / "docs/helix-os/L1-planning/system-intent.md"),
        "docs/helix-web/L1-planning/product-intent.md": file_digest(ROOT / "docs/helix-web/L1-planning/product-intent.md"),
        "docs/helix-web-os/L1-planning/system-intent.md": file_digest(ROOT / "docs/helix-web-os/L1-planning/system-intent.md"),
        "docs/governance/legacy-ir-target-routing-queue.jsonl": file_digest(ROOT / "docs/governance/legacy-ir-target-routing-queue.jsonl"),
    }
    for wave in range(1, 43):
        for suffix in ("jsonl", "meta.json"):
            path, absolute = prior_artifact(wave, suffix)
            inputs[path] = file_digest(absolute)

    prior_batches = []
    for wave in range(1, 43):
        _, ledger = prior_artifact(wave, "jsonl")
        _, meta_path = prior_artifact(wave, "meta.json")
        prior_meta = json.loads(meta_path.read_text())
        prior_batches.append({"batch_id": prior_meta["batch_id"], "ledger_sha256": file_digest(ledger), "meta_sha256": file_digest(meta_path)})

    prior_unit_ids = set()
    prior_edge_ids = set()
    for wave in range(1, 43):
        _, ledger = prior_artifact(wave, "jsonl")
        for prior_row in read_jsonl(ledger):
            prior_unit_ids.add(prior_row["unit_candidate_id"])
            prior_edge_ids.add((prior_row["unit_candidate_id"], prior_row["asset_id"]))
    current_edge_ids = {(row["unit_candidate_id"], row["asset_id"]) for row in rows}
    cumulative_unit_ids = prior_unit_ids | set(selected_units)
    cumulative_edge_ids = prior_edge_ids | current_edge_ids

    meta = {
        "authority_effect": "none",
        "batch_id": BATCH,
        "bounded_search_receipts": bounded_receipts,
        "asset_status_receipts": asset_status_receipts,
        "supplemental_asset_receipts": supplemental_asset_receipts,
        "inspected_legacy_asset_ids": sorted(set(selected_asset_ids) | set(SUPPLEMENTAL_ASSET_IDS)),
        "consumer_closure_status": "pending",
        "cumulative_reviewed_edge_count": len(cumulative_edge_ids),
        "cumulative_reviewed_unit_count": len(cumulative_unit_ids),
        "current_tree_revision": BASE,
        "inputs": inputs,
        "legacy_execution_performed": False,
        "main_merge_parents": MAIN_MERGE_PARENTS,
        "main_merge_revision": BASE,
        "missing_evidence_receipts": missing_evidence_receipts,
        "new_build_allowed": False,
        "output_sha256": file_digest(ledger_path),
        "parent_revision": BASE,
        "phase_rows": phase_rows,
        "prior_fixed_input_digests": {k: inputs[k] for k in [CATALOG_PATH, DECOMPOSITION_PATH, "docs/governance/phase-capability-inventory.json", REQ_RELATION_PATH, "archive/legacy-generation-2026-09-14/MANIFEST.sha256"]},
        "prior_review_batches": prior_batches,
        "record_count": len(rows),
        "semantic_atom_count": len({atom["atom_id"] for row in rows for atom in row["covered_requirement_atoms"]}),
        "composite_unresolved_count": sum(spec["composite_unresolved_count"] for spec in UNIT_SPECS),
        "remaining_unit_count": len(decomposition) - len(cumulative_unit_ids),
        "reviewed_edges": [{"asset_id": row["asset_id"], "unit_candidate_id": row["unit_candidate_id"]} for row in rows],
        "reviewed_unit_ids": selected_units,
        "schema_revision": 10,
        "semantic_link_counts": {"confirmed": len(selected_units), "rejected": 0, "unresolved": len(rows) - len(selected_units)},
        "source_atomization_holds": holds,
        "source_main_base_revision": BASE,
        "source_requirement_asset_id": REQUIREMENT_ASSET,
        "source_requirement_ir_sha256": REQ_SHA,
        "source_revision": "legacy-generation-2026-09-14",
        "stacked_pr_parent_revision": BASE,
        "status": "candidate",
        "unit_aggregates": aggregates,
        "ancestor_base_gate": {"required_base_revision": BASE, "mode": "base_or_descendant", "checked_by": "validate.py"},
        "routing_holds": [spec["routing_hold"] | {"unit_candidate_id": spec["unit"]} for spec in UNIT_SPECS if spec.get("routing_hold")],
        "wave40_candidate_parent": "95ba7e1813116632fd68ab3dcfc3b52ef18712b1",
        "wave40_candidate_ref": "research/legacy-semantic-review-wave40",
        "wave40_candidate_root": "95ba7e1813116632fd68ab3dcfc3b52ef18712b1",
        "wave40_exact_head": "95ba7e1813116632fd68ab3dcfc3b52ef18712b1",
        "wave41_candidate_parent": "5f198e4390d624355028287d04643d750cfe11e5",
        "wave41_candidate_ref": "research/legacy-semantic-review-wave41",
        "wave41_candidate_root": "5f198e4390d624355028287d04643d750cfe11e5",
        "wave41_exact_head": "5f198e4390d624355028287d04643d750cfe11e5",
        "wave42_candidate_parent": "49c76ff82bb67c7ba652d67a428b8ff4cf1f8698",
        "wave42_candidate_ref": "research/legacy-semantic-review-wave42",
        "wave42_candidate_root": "49c76ff82bb67c7ba652d67a428b8ff4cf1f8698",
        "wave42_exact_head": "49c76ff82bb67c7ba652d67a428b8ff4cf1f8698",
        "wave43_candidate_parent": BASE,
        "wave43_candidate_ref": "research/legacy-semantic-review-wave43",
        "wave43_candidate_root": BASE,
        "wave43_exact_head": BASE,
    }
    # Preserve the historical lineage fields carried by schema10 Wave36.
    previous_meta = json.loads((ROOT / "docs/governance/legacy-requirement-direct-semantic-review-wave36.meta.json").read_text())
    for key in previous_meta:
        if key.startswith("wave") and key not in meta:
            meta[key] = previous_meta[key]
    meta_path = OUT / "legacy-requirement-direct-semantic-review-wave43.meta.json"
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2, sort_keys=True) + "\n")
    print(f"generated rows={len(rows)} units={len(selected_units)} ledger={ledger_path}")


if __name__ == "__main__":
    main()
