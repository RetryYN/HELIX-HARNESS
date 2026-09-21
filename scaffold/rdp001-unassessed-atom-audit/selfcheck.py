#!/usr/bin/env python3
"""validatorが未承認・改変入力をfail-closeすることの否定例。"""

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
    base_errors = validate.validate(report)
    if base_errors:
        print("FAIL base report")
        for error in base_errors:
            print("  - " + error)
        return 1
    cases = []

    def case(name, mutate):
        candidate = copy.deepcopy(report)
        mutate(candidate)
        errors = validate.validate(candidate)
        cases.append((name, bool(errors), errors[:1]))

    case("holding denominator -1", lambda x: x["denominators"].__setitem__("holding_records", 332))
    case("capture head mutation", lambda x: x["audit_revisions"].__setitem__("capture_head", "0" * 40))
    case("terminal newline line denominator", lambda x: x["original_text"].__setitem__("total_lines", 45297))
    case("archive oid mutation", lambda x: x["samples"][0].__setitem__("pre_isolation_blob_oid", "0" * 40))
    case("archive sha mutation", lambda x: x["samples"][0].__setitem__("pre_isolation_file_sha256", "0" * 64))
    case("product target claim", lambda x: x["source_register"].__setitem__("product_target", "HELIX-HARNESS"))
    case("implementation denominator mutation", lambda x: x["aggregate"]["implementation_status_counts"].__setitem__("unknown", 323))
    case("binding state promotion", lambda x: x.__setitem__("binding_state", "active"))
    case("authority promotion", lambda x: x.__setitem__("authority_effect", "approved"))
    case("unaccounted atom insertion", lambda x: x["source_register"].__setitem__("unaccounted_atom_refs", 1))
    failed = [name for name, rejected, _ in cases if not rejected]
    for name, rejected, first in cases:
        print(("ok   " if rejected else "FAIL ") + name + (f" -> {first[0]}" if first else ""))
    print(f"negative_cases={len(cases)} rejected={len(cases) - len(failed)}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
