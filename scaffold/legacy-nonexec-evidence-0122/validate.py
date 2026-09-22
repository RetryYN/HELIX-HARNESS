#!/usr/bin/env python3
"""Independent fail-closed validator for SCF-B-0122."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-nonexec-evidence-0122"
BASE_REVISION = "78e23a622bc9c40183269e22a59c566d22b93435"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
CROSSWALK = "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DECOMPOSITION = "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
WAVE_PATHS = {
    n: (f"docs/governance/legacy-requirement-direct-semantic-review-wave{n}.jsonl" if n <= 36 else f"scaffold/legacy-semantic-review-wave{n}/legacy-requirement-direct-semantic-review-wave{n}.jsonl")
    for n in range(1, 51)
}
FAILURE_SOURCE = "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md"
CONSUMER_SOURCE = "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md"
GLOBAL_INPUTS = [
    DISPOSITION, CROSSWALK, DECOMPOSITION, DECISIONS, READ_AFTER, PHASE,
    FAILURE_SOURCE, CONSUMER_SOURCE,
    "docs/governance/legacy-asset-decision-log.md",
    "docs/governance/legacy-asset-reuse-control.md",
    "docs/governance/legacy-requirement-carry-forward-policy.md",
    "docs/governance/legacy-ir-document-source-relation.jsonl",
    "docs/governance/new-generation-start-here.md",
    "archive/legacy-generation-2026-09-14/MANIFEST.sha256",
    "docs/concept/product-boundary.md",
    "docs/helix-harness/L1-planning/product-intent.md",
    "docs/helix-os/L1-planning/system-intent.md",
    "docs/helix-web/L1-planning/product-intent.md",
    "docs/helix-web-os/L1-planning/system-intent.md",
]
ANCHOR_REGEX = re.compile(r"(?:^#{1,4}\s|(?:^|[^A-Za-z])(BR|FR|NFR|TR)-\d+|HIL-(?:BR|FR|NFR|TR)-\d+|acceptance|system[_ -]?test|implementation|failure|degrad|consumer|phase|product|source[_ -]?span|requirement|contract|test)", re.IGNORECASE)
ANCHOR_LIMIT = 32
SELECTOR = {"implementation_status": "non_executable_read_only_source", "asset_class": "RequirementSourceSnapshot", "disposition": "source_snapshot_preservation"}
ACCEPTANCE_ASSETS = {"LEGACY-ASSET-4886CEF2A7AB5B7AA5C8", "LEGACY-ASSET-F7A988C2531DEAC3D23B"}
TOP_LEVEL_KEYS = {
    "acceptance_evidence", "asset_id", "asset_role", "authority_effect", "counter_evidence", "current_implementation",
    "degradation_evidence", "failure_evidence", "history_evidence", "unimplemented_evidence", "legacy_implementation_evidence", "legacy_status",
    "ledger_record", "product_phase_candidates", "requirement_binding", "source_exact", "unit_binding", "unresolved",
}


def fail(code: str, message: str) -> None:
    raise AssertionError(f"{code}: {message}")


def tagged(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def git_bytes(path: str) -> bytes:
    try:
        return subprocess.check_output(["git", "show", f"{BASE_REVISION}:{path}"], cwd=ROOT)
    except subprocess.CalledProcessError as exc:
        fail("E_BASE_SOURCE", f"missing fixed-base object {path}: {exc}")


def git_blob(path: str) -> str:
    try:
        return subprocess.check_output(["git", "rev-parse", f"{BASE_REVISION}:{path}"], cwd=ROOT, text=True).strip()
    except subprocess.CalledProcessError as exc:
        fail("E_BASE_SOURCE", f"missing fixed-base blob {path}: {exc}")


def base_rows(path: str) -> list[tuple[int, dict]]:
    try:
        return [(n, json.loads(line)) for n, line in enumerate(git_bytes(path).decode().splitlines(), 1) if line.strip()]
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        fail("E_BASE_SOURCE", f"invalid JSONL {path}: {exc}")


def local_json(path: Path) -> dict:
    try:
        value = json.loads(path.read_text())
    except (OSError, json.JSONDecodeError) as exc:
        fail("E_SCHEMA", f"cannot read {path}: {exc}")
    if not isinstance(value, dict):
        fail("E_SCHEMA", f"expected object {path}")
    return value


def local_jsonl(path: Path) -> list[dict]:
    try:
        return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]
    except (OSError, json.JSONDecodeError) as exc:
        fail("E_SCHEMA", f"cannot read {path}: {exc}")


def selected_rows() -> list[dict]:
    return [r for _, r in base_rows(DISPOSITION) if all(r.get(k) == v for k, v in SELECTOR.items())]


def input_paths(selected: list[dict]) -> list[str]:
    paths = [*WAVE_PATHS.values(), *GLOBAL_INPUTS]
    for row in selected:
        if row["target_path"] not in paths:
            paths.append(row["target_path"])
    return paths


def source_anchors(data: bytes) -> dict:
    lines = data.decode(errors="replace").splitlines()
    matches = [n for n, line in enumerate(lines, 1) if ANCHOR_REGEX.search(line)]
    selected = matches[:ANCHOR_LIMIT]
    if not selected:
        selected = [n for n, line in enumerate(lines, 1) if line.strip()][:1] or [1]
    return {
        "rule": {"regex": ANCHOR_REGEX.pattern, "flags": ["IGNORECASE"], "limit": ANCHOR_LIMIT, "selection": "first matching lines in source order; first non-empty line fallback", "line_digest": "sha256 of decoded UTF-8 line without newline"},
        "total_matching_lines": len(matches),
        "selected": [{"line": n, "line_text_sha256": tagged(lines[n - 1].encode()), "line_preview": lines[n - 1][:240]} for n in selected],
    }


def audit_search() -> dict:
    selected = selected_rows()
    matches = {}
    for path in (FAILURE_SOURCE, CONSUMER_SOURCE):
        lines = git_bytes(path).decode(errors="replace").splitlines()
        found = []
        for asset in selected:
            for n, line in enumerate(lines, 1):
                if asset["asset_id"] in line or asset["source_path"] in line:
                    found.append({"asset_id": asset["asset_id"], "source_path": asset["source_path"], "line": n, "line_text_sha256": tagged(line.encode()), "line_preview": line[:240]})
        matches[path] = found
    source_meta = [{"path": p, "blob": git_blob(p), "bytes": len(git_bytes(p)), "sha256": tagged(git_bytes(p))} for p in (FAILURE_SOURCE, CONSUMER_SOURCE)]
    return {"sources": source_meta, "match_rule": "selected asset_id or exact source_path substring in fixed-base audit source", "matches": matches, "selected_match_count": sum(len(v) for v in matches.values()), "interpretation": "zero direct asset/path matches is a search observation; it does not prove absence of historical failure or consumer"}


def expected_inputs(selected: list[dict]) -> list[dict]:
    return [{"path": p, "blob": git_blob(p), "bytes": len((data := git_bytes(p))), "sha256": tagged(data)} for p in input_paths(selected)]


def verify_inventory(inventory: dict, evidence_path: Path) -> list[dict]:
    selected = selected_rows()
    if len(selected) != 29:
        fail("E_SELECTION", f"fixed-base selector yielded {len(selected)}, expected 29")
    if inventory.get("schema_revision") != 1 or inventory.get("binding_id") != "SCF-B-0122":
        fail("E_SCHEMA", "inventory schema or binding id mismatch")
    if inventory.get("base_revision") != BASE_REVISION or inventory.get("base_source_mode") != "all ledger/history/crosswalk/Wave/audit and source/target evidence bytes from fixed BASE Git objects":
        fail("E_BASE_PIN", "fixed BASE or source mode drift")
    expected_authority = {"authority_effect": "none", "formal_implementation_claim_updated": False, "formal_degradation_claim_updated": False, "formal_unimplemented_claim_updated": False, "formal_current_implementation_claim_updated": False, "acceptance_verdict_created": False, "new_build_allowed": False, "status_rule": "unknown_when_direct_unit_evidence_is_missing"}
    if inventory.get("authority_boundary") != expected_authority:
        fail("E_AUTHORITY_BOUNDARY", "authority boundary drift")
    paths = input_paths(selected)
    got_inputs = inventory.get("input_digests")
    if not isinstance(got_inputs, list) or [x.get("path") for x in got_inputs] != paths or len({x.get("path") for x in got_inputs}) != len(paths):
        fail("E_INPUT_SET", "input path set/order drift")
    expected = expected_inputs(selected)
    for got, want in zip(got_inputs, expected):
        if got != want:
            fail("E_INPUT_DIGEST", f"fixed-base input digest mismatch {want['path']}")
    if not evidence_path.exists() or inventory.get("output_sha256") != tagged(evidence_path.read_bytes()):
        fail("E_OUTPUT_DIGEST", "evidence output digest mismatch")
    disposition = [r for _, r in base_rows(DISPOSITION)]
    wave_rows = [(n, p, line, row) for n, p in WAVE_PATHS.items() for line, row in base_rows(p)]
    decomposition = [r for _, r in base_rows(DECOMPOSITION)]
    scope = inventory.get("scope")
    selected_ids = {r["asset_id"] for r in selected}
    expected_scope = {"product_units": sum(len(r.get("candidate_units", [])) for r in decomposition), "source_ids": len(decomposition), "wave_files": 50, "wave_edges": len(wave_rows), "wave_unique_assets": len({r["asset_id"] for _, _, _, r in wave_rows}), "legacy_asset_ledger_rows": len(disposition), "selected_assets": len(selected), "selected_wave_edges": sum(1 for _, _, _, r in wave_rows if r.get("asset_id") in selected_ids), "selected_representative_links": 49, "selected_candidate_pool_rows": 868}
    if scope != expected_scope or scope != {"product_units": 218, "source_ids": 153, "wave_files": 50, "wave_edges": 598, "wave_unique_assets": 355, "legacy_asset_ledger_rows": 4020, "selected_assets": 29, "selected_wave_edges": 222, "selected_representative_links": 49, "selected_candidate_pool_rows": 868}:
        fail("E_SCOPE", f"scope drift: expected {expected_scope}, got {scope}")
    expected_selection = {"source": DISPOSITION, "source_row_order": "fixed-base ledger order", "selector": SELECTOR, "selected_asset_ids": [r["asset_id"] for r in selected], "selected_asset_ids_sha256": tagged("\n".join(r["asset_id"] for r in selected).encode()), "excludes_by_rule": "all 4,020 rows not satisfying every selector field; no representative-only sampling", "excluded_scope": {"nonmatching_ledger_rows": len(disposition) - len(selected)}}
    if inventory.get("selection") != expected_selection:
        fail("E_SELECTION", "selection declaration drift")
    expected_anchor = {"regex": ANCHOR_REGEX.pattern, "flags": ["IGNORECASE"], "limit": ANCHOR_LIMIT, "selection": "first matching lines in source order; first non-empty line fallback", "line_digest": "sha256 of decoded UTF-8 line without newline"}
    if inventory.get("anchor_rule") != expected_anchor:
        fail("E_ANCHOR", "anchor rule drift")
    boundaries = inventory.get("search_boundaries")
    expected_boundaries = {"all_product_units": 218, "all_source_ids": 153, "all_wave_edges": 598, "all_wave_unique_assets": 355, "all_ledger_rows": 4020, "crosswalk_fields": ["candidate_asset_pool.phase_and_product_candidate_asset_ids", "representative_legacy_assets", "direct_legacy_asset_links"], "history_fields": ["legacy-asset-decisions.jsonl", "legacy-asset-copy-read-after.jsonl", "legacy-asset-phase-product-classification-bootstrap.jsonl"], "failure_consumer_sources": [FAILURE_SOURCE, CONSUMER_SOURCE], "negative_boundary": "source/design/IR text, candidate product/phase, preservation copy/read-after, Wave semantic relation, and definition-only acceptance assets do not establish old/current implementation, degradation, unimplementation, failure verdict, consumer closure, or acceptance verdict"}
    if boundaries != expected_boundaries:
        fail("E_BOUNDARY", "search boundary declaration drift")
    return selected


def expected_records(selected: list[dict]) -> list[dict]:
    ids = {r["asset_id"] for r in selected}
    phase = {r["asset_id"]: r for _, r in base_rows(PHASE)}
    decisions: dict[str, list[dict]] = defaultdict(list)
    for _, row in base_rows(DECISIONS):
        if row.get("asset_id") in ids:
            decisions[row["asset_id"]].append(row)
    read_after = {r["asset_id"]: r for _, r in base_rows(READ_AFTER) if r.get("asset_id") in ids}
    crosswalk = [r for _, r in base_rows(CROSSWALK)]
    pool: dict[str, list[dict]] = defaultdict(list); reps: dict[str, list[dict]] = defaultdict(list); direct: dict[str, list[dict]] = defaultdict(list)
    for line, row in enumerate(crosswalk, 1):
        for aid in row.get("candidate_asset_pool", {}).get("phase_and_product_candidate_asset_ids", []):
            if aid in ids: pool[aid].append({"line": line, "unit_candidate_id": row["unit_candidate_id"]})
        for field, dest in (("representative_legacy_assets", reps), ("direct_legacy_asset_links", direct)):
            for item in row.get(field, []):
                aid = item if isinstance(item, str) else item.get("asset_id")
                if aid in ids: dest[aid].append({"line": line, "unit_candidate_id": row["unit_candidate_id"], "record": item})
    wave: dict[str, list[dict]] = defaultdict(list)
    for number, path in WAVE_PATHS.items():
        for line, row in base_rows(path):
            if row.get("asset_id") in ids: wave[row["asset_id"]].append({"wave": number, "path": path, "line": line, "record": row})
    audits = audit_search()
    out = []
    for ledger in selected:
        aid = ledger["asset_id"]; pr = phase[aid]; archive = ARCHIVE_PREFIX + ledger["source_path"]; source = git_bytes(archive); target = git_bytes(ledger["target_path"]); wr = wave[aid]; rr = reps[aid]; dr = direct[aid]; poolr = pool[aid]
        source_obj = {"archive_path": archive, "archive_blob": git_blob(archive), "archive_bytes": len(source), "archive_line_count": len(source.decode(errors="replace").splitlines()), "archive_sha256": tagged(source), "ledger_source_sha256": "sha256:" + ledger["source_sha256"], "target_path": ledger["target_path"], "target_blob": git_blob(ledger["target_path"]), "target_bytes": len(target), "target_sha256": tagged(target), "ledger_target_sha256": "sha256:" + ledger["target_sha256"], "target_equals_archive": source == target, "read_mode": "fixed_base_git_object_static_read_only", "anchors": source_anchors(source)}
        req_ids = sorted({x["record"].get("source_requirement_id") for x in wr if x["record"].get("source_requirement_id")})
        out.append({
            "acceptance_evidence": {"status": "definition_only_no_verdict" if aid in ACCEPTANCE_ASSETS else "absent", "verdict": None, "evidence_refs": [], "reason": "acceptance_cases/system_tests are definitions or test descriptions; no executed verdict is directly bound to this asset" if aid in ACCEPTANCE_ASSETS else "no acceptance verdict or acceptance receipt is directly bound to this source snapshot"},
            "asset_id": aid, "asset_role": "non_executable_requirement_source_snapshot", "authority_effect": "none",
            "counter_evidence": [{"kind": "ledger_classification", "record": {k: ledger[k] for k in ("asset_class", "implementation_status", "disposition", "decision_status", "executability_status")}, "reason": "fixed-base ledger calls this a read-only source snapshot and keeps placement pending"}, {"kind": "phase_classification", "record": {k: pr[k] for k in ("artifact_evidence_kind", "implementation_evidence_state", "legacy_execution_performed", "phase_classification_status", "product_classification_status", "consumer_closure_status")}, "reason": "phase/product fields are candidate classification and explicitly do not establish implementation"}, {"kind": "crosswalk_semantics", "wave_edge_count": len(wr), "representative_link_count": len(rr), "direct_link_count": len(dr), "reason": "Wave semantic links and representative/candidate memberships are requirement-source relations, not implementation bindings"}],
            "current_implementation": {"status": "unknown", "evidence_refs": [], "reason": "current target digest proves source preservation only; no current implementation evidence is directly linked"},
            "degradation_evidence": {"status": "unknown", "evidence_refs": [], "reason": "no direct unit-level degradation receipt or decision; source text and candidate classification cannot establish degradation"},
                "unimplemented_evidence": {"status": "unknown", "evidence_refs": [], "reason": "no explicit human unimplemented decision or unit-level absence proof is directly linked"},
            "failure_evidence": {"status": "unknown", "evidence_refs": [], "search": audits, "reason": "no direct selected asset/path match in the fixed-base failure/consumer audit sources; a search miss does not prove no historical failure"},
            "history_evidence": {"phase_record": pr, "decision_records": decisions[aid], "read_after_record": read_after[aid], "consumer_refs": ledger.get("consumer_refs", []), "interpretation": "preservation and pending-carry-forward history; not an implementation or acceptance history"},
            "legacy_implementation_evidence": {"status": "unknown", "evidence_refs": [], "observed_source_kind": pr.get("artifact_evidence_kind"), "reason": "source/design/IR bytes and semantic requirement links describe a contract or preservation state; no direct old implementation execution/acceptance evidence is linked"},
            "legacy_status": {"implementation": "unknown", "degradation": "unknown", "unimplemented": "unknown", "failure": "unknown", "unknown_reasons": ["source snapshot is non-executable", "no direct unit implementation binding", "no direct failure/degradation receipt", "consumer closure remains pending"]},
            "ledger_record": ledger,
            "product_phase_candidates": {"candidate_product_targets": pr.get("candidate_product_targets", []), "candidate_phase_targets": pr.get("candidate_phase_targets", []), "phase_classification_status": pr.get("phase_classification_status"), "product_classification_status": pr.get("product_classification_status"), "interpretation": "candidate product/phase only; no authority or unit assignment"},
            "requirement_binding": {"status": "semantic_source_relation_only" if wr or rr else "absent", "requirement_ids": req_ids, "wave_edge_count": len(wr), "representative_link_count": len(rr), "direct_link_count": len(dr), "reason": "requirement-source relation may be observed, but it does not bind implementation, acceptance, or current behavior"},
            "unit_binding": {"status": "absent", "unit_candidate_ids": [], "candidate_pool_rows": poolr, "candidate_pool_unit_ids": sorted({x["unit_candidate_id"] for x in poolr}), "representative_link_refs": rr, "wave_edge_refs": wr, "direct_link_refs": dr, "candidate_pool_semantics": "bounded_global_search_candidate_only_not_semantic_evidence", "reason": "candidate pool, representative asset, and Wave semantic edge do not prove a unit implementation binding"},
            "source_exact": source_obj,
            "unresolved": ["direct requirement-to-unit semantic binding pending", "old implementation status unknown", "old degradation/failure status unknown", "consumer closure pending", "current implementation status unknown", "acceptance verdict absent", "product/phase authority pending"],
        })
    return out


def validate(bundle: Path) -> None:
    inventory = local_json(bundle / "inventory.json")
    evidence_path = bundle / "evidence.jsonl"
    if subprocess.run(["git", "merge-base", "--is-ancestor", BASE_REVISION, "HEAD"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode:
        fail("E_BASE_NOT_ANCESTOR", f"fixed BASE {BASE_REVISION} is not an ancestor of HEAD")
    selected = verify_inventory(inventory, evidence_path)
    actual = local_jsonl(evidence_path)
    expected = expected_records(selected)
    if len(actual) != 29 or len({x.get("asset_id") for x in actual}) != 29 or [x.get("asset_id") for x in actual] != [x["asset_id"] for x in expected]:
        fail("E_ASSET_SET", "evidence must contain each selected asset exactly once in ledger order")
    for got, want in zip(actual, expected):
        aid = want["asset_id"]
        if set(got) != TOP_LEVEL_KEYS:
            fail("E_SCHEMA", f"top-level evidence key set drift at {aid}")
        if got != want:
            if got.get("ledger_record") != want["ledger_record"]: fail("E_LEDGER_RECORD", f"nested ledger record mismatch at {aid}")
            if got.get("history_evidence") != want["history_evidence"]: fail("E_HISTORY_RECORD", f"phase/decision/read-after record mismatch at {aid}")
            if got.get("source_exact") != want["source_exact"]: fail("E_SOURCE_EVIDENCE", f"archive/current source evidence mismatch at {aid}")
            if got.get("unit_binding") != want["unit_binding"]: fail("E_UNIT_BINDING", f"candidate/unit binding mismatch at {aid}")
            if got.get("failure_evidence") != want["failure_evidence"]: fail("E_FAILURE_EVIDENCE", f"failure search evidence mismatch at {aid}")
            if got.get("legacy_implementation_evidence") != want["legacy_implementation_evidence"]: fail("E_IMPLEMENTATION_EVIDENCE", f"old implementation evidence mismatch at {aid}")
            if got.get("degradation_evidence") != want["degradation_evidence"]: fail("E_DEGRADATION_EVIDENCE", f"degradation evidence mismatch at {aid}")
            if got.get("unimplemented_evidence") != want["unimplemented_evidence"]: fail("E_UNIMPLEMENTED_EVIDENCE", f"unimplemented evidence mismatch at {aid}")
            if got.get("acceptance_evidence") != want["acceptance_evidence"]: fail("E_ACCEPTANCE_EVIDENCE", f"acceptance evidence mismatch at {aid}")
            fail("E_EVIDENCE", f"evidence partition mismatch at {aid}")
    print(f"PASS SCF-B-0122: {len(actual)} non-executable requirement snapshots; old/current implementation, degradation/failure, consumer closure and acceptance remain separated/unknown")


def main() -> int:
    parser = argparse.ArgumentParser(); parser.add_argument("--bundle", type=Path, default=BUNDLE); args = parser.parse_args()
    try: validate(args.bundle.resolve())
    except AssertionError as exc: print(str(exc), file=sys.stderr); return 1
    return 0

if __name__ == "__main__": raise SystemExit(main())
