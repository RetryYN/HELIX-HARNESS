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


def main() -> None:
    f03 = json.loads(F03_PATH.read_text())
    f05 = json.loads(F05_PATH.read_text())
    current_l9_bytes = L9_PATH.read_bytes()
    l9 = json.loads(current_l9_bytes)
    base_l9 = json.loads(git_bytes(BASE, RAW_PATH))
    fixed_raw_bytes = git_bytes(RAW_REVISION, RAW_PATH)
    fixed_raw = json.loads(fixed_raw_bytes)
    l3 = json.loads((ROOT / L3_PATH).read_text())
    pinned_l3 = json.loads(git_bytes(L3_REVISION, L3_PATH))
    l4 = json.loads((ROOT / "docs/helix-harness/L4-basic-design/process-state-port.json").read_text())
    l5 = json.loads((ROOT / "docs/helix-harness/L5-detail-design/process-state-port.json").read_text())

    assert hashlib.sha256(fixed_raw_bytes).hexdigest() == f03["fixed_raw_source"]["sha256"]
    assert hashlib.sha256(fixed_raw_bytes).hexdigest() == f05["fixed_source_sha256"]
    assert l9["cases"] == base_l9["cases"], "既存L9 case/expectationがbaseから変化"
    audit = l9["negative_output_projection_audit"]
    assert audit["mode"] == "audit_only_no_checker_marker"
    assert audit["source_population_count"] == 182
    assert audit["case_projection_rows_added"] == 0
    assert audit["manual_projection_candidate_count"] == 14
    assert len(audit["manual_projection_candidates"]) == 14
    assert audit["supplemental_candidate_manifests"] == [{
        "family": "F05", "candidate_count": 8,
        "path": "scaffold/research/wr186-psp-negative-residual/f05-single-finding-candidates.json",
        "layer_input_pointer_field": "l9_raw_pointer",
        "formal_projection_rows_added": 0,
    }]

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
    assert resolve(l4, f03["l4_source"]["pointer"]) is not None
    assert resolve(l5, f03["l5_source"]["pointer"]) is not None
    assert resolve(l4, f05["l4_source"]["classification_pointer"])["code"] == "F05_REQUIRED_PORT_FIELD_MISSING"
    assert resolve(l5, f05["l5_source"]["rule_pointer"])["code"] == "F05_REQUIRED_PORT_FIELD_MISSING"

    seen = set()
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
        assert candidate["l9_ordered_findings"]
        assert [x["code"] for x in candidate["l9_ordered_findings"]] == candidate["firing_rules"]
    assert len(seen) == 14

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
        assert candidate["firing_rules"] == ["F05_REQUIRED_PORT_FIELD_MISSING"]
        assert candidate["l9_candidate"]["ordered_findings"][0]["code"] == candidate["firing_rules"][0]
    assert len(f05_seen) == 8
    assert len(seen | f05_seen) == 22

    # Candidate-side artifacts contain no other-layer expected/output fields.
    assert all(not any(k.lower().startswith("l8_") for k in c) for c in f03["candidates"])
    assert all(not any(k.lower().startswith("l8_") for k in c) for c in f05["candidates"])
    print(f"L9 static source/pointer/case checks: PASS; independent_inputs={len(seen | f05_seen)}; population=182; formal_rows=0; marker=off")


if __name__ == "__main__":
    main()
