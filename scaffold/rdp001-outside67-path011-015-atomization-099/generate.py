#!/usr/bin/env python3
"""Deterministic static materializer for outside67 PATH-011..015.

Only Git objects, the outside67 holding, and the existing PATH-011 atom bundle
are read.  The old archive is never executed.  Existing PATH-011 atom JSON is
referenced by ID and digest; it is intentionally absent from the new atom file.
"""
from __future__ import annotations

import difflib
import hashlib
import json
import subprocess
from collections import Counter, defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
BASE = "72b9f368a044709437841c5e862f01802b1a88ec"
PRE = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCH = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
HOLDING = ROOT / "docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl"
REGISTER = ROOT / "docs/governance/management-provisional-requirement-register.jsonl"
PRIOR_BUNDLE = ROOT / "scaffold/rdp001-outside67-web-webos-l2-gap-057"
OLD_LEDGER_PATHS = [
    "docs/governance/legacy-asset-disposition.jsonl",
    "docs/governance/legacy-asset-decisions.jsonl",
    "docs/governance/legacy-asset-copy-read-after.jsonl",
    "docs/governance/legacy-asset-decision-log.md",
    "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl",
    "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl",
    "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl",
]
SOURCE_PATHS = {
    "OUTSIDE67-PATH-011": "docs/design/helix-web/L2-requirements/product-requirements.md",
    "OUTSIDE67-PATH-012": "docs/design/helix-web/README.md",
    "OUTSIDE67-PATH-013": "docs/design/helix/L2-requirements/README.md",
    "OUTSIDE67-PATH-014": "docs/design/helix/L2-requirements/concept-v4-derived-requirements.md",
    "OUTSIDE67-PATH-015": "docs/governance/audits/l2-requirements/candidate-source-target-inventory.md",
}
CURRENT_PATHS = {
    "OUTSIDE67-PATH-011": "docs/helix-web/L2-requirements/product-requirements.md",
    "OUTSIDE67-PATH-012": "docs/helix-web/README.md",
    "OUTSIDE67-PATH-013": None,
    "OUTSIDE67-PATH-014": None,
    "OUTSIDE67-PATH-015": "docs/governance/audits/source-rebaseline/candidate-source-target-inventory.md",
}
FOUR_PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
SELECTED = list(SOURCE_PATHS)


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def blob_oid(data: bytes) -> str:
    return hashlib.sha1(f"blob {len(data)}\0".encode() + data).hexdigest()


def git_show(revision: str, path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)


def read_jsonl(path: Path):
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def write_json(path: Path, value) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_jsonl(path: Path, rows) -> None:
    path.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in rows), encoding="utf-8")


def text_lines(data: bytes) -> list[str]:
    return data.decode("utf-8").splitlines()


def source_atom_digest(atom: dict) -> str:
    return sha(json.dumps(atom, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8"))


def holding_rows() -> dict[str, dict]:
    rows = read_jsonl(HOLDING)
    return {row["source_item_id"]: row for row in rows if row["source_item_id"] in SELECTED}


def prior_atoms() -> dict[int, list[dict]]:
    result: dict[int, list[dict]] = defaultdict(list)
    for line in (PRIOR_BUNDLE / "semantic-atoms.jsonl").read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        atom = json.loads(line)
        if atom.get("source_item_id") == "OUTSIDE67-PATH-011":
            line_no = atom["source_fragment"].get("line") or atom["revision_pair"]["pre_isolation"]["line_start"]
            result[line_no].append(atom)
    return result


def current_counterpart(sid: str) -> dict:
    path = CURRENT_PATHS[sid]
    if path is None:
        return {"state": "no_exact_current_counterpart_selected", "path": None, "commit": BASE, "sha256": None, "blob_oid": None, "bytes": None, "line_count": None}
    try:
        data = git_show(BASE, path)
    except subprocess.CalledProcessError:
        return {"state": "no_exact_current_counterpart_at_base", "path": path, "commit": BASE, "sha256": None, "blob_oid": None, "bytes": None, "line_count": None}
    return {"state": "current_counterpart_observed", "path": path, "commit": BASE, "sha256": sha(data), "blob_oid": blob_oid(data), "bytes": len(data), "line_count": len(text_lines(data))}


def line_metadata(text: str) -> bool:
    stripped = text.strip()
    if not stripped or stripped.startswith("#"):
        return True
    if stripped in {"---", "|---|", "| --- |", "|---|---|", "| --- | --- |", "|---|---|---|", "| --- | --- | --- |"}:
        return True
    # Table headers are metadata; rows carrying IDs/conditions are composite.
    if stripped.startswith("|") and "---" in stripped:
        return True
    return False


def line_category(sid: str, line_no: int, text: str, prior: dict[int, list[dict]]) -> str:
    if sid == "OUTSIDE67-PATH-011":
        refs = prior.get(line_no, [])
        if refs:
            return "atomized_candidate" if any(a["atomization_status"] == "atomized_candidate" for a in refs) else "composite_unresolved"
        if 2 <= line_no <= 11:
            return "metadata_only"
        return "metadata_only" if line_metadata(text) else "composite_unresolved"
    if line_metadata(text):
        return "metadata_only"
    if text.lstrip().startswith("|"):
        return "composite_unresolved"
    return "atomized_candidate"


def pair_rows(pre: list[str], arch: list[str]):
    """Yield aligned rows; every pre and archive line appears once.

    Replacements are paired conservatively and categorized as unresolved by the
    caller. Insertions/deletions retain a null side and cannot create atoms.
    """
    matcher = difflib.SequenceMatcher(a=pre, b=arch, autojunk=False)
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag in {"equal", "replace"}:
            width = max(i2 - i1, j2 - j1)
            for offset in range(width):
                yield (i1 + offset + 1 if i1 + offset < i2 else None, j1 + offset + 1 if j1 + offset < j2 else None, tag)
        elif tag == "delete":
            for i in range(i1, i2):
                yield (i + 1, None, tag)
        elif tag == "insert":
            for j in range(j1, j2):
                yield (None, j + 1, tag)


def atom(sid: str, line_no: int, text: str, hold: dict, pre_meta: dict, arch_meta: dict) -> dict:
    line_hash = sha(text.encode("utf-8"))
    return {
        "action": text,
        "actor": "unresolved",
        "atom_id": f"RDP-001-OUTSIDE67-{sid.rsplit('-', 1)[1]}-LINE-{line_no:03d}",
        "atomization_status": "atomized_candidate",
        "authority_effect": "none",
        "candidate_granularity": "unit",
        "candidate_inference": [],
        "candidate_kind": "source_line_candidate",
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
        "diff_observation": {"status": "unresolved", "text": "pre-isolation／archiveの差分意味は未判定。source-diffs.jsonのexact diffだけを参照する。", "source_ref": "source-diffs.json"},
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
        "normalized_statement": {"status": "source_supported", "text": text, "source_ref": "source_fragment"},
        "normalized_statement_status": "source_supported",
        "phase_status": "unknown_path_based_candidate_only",
        "retained_meaning": {"status": "preserved_source_meaning", "items": [text], "source_ref": "source_fragment"},
        "revision_pair": {"pre_isolation": {"commit": PRE, "blob_oid": pre_meta["blob_oid"], "exact_source_text": text + "\n", "line_start": line_no, "line_end": line_no, "line_sha256": line_hash, "byte_sha256": line_hash}, "archive": {"commit": ARCH, "blob_oid": arch_meta["blob_oid"], "exact_source_text": text + "\n", "line_start": line_no, "line_end": line_no, "line_sha256": line_hash, "byte_sha256": line_hash}},
        "semantic_action": text,
        "semantic_condition": "unresolved",
        "semantic_subject": "unresolved",
        "sequence": "unresolved",
        "source_fragment": {"character_start": 0, "character_end": len(text), "line": line_no, "status": "exact", "text": text},
        "source_item_id": sid,
        "source_line_shared": False,
        "source_ordinal": int(sid.rsplit("-", 1)[1]),
        "source_path": hold["source_path"],
        "source_semantic_status": "candidate_only",
        "source_support": {"actor": {"status": "unresolved", "text": None}, "action": {"status": "exact", "text": text}, "condition": {"status": "unresolved", "text": None}, "guard": {"status": "unresolved", "text": None}, "sequence": {"status": "unresolved", "text": None}, "source_fragment_text": text},
        "successor_requirement_ids": [],
        "unresolved_questions": {"status": "open_unknowns", "items": ["このsource lineの採択、責務owner、authority、phaseを決める人間decision revision", "旧／現行implementation、degradation、failure、consumer、decisionのexact evidence"], "scope": "atom"},
        "span_kind": "atomized_candidate",
    }


def legacy_evidence(holds: dict[str, dict]) -> list[dict]:
    rows = []
    for sid, hold in holds.items():
        terms = [sid, hold["source_path"], hold["pre_isolation"]["blob_oid"], hold["archive"]["blob_oid"]]
        for path in OLD_LEDGER_PATHS:
            data = git_show(BASE, path)
            anchors = []
            for no, line in enumerate(data.decode("utf-8", errors="replace").splitlines(), 1):
                matched = [term for term in terms if term in line]
                if matched:
                    anchors.append({"line": no, "text_sha256": sha(line.encode("utf-8")), "matched_terms": matched})
            rows.append({"source_item_id": sid, "ledger_path": path, "scan_commit": BASE, "ledger_sha256": sha(data), "lookup": "exact_text_hit" if anchors else "no_exact_text_hit", "anchors": anchors, "implementation_status": "unknown", "degradation_status": "unknown", "failure_status": "unknown", "consumer_status": "unknown", "decision_status": "unknown", "no_inference_from_absence": True})
    return rows


def main() -> None:
    HERE.mkdir(parents=True, exist_ok=True)
    holds = holding_rows()
    if set(holds) != set(SELECTED):
        raise SystemExit("holding is missing a selected path")
    prior = prior_atoms()
    selected_rows = []
    coverage = []
    new_atoms = []
    reused = []
    diffs = {}
    counts = Counter()
    per_path = defaultdict(Counter)
    for sid in SELECTED:
        hold = holds[sid]
        pre_data = git_show(PRE, hold["source_path"])
        arch_data = git_show(ARCH, hold["source_path"])
        pre, arch = text_lines(pre_data), text_lines(arch_data)
        pre_meta, arch_meta = hold["pre_isolation"], hold["archive"]
        if sha(pre_data) != pre_meta["sha256"] or blob_oid(pre_data) != pre_meta["blob_oid"] or len(pre_data) != pre_meta["bytes"]:
            raise SystemExit(f"pre holding mismatch: {sid}")
        if sha(arch_data) != arch_meta["sha256"] or blob_oid(arch_data) != arch_meta["blob_oid"] or len(arch_data) != arch_meta["bytes"]:
            raise SystemExit(f"archive holding mismatch: {sid}")
        selected_rows.append({"source_item_id": sid, "source_ordinal": int(sid.rsplit("-", 1)[1]), "source_unit": "path_revision_pair", "artifact_kind": hold["artifact_kind"], "source_path": hold["source_path"], "candidate_product": hold["reported_path_scope"]["product_scope"], "candidate_phase": hold["reported_path_scope"]["phase_scope"], "candidate_product_status": "unknown_path_based_candidate_only", "candidate_phase_status": "unknown_path_based_candidate_only", "holding": {"registration_id": "MPR-SH-OUTSIDE67-001", "denominator": 67, "pre_sha256": pre_meta["sha256"], "archive_sha256": arch_meta["sha256"], "source_holding_status": hold["source_holding_status"]}, "pre_isolation": {"commit": PRE, "blob_oid": blob_oid(pre_data), "bytes": len(pre_data), "sha256": sha(pre_data), "line_count": len(pre)}, "archive_revision": {"commit": ARCH, "blob_oid": blob_oid(arch_data), "bytes": len(arch_data), "sha256": sha(arch_data), "line_count": len(arch)}, "current_counterpart": current_counterpart(sid), "status": {"semantic_disposition": "not_started", "authority_effect": "none", "meaning_change_applied": False, "successor_requirement_ids": [], "implementation_status": "unknown", "degradation_status": "unknown", "failure_status": "unknown", "consumer_status": "unknown", "decision_status": "unknown", "legacy_implementation_status": "unknown", "current_implementation_status": "unknown", "legacy_degradation_status": "unknown", "current_degradation_status": "unknown"}})
        diffs[sid] = {"status": "same" if pre_data == arch_data else "different", "hunk_count": sum(1 for line in difflib.unified_diff(pre, arch, lineterm="") if line.startswith("@@")), "unified_diff": list(difflib.unified_diff(pre, arch, fromfile="pre-isolation", tofile="archive-revision", lineterm="")), "meaning_equivalence": "unresolved", "source_ref": "exact Git objects only"}
        for pre_no, arch_no, alignment in pair_rows(pre, arch):
            pre_text = pre[pre_no - 1] if pre_no else None
            arch_text = arch[arch_no - 1] if arch_no else None
            same = pre_text is not None and arch_text is not None and pre_text == arch_text and alignment == "equal"
            category = line_category(sid, pre_no, pre_text, prior) if pre_no and same else ("metadata_only" if ((pre_text is None or line_metadata(pre_text)) and (arch_text is None or line_metadata(arch_text))) else "composite_unresolved")
            atom_ids = []
            if sid == "OUTSIDE67-PATH-011" and pre_no in prior:
                for old in prior[pre_no]:
                    category = "atomized_candidate" if old["atomization_status"] == "atomized_candidate" else "composite_unresolved"
                    atom_ids.append(old["atom_id"])
                    reused.append({"atom_id": old["atom_id"], "source_item_id": sid, "source_line": pre_no, "category": category, "source_bundle": "scaffold/rdp001-outside67-web-webos-l2-gap-057", "source_atom_sha256": source_atom_digest(old)})
            elif sid != "OUTSIDE67-PATH-011" and same and pre_no and category == "atomized_candidate":
                item = atom(sid, pre_no, pre_text, hold, pre_meta, arch_meta)
                new_atoms.append(item)
                atom_ids.append(item["atom_id"])
            row = {"coverage_id": f"COV-{sid.rsplit('-', 1)[1]}-{pre_no or 'A'+str(arch_no):0>3}", "source_item_id": sid, "pre_line": pre_no, "archive_line": arch_no, "pre_text": pre_text, "archive_text": arch_text, "pre_line_sha256": sha(pre_text.encode()) if pre_text is not None else None, "archive_line_sha256": sha(arch_text.encode()) if arch_text is not None else None, "category": category, "atom_ids": atom_ids, "accounting_source": "reused_existing_atom" if sid == "OUTSIDE67-PATH-011" and atom_ids else ("new_source_line_candidate" if atom_ids else "line_span_unresolved")}
            coverage.append(row)
            counts[category] += 1
            per_path[sid][category] += 1
    selected_rows.sort(key=lambda row: row["source_ordinal"])
    reused.sort(key=lambda row: (row["source_item_id"], row["source_line"], row["atom_id"]))
    new_atoms.sort(key=lambda row: (row["source_item_id"], row["source_fragment"]["line"]))
    coverage.sort(key=lambda row: (row["source_item_id"], row["pre_line"] is None, row["pre_line"] or row["archive_line"]))
    write_jsonl(HERE / "selected-source-items.jsonl", selected_rows)
    write_jsonl(HERE / "semantic-atoms.jsonl", new_atoms)
    write_jsonl(HERE / "reused-atom-references.jsonl", reused)
    write_jsonl(HERE / "line-coverage.jsonl", coverage)
    write_jsonl(HERE / "legacy-evidence.jsonl", legacy_evidence(holds))
    for sid in SELECTED:
        dest = HERE / "source-snapshots" / sid
        dest.mkdir(parents=True, exist_ok=True)
        dest.joinpath("pre-isolation.md").write_bytes(git_show(PRE, holds[sid]["source_path"]))
        dest.joinpath("archive-revision.md").write_bytes(git_show(ARCH, holds[sid]["source_path"]))
    write_json(HERE / "source-diffs.json", diffs)
    per_path_json = {sid: dict(per_path[sid]) for sid in SELECTED}
    inv = {"schema": "rdp001-outside67-path011-015-atomization/v1", "candidate_id": "RDP-001-OUTSIDE67-PATH011-015-ATOMIZATION-0099", "scaffold_binding_id": "SCF-B-0099", "status": "findings_only", "authority_effect": "none", "meaning_change_applied": False, "successor_requirement_ids": [], "human_decision_ref": None, "formal_register_append": False, "old_runtime_test_ci_execution": False, "research_completion": {"status": "partial_research", "selected_line_coverage": "complete", "selected_line_residual_count": 0, "path_atomization_complete": False, "unselected_path_revision_pair_count": 62}, "scope": {"base_origin_main": BASE, "base_origin_main_observed_at_start": BASE, "holding_path": str(HOLDING.relative_to(ROOT)), "holding_sha256": sha(HOLDING.read_bytes()), "management_register_path": str(REGISTER.relative_to(ROOT)), "management_register_sha256": sha(REGISTER.read_bytes()), "holding_path_revision_pair_denominator": 67, "holding_record_count": 67, "selected_path_revision_pair_count": 5, "selected_source_document_count": 5, "unexplored_path_revision_pair_count": 62, "unexplored_scope": "OUTSIDE67-PATH-001..010,016..067（選択5 pairを除く62 pair。選択文書内の未分割意味も含む）", "pre_isolation_commit": PRE, "archive_commit": ARCH, "read_only": True, "static_only": True, "base_drift_policy": "base_origin_mainは固定した祖先ゲート。live origin/mainとの同値を要求せず、baseがHEADの祖先でない場合だけ停止してrebaselineする。", "legacy_ledger_sha256": {path: sha(git_show(BASE, path)) for path in OLD_LEDGER_PATHS}}, "source_holding": {"registration_id": "MPR-SH-OUTSIDE67-001", "source_atom_count": 67, "path_revision_pair_denominator": 67, "selected_item_ids": SELECTED, "selected_ordinals": [11, 12, 13, 14, 15], "unselected_count": 62, "coverage_result": "source_preserved_candidate_atomization_only", "product_target": "unassigned_cross_product", "authority_effect": "none"}, "classification_basis": {"product": "holding reported product scope is a path-based candidate only; four-product candidate pool is retained and no final owner is assigned", "phase": "holding reported phase is an unapproved candidate label; no phase authority or admission is inferred", "semantic_units": "each pre/archive source line is covered once per revision side; equal non-table prose becomes a source-line candidate, compound/table rows remain composite_unresolved, and PATH-011 prior atoms are ID/digest references", "implementation": "current counterpart and old ledger exact hits are evidence-gated; absence is not evidence of implementation state", "degradation": "legacy/current degradation is unknown without exact evidence", "failure_consumer_decision": "failure, consumer, decision closure and adoption are unknown", "revision_diff": "pre-isolation and archive Git objects are statically diffed; meaning equivalence remains unresolved"}, "four_products": [{"product": product, "status": "boundary_candidate_only", "authority_effect": "none"} for product in FOUR_PRODUCTS], "documents": selected_rows, "line_accounting": {"unique_coverage_record_count": len(coverage), "pre_source_line_count": sum(row["pre_isolation"]["line_count"] for row in selected_rows), "archive_source_line_count": sum(row["archive_revision"]["line_count"] for row in selected_rows), "category_counts": dict(counts), "per_path": per_path_json, "selected_line_residual_count": 0, "disjoint_categories": True, "path011_reused_atom_count": len(reused), "new_atom_count": len(new_atoms), "total_atom_references": len(reused) + len(new_atoms)}, "semantic_atoms": {"new_atom_file": "semantic-atoms.jsonl", "new_atom_count": len(new_atoms), "reused_atom_file": "reused-atom-references.jsonl", "reused_atom_count": len(reused), "line_coverage_file": "line-coverage.jsonl", "atomized_candidate_line_count": counts["atomized_candidate"], "metadata_only_line_count": counts["metadata_only"], "composite_unresolved_line_count": counts["composite_unresolved"]}, "legacy_evidence": {"file": "legacy-evidence.jsonl", "ledger_paths": OLD_LEDGER_PATHS, "lookup_mode": "exact source_item/path/blob anchors only; no-hit remains unknown"}, "findings": [{"id": "F001", "status": "observed", "text": "Five selected outside67 path_revision_pairs preserve exact pre-isolation/archive Git metadata for static review."}, {"id": "F002", "status": "observed", "text": "PATH-011 existing atoms are referenced by stable ID and canonical JSON digest; no duplicate atom rows are emitted."}, {"id": "F003", "status": "observed", "text": "Every selected pre/archive line is covered once per revision side, with normative table/compound content retained as composite_unresolved rather than metadata fallback."}], "unresolved_questions": [{"id": "Q001", "status": "open", "text": "Which source-line candidates become formally adopted requirements, if any?"}, {"id": "Q002", "status": "open", "text": "Which product owner, phase authority, successor, implementation/degradation evidence and decision revision is approved?"}, {"id": "Q003", "status": "open", "text": "What exact failure and consumer evidence closes each candidate?"}], "prohibited_inference": [{"id": "P001", "status": "prohibited", "text": "Do not treat path/blob/current counterpart as formal requirement or implementation proof."}, {"id": "P002", "status": "prohibited", "text": "Do not promote product/phase candidates into final owner, authority, successor or admission."}, {"id": "P003", "status": "prohibited", "text": "Do not infer implementation, degradation, failure, consumer closure or decision from ledger hit/no-hit or absence."}, {"id": "P004", "status": "prohibited", "text": "Do not execute old archive runtime, tests, CI, workflows, hooks, adapters or source."}], "residuals": {"formal_requirement": "open", "owner": "open", "successor": "open", "phase_authority": "open", "implementation": "open", "degradation": "open", "failure": "open", "consumer": "open", "decision": "open", "adoption": "open"}, "verification_scope": ["source_revision_stale", "schema_interface", "deterministic_behavior", "negative_case", "forbidden_write_scope"]}
    write_json(HERE / "inventory.json", inv)


if __name__ == "__main__":
    main()
