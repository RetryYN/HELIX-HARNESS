#!/usr/bin/env python3
"""Generate the fixed-base, read-only evidence partition for 29 non-executable requirement snapshots."""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
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
    n: (
        f"docs/governance/legacy-requirement-direct-semantic-review-wave{n}.jsonl"
        if n <= 36
        else f"scaffold/legacy-semantic-review-wave{n}/legacy-requirement-direct-semantic-review-wave{n}.jsonl"
    )
    for n in range(1, 51)
}
FAILURE_SOURCE = "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md"
CONSUMER_SOURCE = "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md"
GLOBAL_INPUTS = [
    DISPOSITION,
    CROSSWALK,
    DECOMPOSITION,
    DECISIONS,
    READ_AFTER,
    PHASE,
    FAILURE_SOURCE,
    CONSUMER_SOURCE,
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

ANCHOR_REGEX = re.compile(
    r"(?:^#{1,4}\s|(?:^|[^A-Za-z])(BR|FR|NFR|TR)-\d+|HIL-(?:BR|FR|NFR|TR)-\d+|"
    r"acceptance|system[_ -]?test|implementation|failure|degrad|consumer|phase|product|"
    r"source[_ -]?span|requirement|contract|test)",
    re.IGNORECASE,
)
ANCHOR_LIMIT = 32
SELECTOR = {
    "implementation_status": "non_executable_read_only_source",
    "asset_class": "RequirementSourceSnapshot",
    "disposition": "source_snapshot_preservation",
}
INVENTORY_TOP_LEVEL_KEYS = {
    "anchor_rule", "authority_boundary", "base_revision", "base_source_mode",
    "binding_id", "bundle_kind", "expected_asset_count", "input_digests",
    "negative_case_codes", "output_sha256", "schema_revision", "scope",
    "search_boundaries", "selection",
}
EXPECTED_BUNDLE_KIND = "research_scaffold_non_executable_requirement_source_evidence_partition"
NEGATIVE_CASE_CODES = [
    "E_SCHEMA", "E_BASE_PIN", "E_BASE_NOT_ANCESTOR", "E_INPUT_SET", "E_INPUT_DIGEST",
    "E_OUTPUT_DIGEST", "E_SCOPE", "E_SELECTION", "E_LEDGER_RECORD", "E_SOURCE_EVIDENCE",
    "E_ANCHOR", "E_BOUNDARY", "E_UNIT_BINDING", "E_IMPLEMENTATION_EVIDENCE",
    "E_DEGRADATION_EVIDENCE", "E_UNIMPLEMENTED_EVIDENCE", "E_FAILURE_EVIDENCE",
    "E_ACCEPTANCE_EVIDENCE", "E_AUTHORITY_BOUNDARY", "E_ASSET_SET", "E_EVIDENCE",
]


def git_bytes(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{BASE_REVISION}:{path}"], cwd=ROOT)


def git_blob(path: str) -> str:
    return subprocess.check_output(["git", "rev-parse", f"{BASE_REVISION}:{path}"], cwd=ROOT, text=True).strip()


def rows(path: str) -> list[tuple[int, dict]]:
    return [(n, json.loads(line)) for n, line in enumerate(git_bytes(path).decode().splitlines(), 1) if line.strip()]


def tagged(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def canonical(value: object) -> str:
    return tagged(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())


def source_anchors(data: bytes) -> list[dict]:
    text = data.decode(errors="replace")
    lines = text.splitlines()
    matches = [n for n, line in enumerate(lines, 1) if ANCHOR_REGEX.search(line)]
    selected = matches[:ANCHOR_LIMIT]
    if not selected:
        selected = [n for n, line in enumerate(lines, 1) if line.strip()][:1] or [1]
    return {
        "rule": {
            "regex": ANCHOR_REGEX.pattern,
            "flags": ["IGNORECASE"],
            "limit": ANCHOR_LIMIT,
            "selection": "first matching lines in source order; first non-empty line fallback",
            "line_digest": "sha256 of decoded UTF-8 line without newline",
        },
        "total_matching_lines": len(matches),
        "selected": [
            {
                "line": n,
                "line_text_sha256": tagged(lines[n - 1].encode()),
                "line_preview": lines[n - 1][:240],
            }
            for n in selected
        ],
    }


def input_paths(selected: list[dict]) -> list[str]:
    paths = [*WAVE_PATHS.values(), *GLOBAL_INPUTS]
    for row in selected:
        if row["target_path"] not in paths:
            paths.append(row["target_path"])
    return paths


def input_digests(paths: list[str]) -> list[dict]:
    return [
        {"path": p, "blob": git_blob(p), "bytes": len((data := git_bytes(p))), "sha256": tagged(data)}
        for p in paths
    ]


def selected_rows(disposition: list[dict]) -> list[dict]:
    return [row for row in disposition if all(row.get(k) == v for k, v in SELECTOR.items())]


def audit_search() -> dict:
    selected = selected_rows([row for _, row in rows(DISPOSITION)])
    matches: dict[str, list[dict]] = {}
    for path in (FAILURE_SOURCE, CONSUMER_SOURCE):
        lines = git_bytes(path).decode(errors="replace").splitlines()
        found = []
        for asset in selected:
            for n, line in enumerate(lines, 1):
                if asset["asset_id"] in line or asset["source_path"] in line:
                    found.append(
                        {
                            "asset_id": asset["asset_id"],
                            "source_path": asset["source_path"],
                            "line": n,
                            "line_text_sha256": tagged(line.encode()),
                            "line_preview": line[:240],
                        }
                    )
        matches[path] = found
    return {
        "sources": [
            {"path": p, "blob": git_blob(p), "bytes": len(git_bytes(p)), "sha256": tagged(git_bytes(p))}
            for p in (FAILURE_SOURCE, CONSUMER_SOURCE)
        ],
        "match_rule": "selected asset_id or exact source_path substring in fixed-base audit source",
        "matches": matches,
        "selected_match_count": sum(len(v) for v in matches.values()),
        "interpretation": "zero direct asset/path matches is a search observation; it does not prove absence of historical failure or consumer",
    }


def source_exact(ledger: dict) -> dict:
    archive_path = ARCHIVE_PREFIX + ledger["source_path"]
    source = git_bytes(archive_path)
    target = git_bytes(ledger["target_path"])
    if tagged(source) != "sha256:" + ledger["source_sha256"]:
        raise SystemExit(f"archive source digest mismatch {ledger['asset_id']}")
    if tagged(target) != "sha256:" + ledger["target_sha256"]:
        raise SystemExit(f"current target digest mismatch {ledger['asset_id']}")
    return {
        "archive_path": archive_path,
        "archive_blob": git_blob(archive_path),
        "archive_bytes": len(source),
        "archive_line_count": len(source.decode(errors="replace").splitlines()),
        "archive_sha256": tagged(source),
        "ledger_source_sha256": "sha256:" + ledger["source_sha256"],
        "target_path": ledger["target_path"],
        "target_blob": git_blob(ledger["target_path"]),
        "target_bytes": len(target),
        "target_sha256": tagged(target),
        "ledger_target_sha256": "sha256:" + ledger["target_sha256"],
        "target_equals_archive": source == target,
        "read_mode": "fixed_base_git_object_static_read_only",
        "anchors": source_anchors(source),
    }


def build() -> None:
    disposition = [r for _, r in rows(DISPOSITION)]
    selected = selected_rows(disposition)
    if len(selected) != 29:
        raise SystemExit(f"expected 29 selected rows, got {len(selected)}")
    selected_ids = {r["asset_id"] for r in selected}
    phase = {r["asset_id"]: r for _, r in rows(PHASE)}
    decision_map: dict[str, list[dict]] = defaultdict(list)
    for _, row in rows(DECISIONS):
        if row.get("asset_id") in selected_ids:
            decision_map[row["asset_id"]].append(row)
    read_after = {r["asset_id"]: r for _, r in rows(READ_AFTER) if r.get("asset_id") in selected_ids}
    crosswalk = [r for _, r in rows(CROSSWALK)]
    pool: dict[str, list[dict]] = defaultdict(list)
    representatives: dict[str, list[dict]] = defaultdict(list)
    direct: dict[str, list[dict]] = defaultdict(list)
    for line, row in enumerate(crosswalk, 1):
        unit = row["unit_candidate_id"]
        for aid in row.get("candidate_asset_pool", {}).get("phase_and_product_candidate_asset_ids", []):
            pool[aid].append({"line": line, "unit_candidate_id": unit})
        for field, dest in (("representative_legacy_assets", representatives), ("direct_legacy_asset_links", direct)):
            for item in row.get(field, []):
                aid = item if isinstance(item, str) else item.get("asset_id")
                if aid in selected_ids:
                    dest[aid].append({"line": line, "unit_candidate_id": unit, "record": item})
    wave: dict[str, list[dict]] = defaultdict(list)
    all_wave = []
    for number, path in WAVE_PATHS.items():
        for line, row in rows(path):
            all_wave.append((number, path, line, row))
            if row.get("asset_id") in selected_ids:
                wave[row["asset_id"]].append({"wave": number, "path": path, "line": line, "record": row})
    audits = audit_search()
    evidence = []
    acceptance_definition_assets = {"LEGACY-ASSET-4886CEF2A7AB5B7AA5C8", "LEGACY-ASSET-F7A988C2531DEAC3D23B"}
    for ledger in selected:
        aid = ledger["asset_id"]
        phase_record = phase.get(aid)
        if not phase_record or len(decision_map[aid]) != 2 or aid not in read_after:
            raise SystemExit(f"incomplete static history for {aid}")
        wave_refs = wave.get(aid, [])
        rep_refs = representatives.get(aid, [])
        direct_refs = direct.get(aid, [])
        pool_refs = pool.get(aid, [])
        evidence.append(
            {
                "acceptance_evidence": {
                    "status": "definition_only_no_verdict" if aid in acceptance_definition_assets else "absent",
                    "verdict": None,
                    "evidence_refs": [],
                    "reason": "acceptance_cases/system_tests are definitions or test descriptions; no executed verdict is directly bound to this asset" if aid in acceptance_definition_assets else "no acceptance verdict or acceptance receipt is directly bound to this source snapshot",
                },
                "asset_id": aid,
                "asset_role": "non_executable_requirement_source_snapshot",
                "authority_effect": "none",
                "counter_evidence": [
                    {"kind": "ledger_classification", "record": {k: ledger[k] for k in ("asset_class", "implementation_status", "disposition", "decision_status", "executability_status")}, "reason": "fixed-base ledger calls this a read-only source snapshot and keeps placement pending"},
                    {"kind": "phase_classification", "record": {k: phase_record[k] for k in ("artifact_evidence_kind", "implementation_evidence_state", "legacy_execution_performed", "phase_classification_status", "product_classification_status", "consumer_closure_status")}, "reason": "phase/product fields are candidate classification and explicitly do not establish implementation"},
                    {"kind": "crosswalk_semantics", "wave_edge_count": len(wave_refs), "representative_link_count": len(rep_refs), "direct_link_count": len(direct_refs), "reason": "Wave semantic links and representative/candidate memberships are requirement-source relations, not implementation bindings"},
                ],
                "current_implementation": {"status": "unknown", "evidence_refs": [], "reason": "current target digest proves source preservation only; no current implementation evidence is directly linked"},
                "degradation_evidence": {"status": "unknown", "evidence_refs": [], "reason": "no direct unit-level degradation receipt or decision; source text and candidate classification cannot establish degradation"},
                "unimplemented_evidence": {"status": "unknown", "evidence_refs": [], "reason": "no explicit human unimplemented decision or unit-level absence proof is directly linked"},
                "failure_evidence": {"status": "unknown", "evidence_refs": [], "search": audits, "reason": "no direct selected asset/path match in the fixed-base failure/consumer audit sources; a search miss does not prove no historical failure"},
                "history_evidence": {"phase_record": phase_record, "decision_records": decision_map[aid], "read_after_record": read_after[aid], "consumer_refs": ledger.get("consumer_refs", []), "interpretation": "preservation and pending-carry-forward history; not an implementation or acceptance history"},
                "legacy_implementation_evidence": {"status": "unknown", "evidence_refs": [], "observed_source_kind": phase_record.get("artifact_evidence_kind"), "reason": "source/design/IR bytes and semantic requirement links describe a contract or preservation state; no direct old implementation execution/acceptance evidence is linked"},
                "legacy_status": {"implementation": "unknown", "degradation": "unknown", "unimplemented": "unknown", "failure": "unknown", "unknown_reasons": ["source snapshot is non-executable", "no direct unit implementation binding", "no direct failure/degradation receipt", "consumer closure remains pending"]},
                "ledger_record": ledger,
                "product_phase_candidates": {"candidate_product_targets": phase_record.get("candidate_product_targets", []), "candidate_phase_targets": phase_record.get("candidate_phase_targets", []), "phase_classification_status": phase_record.get("phase_classification_status"), "product_classification_status": phase_record.get("product_classification_status"), "interpretation": "candidate product/phase only; no authority or unit assignment"},
                "requirement_binding": {"status": "semantic_source_relation_only" if wave_refs or rep_refs else "absent", "requirement_ids": sorted({r["record"].get("source_requirement_id") for r in wave_refs if r["record"].get("source_requirement_id")}), "wave_edge_count": len(wave_refs), "representative_link_count": len(rep_refs), "direct_link_count": len(direct_refs), "reason": "requirement-source relation may be observed, but it does not bind implementation, acceptance, or current behavior"},
                "unit_binding": {"status": "absent", "unit_candidate_ids": [], "candidate_pool_rows": pool_refs, "candidate_pool_unit_ids": sorted({x["unit_candidate_id"] for x in pool_refs}), "representative_link_refs": rep_refs, "wave_edge_refs": wave_refs, "direct_link_refs": direct_refs, "candidate_pool_semantics": "bounded_global_search_candidate_only_not_semantic_evidence", "reason": "candidate pool, representative asset, and Wave semantic edge do not prove a unit implementation binding"},
                "source_exact": source_exact(ledger),
                "unresolved": ["direct requirement-to-unit semantic binding pending", "old implementation status unknown", "old degradation/failure status unknown", "consumer closure pending", "current implementation status unknown", "acceptance verdict absent", "product/phase authority pending"],
            }
        )
    BUNDLE.mkdir(parents=True, exist_ok=True)
    evidence_path = BUNDLE / "evidence.jsonl"
    evidence_path.write_text("".join(json.dumps(x, ensure_ascii=False, sort_keys=True) + "\n" for x in evidence))
    wave_count = len(all_wave)
    decomposition = [r for _, r in rows(DECOMPOSITION)]
    inventory = {
        "schema_revision": 1,
        "binding_id": "SCF-B-0122",
        "bundle_kind": EXPECTED_BUNDLE_KIND,
        "base_revision": BASE_REVISION,
        "base_source_mode": "all ledger/history/crosswalk/Wave/audit and source/target evidence bytes from fixed BASE Git objects",
        "authority_boundary": {"authority_effect": "none", "formal_implementation_claim_updated": False, "formal_degradation_claim_updated": False, "formal_unimplemented_claim_updated": False, "formal_current_implementation_claim_updated": False, "acceptance_verdict_created": False, "new_build_allowed": False, "status_rule": "unknown_when_direct_unit_evidence_is_missing"},
        "scope": {"product_units": sum(len(r.get("candidate_units", [])) for r in decomposition), "source_ids": len(decomposition), "wave_files": 50, "wave_edges": wave_count, "wave_unique_assets": len({r["asset_id"] for _, _, _, r in all_wave}), "legacy_asset_ledger_rows": len(disposition), "selected_assets": len(selected), "selected_wave_edges": sum(len(v) for v in wave.values()), "selected_representative_links": sum(len(v) for v in representatives.values()), "selected_candidate_pool_rows": sum(len(pool.get(aid, [])) for aid in selected_ids)},
        "selection": {"source": DISPOSITION, "source_row_order": "fixed-base ledger order", "selector": SELECTOR, "selected_asset_ids": [r["asset_id"] for r in selected], "selected_asset_ids_sha256": tagged("\n".join(r["asset_id"] for r in selected).encode()), "excludes_by_rule": "all 4,020 rows not satisfying every selector field; no representative-only sampling", "excluded_scope": {"nonmatching_ledger_rows": len(disposition) - len(selected)}},
        "anchor_rule": {"regex": ANCHOR_REGEX.pattern, "flags": ["IGNORECASE"], "limit": ANCHOR_LIMIT, "selection": "first matching lines in source order; first non-empty line fallback", "line_digest": "sha256 of decoded UTF-8 line without newline"},
        "search_boundaries": {"all_product_units": 218, "all_source_ids": 153, "all_wave_edges": wave_count, "all_wave_unique_assets": len({r["asset_id"] for _, _, _, r in all_wave}), "all_ledger_rows": len(disposition), "crosswalk_fields": ["candidate_asset_pool.phase_and_product_candidate_asset_ids", "representative_legacy_assets", "direct_legacy_asset_links"], "history_fields": ["legacy-asset-decisions.jsonl", "legacy-asset-copy-read-after.jsonl", "legacy-asset-phase-product-classification-bootstrap.jsonl"], "failure_consumer_sources": [FAILURE_SOURCE, CONSUMER_SOURCE], "negative_boundary": "source/design/IR text, candidate product/phase, preservation copy/read-after, Wave semantic relation, and definition-only acceptance assets do not establish old/current implementation, degradation, unimplementation, failure verdict, consumer closure, or acceptance verdict"},
        "input_digests": input_digests(input_paths(selected)),
        "expected_asset_count": 29,
        "negative_case_codes": NEGATIVE_CASE_CODES,
        "output_sha256": "",
    }
    inventory_path = BUNDLE / "inventory.json"
    inventory_path.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n")
    inventory["output_sha256"] = tagged(evidence_path.read_bytes())
    inventory_path.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    build()
