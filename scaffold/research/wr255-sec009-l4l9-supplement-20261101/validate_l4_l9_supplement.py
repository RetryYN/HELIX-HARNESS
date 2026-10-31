#!/usr/bin/env python3
"""Build and measure an L4-derived SEC009 L9 overlay; audit old L4 consumers."""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
OVERLAY = HERE / "overlay"
PATHS = {
    "l3_business": "docs/helix-security/L3-requirements/business-requirements.json",
    "l3_functional": "docs/helix-security/L3-requirements/functional-requirements.json",
    "l4": "docs/helix-security/L4-basic-design/revoke-quarantine-propagation.json",
    "l5": "docs/helix-security/L5-detail-design/revoke-quarantine-propagation.json",
    "l8": "docs/helix-security/L8-unit-verification/revoke-quarantine-propagation.json",
    "l9": "docs/helix-security/L9-integration-verification/revoke-quarantine-propagation.json",
    "l10_business": "docs/helix-security/L10-verification/business-verification.json",
    "l10_functional": "docs/helix-security/L10-verification/functional-verification.json",
    "checker": "scaffold/tools/design_verification_checker.py",
}
L4_PATH = PATHS["l4"]
BASE_REVISION = "c14adddf2678c7a69d76420c451df3f05b1251ab"


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def load_repo_json(relative: str) -> Any:
    return read_json(ROOT / relative)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def resolve(root: Any, pointer: str) -> Any:
    if pointer == "":
        return root
    if not pointer.startswith("/"):
        raise ValueError(f"invalid JSON Pointer: {pointer}")
    current = root
    for raw in pointer[1:].split("/"):
        key = raw.replace("~1", "/").replace("~0", "~")
        current = current[int(key)] if isinstance(current, list) else current[key]
    return current


def all_strings(root: Any, pointer: str = ""):
    if isinstance(root, dict):
        for key, value in root.items():
            yield from all_strings(value, f"{pointer}/{key}")
    elif isinstance(root, list):
        for index, value in enumerate(root):
            yield from all_strings(value, f"{pointer}/{index}")
    elif isinstance(root, str):
        yield pointer, root


def git(*args: str) -> str:
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True).strip()


def main() -> int:
    OVERLAY.mkdir(parents=True, exist_ok=True)
    l3b = load_repo_json(PATHS["l3_business"])
    l3f = load_repo_json(PATHS["l3_functional"])
    l4 = load_repo_json(PATHS["l4"])
    l9_current = load_repo_json(PATHS["l9"])
    l9 = json.loads(subprocess.check_output(["git", "show", f"{BASE_REVISION}:{PATHS['l9']}"], cwd=ROOT, text=True))
    l10b = load_repo_json(PATHS["l10_business"])
    l10f = load_repo_json(PATHS["l10_functional"])
    l5 = read_json(OVERLAY / "l5-candidate.json")
    l8 = read_json(OVERLAY / "l8-candidate.json")
    classes = {row["class_id"]: row for row in l4["failure_classifications"]}
    class_index = {row["class_id"]: i for i, row in enumerate(l4["failure_classifications"])}

    projected_l9 = json.loads(json.dumps(l9, ensure_ascii=False))
    projection_rows = []
    positive_rows = []
    negative_given_hashes: Counter[str] = Counter()
    for row in projected_l9["integration_cases"]:
        case_id = row["id"]
        l9_case_pointer = row["source_pointers"][0]["pointer"]
        nested = resolve(l9, l9_case_pointer)
        given = nested.get("given", {})
        if row["population_state"] == "negative":
            class_id = row.get("negative_class_ref")
            if class_id not in classes:
                raise ValueError(f"negative case has no resolvable L4 class: {case_id}")
            c4 = classes[class_id]
            given_hash = hashlib.sha256(json.dumps(given, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
            negative_given_hashes[given_hash] += 1
            if set(given) != {"evidence_limit"}:
                raise ValueError(f"L9 negative given has additional input fields; review before projection: {case_id}")
            finding_codes = c4["expected"]["finding_codes"]
            observation = {
                "condition": c4["expected"]["condition"],
                "ordered_findings": [
                    {"code": code, "return_owner": c4["backflow_owner"]}
                    for code in finding_codes
                ],
            }
            row["condition"] = c4["condition"]
            row["expected"] = c4["expected"]
            row["expected_preserved"] = c4["expected_preserved"]
            row["compact_whole_observation"] = observation
            row["source_pointers"] = row["source_pointers"] + [{
                "path": L4_PATH,
                "pointer": f"/failure_classifications/{class_index[class_id]}",
            }]
            projection_rows.append({
                "case_id": case_id,
                "class_id": class_id,
                "l9_source_pointer": l9_case_pointer,
                "l4_class_pointer": f"/failure_classifications/{class_index[class_id]}",
                "given_sha256": given_hash,
                "projected_condition_sha256": sha_value(c4["condition"]),
                "projected_expected_sha256": sha_value(c4["expected"]),
                "projected_expected_preserved_sha256": sha_value(c4["expected_preserved"]),
                "compact_observation": observation,
            })
        else:
            if set(given) != {"evidence_limit"}:
                raise ValueError(f"L9 positive given has additional input fields; review before class-based projection: {case_id}")
            # Presence with nulls matches L8's explicitly unclosed positive rows.
            row["condition"] = None
            row["expected"] = None
            row["expected_preserved"] = None
            positive_rows.append({
                "case_id": case_id,
                "l9_source_pointer": l9_case_pointer,
                "given": given,
                "minimum_contract_meaning": "unclosed at row level; contract-level L3/L10 wording below is recorded without converting it into a case-specific result",
            })

    overlay_l9_path = OVERLAY / "l9-proposed.json"
    overlay_l9_path.write_text(json.dumps(projected_l9, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if l9_current.get("integration_cases") != projected_l9.get("integration_cases"):
        raise ValueError("canonical L9 integration_cases differ from independently generated L4/L9 projection")
    if [row["id"] for row in l9_current["integration_cases"]] != [row["id"] for row in l9["integration_cases"]]:
        raise ValueError("canonical L9 row IDs or ordering differ from the pinned base")
    for key in set(l9) - {"integration_cases"}:
        if l9_current.get(key) != l9.get(key):
            raise ValueError(f"canonical L9 non-case field changed during projection: {key}")

    # Independently audit all 308 direct L4 nested pointer fields in each layer.
    nested_pointer_re = re.compile(r"^/contracts/\d+/negative_classifications(?:/\d+)?$")
    aliases = {
        "code": "class_id",
        "change": "condition",
        "axis": "expected_axis",
        "state": "expected_state",
        "expected_side_effect_count": "side_effect_count",
        "expected": "expected",
        "expected_preserved": "expected_preserved",
        "backflow_owner": "backflow_owner",
    }
    pointer_audit = {"schema": "sec009-nested-pointer-consumer-audit.v1", "layers": {}}
    for layer, data in (("L8", l8), ("L9", l9_current)):
        refs = []
        wrapper_refs = []
        for occurrence, value in all_strings(data):
            if nested_pointer_re.fullmatch(value):
                refs.append((occurrence, value, "raw_pointer"))
            elif value.startswith(f"{L4_PATH}#") and nested_pointer_re.fullmatch(value.split("#", 1)[1]):
                wrapper_refs.append((occurrence, value.split("#", 1)[1], "path_pointer"))
        if len(refs) != 308 or len(wrapper_refs) != 275:
            raise ValueError(f"unexpected nested pointer inventory for {layer}: raw={len(refs)}, path={len(wrapper_refs)}")
        consumers = []
        for index, (occurrence, old_pointer, pointer_kind) in enumerate(refs, 1):
            old_target = resolve(l4, old_pointer)
            if isinstance(old_target, list):
                candidate_ids = [item["code"] for item in old_target]
                if any(class_id not in classes for class_id in candidate_ids):
                    raise ValueError(f"nested class collection has unresolved class IDs: {old_pointer}")
                consumers.append({
                    "consumer_id": f"{layer}-NESTED-{index:03d}",
                    "occurrence_pointer": occurrence,
                    "pointer_kind": pointer_kind,
                    "old_l4_pointer": old_pointer,
                    "alternate_target": {"kind": "ordered_class_id_list", "class_ids": candidate_ids},
                    "direct_rfc6901_target_available": False,
                    "consumer_safety": "unresolved; ordered class IDs preserve the old candidate membership without assigning the ambiguous case, but no direct RFC6901 pointer addresses that filtered canonical list. A new explicit list/index and consumer update would be required.",
                })
                continue
            class_id = old_target.get("code")
            matches = [r for r in l4["failure_classifications"] if r.get("class_id") == class_id]
            if len(matches) != 1:
                raise ValueError(f"nested source has no unique top-level class for {layer} {old_pointer}")
            replacement = matches[0]
            replacement_pointer = f"/failure_classifications/{l4['failure_classifications'].index(replacement)}"
            field_comparison = {}
            for old_field, new_field in aliases.items():
                field_comparison[old_field] = {
                    "new_field": new_field,
                    "same_json_type": type(old_target.get(old_field)) is type(replacement.get(new_field)),
                    "same_value": old_target.get(old_field) == replacement.get(new_field),
                }
            old_sources = {(r.get("path"), r.get("pointer")) for r in old_target.get("source_pointers", [])}
            new_sources = {(r.get("path"), r.get("pointer")) for r in replacement.get("source_pointers", [])}
            source_coverage = old_sources.issubset(new_sources)
            missing = sorted(set(old_target) - set(aliases) - {"source_pointers", "expected_side_effect_count"})
            consumers.append({
                "consumer_id": f"{layer}-NESTED-{index:03d}",
                "occurrence_pointer": occurrence,
                "pointer_kind": pointer_kind,
                "old_l4_pointer": old_pointer,
                "old_class_id": class_id,
                "alternate_target": {"kind": "top_level_class", "class_id": class_id, "pointer": replacement_pointer},
                "field_alias_comparison": field_comparison,
                "old_source_pointers_covered": source_coverage,
                "legacy_fields_without_identical_top_level_name_or_value": missing,
                "direct_rfc6901_target_safe_without_consumer_update": False,
                "consumer_safety": "candidate class is unique and aliased semantic fields compare; whole-object replacement is not safe as a raw pointer because code changes identity/outcome meaning, fields have aliases, and expected_text has no identical top-level field. Each consumer must be updated to the explicit alias mapping and rechecked.",
            })
        pointer_audit["layers"][layer] = {
            "direct_raw_pointer_fields": len(refs),
            "full_path_pointer_wrappers": len(wrapper_refs),
            "total_string_occurrences": len(refs) + len(wrapper_refs),
            "unique_old_targets": len({row[1] for row in refs}),
            "consumer_rows": consumers,
            "wrapper_rows": [
                {"occurrence_pointer": ptr, "old_l4_pointer": target, "maps_to_same_raw_consumer": True}
                for ptr, target, _ in wrapper_refs
            ],
        }
    (HERE / "pointer-consumer-audit.json").write_text(json.dumps(pointer_audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # The 8 positive rows have contract-level meaning but lack case-level source inputs.
    l10b_case = next(r for r in l10b["cases"] if r["id"] == "HELIXSECURITY-L10-009-B01")
    l10f_case = next(r for r in l10f["cases"] if r["id"] == "HELIXSECURITY-L10-009-F02")
    review = {
        "schema": "sec009-positive-minimum-meaning-review.v1",
        "authority_effect": "none",
        "source_facts": {
            "L3_B01": {"path": PATHS["l3_business"], "pointer": "/requirements/2", "obligation": l3b["requirements"][2]["obligation"]},
            "L3_F01": {"path": PATHS["l3_functional"], "pointer": "/requirements/21", "obligation": l3f["requirements"][21]["obligation"]},
            "L3_F02": {"path": PATHS["l3_functional"], "pointer": "/requirements/22", "obligation": l3f["requirements"][22]["obligation"]},
            "L10_B01": {"path": PATHS["l10_business"], "pointer": "/cases/2", "positive_input": l10b_case["positive_input"], "expected_observation": l10b_case["expected_observation"]},
            "L10_F02": {"path": PATHS["l10_functional"], "pointer": "/cases/22", "positive_input": l10f_case["positive_input"], "expected_observation": l10f_case["expected_observation"]},
            "L4_B01": {"path": PATHS["l4"], "pointer": "/contracts/0", "output_meaning": l4["contracts"][0]["output_meaning"]},
            "L4_F02": {"path": PATHS["l4"], "pointer": "/contracts/2", "output_meaning": l4["contracts"][2]["output_meaning"]},
        },
        "positive_rows": positive_rows,
        "minimum_meaning_findings": [
            {"case_id": row["case_id"], "minimum": f"Conditional only: if the case marker 'unselected and absent' is accepted as the scenario, L3 F01/L10 B01 require the recipient's absence not to count as a missing selected stop target. Its selected-set input is absent, so no concrete expected object is emitted. ({row['case_id'].split('-ONLY-',1)[-1].split('-UNSELECTED',1)[0]})"}
            for row in positive_rows[:5]
        ] + [
            {"case_id": positive_rows[5]["case_id"], "minimum": "No row-specific result is derivable: the empty-set marker does not establish whether an applicable target operation or recipient exists; the L3/L10 contract remains conditional."},
            {"case_id": positive_rows[6]["case_id"], "minimum": "No row-specific recovery selection is derivable: L3 F02 requires identity-bound isolation/recovery, but the L9 given carries no identity or state values."},
            {"case_id": positive_rows[7]["case_id"], "minimum": "L3 F02 and L10 F02 prohibit expanding a general-meaning unknown to an unrelated global stop. The row's expected category/scope input values are absent, so the full positive expectation remains unclosed."},
        ],
        "decision": "These minimum meanings are recorded as source interpretation only. They do not fill L9 expected_proposal, L8 expected fields, individual oracle IDs, or test citations.",
    }
    (HERE / "positive-source-review.json").write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # Run current checker over L4/L9 proposal plus fixed L5/L8 candidate snapshots.
    checker_cmd = [
        sys.executable, str(ROOT / PATHS["checker"]), "check-child", "--root", str(ROOT),
        "--l4", PATHS["l4"], "--l9", PATHS["l9"],
        "--l5", str((OVERLAY / "l5-candidate.json").relative_to(ROOT)),
        "--l8", str((OVERLAY / "l8-candidate.json").relative_to(ROOT)),
    ]
    proc = subprocess.run(checker_cmd, cwd=ROOT, text=True, capture_output=True)
    report = json.loads(proc.stdout)
    (HERE / "overlay-check-child.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    neg = report["negative_4way"]
    summary = {
        "schema": "wr255-sec009-l4-l9-overlay-summary.v1",
        "evidence_kind": "scaffold",
        "authority_effect": "none",
        "source_revisions": {
            "L4_L9_base": BASE_REVISION,
            "L9_current": git("log", "-1", "--format=%H", "--", PATHS["l9"]),
            "L5_L8_candidate": "6768e40d44ece49260a27d799c33bae24ca2d798",
        },
        "source_sha256": {name: sha256(ROOT / path) for name, path in PATHS.items()},
        "overlay_sha256": {
            "l5_candidate": sha256(OVERLAY / "l5-candidate.json"),
            "l8_candidate": sha256(OVERLAY / "l8-candidate.json"),
            "l9_projected": sha256(overlay_l9_path),
        },
        "projection": {
            "negative_rows": len(projection_rows),
            "positive_rows_unclosed": len(positive_rows),
            "negative_expected_source": "L4 failure_classifications only",
            "positive_expected_source": "none; unresolved values are null",
            "compact_observation": "ordered L4 finding_codes plus L4 backflow_owner; no L9 expected_proposal copied",
        },
        "pointer_audit": {
            layer: {key: value for key, value in data.items() if key != "consumer_rows" and key != "wrapper_rows"}
            for layer, data in pointer_audit["layers"].items()
        },
        "check_child": {
            "exit_code": proc.returncode,
            "passed": report.get("passed"),
            "L4_L9_pair_passed": report.get("L4_L9_pair", {}).get("passed"),
            "L5_L8_pair_passed": report.get("L5_L8_pair", {}).get("passed"),
            "negative_4way_matched_case_count": neg.get("matched_case_count"),
            "negative_4way_failure_count": len(neg.get("failures", [])),
            "reason_counts": dict(Counter(row.get("reason", "unknown") for row in neg.get("failures", []))),
            "report_path": "overlay-check-child.json",
        },
        "negative_projection_rows": projection_rows,
    }
    (HERE / "overlay-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"L4_L9_pair": report["L4_L9_pair"].get("passed"), "L5_L8_pair": report["L5_L8_pair"].get("passed"), "matched": neg.get("matched_case_count"), "failures": len(neg.get("failures", [])), "positive_unclosed": len(positive_rows), "pointer_audit_L8": len(pointer_audit["layers"]["L8"]["consumer_rows"]), "pointer_audit_L9": len(pointer_audit["layers"]["L9"]["consumer_rows"])}, ensure_ascii=False))
    return 0


def sha_value(value: Any) -> str:
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (KeyError, IndexError, ValueError, OSError, subprocess.CalledProcessError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
