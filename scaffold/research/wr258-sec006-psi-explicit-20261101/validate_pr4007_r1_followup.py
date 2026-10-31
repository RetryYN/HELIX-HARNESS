#!/usr/bin/env python3
"""PR #4007 R1: 静的にL4/L9ケース保持・追加oracle・markerを照合する。"""
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
L4 = "docs/helix-security/L4-basic-design/project-scope-isolation.json"
L9 = "docs/helix-security/L9-integration-verification/project-scope-isolation.json"
L3 = "docs/helix-security/L3-requirements/functional-requirements.json"
L10 = "docs/helix-security/L10-verification/functional-verification.json"
BEFORE = "cf983f81ff09cd90fb3f8f781bdb7c7445923ee6"
BLIND = "3e469f273817af640a2adafa50b8548b22a107fd"
DEFERRED = "SEC003-F02-OPERATION-CONNECTION-ABSENT-DEFERRED"
CURRENT_ORACLE_PREFIX = "SEC003-L9-ORACLE-"


def git_json(revision: str, path: str) -> dict:
    raw = subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)
    return json.loads(raw)


def local_json(path: str) -> dict:
    return json.loads((ROOT / path).read_text())


def sha(path: str) -> str:
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--record", type=Path, help="新規pathへJSON結果を排他的に記録する")
    args = ap.parse_args()

    l4_before, l9_before = git_json(BEFORE, L4), git_json(BEFORE, L9)
    l4, l9 = local_json(L4), local_json(L9)
    l3, l10 = git_json(BLIND, L3), git_json(BLIND, L10)
    old_classes = {x["class_id"] for x in git_json(BLIND, L4)["failure_classifications"]}
    new_classes = {x["class_id"] for x in l4["failure_classifications"]}
    l4_classes = {x["class_id"]: x for x in l4["failure_classifications"]}
    l9_classes = {x["class_id"]: x for x in l9["negative_equivalence_classes"]}
    old_rows = {
        row["id"]: row
        for case in l9_before["cases"]
        for row in case["negative_cases"]
    }
    current_rows = {
        row["id"]: row
        for case in l9["cases"]
        for row in case["negative_cases"]
    }
    added = [row for row in current_rows.values() if row["id"].startswith(CURRENT_ORACLE_PREFIX)]
    preserved_errors = []

    def check(ok: bool, name: str, detail: str | None = None) -> None:
        if not ok:
            preserved_errors.append({"assertion": name, "detail": detail})

    check(len(l4_classes) == 15, "L4 class count is 15")
    check(all(x["code"] == x["expected_classification"] for x in l4["failure_classifications"]),
          "all L4 class codes equal expected_classification")
    check(all(x["expected"]["finding_codes"] for x in l4["failure_classifications"]),
          "all L4 negative classes have a finding code")
    check(DEFERRED not in new_classes, "local-only deferred branch removed from L4 negative class table")
    check(DEFERRED not in l4["contracts"][1]["negative_class_refs"], "deferred class removed from F02 parent links")
    check(l4.get("negative_equivalence_classes") == {"source_rows": "failure_classifications"}, "L4 partial marker present")
    check(len(l9_classes) == 15 and set(l9_classes) == new_classes, "L9 class table covers all 15 L4 classes")
    check(len(old_rows) == 98, "pre-R1 canonical L9 row count is 98")
    check(len(added) == 50, "50 new source-derived L9 oracle rows present")
    check(len(current_rows) == 148, "total L9 negative rows are 148")
    check([len(c["negative_cases"]) for c in l9["cases"]] == [93, 55], "F01/F02 L9 counts are 93/55")
    check(l9["cases"][0]["source_case_count"] == 93 and l9["cases"][1]["source_case_count"] == 62, "F01/F02 source counts are 93/62")
    check(l9["multi_contract_residual"] == l9_before["multi_contract_residual"],
          "multi-contract residual object is byte-value-equivalent to pre-R1")
    check(len(l9["multi_contract_residual"]["negative_cases"]) == 16, "16 residual negatives unchanged")
    check(l9.get("negative_equivalence_classes") and "negative_equivalence_classes" not in l4_before, "L9 partial marker present")
    check("negative_equivalence_classes" not in local_json("docs/helix-security/L5-detail-design/project-scope-isolation.json"), "L5 marker absent")
    check("negative_equivalence_classes" not in local_json("docs/helix-security/L8-unit-verification/project-scope-isolation.json"), "L8 marker absent")

    for case_id, original in old_rows.items():
        current = current_rows.get(case_id)
        expected = dict(original)
        class_id = (original.get("negative_class_assignment") or {}).get("class_id")
        expected["negative_class_ref"] = class_id
        check(current == expected, "old L9 row preserved except direct negative_class_ref", case_id)
        check(class_id in new_classes, "old L9 class ref resolves", case_id)
        check(current and current.get("negative_class_ref") == class_id, "old L9 direct class ref matches assignment", case_id)

    expected_added_ids = {f"{CURRENT_ORACLE_PREFIX}{i:03d}" for i in range(1, 51)}
    check({row["id"] for row in added} == expected_added_ids, "all 50 stable L9 oracle IDs are present exactly once")
    for row in added:
        cid = row.get("negative_class_ref")
        cls = l4_classes.get(cid)
        check(cls is not None, "new L9 class ref resolves", row["id"])
        if cls:
            check(row.get("expected_classification") == cls["code"], "new L9 classification derives from L4", row["id"])
            check(row.get("expected") == cls["expected"], "new L9 expected value derives from L4", row["id"])
            check(row.get("expected_preserved") == cls["expected_preserved"], "new L9 preservation contract derives from L4", row["id"])
            check(row.get("expected_axis") == cls["expected_axis"], "new L9 axis derives from L4", row["id"])
            check(row.get("expected_state") == cls["expected_state"], "new L9 state derives from L4", row["id"])
        check("counterexample" not in row and "raw_utf8" not in row and "known_input_basis" not in row,
              "new L9 rows contain no L8 fixture/input copy", row["id"])
        check(not any("L8-unit-verification" in x.get("path", "") for x in row.get("source_pointers", [])),
              "new L9 rows cite no L8 oracle", row["id"])
        check("negative_class_assignment" not in row, "new L9 rows use explicit class ref, not legacy nested taxonomy", row["id"])
        check(row.get("execution_state") == "not_executed" and row.get("actual_observation") == "not_observed",
              "new L9 rows remain unexecuted", row["id"])
        check(all(x.get("path") in {L3, L10, L4} for x in row.get("source_pointers", [])),
              "new L9 oracle derivation uses L3/L10/L4 only", row["id"])

    new_classes = new_classes - old_classes
    new_class_case_counts = Counter(row["negative_class_ref"] for row in added)
    expected_new_class_names = {
        "SEC003-F01-SIDE-INPUT-UNRESOLVED",
        "SEC003-F01-ASSET-KIND-UNRESOLVED",
        "SEC003-F01-OWNER-MATERIAL-UNRESOLVED",
        "SEC003-F02-OPERATION-INPUT-UNRESOLVED",
        "SEC003-F02-FALLBACK-INPUT-UNRESOLVED",
    }
    check(new_classes == expected_new_class_names, "five new class IDs are exactly the source-derived additions")
    check(all(new_class_case_counts[x] > 0 for x in expected_new_class_names), "all five new classes receive L9 rows")
    check(all((row.get("negative_class_ref") != DEFERRED) for row in added), "no L9 row references removed local defer class")
    check(next(row for row in added if row["id"].endswith("046"))["negative_class_ref"] == "SEC003-F02-EXPLICIT-CONNECTION-ABSENT",
          "local defer candidate is represented by whole-system absent-connection class")
    check(sha(L3) == hashlib.sha256(subprocess.check_output(["git", "show", f"{BLIND}:{L3}"], cwd=ROOT)).hexdigest(),
          "L3 source bytes match blind revision")
    check(sha(L10) == hashlib.sha256(subprocess.check_output(["git", "show", f"{BLIND}:{L10}"], cwd=ROOT)).hexdigest(),
          "L10 source bytes match blind revision")

    result = {
        "schema": "wr258-pr4007-r1-static-validation.v1",
        "evidence_kind": "scaffold",
        "authority_effect": "none",
        "baseline_revision": BEFORE,
        "blind_revision": BLIND,
        "passed": not preserved_errors,
        "counts": {
            "l4_classes": len(l4_classes),
            "l9_old_rows_preserved": len(old_rows),
            "l9_added_short_oracles": len(added),
            "l9_total_negative_rows": len(current_rows),
            "l9_by_contract": [len(c["negative_cases"]) for c in l9["cases"]],
            "l9_class_table": len(l9_classes),
            "new_class_case_counts": dict(sorted((k, v) for k, v in new_class_case_counts.items() if k in expected_new_class_names)),
            "multi_contract_residual_negative_rows": len(l9["multi_contract_residual"]["negative_cases"]),
        },
        "source_sha256": {p: sha(p) for p in (L3, L10, L4, L9)},
        "assertion_failures": preserved_errors,
        "scope": "Static source/class/row integrity only; not execution or check-child result. 4-way check-child is independently recorded in a separate artifact.",
    }
    encoded = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.record:
        target = args.record if args.record.is_absolute() else ROOT / args.record
        target.parent.mkdir(parents=True, exist_ok=True)
        with target.open("x", encoding="utf-8") as stream:
            stream.write(encoded)
    print(encoded, end="")
    return 0 if result["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
