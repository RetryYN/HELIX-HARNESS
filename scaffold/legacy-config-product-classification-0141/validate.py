#!/usr/bin/env python3
"""Independent fail-closed validator for SCF-B-0141."""
from __future__ import annotations

import hashlib
import json
import subprocess
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-config-product-classification-0141"
LEDGER = BUNDLE / "classification-research.jsonl"
INVENTORY = BUNDLE / "inventory.json"
BASE_REVISION = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
BINDING_ID = "SCF-B-0141"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
MANIFEST = "archive/legacy-generation-2026-09-14/MANIFEST.sha256"
BOUNDARY = "docs/concept/product-boundary.md"
L1 = {"HELIX-HARNESS": "docs/helix-harness/L1-planning/product-intent.md", "HELIX-OS": "docs/helix-os/L1-planning/system-intent.md", "HELIX-Web": "docs/helix-web/L1-planning/product-intent.md", "HELIX-Web-OS": "docs/helix-web-os/L1-planning/system-intent.md"}
FAILURE = "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md"
CONSUMER = "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md"
DECISION_RECORD = "docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md"
DECISION_PACKET = "docs/governance/audits/source-rebaseline/concept-v4.1-human-decision-packet.md"
REUSE = "docs/governance/legacy-asset-reuse-control.md"
START = "docs/governance/new-generation-start-here.md"
WAVE_PATHS = {n: (f"docs/governance/legacy-requirement-direct-semantic-review-wave{n}.jsonl" if n <= 36 else f"scaffold/legacy-semantic-review-wave{n}/legacy-requirement-direct-semantic-review-wave{n}.jsonl") for n in range(1, 51)}
INPUTS = [PHASE, DISPOSITION, DECISIONS, READ_AFTER, BOUNDARY, *L1.values(), FAILURE, CONSUMER, DECISION_RECORD, DECISION_PACKET, REUSE, START, MANIFEST, *WAVE_PATHS.values()]
PRODUCTS = tuple(L1)
HUMAN_JUDGMENT = ["product_owner_and_boundary_decision", "configuration_semantic_anchor_acceptance", "phase_candidate_admission_and_successor_assignment", "legacy_implementation_degradation_failure_and_consumer_closure", "formal_asset_classification_update"]
RULES = {"direct_product_basis": "phase candidate has one product and the configuration marker is retained as a reviewable static basis; this is not formal ownership", "multi_product_conflict": "phase candidates contain two or more products; a single owner cannot be inferred", "insufficient_basis": "no product candidate is present in the phase snapshot; configuration presence alone cannot establish a product owner"}
RECORD_KEYS = {"asset_id", "source_path", "source_exact", "phase_evidence", "legacy_asset_evidence", "classification", "boundary_evidence", "legacy_history_failure_consumer", "implementation_evidence", "wave_semantic_links", "wave_edge_count", "human_judgment_remaining", "authority_effect", "formal_asset_classification_updated", "new_build_allowed"}
SOURCE_KEYS = {"archive_path", "source_path", "blob", "bytes", "line_count", "sha256", "ledger_source_sha256", "ledger_digest_match", "archive_manifest_sha256", "archive_manifest_match", "semantic_anchor", "read_mode"}
ANCHOR_KEYS = {"marker", "line_start", "line_end", "line_text", "line_text_sha256", "interpretation", "products_considered"}
EDGE_KEYS = {"wave", "path", "line", "row_sha256", "asset_id", "source_path", "source_sha256", "source_requirement_id", "unit_candidate_id", "semantic_link_status", "candidate_product_targets", "candidate_phase_targets", "product_scope", "evidence_refs", "counterevidence"}
PHASE_KEYS = {"path", "line", "row_sha256", "artifact_evidence_kind", "candidate_phase_targets", "candidate_product_targets", "phase_classification_status", "product_classification_status", "implementation_evidence_state", "legacy_implementation_status", "legacy_execution_performed", "consumer_closure_status", "unresolved"}
DISP_KEYS = {"path", "line", "row_sha256", "source_path", "source_sha256", "disposition", "asset_class", "product_target", "implementation_status", "consumer_refs", "decision_record_ref", "read_after_record_ref"}
EXPECTED_INV_KEYS = {"schema_revision", "binding_id", "bundle_revision", "base_revision", "base_source_mode", "scope", "research_scope", "evidence_completeness", "target_count", "target_asset_ids", "target_source_paths", "target_asset_ids_sha256", "target_artifact_evidence_kinds", "classification_counts", "input_digests", "output_sha256", "research_union", "overlap_status", "denominator_role", "classification_rule", "authority_boundary", "old_archive_execution", "wave_scan", "negative_cases", "artifacts"}
EXPECTED_INPUT_KEYS = {"path", "blob", "bytes", "sha256"}

# Main is the exact merged research union at origin/main. The open-PR pins are
# Git object snapshots; their contents are never executed.
MAIN_PINS = {
    "scaffold/legacy-asset-product-classification-0107/inventory.json": ("b5201e8aadc71e94cf0a44f94d825582a729a673", 29120, "sha256:0bbcd6433312154f131d9d4ff71e47886ae352aba87f96f62cb97715117f6393", 64, "sha256:ea5dbea614e4a19032aa25370c942b9d02a5dc0f2cdcfdb80c7393334b10b707"),
    "scaffold/legacy-lint-product-classification-0108/inventory.json": ("a97ebd5190bef017b94499e75caf5a95dae162d8", 62315, "sha256:66f46326fa5344921365252bbec17058b3dddb97733674373758215d1e76a267", 95, "sha256:340bfa818c7d9282d3e9f48b19b9402c5fac2b2c191ae704b554831654dc361b"),
    "scaffold/legacy-runtime-product-classification-0117/inventory.json": ("0003d5aa7bc4a3defc43b4b51c280941c206f1e4", 59214, "sha256:6451b00b8ba68fdfa7960a3593c73d168f1d9be64d64d7275b0c5e12fe22f496", 73, "sha256:483c9fe3ccb88c768c7d6f6023989da830a5d997a5a9dd83807ec0f8d593a709"),
    "scaffold/legacy-schema-product-classification-0120/inventory.json": ("1a10ea894aef325a1c98bd4cebb0c6830d1c82f6", 42544, "sha256:aede25f1bf82e42d999fc5f64db1d25854bc7495e414134ffb3104b2af2eb091", 31, "sha256:ec5857912e9b5adb60d976d106286af62796776294a51dcb6a7bdc9cf0bd8842"),
    "scaffold/legacy-source-product-classification-0123/inventory.json": ("05e3c21381b22f84cacd35424fce4c88518a2107", 57071, "sha256:e5ed5144572a60919d4b929395bca50077825cb0f3c66a200ae8dd66871122c4", 59, "sha256:dc2018a31d6a1021d98832a618b625e3df453b843e7ad2df589582ac47f13cf4"),
    "scaffold/legacy-state-db-product-classification-0127/inventory.json": ("f7a3d594669a515da6793d75ed804fa91bcb8638", 36622, "sha256:8c3b31bb74e5b947224c61b5ad4cb1a2578fbebaf65a06c0374105f8123d3c5d", 39, "sha256:c23c7479f3c09ae494a36a4d9864e519a0319c34768e68329437cedeab0c0164"),
    "scaffold/legacy-lint-candidate-product-classification-0128/inventory.json": ("2ed160fdb92bcc9428e80fa526fafb8def663998", 43118, "sha256:be2d6f05f4748183c88eef767814fcb275d025d2cf7d1257a7ca7ea086cbb485", 51, "sha256:a1fe7586b733bfcaae27710f0a0bd8daea56d4e566942828a8efecca426498b4"),
    "scaffold/legacy-runtime-residual-product-classification-0133/inventory.json": ("eed51a0e0a92599ea2e4da159be40ac324e7fa1c", 59563, "sha256:f08c7cddc980144ae8bd9551ecb857b05509b00c0314f1b2b188ff60f419f644", 59, "sha256:b8d304a4abe5c7d0f7764e1367e7ec35c6ab11104bf6691b34cf44ded0256f03"),
}
OPEN_PINS = {
    "2074": ("refs/remotes/origin/pr/2074", "scaffold/legacy-schema-product-classification-0120/inventory.json", "e2b8ace269c2bbe19b5fa6956433a54b1635b1d1", "1a10ea894aef325a1c98bd4cebb0c6830d1c82f6", 42544, "sha256:aede25f1bf82e42d999fc5f64db1d25854bc7495e414134ffb3104b2af2eb091", 31, "sha256:ec5857912e9b5adb60d976d106286af62796776294a51dcb6a7bdc9cf0bd8842"),
    "2078": ("refs/remotes/origin/pr/2078", "scaffold/legacy-implementation-residual-0126/inventory.json", "5322a99b96f75e210c68aa56690f2da4fcb4415c", "d8c1704346b77f24f530402f330d041a4be7d1a0", 76197, "sha256:b95d3a0b85fdc661a0e70fcb35966996ee4d8d28f3a623595b903fa07728267c", 120, "sha256:286a9c9062f2641e4a275bdcc318f75041ef6eb244da160547bc1bd651439826"),
}


def fail(code: str, msg: str) -> None:
    raise AssertionError(f"{code}: {msg}")


def tagged(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def canonical(v: object) -> bytes:
    return json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def row_digest(v: object) -> str:
    return tagged(canonical(v))


def strict_pairs(pairs: list[tuple[str, object]]) -> dict:
    out = {}
    for key, value in pairs:
        if key in out:
            raise ValueError(f"duplicate key {key}")
        out[key] = value
    return out


def local_json(path: Path):
    try:
        return json.loads(path.read_text(), object_pairs_hook=strict_pairs)
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        fail("E_JSON", f"{path}: {exc}")


def local_jsonl(path: Path) -> list[dict]:
    out = []
    for n, line in enumerate(path.read_text().splitlines(), 1):
        if not line.strip():
            continue
        try:
            obj = json.loads(line, object_pairs_hook=strict_pairs)
        except (json.JSONDecodeError, ValueError) as exc:
            fail("E_JSON", f"{path}:{n}: {exc}")
        if not isinstance(obj, dict):
            fail("E_JSON", f"{path}:{n}: object required")
        out.append(obj)
    return out


def git_bytes(path: str) -> bytes:
    try:
        return subprocess.check_output(["git", "show", f"{BASE_REVISION}:{path}"])
    except subprocess.CalledProcessError as exc:
        fail("E_BASE_SOURCE", path)


def git_blob(path: str) -> str:
    try:
        return subprocess.check_output(["git", "rev-parse", f"{BASE_REVISION}:{path}"], text=True).strip()
    except subprocess.CalledProcessError:
        fail("E_BASE_SOURCE", path)


def base_jsonl(path: str) -> list[tuple[int, dict]]:
    out = []
    for n, line in enumerate(git_bytes(path).decode(errors="replace").splitlines(), 1):
        if not line.strip():
            continue
        try:
            obj = json.loads(line, object_pairs_hook=strict_pairs)
        except (json.JSONDecodeError, ValueError) as exc:
            fail("E_JSON", f"{path}:{n}: {exc}")
        if not isinstance(obj, dict):
            fail("E_JSON", f"{path}:{n}: object required")
        out.append((n, obj))
    return out


def receipt(path: str, start: int, end: int) -> dict:
    lines = git_bytes(path).decode(errors="replace").splitlines()
    if start < 1 or end > len(lines) or start > end:
        fail("E_BOUNDARY_ANCHOR", f"{path}:{start}-{end}")
    text = "\n".join(lines[start - 1:end])
    return {"path": path, "line_start": start, "line_end": end, "line_text_sha256": tagged(text.encode()), "line_text": lines[start - 1:end]}


def boundary_expected() -> dict:
    return {"path": BOUNDARY, "blob": git_blob(BOUNDARY), "sha256": tagged(git_bytes(BOUNDARY)), "ranges": [receipt(BOUNDARY, *r) for r in [(36, 39), (54, 65), (86, 89)]]}


def l1_expected() -> dict:
    ranges = {"HELIX-HARNESS": [(22, 35), (54, 58)], "HELIX-OS": [(22, 40), (59, 63)], "HELIX-Web": [(24, 35), (45, 49)], "HELIX-Web-OS": [(14, 23), (37, 44)]}
    return {p: {"path": path, "blob": git_blob(path), "sha256": tagged(git_bytes(path)), "ranges": [receipt(path, *rs) for rs in ranges[p]]} for p, path in L1.items()}


def manifest_sha(path: str) -> str:
    for line in git_bytes(MANIFEST).decode(errors="replace").splitlines():
        if line.endswith(" " + path):
            return "sha256:" + line.split(maxsplit=1)[0]
    fail("E_SOURCE", f"manifest missing {path}")


def expected_source(asset: dict) -> dict:
    path = asset["source_path"]
    archive = ARCHIVE_PREFIX + path
    data = git_bytes(archive)
    lines = data.decode(errors="replace").splitlines()
    line_no = next((i for i, line in enumerate(lines, 1) if line.strip()), 1)
    text = lines[line_no - 1] if lines else ""
    digest = tagged(data)
    return {"archive_path": archive, "source_path": path, "blob": git_blob(archive), "bytes": len(data), "line_count": len(lines), "sha256": digest,
            "ledger_source_sha256": "sha256:" + asset["source_sha256"], "ledger_digest_match": digest == "sha256:" + asset["source_sha256"],
            "archive_manifest_sha256": manifest_sha(path), "archive_manifest_match": digest == manifest_sha(path),
            "semantic_anchor": {"marker": text[:240], "line_start": line_no, "line_end": line_no, "line_text": [text], "line_text_sha256": tagged(text.encode()), "interpretation": "first non-empty JSON configuration line; retained as a static review anchor only", "products_considered": list(PRODUCTS)},
            "read_mode": "git_object_static_read_only"}


def expected_history(asset: dict, disp_line: int, disp: dict, decisions: list[tuple[int, dict]], read_after: list[tuple[int, dict]]) -> dict:
    compact = {"path": DISPOSITION, "line": disp_line, "row_sha256": row_digest(disp), "source_path": disp.get("source_path"), "source_sha256": disp.get("source_sha256"), "disposition": disp.get("disposition"), "asset_class": disp.get("asset_class"), "product_target": disp.get("product_target"), "implementation_status": disp.get("implementation_status"), "consumer_refs": sorted(disp.get("consumer_refs", [])), "decision_record_ref": disp.get("decision_record_ref"), "read_after_record_ref": disp.get("read_after_record_ref")}
    return {"disposition": compact,
            "decisions": [{"path": DECISIONS, "line": n, "row_sha256": row_digest(r), "decision_id": r.get("decision_id"), "product_target": r.get("product_target"), "disposition": r.get("disposition")} for n, r in decisions if r.get("asset_id") == asset["asset_id"]],
            "read_after": [{"path": READ_AFTER, "line": n, "row_sha256": row_digest(r), "read_after_id": r.get("read_after_id"), "result": r.get("result"), "digest_match": r.get("digest_match"), "consumer_match": r.get("consumer_match")} for n, r in read_after if r.get("asset_id") == asset["asset_id"]],
            "failure_consumer_static": {"failure": {"path": FAILURE, "blob": git_blob(FAILURE), "sha256": tagged(git_bytes(FAILURE)), "read_mode": "git_object_static_read_only"}, "consumer": {"path": CONSUMER, "blob": git_blob(CONSUMER), "sha256": tagged(git_bytes(CONSUMER)), "read_mode": "git_object_static_read_only"}},
            "observed_failure_status": "asset_specific_failure_or_degradation_not_established", "consumer_closure_status": "asset-level consumer closure pending; disposition refs and global static inventory retained", "degradation_status": "unknown"}


def expected_targets() -> tuple[list[dict], dict[str, tuple[int, dict]], dict[str, tuple[int, dict]], list[tuple[int, dict]], list[tuple[int, dict]]]:
    phases = base_jsonl(PHASE); phase_by_path = {r.get("source_path"): (n, r) for n, r in phases}
    disp_rows = base_jsonl(DISPOSITION); disp_by_id = {r["asset_id"]: (n, r) for n, r in disp_rows}
    targets = [r for _, r in disp_rows if r.get("source_path", "").startswith("config/")]
    if len(targets) != 41 or len({r["asset_id"] for r in targets}) != 41 or len({r["source_path"] for r in targets}) != 41:
        fail("E_TARGET_SET", "config disposition exact 41 set")
    for asset in targets:
        if asset["source_path"] not in phase_by_path:
            fail("E_TARGET_SET", f"phase missing {asset['source_path']}")
        if phase_by_path[asset["source_path"]][1].get("asset_id") != asset["asset_id"]:
            fail("E_TARGET_SET", f"phase asset mismatch {asset['source_path']}")
    return sorted(targets, key=lambda x: x["source_path"]), phase_by_path, disp_by_id, base_jsonl(DECISIONS), base_jsonl(READ_AFTER)


def ids_from_inventory(obj: dict) -> set[str]:
    ids = obj.get("target_asset_ids")
    if isinstance(ids, list):
        return set(ids)
    ids = obj.get("expected_sets", {}).get("target_asset_ids")
    return set(ids) if isinstance(ids, list) else set()


def id_digest(ids: set[str]) -> str:
    return tagged(("\n".join(sorted(ids))).encode())


def prior_union() -> tuple[set[str], set[str], set[str]]:
    main_sets = []
    for path, (blob, size, digest, count, idsha) in MAIN_PINS.items():
        p = ROOT / path
        try:
            data = p.read_bytes()
        except OSError:
            fail("E_RESEARCH_INPUT", path)
        if len(data) != size or tagged(data) != digest or subprocess.check_output(["git", "rev-parse", f"HEAD:{path}"], text=True).strip() != blob:
            fail("E_RESEARCH_INPUT", f"main snapshot stale {path}")
        obj = local_json(p); ids = ids_from_inventory(obj)
        if len(ids) != count or id_digest(ids) != idsha:
            fail("E_RESEARCH_INPUT", f"main target set stale {path}")
        main_sets.append(ids)
    main_pre = set().union(*(s for path, s in zip(MAIN_PINS, main_sets) if "0120" not in path))
    if len(main_pre) != 399:
        fail("E_RESEARCH_UNION", f"pre-2074-main={len(main_pre)}")
    main = set().union(*main_sets)
    if len(main) != 429:
        fail("E_RESEARCH_UNION", f"current-main={len(main)}")
    opens = []
    for name, (ref, path, commit, blob, size, digest, count, idsha) in OPEN_PINS.items():
        try:
            actual_commit = subprocess.check_output(["git", "rev-parse", ref], text=True).strip()
            data = subprocess.check_output(["git", "show", f"{ref}:{path}"])
            actual_blob = subprocess.check_output(["git", "rev-parse", f"{ref}:{path}"], text=True).strip()
        except subprocess.CalledProcessError:
            fail("E_RESEARCH_INPUT", f"missing open PR snapshot {name}")
        if (actual_commit, actual_blob, len(data), tagged(data)) != (commit, blob, size, digest):
            fail("E_RESEARCH_INPUT", f"open PR snapshot stale {name}")
        obj = json.loads(data, object_pairs_hook=strict_pairs); ids = ids_from_inventory(obj)
        if len(ids) != count or id_digest(ids) != idsha:
            fail("E_RESEARCH_INPUT", f"open target set stale {name}")
        opens.append(ids)
    return main, opens[0], opens[1]


def verify_inventory(inv: dict) -> None:
    if set(inv) != EXPECTED_INV_KEYS:
        fail("E_INVENTORY_SCHEMA", "top-level keys")
    if inv["schema_revision"] != 1 or inv["binding_id"] != BINDING_ID or inv["base_revision"] != BASE_REVISION:
        fail("E_BASE_PIN", "binding/base")
    if inv["base_source_mode"] != "all source, input, and archive evidence bytes from fixed BASE Git objects":
        fail("E_BASE_SOURCE", "source mode")
    if inv["scope"] != "fixed BASE unresolved config/** exact 41 assets after main+PR2074+PR2078 research union":
        fail("E_INVENTORY", "scope")
    if inv["bundle_revision"] != "SCF-B-0141-r1" or inv["research_scope"] != {"source_prefix": "config/", "asset_class": "Historical", "disposition": "unresolved", "artifact_evidence_kind": "configuration", "mode": "research_only", "products": list(PRODUCTS)}:
        fail("E_INVENTORY", "research scope/revision")
    if inv["evidence_completeness"] != {"source_blob_sha_line_anchor": True, "phase_and_implementation_status": True, "missing_evidence_preserved": True, "failure_degradation": "global_static_inventory_and_asset_unknown", "consumer": "global_static_inventory_and_asset_pending", "wave_scan": True}:
        fail("E_INVENTORY", "evidence completeness")
    if inv["classification_rule"] != RULES or inv["artifacts"] != [f"scaffold/bindings/{BINDING_ID}.json", "scaffold/legacy-config-product-classification-0141/README.md", "scaffold/legacy-config-product-classification-0141/PR-DRAFT.md", "scaffold/legacy-config-product-classification-0141/generate.py", "scaffold/legacy-config-product-classification-0141/validate.py", "scaffold/legacy-config-product-classification-0141/selfcheck.py", "scaffold/legacy-config-product-classification-0141/inventory.json", "scaffold/legacy-config-product-classification-0141/classification-research.jsonl"]:
        fail("E_INVENTORY", "rules/artifacts")
    if inv["authority_boundary"] != {"authority_effect": "none", "formal_product_authority": None, "formal_asset_classification_updated": False, "formal_implementation_status": "unknown", "phase_updated": False, "successor_assignment": None, "new_build_allowed": False, "read_mode": "static_git_object_only"}:
        fail("E_AUTHORITY", "authority boundary")
    if inv["old_archive_execution"] != {"source_read": "git show fixed BASE only", "runtime": False, "test": False, "ci": False, "workflow": False, "hook": False, "adapter": False}:
        fail("E_ARCHIVE_EXECUTION", "archive execution declaration")


def verify_inputs(inv: dict) -> None:
    got = inv.get("input_digests")
    if not isinstance(got, list) or [x.get("path") for x in got] != INPUTS or any(set(x) != EXPECTED_INPUT_KEYS for x in got):
        fail("E_INPUT_DIGEST", "input path/key set")
    for item in got:
        data = git_bytes(item["path"])
        expected = {"path": item["path"], "blob": git_blob(item["path"]), "bytes": len(data), "sha256": tagged(data)}
        if item != expected:
            fail("E_INPUT_DIGEST", item["path"])


def expected_wave_links(asset_id: str, target_ids: set[str]) -> list[dict]:
    out = []
    for wave, path in WAVE_PATHS.items():
        for line, edge in base_jsonl(path):
            if edge.get("asset_id") != asset_id:
                continue
            out.append({"wave": wave, "path": path, "line": line, "row_sha256": row_digest(edge), "asset_id": edge.get("asset_id"), "source_path": edge.get("source_path"), "source_sha256": edge.get("source_sha256"), "source_requirement_id": edge.get("source_requirement_id"), "unit_candidate_id": edge.get("unit_candidate_id"), "semantic_link_status": edge.get("semantic_link_status"), "candidate_product_targets": edge.get("candidate_product_targets") or [], "candidate_phase_targets": edge.get("candidate_phase_targets") or [], "product_scope": edge.get("product_scope") or [], "evidence_refs": edge.get("evidence_refs") or [], "counterevidence": edge.get("counterevidence") or []})
    return out


def verify_record(row: dict, asset: dict, phase: dict, disp_line: int, disp: dict, decisions: list[tuple[int, dict]], read_after: list[tuple[int, dict]], target_ids: set[str]) -> None:
    if set(row) != RECORD_KEYS:
        fail("E_RECORD_SCHEMA", asset["asset_id"])
    if row["asset_id"] != asset["asset_id"] or row["source_path"] != asset["source_path"]:
        fail("E_TARGET_SET", asset["asset_id"])
    source = expected_source(asset)
    if set(row["source_exact"]) != SOURCE_KEYS or set(row["source_exact"]["semantic_anchor"]) != ANCHOR_KEYS or row["source_exact"] != source:
        fail("E_SOURCE", asset["asset_id"])
    phase_line = phase.pop("_line")
    phase_digest = row_digest(phase)
    phase_expected = {"path": PHASE, "line": phase_line, "row_sha256": phase_digest, "artifact_evidence_kind": phase.get("artifact_evidence_kind"), "candidate_phase_targets": phase.get("candidate_phase_targets") or [], "candidate_product_targets": phase.get("candidate_product_targets") or [], "phase_classification_status": phase.get("phase_classification_status"), "product_classification_status": phase.get("product_classification_status"), "implementation_evidence_state": phase.get("implementation_evidence_state"), "legacy_implementation_status": phase.get("legacy_implementation_status"), "legacy_execution_performed": phase.get("legacy_execution_performed"), "consumer_closure_status": phase.get("consumer_closure_status"), "unresolved": phase.get("unresolved") or []}
    phase["_line"] = phase_line
    if row["phase_evidence"] != phase_expected or set(row["phase_evidence"]) != PHASE_KEYS:
        fail("E_PHASE", asset["asset_id"])
    disp_expected = {"path": DISPOSITION, "line": disp_line, "row_sha256": row_digest(disp), "source_path": disp.get("source_path"), "source_sha256": disp.get("source_sha256"), "disposition": disp.get("disposition"), "asset_class": disp.get("asset_class"), "product_target": disp.get("product_target"), "implementation_status": disp.get("implementation_status"), "consumer_refs": sorted(disp.get("consumer_refs", [])), "decision_record_ref": disp.get("decision_record_ref"), "read_after_record_ref": disp.get("read_after_record_ref")}
    if row["legacy_asset_evidence"] != disp_expected or set(row["legacy_asset_evidence"]) != DISP_KEYS:
        fail("E_LEDGER", asset["asset_id"])
    products = sorted(set(phase.get("candidate_product_targets") or []))
    if any(p not in PRODUCTS for p in products):
        fail("E_CLASSIFICATION", asset["asset_id"])
    category = "direct_product_basis" if len(products) == 1 else "multi_product_conflict" if len(products) > 1 else "insufficient_basis"
    reason = RULES[category] + ("; the provisional phase candidate remains unresolved and requires human boundary review." if category == "direct_product_basis" else "; retain all candidates and split the unit before any routing decision." if category == "multi_product_conflict" else "; retain the missing candidate evidence for human review.")
    if row["classification"] != {"category": category, "candidate_products": products, "semantic_status": "research_candidate_pending_human_review", "reason": reason}:
        fail("E_CLASSIFICATION", asset["asset_id"])
    if row["boundary_evidence"] != {"product_boundary": boundary_expected(), "l1": l1_expected()}:
        fail("E_BOUNDARY_ANCHOR", asset["asset_id"])
    if row["legacy_history_failure_consumer"] != expected_history(asset, disp_line, disp, decisions, read_after):
        fail("E_HISTORY_CONSUMER", asset["asset_id"])
    implementation = {"artifact_evidence_kind": "configuration", "status": "unknown", "presence": "configuration_present_unexecuted", "unimplemented_evidence": phase.get("unresolved") or ["legacy_implementation_status_unknown"], "legacy_execution_performed": False}
    if row["implementation_evidence"] != implementation:
        fail("E_IMPLEMENTATION", asset["asset_id"])
    wave_links = expected_wave_links(asset["asset_id"], target_ids)
    if any(set(edge) != EDGE_KEYS for edge in row["wave_semantic_links"]) or row["wave_semantic_links"] != wave_links or row["wave_edge_count"] != len(wave_links):
        fail("E_EDGE_SET", asset["asset_id"])
    if row["human_judgment_remaining"] != HUMAN_JUDGMENT or row["authority_effect"] != "none" or row["formal_asset_classification_updated"] is not False or row["new_build_allowed"] is not False:
        fail("E_AUTHORITY", asset["asset_id"])


def verify() -> None:
    try:
        subprocess.check_call(["git", "merge-base", "--is-ancestor", BASE_REVISION, "HEAD"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        fail("E_BASE_NOT_ANCESTOR", BASE_REVISION)
    inv = local_json(INVENTORY); verify_inventory(inv); verify_inputs(inv)
    targets, phase_by_path, disp_by_id, decisions, read_after = expected_targets()
    rows = local_jsonl(LEDGER)
    expected_ids = [a["asset_id"] for a in targets]
    expected_paths = [a["source_path"] for a in targets]
    if len(rows) != 41 or [r.get("asset_id") for r in rows] != expected_ids or [r.get("source_path") for r in rows] != expected_paths or len({r.get("asset_id") for r in rows}) != 41:
        fail("E_TARGET_SET", "records exact set/order")
    if inv["target_count"] != 41 or inv["target_asset_ids"] != expected_ids or inv["target_source_paths"] != expected_paths or inv["target_asset_ids_sha256"] != tagged(("\n".join(expected_ids)).encode()):
        fail("E_TARGET_SET", "inventory exact set")
    if inv["target_artifact_evidence_kinds"] != {"configuration": 41}:
        fail("E_CATEGORY_PARTITION", "artifact kind count")
    for row, asset in zip(rows, targets):
        phase_line, phase = phase_by_path[asset["source_path"]]
        phase_copy = dict(phase); phase_copy["_line"] = phase_line
        verify_record(row, asset, phase_copy, disp_by_id[asset["asset_id"]][0], disp_by_id[asset["asset_id"]][1], decisions, read_after, set(expected_ids))
    counts = Counter(r["classification"]["category"] for r in rows)
    if dict(counts) != {"direct_product_basis": 15, "multi_product_conflict": 11, "insufficient_basis": 15} or inv["classification_counts"] != dict(counts):
        fail("E_CATEGORY_PARTITION", f"counts={dict(counts)}")
    if inv["output_sha256"] != tagged(LEDGER.read_bytes()):
        fail("E_OUTPUT_DIGEST", "ledger digest")
    main, pr2074, pr2078 = prior_union(); target_set = set(expected_ids); union = main | pr2074 | pr2078
    if target_set & main or target_set & pr2074 or target_set & pr2078:
        fail("E_OVERLAP", "config target intersects prior research")
    ru = inv["research_union"]
    expected_ru = {"origin_main_pre_2074_count": 399, "origin_main_current_count": 429, "pr2074_count": 31, "pr2078_count": 120, "union_count": 496, "target_overlap_origin_main_current": 0, "target_overlap_origin_main_pre_2074": 0, "target_overlap_pr2074": 0, "target_overlap_pr2078": 0, "integration_order": "origin/main pre-#2074 (399) -> #2074 merged into main (429) -> #2078 candidate union (496) -> config/41 (537), all /4020", "candidate_denominator_main_pre_2074": 399, "candidate_denominator_current_main": 429, "candidate_denominator_after_pr2078": 496, "candidate_denominator_after_config": 537}
    if ru != expected_ru or len(union) != 496 or len(target_set | union) != 537:
        fail("E_RESEARCH_UNION", "union/denominator declaration")
    if inv["overlap_status"] != {"status": "pass", "target_vs_origin_main_pre_2074": 0, "target_vs_origin_main_current": 0, "target_vs_pr2074": 0, "target_vs_pr2078": 0, "target_vs_union": 0, "union_exact": True}:
        fail("E_OVERLAP", "overlap status declaration")
    if inv["denominator_role"] != {"archive_population": 4020, "origin_main_pre_2074": 399, "origin_main_current": 429, "open_pr_union": 496, "config_target": 41, "integrated_candidate_after_config": 537, "role": "research_candidate_evidence_only; no formal adoption or completion"}:
        fail("E_RESEARCH_UNION", "denominator role declaration")
    # Static Wave scan: input freshness already verifies all 50 snapshots; count
    # and target edge closure are checked independently here.
    edges = 0; target_edges = 0
    for path in WAVE_PATHS.values():
        for _, edge in base_jsonl(path):
            edges += 1
            if edge.get("asset_id") in target_set:
                target_edges += 1
    if inv["wave_scan"] != {"files": 50, "edges": 598, "target_edges": 1, "target_linked_assets": 1} or edges != 598 or target_edges != 1:
        fail("E_EDGE_SET", f"wave={edges}/{target_edges}")
    print("SCF-B-0141 validate PASS records=41 counts={'direct_product_basis': 15, 'multi_product_conflict': 11, 'insufficient_basis': 15} target_edges=1 union=496")


if __name__ == "__main__":
    verify()
