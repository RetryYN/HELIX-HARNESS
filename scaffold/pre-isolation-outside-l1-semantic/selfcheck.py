#!/usr/bin/env python3
"""Negative checks for the four-product L1 semantic evidence candidate."""

from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
import tempfile
import subprocess
import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("l1_validator", HERE / "validate.py")
validator = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(validator)
base = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))

baseline_errors = validator.validate(base)
if baseline_errors:
    raise SystemExit("FAIL selfcheck baseline: " + "; ".join(baseline_errors))
print("PASS baseline validator")


def expect_failure(label, mutate):
    candidate = copy.deepcopy(base)
    mutate(candidate)
    if validator.validate(candidate):
        print("PASS", label)
    else:
        raise SystemExit("FAIL selfcheck: " + label)


cases = [
    ("authority promotion", lambda x: x.update(authority_effect="adopted")),
    ("semantic promotion", lambda x: x["cases"][0].update(semantic_relation="exact")),
    ("current approval tamper", lambda x: x["cases"][0]["current_approved_l1"].update(sha256="0" * 64)),
    ("old blob tamper", lambda x: x["cases"][0]["old_source"].update(blob_oid="0" * 40)),
    ("holding inclusion promotion", lambda x: x["cases"][0].update(existing_holding_relation="included")),
    ("holding match invention", lambda x: x["cases"][0]["live_holding_relations"][0].update(path_match_count=1)),
    ("preservation resolution", lambda x: x["cases"][0].update(preservation_disposition="resolved")),
    ("source holding creation", lambda x: x.update(formal_source_holding_created=True)),
    ("line anchor tamper", lambda x: x["cases"][0]["line_anchored_evidence"][0].update(claim="changed")),
    ("old execution", lambda x: x.update(old_runtime_test_ci_execution=True)),
    ("prohibited boundary deletion", lambda x: x["prohibited_inference"].pop()),
]

for label, mutate in cases:
    expect_failure(label, mutate)

generator_path = HERE / "generate.py"
original_generator = generator_path.read_bytes()


def expect_independent_failure(label, mutate, code):
    candidate = copy.deepcopy(base)
    mutate(candidate)
    errors = validator.validate(candidate)
    if any(error.startswith(code) for error in errors):
        print("PASS independent oracle", label)
    else:
        raise SystemExit("FAIL independent oracle: " + label + " " + repr(errors))


# These checks must fail if the independent_evidence_errors call is removed.
expect_independent_failure("anchor equality", lambda x: x["cases"][2]["line_anchored_evidence"][0]["current"]["text"].__setitem__(0, "tampered"), "E_ANCHOR_EQUALITY")
expect_independent_failure("holding scan", lambda x: x["cases"][0]["live_holding_relations"][0].update(path_match_count=1), "E_HOLDING_SCAN")
expect_independent_failure("anchor presence", lambda x: x["cases"][0]["line_anchored_evidence"].pop(), "E_ANCHOR_KINDS")

# A changed generator is accepted temporarily by the two digest pins so each
# probe must reach the corresponding independently computed evidence check.
generator_probes = [
    ("wrong holding relation", '"no_exact_path_or_blob_or_sha_match" if not (path_hits or blob_hits or sha_hits) else "match_requires_review"', '"match_requires_review"', "E_HOLDING_CLASS"),
    ("wrong reported blob", 'old_oid == report_row["pre_isolation"]["blob_oid"]', "False", "E_OLD_REPORTED"),
    ("wrong archive relation", '"same" if archive_blob == old_blob else "different"', '"different"', "E_ARCHIVE_GIT"),
    ("shift exact anchor", '"old": [30, 35], "current": [30, 35]', '"old": [30, 35], "current": [24, 29]', "E_ANCHOR_EQUALITY"),
    ("shift decision line", '"decision_line": 26', '"decision_line": 40', "E_DECISION_LINE"),
    ("shift boundary line", '"boundary_line": 36', '"boundary_line": 20', "E_BOUNDARY_LINE"),
    ("wrong decision identity", '"decision_id": "HDEC-HARNESS-L1-01"', '"decision_id": "HDEC-HELIXOS-L1-01"', "E_DECISION_ID"),
    ("wrong source commit", 'PRE_ISOLATION = "2d4991042be55268bac30a8bbcdac45b3865030a"', 'PRE_ISOLATION = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"', "E_PRE_COMMIT_PIN"),
    ("rename case", '"case_id": "OUTSIDE67-L1-HARNESS"', '"case_id": "OUTSIDE67-L1-OTHER"', "E_CASE_ID_LABEL"),
    ("claim no semantic gap", '"semantic_gap": "旧sourceは7要求、現行承認L1は9要求。旧7要求の保持は確認できるが、追加2要求と旧source blobの保存関係は別途記録が必要。"', '"semantic_gap": "差分なし"', "E_SEMANTIC_GAP"),
    ("claim source registered", '"4件とも13 live source holdingにexact path、pre-isolation blob OID、SHAの一致はなく、意味relationとsource保存残差を分離して保持した。"', '"旧source保存は完了しており追加登録は不要である。"', "E_FINDINGS_PIN"),
    ("invert prohibited inference", '"current approved L1の存在から旧pathのsource_holding保存完了を推定しない"', '"current approved L1の存在から旧pathのsource_holding保存完了を推定する"', "E_PROHIBITED_PIN"),
    ("rename relation label", '"relation_label": "partial_substantive_subset"', '"relation_label": "exact_substantive_content"', "E_CASE_ID_LABEL"),
    ("remove anchors", '"line_anchored_evidence": anchors,', '"line_anchored_evidence": anchors[:1],', "E_ANCHOR_KINDS"),
]
source = original_generator.decode("utf-8")
validator_source = (HERE / "validate.py").read_text(encoding="utf-8")
for label, needle, replacement, expected_error in generator_probes:
    if needle not in source:
        raise SystemExit("FAIL generator probe source missing: " + label)
    with tempfile.TemporaryDirectory(prefix="l1-negative-", dir=HERE.parent) as temporary:
        sandbox = Path(temporary)
        changed_generator = source.replace(needle, replacement, 1).encode("utf-8")
        (sandbox / "generate.py").write_bytes(changed_generator)
        generated = subprocess.run([sys.executable, str(sandbox / "generate.py")], cwd=sandbox, capture_output=True, text=True, timeout=30)
        if generated.returncode:
            raise SystemExit("FAIL generator probe generation: " + label + "\n" + generated.stdout + generated.stderr)
        changed_inventory = (sandbox / "inventory.json").read_bytes()
        patched_validator = validator_source.replace(validator.EXPECTED_GENERATOR_SHA, hashlib.sha256(changed_generator).hexdigest()).replace(validator.EXPECTED_INVENTORY_SHA, hashlib.sha256(changed_inventory).hexdigest())
        (sandbox / "validate.py").write_text(patched_validator, encoding="utf-8")
        result = subprocess.run([sys.executable, str(sandbox / "validate.py")], cwd=sandbox, capture_output=True, text=True, timeout=30)
        if result.returncode == 0 or expected_error not in result.stdout + result.stderr:
            raise SystemExit("FAIL generator evidence probe: " + label + "\n" + result.stdout + result.stderr)
        print("PASS generator evidence", label, expected_error)

with tempfile.TemporaryDirectory(prefix="l1-pin-", dir=HERE.parent) as temporary:
    sandbox = Path(temporary)
    (sandbox / "generate.py").write_bytes(original_generator + b"\n")
    (sandbox / "validate.py").write_text(validator_source, encoding="utf-8")
    result = subprocess.run([sys.executable, str(sandbox / "validate.py")], cwd=sandbox, capture_output=True, text=True, timeout=30)
    if result.returncode == 0 or "E_GENERATOR_PIN" not in result.stdout + result.stderr:
        raise SystemExit("FAIL generator digest pin")
    print("PASS generator digest pin")

with tempfile.TemporaryDirectory(prefix="l1-oracle-loss-", dir=HERE.parent) as temporary:
    sandbox = Path(temporary)
    for name in ("generate.py", "inventory.json", "selfcheck.py"):
        (sandbox / name).write_bytes((HERE / name).read_bytes())
    call = "    errors.extend(independent_evidence_errors(inv))\n"
    if call not in validator_source:
        raise SystemExit("FAIL independent oracle call missing from baseline")
    (sandbox / "validate.py").write_text(validator_source.replace(call, "", 1), encoding="utf-8")
    result = subprocess.run([sys.executable, str(sandbox / "selfcheck.py")], cwd=sandbox, capture_output=True, text=True, timeout=30)
    if result.returncode == 0 or "FAIL independent oracle" not in result.stdout + result.stderr:
        raise SystemExit("FAIL independent oracle loss regression: " + result.stdout + result.stderr)
    print("PASS independent oracle loss regression")

print("PASS outside-67 L1 semantic selfcheck: %d inventory + 3 independent + %d generator evidence + 1 pin + 1 oracle-loss negative cases" % (len(cases), len(generator_probes)))
