#!/usr/bin/env python3
"""REQATOM A1 0031--0050 の source-linked proposal generator。"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
QUEUE = ROOT / "docs/governance/legacy-requirement-atomization-review-queue.jsonl"
LEDGER = ROOT / "docs/governance/legacy-requirement-semantic-line-carry-forward.jsonl"
ASSETS = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = ROOT / "docs/governance/legacy-asset-decisions.jsonl"
COPY_READ_AFTER = ROOT / "docs/governance/legacy-asset-copy-read-after.jsonl"
PROP = HERE / "proposals.jsonl"
INVENTORY = HERE / "inventory.json"
ATOMIZATION_PLAN = HERE / "atomization_plan.json"

UNIT_IDS = [f"REQATOM-QUEUE-{n:04d}" for n in range(31, 51)]
PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
SOURCE_COMMIT = "685c69c3c174ac6121812dade30ed75e510986e6"
CURRENT_PREFIX = "docs/governance/requirements-source/legacy-documents/"

def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def file_sha(path: Path) -> str:
    return sha256(path.read_bytes())


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


# Meaning-unit choices live in atomization_plan.json so the generator remains source-linked and reusable.

ACTOR_OVERRIDES = {
    "REQSRC-LINE-00086": ["PO／human residue"],
    "REQSRC-LINE-00087": ["AI roster verifier", "worker≠verifier"],
    "REQSRC-LINE-00088": ["AI roster worker"],
    "REQSRC-LINE-00089": ["harness operator role", "human operator"],
    "REQSRC-LINE-00090": ["external stakeholder"],
    "REQSRC-LINE-00093": ["AI roster", "HELIX-OS guard candidate"],
    "REQSRC-LINE-00121": ["dashboard consumer candidate"],
    "REQSRC-LINE-00140": ["AI roster", "skill pack", "command owner candidate"],
    "REQSRC-LINE-00144": ["PO", "AI agent roster", "HELIX-OS control candidate"],
    "REQSRC-LINE-00145": ["AI worker", "AI verifier", "PO/human residue"],
    "REQSRC-LINE-00147": ["AI agent guard", "PO"],
    "REQSRC-LINE-00161": ["deterministic guard candidate", "audit consumer"],
    "REQSRC-LINE-00193": ["back-propagation protocol", "L1／L3／L4 consumer"],
}


def old_source_path(source_path: str) -> str:
    if source_path.startswith(CURRENT_PREFIX):
        return source_path[len(CURRENT_PREFIX):]
    return source_path


def archive_path(source_path: str) -> str:
    return f"archive/legacy-generation-2026-09-14/root/{old_source_path(source_path)}"


def source_span(source_text: str, anchor: str) -> dict:
    occurrences = [index for index in range(len(source_text)) if source_text.startswith(anchor, index)]
    if len(occurrences) != 1:
        raise ValueError(f"source anchor must occur exactly once: {anchor!r} count={len(occurrences)}")
    start = occurrences[0]
    return {"char_start": start, "char_end": start + len(anchor), "length": len(anchor)}


def candidate_atom(atom_id: str, line: dict, spec: dict) -> dict:
    line_id = line["content_line_id"]
    source_line_text = line["source_line_text"]
    anchor = spec["anchor"]
    span = source_span(source_line_text, anchor)
    kind = spec["candidate_kind"]
    target = spec["candidate_target"]
    candidate_products = spec.get("product_boundary", {}).get("candidate_products", [])
    inference = (
        [f"current four-product boundary leaves these routing candidates unresolved: {', '.join(candidate_products)}; this is not source meaning or authority."]
        if target == "unresolved"
        else [f"current four-product boundary suggests {target} as a routing candidate; this is not source authority or a successor."]
    )
    if target == "HELIX-OS":
        inference.append("OS execution／management interpretation is a separate current inference; the old source line remains historical.")
    if line_id == "REQSRC-LINE-00081":
        inference.append("Current OS／HARNESS connection routing is unresolved inference only; the old CLI／harness wording establishes neither current ownership nor permission.")
    return {
        "candidate_atom_id": atom_id,
        "source_line_ids": [line_id],
        "source_line_text": source_line_text,
        "source_span": span,
        "verbatim_anchor": anchor,
        "exact_source_text": anchor,
        "retained_meaning": [anchor],
        "atomization_status": "atomized",
        "normalized_statement": spec["normalized_statement"],
        "semantic_subject": spec["semantic_subject"],
        "inherited_subject": spec["inherited_subject"],
        "parent_context": spec["parent_context"],
        "semantic_action": spec["semantic_action"],
        "semantic_condition": spec["semantic_condition"],
        "semantic_predicate": spec["semantic_predicate"],
        "historical_conflict": spec["historical_conflict"],
        "source_span_role": spec["source_span_role"],
        "typed_relation": spec["typed_relation"],
        "product_boundary": spec["product_boundary"],
        "candidate_kind": kind,
        "candidate_target": target,
        "candidate_granularity": spec["candidate_granularity"],
        "existing_identity_relations": [{"identity": f"legacy-source:{line_id}#span:{span['char_start']}-{span['char_end']}", "relation": "exact"}],
        "unresolved_points": spec["unresolved_points"],
        "actor_candidate": ACTOR_OVERRIDES.get(line_id, ["legacy business source author"]),
        "authority_boundary": ["旧sourceの宣言・表構造・歴史的条件を保持するだけで、現行target authority・権限・承認を生成しない。"],
        "failure_or_stop_conditions": [f"{line_id}の原文・actor・条件・traceが欠落またはdigest不一致ならsource closureを停止する。"],
        "evidence_or_acceptance_conditions": [f"{line_id}のexact source text、semantic line digest、source file digestを三者照合する。"],
        "negative_or_exception_conditions": ["旧layer、旧tool、旧runtime、旧AI完了主張を現行実装・受入・authorityへ昇格しない。"],
        "legacy_failure_candidate": {
            "status": "source_meaning_preserved; current_failure_contract_unresolved",
            "conditions": [f"{line_id}の原文・actor・条件・traceが欠落またはdigest不一致ならsource closureを停止する。"],
        },
        "consumer_candidate": {
            "legacy_refs": ["requirement-carry-forward-ledgers", "requirement-atomization-review"],
            "current_status": "unresolved",
        },
        "possible_conflicts": ["旧business sourceのL0-L14／AI／UI／state表現と、現行四製品責務境界・authority・phaseの分離は未確定である。"],
        "questions": ["人間decisionでどのproduct／layer／successorへ配置するか、実装・劣化・phaseを何のrevisionで確認するか。"],
        "candidate_inference": inference,
        "status_preservation": {
            "source_authority": "confirmed (legacy source declaration)",
            "target_authority": "none",
            "carry_forward": "preserved_pending_atomization",
            "implementation_status": "unknown",
            "degradation_status": "unknown",
            "phase_status": "legacy declaration preserved; current phase placement unresolved",
            "successor_status": "unassigned",
        },
    }


def composite_unresolved_record(record_id: str, line: dict, spec: dict) -> dict:
    source_line_text = line["source_line_text"]
    anchor = spec["anchor"]
    return {
        "composite_unresolved_id": record_id,
        "source_line_ids": [line["content_line_id"]],
        "source_line_text": source_line_text,
        "source_span": source_span(source_line_text, anchor),
        "verbatim_anchor": anchor,
        "exact_source_text": anchor,
        "atomization_status": "composite_unresolved",
        "normalized_statement": f"composite_unresolved: {spec['reason']}",
        "semantic_subject": spec["semantic_subject"],
        "inherited_subject": spec["inherited_subject"],
        "parent_context": spec["parent_context"],
        "semantic_action": spec["semantic_action"],
        "semantic_condition": spec["semantic_condition"],
        "semantic_predicate": spec["semantic_predicate"],
        "historical_conflict": spec["historical_conflict"],
        "source_span_role": spec["source_span_role"],
        "typed_relation": spec["typed_relation"],
        "product_boundary": spec["product_boundary"],
        "unresolved_points": spec["unresolved_points"],
        "candidate_target": "unresolved",
        "questions": ["このsource spanをどの意味単位へ分けるか、人間reviewで決める。"],
    }


def main() -> int:
    queue_rows = {row["review_unit_id"]: row for row in load_jsonl(QUEUE)}
    ledger_rows = {row["content_line_id"]: row for row in load_jsonl(LEDGER)}
    assets = load_jsonl(ASSETS)
    asset_by_old_path = {row["source_path"]: row for row in assets}
    decisions = {row["decision_id"]: row for row in load_jsonl(DECISIONS)}
    read_afters = {row["read_after_id"]: row for row in load_jsonl(COPY_READ_AFTER)}
    atomization_plan = json.loads(ATOMIZATION_PLAN.read_text(encoding="utf-8"))
    plan_lines = atomization_plan.get("line_specs", {})

    proposals: list[dict] = []
    used_atoms: set[str] = set()
    source_groups: dict[str, dict] = {}
    for unit_id in UNIT_IDS:
        queue = queue_rows[unit_id]
        atoms: list[dict] = []
        composite_unresolved: list[dict] = []
        atom_index = 0
        composite_index = 0
        atomized_obligation_anchors: dict[str, list[str]] = {}
        composite_obligation_anchors: dict[str, list[str]] = {}
        for line_position, line_id in enumerate(queue["content_line_ids"], 1):
            line = ledger_rows[line_id]
            line_plan = plan_lines.get(line_id)
            if line_plan is None:
                raise ValueError(f"atomization plan missing: {line_id}")
            atomized_obligation_anchors[line_id] = [spec["anchor"] for spec in line_plan.get("atomized", [])]
            composite_obligation_anchors[line_id] = [spec["anchor"] for spec in line_plan.get("composite_unresolved", [])]
            for atom_position, spec in enumerate(line_plan.get("atomized", []), 1):
                atom_index += 1
                atom_id = f"A1-{queue['review_sequence']:04d}-{line_position:02d}-{atom_position:02d}"
                if atom_id in used_atoms:
                    raise ValueError(f"candidate atom id collision: {atom_id}")
                used_atoms.add(atom_id)
                atoms.append(candidate_atom(atom_id, line, spec))
            for composite_position, spec in enumerate(line_plan.get("composite_unresolved", []), 1):
                composite_index += 1
                composite_unresolved.append(composite_unresolved_record(f"A1-CU-{queue['review_sequence']:04d}-{line_position:02d}-{composite_position:02d}", line, spec))
        proposals.append({
            "review_unit_id": unit_id,
            "review_sequence": queue["review_sequence"],
            "input_source_path": queue["source_path"],
            "input_source_revision": queue["source_file_sha256"],
            "input_heading_path": queue["heading_path"],
            "input_source_line_range": [queue["source_line_start"], queue["source_line_end"]],
            "input_content_line_ids": queue["content_line_ids"],
            "input_content_line_digests": {line_id: ledger_rows[line_id]["source_line_sha256"] for line_id in queue["content_line_ids"]},
            "line_coverage": {
                "input_lines": queue["content_line_ids"],
                "atomized_source_line_ids": [line_id for line_id in queue["content_line_ids"] if atomized_obligation_anchors[line_id]],
                "composite_unresolved_source_line_ids": [line_id for line_id in queue["content_line_ids"] if composite_obligation_anchors[line_id]],
                "atomized_obligation_anchors": atomized_obligation_anchors,
                "composite_unresolved_anchors": composite_obligation_anchors,
            },
            "candidate_atoms": atoms,
            "composite_unresolved": composite_unresolved,
            "atomized_candidate_atom_count": len(atoms),
            "composite_unresolved_count": len(composite_unresolved),
            "four_product_denominator": {},
            "authority_claim": "none",
            "proposal_status": "needs_independent_review",
            "meaning_change_applied": False,
            "successor_requirement_ids": [],
            "decision_record": None,
        })
        source_groups.setdefault(queue["source_path"], {"source_path": queue["source_path"], "source_sha256": queue["source_file_sha256"], "unit_ids": []})["unit_ids"].append(unit_id)

    for source_path, group in source_groups.items():
        current = ROOT / source_path
        old_path = old_source_path(source_path)
        archive = ROOT / archive_path(source_path)
        asset = asset_by_old_path.get(old_path)
        if asset is None:
            asset = {"asset_id": None, "revision": None, "disposition": "unknown", "implementation_status": "unknown", "product_target": "unresolved", "decision_status": "unknown", "decision_record_ref": None, "consumer_refs": []}
        decision_ref = asset.get("decision_record_ref") or ""
        decision_id = decision_ref.rsplit("#", 1)[-1] if "#" in decision_ref else None
        decision = decisions.get(decision_id, {})
        read_ref = asset.get("read_after_record_ref") or ""
        read_id = read_ref.rsplit("#", 1)[-1] if "#" in read_ref else None
        read = read_afters.get(read_id, {})
        group.update({
            "old_source_path": old_path,
            "archive_source_path": archive_path(source_path),
            "source_sha256": file_sha(current),
            "archive_source_sha256": file_sha(archive),
            "legacy_asset_id": asset.get("asset_id"),
            "legacy_asset_revision": asset.get("revision"),
            "legacy_asset_disposition": asset.get("disposition"),
            "legacy_asset_implementation_status": asset.get("implementation_status", "unknown"),
            "legacy_asset_product_target": asset.get("product_target", "unresolved"),
            "legacy_asset_decision_status": asset.get("decision_status", "unknown"),
            "legacy_asset_decision_ref": decision_ref,
            "legacy_asset_correction_decision": decision.get("decision_id"),
            "legacy_asset_correction_supersedes": decision.get("supersedes_decision_id"),
            "legacy_asset_read_after_id": read.get("read_after_id"),
            "legacy_asset_read_after_result": read.get("result"),
            "legacy_asset_read_after_digest_match": read.get("digest_match"),
            "legacy_asset_read_after_consumer_match": read.get("consumer_match"),
            "legacy_asset_read_after_failure": read.get("failure"),
            "legacy_asset_consumer_refs": asset.get("consumer_refs", []),
            "legacy_asset_read_after_consumer_refs": read.get("consumer_refs_observed", []),
        })

    totals = {product: 0 for product in PRODUCTS}
    unresolved_count = 0
    composite_unresolved_count = 0
    for proposal in proposals:
        counts = {product: 0 for product in PRODUCTS}
        for atom_row in proposal["candidate_atoms"]:
            target = atom_row["candidate_target"]
            if target in counts:
                counts[target] += 1
                totals[target] += 1
            else:
                unresolved_count += 1
        composite_unresolved_count += len(proposal["composite_unresolved"])
        proposal["four_product_denominator"] = {
            product: {"candidate_atom_count": counts[product], "status": "candidate_only" if counts[product] else "no_direct_source_evidence"}
            for product in PRODUCTS
        }

    PROP.write_text("".join(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n" for row in proposals), encoding="utf-8")
    inventory = {
        "schema_revision": 1,
        "generated_at": "2026-09-22",
        "authority_effect": "none",
        "proposal_status": "needs_independent_review",
        "source_commit": SOURCE_COMMIT,
        "inputs": {
            "queue_path": str(QUEUE.relative_to(ROOT)),
            "queue_sha256": file_sha(QUEUE),
            "semantic_line_ledger_path": str(LEDGER.relative_to(ROOT)),
            "semantic_line_ledger_sha256": file_sha(LEDGER),
            "atomization_plan_path": str(ATOMIZATION_PLAN.relative_to(ROOT)),
            "atomization_plan_sha256": file_sha(ATOMIZATION_PLAN),
            "source_groups": list(source_groups.values()),
        },
        "review_unit_ids": UNIT_IDS,
        "review_unit_count": len(proposals),
        "input_line_count": sum(len(row["input_content_line_ids"]) for row in proposals),
        "candidate_atom_count": sum(len(row["candidate_atoms"]) for row in proposals),
        "atomized_candidate_atom_count": sum(len(row["candidate_atoms"]) for row in proposals),
        "composite_unresolved_count": composite_unresolved_count,
        "four_product_denominator": {
            product: {"candidate_atom_count": totals[product], "status": "candidate_only" if totals[product] else "no_direct_source_evidence"}
            for product in PRODUCTS
        },
        "unresolved_target_candidate_atom_count": unresolved_count,
        "status_preservation": {
            "source_authority": "confirmed (legacy queue declaration)",
            "target_authority": "none",
            "carry_forward": "preserved_pending_atomization",
            "implementation_status": "unknown",
            "degradation_status": "unknown",
            "phase_status": "legacy declaration preserved; current phase placement unresolved",
            "successor_requirement_ids": [],
            "decision_record": None,
        },
        "proposal_sha256": file_sha(PROP),
    }
    INVENTORY.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"generated REQATOM A1 0031--0050: units={len(proposals)} lines={inventory['input_line_count']} atoms={inventory['candidate_atom_count']} composite_unresolved={composite_unresolved_count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
