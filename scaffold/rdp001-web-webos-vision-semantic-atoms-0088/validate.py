#!/usr/bin/env python3
"""Validate the final bounded Web/Web-OS Vision semantic candidate subset."""
from __future__ import annotations
import hashlib
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
BASE = "3cdde5dfedfc51ff7c757a2f5fb2eb11a3c6b64c"
VISION = "archive/legacy-generation-2026-09-14/root/docs/archive/intake/2026-09-06-concept-vision/vision/HELIX_VISION_v0.1.md"
SPAN_FILE = "scaffold/rdp001-web-webos-vision-source-0080/vision-spans.jsonl"
SOURCE_INV = "scaffold/rdp001-web-webos-vision-source-0080/inventory.json"
PARENT_INV = "scaffold/rdp001-web-webos-vision-semantic-atoms-0084/inventory.json"
PARENT_ATOMS = "scaffold/rdp001-web-webos-vision-semantic-atoms-0084/semantic-atoms.jsonl"
PRIOR_INV = "scaffold/rdp001-web-webos-vision-semantic-atoms-0081/inventory.json"
PRIOR_ATOMS = "scaffold/rdp001-web-webos-vision-semantic-atoms-0081/semantic-atoms.jsonl"
PARENT_BINDING = "scaffold/bindings/SCF-B-0084.json"
SOURCE_ATOMS = "scaffold/rdp001-web-webos-vision-semantic-atoms-0088/semantic-atoms.jsonl"
SOURCE_LINKS = "scaffold/rdp001-web-webos-vision-semantic-atoms-0088/legacy-links.jsonl"
SELECTED = ["VISION-U17", "VISION-U18", "VISION-U19", "VISION-O05", "VISION-O06", "VISION-O07", "VISION-O08", "VISION-O09", "VISION-O10"]
PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
ATOM_ORDER = [
    "WEB-FINAL-ATOM-001", "WEB-FINAL-ATOM-002", "WEBOS-FINAL-ATOM-003",
    "WEB-FINAL-COMPOSITE-004", "HARNESS-OS-FINAL-COMPOSITE-005",
    "OS-WEBOS-FINAL-COMPOSITE-006", "OS-WEBOS-FINAL-COMPOSITE-007",
    "OS-WEB-FINAL-COMPOSITE-008", "HARNESS-WEBOS-FINAL-COMPOSITE-009",
]
EXPECTED = {
    "WEB-FINAL-ATOM-001": ("VISION-U17", "HELIX-Web", "user_maintenance_and_repair", "user_duty", 546, ["と", "。"], "atomized_candidate"),
    "WEB-FINAL-ATOM-002": ("VISION-U18", "unresolved", "parallel_business_product_direction", "vision_direction", 547, ["とか", "。"], "atomized_candidate"),
    "WEBOS-FINAL-ATOM-003": ("VISION-U19", "unresolved", "factory_product_family_direction", "vision_direction", 548, ["以外は", "みたいな"], "atomized_candidate"),
    "WEB-FINAL-COMPOSITE-004": ("VISION-O05", "unresolved", "user_maintenance_release_gate", "open_decision", 480, ["・", "：", "、"], "composite_unresolved"),
    "HARNESS-OS-FINAL-COMPOSITE-005": ("VISION-O06", "unresolved", "external_information_rights_gate", "open_decision", 481, ["・", "：", "、"], "composite_unresolved"),
    "OS-WEBOS-FINAL-COMPOSITE-006": ("VISION-O07", "unresolved", "learning_data_evaluation_gate", "open_decision", 482, ["・", "：", "、"], "composite_unresolved"),
    "OS-WEBOS-FINAL-COMPOSITE-007": ("VISION-O08", "unresolved", "model_compute_resource_gate", "open_decision", 483, ["・", "：", "、"], "composite_unresolved"),
    "OS-WEB-FINAL-COMPOSITE-008": ("VISION-O09", "unresolved", "business_service_foundation_gate", "open_decision", 484, ["・", "：", "、"], "composite_unresolved"),
    "HARNESS-WEBOS-FINAL-COMPOSITE-009": ("VISION-O10", "unresolved", "system_compiler_delivery_gate", "open_decision", 485, ["・", "：", "、"], "composite_unresolved"),
}
REASONS = {
    "WEB-FINAL-COMPOSITE-004": "open decision couples user operation types, product scope, and failure recovery evidence before self maintenance/repair is opened",
    "HARNESS-OS-FINAL-COMPOSITE-005": "open decision couples external information scope, freshness, rights, attribution, and reuse for change/training",
    "OS-WEBOS-FINAL-COMPOSITE-006": "open decision couples consent, purpose, isolation, evaluation contamination, counterexamples, and deletion",
    "OS-WEBOS-FINAL-COMPOSITE-007": "open decision couples model choice, tuning, training/inference resources, quality, and cost",
    "OS-WEB-FINAL-COMPOSITE-008": "open decision couples first product, users, pricing, commonization, and provider responsibility",
    "HARNESS-WEBOS-FINAL-COMPOSITE-009": "open decision couples target system type, acceptance scope, data migration, environment permissions, and residual risk",
}
INV_KEYS = {"schema", "candidate_id", "status", "authority_effect", "meaning_change_applied", "formal_requirement_unit_count", "successor_requirement_ids", "human_decision_ref", "formal_register_append", "old_runtime_test_ci_execution", "scope", "candidate_products", "source", "lineage", "findings", "unresolved_questions", "prohibited_inference", "verification_contract", "residuals", "created", "updated"}
SCOPE_KEYS = {"worktree", "base_origin_main", "read_only", "static_only", "old_archive_execution", "parent_binding_id", "parent_scaffold_path", "parent_inventory_sha256", "parent_atom_file_sha256", "parent_span_file_sha256", "parent_span_count", "selected_parent_span_ids", "selected_parent_span_count", "unprocessed_parent_span_ids", "unprocessed_parent_span_count", "prior_selected_parent_span_ids", "vision_source_path", "vision_source_sha256", "vision_source_line_count", "selected_candidate_source_line_count", "unprocessed_candidate_source_line_count", "semantic_atom_record_count", "atomized_candidate_count", "composite_unresolved_count", "web_user_atom_count", "webos_runtime_atom_count", "unresolved_product_candidate_count", "selected_legacy_asset_count", "legacy_asset_unreviewed_count", "selection_rule"}
PRODUCT_KEYS = {"product", "boundary", "candidate_parent_span_ids", "candidate_atom_count", "owner_status", "authority_status", "implementation_status", "degradation_status", "phase_status", "unimplemented_status"}
ATOM_KEYS = {"atom_id", "parent_span_id", "related_open_decision_ids", "source_path", "source_line_start", "source_line_end", "exact_source_text", "source_span_sha256", "candidate_text", "candidate_product", "candidate_product_candidates", "candidate_role", "candidate_kind", "atomization_status", "connective_tokens", "semantic_status", "semantic_equivalence", "owner_status", "authority_status", "adoption_status", "legacy_implementation_status", "current_implementation_status", "legacy_degradation_status", "current_degradation_status", "phase_status", "unimplemented_status", "failure_status", "consumer_status", "decision_status", "meaning_change_applied", "unresolved_questions", "composite_reason"}
LINEAGE_KEYS = {"path", "sha256", "relation"}
SOURCE_KEYS = {"path", "sha256", "line_count", "parent_span_file", "parent_span_file_sha256", "semantic_atoms_path", "semantic_atoms_sha256", "legacy_links_path", "legacy_links_sha256"}
CONTRACT_KEYS = {"required_commands", "negative_cases", "archive_rule"}
RESIDUAL_KEYS = {"formal_requirement_unit", "semantic_equivalence", "owner_authority", "legacy_failure", "legacy_consumer_closure", "legacy_implementation", "current_implementation", "degradation", "phase_admission"}

def fail(code: str, detail: str = "") -> None:
    raise AssertionError(code + ((":" + detail) if detail else ""))

def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def exact_keys(value, expected, code: str) -> None:
    if not isinstance(value, dict) or set(value) != expected:
        got = sorted(set(value) ^ expected) if isinstance(value, dict) else "not-object"
        fail(code, ",".join(got) if isinstance(got, list) else got)

def git_show(path: str) -> bytes:
    result = subprocess.run(["git", "show", f"HEAD:{path}"], cwd=ROOT, capture_output=True)
    if result.returncode:
        fail("E_GIT_SOURCE", path)
    return result.stdout

def load_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        fail("E_JSON", f"{path}:{exc}")

def load_jsonl(path: Path):
    rows = []
    for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if line.strip():
            try:
                rows.append(json.loads(line))
            except Exception as exc:
                fail("E_JSONL", f"{path}:{number}:{exc}")
    return rows

def git_json(path: str):
    return json.loads(git_show(path))

def git_jsonl(path: str):
    return [json.loads(line) for line in git_show(path).decode().splitlines() if line.strip()]

def validate(inv, atoms, links):
    exact_keys(inv, INV_KEYS, "E_INV_KEYS")
    if inv["schema"] != "rdp001-web-webos-vision-semantic-atoms/v1" or inv["candidate_id"] != "RDP-001-WEB-WEBOS-VISION-SEMANTIC-ATOMS-0088":
        fail("E_IDENTITY")
    if inv["status"] != "findings_only" or inv["authority_effect"] != "none" or inv["meaning_change_applied"] or inv["formal_requirement_unit_count"] != "not_generated":
        fail("E_BOUNDARY")
    if inv["successor_requirement_ids"] or inv["human_decision_ref"] is not None or inv["formal_register_append"] or inv["old_runtime_test_ci_execution"]:
        fail("E_PROMOTION")
    scope = inv["scope"]
    exact_keys(scope, SCOPE_KEYS, "E_SCOPE_KEYS")
    head = subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True, capture_output=True).stdout.strip()
    if scope["base_origin_main"] != BASE or subprocess.run(["git", "merge-base", "--is-ancestor", BASE, head], cwd=ROOT).returncode:
        fail("E_BASE")
    if not scope["read_only"] or not scope["static_only"] or scope["old_archive_execution"]:
        fail("E_SCOPE_BOUNDARY")
    parent_inv_bytes = git_show(PARENT_INV)
    parent_atom_bytes = git_show(PARENT_ATOMS)
    prior_inv = git_json(PRIOR_INV)
    prior_atoms = git_jsonl(PRIOR_ATOMS)
    parent_inv = json.loads(parent_inv_bytes)
    parent_atoms = [json.loads(line) for line in parent_atom_bytes.decode().splitlines() if line.strip()]
    if scope["parent_binding_id"] != "SCF-B-0084" or scope["parent_scaffold_path"] != "scaffold/rdp001-web-webos-vision-semantic-atoms-0084":
        fail("E_PARENT_ID")
    if scope["parent_inventory_sha256"] != sha(parent_inv_bytes) or scope["parent_atom_file_sha256"] != sha(parent_atom_bytes):
        fail("E_PARENT_DIGEST")
    if parent_inv["candidate_id"] != "RDP-001-WEB-WEBOS-VISION-SEMANTIC-ATOMS-0084" or parent_inv["scope"]["unprocessed_parent_span_count"] != 9:
        fail("E_PARENT_STATE")
    if set(scope["selected_parent_span_ids"]) != set(SELECTED) or len(scope["selected_parent_span_ids"]) != 9 or scope["selected_parent_span_count"] != 9 or scope["unprocessed_parent_span_ids"] or scope["unprocessed_parent_span_count"] != 0:
        fail("E_PARENT_DENOM")
    prior_selected = set(prior_inv["scope"]["selected_parent_span_ids"]) | set(parent_inv["scope"]["selected_parent_span_ids"])
    if set(scope["prior_selected_parent_span_ids"]) != prior_selected or set(SELECTED) & prior_selected:
        fail("E_PRIOR_SPAN_OVERLAP")
    source_bytes = git_show(VISION)
    span_bytes = git_show(SPAN_FILE)
    parent_spans = git_jsonl(SPAN_FILE)
    parent_by = {span["span_id"]: span for span in parent_spans}
    lines = source_bytes.decode().splitlines(keepends=True)
    if scope["vision_source_path"] != VISION or scope["vision_source_sha256"] != sha(source_bytes) or scope["vision_source_line_count"] != len(lines):
        fail("E_VISION_SOURCE")
    if scope["parent_span_file_sha256"] != sha(span_bytes) or len(parent_spans) != 29:
        fail("E_PARENT_SPAN_DIGEST")
    if scope["semantic_atom_record_count"] != 9 or scope["atomized_candidate_count"] != 3 or scope["composite_unresolved_count"] != 6 or scope["web_user_atom_count"] != 1 or scope["webos_runtime_atom_count"] != 0 or scope["unresolved_product_candidate_count"] != 8:
        fail("E_COUNTS")
    if scope["selected_legacy_asset_count"] != 0 or scope["legacy_asset_unreviewed_count"] != 4020:
        fail("E_LEGACY_COUNTS")
    if links:
        fail("E_LEGACY_BOUNDARY")
    source = inv["source"]
    exact_keys(source, SOURCE_KEYS, "E_SOURCE_KEYS")
    if source["path"] != VISION or source["sha256"] != sha(source_bytes) or source["line_count"] != len(lines) or source["parent_span_file"] != SPAN_FILE or source["parent_span_file_sha256"] != sha(span_bytes) or source["semantic_atoms_path"] != SOURCE_ATOMS or source["semantic_atoms_sha256"] != sha((HERE / "semantic-atoms.jsonl").read_bytes()) or source["legacy_links_path"] != SOURCE_LINKS or source["legacy_links_sha256"] != sha((HERE / "legacy-links.jsonl").read_bytes()):
        fail("E_SOURCE_METADATA")
    expected_products = {
        "HELIX-HARNESS": ["VISION-O06", "VISION-O09", "VISION-O10"],
        "HELIX-OS": ["VISION-U18", "VISION-U19", "VISION-O06", "VISION-O07", "VISION-O08", "VISION-O09"],
        "HELIX-Web": ["VISION-U17", "VISION-U18", "VISION-O05", "VISION-O09", "VISION-O10"],
        "HELIX-Web-OS": ["VISION-U19", "VISION-O05", "VISION-O06", "VISION-O07", "VISION-O08", "VISION-O09", "VISION-O10"],
    }
    if [p.get("product") for p in inv["candidate_products"]] != PRODUCTS:
        fail("E_PRODUCT_ORDER")
    for product in inv["candidate_products"]:
        exact_keys(product, PRODUCT_KEYS, "E_PRODUCT_KEYS")
        name = product["product"]
        if name not in PRODUCTS or product["candidate_parent_span_ids"] != expected_products[name] or product["candidate_atom_count"] != len(expected_products[name]):
            fail("E_PRODUCT_BOUNDARY", name)
        if any(product[key] != expected for key, expected in (("owner_status", "unknown"), ("authority_status", "none"), ("implementation_status", "unknown"), ("degradation_status", "unknown"), ("phase_status", "unknown"), ("unimplemented_status", "not_claimed"))):
            fail("E_PRODUCT_STATUS", name)
    lineage = inv["lineage"]
    if not isinstance(lineage, list) or not lineage:
        fail("E_LINEAGE")
    for record in lineage:
        exact_keys(record, LINEAGE_KEYS, "E_LINEAGE_KEYS")
        path = ROOT / record["path"]
        if not path.exists() or sha(path.read_bytes()) != record["sha256"]:
            fail("E_LINEAGE_DIGEST", record["path"])
    if len(atoms) != 9 or [atom.get("atom_id") for atom in atoms] != ATOM_ORDER:
        fail("E_ATOM_ORDER")
    prior_lines = set()
    prior_span_ids = set()
    for old in prior_atoms + parent_atoms:
        prior_span_ids.add(old["parent_span_id"])
        prior_lines.update(range(old["source_line_start"], old["source_line_end"] + 1))
    referenced = set()
    selected_lines = set()
    for atom in atoms:
        exact_keys(atom, ATOM_KEYS, "E_ATOM_KEYS")
        aid = atom["atom_id"]
        if aid not in EXPECTED:
            fail("E_ATOM_ID", aid)
        parent, candidate_product, role, kind, line_no, connective, status = EXPECTED[aid]
        if atom["parent_span_id"] != parent or parent not in SELECTED or parent not in parent_by or atom["candidate_product"] != candidate_product or atom["candidate_role"] != role or atom["candidate_kind"] != kind or atom["source_line_start"] != line_no or atom["source_line_end"] != line_no or atom["connective_tokens"] != connective or atom["atomization_status"] != status:
            fail("E_ATOM_META", aid)
        if atom["source_path"] != VISION:
            fail("E_ATOM_SOURCE", aid)
        span = parent_by[parent]
        if not span["line_start"] <= line_no <= line_no <= span["line_end"]:
            fail("E_PARENT_CONTAINMENT", aid)
        if set(range(line_no, line_no + 1)) & prior_lines:
            fail("E_PRIOR_LINE_OVERLAP", aid)
        if not set(atom["candidate_product_candidates"]).issubset(PRODUCTS) or not atom["candidate_product_candidates"]:
            fail("E_PRODUCT_CANDIDATES", aid)
        exact = lines[line_no - 1]
        if atom["exact_source_text"] != exact or atom["candidate_text"] != exact.rstrip("\n") or atom["source_span_sha256"] != sha(exact.encode()):
            fail("E_ATOM_TEXT", aid)
        if atom["semantic_status"] != ("source_bound_candidate" if status == "atomized_candidate" else "composite_unresolved") or atom["semantic_equivalence"] != "unknown" or atom["owner_status"] != "unknown" or atom["authority_status"] != "none" or atom["adoption_status"] != "unknown" or atom["meaning_change_applied"]:
            fail("E_ATOM_BOUNDARY", aid)
        for key in ("legacy_implementation_status", "current_implementation_status", "legacy_degradation_status", "current_degradation_status", "phase_status", "failure_status", "consumer_status", "decision_status"):
            if atom[key] != "unknown":
                fail("E_ATOM_STATUS", aid + ":" + key)
        if atom["unimplemented_status"] != "not_claimed" or not isinstance(atom["unresolved_questions"], list) or not atom["unresolved_questions"]:
            fail("E_ATOM_UNRESOLVED", aid)
        if status == "composite_unresolved" and atom["composite_reason"] != REASONS[aid]:
            fail("E_COMPOSITE_REASON", aid)
        if status == "atomized_candidate" and atom["composite_reason"] is not None:
            fail("E_ATOM_COMPOSITE_REASON", aid)
        referenced.add(parent)
        selected_lines.add(line_no)
    if referenced != set(SELECTED):
        fail("E_PARENT_COVERAGE", ",".join(sorted(set(SELECTED) - referenced)))
    if scope["selected_candidate_source_line_count"] != len(selected_lines) or scope["unprocessed_candidate_source_line_count"] != len(lines) - len(selected_lines):
        fail("E_SOURCE_LINE_COUNTS")
    for field in ("findings", "unresolved_questions", "prohibited_inference"):
        if not isinstance(inv[field], list) or not inv[field]:
            fail("E_INV_RECORDS", field)
    for record in inv["findings"]:
        exact_keys(record, {"id", "status", "text"}, "E_FINDING_KEYS")
    for record in inv["prohibited_inference"]:
        exact_keys(record, {"id", "text"}, "E_PROHIBITED_KEYS")
    exact_keys(inv["verification_contract"], CONTRACT_KEYS, "E_CONTRACT_KEYS")
    if not inv["verification_contract"]["required_commands"] or not inv["verification_contract"]["negative_cases"]:
        fail("E_CONTRACT")
    exact_keys(inv["residuals"], RESIDUAL_KEYS, "E_RESIDUAL_KEYS")
    if any(value != "pending" for value in inv["residuals"].values()):
        fail("E_RESIDUAL_PROMOTION")

def main() -> None:
    validate(load_json(HERE / "inventory.json"), load_jsonl(HERE / "semantic-atoms.jsonl"), load_jsonl(HERE / "legacy-links.jsonl"))
    print("PASS validate: 9 final parent spans (3 atoms + 6 composites), prior span/line overlap=0, four-product boundaries explicit")

if __name__ == "__main__":
    try:
        main()
    except AssertionError as exc:
        print("FAIL " + str(exc), file=sys.stderr)
        sys.exit(1)
