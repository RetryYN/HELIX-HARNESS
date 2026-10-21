"""BRAIN007 B01の限定3例の格納Refactorを静的に再構成する監査snapshot。

製品/domainを実行しない。意味oracleの全域妥当性や元TDDの時系列は証明しない。
実行: python3 -I -B <this-file> --design-revision COMMIT
"""

import argparse
import copy
import hashlib
import json
import subprocess


BASE = "911e9989d85387f99801b909264caffe91ff6e89"
LITERAL = "504f2ea8a069395caa4a379886f6c8f6bd9529aa"
PATHS = [
    "docs/helix-brain/L5-detail-design/knowledge-provenance-promotion.json",
    "docs/helix-brain/L8-unit-verification/knowledge-provenance-promotion.json",
]
NODES = ["private_b01_responsibility_return", "private_b01_responsibility_return_cases"]
SCALARS = [
    "/unclosed_owner_returns/1/boundary",
    "/unclosed_owner_returns/1/status",
    "/unclosed_owner_returns/1/not_claimed",
    "/limitations/4",
]


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("duplicate JSON member")
        result[key] = value
    return result


def invalid_constant(value):
    raise ValueError("non-JSON constant: " + value)


def parse(raw):
    return json.loads(raw.decode("utf-8"), object_pairs_hook=unique_object,
                      parse_constant=invalid_constant)


def git_bytes(revision, path):
    return subprocess.check_output(["git", "show", revision + ":" + path])


def compact(value, sort=False):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"),
                      sort_keys=sort, allow_nan=False).encode("utf-8")


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def tokens(pointer):
    assert pointer.startswith("/")
    return [part.replace("~1", "/").replace("~0", "~")
            for part in pointer[1:].split("/")]


def read(value, pointer):
    for key in tokens(pointer):
        value = value[int(key)] if isinstance(value, list) else value[key]
    return value


def parent(value, pointer):
    parts = tokens(pointer)
    for key in parts[:-1]:
        value = value[int(key)] if isinstance(value, list) else value[key]
    key = int(parts[-1]) if isinstance(value, list) else parts[-1]
    return value, key


def check(revision):
    revision = subprocess.check_output(
        ["git", "rev-parse", "--verify", revision + "^{commit}"], text=True).strip()
    docs = [parse(git_bytes(revision, path)) for path in PATHS]
    literals = [parse(git_bytes(LITERAL, path)) for path in PATHS]
    old_files = []
    for path, node, current, literal in zip(PATHS, NODES, docs, literals):
        original_raw = git_bytes(BASE, path)
        original = parse(original_raw)
        restored = copy.deepcopy(current)
        del restored[node]
        for pointer in SCALARS:
            assert read(restored, pointer) == read(literal, pointer)
            target, key = parent(restored, pointer)
            target[key] = read(original, pointer)
        raw = (json.dumps(restored, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
        assert raw == original_raw, path
        old_files.append({"path": path, "inverse_raw_sha256": digest(raw)})
    assert compact(docs[0][NODES[0]]) == compact(literals[0][NODES[0]])
    node = docs[1][NODES[1]]
    metadata = {key: value for key, value in node.items()
                if key not in ("cases", "materialization_contract")}
    old_metadata = {key: value for key, value in literals[1][NODES[1]].items()
                    if key != "cases"}
    assert compact(metadata) == compact(old_metadata)
    contract = node["materialization_contract"]
    imported = contract["imports"]["l8"]
    source = read(docs[1], imported["fixed_source_pointer"])
    assert source == literals[1][NODES[1]]["fixed_source"]
    assert imported["mount_pointer"] == "/imports/l8"
    source_raw = git_bytes(source["revision"], source["path"])
    assert digest(source_raw) == source["raw_sha256"]
    source_doc = parse(source_raw)
    assert contract["output_pointers"] == {"input": "/input", "expected": "/expected"}
    assert len(node["cases"]) == len(literals[1][NODES[1]]["cases"]) == 3
    cases = []
    for case, frozen in zip(node["cases"], literals[1][NODES[1]]["cases"]):
        workspace = copy.deepcopy(case["materialization"]["workspace_seed"])
        assert "imports" not in workspace
        workspace["imports"] = {"l8": source_doc}
        for operation in case["materialization"]["standard_ops"]:
            target, key = parent(workspace, operation["path"])
            if operation["op"] == "copy":
                assert isinstance(target, dict)
                target[key] = copy.deepcopy(read(workspace, operation["from"]))
            else:
                assert operation["op"] == "remove"
                del target[key]
        rebuilt = copy.deepcopy(case)
        del rebuilt["materialization"]
        for output, pointer in contract["output_pointers"].items():
            value = read(workspace, pointer)
            assert compact(value) == compact(frozen[output]), case["case_id"]
            witness = {"canonical_sha256": digest(compact(value, True)),
                       "ordered_sha256": digest(compact(value)),
                       "ordered_compact_utf8_bytes": len(compact(value))}
            assert witness == case["witnesses"][output]
            rebuilt[output] = value
        assert rebuilt == frozen
        cases.append({"case_id": case["case_id"], "witnesses": case["witnesses"]})
    return {"base": BASE, "literal_revision": LITERAL, "design_revision": revision,
            "fixed_source_raw_sha256": digest(source_raw), "old_files": old_files,
            "cases": cases, "all64old_cases_preserved": True,
            "scope": "static recipe reconstruction and bounded preservation only"}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--design-revision", required=True)
    args = parser.parse_args()
    print(json.dumps(check(args.design_revision), ensure_ascii=False, indent=2))
