#!/usr/bin/env python3
"""Generate the Wave37 schema10 research-premise ledger.

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
BATCH = "LEGACY-SEMANTIC-WAVE37-2026-09-22"
BASE = "562e176c36844474b63424ec06beefe2f7722d18"
MAIN_MERGE_PARENTS = [
    "083133e17019fafb8be7182975cb913f8b43f21e",
    "929da891382b153049da23bcecaf84b6b198092c",
]
CATALOG_PATH = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
CROSSWALK_PATH = "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DECOMPOSITION_PATH = "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
REQ_RELATION_PATH = "docs/governance/legacy-ir-document-source-relation.jsonl"
REQ_IR = ARCHIVE / "requirements-ir/requirements.json"
REQ_SHA = "80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688"
REQUIREMENT_ASSET = "LEGACY-ASSET-A60CF91DD2AF6693E6F9"

# Each entry is one product-unit source chain.  Asset selection is kept
# separate from meaning fields; the latter come from the decomposition record.
UNIT_SPECS = [
    {
        "unit": "IRUNIT-HIL-NFR-01-HELIX-OS",
        "query": {"anchors": ["memory", "idempotent", "delivery"], "match_mode": "archive_file_contains_any_utf8_anchor"},
        "design_asset": "LEGACY-ASSET-899A61905AFBC415F595",
        "implementation_asset": "LEGACY-ASSET-79AD1AFBFB2A4B00CC95",
        "evidence": {
            "design": ("docs/design/helix/L3-requirements/orchestration-memory.md", 1, 42, [("NFR01-OS-A01", ["memory"], ["memory"], [])]),
            "implementation_source": ("src/memory/memory-v2.ts", 300, 330, [("NFR01-OS-A01", ["memory"], ["memory-write"], [])]),
        },
    },
    {
        "unit": "IRUNIT-HIL-NFR-10-HELIX-OS",
        "query": {"anchors": ["agent", "runtime", "registry"], "match_mode": "archive_file_contains_any_utf8_anchor"},
        "design_asset": "LEGACY-ASSET-25EB3B29EA909B050987",
        "implementation_asset": "LEGACY-ASSET-44F2DE5EBB3DF3A4744A",
        "evidence": {
            "design": ("docs/design/helix/L5-detail/worker-lifecycle-receipt.md", 21, 70, [("NFR10-OS-A01", ["runtime"], ["runtime"], [])]),
            "implementation_source": ("src/orchestration/loop-runner.ts", 1, 15, [("NFR10-OS-A01", ["runtime"], ["runtime"], [])]),
        },
    },
    {
        "unit": "IRUNIT-HIL-NFR-19-HELIX-OS",
        "query": {"anchors": ["Linux", "macOS", "Windows", "adapter"], "match_mode": "archive_file_contains_any_utf8_anchor"},
        "design_asset": "LEGACY-ASSET-E212E913117C5C247DAE",
        "implementation_asset": "LEGACY-ASSET-573CC6D5360F04EEDEE3",
        "evidence": {
            "design": ("docs/design/helix/L5-detail/os-portability-supply-chain.md", 31, 52, [
                ("NFR19-OS-A01", ["macOS"], ["compatibility"], []),
                ("NFR19-OS-A02", ["Windows"], ["Linux", "wrapper"], []),
            ]),
            "implementation_source": ("src/runtime/adapter.ts", 62, 72, [
                ("NFR19-OS-A02", ["Windows"], ["Windows"], []),
            ]),
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
REVIEW_SCOPE = "Wave37 schema10 research-premise candidate: exact requirement source / product boundary / phase candidate / catalog asset role"
HOLD = "source_atomization_review_pending;product_boundary_pending_human_decision"


def read_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


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
        "evidence_ref_id": f"LEGACY-ASSET-WAVE37-{role}-{ordinal}",
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
        if any(anchor in body for anchor in query["anchors"]):
            ids.append(asset_id)
    return sorted(ids)


def main() -> None:
    catalog = {row["asset_id"]: row for row in read_jsonl(ROOT / CATALOG_PATH)}
    crosswalk = {row["unit_candidate_id"]: row for row in read_jsonl(ROOT / CROSSWALK_PATH)}
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
        design_asset = catalog[spec["design_asset"]]
        impl_asset = catalog[spec["implementation_asset"]]
        selected_assets = sorted([REQUIREMENT_ASSET, spec["design_asset"], spec["implementation_asset"]])
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
        holds.append({"unit_candidate_id": unit, "status": "product_boundary_shared_atom_hold", "shared_atom_ids": []})
        atom_specs = []
        for index, fragment in enumerate(candidate["source_text_spans"]):
            atom_id = f"NFR{req_id.split('-')[-1]}-OS-A{index + 1:02d}"
            atom_specs.append(make_atom(atom_id, fragment, index))
        atom_ids = [atom["atom_id"] for atom in atom_specs]

        asset_by_role = [("requirement", req_asset), ("design", design_asset), ("implementation_source", impl_asset)]
        for role, asset in asset_by_role:
            policy = ROLE_POLICY[role]
            if role == "requirement":
                refs = [
                    build_evidence_ref("requirement", "requirements-ir/requirements.json", parent["source_requirement_id"] and int({"HIL-NFR-01": 4432, "HIL-NFR-10": 4819, "HIL-NFR-19": 5206}[req_id]), int({"HIL-NFR-01": 4432, "HIL-NFR-10": 4819, "HIL-NFR-19": 5206}[req_id]), 1, policy["semantic_relation"]),
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
                "connection_records": [],
                "consumer_closure_evidence": [],
                "consumer_closure_status": "pending",
                "counterevidence": copy.deepcopy(COUNTEREVIDENCE),
                "coverage": {"constraint": "product boundary／phase authority／consumer closure未確定", "failure": "未対応atom、partial evidence、またはmissing acceptance receipt", "normal": "exact source anchorを固定したstatic evidence only", "recovery": "not_evidenced"},
                "covered_requirement_atom_ids": atom_ids,
                "covered_requirement_atoms": copy.deepcopy(atom_specs),
                "current_requirement_implementation_status": "not_established",
                "evidence_atom_bindings": bindings,
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
                "review_id": f"LSRW37-EDGE-{len(rows) + 1:03d}",
                "review_scope": REVIEW_SCOPE,
                "role_kind": role,
                "routing_candidate": parent["routing_candidate"],
                "routing_state": "candidate_product_routing_requires_human_review",
                "schema_revision": 10,
                "selection_route": "bounded_global_search",
                "semantic_link_status": policy["semantic_link_status"],
                "semantic_relation": policy["semantic_relation"],
                "source_connective_fragments": [],
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
        aggregates.append({"unit_candidate_id": unit, "reviewed_edge_count": 3, "semantic_link_counts": {"confirmed": 1, "rejected": 0, "unresolved": 2}, "direct_confirmed_implementation_asset_ids": [], "phase_authority_status": "candidate_unchanged"})

    ledger_path = OUT / "legacy-requirement-direct-semantic-review-wave37.jsonl"
    ledger_path.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in rows))

    inputs = {
        "archive/legacy-generation-2026-09-14/MANIFEST.sha256": file_digest(ROOT / "archive/legacy-generation-2026-09-14/MANIFEST.sha256"),
        CATALOG_PATH: file_digest(ROOT / CATALOG_PATH),
        CROSSWALK_PATH: file_digest(ROOT / CROSSWALK_PATH),
        DECOMPOSITION_PATH: file_digest(ROOT / DECOMPOSITION_PATH),
        REQ_RELATION_PATH: file_digest(ROOT / REQ_RELATION_PATH),
        "docs/governance/phase-capability-inventory.json": file_digest(ROOT / "docs/governance/phase-capability-inventory.json"),
        "docs/concept/product-boundary.md": file_digest(ROOT / "docs/concept/product-boundary.md"),
        "docs/helix-harness/L1-planning/product-intent.md": file_digest(ROOT / "docs/helix-harness/L1-planning/product-intent.md"),
        "docs/helix-os/L1-planning/system-intent.md": file_digest(ROOT / "docs/helix-os/L1-planning/system-intent.md"),
        "docs/helix-web/L1-planning/product-intent.md": file_digest(ROOT / "docs/helix-web/L1-planning/product-intent.md"),
        "docs/helix-web-os/L1-planning/system-intent.md": file_digest(ROOT / "docs/helix-web-os/L1-planning/system-intent.md"),
    }
    for wave in range(1, 37):
        for suffix in ("jsonl", "meta.json"):
            path = f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.{suffix}"
            inputs[path] = file_digest(ROOT / path)

    prior_batches = []
    for wave in range(1, 37):
        ledger = ROOT / f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.jsonl"
        meta_path = ROOT / f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.meta.json"
        prior_meta = json.loads(meta_path.read_text())
        prior_batches.append({"batch_id": prior_meta["batch_id"], "ledger_sha256": file_digest(ledger), "meta_sha256": file_digest(meta_path)})

    meta = {
        "authority_effect": "none",
        "batch_id": BATCH,
        "bounded_search_receipts": bounded_receipts,
        "consumer_closure_status": "pending",
        "cumulative_reviewed_edge_count": 441,
        "cumulative_reviewed_unit_count": 148,
        "current_tree_revision": BASE,
        "inputs": inputs,
        "legacy_execution_performed": False,
        "main_merge_parents": MAIN_MERGE_PARENTS,
        "main_merge_revision": BASE,
        "missing_evidence_receipts": [],
        "new_build_allowed": False,
        "output_sha256": file_digest(ledger_path),
        "parent_revision": BASE,
        "phase_rows": phase_rows,
        "prior_fixed_input_digests": {k: inputs[k] for k in [CATALOG_PATH, DECOMPOSITION_PATH, "docs/governance/phase-capability-inventory.json", REQ_RELATION_PATH, "archive/legacy-generation-2026-09-14/MANIFEST.sha256"]},
        "prior_review_batches": prior_batches,
        "record_count": len(rows),
        "remaining_unit_count": 70,
        "reviewed_edges": [{"asset_id": row["asset_id"], "unit_candidate_id": row["unit_candidate_id"]} for row in rows],
        "reviewed_unit_ids": selected_units,
        "schema_revision": 10,
        "semantic_link_counts": {"confirmed": 3, "rejected": 0, "unresolved": 6},
        "source_atomization_holds": holds,
        "source_main_base_revision": BASE,
        "source_requirement_asset_id": REQUIREMENT_ASSET,
        "source_requirement_ir_sha256": REQ_SHA,
        "source_revision": "legacy-generation-2026-09-14",
        "stacked_pr_parent_revision": BASE,
        "status": "candidate",
        "unit_aggregates": aggregates,
        "wave37_candidate_parent": BASE,
        "wave37_candidate_ref": "research/legacy-semantic-review-wave37",
        "wave37_candidate_root": BASE,
        "wave37_exact_head": BASE,
    }
    # Preserve the historical lineage fields carried by schema10 Wave36.
    previous_meta = json.loads((ROOT / "docs/governance/legacy-requirement-direct-semantic-review-wave36.meta.json").read_text())
    for key in previous_meta:
        if key.startswith("wave") and key not in meta:
            meta[key] = previous_meta[key]
    meta_path = OUT / "legacy-requirement-direct-semantic-review-wave37.meta.json"
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2, sort_keys=True) + "\n")
    print(f"generated rows={len(rows)} units={len(selected_units)} ledger={ledger_path}")


if __name__ == "__main__":
    main()
