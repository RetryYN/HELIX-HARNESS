#!/usr/bin/env python3
"""Static WR220 source-pointer and expected-preservation audit; no behavior execution."""
import hashlib
import json
import re
import subprocess
from pathlib import Path

BASE = "a53f04482ff883decf1019dc9c212ab712271749"
WR226_FROZEN_BASE = "84c82b5b35f57105b4db7af4e8efe9b530eead88"
ROOT = Path(__file__).resolve().parents[3]
L3 = "docs/helix-os/L3-requirements/functional-requirements.json"
L10 = "docs/helix-os/L10-verification/functional-verification.json"
L4 = "docs/helix-os/L4-basic-design/ticket-workflow-derivation.json"
L7 = "docs/helix-os/L7-function-verification/ticket-workflow-derivation.json"
L9 = "docs/helix-os/L9-integration-verification/ticket-workflow-derivation.json"
COMP = "scaffold/research/wr226-os017-workflow-residual-20261031/comparison.json"
CLASS_ID = "OS017-NEG-workflow-resume-source_unresolved"
WR235_CLASS_IDS = {
    108: "OS017-NEG-workflow-resume-dependency-state-closed-set-source_unresolved",
    127: "OS017-NEG-workflow-resume-level-selected-boolean-selector-source_unresolved",
}
WR226_CASES = {
    57: ("/dependency/source_ref", "/context/dependency/source_ref"),
    59: ("/dependency/requirement_revision", "/context/dependency/requirement_revision"),
    61: ("/dependency/scope", "/context/dependency/scope"),
    63: ("/process/source_ref", "/context/process/source_ref"),
    65: ("/process/revision", "/context/process/revision"),
    67: ("/process/parts", "/context/process/parts"),
    69: ("/process/allowed_edges", "/context/process/allowed_edges"),
    71: ("/process/obligations", "/context/process/obligations"),
    73: ("/process/backflow_ref", "/context/process/backflow_ref"),
    108: ("/dependency/state", "/context/dependency/state"),
    109: ("/dependency/source_ref", "/context/dependency/source_ref"),
    110: ("/dependency/requirement_revision", "/context/dependency/requirement_revision"),
    111: ("/dependency/scope", "/context/dependency/scope"),
    112: ("/proposal/source_ref", "/context/proposal/source_ref"),
    113: ("/proposal/requirement_revision", "/context/proposal/requirement_revision"),
    114: ("/proposal/scope", "/context/proposal/scope"),
    115: ("/proposal/reason_ref", "/context/proposal/reason_ref"),
    116: ("/proposal/parts", "/context/proposal/parts"),
    117: ("/proposal/obligations", "/context/proposal/obligations"),
    127: ("/level_selected", "/context/level_selected"),
}
WR226_CLASS_CASES = set(WR226_CASES) - {108, 127}
WR226_BINDING_OVERLAYS = {
    59: ("dependency", "requirement_revision", "requirement_revision", True),
    61: ("dependency", "scope", "scope", True),
    65: ("process", "revision", "contract_revision", True),
    110: ("dependency", "requirement_revision", "requirement_revision", False),
    111: ("dependency", "scope", "scope", False),
    113: ("proposal", "requirement_revision", "requirement_revision", True),
    114: ("proposal", "scope", "scope", True),
}


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


def pointer_value(value, pointer):
    for token in pointer.lstrip("/").split("/"):
        token = token.replace("~1", "/").replace("~0", "~")
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value


def main():
    l3, l10, l4, l7, l9 = (read(p) for p in (L3, L10, L4, L7, L9))
    comparison = read(COMP)
    assert l3["requirements"][35]["id"] == "HELIXOS-L3-017-F02"
    assert l10["cases"][35]["id"] == "HELIXOS-L10-017-F02"
    cls = next(c for c in l4["failure_classifications"] if c["class_id"] == CLASS_ID)
    overlay_prose = l4["diagnostic_contract"]["algorithm"][0]
    phase_prose = l4["diagnostic_contract"]["algorithm"][1]
    assert "process.revision→context.binding.contract_revision" in overlay_prose
    assert "proposal/dependency/提供levelのrequirement_revision/scope→context.binding" in overlay_prose
    assert "binding5、management12、roles6" in phase_prose
    assert "process.revision→context.binding.contract_revision" not in phase_prose
    class_l4_pointers = next(source["pointers"] for source in cls["source_pointers"] if source["path"] == L4)
    assert "/diagnostic_contract/algorithm/0" in class_l4_pointers
    assert "/diagnostic_contract/algorithm/1" not in class_l4_pointers
    condition = cls["condition"]
    for phrase in (
        "phase=resume", "workflow_material_unknown", "[source_unresolved]",
        "algorithm/2が片側unknown operandを原pointerへsource_unresolved", "algorithm/0 binding overlayは提供process.revision",
        "(code,pointer,return_owner)でdedup", "algorithm/4の派生比較はknown-list条件",
        "algorithm/8はintermediate.backflow_refとcontext.process.backflow_refを比較し",
        "actual process.backflow_refを読まない", "dependency.state closed-set (algorithm/6)",
        "level_selected boolean selector/条件付き読取 (algorithm/5)", "workflow以外のfacetがcorresponding",
        "個別根拠はscaffold比較証跡に置く",
    ):
        assert phrase in condition, f"general L4 class condition omits {phrase}"
    assert "algorithm/1" not in condition
    assert not re.search(r"\bcase\s*\d+|/cases/\d+", condition, flags=re.IGNORECASE)
    assert comparison["blind_derivation"]["sha256"] == "fe7e00049ecaa89b8c36839abe7b29feb17a860ab5b3bddba32c0f26bb44e7f3"
    assert comparison["class_extension_decision"]["decision"] == "extend existing source_unresolved class for 18 cases only; retain cases 108 and 127 as residuals"
    case_evidence = {row["case_index"]: row for row in comparison["cases"]}
    assert set(case_evidence) == set(WR226_CASES)
    wr235 = read("scaffold/research/wr235-os017-residual-rules-20261031/comparison.json")
    wr235_current_pins = {source["path"]: source["sha256"] for source in wr235["compared_sources"]}
    for source in comparison["source_documents"]:
        if source["path"] in (L4, L9):
            frozen = subprocess.check_output(["git", "show", f"{WR226_FROZEN_BASE}:{source['path']}"], cwd=ROOT)
            assert hashlib.sha256(frozen).hexdigest() == source["sha256"]
            assert hashlib.sha256((ROOT / source["path"]).read_bytes()).hexdigest() == wr235_current_pins[source["path"]]
        else:
            assert hashlib.sha256((ROOT / source["path"]).read_bytes()).hexdigest() == source["sha256"]
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
    expected_leaf_pointers = {
        57: "/objects/bb259d855766b3a10b8a60aeff69bea81260c7f8a7eea59be6598ac63ec5a865/source_ref",
        59: "/objects/4d0b9f95142c0162efc200531f58fef3c1ad089192735c2dd7b13a25a720e614/requirement_revision",
        61: "/objects/30aeb63c0363ab75d587ed28dbda3ddf92348e1c6d160bf502eb5180bcf47dd9/scope",
        63: "/objects/a8332408bb1ac7b688afaf8a0bdfd0fc6551473ec5385bd502971049b0a7e2a9/source_ref",
        65: "/objects/56f180204d6b2264e5e96383fa7fcb077cf4a0b32d4b379958fae3692e7373ef/revision",
        67: "/objects/062c09184617e83df872a09cb74b3fbbbc9f874090abd51f74dd18ee02e486da/parts",
        69: "/objects/eb78917c7459b7c889eaa8c14db462cf5b94a1645986806fa26ea2f2f7c977dc/allowed_edges",
        71: "/objects/f953d3d76ca8600e1bbe519a2a100e28cbae56cedc615289680d58a9b700aec6/obligations",
        73: "/objects/8ecbb004122a8fc01dc17be9be708dba5dd93eb9d32de13992b2e8dbcdf0ce79/backflow_ref",
        108: "/objects/e3f4f026e83e5304a4b37a975a182895526ed3d85b49d9426c6e3ccd50375e32/state",
        109: "/objects/bb259d855766b3a10b8a60aeff69bea81260c7f8a7eea59be6598ac63ec5a865/source_ref",
        110: "/objects/4d0b9f95142c0162efc200531f58fef3c1ad089192735c2dd7b13a25a720e614/requirement_revision",
        111: "/objects/30aeb63c0363ab75d587ed28dbda3ddf92348e1c6d160bf502eb5180bcf47dd9/scope",
        112: "/objects/3d087801baef410d56b20718f637498068936828c95e01ac5ecff681408a1dc6/source_ref",
        113: "/objects/492af1f9cbec9d026d16c964abb1ec5cd4b24f10750187ea42ebdbed3fa1d793/requirement_revision",
        114: "/objects/3ecb6705663a99d061b31f60f0aaf5c99364ab3e240bfc5ac9ce8e0a07413a91/scope",
        115: "/objects/db460dddf87f4410f7db5df2b20b5f81708c9cdb125771442c83e155a9d7a173/reason_ref",
        116: "/objects/07f917849bf9cec8ef9e015ca4d92574ecb68ac2f6aeff50324df740cd6351a4/parts",
        117: "/objects/7e7047aafcc550a0f637460e1eedaa09bc4b314e51055121601b0684d8f79f18/obligations",
        127: "/objects/72cc2677414769d5af6457d6d875ff8dab367bb404d2f1bbff579407e34892ee/level_selected",
    }
    l8 = read("docs/helix-os/L8-unit-verification/ticket-workflow-derivation.json")
    base_l8 = git_json(BASE, "docs/helix-os/L8-unit-verification/ticket-workflow-derivation.json")
    base_l9 = git_json(BASE, L9)
    unit_by_source = {row["source_case_pointer"]: row for row in l8["unit_cases"]}
    added_witnesses = []
    leaf_aliases = {}
    binding_overlay_audit = []
    for index, (actual_pointer, context_pointer) in WR226_CASES.items():
        case_pointer = f"/cases/{index}"
        case = l7["cases"][index]
        assert case["id"].startswith("OS017-L8-")
        input_ref = case["given_input_ref"]
        graph = resolve_l7_pointer(l7, input_ref["pointer"])
        expanded_hash = hashlib.sha256(json.dumps(graph, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
        assert expanded_hash == input_ref["canonical_sha256"]
        actual_value = pointer_value(graph, actual_pointer)
        context_value = pointer_value(graph, context_pointer)
        assert (actual_value is None) != (context_value is None), case_pointer
        finding_pointer = actual_pointer if actual_value is None else context_pointer
        leaf_pointer = expected_leaf_pointers[index]
        assert resolve_l7_pointer(l7, leaf_pointer) is None, case_pointer
        leaf_aliases.setdefault(leaf_pointer, []).append(index)
        if index in (63, 65, 67, 69, 71, 73):
            assert isinstance(graph.get("process"), dict) and isinstance(graph.get("context", {}).get("process"), dict), case_pointer
        if index in (112, 113, 114, 115, 116, 117):
            assert graph.get("proposal_selected") is True and graph.get("context", {}).get("proposal_selected") is True, case_pointer
            assert isinstance(graph.get("proposal"), dict) and isinstance(graph.get("context", {}).get("proposal"), dict), case_pointer
        if index in (59, 61, 65, 113, 114):
            assert actual_value is None and context_value is not None, case_pointer
        if index in (110, 111):
            assert context_value is None and actual_value is not None, case_pointer
        declared = next(source["pointers"] for source in cls["source_pointers"] if source["path"] == L7)
        if index in WR226_CLASS_CASES:
            assert case_pointer + "/given_input_ref" in declared
            assert leaf_pointer in declared
        else:
            assert case_pointer + "/given_input_ref" not in declared
            assert leaf_pointer not in declared

        if index in WR226_BINDING_OVERLAYS:
            container, field, binding_field, same_unknown = WR226_BINDING_OVERLAYS[index]
            raw_root = resolve(l7, input_ref["pointer"])
            raw_context = resolve(l7, raw_root["context"]["pointer"])
            actual_operand_pointer = raw_root[container]["pointer"] + "/" + field
            context_operand_pointer = raw_context[container]["pointer"] + "/" + field
            binding_operand_pointer = raw_context["binding"]["pointer"] + "/" + binding_field
            actual_operand = resolve_l7_pointer(l7, actual_operand_pointer)
            context_operand = resolve_l7_pointer(l7, context_operand_pointer)
            binding_operand = resolve_l7_pointer(l7, binding_operand_pointer)
            assert (actual_operand is None) != (context_operand is None), case_pointer
            assert binding_operand is not None, case_pointer
            if same_unknown:
                assert actual_operand is None and context_operand is not None, case_pointer
                assert actual_operand_pointer == leaf_pointer, case_pointer
                assert finding_pointer == actual_pointer, case_pointer
            else:
                assert context_operand is None and actual_operand is not None, case_pointer
                assert context_operand_pointer == leaf_pointer, case_pointer
                assert actual_operand == binding_operand, case_pointer
                assert finding_pointer == context_pointer, case_pointer
            binding_overlay_audit.append({"case_pointer": case_pointer, "actual_operand_pointer": actual_operand_pointer,
                "context_operand_pointer": context_operand_pointer, "binding_operand_pointer": binding_operand_pointer,
                "same_unknown_operand_reused": same_unknown, "actual_value": actual_operand,
                "context_value": context_operand, "binding_value": binding_operand})

        expected = resolve_l7_pointer(l7, case["original_expected_ref"]["pointer"])
        assert expected["condition"] == "workflow_material_unknown"
        assert expected["selected_phase"] == "resume"
        findings = expected["findings"]
        assert findings == [{"code": "source_unresolved", "pointer": finding_pointer, "return_owner": "ticket-workflow-owner"}]
        facets = expected["facet_correspondence"]
        assert facets["workflow"] == "unknown"
        assert all(value == "corresponding" for key, value in facets.items() if key != "workflow")

        evidence = case_evidence[index]
        assert evidence["input_root"]["given_input_pointer"] == input_ref["pointer"]
        assert evidence["input_root"]["given_input_canonical_sha256"] == input_ref["canonical_sha256"]
        assert evidence["raw_leaf"]["raw_object_leaf_pointer"] == leaf_pointer
        assert evidence["raw_leaf"]["resolved_value"] is None
        assert evidence["raw_leaf"]["logical_finding_pointer"] == finding_pointer, (index, evidence["raw_leaf"]["logical_finding_pointer"], finding_pointer)
        blind = evidence["blind_candidate"]
        assert (blind["phase"], blind["facet"], blind["condition"], blind["ordered_findings"], blind["finding_pointer"], blind["return_owner"]) == (
            "resume", "workflow", "workflow_material_unknown", ["source_unresolved"], finding_pointer, "ticket-workflow-owner")
        assert evidence["L7_expected_comparison"]["findings"] == findings
        assert evidence["L7_expected_comparison"]["facet_correspondence"] == facets
        assert evidence["L8_expected_comparison"]["condition"] == unit_by_source[case_pointer]["condition"]
        assert evidence["L8_expected_comparison"]["expected"] == unit_by_source[case_pointer]["expected"]
        if index not in WR235_CLASS_IDS:
            assert evidence["L9_expected_comparison"]["candidate_ref"] == l9["integration_cases"][index].get("l4_source_class_candidate_ref")
        if index in (108, 127):
            assert evidence["candidate_status"].startswith("residual:") and evidence["L4_candidate_ref"] is None
            current_ref = l9["integration_cases"][index].get("l4_source_class_candidate_ref")
            expected_pointer = 5 if index == 108 else 6
            assert current_ref == {"path": L4, "pointer": f"/failure_classifications/{expected_pointer}", "class_id": WR235_CLASS_IDS[index]}
        else:
            assert evidence["candidate_status"].startswith("candidate:")
            assert evidence["L4_candidate_ref"] == {"path": L4, "pointer": "/failure_classifications/4", "class_id": CLASS_ID}

        unit = unit_by_source[case_pointer]
        assert unit["condition"] == expected["condition"]
        assert unit["selected_phase"] == expected["selected_phase"]
        assert unit["expected"] == {"finding_codes": ["source_unresolved"]}
        assert unit["execution_state"] == "not_executed"
        assert unit["original_case_metadata"]["primary_requirement_refs"] == ["HELIXOS-L3-017-F02"]
        current = l9["integration_cases"][index]
        baseline = base_l9["integration_cases"][index]
        for key in ("condition", "selected_phase", "expected", "execution_state", "actual_observation", "primary_requirement_refs"):
            assert current[key] == baseline[key]
        assert current["primary_requirement_refs"] == ["HELIXOS-L3-017-F02"]
        expected_ref = {"path": L4, "pointer": "/failure_classifications/4", "class_id": CLASS_ID}
        if index in WR226_CLASS_CASES:
            assert current["l4_source_class_candidate_ref"] == expected_ref
        elif index in WR235_CLASS_IDS:
            row_index = 5 if index == 108 else 6
            assert current["l4_source_class_candidate_ref"] == {
                "path": L4, "pointer": f"/failure_classifications/{row_index}", "class_id": WR235_CLASS_IDS[index]
            }
        else:
            assert "l4_source_class_candidate_ref" not in current
        for key in ("condition", "selected_phase", "expected", "execution_state"):
            assert unit[key] == base_l8["unit_cases"][index][key]
        added_witnesses.append({"case_pointer": case_pointer, "finding_pointer": finding_pointer})

    artifact_overlays = {row["input_root"]["case_pointer"]: row for row in comparison["cases"] if "algorithm0_binding_overlay" in row}
    assert set(artifact_overlays) == {f"/cases/{i}" for i in WR226_BINDING_OVERLAYS}
    calculated_overlays = {row["case_pointer"]: row for row in binding_overlay_audit}
    for case_pointer, artifact in artifact_overlays.items():
        computed = calculated_overlays[case_pointer]
        overlay = artifact["algorithm0_binding_overlay"]
        assert overlay["l4_rule_pointer"] == "/diagnostic_contract/algorithm/0"
        assert overlay["actual_operand"] == {"pointer": computed["actual_operand_pointer"], "value": computed["actual_value"]}
        assert overlay["context_operand"] == {"pointer": computed["context_operand_pointer"], "value": computed["context_value"]}
        assert overlay["context_binding_operand"] == {"pointer": computed["binding_operand_pointer"], "value": computed["binding_value"]}
        assert overlay["actual_unknown_operand_is_reused"] == computed["same_unknown_operand_reused"]
        assert "source_unresolved" in overlay["same_pointer_dedup_effect"] if computed["same_unknown_operand_reused"] else "no repeat" in overlay["same_pointer_dedup_effect"]
        assert "workflow" in overlay["facet_effect"] and "inputs facet" in overlay["facet_effect"]

    expected_aliases = {
        "/objects/bb259d855766b3a10b8a60aeff69bea81260c7f8a7eea59be6598ac63ec5a865/source_ref": [57, 109],
        "/objects/4d0b9f95142c0162efc200531f58fef3c1ad089192735c2dd7b13a25a720e614/requirement_revision": [59, 110],
        "/objects/30aeb63c0363ab75d587ed28dbda3ddf92348e1c6d160bf502eb5180bcf47dd9/scope": [61, 111],
    }
    assert {pointer: indexes for pointer, indexes in leaf_aliases.items() if len(indexes) > 1} == expected_aliases

    # algorithm/8 compares the intermediate and context process references, not the actual process leaf.
    raw73 = resolve(l7, l7["cases"][73]["given_input_ref"]["pointer"])
    context73 = resolve(l7, raw73["context"]["pointer"])
    actual73 = raw73["process"]["pointer"] + "/backflow_ref"
    context_process73 = context73["process"]["pointer"] + "/backflow_ref"
    intermediate73 = raw73["intermediate"]["pointer"] + "/backflow_ref"
    assert resolve_l7_pointer(l7, actual73) is None
    assert resolve_l7_pointer(l7, context_process73) == "BACKFLOW-A"
    assert resolve_l7_pointer(l7, intermediate73) == "BACKFLOW-A"
    assert len({actual73, context_process73, intermediate73}) == 3

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
    for i in (51, 53, *WR226_CASES):
        for key in ("condition", "selected_phase", "expected", "execution_state", "actual_observation"):
            assert l9["integration_cases"][i][key] == base_l9["integration_cases"][i][key]
    assert l4["failure_classifications"].index(cls) == 4
    assert l4["contracts"][1]["negative_class_refs"] == [CLASS_ID, *WR235_CLASS_IDS.values()]
    assert sum("l4_source_class_candidate_ref" in row for row in l9["integration_cases"]) == 85
    assert sum(row.get("l4_source_class_candidate_ref", {}).get("class_id") == CLASS_ID for row in l9["integration_cases"]) == 20
    assert all(l4["failure_classifications"][i + 5]["class_id"] == class_id for i, class_id in enumerate(WR235_CLASS_IDS.values()))
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
        "l9_expected_fields_unchanged_for_selected_22_cases": True,
        "wr226_witnesses": added_witnesses,
        "l4_class_count": len(l4["failure_classifications"]),
        "l9_source_class_candidate_row_refs": 83,
        "wr226_class_refs": 20,
        "wr226_dedicated_rule_residuals": [108, 127],
        "shared_physical_null_leaf_aliases": {pointer: indexes for pointer, indexes in leaf_aliases.items() if len(indexes) > 1},
        "case73_algorithm8_actual_process_leaf_reused": False,
        "case73_algorithm8_context_backflow_ref": "BACKFLOW-A",
        "case73_algorithm8_intermediate_backflow_ref": "BACKFLOW-A",
        "algorithm0_binding_overlay_cases": binding_overlay_audit,
        "algorithm0_prose_pointer": "/diagnostic_contract/algorithm/0",
        "execution": "none"
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
