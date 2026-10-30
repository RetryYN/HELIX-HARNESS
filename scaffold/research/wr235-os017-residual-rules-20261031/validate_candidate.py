#!/usr/bin/env python3
"""Static WR235 L4/L9 source-candidate and expectation-preservation audit."""
import hashlib
import json
import subprocess
import copy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = "84c82b5b35f57105b4db7af4e8efe9b530eead88"
BLIND_SHA = "c6bbbc3ec5a1fa3712380e1b0398e64f077df058f829f1525bce2bb22f2f9a88"
L3 = "docs/helix-os/L3-requirements/functional-requirements.json"
L10 = "docs/helix-os/L10-verification/functional-verification.json"
L4 = "docs/helix-os/L4-basic-design/ticket-workflow-derivation.json"
L5 = "docs/helix-os/L5-detail-design/ticket-workflow-derivation.json"
L7 = "docs/helix-os/L7-function-verification/ticket-workflow-derivation.json"
L8 = "docs/helix-os/L8-unit-verification/ticket-workflow-derivation.json"
L9 = "docs/helix-os/L9-integration-verification/ticket-workflow-derivation.json"
HERE = "scaffold/research/wr235-os017-residual-rules-20261031"
IDS = {
    108: "OS017-NEG-workflow-resume-dependency-state-closed-set-source_unresolved",
    127: "OS017-NEG-workflow-resume-level-selected-boolean-selector-source_unresolved",
}


def read(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def resolve(doc, pointer):
    value = doc
    for token in pointer.lstrip("/").split("/"):
        token = token.replace("~1", "/").replace("~0", "~")
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value


def expand(doc, value):
    if isinstance(value, dict) and value.get("pointer", "").startswith("/objects/") and "canonical_sha256" in value:
        return expand(doc, resolve(doc, value["pointer"]))
    if isinstance(value, dict):
        return {key: expand(doc, child) for key, child in value.items()}
    if isinstance(value, list):
        return [expand(doc, child) for child in value]
    return value


def main():
    blind_path = ROOT / f"{HERE}/source-only.json"
    assert hashlib.sha256(blind_path.read_bytes()).hexdigest() == BLIND_SHA
    audit = read(f"{HERE}/comparison.json")
    assert audit["blind_artifact"]["sha256"] == BLIND_SHA
    # Binding upstreams must stay outside scaffold/. Historical scaffold pins are
    # retained as verification oracles and verified against the exact artifacts.
    migration = audit["binding_upstream_migration"]
    assert set(migration["bindings"]) == {"0181", "0184", "0189", "0190", "0194", "0195"}
    for binding_id, history in migration["bindings"].items():
        binding = read(f"scaffold/bindings/SCF-B-{binding_id}.json")
        assert all(not item["path"].startswith("scaffold/") for item in binding["upstream"])
        prior_sha = history["prior_binding_sha256"]
        assert len(prior_sha) == 64
        if history["scaffold_upstream"]:
            assert prior_sha != hashlib.sha256((ROOT / f"scaffold/bindings/SCF-B-{binding_id}.json").read_bytes()).hexdigest()
        for old_ref in history["scaffold_upstream"]:
            path, digest = old_ref["path"], old_ref["sha256"]
            assert path.startswith("scaffold/") and len(digest) == 64
            pin = f"WR235 retained source pin from former upstream {path}; sha256={digest}"
            assert pin in binding["verification"]["oracles"]
            current_digest = hashlib.sha256((ROOT / path).read_bytes()).hexdigest()
            if path in history["current_artifact_sha256"]:
                assert history["current_artifact_sha256"][path] == current_digest
            else:
                assert path == f"{HERE}/comparison.json"  # its current digest is pinned externally by SCF-B-0195
            current_pin = f"WR235 current artifact SHA-256 {path}: {current_digest}"
            assert current_pin in binding["verification"]["oracles"]
    l3, l10, l4, l5, l7, l8, l9 = (read(p) for p in (L3, L10, L4, L5, L7, L8, L9))
    base_l4, base_l9 = (
        json.loads(subprocess.check_output(["git", "show", f"{BASE}:{p}"], cwd=ROOT)) for p in (L4, L9)
    )
    for fixed_path in (
        "scaffold/research/wr226-os017-workflow-residual-20261031/README.md",
        "scaffold/research/wr226-os017-workflow-residual-20261031/comparison.json",
    ):
        frozen = subprocess.check_output(["git", "show", f"{BASE}:{fixed_path}"], cwd=ROOT)
        assert hashlib.sha256(frozen).hexdigest() == hashlib.sha256((ROOT / fixed_path).read_bytes()).hexdigest()
    for p in (L7, L8):
        original = subprocess.check_output(["git", "show", f"{BASE}:{p}"], cwd=ROOT)
        assert original == (ROOT / p).read_bytes(), f"expected source mutated: {p}"
    original_l9 = json.loads(subprocess.check_output(["git", "show", f"{BASE}:{L9}"], cwd=ROOT))
    for old, current in zip(original_l9["integration_cases"], l9["integration_cases"]):
        assert {k: v for k, v in old.items() if k != "l4_source_class_candidate_ref"} == {
            k: v for k, v in current.items() if k != "l4_source_class_candidate_ref"
        }

    assert l3["requirements"][35]["id"] == "HELIXOS-L3-017-F02"
    assert l10["cases"][35]["id"] == "HELIXOS-L10-017-F02"
    assert l3["requirements"][35]["oracle_ref"] == "HELIXOS-L10-017-F02"
    assert l7["cases"][108]["source_case_pointer"] == "/cases/108"
    assert l7["cases"][127]["source_case_pointer"] == "/cases/127"

    rows = l4["failure_classifications"]
    assert rows[:5] == base_l4["failure_classifications"][:5]
    assert len(rows) == 7
    normalized_l4 = copy.deepcopy(l4)
    normalized_l4["failure_classifications"] = normalized_l4["failure_classifications"][:5]
    normalized_l4["contracts"][1]["negative_class_refs"] = base_l4["contracts"][1]["negative_class_refs"]
    assert normalized_l4 == base_l4, "L4 changed outside the two WR235 rows and F02 reverse refs"
    assert [rows[i]["class_id"] for i in (5, 6)] == [IDS[108], IDS[127]]
    assert l4["contracts"][1]["negative_class_refs"] == [
        "OS017-NEG-workflow-resume-source_unresolved", IDS[108], IDS[127]
    ]
    for n, row_index, rule_pointer, exact_leaf in (
        (108, 5, "/diagnostic_contract/algorithm/6", "/objects/e3f4f026e83e5304a4b37a975a182895526ed3d85b49d9426c6e3ccd50375e32/state"),
        (127, 6, "/diagnostic_contract/algorithm/5", "/objects/72cc2677414769d5af6457d6d875ff8dab367bb404d2f1bbff579407e34892ee/level_selected"),
    ):
        row = rows[row_index]
        assert row["code"] == "workflow_material_unknown"
        assert row["expected_classification"] == "workflow_material_unknown"
        assert row["expected"] == {"finding_codes": ["source_unresolved"]}
        assert (row["expected_axis"], row["expected_state"], row["backflow_owner"], row["side_effect_count"]) == (
            "workflow", "unknown", "ticket-workflow-owner", 0
        )
        ptrs = next(s["pointers"] for s in row["source_pointers"] if s["path"] == L4)
        assert rule_pointer in ptrs and "/failure_classifications/4" in ptrs
        assert any(exact_leaf == p or p == f"/cases/{n}/given_input_ref" for s in row["source_pointers"] if s["path"] == L7 for p in s["pointers"])
        assert "global member" in row["condition"] and "unknown" in row["condition"]
        assert "class key" in row["condition"]
        assert row["design_ref"] == "HELIXOS-L4-017-F02"
        assert l9["integration_cases"][n]["l4_source_class_candidate_ref"] == {
            "path": L4, "pointer": f"/failure_classifications/{row_index}", "class_id": IDS[n]
        }
        assert l9["integration_cases"][n]["source_case_pointer"] == f"/cases/{n}"

    # Confirm the two rule boundaries and their raw operands without running either algorithm.
    assert "closed set" in rows[5]["condition"] and "algorithm/5" in rows[5]["condition"]
    assert "actual stateがresolved" in rows[5]["condition"]
    assert "missing/failed/conflict/stale/issue_closed" in rows[5]["condition"]
    assert "dependency_not_resolved" in rows[5]["condition"] and "dependency_unresolved" in rows[5]["condition"]
    assert "boolean selector" in rows[6]["condition"] and "algorithm/6" in rows[6]["condition"]
    assert "actual selectorがunknown" in rows[6]["condition"]
    assert "context selectorがknown boolean" in rows[6]["condition"]
    assert "context-side unknown selector" in rows[6]["condition"]
    assert "actual selectorがtrueでないので" in rows[6]["condition"]
    for n, expected_ptr in ((108, "/context/dependency/state"), (127, "/level_selected")):
        source = l7["cases"][n]
        raw = expand(l7, source["given_input_ref"])
        exp = expand(l7, source["original_expected_ref"])
        assert exp["condition"] == "workflow_material_unknown"
        assert exp["selected_phase"] == "resume"
        assert exp["facet_correspondence"] == {
            "ownership": "corresponding", "inputs": "corresponding", "ticket": "corresponding",
            "workflow": "unknown", "backflow": "corresponding", "continuity": "corresponding",
            "scope_limit": "corresponding"
        }
        assert exp["findings"] == [{"code": "source_unresolved", "pointer": expected_ptr, "return_owner": "ticket-workflow-owner"}]
        assert all(exp[key] is False for key in (
            "actual_ticket_written", "actual_workflow_started", "actual_assignment_issued",
            "actual_backflow_applied", "actual_resume_executed", "whole_workflow_verified"
        ))
        unit = l8["unit_cases"][n]
        integration = l9["integration_cases"][n]
        for candidate in (unit, integration):
            assert candidate["condition"] == exp["condition"]
            assert candidate["selected_phase"] == exp["selected_phase"]
            assert candidate["expected"] == {"finding_codes": ["source_unresolved"]}
            assert candidate["execution_state"] == "not_executed"
        assert integration["primary_requirement_refs"] == ["HELIXOS-L3-017-F02"]
        if n == 108:
            assert raw["dependency"]["state"] == "resolved"
            assert raw["context"]["dependency"]["state"] is None
            assert raw["context"]["dependency"]["source_ref"] == raw["dependency"]["source_ref"]
        else:
            assert raw["level_selected"] is None
            assert raw["context"]["level_selected"] is False
            assert raw["level"] is None
            assert "context-side unknown selector" in rows[6]["condition"]
        comparison_row = next(x for x in audit["cases"] if x["case"] == n)
        assert comparison_row["l7_expected"]["findings"] == exp["findings"]

    for pin in audit["compared_sources"]:
        path = ROOT / pin["path"]
        assert hashlib.sha256(path.read_bytes()).hexdigest() == pin["sha256"]
        document = read(pin["path"]) if pin["path"].endswith(".json") else None
        if document is not None:
            for pointer in pin["pointers"]:
                resolve(document, pointer)

    # Preserve the existing class source refs while recording these two as unmarked candidates.
    assert len([x for x in l9["integration_cases"] if "l4_source_class_candidate_ref" in x]) == 85
    assert all("negative_class_ref" not in l9["integration_cases"][n] for n in IDS)
    assert "negative_equivalence_classes" not in l4 and "negative_equivalence_classes" not in l9
    assert l4["failure_classifications"][:5] == base_l4["failure_classifications"][:5]
    assert all(a[k] == b[k] for n in IDS for a, b in [(l9["integration_cases"][n], base_l9["integration_cases"][n])] for k in ("condition", "selected_phase", "expected", "execution_state", "actual_observation", "primary_requirement_refs"))
    assert audit["class_review"]["formal_class_identity"].startswith("unknown;")
    assert audit["class_review"]["singleton"].startswith("not established;") or audit["class_review"]["singleton"].startswith("not established ")
    print(json.dumps({"status":"pass","cases":[108,127],"candidate_classes":2,"formal_membership":False,"singleton_success":False,"expected_files_unchanged":True,"execution":"none"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
