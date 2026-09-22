#!/usr/bin/env python3
"""Fail-closed validator for SCF-B-0108."""
from __future__ import annotations

import hashlib
import json
import subprocess
from collections import Counter, defaultdict
from pathlib import Path

import generate as g

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-lint-product-classification-0108"
LEDGER = BUNDLE / "classification-research.jsonl"
INVENTORY = BUNDLE / "inventory.json"
BASE_REVISION = g.BASE_REVISION
EXPECTED_NEGATIVE_CASES = ["target_record_omission", "target_record_duplicate", "edge_omission", "edge_duplicate", "source_digest_tamper", "source_line_text_digest_tamper", "source_profile_tamper", "candidate_product_tamper", "authority_promotion", "boundary_line_digest_tamper", "input_digest_omission", "input_digest_duplicate", "input_digest_extra_path", "manual_semantic_review_tamper", "manual_review_inventory_tamper", "record_top_level_extra_key", "source_read_mode_tamper", "inventory_authority_promotion", "inventory_scope_tamper", "inventory_formal_update_tamper", "inventory_classification_rule_tamper", "fixed_BASE_non_ancestor"]
RECORD_KEYS = frozenset({
    "artifact_evidence_kinds", "asset_id", "asset_ledger", "authority_effect",
    "boundary_evidence", "candidate_products", "classification_category",
    "classification_reason", "classification_state", "failure_consumer_static_refs",
    "formal_asset_classification_updated", "human_judgment_remaining", "l1_evidence",
    "legacy_history_failure_consumer", "manual_semantic_review", "new_build_allowed",
    "observed_wave_products", "phase_ledger", "semantic_link_statuses", "source_exact",
    "source_profile", "unit_product_candidates", "wave_semantic_links",
})
SOURCE_KEYS = frozenset({
    "archive_path", "blob", "bytes", "ledger_source_sha256", "line_count", "read_mode",
    "semantic_anchors", "sha256", "source_path",
})


def fail(code: str, message: str) -> None:
    raise AssertionError(f"{code}: {message}")


def tagged(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


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
    return [json.loads(x) for x in path.read_text().splitlines() if x.strip()]


def base_jsonl(path: str) -> list[tuple[int, dict]]:
    return [(i, json.loads(x)) for i, x in enumerate(git_bytes(path).decode().splitlines(), 1) if x.strip()]


def row_digest(row: dict) -> str:
    return canonical(row)


def receipt(path: str, start: int, end: int) -> dict:
    lines = git_bytes(path).decode(errors="replace").splitlines()
    if not (1 <= start <= end <= len(lines)):
        fail("E_SOURCE_LINE", f"range outside {path}:{start}-{end}")
    text = "\n".join(lines[start - 1:end])
    return {"path": path, "blob": git_blob(path), "line_start": start, "line_end": end, "line_count": end - start + 1, "line_text_sha256": tagged(text.encode()), "line_text": lines[start - 1:end]}


def assert_receipt(actual: dict, path: str, start: int, end: int, code: str = "E_BOUNDARY_DIGEST") -> None:
    if actual != receipt(path, start, end):
        fail(code, f"receipt mismatch {path}:{start}-{end}")


def expected_links(rows: list[tuple[int, str, int, dict]]) -> list[dict]:
    return sorted([g.wave_link(x) for x in rows], key=lambda x: (x["wave"], x["line"], x["edge_id"]))


def expected_source_anchor(path: str, profile: str, products: list[str], manual: dict | None = None) -> dict:
    # Re-derive the semantic anchor from the fixed BASE bytes. This avoids
    # treating a recorded line number as evidence unless its text/digest agrees.
    lines = git_bytes(path).decode(errors="replace").splitlines()
    if manual:
        start, end = manual["start"], manual["end"]
        text = "\n".join(lines[start - 1:end])
        return {"line_start": start, "line_end": end, "line_text": lines[start - 1:end], "line_text_sha256": tagged(text.encode()), "interpretation": manual["interpretation"], "products_considered": [manual["product"]]}
    candidates = []
    for i, line in enumerate(lines, 1):
        low = line.lower()
        if line.lstrip().startswith(("/**", "*", "//")) and not line.lstrip().startswith("*/"):
            score = (3 if ("plan" in low or "requirement" in low or "authority" in low or "adapter" in low) else 1)
            candidates.append((score, i))
    start = max(candidates, key=lambda x: (x[0], -x[1]))[1] if candidates else next((i for i, line in enumerate(lines, 1) if line.strip() and not line.lstrip().startswith(("import ", "from "))), 1)
    end = min(len(lines), start + (2 if lines[start - 1].lstrip().startswith(("/**", "*", "//")) else 1))
    text = "\n".join(lines[start - 1:end])
    interpretation = "source context is preserved for human semantic review; this span does not prove a product owner"
    return {"line_start": start, "line_end": end, "line_text": lines[start - 1:end], "line_text_sha256": tagged(text.encode()), "interpretation": interpretation, "products_considered": products}


def expected_manual_review(path: str, manual: dict, consumer_path: str, consumer_ranges: list[tuple[int, int]]) -> dict:
    source_span = expected_source_anchor(path, "insufficient_basis", [], manual)
    return {"status": "reviewed_candidate", "source_span": source_span, "candidate_product": manual["product"], "l1_product": manual["l1"][0], "l1_evidence": receipt(g.L1[manual["l1"][0]], manual["l1"][1], manual["l1"][2]), "interpretation": manual["interpretation"], "boundary_counterevidence": receipt(g.BOUNDARY, manual["counter"][0], manual["counter"][1]), "consumer_boundary": {"status": "pending", "interpretation": "legacy consumer relation is retained as a pending closure boundary; no direct semantic link is accepted", "refs": [receipt(consumer_path, *r) for r in consumer_ranges]}}


def verify_base() -> None:
    try:
        subprocess.check_call(["git", "merge-base", "--is-ancestor", BASE_REVISION, "HEAD"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        fail("E_BASE_NOT_ANCESTOR", f"fixed BASE {BASE_REVISION} is not an ancestor of HEAD")


def verify_inputs(inventory: dict, targets: list[str], phase_by_asset: dict) -> None:
    source_paths = [g.ARCHIVE_PREFIX + phase_by_asset[a][1]["source_path"] for a in targets]
    expected_paths = [*g.WAVE_PATHS.values(), *g.GLOBAL_INPUTS, *source_paths]
    actual = inventory.get("input_digests")
    if not isinstance(actual, list) or [x.get("path") for x in actual] != expected_paths or len({x.get("path") for x in actual}) != len(expected_paths):
        fail("E_INPUT_SET", "input digest path set/order differs from deterministic target source set")
    for item in actual:
        data = git_bytes(item["path"])
        expected = {"path": item["path"], "blob": git_blob(item["path"]), "bytes": len(data), "sha256": tagged(data)}
        if item != expected:
            fail("E_INPUT_DIGEST", f"input digest mismatch {item.get('path')}")


def verify_ranges(record: dict) -> None:
    boundary = record.get("boundary_evidence")
    if set(boundary or {}) != set(g.BOUNDARY_RANGES): fail("E_BOUNDARY_DIGEST", "boundary product set mismatch")
    for product, ranges in g.BOUNDARY_RANGES.items():
        obj = boundary[product]
        if obj.get("path") != g.BOUNDARY or obj.get("blob") != git_blob(g.BOUNDARY) or len(obj.get("ranges", [])) != len(ranges): fail("E_BOUNDARY_DIGEST", product)
        for actual, pair in zip(obj["ranges"], ranges): assert_receipt(actual, g.BOUNDARY, *pair)
    l1 = record.get("l1_evidence")
    if set(l1 or {}) != set(g.L1): fail("E_BOUNDARY_DIGEST", "L1 product set mismatch")
    for product, path in g.L1.items():
        obj = l1[product]
        if obj.get("path") != path or obj.get("blob") != git_blob(path) or len(obj.get("ranges", [])) != len(g.L1_RANGES[product]): fail("E_BOUNDARY_DIGEST", product)
        for actual, pair in zip(obj["ranges"], g.L1_RANGES[product]): assert_receipt(actual, path, *pair)
    static = record.get("failure_consumer_static_refs", {})
    for key, path, ranges in [("failure", g.FAILURE_SOURCE, g.FAILURE_RANGES), ("consumer", g.CONSUMER_SOURCE, g.CONSUMER_RANGES)]:
        obj = static.get(key, {})
        if obj.get("path") != path or obj.get("blob") != git_blob(path) or len(obj.get("ranges", [])) != len(ranges): fail("E_BOUNDARY_DIGEST", key)
        for actual, pair in zip(obj["ranges"], ranges): assert_receipt(actual, path, *pair)


def expected_history(aid: str, dispositions: dict, decisions: list[tuple[int, dict]], read_afters: list[tuple[int, dict]]) -> dict:
    line, row = dispositions[aid]
    return {"disposition": {"path": g.DISPOSITION, "line": line, "row_sha256": row_digest(row), "asset_id": aid, "revision": row.get("revision"), "disposition": row.get("disposition"), "asset_class": row.get("asset_class"), "product_target": row.get("product_target"), "authority_status": row.get("authority_status"), "implementation_status": row.get("implementation_status"), "consumer_refs": sorted(row.get("consumer_refs", [])), "decision_record_ref": row.get("decision_record_ref"), "read_after_record_ref": row.get("read_after_record_ref")}, "decisions": [{"path": g.DECISIONS, "line": n, "row_sha256": row_digest(r), "decision_id": r.get("decision_id"), "disposition": r.get("disposition"), "product_target": r.get("product_target"), "consumer_refs": sorted(r.get("consumer_refs", []))} for n, r in decisions if r.get("asset_id") == aid], "read_after": [{"path": g.READ_AFTER, "line": n, "row_sha256": row_digest(r), "read_after_id": r.get("read_after_id"), "result": r.get("result"), "digest_match": r.get("digest_match"), "consumer_match": r.get("consumer_match"), "failure": r.get("failure"), "consumer_refs_observed": sorted(r.get("consumer_refs_observed", []))} for n, r in read_afters if r.get("asset_id") == aid], "state_boundary": "disposition remains unresolved; decision/read-after rows are preserved as historical evidence and do not confer product authority"}


def verify() -> dict:
    verify_base()
    inventory, rows = local_json(INVENTORY), local_jsonl(LEDGER)
    if inventory.get("base_revision") != BASE_REVISION or inventory.get("base_source_mode") != "all input and archive evidence bytes from fixed BASE Git objects": fail("E_BASE_PIN", "BASE pin/source mode drift")
    if inventory.get("negative_cases") != EXPECTED_NEGATIVE_CASES: fail("E_INVENTORY", "negative case declaration drift")
    phase_rows = base_jsonl(g.PHASE)
    phase_by_asset = {r["asset_id"]: (n, r) for n, r in phase_rows}
    targets = sorted(a for a, (n, r) in phase_by_asset.items() if r.get("product_classification_status") == "unresolved" and r.get("artifact_evidence_kind") == "implementation_source" and r.get("source_path", "").startswith("src/lint/"))
    if len(targets) != 95: fail("E_EXPECTED_DENOMINATOR", f"expected 95, got {len(targets)}")
    verify_inputs(inventory, targets, phase_by_asset)
    if len(rows) != 95 or sorted(r.get("asset_id") for r in rows) != targets or len({r.get("asset_id") for r in rows}) != 95: fail("E_TARGET_SET", "records have missing, duplicate, or extra target asset")
    if inventory.get("expected_sets", {}).get("target_asset_ids") != targets or inventory["expected_sets"].get("target_asset_ids_sha256") != tagged("\n".join(targets).encode()): fail("E_TARGET_SET", "target set digest drift")
    dispositions = {r["asset_id"]: (n, r) for n, r in base_jsonl(g.DISPOSITION)}
    decisions, read_afters = base_jsonl(g.DECISIONS), base_jsonl(g.READ_AFTER)
    wave_rows = []
    for wave, path in g.WAVE_PATHS.items(): wave_rows.extend((wave, path, n, r) for n, r in base_jsonl(path))
    if len(wave_rows) != 598 or len({r[3]["asset_id"] for r in wave_rows}) != 355: fail("E_EXPECTED_DENOMINATOR", "Wave denominator drift")
    by_asset: defaultdict[str, list] = defaultdict(list)
    for item in wave_rows: by_asset[item[3]["asset_id"]].append(item)
    cw = {r["unit_candidate_id"]: g.compact_crosswalk(r, n) for n, r in base_jsonl(g.CROSSWALK)}
    decomp = {}
    for n, parent in base_jsonl(g.DECOMPOSITION):
        for unit in parent.get("candidate_units", []): decomp[unit["unit_candidate_id"]] = g.compact_decomp(parent, unit, n)
    expected_categories = defaultdict(int)
    expected_edges = 0
    for record in rows:
        aid = record["asset_id"]
        if set(record) != RECORD_KEYS:
            fail("E_RECORD_SCHEMA", f"record key set mismatch {aid}")
        phase_line, phase = phase_by_asset[aid]
        expected_phase = {"path": g.PHASE, "line": phase_line, "row_sha256": row_digest(phase), "product_classification_status": phase.get("product_classification_status"), "candidate_product_targets": phase.get("candidate_product_targets") or [], "candidate_phase_targets": phase.get("candidate_phase_targets") or [], "source_path": phase.get("source_path"), "source_sha256": phase.get("source_sha256"), "consumer_closure_status": phase.get("consumer_closure_status")}
        if record.get("phase_ledger") != expected_phase: fail("E_PHASE_STATUS", aid)
        disp_line, disp = dispositions[aid]
        expected_asset = {"path": g.DISPOSITION, "line": disp_line, "row_sha256": row_digest(disp), "source_path": disp.get("source_path"), "source_sha256": disp.get("source_sha256"), "disposition": disp.get("disposition"), "product_target": disp.get("product_target"), "authority_status": disp.get("authority_status"), "implementation_status": disp.get("implementation_status"), "consumer_refs": sorted(disp.get("consumer_refs", []))}
        if record.get("asset_ledger") != expected_asset: fail("E_HISTORY", aid)
        if disp.get("disposition") != "unresolved" or disp.get("product_target") != "unresolved" or disp.get("authority_status") != "historical": fail("E_PHASE_STATUS", aid)
        source = record.get("source_exact", {}); archive_path = g.ARCHIVE_PREFIX + disp["source_path"]; data = git_bytes(archive_path)
        if set(source) != SOURCE_KEYS or source.get("archive_path") != archive_path or source.get("source_path") != disp["source_path"] or source.get("blob") != git_blob(archive_path) or source.get("bytes") != len(data) or source.get("line_count") != len(data.decode(errors="replace").splitlines()) or source.get("sha256") != tagged(data) or source.get("ledger_source_sha256") != "sha256:" + disp["source_sha256"] or source.get("read_mode") != "git_object_static_read_only": fail("E_SOURCE_DIGEST", aid)
        profile = record.get("source_profile", {}); name = disp["source_path"].rsplit("/", 1)[-1].removesuffix(".ts")
        base_category, source_products, base_reason = g.profile_for(name)
        links = expected_links(by_asset.get(aid, [])); wave_products = sorted({p for link in links for p in (link.get("candidate_product_targets") or []) + (link.get("product_scope") or [])}); all_products = sorted(set(source_products) | set(wave_products))
        manual = g.MANUAL_REVIEWS.get(name)
        expected_profile = {"name": name, "base_category": base_category, "source_products": source_products, "wave_products": wave_products, "profile_reason": base_reason, "semantic_review_status": "reviewed_candidate" if manual else "source_semantic_review_pending"}
        if profile != expected_profile: fail("E_PROFILE", aid)
        expected_anchor = expected_source_anchor(archive_path, base_category, source_products, manual)
        if source.get("semantic_anchors") != [expected_anchor]: fail("E_SOURCE_ANCHOR", aid)
        actual_links = record.get("wave_semantic_links", [])
        if actual_links != links: fail("E_EDGE_SET", aid)
        expected_edges += len(links)
        unit_ids = sorted({x["unit_candidate_id"] for x in links if x.get("unit_candidate_id")}); units = record.get("unit_product_candidates", [])
        if [u.get("unit_candidate_id") for u in units] != unit_ids: fail("E_CANDIDATE_PRODUCTS", aid)
        for unit in units:
            uid = unit["unit_candidate_id"]
            if uid not in cw or uid not in decomp or unit.get("crosswalk") != cw[uid] or unit.get("decomposition") != decomp[uid]: fail("E_CANDIDATE_PRODUCTS", f"{aid}:{uid}")
        if manual:
            category, products, reason = "direct_product_basis", [manual["product"]], manual["interpretation"] + " Candidate only; formal product authority remains unresolved."
        else:
            category, products, reason = "insufficient_basis", [], base_reason
        if record.get("classification_category") != category or record.get("classification_reason") != reason or record.get("candidate_products") != products or record.get("observed_wave_products") != wave_products: fail("E_CANDIDATE_PRODUCTS", aid)
        expected_manual = expected_manual_review(archive_path, manual, g.CONSUMER_SOURCE, g.CONSUMER_RANGES) if manual else {"status": "source_semantic_review_pending", "source_span": expected_source_anchor(archive_path, base_category, source_products), "candidate_product": None, "l1_product": None, "l1_evidence": None, "interpretation": "filename seed and source context retained; concrete product-boundary mapping, counterevidence, and consumer closure have not been accepted", "boundary_counterevidence": None, "consumer_boundary": {"status": "pending", "interpretation": "consumer relation remains unreviewed", "refs": [receipt(g.CONSUMER_SOURCE, *r) for r in g.CONSUMER_RANGES]}}
        if record.get("manual_semantic_review") != expected_manual: fail("E_SEMANTIC_REVIEW", aid)
        if record.get("semantic_link_statuses") != sorted({x.get("semantic_link_status") for x in links}): fail("E_EDGE_SET", aid)
        if record.get("artifact_evidence_kinds") != (sorted({x.get("artifact_evidence_kind") for x in links}) if links else ["implementation_source"]): fail("E_CANDIDATE_PRODUCTS", aid)
        if record.get("legacy_history_failure_consumer") != expected_history(aid, dispositions, decisions, read_afters): fail("E_HISTORY", aid)
        if record.get("authority_effect") != "none" or record.get("classification_state") != "research_proposal_pending_human_product_review" or record.get("formal_asset_classification_updated") is not False or record.get("new_build_allowed") is not False: fail("E_AUTHORITY_PROMOTION", aid)
        if record.get("human_judgment_remaining") != ["product_owner_and_boundary_decision", "source_semantic_anchor_acceptance", "phase_admission_and_successor_assignment", "legacy_consumer_closure_and_failure_disposition", "formal_asset_classification_update"]: fail("E_HUMAN_JUDGMENT", aid)
        verify_ranges(record)
        expected_categories[category] += 1
    expected_counts = {"direct_product_basis": expected_categories["direct_product_basis"], "multi_product_conflict": expected_categories["multi_product_conflict"], "insufficient_basis": expected_categories["insufficient_basis"]}
    counts = inventory.get("counts", {})
    phase_distribution = Counter(tuple(phase_by_asset[a][1].get("candidate_phase_targets") or []) for a in targets)
    expected_counts_block = {"wave_files": 50, "wave_edges": 598, "wave_unique_assets": 355, "target_assets": 95, "target_wave_edges": expected_edges, "target_wave_linked_assets": sum(bool(by_asset.get(a)) for a in targets), "categories": expected_counts, "artifact_evidence_kinds": {"implementation_source": 95}, "target_phase_candidate_distribution": {"|".join(k): v for k, v in sorted(phase_distribution.items())}}
    if counts != expected_counts_block: fail("E_EXPECTED_DENOMINATOR", "inventory counts mismatch")
    manual_ids = sorted(r["asset_id"] for r in rows if r.get("manual_semantic_review", {}).get("status") == "reviewed_candidate")
    expected_review_counts = {"source_semantic_reviewed": len(manual_ids), "source_semantic_review_pending": 95 - len(manual_ids), "direct_candidate_basis": expected_categories["direct_product_basis"], "multi_product_conflict": expected_categories["multi_product_conflict"], "insufficient_basis": expected_categories["insufficient_basis"]}
    if inventory.get("review_counts") != expected_review_counts or sorted(inventory.get("manual_reviewed_asset_ids", [])) != manual_ids: fail("E_SEMANTIC_REVIEW", "manual semantic review inventory mismatch")
    expected_inventory_meta = {
        "schema_revision": 1,
        "binding_id": g.BINDING_ID,
        "scope": "phase product unresolved + implementation_source + src/lint/ exact 95 assets",
        "wave_source_paths": {str(n): path for n, path in g.WAVE_PATHS.items()},
        "expected_sets": {"target_asset_count": 95, "target_asset_ids": targets, "target_asset_ids_sha256": tagged("\n".join(targets).encode()), "source_paths": [phase_by_asset[a][1]["source_path"] for a in targets]},
        "old_asset_source_mode": "archive bytes are read through git show BASE:<archive-path>; never executed",
        "formal_update": {"formal_asset_classification_updated": False, "phase_ledger_updated": False, "product_route_updated": False, "successor_updated": False, "new_build_allowed": False, "authority_effect": "none"},
        "classification_rule": {"direct_product_basis": "a manually reviewed concrete source span mapped to one product L1 with explicit counter-boundary and pending consumer evidence", "multi_product_conflict": "requires separately reviewed source spans proving two product boundaries (none admitted in this bundle)", "insufficient_basis": "filename seed, generic declaration, or unresolved Wave unit scope without accepted product-boundary proof"},
        "boundary_refs": {"product_boundary": g.BOUNDARY, "l1": g.L1},
        "history_failure_consumer": {"disposition_rows": 95, "decision_rows_for_targets": sum(bool(r["legacy_history_failure_consumer"]["decisions"]) for r in rows), "read_after_rows_for_targets": sum(bool(r["legacy_history_failure_consumer"]["read_after"]) for r in rows), "failure_consumer_refs_are_static_global_inventory": True},
        "edge_contract": {"edge_identity": "edge_id derived from wave/path/line/asset_id/unit_candidate_id/semantic_link_status", "duplicate_edges_forbidden": True, "missing_edges_forbidden": True},
        "authority_boundary": {"authority_effect": "none", "classification_state": "research_proposal_pending_human_product_review", "formal_asset_classification_updated": False, "new_build_allowed": False},
        "artifacts": ["scaffold/bindings/SCF-B-0108.json", "scaffold/legacy-lint-product-classification-0108/README.md", "scaffold/legacy-lint-product-classification-0108/PR-DRAFT.md", "scaffold/legacy-lint-product-classification-0108/generate.py", "scaffold/legacy-lint-product-classification-0108/validate.py", "scaffold/legacy-lint-product-classification-0108/selfcheck.py", "scaffold/legacy-lint-product-classification-0108/inventory.json", "scaffold/legacy-lint-product-classification-0108/classification-research.jsonl"],
    }
    expected_top = set(expected_inventory_meta) | {"base_revision", "base_source_mode", "counts", "input_digests", "output_sha256", "review_counts", "manual_reviewed_asset_ids", "negative_cases"}
    if set(inventory) != expected_top:
        fail("E_INVENTORY_DECLARATION", "inventory top-level key set mismatch")
    for key, expected_value in expected_inventory_meta.items():
        if inventory.get(key) != expected_value:
            fail("E_INVENTORY_DECLARATION", f"inventory {key} mismatch")
    if inventory.get("negative_cases") != EXPECTED_NEGATIVE_CASES:
        fail("E_INVENTORY_DECLARATION", "inventory negative case declaration mismatch")
    if inventory.get("output_sha256") != tagged(LEDGER.read_bytes()): fail("E_OUTPUT_DIGEST", "classification output digest mismatch")
    print(f"SCF-B-0108 validate: PASS records=95 target_edges={expected_edges} categories={dict(sorted(expected_categories.items()))}")
    return {"rows": rows, "inventory": inventory}


if __name__ == "__main__":
    verify()
