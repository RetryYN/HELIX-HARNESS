#!/usr/bin/env python3
"""validatorのfail-closed境界を生成物の一時copyで確認する。"""

from __future__ import annotations

import copy
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


BUNDLE = Path(__file__).resolve().parent
VALIDATE = BUNDLE / "validate.py"


def load_bundle(tmp: Path):
    inventory = json.loads((tmp / "inventory.json").read_text(encoding="utf-8"))
    records = [json.loads(line) for line in (tmp / "evidence.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
    return inventory, records


def save_bundle(tmp: Path, inventory, records):
    (tmp / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    (tmp / "evidence.jsonl").write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in records), encoding="utf-8")


def run_case(name, expected_code, mutate):
    with tempfile.TemporaryDirectory(prefix="legacy-evidence-crosswalk-0146-") as td:
        tmp = Path(td)
        shutil.copy2(BUNDLE / "inventory.json", tmp / "inventory.json")
        shutil.copy2(BUNDLE / "evidence.jsonl", tmp / "evidence.jsonl")
        inventory, records = load_bundle(tmp)
        mutate(inventory, records)
        save_bundle(tmp, inventory, records)
        result = subprocess.run(
            [sys.executable, str(VALIDATE), "--bundle", str(tmp)],
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            check=False,
        )
        if result.returncode == 0 or expected_code not in result.stdout:
            raise AssertionError(f"{name}: expected {expected_code}, rc={result.returncode}, output={result.stdout}")
        print(f"PASS {name}: {expected_code}")


def first(records):
    return records[0]


def main():
    cases = [
        ("record_set", "E_RECORD_SET", lambda i, r: r.pop()),
        ("edge_set", "E_EDGE_SET", lambda i, r: r[0]["coverage"]["edge_ids"].pop()),
        ("edge_duplicate", "E_EDGE_DUPLICATE", lambda i, r: r[0]["coverage"]["edge_ids"].append(r[0]["coverage"]["edge_ids"][0])),
        ("asset_set", "E_ASSET_SET", lambda i, r: r[0]["coverage"]["asset_ids"].pop()),
        ("asset_duplicate", "E_ASSET_DUPLICATE", lambda i, r: r[0]["coverage"]["asset_ids"].append(r[0]["coverage"]["asset_ids"][0])),
        ("status_partition", "E_STATUS_PARTITION", lambda i, r: r[0]["status_partition"]["old_implementation"].update(status="implemented")),
        ("required_evidence_schema", "E_REQUIRED_EVIDENCE_SCHEMA", lambda i, r: r[0]["status_partition"]["acceptance"]["required_evidence_schema"]["artifact_keys"].append("forged")),
        ("source_relation", "E_RECORD_RELATION", lambda i, r: r[0]["source_record"].update(partition_line=9999)),
        ("authority_boundary", "E_AUTHORITY_BOUNDARY", lambda i, r: r[0]["authority_boundary"].update(authority_effect="implementation")),
        ("top_level_key", "E_TOP_LEVEL_KEY", lambda i, r: r[0].update(forged_key=True)),
        ("inventory_product_denominator", "E_PRODUCT_DENOMINATOR", lambda i, r: i["counts"].update(product_units=218)),
        ("inventory_connection_denominator", "E_IRCONN_DENOMINATOR", lambda i, r: i["counts"].update(connections=0)),
        ("input_digest", "E_INPUT_DIGEST", lambda i, r: i["input_digests"][0].update(sha256="0" * 64)),
        ("source_partition_declaration", "E_INVENTORY_DECLARATION", lambda i, r: i["scope"]["source_partition_paths"].pop()),
        ("base_commit", "E_BASE_COMMIT", lambda i, r: i["base"].update(commit="0" * 40)),
        ("unimplemented_status", "E_STATUS_PARTITION", lambda i, r: r[0]["status_partition"]["unimplemented"].update(status="not_implemented")),
    ]
    for name, code, mutate in cases:
        run_case(name, code, mutate)
    print(f"PASS selfcheck: {len(cases)} negative cases")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
