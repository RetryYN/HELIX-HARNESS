#!/usr/bin/env python3
"""未処理8文書監査validatorの否定例。"""

from __future__ import annotations

import copy
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import validate  # noqa: E402


def main() -> int:
    report = json.loads((HERE / "report.json").read_text(encoding="utf-8"))
    base = validate.validate(report)
    if base:
        print("FAIL base report")
        for error in base:
            print("  - " + error)
        return 1
    results = []

    def run(name, mutate):
        candidate = copy.deepcopy(report)
        mutate(candidate)
        errors = validate.validate(candidate)
        results.append((name, bool(errors), errors[:1]))

    run("selected denominator", lambda x: x["scope"].__setitem__("selected_count", 7))
    run("archive bytes", lambda x: x["documents"][0].__setitem__("bytes", 1))
    run("archive sha", lambda x: x["documents"][1].__setitem__("source_sha256", "0" * 64))
    run("file blob as atom", lambda x: x["scope"].__setitem__("file_blob_is_not_single_requirement_atom", False))
    run("current owner claim", lambda x: x["documents"][2].__setitem__("current_owner", "PO"))
    run("decision claim", lambda x: x["documents"][3]["legacy"].__setitem__("decision_record_ref", "approved"))
    run("binding promotion", lambda x: x.__setitem__("binding_state", "active"))
    rejected = 0
    for name, ok, first in results:
        print(("ok   " if ok else "FAIL ") + name + (f" -> {first[0]}" if first else ""))
        rejected += ok
    print(f"negative_cases={len(results)} rejected={rejected}")
    return 0 if rejected == len(results) else 1


if __name__ == "__main__":
    sys.exit(main())
