#!/usr/bin/env python3
"""Static WR220 source-pointer and expected-preservation audit; no behavior execution."""
import hashlib
import json
import subprocess
from pathlib import Path

BASE = "a53f04482ff883decf1019dc9c212ab712271749"
ROOT = Path(__file__).resolve().parents[3]
L3 = "docs/helix-os/L3-requirements/functional-requirements.json"
L10 = "docs/helix-os/L10-verification/functional-verification.json"
L4 = "docs/helix-os/L4-basic-design/ticket-workflow-derivation.json"
L7 = "docs/helix-os/L7-function-verification/ticket-workflow-derivation.json"
L9 = "docs/helix-os/L9-integration-verification/ticket-workflow-derivation.json"
CLASS_ID = "OS017-NEG-workflow-resume-source_unresolved"


def read(path):
    return json.loads((ROOT / path).read_text())


def resolve(doc, pointer):
    value = doc
    if pointer == "":
        return value
    for token in pointer.lstrip("/").split("/"):
        token = token.replace("~1", "/").replace("~0", "~")
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value


def resolve_l7_pointer(doc, pointer):
    """Resolve a local JSON pointer and recursively expand local object refs."""
    def expand(value):
        ref_key = "$ref" if isinstance(value, dict) and "$ref" in value else "pointer" if isinstance(value, dict) and "pointer" in value else None
        hash_key = "$sha256" if isinstance(value, dict) and "$sha256" in value else "canonical_sha256" if isinstance(value, dict) and "canonical_sha256" in value else None
        if ref_key and hash_key and value[ref_key].startswith("/objects/"):
            raw = resolve(doc, value[ref_key])
            encoded = json.dumps(raw, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
            return expand(raw)
        if isinstance(value, dict):
            return {k: expand(v) for k, v in value.items()}
        if isinstance(value, list):
            return [expand(v) for v in value]
        return value
    return expand(resolve(doc, pointer))


def git_json(revision, path):
    raw = subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)
    return json.loads(raw)


def main():
    l3, l10, l4, l7, l9 = (read(p) for p in (L3, L10, L4, L7, L9))
    assert l3["requirements"][35]["id"] == "HELIXOS-L3-017-F02"
    assert l10["cases"][35]["id"] == "HELIXOS-L10-017-F02"
    cls = next(c for c in l4["failure_classifications"] if c["class_id"] == CLASS_ID)
    for source in cls["source_pointers"]:
        doc = read(source["path"])
        for pointer in source["pointers"]:
            if source["path"] == L7:
                resolve_l7_pointer(doc, pointer)
            else:
                resolve(doc, pointer)
    leaves = {"/cases/51": "authority", "/cases/53": "resource"}
    actual_leaf_values = {}
    for case_pointer, branch in leaves.items():
        case_idx = int(case_pointer.rsplit("/", 1)[1])
        given_ref = l7["cases"][case_idx]["given_input_ref"]
        raw_ref = given_ref["pointer"]
        assert raw_ref.startswith("/objects/")
        graph = resolve_l7_pointer(l7, raw_ref)
        expanded_hash = hashlib.sha256(json.dumps(graph, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
        assert expanded_hash == given_ref["canonical_sha256"]
        actual_leaf_values[case_pointer] = graph[branch]["source_ref"]
        assert actual_leaf_values[case_pointer] is None
    approved = "5c62d19b78fca3be1964c0cd3157a540950150dc"
    assert l4["contracts"][1]["approved_requirement"]["revision"] == approved
    assert l4["contracts"][1]["requirement_pointer"].endswith("#/requirements/35")
    assert l4["contracts"][1]["system_oracle_pointer"].endswith("#/cases/35")
    for revision in (approved, BASE):
        assert git_json(revision, L3)["requirements"][35] == l3["requirements"][35]
        assert git_json(revision, L10)["cases"][35] == l10["cases"][35]
    l3_bytes = json.dumps(l3["requirements"][35], ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    l10_bytes = json.dumps(l10["cases"][35], ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    admission_subject = subprocess.check_output(["git", "show", "--no-patch", "--format=%s", "2945b75bc5"], cwd=ROOT, text=True).strip()
    assert "#2952" in admission_subject
    base_l9 = git_json(BASE, L9)
    for i in (51, 53):
        for key in ("condition", "selected_phase", "expected", "execution_state", "actual_observation"):
            assert l9["integration_cases"][i][key] == base_l9["integration_cases"][i][key]
    assert l4["contracts"][1]["negative_class_refs"] == [CLASS_ID]
    assert sum("l4_source_class_candidate_ref" in row for row in l9["integration_cases"]) == 65
    print(json.dumps({
        "status": "pass",
        "evidence_kind": "scaffold",
        "authority_effect": "none",
        "source_pointers_resolved": sum(len(x["pointers"]) for x in cls["source_pointers"]),
        "raw_witness_null_leaves": actual_leaf_values,
        "approved_rows_equal_at_5c62_and_base_a53": True,
        "approved_f02_row_sha256": {
            "l3": hashlib.sha256(l3_bytes).hexdigest(),
            "l10": hashlib.sha256(l10_bytes).hexdigest()
        },
        "delegated_admission_merge_commit": "2945b75bc5",
        "delegated_admission_subject": admission_subject,
        "l9_expected_fields_unchanged_for_cases_51_53": True,
        "l4_class_count": len(l4["failure_classifications"]),
        "l9_source_class_candidate_row_refs": 65,
        "execution": "none"
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
