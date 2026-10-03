#!/usr/bin/env python3
"""候補reportの境界をメモリ上の変異で確認する。repositoryへは書き込まない。"""
from __future__ import annotations

import copy
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import validate  # noqa: E402


def main() -> int:
    base = json.loads((HERE / "report.json").read_text(encoding="utf-8"))
    if validate.validate(base):
        print("FAIL: base report does not validate")
        return 1

    mutations: list[tuple[str, dict]] = []
    m = copy.deepcopy(base)
    m["denominators"]["holding_external_new_path_count"] = 66
    mutations.append(("OUTSIDE67-NEG-DENOMINATOR", m))

    m = copy.deepcopy(base)
    m["rows"][0]["pre_isolation_blob_oid"] = "0" * 40
    mutations.append(("OUTSIDE67-NEG-GIT-BLOB", m))

    m = copy.deepcopy(base)
    m["rows"][0]["archive_root_present"] = True
    mutations.append(("OUTSIDE67-NEG-ARCHIVE-ROOT", m))

    m = copy.deepcopy(base)
    m["denominators"]["current_main_absent_count"] = 58
    mutations.append(("OUTSIDE67-NEG-MAIN-ABSENT", m))

    m = copy.deepcopy(base)
    m["aggregate_classification"]["product_scope_counts"]["HELIX-HARNESS"] = 5
    mutations.append(("OUTSIDE67-NEG-PRODUCT-CLASSIFICATION", m))

    m = copy.deepcopy(base)
    m["binding_state"] = "active"
    mutations.append(("OUTSIDE67-NEG-BINDING-STATE", m))

    m = copy.deepcopy(base)
    m["authority_effect"] = "approved"
    mutations.append(("OUTSIDE67-NEG-AUTHORITY", m))

    failures = []
    for case_id, mutated in mutations:
        if validate.validate(mutated):
            print(f"PASS {case_id}")
        else:
            print(f"FAIL {case_id}: mutation was accepted")
            failures.append(case_id)
    if failures:
        print("FAIL negative cases: " + ", ".join(failures))
        return 1
    print(f"PASS: holding外67 negative selfcheck ({len(mutations)} mutations rejected)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
