#!/usr/bin/env python3
"""Fail-closed validator for SCF-B-0107 fixed-base product research."""
from __future__ import annotations

import hashlib
import json
import subprocess
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-asset-product-classification-0107"
LEDGER = BUNDLE / "classification-research.jsonl"
INVENTORY = BUNDLE / "inventory.json"
BASE_REVISION = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
CROSSWALK = "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DECOMPOSITION = "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
BOUNDARY = "docs/concept/product-boundary.md"
L1 = {
    "HELIX-HARNESS": "docs/helix-harness/L1-planning/product-intent.md",
    "HELIX-OS": "docs/helix-os/L1-planning/system-intent.md",
    "HELIX-Web": "docs/helix-web/L1-planning/product-intent.md",
    "HELIX-Web-OS": "docs/helix-web-os/L1-planning/system-intent.md",
}
FAILURE_SOURCE = "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md"
CONSUMER_SOURCE = "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md"
WAVE_PATHS = {
    n: (f"docs/governance/legacy-requirement-direct-semantic-review-wave{n}.jsonl" if n <= 36 else f"scaffold/legacy-semantic-review-wave{n}/legacy-requirement-direct-semantic-review-wave{n}.jsonl")
    for n in range(1, 51)
}
GLOBAL_INPUTS = [PHASE, DISPOSITION, DECISIONS, READ_AFTER, CROSSWALK, DECOMPOSITION, BOUNDARY, *L1.values(), FAILURE_SOURCE, CONSUMER_SOURCE, "docs/governance/legacy-asset-decision-log.md", "docs/governance/legacy-asset-reuse-control.md", "docs/governance/new-generation-start-here.md", "archive/legacy-generation-2026-09-14/MANIFEST.sha256"]
BOUNDARY_RANGES = {"HELIX-HARNESS": [(36, 36), (54, 61), (86, 89)], "HELIX-OS": [(37, 37), (55, 65), (86, 89)], "HELIX-Web": [(38, 38), (56, 56), (63, 70)], "HELIX-Web-OS": [(39, 39), (57, 57), (63, 70)]}
L1_RANGES = {"HELIX-HARNESS": [(22, 24), (54, 58)], "HELIX-OS": [(22, 25), (59, 63)], "HELIX-Web": [(24, 26), (47, 49)], "HELIX-Web-OS": [(14, 15), (39, 44)]}
FAILURE_RANGES = [(17, 23), (52, 63)]
CONSUMER_RANGES = [(24, 36), (38, 50)]


def fail(code: str, message: str) -> None:
    raise AssertionError(f"{code}: {message}")


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def tagged(data: bytes) -> str:
    return "sha256:" + sha(data)


def canonical(value: object) -> str:
    return tagged(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())


def git_bytes(path: str, base: str = BASE_REVISION) -> bytes:
    try:
        return subprocess.check_output(["git", "show", f"{base}:{path}"])
    except subprocess.CalledProcessError as exc:
        fail("E_BASE_SOURCE", f"missing fixed-base path {path}: {exc}")


def git_blob(path: str, base: str = BASE_REVISION) -> str:
    try:
        return subprocess.check_output(["git", "rev-parse", f"{base}:{path}"], text=True).strip()
    except subprocess.CalledProcessError as exc:
        fail("E_BASE_SOURCE", f"missing fixed-base blob {path}: {exc}")


def local_json(path: Path):
    return json.loads(path.read_text())


def local_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def base_jsonl(path: str) -> list[tuple[int, dict]]:
    return [(i, json.loads(line)) for i, line in enumerate(git_bytes(path).decode().splitlines(), 1) if line.strip()]


def row_digest(row: dict) -> str:
    return canonical(row)


def receipt(path: str, start: int, end: int) -> dict:
    lines = git_bytes(path).decode(errors="replace").splitlines()
    if not (1 <= start <= end <= len(lines)):
        fail("E_SOURCE_LINE", f"range outside {path}:{start}-{end}")
    text = "\n".join(lines[start - 1 : end])
    return {"path": path, "blob": git_blob(path), "line_start": start, "line_end": end, "line_count": end - start + 1, "line_text_sha256": tagged(text.encode()), "line_text": lines[start - 1 : end]}


def assert_receipt(actual: dict, path: str, start: int, end: int, code: str = "E_BOUNDARY_DIGEST") -> None:
    expected = receipt(path, start, end)
    if actual != expected:
        fail(code, f"receipt mismatch {path}:{start}-{end}")


def expected_links(rows: list[tuple[int, str, int, dict]]) -> list[dict]:
    out = []
    for wave, path, line, row in rows:
        edge_base = {"wave": wave, "path": path, "line": line, "asset_id": row["asset_id"], "unit_candidate_id": row.get("unit_candidate_id"), "semantic_link_status": row.get("semantic_link_status")}
        out.append({
            "edge_id": canonical(edge_base), "wave": wave, "path": path, "line": line, "row_sha256": row_digest(row), "asset_id": row["asset_id"],
            "source_requirement_id": row.get("source_requirement_id"), "artifact_evidence_kind": row.get("artifact_evidence_kind"), "unit_candidate_id": row.get("unit_candidate_id"), "semantic_link_status": row.get("semantic_link_status"), "semantic_relation": row.get("semantic_relation"),
            "candidate_product_targets": row.get("candidate_product_targets") or [], "product_scope": row.get("product_scope") or [], "candidate_phase_targets": row.get("candidate_phase_targets") or [],
            "source_path": row.get("source_path"), "source_sha256": row.get("source_sha256"), "source_statement_semantic_digest": row.get("source_statement_semantic_digest"), "source_statement_text": row.get("source_statement_text"), "source_text_spans": row.get("source_text_spans") or [], "evidence_refs": row.get("evidence_refs") or [],
            "legacy_asset_evidence_state": row.get("legacy_asset_evidence_state"), "legacy_execution_status": row.get("legacy_execution_status"), "consumer_closure_status": row.get("consumer_closure_status"), "observed_consumer_refs": row.get("observed_consumer_refs") or [], "counterevidence": row.get("counterevidence") or [], "unresolved": row.get("unresolved") or [], "product_alignment_status": row.get("product_alignment_status"), "authority_effect": row.get("authority_effect"), "new_build_allowed": row.get("new_build_allowed"),
        })
    return sorted(out, key=lambda x: (x["wave"], x["line"], x["edge_id"]))


def compact_crosswalk(row: dict, line: int) -> dict:
    fields = ["crosswalk_id", "source_requirement_id", "unit_candidate_id", "product_scope", "responsibility_summary", "direct_legacy_asset_link_status", "phase_classification_status", "direct_phase_candidates", "current_requirement_implementation_status", "legacy_requirement_implementation_status", "consumer_closure_status", "successor_assignment_status", "legacy_execution_performed", "new_build_allowed", "authority_effect", "unresolved"]
    out = {k: row.get(k) for k in fields}; out.update({"path": CROSSWALK, "line": line, "row_sha256": row_digest(row)}); return out


def compact_decomp(parent: dict, unit: dict, line: int) -> dict:
    return {"path": DECOMPOSITION, "line": line, "decomposition_id": parent.get("decomposition_id"), "source_requirement_id": parent.get("source_requirement_id"), "unit_candidate_id": unit.get("unit_candidate_id"), "unit_kind": unit.get("unit_kind"), "product_target": unit.get("product_target"), "direct_phase_candidates": unit.get("direct_phase_candidates"), "phase_classification_status": unit.get("phase_classification_status"), "semantic_coverage_status": unit.get("semantic_coverage_status"), "authority_effect": unit.get("authority_effect"), "row_sha256": canonical({"parent": parent.get("source_requirement_id"), "unit": unit})}


def expected_category(links: list[dict]) -> tuple[str, str, list[str]]:
    products = sorted({p for link in links for p in (link.get("candidate_product_targets") or []) + (link.get("product_scope") or [])})
    statuses = {link.get("semantic_link_status") for link in links}
    if len(products) > 1:
        return "multi_product_conflict", "Wave unit product_scope/candidate_product_targets contain multiple distinct products; a single owner cannot be inferred." + (" All observed semantic links are rejected, so the candidate is retained as counter-evidence only." if statuses == {"rejected"} else ""), products
    if "rejected" in statuses:
        return "insufficient_basis", "The only semantic link is rejected; the source anchor does not support a product proposal despite the adjacent unit candidate.", products
    if len(products) == 1 and links and all(link.get("source_path") and link.get("source_sha256") for link in links):
        return "direct_product_basis", "Every observed link has an exact legacy source anchor and one unit product candidate; the proposal remains unresolved because semantic_link_status and product authority are not approved.", products
    return "insufficient_basis", "No complete single-product source-backed candidate survives the Wave semantic-link evidence.", products


def verify_base() -> None:
    try:
        subprocess.check_call(["git", "merge-base", "--is-ancestor", BASE_REVISION, "HEAD"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        fail("E_BASE_NOT_ANCESTOR", f"fixed BASE {BASE_REVISION} is not an ancestor of HEAD")


def verify_inputs(inventory: dict) -> None:
    expected_paths = [*WAVE_PATHS.values(), *GLOBAL_INPUTS]
    actual = inventory.get("input_digests")
    if not isinstance(actual, list) or len(actual) != len(expected_paths) or len({x.get("path") for x in actual}) != len(expected_paths) or [x.get("path") for x in actual] != expected_paths:
        fail("E_INPUT_SET", "input digest path set/order differs from deterministic Wave1-50 input set")
    for item in actual:
        data = git_bytes(item["path"])
        expected = {"path": item["path"], "blob": git_blob(item["path"]), "bytes": len(data), "sha256": tagged(data)}
        if item != expected:
            fail("E_INPUT_DIGEST", f"input digest mismatch {item.get('path')}")


def verify_range_groups(record: dict) -> None:
    boundary = record.get("boundary_evidence")
    if set(boundary or {}) != set(BOUNDARY_RANGES):
        fail("E_BOUNDARY_DIGEST", "four-product boundary evidence set mismatch")
    for product, ranges in BOUNDARY_RANGES.items():
        obj = boundary[product]
        if obj.get("path") != BOUNDARY or obj.get("blob") != git_blob(BOUNDARY) or len(obj.get("ranges", [])) != len(ranges):
            fail("E_BOUNDARY_DIGEST", f"boundary metadata mismatch {product}")
        for actual, pair in zip(obj["ranges"], ranges):
            assert_receipt(actual, BOUNDARY, *pair)
    l1 = record.get("l1_evidence")
    if set(l1 or {}) != set(L1):
        fail("E_BOUNDARY_DIGEST", "four-product L1 evidence set mismatch")
    for product, path in L1.items():
        obj = l1[product]
        if obj.get("path") != path or obj.get("blob") != git_blob(path) or len(obj.get("ranges", [])) != len(L1_RANGES[product]):
            fail("E_BOUNDARY_DIGEST", f"L1 metadata mismatch {product}")
        for actual, pair in zip(obj["ranges"], L1_RANGES[product]):
            assert_receipt(actual, path, *pair)
    static = record.get("failure_consumer_static_refs")
    for key, path, ranges in [("failure", FAILURE_SOURCE, FAILURE_RANGES), ("consumer", CONSUMER_SOURCE, CONSUMER_RANGES)]:
        obj = static.get(key, {})
        if obj.get("path") != path or obj.get("blob") != git_blob(path) or len(obj.get("ranges", [])) != len(ranges):
            fail("E_BOUNDARY_DIGEST", f"failure/consumer metadata mismatch {key}")
        for actual, pair in zip(obj["ranges"], ranges):
            assert_receipt(actual, path, *pair)


def verify() -> dict:
    inventory = local_json(INVENTORY)
    verify_base()
    if inventory.get("base_revision") != BASE_REVISION or inventory.get("base_source_mode") != "all input and archive evidence bytes from fixed BASE Git objects":
        fail("E_BASE_PIN", "inventory BASE pin/source mode drift")
    verify_inputs(inventory)
    rows = local_jsonl(LEDGER)
    output_hash = tagged(LEDGER.read_bytes())
    if inventory.get("output_sha256") != output_hash:
        fail("E_OUTPUT_DIGEST", "classification output digest mismatch")
    wave_rows = []
    for wave, path in WAVE_PATHS.items():
        for line, row in base_jsonl(path):
            wave_rows.append((wave, path, line, row))
    phase_rows = base_jsonl(PHASE)
    phase_by_asset = {row["asset_id"]: (line, row) for line, row in phase_rows}
    disposition_rows = base_jsonl(DISPOSITION)
    disposition_by_asset = {row["asset_id"]: (line, row) for line, row in disposition_rows}
    decisions = base_jsonl(DECISIONS); read_afters = base_jsonl(READ_AFTER)
    by_asset = defaultdict(list)
    for item in wave_rows: by_asset[item[3]["asset_id"]].append(item)
    referenced = set(by_asset)
    targets = sorted(a for a in referenced if phase_by_asset[a][1].get("product_classification_status") == "unresolved")
    if len(wave_rows) != 598 or len(referenced) != 355 or len(targets) != 64:
        fail("E_EXPECTED_DENOMINATOR", f"expected 598/355/64, got {len(wave_rows)}/{len(referenced)}/{len(targets)}")
    if inventory.get("expected_sets", {}).get("target_asset_ids") != targets or inventory.get("expected_sets", {}).get("target_asset_ids_sha256") != tagged("\n".join(targets).encode()):
        fail("E_TARGET_SET", "inventory target set drift")
    if len(rows) != 64 or sorted(r.get("asset_id") for r in rows) != targets or len({r.get("asset_id") for r in rows}) != 64:
        fail("E_TARGET_SET", "records have missing, duplicate, or extra target asset")
    cw_rows = base_jsonl(CROSSWALK); cw_by_unit = {r["unit_candidate_id"]: compact_crosswalk(r, line) for line, r in cw_rows}
    decomp_rows = base_jsonl(DECOMPOSITION); decomp_by_unit = {}
    for line, parent in decomp_rows:
        for unit in parent.get("candidate_units", []): decomp_by_unit[unit["unit_candidate_id"]] = compact_decomp(parent, unit, line)
    for record in rows:
        aid = record["asset_id"]
        if aid not in targets: fail("E_TARGET_SET", f"record outside target set {aid}")
        phase_line, phase = phase_by_asset[aid]
        if record.get("phase_ledger") != {"path": PHASE, "line": phase_line, "row_sha256": row_digest(phase), "product_classification_status": phase.get("product_classification_status"), "candidate_product_targets": phase.get("candidate_product_targets") or [], "candidate_phase_targets": phase.get("candidate_phase_targets") or [], "source_path": phase.get("source_path"), "source_sha256": phase.get("source_sha256"), "consumer_closure_status": phase.get("consumer_closure_status")}:
            fail("E_PHASE_STATUS", f"phase ledger receipt mismatch {aid}")
        disp_line, disp = disposition_by_asset[aid]
        expected_asset = {"path": DISPOSITION, "line": disp_line, "row_sha256": row_digest(disp), "source_path": disp.get("source_path"), "source_sha256": disp.get("source_sha256"), "disposition": disp.get("disposition"), "product_target": disp.get("product_target"), "authority_status": disp.get("authority_status"), "implementation_status": disp.get("implementation_status"), "consumer_refs": sorted(disp.get("consumer_refs", []))}
        if record.get("asset_ledger") != expected_asset: fail("E_HISTORY", f"asset disposition receipt mismatch {aid}")
        if disp.get("disposition") != "unresolved" or disp.get("product_target") != "unresolved" or disp.get("authority_status") != "historical": fail("E_PHASE_STATUS", f"formal asset state changed for {aid}")
        source = record.get("source_exact", {}); archive_path = ARCHIVE_PREFIX + disp["source_path"]; source_data = git_bytes(archive_path)
        if source.get("archive_path") != archive_path or source.get("source_path") != disp["source_path"] or source.get("blob") != git_blob(archive_path) or source.get("bytes") != len(source_data) or source.get("sha256") != tagged(source_data) or source.get("ledger_source_sha256") != "sha256:" + disp["source_sha256"]:
            fail("E_SOURCE_DIGEST", f"source exact mismatch {aid}")
        links = record.get("wave_semantic_links", []); expected = expected_links(by_asset[aid]);
        if len(links) != len(expected) or len({l.get("edge_id") for l in links}) != len(links) or {l.get("edge_id") for l in links} != {l["edge_id"] for l in expected}:
            fail("E_EDGE_SET", f"edge missing, duplicate, or extra for {aid}")
        expected_by_id = {l["edge_id"]: l for l in expected}
        for link in links:
            if link != expected_by_id[link["edge_id"]]: fail("E_EDGE_SET", f"edge content mismatch {aid}")
        anchors = []
        seen = set()
        for link in expected:
            for ref in link["evidence_refs"]:
                if ref.get("archive_path") != archive_path or not ref.get("line_start"): continue
                key = (ref["archive_path"], ref["line_start"], ref["line_end"], ref.get("excerpt_sha256"))
                if key in seen: continue
                seen.add(key)
                lines = source_data.decode(errors="replace").splitlines(); text = "\n".join(lines[ref["line_start"] - 1 : ref["line_end"]])
                anchors.append({"line_start": ref["line_start"], "line_end": ref["line_end"], "line_text_sha256": tagged(text.encode()), "evidence_ref_excerpt_sha256": ref.get("excerpt_sha256"), "artifact_role": ref.get("artifact_role"), "source_requirement_relation": ref.get("source_requirement_relation")})
        if source.get("evidence_anchors") != sorted(anchors, key=lambda x: (x["line_start"], x["line_end"], x["evidence_ref_excerpt_sha256"])): fail("E_SOURCE_DIGEST", f"source line anchor mismatch {aid}")
        category, reason, products = expected_category(expected)
        if record.get("classification_category") != category or record.get("classification_reason") != reason or record.get("candidate_products") != products: fail("E_CANDIDATE_PRODUCTS", f"category/product derivation mismatch {aid}")
        if record.get("semantic_link_statuses") != sorted({l.get("semantic_link_status") for l in expected}): fail("E_EDGE_SET", f"semantic status set mismatch {aid}")
        if record.get("artifact_evidence_kinds") != sorted({l.get("artifact_evidence_kind") for l in expected}): fail("E_CANDIDATE_PRODUCTS", f"artifact evidence kind mismatch {aid}")
        unit_ids = sorted({l["unit_candidate_id"] for l in expected}); units = record.get("unit_product_candidates", [])
        if [u.get("unit_candidate_id") for u in units] != unit_ids: fail("E_CANDIDATE_PRODUCTS", f"unit set mismatch {aid}")
        for unit in units:
            uid = unit["unit_candidate_id"]
            if uid not in cw_by_unit or uid not in decomp_by_unit or unit.get("crosswalk") != cw_by_unit[uid] or unit.get("decomposition") != decomp_by_unit[uid]: fail("E_CANDIDATE_PRODUCTS", f"unit evidence mismatch {aid}:{uid}")
        if record.get("authority_effect") != "none" or record.get("classification_state") != "research_proposal_pending_human_product_review" or record.get("formal_asset_classification_updated") is not False or record.get("new_build_allowed") is not False: fail("E_AUTHORITY_PROMOTION", f"authority/formal state promoted {aid}")
        if record.get("human_judgment_remaining") != ["product_owner_and_boundary_decision", "semantic_link_acceptance_or_rejection_review", "phase_admission_and_successor_assignment", "legacy_consumer_closure_and_failure_disposition", "formal_asset_classification_update"]: fail("E_HUMAN_JUDGMENT", f"human judgment set mismatch {aid}")
        history = record.get("legacy_history_failure_consumer", {})
        expected_hist = {"disposition": {"path": DISPOSITION, "line": disp_line, "row_sha256": row_digest(disp), "asset_id": aid, "revision": disp.get("revision"), "disposition": disp.get("disposition"), "asset_class": disp.get("asset_class"), "product_target": disp.get("product_target"), "authority_status": disp.get("authority_status"), "implementation_status": disp.get("implementation_status"), "consumer_refs": sorted(disp.get("consumer_refs", [])), "decision_record_ref": disp.get("decision_record_ref"), "read_after_record_ref": disp.get("read_after_record_ref")}, "decisions": [{"path": DECISIONS, "line": line, "row_sha256": row_digest(row), "decision_id": row.get("decision_id"), "disposition": row.get("disposition"), "product_target": row.get("product_target"), "consumer_refs": sorted(row.get("consumer_refs", []))} for line, row in decisions if row.get("asset_id") == aid], "read_after": [{"path": READ_AFTER, "line": line, "row_sha256": row_digest(row), "read_after_id": row.get("read_after_id"), "result": row.get("result"), "digest_match": row.get("digest_match"), "consumer_match": row.get("consumer_match"), "failure": row.get("failure"), "consumer_refs_observed": sorted(row.get("consumer_refs_observed", []))} for line, row in read_afters if row.get("asset_id") == aid], "state_boundary": "disposition remains unresolved; no historical decision/read-after row exists for this target"}
        if history != expected_hist: fail("E_HISTORY", f"history receipt mismatch {aid}")
        verify_range_groups(record)
    if inventory.get("counts") != {"wave_files": 50, "wave_edges": 598, "wave_unique_assets": 355, "target_assets": 64, "categories": {"direct_product_basis": 56, "insufficient_basis": 2, "multi_product_conflict": 6}, "artifact_evidence_kinds": {"implementation_source": 55, "design": 8, "plan": 1}, "semantic_link_statuses": {"unresolved": 61, "rejected": 3}, "semantic_link_asset_profiles": {"rejected_only": 3, "unresolved_only": 61}, "target_wave_edges": sum(len(by_asset[a]) for a in targets)}:
        fail("E_EXPECTED_DENOMINATOR", "inventory counts mismatch")
    print(f"SCF-B-0107 validate: PASS records={len(rows)} edges={sum(len(by_asset[a]) for a in targets)} categories=direct:56 multi:6 insufficient:2")
    return {"inventory": inventory, "rows": rows}


if __name__ == "__main__":
    verify()
