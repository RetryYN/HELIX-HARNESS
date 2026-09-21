#!/usr/bin/env python3
"""DOC-009 candidate boundaryの陰性自己検査。"""

from __future__ import annotations

import copy
import json
import sys
from pathlib import Path

from validate import validate


HERE = Path(__file__).resolve().parent


def main() -> int:
    errors = validate()
    if errors:
        print("FAIL selfcheck prerequisite")
        for error in errors:
            print("  - " + error)
        return 1
    data = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
    failures: list[str] = []

    # Candidate output must never become authority, acceptance, implementation,
    # successor, or consumer closure merely because validation passed.
    if data.get("authority_effect") != "none":
        failures.append("authority_effect is not none")
    if data.get("meaning_change_applied") is not False:
        failures.append("meaning_change_applied is not false")
    if data.get("successor_requirement_ids") != []:
        failures.append("successor IDs are not empty")
    if data.get("human_decision_ref") is not None:
        failures.append("human decision ref is populated")
    if data.get("legacy_status", {}).get("implementation_status") != "unknown":
        failures.append("legacy implementation status was promoted")
    if data.get("legacy_status", {}).get("consumer_closure_status") != "pending":
        failures.append("consumer closure was promoted")
    if data.get("legacy_status", {}).get("decision_status") != "missing":
        failures.append("decision status was promoted")

    atoms = data.get("atoms", [])
    if any(atom.get("candidate_target") == "HELIX-Web" for atom in atoms):
        failures.append("Web direct target was invented")
    if any(atom.get("candidate_target") == "HELIX-Web-OS" for atom in atoms):
        failures.append("Web-OS direct target was invented")
    if len(data.get("source_line_coverage", {}).get("physical_lines_consumed_once", [])) != 87:
        failures.append("source line coverage is lossy")
    if any(atom.get("legacy_state", {}).get("implementation_status") != "unknown" for atom in atoms):
        failures.append("atom implementation unknown boundary was lost")

    # Mutation probes are in-memory and must be rejected by the actual validator.
    for label, mutation in (
        ("authority disguise", lambda x: x.__setitem__("authority_effect", "current")),
        ("line deletion", lambda x: x["source_line_coverage"].__setitem__("physical_lines_consumed_once", list(range(1, 87)))),
        ("implementation promotion", lambda x: x["legacy_status"].__setitem__("implementation_status", "implemented")),
        ("source revision", lambda x: x["source_document"].__setitem__("source_sha256", "0" * 64)),
        ("source text", lambda x: x["source_spans"][0].__setitem__("exact_source_text", "altered")),
        ("atom target", lambda x: x["atoms"][0].__setitem__("candidate_target", "invented-product")),
        ("phase promotion", lambda x: x["product_phase_classification"].__setitem__("phase_status", "approved")),
        ("consumer closure", lambda x: x["atoms"][0]["legacy_state"].__setitem__("consumer_status", "closed")),
        ("decision promotion", lambda x: x["legacy_status"].__setitem__("decision_status", "approved")),
        ("successor invention", lambda x: x.__setitem__("successor_requirement_ids", ["invented"])),
        ("source holding digest", lambda x: x["ledger_provenance"].__setitem__("source_holding_sha256", "0" * 64)),
        ("reference holding digest", lambda x: x["ledger_provenance"].__setitem__("reference_holding_sha256", "0" * 64)),
        ("asset ledger digest", lambda x: x["ledger_provenance"].__setitem__("asset_ledger_sha256", "0" * 64)),
        ("phase ledger digest", lambda x: x["ledger_provenance"].__setitem__("phase_ledger_sha256", "0" * 64)),
        ("Web owner invention", lambda x: x["atoms"][0]["owner_candidates"].append("HELIX-Web")),
        ("Web-OS owner invention", lambda x: x["atoms"][0]["owner_candidates"].append("HELIX-Web-OS")),
        ("Web direct target invention", lambda x: x["atoms"][0].__setitem__("candidate_target", "HELIX-Web")),
        ("legacy execution promotion", lambda x: x["legacy_status"].__setitem__("legacy_execution_performed", True)),
    ):
        probe = copy.deepcopy(data)
        mutation(probe)
        if not validate(probe):
            failures.append(f"validator accepted {label} mutation")

    if failures:
        print("FAIL selfcheck rdp001-delegated-doc009-atom")
        for failure in failures:
            print("  - " + failure)
        return 1
    print("PASS selfcheck rdp001-delegated-doc009-atom: baseline and 18 mutation probes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
