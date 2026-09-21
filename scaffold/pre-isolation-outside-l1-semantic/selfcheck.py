#!/usr/bin/env python3
"""Negative checks for the four-product L1 semantic evidence candidate."""

from __future__ import annotations

import copy
import importlib.util
import json
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
generator_probes = [
    ("empty holding scan", 'enumerate(holding_rows[holding["registration_id"]], 1)', "enumerate([], 1)"),
    ("fixed holding relation", '"no_exact_path_or_blob_or_sha_match" if not (path_hits or blob_hits or sha_hits) else "match_requires_review"', '"no_exact_path_or_blob_or_sha_match"'),
    ("fixed reported blob", 'old_oid == report_row["pre_isolation"]["blob_oid"]', "True"),
    ("fixed archive relation", '"same" if archive_blob == old_blob else "different"', '"same"'),
    ("shift exact anchor", '"old": [30, 35], "current": [30, 35]', '"old": [30, 35], "current": [24, 29]'),
    ("shift decision line", '"decision_line": 26', '"decision_line": 40'),
    ("shift boundary line", '"boundary_line": 36', '"boundary_line": 20'),
    ("wrong decision identity", '"decision_id": "HDEC-HARNESS-L1-01"', '"decision_id": "HDEC-HELIXOS-L1-01"'),
    ("wrong source commit", 'PRE_ISOLATION = "2d4991042be55268bac30a8bbcdac45b3865030a"', 'PRE_ISOLATION = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"'),
    ("rename case", '"case_id": "OUTSIDE67-L1-HARNESS"', '"case_id": "OUTSIDE67-L1-OTHER"'),
    ("claim no semantic gap", '"semantic_gap": "旧sourceは7要求、現行承認L1は9要求。旧7要求の保持は確認できるが、追加2要求と旧source blobの保存関係は別途記録が必要。"', '"semantic_gap": "差分なし"'),
    ("claim source registered", '"4件とも13 live source holdingにexact path、pre-isolation blob OID、SHAの一致はなく、意味relationとsource保存残差を分離して保持した。"', '"旧source保存は完了しており追加登録は不要である。"'),
    ("invert prohibited inference", '"current approved L1の存在から旧pathのsource_holding保存完了を推定しない"', '"current approved L1の存在から旧pathのsource_holding保存完了を推定する"'),
    ("rename relation label", '"relation_label": "partial_substantive_subset"', '"relation_label": "exact_substantive_content"'),
]
try:
    source = original_generator.decode("utf-8")
    for label, needle, replacement in generator_probes:
        if needle not in source:
            raise SystemExit("FAIL selfcheck probe source missing: " + label)
        generator_path.write_text(source.replace(needle, replacement, 1), encoding="utf-8")
        result = subprocess.run([sys.executable, str(HERE / "validate.py")], cwd=HERE, capture_output=True, text=True, timeout=30)
        if result.returncode == 0 or "E_GENERATOR_PIN" not in result.stdout + result.stderr:
            raise SystemExit("FAIL generator tamper: " + label + "\n" + result.stdout + result.stderr)
        generator_path.write_bytes(original_generator)
        print("PASS generator tamper", label)
finally:
    generator_path.write_bytes(original_generator)

print("PASS outside-67 L1 semantic selfcheck: %d inventory + %d generator negative cases" % (len(cases), len(generator_probes)))
