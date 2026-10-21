#!/usr/bin/env python3
"""CORE009 F03 case13の保存表現だけを固定Git原文と照合する。製品判定は実行しない。"""
import argparse
import copy
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[5]
BASE = "62473fd66128fe30117154c0707ae8b5c4bc0cf3"
PATH = "docs/helix-harness/L9-integration-verification/product-template-application.json"
POINTER = "/cases/4/source_result_reference_cases/cases/13"
CASE_ID = "CORE009-F03-SOURCE-DUPLICATE-ENVELOPES"
TARGETS = ("/expected_rows/0/source_envelopes_input/value",
           "/expected_rows/0/source_candidate_envelopes")


def dump(value, *, ordered=False):
    return json.dumps(value, ensure_ascii=False, sort_keys=not ordered,
                      separators=(",", ":"), allow_nan=False).encode("utf-8")


def sha(value, *, ordered=False):
    return hashlib.sha256(dump(value, ordered=ordered)).hexdigest()


def git_bytes(revision):
    return subprocess.check_output(["git", "-C", str(ROOT), "show", f"{revision}:{PATH}"])


def at(value, pointer):
    # この固定二copyのRFC6901 pointerだけを解決する。任意の式言語は実行しない。
    for token in pointer.split("/")[1:]:
        token = token.replace("~1", "/").replace("~0", "~")
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value


def restore(wrapper, patch):
    value = copy.deepcopy(wrapper["literal_base"])
    for operation in patch:
        assert operation["op"] == "copy"
        parent, member = operation["path"].rsplit("/", 1)
        destination = at(value, parent)
        assert member in destination  # 元member順を保つ既存placeholderへの置換だけ。
        destination[member] = copy.deepcopy(at(value, operation["from"]))
    return value


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--candidate", default="HEAD", help="固定candidate commit")
    parser.add_argument("--working-tree", action="store_true")
    args = parser.parse_args()
    old_raw = git_bytes(BASE)
    new_raw = (ROOT / PATH).read_bytes() if args.working_tree else git_bytes(args.candidate)
    old_doc, new_doc = json.loads(old_raw), json.loads(new_raw)
    old_case = at(old_doc, POINTER)
    wrapper = at(new_doc, POINTER)
    material = wrapper["materialization"]
    assert material["operation"] == "RFC 6902"
    assert material["source_revision"] == BASE
    assert material["base_pointer"] == POINTER + "/literal_base"
    assert material["base_canonical_sha256"] == sha(wrapper["literal_base"])
    assert material["patch"] == [
        {"op": "copy", "from": "/raw_input/source_envelopes", "path": target}
        for target in TARGETS]
    restored = restore(wrapper, material["patch"])
    assert dump(restored, ordered=True) == dump(old_case, ordered=True)
    assert material["materialized_canonical_sha256"] == sha(old_case)
    assert material["prior_case_canonical_sha256"] == sha(old_case)
    assert material["materialized_ordered_sha256"] == sha(old_case, ordered=True)
    new_doc["cases"][4]["source_result_reference_cases"]["cases"][13] = restored
    assert dump(new_doc, ordered=True) == dump(old_doc, ordered=True)
    # 元caseはliteral_base内に一件だけある。wrapperだけを逆変換して原file bytesも比較。
    text = new_raw.decode("utf-8")
    case_id_position = text.index('"id": "CORE009-F03-SOURCE-DUPLICATE-ENVELOPES"')
    marker = text.rfind('"literal_base":', 0, case_id_position)
    assert marker >= 0
    start = text.rfind("{", 0, marker)
    actual, size = json.JSONDecoder().raw_decode(text[start:])
    assert actual == wrapper
    column = start - text.rfind("\n", 0, start) - 1
    replacement = json.dumps(restored, ensure_ascii=False, indent=2).replace("\n", "\n" + " " * column)
    inverse_raw = (text[:start] + replacement + text[start + size:]).encode("utf-8")
    assert inverse_raw == old_raw
    # 復元copy欠落・異なる原材料からのcopyは独立固定の全返却と一致しない。
    assert dump(restore(wrapper, material["patch"][:1]), ordered=True) != dump(old_case, ordered=True)
    bad = copy.deepcopy(material["patch"])
    bad[1]["from"] = "/expected_rows/0/candidate_count"
    assert dump(restore(wrapper, bad), ordered=True) != dump(old_case, ordered=True)
    print(json.dumps({"source_main": BASE, "case_id": CASE_ID,
                      "canonical_sha256": sha(restored), "ordered_sha256": sha(restored, ordered=True),
                      "inverse_file_sha256": hashlib.sha256(inverse_raw).hexdigest(),
                      "all_original_logical_values_and_order": "equal",
                      "inverse_original_file_bytes": "equal",
                      "missing_copy_and_wrong_source_controls": "rejected",
                      "file_bytes_saved": len(old_raw) - len(new_raw),
                      "scope": "storage reconstruction only; no design defect Red, product/CI/qualification execution"},
                     ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
