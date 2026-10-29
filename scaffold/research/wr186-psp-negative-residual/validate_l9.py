#!/usr/bin/env python3
"""L9向け固定source・pointer・case保持の静的整合確認。predicateは実行しない。"""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = "821a655ad6949b2a7a5344b26e3c170cccc353a6"
RAW_REVISION = "ed3981e7b9419d796adf1981f8990c6b626ecabe"
RAW_PATH = "docs/helix-harness/L9-integration-verification/process-state-port.json"
L3_REVISION = "827c4ea924a15b6b54bbe9d1f5d2f9fbdefa65de"
L3_PATH = "docs/helix-harness/L3-requirements/functional-requirements.json"
L4_PATH = "docs/helix-harness/L4-basic-design/process-state-port.json"
L5_PATH = "docs/helix-harness/L5-detail-design/process-state-port.json"
AUDIT_DIR = Path(__file__).parent
F03_PATH = AUDIT_DIR / "manual-projection-candidates.json"
F05_PATH = AUDIT_DIR / "f05-single-finding-candidates.json"
L9_PATH = ROOT / RAW_PATH


def git_bytes(revision: str, path: str) -> bytes:
    return subprocess.check_output(["git", "-C", str(ROOT), "show", f"{revision}:{path}"])


def resolve(doc, pointer: str):
    value = doc
    for raw in pointer.strip("/").split("/") if pointer else []:
        token = raw.replace("~1", "/").replace("~0", "~")
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value


def by_id(items, item_id):
    matches = [item for item in items if item.get("id") == item_id]
    assert len(matches) == 1, (item_id, len(matches))
    return matches[0]


def l4_classification(l4, pointer: str, code: str):
    row = resolve(l4, pointer)
    assert row["code"] == code
    assert row["expected"]["finding_codes"] == [code]
    return row


def check_l5_concordance(l5, l5_pointer: str, code: str, owner: str):
    """L5 is read only to compare its declared rule with L4-derived data."""
    row = resolve(l5, l5_pointer)
    assert row["code"] == code
    assert row["backflow_owner"] == owner
    return row


def main() -> None:
    f03 = json.loads(F03_PATH.read_text())
    f05 = json.loads(F05_PATH.read_text())
    l9 = json.loads(L9_PATH.read_bytes())
    base_l9 = json.loads(git_bytes(BASE, RAW_PATH))
    fixed_raw_bytes = git_bytes(RAW_REVISION, RAW_PATH)
    fixed_raw = json.loads(fixed_raw_bytes)
    l3 = json.loads((ROOT / L3_PATH).read_text())
    pinned_l3 = json.loads(git_bytes(L3_REVISION, L3_PATH))
    l4 = json.loads(git_bytes(BASE, L4_PATH))
    current_l4 = json.loads((ROOT / L4_PATH).read_text())
    l5 = json.loads((ROOT / L5_PATH).read_text())

    assert hashlib.sha256(fixed_raw_bytes).hexdigest() == f03["fixed_raw_source"]["sha256"]
    assert hashlib.sha256(fixed_raw_bytes).hexdigest() == f05["fixed_source_sha256"]
    assert l9["cases"] == base_l9["cases"], "既存L9 case/expectationがbaseから変化"
    audit = l9["negative_output_projection_audit"]
    assert audit["mode"] == "audit_only_no_checker_marker"
    assert audit["source_population_count"] == 182
    assert audit["case_projection_rows_added"] == 0
    assert audit["manual_projection_candidate_count"] == 14
    assert len(audit["manual_projection_candidates"]) == 14
    assert "scaffold/research/wr186-psp-negative-residual/" not in json.dumps(audit)
    assert "candidate_ref" not in json.dumps(audit)
    fixed_source = f03["fixed_raw_source"]
    assert audit["fixed_raw_source"] == {
        "revision": fixed_source["revision"],
        "path": fixed_source["path"],
        "sha256": fixed_source["sha256"],
        "byte_count": fixed_source["byte_count"],
        "pointer_field": "independent_source_packet.raw_utf8",
    }
    assert audit["l3_candidate_sources"] == {
        "F03": {k: f03["l3_source"][k] for k in ("path", "revision", "pointer")},
        "F05": {k: f05["l3_source"][k] for k in ("path", "revision", "pointer")},
    }
    f05_audit_by_id = {x["case_id"]: x for x in audit["supplemental_candidate_cases"]}
    assert len(f05_audit_by_id) == 8

    f03_group = by_id(l9["cases"], "HARNESS-L9-003-F03")["negative_cases"]
    f05_group = by_id(l9["cases"], "HARNESS-L9-003-F05")["negative_cases"]
    f03_raw_cases = by_id(fixed_raw["verification_obligations"], "HARNESS-L9-003-F03")["negative_cases"]
    f05_raw_cases = by_id(fixed_raw["verification_obligations"], "HARNESS-L9-003-F05")["negative_cases"]
    f03_by_id = {x["id"]: x for x in f03_group}
    f05_by_id = {x["id"]: x for x in f05_group}
    f03_source_by_id = {x["id"]: x for x in f03_raw_cases}
    f05_source_by_id = {x["id"]: x for x in f05_raw_cases}

    assert resolve(pinned_l3, f03["l3_source"]["pointer"]) == resolve(l3, f03["l3_source"]["pointer"])
    assert resolve(pinned_l3, f05["l3_source"]["pointer"]) == resolve(l3, f05["l3_source"]["pointer"])
    f03_l4_contract = resolve(l4, f03["l4_source"]["contract_pointer"])
    f05_l4_contract = resolve(l4, f05["l4_source"]["contract_pointer"])
    assert f03_l4_contract == resolve(current_l4, f03["l4_source"]["contract_pointer"])
    assert f05_l4_contract == resolve(current_l4, f05["l4_source"]["contract_pointer"])
    assert f03["l5_concordance"]["ordered_rule_refs_are_expectation_source"] is False
    assert f05["l5_concordance"]["ordered_rule_refs_are_expectation_source"] is False

    f03_classes = {x["code"]: x for x in f03_l4_contract["negative_classifications"]}
    f05_classes = {x["code"]: x for x in f05_l4_contract["negative_classifications"]}
    f03_refs = f03["rule_sources"]
    f03_audit_by_id = {x["case_id"]: x for x in audit["manual_projection_candidates"]}
    assert len(f03_audit_by_id) == 14
    for code, source in f03_refs.items():
        row = l4_classification(l4, source["l4_classification_pointer"], code)
        assert row == f03_classes[code]
        assert row["backflow_owner"] == source["l4_backflow_owner"]
        check_l5_concordance(l5, source["l5_concordance_rule_pointer"], code, row["backflow_owner"])

    # L5 contracts are read as a concordance only; the L4 class map forms all expected members.
    f03_l5_contract = resolve(l5, f03["l5_concordance"]["pointer"])
    l5_f03_order = [ref.removeprefix("RULE-") for ref in f03_l5_contract["ordered_rule_refs"]]
    assert l5_f03_order == f03["l5_concordance"]["observed_order_not_adopted"]
    f05_l5_contract = resolve(l5, f05["l5_concordance"]["output_contract_pointer"])
    assert {ref.removeprefix("RULE-") for ref in f05_l5_contract["ordered_rule_refs"]} == set(f05_classes)
    for i, code in enumerate(f05_classes):
        check_l5_concordance(l5, f"/failure_rules/{23+i}", code, f05_classes[code]["backflow_owner"])

    seen = set()
    compound_unknown = 0
    for candidate in f03["candidates"]:
        cid = candidate["case_id"]
        seen.add(cid)
        current = f03_by_id[cid]
        historical = f03_source_by_id[cid]
        derivation = candidate["l9_input_derivation"]
        assert current["base_case_ref"] == derivation["base_case_ref"] == historical["base_case_ref"]
        assert resolve(l9, derivation["mutation_pointer"]) == current["mutation"]
        assert resolve(fixed_raw, candidate["raw_source_pointer"]["pointer"]) == historical["independent_source_packet"]["raw_utf8"]
        raw = historical["independent_source_packet"]["raw_utf8"].encode("utf-8")
        assert hashlib.sha256(raw).hexdigest() == candidate["raw_sha256"]
        assert candidate["class_set_semantics"] == "unordered"
        codes = candidate["firing_class_set"]
        assert codes == sorted(codes)
        assert candidate["l4_expected_finding_set"]["codes"] == codes
        assert candidate["l4_expected_finding_set"]["semantics"] == "unordered_set"
        assert candidate["l4_expected_finding_set"]["source_pointers"] == [f03_refs[code]["l4_classification_pointer"] for code in codes]
        assert all(code in f03_classes for code in codes)
        audit_row = f03_audit_by_id[cid]
        assert audit_row["l3_source_pointer"] == {
            "path": f03["l3_source"]["path"],
            "revision": f03["l3_source"]["revision"],
            "pointer": f03["l3_source"]["pointer"],
        }
        raw_source = candidate["raw_source_pointer"]
        assert audit_row["raw_input_source"] == {
            "revision": raw_source["revision"], "path": raw_source["path"],
            "pointer": raw_source["pointer"], "sha256": candidate["raw_sha256"],
        }
        assert audit_row["mutation_pointer"]["path"] == RAW_PATH
        assert resolve(l9, audit_row["mutation_pointer"]["pointer"]) == current["mutation"]
        assert audit_row["candidate_finding_set_semantics"] == "unordered_set"
        assert audit_row["candidate_order_status"] == candidate["l9_output_order"]["status"]
        expected_members = [
            {
                "code": code,
                "return_owner": f03_classes[code]["backflow_owner"],
                "source_pointer": {
                    "path": L4_PATH,
                    "pointer": f03_refs[code]["l4_classification_pointer"],
                },
            }
            for code in codes
        ]
        assert audit_row["candidate_finding_set"] == expected_members
        if len(codes) == 1:
            code = codes[0]
            owner = f03_classes[code]["backflow_owner"]
            expected = {"code": code, "return_owner": owner, "source_pointer": f03_refs[code]["l4_classification_pointer"]}
            assert candidate["l4_singleton_expected"] == expected
            assert candidate["l9_candidate_singleton_output"] == [{"code": code, "return_owner": owner}]
            assert candidate["l9_output_order"]["status"] == "trivial_singleton_from_L4"
            assert "l5_concordance_observed_codes" not in candidate
        else:
            compound_unknown += 1
            assert set(codes) == {"F03_REQUIRED_PAIR_MISSING", "F03_PAIR_SCOPE_CONFLICT"}
            assert candidate["l9_output_order"]["status"] == "unknown"
            assert "l9_candidate_singleton_output" not in candidate
            assert "l9_ordered_findings" not in candidate
            assert candidate["l5_concordance_observed_codes_adopted_as_expected"] is False
            observed = [code for code in l5_f03_order if code in set(codes)]
            assert candidate["l5_concordance_observed_codes"] == observed
    assert len(seen) == 14 and compound_unknown == 3

    f05_seen = set()
    for candidate in f05["candidates"]:
        cid = candidate["case_id"]
        f05_seen.add(cid)
        current = f05_by_id[cid]
        historical = f05_source_by_id[cid]
        packet = historical["independent_source_packet"]
        raw = packet["raw_utf8"].encode("utf-8")
        assert hashlib.sha256(raw).hexdigest() == packet["sha256"] == candidate["raw_sha256"]
        assert resolve(fixed_raw, candidate["l9_raw_pointer"]) == packet["raw_utf8"]
        assert current["base_case_ref"] == historical["base_case_ref"]
        assert resolve(l9, candidate["l9_mutation_pointer"]) == current["mutation"]
        assert candidate["firing_class_set"] == ["F05_REQUIRED_PORT_FIELD_MISSING"]
        assert candidate["not_firing_class_set"] == sorted(set(f05_classes) - set(candidate["firing_class_set"]))
        assert candidate["class_set_semantics"] == "unordered"
        assert candidate["l4_expected_finding_set"] == {
            "semantics":"unordered_set",
            "codes":["F05_REQUIRED_PORT_FIELD_MISSING"],
            "source_pointers":["/contracts/5/negative_classifications/0"],
        }
        owner = f05_classes["F05_REQUIRED_PORT_FIELD_MISSING"]["backflow_owner"]
        assert candidate["l4_singleton_expected"] == {
            "code":"F05_REQUIRED_PORT_FIELD_MISSING","return_owner":owner,
            "source_pointer":"/contracts/5/negative_classifications/0",
        }
        assert candidate["l9_candidate_singleton_output"] == [{"code":"F05_REQUIRED_PORT_FIELD_MISSING","return_owner":owner}]
        assert candidate["l9_output_order"]["status"] == "trivial_singleton_from_L4"
        audit_row = f05_audit_by_id[cid]
        assert audit_row["l3_source_pointer"] == {
            "path": f05["l3_source"]["path"],
            "revision": f05["l3_source"]["revision"],
            "pointer": f05["l3_source"]["pointer"],
        }
        assert audit_row["raw_input_source"] == {
            "revision": f05["fixed_source_revision"],
            "path": f05["fixed_source_path"],
            "pointer": candidate["l9_raw_pointer"],
            "sha256": candidate["raw_sha256"],
        }
        assert audit_row["mutation_pointer"]["path"] == RAW_PATH
        assert audit_row["mutation_pointer"]["pointer"] == candidate["l9_mutation_pointer"].split("#", 1)[-1]
        assert resolve(l9, audit_row["mutation_pointer"]["pointer"]) == current["mutation"]
        assert audit_row["candidate_finding_set_semantics"] == "unordered_set"
        assert audit_row["candidate_order_status"] == "trivial_singleton_from_L4"
        assert audit_row["candidate_finding_set"] == [{
            "code": "F05_REQUIRED_PORT_FIELD_MISSING",
            "return_owner": owner,
            "source_pointer": {
                "path": L4_PATH,
                "pointer": "/contracts/5/negative_classifications/0",
            },
        }]
    assert len(f05_seen) == 8
    assert len(seen | f05_seen) == 22
    print(f"L9 static source/pointer/case checks: PASS; L3/L4-derived_singletons=19; L4_unordered_compounds=3; L5_concordance_only=PASS; inputs=22; population=182; formal_rows=0; marker=off")


if __name__ == "__main__":
    main()
