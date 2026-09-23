#!/usr/bin/env python3
"""Fail-closed static validator for the pinned SCF-B-0148 research snapshot."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-test-design-worker-workflow-0148"
LEDGER = BUNDLE / "classification-research.jsonl"
MANIFEST = BUNDLE / "selection-manifest.json"
INVENTORY = BUNDLE / "inventory.json"
BINDING = ROOT / "scaffold/bindings/SCF-B-0148.json"
BASE = "8a9fdc973f3553bea78d022e8d73f109aca526da"
MAIN = "be9cf8cf99ee94a487e54d372d7a34e9266b1ee3"
OPEN_2097 = "211712a0aba71ea7461f53e7f824879de5bcff48"
BOOTSTRAP = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
CROSSWALK = "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
PHASE_INVENTORY = "docs/governance/phase-capability-inventory.json"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
ARCHIVE_MANIFEST = "archive/legacy-generation-2026-09-14/MANIFEST.sha256"
ARCHIVE_ROOT = "archive/legacy-generation-2026-09-14/root/"
SELECTION_RULE = "bootstrap source_path under docs/test-design/helix/, candidate_phase_targets contains PHCAP-07, basename contains worker or workflow"
PRODUCTS = ("HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS")
MAIN_LEDGER_PATHS = (
    "scaffold/legacy-asset-product-classification-0107/classification-research.jsonl",
    "scaffold/legacy-lint-candidate-product-classification-0128/classification-research.jsonl",
    "scaffold/legacy-lint-product-classification-0108/classification-research.jsonl",
    "scaffold/legacy-runtime-product-classification-0117/classification-research.jsonl",
    "scaffold/legacy-runtime-residual-product-classification-0133/classification-research.jsonl",
    "scaffold/legacy-schema-product-classification-0120/classification-research.jsonl",
    "scaffold/legacy-source-product-classification-0123/classification-research.jsonl",
    "scaffold/legacy-state-db-product-classification-0127/classification-research.jsonl",
    "scaffold/legacy-implementation-residual-0126/classification-research.jsonl",
    "scaffold/legacy-config-product-classification-0141/classification-research.jsonl",
    "scaffold/legacy-ai-instruction-product-classification-0145/classification-research.jsonl",
    "scaffold/legacy-research-assets-product-classification-0142/classification-research.jsonl",
)
OPEN_2097_LEDGER = "scaffold/legacy-execution-ticket-product-classification-0147/classification-research.jsonl"
ARTIFACTS = (
    "scaffold/bindings/SCF-B-0148.json",
    "scaffold/legacy-test-design-worker-workflow-0148/classification-research.jsonl",
    "scaffold/legacy-test-design-worker-workflow-0148/inventory.json",
    "scaffold/legacy-test-design-worker-workflow-0148/README.md",
    "scaffold/legacy-test-design-worker-workflow-0148/PR-DRAFT.md",
    "scaffold/legacy-test-design-worker-workflow-0148/selection-manifest.json",
    "scaffold/legacy-test-design-worker-workflow-0148/validate.py",
    "scaffold/legacy-test-design-worker-workflow-0148/selfcheck.py",
)
OUTPUT_UPSTREAM = tuple(p for p in ARTIFACTS if p != "scaffold/bindings/SCF-B-0148.json")
EXPECTED_AUTHORITY = {
    "authority_effect": "none", "legacy_execution_performed": False,
    "formal_asset_classification_updated": False, "phase_updated": False,
    "successor_assigned": False, "new_build_allowed": False,
}
EXPECTED_INVENTORY_AUTHORITY = {
    "authority_effect": "none", "formal_asset_classification_updated": False,
    "formal_implementation_status": "unknown", "formal_product_authority": None,
    "phase_updated": False, "successor_assignment": None, "new_build_allowed": False,
    "legacy_execution_performed": False,
}

# Fixed contract pins. These are intentionally code constants, not values accepted
# from the mutable manifest or Binding. Refresh only when the curated bundle changes.
PINNED_SHA256 = {
    'ledger': 'db7ec0b6ac817c7b3eab491dd6234b74df293953cb4e2fce17d61452835cd630',
    'manifest': '95ff1ee4a08003eb3b4130f631ae3405dbdfa770845935ea54069bcb4d3e6794',
    'inventory': '91a5f9e275901cf605eeac47efb4a63eb3ce41673cf7dba19d10cacd20b94d03',
    'README.md': '8669c205775861e1b796d3861d96f2596357737ca1de3e55697fe7078a5617a8',
    'PR-DRAFT.md': '00288f7235bd1a12408e8acad86e1d7e76d0e831c64e4824912371a72c29acf5',
    'selfcheck.py': '1fdc714068629218e02aafacd1380586add1c2de6f4cb6bd50e2cf462de00084',
}
PINNED_BINDING_CORE_SHA256 = "a05a483b6a1be536284837660ac69f91576f04c1284c212b092b79f12ded3cdf"


class ValidationError(ValueError):
    def __init__(self, code: str, detail: str):
        super().__init__(f"{code}: {detail}")
        self.code = code


def fail(code: str, detail: str) -> None:
    raise ValidationError(code, detail)


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical_sha(value: object) -> str:
    return sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8"))


def strict_pairs(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate JSON key {key!r}")
        result[key] = value
    return result


def strict_json_bytes(data: bytes, label: str):
    try:
        return json.loads(data.decode("utf-8", errors="strict"), object_pairs_hook=strict_pairs)
    except (UnicodeDecodeError, json.JSONDecodeError, ValueError) as exc:
        fail("E_JSON", f"{label}: {exc}")


def strict_jsonl_bytes(data: bytes, label: str) -> list[dict]:
    try:
        text = data.decode("utf-8", errors="strict")
    except UnicodeDecodeError as exc:
        fail("E_JSON", f"{label}: {exc}")
    rows = []
    for number, line in enumerate(text.splitlines(), 1):
        if not line.strip():
            fail("E_JSON", f"{label}:{number}: blank line is not allowed")
        row = strict_json_bytes(line.encode("utf-8"), f"{label}:{number}")
        if type(row) is not dict:
            fail("E_TYPE", f"{label}:{number}: object required")
        rows.append(row)
    return rows


def git_bytes(revision: str, path: str) -> bytes:
    try:
        return subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT, stderr=subprocess.DEVNULL)
    except (OSError, subprocess.CalledProcessError) as exc:
        fail("E_BASE_SOURCE", f"cannot read {revision}:{path}: {exc}")


def git_tree(revision: str, path: str) -> tuple[str, str, str]:
    try:
        data = subprocess.check_output(["git", "ls-tree", "-z", revision, "--", path], cwd=ROOT, stderr=subprocess.DEVNULL)
    except (OSError, subprocess.CalledProcessError) as exc:
        fail("E_ARCHIVE", f"cannot inspect {revision}:{path}: {exc}")
    entries = [entry for entry in data.split(b"\0") if entry]
    if len(entries) != 1:
        fail("E_ARCHIVE", f"missing or ambiguous {revision}:{path}")
    try:
        metadata, actual_path = entries[0].split(b"\t", 1)
        mode, kind, oid = metadata.decode("ascii").split()
    except (ValueError, UnicodeDecodeError) as exc:
        fail("E_ARCHIVE", f"malformed tree entry for {path}: {exc}")
    if actual_path.decode("utf-8", errors="strict") != path or mode not in {"100644", "100755"} or kind != "blob":
        fail("E_ARCHIVE", f"non-regular or mismatched Git object at {revision}:{path}")
    return mode, kind, oid


def frontmatter(data: bytes, label: str) -> dict[str, str]:
    try:
        lines = data.decode("utf-8", errors="strict").splitlines()
    except UnicodeDecodeError as exc:
        fail("E_ARCHIVE", f"invalid UTF-8 in {label}: {exc}")
    if not lines or lines[0].strip() != "---":
        fail("E_PARENT_PAIR", f"frontmatter missing in {label}")
    try:
        end = lines.index("---", 1)
    except ValueError:
        fail("E_PARENT_PAIR", f"frontmatter terminator missing in {label}")
    result = {}
    for line in lines[1:end]:
        match = re.match(r"^([A-Za-z0-9_-]+):\s*(.*?)\s*$", line)
        if match:
            value = match.group(2)
            if len(value) >= 2 and value[0] == value[-1] and value[0] in {'"', "'"}:
                value = value[1:-1]
            if value in {"null", "~"}:
                value = None
            result[match.group(1)] = value
    return result


def manifest_digests(data: bytes) -> dict[str, str]:
    try:
        lines = data.decode("utf-8", errors="strict").splitlines()
    except UnicodeDecodeError as exc:
        fail("E_ARCHIVE_MANIFEST", f"invalid archive MANIFEST UTF-8: {exc}")
    result = {}
    for line in lines:
        match = re.fullmatch(r"([0-9a-fA-F]{64})\s+[* ]?(.+?)\s*", line)
        if not match:
            fail("E_ARCHIVE_MANIFEST", "malformed archive MANIFEST row")
        path = match.group(2)
        if path in result:
            fail("E_ARCHIVE_MANIFEST", f"duplicate archive MANIFEST path {path}")
        result[path] = match.group(1).lower()
    return result


def source_identity(row: dict) -> tuple[str, str, str]:
    source_exact = row.get("source_exact")
    if type(source_exact) is not dict:
        fail("E_TYPE", "research row source_exact must be an object")
    asset_id = row.get("asset_id")
    path = row.get("source_path") or source_exact.get("source_path")
    if type(asset_id) is not str or type(path) is not str:
        fail("E_TYPE", "research row asset_id/source_path must be strings")
    digest = source_exact.get("sha256", row.get("source_sha256"))
    if type(digest) is not str:
        fail("E_TYPE", f"research row {asset_id} source digest must be a string")
    digest = digest.removeprefix("sha256:")
    if not re.fullmatch(r"[0-9a-f]{64}", digest):
        fail("E_TYPE", f"research row {asset_id} source digest must be lowercase SHA-256")
    return asset_id, path, digest


def typed_equal(left: object, right: object) -> bool:
    if type(left) is not type(right):
        return False
    if type(left) is dict:
        return left.keys() == right.keys() and all(typed_equal(left[key], right[key]) for key in left)
    if type(left) is list:
        return len(left) == len(right) and all(typed_equal(a, b) for a, b in zip(left, right, strict=True))
    return left == right


def selected_bootstrap(rows: list[dict]) -> list[dict]:
    selected = []
    seen_ids, seen_paths = set(), set()
    for row in rows:
        if type(row.get("source_path")) is not str or type(row.get("candidate_phase_targets")) is not list:
            fail("E_BOOTSTRAP", "bootstrap source_path and candidate_phase_targets have invalid types")
        path = row["source_path"]
        basename = Path(path).name.lower()
        if path.startswith("docs/test-design/helix/") and "PHCAP-07" in row["candidate_phase_targets"] and any(
            token in basename for token in ("worker", "workflow")
        ):
            aid = row.get("asset_id")
            if type(aid) is not str or aid in seen_ids or path in seen_paths:
                fail("E_SELECTION", "fixed bootstrap selection has missing/duplicate ID or source path")
            seen_ids.add(aid)
            seen_paths.add(path)
            selected.append(row)
    if len(selected) != 52:
        fail("E_SELECTION", f"fixed bootstrap yields {len(selected)} rows, expected 52")
    return selected


def validate_classification(row: dict, bootstrap: dict) -> None:
    aid = row["asset_id"]
    c = row.get("classification")
    if type(c) is not dict:
        fail("E_TYPE", f"{aid}: classification must be an object")
    category = c.get("category")
    products = c.get("candidate_products")
    basis = c.get("product_basis")
    assessments = c.get("other_product_assessments")
    bootstrap_products = c.get("bootstrap_candidate_product_targets")
    if type(category) is not str or type(products) is not list or type(basis) is not dict or type(assessments) is not list:
        fail("E_TYPE", f"{aid}: category/products/product_basis/other_product_assessments have invalid types")
    if any(type(product) is not str or product not in PRODUCTS for product in products) or len(products) != len(set(products)):
        fail("E_CLASSIFICATION", f"{aid}: candidate products must be unique known product strings")
    if set(basis.keys()) != set(products):
        fail("E_CLASSIFICATION", f"{aid}: product_basis keys must exactly and consistently support candidate_products")
    if set(products) & {item.get("product") for item in assessments if type(item) is dict}:
        fail("E_CLASSIFICATION", f"{aid}: candidate product is double assessed as another product")
    assessment_products = [item.get("product") for item in assessments if type(item) is dict]
    if len(assessment_products) != len(assessments) or len(set(assessment_products)) != len(assessment_products):
        fail("E_CLASSIFICATION", f"{aid}: other product assessment rows require unique product strings")
    if set(assessment_products) != set(PRODUCTS) - set(products):
        fail("E_CLASSIFICATION", f"{aid}: other product assessment set must be the exact candidate complement")
    cardinality = len(products)
    expected_category = "insufficient_direct_basis" if cardinality == 0 else (
        "direct_candidate_unresolved" if cardinality == 1 else "cross_product_split_candidate_unresolved"
    )
    if category != expected_category:
        fail("E_CLASSIFICATION", f"{aid}: category/cardinality mismatch ({category}, {cardinality})")
    if type(bootstrap_products) is not list or any(type(p) is not str or p not in PRODUCTS for p in bootstrap_products):
        fail("E_TYPE", f"{aid}: bootstrap product targets must be a product list")
    if bootstrap_products != bootstrap.get("candidate_product_targets"):
        fail("E_BOOTSTRAP", f"{aid}: bootstrap candidate targets differ from fixed BASE")
    comparison = c.get("bootstrap_candidate_comparison")
    counterevidence = c.get("direct_counterevidence")
    if type(comparison) is not dict or type(counterevidence) is not list:
        fail("E_TYPE", f"{aid}: bootstrap comparison/counterevidence have invalid types")
    expected_retained = [p for p in PRODUCTS if p in set(bootstrap_products) & set(products)]
    expected_added = [p for p in PRODUCTS if p in set(products) - set(bootstrap_products)]
    expected_removed = [p for p in PRODUCTS if p in set(bootstrap_products) - set(products)]
    if comparison.get("bootstrap_targets_preserved") != bootstrap_products or comparison.get("retained_targets") != expected_retained:
        fail("E_BOOTSTRAP", f"{aid}: bootstrap target preservation/intersection differs")
    added = comparison.get("added_from_source_specific_product_basis")
    if type(added) is not list or [x.get("product") for x in added if type(x) is dict] != expected_added or len(added) != len(expected_added):
        fail("E_BOOTSTRAP", f"{aid}: all added candidate products need a source-specific evidence row")
    for item in added:
        product = item["product"]
        expected_basis = basis[product]
        expected_fields = {
            "product": product, "status": "candidate_supported_by_reviewed_span_and_parent_pair",
            "source_specific_reason": expected_basis.get("source_specific_reason"),
            "anchor_text": expected_basis.get("anchor_text"),
            "parent_pair_title": expected_basis.get("parent_pair_title"),
        }
        if not typed_equal(item, expected_fields) or any(type(item.get(k)) is not str or not item[k].strip() for k in (
            "source_specific_reason", "anchor_text", "parent_pair_title"
        )):
            fail("E_BOOTSTRAP", f"{aid}: added product {product} lacks matching source-specific evidence")
    if [x.get("product") for x in counterevidence if type(x) is dict] != expected_removed or len(counterevidence) != len(expected_removed):
        fail("E_COUNTEREVIDENCE", f"{aid}: every removed bootstrap candidate needs bounded counterevidence")
    removed = comparison.get("removed_with_bounded_counterevidence")
    if type(removed) is not list or len(removed) != len(counterevidence):
        fail("E_COUNTEREVIDENCE", f"{aid}: bootstrap removal summary is missing or malformed")
    span = row.get("source_span")
    pair = row.get("parent_pair")
    if type(span) is not dict or type(pair) is not dict:
        fail("E_TYPE", f"{aid}: source span and parent pair must be objects")
    for item, summary in zip(counterevidence, removed, strict=True):
        required = {
            "product", "status", "reason", "source_span_sha256", "parent_pair_sha256",
        }
        if type(item) is not dict or set(item) != required or item.get("status") != "bootstrap_candidate_not_supported_by_reviewed_span_and_pair":
            fail("E_COUNTEREVIDENCE", f"{aid}: removed bootstrap target lacks typed bounded counterevidence")
        if item.get("source_span_sha256") != span.get("line_text_sha256") or item.get("parent_pair_sha256") != pair.get("sha256"):
            fail("E_COUNTEREVIDENCE", f"{aid}: counterevidence does not identify this record's span and pair")
        reason = item.get("reason")
        if type(reason) is not str or not reason.strip() or "限定的な反証" not in reason or "判断しない" not in reason:
            fail("E_COUNTEREVIDENCE", f"{aid}: counterevidence must bound its inference")
        if not typed_equal(summary, item):
            fail("E_COUNTEREVIDENCE", f"{aid}: removal summary differs from its evidence")
    if c.get("counterevidence_status") != (
        "bootstrap_candidate_not_supported_in_reviewed_span; no permanent non-applicability decision" if expected_removed else
        "no_bootstrap_candidate_removed; no permanent non-applicability decision"
    ):
        fail("E_COUNTEREVIDENCE", f"{aid}: counterevidence status overstates or misstates bootstrap comparison")


def archive_receipt(revision: str, archive_path: str, manifest: dict[str, str]) -> tuple[bytes, dict]:
    mode, kind, oid = git_tree(revision, archive_path)
    data = git_bytes(revision, archive_path)
    relative = archive_path.removeprefix(ARCHIVE_ROOT)
    manifest_sha = manifest.get(relative)
    if manifest_sha is None or sha256(data) != manifest_sha:
        fail("E_ARCHIVE_MANIFEST", f"archive bytes/MANIFEST mismatch for {archive_path}")
    receipt = {"mode": mode, "type": kind, "blob": oid, "bytes": len(data), "sha256": sha256(data), "line_count": len(data.decode("utf-8", errors="strict").splitlines())}
    return data, receipt


def check_record_source(row: dict, selected: dict, manifest_rows: dict, archive_manifest: dict[str, str]) -> None:
    aid, path, digest = source_identity(row)
    if path != selected["source_path"] or aid != selected["asset_id"]:
        fail("E_SELECTION", f"{aid}: asset ID or source path differs from fixed bootstrap")
    record = manifest_rows.get(aid)
    if type(record) is not dict:
        fail("E_MANIFEST", f"{aid}: selection manifest row missing")
    expected_archive = ARCHIVE_ROOT + path
    exact = row.get("source_exact")
    if type(exact) is not dict or exact.get("archive_path") != expected_archive:
        fail("E_ARCHIVE", f"{aid}: archive source path does not derive from source path")
    _, receipt = archive_receipt(BASE, expected_archive, archive_manifest)
    if selected.get("source_sha256") != digest or record.get("source_sha256") != digest or receipt["sha256"] != digest:
        fail("E_ARCHIVE", f"{aid}: bootstrap/record/archive source SHA-256 differ")
    expected_exact = {
        "archive_path": expected_archive, "git_mode": receipt["mode"], "git_type": receipt["type"],
        "git_blob": receipt["blob"], "bytes": receipt["bytes"], "sha256": receipt["sha256"],
        "line_count": receipt["line_count"], "read_mode": "static_git_object_read_only",
    }
    if not typed_equal(exact, expected_exact):
        fail("E_ARCHIVE", f"{aid}: complete source receipt differs from fixed BASE Git object")
    span = row.get("source_span")
    if type(span) is not dict or type(span.get("lines")) is not list or not span["lines"]:
        fail("E_TYPE", f"{aid}: selected semantic span must be a non-empty object/list")
    lines = git_bytes(BASE, expected_archive).decode("utf-8", errors="strict").splitlines()
    span_text = []
    previous = 0
    for item in span["lines"]:
        if type(item) is not dict or set(item) != {"line", "text"} or type(item.get("line")) is not int or type(item.get("text")) is not str:
            fail("E_TYPE", f"{aid}: span line needs integer line and string text")
        number = item["line"]
        if number <= previous or number < 1 or number > len(lines) or lines[number - 1] != item["text"] or not item["text"].strip():
            fail("E_SOURCE_SPAN", f"{aid}: span line is empty, unordered, or differs from the BASE blob")
        previous = number
        span_text.append(item["text"])
    span_digest = sha256("\n".join(span_text).encode("utf-8"))
    if span.get("line_text_sha256") != span_digest or record.get("span_lines") != span["lines"] or record.get("span_sha256") != span_digest:
        fail("E_SOURCE_SPAN", f"{aid}: span text/hash differs from the fixed BASE or pinned manifest")
    if record.get("category") != row["classification"].get("category") or record.get("candidate_products") != row["classification"].get("candidate_products"):
        fail("E_MANIFEST", f"{aid}: manifest classification differs from complete record")
    if record.get("candidate_phase_targets") != selected.get("candidate_phase_targets") or row.get("phase", {}).get("candidate_phase_targets") != selected.get("candidate_phase_targets"):
        fail("E_PHASE", f"{aid}: phase candidates differ from the fixed bootstrap")
    if not typed_equal(row.get("authority_boundary"), EXPECTED_AUTHORITY) or not typed_equal(record.get("authority_boundary"), EXPECTED_AUTHORITY):
        fail("E_AUTHORITY", f"{aid}: record or manifest crossed the no-effect boundary")
    if row.get("phase", {}).get("candidate_phase_evidence", {}).get("phase_admission") != "not_admitted":
        fail("E_PHASE", f"{aid}: phase admission must remain not_admitted")
    if row.get("implementation_and_degradation", {}).get("test_execution_status") != "not_run" or row.get("failure_and_consumer", {}).get("consumer_closure_status") != "pending":
        fail("E_AUTHORITY", f"{aid}: test/consumer closure boundary changed")
    validate_classification(row, selected)
    if canonical_sha(row) != record.get("record_sha256"):
        fail("E_RECORD", f"{aid}: complete typed record differs from fixed manifest record pin")


def source_frontmatter_pair(row: dict, archive_manifest: dict[str, str]) -> tuple[dict, dict]:
    aid = row["asset_id"]
    path = row["source_path"]
    source_path = ARCHIVE_ROOT + path
    source_bytes, _ = archive_receipt(BASE, source_path, archive_manifest)
    source_meta = frontmatter(source_bytes, source_path)
    declared_pair = source_meta.get("pair_artifact") or source_meta.get("parent_design")
    pair = row.get("parent_pair")
    if type(pair) is not dict or type(declared_pair) is not str or pair.get("path") != declared_pair:
        fail("E_PARENT_PAIR", f"{aid}: parent pair path does not follow source frontmatter")
    archive_path = ARCHIVE_ROOT + declared_pair
    pair_bytes, receipt = archive_receipt(BASE, archive_path, archive_manifest)
    metadata = frontmatter(pair_bytes, archive_path)
    lines = pair_bytes.decode("utf-8", errors="strict").splitlines()
    title = metadata.get("title")
    if title is None:
        title = next((line[2:].strip() for line in lines if line.startswith("# ")), "")
    expected = {
        "path": declared_pair, "archive_path": archive_path, "git_blob": receipt["blob"],
        "sha256": receipt["sha256"], "title": title,
        "declared_responsibility_owner": metadata.get("responsibility_owner"),
        "status": metadata.get("status"),
        "meaning": "related historical pair; link supports source relationship only and does not transfer owner or approval",
    }
    if not typed_equal(pair, expected):
        fail("E_PARENT_PAIR", f"{aid}: parent pair title/owner/status/blob/MANIFEST receipt differs from fixed BASE")
    return pair, {"source_path": path, "bytes": receipt["bytes"], "responsibility_owner": metadata.get("responsibility_owner")}


def validate_main_union(inventory: dict, records: list[dict]) -> None:
    receipts, main_rows = [], []
    for path in sorted(MAIN_LEDGER_PATHS):
        data = git_bytes(MAIN, path)
        rows = strict_jsonl_bytes(data, f"{MAIN}:{path}")
        mode, kind, blob = git_tree(MAIN, path)
        if kind != "blob" or mode not in {"100644", "100755"}:
            fail("E_UNION", f"main comparison input is not a regular blob: {path}")
        receipts.append({"path": path, "git_blob": blob, "bytes": len(data), "sha256": sha256(data), "row_count": len(rows)})
        main_rows.extend(rows)
    open_data = git_bytes(OPEN_2097, OPEN_2097_LEDGER)
    open_rows = strict_jsonl_bytes(open_data, f"{OPEN_2097}:{OPEN_2097_LEDGER}")
    _, _, open_blob = git_tree(OPEN_2097, OPEN_2097_LEDGER)
    target_ids, target_paths, target_shas = set(), set(), set()
    for row in records:
        aid, path, digest = source_identity(row)
        target_ids.add(aid); target_paths.add(path); target_shas.add(digest)
    main_identities = [source_identity(row) for row in main_rows]
    open_identities = [source_identity(row) for row in open_rows]
    main_ids = {item[0] for item in main_identities}; main_paths = {item[1] for item in main_identities}; main_shas = {item[2] for item in main_identities}
    open_ids = {item[0] for item in open_identities}; open_paths = {item[1] for item in open_identities}; open_shas = {item[2] for item in open_identities}
    for label, identities in (("main", main_identities), ("open #2097", open_identities)):
        by_id = {}
        for aid, path, digest in identities:
            if aid in by_id and by_id[aid] != (path, digest):
                fail("E_UNION", f"{label} has conflicting source identity for {aid}")
            by_id[aid] = (path, digest)
    overlap = {
        "main_id_overlap": len(main_ids & target_ids),
        "main_source_path_overlap": len(main_paths & target_paths),
        "main_source_sha256_overlap": len(main_shas & target_shas),
        "open_pr_id_overlap": len(open_ids & target_ids),
        "open_pr_source_path_overlap": len(open_paths & target_paths),
        "open_pr_source_sha256_overlap": len(open_shas & target_shas),
    }
    if len(main_ids) != 666 or len(main_rows) != 708 or len(open_ids) != 8 or len(open_rows) != 8:
        fail("E_UNION", f"fixed comparison cardinality changed: main rows/IDs={len(main_rows)}/{len(main_ids)}, #2097={len(open_rows)}/{len(open_ids)}")
    if any(overlap.values()):
        fail("E_UNION", f"0148 overlaps a comparison set: {overlap}")
    inputs = inventory.get("current_main_comparison_inputs")
    if type(inputs) is not dict or inputs.get("revision") != MAIN or inputs.get("unique_asset_ids") != 666 or inputs.get("research_rows") != 708 or not typed_equal(inputs.get("asset_ledgers"), receipts):
        fail("E_UNION", "inventory main receipt does not match independently read fixed-main ledgers")
    open_comparison = inventory.get("open_pr_comparison")
    expected_open_result = {
        "pr": 2097, "head": OPEN_2097, "path": OPEN_2097_LEDGER, "git_blob": open_blob,
        "bytes": len(open_data), "sha256": sha256(open_data), "record_count": len(open_rows),
        "unique_asset_ids": len(open_ids), "overlap_id": overlap["open_pr_id_overlap"],
        "overlap_path": overlap["open_pr_source_path_overlap"], "overlap_sha256": overlap["open_pr_source_sha256_overlap"],
    }
    if type(open_comparison) is not dict or not typed_equal(open_comparison.get("results"), [expected_open_result]):
        fail("E_UNION", "inventory open-PR receipt differs from exact pinned #2097 Git object")
    expected_overlap = dict(overlap, basis="asset_id, source_path, and source_sha256 compared independently against fixed main snapshot 666 (includes merged #2094/#2096) and open PR #2097 exact HEAD snapshot; all projections are disjoint. Any later HEAD movement makes this receipt stale pending rebaseline.")
    if not typed_equal(inventory.get("overlap_detail"), expected_overlap):
        fail("E_UNION", "inventory overlap projections differ from independent set calculation")
    if open_comparison.get("open_pr_rows_total") != 8 or open_comparison.get("main_plus_open_pr_comparison_population") != 674 or open_comparison.get("target_overlap") != 0:
        fail("E_UNION", "inventory comparison union cardinality is incorrect")
    expected_components = {"pre_2094_main_union": 537, "merged_pr_2094_records": 72, "merged_pr_2096_records": 57, "current_main_union": 666}
    if not typed_equal(inventory.get("main_union_components"), expected_components):
        fail("E_UNION", "inventory merged-main component arithmetic differs from exact comparison rows")
    existing = inventory.get("existing_research_union")
    if type(existing) is not dict or existing.get("main_base") != MAIN or existing.get("main_union_count") != 666 or "666+52=718" not in existing.get("disposition", ""):
        fail("E_UNION", "inventory current-main union does not preserve the 666+52 candidate population")


def validate_documents(ledger_bytes: bytes, manifest_bytes: bytes, inventory_bytes: bytes, binding_bytes: bytes) -> None:
    if sha256(ledger_bytes) != PINNED_SHA256["ledger"]:
        fail("E_PIN", "ledger differs from fixed code-pinned bytes")
    if sha256(manifest_bytes) != PINNED_SHA256["manifest"]:
        fail("E_PIN", "selection manifest differs from fixed code-pinned contract")
    if sha256(inventory_bytes) != PINNED_SHA256["inventory"]:
        fail("E_PIN", "inventory differs from fixed code-pinned complete record")
    manifest = strict_json_bytes(manifest_bytes, "selection-manifest.json")
    inventory = strict_json_bytes(inventory_bytes, "inventory.json")
    binding = strict_json_bytes(binding_bytes, "SCF-B-0148.json")
    ledger = strict_jsonl_bytes(ledger_bytes, "classification-research.jsonl")
    if type(manifest) is not dict or type(inventory) is not dict or type(binding) is not dict:
        fail("E_TYPE", "manifest, inventory and Binding must be JSON objects")
    expected_manifest_keys = {"schema_revision", "binding_id", "base_revision", "selection_rule", "expected_selected_count", "ledger_sha256", "rows"}
    if set(manifest) != expected_manifest_keys or type(manifest.get("schema_revision")) is not int or manifest["schema_revision"] != 1 or type(manifest.get("expected_selected_count")) is not int or manifest["expected_selected_count"] != 52:
        fail("E_MANIFEST", "manifest keyset or integer schema/count contract changed")
    if manifest.get("binding_id") != "SCF-B-0148" or manifest.get("base_revision") != BASE or manifest.get("selection_rule") != SELECTION_RULE or manifest.get("ledger_sha256") != sha256(ledger_bytes):
        fail("E_MANIFEST", "manifest pin/base/selection/ledger digest differs")
    if type(manifest.get("rows")) is not list or len(manifest["rows"]) != 52:
        fail("E_MANIFEST", "manifest rows must contain exactly 52 entries")
    row_ids, row_paths = [], []
    manifest_rows = {}
    row_keys = {"asset_id", "source_path", "source_sha256", "span_lines", "span_sha256", "category", "candidate_products", "candidate_phase_targets", "authority_boundary", "record_sha256"}
    for item in manifest["rows"]:
        if type(item) is not dict or set(item) != row_keys or type(item.get("asset_id")) is not str or type(item.get("source_path")) is not str:
            fail("E_MANIFEST", "manifest row has invalid shape/types")
        if type(item.get("span_lines")) is not list or not item["span_lines"] or type(item.get("candidate_products")) is not list or type(item.get("candidate_phase_targets")) is not list:
            fail("E_TYPE", f"manifest row {item['asset_id']} has invalid span/product/phase types")
        row_ids.append(item["asset_id"]); row_paths.append(item["source_path"]); manifest_rows[item["asset_id"]] = item
    if len(set(row_ids)) != 52 or len(set(row_paths)) != 52:
        fail("E_MANIFEST", "manifest contains duplicate asset IDs or paths")
    bootstrap = strict_jsonl_bytes(git_bytes(BASE, BOOTSTRAP), f"{BASE}:{BOOTSTRAP}")
    selected = selected_bootstrap(bootstrap)
    selected_by_id = {item["asset_id"]: item for item in selected}
    if set(selected_by_id) != set(row_ids):
        fail("E_SELECTION", "manifest selected set differs from independent fixed-BASE bootstrap result")
    if len(ledger) != 52:
        fail("E_RECORD", "ledger must contain exactly 52 nonblank JSONL records")
    ids = [row.get("asset_id") for row in ledger]
    if any(type(aid) is not str for aid in ids) or len(set(ids)) != 52:
        fail("E_RECORD", "ledger IDs must be unique strings")
    if set(ids) != set(selected_by_id):
        fail("E_SELECTION", "ledger IDs differ from fixed-BASE selected IDs")
    crosswalk_rows = strict_jsonl_bytes(git_bytes(BASE, CROSSWALK), f"{BASE}:{CROSSWALK}")
    crosswalk_refs = {aid: {"candidate_asset_pool_unit_candidate_ids": [], "representative_legacy_asset_unit_candidate_ids": []} for aid in ids}
    for xrow in crosswalk_rows:
        unit_id = xrow.get("unit_candidate_id")
        if type(unit_id) is not str:
            fail("E_CROSSWALK", "crosswalk row lacks string unit_candidate_id")
        pool = xrow.get("candidate_asset_pool")
        if type(pool) is dict:
            pool_ids = pool.get("phase_and_product_candidate_asset_ids", [])
            if type(pool_ids) is not list or any(type(x) is not str for x in pool_ids):
                fail("E_CROSSWALK", f"{unit_id}: candidate_asset_pool IDs are malformed")
            for aid in ids:
                if aid in pool_ids:
                    crosswalk_refs[aid]["candidate_asset_pool_unit_candidate_ids"].append(unit_id)
        representatives = xrow.get("representative_legacy_assets", [])
        if type(representatives) is not list or any(type(x) is not dict for x in representatives):
            fail("E_CROSSWALK", f"{unit_id}: representative_legacy_assets is malformed")
        for ref in representatives:
            aid = ref.get("asset_id")
            if aid in crosswalk_refs:
                crosswalk_refs[aid]["representative_legacy_asset_unit_candidate_ids"].append(unit_id)
    phase_inventory = strict_json_bytes(git_bytes(BASE, PHASE_INVENTORY), f"{BASE}:{PHASE_INVENTORY}")
    phase_representatives = set()
    def collect_phase_representatives(value):
        if type(value) is dict:
            ref = value.get("asset_id")
            if type(ref) is str and ref in crosswalk_refs:
                phase_representatives.add(ref)
            for child in value.values():
                collect_phase_representatives(child)
        elif type(value) is list:
            for child in value:
                collect_phase_representatives(child)
    collect_phase_representatives(phase_inventory)
    for aid in crosswalk_refs:
        crosswalk_refs[aid]["candidate_asset_pool_unit_candidate_ids"].sort()
        crosswalk_refs[aid]["representative_legacy_asset_unit_candidate_ids"].sort()
    archive_manifest = manifest_digests(git_bytes(BASE, ARCHIVE_MANIFEST))
    derived_pairs = {}
    for row in ledger:
        aid = row["asset_id"]
        expected_crosswalk_evidence = {
            "crosswalk_bootstrap_ref": CROSSWALK,
            **crosswalk_refs[aid],
            "phase_inventory_ref": PHASE_INVENTORY,
            "phase_inventory_representative_asset": aid in phase_representatives,
            "membership_semantics": "candidate_asset_pool is search-candidate-only; representative_legacy_assets and phase representative links are contextual references, not direct semantic or consumer links",
        }
        if not typed_equal(row.get("crosswalk_evidence"), expected_crosswalk_evidence):
            fail("E_CROSSWALK", f"{aid}: recorded crosswalk/phase references differ from fixed-BASE sources")
        check_record_source(row, selected_by_id[aid], manifest_rows, archive_manifest)
        pair, pair_context = source_frontmatter_pair(row, archive_manifest)
        path = pair["path"]
        inventory_pair = {
            "path": path,
            "archive_path": pair["archive_path"],
            "blob": pair["git_blob"],
            "bytes": len(git_bytes(BASE, pair["archive_path"])),
            "sha256": pair["sha256"],
            "title": pair["title"],
            "declared_pair_artifact": row["source_path"],
            "responsibility_owner": pair["declared_responsibility_owner"],
            "status": pair["status"],
        }
        if path not in derived_pairs or row["source_path"] < derived_pairs[path]["declared_pair_artifact"]:
            derived_pairs[path] = inventory_pair
    inventory_pairs = inventory.get("parent_pairs")
    if type(inventory_pairs) is not list or not typed_equal(inventory_pairs, [derived_pairs[p] for p in sorted(derived_pairs)]):
        fail("E_PARENT_PAIR", "inventory parent-pair closure differs from source-frontmatter and fixed-BASE pair blobs")
    fixed_inputs = inventory.get("fixed_inputs")
    expected_fixed_inputs = [{"path": path, "sha256": digest} for path, digest in BASE_INPUTS_FROM_INVENTORY.items()]
    if type(fixed_inputs) is not list or not typed_equal(fixed_inputs, expected_fixed_inputs):
        fail("E_INVENTORY", "inventory fixed input set differs from code-pinned research inputs")
    for path, digest in BASE_INPUTS_FROM_INVENTORY.items():
        if sha256(git_bytes(BASE, path)) != digest:
            fail("E_BASE_SOURCE", f"fixed research input digest changed at {BASE}:{path}")
    if type(inventory.get("binding_id")) is not str or inventory.get("binding_id") != "SCF-B-0148" or inventory.get("base_revision") != BASE:
        fail("E_INVENTORY", "inventory base/binding identity changed")
    if type(inventory.get("authority_boundary")) is not dict or not typed_equal(inventory["authority_boundary"], EXPECTED_INVENTORY_AUTHORITY):
        fail("E_AUTHORITY", "inventory authority boundary is malformed or promoted")
    counts = Counter(row["classification"]["category"] for row in ledger)
    expected_counts = {"direct_candidate_unresolved": 3, "cross_product_split_candidate_unresolved": 47, "insufficient_direct_basis": 2}
    if {key: counts.get(key, 0) for key in expected_counts} != expected_counts:
        fail("E_CLASSIFICATION", f"category cardinality differs from 52-record candidate set: {dict(counts)}")
    candidate_counts = Counter(product for row in ledger for product in row["classification"]["candidate_products"])
    if inventory.get("classification_counts") != {
        **expected_counts, "formal_product_owner_accepted": 0, "phase_admissions": 0,
        "implementation_status_known_per_asset": 0, "consumer_closure_complete": 0,
    }:
        fail("E_INVENTORY", "inventory classification counts differ from recomputed typed record counts")
    expected_product_counts = {product: candidate_counts.get(product, 0) for product in PRODUCTS}
    expected_product_counts["count_is_nonexclusive"] = True
    if not typed_equal(inventory.get("candidate_product_counts"), expected_product_counts):
        fail("E_INVENTORY", "inventory product candidate counts differ from record product_basis")
    if not typed_equal(inventory.get("artifacts"), list(ARTIFACTS)):
        fail("E_INVENTORY", "inventory artifact list is not the full registered Binding artifact set")
    crosswalk_summary = {
        "crosswalk_bootstrap_ref": CROSSWALK,
        "crosswalk_row_count": len(crosswalk_rows),
        "crosswalk_candidate_asset_pool_selected_asset_count": sum(bool(x["candidate_asset_pool_unit_candidate_ids"]) for x in crosswalk_refs.values()),
        "selected_assets_in_representative_legacy_assets": sum(bool(x["representative_legacy_asset_unit_candidate_ids"]) for x in crosswalk_refs.values()),
        "representative_asset_rows_for_selected_assets": sum(len(x["representative_legacy_asset_unit_candidate_ids"]) for x in crosswalk_refs.values()),
        "phase_inventory_ref": PHASE_INVENTORY,
        "selected_assets_in_phase_inventory_representative_assets": len(phase_representatives),
        "membership_semantics": "candidate_asset_pool is search-candidate-only; representative and phase representative links are contextual references, not direct semantic or consumer links",
    }
    if not typed_equal(inventory.get("crosswalk_and_phase_references"), crosswalk_summary):
        fail("E_INVENTORY", "crosswalk/phase reference summary differs from fixed-BASE source projections")
    if not typed_equal(binding.get("artifacts"), list(ARTIFACTS)):
        fail("E_BINDING", "Binding artifact list is not the full inventory/registered artifact set")
    if not typed_equal(binding.get("operations", {}).get("allowed"), [
        "read pinned Git/archive blobs statically", "write classification ledger, inventory, README, and draft summary in scaffold namespace",
        "run scfctl and diff check", "run the pinned static validator and its negative self-check",
    ]) or not typed_equal(binding.get("operations", {}).get("forbidden"), [
        "execute archive source/runtime/test/CI/workflow/hook/adapter", "update formal disposition or phase ledger",
        "infer test PASS/implementation from test design or citation", "promote product/phase/successor/implementation/consumer status",
        "merge/close/push/deploy", "旧archiveは実行しない",
    ]):
        fail("E_BINDING", "Binding operation boundary changed or is malformed")
    binding_core = dict(binding)
    binding_core.pop("upstream", None)
    if canonical_sha(binding_core) != PINNED_BINDING_CORE_SHA256:
        fail("E_BINDING", "Binding non-upstream contract differs from code-pinned scaffold boundary")
    expected_upstream_paths = set(BASE_INPUTS_FROM_INVENTORY) | {ARCHIVE_MANIFEST, *OUTPUT_UPSTREAM, "scaffold/legacy-research-assets-product-classification-0142/classification-research.jsonl"}
    upstream = binding.get("upstream")
    if type(upstream) is not list or any(type(row) is not dict for row in upstream):
        fail("E_TYPE", "Binding upstream must be an array of objects")
    upstream_paths = [row.get("path") for row in upstream]
    if any(type(path) is not str for path in upstream_paths) or len(upstream_paths) != len(set(upstream_paths)) or set(upstream_paths) != expected_upstream_paths:
        fail("E_BINDING", "Binding upstream path set is incomplete, duplicated, or unregistered")
    expected_digests = {path: digest for path, digest in BASE_INPUTS_FROM_INVENTORY.items()}
    expected_digests[ARCHIVE_MANIFEST] = sha256(git_bytes(BASE, ARCHIVE_MANIFEST))
    for path in OUTPUT_UPSTREAM:
        expected_digests[path] = sha256((ROOT / path).read_bytes())
    main_0142 = "scaffold/legacy-research-assets-product-classification-0142/classification-research.jsonl"
    expected_digests[main_0142] = sha256(git_bytes(MAIN, main_0142))
    for row in upstream:
        path = row.get("path")
        if set(row) != {"path", "sha256", "note"} or type(row.get("sha256")) is not str or row["sha256"] != expected_digests[path]:
            fail("E_BINDING", f"Binding upstream digest/shape differs for {path}")
    for label, filename in (("README.md", "README.md"), ("PR-DRAFT.md", "PR-DRAFT.md"), ("selfcheck.py", "selfcheck.py")):
        actual = sha256((BUNDLE / filename).read_bytes())
        if actual != PINNED_SHA256[label]:
            fail("E_PIN", f"{filename} differs from fixed code-pinned research claim/negative tests")
    validate_main_union(inventory, ledger)


# Populated from fixed inventory pins; rechecked against Git objects above.
BASE_INPUTS_FROM_INVENTORY = {
    'docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl': '2188f236cb7ed316772ee1fcf413f3b098f702cb4c9d9b3dad09a72db7468c1f',
    'docs/governance/legacy-asset-disposition.jsonl': 'cd73ac407937ad86c6be2c0b27d70863b1873fe39c2d6c0f89620e648dccad8c',
    'docs/governance/legacy-asset-decisions.jsonl': 'cbf7c18fbf0faea7745677091d440e40ba48345740a786404258e705a3cbd59f',
    'docs/governance/legacy-asset-copy-read-after.jsonl': '9e0083db5d3e44438579a4adf8544e89419b7235fd7b18c8b1e8ab92cefa203f',
    'docs/concept/product-boundary.md': '097f27311060c56e387cf49fe6ec75731e5fd9dc04ac1a4be987d285e02ee038',
    'docs/helix-harness/L1-planning/product-intent.md': 'a49da594e9593557eb42cbfe54edc7e9751ce40fea95d1fe9367f5780184ee04',
    'docs/helix-os/L1-planning/system-intent.md': '0f7f30d9d6984578f09c31ed1ef4e826d7c360bf752297982bde5201e7e99ca8',
    'docs/helix-web/L1-planning/product-intent.md': '26815032e130d63fa3cef273847c029cbfc959a4d1a7c74e648a7044fc6d9756',
    'docs/helix-web-os/L1-planning/system-intent.md': '600caa1388278abe43c06f01c53f565146c2f2ddd2165f6a8c9e63cbb174a34c',
    'docs/governance/phase-capability-inventory.md': '1fdbd85da6a987e945bfaeef97c18696819799fbdbaed09dd3eae410f295508d',
    'docs/governance/phase-capability-inventory.json': '9face795f98c660bec02d46106f08a25ba189633f6b555b563a0c7951e173f0c',
    'docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl': '8610eb2e29d6b23905dba191c0781c4c6e3c22efe591ec6076b95bac8533af65',
    'docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md': '14aad7ae9bd0f4482e1855c756c89a8dcf4e19da16d4bc71e8b03894e288fa1e',
}


def validate(ledger_path: Path = LEDGER, manifest_path: Path = MANIFEST, inventory_path: Path = INVENTORY, binding_path: Path = BINDING) -> list[str]:
    try:
        validate_documents(Path(ledger_path).read_bytes(), Path(manifest_path).read_bytes(), Path(inventory_path).read_bytes(), Path(binding_path).read_bytes())
        return []
    except ValidationError as exc:
        return [str(exc)]
    except (OSError, KeyError, TypeError, ValueError, IndexError, subprocess.SubprocessError) as exc:
        return [f"E_INPUT: malformed or unavailable input: {type(exc).__name__}: {exc}"]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--ledger", type=Path, default=LEDGER)
    parser.add_argument("--manifest", type=Path, default=MANIFEST)
    parser.add_argument("--inventory", type=Path, default=INVENTORY)
    parser.add_argument("--binding", type=Path, default=BINDING)
    args = parser.parse_args()
    errors = validate(args.ledger, args.manifest, args.inventory, args.binding)
    if errors:
        print("SCF-B-0148 static validation failed:")
        print("\n".join(f"- {error}" for error in errors))
        return 1
    print("SCF-B-0148 static validation passed: 52 fixed-BASE records, archive MANIFEST/blob/parent-pair derivation, bounded bootstrap deltas, 666 main + 8 open #2097 + 52 target with zero ID/path/SHA overlap")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
