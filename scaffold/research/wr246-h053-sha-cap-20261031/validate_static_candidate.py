#!/usr/bin/env python3
"""Static, read-only validation of WR246 subject digest row mapping."""
import hashlib
import copy
import json
import pathlib
import subprocess

BASE = "03141af4af6c5c3d9dc1f1bf075f29d96928d0f7"
L8 = "docs/helix-harness/L8-unit-verification/semantic-asset-lineage.json"
L5 = "docs/helix-harness/L5-detail-design/semantic-asset-lineage.json"
QA = "docs/governance/design-verification-quality-assurance.md"
ARTIFACT = pathlib.Path("scaffold/research/wr246-h053-sha-cap-20261031/subject-sha-mapping.json")


def require(ok, message):
    if not ok:
        raise SystemExit("FAIL: " + message)


def base_bytes(path):
    return subprocess.check_output(["git", "show", f"{BASE}:{path}"])


def parse(data, path):
    try:
        return json.loads(data)
    except Exception as exc:
        raise SystemExit(f"FAIL: invalid JSON {path}: {exc}")


def walk(x, pointer=""):
    if isinstance(x, dict):
        yield pointer, x
        for key, value in x.items():
            escaped = str(key).replace("~", "~0").replace("/", "~1")
            yield from walk(value, pointer + "/" + escaped)
    elif isinstance(x, list):
        for index, value in enumerate(x):
            yield from walk(value, pointer + "/" + str(index))


artifact = parse(ARTIFACT.read_bytes(), str(ARTIFACT))
base_l8_bytes = base_bytes(L8)
base_l5_bytes = base_bytes(L5)
base_qa_bytes = base_bytes(QA)
current_l8_bytes = pathlib.Path(L8).read_bytes()
current_l5_bytes = pathlib.Path(L5).read_bytes()
require(hashlib.sha256(base_l8_bytes).hexdigest() == artifact["source_files"][L8]["sha256"], "base L8 SHA mismatch")
require(hashlib.sha256(base_l5_bytes).hexdigest() == artifact["source_files"][L5]["sha256"], "base L5 SHA mismatch")
require(hashlib.sha256(base_qa_bytes).hexdigest() == artifact["source_files"][QA]["sha256"], "base QA SHA mismatch")
require(current_l5_bytes == base_l5_bytes, "formal L5 changed from fixed base")

l8 = parse(base_l8_bytes, L8)
l5 = parse(base_l5_bytes, L5)
candidate_l8 = parse(current_l8_bytes, L8)
rows = artifact["rows"]
require(len(rows) == 30, f"expected 30 source rows, found {len(rows)}")
require(len({row["row_id"] for row in rows}) == 30, "row IDs are not unique")
expected_cases = {f"HARNESS-L8-053-ADD-{n}" for n in range(22, 28)}
require({row["l8_case_id"] for row in rows} == expected_cases, "case set differs from ADD-22..27")

for row in rows:
    case_idx = int(row["l8_case_pointer"].rsplit("/", 1)[1])
    case = l8["additional_unit_cases"][case_idx]
    require(case["id"] == row["l8_case_id"], f"case pointer mismatch {row['row_id']}")
    require(case["branch"] == row["branch"], f"branch changed {row['row_id']}")
    q = case["typed_input"]["validated_input"]["input"]["qualifications"][row["qualification_index"]]
    require(q["qualification_ref"] == row["qualification_ref"], f"qualification Ref changed {row['row_id']}")
    require(q["subject_ref"] == row["subject_ref"], f"subject Ref changed {row['row_id']}")
    require(q["subject_sha256"] == row["subject_sha256_value"], f"subject digest changed {row['row_id']}")
    require(q["subject_sha256"] == q["subject_ref"]["sha256"], f"subject Ref relation mismatch {row['row_id']}")
    same_refs = []
    same_envelopes = []
    for pointer, value in walk(case["typed_input"]):
        source_ref = value.get("source_ref")
        if not isinstance(source_ref, dict) or source_ref.get("identity") != q["subject_ref"]["identity"]:
            continue
        same_refs.append({"pointer": f"/additional_unit_cases/{case_idx}/typed_input{pointer}/source_ref", "sha256": source_ref["sha256"]})
        if isinstance(value.get("content_bytes"), str):
            body_sha = hashlib.sha256(value["content_bytes"].encode()).hexdigest()
            same_envelopes.append({"pointer": f"/additional_unit_cases/{case_idx}/typed_input{pointer}", "source_ref_sha256": source_ref["sha256"], "content_bytes_sha256": body_sha, "source_ref_matches_content": body_sha == source_ref["sha256"]})
    require(same_refs == row["same_identity_source_refs"], f"same-identity source_ref mapping mismatch {row['row_id']}")
    require(same_envelopes == row["same_identity_source_envelopes"], f"same-identity envelope mapping mismatch {row['row_id']}")

# Confirm U-ID source has a function reference and independent expected fields,
# but do not manufacture the absent test citation.
for case_id in expected_cases:
    case = next(x for x in l8["additional_unit_cases"] if x["id"] == case_id)
    require("function_ref" in case and "expected" in case and "expected_comparison" in case, f"expected/oracle context missing {case_id}")
    require("test_citation" not in case, f"unexpected test citation requires review: {case_id}")
    candidate_case = next(x for x in candidate_l8["additional_unit_cases"] if x["id"] == case_id)
    require(candidate_case.get("branch") == case.get("branch"), f"candidate branch changed {case_id}")
    require(candidate_case.get("function_ref") == case.get("function_ref"), f"candidate function_ref changed {case_id}")
    require(candidate_case.get("expected") == case.get("expected"), f"candidate expected changed {case_id}")
    require(candidate_case.get("expected_comparison") == case.get("expected_comparison"), f"candidate expected_comparison changed {case_id}")
    require("test_citation" not in candidate_case, f"candidate invented test citation {case_id}")

# The candidate may remove only the 30 typed fixture claim keys and add the
# six-key history record. All case meaning, branch, source material, and
# independent expected/oracle fields must remain structurally identical.
expected_candidate = copy.deepcopy(l8)
for case in expected_candidate["additional_unit_cases"]:
    if case.get("id") not in expected_cases:
        continue
    qualifications = case["typed_input"]["validated_input"]["input"]["qualifications"]
    require(len(qualifications) == 5, f"unexpected Qualification count {case['id']}")
    for qualification in qualifications:
        qualification.pop("subject_sha256", None)
metadata = candidate_l8.get("removed_materials")
require(isinstance(metadata, dict), "removed_materials record missing")
require(set(metadata) == {"decision_ref", "git_commit", "path", "meaning", "removed_key_rule", "use_boundary"}, "removed_materials keys differ from precedent")
expected_candidate["removed_materials"] = metadata
require(candidate_l8 == expected_candidate, "candidate has changes beyond the 30 subject_sha256 removals and removed_materials record")
candidate_remaining = sum(
    "subject_sha256" in q
    for case in candidate_l8["additional_unit_cases"]
    if case.get("id") in expected_cases
    for q in case["typed_input"]["validated_input"]["input"]["qualifications"]
)
require(candidate_remaining == 0, f"candidate retained {candidate_remaining} target subject_sha256 fields")
require(l5["type_contract"]["types"]["Qualification"]["subject_sha256"] == "Digest", "L5 Qualification type contract changed")
fn = next(x for x in l5["functions"] if x["id"] == "HARNESS-L5-053-validate_lineage_input")
require(any("subject_ref/subject_sha256" in step for step in fn["algorithm"]), "L5 Qualification check contract changed")
qa = base_qa_bytes.decode()
require("L8 単体検証設計" in qa and "test citation" in qa, "QA §3 contract unavailable")

print("PASS: 30/30 pre-removal row pointers, subject Ref/digest relations, source_ref occurrences, and raw Envelope digests resolve.")
print("PASS: candidate removes exactly the 30 subject_sha256 input fields and preserves branches, function refs, all other inputs, and expected fields.")
print("PASS: removed_materials has the six precedent keys; L5 remains byte-identical and no fixture/test citation was added.")
print("NOTE: the fixed mapping is source-only evidence; it is not a formal test, oracle, or fixture authorization.")
