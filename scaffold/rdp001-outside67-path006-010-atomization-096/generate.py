#!/usr/bin/env python3
"""PATH-006..010 の source line atom 候補を再生成する静的 generator。

この generator は merged 済み Scaffold の source snapshot と holding/ledger を読むだけで、
archive の runtime・workflow・test・CI は起動しない。source line の文字列は編集せず、
複合行を保守的に unresolved のまま残す。
"""
from __future__ import annotations

import hashlib
import json
import subprocess
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
BASE = "c52f27093869a0ecbdfbc416fb0bffdb49b85071"
PRE = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCH = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
HOLDING = ROOT / "docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl"
REGISTER = ROOT / "docs/governance/management-provisional-requirement-register.jsonl"
OLD_LEDGER_PATHS = [
    "docs/governance/legacy-asset-disposition.jsonl",
    "docs/governance/legacy-asset-decisions.jsonl",
    "docs/governance/legacy-asset-copy-read-after.jsonl",
    "docs/governance/legacy-asset-decision-log.md",
    "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl",
    "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl",
    "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl",
]

PATHS = {
    "OUTSIDE67-PATH-006": {
        "source_path": "docs/design/helix-os/README.md",
        "current_path": "docs/helix-os/README.md",
        "candidate_product": "HELIX-OS",
        "candidate_phase": "L1-L2-entry",
        "prior_bundle": "scaffold/rdp001-outside67-product-entry-followup-076",
    },
    "OUTSIDE67-PATH-007": {
        "source_path": "docs/design/helix-web-os/L1-planning/system-intent.md",
        "current_path": "docs/helix-web-os/L1-planning/system-intent.md",
        "candidate_product": "HELIX-Web-OS",
        "candidate_phase": "L1-planning",
        "prior_bundle": "scaffold/rdp001-outside67-boundary-followup-073",
    },
    "OUTSIDE67-PATH-008": {
        "source_path": "docs/design/helix-web-os/L2-requirements/service-governance-requirements.md",
        "current_path": "docs/helix-web-os/L2-requirements/service-governance-requirements.md",
        "candidate_product": "HELIX-Web-OS",
        "candidate_phase": "L2-requirements",
        "prior_bundle": "scaffold/rdp001-outside67-web-webos-l2-gap-057",
    },
    "OUTSIDE67-PATH-009": {
        "source_path": "docs/design/helix-web-os/README.md",
        "current_path": "docs/helix-web-os/README.md",
        "candidate_product": "HELIX-Web-OS",
        "candidate_phase": "L1-L2-entry",
        "prior_bundle": "scaffold/rdp001-outside67-product-entry-followup-076",
    },
    "OUTSIDE67-PATH-010": {
        "source_path": "docs/design/helix-web/L1-planning/product-intent.md",
        "current_path": "docs/helix-web/L1-planning/product-intent.md",
        "candidate_product": "HELIX-Web",
        "candidate_phase": "L1-planning",
        "prior_bundle": "scaffold/rdp001-outside67-boundary-followup-073",
    },
}

# Classification is intentionally line-level. A line with several duties is not silently
# split into an inferred requirement. PATH-008 keeps the prior merged semantic atom mapping.
METADATA_LINES = {
    "OUTSIDE67-PATH-006": {1, 2, 4, 11, 15, 16, 17, 22},
    "OUTSIDE67-PATH-007": {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 17, 18, 24, 25, 26, 27, 28, 36, 37, 38, 42, 45, 46, 47},
    "OUTSIDE67-PATH-009": {1, 2, 8, 9, 10, 11, 12},
    "OUTSIDE67-PATH-010": {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 21, 22, 23, 27, 28, 29, 36, 38, 39, 44, 45, 46, 50, 51, 52},
}
ATOMIZED_LINES = {"OUTSIDE67-PATH-006": {3, 8, 10, 23}, "OUTSIDE67-PATH-009": set()}

FOUR_PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def blob_oid(data: bytes) -> str:
    raw = f"blob {len(data)}\0".encode() + data
    return hashlib.sha1(raw).hexdigest()


def read_jsonl(path: Path):
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def git_show(revision: str, path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)


def lines(data: bytes):
    return data.decode("utf-8").splitlines()


def write_json(path: Path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_jsonl(path: Path, rows):
    path.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in rows), encoding="utf-8")


def holding_rows():
    by = {row["source_item_id"]: row for row in read_jsonl(HOLDING)}
    return {sid: by[sid] for sid in PATHS}


def selected_prior_rows():
    result = {}
    for sid, info in PATHS.items():
        path = ROOT / info["prior_bundle"] / "selected-source-items.jsonl"
        for row in read_jsonl(path):
            if row.get("source_item_id") == sid:
                result[sid] = row
                break
    if set(result) != set(PATHS):
        raise SystemExit("prior selected-source-items.jsonl does not cover all five paths")
    return result


def snapshot_path(sid: str, side: str) -> Path:
    return ROOT / PATHS[sid]["prior_bundle"] / "source-snapshots" / sid / ("pre-isolation.md" if side == "pre" else "archive-revision.md")


def current_record(sid: str):
    info = PATHS[sid]
    data = git_show(BASE, info["current_path"])
    return {
        "commit": BASE,
        "path": info["current_path"],
        "blob_oid": blob_oid(data),
        "bytes": len(data),
        "sha256": sha(data),
        "line_count": len(lines(data)),
        "relation": "current_counterpart_path_relocation_and_content_drift_observed",
    }


def line_category(sid: str, line_no: int) -> str:
    if sid == "OUTSIDE67-PATH-008":
        raise AssertionError("PATH-008 uses reused mapping")
    if line_no in METADATA_LINES[sid]:
        return "metadata_only"
    if line_no in ATOMIZED_LINES.get(sid, set()):
        return "atomized_candidate"
    return "composite_unresolved"


def semantic_atom(sid: str, ordinal: int, line_no: int, text: str, category: str, hold, pre_meta, arch_meta):
    atom_id = f"RDP-001-OUTSIDE67-{sid.rsplit('-', 1)[1]}-LINE-{line_no:03d}"
    exact = category == "atomized_candidate"
    status = "source_supported" if exact else ("metadata_only" if category == "metadata_only" else "unresolved_composite")
    line_hash = sha(text.encode("utf-8"))
    source_ref = "source_fragment" if exact else "source_span"
    return {
        "action": text if exact else "unresolved",
        "actor": "unresolved",
        "atom_id": atom_id,
        "atomization_status": category,
        "authority_effect": "none",
        "candidate_granularity": "unit" if exact else category,
        "candidate_inference": [],
        "candidate_kind": "source_line_candidate" if exact else ("source_line_metadata" if category == "metadata_only" else "source_line_composite_unresolved"),
        "candidate_phase": hold["reported_path_scope"]["phase_scope"],
        "candidate_product": "unresolved_cross_product",
        "candidate_product_candidates": FOUR_PRODUCTS,
        "condition": "unresolved",
        "consumer_status": "unknown",
        "current_degradation_status": "unknown",
        "current_implementation_status": "unknown",
        "current_requirement_status": "not_current_requirement",
        "decision_status": "unknown",
        "degradation_status": "unknown",
        "diff_observation": {"status": "unresolved", "text": "pre-isolation and archive-revision are byte-identical; current counterpart has relocation/content drift only as recorded", "source_ref": "source-diffs.json"},
        "failure_status": "unknown",
        "human_decision_ref": None,
        "implementation_status": "unknown",
        "inference_status": "none",
        "inherited_predicate": {"status": "none", "text": None, "line": None, "character_start": None, "character_end": None, "relation": None, "source_span": {}},
        "legacy_degradation_status": "unknown",
        "legacy_implementation_status": "unknown",
        "legacy_source_requirement_id": None,
        "meaning_change_applied": False,
        "negative_or_guard": None,
        "normalized_statement": {"status": status, "text": text, "source_ref": source_ref},
        "normalized_statement_status": status,
        "phase_status": "unknown_path_based_candidate_only",
        "retained_meaning": {"status": "preserved_source_meaning", "items": [text], "source_ref": source_ref},
        "revision_pair": {
            "pre_isolation": {"commit": PRE, "blob_oid": pre_meta["blob_oid"], "exact_source_text": text + "\n", "line_start": line_no, "line_end": line_no, "line_sha256": line_hash, "byte_sha256": line_hash},
            "archive": {"commit": ARCH, "blob_oid": arch_meta["blob_oid"], "exact_source_text": text + "\n", "line_start": line_no, "line_end": line_no, "line_sha256": line_hash, "byte_sha256": line_hash},
        },
        "semantic_action": text if exact else "unresolved",
        "semantic_condition": "unresolved",
        "semantic_subject": "unresolved",
        "sequence": "unresolved",
        "source_fragment": {"character_start": 0, "character_end": len(text) if exact else None, "line": line_no, "status": "exact" if exact else "unresolved", "text": text if exact else None},
        "source_item_id": sid,
        "source_line_shared": False,
        "source_ordinal": int(sid.rsplit("-", 1)[1]),
        "source_path": hold["source_path"],
        "source_semantic_status": "candidate_only",
        "source_support": {"actor": {"status": "unresolved", "text": None}, "action": {"status": "exact", "text": text} if exact else {"status": "unresolved", "text": None}, "condition": {"status": "unresolved", "text": None}, "guard": {"status": "unresolved", "text": None}, "sequence": {"status": "unresolved", "text": None}, "source_fragment_text": text if exact else None},
        "successor_requirement_ids": [],
        "unresolved_questions": {"status": "open_unknowns", "items": ["この原文行を正式要求へ採択するか、責務・owner・authority・phaseを誰が決めるか"], "scope": "atom"},
        "span_kind": category,
    }


def make_source_rows(holds, prior):
    rows = []
    for sid in PATHS:
        h = holds[sid]
        pre = snapshot_path(sid, "pre").read_bytes()
        arch = snapshot_path(sid, "archive").read_bytes()
        if pre != arch:
            raise SystemExit(f"source snapshot drift: {sid}")
        expected = h["pre_isolation"]
        if len(pre) != expected["bytes"] or sha(pre) != expected["sha256"] or blob_oid(pre) != expected["blob_oid"]:
            raise SystemExit(f"pre snapshot does not match holding: {sid}")
        cur = current_record(sid)
        p = prior[sid]
        rows.append({
            "source_item_id": sid,
            "source_ordinal": int(sid.rsplit("-", 1)[1]),
            "source_unit": "path_revision_pair",
            "artifact_kind": "markdown",
            "source_path": h["source_path"],
            "current_counterpart": cur,
            "holding": {"registration_id": "MPR-SH-OUTSIDE67-001", "path_revision_pair_denominator": 67, "pre_sha256": h["pre_isolation"]["sha256"], "archive_sha256": h["archive"]["sha256"], "reported_product_scope": h["reported_path_scope"]["product_scope"], "reported_phase_scope": h["reported_path_scope"]["phase_scope"], "source_status": h["source_holding_status"]},
            "pre_isolation": {"commit": PRE, "blob_oid": h["pre_isolation"]["blob_oid"], "bytes": len(pre), "sha256": sha(pre), "line_count": len(lines(pre))},
            "archive_revision": {"commit": ARCH, "blob_oid": h["archive"]["blob_oid"], "bytes": len(arch), "sha256": sha(arch), "line_count": len(lines(arch))},
            "prior_research_bundle": p.get("source_item_id") and PATHS[sid]["prior_bundle"],
            "prior_semantic_status": p.get("status", {}).get("semantic_disposition", "not_started"),
            "source_relation": "pre_archive_same_current_relocation_and_content_drift",
        })
    return rows


def make_legacy_evidence(holds):
    out = []
    for sid, h in holds.items():
        terms = [sid, h["source_path"], h["pre_isolation"]["blob_oid"], h["archive"]["blob_oid"]]
        for rel in OLD_LEDGER_PATHS:
            path = ROOT / rel
            text = path.read_text(encoding="utf-8", errors="replace")
            anchors = []
            for no, line in enumerate(text.splitlines(), 1):
                if any(term in line for term in terms):
                    anchors.append({"line": no, "text_sha256": sha(line.encode("utf-8")), "matched_terms": [term for term in terms if term in line]})
            out.append({"source_item_id": sid, "ledger_path": rel, "lookup": "exact_text_hit" if anchors else "no_exact_text_hit", "anchors": anchors, "implementation_status": "unknown", "degradation_status": "unknown", "failure_status": "unknown", "consumer_status": "unknown", "decision_status": "unknown", "no_inference_from_absence": True})
    return out


def main():
    HERE.mkdir(parents=True, exist_ok=True)
    holds = holding_rows()
    prior = selected_prior_rows()
    source_rows = make_source_rows(holds, prior)
    write_jsonl(HERE / "selected-source-items.jsonl", source_rows)

    # Preserve the exact already-merged source snapshots in this bundle. This is a static
    # snapshot copy, with source hash/line checks above; no old asset is executed.
    for sid in PATHS:
        dest = HERE / "source-snapshots" / sid
        dest.mkdir(parents=True, exist_ok=True)
        for side in ("pre", "archive"):
            name = "pre-isolation.md" if side == "pre" else "archive-revision.md"
            (dest / name).write_bytes(snapshot_path(sid, side).read_bytes())

    existing = [json.loads(x) for x in (ROOT / PATHS["OUTSIDE67-PATH-008"]["prior_bundle"] / "semantic-atoms.jsonl").read_text(encoding="utf-8").splitlines() if x.strip() and json.loads(x).get("source_item_id") == "OUTSIDE67-PATH-008"]
    line_refs = defaultdict(list)
    for atom in existing:
        line_no = atom["source_fragment"].get("line") or atom["revision_pair"]["pre_isolation"]["line_start"]
        line_refs[line_no].append(atom)
    reused = []
    coverage = []
    for line_no, atoms in sorted(line_refs.items()):
        categories = {"atomized_candidate" if a["atomization_status"] == "atomized_candidate" else "composite_unresolved" for a in atoms}
        category = "atomized_candidate" if "atomized_candidate" in categories else "composite_unresolved"
        for a in atoms:
            reused.append({"atom_id": a["atom_id"], "source_item_id": "OUTSIDE67-PATH-008", "source_line": line_no, "category": "atomized_candidate" if a["atomization_status"] == "atomized_candidate" else "composite_unresolved", "source_bundle": PATHS["OUTSIDE67-PATH-008"]["prior_bundle"], "source_atom_sha256": sha(json.dumps(a, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8"))})
    # PATH-008 has every source line in its merged coverage; lines without an atom are metadata-only.
    path008_lines = lines(snapshot_path("OUTSIDE67-PATH-008", "pre").read_bytes())
    for n, text in enumerate(path008_lines, 1):
        coverage.append({"coverage_id": f"COV-008-{n:03d}", "source_item_id": "OUTSIDE67-PATH-008", "source_line": n, "archive_line": n, "pre_text": text, "archive_text": text, "pre_line_sha256": sha(text.encode()), "archive_line_sha256": sha(text.encode()), "category": ("atomized_candidate" if any(r["source_line"] == n and r["category"] == "atomized_candidate" for r in reused) else ("composite_unresolved" if any(r["source_line"] == n for r in reused) else "metadata_only")), "atom_ids": [r["atom_id"] for r in reused if r["source_line"] == n], "accounting_source": "reused_existing_merged_bundle"})

    atoms = []
    for sid in ("OUTSIDE67-PATH-006", "OUTSIDE67-PATH-007", "OUTSIDE67-PATH-009", "OUTSIDE67-PATH-010"):
        h = holds[sid]
        pre_meta = h["pre_isolation"]
        arch_meta = h["archive"]
        source_lines = lines(snapshot_path(sid, "pre").read_bytes())
        for n, text in enumerate(source_lines, 1):
            category = line_category(sid, n)
            atom = semantic_atom(sid, n, n, text, category, h, pre_meta, arch_meta)
            atoms.append(atom)
            coverage.append({"coverage_id": f"COV-{sid.rsplit('-', 1)[1]}-{n:03d}", "source_item_id": sid, "source_line": n, "archive_line": n, "pre_text": text, "archive_text": text, "pre_line_sha256": sha(text.encode()), "archive_line_sha256": sha(text.encode()), "category": category, "atom_ids": [atom["atom_id"]], "accounting_source": "new_line_candidate"})
    atoms.sort(key=lambda a: (a["source_item_id"], a["source_fragment"]["line"]))
    reused.sort(key=lambda r: (r["source_line"], r["atom_id"]))
    coverage.sort(key=lambda r: (r["source_item_id"], r["source_line"]))
    write_jsonl(HERE / "semantic-atoms.jsonl", atoms)
    write_jsonl(HERE / "reused-atom-references.jsonl", reused)
    write_jsonl(HERE / "line-coverage.jsonl", coverage)
    write_jsonl(HERE / "legacy-evidence.jsonl", make_legacy_evidence(holds))

    diffs = {}
    for row in source_rows:
        sid = row["source_item_id"]
        diffs[sid] = {"pre_isolation": row["pre_isolation"], "archive_revision": row["archive_revision"], "status": "same", "hunk_count": 0, "unified_diff": [], "current_counterpart": row["current_counterpart"], "meaning_equivalence": "unresolved", "source_ref": row["prior_research_bundle"]}
    write_json(HERE / "source-diffs.json", diffs)

    all_counts = defaultdict(int)
    per_path = {}
    for row in coverage:
        all_counts[row["category"]] += 1
        per_path.setdefault(row["source_item_id"], defaultdict(int))[row["category"]] += 1
    per_path = {k: dict(v) for k, v in per_path.items()}
    hold_sha = sha(HOLDING.read_bytes())
    reg_sha = sha(REGISTER.read_bytes())
    inv = {
        "schema": "rdp001-outside67-path006-010-atomization/v1",
        "candidate_id": "RDP-001-OUTSIDE67-PATH006-010-ATOMIZATION-0096",
        "research_completion": {
            "status": "partial_research",
            "selected_path_line_coverage": "complete",
            "selected_line_residual_count": 0,
            "semantic_atomization": "candidate_only_partial",
            "path_atomization_complete": False,
            "unselected_path_revision_pair_count": 62,
        },
        "status": "findings_only",
        "authority_effect": "none",
        "meaning_change_applied": False,
        "successor_requirement_ids": [],
        "human_decision_ref": None,
        "formal_register_append": False,
        "old_runtime_test_ci_execution": False,
        "scope": {
            "worktree": "/home/tenni/HELIX-HARNESS-outside006-010-atoms",
            "materialization_path": "/home/tenni/HELIX-HARNESS-outside006-010-atoms",
            "base_origin_main": BASE,
            "base_origin_main_observed_at_start": BASE,
            "read_only": True,
            "static_only": True,
            "holding_registration_id": "MPR-SH-OUTSIDE67-001",
            "holding_path": str(HOLDING.relative_to(ROOT)),
            "holding_sha256": hold_sha,
            "management_register_path": str(REGISTER.relative_to(ROOT)),
            "management_register_sha256": reg_sha,
            "holding_path_revision_pair_denominator": 67,
            "holding_record_count": 67,
            "selected_path_revision_pair_count": 5,
            "selected_source_document_count": 5,
            "unexplored_path_revision_pair_count": 62,
            "base_drift_policy": "先行#2043またはorigin/mainが変わった場合は停止し、source holding・snapshot・current counterpartを再照合してこの束を新baseへrebaselineする。静かに追随しない。",
            "base_drift_observed": False,
            "base_rebaseline_count": 0,
            "stop_condition": "#2043のreview修正・merge、またはorigin/mainがbase_origin_main以外へ進んだ場合は、current HEADを固定して停止し再baselineする。",
        },
        "source_holding": {"registration_id": "MPR-SH-OUTSIDE67-001", "source_atom_count": 67, "path_revision_pair_denominator": 67, "selected_item_ids": list(PATHS), "selected_ordinals": [6, 7, 8, 9, 10], "unselected_count": 62, "coverage_result": "source_preserved_candidate_atomization_only", "product_target": "unassigned_cross_product", "authority_effect": "none"},
        "classification_basis": {"product": "holding reported product/path is a boundary candidate only; all four products remain possible and no owner/routing is assigned", "phase": "reported phase is retained as an unapproved candidate label; no phase authority or admission is inferred", "semantic_units": "one unique source line coverage record per pair/line; compound lines remain composite_unresolved; PATH-008 uses merged atom IDs by reference", "implementation": "source text, current counterpart hash, and ledger hits do not prove implementation", "degradation": "failure/degraded/unimplemented are unknown", "failure_consumer_decision": "failure, consumer, decision closure and adoption are not inferred from presence or absence", "revision_diff": "pre-isolation/archive Git objects and current counterpart at the fixed main base are compared statically"},
        "four_products": [{"product": p, "status": "boundary_candidate_only", "authority_effect": "none"} for p in FOUR_PRODUCTS],
        "documents": source_rows,
        "line_accounting": {"unique_source_line_count": len(coverage), "category_counts": dict(all_counts), "per_path": per_path, "disjoint_categories": True, "selected_line_residual_count": 0, "path008_reused_atom_count": len(reused), "new_atom_count": len(atoms), "total_atom_references": len(reused) + len(atoms)},
        "semantic_atoms": {"new_atom_file": "semantic-atoms.jsonl", "new_atom_count": len(atoms), "reused_atom_file": "reused-atom-references.jsonl", "reused_atom_count": len(reused), "line_coverage_file": "line-coverage.jsonl", "atomized_candidate_line_count": all_counts["atomized_candidate"], "metadata_only_line_count": all_counts["metadata_only"], "composite_unresolved_line_count": all_counts["composite_unresolved"]},
        "legacy_evidence": {"file": "legacy-evidence.jsonl", "ledger_paths": OLD_LEDGER_PATHS, "lookup_mode": "exact source_item/path/blob anchors only; no-hit is recorded as unknown and never as absence"},
        "findings": [{"id": "F001", "status": "observed", "text": "5 selected path_revision_pair source snapshots are byte-identical between pre-isolation and archive revision."}, {"id": "F002", "status": "observed", "text": "PATH-008 merged semantic atoms are referenced by ID and digest, not copied into the new atom file."}, {"id": "F003", "status": "observed", "text": "Current counterpart paths are recorded at fixed main base with relocation/content drift relation retained."}],
        "unresolved_questions": [{"id": "Q001", "status": "open", "text": "Which source lines, if any, become formally adopted requirements?"}, {"id": "Q002", "status": "open", "text": "Which product owner, successor, phase authority, implementation and degradation evidence is approved?"}, {"id": "Q003", "status": "open", "text": "What human decision and review revision closes each candidate?"}],
        "prohibited_inference": [{"id": "P001", "status": "prohibited", "text": "Do not treat path/blob or current counterpart as a requirement or implementation proof."}, {"id": "P002", "status": "prohibited", "text": "Do not promote candidate product/phase labels into owner, authority, adoption or successor."}, {"id": "P003", "status": "prohibited", "text": "Do not infer failure, consumer closure, degradation, or completion from ledger no-hit/presence."}, {"id": "P004", "status": "prohibited", "text": "Do not execute archive assets or old CI/runtime/test as an oracle."}],
        "residuals": {"formal_requirement": "open", "owner": "open", "successor": "open", "phase_authority": "open", "implementation": "open", "degradation": "open", "failure": "open", "consumer": "open", "decision": "open", "adoption": "open"},
        "verification_scope": ["source_revision_stale", "schema_interface", "deterministic_behavior", "negative_case", "forbidden_write_scope"],
    }
    write_json(HERE / "inventory.json", inv)


if __name__ == "__main__":
    main()
